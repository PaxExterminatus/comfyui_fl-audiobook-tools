import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { mockComfyApiPlugin } from "./dev-ui/mock-api.js";

export default defineConfig({
    root: "dev-ui",
    plugins: [vue(), mockComfyApiPlugin()],
});
