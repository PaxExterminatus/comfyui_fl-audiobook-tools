// Standalone dev entry -- `npm run dev:ui` serves this page directly (real
// Vite HMR, no ComfyUI, no Node build step needed for edits) with
// dev-ui/mock-api.js standing in for the real aiohttp backend, seeded from
// fixtures/*.json. Imports straight from src/, not the built web/*.js, so
// editing a .vue file here hot-reloads instantly.
import { openRolesEditor } from "../src/roles_editor/main.js";

// Any string works -- the mock backend matches requests by filename
// suffix (_roles.json, _instructions.json, ...), not the literal path.
const FAKE_PROJECT_ROOT = "C:\\fake\\project";

function open() {
    openRolesEditor({ root: FAKE_PROJECT_ROOT, suffix: "_speakers.txt" });
}

document.getElementById("open-roles").addEventListener("click", open);
open(); // open immediately on load too, for a one-click `npm run dev:ui`
