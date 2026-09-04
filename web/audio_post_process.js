// FL CosyVoice3 Audio Post-Process: adds a "📄 Report" button to the node
// that opens a full-screen, read-only view of the per-item trim/fade/
// loudness report the Python side sends back via the "ui" channel after
// every run -- see nodes/audio_post_process.py's process() return value.
// No need to wire the `report` STRING output into a separate text node
// just to read it.
import { app } from "../../scripts/app.js";
import { openTextViewer } from "./ui_kit.js";

app.registerExtension({
    name: "FL_CosyVoice3.AudioPostProcess",
    async nodeCreated(node) {
        if (node.comfyClass !== "FL_CosyVoice3_AudioPostProcess") return;

        node._flReport = "No report yet -- run the node first.";

        node.addWidget("button", "📄 Report", null, () => {
            openTextViewer({
                title: "FL CosyVoice3 Audio Post-Process — Report",
                text: node._flReport,
            });
        }, { serialize: false });

        const origOnExecuted = node.onExecuted;
        node.onExecuted = function (message) {
            const result = origOnExecuted ? origOnExecuted.apply(this, arguments) : undefined;
            const report = message?.report?.[0];
            if (typeof report === "string") node._flReport = report;
            return result;
        };
    },
});
