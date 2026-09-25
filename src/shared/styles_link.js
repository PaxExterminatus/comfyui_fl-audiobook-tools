/*
 Shared "make sure the built stylesheet is linked into <head>" helper for
 every Vue/PrimeVue entry in this addon (roles_editor, browse_dialog, and
 any editor migrated after them). Vite's lib mode bundles ALL entries'
 CSS (PrimeVue's theme + each entry's own <style> blocks) into ONE
 combined web/style.css regardless of which entry point runs first --
 whichever editor opens first calls ensureStylesLinked, links it once,
 and every other entry's call after that is a no-op (same resolved href,
 already present in <head>).

 The actual CSS imports live here, in exactly one place, so Vite only
 ever bundles PrimeVue's theme once even though every entry's main.js
 needs it.
*/
import "primevue/resources/themes/lara-dark-teal/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
/*
 Truly global (unscoped) rules no single component's <style scoped> can
 own -- see that file's own comment for why it lives here instead of
 inside the one editor that currently uses it.
*/
import "../sass/app.css";

/*
 Bump any time the built CSS could have changed -- without a version on
 the URL, browsers cache style.css indefinitely (unversioned filename, no
 build hash), so an update to any Vue-migrated editor sharing it would
 otherwise show stale/broken styling until a hard refresh.
*/
const STYLE_VERSION = 5;

let linked = false;

/**
 * @param {string} importMetaUrl - pass the CALLING entry module's own
 *   `import.meta.url` (not this module's) -- Vite lib mode inlines each
 *   entry into one self-contained file, so resolving the sibling
 *   style.css URL relative to the caller is what keeps this working
 *   regardless of what path ComfyUI actually serves this addon's web/
 *   folder under.
 */
export function ensureStylesLinked(importMetaUrl) {
    if (linked) return;
    linked = true;
    const href = new URL(/* @vite-ignore */ `./style.css?v=${STYLE_VERSION}`, importMetaUrl).href;
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
}
