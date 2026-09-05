import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { hideWidget } from "./ui_kit.js";
import { openLineEditor } from "./line_editor.js";
import { openBrowseDialog } from "./browse_dialog.js";
import { openRolesEditor } from "./roles_editor.js";
import { mountScriptLibraryPanel } from "./script_library_panel.js";

// FL CosyVoice3 Script Library: folder_path is a PROJECT ROOT. Shows every
// "Act01"/"Act02"/... subfolder and its "_speakers.txt" scripts as a
// checkbox tree. Clicking a script's name previews it (this node always
// outputs exactly one script's content).
//
// Checkboxes (plus the All/None/Invert row) mark which scripts to queue.
// There is deliberately NO separate "queue" button -- the ordinary
// ComfyUI Run button drives it, same contract as Prompt Multi Pixaroma
// (see ComfyUI-Pixaroma-by-Pax/js/prompt_multi/index.js): if any script
// is checked when Run is clicked, the app.queuePrompt patch below loops
// once per checked script (each its own separate run, so a multi-scene
// batch produces N separate audio outputs instead of one merged blob);
// with nothing checked, Run behaves exactly as if this node had no queue
// logic at all -- a single normal run using whichever script is
// currently "active" (last clicked).
//
// Earlier versions of this mechanism mutated the act/script_file widgets'
// .value directly in a loop around repeated app.queuePrompt() calls. That
// is a race: nothing guarantees a given queuePrompt() call finishes
// reading widget values for ITS prompt before the next mutation lands,
// so multi-item batches could serialize the wrong (often just the first)
// script into more than one queued run. The fix, copied from Prompt
// Multi: never touch widget.value for this. Keep the per-run override
// (WeakMap keyed by node -> {act, file}) and apply it inside an
// app.graphToPrompt hook, which fires once per queued prompt and is the
// actual serialization point -- so the override is atomic with the
// prompt it's meant for. app.queuePrompt itself only decides how many
// times to call the original and which override is active for each call.
// Each script also has its own "Edit" button opening the full-screen
// per-line editor from line_editor.js. The tree/browse-button/tools-row
// rendering itself lives in src/script_library/ScriptLibraryPanel.vue
// (built to script_library_panel.js) -- this file keeps only the ComfyUI
// node-lifecycle wiring (hiding native widgets, mounting the panel, node
// resize/cleanup) plus the queue-orchestration patch below, which is NOT
// UI and stays untouched.
// Combined min-height for the single merged DOM widget the panel mounts
// into -- sum of what were 5 separately-pinned rows (browse button 32,
// two tool rows 38 each, tree's own MIN_TREE_HEIGHT 90, status line 18).
// No max: the tree (flex:1 inside the panel's own CSS) is what absorbs
// any extra height the user drags the node to, same as before.
const PANEL_MIN_HEIGHT = 32 + 38 + 38 + 90 + 18;

app.registerExtension({
    name: "FL_CosyVoice3.ScriptLibrary",
    async nodeCreated(node) {
        if (node.comfyClass !== "FL_CosyVoice3_ScriptLibrary") return;

        const folderWidget = node.widgets?.find((w) => w.name === "folder_path");
        const actWidget = node.widgets?.find((w) => w.name === "act");
        const filterWidget = node.widgets?.find((w) => w.name === "script_filter");
        const scriptFileWidget = node.widgets?.find((w) => w.name === "script_file");
        const scriptWidget = node.widgets?.find((w) => w.name === "script");
        const lineOverrideWidget = node.widgets?.find((w) => w.name === "line_override");
        if (!folderWidget || !actWidget || !scriptFileWidget || !scriptWidget) return;

        hideWidget(node, folderWidget);
        hideWidget(node, actWidget);
        hideWidget(node, scriptFileWidget);
        hideWidget(node, scriptWidget);
        if (filterWidget) hideWidget(node, filterWidget);
        if (lineOverrideWidget) hideWidget(node, lineOverrideWidget);

        node._flCheckedItems = []; // read by the module-level app.queuePrompt hook below

        const panel = mountScriptLibraryPanel({
            node,
            folderWidget,
            actWidget,
            filterWidget,
            scriptFileWidget,
            openBrowseDialog,
            openRolesEditor,
            openLineEditor,
            // Assigned below, inside the patch guard -- already set by the
            // time any node's nodeCreated can fire (module top-level code
            // runs once on import, before ComfyUI calls nodeCreated).
            queueLineRevoice,
        });

        node.addDOMWidget("script_library_panel", "custom", panel.element, {
            serialize: false,
            getMinHeight: () => PANEL_MIN_HEIGHT,
        });
        node.setSize(node.computeSize());
        node.setDirtyCanvas(true, true);

        const origOnRemoved = node.onRemoved;
        node.onRemoved = function () {
            panel.unmount();
            return origOnRemoved ? origOnRemoved.apply(this, arguments) : undefined;
        };
    },
});

// ── Checked-scripts queue loop (module scope, patched once) ────────────────
// Mirrors ComfyUI-Pixaroma-by-Pax's Prompt Multi node (js/prompt_multi/index.js):
// an app.graphToPrompt hook overrides this node's inputs at the moment a given
// prompt is actually serialized (never by mutating widget.value), and an
// app.queuePrompt hook owns the "call the original N times" loop, one call
// per checked script.
const FL_CLASS = "FL_CosyVoice3_ScriptLibrary";
const POST_PROCESS_CLASS = "FL_CosyVoice3_AudioPostProcess";

function isFlNodeActive(node) {
    // mode 2 = muted (LiteGraph), mode 4 = bypass (ComfyUI). Anything else counts as active.
    return node.mode !== 2 && node.mode !== 4;
}

// Subgraph-safe node lookup: ComfyUI flattens subgraph-contained nodes into
// the prompt with composite ids ("5:12") that app.graph.getNodeById (top-level
// only) can't resolve, so a plain parseInt(tail)+getNodeById would silently
// miss any Script Library node living inside a subgraph.
function buildFlNodeIndex() {
    const index = new Map();
    const visit = (graph) => {
        if (!graph) return;
        const nodes = graph._nodes || graph.nodes || [];
        for (const n of nodes) {
            if (!n) continue;
            if (n.comfyClass === FL_CLASS || n.type === FL_CLASS) index.set(String(n.id), n);
            const inner = n.subgraph || n.graph || n._graph;
            if (inner && inner !== graph) visit(inner);
        }
    };
    visit(app.graph);
    return index;
}

function findFlNode(index, promptId) {
    const sId = String(promptId);
    if (index.has(sId)) return index.get(sId);
    const tail = sId.includes(":") ? sId.slice(sId.lastIndexOf(":") + 1) : null;
    return (tail && index.has(tail)) ? index.get(tail) : null;
}

// Per-run override: while a Script Library node's queue loop (or a single
// re-voice request, see queueLineRevoice below) is driving, this holds
// what the CURRENTLY-serializing prompt should get for that node --
// {act, file} for the checked-items batch loop, {lineOverride} for a
// re-voice request (leaves act/script_file untouched -- same script,
// just one line's content instead of the whole file). Absent (or node not
// in the map) means "don't touch this node's inputs" -- the normal
// single-run case, whatever its widgets currently hold.
const flActiveItem = new WeakMap();

// Set only during a re-voice request's synchronous submit window (see
// queueLineRevoice) -- the STABLE id (not array position) of the ONE line
// being re-rendered, stamped onto every Post-Process node found in the
// prompt so it names that line's _audio/lines/ file as id<N>.wav instead
// of always 0 (see nodes/audio_post_process.py's line_index_override).
let pendingRevoiceLineIndex = null;

// Same subgraph-safe walk as buildFlNodeIndex, but collecting every
// Post-Process node instead of indexing by id (a re-voice run has no
// specific "this is the id we're looking for" -- every Post-Process node
// found in the CURRENT prompt gets the override, matching "work within
// the current flow" -- one Dialog/Post-Process pair per graph is the
// assumption here, same as the checked-items loop assumes one driving
// Script Library node).
function buildPostProcessList() {
    const found = [];
    const visit = (graph) => {
        if (!graph) return;
        const nodes = graph._nodes || graph.nodes || [];
        for (const n of nodes) {
            if (!n) continue;
            if (n.comfyClass === POST_PROCESS_CLASS || n.type === POST_PROCESS_CLASS) found.push(n);
            const inner = n.subgraph || n.graph || n._graph;
            if (inner && inner !== graph) visit(inner);
        }
    };
    visit(app.graph);
    return found;
}

// Matches ComfyUI core's SaveAudio/SaveAudioMP3/SaveAudioOpus, VHS_SaveAudio,
// and similar third-party audio-saver nodes by name, not by an exact class
// list -- see stripDownstreamAudioSavers below.
const AUDIO_SAVER_CLASS_RE = /saveaudio|audiosave/i;

// A single-line re-voice only needs Post-Process's own per-line file write
// (_audio\lines\<script>\id<N>.wav, via line_index_override) -- our own
// "✅ Done" (stitch_lines) owns producing the actual final scene file now,
// entirely server-side. If the user's graph still has a Save Audio node
// wired downstream of Post-Process (needed for a FULL render to produce a
// usable draft file), queuing the WHOLE graph for just one line makes that
// SAME Save Audio node fire too -- writing this one short line's audio into
// _audio\ under the script's own filename_prefix, where the mini player's
// "latest file wins" match (see nodes/script_library.py's scripts_with_audio
// / web/line_editor.js's loadAudio) then mistakes it for the actual
// full-scene take. Dropping any audio-saver node from THIS ONE queued
// prompt (never from the graph itself) avoids that -- these are always
// terminal/sink nodes (no outputs), so nothing else in the prompt can be
// depending on one being present.
function stripDownstreamAudioSavers(prompt) {
    for (const key of Object.keys(prompt)) {
        const entry = prompt[key];
        if (entry && AUDIO_SAVER_CLASS_RE.test(entry.class_type || "")) {
            delete prompt[key];
        }
    }
}

// Assigned inside the patch guard below (needs closure access to
// flQueueLoopActive/_origQueuePrompt) -- exposed here so editBtn's click
// handler (inside registerExtension's nodeCreated, a separate top-level
// statement) can call it.
let queueLineRevoice = null;

if (!app._flScriptLibraryPatched) {
    app._flScriptLibraryPatched = true;

    const _origGraphToPrompt = app.graphToPrompt;
    app.graphToPrompt = async function (...args) {
        const result = await _origGraphToPrompt.apply(this, args);
        try {
            const prompt = result?.output;
            if (prompt && typeof prompt === "object") {
                let index = null;
                for (const key of Object.keys(prompt)) {
                    const entry = prompt[key];
                    if (!entry || entry.class_type !== FL_CLASS) continue;
                    if (!index) index = buildFlNodeIndex();
                    const node = findFlNode(index, key);
                    if (!node || !flActiveItem.has(node)) continue;
                    const item = flActiveItem.get(node);
                    entry.inputs = entry.inputs || {};
                    if (item.act !== undefined) entry.inputs.act = item.act;
                    if (item.file !== undefined) entry.inputs.script_file = item.file;
                    if (item.lineOverride !== undefined) entry.inputs.line_override = item.lineOverride;
                }
                if (pendingRevoiceLineIndex !== null) {
                    for (const ppNode of buildPostProcessList()) {
                        const ppEntry = prompt[String(ppNode.id)];
                        if (!ppEntry || ppEntry.class_type !== POST_PROCESS_CLASS) continue;
                        ppEntry.inputs = ppEntry.inputs || {};
                        ppEntry.inputs.line_index_override = pendingRevoiceLineIndex;
                    }
                    stripDownstreamAudioSavers(prompt);
                }
            }
        } catch (err) {
            console.error("FL_CosyVoice3.ScriptLibrary: graphToPrompt hook failed", err);
        }
        return result;
    };

    // Find the first Script Library node that should drive the queue: active
    // (not muted/bypassed) and has at least one checked script. Only the
    // first such node drives -- same simplification Prompt Multi makes for
    // multiple driver nodes in one graph.
    function findDrivingNode() {
        const top = app.graph?._nodes || app.graph?.nodes || [];
        const isDriving = (n) => n && (n.comfyClass === FL_CLASS || n.type === FL_CLASS)
            && isFlNodeActive(n) && (n._flCheckedItems || []).length > 0;
        for (const n of top) if (isDriving(n)) return n;
        const walk = (nodes) => {
            for (const n of nodes || []) {
                if (isDriving(n)) return n;
                const sub = n?.subgraph?._nodes || n?.subgraph?.nodes;
                if (sub) {
                    const hit = walk(sub);
                    if (hit) return hit;
                }
            }
            return null;
        };
        return walk(top);
    }

    // Reentrancy guard: our own loop below calls the original queuePrompt
    // once per checked script. If something (another click, another patch)
    // called app.queuePrompt again while that loop is running, it must NOT
    // start a second overlapping loop -- both would set flActiveItem on the
    // same node and stomp each other's act/script_file. Local to this
    // module only; it does not coordinate with other plugins' own queue
    // loops (e.g. Pixaroma's), which is a real but rare residual edge case.
    let flQueueLoopActive = false;

    const _origQueuePrompt = app.queuePrompt;
    app.queuePrompt = async function (...args) {
        if (flQueueLoopActive) return _origQueuePrompt.apply(app, args);

        const node = findDrivingNode();
        const items = node ? node._flCheckedItems : null;
        if (!node || !items || !items.length) return _origQueuePrompt.apply(app, args);

        flQueueLoopActive = true;
        try {
            const results = [];
            for (const item of items) {
                flActiveItem.set(node, item);
                try {
                    const loopArgs = args.slice(); loopArgs[1] = 1; // batchCount=1, keep number + queueNodeIds
                    results.push(await _origQueuePrompt.apply(app, loopArgs));
                } catch (err) {
                    console.error("FL_CosyVoice3.ScriptLibrary: per-script enqueue failed", err);
                }
            }
            return results[results.length - 1];
        } finally {
            flActiveItem.delete(node);
            flQueueLoopActive = false;
        }
    };

    // Serializes the "stamp the override, call queuePrompt" critical
    // section so two re-voice clicks fired close together can't stomp each
    // other's flActiveItem/pendingRevoiceLineIndex values -- graphToPrompt
    // reads them synchronously at the start of queuePrompt, so as long as
    // submissions themselves don't overlap, each one's actual EXECUTION
    // (which can take a while and does run one-at-a-time regardless, via
    // ComfyUI's own queue) is free to be in flight concurrently with
    // others. This only guards the brief submit window, not the render.
    let revoiceSubmitChain = Promise.resolve();
    function withRevoiceSubmitLock(fn) {
        const run = revoiceSubmitChain.then(fn, fn);
        revoiceSubmitChain = run.catch(() => {});
        return run;
    }

    // Submits an already-built prompt and resolves with its prompt_id via
    // the "execution_start" websocket event -- NOT via api.queuePrompt's
    // own return value. This install has a long chain of OTHER extensions
    // (rgthree, Pixaroma, inspire-pack, easy-use, DaSiWa) each wrapping
    // api.queuePrompt, and confirmed live that {prompt_id} does not
    // reliably survive that chain back to the original caller even though
    // the server receives and queues the prompt correctly. The websocket
    // event comes straight from the server, unaffected by any of those
    // JS-level wrappers. Minor residual risk: if something ELSE is queued
    // ahead of this one, the next execution_start could belong to that
    // other job instead -- acceptable for "work within the current flow"
    // (nothing else is expected to be queuing at the same time).
    async function submitAndTrackPromptId(promptResult, { timeoutMs = 10 * 60 * 1000 } = {}) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                api.removeEventListener("execution_start", onStart);
                reject(new Error("Timed out waiting for the re-voice render to start"));
            }, timeoutMs);
            function onStart(event) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                api.removeEventListener("execution_start", onStart);
                resolve(event.detail?.prompt_id);
            }
            api.addEventListener("execution_start", onStart);
            api.queuePrompt(0, promptResult).catch((err) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                api.removeEventListener("execution_start", onStart);
                reject(err);
            });
        });
    }

    async function pollPromptCompletion(promptId, { intervalMs = 1000, timeoutMs = 10 * 60 * 1000 } = {}) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const resp = await fetch(`/history/${promptId}`);
            const data = await resp.json();
            const entry = data[promptId];
            if (entry) {
                if (entry.status?.completed) return entry;
                if (entry.status?.status_str === "error") {
                    throw new Error("Re-voice render failed -- check the ComfyUI console for details");
                }
            }
            await new Promise((r) => setTimeout(r, intervalMs));
        }
        throw new Error("Timed out waiting for the re-voice render to finish");
    }

    // Runs `node`'s CURRENT graph exactly as a normal Run would (same
    // model) but with act/script_file FORCED to the script the line editor
    // has open and line_override set to just one line's content -- see
    // nodes/script_library.py's line_override. act/file must be forced
    // (not left at whatever the node's widgets currently show): the editor
    // can be opened for any row in the tree, not just whichever one is
    // "active", so folder_path/filename would otherwise resolve to a
    // DIFFERENT script than the one being re-voiced. Only saves that one
    // line's own _audio/lines/<script>/id<N>.wav file (via
    // line_index_override = lineId) -- it does NOT touch the script's
    // final stitched file any more (see web/line_editor.js's per-line
    // "voiced/stale" state model): that only happens once, when "✅ Done"
    // stitches every line together.
    queueLineRevoice = async function (node, { act, file, lineId, speaker, instruct, text }) {
        const lineOverride = `${speaker} | ${instruct} | ${text}`;

        // Lock covers ONLY building the prompt (act/file/line_override are
        // read synchronously by the graphToPrompt hook right here) -- not
        // the actual submit-and-wait below, so a second re-voice click
        // doesn't have to wait for the first one's render to even START,
        // only for its prompt to finish being BUILT (fast).
        let promptResult;
        await withRevoiceSubmitLock(async () => {
            flActiveItem.set(node, { act, file, lineOverride });
            pendingRevoiceLineIndex = lineId;
            try {
                promptResult = await app.graphToPrompt();
            } finally {
                flActiveItem.delete(node);
                pendingRevoiceLineIndex = null;
            }
        });

        const promptId = await submitAndTrackPromptId(promptResult);
        await pollPromptCompletion(promptId);
    };
}
