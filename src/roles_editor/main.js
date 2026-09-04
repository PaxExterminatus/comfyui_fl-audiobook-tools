// Vue/PrimeVue entry point for the Roles Editor -- pilot for migrating
// this addon's editors off hand-written vanilla-JS DOM manipulation.
// Exports the EXACT SAME `openRolesEditor({root, suffix})` signature the
// old web/roles_editor.js did, so web/script_library.js's
// `import { openRolesEditor } from "./roles_editor.js"` needs zero
// changes -- this built file replaces that one directly (see
// vite.config.js: outDir is "web", fileName is "roles_editor.js").
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import RolesEditorApp from "./RolesEditorApp.vue";

// Vite extracts CSS imported from .vue <style> blocks / here into a
// sibling style.css next to the built JS (Vite's lib-mode default name
// for a single entry's CSS, NOT the entry's own name) -- injected as a
// <link> below via a URL relative to this module's own location, so it
// works regardless of what path ComfyUI actually serves
// /extensions/comfyui_fl-audiobook-tools/ under. NOTE: if a second Vue
// entry is added later, check vite's output naming again -- multiple
// entries may need an explicit `build.rollupOptions.output.assetFileNames`
// to keep each entry's CSS separately named.
import "primevue/resources/themes/lara-dark-teal/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// Bump this any time the built CSS could have changed (a new build of
// this or any other Vue-migrated editor sharing style.css) -- without a
// version on the URL, browsers cache style.css indefinitely (it's an
// unversioned filename with no build hash), so an update to this addon
// would otherwise show a stale, possibly broken UI until the user
// happens to hard-refresh ComfyUI's page.
const STYLE_VERSION = 4;

let stylesLinked = false;
function ensureStylesLinked() {
    if (stylesLinked) return;
    stylesLinked = true;
    const href = new URL(/* @vite-ignore */ `./style.css?v=${STYLE_VERSION}`, import.meta.url).href;
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
}

/**
 * @param {Object} opts
 * @param {string} opts.root - absolute path to the project root (contains _roles.json).
 * @param {string} [opts.suffix] - script_filter, passed through to the project-wide stale-marking scan.
 */
export function openRolesEditor({ root, suffix = "_speakers.txt" }) {
    ensureStylesLinked();

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
