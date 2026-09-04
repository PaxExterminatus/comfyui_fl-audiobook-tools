// Full-screen roles editor for FL CosyVoice3 Script Library.
// Lists every role from the project's _roles.json and lets you reassign its
// "speaker" (the real CosyVoice preset that role code currently resolves
// to) -- code/name/description are read-only display here, since renaming
// a role code would silently orphan every script line that already
// references it. Edits save straight back to _roles.json (debounced), the
// single source of truth Script Library's "script" output resolves role
// codes against (see nodes/script_library.py resolve_roles).
import { openFloatingPanel, iconButton } from "./ui_kit.js";
import { injectStyles } from "./styles.js";
import {
    joinPath, markRoleStale,
    SCRIPT_EDITOR_API as FILE_API, SPEAKER_PRESETS_API as PRESETS_API,
} from "./fl_common.js";

const SAVE_DEBOUNCE_MS = 600;
const POLL_MS = 3000;
const EDIT_QUIET_MS = 1500;

/**
 * @param {Object} opts
 * @param {string} opts.root - absolute path to the project root (contains _roles.json).
 * @param {string} [opts.suffix] - script_filter, passed through to the project-wide stale-marking scan (see markRoleStale).
 */
export function openRolesEditor({ root, suffix = "_speakers.txt" }) {
    injectStyles();
    const fullPath = joinPath(root, "_roles.json");

    let roles = [];
    let presets = [];
    // Last speaker value we already ran a stale-scan for, per role code --
    // seeded from disk on every load (see loadFromDisk) so a genuine
    // change (typed or picked) is detected relative to what's ACTUALLY
    // saved, not just "different from a moment ago". A role with no entry
    // yet has never been scanned this session.
    const lastNotifiedSpeaker = new Map();
    let lastSavedText = null;
    let lastLocalEditAt = 0;
    let saveTimer = null;
    let pollTimer = null;
    let closed = false;

    const overlay = document.createElement("div");
    overlay.className = "fl-overlay";

    const panel = document.createElement("div");
    panel.className = "fl-panel";
    panel.style.cssText = "width:80vw;max-width:820px;height:88vh;";

    const header = document.createElement("div");
    header.className = "fl-panel-header";

    const titleEl = document.createElement("div");
    titleEl.textContent = "Roles";
    titleEl.style.cssText = "font-weight:600;font-size:14px;flex:1;";

    const statusEl = document.createElement("div");
    statusEl.className = "fl-status";
    statusEl.style.flex = "0 0 auto";

    const closeBtn = document.createElement("button");
    closeBtn.className = "fl-btn fl-btn-plain fl-btn-round";
    closeBtn.textContent = "✕";
    closeBtn.title = "Close";

    header.appendChild(titleEl);
    header.appendChild(statusEl);
    header.appendChild(closeBtn);

    const rowsContainer = document.createElement("div");
    rowsContainer.style.cssText = "flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:3px;";

    panel.appendChild(header);
    panel.appendChild(rowsContainer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function close() {
        if (closed) return;
        closed = true;
        if (saveTimer) {
            clearTimeout(saveTimer);
            flushSave();
        }
        // Catches a speaker change whose "blur" never fired (e.g. closing
        // this editor via ✕ or Escape while still focused in the field).
        roles.forEach((role) => notifyIfSpeakerChanged(role));
        if (pollTimer) clearInterval(pollTimer);
        document.removeEventListener("keydown", onKeydown);
        overlay.remove();
    }

    function onKeydown(e) {
        if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeydown);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    function scheduleSave() {
        lastLocalEditAt = Date.now();
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
    }

    function serialize() {
        return JSON.stringify({ roles }, null, 2);
    }

    async function flushSave() {
        const text = serialize();
        if (text === lastSavedText) return;
        try {
            const resp = await fetch(`${FILE_API}/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: fullPath, content: text }),
            });
            const data = await resp.json();
            if (data.error) {
                setStatus(`Save error: ${data.error}`);
                return;
            }
            lastSavedText = text;
            setStatus(`Saved ${new Date().toLocaleTimeString()}`);
        } catch (e) {
            setStatus(`Save failed: ${e}`);
        }
    }

    // Typing fires "input" per keystroke -- scanning the whole project on
    // every character would be wasteful and spammy, so this only actually
    // triggers a scan once the value has settled (blur, or a discrete
    // picker selection), and only when it genuinely differs from what was
    // last scanned (or last loaded from disk, whichever is more recent).
    // Recasting a role here changes what EVERY line using that role code
    // resolves to, project-wide -- but a script line's own row never
    // changes, so nothing about the per-line state model
    // (web/line_editor.js's reconcileState) would otherwise notice; see
    // fl_common.js's markRoleStale (shared with that file's own
    // notifyRoleSpeakerChanged -- this editor has no per-script state of
    // its own to reload, so it just reports the outcome).
    function notifyIfSpeakerChanged(role) {
        if (!role.code) return;
        const prev = lastNotifiedSpeaker.get(role.code);
        if (prev === role.speaker) return;
        lastNotifiedSpeaker.set(role.code, role.speaker);
        markRoleStale(root, role.code, suffix).then((result) => setStatus(result.message));
    }

    function buildRow(role) {
        const rowEl = document.createElement("div");
        rowEl.style.cssText =
            "display:flex;flex-direction:column;gap:4px;padding:7px 10px;border-radius:6px;background:rgba(255,255,255,0.02);";

        const topLine = document.createElement("div");
        topLine.style.cssText = "display:flex;gap:8px;align-items:center;";

        const codeEl = document.createElement("div");
        codeEl.textContent = role.code || "";
        codeEl.title = "Role code (read-only here -- renaming would orphan script lines that already use it)";
        codeEl.style.cssText = "flex:0 0 130px;font-size:11.5px;font-weight:600;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

        const nameEl = document.createElement("div");
        nameEl.textContent = role.name || "";
        nameEl.style.cssText = "flex:1 1 180px;min-width:0;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

        const speakerInput = document.createElement("input");
        speakerInput.className = "fl-input";
        speakerInput.style.cssText = "width:160px;flex:0 0 auto;";
        speakerInput.type = "text";
        speakerInput.value = role.speaker || "";
        speakerInput.title = "Real CosyVoice preset this role resolves to";
        speakerInput.addEventListener("input", () => {
            role.speaker = speakerInput.value;
            scheduleSave();
        });
        speakerInput.addEventListener("blur", () => notifyIfSpeakerChanged(role));

        const pickBtn = iconButton("🎙", "Pick from saved speaker presets");
        pickBtn.addEventListener("click", () => {
            if (!presets.length) {
                setStatus("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
                return;
            }
            openFloatingPanel({
                anchorEl: pickBtn,
                items: presets,
                getLabel: (p) => p,
                onPick: (p) => {
                    role.speaker = p;
                    speakerInput.value = p;
                    scheduleSave();
                    notifyIfSpeakerChanged(role);
                },
            });
        });

        topLine.appendChild(codeEl);
        topLine.appendChild(nameEl);
        topLine.appendChild(speakerInput);
        topLine.appendChild(pickBtn);

        const descArea = document.createElement("textarea");
        descArea.className = "fl-textarea";
        descArea.style.cssText = "font-size:11px;color:#ccc;min-height:26px;";
        descArea.value = role.description || "";
        descArea.rows = 1;
        descArea.placeholder = "Description...";
        function autoGrow() {
            descArea.style.height = "auto";
            descArea.style.height = `${descArea.scrollHeight}px`;
        }
        descArea.addEventListener("input", () => {
            role.description = descArea.value;
            autoGrow();
            scheduleSave();
        });
        requestAnimationFrame(autoGrow);

        rowEl.appendChild(topLine);
        rowEl.appendChild(descArea);
        return rowEl;
    }

    function render() {
        rowsContainer.innerHTML = "";
        if (!roles.length) {
            const empty = document.createElement("div");
            empty.className = "fl-empty";
            empty.textContent = "(no roles found)";
            rowsContainer.appendChild(empty);
            return;
        }
        roles.forEach((role) => rowsContainer.appendChild(buildRow(role)));
    }

    async function loadPresets() {
        try {
            const resp = await fetch(PRESETS_API);
            const data = await resp.json();
            presets = data.presets || [];
        } catch (e) {
            presets = [];
        }
    }

    async function loadFromDisk({ isPoll = false } = {}) {
        try {
            const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(fullPath)}`);
            const data = await resp.json();
            if (data.error) {
                setStatus(`Read error: ${data.error}`);
                return;
            }
            if (!data.exists) {
                if (!isPoll) {
                    roles = [];
                    lastSavedText = "";
                    render();
                    setStatus("_roles.json does not exist yet");
                }
                return;
            }
            if (isPoll && Date.now() - lastLocalEditAt < EDIT_QUIET_MS) return;
            if (data.content === lastSavedText) return;
            let parsed;
            try {
                parsed = JSON.parse(data.content);
            } catch (e) {
                setStatus(`_roles.json is not valid JSON: ${e}`);
                return;
            }
            roles = Array.isArray(parsed.roles) ? parsed.roles : [];
            // Baseline for notifyIfSpeakerChanged -- whatever's on disk
            // right now isn't a pending change to scan for.
            roles.forEach((role) => { if (role.code) lastNotifiedSpeaker.set(role.code, role.speaker); });
            lastSavedText = data.content;
            render();
            if (!isPoll) setStatus(`Loaded ${roles.length} role(s)`);
        } catch (e) {
            setStatus(`Read failed: ${e}`);
        }
    }

    loadPresets();
    loadFromDisk().then(() => {
        pollTimer = setInterval(() => loadFromDisk({ isPoll: true }), POLL_MS);
    });
}
