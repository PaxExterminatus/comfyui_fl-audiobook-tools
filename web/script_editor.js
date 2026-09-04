import { app } from "../../scripts/app.js";
import { openBrowseDialog } from "./browse_dialog.js";
import { injectStyles } from "./styles.js";
import { SCRIPT_EDITOR_API as API_BASE } from "./fl_common.js";

// Live-links FL CosyVoice3 Script Editor's "script" text box to file_path
// on disk: local edits are saved (debounced) via /write, and edits made to
// the file by another program are pulled back in via periodic /read polls.
const POLL_MS = 2000;
const SAVE_DEBOUNCE_MS = 800;
const EDIT_QUIET_MS = 1500; // don't clobber the text box while the user is actively typing

function widgetEl(widget) {
    // widget.element is current; widget.inputEl is a deprecated alias some
    // older frontend builds still rely on -- accept either.
    return widget?.element || widget?.inputEl || null;
}

app.registerExtension({
    name: "FL_CosyVoice3.ScriptEditor",
    async nodeCreated(node) {
        if (node.comfyClass !== "FL_CosyVoice3_ScriptEditor") return;
        injectStyles();

        const pathWidget = node.widgets?.find((w) => w.name === "file_path");
        const scriptWidget = node.widgets?.find((w) => w.name === "script");
        if (!pathWidget || !scriptWidget) return;

        const statusWidget = node.addWidget("text", "sync_status", "", () => {}, { serialize: false });
        statusWidget.disabled = true;

        let lastSavedContent = scriptWidget.value;
        let lastLocalEditAt = 0;
        let saveTimer = null;
        let pollTimer = null;
        let currentPath = pathWidget.value;

        function setStatus(text) {
            statusWidget.value = text;
            node.setDirtyCanvas(true, true);
        }

        function setScriptValue(content) {
            scriptWidget.value = content;
            const el = widgetEl(scriptWidget);
            if (el) el.value = content;
            lastSavedContent = content;
        }

        async function loadFromDisk(path) {
            if (!path) {
                setStatus("No file linked (in-graph text only)");
                return;
            }
            try {
                const resp = await fetch(`${API_BASE}/read?path=${encodeURIComponent(path)}`);
                const data = await resp.json();
                if (data.error) {
                    setStatus(`Read error: ${data.error}`);
                    return;
                }
                if (!data.exists) {
                    setStatus("Linked file does not exist yet (will be created on first edit)");
                    return;
                }
                if (data.content !== scriptWidget.value) {
                    setScriptValue(data.content);
                }
                setStatus(`Synced ${new Date().toLocaleTimeString()}`);
            } catch (e) {
                setStatus(`Read failed: ${e}`);
            }
        }

        async function saveToDisk(path, content) {
            if (!path) return;
            try {
                const resp = await fetch(`${API_BASE}/write`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path, content }),
                });
                const data = await resp.json();
                if (data.error) {
                    setStatus(`Save error: ${data.error}`);
                    return;
                }
                lastSavedContent = content;
                setStatus(`Saved ${new Date().toLocaleTimeString()}`);
            } catch (e) {
                setStatus(`Save failed: ${e}`);
            }
        }

        function scheduleSave() {
            lastLocalEditAt = Date.now();
            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const path = pathWidget.value;
                const content = scriptWidget.value;
                if (path && content !== lastSavedContent) saveToDisk(path, content);
            }, SAVE_DEBOUNCE_MS);
        }

        const scriptEl = widgetEl(scriptWidget);
        if (scriptEl) {
            scriptEl.addEventListener("input", scheduleSave);
        }

        function startPolling() {
            if (pollTimer) clearInterval(pollTimer);
            pollTimer = setInterval(() => {
                const path = pathWidget.value;
                if (!path) return;
                if (Date.now() - lastLocalEditAt < EDIT_QUIET_MS) return;
                loadFromDisk(path);
            }, POLL_MS);
        }

        const origPathCallback = pathWidget.callback;
        pathWidget.callback = function (value) {
            const result = origPathCallback ? origPathCallback.apply(this, arguments) : undefined;
            currentPath = value;
            loadFromDisk(value);
            return result;
        };

        // file_path is a plain (non-multiline) STRING widget -- ComfyUI draws
        // those directly on the canvas with no backing DOM element, so it
        // needs a dedicated DOM widget (real <div>) as a clickable stand-in.
        // Drag-and-drop was removed here: browsers never expose a dropped
        // item's real OS path to page JS, so it could never do more than
        // show an error. Clicking opens a dialog that lists files through
        // our own backend instead of relying on any browser file API.
        function selectPath(path) {
            pathWidget.value = path;
            currentPath = path;
            node.setDirtyCanvas(true, true);
            loadFromDisk(path);
        }

        const browseButtonEl = document.createElement("div");
        browseButtonEl.className = "fl-browse-btn";
        browseButtonEl.textContent = "📁 Click to browse for a script file";
        browseButtonEl.style.cssText = "min-height:28px;pointer-events:all;";
        browseButtonEl.addEventListener("click", () => {
            // startPath must be a directory -- if file_path already points at
            // a file, start the dialog in its containing folder instead.
            const current = pathWidget.value || "";
            const lastSep = Math.max(current.lastIndexOf("\\"), current.lastIndexOf("/"));
            const startPath = lastSep > 0 ? current.slice(0, lastSep) : "";
            openBrowseDialog({
                mode: "file",
                ext: ".txt",
                startPath,
                onSelect: selectPath,
            });
        });
        node.addDOMWidget("file_browse_button", "custom", browseButtonEl, { serialize: false });

        loadFromDisk(currentPath);
        startPolling();

        const origOnRemoved = node.onRemoved;
        node.onRemoved = function () {
            if (pollTimer) clearInterval(pollTimer);
            if (saveTimer) clearTimeout(saveTimer);
            return origOnRemoved?.apply(this, arguments);
        };
    },
});
