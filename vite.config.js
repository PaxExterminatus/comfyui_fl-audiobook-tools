import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Builds each Vue-based editor into a single ES module dropped straight
// into web/, replacing the hand-written file of the same name -- so
// script_library.js's `import { openRolesEditor } from "./roles_editor.js"`
// (and friends, as more editors migrate) needs zero changes. ComfyUI just
// serves everything under web/ as static files; there's no dev server
// integration here since this widget mounts into an already-loaded
// ComfyUI page, not its own standalone app -- run `npm run dev` (rebuild
// on save) and refresh the ComfyUI tab to see changes.
export default defineConfig({
    plugins: [vue()],
    // Library mode doesn't auto-replace process.env.NODE_ENV the way
    // Vite's normal app build does -- Vue's own ESM build still checks it
    // internally, and without this it throws "process is not defined" the
    // moment the bundle runs in a plain browser (no Node `process` global).
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
                // One self-contained file per entry (Vue/PrimeVue inlined) --
                // matches how every other file in web/ is already a
                // standalone ES module with no shared runtime chunk to load
                // alongside it.
                inlineDynamicImports: false,
            },
        },
    },
});
