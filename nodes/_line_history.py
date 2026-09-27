"""
Per-line version manifest -- the metadata half of the take/version scheme in
_line_audio.py (VERSION_FILE_RE etc). A version file's NAME only carries its
hash/seed (the hash is a one-way fingerprint), so the actual text/instruct/
speaker snapshot for each version -- what the Line History panel actually
shows -- lives here instead: one _history.json per script, next to that
script's per-line audio files (_audio\\lines\\<script>\\_history.json).

Keyed by a plain string (JSON object keys are always strings) -- the
audiobook Line Editor uses `str(position)` (see _line_audio.py's
VERSION_FILE_RE docstring for why position rather than a real stable id;
reorganize_lines keeps these keys in sync with a structural edit, same as
it already does for the version files themselves), while VO Dub uses its
own stable `audio_key` directly -- this module has no opinion on what a
key means.
"""
import json
import os
from typing import Dict, Optional

HISTORY_FILENAME = "_history.json"


def history_path(lines_dir: str) -> str:
    return os.path.join(lines_dir, HISTORY_FILENAME)


def read_history(lines_dir: str) -> Dict[str, dict]:
    """{} if there's no manifest yet, or it fails to parse -- callers never
    have to branch on shape, same posture as vo_dub_library.py's
    read_dub_state()."""
    path = history_path(lines_dir)
    if not os.path.isfile(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def write_history(lines_dir: str, data: Dict[str, dict]) -> None:
    os.makedirs(lines_dir, exist_ok=True)
    with open(history_path(lines_dir), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def append_version(
    lines_dir: str,
    key: str,
    version: int,
    content_hash: str,
    seed: int,
    speaker: str,
    instruct: str,
    text: str,
    created_at: str,
) -> Dict[str, dict]:
    """Records one freshly-rendered version's snapshot. Does NOT touch
    chosen_version -- callers decide separately (see set_chosen_version)
    which version a render should become the active/canonical one."""
    data = read_history(lines_dir)
    str_key = str(key)
    entry = data.setdefault(str_key, {"chosen_version": None, "versions": []})
    entry["versions"].append(
        {
            "version": version,
            "hash": content_hash,
            "seed": seed,
            "speaker": speaker,
            "instruct": instruct,
            "text": text,
            "created_at": created_at,
        }
    )
    write_history(lines_dir, data)
    return data


def set_chosen_version(lines_dir: str, key: str, version: int) -> Dict[str, dict]:
    data = read_history(lines_dir)
    str_key = str(key)
    entry = data.setdefault(str_key, {"chosen_version": None, "versions": []})
    entry["chosen_version"] = version
    write_history(lines_dir, data)
    return data


def get_entry(lines_dir: str, key: str) -> Optional[dict]:
    return read_history(lines_dir).get(str(key))


def delete_entry(lines_dir: str, key: str) -> None:
    """Drops `key`'s manifest entry entirely -- called by reorganize_lines
    when that position's row no longer exists at all (deleted/merged away),
    same moment its version files also get deleted. A no-op (no rewrite)
    when there was nothing to drop."""
    data = read_history(lines_dir)
    str_key = str(key)
    if str_key in data:
        del data[str_key]
        write_history(lines_dir, data)


def rename_entry(lines_dir: str, frm: str, to: str) -> None:
    """Moves `frm`'s manifest entry to key `to` -- called by
    reorganize_lines alongside the matching version-file renames, in the
    SAME per-move iteration (not a separate pass), so the manifest's keys
    never disagree with where the files actually ended up even mid-loop.
    A no-op (no rewrite) when frm has no entry to move."""
    str_frm, str_to = str(frm), str(to)
    if str_frm == str_to:
        return
    data = read_history(lines_dir)
    if str_frm not in data:
        return
    entry = data.pop(str_frm)
    data[str_to] = entry
    write_history(lines_dir, data)


def version_counts(lines_dir: str) -> Dict[str, int]:
    """{"<key>": number of versions, ...} for every key that has ANY
    history -- one read of _history.json for the WHOLE script, not one
    request per row. Exists specifically so the Line Editor's per-row
    "History (N)" button can show a real count without looping a fetch per
    line (that O(N) cost is exactly what this session's earlier
    LineEditorContent.vue perf fix removed elsewhere -- this route must not
    reintroduce the same shape of problem)."""
    return {key: len(entry.get("versions") or []) for key, entry in read_history(lines_dir).items()}
