"""
Plain-Python tests for nodes/vo_dub_library.py. vo_dub_library.py itself
never touches audio (only paths/hashes/CSV), but it imports
role_map_from_entries from script_library.py, which DOES import soundfile/
numpy/folder_paths at module level -- stubbed the same way
test_script_library_pending.py does, since none of that is exercised here
either. Runnable directly (`python test_vo_dub_library.py`) or via pytest.

Builds a small fixture project each test (a handful of rows, not the real
2083-row Observation dataset) matching vo_dataset.csv's real column names
and BOM, so a change to the real file's header wouldn't silently go
unnoticed here.
"""
import csv
import json
import os
import shutil
import sys
import tempfile
import types

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

for name in ("soundfile", "numpy", "folder_paths"):
    if name not in sys.modules:
        sys.modules[name] = types.ModuleType(name)

import vo_dub_library as vdl  # noqa: E402
import _line_audio as la  # noqa: E402

FIELDS = ["audio_key", "episode", "speaker", "in_loc_table", "loc_sheet",
          "english", "russian", "needs_translation", "duration_s", "channels"]


def _make_project(rows):
    root = tempfile.mkdtemp()
    with open(os.path.join(root, "vo_dataset.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for r in rows:
            full = {k: "" for k in FIELDS}
            full.update(r)
            w.writerow(full)
    os.makedirs(os.path.join(root, "audio_en"))
    os.makedirs(os.path.join(root, "audio_ru"))
    return root


def _touch_ru(root, audio_key):
    open(vdl.audio_ru_path(root, audio_key), "wb").close()


def _write_state(root, rows_dict):
    with open(vdl.state_path(root), "w", encoding="utf-8") as f:
        json.dump({"rows": rows_dict}, f)


def test_read_dataset_strips_the_real_files_bom():
    root = _make_project([{"audio_key": "Loc_A", "english": "Hi.", "russian": "Привет."}])
    try:
        rows = vdl.read_dataset(root)
        assert len(rows) == 1
        # The exact failure mode a missing utf-8-sig would produce: the
        # first column's KEY comes back as "﻿audio_key" instead of
        # "audio_key", and this lookup would raise KeyError.
        assert rows[0]["audio_key"] == "Loc_A"
    finally:
        shutil.rmtree(root)


def test_read_dataset_raises_when_theres_no_dataset_at_all():
    root = tempfile.mkdtemp()
    try:
        try:
            vdl.read_dataset(root)
            assert False, "expected FileNotFoundError"
        except FileNotFoundError:
            pass
    finally:
        shutil.rmtree(root)


def test_read_dub_state_defaults_to_empty_when_missing_or_broken():
    root = tempfile.mkdtemp()
    try:
        assert vdl.read_dub_state(root) == {"rows": {}}
        with open(vdl.state_path(root), "w", encoding="utf-8") as f:
            f.write("{not json")
        assert vdl.read_dub_state(root) == {"rows": {}}
    finally:
        shutil.rmtree(root)


def test_effective_russian_prefers_this_addons_own_edit_over_the_csv():
    """The csv gets silently regenerated without this addon's edits (see
    module docstring) -- an edit made here must never be shadowed by
    whatever the csv currently says."""
    row = {"russian": "из csv"}
    assert vdl.effective_russian(row, None) == "из csv"
    assert vdl.effective_russian(row, {"russian_text": "правка тут"}) == "правка тут"
    assert vdl.effective_russian(row, {"russian_text": ""}) == "из csv"


def test_row_hash_is_empty_until_there_is_text_and_ignores_position():
    row = {"speaker": "Ellie", "russian": ""}
    assert vdl.row_hash(row, None) == ""
    row["russian"] = "Привет."
    h = vdl.row_hash(row, None)
    assert h and h == la.line_hash("Ellie", "", "Привет.")


def test_row_hash_changes_when_the_effect_changes_so_a_re_rendered_row_reads_stale():
    row = {"speaker": "Ellie", "russian": "Привет."}
    no_effect = vdl.row_hash(row, {"instruct": ""})
    radio_effect = vdl.row_hash(row, {"instruct": "", "effect": "radio"})
    assert no_effect != radio_effect
    # Deterministic and independent of line_hash()'s own 3-arg formula --
    # doesn't just happen to differ, it's actually the instruct field with
    # the effect folded in.
    assert radio_effect == la.line_hash("Ellie", "\x00effect=radio", "Привет.")
    # No effect key at all behaves exactly like effect="" -- an old
    # _dub_state.json row from before this field existed isn't spuriously
    # marked stale.
    assert vdl.row_hash(row, {"instruct": ""}) == vdl.row_hash(row, {"instruct": "", "effect": ""})


def test_uses_original_as_sample_falls_back_to_the_project_default_only_when_never_touched():
    # Never touched this row -- follows whatever the project-wide default is.
    assert vdl.uses_original_as_sample(None) is False
    assert vdl.uses_original_as_sample({"instruct": ""}) is False
    assert vdl.uses_original_as_sample({"instruct": ""}, use_original_default=True) is True
    # Explicitly touched -- wins over the project default either way.
    assert vdl.uses_original_as_sample({"use_original_sample": False}, use_original_default=True) is False
    assert vdl.uses_original_as_sample({"use_original_sample": True}, use_original_default=False) is True


def test_row_hash_changes_with_use_original_as_sample_and_composes_with_effect():
    row = {"speaker": "Ellie", "russian": "Привет."}
    plain = vdl.row_hash(row, {"instruct": ""})
    original_via_default = vdl.row_hash(row, {"instruct": ""}, use_original_default=True)
    original_via_override = vdl.row_hash(row, {"instruct": "", "use_original_sample": True})
    assert plain != original_via_default
    # A per-row explicit True and an inherited project default of True hash
    # identically -- the RESOLVED choice is what matters, not how it got there.
    assert original_via_default == original_via_override
    assert original_via_default == la.line_hash("Ellie", "\x00sample=original", "Привет.")
    # An explicit False overrides an on project default -- back to plain.
    assert vdl.row_hash(row, {"instruct": "", "use_original_sample": False}, use_original_default=True) == plain
    # Composes with effect (both suffixes present, not one clobbering the other).
    both = vdl.row_hash(row, {"instruct": "", "effect": "radio", "use_original_sample": True})
    assert both == la.line_hash("Ellie", "\x00effect=radio\x00sample=original", "Привет.")


def test_compute_row_status_decision_table():
    assert vdl.compute_row_status("", False, False, False) == vdl.STATUS_NO_TEXT
    assert vdl.compute_row_status("", True, False, False) == vdl.STATUS_NEEDS_TRANSLATION
    assert vdl.compute_row_status("текст", False, False, False) == vdl.STATUS_NOT_STARTED
    assert vdl.compute_row_status("текст", False, True, False) == vdl.STATUS_STALE
    assert vdl.compute_row_status("текст", False, True, True) == vdl.STATUS_DONE


def test_compute_row_status_manual_done_overrides_stale_but_never_a_missing_take():
    # A drifted hash reads DONE once manually marked -- a deliberate
    # "I know it changed, I don't care" override.
    assert vdl.compute_row_status("текст", False, True, False, manually_marked_done=True) == vdl.STATUS_DONE
    # No take at all: manually_done can't paper over a file that doesn't exist.
    assert vdl.compute_row_status("текст", False, False, False, manually_marked_done=True) == vdl.STATUS_NOT_STARTED


def test_row_view_done_exactly_when_take_exists_and_hash_matches():
    root = _make_project([{"audio_key": "Loc_A", "speaker": "Ellie", "english": "Hi.", "russian": "Привет."}])
    try:
        row = vdl.read_dataset(root)[0]

        # Text exists, nothing rendered yet.
        assert vdl.row_view(root, row, {"rows": {}})["status"] == vdl.STATUS_NOT_STARTED

        # Take file exists but no state entry at all -- can't be "done"
        # without a recorded hash to compare against.
        _touch_ru(root, "Loc_A")
        assert vdl.row_view(root, row, {"rows": {}})["status"] == vdl.STATUS_STALE

        # Recorded hash matches current content -> done.
        current = vdl.row_hash(row, None)
        state = {"rows": {"Loc_A": {"hash": current}}}
        assert vdl.row_view(root, row, state)["status"] == vdl.STATUS_DONE

        # Editing the text after that (without re-rendering) goes stale,
        # even though the take file is untouched.
        state["rows"]["Loc_A"]["russian_text"] = "Другой текст."
        assert vdl.row_view(root, row, state)["status"] == vdl.STATUS_STALE

        # Manually marking it done (the row's own "Done" checkbox) reads
        # DONE again despite the still-drifted hash.
        state["rows"]["Loc_A"]["manually_done"] = True
        assert vdl.row_view(root, row, state)["status"] == vdl.STATUS_DONE
    finally:
        shutil.rmtree(root)


def test_bucket_key_groups_by_episode_column_else_other():
    assert vdl.bucket_key_for({"episode": "1"}) == "E1"
    assert vdl.bucket_key_for({"episode": "5"}) == "E5"
    assert vdl.bucket_key_for({"episode": ""}) == "Other"
    assert vdl.bucket_key_for({}) == "Other"


def test_build_tree_counts_every_row_exactly_once_across_buckets():
    root = _make_project([
        {"audio_key": "Loc_E1_S1_A", "episode": "1", "english": "Hi.", "russian": "Привет."},
        {"audio_key": "Loc_E1_S1_B", "episode": "1", "english": "Hi."},  # needs_translation
        {"audio_key": "Loc_AILSA_01", "english": ""},  # no_text
    ])
    try:
        tree = vdl.build_tree(root)
        buckets = {b["bucket"]: b for b in tree["buckets"]}
        assert buckets["E1"]["count"] == 2
        assert buckets["E1"][vdl.STATUS_NOT_STARTED] == 1
        assert buckets["E1"][vdl.STATUS_NEEDS_TRANSLATION] == 1
        assert buckets["Other"]["count"] == 1
        assert buckets["Other"][vdl.STATUS_NO_TEXT] == 1
        assert sum(b["count"] for b in tree["buckets"]) == 3
    finally:
        shutil.rmtree(root)


def test_bucket_rows_filters_by_bucket_and_optional_status():
    root = _make_project([
        {"audio_key": "Loc_E1_S1_A", "episode": "1", "english": "Hi.", "russian": "Привет."},
        {"audio_key": "Loc_E1_S1_B", "episode": "1", "english": "Hi."},
        {"audio_key": "Loc_E2_S1_A", "episode": "2", "english": "Hi.", "russian": "Здесь."},
    ])
    try:
        e1 = vdl.bucket_rows(root, "E1")
        assert {r["audio_key"] for r in e1} == {"Loc_E1_S1_A", "Loc_E1_S1_B"}

        e1_ready = vdl.bucket_rows(root, "E1", status_filter=vdl.STATUS_NOT_STARTED)
        assert [r["audio_key"] for r in e1_ready] == ["Loc_E1_S1_A"]
    finally:
        shutil.rmtree(root)


def test_mark_dub_role_stale_drops_hash_only_for_rows_resolving_to_that_role():
    root = _make_project([
        {"audio_key": "Loc_A", "speaker": "Ellie", "english": "Hi.", "russian": "Привет."},
        {"audio_key": "Loc_B", "speaker": "Sam", "english": "Hi.", "russian": "Здесь."},
    ])
    try:
        _write_state(root, {
            "Loc_A": {"hash": "deadbeef"},
            "Loc_B": {"hash": "cafebabe"},
        })
        result = vdl.mark_dub_role_stale(root, "Ellie")
        assert result["changed"] == ["Loc_A"]

        state = vdl.read_dub_state(root)
        assert "hash" not in state["rows"]["Loc_A"]
        assert state["rows"]["Loc_B"]["hash"] == "cafebabe"
    finally:
        shutil.rmtree(root)


def test_mark_dub_role_stale_respects_a_manual_speaker_override():
    root = _make_project([
        {"audio_key": "Loc_A", "speaker": "S", "english": "Hi.", "russian": "Привет."},
    ])
    try:
        _write_state(root, {"Loc_A": {"hash": "deadbeef", "speaker_override": "Ellie"}})
        # The raw csv tag "S" is junk (see README) -- the override is what
        # actually resolves, so recasting "S" itself must NOT touch this row.
        assert vdl.mark_dub_role_stale(root, "S")["changed"] == []
        assert vdl.mark_dub_role_stale(root, "Ellie")["changed"] == ["Loc_A"]
    finally:
        shutil.rmtree(root)


def _write_roles(root, roles):
    with open(vdl.roles_path(root), "w", encoding="utf-8") as f:
        json.dump({"roles": roles}, f)


# ── _dub_roles.json: project-wide voice assignment ──────────────────────
# Real shape (see nodes/vo_dub_library.py's read_dub_roles_document and
# this project's own scripts/06_assign_roles.py): "roles" is a DICT keyed
# by role CODE, each a full casting document (character/gender/actor/
# description/dub_direction/notes/stats) that this addon didn't generate
# and must round-trip untouched -- "speaker" is the one field this addon
# itself ever adds or edits.

def test_read_dub_roles_document_defaults_to_an_empty_roles_dict_when_missing_or_broken():
    root = tempfile.mkdtemp()
    try:
        assert vdl.read_dub_roles_document(root) == {"roles": {}}
        with open(vdl.roles_path(root), "w", encoding="utf-8") as f:
            f.write("{not json")
        assert vdl.read_dub_roles_document(root) == {"roles": {}}
    finally:
        shutil.rmtree(root)


def test_read_dub_roles_document_preserves_every_field_a_real_casting_script_writes():
    """A real _dub_roles.json carries project-level metadata alongside
    "roles", and each role carries far more than code/speaker -- none of
    it is this addon's to invent or drop."""
    root = tempfile.mkdtemp()
    try:
        doc = {
            "project": "Observation - Russian AI dub",
            "generated_by": "scripts/06_assign_roles.py",
            "totals": {"voiced_lines": 2083},
            "roles": {
                "emma": {
                    "character": "Dr. Emma Fisher", "gender": "female", "actor": "Kezia Burrows",
                    "description": "The station's medical officer...", "dub_direction": "Cast the strongest actress here...",
                    "notes": ["'Ellie' in key names is the development codename for this character."],
                    "lines": 1230, "audio_minutes": 74.4,
                },
            },
            "unmatched_keys": [],
        }
        # _write_roles only ever writes {"roles": ...} -- this test needs
        # project-level fields alongside it, so write the full doc directly.
        with open(vdl.roles_path(root), "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False)

        loaded = vdl.read_dub_roles_document(root)
        assert loaded["project"] == "Observation - Russian AI dub"
        assert loaded["roles"]["emma"]["character"] == "Dr. Emma Fisher"
        assert loaded["roles"]["emma"]["notes"] == ["'Ellie' in key names is the development codename for this character."]
    finally:
        shutil.rmtree(root)


def test_read_dub_role_map_skips_roles_with_no_voice_assigned_yet():
    root = tempfile.mkdtemp()
    try:
        _write_roles(root, {
            "emma": {"character": "Dr. Emma Fisher", "speaker": "some_preset"},
            "sam": {"character": "S.A.M.", "speaker": ""},  # not assigned yet
        })
        assert vdl.read_dub_role_map(root) == {"emma": "some_preset"}
    finally:
        shutil.rmtree(root)


def test_resolved_speaker_prefers_override_then_role_map_then_raw_tag():
    role_map = {"Ellie": "some_preset"}
    row = {"speaker": "Ellie"}
    assert vdl.resolved_speaker(row, None, role_map) == "some_preset"
    assert vdl.resolved_speaker(row, {"speaker_override": "manual_pick"}, role_map) == "manual_pick"
    # No role_map entry for this tag yet -- falls back to the raw tag,
    # same as before _dub_roles.json existed.
    assert vdl.resolved_speaker({"speaker": "Unmapped"}, None, role_map) == "Unmapped"


def test_resolved_speaker_routes_override_through_role_map_too():
    # RoleDropdown lets a per-row override be a ROLE CODE, not just a
    # literal preset -- so the override itself must also resolve through
    # role_map, same as the raw tag does.
    role_map = {"emma": "real_preset"}
    row = {"speaker": "Ellie"}
    assert vdl.resolved_speaker(row, {"speaker_override": "emma"}, role_map) == "real_preset"
    # An override that ISN'T a known role code still passes through as a
    # literal preset, unchanged.
    assert vdl.resolved_speaker(row, {"speaker_override": "some_literal_preset"}, role_map) == "some_literal_preset"


def test_row_view_speaker_is_the_role_mapped_preset_once_one_is_assigned():
    root = _make_project([{"audio_key": "Loc_A", "speaker": "Ellie", "english": "Hi.", "russian": "Привет."}])
    try:
        _write_roles(root, {"Ellie": {"character": "", "speaker": "some_preset"}})
        row = vdl.read_dataset(root)[0]
        role_map = vdl.read_dub_role_map(root)
        view = vdl.row_view(root, row, {"rows": {}}, role_map)
        assert view["speaker"] == "some_preset"
        assert view["speaker_tag"] == "Ellie"  # raw tag still surfaced separately
    finally:
        shutil.rmtree(root)


def test_mark_dub_role_stale_keys_on_the_tag_not_the_role_mapped_preset():
    """role_code identifies a role by its TAG (the audiobook's own
    _line_uses_role does the same, by design) -- mark_dub_role_stale must
    never resolve through role_map before that comparison, or recasting
    "Ellie" to a new preset would need role_code to BE that preset string
    to match anything."""
    root = _make_project([{"audio_key": "Loc_A", "speaker": "Ellie", "english": "Hi.", "russian": "Привет."}])
    try:
        _write_roles(root, {"Ellie": {"character": "", "speaker": "some_preset"}})
        _write_state(root, {"Loc_A": {"hash": "deadbeef"}})
        assert vdl.mark_dub_role_stale(root, "Ellie")["changed"] == ["Loc_A"]
        # And recasting by the RESOLVED preset name (not a real role
        # identity) must NOT match -- that's the exact confusion the
        # role_map-less comparison exists to avoid.
        _write_state(root, {"Loc_A": {"hash": "deadbeef"}})
        assert vdl.mark_dub_role_stale(root, "some_preset")["changed"] == []
    finally:
        shutil.rmtree(root)


# ── seeding _dub_roles.json from the dataset's own speaker tags ─────────

def test_seed_dub_roles_adds_one_role_per_distinct_tag():
    root = _make_project([
        {"audio_key": "Loc_A", "speaker": "Ellie"},
        {"audio_key": "Loc_B", "speaker": "Ellie"},
        {"audio_key": "Loc_C", "speaker": "Sam"},
        {"audio_key": "Loc_D", "speaker": ""},  # no tag -- nothing to seed
    ])
    try:
        result = vdl.seed_dub_roles(root)
        assert result["added"] == ["Ellie", "Sam"]
        roles = vdl.read_dub_roles(root)
        assert set(roles.keys()) == {"Ellie", "Sam"}
        assert all(entry["speaker"] == "" for entry in roles.values())
    finally:
        shutil.rmtree(root)


def test_seed_dub_roles_is_additive_and_preserves_an_existing_roles_own_rich_fields():
    root = _make_project([
        {"audio_key": "Loc_A", "speaker": "Ellie"},
        {"audio_key": "Loc_B", "speaker": "Sam"},
    ])
    try:
        _write_roles(root, {
            "emma": {"character": "Dr. Emma Fisher", "dub_direction": "Cast the strongest actress here.", "speaker": "already_assigned"},
        })
        result = vdl.seed_dub_roles(root)
        # "Ellie"/"Sam" (raw csv tags) are genuinely new codes here -- "emma"
        # (the curated role code) shares no name with either, so nothing
        # about seeding touches it.
        assert result["added"] == ["Ellie", "Sam"]

        roles = vdl.read_dub_roles(root)
        assert roles["emma"] == {"character": "Dr. Emma Fisher", "dub_direction": "Cast the strongest actress here.", "speaker": "already_assigned"}
        assert roles["Ellie"]["speaker"] == ""
        assert roles["Sam"]["speaker"] == ""

        # Running it again with nothing new in the dataset adds nothing.
        assert vdl.seed_dub_roles(root)["added"] == []
    finally:
        shutil.rmtree(root)


# ── multi-channel rows this addon can't render (3/4-channel .a-.d splits) ─

def test_compute_row_status_unsupported_channels_overrides_everything_else():
    # Real example from the project: Loc_DD_ALOG_01 -- 4 channels, no text
    # anywhere, nothing rendered. Would otherwise read as "no_text".
    assert vdl.compute_row_status("", False, False, False, channels=4) == vdl.STATUS_UNSUPPORTED
    # A 3-channel row WITH text and even an existing take must still read
    # unsupported -- text/take state can never make an unrenderable row
    # renderable.
    assert vdl.compute_row_status("текст", True, True, True, channels=3) == vdl.STATUS_UNSUPPORTED
    # channels=None (unknown/missing) doesn't trigger it -- only an
    # explicit, actually-unsupported count does.
    assert vdl.compute_row_status("", False, False, False, channels=None) == vdl.STATUS_NO_TEXT
    assert vdl.compute_row_status("текст", False, False, False, channels=1) == vdl.STATUS_NOT_STARTED
    assert vdl.compute_row_status("текст", False, False, False, channels=2) == vdl.STATUS_NOT_STARTED


def test_row_view_flags_real_projects_multichannel_row_as_unsupported():
    root = _make_project([
        {"audio_key": "Loc_DD_ALOG_01", "channels": "4", "english": "", "russian": ""},
        {"audio_key": "Loc_E5_S7_Ellie7", "channels": "3", "english": "Hi.", "russian": "Привет."},
    ])
    try:
        rows = vdl.read_dataset(root)
        views = [vdl.row_view(root, r, {"rows": {}}) for r in rows]
        assert all(v["status"] == vdl.STATUS_UNSUPPORTED for v in views)
    finally:
        shutil.rmtree(root)


def test_build_tree_counts_unsupported_rows_separately():
    root = _make_project([
        {"audio_key": "Loc_A", "channels": "1", "english": "Hi.", "russian": "Привет."},
        {"audio_key": "Loc_DD_ALOG_01", "channels": "4", "english": "", "russian": ""},
    ])
    try:
        tree = vdl.build_tree(root)
        bucket = next(b for b in tree["buckets"] if b["bucket"] == "Other")
        assert bucket[vdl.STATUS_UNSUPPORTED] == 1
        assert bucket[vdl.STATUS_NOT_STARTED] == 1
        assert bucket["count"] == 2
    finally:
        shutil.rmtree(root)


TESTS = [v for k, v in sorted(globals().items()) if k.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"OK: {t.__name__}")
    print(f"\n{len(TESTS)} passed")
