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
deliberately, not "version 2": a line simply has one current file per
distinct content it's ever said, and if an edit is later reverted back to
some earlier wording, whatever file was rendered for that exact wording (if
any, never deleted just for being superseded) is immediately "voiced"
again, with no re-render needed. Editing text, or recasting a role
elsewhere in the project, changes the EXPECTED hash, so the file the OLD
content wrote (if not also matched by the new content) simply stops being
what's looked for -- it isn't deleted, just orphaned, until reorganize_lines
below removes it because its row was deleted/merged away, or a full render
cleans up positions beyond the current line count.
"""
import hashlib
import os
import re
from typing import Dict, List, Optional, Tuple

LINE_FILE_RE = re.compile(r"^(\d+)_([0-9a-f]+)\.wav$", re.IGNORECASE)
HASH_LEN = 8


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


def reorganize_lines(lines_dir: str, deletes: List[int], moves: List[Tuple[int, int]]) -> Dict[str, list]:
    """
    Physically keeps _audio\\lines\\<script>\\ in sync with a structural
    edit (delete/merge/split a row in the line editor) -- called instead of
    ever trying to detect drift after the fact. `deletes` are positions
    whose row no longer exists at all (every file at that position is
    removed, including any orphaned-by-earlier-edits ones); `moves` are
    {old position -> new position} for rows that merely shifted, preserving
    each file's own hash untouched.

    Order matters: `moves` is split into "downward" (to < from, e.g. every
    row after a deleted one) processed ascending by `from`, and "upward"
    (to > from, e.g. every row after a split's insertion point) processed
    descending by `from` -- either order guarantees a move never lands on a
    slot this same call hasn't vacated yet, for the single-contiguous-shift
    patterns delete/merge/split actually produce. Safe to call when
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
    return {"deleted": deleted, "moved": moved}
