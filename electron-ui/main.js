import { openRolesEditor } from "../src/roles_editor/main.js";
import { openBrowseDialog } from "../src/browse_dialog/main.js";
import { mountScriptLibraryPanel } from "../src/script_library/main.js";
import { openLineEditor } from "../src/line_editor/main.js";
import {
    mountVoDubBrowserPanel,
    openVoDubLineEditor,
    openDubRolesEditor,
} from "../src/vo_dub_editor/main.js";
import HelpDialog from "../src/shared/HelpDialog.vue";
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { ensureStylesLinked } from "../src/shared/styles_link.js";
import { SCRIPT_LIBRARY_API, VO_DUB_API } from "../web/fl_common.js";

const projectRootInput = document.getElementById("project-root-input");
projectRootInput.value = localStorage.getItem("FL_Electron.projectRoot") || "";
projectRootInput.addEventListener("input", (e) => {
    localStorage.setItem("FL_Electron.projectRoot", e.target.value);
});

function getProjectRoot() {
    return projectRootInput.value;
}

function makeWidget(initial = "") {
    return { value: initial, callback: null };
}

const checkedApi = {
    isChecked: (fname) => {
        const checked = JSON.parse(localStorage.getItem("FL_Electron.checkedFiles") || "[]");
        return checked.includes(fname);
    },
    setChecked: (fname, val) => {
        let checked = JSON.parse(localStorage.getItem("FL_Electron.checkedFiles") || "[]");
        if (val) {
            if (!checked.includes(fname)) checked.push(fname);
        } else {
            checked = checked.filter(f => f !== fname);
        }
        localStorage.setItem("FL_Electron.checkedFiles", JSON.stringify(checked));
        console.log("[electron-ui] setChecked", fname, val);
    },
};

const revoiceApi = {
    revoiceLine: async ({ folder, baseName, linePosition, speaker, instruct, text }) => {
        const resp = await fetch(`${SCRIPT_LIBRARY_API}/render/line`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder, base_name: baseName, position: linePosition, speaker, instruct, text }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
        return data;
    },
};

const renderApi = {
    renderRow: async ({ audioKey }) => {
        const resp = await fetch(`${VO_DUB_API}/render/row`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ root: getProjectRoot(), audio_key: audioKey }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
        return data;
    },
};

const panelHost = document.getElementById("panel-host");

let activePanel = null;

function renderPanel(element, additionalUnmount = null) {
    if (activePanel) {
        activePanel.unmount();
        activePanel = null;
    }
    panelHost.replaceChildren();
    panelHost.appendChild(element);
    activePanel = { unmount: additionalUnmount || (() => {}) };
}

function renderVoicingMode() {
    // TODO: use SCRIPT_LIBRARY_API for real calls once Phase 1 is ready
    const panel = mountScriptLibraryPanel({
        node: { properties: {}, _flCheckedItems: [], setDirtyCanvas: () => {} },
        folderWidget: makeWidget(getProjectRoot()),
        actWidget: makeWidget(),
        filterWidget: makeWidget("_speakers.txt"),
        scriptFileWidget: makeWidget(),
        openBrowseDialog,
        openRolesEditor,
        openLineEditor,
        queueLineRevoice: async (node, opts) => revoiceApi.revoiceLine(opts),
    });
    renderPanel(panel.element, () => panel.unmount());
}

function renderDubbingMode() {
    // TODO: use VO_DUB_API for real calls once Phase 1 is ready
    const panel = mountVoDubBrowserPanel({
        node: { properties: {}, setDirtyCanvas: () => {} },
        projectRootWidget: makeWidget(getProjectRoot()),
        openBrowseDialog,
        openVoDubLineEditor: (opts) => openVoDubLineEditor({ ...opts, renderApi: renderApi }),
        openDubRolesEditor,
        queueVoDubRender: async (node, opts) => renderApi.renderRow(opts),
    });
    renderPanel(panel.element, () => panel.unmount());
}

const MODES = {
    voicing: { render: renderVoicingMode, helpComponent: "ScriptLibraryPanel" },
    dubbing: { render: renderDubbingMode, helpComponent: "VoDubBrowserPanel" },
};

let currentMode = "voicing";

const voicingBtn = document.getElementById("mode-voicing-btn");
const dubbingBtn = document.getElementById("mode-dubbing-btn");
const helpBtn = document.getElementById("help-btn");

function selectMode(mode) {
    currentMode = mode;
    voicingBtn.classList.toggle("active", mode === "voicing");
    dubbingBtn.classList.toggle("active", mode === "dubbing");
    MODES[mode].render();
}

voicingBtn.addEventListener("click", () => selectMode("voicing"));
dubbingBtn.addEventListener("click", () => selectMode("dubbing"));

// Same ephemeral-mount pattern as src/roles_editor/main.js's openRolesEditor
// -- a fresh container appended to document.body, torn down on close.
function openHelp(componentName) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const app = createApp(HelpDialog, {
        visible: true,
        component: componentName,
        "onUpdate:visible": (visible) => {
            if (!visible) {
                app.unmount();
                container.remove();
            }
        },
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(container);
}

helpBtn.addEventListener("click", () => openHelp(MODES[currentMode].helpComponent));

selectMode("voicing");
