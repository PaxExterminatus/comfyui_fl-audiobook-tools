// Small shared UI kit for FL CosyVoice3 nodes: a modern styled dropdown and
// a helper for hiding a node's native widget in favor of a custom DOM one.
// Native ComfyUI combo/text widgets render as flat canvas-drawn pills with
// no hover/focus states -- this gives nodes a proper floating listbox
// (frosted-glass panel, hover/selected states, optional type-to-filter)
// instead.
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
/**
 * A small plain-icon/label button (".fl-btn .fl-btn-icon") -- the base look
 * shared by nearly every toolbar/row action across the line editor, roles
 * editor, and script tree (▶, 🔁, 🗑, ✏️, ...). Callers add their own click
 * handler.
 */
export function iconButton(label, title) {
    const btn = document.createElement("button");
    btn.className = "fl-btn fl-btn-icon";
    btn.textContent = label;
    btn.title = title;
    return btn;
}

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
 * @param {Object} opts
 * @param {string} [opts.placeholder]
 * @param {(value: string) => void} [opts.onChange]
 * @param {boolean} [opts.filterable] - show a type-to-filter box when there are many options.
 * @returns {{element: HTMLElement, setOptions: (opts: string[]) => void, setValue: (v: string) => void, getValue: () => string}}
 */
export function createDropdown({ placeholder = "Select...", onChange, filterable = true } = {}) {
    injectStyles();
    let options = [];
    let value = "";
    let panelEl = null;

    const trigger = document.createElement("div");
    trigger.className = "fl-dropdown-trigger";

    const labelEl = document.createElement("span");
    labelEl.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    labelEl.textContent = placeholder;

    const chevron = document.createElement("span");
    chevron.textContent = "⌄";
    chevron.style.cssText = "flex:0 0 auto;opacity:0.6;transition:transform .15s ease;font-size:11px;";

    trigger.appendChild(labelEl);
    trigger.appendChild(chevron);

    function closePanel() {
        if (!panelEl) return;
        panelEl.remove();
        panelEl = null;
        chevron.style.transform = "rotate(0deg)";
        document.removeEventListener("mousedown", onDocMouseDown, true);
        document.removeEventListener("keydown", onDocKeyDown, true);
    }

    function onDocMouseDown(e) {
        if (panelEl && !panelEl.contains(e.target) && e.target !== trigger) closePanel();
    }
    function onDocKeyDown(e) {
        if (e.key === "Escape") closePanel();
    }

    function renderRows(container, filterText) {
        container.innerHTML = "";
        const shown = filterText
            ? options.filter((o) => o.toLowerCase().includes(filterText.toLowerCase()))
            : options;
        if (!shown.length) {
            const empty = document.createElement("div");
            empty.textContent = "(no matches)";
            empty.style.cssText = "padding:8px 10px;opacity:0.55;font-size:12px;";
            container.appendChild(empty);
            return;
        }
        shown.forEach((opt) => {
            const row = document.createElement("div");
            row.className = "fl-float-panel-row";
            const isSelected = opt === value;
            row.textContent = (isSelected ? "✓ " : "") + opt;
            row.style.cssText =
                "font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" +
                (isSelected ? "background:rgba(90,140,255,0.25);font-weight:600;" : "");
            row.addEventListener("click", () => {
                setValue(opt);
                closePanel();
                onChange?.(opt);
            });
            container.appendChild(row);
        });
    }

    function openPanel() {
        if (panelEl) return;
        const rect = trigger.getBoundingClientRect();
        panelEl = document.createElement("div");
        panelEl.className = "fl-float-panel";
        panelEl.style.cssText =
            "min-width:" + rect.width + "px;left:" + rect.left + "px;top:" + (rect.bottom + 4) + "px;" +
            "max-height:260px;transform-origin:top center;";

        let filterInput = null;
        if (filterable && options.length > 8) {
            filterInput = document.createElement("input");
            filterInput.className = "fl-float-panel-filter";
            filterInput.type = "text";
            filterInput.placeholder = "Type to filter...";
            panelEl.appendChild(filterInput);
        }

        const rowsEl = document.createElement("div");
        rowsEl.style.cssText = "overflow-y:auto;";
        panelEl.appendChild(rowsEl);

        document.body.appendChild(panelEl);
        renderRows(rowsEl, "");
        requestAnimationFrame(() => {
            panelEl.style.opacity = "1";
            panelEl.style.transform = "scale(1)";
        });

        if (filterInput) {
            filterInput.addEventListener("input", () => renderRows(rowsEl, filterInput.value));
            filterInput.focus();
        }

        chevron.style.transform = "rotate(180deg)";
        document.addEventListener("mousedown", onDocMouseDown, true);
        document.addEventListener("keydown", onDocKeyDown, true);
    }

    trigger.addEventListener("click", () => {
        if (panelEl) closePanel();
        else openPanel();
    });

    function setValue(v) {
        value = v;
        labelEl.textContent = v || placeholder;
    }

    function setOptions(newOptions) {
        options = newOptions || [];
        if (panelEl) {
            const rowsEl = panelEl.querySelector("div:last-child");
            if (rowsEl) renderRows(rowsEl, "");
        }
    }

    return {
        element: trigger,
        setOptions,
        setValue,
        getValue: () => value,
    };
}

/**
 * One-shot floating picker panel anchored under an element -- e.g. a "pick
 * from catalog" button that isn't itself the display of the chosen value
 * (unlike createDropdown's trigger). Closes itself on pick/outside-click/Escape.
 *
 * @param {Object} opts
 * @param {HTMLElement} opts.anchorEl - panel is positioned below this element.
 * @param {any[]} opts.items
 * @param {(item: any) => string} opts.getLabel
 * @param {(item: any) => string} [opts.getSubLabel] - optional muted secondary line.
 * @param {(item: any) => void} opts.onPick
 * @param {boolean} [opts.filterable]
 * @returns {() => void} close
 */
export function openFloatingPanel({ anchorEl, items, getLabel, getSubLabel, onPick, filterable = true }) {
    injectStyles();
    const rect = anchorEl.getBoundingClientRect();
    const panelEl = document.createElement("div");
    panelEl.className = "fl-float-panel";
    panelEl.style.cssText =
        "width:min(360px,90vw);" +
        "left:" + Math.min(rect.left, window.innerWidth - 370) + "px;top:" + (rect.bottom + 4) + "px;" +
        "max-height:300px;transform-origin:top left;";

    let filterInput = null;
    if (filterable && items.length > 6) {
        filterInput = document.createElement("input");
        filterInput.className = "fl-float-panel-filter";
        filterInput.type = "text";
        filterInput.placeholder = "Type to filter...";
        panelEl.appendChild(filterInput);
    }

    const rowsEl = document.createElement("div");
    rowsEl.style.cssText = "overflow-y:auto;";
    panelEl.appendChild(rowsEl);

    function close() {
        panelEl.remove();
        document.removeEventListener("mousedown", onDocMouseDown, true);
        document.removeEventListener("keydown", onDocKeyDown, true);
    }
    function onDocMouseDown(e) {
        if (!panelEl.contains(e.target) && e.target !== anchorEl) close();
    }
    function onDocKeyDown(e) {
        if (e.key === "Escape") close();
    }

    function render(filterText) {
        rowsEl.innerHTML = "";
        const needle = (filterText || "").toLowerCase();
        const shown = needle
            ? items.filter((it) => `${getLabel(it)} ${getSubLabel ? getSubLabel(it) : ""}`.toLowerCase().includes(needle))
            : items;
        if (!shown.length) {
            const empty = document.createElement("div");
            empty.textContent = "(no matches)";
            empty.style.cssText = "padding:8px 10px;opacity:0.55;font-size:12px;";
            rowsEl.appendChild(empty);
            return;
        }
        shown.forEach((item) => {
            const row = document.createElement("div");
            row.className = "fl-float-panel-row";
            const main = document.createElement("div");
            main.textContent = getLabel(item);
            main.style.cssText = "font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
            row.appendChild(main);
            if (getSubLabel && getSubLabel(item)) {
                const sub = document.createElement("div");
                sub.textContent = getSubLabel(item);
                sub.style.cssText = "font-size:10.5px;opacity:0.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
                row.appendChild(sub);
            }
            row.addEventListener("click", () => {
                onPick(item);
                close();
            });
            rowsEl.appendChild(row);
        });
    }

    document.body.appendChild(panelEl);
    render("");
    requestAnimationFrame(() => {
        panelEl.style.opacity = "1";
        panelEl.style.transform = "scale(1)";
    });
    if (filterInput) {
        filterInput.addEventListener("input", () => render(filterInput.value));
        filterInput.focus();
    }
    document.addEventListener("mousedown", onDocMouseDown, true);
    document.addEventListener("keydown", onDocKeyDown, true);

    return close;
}

/**
 * Small themed confirmation dialog -- replaces native window.confirm() so
 * the user doesn't get yanked out to browser chrome. Returns a
 * Promise<boolean>: true = primary action, false = cancel/Escape/backdrop.
 *
 * @param {Object} opts
 * @param {string} [opts.title]
 * @param {string} [opts.message]
 * @param {string} [opts.okText]
 * @param {string} [opts.cancelText]
 */
export function openConfirmDialog({ title = "Confirm", message = "", okText = "OK", cancelText = "Cancel" } = {}) {
    injectStyles();
    return new Promise((resolve) => {
        const backdrop = document.createElement("div");
        backdrop.className = "fl-confirm-backdrop";

        const box = document.createElement("div");
        box.className = "fl-confirm-box";

        const titleEl = document.createElement("div");
        titleEl.className = "fl-confirm-title";
        titleEl.textContent = title;
        box.appendChild(titleEl);

        if (message) {
            const msgEl = document.createElement("div");
            msgEl.className = "fl-confirm-msg";
            msgEl.textContent = message;
            box.appendChild(msgEl);
        }

        const actions = document.createElement("div");
        actions.className = "fl-confirm-actions";

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "fl-btn";
        cancelBtn.style.padding = "6px 14px";
        cancelBtn.textContent = cancelText;

        const okBtn = document.createElement("button");
        okBtn.className = "fl-btn";
        okBtn.style.cssText = "padding:6px 14px;font-weight:600;background:rgba(120,180,255,0.18);border-color:rgba(120,180,255,0.4);";
        okBtn.textContent = okText;

        actions.appendChild(cancelBtn);
        actions.appendChild(okBtn);
        box.appendChild(actions);
        backdrop.appendChild(box);
        document.body.appendChild(backdrop);

        let done = false;
        const finish = (val) => {
            if (done) return;
            done = true;
            window.removeEventListener("keydown", onKey, true);
            backdrop.remove();
            resolve(val);
        };

        // Enter deliberately does NOT confirm here -- ComfyUI's own global
        // keydown handling swallows/reroutes it in practice (confirmed: it
        // never reliably reaches this listener), so the only supported way
        // to confirm is clicking the button below. Escape-to-cancel is kept
        // since that one isn't affected.
        const onKey = (e) => {
            if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); finish(false); }
        };
        window.addEventListener("keydown", onKey, true);

        backdrop.addEventListener("mousedown", (e) => {
            if (e.target === backdrop) finish(false);
        });
        cancelBtn.addEventListener("click", () => finish(false));
        okBtn.addEventListener("click", () => finish(true));

        queueMicrotask(() => okBtn.focus());
    });
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
    panel.className = "fl-panel";
    panel.style.cssText = "width:min(90vw, 900px);height:80vh;";

    const header = document.createElement("div");
    header.className = "fl-panel-header";

    const titleEl = document.createElement("div");
    titleEl.textContent = title;
    titleEl.style.cssText = "font-weight:600;font-size:14px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

    const closeBtn = document.createElement("button");
    closeBtn.className = "fl-btn fl-btn-plain fl-btn-round";
    closeBtn.textContent = "✕";
    closeBtn.title = "Close";

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = document.createElement("textarea");
    body.className = "fl-textarea";
    body.readOnly = true;
    body.value = text;
    body.style.cssText = "flex:1;margin:12px;resize:none;";

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
