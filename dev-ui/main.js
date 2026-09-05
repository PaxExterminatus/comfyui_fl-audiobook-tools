// Standalone dev entry -- `npm run dev:ui` serves this page directly (real
// Vite HMR, no ComfyUI, no Node build step needed for edits) with
// dev-ui/mock-api.js standing in for the real aiohttp backend, seeded from
// fixtures/*.json. Imports straight from src/, not the built web/*.js, so
// editing a .vue file here hot-reloads instantly.
import { openRolesEditor } from "../src/roles_editor/main.js";
import { openBrowseDialog } from "../src/browse_dialog/main.js";

// Any string works -- the mock backend matches requests by filename
// suffix (_roles.json, _instructions.json, ...), not the literal path.
const FAKE_PROJECT_ROOT = "C:\\fake\\project";

function open() {
    openRolesEditor({ root: FAKE_PROJECT_ROOT, suffix: "_speakers.txt" });
}

document.getElementById("open-roles").addEventListener("click", open);
document.getElementById("open-browse-folder").addEventListener("click", () => {
    openBrowseDialog({
        mode: "folder",
        startPath: FAKE_PROJECT_ROOT,
        onSelect: (path) => console.log("[dev-ui] folder selected:", path),
    });
});
document.getElementById("open-browse-file").addEventListener("click", () => {
    openBrowseDialog({
        mode: "file",
        ext: ".txt",
        startPath: FAKE_PROJECT_ROOT,
        onSelect: (path) => console.log("[dev-ui] file selected:", path),
    });
});
open(); // open immediately on load too, for a one-click `npm run dev:ui`
