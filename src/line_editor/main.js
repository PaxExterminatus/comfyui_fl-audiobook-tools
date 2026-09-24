/*
 Vue/PrimeVue entry point for the Line Editor. Exports the EXACT SAME
 `openLineEditor({folder, filename, suffix, checkedApi, revoiceApi})`
 signature the old web/line_editor.js did, so web/script_library.js's
 `import { openLineEditor } from "./line_editor.js"` needs zero changes
 -- this built file replaces that one directly (see vite.config.js:
 outDir is "web", fileName is "line_editor.js").
*/
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import LineEditorApp from "./LineEditorApp.vue";
import { ensureStylesLinked } from "../shared/styles_link.js";

/**
 * @param {Object} opts
 * @param {string} opts.folder - absolute path to the act folder containing filename.
 * @param {string} opts.filename
 * @param {string} [opts.suffix]
 * @param {Object} [opts.checkedApi] - {isChecked(fname), setChecked(fname, val)}
 * @param {Object} [opts.revoiceApi] - {revoiceLine({linePosition, speaker, instruct, text}) => Promise}
 */
export function openLineEditor({ folder, filename, suffix = "", checkedApi, revoiceApi }) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const app = createApp(LineEditorApp, {
        folder,
        filename,
        suffix,
        checkedApi: checkedApi || null,
        revoiceApi: revoiceApi || null,
        onClose: () => {
            app.unmount();
            container.remove();
        },
    });
    app.use(PrimeVue, { ripple: true });
    app.use(ConfirmationService);
    app.mount(container);
}
