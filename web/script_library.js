import { app } from "../../scripts/app.js";
import { hideWidget } from "./ui_kit.js";
import { openLineEditor } from "./line_editor.js";
import { openBrowseDialog } from "./browse_dialog.js";
import { openRolesEditor } from "./roles_editor.js";
import { mountScriptLibraryPanel } from "./script_library_panel.js";
import { SCRIPT_LIBRARY_API } from "./fl_common.js";
import {
    findNodesByClass, findPromptEntry, stripDownstreamAudioSavers,
    makeSubmitLock, submitAndTrackPromptId, pollPromptCompletion,
} from "./fl_queue_orchestration.js";

// FL CosyVoice3 Script Library: folder_path is a PROJECT ROOT. Shows every
// "Act01"/"Act02"/... subfolder and its dialog scripts (every .txt file,
// unless script_filter narrows that down) as a checkbox tree. Clicking a
// script's name previews it (this node always outputs exactly one script's
// content).
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
// queueLineRevoice) -- this line's CURRENT position among the script's
// non-malformed rows (kept in sync by LineEditorApp.vue's
// reorganizeLines), stamped onto every Post-Process node found in the
// prompt so it names that line's _audio/lines/ file
// "<position>_<hash>.wav" instead of always position 0 (see
// nodes/_line_audio.py / nodes/audio_post_process.py's line_index_override).
let pendingRevoiceLineIndex = null;

// Set alongside pendingRevoiceLineIndex: {folder, baseName} naming the
// EXACT _audio\lines\<baseName>\ folder the line editor that asked for this
// re-voice reads its per-line files from. Stamped onto the Post-Process
// node's script_folder/script_base_name so the re-voiced file can't land
// anywhere else. Without it those two inputs come from Script Library's own
// `filename` output -- strip_suffix_and_ext(script_file, script_filter) --
// which is a SECOND, independent derivation of the same base name; when it
// disagreed with the editor's (see ScriptLibraryPanel.vue's `suffix`), the
// audio was written to a folder nothing ever read from.
let pendingRevoiceTarget = null;

// Set alongside pendingRevoiceLineIndex/pendingRevoiceTarget: the content
// hash (see src/shared/line_hash.js) the asking editor already computed
// for this exact line, from the SAME resolved speaker+instruct+text it's
// about to check the result against. Stamped onto Post-Process's
// line_hashes_json input directly, the same literal-override pattern as
// script_folder/script_base_name above -- Script Library's own
// line_hashes_json OUTPUT only reaches Post-Process via a real graph
// connection the user has to wire by hand, which a full render genuinely
// needs (nothing else could supply per-line hashes for every line at
// once) but a single re-voice doesn't: this editor already has the exact
// value, and stamping it here means correctness never depends on whether
// that wire exists in a given workflow.
let pendingRevoiceContentHash = null;

// buildPostProcessList/findPromptEntry/stripDownstreamAudioSavers moved to
// fl_queue_orchestration.js (shared with vo_dub_library.js's own render
// path -- none of the three cared about THIS addon's act/script model,
// only about the current graph/prompt).
function buildPostProcessList() {
    return findNodesByClass(POST_PROCESS_CLASS);
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
                let drovePrompt = false;
                for (const key of Object.keys(prompt)) {
                    const entry = prompt[key];
                    if (!entry || entry.class_type !== FL_CLASS) continue;
                    if (!index) index = buildFlNodeIndex();
                    const node = findFlNode(index, key);
                    if (!node || !flActiveItem.has(node)) continue;
                    const item = flActiveItem.get(node);
                    drovePrompt = true;
                    entry.inputs = entry.inputs || {};
                    if (item.act !== undefined) entry.inputs.act = item.act;
                    if (item.file !== undefined) entry.inputs.script_file = item.file;
                    // Always force line_override for every checkbox-tree-driven run, even
                    // to "" -- never leave it at whatever the raw widget's serialized value
                    // happens to be. A workflow saved from an older version of this addon (or
                    // from a genuine re-voice request) can leave real, non-empty text sitting
                    // in that widget; since it's hidden from the UI, there's no way to notice
                    // or clear it by hand. browse() in nodes/script_library.py treats ANY
                    // non-empty line_override as "ignore script_file, use this instead" -- so
                    // stale leftover text there silently replaces the real script on every
                    // single normal run with that leftover snippet (observed: a whole scene's
                    // dialogue replaced by the literal act name "Act01", producing a few
                    // seconds of near-silent audio instead of the real narration).
                    entry.inputs.line_override = item.lineOverride !== undefined ? item.lineOverride : "";

                    // A FULL render (this checkbox-tree queue -- item has no
                    // lineOverride, unlike a single 🔁 re-voice) writes every
                    // line's per-line file with a hash Audio Post-Process
                    // computes from whatever reaches its OWN line_hashes_json
                    // input, a real graph wire the user has to add by hand
                    // (see this repo's README). Without it, Post-Process
                    // falls back to hashing text alone, which
                    // script_pending_lines' voice+instruct+text hash can
                    // never match -- every line renders successfully yet
                    // still shows "needs re-voice" right after. Fetching and
                    // stamping the same resolved-hash array Script Library's
                    // own 4th output would have computed removes that
                    // dependency entirely, the same way a single re-voice
                    // already never needed the wire either.
                    if (item.lineOverride === undefined && item.act !== undefined && item.file !== undefined) {
                        try {
                            const rootPath = node.widgets?.find((w) => w.name === "folder_path")?.value || "";
                            const suffixVal = node.widgets?.find((w) => w.name === "script_filter")?.value || "";
                            const hashResp = await fetch(
                                `${SCRIPT_LIBRARY_API}/line_hashes?root=${encodeURIComponent(rootPath)}` +
                                `&act=${encodeURIComponent(item.act)}&file=${encodeURIComponent(item.file)}` +
                                `&suffix=${encodeURIComponent(suffixVal)}`,
                            );
                            const hashData = await hashResp.json();
                            if (Array.isArray(hashData.line_hashes)) {
                                const lineHashesJson = JSON.stringify(hashData.line_hashes);
                                for (const ppNode of buildPostProcessList()) {
                                    const ppEntry = findPromptEntry(prompt, ppNode, POST_PROCESS_CLASS);
                                    if (ppEntry) {
                                        ppEntry.inputs = ppEntry.inputs || {};
                                        ppEntry.inputs.line_hashes_json = lineHashesJson;
                                    }
                                }
                                console.log(`[FL full-render] stamped ${hashData.line_hashes.length} line hash(es) for "${item.file}"`);
                            } else {
                                console.warn("FL_CosyVoice3.ScriptLibrary: couldn't fetch line_hashes for full render", hashData.error);
                            }
                        } catch (err) {
                            console.error("FL_CosyVoice3.ScriptLibrary: line_hashes fetch failed", err);
                        }
                    }
                }

                // This addon's whole model is "the final combined file is
                // written EXCLUSIVELY by ✅ Done (stitch_lines)" -- strip
                // every prompt THIS addon actually drives (a full render
                // through the checkbox tree, or a single 🔁 re-voice alike)
                // of any downstream Save Audio/VHS_SaveAudio/etc. node, so a
                // "quick listen while working" node left wired from an
                // older workflow can't write straight into _audio\ under
                // the script's own name/prefix. That stray file doesn't
                // just look like clutter: scripts_ready/scripts_with_audio
                // (nodes/script_library.py) now treat ANY file sitting
                // there as the final track, so it makes the script look
                // "done" before Done was ever clicked -- and the mini
                // player's own prefix match (web/line_editor.js's loadAudio)
                // picks it as the combined take, showing whatever the last
                // thing that node happened to save was (one line, or
                // however much of the batch it received) in place of the
                // real thing. Previously only stripped for a re-voice --
                // the exact same failure mode applies to a full render.
                const stripped = drovePrompt ? stripDownstreamAudioSavers(prompt) : [];
                if (stripped.length) console.log("[FL queue] stripped downstream audio-saver node(s):", stripped);

                if (pendingRevoiceLineIndex !== null) {
                    // Every re-voice logs the whole prompt-side story: which
                    // Post-Process nodes were found in the GRAPH, which of
                    // those resolved to an entry in the SERIALIZED prompt
                    // (the composite-subgraph-id hazard findPromptEntry
                    // exists for), and what was stamped onto each. A re-voice
                    // that renders nothing is otherwise indistinguishable at
                    // the UI from one that renders into the wrong place --
                    // and the counts below are what separate the two.
                    const ppNodes = buildPostProcessList();
                    const stamped = [];
                    for (const ppNode of ppNodes) {
                        const ppEntry = findPromptEntry(prompt, ppNode, POST_PROCESS_CLASS);
                        if (!ppEntry) continue;
                        ppEntry.inputs = ppEntry.inputs || {};
                        ppEntry.inputs.line_index_override = pendingRevoiceLineIndex;
                        // Overrides the wired link with a literal: the
                        // asking editor's own folder always wins over the
                        // backend's independent re-derivation of it.
                        if (pendingRevoiceTarget?.folder) ppEntry.inputs.script_folder = pendingRevoiceTarget.folder;
                        if (pendingRevoiceTarget?.baseName) ppEntry.inputs.script_base_name = pendingRevoiceTarget.baseName;
                        if (pendingRevoiceContentHash) ppEntry.inputs.line_hashes_json = JSON.stringify([pendingRevoiceContentHash]);
                        stamped.push(ppEntry.inputs);
                    }
                    console.log("[FL revoice] prompt built:", {
                        linePosition: pendingRevoiceLineIndex,
                        target: pendingRevoiceTarget,
                        contentHash: pendingRevoiceContentHash,
                        postProcessNodesInGraph: ppNodes.length,
                        postProcessEntriesStamped: stamped.length,
                        stampedInputs: stamped,
                        strippedAudioSavers: stripped,
                        promptClassTypes: Object.values(prompt).map((e) => e?.class_type),
                    });
                    if (ppNodes.length === 0) {
                        console.warn("[FL revoice] no FL CosyVoice3 Audio Post-Process node in this graph -- nothing will write a per-line file.");
                    } else if (stamped.length === 0) {
                        console.warn("[FL revoice] Post-Process node(s) present in the graph but none matched an entry in the serialized prompt (muted/bypassed, or not reachable from an output node).");
                    }
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

    // withRevoiceSubmitLock/submitAndTrackPromptId/pollPromptCompletion
    // moved to fl_queue_orchestration.js (shared with vo_dub_library.js's
    // own render path) -- this addon's re-voice lock is its own instance,
    // independent of any other caller's.
    const withRevoiceSubmitLock = makeSubmitLock();

    // Runs `node`'s CURRENT graph exactly as a normal Run would (same
    // model) but with act/script_file FORCED to the script the line editor
    // has open and line_override set to just one line's content -- see
    // nodes/script_library.py's line_override. act/file must be forced
    // (not left at whatever the node's widgets currently show): the editor
    // can be opened for any row in the tree, not just whichever one is
    // "active", so folder_path/filename would otherwise resolve to a
    // DIFFERENT script than the one being re-voiced. Only saves that one
    // line's own _audio/lines/<script>/<position>_<hash>.wav file
    // (via line_index_override = linePosition, see nodes/_line_audio.py) --
    // it does NOT touch the script's final stitched file any more: that
    // only happens once, when "✅ Done" stitches every line together.
    queueLineRevoice = async function (node, { act, file, linePosition, speaker, instruct, text, folder, baseName, contentHash }) {
        const lineOverride = `${speaker} | ${instruct} | ${text}`;

        // Lock covers ONLY building the prompt (act/file/line_override are
        // read synchronously by the graphToPrompt hook right here) -- not
        // the actual submit-and-wait below, so a second re-voice click
        // doesn't have to wait for the first one's render to even START,
        // only for its prompt to finish being BUILT (fast).
        let promptResult;
        await withRevoiceSubmitLock(async () => {
            flActiveItem.set(node, { act, file, lineOverride });
            pendingRevoiceLineIndex = linePosition;
            pendingRevoiceTarget = (folder && baseName) ? { folder, baseName } : null;
            pendingRevoiceContentHash = contentHash || null;
            try {
                promptResult = await app.graphToPrompt();
            } finally {
                flActiveItem.delete(node);
                pendingRevoiceLineIndex = null;
                pendingRevoiceTarget = null;
                pendingRevoiceContentHash = null;
            }
        });

        console.log("[FL revoice] requested:", { act, file, linePosition, folder, baseName, contentHash, lineOverride });
        const promptId = await submitAndTrackPromptId(promptResult);
        console.log("[FL revoice] queued as prompt_id", promptId, "-- waiting for it to finish");
        const entry = await pollPromptCompletion(promptId);
        // The per-node prints from nodes/audio_post_process.py are the other
        // half of this trail: seeing this line WITHOUT an
        // "[FL CosyVoice3 AudioPostProcess] ---- run:" block in the ComfyUI
        // console means the node never executed, not that it failed to save.
        console.log("[FL revoice] prompt", promptId, "finished:", entry?.status?.status_str ?? "completed");
    };
}
