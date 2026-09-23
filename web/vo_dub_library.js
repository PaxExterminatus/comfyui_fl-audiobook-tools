import { app } from "../../scripts/app.js";
import { hideWidget } from "./ui_kit.js";
import { openBrowseDialog } from "./browse_dialog.js";
import { mountVoDubBrowserPanel, openVoDubLineEditor, openDubRolesEditor } from "./vo_dub_editor.js";
import {
    findNodesByClass, findPromptEntry, stripDownstreamAudioSavers,
    makeSubmitLock, submitAndTrackPromptId, pollPromptCompletion,
} from "./fl_queue_orchestration.js";

// FL CosyVoice3 VO Dub Library: node-lifecycle wiring (hiding native
// widgets, mounting the browser panel, node resize/cleanup) -- the actual
// UI lives in src/vo_dub_editor/ (built to vo_dub_editor.js). See
// nodes/vo_dub_library.py's module docstring for why this is a separate
// node from Script Library rather than a mode flag on it.
//
// Unlike Script Library, there is no checked-items BATCH loop here (VO Dub
// renders exactly one row at a time via the editor's own 🔁 button -- see
// this repo's README, "bulk render" is explicitly a later step) -- so only
// a graphToPrompt hook is needed, no app.queuePrompt patch: one render
// button click submits exactly one prompt.
const PANEL_MIN_HEIGHT = 32 + 90 + 18; // toolbar 32, bucket list ~90, status line 18
const VO_DUB_CLASS = "FL_CosyVoice3_VODubLibrary";
const POST_PROCESS_CLASS = "FL_CosyVoice3_AudioPostProcess";

// node -> {lineOverride, outputPath} for the render CURRENTLY being
// submitted (set for the brief synchronous window graphToPrompt reads it
// in, same lifetime as script_library.js's own flActiveItem).
const voDubActiveRow = new WeakMap();

// Assigned inside the patch guard below -- exposed here so
// VoDubBrowserPanel.vue's click handler (via mountVoDubBrowserPanel) can
// call it.
let queueVoDubRender = null;

if (!app._flVoDubPatched) {
    app._flVoDubPatched = true;

    const _origGraphToPrompt = app.graphToPrompt;
    app.graphToPrompt = async function (...args) {
        const result = await _origGraphToPrompt.apply(this, args);
        try {
            const prompt = result?.output;
            if (prompt && typeof prompt === "object") {
                let drovePrompt = false;
                for (const node of findNodesByClass(VO_DUB_CLASS)) {
                    if (!voDubActiveRow.has(node)) continue;
                    const entry = findPromptEntry(prompt, node, VO_DUB_CLASS);
                    if (!entry) continue;
                    const item = voDubActiveRow.get(node);
                    entry.inputs = entry.inputs || {};
                    entry.inputs.line_override = item.lineOverride;
                    drovePrompt = true;

                    const ppNodes = findNodesByClass(POST_PROCESS_CLASS);
                    const stamped = [];
                    for (const ppNode of ppNodes) {
                        const ppEntry = findPromptEntry(prompt, ppNode, POST_PROCESS_CLASS);
                        if (!ppEntry) continue;
                        ppEntry.inputs = ppEntry.inputs || {};
                        ppEntry.inputs.output_path_override = item.outputPath;
                        ppEntry.inputs.effect_override = item.effect || "";
                        ppEntry.inputs.dry_output_path_override = item.dryOutputPath || "";
                        stamped.push(ppEntry.inputs);
                    }
                    console.log("[FL VO Dub render] prompt built:", {
                        outputPath: item.outputPath,
                        postProcessNodesInGraph: ppNodes.length,
                        postProcessEntriesStamped: stamped.length,
                    });
                    if (ppNodes.length === 0) {
                        console.warn("[FL VO Dub render] no FL CosyVoice3 Audio Post-Process node in this graph -- nothing will write a file.");
                    } else if (stamped.length === 0) {
                        console.warn("[FL VO Dub render] Post-Process node(s) present in the graph but none matched an entry in the serialized prompt (muted/bypassed, or not reachable from an output node).");
                    }
                }
                if (drovePrompt) {
                    const stripped = stripDownstreamAudioSavers(prompt);
                    if (stripped.length) console.log("[FL VO Dub render] stripped downstream audio-saver node(s):", stripped);
                }
            }
        } catch (err) {
            console.error("FL_CosyVoice3.VODubLibrary: graphToPrompt hook failed", err);
        }
        return result;
    };

    const withVoDubSubmitLock = makeSubmitLock();

    // Runs `node`'s CURRENT graph exactly as a normal Run would (same
    // model as script_library.js's queueLineRevoice) but with
    // line_override forced to this one row's resolved
    // "speaker | instruct | text" (a 4th "| reference_wav" field when
    // referenceAudioPath is set -- FL CosyVoice3 Speaker Instruct2
    // Dialog's own live-reference-audio escape hatch, see that node's
    // module docstring; this file has no opinion about it beyond passing
    // it through as part of the SAME override string), every Post-Process
    // node's output_path_override forced to audio_ru\<audio_key>.wav,
    // effect_override forced to this row's chosen effect (e.g. "radio",
    // "" for none), and dry_output_path_override forced to
    // _dub_dry\<audio_key>.wav (the pre-effect reference copy
    // /vo_dub/apply_effect reprocesses later WITHOUT a full render) -- see
    // nodes/audio_post_process.py's own tooltips for all three.
    queueVoDubRender = async function (node, { audioKey, speaker, instruct, russianText, effect, outputPath, dryOutputPath, referenceAudioPath }) {
        const lineOverride = referenceAudioPath
            ? `${speaker} | ${instruct} | ${russianText} | ${referenceAudioPath}`
            : `${speaker} | ${instruct} | ${russianText}`;

        let promptResult;
        await withVoDubSubmitLock(async () => {
            voDubActiveRow.set(node, { lineOverride, outputPath, effect, dryOutputPath });
            try {
                promptResult = await app.graphToPrompt();
            } finally {
                voDubActiveRow.delete(node);
            }
        });

        console.log("[FL VO Dub render] requested:", {
            audioKey, outputPath, lineOverride, effect: effect || "(none)",
            referenceAudioPath: referenceAudioPath || "(none -- using a preset/role voice)",
        });
        const promptId = await submitAndTrackPromptId(promptResult);
        console.log("[FL VO Dub render] queued as prompt_id", promptId, "-- waiting for it to finish");
        const entry = await pollPromptCompletion(promptId);
        console.log("[FL VO Dub render] prompt", promptId, "finished:", entry?.status?.status_str ?? "completed");
    };
}

app.registerExtension({
    name: "FL_CosyVoice3.VODubLibrary",
    async nodeCreated(node) {
        if (node.comfyClass !== "FL_CosyVoice3_VODubLibrary") return;

        const projectRootWidget = node.widgets?.find((w) => w.name === "project_root");
        const lineOverrideWidget = node.widgets?.find((w) => w.name === "line_override");
        if (!projectRootWidget) return;

        hideWidget(node, projectRootWidget);
        if (lineOverrideWidget) hideWidget(node, lineOverrideWidget);

        const panel = mountVoDubBrowserPanel({
            node,
            projectRootWidget,
            openBrowseDialog,
            openVoDubLineEditor,
            openDubRolesEditor,
            // Assigned above, inside the patch guard -- already set by the
            // time any node's nodeCreated can fire (module top-level code
            // runs once on import, before ComfyUI calls nodeCreated).
            queueVoDubRender,
        });

        node.addDOMWidget("vo_dub_library_panel", "custom", panel.element, {
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
