// Content fingerprint for one script line -- MUST match
// nodes/_line_audio.py's line_hash() byte-for-byte: sha256 of
// "speaker|instruct|text" (each field trimmed first), first 8 hex chars of
// the hexdigest. `speaker` must already be the RESOLVED preset (role code
// substituted via _roles.json), not a raw role code -- see
// resolvedSpeakerForHash in line_editor's LineEditorApp.vue.
//
// This is the entire replacement for _state.json's per-line
// "voiced/unvoiced/stale" status: a line is voiced for its CURRENT content
// exactly when this matches the hash baked into its latest-version file's
// name (see parseLineFilename/latestByPosition below) -- recomputed live as
// the user types or a role gets recast elsewhere, never stored anywhere.
export async function lineHash(speaker, instruct, text) {
    const raw = `${(speaker || "").trim()}|${(instruct || "").trim()}|${(text || "").trim()}`;
    const bytes = new TextEncoder().encode(raw);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex.slice(0, 8);
}

const LINE_FILE_RE = /^(\d+)_(\d+)_([0-9a-f]+)\.wav$/i;

// filename -> {position, version, hash}, or null if it doesn't match this
// scheme (an old id<N>.wav/NNNN.wav file from before it existed, or
// _state.json) -- mirrors nodes/_line_audio.py's parse_line_filename.
export function parseLineFilename(name) {
    const m = LINE_FILE_RE.exec(name);
    if (!m) return null;
    return { position: Number(m[1]), version: Number(m[2]), hash: m[3].toLowerCase() };
}

// Every file in `filenames` (e.g. the Set loadLineFiles() populates in
// LineEditorApp.vue), reduced to the HIGHEST-version entry per position --
// "the current take" for each line that's ever been rendered, regardless
// of whether its hash still matches current content. Mirrors
// _line_audio.py's latest_by_position.
export function latestByPosition(filenames) {
    const latest = new Map();
    for (const name of filenames) {
        const parsed = parseLineFilename(name);
        if (!parsed) continue;
        const current = latest.get(parsed.position);
        if (!current || parsed.version > current.version) {
            latest.set(parsed.position, { ...parsed, filename: name });
        }
    }
    return latest;
}
