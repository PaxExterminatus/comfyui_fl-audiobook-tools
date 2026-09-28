"""
Standalone aiohttp server for the Electron app -- NOT tied to ComfyUI's
PromptServer. Route handlers are ported 1:1 from nodes/*.py (see each
route's docstring/comment for which original function it mirrors) so the
SAME frontend fetch calls (via web/fl_common.js's configurable API_BASE)
work unchanged whether talking to a real ComfyUI instance or this server.

Run directly for local testing: `python server.py` (defaults to
127.0.0.1:8765, matching electron-ui's expected VITE_API_BASE).
"""
import os
import re
import json
import csv
import hashlib
import random
import traceback
from datetime import datetime, timezone
from typing import Tuple, List, Optional, Dict

from aiohttp import web


def _windows_drives():
    if os.name != "nt":
        return []
    drives = []
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        drive = f"{letter}:\\"
        if os.path.isdir(drive):
            drives.append(drive)
    return drives


@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        resp = web.Response()
    else:
        resp = await handler(request)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp


async def preflight_handler(request):
    return web.Response()


routes = web.RouteTableDef()


# --- _speaker_presets replacement ---
def _cosyvoice_models_dir():
    env_dir = os.environ.get("FL_COSYVOICE_MODELS_DIR", "").strip()
    if env_dir and os.path.isdir(env_dir):
        return env_dir
    default_guess = r"C:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\models"
    if os.path.isdir(default_guess):
        return default_guess
    return None


def get_speaker_dir():
    models_dir = _cosyvoice_models_dir()
    if not models_dir:
        return None
    return os.path.join(models_dir, "cosyvoice", "speaker")


def list_speaker_presets():
    speaker_dir = get_speaker_dir()
    if not speaker_dir or not os.path.isdir(speaker_dir):
        return ["[none]"]
    names = [os.path.splitext(f)[0] for f in sorted(os.listdir(speaker_dir)) if f.endswith(".pt")]
    return names if names else ["[none]"]


# --- _line_audio helpers ---
LINE_FILE_RE = re.compile(r"^(\d+)_([0-9a-f]+)\.wav$", re.IGNORECASE)
HASH_LEN = 8

"""
Take/version files (multi-seed re-voice + text/instruct version history) --
ported 1:1 from nodes/_line_audio.py's own VERSION_FILE_RE block. ADDITIVE,
never replaces the canonical scheme above; deliberately doesn't match
LINE_FILE_RE so list_lines_dir/delete_stale_at_position/reorganize_lines
above stay blind to these files automatically.

`key` is a plain string, not necessarily a position -- the audiobook Line
Editor passes `f"{position:04d}"` (matching LINE_FILE_RE's own zero-padded
position exactly, for filename-format continuity), VO Dub passes its own
stable `audio_key` directly.
"""
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
    """Copies the version file onto `canonical_path` (caller supplies it
    explicitly -- e.g. `expected_path(...)` for audiobook, `audio_ru_path(...)`
    for VO Dub -- this function doesn't assume a naming convention for it)."""
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
    """Ported 1:1 from nodes/_line_audio.py's reorganize_lines (also moves
    version files + _history.json entries, not just canonical files)."""
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


# --- script_library helpers ---
def _looks_like_dialog_script(path: str) -> bool:
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = []
            for line in f:
                line = line.strip()
                if line:
                    lines.append(line)
                if len(lines) >= 50:
                    break
    except OSError:
        return False
    if not lines:
        return False
    hits = sum(1 for l in lines if l.count("|") in (2, 3))
    return hits >= max(1, len(lines) // 2)


def list_scripts(folder: str, suffix: str = "") -> Tuple[List[str], bool]:
    try:
        names = [f for f in os.listdir(folder) if f.lower().endswith(".txt") and not f.startswith("_")]
    except OSError:
        return [], False

    filter_applied = False
    if suffix.strip():
        filtered = [f for f in names if f.lower().endswith(suffix.strip().lower())]
        if filtered:
            names = filtered
            filter_applied = True

    names.sort(key=lambda n: (not _looks_like_dialog_script(os.path.join(folder, n)), n.lower()))
    return names, filter_applied


_ACT_RE = re.compile(r"^act\d+$", re.IGNORECASE)


def list_acts(root: str) -> Tuple[List[str], bool]:
    try:
        entries = [e for e in os.listdir(root) if os.path.isdir(os.path.join(root, e))]
    except OSError:
        return [], False

    acts = sorted([e for e in entries if _ACT_RE.match(e)], key=str.lower)
    if acts:
        return acts, True

    fallback = sorted([e for e in entries if not e.startswith((".", "_"))], key=str.lower)
    return fallback, False


def find_db_file(folder: str, filename: str, list_key: str) -> Tuple[Optional[str], int, str, List[dict]]:
    parent = os.path.dirname(folder.rstrip("\\/"))
    for candidate_dir in (folder, parent):
        if not candidate_dir:
            continue
        candidate = os.path.join(candidate_dir, filename)
        if os.path.isfile(candidate):
            try:
                with open(candidate, "r", encoding="utf-8") as f:
                    raw = f.read()
                data = json.loads(raw)
                if isinstance(data, dict):
                    entries = data.get(list_key, [])
                elif isinstance(data, list):
                    entries = data
                else:
                    entries = []
                return candidate, len(entries), raw, entries
            except (OSError, json.JSONDecodeError) as e:
                return candidate, 0, "", []
    return None, 0, "", []


MAX_LINE_PAUSE_S = 10.0
DEFAULT_LINE_GAP_S = 0.3


def effective_pauses(pauses: Optional[List[Optional[float]]], count: int) -> List[float]:
    out = []
    for pos in range(count):
        raw = pauses[pos] if pauses is not None and pos < len(pauses) else None
        if raw is None:
            raw = DEFAULT_LINE_GAP_S if pos < count - 1 else 0.0
        out.append(round(float(raw), 3))
    return out


def parse_pause_field(raw: str) -> Optional[float]:
    text = (raw or "").strip().replace(",", ".")
    if not text:
        return None
    try:
        value = float(text)
    except ValueError:
        return None
    if value < 0 or value > MAX_LINE_PAUSE_S:
        return None
    return value


def split_script_line(line: str) -> Optional[Tuple[str, str, str, Optional[float]]]:
    parts = line.split("|")
    if len(parts) == 3:
        preset, instruct, text = (p.strip() for p in parts)
        return preset, instruct, text, None
    if len(parts) == 4:
        preset, instruct, text, pause = (p.strip() for p in parts)
        return preset, instruct, text, parse_pause_field(pause)
    return None


def _parse_script_line(line: str) -> Optional[Tuple[str, str, str]]:
    parsed = split_script_line(line)
    if parsed is None:
        return None
    return parsed[0], parsed[1], parsed[2]


def role_map_from_entries(roles_list: List[dict]) -> Dict[str, str]:
    role_map: Dict[str, str] = {}
    for entry in roles_list:
        if not isinstance(entry, dict):
            continue
        code = str(entry.get("code") or "").strip()
        speaker = str(entry.get("speaker") or "").strip()
        if code and speaker:
            role_map[code] = speaker
    return role_map


def resolve_roles(script_content: str, role_map: Dict[str, str]) -> str:
    out_lines = []
    for line in script_content.split("\n"):
        parsed = split_script_line(line)
        if parsed is None:
            out_lines.append(line)
            continue
        preset, instruct, content, pause = parsed
        resolved = role_map.get(preset, preset)
        if resolved == preset and pause is None and line.count("|") == 2:
            out_lines.append(line)
        else:
            out_lines.append(f"{resolved} | {instruct} | {content}")
    return "\n".join(out_lines)


def strip_suffix_and_ext(filename: str, suffix: str) -> str:
    name = filename.strip()
    suf = suffix.strip()
    if suf and name.lower().endswith(suf.lower()):
        return name[: -len(suf)]
    return os.path.splitext(name)[0]


def scripts_with_audio(act_folder: str, scripts: List[str], suffix: str) -> List[str]:
    audio_dir = os.path.join(act_folder, "_audio")
    if not os.path.isdir(audio_dir):
        return []
    try:
        audio_entries = os.listdir(audio_dir)
    except OSError:
        return []
    audio_bases = [
        os.path.splitext(f)[0].lower()
        for f in audio_entries
        if os.path.isfile(os.path.join(audio_dir, f))
    ]
    if not audio_bases:
        return []
    result = []
    for script in scripts:
        needle = strip_suffix_and_ext(script, suffix).lower()
        if any(base.startswith(needle) for base in audio_bases):
            result.append(script)
    return result


def scripts_ready(act_folder: str, scripts: List[str], suffix: str) -> List[str]:
    candidates = scripts_with_audio(act_folder, scripts, suffix)
    return [
        f for f in candidates
        if os.path.isfile(_timing_manifest_path(act_folder, strip_suffix_and_ext(f, suffix)))
        and _manifest_matches_script_pauses(act_folder, f, suffix)
    ]


def script_pending_lines(act_folder: str, filename: str, suffix: str, role_map: Dict[str, str]) -> Tuple[Optional[str], List[dict]]:
    path = os.path.join(act_folder, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw_lines = [l for l in f.read().splitlines() if l.strip()]
    except OSError:
        return None, []

    base_name = strip_suffix_and_ext(filename, suffix)
    lines_dir = os.path.join(act_folder, "_audio", "lines", base_name)

    pending = []
    position = 0
    for line in raw_lines:
        parsed = _parse_script_line(line)
        if parsed is None:
            continue
        preset, instruct, text = parsed
        resolved = role_map.get(preset, preset)
        expected = line_hash(resolved, instruct, text)
        if not os.path.isfile(expected_path(lines_dir, position, expected)):
            pending.append({"position": position, "speaker": resolved, "instruct": instruct, "text": text, "hash": expected})
        position += 1
    return base_name, pending


def resolved_line_hashes(act_folder: str, filename: str, role_map: Dict[str, str]) -> List[str]:
    path = os.path.join(act_folder, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except OSError:
        return []
    resolved = resolve_roles(content, role_map)
    return [
        line_hash(*parsed)
        for parsed in (_parse_script_line(line) for line in resolved.split("\n"))
        if parsed is not None
    ]


def root_role_map(root: str) -> Dict[str, str]:
    return role_map_from_entries(find_db_file(root, "_roles.json", "roles")[3])


def scripts_pending_revoice(act_folder: str, scripts: List[str], suffix: str, role_map: Dict[str, str]) -> List[str]:
    result = []
    for filename in scripts:
        _, pending = script_pending_lines(act_folder, filename, suffix, role_map)
        if pending:
            result.append(filename)
    return result


def _timing_manifest_path(act_folder: str, base_name: str) -> str:
    return os.path.join(act_folder, "_audio", "timing", f"{base_name}.json")


def script_line_pauses(act_folder: str, filename: str, suffix: str) -> List[Optional[float]]:
    path = os.path.join(act_folder, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw_lines = [l for l in f.read().splitlines() if l.strip()]
    except OSError:
        return []
    out = []
    for line in raw_lines:
        parsed = split_script_line(line)
        if parsed is not None:
            out.append(parsed[3])
    return out


def _manifest_matches_script_pauses(act_folder: str, filename: str, suffix: str) -> bool:
    manifest_path = _timing_manifest_path(act_folder, strip_suffix_and_ext(filename, suffix))
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest_lines = json.load(f).get("lines") or []
    except (OSError, ValueError):
        return False
    if not manifest_lines:
        return True

    recorded = [
        l.get("pause_after") if isinstance(l, dict) else None
        for l in manifest_lines
    ]
    if all(p is None for p in recorded):
        recorded = effective_pauses(None, len(manifest_lines))
    else:
        recorded = effective_pauses(recorded, len(manifest_lines))

    current = script_line_pauses(act_folder, filename, suffix)
    return recorded == effective_pauses(current, len(current))


@routes.get("/fl_cosyvoice3/browse/list_dir")
async def browse_list_dir(request):
    """Ported 1:1 from nodes/script_library.py's
    fl_cosyvoice3_browse_list_dir -- server-side directory listing for the
    folder/file browse dialog (browsers don't expose real OS paths to page
    JS, so this has to go through a real backend with real disk access)."""
    raw_path = request.query.get("path", "").strip()
    ext = request.query.get("ext", "").strip().lower()

    if not raw_path:
        return web.json_response({"path": "", "parent": None, "dirs": [], "files": [], "drives": _windows_drives()})

    if not os.path.isdir(raw_path):
        return web.json_response({"error": f"not a folder: {raw_path}"})

    try:
        entries = os.listdir(raw_path)
    except OSError as e:
        return web.json_response({"error": str(e)})

    dirs = sorted([e for e in entries if os.path.isdir(os.path.join(raw_path, e))], key=str.lower)
    files = sorted(
        [e for e in entries if os.path.isfile(os.path.join(raw_path, e)) and (not ext or e.lower().endswith(ext))],
        key=str.lower,
    )
    file_mtimes = {}
    for f in files:
        try:
            file_mtimes[f] = os.path.getmtime(os.path.join(raw_path, f))
        except OSError:
            pass

    normalized = raw_path.rstrip("\\/") or raw_path
    parent = os.path.dirname(normalized)
    is_drive_root = os.name == "nt" and len(normalized) <= 3 and normalized[1:3] in (":", ":\\")
    if is_drive_root:
        parent = ""
    elif parent == normalized:
        parent = None

    return web.json_response({
        "path": raw_path,
        "parent": parent,
        "dirs": dirs,
        "files": files,
        "file_mtimes": file_mtimes,
        "drives": [],
    })


@routes.get("/fl_cosyvoice3/script_editor/read")
async def script_editor_read(request):
    """Ported 1:1 from nodes/script_editor.py's
    fl_cosyvoice3_script_editor_read."""
    path = request.query.get("path", "")
    if not path:
        return web.json_response({"error": "path is required"})
    if not os.path.isfile(path):
        return web.json_response({"exists": False, "content": "", "mtime": None})
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            content = f.read()
        return web.json_response({
            "exists": True,
            "content": content,
            "mtime": os.path.getmtime(path),
        })
    except OSError as e:
        return web.json_response({"error": str(e)})


@routes.post("/fl_cosyvoice3/script_editor/write")
async def script_editor_write(request):
    """Ported 1:1 from nodes/script_editor.py's
    fl_cosyvoice3_script_editor_write."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    path = data.get("path", "")
    content = data.get("content", "")
    if not path:
        return web.json_response({"error": "path is required"})
    try:
        directory = os.path.dirname(path)
        if directory and not os.path.isdir(directory):
            os.makedirs(directory, exist_ok=True)
        tmp_path = path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(content)
        os.replace(tmp_path, path)
        return web.json_response({"mtime": os.path.getmtime(path)})
    except OSError as e:
        return web.json_response({"error": str(e)})


@routes.get("/fl_cosyvoice3/script_library/audio")
async def fl_cosyvoice3_script_library_audio(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_audio."""
    path = request.query.get("path", "").strip()
    if not path or not os.path.isfile(path):
        return web.json_response({"error": f"not a file: {path}"}, status=404)
    return web.FileResponse(path)


@routes.get("/fl_cosyvoice3/script_library/speaker_presets")
async def fl_cosyvoice3_script_library_speaker_presets(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_speaker_presets."""
    presets = [p for p in list_speaker_presets() if p != "[none]"]
    return web.json_response({"presets": presets, "dir": get_speaker_dir()})


@routes.get("/fl_cosyvoice3/script_library/acts")
async def fl_cosyvoice3_script_library_acts(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_acts."""
    root = request.query.get("path", "").strip()
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})

    acts, filter_applied = list_acts(root)
    return web.json_response({"root": root, "acts": acts, "filter_applied": filter_applied})


@routes.get("/fl_cosyvoice3/script_library/tree")
async def fl_cosyvoice3_script_library_tree(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_tree."""
    root = request.query.get("path", "").strip()
    suffix = request.query.get("suffix", "")
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})

    acts, filter_applied = list_acts(root)
    role_map = root_role_map(root)
    tree = []
    for act in acts:
        act_folder = os.path.join(root, act)
        scripts, act_filter_applied = list_scripts(act_folder, suffix)
        audio_scripts = scripts_with_audio(act_folder, scripts, suffix)
        ready_scripts = scripts_ready(act_folder, scripts, suffix)
        pending_scripts = scripts_pending_revoice(act_folder, scripts, suffix, role_map)
        tree.append({
            "act": act,
            "scripts": scripts,
            "audio_scripts": audio_scripts,
            "ready_scripts": ready_scripts,
            "pending_scripts": pending_scripts,
            "filter_applied": act_filter_applied,
        })

    return web.json_response({"root": root, "tree": tree, "filter_applied": filter_applied})


@routes.get("/fl_cosyvoice3/script_library/scan")
async def fl_cosyvoice3_script_library_scan(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_scan."""
    root = request.query.get("path", "").strip()
    act = request.query.get("act", "").strip()
    suffix = request.query.get("suffix", "")
    if not root:
        return web.json_response({"error": "path is required"})

    selected_file = None
    if os.path.isfile(root):
        selected_file = os.path.basename(root)
        root = os.path.dirname(root)

    folder = os.path.join(root, act) if act else root
    if not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})

    scripts, filter_applied = list_scripts(folder, suffix)
    ready_scripts = scripts_ready(folder, scripts, suffix)
    roles_path, roles_count, _, roles_list = find_db_file(folder, "_roles.json", "roles")
    categories_path, categories_count, _, categories_list = find_db_file(folder, "_instruct_categories.json", "categories")

    return web.json_response({
        "root": root,
        "act": act,
        "folder": folder,
        "selected_file": selected_file,
        "scripts": scripts,
        "ready_scripts": ready_scripts,
        "filter_applied": filter_applied,
        "roles": {"path": roles_path, "count": roles_count, "entries": roles_list} if roles_path else None,
        "instruct_categories": {"path": categories_path, "count": categories_count, "entries": categories_list} if categories_path else None,
    })


@routes.get("/fl_cosyvoice3/script_library/line_hashes")
async def fl_cosyvoice3_script_library_line_hashes(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_line_hashes."""
    root = request.query.get("root", "").strip()
    act = request.query.get("act", "").strip()
    file = request.query.get("file", "").strip()

    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not file:
        return web.json_response({"error": "file is required"})

    act_folder = os.path.join(root, act) if act else root
    if not os.path.isdir(act_folder):
        return web.json_response({"error": f"not a folder: {act_folder}"})

    role_map = root_role_map(root)
    return web.json_response({"line_hashes": resolved_line_hashes(act_folder, file, role_map)})


try:
    import soundfile as sf
    import numpy as np
    _HAS_AUDIO_LIBS = True
except ImportError:
    _HAS_AUDIO_LIBS = False


def _line_uses_role(line: str, role_code: str) -> bool:
    parsed = _parse_script_line(line)
    return bool(parsed and parsed[0] == role_code)


def delete_final_audio(act_folder: str, base_name: str) -> List[str]:
    """Ported 1:1 from nodes/script_library.py's delete_final_audio."""
    audio_dir = os.path.join(act_folder, "_audio")
    if not os.path.isdir(audio_dir):
        return []
    needle = base_name.lower()
    deleted = []
    for entry in os.listdir(audio_dir):
        full_path = os.path.join(audio_dir, entry)
        if not os.path.isfile(full_path):
            continue
        base, _ = os.path.splitext(entry)
        if base.lower().startswith(needle):
            try:
                os.remove(full_path)
                deleted.append(entry)
            except OSError as e:
                print(f"[electron-server] WARNING: couldn't delete {full_path}: {e}")
    return deleted


def mark_role_stale_impl(root: str, role_code: str, suffix: str) -> Dict[str, list]:
    """Ported 1:1 from nodes/script_library.py's mark_role_stale."""
    changed = []
    role_map = root_role_map(root)
    acts, _ = list_acts(root)
    for act in acts:
        act_folder = os.path.join(root, act)
        scripts, _ = list_scripts(act_folder, suffix)
        ready_set = set(scripts_ready(act_folder, scripts, suffix))
        for filename in scripts:
            path = os.path.join(act_folder, filename)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    raw_lines = [l for l in f.read().splitlines() if l.strip()]
            except OSError:
                continue
            if not any(_line_uses_role(l, role_code) for l in raw_lines):
                continue

            base_name, pending = script_pending_lines(act_folder, filename, suffix, role_map)
            if not pending:
                continue

            was_ready = filename in ready_set
            deleted_audio = []
            if was_ready:
                deleted_audio = delete_final_audio(act_folder, base_name)

            changed.append({
                "act": act, "file": filename,
                "positions": [p["position"] for p in pending],
                "was_ready": was_ready, "deleted_audio": deleted_audio,
            })
    return {"changed": changed}


def find_pending_revoice(root: str, suffix: str) -> List[dict]:
    """Ported 1:1 from nodes/script_library.py's find_pending_revoice."""
    result = []
    role_map = root_role_map(root)
    acts, _ = list_acts(root)
    for act in acts:
        act_folder = os.path.join(root, act)
        scripts, _ = list_scripts(act_folder, suffix)
        for filename in scripts:
            base_name, pending = script_pending_lines(act_folder, filename, suffix, role_map)
            if pending:
                result.append({
                    "act": act, "file": filename, "folder": act_folder,
                    "base_name": base_name, "pending": pending,
                })
    return result


def stitch_lines_impl(
    act_folder: str,
    base_name: str,
    line_hashes: List[str],
    line_texts: Optional[List[str]] = None,
    pauses: Optional[List[Optional[float]]] = None,
) -> dict:
    """Ported 1:1 from nodes/script_library.py's stitch_lines."""
    lines_dir = os.path.join(act_folder, "_audio", "lines", base_name)
    if not line_hashes:
        raise ValueError("No lines to stitch.")

    pause_plan = effective_pauses(pauses, len(line_hashes))
    sample_rate = None
    pieces = []
    timing_lines = []
    cursor_samples = 0

    for pos, content_hash in enumerate(line_hashes):
        path = expected_path(lines_dir, pos, content_hash)
        if not os.path.isfile(path):
            raise FileNotFoundError(f"Line at position {pos} has no rendered audio matching its current content at {path}.")
        data, sr = sf.read(path, dtype="float32", always_2d=False)
        if sample_rate is None:
            sample_rate = sr
        elif sr != sample_rate:
            raise ValueError(f"Line at position {pos} has a different sample rate ({sr} vs {sample_rate}) -- can't merge safely.")

        line_samples = data.shape[0]
        timing_lines.append({
            "index": pos,
            "start": round(cursor_samples / sample_rate, 3),
            "end": round((cursor_samples + line_samples) / sample_rate, 3),
            "text": line_texts[pos] if line_texts and pos < len(line_texts) else "",
            "pause_after": pause_plan[pos],
        })
        pieces.append(data)
        cursor_samples += line_samples

        gap_samples = int(round(pause_plan[pos] * sample_rate))
        if gap_samples > 0:
            gap_shape = (gap_samples,) if data.ndim == 1 else (gap_samples,) + data.shape[1:]
            pieces.append(np.zeros(gap_shape, dtype=data.dtype))
            cursor_samples += gap_samples

    combined = np.concatenate(pieces, axis=0)

    audio_dir = os.path.join(act_folder, "_audio")
    os.makedirs(audio_dir, exist_ok=True)
    needle = base_name.lower()
    target_path = None
    for f in os.listdir(audio_dir):
        full = os.path.join(audio_dir, f)
        if not os.path.isfile(full):
            continue
        base, _ = os.path.splitext(f)
        if base.lower().startswith(needle) and (target_path is None or f.lower() > os.path.basename(target_path).lower()):
            target_path = full
    if target_path is None:
        target_path = os.path.join(audio_dir, f"{base_name}.wav")

    sf.write(target_path, combined, sample_rate)

    os.makedirs(os.path.dirname(_timing_manifest_path(act_folder, base_name)), exist_ok=True)
    with open(_timing_manifest_path(act_folder, base_name), "w", encoding="utf-8") as f:
        json.dump({"lines": timing_lines}, f, ensure_ascii=False, indent=2)

    return {"audio_path": target_path, "lines": timing_lines, "duration": round(cursor_samples / sample_rate, 3)}


@routes.get("/fl_cosyvoice3/script_library/pending_revoice")
async def fl_cosyvoice3_script_library_pending_revoice(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_pending_revoice."""
    root = request.query.get("path", "").strip()
    suffix = request.query.get("suffix", "")
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})

    return web.json_response({"scripts": find_pending_revoice(root, suffix)})


@routes.post("/fl_cosyvoice3/script_library/delete_audio")
async def fl_cosyvoice3_script_library_delete_audio(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_delete_audio."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    base_name = data.get("base_name", "").strip()

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    return web.json_response({"deleted": delete_final_audio(folder, base_name)})


@routes.post("/fl_cosyvoice3/script_library/mark_role_stale")
async def fl_cosyvoice3_script_library_mark_role_stale(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_mark_role_stale."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    root = data.get("root", "").strip()
    role_code = data.get("role_code", "").strip()
    suffix = data.get("suffix", "")

    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not role_code:
        return web.json_response({"error": "role_code is required"})

    result = mark_role_stale_impl(root, role_code, suffix)
    return web.json_response(result)


@routes.post("/fl_cosyvoice3/script_library/reorganize_lines")
async def fl_cosyvoice3_script_library_reorganize_lines(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_reorganize_lines."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    base_name = data.get("base_name", "").strip()
    deletes = data.get("deletes") or []
    moves = data.get("moves") or []

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})
    try:
        deletes = [int(p) for p in deletes]
        moves = [(int(m[0]), int(m[1])) for m in moves]
    except (TypeError, ValueError, IndexError):
        return web.json_response({"error": "deletes must be integers, moves must be [from, to] integer pairs"})

    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    result = reorganize_lines_impl(lines_dir, deletes, moves)
    return web.json_response(result)


@routes.post("/fl_cosyvoice3/script_library/stitch_lines")
async def fl_cosyvoice3_script_library_stitch_lines(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_stitch_lines."""
    if not _HAS_AUDIO_LIBS:
        return web.json_response({"error": "soundfile/numpy not installed on this server"})

    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    base_name = data.get("base_name", "").strip()
    line_texts = data.get("line_texts")
    line_hashes = data.get("line_hashes") or []
    pauses = data.get("pauses")
    if pauses is not None and not isinstance(pauses, list):
        return web.json_response({"error": "pauses must be an array"})

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})
    if not line_hashes or not all(isinstance(h, str) for h in line_hashes):
        return web.json_response({"error": "line_hashes must be a non-empty array of strings"})

    try:
        result = stitch_lines_impl(folder, base_name, line_hashes, line_texts=line_texts, pauses=pauses)
    except (FileNotFoundError, ValueError) as e:
        return web.json_response({"error": str(e)})
    except OSError as e:
        return web.json_response({"error": f"stitch failed: {e}"})

    return web.json_response(result)


@routes.post("/fl_cosyvoice3/script_library/replace_speaker")
async def fl_cosyvoice3_script_library_replace_speaker(request):
    """Ported 1:1 from nodes/script_library.py's fl_cosyvoice3_script_library_replace_speaker."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    old = data.get("old", "").strip()
    new = data.get("new", "").strip()
    suffix = data.get("suffix", "")

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not old or not new:
        return web.json_response({"error": "both old and new speaker values are required"})
    if old == new:
        return web.json_response({"files_changed": [], "lines_changed": 0})

    scripts, _ = list_scripts(folder, suffix)
    files_changed = []
    total_lines_changed = 0

    for filename in scripts:
        path = os.path.join(folder, filename)
        try:
            with open(path, "r", encoding="utf-8") as f:
                file_lines = f.read().splitlines()
        except OSError as e:
            print(f"[electron-server] WARNING: couldn't read {path}: {e}")
            continue

        changed = False
        file_lines_changed = 0
        new_lines = []
        for line in file_lines:
            parsed = split_script_line(line)
            if parsed and parsed[0] == old:
                rebuilt = f"{new} | {parsed[1]} | {parsed[2]}"
                if line.count("|") == 3:
                    rebuilt += f" | {line.split('|')[3].strip()}"
                new_lines.append(rebuilt)
                changed = True
                file_lines_changed += 1
            else:
                new_lines.append(line)

        if changed:
            try:
                with open(path, "w", encoding="utf-8") as f:
                    f.write("\n".join(new_lines) + "\n")
                files_changed.append({"file": filename, "lines_changed": file_lines_changed})
                total_lines_changed += file_lines_changed
            except OSError as e:
                print(f"[electron-server] WARNING: couldn't write {path}: {e}")

    return web.json_response({"files_changed": files_changed, "lines_changed": total_lines_changed})


# --- vo_dub_library.py port ---
DATASET_FILENAME = "vo_dataset.csv"
STATE_FILENAME = "_dub_state.json"
ROLES_FILENAME = "_dub_roles.json"
AUDIO_EN_DIRNAME = "audio_en"
AUDIO_RU_DIRNAME = "audio_ru"
AUDIO_DRY_DIRNAME = "_dub_dry"
SUPPORTED_CHANNELS = (1, 2)

STATUS_NO_TEXT = "no_text"
STATUS_NEEDS_TRANSLATION = "needs_translation"
STATUS_NOT_STARTED = "not_started"
STATUS_STALE = "stale"
STATUS_DONE = "done"
STATUS_UNSUPPORTED = "unsupported"
_STATUS_KEYS = (STATUS_NO_TEXT, STATUS_NEEDS_TRANSLATION, STATUS_NOT_STARTED, STATUS_STALE, STATUS_DONE, STATUS_UNSUPPORTED)


def dataset_path(root: str) -> str:
    return os.path.join(root, DATASET_FILENAME)


def dub_state_path(root: str) -> str:
    return os.path.join(root, STATE_FILENAME)


def audio_en_path(root: str, audio_key: str) -> str:
    return os.path.join(root, AUDIO_EN_DIRNAME, f"{audio_key}.wav")


def audio_ru_path(root: str, audio_key: str) -> str:
    return os.path.join(root, AUDIO_RU_DIRNAME, f"{audio_key}.wav")


def audio_dry_path(root: str, audio_key: str) -> str:
    return os.path.join(root, AUDIO_DRY_DIRNAME, f"{audio_key}.wav")


def read_dataset(root: str) -> List[dict]:
    path = dataset_path(root)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"no {DATASET_FILENAME} in {root} -- not a VO dub project root")
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def read_dub_state(root: str) -> dict:
    path = dub_state_path(root)
    if not os.path.isfile(path):
        return {"rows": {}}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict) and isinstance(data.get("rows"), dict):
            return data
    except (OSError, json.JSONDecodeError) as e:
        print(f"[electron-server] WARNING: couldn't parse {path}: {e}")
    return {"rows": {}}


def write_dub_state(root: str, state: dict) -> None:
    path = dub_state_path(root)
    tmp_path = path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, path)


def roles_path_vo(root: str) -> str:
    return os.path.join(root, ROLES_FILENAME)


def read_dub_roles_document(root: str) -> dict:
    path = roles_path_vo(root)
    if not os.path.isfile(path):
        return {"roles": {}}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            if not isinstance(data.get("roles"), dict):
                data["roles"] = {}
            return data
    except (OSError, json.JSONDecodeError) as e:
        print(f"[electron-server] WARNING: couldn't parse {path}: {e}")
    return {"roles": {}}


def read_dub_roles(root: str) -> Dict[str, dict]:
    return read_dub_roles_document(root).get("roles", {})


def read_dub_role_map(root: str) -> Dict[str, str]:
    return {
        code: entry["speaker"]
        for code, entry in read_dub_roles(root).items()
        if isinstance(entry, dict) and entry.get("speaker")
    }


def seed_dub_roles(root: str) -> Dict[str, list]:
    doc = read_dub_roles_document(root)
    roles = doc["roles"]
    existing_codes = set(roles.keys())
    tags = sorted({
        (row.get("speaker") or "").strip()
        for row in read_dataset(root)
        if (row.get("speaker") or "").strip()
    })
    added = [tag for tag in tags if tag not in existing_codes]
    if added:
        for tag in added:
            roles[tag] = {"character": "", "gender": "unknown", "actor": None, "description": "", "dub_direction": "", "speaker": ""}
        doc["roles"] = roles
        path = roles_path_vo(root)
        tmp_path = path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)
    return {"added": added}


def effective_russian(row: dict, state_entry: Optional[dict]) -> str:
    if state_entry and state_entry.get("russian_text"):
        return state_entry["russian_text"]
    return (row.get("russian") or "").strip()


def resolved_speaker(row: dict, state_entry: Optional[dict], role_map: Optional[Dict[str, str]] = None) -> str:
    value = (state_entry or {}).get("speaker_override") or (row.get("speaker") or "").strip()
    if role_map and value in role_map:
        return role_map[value]
    return value


def effect_of(state_entry: Optional[dict]) -> str:
    return (state_entry or {}).get("effect") or ""


def uses_original_as_sample(state_entry: Optional[dict], use_original_default: bool = False) -> bool:
    override = (state_entry or {}).get("use_original_sample")
    return use_original_default if override is None else bool(override)


def row_hash(
    row: dict,
    state_entry: Optional[dict],
    role_map: Optional[Dict[str, str]] = None,
    use_original_default: bool = False,
) -> str:
    text = effective_russian(row, state_entry)
    if not text:
        return ""
    instruct = (state_entry or {}).get("instruct", "")
    effect = effect_of(state_entry)
    original_sample = uses_original_as_sample(state_entry, use_original_default)
    instruct_for_hash = instruct
    if effect:
        instruct_for_hash += f"\x00effect={effect}"
    if original_sample:
        instruct_for_hash += "\x00sample=original"
    return line_hash(resolved_speaker(row, state_entry, role_map), instruct_for_hash, text)


def compute_row_status(
    effective_text: str, has_english: bool, audio_ru_exists: bool, hash_matches: bool,
    channels: Optional[int] = None, manually_marked_done: bool = False,
) -> str:
    if channels is not None and channels not in SUPPORTED_CHANNELS:
        return STATUS_UNSUPPORTED
    if not effective_text:
        return STATUS_NO_TEXT if not has_english else STATUS_NEEDS_TRANSLATION
    if not audio_ru_exists:
        return STATUS_NOT_STARTED
    return STATUS_DONE if (hash_matches or manually_marked_done) else STATUS_STALE


def row_view(root: str, row: dict, state: dict, role_map: Optional[Dict[str, str]] = None) -> dict:
    key = row.get("audio_key", "")
    entry = state.get("rows", {}).get(key)
    use_original_default = bool(state.get("use_original_default"))
    text = effective_russian(row, entry)
    exists = os.path.isfile(audio_ru_path(root, key))
    current_hash = row_hash(row, entry, role_map, use_original_default)
    hash_matches = bool(entry) and bool(current_hash) and entry.get("hash") == current_hash
    status = compute_row_status(
        text, bool((row.get("english") or "").strip()), exists, hash_matches,
        channels=_to_int(row.get("channels")),
        manually_marked_done=bool((entry or {}).get("manually_done")),
    )
    return {
        "audio_key": key,
        "episode": row.get("episode", ""),
        "speaker": resolved_speaker(row, entry, role_map),
        "speaker_tag": (row.get("speaker") or "").strip(),
        "english": row.get("english", ""),
        "russian": text,
        "instruct": (entry or {}).get("instruct", ""),
        "duration_s": _to_float(row.get("duration_s")),
        "channels": _to_int(row.get("channels")),
        "status": status,
        "rendered_duration_s": (entry or {}).get("rendered_duration_s"),
    }


def _to_int(value) -> Optional[int]:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def bucket_key_for(row: dict) -> str:
    episode = (row.get("episode") or "").strip()
    return f"E{episode}" if episode else "Other"


def build_tree(root: str) -> dict:
    rows = read_dataset(root)
    state = read_dub_state(root)
    role_map = read_dub_role_map(root)
    buckets: Dict[str, Dict[str, int]] = {}
    order: List[str] = []
    for row in rows:
        bucket = bucket_key_for(row)
        if bucket not in buckets:
            buckets[bucket] = {"count": 0, **{s: 0 for s in _STATUS_KEYS}}
            order.append(bucket)
        view = row_view(root, row, state, role_map)
        buckets[bucket]["count"] += 1
        buckets[bucket][view["status"]] += 1
    order.sort(key=lambda b: (b == "Other", b))
    return {"root": root, "buckets": [{"bucket": b, **buckets[b]} for b in order]}


def bucket_rows(root: str, bucket: str, status_filter: str = "") -> List[dict]:
    rows = read_dataset(root)
    state = read_dub_state(root)
    role_map = read_dub_role_map(root)
    out = []
    for row in rows:
        if bucket_key_for(row) != bucket:
            continue
        view = row_view(root, row, state, role_map)
        if status_filter and view["status"] != status_filter:
            continue
        out.append(view)
    return out


def mark_dub_role_stale(root: str, role_code: str) -> Dict[str, list]:
    rows_by_key = {r.get("audio_key", ""): r for r in read_dataset(root)}
    state = read_dub_state(root)
    changed = []
    for key, entry in state.get("rows", {}).items():
        row = rows_by_key.get(key)
        if row is None or not entry.get("hash"):
            continue
        if resolved_speaker(row, entry) != role_code:
            continue
        entry.pop("hash", None)
        changed.append(key)
    if changed:
        write_dub_state(root, state)
    return {"changed": changed}


def _to_float(value) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


@routes.get("/fl_cosyvoice3/vo_dub/tree")
async def fl_cosyvoice3_vo_dub_tree(request):
    """Ported 1:1 from nodes/vo_dub_library.py's fl_cosyvoice3_vo_dub_tree."""
    root = request.query.get("path", "").strip()
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    try:
        return web.json_response(build_tree(root))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})


@routes.get("/fl_cosyvoice3/vo_dub/rows")
async def fl_cosyvoice3_vo_dub_rows(request):
    """Ported 1:1 from nodes/vo_dub_library.py's fl_cosyvoice3_vo_dub_rows."""
    root = request.query.get("path", "").strip()
    bucket = request.query.get("bucket", "").strip()
    status_filter = request.query.get("status", "").strip()
    if not root:
        return web.json_response({"error": "path is required"})
    if not bucket:
        return web.json_response({"error": "bucket is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    try:
        rows = bucket_rows(root, bucket, status_filter)
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    return web.json_response({"root": root, "bucket": bucket, "rows": rows})


@routes.post("/fl_cosyvoice3/vo_dub/mark_role_stale")
async def fl_cosyvoice3_vo_dub_mark_role_stale(request):
    """Ported 1:1 from nodes/vo_dub_library.py's fl_cosyvoice3_vo_dub_mark_role_stale."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    role_code = (data.get("role_code") or "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not role_code:
        return web.json_response({"error": "role_code is required"})
    return web.json_response(mark_dub_role_stale(root, role_code))


@routes.post("/fl_cosyvoice3/vo_dub/mark_rendered")
async def fl_cosyvoice3_vo_dub_mark_rendered(request):
    """Ported 1:1 from nodes/vo_dub_library.py's fl_cosyvoice3_vo_dub_mark_rendered."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    content_hash = (data.get("hash") or "").strip()
    duration_s = _to_float(data.get("duration_s"))
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key or not content_hash:
        return web.json_response({"error": "audio_key and hash are required"})

    state = read_dub_state(root)
    entry = state["rows"].setdefault(audio_key, {})
    entry["hash"] = content_hash
    if duration_s is not None:
        entry["rendered_duration_s"] = duration_s
    write_dub_state(root, state)
    return web.json_response({"ok": True})


@routes.post("/fl_cosyvoice3/vo_dub/seed_roles")
async def fl_cosyvoice3_vo_dub_seed_roles(request):
    """Ported 1:1 from nodes/vo_dub_library.py's fl_cosyvoice3_vo_dub_seed_roles."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    try:
        return web.json_response(seed_dub_roles(root))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})


@routes.post("/fl_cosyvoice3/vo_dub/apply_effect")
async def fl_cosyvoice3_vo_dub_apply_effect(request):
    """Ported 1:1 from nodes/vo_dub_library.py's fl_cosyvoice3_vo_dub_apply_effect.
    Lazily imports torch/_audio_utils/_audio_effects (not installed/vendored
    on this standalone server yet) -- gracefully errors instead of crashing
    when they're missing, same posture as stitch_lines above."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    effect = (data.get("effect") or "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})

    dry_path = audio_dry_path(root, audio_key)
    if not os.path.isfile(dry_path):
        return web.json_response({"error": "no dry take yet for this row -- render it once first"})

    try:
        import torch
        import soundfile as sf_local
        from _audio_utils import save_wav
        from _audio_effects import apply_named_effect
    except ImportError as e:
        return web.json_response({"error": f"couldn't load the audio engine: {e}"})

    try:
        data_np, sample_rate = sf_local.read(dry_path, dtype="float32", always_2d=True)
    except Exception as e:
        return web.json_response({"error": f"couldn't read dry take: {e}"})
    wav = torch.from_numpy(data_np.T.copy())
    wav = apply_named_effect(wav, sample_rate, effect)

    ru_path = audio_ru_path(root, audio_key)
    try:
        ru_dir = os.path.dirname(ru_path)
        if ru_dir:
            os.makedirs(ru_dir, exist_ok=True)
        save_wav(wav, sample_rate, ru_path)
    except OSError as e:
        return web.json_response({"error": f"couldn't write {ru_path}: {e}"})

    return web.json_response({"ok": True})




@routes.post("/fl_cosyvoice3/vo_dub/render/row")
async def fl_cosyvoice3_vo_dub_render_row(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})
    try:
        takes = int(data.get("takes") or DEFAULT_TAKE_COUNT)
    except (TypeError, ValueError):
        return web.json_response({"error": "takes must be an integer"})
    if takes < 1:
        return web.json_response({"error": "takes must be at least 1"})
    explicit_seeds = data.get("seeds")
    if explicit_seeds is not None:
        if not isinstance(explicit_seeds, list) or len(explicit_seeds) != takes:
            return web.json_response({"error": f"seeds must be an array of exactly {takes} integers"})
        try:
            seeds = [int(s) for s in explicit_seeds]
        except (TypeError, ValueError):
            return web.json_response({"error": "seeds must be integers"})
    else:
        seeds = [random.randint(0, 2**31 - 1) for _ in range(takes)]
    try:
        rows = read_dataset(root)
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    row = next((r for r in rows if r.get("audio_key") == audio_key), None)
    if row is None:
        return web.json_response({"error": f"audio_key not found: {audio_key}"})
    state = read_dub_state(root)
    state_entry = state["rows"].get(audio_key)
    text = effective_russian(row, state_entry)
    if not text:
        return web.json_response({"error": "no Russian text yet for this row"})
    instruct = (state_entry or {}).get("instruct", "")
    speaker = resolved_speaker(row, state_entry, None)
    if not speaker:
        return web.json_response({"error": "no speaker resolved for this row"})
    content_hash = row_hash(row, state_entry, None, bool(state.get("use_original_default")))
    # Determine whether to use the original EN sample as the TTS voice.
    # Must go through uses_original_as_sample(): a per-row checkbox wins on its
    # own, the project-wide default only applies when the row was never touched.
    # An AND of the two was wrong twice over -- it ignored a ticked row whenever
    # the project default was off, and it disagreed with row_hash() above, which
    # already uses this helper, so a row could be hashed as "original sample"
    # and then rendered from a preset.
    use_original = uses_original_as_sample(
        state_entry, bool(state.get("use_original_default"))
    )
    if use_original:
        speaker_for_tts = ""   # empty tells CosyVoice to use referenceAudioPath
    else:
        speaker_for_tts = speaker
    versions_dir = os.path.join(root, "_dub_versions")
    os.makedirs(versions_dir, exist_ok=True)
    models_dir = _cosyvoice_models_dir()
    if not models_dir:
        return web.json_response({"error": "no CosyVoice models dir found"})
    speaker_dir = get_speaker_dir()
    try:
        import _tts_engine
        import _line_history
        results = []
        created_at = datetime.now(timezone.utc).isoformat()
        for seed in seeds:
                    version = next_version_number(versions_dir, audio_key)
                    version_path = os.path.join(versions_dir, make_version_filename(audio_key, version, content_hash, seed))
                    reference_path = audio_en_path(root, audio_key) if use_original else None
                    duration_s, sample_rate = _tts_engine.synthesize(models_dir, speaker_dir, speaker_for_tts, instruct, text, version_path, seed=seed, reference_audio_path=reference_path)
                    print(f"[DEBUG] synthesized {version_path} duration={duration_s}")
                    _line_history.append_version(versions_dir, audio_key, version, content_hash, seed, speaker, instruct, text, created_at)
                    results.append({"version": version, "seed": seed, "path": version_path, "duration_s": round(duration_s, 3), "sample_rate": sample_rate})
    except Exception as e:
        # str(e) alone is often unattributable (e.g. a bare libsndfile
        # "could not find MARK" says nothing about WHICH file or WHICH call
        # produced it) -- the JSON stays short for the UI, the full stack
        # goes to the server log where it can actually be diagnosed.
        traceback.print_exc()
        return web.json_response({"error": f"synthesis failed: {e}"})
    chosen_version = results[0]["version"]
    out_path = promote_version(versions_dir, audio_key, chosen_version, audio_ru_path(root, audio_key))
    print(f"[DEBUG] promote_version -> {out_path}")
    _line_history.set_chosen_version(versions_dir, audio_key, chosen_version)
    return web.json_response({"ok": True, "path": out_path, "hash": content_hash, "chosen_version": chosen_version, "takes": results})
@routes.get("/fl_cosyvoice3/vo_dub/line_history")
async def fl_cosyvoice3_vo_dub_line_history(request):
    root = request.query.get("root", "").strip()
    audio_key = request.query.get("audio_key", "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})
    import _line_history
    lines_dir = os.path.join(root, "_dub_versions")
    entry = _line_history.get_entry(lines_dir, audio_key) or {"chosen_version": None, "versions": []}
    return web.json_response(entry)


@routes.get("/fl_cosyvoice3/vo_dub/line_history/counts")
async def fl_cosyvoice3_vo_dub_line_history_counts(request):
    root = request.query.get("root", "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    import _line_history
    lines_dir = os.path.join(root, "_dub_versions")
    return web.json_response(_line_history.version_counts(lines_dir))


@routes.post("/fl_cosyvoice3/vo_dub/line_history/choose")
async def fl_cosyvoice3_vo_dub_line_history_choose(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    try:
        version = int(data.get("version"))
    except (TypeError, ValueError):
        return web.json_response({"error": "version must be an integer"})
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})
    import _line_history
    lines_dir = os.path.join(root, "_dub_versions")
    match = next((v for v in list_version_files(lines_dir, audio_key) if v[0] == version), None)
    if match is None:
        return web.json_response({"error": f"no version {version} for audio_key {audio_key}"})
    _, content_hash, _, _ = match
    try:
        out_path = promote_version(lines_dir, audio_key, version, audio_ru_path(root, audio_key))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    _line_history.set_chosen_version(lines_dir, audio_key, version)
    return web.json_response({"ok": True, "path": out_path, "chosen_version": version})
DEFAULT_TAKE_COUNT = 3


@routes.post("/fl_cosyvoice3/render/line")
async def fl_cosyvoice3_render_line(request):
    """Direct FL-CosyVoice3 synthesis (see _tts_engine.py, a module form of
    tts_prototype.py's already-proven call sequence) -- no ComfyUI queue or
    graph involved. Lazily imports torch/cosyvoice -- gracefully errors instead of
    crashing when the ML stack isn't installed on this server, same posture as
    stitch_lines/apply_effect above.

    Renders `takes` versions (default DEFAULT_TAKE_COUNT), each with its own
    fresh random seed unless `seeds` gives explicit ones -- one version file
    per take (see _line_audio.py's make_version_filename), recorded in this
    script's _history.json (_line_history.py), with the FIRST take promoted
    onto the canonical expected_path() so every existing consumer of that
    name (playback, stitching, pending-revoice detection) keeps working
    unchanged. Picking a different take later is a separate
    /line_history/choose call (see below), not part of this route."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = (data.get("folder") or "").strip()
    base_name = (data.get("base_name") or "").strip()
    speaker = (data.get("speaker") or "").strip()
    instruct = data.get("instruct") or ""
    text = (data.get("text") or "").strip()
    try:
        position = int(data.get("position"))
    except (TypeError, ValueError):
        return web.json_response({"error": "position must be an integer"})
    try:
        takes = int(data.get("takes") or DEFAULT_TAKE_COUNT)
    except (TypeError, ValueError):
        return web.json_response({"error": "takes must be an integer"})
    if takes < 1:
        return web.json_response({"error": "takes must be at least 1"})
    explicit_seeds = data.get("seeds")
    if explicit_seeds is not None:
        if not isinstance(explicit_seeds, list) or len(explicit_seeds) != takes:
            return web.json_response({"error": f"seeds must be an array of exactly {takes} integers"})
        try:
            seeds = [int(s) for s in explicit_seeds]
        except (TypeError, ValueError):
            return web.json_response({"error": "seeds must be integers"})
    else:
        seeds = [random.randint(0, 2**31 - 1) for _ in range(takes)]

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})
    if not speaker:
        return web.json_response({"error": "speaker is required"})
    if not text:
        return web.json_response({"error": "text is required"})

    models_dir = _cosyvoice_models_dir()
    if not models_dir:
        return web.json_response({"error": "no CosyVoice models dir found (set FL_COSYVOICE_MODELS_DIR)"})

    content_hash = line_hash(speaker, instruct, text)
    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    speaker_dir = get_speaker_dir()

    try:
        import _tts_engine
        import _line_history

        results = []
        created_at = datetime.now(timezone.utc).isoformat()
        for seed in seeds:
            version = next_version_number(lines_dir, f"{position:04d}")
            version_path = os.path.join(lines_dir, make_version_filename(f"{position:04d}", version, content_hash, seed))
            duration_s, sample_rate = _tts_engine.synthesize(
                models_dir, speaker_dir, speaker, instruct, text, version_path, seed=seed
            )
            _line_history.append_version(
                lines_dir, position, version, content_hash, seed, speaker, instruct, text, created_at
            )
            results.append({
                "version": version, "seed": seed, "path": version_path,
                "duration_s": round(duration_s, 3), "sample_rate": sample_rate,
            })
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    except Exception as e:
        return web.json_response({"error": f"synthesis failed: {e}"})

    chosen_version = results[0]["version"]
    out_path = promote_version(lines_dir, f"{position:04d}", chosen_version, expected_path(lines_dir, position, content_hash))
    _line_history.set_chosen_version(lines_dir, position, chosen_version)

    return web.json_response({
        "ok": True,
        "path": out_path,
        "hash": content_hash,
        "chosen_version": chosen_version,
        "takes": results,
    })


@routes.get("/fl_cosyvoice3/script_library/line_history")
async def fl_cosyvoice3_script_library_line_history(request):
    """Audiobook Line Editor's line-history lookup -- keyed by position (see
    _line_history.py's docstring for why position rather than a stable id).
    Returns the manifest entry {} when nothing's been rendered yet, same
    always-a-dict posture as read_dub_state()."""
    folder = request.query.get("folder", "").strip()
    base_name = request.query.get("base_name", "").strip()
    try:
        position = int(request.query.get("position", ""))
    except (TypeError, ValueError):
        return web.json_response({"error": "position must be an integer"})
    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    import _line_history

    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    entry = _line_history.get_entry(lines_dir, position) or {"chosen_version": None, "versions": []}
    return web.json_response(entry)


@routes.get("/fl_cosyvoice3/script_library/line_history/counts")
async def fl_cosyvoice3_script_library_line_history_counts(request):
    """One-shot version-count map for EVERY line in a script -- ported 1:1
    from nodes/script_library.py's own copy. Backs the Line Editor's
    per-row "History (N)" button without a per-row fetch."""
    folder = request.query.get("folder", "").strip()
    base_name = request.query.get("base_name", "").strip()
    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    import _line_history

    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    return web.json_response(_line_history.version_counts(lines_dir))


@routes.post("/fl_cosyvoice3/script_library/line_history/choose")
async def fl_cosyvoice3_script_library_line_history_choose(request):
    """Promotes one already-rendered version onto the canonical path (see
    _line_audio.py's promote_version) and records it as chosen -- this is
    the ONLY thing "pick the best take" in the Line History dialog does;
    every other version file stays on disk untouched."""
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    folder = (data.get("folder") or "").strip()
    base_name = (data.get("base_name") or "").strip()
    try:
        position = int(data.get("position"))
        version = int(data.get("version"))
    except (TypeError, ValueError):
        return web.json_response({"error": "position and version must be integers"})
    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    import _line_history

    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    key = f"{position:04d}"
    match = next((v for v in list_version_files(lines_dir, key) if v[0] == version), None)
    if match is None:
        return web.json_response({"error": f"no version {version} at position {position}"})
    _, content_hash, _, _ = match
    try:
        out_path = promote_version(lines_dir, key, version, expected_path(lines_dir, position, content_hash))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    _line_history.set_chosen_version(lines_dir, position, version)
    return web.json_response({"ok": True, "path": out_path, "chosen_version": version})


@routes.get("/health")
async def health(request):
    return web.json_response({"status": "ok"})


def create_app():
    app = web.Application(middlewares=[cors_middleware])
    app.add_routes(routes)
    app.router.add_route("OPTIONS", "/{path:.*}", preflight_handler)
    return app


if __name__ == "__main__":
    web.run_app(create_app(), host="127.0.0.1", port=8765)
