import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { mockComfyApiPlugin } from "./dev-ui/mock-api.js";

// Two very different jobs share this one config, picked by which Vite
// command is running:
//
// `vite build` (npm run build / npm run dev, the watch-build variant) --
// builds each Vue-based editor into a single ES module dropped straight
// into web/, replacing the hand-written file of the same name -- so
// script_library.js's `import { openRolesEditor } from "./roles_editor.js"`
// (and friends, as more editors migrate) needs zero changes. ComfyUI just
// serves everything under web/ as static files.
//
// `vite` / `vite dev` (npm run dev:ui) -- a real standalone dev server
// serving dev-ui/index.html directly in a plain browser tab, no ComfyUI
// needed at all: mockComfyApiPlugin stands in for the aiohttp backend
// (seeded from fixtures/*.json), and Vite's normal HMR applies since
// dev-ui/main.js imports straight from src/, not a built bundle.
export default defineConfig(({ command }) => {
    const isServe = command === "serve";

    return {
        root: isServe ? "dev-ui" : undefined,
        plugins: [vue(), ...(isServe ? [mockComfyApiPlugin()] : [])],
        // Library mode doesn't auto-replace process.env.NODE_ENV the way
        // Vite's normal app build does -- Vue's own ESM build still checks
        // it internally, and without this it throws "process is not
        // defined" the moment the bundle runs in a plain browser (no Node
        // `process` global). Harmless to also set for the dev server.
        define: {
            "process.env.NODE_ENV": JSON.stringify("production"),
        },
        build: {
            outDir: "web",
            emptyOutDir: false, // web/ also holds the other, not-yet-migrated hand-written editors
            lib: {
                entry: {
                    roles_editor: "src/roles_editor/main.js",
                    browse_dialog: "src/browse_dialog/main.js",
                },
                formats: ["es"],
                fileName: (_format, entryName) => `${entryName}.js`,
            },
            rollupOptions: {
                output: {
                    inlineDynamicImports: false,
                    // With 2+ Vue entries, Rollup factors their shared
                    // dependencies (Vue itself, PrimeVue's Dialog/Button/
                    // etc.) into a common chunk rather than inlining Vue
                    // wholesale into every single editor -- each entry's
                    // own file just adds a plain relative `import` for it,
                    // which resolves fine under ComfyUI's static file
                    // serving regardless of what path the addon is mounted
                    // under. Rollup's default naming for that chunk
                    // includes a content hash; since `emptyOutDir: false`
                    // never cleans web/ (it also holds the other,
                    // not-yet-migrated hand-written editors), a hashed name
                    // would leave one more orphaned file behind on every
                    // rebuild. A stable name means each rebuild overwrites
                    // the same file instead -- exactly how every entry's
                    // own fileName above already works.
                    chunkFileNames: "[name].js",
                },
            },
        },
    };
});
