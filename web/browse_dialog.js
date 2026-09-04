// Shared folder/file browse dialog for FL CosyVoice3 nodes.
//
// Browsers deliberately never expose a dropped/picked file's real OS path
// to page JS (drag-and-drop only ever yields a sandboxed File object, and
// <input type=file webkitdirectory> is the same story) -- that's a security
// boundary, not something cleverer client-side code can work around. Since
// our backend is a local Python server with full disk access, picking a
// path goes through it instead: this dialog calls
// /fl_cosyvoice3/browse/list_dir to list directories/files server-side and
// lets the user click their way to the one they want.
import { injectStyles } from "./styles.js";
import { joinPath } from "./fl_common.js";

const LIST_API = "/fl_cosyvoice3/browse/list_dir";

/**
 * @param {Object} opts
 * @param {"folder"|"file"} opts.mode - "folder": pick a directory. "file": pick a file (ext-filtered).
 * @param {string} [opts.startPath] - initial directory to list.
 * @param {string} [opts.ext] - file extension filter for "file" mode, e.g. ".txt".
 * @param {(result: string) => void} opts.onSelect - called with the chosen absolute path.
 */
export function openBrowseDialog({ mode = "folder", startPath = "", ext = "", onSelect }) {
    injectStyles();
    let currentPath = "";
    let currentListing = null;
    let selectedFilePath = null;

    const overlay = document.createElement("div");
    overlay.className = "fl-overlay";

    const panel = document.createElement("div");
    panel.className = "fl-panel";
    panel.style.cssText = "width:min(560px,90vw);max-height:80vh;";

    const header = document.createElement("div");
    header.className = "fl-panel-header";

    const title = document.createElement("div");
    title.textContent = mode === "folder" ? "Choose a folder" : "Choose a file";
    title.style.cssText = "font-weight:bold;width:100%;position:absolute;left:0;top:-22px;";

    const upBtn = document.createElement("button");
    upBtn.className = "fl-btn fl-btn-icon";
    upBtn.textContent = "⬆";
    upBtn.title = "Up one level";

    const pathInput = document.createElement("input");
    pathInput.className = "fl-input";
    pathInput.style.flex = "1";
    pathInput.type = "text";
    pathInput.placeholder = "Path -- press Enter to jump here";

    header.appendChild(upBtn);
    header.appendChild(pathInput);

    const listEl = document.createElement("div");
    listEl.style.cssText = "flex:1;overflow-y:auto;padding:4px 0;min-height:280px;";

    const footer = document.createElement("div");
    footer.style.cssText =
        "padding:10px 12px;border-top:1px solid rgba(255,255,255,0.12);display:flex;justify-content:flex-end;gap:8px;flex:0 0 auto;";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "fl-btn";
    cancelBtn.style.padding = "6px 14px";
    cancelBtn.textContent = "Cancel";

    const selectBtn = document.createElement("button");
    selectBtn.className = "fl-btn";
    selectBtn.style.cssText = "padding:6px 14px;font-weight:bold;";
    selectBtn.textContent = mode === "folder" ? "Select This Folder" : "Select File";

    footer.appendChild(cancelBtn);
    footer.appendChild(selectBtn);

    panel.style.position = "relative";
    panel.appendChild(title);
    panel.appendChild(header);
    panel.appendChild(listEl);
    panel.appendChild(footer);
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

    cancelBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    function rowEl(label, icon, onClick) {
        const row = document.createElement("div");
        row.className = "fl-float-panel-row";
        row.textContent = `${icon} ${label}`;
        row.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
        row.addEventListener("mouseleave", () => {
            if (!row.dataset.selected) row.style.background = "transparent";
        });
        row.addEventListener("click", onClick);
        return row;
    }

    function updateSelectState() {
        selectBtn.disabled = mode === "folder" ? !currentPath : !selectedFilePath;
    }

    function render() {
        listEl.innerHTML = "";
        const data = currentListing;
        if (!data) return;

        (data.drives || []).forEach((d) => {
            listEl.appendChild(rowEl(d, "💽", () => load(d)));
        });
        (data.dirs || []).forEach((d) => {
            listEl.appendChild(rowEl(d, "📁", () => load(joinPath(currentPath, d))));
        });
        if (mode === "file") {
            (data.files || []).forEach((f) => {
                const fullPath = joinPath(currentPath, f);
                const row = rowEl(f, "📄", () => {
                    selectedFilePath = fullPath;
                    Array.from(listEl.children).forEach((c) => {
                        c.style.background = "transparent";
                        delete c.dataset.selected;
                    });
                    row.style.background = "rgba(90,150,255,0.25)";
                    row.dataset.selected = "1";
                    updateSelectState();
                });
                listEl.appendChild(row);
            });
        }
        if (!data.dirs?.length && !data.files?.length && !data.drives?.length) {
            const empty = document.createElement("div");
            empty.textContent = "(empty)";
            empty.style.cssText = "padding:10px 14px;opacity:0.6;";
            listEl.appendChild(empty);
        }
        updateSelectState();
    }

    async function load(path) {
        listEl.innerHTML = "";
        const loading = document.createElement("div");
        loading.textContent = "Loading...";
        loading.style.cssText = "padding:10px 14px;opacity:0.6;";
        listEl.appendChild(loading);
        selectedFilePath = null;
        try {
            const url = `${LIST_API}?path=${encodeURIComponent(path)}${ext ? `&ext=${encodeURIComponent(ext)}` : ""}`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (data.error) {
                listEl.innerHTML = "";
                const err = document.createElement("div");
                err.textContent = `Error: ${data.error}`;
                err.style.cssText = "padding:10px 14px;color:#f88;";
                listEl.appendChild(err);
                return;
            }
            currentPath = data.path;
            currentListing = data;
            pathInput.value = currentPath || "";
            render();
        } catch (e) {
            listEl.innerHTML = "";
            const err = document.createElement("div");
            err.textContent = `Failed: ${e}`;
            err.style.cssText = "padding:10px 14px;color:#f88;";
            listEl.appendChild(err);
        }
    }

    upBtn.addEventListener("click", () => {
        if (currentListing && currentListing.parent) {
            load(currentListing.parent);
        } else if (currentListing && currentListing.parent === "") {
            load("");
        } else if (currentPath) {
            load("");
        }
    });

    pathInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") load(pathInput.value.trim());
    });

    selectBtn.addEventListener("click", () => {
        const result = mode === "folder" ? currentPath : selectedFilePath;
        if (result) {
            onSelect(result);
            close();
        }
    });

    load(startPath || "");
}
