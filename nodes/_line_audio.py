"""
Per-line audio file naming/addressing for _audio\\lines\\<script>\\ -- the
replacement for the old _state.json + stable numeric id scheme.

Filename shape: "<position:04d>_<hash8>.wav", e.g. "0004_a1b2c3d4.wav".

- position: this line's index (0-based, among NON-malformed lines only) in
  the CURRENT script. Not stable across a delete/merge/split the way the old
  "id" was -- callers are expected to keep position in sync themselves by
  calling reorganize_lines() on every structural edit (see
  src/line_editor/LineEditorApp.vue's deleteRow/mergeRows/splitFocusedLine).
- hash: content fingerprint (see line_hash) of the RESOLVED speaker (a role
  code already substituted for its real preset, same as
  nodes/script_library.py's resolve_roles does for the whole script) +
  instruct + text.

Position+hash together are the ENTIRE filename, deterministically: "is this
line voiced for what it currently says" is just "does
_audio\\lines\\<script>\\<position>_<line_hash(...)>.wav exist" -- no
directory scan needed, no stored status, nothing to fall out of sync.
Re-voicing a line whose text didn't change (a plain re-roll for a fresh
take) writes to that SAME path, overwriting the previous take in place --
deliberately, not "version 2": a line has exactly ONE file at any time, not
a history of every wording it's ever said. Editing text, or recasting a
role elsewhere in the project, changes the EXPECTED hash -- the next
successful re-voice of that line deletes whatever file used to be at this
position (see delete_stale_at_position, called from
nodes/audio_post_process.py right after a fresh take is written) before
anything else can mistake a stale take for a current one. A malformed edit
whose render never runs leaves the old file in place (nothing to replace it
with yet); reorganize_lines below still removes a position's file(s)
outright when its row is deleted/merged away, or a full render cleans up
positions beyond the current line count.
"""
import hashlib
import os
import re
from typing import Dict, List, Optional, Tuple

try:
    from . import _line_history
except (ImportError, ValueError):
    import _line_history

LINE_FILE_RE = re.compile(r"^(\d+)_([0-9a-f]+)\.wav$", re.IGNORECASE)
HASH_LEN = 8

"""
Take/version files (multi-seed re-voice + text/instruct version history):
"<key>_v<version:03d>_<hash8>_s<seed>.wav", e.g.
"0004_v001_a1b2c3d4_s170234.wav" -- ADDITIVE, never replaces the canonical
scheme above. `version` is one monotonic counter per KEY shared across both
"new seed, same content" and "content changed" (matches how the line
editor's own UI presents it: v1/v2/v3 regardless of which kind of change
each one was). VERSION_FILE_RE deliberately does NOT match LINE_FILE_RE (the
extra "_vNNN..._sSEED" segments), so list_lines_dir/delete_stale_at_position/
reorganize_lines above stay blind to these files automatically -- no changes
needed there for the canonical-file invariant to keep holding. One of a
render's version files is COPIED (not moved) onto the canonical path to
become "the" file everything else already reads; see promote_version.

`key` is a plain string, not necessarily a position: the audiobook Line
Editor passes `f"{position:04d}"` (matching LINE_FILE_RE's own zero-padded
position exactly, for filename-format continuity with files rendered before
this generalization), while VO Dub passes its own stable `audio_key`
directly -- this module has no opinion on what a key means, only that
callers use the SAME string consistently for the same line every time.
"""
VERSION_FILE_RE = re.compile(r"^(.+)_v(\d+)_([0-9a-f]+)_s(-?\d+)\.wav$", re.IGNORECASE)


def make_version_filename(key: str, version: int, content_hash: str, seed: int) -> str:
    return f"{key}_v{version:03d}_{content_hash}_s{seed}.wav"


def parse_version_filename(name: str) -> Optional[Tuple[str, int, str, int]]:
    """filename -> (key, version, hash, seed), or None if it isn't one of
    these files (e.g. a canonical file, or anything else)."""
    m = VERSION_FILE_RE.match(name)
    if not m:
        return None
    return m.group(1), int(m.group(2)), m.group(3).lower(), int(m.group(4))


def list_version_files(lines_dir: str, key: str) -> List[Tuple[int, str, int, str]]:
    """Every (version, hash, seed, filename) for `key`, sorted by version
    ascending -- [] if none rendered yet or lines_dir is missing."""
    try:
        entries = os.listdir(lines_dir)
    except OSError:
        return []
    out = []
    for name in entries:
        parsed = parse_version_filename(name)
        if parsed is not None and parsed[0] == key:
            out.append((parsed[1], parsed[2], parsed[3], name))
    out.sort(key=lambda t: t[0])
    return out


def next_version_number(lines_dir: str, key: str) -> int:
    """1 if `key` has no version files yet, else one past the highest
    existing version -- the counter never reuses/resets, matching the
    "single growing history" the line editor's history panel shows."""
    existing = list_version_files(lines_dir, key)
    return (existing[-1][0] + 1) if existing else 1


def promote_version(lines_dir: str, key: str, version: int, canonical_path: str) -> str:
    """Copies the version file for (key, version) onto `canonical_path` so
    every existing consumer of that path (playback, stitching,
    pending-revoice detection) picks it up unchanged. The caller supplies
    the canonical destination explicitly (e.g. audiobook's
    `expected_path(lines_dir, position, content_hash)`, or VO Dub's own
    `audio_ru_path(root, audio_key)`) -- this module doesn't assume a
    position+hash naming convention for it. Returns `canonical_path`
    unchanged, for chaining. Raises FileNotFoundError if that version
    doesn't exist on disk."""
    import shutil

    match = next((v for v in list_version_files(lines_dir, key) if v[0] == version), None)
    if match is None:
        raise FileNotFoundError(f"no version {version} for key {key!r} in {lines_dir}")
    _, _, _, name = match
    dest_dir = os.path.dirname(canonical_path)
    if dest_dir:
        os.makedirs(dest_dir, exist_ok=True)
    shutil.copyfile(os.path.join(lines_dir, name), canonical_path)
    return canonical_path


def line_hash(speaker: str, instruct: str, text: str) -> str:
    """Short content fingerprint for one line -- same algorithm MUST run
    identically on the frontend (src/shared/line_hash.js) so a freshly typed
    edit's "is this still voiced" check agrees with what the backend wrote
    the file's name from. `speaker` must already be the RESOLVED preset (see
    module docstring), not a raw role code."""
    raw = f"{(speaker or '').strip()}|{(instruct or '').strip()}|{(text or '').strip()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:HASH_LEN]


def make_line_filename(position: int, content_hash: str) -> str:
    return f"{position:04d}_{content_hash}.wav"


def parse_line_filename(name: str) -> Optional[Tuple[int, str]]:
    """filename -> (position, hash), or None if it doesn't match this scheme
    (e.g. a leftover _state.json, or an old id<N>.wav/NNNN.wav file from
    before this scheme existed -- those are simply invisible to every
    function below, never mistaken for a current take)."""
    m = LINE_FILE_RE.match(name)
    if not m:
        return None
    return int(m.group(1)), m.group(2).lower()


def expected_path(lines_dir: str, position: int, content_hash: str) -> str:
    """The one exact path a line at `position` saying whatever hashes to
    `content_hash` would live at -- deterministic, no directory listing
    needed. "Is this line voiced for its current content" is just
    os.path.isfile() on this."""
    return os.path.join(lines_dir, make_line_filename(position, content_hash))


def list_lines_dir(lines_dir: str) -> List[Tuple[int, str, str]]:
    """Every (position, hash, filename) this scheme recognizes in
    `lines_dir` -- [] if the directory doesn't exist yet (nothing rendered).
    Only needed for operations that must consider EVERY file at a position
    (reorganize_lines' move/delete, mode 1 playback's "nothing fresh, but
    play whatever's there" fallback) -- the "is this line voiced" question
    itself never needs this, see expected_path."""
    try:
        entries = os.listdir(lines_dir)
    except OSError:
        return []
    out = []
    for name in entries:
        parsed = parse_line_filename(name)
        if parsed is not None:
            out.append((parsed[0], parsed[1], name))
    return out


def most_recent_at_position(lines_dir: str, position: int) -> Optional[str]:
    """Filename of whichever file at `position` was modified most recently,
    regardless of whether its hash matches current content -- the mode 1
    "nothing voiced for what this line says right now, but play the last
    take anyway" fallback. None if this position has no file at all."""
    candidates = [name for pos, _, name in list_lines_dir(lines_dir) if pos == position]
    if not candidates:
        return None
    return max(candidates, key=lambda name: os.path.getmtime(os.path.join(lines_dir, name)))


def delete_stale_at_position(lines_dir: str, position: int, keep_hash: str) -> List[str]:
    """
    Removes every file at `position` whose hash ISN'T `keep_hash` -- called
    right after a fresh take is written, so a line keeps exactly one file at
    a time (the one matching its CURRENT content) instead of accumulating
    every wording it's ever said. A no-op when the only file already there
    is `keep_hash` itself (a plain re-roll of unchanged content, or calling
    this twice). Safe to call when `lines_dir` doesn't exist yet.
    """
    if not os.path.isdir(lines_dir):
        return []
    deleted = []
    for pos, content_hash, name in list_lines_dir(lines_dir):
        if pos == position and content_hash != keep_hash:
            try:
                os.remove(os.path.join(lines_dir, name))
                deleted.append(name)
            except OSError as e:
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't delete stale {name}: {e}")
    return deleted


def reorganize_lines(lines_dir: str, deletes: List[int], moves: List[Tuple[int, int]]) -> Dict[str, list]:
    """
    Physically keeps _audio\\lines\\<script>\\ in sync with a structural
    edit (delete/merge/split a row in the line editor) -- called instead of
    ever trying to detect drift after the fact. `deletes` are positions
    whose row no longer exists at all (every file at that position is
    removed, including any orphaned-by-earlier-edits ones, AND its version
    files + _history.json entry -- see _line_history.delete_entry); `moves`
    are {old position -> new position} for rows that merely shifted,
    preserving each file's own hash (and each version file's own
    version/hash/seed) untouched -- only the position segment of the
    filename, and the manifest's key, change.

    Order matters: `moves` is split into "downward" (to < from, e.g. every
    row after a deleted one) processed ascending by `from`, and "upward"
    (to > from, e.g. every row after a split's insertion point) processed
    descending by `from` -- either order guarantees a move never lands on a
    slot this same call hasn't vacated yet, for the single-contiguous-shift
    patterns delete/merge/split actually produce. The manifest is moved via
    _line_history.rename_entry INSIDE this same per-move iteration (not a
    separate pass at the end) so its keys are updated in that identical
    order -- never able to disagree with where the files themselves ended
    up, even if this function were interrupted mid-loop. Safe to call when
    `lines_dir` doesn't exist yet (nothing rendered) -- a no-op.
    """
    if not os.path.isdir(lines_dir):
        return {"deleted": [], "moved": []}

    deleted = []
    for pos in deletes:
        for _, _, name in [e for e in list_lines_dir(lines_dir) if e[0] == pos]:
            try:
                os.remove(os.path.join(lines_dir, name))
                deleted.append(name)
            except OSError as e:
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't delete {name}: {e}")
        for _, _, _, name in list_version_files(lines_dir, f"{pos:04d}"):
            try:
                os.remove(os.path.join(lines_dir, name))
                deleted.append(name)
            except OSError as e:
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't delete {name}: {e}")
        _line_history.delete_entry(lines_dir, pos)

    downward = sorted([m for m in moves if m[1] < m[0]], key=lambda m: m[0])
    upward = sorted([m for m in moves if m[1] > m[0]], key=lambda m: -m[0])
    moved = []
    for frm, to in downward + upward:
        if frm == to:
            continue
        for _, content_hash, name in [e for e in list_lines_dir(lines_dir) if e[0] == frm]:
            new_name = make_line_filename(to, content_hash)
            try:
                os.replace(os.path.join(lines_dir, name), os.path.join(lines_dir, new_name))
                moved.append({"from": name, "to": new_name})
            except OSError as e:
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't move {name} -> {new_name}: {e}")
        for version, content_hash, seed, name in list_version_files(lines_dir, f"{frm:04d}"):
            new_name = make_version_filename(f"{to:04d}", version, content_hash, seed)
            try:
                os.replace(os.path.join(lines_dir, name), os.path.join(lines_dir, new_name))
                moved.append({"from": name, "to": new_name})
            except OSError as e:
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't move {name} -> {new_name}: {e}")
        _line_history.rename_entry(lines_dir, frm, to)
    return {"deleted": deleted, "moved": moved}
