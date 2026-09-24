/*
 Vue/PrimeVue entry point for the VO Dub Library node's UI -- two mount
 functions, mirroring the two existing shapes this addon already has:
 `mountVoDubBrowserPanel` (inline node widget, like
 script_library_panel.js's mountScriptLibraryPanel) and
 `openVoDubLineEditor` (floating, non-modal dialog, like line_editor.js's
 openLineEditor). See nodes/vo_dub_library.py's module docstring for why
 this is a separate node/UI rather than a mode flag on Script Library.
*/
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import VoDubBrowserPanel from "./VoDubBrowserPanel.vue";
import VoDubLineEditor from "./VoDubLineEditor.vue";
import DubRolesEditorApp from "./DubRolesEditorApp.vue";
import { ensureStylesLinked } from "../shared/styles_link.js";

/**
 * @param {Object} opts
 * @param {Object} opts.node - the ComfyUI node instance.
 * @param {Object} opts.projectRootWidget - the (hidden) "project_root" widget.
 * @param {(opts: object) => void} opts.openBrowseDialog - from browse_dialog.js.
 * @param {(opts: object) => void} opts.openVoDubLineEditor - from this same module.
 * @param {(opts: object) => void} opts.openDubRolesEditor - from this same module.
 * @param {(node: object, opts: object) => Promise<void>} opts.queueVoDubRender - from web/vo_dub_library.js's own module scope.
 * @returns {{element: HTMLElement, unmount: () => void}}
 */
export function mountVoDubBrowserPanel({ node, projectRootWidget, openBrowseDialog, openVoDubLineEditor, openDubRolesEditor, queueVoDubRender }) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    container.style.cssText = "width:100%;height:100%;box-sizing:border-box;";

    const app = createApp(VoDubBrowserPanel, {
        node,
        projectRootWidget,
        openBrowseDialog,
        openVoDubLineEditor,
        openDubRolesEditor,
        queueVoDubRender,
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(container);

    return { element: container, unmount: () => app.unmount() };
}

/**
 * @param {Object} opts
 * @param {string} opts.root - absolute path to the VO dub project root.
 * @param {string} opts.bucket - which bucket (e.g. "E1", "Other") to open.
 * @param {Object} [opts.renderApi] - {renderRow({audioKey, speaker, instruct, russianText, outputPath}) => Promise}
 */
export function openVoDubLineEditor({ root, bucket, renderApi }) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const app = createApp(VoDubLineEditor, {
        root,
        bucket,
        renderApi: renderApi || null,
        onClose: () => {
            app.unmount();
            container.remove();
        },
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(container);
}

/**
 * @param {Object} opts
 * @param {string} opts.root - absolute path to the VO dub project root.
 */
export function openDubRolesEditor({ root }) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const app = createApp(DubRolesEditorApp, {
        root,
        onClose: () => {
            app.unmount();
            container.remove();
        },
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(container);
}
