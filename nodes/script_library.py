"""
FL CosyVoice3 Script Library Node
Folder browser for a play/project directory. Point folder_path at the
PROJECT ROOT (not a chapter folder directly) -- this node discovers the
"Act" subfolders inside it, and lists that act's dialog scripts.

Folder layout this is built around (see D:\\ai-voices\\Manacled (Скованные)
for a real example):

    MyPlay/                          <- folder_path points here
        _roles.json                  <- catalog of characters (see below)
        _instruct_categories.json    <- catalog of instruct2 phrases by emotional register (see below)
        Act01/
            Scene 0101 Something.txt    (a dialog script: "preset | instruct | line text",
                                          one turn per line)
        Act02/
            Scene 0201 Other.txt        (the "act" input picks this subfolder)

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

_instruct_categories.json shape: {"categories": [{"name", "title", "when",
"examples"}, ...]} -- a phrase bank grouped by emotional register rather
than by role (the same register fits any character in the right moment,
e.g. "cold_menace" or "fear_panic_horror"): "name" is a stable machine key,
"title" the human-readable label, "when" a short guide for which scene/beat
calls for this register, "examples" a list of ready-to-use instruct2
phrases in that register. Purely a picker aid for the line editor's
instruct field (see src/line_editor/LineEditorApp.vue's instruct Dropdown)
-- never auto-substituted into a script, and a line's own instruct text is
free-form either way, whether or not it happens to match one of these
examples.

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
    from ._speaker_presets import list_speaker_presets, get_speaker_dir
except (ImportError, ValueError):
    from _speaker_presets import list_speaker_presets, get_speaker_dir

try:
    from . import _line_audio
except (ImportError, ValueError):
    import _line_audio


def _looks_like_dialog_script(path: str) -> bool:
    """Sniff a .txt file: does it look like a 'preset | instruct | text'
    script? A line's optional 4th pause field counts too (see
    split_script_line) -- a scene written with pauses throughout must not
    stop looking like a script."""
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
    """
    .txt files directly in folder (non-recursive), excluding _-prefixed db
    files, sorted with dialog-script-looking files first, then alphabetically.

    suffix, if given, filters down to filenames ending with it -- an escape
    hatch for a project that still names its scripts with some older
    convention (e.g. "_dialog.txt"). Empty (the default) lists every .txt
    file, same as when nothing matches a non-empty suffix -- falls back to
    the unfiltered list rather than showing nothing.

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


MAX_LINE_PAUSE_S = 10.0
DEFAULT_LINE_GAP_S = 0.3  # silence held after a line that doesn't name its own pause


def effective_pauses(pauses: Optional[List[Optional[float]]], count: int) -> List[float]:
    """
    Resolves "silence to hold AFTER each of `count` lines" down to a
    concrete number per position: whatever that position asked for, else
    DEFAULT_LINE_GAP_S -- except after the LAST line, whose default is 0.
    A trailing pause is a deliberate choice (a scene that should end on
    held silence), never something the default adds behind the author's
    back, so a script with no pause fields at all still stitches to
    exactly the same audio it did before this field existed.

    The result is what goes into the timing manifest and what
    scripts_ready compares against it -- always the resolved numbers, so
    the check can't be fooled by "0.3 written out explicitly" vs "0.3 by
    default" being different spellings of the same track.
    """
    out = []
    for pos in range(count):
        raw = pauses[pos] if pauses is not None and pos < len(pauses) else None
        if raw is None:
            raw = DEFAULT_LINE_GAP_S if pos < count - 1 else 0.0
        out.append(round(float(raw), 3))
    return out


def parse_pause_field(raw: str) -> Optional[float]:
    """
    The optional 4th field's value -> seconds of silence to hold after this
    line, or None for "not specified, use the default" (see
    effective_pauses). Accepts a comma decimal separator too (a Russian
    keyboard types "1,2" far more naturally than "1.2", and this field is
    written by hand/by an LLM straight into the script file). Anything
    unparseable, negative, or past MAX_LINE_PAUSE_S is also None rather
    than an error: a typo in one line's pause must not make the line itself
    unrenderable -- it just falls back to the default gap, and the line
    editor shows the raw text it couldn't read.
    """
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
    """
    'preset | instruct | text' or 'preset | instruct | text | pause' ->
    (preset, instruct, text, pause_or_None). None if the line has neither 2
    nor 3 '|' separators.

    The 4th field is THIS addon's own: FL-CosyVoice3's Dialog node splits on
    '|' and requires exactly 3 fields (see nodes/speaker_instruct2_dialog.py
    _parse_script), so resolve_roles -- the one place a script's text leaves
    this addon for the graph -- always drops it back down to 3 fields. It
    also deliberately isn't part of a line's content hash: a pause is
    silence the STITCH inserts, not something the TTS renders, so changing
    one must never invalidate a line's existing take. What it does
    invalidate is the final stitched track, which scripts_ready checks for
    separately against the timing manifest's own recorded pauses.
    """
    parts = line.split("|")
    if len(parts) == 3:
        preset, instruct, text = (p.strip() for p in parts)
        return preset, instruct, text, None
    if len(parts) == 4:
        preset, instruct, text, pause = (p.strip() for p in parts)
        return preset, instruct, text, parse_pause_field(pause)
    return None


def _parse_script_line(line: str) -> Optional[Tuple[str, str, str]]:
    """'preset | instruct | text[ | pause]' -> (preset, instruct, text) --
    the speaker/instruct/text triple every hashing and role-resolution path
    here works in, with any 4th pause field dropped (see split_script_line
    for why a pause is not part of a line's identity)."""
    parsed = split_script_line(line)
    if parsed is None:
        return None
    return parsed[0], parsed[1], parsed[2]


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

    This is also where a line's optional 4th pause field is dropped: the
    Dialog node's own parser requires exactly 3 fields, so a 4-field line
    would reach it as malformed and be skipped entirely. Every line that
    HAS a 4th field is therefore re-emitted as 3, whether or not its role
    resolved to anything (which is why an empty role_map can't take the
    early-return shortcut it used to).
    """
    out_lines = []
    for line in script_content.split("\n"):
        parsed = split_script_line(line)
        if parsed is None:
            out_lines.append(line)
            continue
        preset, instruct, content, pause = parsed
        resolved = role_map.get(preset, preset)
        if resolved == preset and pause is None and line.count("|") == 2:
            out_lines.append(line)  # nothing to change -- keep the author's own spacing
        else:
            out_lines.append(f"{resolved} | {instruct} | {content}")
    return "\n".join(out_lines)


def strip_suffix_and_ext(filename: str, suffix: str) -> str:
    """
    'Manacled 0101 X.txt' + '' -> 'Manacled 0101 X'; with a non-empty
    script_filter, e.g. 'Manacled 0101 X_dialog.txt' + '_dialog.txt' ->
    'Manacled 0101 X'. Strips the suffix if the filename ends with it
    (case-insensitive); otherwise just strips the file extension (also
    what an empty suffix does -- "don't strip anything" beyond the
    extension). Used for the "filename" output.
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


def scripts_ready(act_folder: str, scripts: List[str], suffix: str) -> List[str]:
    """
    Which of `scripts` are "done / ready to release" -- true exactly when
    their final stitched track (written by stitch_lines, the "✅ Done"
    button, and only by it -- per-line takes live one level deeper, in
    _audio/lines/<base_name>/, never directly in _audio/) already exists in
    <act_folder>/_audio/. Nothing is persisted anywhere any more (no more
    _ready.json sidecar) -- un-marking is just deleting that file (see
    delete_final_audio/the "delete_audio" route), so this can never drift
    from what's actually on disk the way a separate flag could.

    Requires the matching timing manifest (_audio/timing/<base>.json) too,
    not just scripts_with_audio's looser "some file starting with the
    base name exists in _audio/" check -- stitch_lines always writes both
    together, atomically, so anything landing in _audio/ WITHOUT one (a
    stray Save Audio/VHS_SaveAudio node left wired downstream in the user's
    own graph, still writing there on every render even after "quick
    listen" nodes are meant to be stripped from this addon's own queued
    prompts -- see web/script_library.js's stripDownstreamAudioSavers) is
    never mistaken for the real thing, however plausible its name looks.

    The manifest must also still agree with the script's own per-line
    pauses -- see _manifest_matches_script_pauses for why that check lives
    here and not in the per-line pending check.
    """
    candidates = scripts_with_audio(act_folder, scripts, suffix)
    return [
        f for f in candidates
        if os.path.isfile(_timing_manifest_path(act_folder, strip_suffix_and_ext(f, suffix)))
        and _manifest_matches_script_pauses(act_folder, f, suffix)
    ]


def _line_uses_role(line: str, role_code: str) -> bool:
    parsed = _parse_script_line(line)
    return bool(parsed and parsed[0] == role_code)


def script_pending_lines(act_folder: str, filename: str, suffix: str, role_map: Dict[str, str]) -> Tuple[Optional[str], List[dict]]:
    """
    Parses `filename` fresh from disk, resolves each line's speaker through
    `role_map`, and checks whether _audio\\lines\\<base_name>\\ already has
    the exact file that content's position+hash would live at (see
    nodes/_line_audio.py's expected_path -- deterministic, no directory scan
    needed). Returns (base_name, pending) where `pending` is every line
    whose file is missing.

    This one function is the entire replacement for _state.json's per-line
    "voiced/unvoiced/stale" status -- nothing is stored anywhere; a role
    recast in _roles.json is picked up automatically the next time this
    runs (a fresh role_map naturally resolves that line's CURRENT preset,
    which just won't match the hash any existing file was named from), with
    no separate "mark stale" step needed. Returns (None, []) if the script
    itself can't be read.
    """
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
        expected = _line_audio.line_hash(resolved, instruct, text)
        if not os.path.isfile(_line_audio.expected_path(lines_dir, position, expected)):
            # "hash" is what the caller must stamp onto Post-Process's
            # line_hashes_json for a re-voice of THIS line (see
            # web/script_library.js's queueLineRevoice / ScriptLibraryPanel.
            # vue's revoiceAllPending) -- computed here from the exact same
            # role_map this scan already resolved against, so it can't drift
            # from what this function will check on the NEXT scan.
            pending.append({"position": position, "speaker": resolved, "instruct": instruct, "text": text, "hash": expected})
        position += 1
    return base_name, pending


def resolved_line_hashes(act_folder: str, filename: str, role_map: Dict[str, str]) -> List[str]:
    """
    Every parseable line's content hash, in script order -- same resolution
    and hashing FL_CosyVoice3_ScriptLibrary.browse()'s own line_hashes_json
    output computes for its script_content, just read straight from
    `filename` on disk instead. Lets the "🔊 Voice Selected/Act/All" queue
    (a FULL render of one or more checked scripts, never a single re-voiced
    line -- see web/script_library.js's app.graphToPrompt hook) stamp this
    directly onto Audio Post-Process's line_hashes_json input for the
    script actually being rendered, instead of depending on a manual graph
    wire from Script Library's own 4th output (see the /line_hashes route
    below, and this repo's README). Without either, Post-Process falls back
    to hashing text alone, which script_pending_lines' voice+instruct+text
    hash can never match -- every line renders successfully yet still
    shows "needs re-voice" right after.
    """
    path = os.path.join(act_folder, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except OSError:
        return []
    resolved = resolve_roles(content, role_map)
    return [
        _line_audio.line_hash(*parsed)
        for parsed in (_parse_script_line(line) for line in resolved.split("\n"))
        if parsed is not None
    ]


def root_role_map(root: str) -> Dict[str, str]:
    """role_map_from_entries, looked up from `root`'s own _roles.json --
    the same lookup browse() does, factored out since every read-only
    pending/stale check below also needs it."""
    return role_map_from_entries(find_db_file(root, "_roles.json", "roles")[3])


def scripts_pending_revoice(act_folder: str, scripts: List[str], suffix: str, role_map: Dict[str, str]) -> List[str]:
    """Which of `scripts` have at least one pending line -- backs the ⚠
    icon in the script tree (web/script_library.js), so a role recast's
    fallout is visible without opening every script one by one. See
    script_pending_lines."""
    result = []
    for filename in scripts:
        _, pending = script_pending_lines(act_folder, filename, suffix, role_map)
        if pending:
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


def mark_role_stale(root: str, role_code: str, suffix: str) -> Dict[str, list]:
    """
    Read-only fallout check for recasting a role (web/line_editor.js's
    "Change this role's speaker for the whole play"): for every script (any
    act) that has a line using `role_code`, re-resolves the CURRENT role_map
    and asks script_pending_lines whether anything no longer matches what's
    on disk. There's nothing to "mark" any more -- the moment _roles.json
    changed, the next hash comparison anywhere (here, the tree's ⚠ icon, an
    open line editor) already disagrees with whatever's baked into the
    existing file's name, with no separate action required for that part.

    The one thing still genuinely needing an ACTIVE step: a script marked
    ready to release keeps a frozen, separately-stitched final file that no
    per-line hash check can invalidate on its own -- so that still gets
    un-readied and deleted here, for every script actually affected.
    """
    changed = []
    role_map = root_role_map(root)
    acts, _ = list_acts(root)
    for act in acts:
        act_folder = os.path.join(root, act)
        scripts, _ = list_scripts(act_folder, suffix)
        ready_set = set(scripts_ready(act_folder, scripts, suffix))  # read once per act, not once per matching script
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
    """
    Every script (across every act) with at least one line whose
    latest-rendered take doesn't match its current (role-resolved) content
    -- backs the project-wide "🔁 Re-voice all pending" button
    (web/script_library.js), which needs to queue each one without a line
    editor open for its script. See script_pending_lines.
    """
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


def _timing_manifest_path(act_folder: str, base_name: str) -> str:
    return os.path.join(act_folder, "_audio", "timing", f"{base_name}.json")


def script_line_pauses(act_folder: str, filename: str, suffix: str) -> List[Optional[float]]:
    """
    Each parseable line's own pause-after value read straight off disk, in
    script order -- None where that line named no pause (see
    split_script_line / parse_pause_field). Same position numbering
    script_pending_lines and stitch_lines use: malformed lines are skipped
    entirely and don't take a position.
    """
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
    """
    Is the final stitched track still built with the pauses the script
    currently asks for? A pause isn't part of a line's content hash (it's
    silence the stitch inserts, not audio the TTS renders -- see
    split_script_line), so changing one leaves every per-line take valid
    and would otherwise go completely undetected: the ✅ would stay on a
    track that no longer matches the script. Comparing the manifest's own
    recorded plan against the script's current one closes that, and keeps
    "done" the same kind of plain disk fact it already is.

    Line COUNT is part of the comparison, which also closes the older
    version of the same hole: deleting a line from a done script left every
    remaining take valid at its shifted position (reorganize_lines moves
    the files), so nothing flagged the now-too-long final track either.

    Manifests written before this field existed (no "pause_after" on any
    line) are read as the fixed 0.3s-between-lines plan that stitch always
    used back then -- so a script nobody has touched keeps its ✅ instead of
    every already-done script un-readying itself on upgrade.
    """
    manifest_path = _timing_manifest_path(act_folder, strip_suffix_and_ext(filename, suffix))
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest_lines = json.load(f).get("lines") or []
    except (OSError, ValueError):
        return False
    if not manifest_lines:
        # A manifest with no per-line records at all -- there's nothing to
        # compare against, so this stays "matching" rather than un-readying
        # a script on a guess. stitch_lines never writes one (it raises on
        # an empty script), so in practice this is only a hand-made stub.
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


def stitch_lines(
    act_folder: str,
    base_name: str,
    line_hashes: List[str],
    line_texts: Optional[List[str]] = None,
    pauses: Optional[List[Optional[float]]] = None,
) -> dict:
    """
    Builds the final track by reading the EXACT file each position's
    current content hashes to (see nodes/_line_audio.py's expected_path --
    deterministic, no directory scan/"latest version" guessing) -- backs
    the "✅ Done" button, the only place a full stitch happens. `line_hashes`
    must be the caller's own freshly-computed hash per line (the line
    editor already has these -- see LineEditorApp.vue's toggleDone), so a
    missing file here is a real error (state genuinely doesn't match disk),
    not something to skip over or fall back to guessing about.

    `pauses` is each position's own silence-after in seconds, None where
    that line didn't name one (see effective_pauses for how the defaults
    resolve, and split_script_line for the 4th script field they're read
    from). The resolved plan is written into the timing manifest so
    scripts_ready can tell later whether the pauses this track was built
    with are still what the script asks for.
    """
    lines_dir = os.path.join(act_folder, "_audio", "lines", base_name)
    if not line_hashes:
        raise ValueError("No lines to stitch.")

    pause_plan = effective_pauses(pauses, len(line_hashes))
    sample_rate = None
    pieces = []
    timing_lines = []
    cursor_samples = 0

    for pos, content_hash in enumerate(line_hashes):
        path = _line_audio.expected_path(lines_dir, pos, content_hash)
        if not os.path.isfile(path):
            raise FileNotFoundError(f"Line at position {pos} has no rendered audio matching its current content at {path}.")
        data, sr = sf.read(path, dtype="float32", always_2d=False)
        if sample_rate is None:
            sample_rate = sr
        elif sr != sample_rate:
            raise ValueError(f"Line at position {pos} has a different sample rate ({sr} vs {sample_rate}) -- can't merge safely.")

        line_samples = data.shape[0]
        # start/end bound the SPEECH only, never the silence after it --
        # the line editor's playback highlight would otherwise sit on a
        # line that already finished talking for the whole pause.
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
        speaker" control in web/roles_editor.js / the line editor's speaker
        picker dialog, so assigning a voice to a role picks from what's
        actually available instead of free-typing a name that might not
        exist yet. `dir` (the same folder list_speaker_presets() itself
        scans) lets the frontend build a sample-audio URL for each preset
        via the existing generic /audio route -- <dir>/<preset>.mp3 or
        .wav, whichever exists (there's no server-side existence check
        here; the frontend's <audio> element just tries one, then the
        other, same as it already does for a "no take yet" line).
        """
        presets = [p for p in list_speaker_presets() if p != "[none]"]
        return web.json_response({"presets": presets, "dir": get_speaker_dir()})

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
        """
        Every line's resolved content hash for ONE script, in order -- see
        resolved_line_hashes. Backs the checkbox-tree queue's own
        auto-stamp of Audio Post-Process's line_hashes_json (web/
        script_library.js's app.graphToPrompt hook), so a FULL render never
        depends on the user having wired Script Library's own
        line_hashes_json output to Post-Process by hand.
        """
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

    @routes.post("/fl_cosyvoice3/script_library/delete_audio")
    async def fl_cosyvoice3_script_library_delete_audio(request):
        """
        Deletes every rendered-audio file matching this script's base name in
        <folder>/_audio/ -- same prefix match as scripts_with_audio / the
        line editor's mini player (a Save Audio node's filename_prefix
        produces "<base>_00001_.flac", never one exact file). Backs both the
        "🗑 Delete audio" button and the line editor's "Done" button when
        un-marking a script (see scripts_ready -- deleting this IS how a
        script goes from ready back to editable, there's no separate flag
        to flip any more).
        """
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
        suffix = data.get("suffix", "")

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
        suffix = request.query.get("suffix", "")
        if not root:
            return web.json_response({"error": "path is required"})
        if not os.path.isdir(root):
            return web.json_response({"error": f"not a folder: {root}"})

        return web.json_response({"scripts": find_pending_revoice(root, suffix)})

    @routes.post("/fl_cosyvoice3/script_library/reorganize_lines")
    async def fl_cosyvoice3_script_library_reorganize_lines(request):
        """
        Keeps _audio\\lines\\<base_name>\\ in sync with a structural edit
        (delete/merge/split a row) in the line editor -- see
        nodes/_line_audio.py's reorganize_lines. Called instead of ever
        trying to detect drift after the fact: `deletes` are positions
        whose row no longer exists at all, `moves` are [from, to] pairs for
        rows that merely shifted position, preserving their own
        version+hash untouched.
        """
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
        result = _line_audio.reorganize_lines(lines_dir, deletes, moves)
        return web.json_response(result)

    @routes.post("/fl_cosyvoice3/script_library/stitch_lines")
    async def fl_cosyvoice3_script_library_stitch_lines(request):
        """
        Stitches the exact file each position's current content hashes to
        into the final track -- the line editor's "✅ Done" button. See
        stitch_lines for the actual logic.
        """
        try:
            data = await request.json()
        except Exception as e:
            return web.json_response({"error": f"invalid request body: {e}"})

        folder = data.get("folder", "").strip()
        base_name = data.get("base_name", "").strip()
        line_texts = data.get("line_texts")
        line_hashes = data.get("line_hashes") or []
        # Per-position silence-after, None/absent where that line names no
        # pause of its own -- the line editor sends what its rows currently
        # say rather than having this re-read the file, exactly as it
        # already does for line_hashes/line_texts.
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
            result = stitch_lines(folder, base_name, line_hashes, line_texts=line_texts, pauses=pauses)
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
                print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't read {path}: {e}")
                continue

            changed = False
            file_lines_changed = 0
            new_lines = []
            for line in file_lines:
                parsed = split_script_line(line)
                if parsed and parsed[0] == old:
                    # Rebuilt through split_script_line, not the 3-field
                    # parser: rewriting only the speaker must not silently
                    # drop a line's own pause field along with it.
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
                    print(f"[FL CosyVoice3 ScriptLibrary] WARNING: couldn't write {path}: {e}")

        print(f"[FL CosyVoice3 ScriptLibrary] Replaced speaker '{old}' -> '{new}' in {folder}: "
              f"{total_lines_changed} line(s) across {len(files_changed)} file(s)")
        return web.json_response({"files_changed": files_changed, "lines_changed": total_lines_changed})


class FL_CosyVoice3_ScriptLibrary:
    """
    Browse a play/project folder: folder_path is the PROJECT ROOT; act picks
    one of its "Act01"/"Act02"/... subfolders (see module docstring), and
    that act's dialog scripts (every .txt file by default, or only those
    ending with script_filter if it's set) are listed. Also surfaces the
    shared _roles.json / _instruct_categories.json catalogs, which live at
    the project root.

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

    RETURN_TYPES = ("STRING", "STRING", "STRING", "STRING")
    RETURN_NAMES = ("script", "folder_path", "filename", "line_hashes_json")
    OUTPUT_TOOLTIPS = (
        "The active script's content (role codes resolved to real speaker presets).",
        "Full path to the active act's folder (folder_path input + act, joined).",
        "The active script_file's name, without the script_filter suffix (if any) "
        "and without its extension.",
        "JSON array of a short content hash (voice+instruct+text) per line, same "
        "order as `script`'s lines -- wire into FL CosyVoice3 Audio Post-Process's "
        "line_hashes_json so per-line files are named with a fingerprint the line "
        "editor can compare against, instead of a separate state file.",
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
                                   "Act02, ... subfolders, plus _roles.json / "
                                   "_instruct_categories.json) -- not a chapter folder directly. "
                                   "Click the browse button below to pick it, or type the path directly."
                }),
                "act": ("STRING", {
                    "default": "",
                    "description": "Which \"Act<NN>\" subfolder is currently active in the UI. Leave "
                                   "empty to scan folder_path itself (no Act subfolder)."
                }),
                "script_filter": ("STRING", {
                    "default": "",
                    "description": "Only list .txt files ending with this suffix -- an escape hatch "
                                   "for a project using some older per-script naming convention. If "
                                   "nothing matches, falls back to listing every .txt file instead of "
                                   "showing nothing. Leave empty (the default) to always list every "
                                   ".txt file."
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
        role_map: Dict[str, str] = {}
        if roles_path:
            lines.append(f"Roles DB: {roles_path} ({roles_count} roles)")
            role_map = role_map_from_entries(roles_list)
            if role_map:
                lines.append(f"Role resolution: {len(role_map)} role(s) resolved from _roles.json")
        else:
            lines.append("Roles DB: not found (_roles.json in project root)")
        # Unconditional, even with no roles to resolve: this is also where a
        # line's optional 4th pause field gets dropped, and Dialog's own
        # parser would skip any 4-field line as malformed (see resolve_roles).
        script_content = resolve_roles(script_content, role_map)

        message = "\n".join(lines)
        print(f"[FL CosyVoice3 ScriptLibrary]\n{message}")

        # Per-line content hash, same order as script_content's parseable
        # lines (malformed ones -- not exactly "preset | instruct | text" --
        # are skipped, same as Dialog's own parser skips them when deciding
        # what to actually synthesize) -- see nodes/_line_audio.py. Computed
        # from the ALREADY role-resolved content above, so this is just the
        # real preset that'll actually be synthesized, no second lookup.
        line_hashes = [
            _line_audio.line_hash(*parsed)
            for parsed in (_parse_script_line(line) for line in script_content.split("\n"))
            if parsed is not None
        ]

        filename_out = strip_suffix_and_ext(script_file, script_filter) if script_file.strip() else ""
        return (script_content, folder, filename_out, json.dumps(line_hashes))
