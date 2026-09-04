// Full-screen, per-line script editor for FL CosyVoice3 Script Library.
// Parses a "preset | instruct | text" file into one row per line, each with
// its own speaker input, instruct input (with a catalog picker from
// _instructions.json -- {text, note} entries, no per-role filtering), a
// wrapped textarea for the spoken text, and a 🗑 delete control. Rows merge
// via drag-and-drop (drag one row's handle onto another) instead of a
// button -- see mergeRows(). Edits save to disk (debounced) via the same
// generic endpoints FL CosyVoice3 Script Editor uses, and the file is
// polled for external changes.
//
// Voicing works per-line, not per-script, until the script is marked ✅
// Done -- see the big mode-1/mode-2 comment near the top of
// openLineEditor() for the full picture: each row tracks its own stable
// id + voice status (reconcileState), addressing its own
// _audio\lines\<script>\id<N>.wav directly, so merging/deleting/
// splitting/reordering lines never desyncs anything the way relying on a
// single script-wide timing manifest used to. "Done" is what actually
// stitches everything into one final file (stitch_lines).
import { openFloatingPanel, openConfirmDialog, iconButton } from "./ui_kit.js";
import { injectStyles } from "./styles.js";
import {
    joinPath, stripSuffixAndExt, dirOf, markRoleStale,
    SCRIPT_EDITOR_API as FILE_API, SCRIPT_LIBRARY_API as SCAN_API, SPEAKER_PRESETS_API as PRESETS_API,
} from "./fl_common.js";

const SAVE_DEBOUNCE_MS = 600;
const POLL_MS = 3000;
const EDIT_QUIET_MS = 1500;
const DEFAULT_PANEL_WIDTH = 1600;
const WIDTH_PRESETS = [1280, 1600];
const DEFAULT_TEXT_FONT_SIZE = 11.5; // matches .fl-textarea's own default in styles.js
const MIN_TEXT_FONT_SIZE = 9;
const MAX_TEXT_FONT_SIZE = 22;
const LS_WIDTH_KEY = "FL_CosyVoice3.LineEditor.widthPx";
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
    try {
        localStorage.setItem(key, String(value));
    } catch (e) {
        /* localStorage unavailable -- persistence just won't work this session */
    }
}

// Editor width is either a px number or the sentinel "full" (94vw, no cap) --
// loadNum/saveNum above assume a plain float, so this key gets its own pair.
function loadWidthPref() {
    try {
        const raw = localStorage.getItem(LS_WIDTH_KEY);
        if (raw === "full") return "full";
        const v = parseFloat(raw);
        return Number.isFinite(v) ? v : DEFAULT_PANEL_WIDTH;
    } catch (e) {
        return DEFAULT_PANEL_WIDTH;
    }
}

function saveWidthPref(value) {
    try {
        localStorage.setItem(LS_WIDTH_KEY, String(value));
    } catch (e) {
        /* localStorage unavailable -- persistence just won't work this session */
    }
}

function parseLine(line) {
    const parts = line.split("|");
    if (parts.length !== 3) return null;
    return { speaker: parts[0].trim(), instruct: parts[1].trim(), text: parts[2].trim() };
}

function parseScript(content) {
    return content
        .split("\n")
        .map((raw) => raw.replace(/\r$/, ""))
        .filter((line) => line.trim())
        .map((line) => {
            const parsed = parseLine(line);
            return parsed
                ? { ...parsed, raw: line, malformed: false }
                : { raw: line, malformed: true };
        });
}

function serializeRows(rows) {
    return rows
        .map((r) => (r.malformed ? r.raw : `${r.speaker} | ${r.instruct} | ${r.text}`))
        .join("\n");
}

// Stable, cheap hash -> hue, so each distinct speaker gets a consistent
// accent color across the whole editor (helps the eye group consecutive
// lines by speaker at a glance, like a subtitle/transcript tool would).
function speakerAccent(name) {
    if (!name) return "rgba(255,255,255,0.15)";
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    const hue = hash % 360;
    return `hsl(${hue}, 55%, 55%)`;
}

/**
 * @param {Object} opts
 * @param {string} opts.folder - absolute path to the act folder containing filename.
 * @param {string} opts.filename
 * @param {string} [opts.suffix] - script_filter, passed through to the catalog scan (roles/instructions) and used to derive the audio file's base name.
 * @param {Object} [opts.checkedApi] - {isChecked(fname), setChecked(fname, val)} backing the header checkbox against Script Library's own "checked for queueing" set for this act. Omit to disable the checkbox.
 * @param {Object} [opts.revoiceApi] - {revoiceLine({lineId, speaker, instruct, text}) => Promise} backing each row's "🔁 Re-voice this line" button. Omit to hide it entirely.
 */
export function openLineEditor({ folder, filename, suffix = "_speakers.txt", checkedApi, revoiceApi }) {
    injectStyles();
    let fullPath = joinPath(folder, filename);
    const audioFolder = joinPath(folder, "_audio");
    let audioBaseName = stripSuffixAndExt(filename, suffix);
    let scriptList = [];

    let rows = [];
    let instructionEntries = [];
    let roleEntries = [];
    let rolesJsonPath = null; // resolved _roles.json path (project root) -- from /scan, needed to write role.speaker changes back
    let presets = []; // saved CosyVoice speaker presets -- for the "change this role's speaker" picker
    let readyScripts = []; // filenames marked done/ready-to-release in this act -- from _ready.json
    let lastSavedText = null;
    let lastSavedStatePayload = null; // last _state.json content actually written -- flushSave() diffs against this
    let nextLineId = 1; // next fresh stable line id to hand out (add/split/reconcile) -- see reconcileState
    let lastLocalEditAt = 0;
    let saveTimer = null;
    let pollTimer = null;
    let audioPollTimer = null;
    let timingPollTimer = null;
    let closed = false;

    // --- two playback/editing modes, switched by the script's ✅ Done state:
    //
    // MODE 1 (not ready -- normal working state): each row's own audio
    // lives in its own file (_audio\lines\<base>\id<N>.wav, N = that row's
    // STABLE id, independent of its position in the script -- see
    // reconcileState). ▶ just plays that one file directly; clicking it
    // plays every VOICED row from there on, back to back (see
    // playRowSequential). 🔁 is available on every row regardless of
    // whether it's ever been voiced. Nothing here depends on a script-wide
    // timing manifest, so merging/deleting/splitting/reordering lines
    // never desyncs anything -- there IS no shared position to desync.
    //
    // MODE 2 (ready -- after ✅ Done): "Done" stitches every line's file
    // into one final track (see stitch_lines) and writes a timing manifest
    // next to it, and THAT'S what the mini player + per-row ▶ use from
    // then on (exactly like before this redesign) -- valid by construction
    // since a fresh stitch just happened. To edit further, unmark Done
    // first (drops back to mode 1).
    let rawTimingLines = null; // last-fetched manifest's "lines" array, unvalidated
    let lastTimingMtime = null;
    let lineTiming = null; // mode 2 only: { lines, rowIndexMap } once validated against `rows`, else null
    let currentRowToTimingIdx = new Map(); // row-array index -> lineTiming.lines index, rebuilt every render()
    let timingRowEls = []; // lineTiming.lines index -> that row's DOM element, rebuilt every render()
    let timingPlayBtns = []; // lineTiming.lines index -> that row's ▶ button, rebuilt every render()
    let lastActiveTimingIdx = -1;
    let audioEl = null; // mode 2: the <audio> element loadAudio() most recently built, or null
    let audioIsPlaying = false;

    // Mode 1 playback: a lightweight, standalone <audio> (not the mini
    // player's audioEl) that plays one row's own per-line file, then
    // advances to the next voiced row on "ended" -- see playRowSequential.
    let rowEls = []; // row-array index -> that row's DOM element, rebuilt every render()
    let mode1AudioEl = null;
    let mode1PlayingIdx = -1;

    // Rows (by object reference -- stable across render() unless the file
    // is reloaded wholesale) with a "🔁 Re-voice this line" request
    // in flight. Survives re-renders that happen for unrelated reasons
    // while one is pending (buildRow checks this set fresh every time), so
    // its spinner state never gets silently lost. Multiple lines can be
    // pending at once -- only submission is serialized (see
    // web/script_library.js's queueLineRevoice), not the wait.
    const pendingRevoiceRows = new Set();
    let dragFromIndex = null;
    let textFontSizePx = loadNum(LS_FONT_KEY, DEFAULT_TEXT_FONT_SIZE);

    // Resolves a row's speaker field (a role CODE from _roles.json, or a raw
    // preset/preset#tag typed directly) down to the actual .pt file name
    // Speaker Instruct2 Dialog will load -- mirrors
    // nodes/script_library.py's role_map_from_entries + resolve_roles (role
    // code -> speaker) and speaker_instruct2_dialog.py's
    // preset.split("#",1)[0] + ".pt" (the "#tag" suffix is an
    // authoring-only convenience, never part of the real file name).
    function resolveSpeakerFile(code) {
        if (!code) return "";
        const entry = roleEntries.find((e) => e.code === code);
        const preset = entry && entry.speaker ? entry.speaker : code;
        const base = String(preset).split("#", 1)[0].trim();
        return base ? `${base}.pt` : "";
    }

    // Instant hover popover for the "ℹ" button next to each row's speaker
    // field -- every field _roles.json has for that role code, one per
    // styled row (not a flat native-title string), so the user can
    // sanity-check a role (name/speaker/description/whatever else the JSON
    // carries) without opening the roles editor. Generic over whatever
    // fields the JSON actually carries rather than a hardcoded list, so it
    // never goes stale as _roles.json's shape grows. A single shared
    // element (not one per row) since only one can be hovered at a time.
    let roleInfoPopoverEl = null;
    function hideRoleInfoPopover() {
        if (roleInfoPopoverEl) {
            roleInfoPopoverEl.remove();
            roleInfoPopoverEl = null;
        }
    }
    function showRoleInfoPopover(anchorEl, code) {
        hideRoleInfoPopover();
        const pop = document.createElement("div");
        pop.className = "fl-float-panel fl-role-popover";
        const rect = anchorEl.getBoundingClientRect();
        pop.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
        pop.style.top = `${rect.bottom + 4}px`;
        pop.style.width = "260px";

        const entry = roleEntries.find((e) => e.code === code);
        const fields = entry
            ? Object.entries(entry).filter(([, v]) => v !== "" && v !== null && v !== undefined)
            : [];
        if (!code) {
            pop.textContent = "No speaker set on this line yet";
        } else if (!entry) {
            pop.textContent = `"${code}" is not a role code in _roles.json -- used directly as a preset name`;
        } else if (!fields.length) {
            pop.textContent = `"${code}" has no fields set in _roles.json`;
        } else {
            fields.forEach(([k, v]) => {
                const fieldRow = document.createElement("div");
                fieldRow.className = "fl-role-popover-row";
                const key = document.createElement("span");
                key.className = "fl-role-popover-key";
                key.textContent = k;
                const value = document.createElement("span");
                value.className = "fl-role-popover-value";
                value.textContent = v;
                fieldRow.appendChild(key);
                fieldRow.appendChild(value);
                pop.appendChild(fieldRow);
            });
        }
        document.body.appendChild(pop);
        roleInfoPopoverEl = pop;
    }

    // ▶ = can play from here, ⏸ = this is the line currently playing.
    function setPlayGlyph(btn, playing) {
        if (!btn) return;
        btn.textContent = playing ? "⏸" : "▶";
        btn.style.color = playing ? "#e0b030" : "#4caf50";
    }

    // Reverse index for the "change this role's speaker" picker: preset name
    // -> role codes currently assigned to it, so re-casting a role shows
    // what else is already using a given voice instead of picking blind.
    function speakerUsageIndex() {
        const usage = {};
        roleEntries.forEach((r) => {
            const preset = String(r.speaker || "").split("#", 1)[0].trim();
            if (!preset || !r.code) return;
            (usage[preset] = usage[preset] || []).push(r.code);
        });
        return usage;
    }

    // Persists roleEntries back to _roles.json -- the single source of
    // truth every script's role codes resolve against (see
    // nodes/script_library.py's resolve_roles), so this reassigns a role's
    // voice for the WHOLE project, not just the line currently open.
    async function saveRolesJson() {
        if (!rolesJsonPath) {
            setStatus("No _roles.json found for this project -- can't save");
            return false;
        }
        try {
            const resp = await fetch(`${FILE_API}/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: rolesJsonPath, content: JSON.stringify({ roles: roleEntries }, null, 2) }),
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

    // Recasting a role changes what EVERY line using that role code
    // resolves to, project-wide -- not just the lines visible in this one
    // open script. Marks every already-voiced line using `roleCode` stale
    // in whichever script(s) it appears in (any act), un-readying + wiping
    // the final file for any of them that was marked ✅ Done (a frozen
    // "done" file that no longer matches one of its lines' actual voice
    // isn't valid any more) -- see nodes/script_library.py's
    // mark_role_stale. If THIS open script was one of them, reload its
    // state/ready flag/audio right away instead of waiting for the next
    // poll tick.
    async function notifyRoleSpeakerChanged(roleCode) {
        if (!rolesJsonPath) return;
        const root = dirOf(rolesJsonPath);
        const result = await markRoleStale(root, roleCode, suffix);
        setStatus(result.message);
        if (result.changed.some((c) => c.file === filename) || result.untracked.some((c) => c.file === filename)) {
            await loadAndReconcileState();
            await loadCatalog(); // picks up readyScripts in case this script just got un-readied server-side
            lastAudioFingerprint = null;
            lastTimingMtime = null;
            loadAudio();
            loadTiming();
        }
    }

    // MODE 2 ONLY: validates a fetched timing manifest against the CURRENT
    // `rows` before trusting it for anything -- malformed/raw rows are
    // skipped (Dialog never synthesizes them either, so they're not in the
    // manifest). Requires only that the COUNT of real (non-malformed) rows
    // still matches the manifest's line count: that's what makes "row N is
    // at script position N" reliable. Valid by construction right after a
    // ✅ Done stitch (see stitch_lines) -- mode 2 is only ever entered
    // right after one, and further editing is meant to unmark Done first
    // (dropping back to mode 1) rather than editing "on top of" a frozen
    // final file.
    function computeLineTiming(rawLines, rowsArr) {
        if (!Array.isArray(rawLines) || !rawLines.length) return null;
        const rowIndexMap = [];
        rowsArr.forEach((r, idx) => {
            if (!r.malformed) rowIndexMap.push(idx);
        });
        if (rowIndexMap.length !== rawLines.length) return null;
        return { lines: rawLines, rowIndexMap };
    }

    function linesDirPath() {
        return joinPath(joinPath(audioFolder, "lines"), audioBaseName);
    }

    function stateFilePath() {
        return joinPath(linesDirPath(), "_state.json");
    }

    function currentStatePayload() {
        return JSON.stringify({
            next_id: nextLineId,
            lines: rows.filter((r) => !r.malformed).map((r) => ({ id: r.id, text: r.text, status: r.status })),
        }, null, 2);
    }

    // Assigns each CURRENT (non-malformed) row a stable `id` + a voice
    // `status` ("unvoiced" | "voiced" | "stale"), reconciled against the
    // last-saved _state.json. This is what makes mode 1 immune to
    // merge/delete/split/reorder desyncing anything: a row's own audio
    // file is addressed by ITS id, never by array position.
    //
    // Fast path: row count unchanged since the save -> match by position
    // (matches this file's own in-session bookkeeping, which already keeps
    // ids/status correct through every edit operation -- see mergeRows,
    // splitBtn, addRowBtn, deleteBtn, and the speaker/instruct/text input
    // handlers in buildRow). A text mismatch here means something changed
    // the file outside this exact reconciliation (e.g. a fresh page load,
    // or a hand-edit) -- downgrade voiced/stale to stale/unvoiced rather
    // than trust a status that might not describe the CURRENT text.
    //
    // Fallback: row count changed (or this is the very first load with a
    // pre-existing _state.json) -- recover ids for every row whose text is
    // UNCHANGED by matching on exact text content (in script order, so
    // repeated identical lines each claim a distinct saved entry). Only
    // the row(s) actually touched by the structural edit (new/merged/split
    // text) come up unmatched and get a fresh id + "unvoiced".
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
            const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(stateFilePath())}`);
            const data = await resp.json();
            if (data.exists) {
                rawContent = data.content;
                try {
                    saved = JSON.parse(data.content);
                } catch (e) {
                    saved = null;
                }
            }
        } catch (e) {
            saved = null;
        }
        nextLineId = reconcileState(rows, saved);
        // Baseline against what's actually ON DISK (not the just-reconciled
        // result) so the next flushSave() persists the reconciliation for
        // real instead of silently believing it already happened.
        lastSavedStatePayload = rawContent;
    }

    function allRowsVoiced() {
        const nonMalformed = rows.filter((r) => !r.malformed);
        return nonMalformed.length > 0 && nonMalformed.every((r) => r.status === "voiced");
    }

    // Marks a previously-voiced row as needing re-voice -- called on any
    // edit to what actually gets synthesized (text, speaker, or instruct;
    // see nodes/script_library.py's line_override, which is exactly
    // "speaker | instruct | text"). "unvoiced" rows have no audio to go
    // stale, so they stay "unvoiced".
    function markRowEdited(row) {
        if (row.status === "voiced") row.status = "stale";
    }

    // --- mode 1 sequential playback: plays one row's own per-line file,
    // then the next VOICED/STALE row (skipping ones with no audio at all),
    // and so on -- "просто читаем все строки последовательно". Entirely
    // separate from the mini player's audioEl (mode 2). ---
    function stopMode1Playback() {
        if (mode1AudioEl) {
            mode1AudioEl.pause();
            mode1AudioEl.src = "";
            mode1AudioEl = null;
        }
        if (mode1PlayingIdx >= 0 && rowEls[mode1PlayingIdx]) {
            rowEls[mode1PlayingIdx].classList.remove("fl-row-playing");
            setPlayGlyph(rowEls[mode1PlayingIdx].querySelector(".fl-play-btn"), false);
        }
        mode1PlayingIdx = -1;
    }

    function playRowSequential(startIndex) {
        stopMode1Playback();
        const dir = linesDirPath();
        const playIdx = (idx) => {
            while (idx < rows.length && (rows[idx].malformed || rows[idx].status === "unvoiced")) idx++;
            if (idx >= rows.length) {
                mode1PlayingIdx = -1;
                return;
            }
            mode1PlayingIdx = idx;
            const row = rows[idx];
            const el = new Audio(`${SCAN_API}/audio?path=${encodeURIComponent(joinPath(dir, `id${row.id}.wav`))}&v=${Date.now()}`);
            mode1AudioEl = el;
            if (rowEls[idx]) {
                rowEls[idx].classList.add("fl-row-playing");
                setPlayGlyph(rowEls[idx].querySelector(".fl-play-btn"), true);
            }
            el.addEventListener("ended", () => {
                if (rowEls[idx]) {
                    rowEls[idx].classList.remove("fl-row-playing");
                    setPlayGlyph(rowEls[idx].querySelector(".fl-play-btn"), false);
                }
                playIdx(idx + 1);
            });
            el.play().catch((e) => setStatus(`Playback failed: ${e}`));
        };
        playIdx(startIndex);
    }

    // Sets the ▶/⏸ glyph on whichever row is currently "active" (see
    // syncActiveLine) -- separate from syncActiveLine itself because play/
    // pause/ended need to flip the glyph without re-deciding WHICH line is
    // active.
    function updateActivePlayIcon() {
        if (lastActiveTimingIdx >= 0) {
            setPlayGlyph(timingPlayBtns[lastActiveTimingIdx], audioIsPlaying);
        }
    }

    // Figures out which line audioEl.currentTime falls in (if any), moves
    // the "now playing" highlight + auto-scroll there, and updates the
    // ▶/⏸ glyphs. Called on every audio timeupdate tick AND right after
    // every render() (so a mid-edit rebuild doesn't lose the highlight).
    function syncActiveLine() {
        if (!lineTiming || !audioEl) {
            if (lastActiveTimingIdx >= 0 && timingRowEls[lastActiveTimingIdx]) {
                timingRowEls[lastActiveTimingIdx].classList.remove("fl-row-playing");
            }
            lastActiveTimingIdx = -1;
            return;
        }
        const t = audioEl.currentTime;
        let activeIdx = -1;
        for (let i = 0; i < lineTiming.lines.length; i++) {
            if (t >= lineTiming.lines[i].start && t < lineTiming.lines[i].end) {
                activeIdx = i;
                break;
            }
        }
        if (activeIdx === lastActiveTimingIdx) {
            updateActivePlayIcon();
            return;
        }
        if (lastActiveTimingIdx >= 0) {
            if (timingRowEls[lastActiveTimingIdx]) timingRowEls[lastActiveTimingIdx].classList.remove("fl-row-playing");
            setPlayGlyph(timingPlayBtns[lastActiveTimingIdx], false);
        }
        lastActiveTimingIdx = activeIdx;
        if (activeIdx >= 0 && timingRowEls[activeIdx]) {
            timingRowEls[activeIdx].classList.add("fl-row-playing");
            // Only auto-scroll while actually playing -- render() re-syncs
            // this on every rebuild (speaker change, add/split line, timing
            // reload, ...), and audioEl.currentTime can still land inside a
            // line's [start,end) range while paused (e.g. sitting at 0 with
            // nothing played yet), which used to yank the view to that row
            // any time something unrelated triggered a re-render.
            if (audioIsPlaying) {
                timingRowEls[activeIdx].scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }
        updateActivePlayIcon();
    }

    // Fetches _audio\timing\<script base>.json (written by FL CosyVoice3
    // Audio Post-Process). silent=true (background poll) skips re-parsing
    // when the file's mtime hasn't changed, so it doesn't fight an
    // in-progress edit every poll tick for no reason.
    async function loadTiming({ silent = false } = {}) {
        const timingPath = joinPath(joinPath(audioFolder, "timing"), `${audioBaseName}.json`);
        try {
            const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(timingPath)}`);
            const data = await resp.json();
            if (!data.exists) {
                if (rawTimingLines !== null) {
                    rawTimingLines = null;
                    lastTimingMtime = null;
                    render();
                }
                return;
            }
            if (silent && data.mtime === lastTimingMtime) return;
            const isFreshMtime = data.mtime !== lastTimingMtime;
            lastTimingMtime = data.mtime;
            let parsed;
            try {
                parsed = JSON.parse(data.content);
            } catch (e) {
                rawTimingLines = null;
                render();
                return;
            }
            rawTimingLines = Array.isArray(parsed.lines) ? parsed.lines : null;

            // A genuinely NEW manifest whose line count matches the current
            // script looks like a FULL render that just finished (Dialog +
            // Post-Process processed every current row, in order) -- adopt
            // its per-line files into the stable-id scheme mode 1 relies on
            // (see commitFullRenderIfNeeded/commit_full_render) so 🔁/▶
            // light up for every line without the user doing anything.
            const nonMalformed = rows.filter((r) => !r.malformed);
            if (isFreshMtime && rawTimingLines && rawTimingLines.length === nonMalformed.length && nonMalformed.length > 0) {
                await commitFullRenderIfNeeded(nonMalformed);
            }
            render(); // recomputes lineTiming + toggles timingWarningEl as a side effect
        } catch (e) {
            // Transient fetch error -- leave whatever timing state we already had.
        }
    }

    // See loadTiming above -- converts a just-finished full render's
    // positional per-line files to id<N>.wav and marks every row "voiced",
    // so mode 1's 🔁/▶ work immediately after a normal full-script queue
    // run, not just after per-line re-voicing.
    async function commitFullRenderIfNeeded(nonMalformedRows) {
        try {
            const resp = await fetch(`${SCAN_API}/commit_full_render`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folder,
                    base_name: audioBaseName,
                    row_texts: nonMalformedRows.map((r) => r.text),
                    row_ids: nonMalformedRows.map((r) => (Number.isFinite(r.id) ? r.id : null)),
                }),
            });
            const data = await resp.json();
            if (data.error || !Array.isArray(data.ids)) return;
            // This call is speculative (see loadTiming above) and often a
            // no-op once every line is already on the id<N>.wav scheme --
            // only mark a row "voiced" when ITS file was actually just
            // renamed (committed_ids), never blindly for every row, or a
            // redundant re-check would stomp a row's genuine "stale"
            // status (edited after the real commit already happened)
            // back to "voiced".
            const committed = new Set(data.committed_ids || []);
            nonMalformedRows.forEach((r, i) => {
                r.id = data.ids[i];
                if (committed.has(data.ids[i])) r.status = "voiced";
            });
            if (Number.isFinite(data.next_id)) nextLineId = Math.max(nextLineId, data.next_id);
            if (committed.size) flushSave();
        } catch (e) {
            // Best-effort -- a transient failure here just leaves these
            // rows showing "unvoiced" until the next full render (or a
            // per-line 🔁, which doesn't depend on this at all).
        }
    }

    // Non-modal: no dark backdrop, and clicks outside the panel fall through
    // to the graph underneath, so the user can keep this window open while
    // working the canvas (drag nodes, queue prompts, etc.) instead of it
    // blocking the whole screen like a normal dialog.
    const overlay = document.createElement("div");
    overlay.className = "fl-overlay fl-overlay-floating";

    const panel = document.createElement("div");
    panel.className = "fl-panel";
    function widthCss(value) {
        return value === "full" ? "94vw" : `min(94vw, ${value}px)`;
    }
    panel.style.cssText = `width:${widthCss(loadWidthPref())};height:92vh;`;
    function setPanelWidth(value) {
        panel.style.width = widthCss(value);
        saveWidthPref(value);
    }

    const header = document.createElement("div");
    header.className = "fl-panel-header";

    const selectCheckbox = document.createElement("input");
    selectCheckbox.type = "checkbox";
    selectCheckbox.title = "Mark this script as checked for queueing (Script Library's tree)";
    selectCheckbox.style.cssText = "flex:0 0 auto;cursor:pointer;";
    if (!checkedApi) selectCheckbox.disabled = true;
    function refreshCheckbox() {
        if (checkedApi) selectCheckbox.checked = checkedApi.isChecked(filename);
    }
    selectCheckbox.addEventListener("change", () => {
        if (checkedApi) checkedApi.setChecked(filename, selectCheckbox.checked);
    });
    refreshCheckbox();

    // --- ✅ Done: marks this script ready to release. Persisted
    // server-side in <act folder>/_ready.json (nodes/script_library.py's
    // scripts_ready / set_script_ready) so it shows as a green checkmark
    // back in Script Library's tree, which also refuses to keep a ready
    // script checked for queueing -- mirrored here by disabling/unchecking
    // selectCheckbox and the delete-audio button (see below) while ready.
    const doneBtn = iconButton("✅ Done", "");
    function isCurrentlyReady() {
        return readyScripts.includes(filename);
    }
    function updateDoneUi() {
        const ready = isCurrentlyReady();
        const canMarkReady = allRowsVoiced();
        doneBtn.classList.toggle("fl-btn-done-active", ready);
        doneBtn.disabled = !ready && !canMarkReady;
        doneBtn.title = ready
            ? "Marked ready to release -- click to unmark and go back to editing"
            : canMarkReady
            ? "Stitch every line into the final file and mark this script done / ready to release"
            : "Every line needs to be voiced (🔁) first";
        selectCheckbox.disabled = !checkedApi || ready;
        if (ready) selectCheckbox.checked = false;
        updateDeleteAudioUi();
    }
    doneBtn.addEventListener("click", async () => {
        const newReady = !isCurrentlyReady();
        if (newReady && !allRowsVoiced()) {
            setStatus("Every line needs to be voiced (🔁) before marking done");
            return;
        }
        if (newReady) {
            setStatus("Stitching final file...");
            const nonMalformed = rows.filter((r) => !r.malformed);
            try {
                const stitchResp = await fetch(`${SCAN_API}/stitch_lines`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        folder,
                        base_name: audioBaseName,
                        line_ids: nonMalformed.map((r) => r.id),
                        line_texts: nonMalformed.map((r) => r.text),
                    }),
                });
                const stitchData = await stitchResp.json();
                if (stitchData.error) {
                    setStatus(`Stitch error: ${stitchData.error}`);
                    return;
                }
            } catch (e) {
                setStatus(`Stitch failed: ${e}`);
                return;
            }
        }
        try {
            const resp = await fetch(`${SCAN_API}/set_ready`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder, filename, ready: newReady }),
            });
            const data = await resp.json();
            if (data.error) {
                setStatus(`Error: ${data.error}`);
                return;
            }
            readyScripts = data.ready_scripts || [];
            if (newReady && checkedApi) checkedApi.setChecked(filename, false);
            updateDoneUi();
            render(); // switches every row between mode 1 / mode 2
            if (newReady) {
                lastAudioFingerprint = null;
                lastTimingMtime = null;
                loadAudio(); // pick up the freshly stitched file right away
                loadTiming();
            }
            setStatus(newReady ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again");
        } catch (e) {
            setStatus(`Error: ${e}`);
        }
    });

    const titleEl = document.createElement("div");
    titleEl.textContent = filename;
    titleEl.style.cssText = "font-weight:600;font-size:14px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

    const statusEl = document.createElement("div");
    statusEl.className = "fl-status";
    statusEl.style.flex = "0 0 auto";

    // "Display" cluster: window width and text font size are both "how
    // this window looks", grouped together here (Design Guideline --
    // Layout > Best practices: "group related items... provide enough
    // space around them and group them in logical sections") -- font size
    // used to live in the actions row below, mixed in with line-editing
    // tools it has nothing to do with.
    const widthRow = document.createElement("div");
    widthRow.style.cssText = "display:flex;gap:3px;flex:0 0 auto;";
    WIDTH_PRESETS.forEach((px) => {
        const btn = document.createElement("button");
        btn.className = "fl-btn fl-btn-icon";
        btn.style.fontSize = "10px";
        btn.textContent = String(px);
        btn.title = `Set editor width to ${px}px (capped to the window's width)`;
        btn.addEventListener("click", () => setPanelWidth(px));
        widthRow.appendChild(btn);
    });
    const fullWidthBtn = document.createElement("button");
    fullWidthBtn.className = "fl-btn fl-btn-icon";
    fullWidthBtn.style.fontSize = "10px";
    fullWidthBtn.textContent = "100%";
    fullWidthBtn.title = "Use the full available window width";
    fullWidthBtn.addEventListener("click", () => setPanelWidth("full"));
    widthRow.appendChild(fullWidthBtn);

    // --- text font size: applies ONLY to the spoken-text textareas
    // (.fl-textarea inside a row), never to speaker/instruct inputs or any
    // other chrome. Persisted so it survives closing and reopening the
    // editor. ---
    function applyTextFontSize() {
        rowsContainer.querySelectorAll(".fl-textarea").forEach((ta) => {
            ta.style.fontSize = `${textFontSizePx}px`;
            autoGrow(ta); // a bigger font needs a taller box -- the old height is now stale
        });
    }
    const fontMinusBtn = iconButton("A−", "Decrease line text font size");
    const fontPlusBtn = iconButton("A+", "Increase line text font size");
    fontMinusBtn.addEventListener("click", () => {
        textFontSizePx = Math.max(MIN_TEXT_FONT_SIZE, textFontSizePx - 1);
        saveNum(LS_FONT_KEY, textFontSizePx);
        applyTextFontSize();
    });
    fontPlusBtn.addEventListener("click", () => {
        textFontSizePx = Math.min(MAX_TEXT_FONT_SIZE, textFontSizePx + 1);
        saveNum(LS_FONT_KEY, textFontSizePx);
        applyTextFontSize();
    });
    const fontSizeRow = document.createElement("div");
    fontSizeRow.style.cssText = "display:flex;gap:3px;flex:0 0 auto;margin-left:10px;";
    fontSizeRow.appendChild(fontMinusBtn);
    fontSizeRow.appendChild(fontPlusBtn);

    const closeBtn = document.createElement("button");
    closeBtn.className = "fl-btn fl-btn-plain fl-btn-round";
    closeBtn.textContent = "✕";
    closeBtn.title = "Close";

    header.appendChild(selectCheckbox);
    header.appendChild(doneBtn);
    header.appendChild(titleEl);
    header.appendChild(statusEl);
    header.appendChild(widthRow);
    header.appendChild(fontSizeRow);
    header.appendChild(closeBtn);

    // --- mini audio player: looks in <act folder>\_audio\ for a file whose
    // name starts with this script's base name (no script_filter suffix, no
    // extension -- see stripSuffixAndExt), since a Save Audio node's
    // filename_prefix produces names like "<base>_00001_.flac" -- an exact
    // match is never guaranteed, so this matches by prefix and picks the
    // alphabetically-last hit (the highest counter, i.e. the latest take). ---
    // Outer wrapper: the mini player row (fully rebuilt by loadAudio on
    // every refresh) plus timingWarningEl, which must survive those
    // rebuilds untouched -- appended once, below, never wiped.
    const audioRow = document.createElement("div");
    audioRow.style.cssText = "display:flex;flex-direction:column;flex:0 0 auto;border-bottom:1px solid rgba(255,255,255,0.08);";

    const audioContentRow = document.createElement("div");
    audioContentRow.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 16px;flex:0 0 auto;";

    const audioPlaceholder = document.createElement("div");
    audioPlaceholder.className = "fl-status";
    audioPlaceholder.textContent = "Checking for audio...";
    audioPlaceholder.style.flex = "1";

    const audioRefreshBtn = iconButton("🔄", "Re-check _audio\\ for this script's rendered audio");
    audioRefreshBtn.style.flex = "0 0 auto";

    // Deletes every _audio\ file matching this script's base name (same
    // prefix match as detection below) -- for clearing out a take before
    // re-rendering. Blocked (both here and server-side) while the script is
    // marked ready to release.
    const deleteAudioBtn = iconButton("🗑 Delete audio", "");
    deleteAudioBtn.style.flex = "0 0 auto";

    let lastAudioFilename = null; // last-seen "best" match's plain name -- for the label/delete confirm
    let lastAudioFingerprint = null; // "<filename>::<mtime>" -- lets silent polling skip a rebuild only when TRULY nothing changed
    function updateDeleteAudioUi() {
        const ready = isCurrentlyReady();
        deleteAudioBtn.disabled = !lastAudioFilename || ready;
        deleteAudioBtn.title = ready
            ? "Marked ready to release -- unmark it (✅ Done) before deleting audio"
            : "Delete the rendered audio for this script";
    }
    deleteAudioBtn.addEventListener("click", async () => {
        if (!lastAudioFilename || isCurrentlyReady()) return;
        const ok = await openConfirmDialog({
            title: "Delete rendered audio?",
            message: `Deletes every _audio\\ file matching "${audioBaseName}" (currently: ${lastAudioFilename}).`,
            okText: "Delete",
            cancelText: "Cancel",
        });
        if (!ok) return;
        try {
            const resp = await fetch(`${SCAN_API}/delete_audio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder, base_name: audioBaseName, filename }),
            });
            const data = await resp.json();
            if (data.error) {
                setStatus(`Error: ${data.error}`);
                return;
            }
            setStatus(`Deleted ${data.deleted.length} audio file(s)`);
            lastAudioFilename = null;
            lastAudioFingerprint = null;
            loadAudio();
        } catch (e) {
            setStatus(`Error: ${e}`);
        }
    });

    audioContentRow.appendChild(audioPlaceholder);
    audioContentRow.appendChild(audioRefreshBtn);

    // silent=true is used by the background poll below: it skips the
    // "Checking..." flicker and, if the resolved file hasn't actually
    // changed, skips rebuilding the DOM entirely so an in-progress playback
    // isn't interrupted every poll tick.
    async function loadAudio({ silent = false } = {}) {
        if (!silent) {
            audioContentRow.innerHTML = "";
            audioPlaceholder.textContent = "Checking for audio...";
            audioContentRow.appendChild(audioPlaceholder);
            audioContentRow.appendChild(audioRefreshBtn);
        }
        try {
            const resp = await fetch(`/fl_cosyvoice3/browse/list_dir?path=${encodeURIComponent(audioFolder)}`);
            const data = await resp.json();
            const files = Array.isArray(data.files) ? data.files : [];
            const mtimes = data.file_mtimes || {};
            const needle = audioBaseName.toLowerCase();
            const matches = files.filter((f) => {
                const dot = f.lastIndexOf(".");
                const base = dot > 0 ? f.slice(0, dot) : f;
                return base.toLowerCase().startsWith(needle);
            });
            matches.sort();
            const best = matches.length ? matches[matches.length - 1] : null;
            // Include mtime, not just the filename: a deleted-then-re-rendered
            // take can land on the exact same name (ComfyUI's Save Audio
            // counter starts over once no matching files remain), which a
            // filename-only check would wrongly call "unchanged".
            const fingerprint = best ? `${best}::${mtimes[best] || ""}` : null;

            if (silent && fingerprint === lastAudioFingerprint) return;
            lastAudioFingerprint = fingerprint;
            lastAudioFilename = best;

            audioContentRow.innerHTML = "";
            if (best) {
                audioEl = document.createElement("audio");
                audioEl.controls = true;
                audioEl.style.cssText = "flex:1;height:32px;";
                // Cache-bust: the browser caches media responses by URL, and
                // without this an <audio> element would keep playing stale
                // cached bytes for a filename that got deleted and
                // re-rendered under the same name (see fingerprint above).
                const cacheBust = encodeURIComponent(mtimes[best] || Date.now());
                audioEl.src = `${SCAN_API}/audio?path=${encodeURIComponent(joinPath(audioFolder, best))}&v=${cacheBust}`;
                audioIsPlaying = false;
                audioEl.addEventListener("timeupdate", syncActiveLine);
                audioEl.addEventListener("play", () => {
                    audioIsPlaying = true;
                    updateActivePlayIcon();
                });
                audioEl.addEventListener("pause", () => {
                    audioIsPlaying = false;
                    updateActivePlayIcon();
                });
                audioEl.addEventListener("ended", () => {
                    audioIsPlaying = false;
                    updateActivePlayIcon();
                });
                const label = document.createElement("div");
                label.className = "fl-status";
                label.textContent = best;
                label.style.cssText = "flex:0 0 auto;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
                audioContentRow.appendChild(label);
                audioContentRow.appendChild(audioEl);
                audioContentRow.appendChild(deleteAudioBtn);
            } else {
                audioEl = null;
                syncActiveLine();
                audioPlaceholder.textContent = `No audio yet in ${audioFolder}`;
                audioContentRow.appendChild(audioPlaceholder);
            }
            audioContentRow.appendChild(audioRefreshBtn);
            updateDeleteAudioUi();
        } catch (e) {
            audioContentRow.innerHTML = "";
            audioPlaceholder.textContent = `Audio check failed: ${e}`;
            audioContentRow.appendChild(audioPlaceholder);
            audioContentRow.appendChild(audioRefreshBtn);
        }
    }
    audioRefreshBtn.addEventListener("click", () => loadAudio());
    audioRow.appendChild(audioContentRow);

    // --- actions panel (below the player): script-wide tools that aren't
    // tied to any one row. ---
    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = "display:flex;gap:6px;align-items:center;padding:6px 16px;border-bottom:1px solid rgba(255,255,255,0.08);flex:0 0 auto;";

    // Inserts a combining acute accent (U+0301) at the cursor position of
    // whatever text field was last focused -- place the cursor right after
    // the vowel to mark (e.g. "фа|келов", cursor between а and к) and click
    // this to get "фа́келов". Uses mousedown+preventDefault (not click)
    // because a plain click on a <button> steals focus from the textarea
    // in Chromium before any click handler runs, which would leave
    // document.activeElement pointing at the button instead.
    const stressBtn = document.createElement("button");
    stressBtn.className = "fl-btn fl-btn-icon";
    stressBtn.textContent = "´ Stress mark";
    stressBtn.title = "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this";
    stressBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const el = document.activeElement;
        if (!el || (el.tagName !== "TEXTAREA" && el.tagName !== "INPUT") || !panel.contains(el)) {
            setStatus("Click into a line's text first, place the cursor right after the vowel to stress");
            return;
        }
        const pos = el.selectionStart;
        el.value = el.value.slice(0, pos) + "\u0301" + el.value.slice(pos);
        el.selectionStart = el.selectionEnd = pos + 1;
        el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    actionsRow.appendChild(stressBtn);

    // --- split line: cuts the focused line's text in two at the cursor --
    // text before the cursor stays on this row, text after becomes a brand
    // new row right below it (same speaker/instruct, since it's presumably
    // the same character continuing). Same "click into text, place cursor,
    // then click this" pattern as the stress-mark button above. The new
    // row gets the same grow+fade-in entrance as "+ Add line". ---
    const splitBtn = document.createElement("button");
    splitBtn.className = "fl-btn fl-btn-icon";
    splitBtn.textContent = "✂ Split line";
    splitBtn.title = "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this";
    splitBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const el = document.activeElement;
        if (!el || el.tagName !== "TEXTAREA" || !el.classList.contains("fl-textarea") || !panel.contains(el)) {
            setStatus("Click into a line's text first, place the cursor where it should split");
            return;
        }
        const rowEl = el.closest(".fl-line-row");
        const index = rowEl ? Array.from(rowsContainer.children).indexOf(rowEl) : -1;
        const row = index >= 0 ? rows[index] : null;
        if (!row || row.malformed) {
            setStatus("Can't split a malformed/raw line -- fix it to plain text first");
            return;
        }
        const pos = el.selectionStart;
        const before = row.text.slice(0, pos).trimEnd();
        const after = row.text.slice(pos).trimStart();
        row.text = before;
        // Neither half's text matches what row's audio (if any) was
        // rendered for -- row keeps its id but needs re-voicing, and the
        // new second half never had audio at all.
        row.status = "unvoiced";
        rows.splice(index + 1, 0, {
            speaker: row.speaker, instruct: row.instruct, text: after, raw: "", malformed: false,
            id: nextLineId++, status: "unvoiced",
        });
        render(index + 1);
        scheduleSave();
    });
    actionsRow.appendChild(splitBtn);

    // --- add line: appends a new empty row at the end and animates it into
    // place (grow + fade-in, see .fl-row-enter in styles.js) so it's obvious
    // a new line just appeared rather than the list silently redrawing --
    // then focuses its speaker field so typing can start immediately. ---
    const addRowBtn = iconButton("+ Add line", "Add a new empty line at the end of the script");
    addRowBtn.addEventListener("click", () => {
        rows.push({ speaker: "", instruct: "", text: "", raw: "", malformed: false, id: nextLineId++, status: "unvoiced" });
        render(rows.length - 1);
        scheduleSave();
    });
    actionsRow.appendChild(addRowBtn);

    // Separates "edit the focused line" (stress/split/add, left) from
    // "switch to a different script" (Prev/Next, right) -- two unrelated
    // concerns that used to just run together in one undifferentiated row
    // (Design Guideline -- Layout > Best practices: "group related items...
    // ensure content and controls remain clearly distinct").
    const actionsDivider = document.createElement("div");
    actionsDivider.style.cssText = "width:1px;align-self:stretch;background:rgba(255,255,255,0.12);margin:0 4px;flex:0 0 auto;";
    actionsRow.appendChild(actionsDivider);

    // --- prev/next: cycle through this act's other scripts (same folder,
    // same suffix filter, same order as Script Library's own tree --
    // scriptList comes from the /scan call loadCatalog() already makes)
    // without closing the editor. ---
    const prevBtn = iconButton("◀ Prev", "Open the previous script in this act");
    const nextBtn = iconButton("Next ▶", "Open the next script in this act");
    function updateNavState() {
        const idx = scriptList.indexOf(filename);
        prevBtn.disabled = !(idx > 0);
        nextBtn.disabled = !(idx >= 0 && idx < scriptList.length - 1);
    }
    prevBtn.addEventListener("click", () => {
        const idx = scriptList.indexOf(filename);
        if (idx > 0) switchToFile(scriptList[idx - 1]);
    });
    nextBtn.addEventListener("click", () => {
        const idx = scriptList.indexOf(filename);
        if (idx >= 0 && idx < scriptList.length - 1) switchToFile(scriptList[idx + 1]);
    });
    actionsRow.appendChild(prevBtn);
    actionsRow.appendChild(nextBtn);

    // MODE 2 ONLY (see the mode-1/mode-2 comment near the top of
    // openLineEditor): persistent (not a transient status-line message,
    // which loadFromDisk's own "Loaded N line(s)" tends to race and
    // overwrite within milliseconds) note for when the frozen final
    // file's timing manifest doesn't line up with the script any more --
    // shouldn't normally happen (Done always stitches fresh right before
    // freezing), but shown just in case rather than silently mis-syncing.
    // Mode 1 has no equivalent: each row's own status (see
    // updateRevoiceStale) already says everything there is to say about
    // that row, without needing a script-wide warning.
    const timingWarningEl = document.createElement("div");
    timingWarningEl.className = "fl-status";
    timingWarningEl.style.cssText = "color:#e0a030;display:none;width:100%;flex:0 0 100%;";
    timingWarningEl.textContent = "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер";
    audioRow.appendChild(timingWarningEl);

    const rowsContainer = document.createElement("div");
    rowsContainer.style.cssText = "flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:3px;";

    panel.appendChild(header);
    panel.appendChild(audioRow);
    panel.appendChild(actionsRow);
    panel.appendChild(rowsContainer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function close() {
        if (closed) return;
        closed = true;
        if (saveTimer) {
            clearTimeout(saveTimer);
            flushSave();
        }
        if (pollTimer) clearInterval(pollTimer);
        if (audioPollTimer) clearInterval(audioPollTimer);
        if (timingPollTimer) clearInterval(timingPollTimer);
        document.removeEventListener("keydown", onKeydown);
        overlay.remove();
    }

    function onKeydown(e) {
        if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeydown);
    closeBtn.addEventListener("click", close);

    function scheduleSave() {
        lastLocalEditAt = Date.now();
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
    }

    async function flushSave() {
        const text = serializeRows(rows);
        const statePayload = currentStatePayload();
        const textChanged = text !== lastSavedText;
        const stateChanged = statePayload !== lastSavedStatePayload;
        if (!textChanged && !stateChanged) return;
        try {
            if (textChanged) {
                const resp = await fetch(`${FILE_API}/write`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: fullPath, content: text }),
                });
                const data = await resp.json();
                if (data.error) {
                    setStatus(`Save error: ${data.error}`);
                    return;
                }
                lastSavedText = text;
            }
            if (stateChanged) {
                await fetch(`${FILE_API}/write`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: stateFilePath(), content: statePayload }),
                });
                lastSavedStatePayload = statePayload;
            }
            setStatus(`Saved ${new Date().toLocaleTimeString()}`);
        } catch (e) {
            setStatus(`Save failed: ${e}`);
        }
    }

    function autoGrow(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Merges two non-malformed rows into the one at the LOWER index
    // (whichever comes first in reading order), regardless of which was
    // dragged onto which -- that keeps the result predictable no matter
    // the drag direction. Confirms first if the two rows' speakers differ.
    async function mergeRows(idxA, idxB) {
        const rowA = rows[idxA];
        const rowB = rows[idxB];
        if (!rowA || !rowB || rowA.malformed || rowB.malformed) return;

        const firstIdx = Math.min(idxA, idxB);
        const secondIdx = Math.max(idxA, idxB);
        const first = rows[firstIdx];
        const second = rows[secondIdx];

        if ((first.speaker || "").trim() !== (second.speaker || "").trim()) {
            const ok = await openConfirmDialog({
                title: "Merge lines with different speakers?",
                message: `"${first.speaker}" and "${second.speaker}" are different speakers. `
                    + `Merge anyway? The combined line keeps "${first.speaker}".`,
                okText: "Merge",
                cancelText: "Cancel",
            });
            if (!ok) return;
        }

        first.text = `${first.text} ${second.text}`.trim();
        // The combined text has never been voiced -- first keeps its id
        // (its file gets overwritten once re-voiced), second's id/file is
        // just discarded along with the row.
        first.status = "unvoiced";
        rows.splice(secondIdx, 1);
        render();
        scheduleSave();
    }

    function clearDragIndicators() {
        rowsContainer.querySelectorAll(".fl-row-drop-target").forEach((el) => el.classList.remove("fl-row-drop-target"));
        rowsContainer.querySelectorAll(".fl-row-dragging").forEach((el) => el.classList.remove("fl-row-dragging"));
    }

    // Plain pointer-event drag (not native HTML5 drag-and-drop): dragstart/
    // dragover/drop require the browser's own OS-level drag gesture
    // recognition, which turned out unreliable in practice here. Tracking
    // pointerdown -> pointermove -> pointerup ourselves and locating the
    // element under the cursor via elementFromPoint is more predictable
    // and works the same way everywhere.
    function attachDragHandlers(rowEl, handleEl, index) {
        rowEl.classList.add("fl-line-row");
        rowEl.dataset.rowIndex = String(index);

        handleEl.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return; // primary mouse button / touch only
            e.preventDefault();
            dragFromIndex = index;
            rowEl.classList.add("fl-row-dragging");

            const onMove = (ev) => {
                rowsContainer.querySelectorAll(".fl-row-drop-target").forEach((el) => el.classList.remove("fl-row-drop-target"));
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
                clearDragIndicators();
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

    function buildRow(row, index) {
        const rowEl = document.createElement("div");
        rowEl.style.cssText =
            "display:flex;flex-direction:column;gap:4px;padding:6px 8px 6px 10px;border-radius:6px;" +
            "background:rgba(255,255,255,0.02);border-left:3px solid " + speakerAccent(row.malformed ? "" : row.speaker) + ";";

        if (row.malformed) {
            const warnLine = document.createElement("div");
            warnLine.style.cssText = "display:flex;align-items:center;gap:6px;";
            const warn = document.createElement("div");
            warn.textContent = "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:";
            warn.style.cssText = "font-size:10px;color:#e0a030;flex:1;";
            const deleteBtn = iconButton("🗑️", "Delete this line");
            deleteBtn.addEventListener("click", async () => {
                if (row.raw && row.raw.trim()) {
                    const ok = await openConfirmDialog({
                        title: "Delete this line?",
                        message: row.raw.length > 200 ? row.raw.slice(0, 200) + "…" : row.raw,
                        okText: "Delete",
                        cancelText: "Cancel",
                    });
                    if (!ok) return;
                }
                rows.splice(index, 1);
                render();
                scheduleSave();
            });
            warnLine.appendChild(warn);
            warnLine.appendChild(deleteBtn);

            const raw = document.createElement("textarea");
            raw.className = "fl-textarea";
            raw.style.borderColor = "rgba(224,160,48,0.5)";
            raw.style.fontSize = `${textFontSizePx}px`;
            raw.value = row.raw;
            raw.rows = 1;
            raw.addEventListener("input", () => {
                row.raw = raw.value;
                autoGrow(raw);
                scheduleSave();
            });
            raw.addEventListener("keydown", (e) => {
                if (e.key === "Enter") e.preventDefault();
            });
            rowEl.appendChild(warnLine);
            rowEl.appendChild(raw);
            requestAnimationFrame(() => autoGrow(raw));
            return rowEl;
        }

        // --- top line: drag handle, compact speaker + instruct pickers,
        // side by side. Fixed widths on purpose -- these are short labels,
        // not prose, and shouldn't stretch to fill the row's full width. ---
        const topLine = document.createElement("div");
        topLine.style.cssText = "display:flex;gap:4px;align-items:center;flex-wrap:wrap;";

        const dragHandle = document.createElement("span");
        dragHandle.className = "fl-drag-handle";
        dragHandle.textContent = "⠿";
        dragHandle.title = "Drag onto another line to merge them";

        const ready = isCurrentlyReady();

        // Jump-to-line playback. Mode 2 (ready): only shown when a
        // validated timing manifest (see loadTiming/computeLineTiming)
        // actually covers this row, seeks the mini player exactly like
        // before this redesign. Mode 1 (not ready): shown whenever this
        // row has SOME audio on disk (voiced or stale -- stale still has
        // real, just outdated, audio), plays that row's own file and
        // continues sequentially -- see playRowSequential. The glyph
        // itself flips to ⏸ for whichever line is currently playing (see
        // syncActiveLine/updateActivePlayIcon for mode 2, or
        // playRowSequential/stopMode1Playback for mode 1).
        const playBtn = document.createElement("span");
        playBtn.className = "fl-play-btn";
        setPlayGlyph(playBtn, false);
        const timingIdx = currentRowToTimingIdx.get(index);
        if (ready) {
            if (timingIdx === undefined) {
                playBtn.style.display = "none";
            } else {
                playBtn.title = "Play from this line";
                playBtn.addEventListener("click", () => {
                    if (!audioEl || !lineTiming) return;
                    audioEl.currentTime = lineTiming.lines[timingIdx].start;
                    audioEl.play();
                });
            }
        } else if (row.status === "unvoiced") {
            playBtn.style.display = "none";
        } else {
            playBtn.title = "Play this line (and every voiced line after it)";
            playBtn.addEventListener("click", () => {
                if (mode1PlayingIdx === index) {
                    stopMode1Playback();
                } else {
                    playRowSequential(index);
                }
            });
        }

        // Re-voice just this line. Mode 1 (not ready): always available on
        // any non-malformed row, regardless of whether it's ever been
        // voiced -- clicking it renders just this line into its own
        // id<N>.wav (see nodes/script_library.py's line_index_override)
        // and marks it "voiced"; nothing else in the script is touched.
        // Mode 2 (ready): hidden -- the script is frozen at that point,
        // unmark ✅ Done first to go back to editing. Spinner state lives
        // in pendingRevoiceRows (keyed by the row object), not a local
        // variable, so it survives a render() triggered by something else
        // while this is in flight -- see that Set's own comment above.
        const revoiceBtn = iconButton("🔁", "");
        // Amber tint = this line's audio (if any) no longer matches its
        // current text/speaker/instruct -- a nudge to re-voice, not a
        // block on anything. Re-checked on every keystroke (not just at
        // build time) so it reacts instantly, same as
        // updateSpeakerFileInfo/updateInstructDesc elsewhere in this row.
        function updateRevoiceStale() {
            const isPending = pendingRevoiceRows.has(row);
            revoiceBtn.style.color = !isPending && row.status === "stale" ? "#e0a030" : "";
            if (!isPending) {
                revoiceBtn.title = row.status === "stale"
                    ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content"
                    : row.status === "voiced"
                    ? "Re-voice just this line (uses the currently open workflow)"
                    : "Not voiced yet -- click to render just this line";
            }
        }
        if (!revoiceApi || ready) {
            revoiceBtn.style.display = "none";
        } else {
            const isPending = pendingRevoiceRows.has(row);
            revoiceBtn.disabled = isPending;
            revoiceBtn.textContent = isPending ? "⏳" : "🔁";
            revoiceBtn.title = isPending ? "Re-voicing..." : "";
            updateRevoiceStale();
            revoiceBtn.addEventListener("click", async () => {
                if (pendingRevoiceRows.has(row)) return;
                pendingRevoiceRows.add(row);
                refreshRowByObject(row); // just this row -- see its own comment for why not render()
                updateDoneUi();
                setStatus(`Re-voicing...`);
                try {
                    await revoiceApi.revoiceLine({
                        lineId: row.id,
                        speaker: row.speaker,
                        instruct: row.instruct,
                        text: row.text,
                    });
                    row.status = "voiced";
                    setStatus(`Line re-voiced`);
                } catch (e) {
                    setStatus(`Re-voice failed: ${e.message || e}`);
                } finally {
                    pendingRevoiceRows.delete(row);
                    flushSave(); // persist the new status right away, not debounced
                    refreshRowByObject(row);
                    updateDoneUi();
                }
            });
        }

        const speakerInput = document.createElement("input");
        speakerInput.className = "fl-input";
        speakerInput.style.cssText = "width:108px;flex:0 0 auto;";
        speakerInput.type = "text";
        speakerInput.value = row.speaker;
        speakerInput.title = "Speaker (preset or preset#tag)";

        // Shows the actual .pt file this speaker resolves to, AND -- when
        // the speaker is a role code -- doubles as the control for
        // re-casting that role: picking a different preset here rewrites
        // _roles.json's entry for the code (see saveRolesJson), so it
        // changes the voice for EVERY line using that role code across the
        // WHOLE project, not just this one. A literal preset (no matching
        // role) has nothing project-wide to change, so the button stays
        // disabled and just displays the resolved file.
        const speakerChangeBtn = document.createElement("button");
        speakerChangeBtn.className = "fl-btn fl-btn-icon";
        speakerChangeBtn.style.cssText =
            "flex:0 0 auto;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        const updateSpeakerFileInfo = (value) => {
            const file = resolveSpeakerFile(value);
            const entry = roleEntries.find((e) => e.code === value);
            speakerChangeBtn.textContent = file || "(no speaker)";
            speakerChangeBtn.disabled = !entry;
            speakerChangeBtn.title = entry
                ? `Change "${entry.code}"'s speaker for the whole play (currently ${file || "unset"})`
                : file
                ? `"${value}" is a literal preset, not a role code -- edit it directly in the speaker field to change it`
                : "No speaker set on this line yet";
        };
        updateSpeakerFileInfo(row.speaker);
        speakerChangeBtn.addEventListener("click", () => {
            const entry = roleEntries.find((e) => e.code === row.speaker);
            if (!entry) return;
            if (!presets.length) {
                setStatus("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
                return;
            }
            const usage = speakerUsageIndex();
            openFloatingPanel({
                anchorEl: speakerChangeBtn,
                items: presets,
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
                    render(); // refreshes every row referencing this role code, not just this one
                },
            });
        });

        // Hover info: every field _roles.json has for this role code, so the
        // user can sanity-check a role (name/speaker/description/whatever
        // else the JSON carries) without opening the roles editor. Instant
        // custom popover (see showRoleInfoPopover) instead of the native
        // title tooltip -- no hover delay, and each field gets its own
        // styled row instead of one flat string.
        const roleInfoBtn = iconButton("ℹ", "");
        roleInfoBtn.style.cssText = "flex:0 0 auto;cursor:help;";
        roleInfoBtn.addEventListener("mouseenter", () => showRoleInfoPopover(roleInfoBtn, row.speaker));
        roleInfoBtn.addEventListener("mouseleave", hideRoleInfoPopover);

        speakerInput.addEventListener("input", () => {
            row.speaker = speakerInput.value;
            rowEl.style.borderLeftColor = speakerAccent(row.speaker);
            updateSpeakerFileInfo(row.speaker);
            markRowEdited(row);
            updateRevoiceStale();
            updateDoneUi(); // this row leaving "voiced" can flip Done's enabled state
            scheduleSave();
        });

        const rolePickBtn = iconButton("👤", "Pick from _roles.json");
        rolePickBtn.addEventListener("click", () => {
            if (!roleEntries.length) {
                setStatus("No roles catalog found for this project (_roles.json)");
                return;
            }
            openFloatingPanel({
                anchorEl: rolePickBtn,
                items: roleEntries,
                // Script lines name a stable role CODE (e.g. "voldemort"),
                // not the real preset -- resolution to an actual speaker
                // happens once, at Script Library's output. Showing the
                // currently-assigned speaker here is just context.
                getLabel: (e) => e.code || e.speaker || "",
                getSubLabel: (e) => [e.name, e.speaker, e.description].filter(Boolean).join(" -- "),
                onPick: (e) => {
                    const value = e.code || e.speaker || "";
                    row.speaker = value;
                    speakerInput.value = value;
                    rowEl.style.borderLeftColor = speakerAccent(value);
                    updateSpeakerFileInfo(value);
                    markRowEdited(row);
                    updateRevoiceStale();
                    updateDoneUi(); // this row leaving "voiced" can flip Done's enabled state
                    scheduleSave();
                },
            });
        });

        // Instruct now gets its own full-width band below the speaker line
        // instead of sharing a row with 5 other controls in a fixed 260px
        // box (Design Guideline -- Layout: "make essential information
        // easy to find by giving it sufficient space") -- the instruct
        // text defines how the line is DELIVERED, which is as important as
        // who's speaking.
        const instructInput = document.createElement("input");
        instructInput.className = "fl-input";
        instructInput.style.cssText = "flex:1 1 auto;";
        instructInput.type = "text";
        instructInput.value = row.instruct;
        instructInput.title = "Instruct text";

        // Secondary line under the instruct text, matching whatever note
        // _instructions.json has for this exact instruct text (best-effort
        // lookup by text, since a row only stores the instruct string, not
        // which catalog entry it came from) -- only shown when a match
        // exists. Design Guideline -- Typography > Conveying hierarchy:
        // muted/smaller secondary text under the primary value.
        const instructDescEl = document.createElement("div");
        instructDescEl.className = "fl-status";
        instructDescEl.style.cssText = "padding-left:22px;display:none;";
        function updateInstructDesc() {
            const entry = instructionEntries.find((e) => (e.text || "").trim() === row.instruct.trim());
            if (entry && entry.note) {
                instructDescEl.textContent = `↳ ${entry.note}`;
                instructDescEl.style.display = "";
            } else {
                instructDescEl.style.display = "none";
            }
        }
        updateInstructDesc();

        instructInput.addEventListener("input", () => {
            row.instruct = instructInput.value;
            updateInstructDesc();
            markRowEdited(row);
            updateRevoiceStale();
            updateDoneUi(); // this row leaving "voiced" can flip Done's enabled state
            scheduleSave();
        });

        const instructPickBtn = iconButton("📋", "Pick from the instructions catalog (_instructions.json)");
        instructPickBtn.addEventListener("click", () => {
            if (!instructionEntries.length) {
                setStatus("No instructions catalog found for this project (_instructions.json)");
                return;
            }
            openFloatingPanel({
                anchorEl: instructPickBtn,
                items: instructionEntries,
                getLabel: (e) => e.text,
                getSubLabel: (e) => e.note || "",
                onPick: (e) => {
                    row.instruct = e.text;
                    instructInput.value = e.text;
                    updateInstructDesc();
                    markRowEdited(row);
                    updateRevoiceStale();
                    updateDoneUi(); // this row leaving "voiced" can flip Done's enabled state
                    scheduleSave();
                },
            });
        });

        const deleteBtn = iconButton("🗑️", "Delete this line");
        deleteBtn.addEventListener("click", async () => {
            if (row.text && row.text.trim()) {
                const ok = await openConfirmDialog({
                    title: "Delete this line?",
                    message: row.text.length > 200 ? row.text.slice(0, 200) + "…" : row.text,
                    okText: "Delete",
                    cancelText: "Cancel",
                });
                if (!ok) return;
            }
            rows.splice(index, 1);
            render();
            scheduleSave();
        });

        const spacer = document.createElement("div");
        spacer.style.cssText = "flex:1 1 auto;";

        // Speaker band: who's speaking. 👤 (re-cast this LINE to a
        // different role) sits before the speaker field it acts on.
        topLine.appendChild(dragHandle);
        topLine.appendChild(playBtn);
        topLine.appendChild(revoiceBtn);
        topLine.appendChild(rolePickBtn);
        topLine.appendChild(speakerInput);
        topLine.appendChild(speakerChangeBtn);
        topLine.appendChild(roleInfoBtn);
        topLine.appendChild(spacer);
        topLine.appendChild(deleteBtn);

        // Instruct band: how it's delivered -- its own line, full width,
        // with the matching _instructions.json note (if any) directly
        // underneath (Design Guideline -- Layout > Best practices: "group
        // related items... use negative space... to show when elements are
        // related").
        const instructLine = document.createElement("div");
        instructLine.style.cssText = "display:flex;gap:4px;align-items:center;";
        instructLine.appendChild(instructPickBtn);
        instructLine.appendChild(instructInput);

        // --- bottom line: the spoken text, full width. Long lines wrap
        // purely via CSS (white-space/overflow-wrap) -- Enter never inserts
        // a real newline, since each row is exactly one script line. ---
        const textArea = document.createElement("textarea");
        textArea.className = "fl-textarea";
        // Auto-height only here -- no manual drag handle, no scrollbar.
        // .fl-textarea's own resize:vertical stays the default for other
        // uses of that class (e.g. ui_kit.js's full-screen report viewer,
        // which is a fixed-size scrollable panel, not an auto-growing
        // field), so these are overridden per-instance rather than at the
        // shared class level.
        textArea.style.resize = "none";
        textArea.style.overflow = "hidden";
        textArea.style.fontSize = `${textFontSizePx}px`;
        textArea.value = row.text;
        textArea.rows = 1;
        textArea.addEventListener("input", () => {
            row.text = textArea.value;
            autoGrow(textArea);
            markRowEdited(row);
            updateRevoiceStale();
            updateDoneUi(); // this row leaving "voiced" can flip Done's enabled state
            scheduleSave();
        });
        textArea.addEventListener("keydown", (e) => {
            if (e.key === "Enter") e.preventDefault();
        });
        textArea.addEventListener("paste", (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " ");
            const start = textArea.selectionStart, end = textArea.selectionEnd;
            textArea.value = textArea.value.slice(0, start) + pasted + textArea.value.slice(end);
            textArea.selectionStart = textArea.selectionEnd = start + pasted.length;
            row.text = textArea.value;
            autoGrow(textArea);
            markRowEdited(row);
            updateRevoiceStale();
            updateDoneUi(); // this row leaving "voiced" can flip Done's enabled state
            scheduleSave();
        });
        requestAnimationFrame(() => autoGrow(textArea));

        rowEl.appendChild(topLine);
        rowEl.appendChild(instructLine);
        rowEl.appendChild(instructDescEl);
        rowEl.appendChild(textArea);
        attachDragHandlers(rowEl, dragHandle, index);
        return rowEl;
    }

    // animateIndex: if given, that row gets the entrance animation (see
    // .fl-row-enter in styles.js) plus a scroll-into-view and an immediate
    // focus on its speaker field -- used only for a freshly-added row, not
    // on every render (delete/merge/load stay instant, matching the HIG
    // motion guidance to animate purposefully, not on every redraw).
    // Rebuilds just ONE row's own DOM subtree in place (via buildRow),
    // leaving every other row -- and the scroll container's scroll
    // position -- completely untouched. Used for a single row's own 🔁
    // start/finish instead of a full render(): a re-render tears down and
    // rebuilds rowsContainer.innerHTML wholesale, which visibly "jumps"
    // the view (scroll position, focus) even though only one row actually
    // changed, and re-voicing a line further down a long script is
    // exactly when the user is most likely to be looking somewhere else
    // in the list while it finishes.
    //
    // Looks up the row's CURRENT index by object identity rather than
    // trusting a captured one -- re-voicing takes real time (an actual
    // TTS render), during which the user can freely add/delete/merge/
    // split other rows, shifting everyone's position. Silently no-ops if
    // the row no longer exists (deleted while its re-voice was still in
    // flight) -- whatever delete/merge operation removed it already
    // called a full render() of its own.
    function refreshRowByObject(row) {
        const index = rows.indexOf(row);
        if (index === -1) return;
        if (mode1PlayingIdx === index) stopMode1Playback();
        const oldEl = rowEls[index];
        const newEl = buildRow(row, index);
        if (oldEl && oldEl.parentNode) {
            oldEl.parentNode.replaceChild(newEl, oldEl);
        } else if (rowsContainer.children[index]) {
            rowsContainer.replaceChild(newEl, rowsContainer.children[index]);
        }
        rowEls[index] = newEl;
    }

    function render(animateIndex = -1) {
        // Mode 1 playback holds direct DOM refs (rowEls) that are about to
        // be thrown away below -- stop it first rather than leave it
        // pointing at detached elements. Mode 2's audioEl lives outside
        // rowsContainer entirely and is unaffected (see syncActiveLine).
        stopMode1Playback();

        // Re-validated on every render (not just when the manifest is
        // re-fetched) -- MODE 2 ONLY. Editing in mode 1 doesn't touch
        // rawTimingLines/lineTiming at all (see the mode-1/mode-2 comment
        // above) -- each row's own id/status is the only thing that
        // matters there.
        const ready = isCurrentlyReady();
        lineTiming = ready ? computeLineTiming(rawTimingLines, rows) : null;
        currentRowToTimingIdx = new Map();
        if (lineTiming) {
            lineTiming.rowIndexMap.forEach((rowIdx, timingIdx) => currentRowToTimingIdx.set(rowIdx, timingIdx));
        }
        timingWarningEl.style.display = ready && rawTimingLines && rawTimingLines.length && !lineTiming ? "" : "none";

        rowsContainer.innerHTML = "";
        rowEls = [];
        rows.forEach((row, i) => {
            const el = buildRow(row, i);
            rowEls.push(el);
            rowsContainer.appendChild(el);
        });

        timingRowEls = lineTiming ? lineTiming.rowIndexMap.map((rowIdx) => rowsContainer.children[rowIdx]) : [];
        timingPlayBtns = timingRowEls.map((el) => (el ? el.querySelector(".fl-play-btn") : null));
        lastActiveTimingIdx = -1; // DOM just got rebuilt -- let syncActiveLine reattach fresh
        syncActiveLine();

        // "✅ Done" enables/disables based on every row's voice status
        // (allRowsVoiced) -- refresh it here too, not just after its own
        // click handler, so it comes on by itself once the last line gets
        // voiced (a 🔁 completing, or a full render's commit) instead of
        // needing an unrelated interaction to notice.
        updateDoneUi();

        if (animateIndex >= 0) {
            const el = rowsContainer.children[animateIndex];
            if (el) {
                el.classList.add("fl-row-enter");
                el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                const speakerInput = el.querySelector(".fl-input");
                if (speakerInput) speakerInput.focus();
            }
        }
    }

    async function loadPresets() {
        try {
            const resp = await fetch(PRESETS_API);
            const data = await resp.json();
            presets = data.presets || [];
        } catch (e) {
            presets = [];
        }
    }

    async function loadCatalog() {
        try {
            const url = `${SCAN_API}/scan?path=${encodeURIComponent(folder)}&act=&suffix=${encodeURIComponent(suffix)}`;
            const resp = await fetch(url);
            const data = await resp.json();
            instructionEntries = data.instructions?.entries || [];
            roleEntries = data.roles?.entries || [];
            rolesJsonPath = data.roles?.path || null;
            scriptList = Array.isArray(data.scripts) ? data.scripts : [];
            readyScripts = Array.isArray(data.ready_scripts) ? data.ready_scripts : [];
        } catch (e) {
            instructionEntries = [];
            roleEntries = [];
            rolesJsonPath = null;
            scriptList = [];
            readyScripts = [];
        }
        updateNavState();
        updateDoneUi();
        // loadCatalog() and loadFromDisk() race independently (see call site
        // below) -- if rows already rendered before roleEntries arrived, the
        // per-row file-name labels would be stuck on their pre-catalog
        // fallback. Re-render now that roleEntries is settled; harmless
        // no-op if rows is still empty.
        render();
    }

    // Switches this same editor instance to a different script in the same
    // act (Prev/Next), without closing/reopening the overlay. Flushes any
    // pending edit to the file being left first.
    async function switchToFile(newFilename) {
        if (!newFilename || newFilename === filename || closed) return;
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
            await flushSave();
        }
        filename = newFilename;
        fullPath = joinPath(folder, filename);
        audioBaseName = stripSuffixAndExt(filename, suffix);
        lastAudioFilename = null; // new script -> force a full (non-silent) audio recheck below
        lastAudioFingerprint = null;
        rawTimingLines = null; // different script -> old timing manifest no longer applies at all
        lastTimingMtime = null;
        titleEl.textContent = filename;
        rows = [];
        lastSavedText = null;
        lastLocalEditAt = 0;
        render();
        refreshCheckbox();
        updateDoneUi();
        updateNavState();
        setStatus("Loading...");
        await loadFromDisk();
        loadAudio();
        loadTiming();
    }

    async function loadFromDisk({ isPoll = false } = {}) {
        try {
            const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(fullPath)}`);
            const data = await resp.json();
            if (data.error) {
                setStatus(`Read error: ${data.error}`);
                return;
            }
            if (!data.exists) {
                if (!isPoll) {
                    rows = [];
                    lastSavedText = "";
                    lastSavedStatePayload = null;
                    render();
                    setStatus("File does not exist yet (will be created on first edit)");
                }
                return;
            }
            if (isPoll && Date.now() - lastLocalEditAt < EDIT_QUIET_MS) return;
            if (data.content === lastSavedText) return;
            rows = parseScript(data.content);
            lastSavedText = data.content;
            await loadAndReconcileState();
            render();
            if (!isPoll) setStatus(`Loaded ${rows.length} line(s)`);
        } catch (e) {
            setStatus(`Read failed: ${e}`);
        }
    }

    updateDoneUi();
    loadCatalog();
    loadPresets();
    loadAudio();
    audioPollTimer = setInterval(() => loadAudio({ silent: true }), POLL_MS);
    // loadTiming() must not run before `rows` is populated: its
    // commit_full_render check (see commitFullRenderIfNeeded) only fires
    // when the manifest's line count matches the CURRENT non-malformed row
    // count, and an empty `rows` (before loadFromDisk resolves) would both
    // wrongly skip it AND mark this mtime "already seen" -- silently
    // losing the one chance to adopt a full render that finished before
    // this editor was even opened, since the next poll tick's mtime
    // wouldn't look "fresh" any more either.
    loadFromDisk().then(() => {
        pollTimer = setInterval(() => loadFromDisk({ isPoll: true }), POLL_MS);
        loadTiming();
        timingPollTimer = setInterval(() => loadTiming({ silent: true }), POLL_MS);
    });
}
