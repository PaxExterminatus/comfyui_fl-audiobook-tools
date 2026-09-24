/*
 Vue/PrimeVue entry point for the Script Library node's tree panel.
 Unlike Roles Editor/Browse Dialog this isn't a floating overlay -- it
 mounts directly into a container that web/script_library.js hands to
 ComfyUI's node.addDOMWidget, so it renders inline as part of the node's
 own body on the canvas.
*/
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ScriptLibraryPanel from "./ScriptLibraryPanel.vue";
import { ensureStylesLinked } from "../shared/styles_link.js";

/**
 * @param {Object} opts
 * @param {Object} opts.node - the ComfyUI node instance.
 * @param {Object} opts.folderWidget - the (hidden) "folder_path" widget.
 * @param {Object} opts.actWidget - the (hidden) "act" widget.
 * @param {Object} [opts.filterWidget] - the (hidden) "script_filter" widget.
 * @param {Object} opts.scriptFileWidget - the (hidden) "script_file" widget.
 * @param {(opts: object) => void} opts.openBrowseDialog - from browse_dialog.js.
 * @param {(opts: object) => void} opts.openRolesEditor - from roles_editor.js.
 * @param {(opts: object) => void} opts.openLineEditor - from web/line_editor.js.
 * @param {(node: object, opts: object) => Promise<void>} opts.queueLineRevoice - from web/script_library.js's own module scope.
 * @returns {{element: HTMLElement, unmount: () => void}}
 */
export function mountScriptLibraryPanel({ node, folderWidget, actWidget, filterWidget, scriptFileWidget, openBrowseDialog, openRolesEditor, openLineEditor, queueLineRevoice }) {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    container.style.cssText = "width:100%;height:100%;box-sizing:border-box;";

    const app = createApp(ScriptLibraryPanel, {
        node,
        folderWidget,
        actWidget,
        filterWidget,
        scriptFileWidget,
        openBrowseDialog,
        openRolesEditor,
        openLineEditor,
        queueLineRevoice,
    });
    app.use(PrimeVue, { ripple: true });
    app.mount(container);

    return { element: container, unmount: () => app.unmount() };
}
