"""
Per-line audio file naming/addressing for _audio\\lines\\<script>\\ -- the
replacement for the old _state.json + stable numeric id scheme.

Filename shape: "<position:04d>_<version:02d>_<hash8>.wav", e.g.
"0004_01_a1b2c3d4.wav".

- position: this line's index (0-based, among NON-malformed lines only) in
  the CURRENT script. Not stable across a delete/merge/split the way the old
  "id" was -- callers are expected to keep position in sync themselves by
  calling reorganize_lines() on every structural edit (see
  src/line_editor/LineEditorApp.vue's deleteRow/mergeRows/splitFocusedLine).
- version: how many times THIS position has ever been rendered, purely for
  sorting/history -- "the current take" is whichever version number is
  highest, regardless of its hash. Lets a line be re-rolled (same text, a
  fresh take) without losing the previous one, and lets stitch_lines() below
  always have an unambiguous "latest" file to read even when the latest
  take's hash is stale (text/role changed since).
- hash: content fingerprint (see line_hash) of the RESOLVED speaker (a role
  code already substituted for its real preset, same as
  nodes/script_library.py's resolve_roles does for the whole script) +
  instruct + text. A line is "voiced for what it currently says" exactly
  when its latest-version file's hash matches line_hash() of its current
  content -- computed fresh every time, never stored. This is what replaces
  _state.json's per-line "voiced/unvoiced/stale" status entirely: editing
  text, or recasting a role elsewhere in the project, changes the EXPECTED
  hash, so the existing file just stops matching -- no explicit "mark
  stale" action needed anywhere.
"""
import hashlib
import os
import re
from typing import Dict, List, Optional, Tuple

LINE_FILE_RE = re.compile(r"^(\d+)_(\d+)_([0-9a-f]+)\.wav$", re.IGNORECASE)
HASH_LEN = 8


def line_hash(speaker: str, instruct: str, text: str) -> str:
    """Short content fingerprint for one line -- same algorithm MUST run
    identically on the frontend (src/shared/line_hash.js) so a freshly typed
    edit's "is this still voiced" check agrees with what the backend wrote
    the file's name from. `speaker` must already be the RESOLVED preset (see
    module docstring), not a raw role code."""
    raw = f"{(speaker or '').strip()}|{(instruct or '').strip()}|{(text or '').strip()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:HASH_LEN]


def make_line_filename(position: int, version: int, content_hash: str) -> str:
    return f"{position:04d}_{version:02d}_{content_hash}.wav"


def parse_line_filename(name: str) -> Optional[Tuple[int, int, str]]:
    """filename -> (position, version, hash), or None if it doesn't match
    this scheme (e.g. a leftover _state.json, or an old id<N>.wav/NNNN.wav
    file from before this scheme existed -- those are simply invisible to
    every function below, never mistaken for a current take)."""
    m = LINE_FILE_RE.match(name)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2)), m.group(3).lower()


def list_lines_dir(lines_dir: str) -> List[Tuple[int, int, str, str]]:
    """Every (position, version, hash, filename) this scheme recognizes in
    `lines_dir` -- [] if the directory doesn't exist yet (nothing rendered)."""
    try:
        entries = os.listdir(lines_dir)
    except OSError:
        return []
    out = []
    for name in entries:
        parsed = parse_line_filename(name)
        if parsed is not None:
            out.append((parsed[0], parsed[1], parsed[2], name))
    return out


def latest_by_position(lines_dir: str) -> Dict[int, Tuple[int, str, str]]:
    """position -> (version, hash, filename) of the HIGHEST version at that
    position -- "the current take" for every line that has ever been
    rendered, regardless of whether its hash still matches current content."""
    latest: Dict[int, Tuple[int, str, str]] = {}
    for pos, version, content_hash, name in list_lines_dir(lines_dir):
        current = latest.get(pos)
        if current is None or version > current[0]:
            latest[pos] = (version, content_hash, name)
    return latest


def next_version_at(lines_dir: str, position: int) -> int:
    """1 if `position` has no files yet, else (highest existing version) + 1
    -- a pure "how many times has this position ever been rendered" counter,
    independent of hash, so a same-text re-roll still gets a fresh version
    instead of silently overwriting the previous take."""
    latest = latest_by_position(lines_dir).get(position)
    return (latest[0] + 1) if latest else 1


def reorganize_lines(lines_dir: str, deletes: List[int], moves: List[Tuple[int, int]]) -> Dict[str, list]:
    """
    Physically keeps _audio\\lines\\<script>\\ in sync with a structural
    edit (delete/merge/split a row in the line editor) -- called instead of
    ever trying to detect drift after the fact. `deletes` are positions
    whose row no longer exists at all (every version at that position is
    removed); `moves` are {old position -> new position} for rows that
    merely shifted, preserving each file's own version+hash untouched.

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
        for _, _, _, name in [e for e in list_lines_dir(lines_dir) if e[0] == pos]:
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
        for _, version, content_hash, name in [e for e in list_lines_dir(lines_dir) if e[0] == frm]:
            new_name = make_line_filename(to, version, content_hash)
            try:
                os.replace(os.path.join(lines_dir, name), os.path.join(lines_dir, new_name))
                moved.append({"from": name, "to": new_name})
            except OSError as e:
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't move {name} -> {new_name}: {e}")
    return {"deleted": deleted, "moved": moved}
