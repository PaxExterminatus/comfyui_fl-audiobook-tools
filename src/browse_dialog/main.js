/*
 Vue/PrimeVue entry point for the shared Browse Dialog. Exports the EXACT
 SAME `openBrowseDialog({mode, startPath, ext, onSelect})` signature the
 old web/browse_dialog.js did, so script_editor.js/script_library.js/
 line_editor.js's `import { openBrowseDialog } from "./browse_dialog.js"`
 need zero changes -- this built file replaces that one directly (see
 vite.config.js: outDir is "web", fileName is "browse_dialog.js").
*/
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import BrowseDialogApp from "./BrowseDialogApp.vue";
import { ensureStylesLinked } from "../shared/styles_link.js";

/**
 * @param {Object} opts
 * @param {"folder"|"file"} [opts.mode] - "folder": pick a directory. "file": pick a file (ext-filtered).
 * @param {string} [opts.startPath] - initial directory to list.
 * @param {string} [opts.ext] - file extension filter for "file" mode, e.g. ".txt".
 * @param {(result: string) => void} opts.onSelect - called with the chosen absolute path.
 */
export function openBrowseDialog({ mode = "folder", startPath = "", ext = "", onSelect }) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const app = createApp(BrowseDialogApp, {
        mode,
        startPath,
        ext,
        onSelect,
        onClose: () => {
            app.unmount();
            container.remove();
        },
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(container);
}
