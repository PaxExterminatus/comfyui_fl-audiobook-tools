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
import TranslationSimilarityRadar from "../src/shared/TranslationSimilarityRadar.vue";
import TranslationSimilarityCompact from "../src/shared/TranslationSimilarityCompact.vue";
import MarkdownReader from "../src/shared/MarkdownReader.vue";
import BrowseDialogContent from "../src/browse_dialog/BrowseDialogContent.vue";
import RolesEditorContent from "../src/roles_editor/RolesEditorContent.vue";
import LineEditorContent from "../src/line_editor/LineEditorContent.vue";
import VoDubLineEditorContent from "../src/vo_dub_editor/VoDubLineEditorContent.vue";
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { ensureStylesLinked } from "../src/shared/styles_link.js";

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

function renderWithGuide(mainElement, componentName, additionalUnmount = null) {
    clearPanelHost();

    const container = document.createElement("div");
    container.style.cssText = "display: flex; flex-direction: column; gap: 20px; width: 100%; box-sizing: border-box;";

    container.appendChild(mainElement);

    const guideDiv = document.createElement("div");
    container.appendChild(guideDiv);

    const guideApp = createApp(MarkdownReader, { component: componentName });
    guideApp.mount(guideDiv);

    panelHost.appendChild(container);

    activePanel = {
        unmount: () => {
            guideApp.unmount();
            if (additionalUnmount) additionalUnmount();
        }
    };
}

function renderLauncher(description, buttons, componentName) {
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
    renderWithGuide(wrap, componentName);
}

function renderScriptLibrary() {
    const panel = mountScriptLibraryPanel({
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
    renderWithGuide(panel.element, "ScriptLibraryPanel", () => panel.unmount());
}

function renderRolesEditor() {
    ensureStylesLinked(import.meta.url);

    const host = document.createElement("div");
    host.style.cssText = "width: 100%; max-width: 900px;";

    const app = createApp(RolesEditorContent, {
        root: FAKE_PROJECT_ROOT,
        suffix: "_speakers.txt",
        onClose: () => console.log("[dev-ui] roles editor onClose (no-op when embedded)"),
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(host);

    renderWithGuide(host, "RolesEditorApp", () => app.unmount());
}

function renderBrowseDialog() {
    ensureStylesLinked(import.meta.url);

    const grid = document.createElement("div");
    grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; width: 100%;";

    const modes = [
        { title: "mode: \"folder\"", mode: "folder", ext: "" },
        { title: "mode: \"file\"", mode: "file", ext: ".txt" },
    ];
    const apps = [];
    for (const { title, mode, ext } of modes) {
        const card = document.createElement("div");
        card.style.cssText = "display: flex; flex-direction: column; background: #1e1e22; border: 1px solid #333; border-radius: 8px; padding: 12px;";
        const label = document.createElement("div");
        label.textContent = title;
        label.style.cssText = "color: #ccc; font-size: 12px; font-weight: 600; margin-bottom: 8px;";
        card.appendChild(label);

        const host = document.createElement("div");
        card.appendChild(host);
        grid.appendChild(card);

        const app = createApp(BrowseDialogContent, {
            mode,
            ext,
            startPath: FAKE_PROJECT_ROOT,
            onSelect: (path) => console.log(`[dev-ui] ${mode} selected:`, path),
            onClose: () => console.log("[dev-ui] browse dialog onClose (no-op when embedded)"),
        });
        app.use(PrimeVue, { ripple: true });
        app.mount(host);
        apps.push(app);
    }

    renderWithGuide(grid, "BrowseDialogApp", () => apps.forEach((app) => app.unmount()));
}

function renderLineEditor() {
    ensureStylesLinked(import.meta.url);

    const host = document.createElement("div");
    host.style.cssText = "width: 100%;";

    const app = createApp(LineEditorContent, {
        folder: `${FAKE_PROJECT_ROOT}\\Act01`,
        filename: "Test_speakers.txt",
        suffix: "_speakers.txt",
        checkedApi: fakeCheckedApi,
        revoiceApi: fakeRevoiceApi,
        onClose: () => console.log("[dev-ui] line editor onClose (no-op when embedded)"),
    });
    app.use(PrimeVue, { ripple: true });
    app.use(ConfirmationService);
    app.mount(host);

    renderWithGuide(host, "LineEditorApp", () => app.unmount());
}

function renderVoDubEditor() {
    const panel = mountVoDubBrowserPanel({
        node: { properties: {}, setDirtyCanvas: () => {} },
        projectRootWidget: makeFakeWidget(FAKE_PROJECT_ROOT),
        openBrowseDialog,
        openVoDubLineEditor: (opts) => openVoDubLineEditor({ ...opts, renderApi: fakeVoDubRenderApi }),
        openDubRolesEditor,
        queueVoDubRender: async (node, opts) => fakeVoDubRenderApi.renderRow(opts),
    });

    const wrap = document.createElement("div");
    wrap.style.cssText = "display: flex; flex-direction: column; gap: 20px; width: 100%;";
    wrap.appendChild(panel.element);

    const lineEditorLabel = document.createElement("div");
    lineEditorLabel.textContent = "VoDubLineEditor (встроенный, отдельно от плавающего диалога -- бакет E1)";
    lineEditorLabel.style.cssText = "color: #ccc; font-size: 12px; font-weight: 600;";
    wrap.appendChild(lineEditorLabel);

    const lineEditorHost = document.createElement("div");
    wrap.appendChild(lineEditorHost);

    const lineEditorApp = createApp(VoDubLineEditorContent, {
        root: FAKE_PROJECT_ROOT,
        bucket: "E1",
        renderApi: fakeVoDubRenderApi,
        onClose: () => console.log("[dev-ui] vo dub line editor onClose (no-op when embedded)"),
    });
    lineEditorApp.use(PrimeVue, { ripple: true });
    lineEditorApp.mount(lineEditorHost);

    renderWithGuide(wrap, "VoDubBrowserPanel", () => {
        panel.unmount();
        lineEditorApp.unmount();
    });
}

// A small palette of test cases spanning the score range -- lets you see at
// a glance how the radar reacts to a solid translation vs. specific kinds
// of drift (dropped punctuation/number, length blowup), not just one example.
const TRANSLATION_RADAR_SAMPLES = [
    {
        title: "Хороший перевод",
        original: "The quick brown fox jumps over the lazy dog. Voice synthesis requires accurate timing and expressive delivery.",
        translation: "Быстрая бурая лиса прыгает через ленивую собаку. Синтез речи требует точного тайминга и выразительной подачи.",
    },
    {
        title: "Короткая фраза (чувствительна к коэффициенту длины)",
        original: "Chapter 5: The beginning.",
        translation: "Глава 5: Начало.",
    },
    {
        title: "Пропали вопрос, восклицание и число",
        original: "Is it midnight already? We have 12 hours left!",
        translation: "Уже за полночь.",
    },
    {
        title: "Перевод сильно длиннее оригинала",
        original: "Yes.",
        translation: "Да, конечно, именно так, как я и думал с самого начала этой истории.",
    },
];

function renderTranslationRadar() {
    ensureStylesLinked(import.meta.url);

    const grid = document.createElement("div");
    grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; width: 100%; box-sizing: border-box; align-content: start;";

    const apps = [];
    for (const sample of TRANSLATION_RADAR_SAMPLES) {
        const card = document.createElement("div");
        card.style.cssText = "display: flex; flex-direction: column; align-items: center; background: #1e1e22; border: 1px solid #333; border-radius: 8px; padding: 12px;";

        const titleRow = document.createElement("div");
        titleRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;";
        const title = document.createElement("div");
        title.textContent = sample.title;
        title.style.cssText = "color: #ccc; font-size: 13px; font-weight: 600;";
        titleRow.appendChild(title);
        const compactHost = document.createElement("div");
        titleRow.appendChild(compactHost);
        card.appendChild(titleRow);

        const chartHost = document.createElement("div");
        card.appendChild(chartHost);

        const texts = document.createElement("div");
        texts.style.cssText = "width: 100%; margin-top: 10px; font-size: 12px; line-height: 1.4;";
        texts.innerHTML = `
            <div style="color:#888; margin-bottom:2px;"><b style="color:#aaa;">EN:</b> ${sample.original}</div>
            <div style="color:#888;"><b style="color:#aaa;">RU:</b> ${sample.translation}</div>
        `;
        card.appendChild(texts);

        grid.appendChild(card);

        const app = createApp(TranslationSimilarityRadar, {
            original: sample.original,
            translation: sample.translation,
        });
        app.mount(chartHost);
        apps.push(app);

        const compactApp = createApp(TranslationSimilarityCompact, {
            original: sample.original,
            translation: sample.translation,
        });
        compactApp.mount(compactHost);
        apps.push(compactApp);
    }

    renderWithGuide(grid, "TranslationSimilarityRadar", () => apps.forEach((app) => app.unmount()));
}

const TOOLS = {
    script_library: renderScriptLibrary,
    roles_editor: renderRolesEditor,
    browse_dialog: renderBrowseDialog,
    line_editor: renderLineEditor,
    vo_dub_editor: renderVoDubEditor,
    translation_radar: renderTranslationRadar,
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
