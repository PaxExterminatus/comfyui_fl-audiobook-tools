// Small shared, DOM-free helpers used across every FL CosyVoice3 editor --
// the 4 Vue components under src/ (Roles Editor, Browse Dialog, Script
// Library's tree panel, Line Editor) and the remaining hand-written
// vanilla one (script_editor.js). Kept separate from ui_kit.js (DOM widget
// factories) since nothing here touches the DOM.

// Single source of truth for the plugin's REST endpoints (see
// nodes/script_editor.py / nodes/script_library.py for the routes
// themselves) -- every editor that talks to the backend imports these
// instead of repeating the literal paths under its own locally-chosen name.
export const SCRIPT_EDITOR_API = "/fl_cosyvoice3/script_editor";
export const SCRIPT_LIBRARY_API = "/fl_cosyvoice3/script_library";
export const SPEAKER_PRESETS_API = "/fl_cosyvoice3/script_library/speaker_presets";
export const BROWSE_API = "/fl_cosyvoice3/browse/list_dir";

const SCAN_API = SCRIPT_LIBRARY_API;

// Joins a Windows or POSIX path with one more segment, using whichever
// separator `base` already uses (defaulting to "\\" when it uses neither --
// every caller in this plugin only ever runs against Windows-style paths
// coming back from the backend). `!base`/`!name` guards exist because two
// real call sites pass an empty piece: browse_dialog.js's root listing has
// no parent to join onto, and script_library.js can be pointed at a
// project root directly (no "act" subfolder).
export function joinPath(base, name) {
    if (!base) return name;
    if (!name) return base;
    const sep = base.includes("\\") && !base.includes("/") ? "\\" : "/";
    return base.replace(/[\\/]+$/, "") + sep + name;
}

// Mirrors nodes/script_library.py's strip_suffix_and_ext: e.g.
// "Manacled 0101 X.txt" + "" -> "Manacled 0101 X" (an empty suffix just
// strips the extension); with a non-empty script_filter, e.g.
// "Manacled 0101 X_dialog.txt" + "_dialog.txt" -> "Manacled 0101 X".
export function stripSuffixAndExt(name, suffix) {
    const trimmed = (name || "").trim();
    const suf = (suffix || "").trim();
    if (suf && trimmed.toLowerCase().endsWith(suf.toLowerCase())) {
        return trimmed.slice(0, -suf.length);
    }
    const dot = trimmed.lastIndexOf(".");
    return dot > 0 ? trimmed.slice(0, dot) : trimmed;
}

// Directory containing `path` -- e.g. recovering the project ROOT from a
// resolved _roles.json path when only an act folder was passed in (see
// line_editor.js's notifyRoleSpeakerChanged).
export function dirOf(path) {
    const idx = Math.max(path.lastIndexOf("\\"), path.lastIndexOf("/"));
    return idx > 0 ? path.slice(0, idx) : path;
}

// Recasting a role (line_editor.js's "Change this role's speaker for the
// whole play", or a direct edit in roles_editor.js) changes what EVERY
// line using that role code resolves to, project-wide -- but a script
// line's own row never changes, so nothing would otherwise notice on its
// own. Read-only check (see nodes/script_library.py's mark_role_stale):
// every script (any act) using `roleCode` gets its lines re-hashed against
// the CURRENT _roles.json, and any script found ready to release gets
// un-readied + has its now-invalid final file wiped.
//
// Returns the raw `changed` list plus a ready-to-display `message`
// summarizing the outcome -- both editors show the exact same wording,
// worded once, here, rather than each re-deriving it.
export async function markRoleStale(root, roleCode, suffix) {
    try {
        const resp = await fetch(`${SCAN_API}/mark_role_stale`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ root, role_code: roleCode, suffix }),
        });
        const data = await resp.json();
        if (data.error) {
            return { changed: [], error: data.error, message: `"${roleCode}" recast, but couldn't check affected scripts: ${data.error}` };
        }
        const changed = data.changed || [];
        const message = changed.length
            ? `"${roleCode}" recast -- ${changed.length} script(s) need re-voice`
            : `"${roleCode}" recast -- no script uses this role`;
        return { changed, error: null, message };
    } catch (e) {
        return { changed: [], error: String(e), message: `"${roleCode}" recast, but couldn't check affected scripts: ${e.message || e}` };
    }
}
