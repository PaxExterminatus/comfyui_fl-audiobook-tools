// Standalone dev entry -- `npm run dev:ui` serves this page directly (real
// Vite HMR, no ComfyUI, no Node build step needed for edits) with
// dev-ui/mock-api.js standing in for the real aiohttp backend, seeded from
// fixtures/*.json. Imports straight from src/, not the built web/*.js, so
// editing a .vue file here hot-reloads instantly.
//
// This is a real single-page app shell over the same 5 tools ComfyUI
// embeds individually: a sidebar switches the main content area between
// panel-style components (Script Library, VO Dub Editor -- these mount
// into a fixed host, same as node.addDOMWidget does in-app) and
// dialog-style components (Roles Editor, Browse Dialog, Line Editor --
// always floating overlays, so their "page" is just a launcher button).
import { openRolesEditor } from "../src/roles_editor/main.js";
import { openBrowseDialog } from "../src/browse_dialog/main.js";
import { mountScriptLibraryPanel } from "../src/script_library/main.js";
import { openLineEditor } from "../src/line_editor/main.js";
import {
    mountVoDubBrowserPanel,
    openVoDubLineEditor,
    openDubRolesEditor,
} from "../src/vo_dub_editor/main.js";

// Any string works -- the mock backend matches requests by filename
// suffix (_roles.json, _instruct_categories.json, ...), not the literal path.
const FAKE_PROJECT_ROOT = "C:\\fake\\project";

function makeFakeWidget(initial = "") {
    return { value: initial, callback: null };
}

// Shared fake checkedApi/revoiceApi -- both the tree's own row (pencil) button
// and the standalone "Open Line Editor" tool open the same real
// openLineEditor(), so they share the same stand-ins rather than each
// rolling their own.
let devLineChecked = false;
const fakeCheckedApi = {
    isChecked: () => devLineChecked,
    setChecked: (fname, val) => {
        devLineChecked = val;
        console.log("[dev-ui] setChecked", fname, val);
    },
};
const fakeRevoiceApi = {
    revoiceLine: (opts) => {
        console.log("[dev-ui] revoiceLine called with:", opts);
        return new Promise((resolve) => setTimeout(resolve, 600));
    },
};
const fakeVoDubRenderApi = {
    renderRow: (opts) => {
        console.log("[dev-ui] vo_dub renderRow called with:", opts);
        return new Promise((resolve) => setTimeout(resolve, 600));
    },
};

const sidebar = document.getElementById("sidebar");
const panelHost = document.getElementById("panel-host");

// Tracks the currently mounted panel-style component so we can unmount it
// cleanly before swapping to a different tool.
let activePanel = null;

function clearPanelHost() {
    if (activePanel) {
        activePanel.unmount();
        activePanel = null;
    }
    panelHost.replaceChildren();
}

function renderLauncher(description, buttons) {
    clearPanelHost();
    const wrap = document.createElement("div");
    wrap.className = "dialog-launcher";

    const p = document.createElement("p");
    p.textContent = description;
    wrap.appendChild(p);

    for (const { label, onClick } of buttons) {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.addEventListener("click", onClick);
        wrap.appendChild(btn);
    }
    panelHost.appendChild(wrap);
}

function renderScriptLibrary() {
    clearPanelHost();
    activePanel = mountScriptLibraryPanel({
        node: { properties: {}, _flCheckedItems: [], setDirtyCanvas: () => {} },
        folderWidget: makeFakeWidget(FAKE_PROJECT_ROOT),
        actWidget: makeFakeWidget(),
        filterWidget: makeFakeWidget("_speakers.txt"),
        scriptFileWidget: makeFakeWidget(),
        openBrowseDialog,
        openRolesEditor,
        openLineEditor,
        queueLineRevoice: async (node, opts) => fakeRevoiceApi.revoiceLine(opts),
    });
    panelHost.appendChild(activePanel.element);
}

function renderRolesEditor() {
    renderLauncher(
        "Roles Editor is always a floating dialog in-app -- there's no embedded view for it, just this launcher.",
        [
            {
                label: "Open Roles Editor",
                onClick: () => openRolesEditor({ root: FAKE_PROJECT_ROOT, suffix: "_speakers.txt" }),
            },
        ],
    );
}

function renderBrowseDialog() {
    renderLauncher(
        "Browse Dialog is a shared floating picker used by the other tools -- both demo modes below use the same component.",
        [
            {
                label: "Open Browse Dialog (folder)",
                onClick: () =>
                    openBrowseDialog({
                        mode: "folder",
                        startPath: FAKE_PROJECT_ROOT,
                        onSelect: (path) => console.log("[dev-ui] folder selected:", path),
                    }),
            },
            {
                label: "Open Browse Dialog (file)",
                onClick: () =>
                    openBrowseDialog({
                        mode: "file",
                        ext: ".txt",
                        startPath: FAKE_PROJECT_ROOT,
                        onSelect: (path) => console.log("[dev-ui] file selected:", path),
                    }),
            },
        ],
    );
}

function renderLineEditor() {
    renderLauncher(
        "Line Editor is always a floating dialog in-app -- there's no embedded view for it, just this launcher.",
        [
            {
                label: "Open Line Editor",
                onClick: () =>
                    openLineEditor({
                        folder: `${FAKE_PROJECT_ROOT}\\Act01`,
                        filename: "Test_speakers.txt",
                        suffix: "_speakers.txt",
                        checkedApi: fakeCheckedApi,
                        revoiceApi: fakeRevoiceApi,
                    }),
            },
        ],
    );
}

function renderVoDubEditor() {
    clearPanelHost();
    activePanel = mountVoDubBrowserPanel({
        node: { properties: {}, setDirtyCanvas: () => {} },
        projectRootWidget: makeFakeWidget(FAKE_PROJECT_ROOT),
        openBrowseDialog,
        openVoDubLineEditor: (opts) => openVoDubLineEditor({ ...opts, renderApi: fakeVoDubRenderApi }),
        openDubRolesEditor,
        queueVoDubRender: async (node, opts) => fakeVoDubRenderApi.renderRow(opts),
    });
    panelHost.appendChild(activePanel.element);
}

const TOOLS = {
    script_library: renderScriptLibrary,
    roles_editor: renderRolesEditor,
    browse_dialog: renderBrowseDialog,
    line_editor: renderLineEditor,
    vo_dub_editor: renderVoDubEditor,
};

function selectTool(name) {
    for (const btn of sidebar.querySelectorAll("button[data-tool]")) {
        btn.classList.toggle("active", btn.dataset.tool === name);
    }
    TOOLS[name]();
}

sidebar.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tool]");
    if (btn) selectTool(btn.dataset.tool);
});

// Land on Script Library by default -- it's the tool's actual entry point
// in-app (the node users open first).
selectTool("script_library");
