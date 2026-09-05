// Standalone dev entry -- `npm run dev:ui` serves this page directly (real
// Vite HMR, no ComfyUI, no Node build step needed for edits) with
// dev-ui/mock-api.js standing in for the real aiohttp backend, seeded from
// fixtures/*.json. Imports straight from src/, not the built web/*.js, so
// editing a .vue file here hot-reloads instantly.
import { openRolesEditor } from "../src/roles_editor/main.js";
import { openBrowseDialog } from "../src/browse_dialog/main.js";
import { mountScriptLibraryPanel } from "../src/script_library/main.js";
import { openLineEditor } from "../src/line_editor/main.js";

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
// Script Library isn't a floating dialog -- it mounts directly into a
// fixed-size host div standing in for the ComfyUI node body it normally
// renders into via node.addDOMWidget. Fake widget/node stand-ins only need
// the .value/.callback/.properties/.setDirtyCanvas surface this panel
// actually touches.
function makeFakeWidget(initial = "") {
    return { value: initial, callback: null };
}
const scriptLibraryPanel = mountScriptLibraryPanel({
    node: { properties: {}, _flCheckedItems: [], setDirtyCanvas: () => {} },
    folderWidget: makeFakeWidget(FAKE_PROJECT_ROOT),
    actWidget: makeFakeWidget(),
    filterWidget: makeFakeWidget("_speakers.txt"),
    scriptFileWidget: makeFakeWidget(),
    openBrowseDialog,
    openRolesEditor,
    openLineEditor: (opts) => console.log("[dev-ui] openLineEditor (not ported yet) called with:", opts),
    queueLineRevoice: async (node, opts) => console.log("[dev-ui] queueLineRevoice (stub) called with:", opts),
});
scriptLibraryPanel.element.style.cssText = "width:100%;height:100%;";
document.getElementById("script-library-host").appendChild(scriptLibraryPanel.element);

let devLineChecked = false;
document.getElementById("open-line-editor").addEventListener("click", () => {
    openLineEditor({
        folder: `${FAKE_PROJECT_ROOT}\\Act01`,
        filename: "Test_speakers.txt",
        suffix: "_speakers.txt",
        checkedApi: {
            isChecked: () => devLineChecked,
            setChecked: (fname, val) => { devLineChecked = val; console.log("[dev-ui] setChecked", fname, val); },
        },
        revoiceApi: {
            revoiceLine: (opts) => {
                console.log("[dev-ui] revoiceLine called with:", opts);
                return new Promise((resolve) => setTimeout(resolve, 600));
            },
        },
    });
});

open(); // open immediately on load too, for a one-click `npm run dev:ui`
