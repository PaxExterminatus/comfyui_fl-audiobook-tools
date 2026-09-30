"""
Helpers для script_library (аудиокнига): парсинг скриптов, список актов,
роли, stitch, delete_audio, pending-revoice.
"""
import os
import re
import json
from typing import Tuple, List, Optional, Dict

from _line_audio import line_hash, expected_path


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


def _line_uses_role(line: str, role_code: str) -> bool:
    parsed = _parse_script_line(line)
    return bool(parsed and parsed[0] == role_code)


def delete_final_audio(act_folder: str, base_name: str) -> List[str]:
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
    import soundfile as sf
    import numpy as np

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