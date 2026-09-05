// Links web/fl_shared.css into <head> once -- the shared stylesheet for
// this addon's remaining hand-written vanilla-JS widgets (script_editor.js's
// browse button, ui_kit.js's openTextViewer). Everything else has moved to
// Vue + PrimeVue with its own scoped styles and no longer calls this at
// all -- see src/shared/styles_link.js for that side's equivalent.
//
// Authored as web/fl_shared.sass and compiled to this .css by
// scripts/compile-vanilla-sass.mjs (npm run build/dev) -- real Sass, not
// a CSS-in-JS template string, so it gets normal syntax highlighting/
// linting and shares src/sass/_variables.sass's tokens with every Vue
// component's own Sass.
const STYLE_ID = "fl-cosyvoice3-styles";

// Bump any time fl_shared.sass's content changes -- without a version on
// the URL, browsers cache the compiled .css indefinitely (unversioned
// filename, no build hash), so an edit would otherwise show stale/broken
// styling until a hard refresh.
const STYLE_VERSION = 3;

export function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = new URL(`./fl_shared.css?v=${STYLE_VERSION}`, import.meta.url).href;
    document.head.appendChild(link);
}
