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
                // `as *` re-exposes app.sass's @forward-ed variables/
                // placeholders without an "app." namespace prefix, the
                // closest match to the old @import-based "just works"
                // ergonomics (see src/style/app.sass's own comment).
                additionalData: `@use "../style/app" as *\n`,
            },
        },
    },
    test: {
        environment: "happy-dom",
        globals: false,
        // Registers the PrimeVue components globally for every mount(), the
        // same way the eight createApp sites do it for the real app. Without
        // it a template referencing Button or InputText silently resolves to
        // nothing here while working fine in the browser -- see
        // vitest.setup.js.
        setupFiles: ["./vitest.setup.js"],
    },
});
