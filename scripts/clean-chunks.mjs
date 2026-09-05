// Deletes every leftover Rollup shared-chunk file from web/ before a
// build. `vite.config.js` sets `build.emptyOutDir: false` (so a build
// never wipes the hand-written vanilla editors living alongside the Vue
// ones), but that also means a chunk Rollup shared in a PREVIOUS build
// and no longer shares in THIS one (its splitting heuristic shifts
// whenever the import graph across entries changes, e.g. one entry
// starts/stops using a component another entry also uses) is never
// cleaned up -- it just sits there, unreferenced by anything.
//
// Safe to always delete: every one of this addon's own entry files
// (roles_editor.js, browse_dialog.js, script_library_panel.js,
// line_editor.js) and every hand-written vanilla file (script_editor.js,
// script_library.js, audio_post_process.js, ui_kit.js, styles.js,
// fl_common.js) is named after ITSELF, never after the PrimeVue/Vue
// module it bundles -- only a genuine shared chunk is named
// "<module-basename>.esm.js" (see vite.config.js's `chunkFileNames`).
// Each build regenerates every chunk it actually still needs, so wiping
// all of them first just means "start from a clean slate", not "lose
// something a rebuild won't recreate".
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, "..", "web");

const removed = [];
for (const name of fs.readdirSync(webDir)) {
    if (name.endsWith(".esm.js")) {
        fs.unlinkSync(path.join(webDir, name));
        removed.push(name);
    }
}
if (removed.length) console.log(`[clean-chunks] removed: ${removed.join(", ")}`);
