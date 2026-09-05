<script setup>
// Vue port of web/line_editor.js -- full-screen, per-line script editor.
// See that file's own top-of-file comment for the two-mode (per-line vs
// stitched-final) playback model this preserves exactly; Vue's reactivity
// replaces most of the original's manual DOM bookkeeping (rowEls/
// timingRowEls/timingPlayBtns/refreshRowByObject all become unnecessary --
// editing a row's own reactive fields re-renders just that row's template
// bindings on its own).
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";
import PickPanel from "./PickPanel.vue";
import { usePanelWidth } from "../shared/panel_width.js";
import {
    joinPath, stripSuffixAndExt, dirOf, markRoleStale,
    SCRIPT_EDITOR_API as FILE_API, SCRIPT_LIBRARY_API as SCAN_API, SPEAKER_PRESETS_API as PRESETS_API,
} from "../../web/fl_common.js";

const props = defineProps({
    folder: { type: String, required: true },
    filename: { type: String, required: true },
    suffix: { type: String, default: "_speakers.txt" },
    checkedApi: { type: Object, default: null }, // {isChecked(fname), setChecked(fname, val)}
    revoiceApi: { type: Object, default: null }, // {revoiceLine({lineId, speaker, instruct, text}) => Promise}
    onClose: { type: Function, required: true },
});

const SAVE_DEBOUNCE_MS = 600;
const POLL_MS = 3000;
const EDIT_QUIET_MS = 1500;
const DEFAULT_TEXT_FONT_SIZE = 11.5;
const MIN_TEXT_FONT_SIZE = 9;
const MAX_TEXT_FONT_SIZE = 22;
const LS_FONT_KEY = "FL_CosyVoice3.LineEditor.textFontSizePx";

function loadNum(key, fallback) {
    try {
        const v = parseFloat(localStorage.getItem(key));
        return Number.isFinite(v) ? v : fallback;
    } catch (e) {
        return fallback;
    }
}
function saveNum(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) { /* noop */ }
}

function parseLine(line) {
    const parts = line.split("|");
    if (parts.length !== 3) return null;
    return { speaker: parts[0].trim(), instruct: parts[1].trim(), text: parts[2].trim() };
}

let nextRowKey = 1;
function freshRow(fields) {
    return { ...fields, __key: nextRowKey++ };
}

function parseScript(content) {
    return content
        .split("\n")
        .map((raw) => raw.replace(/\r$/, ""))
        .filter((line) => line.trim())
        .map((line) => {
            const parsed = parseLine(line);
            return parsed
                ? freshRow({ ...parsed, raw: line, malformed: false })
                : freshRow({ raw: line, malformed: true });
        });
}

function serializeRows(rowsArr) {
    return rowsArr
        .map((r) => (r.malformed ? r.raw : `${r.speaker} | ${r.instruct} | ${r.text}`))
        .join("\n");
}

// Stable, cheap hash -> hue, so each distinct speaker gets a consistent
// accent color across the whole editor.
function speakerAccent(name) {
    if (!name) return "rgba(255,255,255,0.15)";
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return `hsl(${hash % 360}, 55%, 55%)`;
}

const confirm = useConfirm();
function confirmAsync({ title = "Confirm", message = "", okText = "OK", cancelText = "Cancel" } = {}) {
    return new Promise((resolve) => {
        confirm.require({
            header: title,
            message,
            acceptLabel: okText,
            rejectLabel: cancelText,
            accept: () => resolve(true),
            reject: () => resolve(false),
            onHide: () => resolve(false),
        });
    });
}

// ── state ────────────────────────────────────────────────────────────────
const visible = ref(true);
const filename = ref(props.filename);
const rows = ref([]);
const instructionEntries = ref([]);
const roleEntries = ref([]);
const rolesJsonPath = ref(null);
const presets = ref([]);
const readyScripts = ref([]);
const scriptList = ref([]);
const status = ref("");
const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.LineEditor.widthPx",
    defaultWidth: 1600,
    presets: [1280, 1600],
});
const textFontSizePx = ref(loadNum(LS_FONT_KEY, DEFAULT_TEXT_FONT_SIZE));
const rawTimingLines = ref(null);
const activeTimingIdx = ref(-1);
const audioIsPlaying = ref(false);
const mode1PlayingIdx = ref(-1);
const selectChecked = ref(props.checkedApi ? props.checkedApi.isChecked(props.filename) : false);
const audioState = reactive({ checking: true, best: null, mtime: null, error: null });
const roleInfoPopover = reactive({ visible: false, top: 0, left: 0, code: null });
const justAddedKey = ref(null);

const pendingRevoiceRows = reactive(new Set());

let nextLineId = 1;
let lastSavedText = null;
let lastSavedStatePayload = null;
let lastLocalEditAt = 0;
let lastAudioFingerprint = null;
let lastTimingMtime = null;
let saveTimer = null;
let pollTimer = null;
let audioPollTimer = null;
let timingPollTimer = null;
let closed = false;
let dragFromIndex = null;
let mode1AudioEl = null;

const audioElRef = ref(null); // mode 2's <audio> element
const rowsContainerEl = ref(null);
const rowEls = new Map(); // row.__key -> row root element (scroll/focus on add)
const textareaEls = new Map(); // row.__key -> the .fl-textarea DOM node
const pickPanelRef = ref(null);

const fullPath = computed(() => joinPath(props.folder, filename.value));
const audioFolder = computed(() => joinPath(props.folder, "_audio"));
const audioBaseName = computed(() => stripSuffixAndExt(filename.value, props.suffix));
const linesDirPath = computed(() => joinPath(joinPath(audioFolder.value, "lines"), audioBaseName.value));
const stateFilePath = computed(() => joinPath(linesDirPath.value, "_state.json"));
const isCurrentlyReady = computed(() => readyScripts.value.includes(filename.value));
const allRowsVoiced = computed(() => {
    const nm = rows.value.filter((r) => !r.malformed);
    return nm.length > 0 && nm.every((r) => r.status === "voiced");
});
function setStatus(text) {
    status.value = text;
}

// Resolves a role CODE (or a raw preset typed directly) to the real .pt
// file Speaker Instruct2 Dialog will load -- mirrors nodes/
// script_library.py's role_map_from_entries + resolve_roles.
function resolveSpeakerFile(code) {
    if (!code) return "";
    const entry = roleEntries.value.find((e) => e.code === code);
    const preset = entry && entry.speaker ? entry.speaker : code;
    const base = String(preset).split("#", 1)[0].trim();
    return base ? `${base}.pt` : "";
}

function speakerUsageIndex() {
    const usage = {};
    roleEntries.value.forEach((r) => {
        const preset = String(r.speaker || "").split("#", 1)[0].trim();
        if (!preset || !r.code) return;
        (usage[preset] = usage[preset] || []).push(r.code);
    });
    return usage;
}

// Persists roleEntries back to _roles.json -- reassigns a role's voice for
// the WHOLE project, not just this open script (see
// nodes/script_library.py's resolve_roles).
async function saveRolesJson() {
    if (!rolesJsonPath.value) {
        setStatus("No _roles.json found for this project -- can't save");
        return false;
    }
    try {
        const resp = await fetch(`${FILE_API}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: rolesJsonPath.value, content: JSON.stringify({ roles: roleEntries.value }, null, 2) }),
        });
        const data = await resp.json();
        if (data.error) {
            setStatus(`Error saving _roles.json: ${data.error}`);
            return false;
        }
        return true;
    } catch (e) {
        setStatus(`Error saving _roles.json: ${e}`);
        return false;
    }
}

// Recasting a role changes every line using that code, project-wide -- see
// nodes/script_library.py's mark_role_stale. If THIS open script was
// affected, reload right away instead of waiting for the next poll tick.
async function notifyRoleSpeakerChanged(roleCode) {
    if (!rolesJsonPath.value) return;
    const root = dirOf(rolesJsonPath.value);
    const result = await markRoleStale(root, roleCode, props.suffix);
    setStatus(result.message);
    if (result.changed.some((c) => c.file === filename.value) || result.untracked.some((c) => c.file === filename.value)) {
        await loadAndReconcileState();
        await loadCatalog();
        lastAudioFingerprint = null;
        lastTimingMtime = null;
        loadAudio();
        loadTiming();
    }
}

// MODE 2 ONLY: validates a fetched timing manifest against CURRENT rows.
// Requires only that the COUNT of real (non-malformed) rows still matches
// the manifest's line count -- valid by construction right after a Done
// stitch (mode 2 is only ever entered right after one).
function computeLineTiming(rawLines, rowsArr) {
    if (!Array.isArray(rawLines) || !rawLines.length) return null;
    const rowIndexMap = [];
    rowsArr.forEach((r, idx) => { if (!r.malformed) rowIndexMap.push(idx); });
    if (rowIndexMap.length !== rawLines.length) return null;
    return { lines: rawLines, rowIndexMap };
}

const lineTiming = computed(() => (isCurrentlyReady.value ? computeLineTiming(rawTimingLines.value, rows.value) : null));
const currentRowToTimingIdx = computed(() => {
    const map = new Map();
    if (lineTiming.value) lineTiming.value.rowIndexMap.forEach((rowIdx, timingIdx) => map.set(rowIdx, timingIdx));
    return map;
});
const timingWarningVisible = computed(() => Boolean(isCurrentlyReady.value && rawTimingLines.value && rawTimingLines.value.length && !lineTiming.value));

function currentStatePayload() {
    return JSON.stringify({
        next_id: nextLineId,
        lines: rows.value.filter((r) => !r.malformed).map((r) => ({ id: r.id, text: r.text, status: r.status })),
    }, null, 2);
}

// Assigns each CURRENT (non-malformed) row a stable `id` + voice `status`,
// reconciled against the last-saved _state.json -- see the original file's
// own long comment on this function for the fast-path/fallback rationale;
// unchanged here.
function reconcileState(rowsArr, saved) {
    const savedLines = (saved && Array.isArray(saved.lines)) ? saved.lines : [];
    let nextId = (saved && Number.isFinite(saved.next_id)) ? saved.next_id : 1;
    const nonMalformed = rowsArr.filter((r) => !r.malformed);

    if (savedLines.length === nonMalformed.length) {
        nonMalformed.forEach((row, i) => {
            const s = savedLines[i];
            row.id = Number.isFinite(s.id) ? s.id : nextId++;
            const textMatches = (s.text || "") === row.text;
            row.status = textMatches ? (s.status === "voiced" || s.status === "stale" ? s.status : "unvoiced")
                : (s.status === "voiced" || s.status === "stale" ? "stale" : "unvoiced");
        });
        return Math.max(nextId, ...nonMalformed.map((r) => r.id + 1), 1);
    }

    const pools = new Map();
    savedLines.forEach((s) => {
        const key = (s.text || "").trim();
        if (!pools.has(key)) pools.set(key, []);
        pools.get(key).push(s);
    });
    const consumed = new Map();
    nonMalformed.forEach((row) => {
        const key = (row.text || "").trim();
        const pool = pools.get(key);
        const used = consumed.get(key) || 0;
        if (pool && used < pool.length) {
            const s = pool[used];
            consumed.set(key, used + 1);
            row.id = Number.isFinite(s.id) ? s.id : nextId++;
            row.status = s.status === "voiced" ? "voiced" : "unvoiced";
        } else {
            row.id = nextId++;
            row.status = "unvoiced";
        }
    });
    return nextId;
}

async function loadAndReconcileState() {
    let saved = null;
    let rawContent = null;
    try {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(stateFilePath.value)}`);
        const data = await resp.json();
        if (data.exists) {
            rawContent = data.content;
            try { saved = JSON.parse(data.content); } catch (e) { saved = null; }
        }
    } catch (e) {
        saved = null;
    }
    nextLineId = reconcileState(rows.value, saved);
    lastSavedStatePayload = rawContent;
}

function markRowEdited(row) {
    if (row.status === "voiced") row.status = "stale";
}

// ── mode 1 sequential playback ──────────────────────────────────────────
function stopMode1Playback() {
    if (mode1AudioEl) {
        mode1AudioEl.pause();
        mode1AudioEl.src = "";
        mode1AudioEl = null;
    }
    mode1PlayingIdx.value = -1;
}

function playRowSequential(startIndex) {
    stopMode1Playback();
    const dir = linesDirPath.value;
    const playIdx = (idx) => {
        while (idx < rows.value.length && (rows.value[idx].malformed || rows.value[idx].status === "unvoiced")) idx++;
        if (idx >= rows.value.length) {
            mode1PlayingIdx.value = -1;
            return;
        }
        mode1PlayingIdx.value = idx;
        const row = rows.value[idx];
        const el = new Audio(`${SCAN_API}/audio?path=${encodeURIComponent(joinPath(dir, `id${row.id}.wav`))}&v=${Date.now()}`);
        mode1AudioEl = el;
        el.addEventListener("ended", () => playIdx(idx + 1));
        el.play().catch((e) => setStatus(`Playback failed: ${e}`));
    };
    playIdx(startIndex);
}

// Figures out which line audioEl.currentTime falls in (mode 2), moves the
// "now playing" highlight + auto-scroll there. Called on every timeupdate
// tick and whenever lineTiming is recomputed.
function syncActiveLine() {
    const el = audioElRef.value;
    if (!lineTiming.value || !el) {
        activeTimingIdx.value = -1;
        return;
    }
    const t = el.currentTime;
    let idx = -1;
    for (let i = 0; i < lineTiming.value.lines.length; i++) {
        if (t >= lineTiming.value.lines[i].start && t < lineTiming.value.lines[i].end) { idx = i; break; }
    }
    if (idx === activeTimingIdx.value) return;
    activeTimingIdx.value = idx;
    if (idx >= 0 && audioIsPlaying.value) {
        const rowIdx = lineTiming.value.rowIndexMap[idx];
        const rowEl = rowIdx !== undefined ? rowEls.get(rows.value[rowIdx]?.__key) : null;
        rowEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

// Fetches _audio\timing\<script base>.json (written by Audio Post-
// Process). silent=true (background poll) skips re-parsing when the
// file's mtime hasn't changed.
async function loadTiming({ silent = false } = {}) {
    const timingPath = joinPath(joinPath(audioFolder.value, "timing"), `${audioBaseName.value}.json`);
    try {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(timingPath)}`);
        const data = await resp.json();
        if (!data.exists) {
            rawTimingLines.value = null;
            lastTimingMtime = null;
            return;
        }
        if (silent && data.mtime === lastTimingMtime) return;
        const isFreshMtime = data.mtime !== lastTimingMtime;
        lastTimingMtime = data.mtime;
        let parsed;
        try { parsed = JSON.parse(data.content); } catch (e) { rawTimingLines.value = null; return; }
        rawTimingLines.value = Array.isArray(parsed.lines) ? parsed.lines : null;

        // A genuinely NEW manifest whose line count matches the current
        // script looks like a FULL render that just finished -- adopt its
        // per-line files into the stable-id scheme mode 1 relies on.
        const nonMalformed = rows.value.filter((r) => !r.malformed);
        if (isFreshMtime && rawTimingLines.value && rawTimingLines.value.length === nonMalformed.length && nonMalformed.length > 0) {
            await commitFullRenderIfNeeded(nonMalformed);
        }
        nextTick(syncActiveLine);
    } catch (e) {
        // Transient fetch error -- leave whatever timing state we already had.
    }
}

// Converts a just-finished full render's positional per-line files to
// id<N>.wav and marks every row "voiced", so mode 1's re-voice/play work
// immediately after a normal full-script queue run too.
async function commitFullRenderIfNeeded(nonMalformedRows) {
    try {
        const resp = await fetch(`${SCAN_API}/commit_full_render`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                folder: props.folder,
                base_name: audioBaseName.value,
                row_texts: nonMalformedRows.map((r) => r.text),
                row_ids: nonMalformedRows.map((r) => (Number.isFinite(r.id) ? r.id : null)),
            }),
        });
        const data = await resp.json();
        if (data.error || !Array.isArray(data.ids)) return;
        const committed = new Set(data.committed_ids || []);
        nonMalformedRows.forEach((r, i) => {
            r.id = data.ids[i];
            if (committed.has(data.ids[i])) r.status = "voiced";
        });
        if (Number.isFinite(data.next_id)) nextLineId = Math.max(nextLineId, data.next_id);
        if (committed.size) flushSave();
    } catch (e) {
        // Best-effort -- a transient failure just leaves these rows
        // "unvoiced" until the next full render or a per-line re-voice.
    }
}

function close() {
    if (closed) return;
    closed = true;
    if (saveTimer) { clearTimeout(saveTimer); flushSave(); }
    if (pollTimer) clearInterval(pollTimer);
    if (audioPollTimer) clearInterval(audioPollTimer);
    if (timingPollTimer) clearInterval(timingPollTimer);
    props.onClose();
}

watch(visible, (v) => { if (!v) close(); });

function scheduleSave() {
    lastLocalEditAt = Date.now();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
}

async function flushSave() {
    const text = serializeRows(rows.value);
    const statePayload = currentStatePayload();
    const textChanged = text !== lastSavedText;
    const stateChanged = statePayload !== lastSavedStatePayload;
    if (!textChanged && !stateChanged) return;
    try {
        if (textChanged) {
            const resp = await fetch(`${FILE_API}/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: fullPath.value, content: text }),
            });
            const data = await resp.json();
            if (data.error) { setStatus(`Save error: ${data.error}`); return; }
            lastSavedText = text;
        }
        if (stateChanged) {
            await fetch(`${FILE_API}/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: stateFilePath.value, content: statePayload }),
            });
            lastSavedStatePayload = statePayload;
        }
        setStatus(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (e) {
        setStatus(`Save failed: ${e}`);
    }
}

function autoGrow(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
}
function setTextareaRef(key, el) {
    if (!el) { textareaEls.delete(key); return; }
    textareaEls.set(key, el.$el ?? el);
}
function applyTextFontSize() {
    nextTick(() => textareaEls.forEach(autoGrow));
}

function setRowRef(key, el) {
    if (!el) { rowEls.delete(key); return; }
    rowEls.set(key, el);
}

async function focusNewRow(key) {
    justAddedKey.value = key;
    await nextTick();
    const el = rowEls.get(key);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    el?.querySelector(".fl-input")?.focus();
    setTimeout(() => { if (justAddedKey.value === key) justAddedKey.value = null; }, 500);
}

// Merges two non-malformed rows into the one at the LOWER index,
// regardless of which was dragged onto which. Confirms first if the two
// rows' speakers differ.
async function mergeRows(idxA, idxB) {
    const rowA = rows.value[idxA];
    const rowB = rows.value[idxB];
    if (!rowA || !rowB || rowA.malformed || rowB.malformed) return;

    const firstIdx = Math.min(idxA, idxB);
    const secondIdx = Math.max(idxA, idxB);
    const first = rows.value[firstIdx];
    const second = rows.value[secondIdx];

    if ((first.speaker || "").trim() !== (second.speaker || "").trim()) {
        const ok = await confirmAsync({
            title: "Merge lines with different speakers?",
            message: `"${first.speaker}" and "${second.speaker}" are different speakers. `
                + `Merge anyway? The combined line keeps "${first.speaker}".`,
            okText: "Merge",
            cancelText: "Cancel",
        });
        if (!ok) return;
    }

    first.text = `${first.text} ${second.text}`.trim();
    first.status = "unvoiced";
    rows.value.splice(secondIdx, 1);
    scheduleSave();
}

// Plain pointer-event drag (not native HTML5 drag-and-drop -- unreliable in
// practice). Tracks pointerdown -> pointermove -> pointerup and locates the
// element under the cursor via elementFromPoint.
function attachDragHandlers(handleEl, index) {
    if (!handleEl || handleEl.__flDragAttached) return;
    handleEl.__flDragAttached = true;
    handleEl.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const rowEl = handleEl.closest(".fl-line-row");
        dragFromIndex = Number(rowEl?.dataset.rowIndex);
        rowEl?.classList.add("fl-row-dragging");

        const onMove = (ev) => {
            rowsContainerEl.value?.querySelectorAll(".fl-row-drop-target").forEach((el) => el.classList.remove("fl-row-drop-target"));
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const targetRow = el && el.closest ? el.closest(".fl-line-row") : null;
            if (targetRow && targetRow !== rowEl) targetRow.classList.add("fl-row-drop-target");
        };
        const onUp = (ev) => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            document.removeEventListener("pointercancel", onUp);
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const targetRow = el && el.closest ? el.closest(".fl-line-row") : null;
            const fromIdx = dragFromIndex;
            dragFromIndex = null;
            rowEl?.classList.remove("fl-row-dragging");
            rowsContainerEl.value?.querySelectorAll(".fl-row-drop-target").forEach((c) => c.classList.remove("fl-row-drop-target"));
            if (targetRow && targetRow !== rowEl) {
                const toIdx = Number(targetRow.dataset.rowIndex);
                if (!Number.isNaN(toIdx)) mergeRows(fromIdx, toIdx);
            }
        };
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
    });
}

function deleteRow(index) {
    rows.value.splice(index, 1);
    scheduleSave();
}
async function confirmDeleteRow(index, previewText) {
    if (previewText && previewText.trim()) {
        const ok = await confirmAsync({
            title: "Delete this line?",
            message: previewText.length > 200 ? previewText.slice(0, 200) + "…" : previewText,
            okText: "Delete",
            cancelText: "Cancel",
        });
        if (!ok) return;
    }
    deleteRow(index);
}

function onSpeakerInput(row) {
    markRowEdited(row);
    scheduleSave();
}
function onInstructInput(row) {
    markRowEdited(row);
    scheduleSave();
}
function onTextInput(row, el) {
    autoGrow(el);
    markRowEdited(row);
    scheduleSave();
}
function onTextPaste(row, el, e) {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " ");
    const start = el.selectionStart, end = el.selectionEnd;
    el.value = el.value.slice(0, start) + pasted + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + pasted.length;
    row.text = el.value;
    onTextInput(row, el);
}

function speakerFileTitle(row) {
    const entry = roleEntries.value.find((e) => e.code === row.speaker);
    const file = resolveSpeakerFile(row.speaker);
    if (entry) return `Change "${entry.code}"'s speaker for the whole play (currently ${file || "unset"})`;
    if (file) return `"${row.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it`;
    return "No speaker set on this line yet";
}

function instructNoteFor(row) {
    const entry = instructionEntries.value.find((e) => (e.text || "").trim() === row.instruct.trim());
    return entry && entry.note ? entry.note : null;
}

function openRolePicker(event, row) {
    if (!roleEntries.value.length) {
        setStatus("No roles catalog found for this project (_roles.json)");
        return;
    }
    pickPanelRef.value.open(event, {
        items: roleEntries.value,
        getLabel: (e) => e.code || e.speaker || "",
        getSubLabel: (e) => [e.name, e.speaker, e.description].filter(Boolean).join(" -- "),
        onPick: (e) => {
            const value = e.code || e.speaker || "";
            row.speaker = value;
            markRowEdited(row);
            scheduleSave();
        },
    });
}

function openSpeakerRecastPicker(event, row) {
    const entry = roleEntries.value.find((e) => e.code === row.speaker);
    if (!entry) return;
    if (!presets.value.length) {
        setStatus("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
        return;
    }
    const usage = speakerUsageIndex();
    pickPanelRef.value.open(event, {
        items: presets.value,
        getLabel: (p) => p,
        getSubLabel: (p) => {
            const codes = usage[p] || [];
            return codes.length ? `used by: ${codes.join(", ")} -- ${codes.length} role(s)` : "not used by any role yet";
        },
        onPick: async (p) => {
            entry.speaker = p;
            const ok = await saveRolesJson();
            if (ok) {
                setStatus(`"${entry.code}" now uses "${p}" for the whole play`);
                await notifyRoleSpeakerChanged(entry.code);
            }
        },
    });
}

function openInstructPicker(event, row) {
    if (!instructionEntries.value.length) {
        setStatus("No instructions catalog found for this project (_instructions.json)");
        return;
    }
    pickPanelRef.value.open(event, {
        items: instructionEntries.value,
        getLabel: (e) => e.text,
        getSubLabel: (e) => e.note || "",
        onPick: (e) => {
            row.instruct = e.text;
            markRowEdited(row);
            scheduleSave();
        },
    });
}

function showRoleInfoPopover(anchorEl, code) {
    const rect = anchorEl.getBoundingClientRect();
    roleInfoPopover.left = Math.min(rect.left, window.innerWidth - 280);
    roleInfoPopover.top = rect.bottom + 4;
    roleInfoPopover.code = code;
    roleInfoPopover.visible = true;
}
function hideRoleInfoPopover() {
    roleInfoPopover.visible = false;
}
const roleInfoFields = computed(() => {
    const code = roleInfoPopover.code;
    if (!code) return { message: "No speaker set on this line yet" };
    const entry = roleEntries.value.find((e) => e.code === code);
    if (!entry) return { message: `"${code}" is not a role code in _roles.json -- used directly as a preset name` };
    const fields = Object.entries(entry).filter(([, v]) => v !== "" && v !== null && v !== undefined && v !== entry.__key);
    if (!fields.length) return { message: `"${code}" has no fields set in _roles.json` };
    return { fields };
});

function revoiceTitle(row) {
    if (pendingRevoiceRows.has(row)) return "Re-voicing...";
    if (row.status === "stale") return "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content";
    if (row.status === "voiced") return "Re-voice just this line (uses the currently open workflow)";
    return "Not voiced yet -- click to render just this line";
}
async function revoiceRow(row) {
    if (pendingRevoiceRows.has(row)) return;
    pendingRevoiceRows.add(row);
    setStatus("Re-voicing...");
    try {
        await props.revoiceApi.revoiceLine({ lineId: row.id, speaker: row.speaker, instruct: row.instruct, text: row.text });
        row.status = "voiced";
        setStatus("Line re-voiced");
    } catch (e) {
        setStatus(`Re-voice failed: ${e.message || e}`);
    } finally {
        pendingRevoiceRows.delete(row);
        flushSave();
    }
}

function isRowPlaying(index) {
    return (isCurrentlyReady.value
        ? activeTimingIdx.value === currentRowToTimingIdx.value.get(index)
        : mode1PlayingIdx.value === index) && audioIsPlaying.value;
}

function onPlayClick(row, index) {
    const ready = isCurrentlyReady.value;
    if (ready) {
        const timingIdx = currentRowToTimingIdx.value.get(index);
        const el = audioElRef.value;
        if (timingIdx === undefined || !el || !lineTiming.value) return;
        el.currentTime = lineTiming.value.lines[timingIdx].start;
        el.play();
    } else if (mode1PlayingIdx.value === index) {
        stopMode1Playback();
    } else {
        playRowSequential(index);
    }
}

// ── mini audio player (mode 2 + "has this script been rendered at all")
async function loadAudio({ silent = false } = {}) {
    if (!silent) audioState.checking = true;
    try {
        const resp = await fetch(`/fl_cosyvoice3/browse/list_dir?path=${encodeURIComponent(audioFolder.value)}`);
        const data = await resp.json();
        const files = Array.isArray(data.files) ? data.files : [];
        const mtimes = data.file_mtimes || {};
        const needle = audioBaseName.value.toLowerCase();
        const matches = files.filter((f) => {
            const dot = f.lastIndexOf(".");
            const base = dot > 0 ? f.slice(0, dot) : f;
            return base.toLowerCase().startsWith(needle);
        });
        matches.sort();
        const best = matches.length ? matches[matches.length - 1] : null;
        const fingerprint = best ? `${best}::${mtimes[best] || ""}` : null;

        if (silent && fingerprint === lastAudioFingerprint) return;
        lastAudioFingerprint = fingerprint;

        audioState.checking = false;
        audioState.error = null;
        audioState.best = best;
        audioState.mtime = best ? (mtimes[best] || Date.now()) : null;
        if (!best) { audioIsPlaying.value = false; nextTick(syncActiveLine); }
    } catch (e) {
        audioState.checking = false;
        audioState.error = String(e);
    }
}

const deleteAudioDisabled = computed(() => !audioState.best || isCurrentlyReady.value);

async function deleteAudio() {
    if (!audioState.best || isCurrentlyReady.value) return;
    const ok = await confirmAsync({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${audioBaseName.value}" (currently: ${audioState.best}).`,
        okText: "Delete",
        cancelText: "Cancel",
    });
    if (!ok) return;
    try {
        const resp = await fetch(`${SCAN_API}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: props.folder, base_name: audioBaseName.value, filename: filename.value }),
        });
        const data = await resp.json();
        if (data.error) { setStatus(`Error: ${data.error}`); return; }
        setStatus(`Deleted ${data.deleted.length} audio file(s)`);
        lastAudioFingerprint = null;
        loadAudio();
    } catch (e) {
        setStatus(`Error: ${e}`);
    }
}

// ── header: select-for-queueing checkbox + Done ─────────────────────────
function onSelectCheckboxChange(checked) {
    props.checkedApi?.setChecked(filename.value, checked);
}
const doneDisabled = computed(() => !isCurrentlyReady.value && !allRowsVoiced.value);
const doneTitle = computed(() => (
    isCurrentlyReady.value ? "Marked ready to release -- click to unmark and go back to editing"
        : allRowsVoiced.value ? "Stitch every line into the final file and mark this script done / ready to release"
        : "Every line needs to be voiced first"
));
async function toggleDone() {
    const newReady = !isCurrentlyReady.value;
    if (newReady && !allRowsVoiced.value) {
        setStatus("Every line needs to be voiced before marking done");
        return;
    }
    if (newReady) {
        setStatus("Stitching final file...");
        const nonMalformed = rows.value.filter((r) => !r.malformed);
        try {
            const stitchResp = await fetch(`${SCAN_API}/stitch_lines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folder: props.folder, base_name: audioBaseName.value,
                    line_ids: nonMalformed.map((r) => r.id), line_texts: nonMalformed.map((r) => r.text),
                }),
            });
            const stitchData = await stitchResp.json();
            if (stitchData.error) { setStatus(`Stitch error: ${stitchData.error}`); return; }
        } catch (e) {
            setStatus(`Stitch failed: ${e}`);
            return;
        }
    }
    try {
        const resp = await fetch(`${SCAN_API}/set_ready`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: props.folder, filename: filename.value, ready: newReady }),
        });
        const data = await resp.json();
        if (data.error) { setStatus(`Error: ${data.error}`); return; }
        readyScripts.value = data.ready_scripts || [];
        if (newReady) {
            props.checkedApi?.setChecked(filename.value, false);
            selectChecked.value = false;
        }
        setStatus(newReady ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again");
        if (newReady) {
            lastAudioFingerprint = null;
            lastTimingMtime = null;
            loadAudio();
            loadTiming();
        }
    } catch (e) {
        setStatus(`Error: ${e}`);
    }
}

// ── actions row: stress mark / split / add line / prev/next ────────────
// Uses mousedown+preventDefault (not click): a plain click on a <button>
// steals focus from the textarea in Chromium before any click handler
// runs, which would leave document.activeElement pointing at the button.
function insertStressMark() {
    const el = document.activeElement;
    if (!el || (el.tagName !== "TEXTAREA" && el.tagName !== "INPUT")) {
        setStatus("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
    }
    const pos = el.selectionStart;
    el.value = el.value.slice(0, pos) + "́" + el.value.slice(pos);
    el.selectionStart = el.selectionEnd = pos + 1;
    el.dispatchEvent(new Event("input", { bubbles: true }));
}

function splitFocusedLine() {
    const el = document.activeElement;
    if (!el || el.tagName !== "TEXTAREA" || !el.classList.contains("fl-textarea")) {
        setStatus("Click into a line's text first, place the cursor where it should split");
        return;
    }
    const rowEl = el.closest(".fl-line-row");
    const index = rowEl ? Number(rowEl.dataset.rowIndex) : -1;
    const row = index >= 0 ? rows.value[index] : null;
    if (!row || row.malformed) {
        setStatus("Can't split a malformed/raw line -- fix it to plain text first");
        return;
    }
    const pos = el.selectionStart;
    const before = row.text.slice(0, pos).trimEnd();
    const after = row.text.slice(pos).trimStart();
    row.text = before;
    row.status = "unvoiced";
    const newRow = freshRow({ speaker: row.speaker, instruct: row.instruct, text: after, raw: "", malformed: false, id: nextLineId++, status: "unvoiced" });
    rows.value.splice(index + 1, 0, newRow);
    focusNewRow(newRow.__key);
    scheduleSave();
}

function addLine() {
    const newRow = freshRow({ speaker: "", instruct: "", text: "", raw: "", malformed: false, id: nextLineId++, status: "unvoiced" });
    rows.value.push(newRow);
    focusNewRow(newRow.__key);
    scheduleSave();
}

const navIdx = computed(() => scriptList.value.indexOf(filename.value));
const prevDisabled = computed(() => !(navIdx.value > 0));
const nextDisabled = computed(() => !(navIdx.value >= 0 && navIdx.value < scriptList.value.length - 1));
function goPrev() { if (navIdx.value > 0) switchToFile(scriptList.value[navIdx.value - 1]); }
function goNext() { if (navIdx.value >= 0 && navIdx.value < scriptList.value.length - 1) switchToFile(scriptList.value[navIdx.value + 1]); }

async function loadPresets() {
    try {
        const resp = await fetch(PRESETS_API);
        const data = await resp.json();
        presets.value = data.presets || [];
    } catch (e) {
        presets.value = [];
    }
}

async function loadCatalog() {
    try {
        const url = `${SCAN_API}/scan?path=${encodeURIComponent(props.folder)}&act=&suffix=${encodeURIComponent(props.suffix)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        instructionEntries.value = data.instructions?.entries || [];
        roleEntries.value = data.roles?.entries || [];
        rolesJsonPath.value = data.roles?.path || null;
        scriptList.value = Array.isArray(data.scripts) ? data.scripts : [];
        readyScripts.value = Array.isArray(data.ready_scripts) ? data.ready_scripts : [];
    } catch (e) {
        instructionEntries.value = [];
        roleEntries.value = [];
        rolesJsonPath.value = null;
        scriptList.value = [];
        readyScripts.value = [];
    }
}

// Switches this same editor instance to a different script in the same
// act (Prev/Next), without closing/reopening the panel.
async function switchToFile(newFilename) {
    if (!newFilename || newFilename === filename.value || closed) return;
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; await flushSave(); }
    filename.value = newFilename;
    lastAudioFingerprint = null;
    rawTimingLines.value = null;
    lastTimingMtime = null;
    rows.value = [];
    lastSavedText = null;
    lastLocalEditAt = 0;
    selectChecked.value = props.checkedApi ? props.checkedApi.isChecked(newFilename) : false;
    setStatus("Loading...");
    await loadFromDisk();
    loadAudio();
    loadTiming();
}

async function loadFromDisk({ isPoll = false } = {}) {
    try {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(fullPath.value)}`);
        const data = await resp.json();
        if (data.error) { setStatus(`Read error: ${data.error}`); return; }
        if (!data.exists) {
            if (!isPoll) {
                rows.value = [];
                lastSavedText = "";
                lastSavedStatePayload = null;
                setStatus("File does not exist yet (will be created on first edit)");
            }
            return;
        }
        if (isPoll && Date.now() - lastLocalEditAt < EDIT_QUIET_MS) return;
        if (data.content === lastSavedText) return;
        rows.value = parseScript(data.content);
        lastSavedText = data.content;
        await loadAndReconcileState();
        if (!isPoll) setStatus(`Loaded ${rows.value.length} line(s)`);
    } catch (e) {
        setStatus(`Read failed: ${e}`);
    }
}

watch(lineTiming, () => nextTick(syncActiveLine));
watch(textFontSizePx, applyTextFontSize);

onMounted(() => {
    loadCatalog();
    loadPresets();
    loadAudio();
    audioPollTimer = setInterval(() => loadAudio({ silent: true }), POLL_MS);
    // loadTiming() must not run before `rows` is populated -- see
    // commitFullRenderIfNeeded: an empty `rows` would both wrongly skip it
    // AND mark this mtime "already seen", losing the one chance to adopt a
    // full render that finished before this editor was even opened.
    loadFromDisk().then(() => {
        pollTimer = setInterval(() => loadFromDisk({ isPoll: true }), POLL_MS);
        loadTiming();
        timingPollTimer = setInterval(() => loadTiming({ silent: true }), POLL_MS);
    });
});
onBeforeUnmount(() => {
    stopMode1Playback();
    if (pollTimer) clearInterval(pollTimer);
    if (audioPollTimer) clearInterval(audioPollTimer);
    if (timingPollTimer) clearInterval(timingPollTimer);
});
</script>

<template>
    <Dialog
        v-model:visible="visible"
        :modal="false"
        :draggable="false"
        close-on-escape
        header=" "
        :style="{ width: panelWidthCss }"
        class="line-editor-dialog"
    >
        <template #header>
            <div class="header-row">
                <input
                    type="checkbox"
                    class="row-checkbox"
                    :checked="selectChecked"
                    :disabled="!checkedApi || isCurrentlyReady"
                    title="Mark this script as checked for queueing (Script Library's tree)"
                    @change="selectChecked = $event.target.checked; onSelectCheckboxChange($event.target.checked)"
                />
                <Button
                    :label="isCurrentlyReady ? 'Done ✓' : 'Done'"
                    size="small"
                    :outlined="!isCurrentlyReady"
                    :disabled="doneDisabled"
                    :title="doneTitle"
                    @click="toggleDone"
                />
                <div class="title-el">{{ filename }}</div>
                <div class="status-el">{{ status }}</div>
                <div class="width-row">
                    <Button
                        v-for="px in widthPresets"
                        :key="px"
                        :label="String(px)"
                        text size="small"
                        :title="`Set editor width to ${px}px (capped to the window's width)`"
                        @click="setPanelWidth(px)"
                    />
                    <Button label="100%" text size="small" title="Use the full available window width" @click="setPanelWidth('full')" />
                </div>
                <div class="font-row">
                    <Button label="A−" text size="small" title="Decrease line text font size" @click="textFontSizePx = Math.max(MIN_TEXT_FONT_SIZE, textFontSizePx - 1); saveNum(LS_FONT_KEY, textFontSizePx)" />
                    <Button label="A+" text size="small" title="Increase line text font size" @click="textFontSizePx = Math.min(MAX_TEXT_FONT_SIZE, textFontSizePx + 1); saveNum(LS_FONT_KEY, textFontSizePx)" />
                </div>
            </div>
        </template>

        <div class="audio-row">
            <div class="audio-content-row">
                <template v-if="audioState.checking">
                    <div class="muted-note">Checking for audio...</div>
                </template>
                <template v-else-if="audioState.error">
                    <div class="muted-note">Audio check failed: {{ audioState.error }}</div>
                </template>
                <template v-else-if="audioState.best">
                    <div class="audio-label">{{ audioState.best }}</div>
                    <audio
                        ref="audioElRef"
                        controls
                        class="audio-el"
                        :src="`${SCAN_API}/audio?path=${encodeURIComponent(joinPath(audioFolder, audioState.best))}&v=${encodeURIComponent(audioState.mtime || '')}`"
                        @timeupdate="syncActiveLine"
                        @play="audioIsPlaying = true"
                        @pause="audioIsPlaying = false"
                        @ended="audioIsPlaying = false"
                    />
                    <Button
                        label="🗑 Delete audio" text size="small"
                        :disabled="deleteAudioDisabled"
                        :title="isCurrentlyReady ? 'Marked ready to release -- unmark it (Done) before deleting audio' : 'Delete the rendered audio for this script'"
                        @click="deleteAudio"
                    />
                </template>
                <template v-else>
                    <div class="muted-note">No audio yet in {{ audioFolder }}</div>
                </template>
                <Button icon="pi pi-refresh" text size="small" title="Re-check _audio\ for this script's rendered audio" @click="loadAudio()" />
            </div>
            <div v-if="timingWarningVisible" class="timing-warning">⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер</div>
        </div>

        <div class="actions-row">
            <Button label="´ Stress mark" text size="small" title="Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this" @mousedown.prevent="insertStressMark" />
            <Button label="✂ Split line" text size="small" title="Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this" @mousedown.prevent="splitFocusedLine" />
            <Button label="+ Add line" text size="small" title="Add a new empty line at the end of the script" @click="addLine" />
            <div class="actions-divider" />
            <Button label="◀ Prev" text size="small" :disabled="prevDisabled" title="Open the previous script in this act" @click="goPrev" />
            <Button label="Next ▶" text size="small" :disabled="nextDisabled" title="Open the next script in this act" @click="goNext" />
        </div>

        <div ref="rowsContainerEl" class="rows-container">
            <div
                v-for="(row, index) in rows"
                :key="row.__key"
                class="fl-line-row"
                :class="{ 'row-enter': justAddedKey === row.__key, 'row-playing': (isCurrentlyReady ? currentRowToTimingIdx.get(index) === activeTimingIdx : mode1PlayingIdx === index) }"
                :data-row-index="index"
                :ref="(el) => setRowRef(row.__key, el)"
                :style="row.malformed ? {} : { borderLeftColor: speakerAccent(row.speaker) }"
            >
                <template v-if="row.malformed">
                    <div class="malformed-warn-line">
                        <div class="malformed-warn">⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:</div>
                        <Button icon="pi pi-trash" text size="small" title="Delete this line" @click="confirmDeleteRow(index, row.raw)" />
                    </div>
                    <textarea
                        class="fl-textarea malformed-textarea"
                        :style="{ fontSize: `${textFontSizePx}px` }"
                        :value="row.raw"
                        rows="1"
                        :ref="(el) => { setTextareaRef(row.__key, el); nextTick(() => autoGrow(el)); }"
                        @input="row.raw = $event.target.value; autoGrow($event.target); scheduleSave()"
                        @keydown.enter.prevent
                    />
                </template>
                <template v-else>
                    <div class="top-line">
                        <span class="drag-handle" title="Drag onto another line to merge them" :ref="(el) => attachDragHandlers(el, index)">⠿</span>

                        <span
                            v-if="isCurrentlyReady ? currentRowToTimingIdx.get(index) !== undefined : row.status !== 'unvoiced'"
                            class="play-btn"
                            :class="{ 'is-playing': isRowPlaying(index) }"
                            :title="isCurrentlyReady ? 'Play from this line' : 'Play this line (and every voiced line after it)'"
                            @click="onPlayClick(row, index)"
                        >{{ isRowPlaying(index) ? "⏸" : "▶" }}</span>

                        <span
                            v-if="revoiceApi && !isCurrentlyReady"
                            class="revoice-btn"
                            :class="{ pending: pendingRevoiceRows.has(row), stale: !pendingRevoiceRows.has(row) && row.status === 'stale' }"
                            :title="revoiceTitle(row)"
                            @click="revoiceRow(row)"
                        >{{ pendingRevoiceRows.has(row) ? "⏳" : "🔁" }}</span>

                        <Button icon="pi pi-user" text size="small" class="icon-btn" title="Pick from _roles.json" @click="openRolePicker($event, row)" />

                        <InputText
                            class="speaker-input"
                            :model-value="row.speaker"
                            title="Speaker (preset or preset#tag)"
                            @update:model-value="row.speaker = $event; onSpeakerInput(row)"
                        />

                        <Button
                            class="speaker-file-btn"
                            text size="small"
                            :label="resolveSpeakerFile(row.speaker) || '(no speaker)'"
                            :disabled="!roleEntries.find((e) => e.code === row.speaker)"
                            :title="speakerFileTitle(row)"
                            @click="openSpeakerRecastPicker($event, row)"
                        />

                        <span class="role-info-btn" @mouseenter="showRoleInfoPopover($event.target, row.speaker)" @mouseleave="hideRoleInfoPopover">ℹ</span>

                        <div class="spacer" />
                        <Button icon="pi pi-trash" text size="small" title="Delete this line" @click="confirmDeleteRow(index, row.text)" />
                    </div>

                    <div class="instruct-line">
                        <Button icon="pi pi-list" text size="small" class="icon-btn" title="Pick from the instructions catalog (_instructions.json)" @click="openInstructPicker($event, row)" />
                        <InputText
                            class="instruct-input"
                            :model-value="row.instruct"
                            title="Instruct text"
                            @update:model-value="row.instruct = $event; onInstructInput(row)"
                        />
                    </div>
                    <div v-if="instructNoteFor(row)" class="instruct-desc">↳ {{ instructNoteFor(row) }}</div>

                    <textarea
                        class="fl-textarea"
                        :style="{ fontSize: `${textFontSizePx}px` }"
                        :value="row.text"
                        rows="1"
                        :ref="(el) => { setTextareaRef(row.__key, el); nextTick(() => autoGrow(el)); }"
                        @input="row.text = $event.target.value; onTextInput(row, $event.target)"
                        @keydown.enter.prevent
                        @paste="onTextPaste(row, $event.target, $event)"
                    />
                </template>
            </div>
        </div>
    </Dialog>

    <PickPanel ref="pickPanelRef" />
    <ConfirmDialog />

    <div v-if="roleInfoPopover.visible" class="role-info-popover" :style="{ left: `${roleInfoPopover.left}px`, top: `${roleInfoPopover.top}px` }">
        <div v-if="roleInfoFields.message">{{ roleInfoFields.message }}</div>
        <div v-for="([k, v]) in roleInfoFields.fields" :key="k" class="role-info-row">
            <span class="role-info-key">{{ k }}</span>
            <span class="role-info-value">{{ v }}</span>
        </div>
    </div>
</template>

<style scoped>
.line-editor-dialog {
    height: 92vh;
}
.line-editor-dialog :deep(.p-dialog-header) {
    padding: 8px 12px;
}
.line-editor-dialog :deep(.p-dialog-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
}
.header-row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
}
.title-el {
    font-weight: 600;
    font-size: 14px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.status-el {
    flex: 0 0 auto;
    font-size: 11px;
    opacity: 0.75;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.width-row, .font-row {
    display: flex;
    gap: 3px;
    flex: 0 0 auto;
}
.font-row {
    margin-left: 10px;
}
.row-checkbox {
    flex: 0 0 auto;
    cursor: pointer;
}
.audio-row {
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.audio-content-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    flex: 0 0 auto;
}
.muted-note {
    flex: 1;
    font-size: 11px;
    opacity: 0.7;
}
.audio-label {
    flex: 0 0 auto;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    opacity: 0.85;
}
.audio-el {
    flex: 1;
    height: 32px;
}
.timing-warning {
    color: #e0a030;
    width: 100%;
    font-size: 11px;
    padding: 2px 16px 6px;
}
.actions-row {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 6px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex: 0 0 auto;
}
.actions-divider {
    width: 1px;
    align-self: stretch;
    background: rgba(255, 255, 255, 0.12);
    margin: 0 4px;
    flex: 0 0 auto;
}
.rows-container {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.fl-line-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px 6px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.02);
    border-left: 3px solid transparent;
}
.fl-line-row.row-playing {
    background: rgba(90, 140, 255, 0.1);
}
.fl-line-row :global(.fl-row-dragging) {
    opacity: 0.5;
}
.fl-line-row :global(.fl-row-drop-target) {
    outline: 2px dashed rgba(90, 140, 255, 0.6);
}
.fl-line-row.row-enter {
    animation: fl-row-enter 0.35s ease;
}
@keyframes fl-row-enter {
    from { transform: scaleY(0.85); opacity: 0; }
    to { transform: scaleY(1); opacity: 1; }
}
.malformed-warn-line {
    display: flex;
    align-items: center;
    gap: 6px;
}
.malformed-warn {
    font-size: 10px;
    color: #e0a030;
    flex: 1;
}
.malformed-textarea {
    border-color: rgba(224, 160, 48, 0.5);
}
.top-line {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
}
.drag-handle {
    cursor: grab;
    opacity: 0.6;
    flex: 0 0 auto;
    touch-action: none;
}
.play-btn {
    cursor: pointer;
    flex: 0 0 auto;
    font-size: 13px;
    color: #4caf50;
}
.play-btn.is-playing {
    color: #e0b030;
}
.revoice-btn {
    cursor: pointer;
    flex: 0 0 auto;
    font-size: 13px;
}
.revoice-btn.stale {
    color: #e0a030;
}
.revoice-btn.pending {
    cursor: default;
    opacity: 0.7;
}
.icon-btn {
    flex: 0 0 auto;
}
.speaker-input {
    width: 108px;
    flex: 0 0 auto;
}
.speaker-file-btn {
    flex: 0 0 auto;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.role-info-btn {
    flex: 0 0 auto;
    cursor: help;
    opacity: 0.7;
}
.spacer {
    flex: 1 1 auto;
}
.instruct-line {
    display: flex;
    gap: 4px;
    align-items: center;
}
.instruct-input {
    flex: 1 1 auto;
}
.instruct-desc {
    font-size: 11px;
    opacity: 0.7;
    padding-left: 22px;
}
.fl-textarea {
    width: 100%;
    box-sizing: border-box;
    resize: none;
    overflow: hidden;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: inherit;
    font-family: inherit;
    padding: 6px 8px;
}
</style>

<style>
/* Unscoped -- Teleported/global elements this component controls the
   visibility of but that don't live under its own scoped root. */
.role-info-popover {
    position: fixed;
    z-index: 100000;
    width: 260px;
    padding: 8px 10px;
    background: rgba(30, 30, 34, 0.97);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    font-size: 11px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.role-info-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 2px 0;
}
.role-info-key {
    opacity: 0.6;
}
</style>
