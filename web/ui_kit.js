// Small shared UI kit for FL CosyVoice3 nodes' remaining hand-written
// vanilla-JS widgets. Everything else this file used to provide
// (createDropdown, openFloatingPanel, openConfirmDialog, iconButton) was
// only ever used by the editors that have since moved to Vue + PrimeVue
// (Roles Editor, Browse Dialog, Script Library, Line Editor use PrimeVue's
// own Dialog/OverlayPanel/ConfirmDialog/Button instead) -- deleted rather
// than kept around unused.
import { injectStyles } from "./styles.js";

/**
 * Hide a node's native widget from view (and from the node's layout height)
 * while keeping it as a real, serialized input -- used when a custom DOM
 * widget takes over as that input's visible control.
 *
 * widget.hidden only affects canvas-drawn widgets (plain text/combo). A
 * DOM-backed widget (e.g. a multiline STRING's <textarea>) keeps its
 * wrapper visibly in the layout regardless of that flag -- it needs its
 * element's own display suppressed too, or it sits there as a stray empty
 * box wherever the widget order happens to place it.
 */
export function hideWidget(node, widget) {
    widget.hidden = true;
    if (widget.element) {
        widget.element.style.display = "none";
    }
    if (typeof node.computeSize === "function") {
        node.setSize(node.computeSize());
    }
}

/**
 * Full-screen, read-only text viewer -- the shared "just show me this
 * whole string" dialog, built on the same .fl-overlay/.fl-panel wrapper as
 * every other full-screen editor in this plugin, but with a single plain
 * scrollable text area instead of a per-row layout. Used e.g. by FL
 * CosyVoice3 Audio Post-Process's "📄 Report" button.
 *
 * @param {Object} opts
 * @param {string} [opts.title]
 * @param {string} [opts.text]
 */
export function openTextViewer({ title = "Report", text = "" } = {}) {
    injectStyles();

    const overlay = document.createElement("div");
    overlay.className = "fl-overlay";

    const panel = document.createElement("div");
    panel.className = "fl-panel fl-text-viewer-panel";

    const header = document.createElement("div");
    header.className = "fl-panel-header";

    const titleEl = document.createElement("div");
    titleEl.className = "fl-text-viewer-title";
    titleEl.textContent = title;

    const closeBtn = document.createElement("button");
    closeBtn.className = "fl-btn fl-btn-plain fl-btn-round";
    closeBtn.textContent = "✕";
    closeBtn.title = "Close";

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = document.createElement("textarea");
    body.className = "fl-textarea fl-text-viewer-body";
    body.readOnly = true;
    body.value = text;

    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onKeydown);
    }
    function onKeydown(e) {
        if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeydown);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    return close;
}
