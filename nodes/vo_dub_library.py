"""
FL CosyVoice3 VO Dub Library
Browses a GAME localisation project instead of an authored Act/script
project -- a flat CSV of voice-over lines (`vo_dataset.csv`: one row per
`audio_key`, e.g. "Loc_E1_S2_Ellie1"), each with an existing English
reference performance (`audio_en/<audio_key>.wav`) to dub against and a
FIXED output filename (`audio_ru/<audio_key>.wav`) dictated by the game's
own repack pipeline -- not something this addon gets to choose.

This is deliberately a SEPARATE module from script_library.py rather than a
mode flag on it: Act-script projects have a folder hierarchy, reorderable
lines, and a "stitch many lines into one track" step; a VO dataset has none
of those (rows never reorder, and a rendered take IS the deliverable, not
an ingredient of one) -- see README.md's "VO Dubbing" section for the full
comparison. What DOES carry over untouched: the generic file-read/write
routes (nodes/script_editor.py), the generic /audio streaming route and
speaker-preset listing (script_library.py), and _line_audio.line_hash for
content fingerprinting.

`vo_dataset.csv` is a GENERATED file (see the game project's own
scripts/05_build_dataset.py) -- it's rebuilt from scratch from the game's
localisation spreadsheet on every run, with no read of its own previous
content. This addon must never write back into it: any edit would be
silently destroyed the next time that script runs. Everything this addon
itself owns (the Russian text actually used for dubbing, which may
deliberately diverge from the subtitle translation, voice/instruct
choices, take bookkeeping) lives in `_dub_state.json`, a sidecar this
addon owns exclusively, at the project root next to `vo_dataset.csv`.

`_dub_state.json` is also the one deliberate departure from this addon's
usual "state is a disk fact, nothing is stored" posture (see
script_library.py's module docstring) -- forced by the output filename
being fixed by an external contract, so no content hash can ride in it
the way `<position>_<hash>.wav` does for an Act script's per-line takes.
A row's hash is still recomputed and compared every time, never trusted
blindly; only the "last known-good hash" itself has nowhere else to live.
"""

import csv
import json
import os
from typing import Dict, List, Optional, Tuple

try:
    from . import _line_audio
except (ImportError, ValueError):
    import _line_audio

try:
    from server import PromptServer
    from aiohttp import web
    _HAS_SERVER = PromptServer.instance is not None
except (ImportError, AttributeError):
    _HAS_SERVER = False


DATASET_FILENAME = "vo_dataset.csv"
STATE_FILENAME = "_dub_state.json"
ROLES_FILENAME = "_dub_roles.json"
AUDIO_EN_DIRNAME = "audio_en"
AUDIO_RU_DIRNAME = "audio_ru"
# This addon's own copy of each row's take BEFORE any Effect is applied --
# an underscore-prefixed, addon-owned sidecar folder (same convention as
# _dub_state.json/_dub_roles.json), deliberately NOT inside audio_ru/
# itself: that folder is the game's own external contract (its repack
# pipeline may scan/glob it), so nothing this addon writes for its own
# bookkeeping belongs inside it. Written by audio_post_process.py on every
# VO Dub render (see its dry_output_path_override input); read back by
# this file's own /vo_dub/apply_effect route so switching an Effect can
# reprocess THIS file instead of re-running the whole TTS graph.
AUDIO_DRY_DIRNAME = "_dub_dry"

# Every channel count this addon can actually produce a take for: mono or
# plain stereo, written as one "<audio_key>.wav". 3/4-channel dialogue
# splits into >1 file per audio_key instead (.a-.d segments) -- 6 rows out
# of 2083 in the real project -- which this addon has no way to render
# correctly (a single TTS take is mono/stereo, never 3/4-channel, and
# there's nowhere here to write a second/third/fourth segment file even if
# there were). See STATUS_UNSUPPORTED below.
SUPPORTED_CHANNELS = (1, 2)

STATUS_NO_TEXT = "no_text"
STATUS_NEEDS_TRANSLATION = "needs_translation"
STATUS_NOT_STARTED = "not_started"
STATUS_STALE = "stale"
STATUS_DONE = "done"
STATUS_UNSUPPORTED = "unsupported"


def dataset_path(root: str) -> str:
    return os.path.join(root, DATASET_FILENAME)


def state_path(root: str) -> str:
    return os.path.join(root, STATE_FILENAME)


def audio_en_path(root: str, audio_key: str) -> str:
    return os.path.join(root, AUDIO_EN_DIRNAME, f"{audio_key}.wav")


def audio_ru_path(root: str, audio_key: str) -> str:
    return os.path.join(root, AUDIO_RU_DIRNAME, f"{audio_key}.wav")


def audio_dry_path(root: str, audio_key: str) -> str:
    return os.path.join(root, AUDIO_DRY_DIRNAME, f"{audio_key}.wav")


def read_dataset(root: str) -> List[dict]:
    """
    Every row of vo_dataset.csv, in file order. `utf-8-sig` transparently
    strips the leading BOM the real file (and Excel/OpenOffice CSV exports
    in general) is written with -- without it, the first column's KEY comes
    back as "\\ufeffaudio_key" instead of "audio_key", silently breaking
    every row['audio_key'] lookup below with no obvious error.

    Raises FileNotFoundError if the project root has no vo_dataset.csv --
    a real error (this isn't a VO dataset project at all), not something to
    paper over with an empty list.
    """
    path = dataset_path(root)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"no {DATASET_FILENAME} in {root} -- not a VO dub project root")
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def read_dub_state(root: str) -> dict:
    """{"rows": {}} when _dub_state.json doesn't exist yet (nothing dubbed)
    or fails to parse -- same "missing/broken state is just empty state,
    never a hard error" posture find_db_file uses for _roles.json."""
    path = state_path(root)
    if not os.path.isfile(path):
        return {"rows": {}}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict) and isinstance(data.get("rows"), dict):
            return data
    except (OSError, json.JSONDecodeError) as e:
        print(f"[FL CosyVoice3 VODubLibrary] WARNING: couldn't parse {path}: {e}")
    return {"rows": {}}


def write_dub_state(root: str, state: dict) -> None:
    """Atomic temp-file + os.replace, same as script_editor.py's generic
    write route -- used only by mark_dub_role_stale below (every OTHER
    write to this file goes through that same generic route directly from
    the frontend, per the module docstring)."""
    path = state_path(root)
    tmp_path = path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, path)


def roles_path(root: str) -> str:
    return os.path.join(root, ROLES_FILENAME)


def read_dub_roles_document(root: str) -> dict:
    """
    The FULL parsed content of _dub_roles.json, unmodified -- not just its
    "roles". `roles` here is a DICT KEYED BY ROLE CODE
    (`{"emma": {"character": "Dr. Emma Fisher", "gender": "female", ...,
    "speaker": "some_preset"}, ...}`), each entry carrying a real casting
    document (character/gender/actor/description/dub_direction/notes) plus
    computed stats (lines/audio_minutes/lines_needing_translation/...) --
    NOT the flat {code, name, description, speaker} list this addon
    originally assumed. See this project's own
    scripts/06_assign_roles.py: role identity here comes from matching
    regex RULES against audio_key, not from vo_dataset.csv's own noisy
    `speaker` column (raw tags like "Prompt"/"S"/"v" -- see this repo's
    README) -- deliberately NOT reproduced here (the user chose not to
    automate row<->role matching; a row's resolved speaker below still
    only ever comes from its own manual override or its raw csv tag).

    `{"roles": {}}` when the file doesn't exist yet or fails to parse --
    always a dict with at least a "roles" dict, so callers never have to
    branch on shape.

    IMPORTANT: this file is typically GENERATED (fully rewritten) by a
    project's own casting script the same way vo_dataset.csv is (see
    module docstring's caution about that file) -- except here, unlike
    vo_dataset.csv, the user has explicitly chosen to let this addon write
    a "speaker" field directly into it anyway (DubRolesEditorApp.vue),
    accepting that re-running that script will wipe any speaker assigned
    this way, since its own per-role dict literals don't carry that field.
    """
    path = roles_path(root)
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
        print(f"[FL CosyVoice3 VODubLibrary] WARNING: couldn't parse {path}: {e}")
    return {"roles": {}}


def read_dub_roles(root: str) -> Dict[str, dict]:
    """Just the {code: {...}} dict -- see read_dub_roles_document."""
    return read_dub_roles_document(root).get("roles", {})


def read_dub_role_map(root: str) -> Dict[str, str]:
    """{code: speaker preset} for every role that actually has one
    assigned -- most won't, until DubRolesEditorApp.vue sets one. Since
    row<->role matching isn't automated (see read_dub_roles_document),
    resolved_speaker only ever matches this against a row's RAW csv tag
    -- for a project using this project's own regex-based role codes
    (lowercase, not the raw tag), that lookup simply won't hit, and rows
    fall back to their tag/override exactly as if this file didn't exist.
    The per-row voice assignment mechanism that actually matters here is
    the line editor's own bulk "Assign voice..." (a manual per-row
    override), not this map."""
    return {
        code: entry["speaker"]
        for code, entry in read_dub_roles(root).items()
        if isinstance(entry, dict) and entry.get("speaker")
    }


def seed_dub_roles(root: str) -> Dict[str, list]:
    """
    Adds one BLANK role per distinct, non-empty `speaker` tag in
    vo_dataset.csv that _dub_roles.json doesn't already have a code for --
    DubRolesEditorApp.vue's "Seed from dataset" button. Additive only: an
    existing role (however it got there -- seeded, or written by a
    project's own casting script) is never touched, so this can't reset
    someone's real casting work. Junk tags (see this repo's README --
    "Prompt"/"S"/"v" and similar) get seeded too; deciding those aren't
    real characters is a content judgment for whoever's running the
    project, not something this function can tell from the tag alone.

    Of limited use on a project that already has a real casting document
    (see read_dub_roles_document) -- its role codes are curated identities
    ("emma", "sam", ...), not raw csv tags, so this only fills in codes
    for tags nothing there already covers.
    """
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
        path = roles_path(root)
        tmp_path = path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)
    return {"added": added}


def effective_russian(row: dict, state_entry: Optional[dict]) -> str:
    """The Russian text actually in play for this row: this addon's own
    edit if there is one, else whatever vo_dataset.csv already had (an
    already-translated line). Never the other way around -- an edit made
    here must never be shadowed by what the csv says, since the csv gets
    silently regenerated without it (see module docstring)."""
    if state_entry and state_entry.get("russian_text"):
        return state_entry["russian_text"]
    return (row.get("russian") or "").strip()


def resolved_speaker(row: dict, state_entry: Optional[dict], role_map: Optional[Dict[str, str]] = None) -> str:
    """The character tag hashed/rendered for this row: a manual per-row
    override if set, else the raw csv tag -- and EITHER of those then
    resolved through _dub_roles.json's role_map when it names a known role
    code, same as the audiobook's own `role_map.get(value, value)` pattern
    (see nodes/script_library.py). The override is a role code OR a literal
    preset (RoleDropdown is editable) -- only the former is in role_map, so
    a literal preset just passes through unchanged.

    `role_map` is deliberately OPTIONAL and left unpassed by
    mark_dub_role_stale: `role_code` there identifies a role by its TAG
    (the stable identity a recast is keyed on, same as the audiobook's own
    _line_uses_role), not by whatever preset it currently resolves to --
    resolving through role_map before that comparison would compare a tag
    against a preset name and never match anything.
    """
    value = (state_entry or {}).get("speaker_override") or (row.get("speaker") or "").strip()
    if role_map and value in role_map:
        return role_map[value]
    return value


def effect_of(state_entry: Optional[dict]) -> str:
    """This row's chosen post-render effect (a name from
    nodes/_audio_effects.py's EFFECTS registry, e.g. "radio"), "" for none."""
    return (state_entry or {}).get("effect") or ""


def uses_original_as_sample(state_entry: Optional[dict], use_original_default: bool = False) -> bool:
    """Whether this row's render should use the game's own EN reference
    take (audio_en/<audio_key>.wav) as the TTS voice-cloning sample instead
    of a preset/role voice. A per-row explicit choice wins when this row's
    own checkbox has ever been touched (True OR False, stored explicitly);
    an ABSENT key means "never touched this row specifically" -- falls back
    to the project-wide default (_dub_state.json's own top-level
    `use_original_default`), same "explicit override, else a project-wide
    default" shape as _dub_roles.json's role-level voice assignment."""
    override = (state_entry or {}).get("use_original_sample")
    return use_original_default if override is None else bool(override)


def row_hash(
    row: dict,
    state_entry: Optional[dict],
    role_map: Optional[Dict[str, str]] = None,
    use_original_default: bool = False,
) -> str:
    """This row's current content fingerprint -- empty string when there's
    no Russian text yet at all (nothing to hash, and "" can never collide
    with a real _line_audio.line_hash() output, so a state_entry recorded
    from before text existed never falsely reads as fresh)."""
    text = effective_russian(row, state_entry)
    if not text:
        return ""
    instruct = (state_entry or {}).get("instruct", "")
    effect = effect_of(state_entry)
    original_sample = uses_original_as_sample(state_entry, use_original_default)
    # Folded into the SAME instruct argument line_hash() already hashes,
    # rather than widening line_hash()'s own 3-argument signature -- that
    # function is a strict byte-for-byte contract with the audiobook's own
    # <position>_<hash>.wav filenames (nodes/_line_audio.py / src/shared/
    # line_hash.js), so changing its formula would invalidate every
    # audiobook take already on disk. VO Dub's hash never rides in a
    # filename, so it's free to fold more into the same 3 fields instead --
    # \x00 can't appear in real instruct text, so neither suffix collides
    # with real content OR with each other.
    instruct_for_hash = instruct
    if effect:
        instruct_for_hash += f"\x00effect={effect}"
    if original_sample:
        instruct_for_hash += "\x00sample=original"
    return _line_audio.line_hash(resolved_speaker(row, state_entry, role_map), instruct_for_hash, text)


def compute_row_status(
    effective_text: str, has_english: bool, audio_ru_exists: bool, hash_matches: bool,
    channels: Optional[int] = None, manually_marked_done: bool = False,
) -> str:
    """
    Pure decision table, kept separate from any disk access so it's cheap
    to test directly:; the CALLER resolves `audio_ru_exists`/`hash_matches`
    (both need a specific row + state_entry + disk check to answer).

    unsupported         -- channels isn't 1 or 2 (see SUPPORTED_CHANNELS) --
                           checked FIRST and overrides everything else: no
                           amount of text/take state changes that this
                           addon has no way to render a correct file for
                           this row at all
    no_text             -- no Russian AND no English either (needs a
                           transcription pass before it can be translated)
    needs_translation   -- no Russian yet, but English exists to translate from
    not_started         -- has Russian, but audio_ru/<key>.wav doesn't exist yet
    stale               -- audio_ru/<key>.wav exists, but for OLDER content
                           (text/voice/instruct changed since), UNLESS the
                           row's own manual "Done" checkbox is on
    done                -- audio_ru/<key>.wav exists and (matches current
                           content OR was manually marked done -- a
                           deliberate "I know it drifted, I don't care"
                           override, sticky until unchecked; it never
                           applies with no take at all, see below)
    """
    if channels is not None and channels not in SUPPORTED_CHANNELS:
        return STATUS_UNSUPPORTED
    if not effective_text:
        return STATUS_NO_TEXT if not has_english else STATUS_NEEDS_TRANSLATION
    if not audio_ru_exists:
        return STATUS_NOT_STARTED
    return STATUS_DONE if (hash_matches or manually_marked_done) else STATUS_STALE


def row_view(root: str, row: dict, state: dict, role_map: Optional[Dict[str, str]] = None) -> dict:
    """One CSV row + its sidecar state + one disk check, merged into what
    the frontend actually renders a line from -- the browser/editor never
    needs to know `_dub_state.json`'s own shape. `speaker` here is fully
    resolved (override, else DubRolesEditor's assigned voice, else the
    raw tag) -- what the render path actually sends the TTS graph;
    `speaker_tag` stays the raw csv value for display/placeholder use."""
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


def _to_float(value) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value) -> Optional[int]:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def bucket_key_for(row: dict) -> str:
    """Groups by the csv's own `episode` column ("1".."5" -> "E1".."E5");
    everything without one (AILSA/DD/SAM/Objective/... side content, per
    README) falls into one residual "Other" bucket rather than being
    split further -- there's no equivalent of Act-script's folder
    hierarchy to group by here."""
    episode = (row.get("episode") or "").strip()
    return f"E{episode}" if episode else "Other"


_STATUS_KEYS = (STATUS_NO_TEXT, STATUS_NEEDS_TRANSLATION, STATUS_NOT_STARTED, STATUS_STALE, STATUS_DONE, STATUS_UNSUPPORTED)


def build_tree(root: str) -> dict:
    """One counts-per-bucket-per-status summary for the whole project --
    backs the VO Dub browser panel's tree, the same "one fetch, everything
    grouped" shape script_library.py's own /tree route uses (there: per-act
    filename arrays; here: per-episode-bucket counts, since 2083 rows is
    too many to ship every filename up front the way a handful of scripts
    per act is)."""
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
    """Every row in one bucket (≤617 in the real project's biggest
    episode), each merged with its current sidecar state -- backs the VO
    Dub line editor opening one bucket at a time rather than all 2083 rows
    at once."""
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
    """
    Read-write fallout check for recasting a character's voice (the
    DubRolesEditor's equivalent of script_library.py's mark_role_stale) --
    every row currently RESOLVING to `role_code` (an override if it has
    one, else its raw csv speaker tag) has its recorded hash dropped, so
    the next status check finds it `stale` instead of `done` without
    needing to touch the actual take file (only a genuine re-render
    replaces that).

    Unlike the Act-script version, this can't derive "which rows use this
    role" by re-parsing script text on the fly -- there's no script text,
    only the row + its sidecar entry -- so it walks _dub_state.json's own
    rows directly. A row with no sidecar entry at all was never rendered,
    so it has nothing to go stale.
    """
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


if _HAS_SERVER:
    routes = PromptServer.instance.routes

    @routes.get("/fl_cosyvoice3/vo_dub/tree")
    async def fl_cosyvoice3_vo_dub_tree(request):
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
        """
        Stamps a freshly rendered take's hash/duration straight into
        _dub_state.json -- called by the line editor right after a render
        completes, with the hash it ALREADY computed to drive that render
        (never re-derived here), same "the caller knows, stamp it, don't
        make the next read guess" posture script_pending_lines' docstring
        describes for the audiobook path's own per-line re-voice.
        """
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
        """
        Re-applies a chosen Effect to this row's own DRY (pre-effect) take
        -- see AUDIO_DRY_DIRNAME's own comment -- WITHOUT touching the TTS
        graph at all, so switching or removing an effect on an already-
        rendered row takes a fraction of a second instead of a full
        re-synthesis. `torch`/soundfile/_audio_utils/_audio_effects are
        imported HERE, not at module level -- this file otherwise never
        needs torch (see its own module docstring / test file), and this
        is the one route that genuinely does.

        Requires a dry take to already exist: a row that's never been
        rendered (or was rendered before this addon started writing dry
        copies) has nothing to reprocess yet -- the caller falls back to a
        normal full render in that case.
        """
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
            import soundfile as sf
            try:
                from ._audio_utils import save_wav
                from ._audio_effects import apply_named_effect
            except (ImportError, ValueError):
                from _audio_utils import save_wav
                from _audio_effects import apply_named_effect
        except ImportError as e:
            return web.json_response({"error": f"couldn't load the audio engine: {e}"})

        try:
            data_np, sample_rate = sf.read(dry_path, dtype="float32", always_2d=True)
        except Exception as e:
            return web.json_response({"error": f"couldn't read dry take: {e}"})
        # sf.read gives (frames, channels); save_wav's own convention (see
        # _audio_utils.py) is (channels, frames) -- .T.copy() rather than a
        # bare .T so the result is contiguous, not a transposed view.
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


class FL_CosyVoice3_VODubLibrary:
    """
    Browses a VO dub project (a folder holding vo_dataset.csv, audio_en/,
    audio_ru/ -- see module docstring) and, when `line_override` is set
    (the VO Dub Editor's per-row "🔁 Render" button, mirroring Script
    Library's own line_override for a single-line re-voice), outputs just
    that one row's resolved text as a script line so it can feed straight
    into FL CosyVoice3 Speaker Instruct2 Dialog like any other script
    content -- 3 fields ("speaker | instruct | text") normally, or 4 when
    the row's "use original as sample" is on ("speaker | instruct | text |
    audio_en\\<key>.wav", see VoDubLineEditor.vue's own resolvedUseOriginal)
    -- that 4th field is FL CosyVoice3 Speaker Instruct2 Dialog's own
    live-reference-audio escape hatch (see its module docstring), this
    node has no opinion about it at all -- it's just part of the SAME
    string, unlike a plain 3-field line.
    """

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("script",)
    FUNCTION = "browse"
    CATEGORY = "🔊FL CosyVoice3/Synthesis"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "project_root": ("STRING", {
                    "default": "",
                    "description": "Path to the VO dub project ROOT -- the folder holding "
                                   "vo_dataset.csv, audio_en/, audio_ru/. Click the browse button "
                                   "below to pick it, or type the path directly."
                }),
            },
            "optional": {
                "line_override": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "description": "Service field for the VO Dub Editor's \"🔁 Render\" button: "
                                   "when non-empty, used as the ENTIRE output instead of anything "
                                   "else -- a single 'speaker | instruct | text' line (or 4-field "
                                   "'speaker | instruct | text | reference_wav' when the row's \"use "
                                   "original as sample\" is on) for one audio_key. Leave empty for "
                                   "normal use."
                }),
            },
        }

    @classmethod
    def IS_CHANGED(cls, project_root: str, line_override: str = ""):
        return float("nan")

    def browse(self, project_root: str, line_override: str = "") -> Tuple[str]:
        root = project_root.strip()
        if not root:
            raise ValueError(
                "[FL CosyVoice3 VODubLibrary] project_root is not set -- point it at your "
                "VO dub project's root folder (or click the browse button) before running."
            )
        if not os.path.isdir(root):
            raise ValueError(f"[FL CosyVoice3 VODubLibrary] project_root is not a folder: {root}")
        if line_override.strip():
            return (line_override,)
        # No override set: nothing sensible to synthesize from 2083 rows at
        # once (there's no per-project "script" the way an Act has one) --
        # this node exists to drive the editor's per-row override, not a
        # bulk render, so an empty line is the correct idle output.
        return ("",)
