"""
Helpers для именования per-line файлов, версий и хешей.
Формат имён: <key>_v<NNN>_<hash>_s<seed>.wav и <position>_<hash>.wav.
"""
import os
import re
import hashlib
from typing import Tuple, List, Optional, Dict


LINE_FILE_RE = re.compile(r"^(\d+)_([0-9a-f]+)\.wav$", re.IGNORECASE)
HASH_LEN = 8
VERSION_FILE_RE = re.compile(r"^(.+)_v(\d+)_([0-9a-f]+)_s(-?\d+)\.wav$", re.IGNORECASE)


def make_version_filename(key: str, version: int, content_hash: str, seed: int) -> str:
    return f"{key}_v{version:03d}_{content_hash}_s{seed}.wav"


def parse_version_filename(name: str) -> Optional[Tuple[str, int, str, int]]:
    m = VERSION_FILE_RE.match(name)
    if not m:
        return None
    return m.group(1), int(m.group(2)), m.group(3).lower(), int(m.group(4))


def list_version_files(lines_dir: str, key: str) -> List[Tuple[int, str, int, str]]:
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
    existing = list_version_files(lines_dir, key)
    return (existing[-1][0] + 1) if existing else 1


def promote_version(lines_dir: str, key: str, version: int, canonical_path: str) -> str:
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
    raw = f"{(speaker or '').strip()}|{(instruct or '').strip()}|{(text or '').strip()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:HASH_LEN]


def make_line_filename(position: int, content_hash: str) -> str:
    return f"{position:04d}_{content_hash}.wav"


def expected_path(lines_dir: str, position: int, content_hash: str) -> str:
    return os.path.join(lines_dir, make_line_filename(position, content_hash))


def parse_line_filename(name: str) -> Optional[Tuple[int, str]]:
    m = LINE_FILE_RE.match(name)
    if not m:
        return None
    return int(m.group(1)), m.group(2).lower()


def list_lines_dir(lines_dir: str) -> List[Tuple[int, str, str]]:
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


def reorganize_lines_impl(lines_dir: str, deletes: List[int], moves: List[Tuple[int, int]]) -> Dict[str, list]:
    if not os.path.isdir(lines_dir):
        return {"deleted": [], "moved": []}

    import _line_history

    deleted = []
    for pos in deletes:
        for _, _, name in [e for e in list_lines_dir(lines_dir) if e[0] == pos]:
            try:
                os.remove(os.path.join(lines_dir, name))
                deleted.append(name)
            except OSError as e:
                print(f"[electron-server] WARNING: couldn't delete {name}: {e}")
        for _, _, _, name in list_version_files(lines_dir, f"{pos:04d}"):
            try:
                os.remove(os.path.join(lines_dir, name))
                deleted.append(name)
            except OSError as e:
                print(f"[electron-server] WARNING: couldn't delete {name}: {e}")
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
                print(f"[electron-server] WARNING: couldn't move {name} -> {new_name}: {e}")
        for version, content_hash, seed, name in list_version_files(lines_dir, f"{frm:04d}"):
            new_name = make_version_filename(f"{to:04d}", version, content_hash, seed)
            try:
                os.replace(os.path.join(lines_dir, name), os.path.join(lines_dir, new_name))
                moved.append({"from": name, "to": new_name})
            except OSError as e:
                print(f"[electron-server] WARNING: couldn't move {name} -> {new_name}: {e}")
        _line_history.rename_entry(lines_dir, frm, to)
    return {"deleted": deleted, "moved": moved}