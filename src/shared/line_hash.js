/*
 Content fingerprint for one script line -- MUST match
 nodes/_line_audio.py's line_hash() byte-for-byte: sha256 of
 "speaker|instruct|text" (each field trimmed first), first 8 hex chars of
 the hexdigest. `speaker` must already be the RESOLVED preset (role code
 substituted via _roles.json), not a raw role code -- see
 resolvedSpeakerForHash in line_editor's LineEditorApp.vue.

 Per-line audio lives at _audio\lines\<script>\<position>_<hash>.wav (see
 nodes/_line_audio.py's module docstring) -- position+hash together are
 the whole filename, deterministically, so "is this line voiced for its
 current content" is just "does that exact name exist in the directory
 listing", no separate state file and no directory scan needed.
*/
export async function lineHash(speaker, instruct, text) {
    const raw = `${(speaker || "").trim()}|${(instruct || "").trim()}|${(text || "").trim()}`;
    const bytes = new TextEncoder().encode(raw);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex.slice(0, 8);
}

const LINE_FILE_RE = /^(\d+)_([0-9a-f]+)\.wav$/i;

export function makeLineFilename(position, hash) {
    return `${String(position).padStart(4, "0")}_${hash}.wav`;
}

/*
 filename -> {position, hash}, or null if it doesn't match this scheme.
 Mirrors nodes/_line_audio.py's parse_line_filename.
*/
export function parseLineFilename(name) {
    const m = LINE_FILE_RE.exec(name);
    if (!m) return null;
    return { position: Number(m[1]), hash: m[2].toLowerCase() };
}

/*
 Whether `filenames` (e.g. the Set loadLineFiles() populates in
 LineEditorApp.vue) already has the exact file a line at `position`
 saying whatever hashes to `hash` would live at -- the entire "is this
 line voiced right now" check, mirrors _line_audio.py's expected_path +
 os.path.isfile.
*/
export function hasExpectedFile(filenames, position, hash) {
    return filenames.has(makeLineFilename(position, hash));
}

/*
 Whichever file at `position` was modified most recently, regardless of
 whether its hash matches current content -- the mode 1 "nothing voiced
 for what this line says right now, but play the last take anyway"
 fallback. `fileMtimes` is the same {filename: unixSeconds} map
 BROWSE_API already returns alongside `files`. null if this position has
 no file at all. Mirrors _line_audio.py's most_recent_at_position.
*/
export function mostRecentAtPosition(filenames, fileMtimes, position) {
    let best = null;
    let bestMtime = -Infinity;
    for (const name of filenames) {
        const parsed = parseLineFilename(name);
        if (!parsed || parsed.position !== position) continue;
        const mtime = fileMtimes?.[name] ?? 0;
        if (best === null || mtime > bestMtime) {
            best = name;
            bestMtime = mtime;
        }
    }
    return best;
}
