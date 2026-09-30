"""
Helpers для vo_dub: dataset, state, roles, row_hash, row_view, build_tree.
"""
import csv
import json
import os
from typing import Dict, List, Optional

from _line_audio import line_hash


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


def write_dry_copy(root, audio_key, src_path):
    import shutil
    if not os.path.isfile(src_path):
        raise FileNotFoundError(f"source file not found: {src_path}")
    dest_path = audio_dry_path(root, audio_key)
    dest_dir = os.path.dirname(dest_path)
    if dest_dir:
        os.makedirs(dest_dir, exist_ok=True)
    shutil.copyfile(src_path, dest_path)
    return dest_path


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

    if (state_entry or {}).get("normalize"):
        db = (state_entry or {}).get("normalize_db")
        if db is None:
            db = -20.0
        instruct_for_hash += f"\x00normalize={float(db):.1f}"

    if (state_entry or {}).get("speed_match"):
        instruct_for_hash += "\x00speed=match"

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


def _to_float(value) -> Optional[float]:
    try:
        return float(value)
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