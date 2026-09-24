/*
 Vue/PrimeVue entry point for the Roles Editor -- pilot for migrating
 this addon's editors off hand-written vanilla-JS DOM manipulation.
 Exports the EXACT SAME `openRolesEditor({root, suffix})` signature the
 old web/roles_editor.js did, so web/script_library.js's
 `import { openRolesEditor } from "./roles_editor.js"` needs zero
 changes -- this built file replaces that one directly (see
 vite.config.js: outDir is "web", fileName is "roles_editor.js").
*/
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import RolesEditorApp from "./RolesEditorApp.vue";
import { ensureStylesLinked } from "../shared/styles_link.js";

/**
 * @param {Object} opts
 * @param {string} opts.root - absolute path to the project root (contains _roles.json).
 * @param {string} [opts.suffix] - script_filter, passed through to the project-wide stale-marking scan.
 */
export function openRolesEditor({ root, suffix = "" }) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const app = createApp(RolesEditorApp, {
        root,
        suffix,
        onClose: () => {
            app.unmount();
            container.remove();
        },
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(container);
}
