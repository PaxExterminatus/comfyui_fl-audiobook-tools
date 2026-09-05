"""
FL CosyVoice3 Script Library Node
Folder browser for a play/project directory. Point folder_path at the
PROJECT ROOT (not a chapter folder directly) -- this node discovers the
"Act" subfolders inside it, and lists that act's dialog scripts.

Folder layout this is built around (see D:\\ai-voices\\Manacled (Скованные)
for a real example):

    MyPlay/                          <- folder_path points here
        _roles.json                  <- catalog of characters (see below)
        _instructions.json           <- catalog of instruct2 phrases already used, per role
        Act01/
            Scene 0101 Something.txt            (raw prose, not a script)
            Scene 0101 Something_speakers.txt    (the actual dialog script:
                                                   "preset | instruct | line text")
        Act02/
            Scene 0201 Other_speakers.txt        (the "act" input picks this subfolder)

_roles.json shape: {"roles": [{"code", "name", "description", "speaker"},
...]} -- "code" is the stable role identifier a script line's preset field
names (e.g. "voldemort"); "speaker" is the real CosyVoice preset (optionally
"preset#tag") that role currently resolves to. This file is the single
source of truth for role -> speaker resolution: Script Library's "script"
output has every line's role code replaced with its "speaker" value before
it ever reaches a downstream node (see resolve_roles below), so FL
CosyVoice3 Speaker Instruct2 Dialog always sees a real preset and never
needs to know role codes exist. Edit "speaker" per role -- e.g. to re-cast
a character to a different voice -- via the "Roles" button (opens
web/roles_editor.js), which writes straight back to this file.

_instructions.json shape: {"instructions": [{"role", "text", "note",
"used_in"}, ...]} -- "role" matches a role "code" from _roles.json; this is
a phrase bank of instruct2 text already used for that role, for consistency
when writing new lines, not something auto-substituted into scripts.

This node is read-only browsing: it re-scans <folder_path>/<act> and
re-reads script_file fresh from disk on every run (see IS_CHANGED), the same
freshness guarantee FL CosyVoice3 Script Editor makes. To live-edit a script
found here, point a Script Editor node at its resolved path.

NOTE: this node lives in its own custom_nodes package (comfyui_fl-audiobook-
tools), separate from FL-CosyVoice3 itself -- it depends on FL-CosyVoice3
being installed for the actual TTS synthesis nodes (Speaker Instruct2
Dialog etc.) it's meant to be wired to in a workflow, but has no Python
import dependency on that package (see nodes/_speaker_presets.py). See this
repo's README for the one required upstream patch (a 3rd output on FL
CosyVoice3 Speaker Instruct2 Dialog) the per-line timing/re-voice features
need.
"""

import os
import re
import json
import soundfile as sf
import numpy as np
from typing import Tuple, List, Optional, Dict

try:
    from server import PromptServer
    from aiohttp import web
    _HAS_SERVER = PromptServer.instance is not None
except (ImportError, AttributeError):
    _HAS_SERVER = False

try:
    from ._speaker_presets import list_speaker_presets
except (ImportError, ValueError):
    from _speaker_presets import list_speaker_presets


def _looks_like_dialog_script(path: str) -> bool:
    """Sniff a .txt file: does it look like a 'preset | instruct | text' script?"""
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
    hits = sum(1 for l in lines if l.count("|") == 2)
    return hits >= max(1, len(lines) // 2)


def list_scripts(folder: str, suffix: str = "") -> Tuple[List[str], bool]:
    """
    .txt files directly in folder (non-recursive), excluding _-prefixed db
    files, sorted with dialog-script-looking files first, then alphabetically.

    suffix (e.g. "_speakers.txt") filters down to matching filenames -- the
    project's convention for "this is a ready-to-use dialog script" as
    opposed to raw prose or older-naming leftovers. If nothing matches (e.g.
    an older chapter folder that used "_dialog.txt" or no suffix at all),
    falls back to the unfiltered list rather than showing nothing.

    Returns (names, filter_applied).
    """
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
    """
    Immediate subfolders of root that look like "Act01", "Act02", etc.
    Falls back to every subfolder (still excluding dotfiles/_-prefixed ones)
    if none match, same resilience pattern as list_scripts' suffix filter --
    a project that hasn't adopted "Act<NN>" naming yet still shows something.
    Returns (names, filter_applied).
    """
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
    """
    Look for <folder>/<filename>, then <parent of folder>/<filename> (chapter
    subfolders sit under a project root where the shared db files live).
    Returns (path_or_None, entry_count, raw_text, parsed_entries).
    """
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
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't parse {candidate}: {e}")
                return candidate, 0, "", []
    return None, 0, "", []


def _parse_script_line(line: str) -> Optional[Tuple[str, str, str]]:
    """'preset | instruct | text' -> (preset, instruct, text), or None if the
    line doesn't have exactly two '|' separators (matches the Dialog node's
    own parser -- see nodes/speaker_instruct2_dialog.py _parse_script)."""
    parts = line.split("|")
    if len(parts) != 3:
        return None
    return tuple(p.strip() for p in parts)  # type: ignore[return-value]


def role_map_from_entries(roles_list: List[dict]) -> Dict[str, str]:
    """
    Builds a {code: speaker} lookup from _roles.json's entries -- that file
    is the single source of truth for role resolution (see module
    docstring): a role with no "code" or no "speaker" is skipped (nothing
    to resolve to/from yet).
    """
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
    """
    Replaces the preset field of every parseable line with its role_map
    mapping (falls through unchanged if the field isn't a known role code --
    e.g. it's already a real preset#tag from before the role-code
    migration). Applied once, here, at Script Library's output -- so
    downstream nodes (FL CosyVoice3 Speaker Instruct2 Dialog included)
    always see real presets and never need to know role codes exist.
    """
    if not role_map:
        return script_content
    out_lines = []
    for line in script_content.split("\n"):
        parsed = _parse_script_line(line)
        if parsed is None:
            out_lines.append(line)
            continue
        preset, instruct, content = parsed
        resolved = role_map.get(preset, preset)
        out_lines.append(f"{resolved} | {instruct} | {content}" if resolved != preset else line)
    return "\n".join(out_lines)


def strip_suffix_and_ext(filename: str, suffix: str) -> str:
    """
    'Manacled 0101 X_speakers.txt' + '_speakers.txt' -> 'Manacled 0101 X'.
    Strips the script_filter suffix if the filename ends with it (case-
    insensitive); otherwise just strips the file extension (e.g. a filename
    that didn't actually match the filter -- the fallback "show every .txt"
    case in list_scripts). Used for the "filename" output.
    """
    name = filename.strip()
    suf = suffix.strip()
    if suf and name.lower().endswith(suf.lower()):
        return name[: -len(suf)]
    return os.path.splitext(name)[0]


def scripts_with_audio(act_folder: str, scripts: List[str], suffix: str) -> List[str]:
    """
    Which of `scripts` (filenames, as returned by list_scripts) already have
    rendered audio sitting in <act_folder>/_audio/ -- backs the speaker-icon
    in the script tree (web/script_library.js). Matches by PREFIX, same as
    the line editor's mini player (web/line_editor.js's loadAudio): a Save
    Audio node's filename_prefix produces names like "<base>_00001_.flac",
    never an exact "<base>.<ext>" match.
    """
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


def scripts_pending_revoice(act_folder: str, scripts: List[str], suffix: str) -> List[str]:
    """
    Which of `scripts` have at least one "stale" or "unvoiced" line in
    their per-line state (web/line_editor.js's per-row status, see
    reconcileState) -- backs the ⚠ icon in the script tree
    (web/script_library.js), so a role recast's fallout (mark_role_stale)
    is visible without opening every script one by one.
    """
    result = []
    for filename in scripts:
        _, state, _ = _script_line_state(act_folder, filename, suffix)
        if state and any(e.get("status") in ("stale", "unvoiced") for e in state["lines"]):
            result.append(filename)
    return result


def delete_final_audio(act_folder: str, base_name: str) -> List[str]:
    """
    Deletes every rendered-audio file matching `base_name` in
    <act_folder>/_audio/ -- same prefix match as scripts_with_audio / the
    line editor's mini player (a Save Audio node's filename_prefix produces
    "<base>_00001_.flac", never one exact file). Shared by the "🗑 Delete
    audio" button (fl_cosyvoice3_script_library_delete_audio) and
    mark_role_stale (a script that loses its ready status because a role it
    uses got recast can't keep a final file that no longer reflects every
    line's current voice).
    """
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
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't delete {full_path}: {e}")
    return deleted


def _state_file_path(act_folder: str, base_name: str) -> str:
    return os.path.join(act_folder, "_audio", "lines", base_name, "_state.json")


def _read_state(act_folder: str, base_name: str) -> Optional[dict]:
    path = _state_file_path(act_folder, base_name)
    if not os.path.isfile(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return None


def _write_state(act_folder: str, base_name: str, state: dict) -> None:
    path = _state_file_path(act_folder, base_name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp_path = path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, path)


def _script_line_state(act_folder: str, filename: str, suffix: str) -> Tuple[Optional[list], Optional[dict], Optional[str]]:
    """
    Reads one script's lines and its per-line state together -- the common
    lookup scripts_pending_revoice, mark_role_stale, and
    find_pending_revoice all need before they can do anything with a
    script's per-line status. Returns (parsed_lines, state, base_name):

    - parsed_lines is None (state and base_name too) if the script itself
      couldn't be read.
    - state is None (but parsed_lines/base_name still set) when there's no
      state file yet (script never opened in the per-line editor) or its
      line count no longer matches the script (something changed it
      outside the editor since its last save) -- same caution
      reconcileState's fast path takes client-side, so a caller can't
      trust POSITION i in parsed_lines to describe state["lines"][i] any
      other time.
    """
    path = os.path.join(act_folder, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw_lines = [l for l in f.read().splitlines() if l.strip()]
    except OSError:
        return None, None, None
    parsed = [_parse_script_line(l) for l in raw_lines]
    base_name = strip_suffix_and_ext(filename, suffix)
    state = _read_state(act_folder, base_name)
    if state is not None and len(state.get("lines", [])) != len(parsed):
        state = None
    return parsed, state, base_name


def mark_role_stale(root: str, role_code: str, suffix: str) -> Dict[str, list]:
    """
    Recasting a role (web/line_editor.js's "Change this role's speaker for
    the whole play") changes what EVERY line using that role code resolves
    to, project-wide -- but a line's own row (speaker/instruct/text) never
    changes, so nothing about the per-line state model
    (web/line_editor.js's reconcileState) would otherwise notice. Walks
    every act's scripts; for one that actually has a line using
    `role_code`:

    - Already has a per-line state file (matching the script's current
      line count) -- flips that line's "voiced" entries to "stale" (same
      status a text edit produces, so mode 1's 🔁 picks it up the same
      way), returned in "changed".
    - Doesn't (never opened in the per-line editor since it was
      introduced, or its line count has since drifted) -- there's no
      per-line granularity to mark yet, so it's reported separately in
      "untracked" instead of silently skipped, so the caller can actually
      tell the user "N script(s) use this role but haven't been opened in
      the new editor yet" rather than showing nothing happened at all.

    Either way, a script marked ready gets un-readied and its final file
    deleted: a frozen "done" file that no longer reflects one of its
    lines' actual voice isn't valid any more, tracked or not.

    Matches script <-> state POSITIONALLY (script line i <-> state line
    i), same assumption reconcileState's fast path makes.
    """
    changed = []
    untracked = []
    acts, _ = list_acts(root)
    for act in acts:
        act_folder = os.path.join(root, act)
        scripts, _ = list_scripts(act_folder, suffix)
        ready_set = set(scripts_ready(act_folder))  # read once per act, not once per matching script
        for filename in scripts:
            parsed, state, base_name = _script_line_state(act_folder, filename, suffix)
            if parsed is None or not any(p and p[0] == role_code for p in parsed):
                continue
            was_ready = filename in ready_set

            if state is None:
                deleted_audio = []
                if was_ready:
                    set_script_ready(act_folder, filename, False)
                    deleted_audio = delete_final_audio(act_folder, base_name)
                untracked.append({"act": act, "file": filename, "was_ready": was_ready, "deleted_audio": deleted_audio})
                continue

            marked_ids = []
            for i, entry in enumerate(state["lines"]):
                p = parsed[i]
                if p and p[0] == role_code and entry.get("status") == "voiced":
                    entry["status"] = "stale"
                    marked_ids.append(entry.get("id"))
            if not marked_ids:
                continue

            _write_state(act_folder, base_name, state)

            deleted_audio = []
            if was_ready:
                set_script_ready(act_folder, filename, False)
                deleted_audio = delete_final_audio(act_folder, base_name)

            changed.append({
                "act": act, "file": filename, "marked_ids": marked_ids,
                "was_ready": was_ready, "deleted_audio": deleted_audio,
            })
    return {"changed": changed, "untracked": untracked}


def find_pending_revoice(root: str, suffix: str) -> List[dict]:
    """
    Every script (across every act) that has at least one "stale" or
    "unvoiced" line, with that line's current speaker/instruct/text --
    backs the project-wide "🔁 Re-voice all pending" button
    (web/script_library.js), which needs to queue each one without a line
    editor open for its script.
    """
    result = []
    acts, _ = list_acts(root)
    for act in acts:
        act_folder = os.path.join(root, act)
        scripts, _ = list_scripts(act_folder, suffix)
        for filename in scripts:
            parsed, state, base_name = _script_line_state(act_folder, filename, suffix)
            if not state:
                continue

            pending = []
            for i, entry in enumerate(state["lines"]):
                if entry.get("status") not in ("stale", "unvoiced"):
                    continue
                p = parsed[i]
                if not p:
                    continue
                preset, instruct, text = p
                pending.append({
                    "id": entry.get("id"), "speaker": preset, "instruct": instruct,
                    "text": text, "status": entry.get("status"),
                })
            if pending:
                result.append({
                    "act": act, "file": filename, "folder": act_folder,
                    "base_name": base_name, "pending": pending,
                })
    return result


def mark_line_voiced(act_folder: str, base_name: str, line_id: int) -> bool:
    """Flips one line's state entry to "voiced" -- called by the
    project-wide "🔁 Re-voice all pending" button after each line's queued
    re-render finishes, same as a single 🔁 click would from an open line
    editor, just without one open for this particular script."""
    state = _read_state(act_folder, base_name)
    if not state:
        return False
    found = False
    for entry in state.get("lines", []):
        if entry.get("id") == line_id:
            entry["status"] = "voiced"
            found = True
    if found:
        _write_state(act_folder, base_name, state)
    return found


def _ready_file_path(act_folder: str) -> str:
    return os.path.join(act_folder, "_ready.json")


def scripts_ready(act_folder: str) -> List[str]:
    """
    Which scripts in this act are marked "done / ready to release" -- set via
    the line editor's ✅ Done button, persisted per-act in _ready.json
    ({"ready": [filename, ...]}), the same "_"-prefixed sidecar convention as
    _roles.json/_instructions.json. Backs the green checkmark in the script
    tree (web/script_library.js), which also refuses to keep a ready script
    checked for queueing.
    """
    path = _ready_file_path(act_folder)
    if not os.path.isfile(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError):
        return []
    ready = data.get("ready", []) if isinstance(data, dict) else []
    return [r for r in ready if isinstance(r, str)]


def set_script_ready(act_folder: str, filename: str, ready: bool) -> List[str]:
    """Adds/removes `filename` from _ready.json, returns the updated list."""
    current = set(scripts_ready(act_folder))
    if ready:
        current.add(filename)
    else:
        current.discard(filename)
    result = sorted(current)
    with open(_ready_file_path(act_folder), "w", encoding="utf-8") as f:
        json.dump({"ready": result}, f, ensure_ascii=False, indent=2)
    return result


DEFAULT_LINE_GAP_S = 0.3  # silence inserted between lines when stitching the final track


def _timing_manifest_path(act_folder: str, base_name: str) -> str:
    return os.path.join(act_folder, "_audio", "timing", f"{base_name}.json")


def commit_full_render(act_folder: str, base_name: str, row_texts: List[str], row_ids: List[Optional[int]]) -> dict:
    """
    After a FULL script render (Dialog+Post-Process just processed every
    current row, in order, writing plain positional files
    0000.wav..NNNN.wav into _audio/lines/<base_name>/), converts those to
    the STABLE-id naming scheme the line editor's per-line state relies on
    (id<N>.wav -- a different filename shape than the positional NNNN.wav
    one, so there's no risk of one rename clobbering another): renames
    each <position>.wav to id<id>.wav, assigning a fresh id for any row
    that doesn't have one yet. Idempotent -- safe to call speculatively
    any time the timing manifest's mtime changes and its line count
    matches the current script (see web/line_editor.js's loadTiming),
    since a row whose file was already renamed on a previous call simply
    has nothing left to rename.
    """
    lines_dir = os.path.join(act_folder, "_audio", "lines", base_name)
    if not os.path.isdir(lines_dir):
        raise FileNotFoundError(f"No per-line audio found for '{base_name}'.")

    existing_ids = [i for i in row_ids if isinstance(i, int)]
    next_id = (max(existing_ids) + 1) if existing_ids else 1

    assigned = []
    for pos in range(len(row_texts)):
        row_id = row_ids[pos] if pos < len(row_ids) and isinstance(row_ids[pos], int) else None
        if row_id is None:
            row_id = next_id
            next_id += 1
        assigned.append(row_id)

    committed_ids = []
    for pos, row_id in enumerate(assigned):
        src = os.path.join(lines_dir, f"{pos:04d}.wav")
        dst = os.path.join(lines_dir, f"id{row_id}.wav")
        if os.path.isfile(src):
            os.replace(src, dst)
            committed_ids.append(row_id)

    # committed_ids -- ONLY the rows whose positional file was actually just
    # renamed (a real, fresh full render). This call is speculative (see
    # the route's docstring) and often a no-op once every line is already
    # on the id<N>.wav scheme -- without this, the caller would have no way
    # to tell "just committed, mark voiced" apart from "nothing to do
    # here", and would wrongly stomp a row's genuine "stale" status (e.g.
    # text edited after the real commit already happened) back to
    # "voiced" on every idempotent re-check.
    return {"ids": assigned, "next_id": next_id, "committed_ids": committed_ids}


def stitch_lines(
    act_folder: str,
    base_name: str,
    line_ids: List[int],
    line_texts: Optional[List[str]] = None,
    pause_s: float = DEFAULT_LINE_GAP_S,
) -> dict:
    """
    Builds the final track by reading _audio/lines/<base_name>/id<N>.wav
    for each id in `line_ids`, in that exact order, with pause_s of
    silence between each -- backs the "✅ Done" button, the only place a
    full stitch happens once the per-line state workflow
    (web/line_editor.js) is driving. Every id is expected to already be
    voiced (Done only enables once every row's status is "voiced"), so a
    missing file here is a real error, not something to skip over -- it
    means the state is out of sync with what's actually on disk.
    """
    lines_dir = os.path.join(act_folder, "_audio", "lines", base_name)
    if not line_ids:
        raise ValueError("No lines to stitch.")

    sample_rate = None
    gap_samples = 0
    pieces = []
    timing_lines = []
    cursor_samples = 0

    for pos, line_id in enumerate(line_ids):
        path = os.path.join(lines_dir, f"id{line_id}.wav")
        if not os.path.isfile(path):
            raise FileNotFoundError(f"Line id {line_id} has no rendered audio at {path}.")
        data, sr = sf.read(path, dtype="float32", always_2d=False)
        if sample_rate is None:
            sample_rate = sr
            gap_samples = int(round(pause_s * sample_rate))
        elif sr != sample_rate:
            raise ValueError(f"Line id {line_id} has a different sample rate ({sr} vs {sample_rate}) -- can't merge safely.")

        if pos > 0 and gap_samples > 0:
            gap_shape = (gap_samples,) if data.ndim == 1 else (gap_samples,) + data.shape[1:]
            pieces.append(np.zeros(gap_shape, dtype=data.dtype))
            cursor_samples += gap_samples

        line_samples = data.shape[0]
        timing_lines.append({
            "index": line_id,
            "start": round(cursor_samples / sample_rate, 3),
            "end": round((cursor_samples + line_samples) / sample_rate, 3),
            "text": line_texts[pos] if line_texts and pos < len(line_texts) else "",
        })
        pieces.append(data)
        cursor_samples += line_samples

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


def _windows_drives() -> List[str]:
    if os.name != "nt":
        return []
    drives = []
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        drive = f"{letter}:\\"
        if os.path.isdir(drive):
            drives.append(drive)
    return drives


if _HAS_SERVER:
    routes = PromptServer.instance.routes

    @routes.get("/fl_cosyvoice3/browse/list_dir")
    async def fl_cosyvoice3_browse_list_dir(request):
        """
        Server-side directory listing for the in-node folder/file browse
        dialog (web/browse_dialog.js). Needed because browsers deliberately
        don't expose real filesystem paths to page JS (drag-and-drop of a
        folder only ever yields a sandboxed File object, never an absolute
        OS path) -- so picking a path has to go through our own backend,
        which does have real disk access, instead of the browser's File API.
        """
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
        # Lets a caller detect "this exact filename now has different bytes"
        # (e.g. the line editor's audio player, web/line_editor.js) -- a
        # deleted-then-re-rendered take can land on the exact same filename
        # (ComfyUI's Save Audio counter starts over once no matching files
        # remain), which a filename-only diff would wrongly call "unchanged".
        file_mtimes = {}
        for f in files:
            try:
                file_mtimes[f] = os.path.getmtime(os.path.join(raw_path, f))
            except OSError:
                pass

        normalized = raw_path.rstrip("\\/") or raw_path  # keep drive roots like "D:\" intact
        parent = os.path.dirname(normalized)
        is_drive_root = os.name == "nt" and len(normalized) <= 3 and normalized[1:3] in (":", ":\\")
        if is_drive_root:
            parent = ""  # "Up" from a drive root goes to the drive list
        elif parent == normalized:
            parent = None  # POSIX root ("/") has nowhere further up to go

        return web.json_response({
            "path": raw_path,
            "parent": parent,
            "dirs": dirs,
            "files": files,
            "file_mtimes": file_mtimes,
            "drives": [],
        })

    @routes.get("/fl_cosyvoice3/script_library/audio")
    async def fl_cosyvoice3_script_library_audio(request):
        """
        Streams an audio file back for the line editor's mini player
        (web/line_editor.js) -- the browser <audio> element needs a real
        URL to point src at, not JSON. web.FileResponse handles Content-Type
        guessing and Range requests (seeking) for us. Same "local backend,
        no extra path restriction" trust model as every other route in this
        file (list_dir, script_editor read/write) -- this plugin only ever
        runs against the local machine's own disk.
        """
        path = request.query.get("path", "").strip()
        if not path or not os.path.isfile(path):
            return web.json_response({"error": f"not a file: {path}"}, status=404)
        return web.FileResponse(path)

    @routes.get("/fl_cosyvoice3/script_library/speaker_presets")
    async def fl_cosyvoice3_script_library_speaker_presets(request):
        """Saved CosyVoice speaker presets (.pt files) -- backs the "pick a
        speaker" control in web/roles_editor.js, so assigning a voice to a
        role picks from what's actually available instead of free-typing a
        name that might not exist yet."""
        presets = [p for p in list_speaker_presets() if p != "[none]"]
        return web.json_response({"presets": presets})

    @routes.get("/fl_cosyvoice3/script_library/acts")
    async def fl_cosyvoice3_script_library_acts(request):
        root = request.query.get("path", "").strip()
        if not root:
            return web.json_response({"error": "path is required"})
        if not os.path.isdir(root):
            return web.json_response({"error": f"not a folder: {root}"})

        acts, filter_applied = list_acts(root)
        return web.json_response({"root": root, "acts": acts, "filter_applied": filter_applied})

    @routes.get("/fl_cosyvoice3/script_library/tree")
    async def fl_cosyvoice3_script_library_tree(request):
        """
        Every act and every one of its scripts in a single call -- backs the
        checkbox tree (web/script_library.js) used to build a multi-file
        selection for "Voice Act" / "Voice All" / "Voice Selected".
        """
        root = request.query.get("path", "").strip()
        suffix = request.query.get("suffix", "_speakers.txt")
        if not root:
            return web.json_response({"error": "path is required"})
        if not os.path.isdir(root):
            return web.json_response({"error": f"not a folder: {root}"})

        acts, filter_applied = list_acts(root)
        tree = []
        for act in acts:
            act_folder = os.path.join(root, act)
            scripts, act_filter_applied = list_scripts(act_folder, suffix)
            audio_scripts = scripts_with_audio(act_folder, scripts, suffix)
            ready_scripts = scripts_ready(act_folder)
            pending_scripts = scripts_pending_revoice(act_folder, scripts, suffix)
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
        root = request.query.get("path", "").strip()
        act = request.query.get("act", "").strip()
        suffix = request.query.get("suffix", "_speakers.txt")
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
        ready_scripts = scripts_ready(folder)
        roles_path, roles_count, _, roles_list = find_db_file(folder, "_roles.json", "roles")
        instructions_path, instructions_count, _, instructions_list = find_db_file(folder, "_instructions.json", "instructions")

        return web.json_response({
            "root": root,
            "act": act,
            "folder": folder,
            "selected_file": selected_file,
            "scripts": scripts,
            "ready_scripts": ready_scripts,
            "filter_applied": filter_applied,
            "roles": {"path": roles_path, "count": roles_count, "entries": roles_list} if roles_path else None,
            "instructions": {"path": instructions_path, "count": instructions_count, "entries": instructions_list} if instructions_path else None,
        })

    @routes.post("/fl_cosyvoice3/script_library/set_ready")
    async def fl_cosyvoice3_script_library_set_ready(request):
        """
        Toggles a script's "done / ready to release" flag -- the line
        editor's ✅ Done button. Persisted in <act folder>/_ready.json so it
        survives reloads and shows as a green checkmark back in the script
        tree, which also refuses to keep a ready script checked for
        queueing (see web/script_library.js's renderTree pruning).
        """
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        folder = data.get("folder", "").strip()
        filename = data.get("filename", "").strip()
        ready = bool(data.get("ready"))

        if not folder or not os.path.isdir(folder):
            return web.json_response({"error": f"not a folder: {folder}"})
        if not filename:
            return web.json_response({"error": "filename is required"})

        try:
            ready_scripts = set_script_ready(folder, filename, ready)
        except OSError as e:
            return web.json_response({"error": str(e)})

        return web.json_response({"ready": ready, "ready_scripts": ready_scripts})

    @routes.post("/fl_cosyvoice3/script_library/delete_audio")
    async def fl_cosyvoice3_script_library_delete_audio(request):
        """
        Deletes every rendered-audio file matching this script's base name in
        <folder>/_audio/ -- same prefix match as scripts_with_audio / the
        line editor's mini player (a Save Audio node's filename_prefix
        produces "<base>_00001_.flac", never one exact file). The "🗑 Delete
        audio" button next to the mini player, for clearing a take before
        re-rendering. Refused server-side too (not just grayed out in the
        UI) when the script is marked ready -- see scripts_ready.
        """
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        folder = data.get("folder", "").strip()
        base_name = data.get("base_name", "").strip()
        filename = data.get("filename", "").strip()

        if not folder or not os.path.isdir(folder):
            return web.json_response({"error": f"not a folder: {folder}"})
        if not base_name:
            return web.json_response({"error": "base_name is required"})
        if filename and filename in scripts_ready(folder):
            return web.json_response({"error": f'"{filename}" is marked ready to release -- unmark it first'})

        return web.json_response({"deleted": delete_final_audio(folder, base_name)})

    @routes.post("/fl_cosyvoice3/script_library/mark_role_stale")
    async def fl_cosyvoice3_script_library_mark_role_stale(request):
        """
        Project-wide fallout from recasting a role's speaker (web/
        line_editor.js's "Change this role's speaker for the whole play"):
        flips every already-voiced line using that role code to "stale" in
        whichever script(s) it appears in, across every act -- see
        mark_role_stale.
        """
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        root = data.get("root", "").strip()
        role_code = data.get("role_code", "").strip()
        suffix = data.get("suffix", "_speakers.txt")

        if not root or not os.path.isdir(root):
            return web.json_response({"error": f"not a folder: {root}"})
        if not role_code:
            return web.json_response({"error": "role_code is required"})

        result = mark_role_stale(root, role_code, suffix)
        return web.json_response(result)

    @routes.get("/fl_cosyvoice3/script_library/pending_revoice")
    async def fl_cosyvoice3_script_library_pending_revoice(request):
        """Every script (any act) with at least one stale/unvoiced line --
        backs the project-wide "🔁 Re-voice all pending" button. See
        find_pending_revoice."""
        root = request.query.get("path", "").strip()
        suffix = request.query.get("suffix", "_speakers.txt")
        if not root:
            return web.json_response({"error": "path is required"})
        if not os.path.isdir(root):
            return web.json_response({"error": f"not a folder: {root}"})

        return web.json_response({"scripts": find_pending_revoice(root, suffix)})

    @routes.post("/fl_cosyvoice3/script_library/mark_line_voiced")
    async def fl_cosyvoice3_script_library_mark_line_voiced(request):
        """Flips one line's state entry to "voiced" -- called by the
        project-wide re-voice-all loop after each queued line finishes.
        See mark_line_voiced."""
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        folder = data.get("folder", "").strip()
        base_name = data.get("base_name", "").strip()
        line_id = data.get("line_id")

        if not folder or not os.path.isdir(folder):
            return web.json_response({"error": f"not a folder: {folder}"})
        if not base_name:
            return web.json_response({"error": "base_name is required"})
        try:
            line_id = int(line_id)
        except (TypeError, ValueError):
            return web.json_response({"error": "line_id must be an integer"})

        found = mark_line_voiced(folder, base_name, line_id)
        return web.json_response({"found": found})

    @routes.post("/fl_cosyvoice3/script_library/commit_full_render")
    async def fl_cosyvoice3_script_library_commit_full_render(request):
        """
        Converts a just-finished FULL render's plain positional per-line
        files (0000.wav..) to the stable id<N>.wav naming the line editor's
        per-line state relies on -- see commit_full_render. Called by
        web/line_editor.js's loadTiming() whenever the timing manifest's
        mtime changes and its line count matches the current script.
        """
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        folder = data.get("folder", "").strip()
        base_name = data.get("base_name", "").strip()
        row_texts = data.get("row_texts") or []
        row_ids = data.get("row_ids") or []

        if not folder or not os.path.isdir(folder):
            return web.json_response({"error": f"not a folder: {folder}"})
        if not base_name:
            return web.json_response({"error": "base_name is required"})

        try:
            result = commit_full_render(folder, base_name, row_texts, row_ids)
        except (FileNotFoundError, ValueError) as e:
            return web.json_response({"error": str(e)})
        except OSError as e:
            return web.json_response({"error": f"commit failed: {e}"})

        return web.json_response(result)

    @routes.post("/fl_cosyvoice3/script_library/stitch_lines")
    async def fl_cosyvoice3_script_library_stitch_lines(request):
        """
        Stitches every line's id<N>.wav (in the given order) into the final
        track -- the line editor's "✅ Done" button. See stitch_lines for
        the actual logic.
        """
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        folder = data.get("folder", "").strip()
        base_name = data.get("base_name", "").strip()
        line_ids = data.get("line_ids") or []
        line_texts = data.get("line_texts")

        if not folder or not os.path.isdir(folder):
            return web.json_response({"error": f"not a folder: {folder}"})
        if not base_name:
            return web.json_response({"error": "base_name is required"})
        try:
            line_ids = [int(i) for i in line_ids]
        except (TypeError, ValueError):
            return web.json_response({"error": "line_ids must be integers"})

        try:
            result = stitch_lines(folder, base_name, line_ids, line_texts=line_texts)
        except (FileNotFoundError, ValueError) as e:
            return web.json_response({"error": str(e)})
        except OSError as e:
            return web.json_response({"error": f"stitch failed: {e}"})

        return web.json_response(result)

    @routes.post("/fl_cosyvoice3/script_library/replace_speaker")
    async def fl_cosyvoice3_script_library_replace_speaker(request):
        """
        Bulk rename: replace the preset field (exact match, including any
        "#tag") on every matching line, across every script_filter-matching
        file in `folder` -- the "apply to all files" button next to a line
        editor row's speaker input. Scoped to one act's folder, never the
        whole project, so the blast radius is visible and bounded.
        """
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        folder = data.get("folder", "").strip()
        old = data.get("old", "").strip()
        new = data.get("new", "").strip()
        suffix = data.get("suffix", "_speakers.txt")

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
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't read {path}: {e}")
                continue

            changed = False
            file_lines_changed = 0
            new_lines = []
            for line in file_lines:
                parsed = _parse_script_line(line)
                if parsed and parsed[0] == old:
                    new_lines.append(f"{new} | {parsed[1]} | {parsed[2]}")
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
                    print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't write {path}: {e}")

        print(f"[FL CosyVoice3 ScriptLibrary] Replaced speaker '{old}' -> '{new}' in {folder}: "
              f"{total_lines_changed} line(s) across {len(files_changed)} file(s)")
        return web.json_response({"files_changed": files_changed, "lines_changed": total_lines_changed})


class FL_CosyVoice3_ScriptLibrary:
    """
    Browse a play/project folder: folder_path is the PROJECT ROOT; act picks
    one of its "Act01"/"Act02"/... subfolders (see module docstring), and
    that act's dialog scripts (filtered to script_filter, e.g.
    "_speakers.txt") are listed. Also surfaces the shared _roles.json /
    _instructions.json catalogs, which live at the project root.

    The "🔊 Selected/Act/All" buttons (web/script_library.js) don't
    concatenate multiple scripts into one output -- each script gets its
    own separate ComfyUI queue entry (script_file is set to just that one
    file, then the whole graph is queued, one file at a time), so a
    multi-scene batch produces N separate audio files instead of one
    merged blob. This node's own output is always exactly one script's
    content, matching whatever script_file currently names.

    Click a script's "Edit" button (web/line_editor.js) to open the
    full-screen per-line editor -- edits save to disk (debounced) via the
    same generic read/write endpoints FL CosyVoice3 Script Editor uses. At
    execution time this node always re-reads every relevant file fresh from
    disk (see IS_CHANGED), so the output reflects whatever was last saved,
    regardless of front-end save timing.
    """

    RETURN_TYPES = ("STRING", "STRING", "STRING")
    RETURN_NAMES = ("script", "folder_path", "filename")
    OUTPUT_TOOLTIPS = (
        "The active script's content (role codes resolved to real speaker presets).",
        "Full path to the active act's folder (folder_path input + act, joined).",
        "The active script_file's name, without the script_filter suffix (e.g. "
        "\"_speakers.txt\") and without its extension.",
    )
    FUNCTION = "browse"
    CATEGORY = "🔊FL CosyVoice3/Synthesis"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "folder_path": ("STRING", {
                    "default": "",
                    "description": "Path to the PROJECT ROOT folder (the one containing Act01, "
                                   "Act02, ... subfolders, plus _roles.json / _instructions.json) -- "
                                   "not a chapter folder directly. Click the browse button below to "
                                   "pick it, or type the path directly."
                }),
                "act": ("STRING", {
                    "default": "",
                    "description": "Which \"Act<NN>\" subfolder is currently active in the UI. Leave "
                                   "empty to scan folder_path itself (no Act subfolder)."
                }),
                "script_filter": ("STRING", {
                    "default": "_speakers.txt",
                    "description": "Only list .txt files ending with this suffix (the project's "
                                   "convention for a ready-to-use dialog script, as opposed to raw "
                                   "prose or older-naming leftovers). If nothing matches, falls back "
                                   "to listing every .txt file instead of showing nothing. Leave "
                                   "empty to always list every .txt file."
                }),
                "script_file": ("STRING", {
                    "default": "",
                    "description": "Filename (not full path) of the single active script in the "
                                   "current act. Used as the output when \"selected\" is empty."
                }),
                "script": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "description": "Fallback content used only when script_file doesn't resolve to "
                                   "a real file."
                }),
            },
            "optional": {
                "line_override": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "description": "Service field for the line editor's \"🔁 Re-voice this line\" "
                                   "button: when non-empty, used as the ENTIRE script content instead "
                                   "of reading script_file from disk (role codes still resolve through "
                                   "_roles.json as usual) -- runs this SAME graph/model for just one "
                                   "line's text via the queue-override mechanism in "
                                   "web/script_library.js. Leave empty for normal use."
                }),
            }
        }

    @classmethod
    def IS_CHANGED(cls, folder_path: str, act: str, script_filter: str, script_file: str, script: str, line_override: str = ""):
        # Always rescan/reread from disk at execution time.
        return float("nan")

    def browse(self, folder_path: str, act: str, script_filter: str, script_file: str, script: str, line_override: str = "") -> Tuple[str]:
        root = folder_path.strip()
        lines = []

        if not root:
            # Raising here (instead of the old silent `return ("", "", "")`)
            # matters because folder_path/filename feed straight into a Save
            # node downstream -- an empty string limps through and only
            # surfaces as a confusing "Filename is empty" error several
            # nodes away, with no indication it actually came from here.
            raise ValueError(
                "[FL CosyVoice3 ScriptLibrary] folder_path is not set -- point it at your "
                "project's root folder (or click the browse button) before running."
            )

        if not os.path.isdir(root):
            raise ValueError(f"[FL CosyVoice3 ScriptLibrary] folder_path is not a folder: {root}")

        lines.append(f"Root: {root}")

        folder = os.path.join(root, act.strip()) if act.strip() else root
        lines.append(f"Act: {act.strip() or '(none -- scanning root itself)'}")

        if not os.path.isdir(folder):
            raise ValueError(
                f"[FL CosyVoice3 ScriptLibrary] Act folder not found: {folder} -- it may have "
                f"been moved/renamed/deleted since this script was checked in the tree."
            )

        scripts, filter_applied = list_scripts(folder, script_filter)
        if script_filter.strip() and not filter_applied:
            lines.append(f"Scripts found: {len(scripts)} -- none matched filter '{script_filter.strip()}', showing all .txt files instead")
        lines.append(f"Scripts found: {len(scripts)}" + (f" ({', '.join(scripts)})" if scripts else ""))

        script_content = script
        if line_override.strip():
            script_content = line_override
            lines.append("Selected: (line_override) -- single-line re-voice request")
        elif script_file.strip():
            script_path = os.path.join(folder, script_file.strip())
            if os.path.isfile(script_path):
                try:
                    with open(script_path, "r", encoding="utf-8") as f:
                        script_content = f.read()
                    lines.append(f"Selected: {script_file.strip()} ({len(script_content.splitlines())} lines)")
                except OSError as e:
                    lines.append(f"Selected: {script_file.strip()} -- READ ERROR: {e} -- using script box content")
            else:
                lines.append(f"Selected: {script_file.strip()} -- NOT FOUND in {folder} -- using script box content")
        else:
            lines.append("Selected: (none -- script_file is empty, using script box content)")

        roles_path, roles_count, _, roles_list = find_db_file(root, "_roles.json", "roles")
        if roles_path:
            lines.append(f"Roles DB: {roles_path} ({roles_count} roles)")
            role_map = role_map_from_entries(roles_list)
            if role_map:
                script_content = resolve_roles(script_content, role_map)
                lines.append(f"Role resolution: {len(role_map)} role(s) resolved from _roles.json")
        else:
            lines.append("Roles DB: not found (_roles.json in project root)")

        message = "\n".join(lines)
        print(f"[FL CosyVoice3 ScriptLibrary]\n{message}")

        filename_out = strip_suffix_and_ext(script_file, script_filter) if script_file.strip() else ""
        return (script_content, folder, filename_out)
