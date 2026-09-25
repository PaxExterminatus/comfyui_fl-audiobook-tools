<script setup>
/*
 Full-screen-ish editor for one episode bucket of a VO dub project (see
 nodes/vo_dub_library.py's module docstring). Deliberately NOT
 LineEditorApp.vue with a few fields swapped: there's no position/hash
 filename scheme here (see that module's docstring), no merge/split/
 pause (rows never restructure), and no "stitch into one track" step --
 a row's own rendered take already IS the deliverable. What DOES carry
 over: the debounced-save-to-one-JSON-file pattern (closer to
 RolesEditorApp.vue's own _roles.json save loop than to LineEditorApp's
 per-script save), and lineHash() for the same content-fingerprint
 scheme (see src/shared/line_hash.js).

 The 🔁 render button queues the SAME graph a normal Run would (see
 web/vo_dub_library.js's queueVoDubRender, a close mirror of
 web/script_library.js's own per-line queueLineRevoice), with the VO Dub
 Library node's line_override forced to this row's resolved
 "speaker | instruct | text", Audio Post-Process's output_path_override
 forced to audio_ru\<audio_key>.wav, and its effect_override forced to
 this row's chosen Effect (e.g. "radio") -- see
 nodes/audio_post_process.py's own tooltips for both inputs.
*/
import { ref, reactive, computed, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import DialogHeader from "../shared/DialogHeader.vue";
import StickyPanel from "../shared/StickyPanel.vue";
import LineRowEditor from "../shared/LineRowEditor.vue";
import InstructPickerDialog from "../shared/InstructPickerDialog.vue";
import RoleInfoPopover from "../shared/RoleInfoPopover.vue";
import { useRoleInfoPopover } from "../shared/role_info_popover.js";
import { useTextareaAutoGrow } from "../shared/textarea_autogrow.js";
import { insertStressMark } from "../shared/stress_mark.js";
import { saveInstructPhrase } from "../shared/instruct_library.js";
import { guardAgainstUnbufferedPlay, waitUntilBuffered } from "../shared/audio_buffer_guard.js";
import { createEffectPreview } from "./effect_preview.js";
import WaveformCanvas from "./WaveformCanvas.vue";
import { lineHash } from "../shared/line_hash.js";
import {
    joinPath, SCRIPT_EDITOR_API as FILE_API, SCRIPT_LIBRARY_API as SCAN_API, VO_DUB_API,
} from "../../web/fl_common.js";

const props = defineProps({
    root: { type: String, required: true },
    bucket: { type: String, required: true },
    renderApi: { type: Object, default: null }, // {renderRow({audioKey, speaker, instruct, russianText, effect, outputPath, dryOutputPath, referenceAudioPath}) => Promise}
    onClose: { type: Function, required: true },
});

const SAVE_DEBOUNCE_MS = 600;

const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.VODubLineEditor.widthPx",
    defaultWidth: 1100,
    presets: [800, 1100, 1500],
});
const { fontSizePx, decrease: decreaseFontSize, increase: increaseFontSize } = useFontSize({
    storageKey: "FL_CosyVoice3.VODubLineEditor.fontSizePx",
    defaultSize: 13,
});
const { autoGrow, setTextareaRef, regrowAll } = useTextareaAutoGrow();
/*
 A font-size change resizes the TEXT but not a textarea's own height (set
 via inline style, not CSS) -- same reasoning as LineEditorApp.vue's own
 regrowAll watch.
*/
watch(fontSizePx, regrowAll);

const visible = ref(true);
let closed = false;
function close() {
    if (closed) return;
    closed = true;
    if (saveTimer) { clearTimeout(saveTimer); flushSave(); }
    props.onClose();
}
watch(visible, (v) => { if (!v) close(); });

const rows = ref([]); // server view: audio_key/episode/english/duration_s/channels/status/speaker/speaker_tag/russian/instruct
const stateRows = reactive({}); // this addon's own edits, keyed by audio_key -- see module docstring
const statusFilter = ref("");
const searchText = ref("");
const status = ref("");
const loading = ref(false);

const STATUS_LABELS = {
    "": "All statuses",
    no_text: "No source text",
    needs_translation: "Needs translation",
    not_started: "Not started",
    stale: "Stale",
    done: "Done",
    unsupported: "Unsupported (multi-channel)",
};
const STATUS_FILTER_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

/*
 Mirrors nodes/_audio_effects.py's EFFECTS registry. A row's chosen
 effect is applied AFTER trim/fade/normalize, right before save (see
 audio_post_process.py's effect_override input), never baked into the
 TTS generation itself.
*/
const EFFECT_OPTIONS = [
    { value: "", label: "No effect" },
    { value: "radio", label: "📻 Radio" },
    { value: "phone", label: "📞 Phone" },
    { value: "muffled", label: "🤫 Muffled" },
    { value: "radio_dry", label: "📻 Radio (no static)" },
    { value: "intercom", label: "🔊 Intercom" },
    { value: "suit", label: "🧑‍🚀 Suit" },
];

/*
 Picking an effect previews it INSTANTLY on the RU take (see
 effectPreviews below) without touching _dub_state.json at all -- it's
 only a pending, client-side choice until the user explicitly commits it
 (the Save button next to the dropdown, or Render/Re-render, which both
 call commitEffect). Keyed separately from stateRows on purpose: the
 saved entry must stay untouched by just trying an effect out.
*/
const previewEffect = reactive({}); // audio_key -> pending effect value, or undefined if untouched this session
function effectValue(row) {
    const pending = previewEffect[row.audio_key];
    return pending !== undefined ? pending : (entryFor(row).effect || "");
}
function effectIsDirty(row) {
    const pending = previewEffect[row.audio_key];
    return pending !== undefined && pending !== (entryFor(row).effect || "");
}
function onEffectPicked(row, value) {
    previewEffect[row.audio_key] = value;
    effectPreviews.get(row.audio_key)?.setEffect(value);
}
/*
 Folds the pending choice into the SAVED entry -- called by both the
 explicit Save button and renderRow() (a render necessarily commits
 whatever's currently selected, since the file it writes will reflect
 exactly that).
*/
function commitEffect(row) {
    if (previewEffect[row.audio_key] !== undefined) {
        entryFor(row).effect = previewEffect[row.audio_key];
        delete previewEffect[row.audio_key];
    }
}
/*
 Saving persists the choice to _dub_state.json either way -- but if a
 take already exists, it ALSO reprocesses the file immediately (see
 applyEffectToFile), no TTS re-synthesis required, so the saved choice
 is actually reflected on disk right away instead of only taking effect
 on the row's next full Render.
*/
function saveEffect(row) {
    commitEffect(row);
    onTextEdit(row);
    if (hasRuTake(row)) applyEffectToFile(row);
}

/*
 Whether THIS row's render should use the game's own EN reference take
 as the TTS voice-cloning sample instead of a preset/role voice -- an
 explicit per-row choice (entry.use_original_sample) wins once the row's
 own checkbox has ever been touched; otherwise it follows the
 project-wide default checkbox (useOriginalDefault). Deliberately never
 backfilled to a concrete value on load (unlike effect/instruct/
 speaker_override) -- an ABSENT key is what "still inheriting the
 project default" actually means; backfilling it would freeze every row
 at whatever the default happened to be the moment it was first opened.
 Mirrors nodes/vo_dub_library.py's own uses_original_as_sample() exactly.
*/
function resolvedUseOriginal(row) {
    const override = entryFor(row).use_original_sample;
    return override === undefined ? useOriginalDefault.value : Boolean(override);
}
function onToggleRowUseOriginal(row, value) {
    entryFor(row).use_original_sample = value;
    onTextEdit(row);
}
function onToggleUseOriginalDefault() {
    scheduleSave();
}

function statePath() {
    return joinPath(props.root, "_dub_state.json");
}

/*
 _dub_state.json's own top-level "use original EN take as the TTS voice
 sample" default -- a project-wide checkbox, separate from any single
 row's own choice (see resolvedUseOriginal/onToggleRowUseOriginal below).
*/
const useOriginalDefault = ref(false);

async function loadState() {
    const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(statePath())}`);
    const data = await resp.json();
    let parsed = { rows: {} };
    if (data.exists) {
        try {
            const candidate = JSON.parse(data.content);
            if (candidate && typeof candidate.rows === "object") parsed = candidate;
        } catch (e) {
            console.warn("[FL CosyVoice3 VODubEditor] _dub_state.json is not valid JSON:", e);
        }
    }
    Object.keys(stateRows).forEach((k) => delete stateRows[k]);
    Object.assign(stateRows, parsed.rows);
    useOriginalDefault.value = Boolean(parsed.use_original_default);
}

async function loadRows() {
    loading.value = true;
    try {
        const resp = await fetch(`${VO_DUB_API}/rows?path=${encodeURIComponent(props.root)}&bucket=${encodeURIComponent(props.bucket)}`);
        const data = await resp.json();
        if (data.error) {
            status.value = data.error;
            rows.value = [];
            return;
        }
        rows.value = data.rows || [];
        /*
         Backfill every row's own editable entry so the textarea/inputs
         below always bind to something real from the first render --
         never to `undefined`, and never overwriting an edit that's
         already there (see entryFor).
        */
        for (const row of rows.value) {
            const entry = stateRows[row.audio_key] || (stateRows[row.audio_key] = {});
            if (!entry.russian_text) entry.russian_text = row.russian || "";
            if (entry.instruct === undefined) entry.instruct = row.instruct || "";
            if (entry.speaker_override === undefined) entry.speaker_override = "";
            if (entry.effect === undefined) entry.effect = "";
        }
        status.value = `${rows.value.length} row(s) in ${props.bucket}`;
    } catch (e) {
        status.value = `Couldn't load: ${e}`;
    } finally {
        loading.value = false;
    }
}

function entryFor(row) {
    return stateRows[row.audio_key] || (stateRows[row.audio_key] = {});
}

let saveTimer = null;
function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
}
async function flushSave() {
    try {
        await fetch(`${FILE_API}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: statePath(),
                content: JSON.stringify({ rows: stateRows, use_original_default: useOriginalDefault.value }, null, 2),
            }),
        });
        status.value = "Saved";
        /*
         Re-fetch so status pills (not_started/stale/done) catch up with
         whatever's actually on disk now -- an edit here doesn't
         re-render anything, so a row that just became "stale" (its
         recorded hash no longer matches its new text) only shows that
         once this refresh runs.
        */
        loadRows();
    } catch (e) {
        status.value = `Save failed: ${e}`;
    }
}

function onTextEdit(row) {
    void entryFor(row); // ensure it exists even if the user cleared it back to ""
    scheduleSave();
}

function setStatus(msg) {
    status.value = msg;
}

const visibleRows = computed(() => {
    const needle = searchText.value.trim().toLowerCase();
    return rows.value.filter((row) => {
        if (statusFilter.value && row.status !== statusFilter.value) return false;
        if (!needle) return true;
        const entry = stateRows[row.audio_key];
        const haystack = `${row.audio_key} ${row.speaker_tag} ${row.english} ${(entry && entry.russian_text) || row.russian}`.toLowerCase();
        return haystack.includes(needle);
    });
});

/*
 A bucket can be up to ~617 rows (the real project's biggest episode) --
 rendering all of them (each with two <audio> elements) at once is what
 made this editor slow to open. Paginating keeps the DOM small
 regardless of bucket size; the audio elements themselves are lazy too
 (see `preload="none"` below), so a page of 50 costs nothing over the
 network until something is actually played.
*/
const PAGE_SIZE = 50;
const currentPage = ref(0);
const pageCount = computed(() => Math.max(1, Math.ceil(visibleRows.value.length / PAGE_SIZE)));
const pagedRows = computed(() => {
    const start = currentPage.value * PAGE_SIZE;
    return visibleRows.value.slice(start, start + PAGE_SIZE);
});

/*
 A new search/status filter starts back at page 1 -- staying on, say,
 page 4 of a filter that now has only 1 page left reads as "my search
 broke", not "the list changed".
*/
watch([statusFilter, searchText], () => { currentPage.value = 0; });

/*
 Clamps back into range whenever the FILTERED count shrinks -- including
 right after rendering a row flips it out of the current status filter
 and loadRows() refreshes (see renderRow): without this, the page could
 point past the end of what's actually left to show.
*/
watch(visibleRows, () => {
    if (currentPage.value > pageCount.value - 1) currentPage.value = Math.max(0, pageCount.value - 1);
});

/*
 ── role catalog (_dub_roles.json) ───────────────────────────────────────
 Same system as the audiobook Line Editor's own speaker field (see
 LineEditorApp.vue's roleEntries/roleOptionSubLabel, and
 src/shared/RoleDropdown.vue, the component both now share): a row's
 "speaker" is either a known role CODE (resolved through this catalog's
 own assigned voice, set in DubRolesEditorApp.vue) or a literal preset
 typed directly -- an unrecognized value just passes through unchanged,
 same as nodes/vo_dub_library.py's resolved_speaker.
*/
const roleEntries = ref([]); // [{code, character, speaker, description, dub_direction, ...}]
async function loadRoleEntries() {
    try {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(joinPath(props.root, "_dub_roles.json"))}`);
        const data = await resp.json();
        if (!data.exists) { roleEntries.value = []; return; }
        const parsed = JSON.parse(data.content);
        const roles = (parsed && typeof parsed.roles === "object" && parsed.roles) || {};
        roleEntries.value = Object.entries(roles).map(([code, entry]) => ({ code, ...entry }));
    } catch (e) {
        roleEntries.value = [];
    }
}
/*
 Shown under each option's code in the dropdown -- character name + the
 voice actually assigned, so picking a role means something without
 having to open the Roles editor first.
*/
function roleOptionSubLabel(entry) {
    return [entry.character, entry.speaker].filter(Boolean).join(" -- ");
}

/*
 The value a row's Role field currently holds -- override if set, else
 the raw csv tag shown in the Identifier field -- same "manual value, or
 fall back to the tag" logic as nodes/vo_dub_library.py's
 resolved_speaker (minus the role_map lookup, which only matters for
 what VOICE it resolves to, not for identifying which rows share it).
*/
function roleCodeFor(row) {
    return (entryFor(row).speaker_override || row.speaker_tag || "").trim();
}

/*
 Hovering a row's Role field/Identifier shows this role's catalog entry
 -- same mechanism as LineEditorApp.vue's own role-info-btn (see
 src/shared/role_info_popover.js), just reading _dub_roles.json's richer
 casting-document fields instead of _roles.json's flat ones.
*/
const { popover: roleInfoPopover, show: showRoleInfoPopover, hide: hideRoleInfoPopover, info: roleInfoFields } = useRoleInfoPopover(
    roleEntries,
    (entry) => [
        ["character", entry.character],
        ["gender", entry.gender],
        ["actor", entry.actor],
        ["description", entry.description],
        ["dub direction", entry.dub_direction],
        ["notes", Array.isArray(entry.notes) ? entry.notes.join(" ") : entry.notes],
        ["voice", entry.speaker],
    ].filter(([, v]) => v !== undefined && v !== null && v !== ""),
);

/*
 ── instruct phrase bank (_instruct_categories.json) -- same file/shape
 and picker dialog as the audiobook Line Editor's own instruct field. ──
*/
const instructCategories = ref([]); // [{name, title, when, examples}, ...]
function instructCategoriesPath() {
    return joinPath(props.root, "_instruct_categories.json");
}
async function loadInstructCategories() {
    try {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(instructCategoriesPath())}`);
        const data = await resp.json();
        if (!data.exists) { instructCategories.value = []; return; }
        const parsed = JSON.parse(data.content);
        instructCategories.value = (parsed && parsed.categories) || [];
    } catch (e) {
        instructCategories.value = [];
    }
}

/*
 Grows the bank from actual typing -- every instruct a row ends up with
 that isn't ALREADY somewhere in _instruct_categories.json gets appended
 there under its own "custom" category (see instruct_library.js).
 Debounced per row, same cadence as the row's own save-to-state debounce
 -- typing itself shouldn't fire a network round-trip on every
 keystroke, only once it settles.
*/
const instructLibrarySaveTimers = new Map(); // audio_key -> setTimeout handle
function scheduleInstructLibrarySave(row) {
    clearTimeout(instructLibrarySaveTimers.get(row.audio_key));
    instructLibrarySaveTimers.set(row.audio_key, setTimeout(async () => {
        const phrase = entryFor(row).instruct;
        const updated = await saveInstructPhrase(FILE_API, instructCategoriesPath(), phrase);
        if (updated) instructCategories.value = updated;
    }, SAVE_DEBOUNCE_MS));
}

const instructPickerVisible = ref(false);
const instructPickerRow = ref(null);
function openInstructPicker(row) {
    instructPickerRow.value = row;
    instructPickerVisible.value = true;
}
/*
 The previous instruct is kept OUTSIDE stateRows (which serializes as-is
 into _dub_state.json, see flushSave) -- a pure UI undo buffer has no
 business landing in the saved sidecar.
*/
const prevInstruct = reactive({});
function onInstructPicked(example) {
    const row = instructPickerRow.value;
    if (!row) return;
    prevInstruct[row.audio_key] = entryFor(row).instruct;
    entryFor(row).instruct = example;
    onTextEdit(row);
    /*
     Already came FROM the bank -- saveInstructPhrase's own dedup check
     makes this a no-op almost always, harmless to call anyway for the
     rare case a category was edited by hand since this picker loaded.
    */
    scheduleInstructLibrarySave(row);
}
/*
 Shows which register a row's CURRENT instruct belongs to, if it happens
 to match one of _instruct_categories.json's example phrases exactly --
 purely informational, same as LineEditorApp.vue's own instructNoteFor.
*/
function instructNoteFor(row) {
    const text = (entryFor(row).instruct || "").trim();
    const category = instructCategories.value.find((c) => (c.examples || []).some((ex) => ex.trim() === text));
    return category ? category.title : null;
}
function undoInstructTitle(row) {
    return prevInstruct[row.audio_key] !== undefined
        ? `Restore previous instruct: "${prevInstruct[row.audio_key]}"`
        : "No previous instruct to restore";
}
function undoInstruct(row) {
    if (prevInstruct[row.audio_key] === undefined) return;
    const current = entryFor(row).instruct;
    entryFor(row).instruct = prevInstruct[row.audio_key];
    prevInstruct[row.audio_key] = current;
    onTextEdit(row);
}

/*
 "Apply this instruct to every other row using the same role" -- grouped
 by roleCodeFor across the WHOLE bucket (rows.value), not just the
 current page, same as LineEditorApp.vue's sameRoleCount/
 applyInstructToSameRole over a whole script.
*/
function sameRoleCount(row) {
    const code = roleCodeFor(row);
    if (!code) return 0;
    return rows.value.filter((r) => r !== row && r.status !== "unsupported" && roleCodeFor(r) === code).length;
}
function applyInstructTitle(row) {
    const count = sameRoleCount(row);
    return count > 0
        ? `Apply this instruct to every other "${roleCodeFor(row)}" row in this bucket (${count})`
        : "No other rows in this bucket use this role";
}
function applyInstructToSameRole(row) {
    const count = sameRoleCount(row);
    if (!count) return;
    const code = roleCodeFor(row);
    const instruct = entryFor(row).instruct;
    rows.value.forEach((r) => {
        if (r !== row && r.status !== "unsupported" && roleCodeFor(r) === code) {
            entryFor(r).instruct = instruct;
        }
    });
    scheduleSave();
    status.value = `Applied instruct to ${count} other "${code}" row(s) in this bucket`;
}

/*
 "Apply this Role to every other row sharing the same Identifier" -- the
 game's own csv `speaker` tag (e.g. "Ellie") and a project's curated role
 codes (e.g. "emma") are deliberately NOT auto-matched (see
 nodes/vo_dub_library.py's module docstring -- a raw tag isn't reliably
 the same character everywhere), so assigning a role to ONE row would
 otherwise do nothing for the hundreds of other rows sharing its exact
 same Identifier. This is still a manual, one-click-per-tag action, not
 automated matching -- it just makes the manual work scale per TAG
 instead of per ROW.
*/
function sameIdentifierCount(row) {
    const tag = (row.speaker_tag || "").trim();
    if (!tag) return 0;
    return rows.value.filter((r) => r !== row && r.status !== "unsupported" && (r.speaker_tag || "").trim() === tag).length;
}
function applyRoleTitle(row) {
    const count = sameIdentifierCount(row);
    return count > 0
        ? `Apply this Role to every other "${row.speaker_tag}" row in this bucket (${count})`
        : "No other rows in this bucket share this Identifier";
}
function applyRoleToSameIdentifier(row) {
    const count = sameIdentifierCount(row);
    if (!count) return;
    const tag = (row.speaker_tag || "").trim();
    const value = entryFor(row).speaker_override || row.speaker_tag;
    rows.value.forEach((r) => {
        if (r !== row && r.status !== "unsupported" && (r.speaker_tag || "").trim() === tag) {
            entryFor(r).speaker_override = value;
        }
    });
    scheduleSave();
    status.value = `Applied Role to ${count} other "${tag}" row(s) in this bucket`;
}

function rawAudioPath(dir, audioKey) {
    return joinPath(joinPath(props.root, dir), `${audioKey}.wav`);
}
function audioUrl(dir, audioKey, cacheBust) {
    const url = `${SCAN_API}/audio?path=${encodeURIComponent(rawAudioPath(dir, audioKey))}`;
    /*
     A just-rendered take overwrites the SAME filename a moment-old
     browser cache entry (or a prior "file not found") might already
     hold for -- the render is a `?v=` cache-buster, not the browser's
     normal reload, so this only changes right after this row's own
     render completes.
    */
    return cacheBust ? `${url}&v=${cacheBust}` : url;
}
function ruFilePath(row) {
    return rawAudioPath("audio_ru", row.audio_key);
}
/*
 The pre-effect reference copy audio_post_process.py's own
 dry_output_path_override writes on every render -- lets applyEffectToFile
 reprocess THIS file instead of re-running the whole TTS graph just to
 change which Effect is baked in. See nodes/vo_dub_library.py's own
 AUDIO_DRY_DIRNAME comment for why it lives outside audio_ru/ itself.
*/
function dryFilePath(row) {
    return rawAudioPath("_dub_dry", row.audio_key);
}

/*
 A one-off, single-file measurement (used only right after THIS row's
 own render) -- distinct from the list's players, which stay
 preload="none" so nothing is fetched in bulk just because a row is on
 screen. Resolves null rather than rejecting on any failure (a slow/
 stalled load, a decode error): a missing duration just means the badge
 doesn't show yet, never something worth failing the whole render over.
*/
function measureDuration(url, timeoutMs = 8000) {
    return new Promise((resolve) => {
        const el = new Audio();
        let settled = false;
        const finish = (value) => {
            if (settled) return;
            settled = true;
            el.removeEventListener("loadedmetadata", onLoaded);
            el.removeEventListener("error", onError);
            resolve(value);
        };
        const onLoaded = () => finish(el.duration || null);
        const onError = () => finish(null);
        el.addEventListener("loadedmetadata", onLoaded);
        el.addEventListener("error", onError);
        setTimeout(() => finish(null), timeoutMs);
        el.preload = "metadata";
        el.src = url;
    });
}

function hasRuTake(row) {
    return row.status === "done" || row.status === "stale" || renderedOnce.has(row.audio_key);
}

/*
 A manual "this take is good enough" override -- reads DONE even if the
 row's own content hash has since drifted (e.g. a trivial text tweak the
 user doesn't care to re-render for), mirroring
 nodes/vo_dub_library.py's compute_row_status(manually_marked_done=...)
 exactly. Sticky until unchecked -- editing the row further does NOT
 clear it on its own; that's a deliberate choice by whoever ticked it,
 same as a real checkbox.
*/
function manuallyDone(row) {
    return Boolean(entryFor(row).manually_done);
}
function toggleManuallyDone(row) {
    entryFor(row).manually_done = !manuallyDone(row);
    onTextEdit(row);
}

/*
 Measured live from the RU <audio> element once its metadata loads --
 deliberately NOT trusted from _dub_state.json's own rendered_duration_s
 alone, since a file could be dropped into audio_ru/ by hand (or by a
 render) without that field ever being stamped.
*/
const measuredDuration = reactive({});
function onRuMetadata(row, event) {
    measuredDuration[row.audio_key] = event.target.duration;
}

/*
 ── native <audio controls> per track (EN + RU) ──────────────────────────
 Reverted back to the SAME native player every other editor in this
 addon uses (LineEditorApp.vue's own rows included) -- a previous round
 replaced this with a bespoke waveform-driven player (custom progress
 bar, custom play/pause, click-to-seek) and re-invented several bugs the
 native element never had (a play/pause icon that flickered during
 buffering, a track that didn't restart from 0 after ending, a progress
 bar that could desync). guardAgainstUnbufferedPlay/effect preview/
 Play-both/duration measurement/sequential playback all still act on
 these same real elements -- only the bespoke transport chrome is gone.
*/
const enAudioEls = new Map(); // audio_key -> the EN <audio> DOM node
const ruAudioEls = new Map(); // audio_key -> the RU <audio> DOM node
function setEnAudioRef(key, el) {
    if (!el) { enAudioEls.delete(key); return; }
    enAudioEls.set(key, el);
    guardAgainstUnbufferedPlay(el);
}
/*
 audio_key -> {setEffect(name)} -- one per RU element, created once on
 mount (createEffectPreview wraps createMediaElementSource, which can
 only ever be called once per element) and torn down when the element
 unmounts (pagination, a filter change) so a later remount gets a fresh
 one for the new element instance.
*/
const effectPreviews = new Map();
function setRuAudioRef(row, el) {
    const key = row.audio_key;
    if (!el) { ruAudioEls.delete(key); effectPreviews.delete(key); return; }
    ruAudioEls.set(key, el);
    guardAgainstUnbufferedPlay(el);
    const preview = createEffectPreview(el);
    effectPreviews.set(key, preview);
    preview.setEffect(effectValue(row));
}

const dualPlayingRows = reactive(new Set());
const dualLoadingRows = reactive(new Set());
/*
 Clears the "both playing" indicator on EITHER track pausing/ending, for
 ANY reason -- the native controls, the other track finishing first, or
 Play-both itself -- so it never reads "still playing" once one side
 has actually stopped. Also the one place a RU track's own native pause
 interrupts an active sequential-playback run (see below) -- pausing
 mid-row via its own native controls, for any reason OTHER than
 reaching the end naturally, stops the whole run rather than fighting
 the action the user just took.
*/
function onTrackPaused(row, side) {
    dualPlayingRows.delete(row.audio_key);
    if (side === "ru" && sequentialPlayingKey.value === row.audio_key) {
        const el = ruAudioEls.get(row.audio_key);
        if (el && !el.ended) stopSequentialPlayback();
    }
}

async function playBoth(row) {
    const en = enAudioEls.get(row.audio_key);
    const ru = ruAudioEls.get(row.audio_key);
    if (!en || !ru) return;

    if (dualPlayingRows.has(row.audio_key) || dualLoadingRows.has(row.audio_key)) {
        dualLoadingRows.delete(row.audio_key);
        dualPlayingRows.delete(row.audio_key);
        en.pause();
        ru.pause();
        return;
    }

    en.pause();
    ru.pause();
    en.currentTime = 0;
    ru.currentTime = 0;
    dualLoadingRows.add(row.audio_key);
    await Promise.all([waitUntilBuffered(en), waitUntilBuffered(ru)]);
    dualLoadingRows.delete(row.audio_key);
    if (!enAudioEls.has(row.audio_key)) return; // row unmounted (paged away) while buffering
    /*
     Re-assert the start position AFTER buffering, not just before: a
     track whose src just changed (e.g. right after Save/apply_effect
     bumps its cache-buster) can silently drop a currentTime reset
     requested while it still had no metadata at all -- setting it again
     now, once genuinely ready, is what actually sticks.
    */
    en.currentTime = 0;
    ru.currentTime = 0;
    dualPlayingRows.add(row.audio_key);
    en.play().catch(() => {});
    ru.play().catch(() => {});
}

/*
 ── sequential playback through this page's RU takes ("Play in order") ──
 Mirrors LineEditorApp.vue's own "mode 1" sequential playback
 (playRowSequential/mode1PlayingIdx) exactly in spirit -- play one row's
 take, and when it ends, auto-advance to the next row that has one,
 skipping any that don't. The one deliberate difference: that mode plays
 a throwaway `new Audio()` per row (its rows have no native element at
 all before "Done"); VO Dub's rows already have real <audio> elements
 (needed for the buffering guard/effect preview/Play-both/duration
 measurement anyway), so this reuses THOSE via ruAudioEls instead of
 creating parallel ones.
*/
const sequentialPlayingKey = ref(null); // audio_key currently playing in the run, or null
let sequentialEndedListener = null; // {el, fn} of the currently-armed listener, so stopping can detach it cleanly

function stopSequentialPlayback() {
    if (sequentialEndedListener) {
        sequentialEndedListener.el.removeEventListener("ended", sequentialEndedListener.fn);
        sequentialEndedListener = null;
    }
    /*
     Clear the flag BEFORE calling .pause() below, not after: pause()
     synchronously fires this same element's own `pause` event, whose
     template handler (onTrackPaused) checks this SAME flag to decide
     whether a manual pause should stop the run -- if it's still set
     when that fires, onTrackPaused calls stopSequentialPlayback() again
     from inside this very call, which called .pause() again, forever.
    */
    const key = sequentialPlayingKey.value;
    sequentialPlayingKey.value = null;
    if (key) ruAudioEls.get(key)?.pause();
}

/*
 Scoped to the CURRENT PAGE, not the whole (possibly 617-row) bucket --
 rows outside it aren't even mounted, so there's nothing to scroll to or
 play. `startIndex` indexes into `pagedRows.value`.
*/
async function playSequentialFrom(startIndex) {
    stopSequentialPlayback();
    const list = pagedRows.value;
    let idx = startIndex;
    while (idx < list.length && !hasRuTake(list[idx])) idx++;
    if (idx >= list.length) return;
    const row = list[idx];
    const el = ruAudioEls.get(row.audio_key);
    if (!el) return;
    sequentialPlayingKey.value = row.audio_key;
    rowEls.get(row.audio_key)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    await waitUntilBuffered(el);
    if (sequentialPlayingKey.value !== row.audio_key) return; // stopped (or paged away) while buffering
    const onEnded = () => {
        el.removeEventListener("ended", onEnded);
        sequentialEndedListener = null;
        playSequentialFrom(idx + 1);
    };
    sequentialEndedListener = { el, fn: onEnded };
    el.addEventListener("ended", onEnded);
    el.currentTime = 0;
    el.play().catch(() => {});
}

function toggleSequentialPlayback() {
    if (sequentialPlayingKey.value) stopSequentialPlayback();
    else playSequentialFrom(0);
}

/*
 audio_key -> this row's own root DOM element -- only needed for the
 sequential run's own scrollIntoView (see above), same purpose
 LineEditorApp.vue's own rowEls Map serves for mode 1's scroll-to.
*/
const rowEls = new Map();
function setRowRef(key, el) {
    if (!el) { rowEls.delete(key); return; }
    rowEls.set(key, el);
}

/*
 A row this editor itself has successfully rendered SINCE loading,
 ahead of the next loadRows() refresh actually confirming it server-side
 -- without this, hasRuTake(row) still reads the STALE "not_started"
 status for the few seconds between the render finishing and that
 refresh landing, so the player/badge wouldn't show up at all despite
 the file already sitting on disk.
*/
const renderedOnce = reactive(new Set());
/*
 Per-row cache-bust token so the RU <audio> element's `src` actually
 changes after a re-render of the SAME filename -- without this the
 browser can keep serving whatever it cached for that exact URL
 (including a cached 404 for a row that had no take before).
*/
const cacheBust = reactive({});
const renderingKeys = reactive(new Set());

/*
 Shared tail of "this row's RU file just changed on disk" -- called by
 BOTH a full render and the fast effect-only reprocess below. Measures
 the file THIS action just wrote (not the list-wide preloading the
 "none" players stay clear of), stamps the matching hash into
 _dub_state.json, and refreshes the cache-buster so the RU <audio>
 element's `src` actually re-fetches the new bytes at the same filename.
*/
async function finalizeRuTake(row, hash) {
    const freshCacheBust = Date.now();
    const renderedDuration = await measureDuration(audioUrl("audio_ru", row.audio_key, freshCacheBust));
    await fetch(`${VO_DUB_API}/mark_rendered`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            root: props.root, audio_key: row.audio_key, hash,
            duration_s: renderedDuration,
        }),
    });
    if (renderedDuration !== null) measuredDuration[row.audio_key] = renderedDuration;
    renderedOnce.add(row.audio_key);
    cacheBust[row.audio_key] = freshCacheBust;
}

/*
 Folds a row's speaker/instruct/text/effect/use-original-as-sample into
 the SAME hash formula nodes/vo_dub_library.py's row_hash() uses --
 shared by renderRow and applyEffectToFile so both stamp an IDENTICAL
 hash for identical content, regardless of which path actually produced
 the file.
*/
async function currentContentHash(row) {
    const entry = entryFor(row);
    const speaker = row.speaker; // already resolved server-side (override or raw csv tag)
    const instruct = entry.instruct || "";
    const russianText = entry.russian_text || "";
    const effect = entry.effect || "";
    /*
     Folded into the SAME instruct field the hash already covers,
     exactly mirroring nodes/vo_dub_library.py's row_hash() -- lineHash()
     itself stays untouched (a strict 3-arg contract with the
     audiobook's own filename scheme, see src/shared/line_hash.js).
    */
    let instructForHash = instruct;
    if (effect) instructForHash += `\x00effect=${effect}`;
    if (resolvedUseOriginal(row)) instructForHash += "\x00sample=original";
    return lineHash(speaker, instructForHash, russianText);
}

async function renderRow(row) {
    if (!props.renderApi || renderingKeys.has(row.audio_key)) return;
    renderingKeys.add(row.audio_key);
    status.value = `Rendering ${row.audio_key}...`;
    try {
        /*
         A pending (previewed-but-not-yet-saved) effect becomes official
         NOW -- the file this is about to write will reflect exactly
         whatever's currently selected, so it can't stay "just a preview"
         past this point.
        */
        commitEffect(row);
        /*
         Whatever's still sitting in the save debounce must land on disk
         BEFORE rendering: mark_rendered stamps the hash of these LIVE
         fields, but the next loadRows() recomputes ITS comparison hash
         from whatever _dub_state.json actually holds -- if that's still
         the pre-edit text, the row reads "stale" the instant it finishes
         rendering the CURRENT text.
        */
        clearTimeout(saveTimer);
        await flushSave();

        const entry = entryFor(row);
        const speaker = row.speaker;
        const instruct = entry.instruct || "";
        const russianText = entry.russian_text || "";
        const effect = entry.effect || "";
        const referenceAudioPath = resolvedUseOriginal(row) ? rawAudioPath("audio_en", row.audio_key) : "";
        const hash = await currentContentHash(row);
        const outputPath = ruFilePath(row);
        const dryOutputPath = dryFilePath(row);

        await props.renderApi.renderRow({
            audioKey: row.audio_key, speaker, instruct, russianText, effect, outputPath, dryOutputPath, referenceAudioPath,
        });

        entry.hash = hash;
        await finalizeRuTake(row, hash);
        status.value = `Rendered ${row.audio_key}`;
        await loadRows();
    } catch (e) {
        status.value = `Render failed for ${row.audio_key}: ${e}`;
    } finally {
        renderingKeys.delete(row.audio_key);
    }
}

/*
 Mirrors ScriptLibraryPanel.vue's own "🔁 Re-voice pending" button
 (revoiceAllPending) almost exactly: every row in THIS bucket (the whole
 bucket, not just the current page or the active search/status filter --
 same project-wide scope that button has, just bounded to one bucket
 instead of one project) that needs_started/is stale gets rendered, one
 at a time, awaited in sequence -- deliberately not concurrent, for the
 same reason that button's own comment gives: flooding ComfyUI's queue
 with dozens of heavy TTS renders at once helps nobody. renderRow()
 itself never throws (it catches its own errors into `status`), so the
 try/catch here is only a defensive backstop, not the normal path.
*/
const isRenderingAllPending = ref(false);
async function renderAllPending() {
    if (!props.renderApi || isRenderingAllPending.value) return;
    const pending = rows.value.filter((r) => r.status === "not_started" || r.status === "stale");
    if (!pending.length) {
        status.value = "Nothing needs rendering in this bucket";
        return;
    }
    isRenderingAllPending.value = true;
    let done = 0;
    status.value = `Rendering 0/${pending.length}...`;
    try {
        for (const row of pending) {
            try {
                await renderRow(row);
            } catch (err) {
                console.error(`[FL CosyVoice3 VODubEditor] render-all-pending failed for ${row.audio_key}`, err);
            }
            done++;
            status.value = `Rendering ${done}/${pending.length}...`;
        }
    } finally {
        isRenderingAllPending.value = false;
    }
}

/*
 The fast path: reprocesses the row's own DRY (pre-effect) reference
 copy with whatever Effect is now saved -- no TTS re-synthesis, no full
 graph run, just a lightweight backend call (see
 nodes/vo_dub_library.py's /vo_dub/apply_effect). Only reachable once a
 dry take actually exists (a real render has happened at least once
 since this addon started writing them) -- see saveEffect's own guard.
*/
async function applyEffectToFile(row) {
    status.value = `Applying effect to ${row.audio_key}...`;
    try {
        const resp = await fetch(`${VO_DUB_API}/apply_effect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ root: props.root, audio_key: row.audio_key, effect: entryFor(row).effect || "" }),
        });
        const data = await resp.json();
        if (data.error) {
            status.value = `Couldn't apply effect to ${row.audio_key}: ${data.error}`;
            return;
        }
        const hash = await currentContentHash(row);
        entryFor(row).hash = hash;
        await finalizeRuTake(row, hash);
        status.value = `Applied effect to ${row.audio_key}`;
        await loadRows();
    } catch (e) {
        status.value = `Couldn't apply effect to ${row.audio_key}: ${e}`;
    }
}

/*
 Built as one JS string, not "EN<template v-if=...> {{ ... }}s</template>"
 -- that relied on a raw whitespace character inside inline template
 markup, which the compiler's whitespace handling silently swallowed
 ("EN3.3s", no space). A plain template-literal string has no such
 pitfall.
*/
function enDurationText(row) {
    return row.duration_s ? `EN ${row.duration_s.toFixed(1)}s` : "EN";
}

const DURATION_GREEN = 0.15;
const DURATION_AMBER = 0.40;
function durationBadge(row) {
    /*
     With preload="none", measuredDuration is only ever populated once
     the user has actually pressed play on this row's RU take -- before
     that, fall back to whatever _dub_state.json recorded the last time
     this addon itself rendered the row (mark_rendered's own
     duration_s), so the badge doesn't disappear entirely just because
     audio isn't preloaded any more.
    */
    const measured = measuredDuration[row.audio_key] ?? row.rendered_duration_s;
    const original = row.duration_s;
    if (!hasRuTake(row) || measured === undefined || measured === null || !original) return null;
    const delta = (measured - original) / original;
    const pct = Math.round(delta * 100);
    const abs = Math.abs(delta);
    const level = abs <= DURATION_GREEN ? "good" : abs <= DURATION_AMBER ? "warn" : "bad";
    /*
     Split into separate fields, not one run-on "4.4s vs 3.4s (+29%)"
     string -- EN's own duration is shown directly in the labels row
     (row.duration_s), so this only needs to carry RU's own measured
     length and how far it drifted.
    */
    return {
        level,
        ruSeconds: `${measured.toFixed(1)}s`,
        pctText: `${pct >= 0 ? "+" : ""}${pct}%`,
    };
}

onMounted(async () => {
    loadRoleEntries();
    loadInstructCategories();
    await loadState();
    await loadRows();
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
        class="vo-dub-editor-dialog"
    >
        <template #header>
            <DialogHeader
                :title="`VO Dub — ${bucket}`"
                :width-presets="widthPresets" :set-width="setPanelWidth"
                :font-size-decrease="decreaseFontSize" :font-size-increase="increaseFontSize"
            />
        </template>

        <!-- One StickyPanel, three stacked rows -- position:sticky's own
        top:0 means a SECOND sticky element right after this one would
        overlap it instead of stacking below (both stick to the same
        offset), so the actions row and pager both live inside this same
        sticky block rather than their own. Same 3-row split as
        LineEditorApp.vue's own audio-content-row/actions-row/(file nav is
        folded into actions-row there) -- filters here, then actions, then
        the pager -- rather than cramming everything into one row that
        wraps unpredictably at typical panel widths. -->
        <StickyPanel class="vo-dub-editor-controls">
            <div class="vo-dub-filters">
                <InputText v-model="searchText" placeholder="Search text or audio_key..." class="vo-dub-search" />
                <Dropdown
                    v-model="statusFilter"
                    :options="STATUS_FILTER_OPTIONS"
                    option-label="label"
                    option-value="value"
                    class="vo-dub-status-filter"
                />
                <Button icon="pi pi-refresh" text size="small" title="Re-scan this bucket" @click="loadRows" />
                <span class="vo-dub-editor-status">{{ loading ? "Loading..." : status }}</span>
                <Button icon="pi pi-times" text size="small" title="Close" @click="visible = false" />
            </div>
            <div class="actions-row">
                <Button label="´ Stress mark" text size="small" title="Insert a stress mark at the cursor: click into a row's text, place the cursor right after the vowel to stress (факел|ов), then click this" @mousedown.prevent="insertStressMark(setStatus)" />
                <span class="actions-divider" />
                <Button
                    :label="sequentialPlayingKey ? 'Stop' : '▶ Play in order'"
                    text size="small"
                    :icon="sequentialPlayingKey ? 'pi pi-stop-circle' : 'pi pi-play'"
                    title="Play through this page's RU takes in order, auto-advancing to the next row with a take when each one ends -- mirrors LineEditorApp.vue's own sequential playback. Pausing a row via its own native controls stops the run instead of continuing past it."
                    @click="toggleSequentialPlayback"
                />
                <Button
                    :label="isRenderingAllPending ? 'Rendering...' : '🔁 Render pending'"
                    text size="small"
                    :icon="isRenderingAllPending ? 'pi pi-spin pi-spinner' : 'pi pi-play'"
                    :disabled="!props.renderApi || isRenderingAllPending"
                    title="Render every not-started or stale row in this WHOLE bucket (not just this page), one at a time -- mirrors ScriptLibraryPanel.vue's own '🔁 Re-voice pending' button."
                    @click="renderAllPending"
                />
                <span class="actions-divider" />
                <label class="vo-dub-original-default-label" title="Project-wide default for the per-row 'Use original as sample' checkbox below each line -- a row that has ticked/unticked its OWN checkbox always keeps that explicit choice regardless of this default.">
                    <Checkbox v-model="useOriginalDefault" binary @change="onToggleUseOriginalDefault" />
                    Use original as sample by default
                </label>
            </div>
            <div class="vo-dub-pager">
                <Button label="◀ Prev" text size="small" :disabled="currentPage === 0" title="Previous page" @click="currentPage--" />
                <span class="vo-dub-pager-label">Page {{ currentPage + 1 }} / {{ pageCount }} ({{ visibleRows.length }} row(s))</span>
                <Button label="Next ▶" text size="small" :disabled="currentPage >= pageCount - 1" title="Next page" @click="currentPage++" />
            </div>
        </StickyPanel>

        <div class="vo-dub-rows" :style="{ fontSize: `${fontSizePx}px` }">
            <div
                v-for="row in pagedRows" :key="row.audio_key"
                class="vo-dub-row"
                :class="{ 'row-playing': sequentialPlayingKey === row.audio_key }"
                :ref="(el) => setRowRef(row.audio_key, el)"
            >
                <div class="vo-dub-row-head">
                    <span class="vo-dub-key">{{ row.audio_key }}</span>
                    <span :class="['vo-dub-status-pill', `status-${row.status}`]">{{ STATUS_LABELS[row.status] }}</span>
                    <Button
                        v-if="hasRuTake(row)"
                        class="vo-dub-done-btn"
                        :class="{ active: manuallyDone(row) }"
                        text size="small"
                        :icon="manuallyDone(row) ? 'pi pi-check-circle' : 'pi pi-circle'"
                        :label="manuallyDone(row) ? 'Done' : 'Mark done'"
                        title="Manually treat this row as done even if its content has drifted since the last render -- sticky until you click it again to unmark it. Doesn't touch the file or the render hash, only how this row's status reads."
                        @click="toggleManuallyDone(row)"
                    />
                </div>

                <!-- Multi-channel rows (3/4ch, split into .a-.d segment files --
                see nodes/vo_dub_library.py's SUPPORTED_CHANNELS) have no flat
                "<audio_key>.wav" to play OR write: this addon can only ever
                produce/serve a single mono or stereo file. Neither player nor
                the render button would do anything but fail confusingly, so
                this row gets an explanation instead of a silently broken UI. -->
                <div v-if="row.status === 'unsupported'" class="vo-dub-unsupported-note">
                    Unsupported: {{ row.channels }}-channel audio split across multiple files
                    (<code>.a</code>-<code>.d</code>) -- this editor can only play or render a single mono/stereo
                    file per row. Handle this one outside the tool.
                </div>
                <template v-else>
                <div class="vo-dub-players">
                    <!-- ONE left-aligned line: "EN 0.4s vs 0.4s RU -57%" --
                    not split across the row (tried, rejected: see the plan
                    file's progress notes). -->
                    <div class="vo-dub-players-labels">
                        <span class="vo-dub-duration-en-tag">{{ enDurationText(row) }}</span>
                        <template v-if="durationBadge(row)">
                            <span class="vo-dub-duration-vs">vs</span>
                            <span :class="['vo-dub-duration-tag', `badge-${durationBadge(row).level}`]">{{ durationBadge(row).ruSeconds }} RU</span>
                            <span :class="['vo-dub-duration-delta', `badge-${durationBadge(row).level}`]">{{ durationBadge(row).pctText }}</span>
                        </template>
                    </div>

                    <div class="vo-dub-players-row">
                        <div class="vo-dub-player">
                            <!-- Purely visual overview above the native
                            player -- decodes+draws eagerly on mount (the
                            one deliberate exception to "fetch nothing
                            until played"); the native element below stays
                            preload="none" regardless, so ACTUAL playback
                            is still fully lazy. guardAgainstUnbufferedPlay
                            (see setEnAudioRef) protects the native play
                            button from clipping the first fraction of a
                            second once pressed. -->
                            <WaveformCanvas :src="audioUrl('audio_en', row.audio_key)" class="vo-dub-waveform" />
                            <audio
                                controls preload="none"
                                :src="audioUrl('audio_en', row.audio_key)"
                                :ref="(el) => setEnAudioRef(row.audio_key, el)"
                                @pause="onTrackPaused(row, 'en')"
                                @ended="onTrackPaused(row, 'en')"
                            />
                        </div>

                        <!-- The one genuinely new command neither native
                        player offers on its own (see playBoth's own
                        comment) -- not a re-skin of play/pause/seek,
                        which stay exactly what the native controls already
                        provide. Centered between the two players, not
                        grouped with Render/Effect below -- those two are
                        about the FILE, this one's about listening to it. -->
                        <Button
                            class="play-both-btn"
                            :class="{ playing: dualPlayingRows.has(row.audio_key) }"
                            size="small"
                            label="Play both"
                            :icon="dualLoadingRows.has(row.audio_key) ? 'pi pi-spin pi-spinner' : (dualPlayingRows.has(row.audio_key) ? 'pi pi-pause' : 'pi pi-play')"
                            :disabled="!hasRuTake(row)"
                            :title="hasRuTake(row) ? 'Play EN and RU together, from the start' : 'No RU take yet -- nothing to compare'"
                            @click="playBoth(row)"
                        />

                        <div class="vo-dub-player">
                            <WaveformCanvas v-if="hasRuTake(row)" :src="audioUrl('audio_ru', row.audio_key, cacheBust[row.audio_key])" class="vo-dub-waveform" />
                            <audio
                                v-if="hasRuTake(row)"
                                controls preload="none"
                                :src="audioUrl('audio_ru', row.audio_key, cacheBust[row.audio_key])"
                                :ref="(el) => setRuAudioRef(row, el)"
                                @loadedmetadata="onRuMetadata(row, $event)"
                                @pause="onTrackPaused(row, 'ru')"
                                @ended="onTrackPaused(row, 'ru')"
                            />
                            <span v-else class="vo-dub-no-take">not rendered yet</span>
                        </div>
                    </div>

                    <!-- Render/Re-render and Effect (+ its Save button, once
                    dirty) on their own row, left-aligned -- both act on the
                    FILE this row writes, distinct from Play both above
                    (which only ever plays what's already there). -->
                    <div class="vo-dub-players-footer">
                        <Button
                            v-if="props.renderApi"
                            class="vo-dub-render-btn"
                            :class="{ stale: row.status === 'stale' }"
                            size="small"
                            :label="hasRuTake(row) ? 'Re-render' : 'Render'"
                            :icon="renderingKeys.has(row.audio_key) ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
                            :disabled="renderingKeys.has(row.audio_key)"
                            :title="hasRuTake(row) ? 'Re-render this row and write it to audio_ru\\' : 'Render this row and write it to audio_ru\\'"
                            @click="renderRow(row)"
                        />
                        <Dropdown
                            :model-value="effectValue(row)"
                            :options="EFFECT_OPTIONS"
                            option-label="label"
                            option-value="value"
                            class="vo-dub-effect-select"
                            title="Effect -- previews INSTANTLY on the RU take above (no re-render, no save) until you click Save or Render/Re-render"
                            @update:model-value="onEffectPicked(row, $event)"
                        />
                        <Button
                            v-if="effectIsDirty(row)"
                            icon="pi pi-save"
                            size="small"
                            class="vo-dub-effect-save-btn"
                            title="Save this Effect choice (does not re-render the file by itself -- Render/Re-render still needs a click to actually bake it in)"
                            @click="saveEffect(row)"
                        />
                    </div>
                </div>

                <LineRowEditor
                    :speaker="entryFor(row).speaker_override || row.speaker_tag"
                    :role-entries="roleEntries"
                    :role-option-sub-label="roleOptionSubLabel"
                    speaker-placeholder="Role"
                    speaker-title="Role code (resolves to that role's assigned voice), or a literal preset/preset#tag"
                    :role-info-code="roleCodeFor(row)"
                    :instruct="entryFor(row).instruct"
                    :can-undo-instruct="prevInstruct[row.audio_key] !== undefined"
                    :undo-instruct-title="undoInstructTitle(row)"
                    :can-apply-instruct="sameRoleCount(row) > 0"
                    :apply-instruct-title="applyInstructTitle(row)"
                    :instruct-note="instructNoteFor(row)"
                    :text="entryFor(row).russian_text"
                    text-placeholder="Russian text for this line"
                    :font-size-px="fontSizePx"
                    :textarea-ref="(el) => setTextareaRef(row.audio_key, el)"
                    :on-auto-grow="autoGrow"
                    @update:speaker="entryFor(row).speaker_override = $event; onTextEdit(row)"
                    @update:instruct="entryFor(row).instruct = $event; onTextEdit(row); scheduleInstructLibrarySave(row)"
                    @update:text="entryFor(row).russian_text = $event; onTextEdit(row)"
                    @open-instruct-picker="openInstructPicker(row)"
                    @undo-instruct="undoInstruct(row)"
                    @apply-instruct="applyInstructToSameRole(row)"
                    @role-info-enter="showRoleInfoPopover"
                    @role-info-leave="hideRoleInfoPopover"
                >
                    <template #leading>
                        <span
                            class="vo-dub-identifier"
                            title="Identifier extracted from the game's own resources (vo_dataset.csv's speaker column) -- not necessarily a real role, just the raw signal this row's audio_key carried"
                        >{{ row.speaker_tag || "—" }}</span>
                        <Button
                            icon="pi pi-copy"
                            size="small"
                            class="apply-role-btn"
                            :disabled="sameIdentifierCount(row) === 0"
                            :title="applyRoleTitle(row)"
                            @click="applyRoleToSameIdentifier(row)"
                        />
                        <label
                            class="vo-dub-use-original-label"
                            title="Use this row's own EN reference take (audio_en\) as the TTS voice-cloning sample for its NEXT render, instead of the Role above -- unticked follows the project-wide default checkbox in the toolbar unless this row's own box has been explicitly touched. Whether an instruct style can still apply together with this depends on your ComfyUI graph/model -- this addon just passes the resolved reference_audio_path through, it doesn't wire it to a specific node."
                        >
                            <Checkbox
                                :model-value="resolvedUseOriginal(row)"
                                binary
                                @update:model-value="onToggleRowUseOriginal(row, $event)"
                            />
                            🎙️ Original as sample
                        </label>
                    </template>
                    <template #above-text>
                        <div class="vo-dub-english">{{ row.english }}</div>
                    </template>
                </LineRowEditor>
                </template>
            </div>

            <div v-if="!visibleRows.length" class="vo-dub-empty">No rows match this filter.</div>
        </div>
    </Dialog>

    <InstructPickerDialog
        v-model:visible="instructPickerVisible"
        :categories="instructCategories"
        @select="onInstructPicked"
    />

    <RoleInfoPopover
        :visible="roleInfoPopover.visible" :left="roleInfoPopover.left" :top="roleInfoPopover.top"
        :message="roleInfoFields.message" :fields="roleInfoFields.fields"
    />
</template>

<style scoped src="../style/VoDubLineEditor.css"></style>
