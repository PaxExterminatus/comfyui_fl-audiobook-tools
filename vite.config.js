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
                },
                formats: ["es"],
                fileName: (_format, entryName) => `${entryName}.js`,
            },
            rollupOptions: {
                output: {
                    // One self-contained file per entry (Vue/PrimeVue
                    // inlined) -- matches how every other file in web/ is
                    // already a standalone ES module with no shared
                    // runtime chunk to load alongside it.
                    inlineDynamicImports: false,
                },
            },
        },
    };
});
