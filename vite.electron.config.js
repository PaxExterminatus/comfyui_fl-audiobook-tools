import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Dev-only preview of electron-ui/ -- no mock backend (unlike vite.config.js's
// dev-ui root): Phase 1's real Python server will back these API calls once
// it exists, so 404s from fetch calls here are expected for now.
export default defineConfig({
    root: "electron-ui",
    plugins: [vue()],
    server: {
        port: 5199,
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        "import.meta.env.VITE_API_BASE": JSON.stringify("http://127.0.0.1:8765"),
    },
});
