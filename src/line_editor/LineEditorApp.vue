<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import DialogHeader from "../shared/DialogHeader.vue";
import StickyPanel from "../shared/StickyPanel.vue";
import InstructPickerDialog from "../shared/InstructPickerDialog.vue";
import SpeakerPickerDialog from "./SpeakerPickerDialog.vue";
import LineRowEditor from "../shared/LineRowEditor.vue";
import { speakerAccent } from "../shared/speaker_accent.js";
import { insertStressMark as sharedInsertStressMark } from "../shared/stress_mark.js";
import { saveInstructPhrase } from "../shared/instruct_library.js";
import { useRoleInfoPopover } from "../shared/role_info_popover.js";
import RoleInfoPopover from "../shared/RoleInfoPopover.vue";
import { useTextareaAutoGrow } from "../shared/textarea_autogrow.js";
import { lineHash, makeLineFilename, hasExpectedFile, mostRecentAtPosition } from "../shared/line_hash.js";
import {
    joinPath, stripSuffixAndExt, dirOf, markRoleStale, parsePauseField, DEFAULT_LINE_GAP_S,
    SCRIPT_EDITOR_API as FILE_API, SCRIPT_LIBRARY_API as SCAN_API, SPEAKER_PRESETS_API as PRESETS_API,
    BROWSE_API,
} from "../../web/fl_common.js";

const props = defineProps({
    folder: { type: String, required: true },
    filename: { type: String, required: true },
    suffix: { type: String, default: "" },
    checkedApi: { type: Object, default: null }, // {isChecked(fname), setChecked(fname, val)}
    revoiceApi: { type: Object, default: null }, // {revoiceLine({linePosition, speaker, instruct, text}) => Promise}
    onClose: { type: Function, required: true },
});

const SAVE_DEBOUNCE_MS = 600;
const POLL_MS = 3000;
const EDIT_QUIET_MS = 1500;

/*
 A 4th field is this addon's optional per-line pause (see
 nodes/script_library.py's split_script_line). Kept as the author's own
 RAW text, not a parsed number: an in-progress "1." or a typo'd "1,,2"
 has to survive a keystroke and a save round-trip without being silently
 rewritten under the cursor. It's parsed (parsePauseField) only where a
 number is actually needed -- sending the stitch its plan.
*/
function parseLine(line) {
    const parts = line.split("|");
    if (parts.length !== 3 && parts.length !== 4) return null;
    return {
        speaker: parts[0].trim(),
        instruct: parts[1].trim(),
        text: parts[2].trim(),
        pause: parts.length === 4 ? parts[3].trim() : "",
    };
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

/*
 The 4th field is written only when the line actually asks for a pause --
 a script with no pauses stays byte-identical to what it was before this
 field existed, and "no pause named" never gets frozen into an explicit
 number the author didn't choose.
*/
function serializeRows(rowsArr) {
    return rowsArr
        .map((r) => {
            if (r.malformed) return r.raw;
            const base = `${r.speaker} | ${r.instruct} | ${r.text}`;
            return r.pause ? `${base} | ${r.pause}` : base;
        })
        .join("\n");
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
const instructCategories = ref([]); // [{name, title, when, examples}, ...] from _instruct_categories.json
const instructCategoriesPath = ref(null); // its resolved on-disk path -- null if none exists yet for this project
const roleEntries = ref([]);
const rolesJsonPath = ref(null);
const { popover: roleInfoPopover, show: showRoleInfoPopover, hide: hideRoleInfoPopover, info: roleInfoFields } = useRoleInfoPopover(
    roleEntries,
    (entry) => Object.entries(entry).filter(([, v]) => v !== "" && v !== null && v !== undefined && v !== entry.__key),
);
const presets = ref([]);
const speakerSampleDir = ref(""); // folder holding each preset's own .pt (and, hopefully, a same-named sample .mp3/.wav) -- see loadPresets
const readyScripts = ref([]);
const scriptList = ref([]);
const status = ref("");
const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.LineEditor.widthPx",
    defaultWidth: 1600,
    presets: [1280, 1600],
});
const { fontSizePx: textFontSizePx, decrease: decreaseTextFontSize, increase: increaseTextFontSize } = useFontSize({
    storageKey: "FL_CosyVoice3.LineEditor.textFontSizePx",
    defaultSize: 11.5,
});
const rawTimingLines = ref(null);
const activeTimingIdx = ref(-1);
const audioIsPlaying = ref(false);
const mode1PlayingIdx = ref(-1);
const selectChecked = ref(props.checkedApi ? props.checkedApi.isChecked(props.filename) : false);
const audioState = reactive({ checking: true, best: null, mtime: null, error: null });
const justAddedKey = ref(null);

const pendingRevoiceRows = reactive(new Set());

let lastSavedText = null;
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
const { autoGrow, setTextareaRef, regrowAll } = useTextareaAutoGrow();

const fullPath = computed(() => joinPath(props.folder, filename.value));
const audioFolder = computed(() => joinPath(props.folder, "_audio"));
const audioBaseName = computed(() => stripSuffixAndExt(filename.value, props.suffix));
const linesDirPath = computed(() => joinPath(joinPath(audioFolder.value, "lines"), audioBaseName.value));

/*
 Ground truth for "does this row have audio to play" -- an actual listing
 of _audio\lines\<script>\, no separate state file. See src/shared/
 line_hash.js / nodes/_line_audio.py: each file's name is
 "<position>_<hash>.wav" -- position addresses a row purely by its
 CURRENT rank among non-malformed rows (kept in sync on every structural
 edit by reorganizeLines below), and hash is compared against this row's
 OWN currently-typed content to decide "voiced" vs "needs re-voice" --
 nothing is ever stored, so it can't fall out of sync with what's
 actually here. fileMtimes (from the same listing call) is only used for
 the mode-1 "nothing fresh, but play the last take anyway" fallback.
*/
const lineFilesOnDisk = ref(new Set());
const lineFileMtimes = ref({});
async function loadLineFiles() {
    try {
        const resp = await fetch(`${BROWSE_API}?path=${encodeURIComponent(linesDirPath.value)}`);
        const data = await resp.json();
        lineFilesOnDisk.value = new Set(Array.isArray(data.files) ? data.files : []);
        lineFileMtimes.value = data.file_mtimes || {};
    } catch (e) {
        // Transient fetch error -- leave whatever we already had.
    }
}

/*
 This row's rank among non-malformed rows -- the addressing scheme every
 per-line file is named by (see lineFilesOnDisk's own comment). Malformed
 rows never get one (never synthesized, never have audio).
*/
const positionByIndex = computed(() => {
    const map = new Map();
    let pos = 0;
    rows.value.forEach((r, i) => {
        if (!r.malformed) { map.set(i, pos); pos++; }
    });
    return map;
});
/*
 The most-recently-modified file at this row's position, REGARDLESS of
 whether it matches current content -- mode 1's "play whatever's there"
 fallback (see rowIsFresh below for the strict, hash-matching check
 instead). null if this position has no file at all.
*/
function latestFileFor(index) {
    const pos = positionByIndex.value.get(index);
    return pos === undefined ? null : mostRecentAtPosition(lineFilesOnDisk.value, lineFileMtimes.value, pos);
}

/*
 Resolves a role CODE to its _roles.json "speaker" field EXACTLY as
 nodes/script_library.py's role_map_from_entries/resolve_roles do (raw,
 no "#tag" stripped, no ".pt" appended) -- the value that actually gets
 hashed server-side into a rendered file's name. Falls back to `code`
 unchanged when it isn't a known role code, same as Python's
 role_map.get(preset, preset). Deliberately separate from
 resolveSpeakerFile below, which normalizes for DISPLAY/file-lookup
 purposes instead.
*/
function resolvedSpeakerForHash(code) {
    const entry = roleEntries.value.find((e) => e.code === code);
    return (entry && entry.speaker) ? entry.speaker : (code || "");
}

/*
 row.__key -> content hash (see src/shared/line_hash.js). Compared
 against latestFileFor(index)'s own hash, this Map IS the entire "is this
 line voiced for what it currently says" check -- nothing is ever
 persisted.

 Deliberately NOT a deep watch(rows) any more -- deep-watching the whole
 array means typing a single character anywhere re-triggers the callback
 for the WHOLE array, re-hashing (an async Web Crypto call) every OTHER
 line in the script on every keystroke, not just the one being edited.
 Kept updated by two explicit paths instead: updateRowHash for a single
 row's own field edits (the common, per-keystroke case), and
 recomputeAllHashes for the rarer cases where positions shift or a role's
 resolved speaker changes for every row using it at once (called from
 loadFromDisk, addLine/deleteRow/mergeRows/splitFocusedLine, and
 onSpeakerFileRecast -- see each call site).
*/
const expectedHash = reactive(new Map());
const rowHashDebounce = new Map(); // row.__key -> setTimeout id
const ROW_HASH_DEBOUNCE_MS = 150;

function updateRowHash(row) {
    if (row.malformed) return;
    clearTimeout(rowHashDebounce.get(row.__key));
    rowHashDebounce.set(row.__key, setTimeout(async () => {
        rowHashDebounce.delete(row.__key);
        expectedHash.set(row.__key, await lineHash(resolvedSpeakerForHash(row.speaker), row.instruct, row.text));
    }, ROW_HASH_DEBOUNCE_MS));
}

async function recomputeAllHashes() {
    const nonMalformed = rows.value.filter((r) => !r.malformed);
    const hashes = await Promise.all(
        nonMalformed.map((r) => lineHash(resolvedSpeakerForHash(r.speaker), r.instruct, r.text)),
    );
    nonMalformed.forEach((r, i) => expectedHash.set(r.__key, hashes[i]));
}
watch(roleEntries, recomputeAllHashes);
function rowHasAnyTake(index) {
    return latestFileFor(index) !== null;
}
/*
 Strict check: does the EXACT file this row's current content would hash
 to already exist (see src/shared/line_hash.js's hasExpectedFile) --
 unlike rowHasAnyTake/latestFileFor, this doesn't care what else exists
 at this position, only whether THIS content has already been rendered.
*/
function rowIsFresh(row, index) {
    const pos = positionByIndex.value.get(index);
    if (pos === undefined) return false;
    const expected = expectedHash.get(row.__key);
    return expected !== undefined && hasExpectedFile(lineFilesOnDisk.value, pos, expected);
}

const isCurrentlyReady = computed(() => readyScripts.value.includes(filename.value));
const allRowsVoiced = computed(() => {
    const indices = [];
    rows.value.forEach((r, i) => { if (!r.malformed) indices.push(i); });
    return indices.length > 0 && indices.every((i) => rowIsFresh(rows.value[i], i));
});
function setStatus(text) {
    status.value = text;
}

/*
 Resolves a role CODE (or a raw preset typed directly) to the real .pt
 file Speaker Instruct2 Dialog will load -- for DISPLAY (the
 speaker-file-btn label) and looking up an existing preset's own file,
 not for hashing (see resolvedSpeakerForHash above).
*/
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

/*
 Persists roleEntries back to _roles.json -- reassigns a role's voice for
 the WHOLE project, not just this open script (see
 nodes/script_library.py's resolve_roles).
*/
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

/*
 Recasting a role changes every line using that code, project-wide -- see
 nodes/script_library.py's mark_role_stale. If THIS open script was
 affected, refresh its role catalog right away -- that alone re-derives
 every affected row's expected hash (see the watcher above) -- instead of
 waiting for the next poll tick.
*/
async function notifyRoleSpeakerChanged(roleCode) {
    if (!rolesJsonPath.value) return;
    const root = dirOf(rolesJsonPath.value);
    const result = await markRoleStale(root, roleCode, props.suffix);
    setStatus(result.message);
    if (result.changed.some((c) => c.file === filename.value)) {
        await loadCatalog();
        lastAudioFingerprint = null;
        lastTimingMtime = null;
        loadAudio();
        loadTiming();
    }
}

/*
 MODE 2 ONLY -- strictly gated on isCurrentlyReady (the Done flag), by
 design: two clearly separate modes, not a blend.
   Not done ("первая озвучка"): the combined/stitched file doesn't exist
     yet and isn't even fetched -- every row plays its OWN individual
     latest-take file in sequence, one at a time, with its own play/pause.
   Done: Done's own stitch just built ONE combined file + this timing
     manifest together, atomically -- so as long as the row count still
     matches it, the manifest is valid and every row gets a "seek to here
     in the combined file" jump button, with the mini player driving
     highlight + auto-scroll as it plays.
 Also requires the manifest's line COUNT to still match the current
 non-malformed row count (edits since the last Done would desync it).
*/
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
        let audioFilename = null;
        while (idx < rows.value.length) {
            if (!rows.value[idx].malformed) {
                audioFilename = latestFileFor(idx);
                if (audioFilename) break;
            }
            idx++;
        }
        if (idx >= rows.value.length || !audioFilename) {
            mode1PlayingIdx.value = -1;
            return;
        }
        mode1PlayingIdx.value = idx;
        /*
         Mode 2's syncActiveLine does this same scroll for the stitched
         player -- mode 1 (sequential per-line files, before Done) never
         had the equivalent, so the highlighted row silently ran off the
         bottom of a long script during playback.
        */
        rowEls.get(rows.value[idx]?.__key)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const el = new Audio(`${SCAN_API}/audio?path=${encodeURIComponent(joinPath(dir, audioFilename))}&v=${Date.now()}`);
        mode1AudioEl = el;
        el.addEventListener("ended", () => playIdx(idx + 1));
        el.play().catch((e) => setStatus(`Playback failed: ${e}`));
    };
    playIdx(startIndex);
}

/*
 Figures out which line audioEl.currentTime falls in (mode 2), moves the
 "now playing" highlight + auto-scroll there. Called on every timeupdate
 tick and whenever lineTiming is recomputed.
*/
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

/*
 Fetches _audio\timing\<script base>.json (written by Audio Post-
 Process). silent=true (background poll) skips re-parsing when the
 file's mtime hasn't changed.
*/
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

        /*
         A genuinely new manifest means Audio Post-Process just wrote
         fresh per-line files too (same run) -- refresh the directory
         listing so mode 1's play buttons/voiced state pick them up
         without waiting for the next 3s poll.
        */
        if (isFreshMtime) loadLineFiles();
        nextTick(syncActiveLine);
    } catch (e) {
        // Transient fetch error -- leave whatever timing state we already had.
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
    if (text === lastSavedText) return;
    try {
        const resp = await fetch(`${FILE_API}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: fullPath.value, content: text }),
        });
        const data = await resp.json();
        if (data.error) { setStatus(`Save error: ${data.error}`); return; }
        lastSavedText = text;
        setStatus(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (e) {
        setStatus(`Save failed: ${e}`);
    }
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

/*
 Keeps _audio\lines\<script>\ in sync with a structural edit instead of
 ever trying to detect drift after the fact -- see nodes/_line_audio.py's
 reorganize_lines. `deletes` are positions whose row no longer exists at
 all; `moves` are [from, to] pairs for rows that merely shifted position,
 their own hash untouched. Best-effort: a failure here just
 leaves stray/misplaced files behind (recoverable -- worst case a row
 shows the wrong voiced state until manually re-voiced), never blocks the
 edit itself, which has already happened locally by the time this runs.
*/
async function reorganizeLines({ deletes = [], moves = [] } = {}) {
    if (!deletes.length && !moves.length) return;
    try {
        await fetch(`${SCAN_API}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: props.folder, base_name: audioBaseName.value, deletes, moves }),
        });
        await loadLineFiles();
    } catch (e) {
        // Best-effort, see above.
    }
}

/*
 Merges two non-malformed rows into the one at the LOWER index,
 regardless of which was dragged onto which. Confirms first if the two
 rows' speakers differ. The merged row's text differs from either
 original, so its expected hash naturally stops matching whatever's on
 disk (see rowIsFresh) -- no explicit "mark unvoiced" needed.
*/
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

    const secondPos = positionByIndex.value.get(secondIdx);
    const totalPositions = positionByIndex.value.size;

    first.text = `${first.text} ${second.text}`.trim();
    /*
     A pause belongs AFTER its line, so the merged line inherits the
     SECOND half's pause -- the first half's own pause was silence in the
     middle of what is now one continuous line, and disappears with it.
    */
    first.pause = second.pause || "";
    rows.value.splice(secondIdx, 1);
    /*
     Hash is content-only (speaker+instruct+text), not position -- merging
     only actually changes `first`'s own text, so that's the only hash
     that needs redoing (second's own entry is simply orphaned along with
     its row, and every OTHER row's content is untouched by this).
    */
    updateRowHash(first);
    scheduleSave();

    if (secondPos !== undefined) {
        const moves = [];
        for (let p = secondPos + 1; p < totalPositions; p++) moves.push([p, p - 1]);
        reorganizeLines({ deletes: [secondPos], moves });
    }
}

/*
 Plain pointer-event drag (not native HTML5 drag-and-drop -- unreliable in
 practice). Tracks pointerdown -> pointermove -> pointerup and locates the
 element under the cursor via elementFromPoint.
*/
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
    const pos = positionByIndex.value.get(index);
    const totalPositions = positionByIndex.value.size;

    /*
     No expectedHash update needed -- the hash is content-only
     (speaker+instruct+text), and deleting a row doesn't change any OTHER
     row's content, only positions (handled below via reorganizeLines).
    */
    rows.value.splice(index, 1);
    scheduleSave();

    if (pos !== undefined) {
        const moves = [];
        for (let p = pos + 1; p < totalPositions; p++) moves.push([p, p - 1]);
        reorganizeLines({ deletes: [pos], moves });
    }
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
    updateRowHash(row);
    scheduleSave();
}
/*
 Grows _instruct_categories.json from actual typing -- every instruct a
 row ends up with that isn't ALREADY somewhere in the bank gets appended
 there under its own "custom" category (see instruct_library.js). Fires
 from both a manual edit and onInstructPicked (the picker's own choice
 is already in the bank almost always, so most calls here are a cheap
 no-op via saveInstructPhrase's dedup check). Debounced per row, same
 cadence as updateRowHash, so typing doesn't fire a write on every
 keystroke.
*/
const instructLibrarySaveDebounce = new Map(); // row.__key -> setTimeout id
function scheduleInstructLibrarySave(row) {
    clearTimeout(instructLibrarySaveDebounce.get(row.__key));
    instructLibrarySaveDebounce.set(row.__key, setTimeout(async () => {
        instructLibrarySaveDebounce.delete(row.__key);
        const updated = await saveInstructPhrase(FILE_API, instructCategoriesPath.value, row.instruct);
        if (updated) instructCategories.value = updated;
    }, SAVE_DEBOUNCE_MS));
}
function onInstructInput(row) {
    updateRowHash(row);
    scheduleSave();
    scheduleInstructLibrarySave(row);
}

/*
 ── per-line pause ──────────────────────────────────────────────────────
 Deliberately does NOT touch the row's hash: a pause is silence the
 stitch inserts between takes, not audio the TTS renders, so editing one
 must leave every existing take valid (see nodes/script_library.py's
 split_script_line). What it DOES invalidate is a final stitched track --
 picked up on the next scan by comparing the timing manifest's recorded
 plan against the script (_manifest_matches_script_pauses), which simply
 un-marks the script as done so pressing ✅ Done re-stitches it.
*/
const lastRowIndex = computed(() => {
    let last = -1;
    rows.value.forEach((r, i) => { if (!r.malformed) last = i; });
    return last;
});

/*
 What this line's silence-after actually resolves to when the cell is
 empty -- shown as the input's placeholder so the default is visible
 rather than folklore. Mirrors effective_pauses: the last line holds
 nothing unless it explicitly asks to.
*/
function pauseDefaultFor(index) {
    return index === lastRowIndex.value ? 0 : DEFAULT_LINE_GAP_S;
}

/*
 Something is typed that parsePauseField can't read. The line still
 renders -- its pause just falls back to the default -- so this is a
 warning, not the alarm a malformed line gets. Shown by swapping the
 group's own stopwatch icon (our own <i>, so no fight with the theme
 over an InputText's colour) plus PrimeVue's `p-invalid` on the field.
*/
function pauseUnreadable(row) {
    return Boolean(row.pause) && parsePauseField(row.pause) === null;
}

function pauseTitle(row, index) {
    const parsed = parsePauseField(row.pause);
    if (row.pause && parsed === null) {
        return `"${row.pause}" isn't a pause this can read -- expected seconds between 0 and 10 (e.g. 1.5). Falling back to ${pauseDefaultFor(index)}s.`;
    }
    if (parsed !== null) {
        return parsed === 0
            ? "No pause after this line -- the next one comes in on top of it (an interruption)"
            : `Hold ${parsed}s of silence after this line`;
    }
    return `Pause after this line, in seconds. Empty = ${pauseDefaultFor(index)}s`
        + (index === lastRowIndex.value ? " (nothing held after the last line)" : " (the default between lines)");
}

/*
 How many OTHER rows in this same script share `row`'s current speaker --
 backs both the "apply to all" button's enabled state and its tooltip.
 Scoped to this script only (never across files, unlike the project-wide
 role recast in Roles Editor): a role code can resolve to a different
 real speaker in another script's own context, so "same role" only means
 something within one script's own lines.
*/
function sameRoleCount(row) {
    const code = (row.speaker || "").trim();
    if (!code) return 0;
    return rows.value.filter((r) => r !== row && !r.malformed && (r.speaker || "").trim() === code).length;
}
function applyInstructTitle(row) {
    const count = sameRoleCount(row);
    return count > 0
        ? `Apply this instruct to every other "${row.speaker.trim()}" line in this script (${count})`
        : "No other lines in this script use this speaker";
}
function applyInstructToSameRole(row) {
    const count = sameRoleCount(row);
    if (!count) return;
    const code = row.speaker.trim();
    rows.value.forEach((r) => {
        if (r !== row && !r.malformed && (r.speaker || "").trim() === code) {
            r.instruct = row.instruct;
            updateRowHash(r);
        }
    });
    scheduleSave();
    setStatus(`Applied instruct to ${count} other "${code}" line(s) in this script`);
}
function roleEntryFor(row) {
    return roleEntries.value.find((e) => e.code === row.speaker);
}

function speakerFileTitle(row) {
    const entry = roleEntryFor(row);
    const file = resolveSpeakerFile(row.speaker);
    if (entry) return `Change "${entry.code}"'s speaker for the whole play (currently ${file || "unset"})`;
    if (file) return `"${row.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it`;
    return "No speaker set on this line yet";
}

/*
 Sub-label line for the speaker-file Dropdown's #option template -- which
 role(s) already use this preset, same info openSpeakerRecastPicker's old
 PickPanel showed underneath each preset (see speakerUsageIndex above).
*/
function speakerUsageSubLabel(preset) {
    const codes = speakerUsageIndex()[preset] || [];
    return codes.length ? `used by: ${codes.join(", ")} -- ${codes.length} role(s)` : "not used by any role yet";
}

/*
 Shows which register a row's CURRENT instruct belongs to, if it happens
 to match one of _instruct_categories.json's example phrases exactly --
 purely informational, never required: a line's instruct is free text
 either way (see that file's docstring in nodes/script_library.py), so a
 non-matching value (hand-typed, or a phrase from the retired
 _instructions.json catalog) is left alone and this just returns null.
*/
function instructNoteFor(row) {
    const text = row.instruct.trim();
    const category = instructCategories.value.find((c) => (c.examples || []).some((ex) => ex.trim() === text));
    return category ? category.title : null;
}

/*
 ── instruct picker dialog ──────────────────────────────────────────────
 The dialog itself is stateless (see InstructPickerDialog.vue) -- this
 editor tracks which row it's currently picking FOR, and what to do with
 the result: stash whatever was there before into row.__prevInstruct (a
 client-only field, never serialized -- see serializeRows, which only
 ever reads speaker/instruct/text/raw) so the ↺ button can swap back to
 it. Swapping rather than a destructive overwrite means a pick, or even a
 manual edit followed by undo, never actually loses text -- it's always
 one more click away in the other slot.
*/
const instructPickerVisible = ref(false);
const instructPickerRow = ref(null);
function openInstructPicker(row) {
    instructPickerRow.value = row;
    instructPickerVisible.value = true;
}
function onInstructPicked(example) {
    const row = instructPickerRow.value;
    if (!row) return;
    row.__prevInstruct = row.instruct;
    row.instruct = example;
    onInstructInput(row);
}
function undoInstructTitle(row) {
    return row.__prevInstruct !== undefined
        ? `Restore previous instruct: "${row.__prevInstruct}"`
        : "No previous instruct to restore";
}
function undoInstruct(row) {
    if (row.__prevInstruct === undefined) return;
    const current = row.instruct;
    row.instruct = row.__prevInstruct;
    row.__prevInstruct = current;
    onInstructInput(row);
}

/*
 Sub-label line for the speaker Dropdown's #option template (see
 template below) -- same fields the old openRolePicker's PickPanel
 showed underneath each role's code.
*/
function roleOptionSubLabel(entry) {
    return [entry.name, entry.speaker, entry.description].filter(Boolean).join(" -- ");
}

/*
 Reassigns a role's voice for the WHOLE project (see saveRolesJson) --
 triggered by free-typing into the speaker-file field, or picking one
 from the dialog below (see openSpeakerPicker/onSpeakerPicked). No-op if
 `row.speaker` isn't a known role code (the field is disabled in that
 case, see the template).
*/
async function onSpeakerFileRecast(row, newPreset) {
    const entry = roleEntryFor(row);
    if (!entry) return;
    entry.speaker = newPreset;
    /*
     A mutation of an EXISTING roleEntries item, not a reassignment of
     roleEntries.value itself -- the watch(roleEntries, ...) below only
     fires on the latter, so this recast needs its own explicit recompute
     (every row using this role code resolves to a different speaker now).
    */
    recomputeAllHashes();
    const ok = await saveRolesJson();
    if (ok) {
        setStatus(`"${entry.code}" now uses "${newPreset}" for the whole play`);
        await notifyRoleSpeakerChanged(entry.code);
    }
}

/*
 ── speaker picker dialog -- same "stateless dialog, this editor tracks
 which row it's for" contract as InstructPickerDialog/openInstructPicker.
*/
const speakerPickerVisible = ref(false);
const speakerPickerRow = ref(null);
function openSpeakerPicker(row) {
    speakerPickerRow.value = row;
    speakerPickerVisible.value = true;
}
async function onSpeakerPicked(preset) {
    const row = speakerPickerRow.value;
    if (!row) return;
    await onSpeakerFileRecast(row, preset);
}


function revoiceTitle(row, index) {
    if (pendingRevoiceRows.has(row)) return "Re-voicing...";
    if (rowHasAnyTake(index) && !rowIsFresh(row, index)) return "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content";
    if (rowIsFresh(row, index)) return "Re-voice just this line (uses the currently open workflow)";
    return "Not voiced yet -- click to render just this line";
}
async function revoiceRow(row, index) {
    if (pendingRevoiceRows.has(row)) return;
    pendingRevoiceRows.add(row);
    setStatus("Re-voicing...");
    try {
        /*
         `file` must come from THIS editor's own current filename.value --
         ScriptLibraryPanel's editScript() builds revoiceApi.revoiceLine
         with a `file` closed over the script the editor was FIRST opened
         for, which goes stale the moment Prev/Next switches this same
         instance to a different script (switchToFile only ever updates
         filename.value, a purely local ref -- it can't reach back into
         that closure). Passing the current value here overrides it.
         folder/baseName pin the re-voice's OUTPUT location to exactly the
         folder this editor reads its per-line files from (linesDirPath),
         instead of letting the backend re-derive it from its own
         script_filter widget -- see nodes/script_library.py's
         strip_suffix_and_ext, which can disagree with this component's
         own resolution if the two ever see a different suffix.
         linePosition is this row's CURRENT rank among non-malformed rows
         (see positionByIndex) -- the backend writes/reads per-line files
         addressed purely by that, not by any persisted id.
        
         contentHash is computed HERE, client-side, and stamped directly
         onto Post-Process's line_hashes_json input (see
         web/script_library.js's queueLineRevoice) rather than relying on
         Script Library's own line_hashes_json OUTPUT reaching it through
         an actual graph connection. That 4th output only exists for a
         FULL render (where nothing else could supply it) -- for a single-
         line re-voice, this editor already has the exact same resolved
         speaker/instruct/text script_library.py would hash from, so
         computing it here guarantees the file written now has EXACTLY
         the hash this editor's own rowIsFresh check will look for right
         after, with no dependency on whether the user has wired that new
         output/input pair in their canvas. Without this, an unwired graph
         silently falls back to hashing just the text (audio_post_process.
         py's line_hashes[i] fallback), which this editor's expected hash
         (voice+instruct+text) could never match -- the render would
         genuinely succeed but the row would look "still not voiced"
         forever, indistinguishable from re-voicing doing nothing at all.
        */
        const contentHash = await lineHash(resolvedSpeakerForHash(row.speaker), row.instruct, row.text);
        await props.revoiceApi.revoiceLine({
            linePosition: positionByIndex.value.get(index),
            speaker: row.speaker,
            instruct: row.instruct,
            text: row.text,
            contentHash,
            file: filename.value,
            folder: props.folder,
            baseName: audioBaseName.value,
        });
        await loadLineFiles();
        /*
         Closes the loop the two other logs open (web/script_library.js's
         "[FL revoice]" and audio_post_process.py's per-run block): those
         say what was ASKED for and what was WRITTEN, this says whether the
         file the row will now be judged by is actually there. All three
         agreeing while the row still reads "not voiced" would mean the
         mismatch is in the hash, not the plumbing.
        */
        const position = positionByIndex.value.get(index);
        const expectedName = makeLineFilename(position, contentHash);
        const landed = lineFilesOnDisk.value.has(expectedName);
        console.log("[FL revoice] after render:", {
            position, expectedFile: expectedName, foundOnDisk: landed,
            linesDir: linesDirPath.value,
            filesInDir: [...lineFilesOnDisk.value],
        });
        setStatus(landed ? "Line re-voiced" : `Re-voice finished but ${expectedName} is not in ${linesDirPath.value} -- see the console`);
    } catch (e) {
        setStatus(`Re-voice failed: ${e.message || e}`);
    } finally {
        pendingRevoiceRows.delete(row);
        flushSave();
    }
}

/*
 ── batch re-voice: every row the single 🔁 button already shows gold ───
 No separate "marked" state to track -- "needs re-voicing" already has a
 real, live answer per row (rowHasAnyTake && !rowIsFresh, the exact same
 check the per-row button's own `stale` class uses), so this just re-runs
 that same check across every row instead of asking the user to flag
 anything by hand.
*/
function isRowStale(row, index) {
    return !row.malformed && rowHasAnyTake(index) && !rowIsFresh(row, index);
}
const isRevoicingStale = ref(false);
const staleRowCount = computed(() => rows.value.filter((r, i) => isRowStale(r, i)).length);
const revoiceStaleTitle = computed(() => (
    staleRowCount.value > 0
        ? `Re-voice ${staleRowCount.value} line(s) whose text/speaker/instruct changed since they were last rendered (the gold 🔁 rows), one at a time`
        : "No line in this script needs re-voicing right now"
));
async function revoiceStaleRows() {
    if (isRevoicingStale.value) return;
    /*
     Snapshot the ROWS (not indices) up front -- re-voicing one line never
     adds/removes rows, only their positions could in principle shift
     (index is re-looked-up per iteration below), and re-scanning `rows`
     fresh on every iteration would let a row that JUST got fixed by an
     earlier pass in this same loop drop back out before its own turn.
    */
    const targets = rows.value.filter((r, i) => isRowStale(r, i));
    if (!targets.length) return;
    isRevoicingStale.value = true;
    try {
        for (const row of targets) {
            const index = rows.value.indexOf(row);
            if (index === -1) continue;
            await revoiceRow(row, index);
        }
        setStatus(`Re-voiced ${targets.length} line(s)`);
    } finally {
        isRevoicingStale.value = false;
    }
}

/*
 Not done: this row's own latest-take file, played in sequence (mode 1).
 Done: a "jump to here" seek into the combined/stitched track (mode 2) --
 the mini player up top then drives highlight + auto-scroll as it plays
 on from there. Strictly isCurrentlyReady, not "does a manifest happen to
 exist" -- re-voicing a single line only ever rewrites ITS OWN file,
 never the combined one (only Done's stitch touches that), so before
 Done, seeking into the combined file would silently keep playing an
 OLD take right when hearing a fresh re-voice matters most.
*/
function isRowPlaying(index) {
    return isCurrentlyReady.value
        ? activeTimingIdx.value === currentRowToTimingIdx.value.get(index) && audioIsPlaying.value
        : mode1PlayingIdx.value === index;
}

/*
 The play button itself is always shown on every row (so its presence
 doesn't silently depend on mode/ready state) -- this is just whether
 there's actually audio for THIS row to play yet. Not-done checks the
 actual folder listing (latestFileFor), not whether it's FRESH -- an old,
 stale take is still something to play, just not something Done accepts.
*/
function canPlayRow(index, row) {
    return isCurrentlyReady.value ? currentRowToTimingIdx.value.get(index) !== undefined : rowHasAnyTake(index);
}

function onPlayClick(row, index) {
    if (!canPlayRow(index, row)) return;
    if (isCurrentlyReady.value) {
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

/*
 One master play/pause for the sticky control panel -- just a different
 view onto the SAME state each row's own play button already reads
 (audioIsPlaying / mode1PlayingIdx), so it's automatically in sync with
 every row's ▶/⏸ icon without any extra plumbing.
*/
const isPlayingAnything = computed(() => (isCurrentlyReady.value ? audioIsPlaying.value : mode1PlayingIdx.value !== -1));
const canPlayGlobal = computed(() => (
    isCurrentlyReady.value
        ? Boolean(audioState.best)
        : rows.value.some((r, i) => !r.malformed && rowHasAnyTake(i))
));
const globalPlayTitle = computed(() => {
    if (!canPlayGlobal.value) return "Not voiced yet -- nothing to play";
    if (isPlayingAnything.value) return "Pause";
    return isCurrentlyReady.value ? "Play the full rendered file" : "Play every voiced line in sequence";
});
function toggleGlobalPlayback() {
    if (!canPlayGlobal.value) return;
    if (isCurrentlyReady.value) {
        const el = audioElRef.value;
        if (!el) return;
        if (audioIsPlaying.value) el.pause();
        else el.play();
    } else if (mode1PlayingIdx.value !== -1) {
        stopMode1Playback();
    } else {
        playRowSequential(0);
    }
}

// ── mini audio player (mode 2 + "has this script been rendered at all")
async function loadAudio({ silent = false } = {}) {
    if (!silent) audioState.checking = true;
    try {
        const resp = await fetch(`${BROWSE_API}?path=${encodeURIComponent(audioFolder.value)}`);
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

/*
 A script is "ready" purely because its final stitched file exists in
 _audio\ (see nodes/script_library.py's scripts_ready -- no more separate
 _ready.json flag), so deleting that file here IS un-marking done, not
 just a "before Done" convenience any more -- readyScripts gets the same
 update toggleDone's un-mark path makes.
*/
const deleteAudioDisabled = computed(() => !audioState.best);

async function deleteAudio() {
    if (!audioState.best) return;
    const ok = await confirmAsync({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${audioBaseName.value}" (currently: ${audioState.best})${isCurrentlyReady.value ? " -- this also un-marks the script as done" : ""}.`,
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
        readyScripts.value = readyScripts.value.filter((f) => f !== filename.value);
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
/*
 "Done" has no separate flag any more (see nodes/script_library.py's
 scripts_ready) -- readiness IS the final stitched file existing in
 _audio\, so marking done just stitches it, and un-marking just deletes
 it (the same operation "Delete audio" above performs).
*/
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
                    /*
                     Each position's own current hash -- lets stitch_lines
                     read the EXACT file that content hashes to, no
                     directory-scan guessing (see nodes/_line_audio.py's
                     expected_path).
                    */
                    line_hashes: nonMalformed.map((r) => expectedHash.get(r.__key)),
                    line_texts: nonMalformed.map((r) => r.text),
                    /*
                     Silence to hold after each line, null where the row
                     names none -- the stitch resolves those to its own
                     defaults and records the finished plan in the timing
                     manifest, which is what later tells a done script
                     its pauses have since been edited (see
                     _manifest_matches_script_pauses).
                    */
                    pauses: nonMalformed.map((r) => parsePauseField(r.pause)),
                }),
            });
            const stitchData = await stitchResp.json();
            if (stitchData.error) { setStatus(`Stitch error: ${stitchData.error}`); return; }
        } catch (e) {
            setStatus(`Stitch failed: ${e}`);
            return;
        }
        readyScripts.value = [...new Set([...readyScripts.value, filename.value])];
        props.checkedApi?.setChecked(filename.value, false);
        selectChecked.value = false;
        setStatus("Stitched and marked done");
        lastAudioFingerprint = null;
        lastTimingMtime = null;
        loadAudio();
        loadTiming();
        return;
    }

    const ok = await confirmAsync({
        title: "Unmark done?",
        message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
        okText: "Unmark",
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
        readyScripts.value = readyScripts.value.filter((f) => f !== filename.value);
        setStatus("Unmarked -- can be edited/re-voiced again");
        lastAudioFingerprint = null;
        loadAudio();
    } catch (e) {
        setStatus(`Error: ${e}`);
    }
}

// ── actions row: stress mark / split / add line / prev/next ────────────
function insertStressMark() {
    sharedInsertStressMark(setStatus);
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
    const posOfSplitRow = positionByIndex.value.get(index);
    const totalPositions = positionByIndex.value.size;

    const pos = el.selectionStart;
    const before = row.text.slice(0, pos).trimEnd();
    const after = row.text.slice(pos).trimStart();
    row.text = before;
    /*
     The pause sat after the whole line, so it stays after its SECOND
     half -- the new row takes it, the first half goes back to default.
    */
    const newRow = freshRow({ speaker: row.speaker, instruct: row.instruct, text: after, pause: row.pause || "", raw: "", malformed: false });
    row.pause = "";
    rows.value.splice(index + 1, 0, newRow);
    /*
     Both halves' own text changed (the original row got truncated, the
     new one is the remainder) -- every other row's content is untouched.
    */
    updateRowHash(row);
    updateRowHash(newRow);
    focusNewRow(newRow.__key);
    scheduleSave();

    if (posOfSplitRow !== undefined) {
        const newPos = posOfSplitRow + 1;
        const moves = [];
        for (let p = totalPositions - 1; p >= newPos; p--) moves.push([p, p + 1]);
        reorganizeLines({ moves });
    }
}

function addLine() {
    /*
     Appended past every existing position -- nothing to reorganize, this
     row simply has no file yet.
    */
    const newRow = freshRow({ speaker: "", instruct: "", text: "", pause: "", raw: "", malformed: false });
    rows.value.push(newRow);
    /*
     Appended at the end -- no other row's position shifts, so only this
     one needs its own hash (see updateRowHash), not a full recompute.
    */
    updateRowHash(newRow);
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
        speakerSampleDir.value = data.dir || "";
    } catch (e) {
        presets.value = [];
        speakerSampleDir.value = "";
    }
}

async function loadCatalog() {
    try {
        const url = `${SCAN_API}/scan?path=${encodeURIComponent(props.folder)}&act=&suffix=${encodeURIComponent(props.suffix)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        instructCategories.value = data.instruct_categories?.entries || [];
        instructCategoriesPath.value = data.instruct_categories?.path || null;
        roleEntries.value = data.roles?.entries || [];
        rolesJsonPath.value = data.roles?.path || null;
        scriptList.value = Array.isArray(data.scripts) ? data.scripts : [];
        readyScripts.value = Array.isArray(data.ready_scripts) ? data.ready_scripts : [];
    } catch (e) {
        instructCategories.value = [];
        instructCategoriesPath.value = null;
        roleEntries.value = [];
        rolesJsonPath.value = null;
        scriptList.value = [];
        readyScripts.value = [];
    }
}

/*
 Switches this same editor instance to a different script in the same
 act (Prev/Next), without closing/reopening the panel.
*/
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
                setStatus("File does not exist yet (will be created on first edit)");
            }
            return;
        }
        if (isPoll && Date.now() - lastLocalEditAt < EDIT_QUIET_MS) return;
        if (data.content === lastSavedText) return;
        rows.value = parseScript(data.content);
        lastSavedText = data.content;
        recomputeAllHashes();
        if (!isPoll) setStatus(`Loaded ${rows.value.length} line(s)`);
    } catch (e) {
        setStatus(`Read failed: ${e}`);
    }
}

watch(lineTiming, () => nextTick(syncActiveLine));
watch(textFontSizePx, regrowAll);

onMounted(() => {
    loadCatalog();
    loadPresets();
    loadAudio();
    loadLineFiles();
    audioPollTimer = setInterval(() => { loadAudio({ silent: true }); loadLineFiles(); }, POLL_MS);
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
            <DialogHeader
                :title="filename" :status="status"
                :width-presets="widthPresets" :set-width="setPanelWidth"
                :font-size-decrease="decreaseTextFontSize" :font-size-increase="increaseTextFontSize"
            />
        </template>

        <StickyPanel class="line-editor-controls">
            <div class="audio-content-row">
                <span
                    class="play-btn global-play-btn"
                    :class="{ 'is-playing': isPlayingAnything, disabled: !canPlayGlobal }"
                    :title="globalPlayTitle"
                    @click="toggleGlobalPlayback"
                >{{ isPlayingAnything ? "⏸" : "▶" }}</span>

                <template v-if="audioState.best">
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
                        label="Delete audio" text size="small"
                        :disabled="deleteAudioDisabled"
                        :title="isCurrentlyReady ? 'Delete the final file -- this also un-marks the script as done' : 'Delete the rendered audio for this script'"
                        @click="deleteAudio"
                        icon="pi pi-times-circle"
                    />
                </template>

                <Button icon="pi pi-refresh" text size="small" title="Re-check _audio\ for this script's rendered audio" @click="loadAudio()" />
            </div>
            <div v-if="timingWarningVisible" class="timing-warning">⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер</div>

            <div class="actions-row">
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
                <div class="actions-divider" />
                <Button label="´ Stress mark" text size="small" title="Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this" @mousedown.prevent="insertStressMark" />
                <Button label="✂ Split line" text size="small" title="Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this" @mousedown.prevent="splitFocusedLine" />
                <Button label="+ Add line" text size="small" title="Add a new empty line at the end of the script" @click="addLine" />
                <Button
                    label="🔁 Re-voice pending"
                    text size="small"
                    :disabled="!revoiceApi || isCurrentlyReady || staleRowCount === 0 || isRevoicingStale"
                    :title="revoiceStaleTitle"
                    @click="revoiceStaleRows"
                />
                <div class="actions-divider" />
                <Button label="◀ Prev" text size="small" :disabled="prevDisabled" title="Open the previous script in this act" @click="goPrev" />
                <Button label="Next ▶" text size="small" :disabled="nextDisabled" title="Open the next script in this act" @click="goNext" />
            </div>
        </StickyPanel>

        <div ref="rowsContainerEl" class="rows-container">
            <div
                v-for="(row, index) in rows"
                :key="row.__key"
                class="fl-line-row"
                :class="{ 'row-enter': justAddedKey === row.__key, 'row-playing': (isCurrentlyReady ? currentRowToTimingIdx.get(index) === activeTimingIdx : mode1PlayingIdx === index) }"
                :data-row-index="index"
                :ref="(el) => setRowRef(row.__key, el)"
            >
                <div class="line-rail"
                    :style="row.malformed ? {} : { backgroundColor: speakerAccent(row.speaker) }"
                    title="Drag onto another line to merge them"
                    :ref="(el) => attachDragHandlers(el, index)"
                >
                  <span class="line-number">{{ index + 1 }}</span>
                  <i class="pi pi-arrows-v"></i>
                </div>
                <div class="line-body">
                    <template v-if="row.malformed">
                        <div class="malformed-warn-line">
                            <div class="malformed-warn">⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:</div>
                            <Button icon="pi pi-trash" text size="small" title="Delete this line" @click="confirmDeleteRow(index, row.raw)" />
                        </div>
                        <Textarea
                            v-model="row.raw"
                            auto-resize
                            class="fl-textarea malformed-textarea"
                            :style="{ fontSize: `${textFontSizePx}px` }"
                            rows="1"
                            :ref="(el) => setTextareaRef(row.__key, el)"
                            @update:model-value="scheduleSave()"
                            @keydown.enter.prevent
                        />
                    </template>
                    <template v-else>
                    <LineRowEditor
                        :speaker="row.speaker"
                        :role-entries="roleEntries"
                        :role-option-sub-label="roleOptionSubLabel"
                        :role-info-code="row.speaker"
                        :instruct="row.instruct"
                        :can-undo-instruct="row.__prevInstruct !== undefined"
                        :undo-instruct-title="undoInstructTitle(row)"
                        :can-apply-instruct="sameRoleCount(row) > 0"
                        :apply-instruct-title="applyInstructTitle(row)"
                        :instruct-note="instructNoteFor(row)"
                        :text="row.text"
                        :font-size-px="textFontSizePx"
                        :textarea-ref="(el) => setTextareaRef(row.__key, el)"
                        :on-auto-grow="autoGrow"
                        @update:speaker="row.speaker = $event; onSpeakerInput(row)"
                        @update:instruct="row.instruct = $event; onInstructInput(row)"
                        @update:text="row.text = $event; updateRowHash(row); scheduleSave()"
                        @open-instruct-picker="openInstructPicker(row)"
                        @undo-instruct="undoInstruct(row)"
                        @apply-instruct="applyInstructToSameRole(row)"
                        @role-info-enter="showRoleInfoPopover"
                        @role-info-leave="hideRoleInfoPopover"
                    >
                        <template #leading>
                            <span
                                class="play-btn"
                                :class="{ 'is-playing': isRowPlaying(index), disabled: !canPlayRow(index, row) }"
                                :title="canPlayRow(index, row) ? (isCurrentlyReady ? 'Jump to this line in the full render' : 'Play this line (and every voiced line after it)') : 'Not voiced yet -- nothing to play'"
                                @click="onPlayClick(row, index)"
                            >{{ isRowPlaying(index) ? "⏸" : "▶" }}</span>
                        </template>
                        <template #trailing>
                            <InputGroup class="speaker-file-group">
                                <Button
                                    v-if="revoiceApi && !isCurrentlyReady"
                                    class="revoice-btn"
                                    size="small"
                                    :icon="pendingRevoiceRows.has(row) ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
                                    :class="{ pending: pendingRevoiceRows.has(row), stale: !pendingRevoiceRows.has(row) && rowHasAnyTake(index) && !rowIsFresh(row, index) }"
                                    :disabled="pendingRevoiceRows.has(row)"
                                    :title="revoiceTitle(row, index)"
                                    @click="revoiceRow(row, index)"
                                />
                                <InputText
                                    :model-value="roleEntryFor(row)?.speaker || ''"
                                    placeholder="(no speaker)"
                                    class="speaker-file-input"
                                    :disabled="!roleEntryFor(row)"
                                    :title="speakerFileTitle(row)"
                                    @update:model-value="onSpeakerFileRecast(row, $event)"
                                />
                                <Button
                                    icon="pi pi-microphone"
                                    size="small"
                                    :disabled="!roleEntryFor(row)"
                                    title="Pick a speaker from the preset gallery"
                                    @click="openSpeakerPicker(row)"
                                />
                            </InputGroup>

                            <InputGroup class="pause-group">
                                <InputGroupAddon>
                                    <i :class="pauseUnreadable(row) ? 'pi pi-exclamation-triangle pause-warn' : 'pi pi-stopwatch'" />
                                </InputGroupAddon>
                                <InputText
                                    v-model="row.pause"
                                    class="pause-input"
                                    :class="{ 'p-invalid': pauseUnreadable(row) }"
                                    :placeholder="String(pauseDefaultFor(index))"
                                    :title="pauseTitle(row, index)"
                                    @update:model-value="scheduleSave()"
                                />
                            </InputGroup>

                            <div class="spacer" />
                            <Button icon="pi pi-times" color="red" text size="small" title="Delete this line" @click="confirmDeleteRow(index, row.text)" />
                        </template>
                    </LineRowEditor>
                </template>
                </div>
            </div>
        </div>
    </Dialog>

    <ConfirmDialog />

    <InstructPickerDialog
        v-model:visible="instructPickerVisible"
        :categories="instructCategories"
        @select="onInstructPicked"
    />

    <SpeakerPickerDialog
        v-model:visible="speakerPickerVisible"
        :presets="presets"
        :sample-dir="speakerSampleDir"
        :usage-for="speakerUsageSubLabel"
        @select="onSpeakerPicked"
    />

    <RoleInfoPopover
        :visible="roleInfoPopover.visible" :left="roleInfoPopover.left" :top="roleInfoPopover.top"
        :message="roleInfoFields.message" :fields="roleInfoFields.fields"
    />
</template>


<style scoped src="./LineEditorApp.css"></style>
