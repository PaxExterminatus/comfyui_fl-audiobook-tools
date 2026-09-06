import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Separate from vite.config.js on purpose: that file's config is a
// function branching on `build` vs `serve` for two unrelated jobs
// (bundling into web/, and the standalone dev server) -- keeping the test
// runner's config independent avoids either of those branches leaking
// into how tests transform/resolve modules.
export default defineConfig({
    plugins: [vue()],
    css: {
        preprocessorOptions: {
            sass: {
                // Kept in sync with vite.config.js's own additionalData --
                // see that file's comment for why this points at the one
                // src/sass/app.sass manifest instead of listing partials
                // here directly.
                additionalData: `@import "../sass/app"\n`,
            },
        },
    },
    test: {
        environment: "happy-dom",
        globals: false,
    },
});
