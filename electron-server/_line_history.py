"""
Per-line version manifest -- ported 1:1 from nodes/_line_history.py. See
that file's docstring for the full rationale; kept byte-identical to it,
same posture as _line_audio.py's own two copies in this project.
"""
import json
import os
from typing import Dict, Optional

HISTORY_FILENAME = "_history.json"


def history_path(lines_dir: str) -> str:
    return os.path.join(lines_dir, HISTORY_FILENAME)


def read_history(lines_dir: str) -> Dict[str, dict]:
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
    data = read_history(lines_dir)
    str_key = str(key)
    if str_key in data:
        del data[str_key]
        write_history(lines_dir, data)


def rename_entry(lines_dir: str, frm: str, to: str) -> None:
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
    return {key: len(entry.get("versions") or []) for key, entry in read_history(lines_dir).items()}
