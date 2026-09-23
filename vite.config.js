import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { mockComfyApiPlugin } from "./dev-ui/mock-api.js";

export default defineConfig(({ command }) => {
    const isServe = command === "serve";

    return {
        root: isServe ? "dev-ui" : undefined,
        plugins: [vue(), ...(isServe ? [mockComfyApiPlugin()] : [])],
        css: {
            preprocessorOptions: {
                sass: {
                    additionalData: `@use "../sass/app" as *\n`,
                },
            },
        },
        define: {
            "process.env.NODE_ENV": JSON.stringify("production"),
        },
        build: {
            outDir: "web",
            emptyOutDir: false,
            lib: {
                entry: {
                    roles_editor: "src/roles_editor/main.js",
                    browse_dialog: "src/browse_dialog/main.js",
                    script_library_panel: "src/script_library/main.js",
                    line_editor: "src/line_editor/main.js",
                    vo_dub_editor: "src/vo_dub_editor/main.js",
                },
                formats: ["es"],
                fileName: (_format, entryName) => `${entryName}.js`,
            },
            rollupOptions: {
                output: {
                    inlineDynamicImports: false,
                    chunkFileNames: "[name].js",
                },
            },
        },
    };
});
