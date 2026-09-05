// Compiles web/fl_shared.sass -> web/fl_shared.css. This one file sits
// outside Vite's module graph entirely (it's linked at runtime via a
// plain <link> tag from vanilla JS -- see web/styles.js's
// injectStyles() -- never `import`ed by anything Vite processes), so it
// can't ride along with the Vue components' own Sass compilation the way
// vite.config.js's additionalData handles those; this is its own tiny
// build step instead, run before `vite build` (see package.json).
import { compile } from "sass";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(__dirname, "..", "web", "fl_shared.sass");
const outPath = path.resolve(__dirname, "..", "web", "fl_shared.css");

const result = compile(srcPath, { style: "expanded" });
fs.writeFileSync(outPath, result.css);
console.log(`[compile-vanilla-sass] wrote ${path.relative(process.cwd(), outPath)} (${result.css.length} bytes)`);
