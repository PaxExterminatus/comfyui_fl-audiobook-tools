"""
Plain-Python tests for the optional 4th script field -- a per-line pause
(nodes/script_library.py's parse_pause_field / split_script_line /
effective_pauses / script_line_pauses, and what scripts_ready now compares
against the timing manifest).

A pause is silence stitch_lines inserts BETWEEN takes, not audio the TTS
renders, so it deliberately isn't part of a line's content hash. Everything
here is about the two consequences of that: changing a pause must never
invalidate an existing take, and it must still invalidate the FINAL
stitched track -- which is the only thing that would otherwise keep a ✅ on
a file that no longer matches its script.

stitch_lines itself (the one place the silence is actually written into
audio) isn't exercised here: it needs real soundfile/numpy, which only
exist inside an actual ComfyUI env. Same stubbing as
test_script_library_pending.py. Runnable directly (`python
test_line_pauses.py`) or via pytest.
"""
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

import script_library as sl  # noqa: E402
import _line_audio as la  # noqa: E402

SUFFIX = "_speakers.txt"


def _make_project():
    root = tempfile.mkdtemp()
    act_folder = os.path.join(root, "Act01")
    os.makedirs(act_folder)
    with open(os.path.join(root, "_roles.json"), "w", encoding="utf-8") as f:
        json.dump({"roles": [{"code": "narrator", "speaker": "narrator_v1.pt"}]}, f)
    return root, act_folder


def _write_script(act_folder, lines):
    with open(os.path.join(act_folder, "Scene" + SUFFIX), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def _write_done(act_folder, manifest_lines):
    """The two files "✅ Done" writes together: the final track and its
    timing manifest (see stitch_lines)."""
    audio_dir = os.path.join(act_folder, "_audio")
    timing_dir = os.path.join(audio_dir, "timing")
    os.makedirs(timing_dir, exist_ok=True)
    open(os.path.join(audio_dir, "Scene.wav"), "w").close()
    with open(os.path.join(timing_dir, "Scene.json"), "w", encoding="utf-8") as f:
        json.dump({"lines": manifest_lines}, f)


def _ready(act_folder):
    return sl.scripts_ready(act_folder, ["Scene" + SUFFIX], SUFFIX)


def test_parse_pause_field_reads_seconds_and_rejects_the_rest():
    assert sl.parse_pause_field("1.5") == 1.5
    # A Russian keyboard types the decimal comma, and this field is written
    # by hand straight into the script file.
    assert sl.parse_pause_field("1,5") == 1.5
    assert sl.parse_pause_field(" 0 ") == 0.0
    # Unreadable/out-of-range reads as None ("use the default"), never as an
    # error: one line's typo'd pause must not make that line unrenderable.
    assert sl.parse_pause_field("") is None
    assert sl.parse_pause_field("soon") is None
    assert sl.parse_pause_field("-1") is None
    assert sl.parse_pause_field("99") is None


def test_split_script_line_takes_three_or_four_fields():
    assert sl.split_script_line("narrator | calm | Hello.") == ("narrator", "calm", "Hello.", None)
    assert sl.split_script_line("narrator | calm | Hello. | 1.5") == ("narrator", "calm", "Hello.", 1.5)
    # An unreadable 4th field still leaves a valid LINE -- it just has no
    # pause of its own.
    assert sl.split_script_line("narrator | calm | Hello. | soon") == ("narrator", "calm", "Hello.", None)
    assert sl.split_script_line("just some prose") is None
    assert sl.split_script_line("a | b | c | d | e") is None


def test_pause_is_not_part_of_a_lines_hash():
    with_pause = sl._parse_script_line("narrator | calm | Hello. | 2")
    without = sl._parse_script_line("narrator | calm | Hello.")
    assert with_pause == without == ("narrator", "calm", "Hello.")
    assert la.line_hash(*with_pause) == la.line_hash(*without)


def test_effective_pauses_defaults_between_lines_but_not_after_the_last():
    gap = sl.DEFAULT_LINE_GAP_S
    # Nothing specified -> exactly the fixed gap stitch always used, with no
    # trailing silence invented after the final line.
    assert sl.effective_pauses(None, 3) == [gap, gap, 0.0]
    # An explicit 0 is a real value (the next line cuts in), not "unset".
    assert sl.effective_pauses([0.0, 1.5, 2.0], 3) == [0.0, 1.5, 2.0]
    assert sl.effective_pauses([None, 1.5, None], 3) == [gap, 1.5, 0.0]


def test_resolve_roles_drops_the_pause_field_before_the_dialog_node_sees_it():
    """FL-CosyVoice3's Dialog node splits on '|' and requires exactly 3
    fields -- a 4-field line would reach it as malformed and be skipped,
    i.e. silently not voiced at all."""
    out = sl.resolve_roles(
        "narrator | calm | Hello. | 1.5\nother | calm | Hi. | 2\njust prose\n",
        {"narrator": "narrator_v1.pt"},
    ).split("\n")
    assert out[0] == "narrator_v1.pt | calm | Hello."
    # Also stripped when the speaker ISN'T a known role code -- the "nothing
    # to change, pass the line through untouched" shortcut would leak it.
    assert out[1] == "other | calm | Hi."
    assert out[2] == "just prose"
    # ... and with no roles at all to resolve, which used to return early.
    assert sl.resolve_roles("other | calm | Hi. | 2", {}) == "other | calm | Hi."


def test_script_line_pauses_reads_each_position_off_disk():
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, [
            "narrator | calm | One.",
            "not a script line",
            "narrator | calm | Two. | 1.5",
            "narrator | calm | Three. | 0",
        ])
        # Malformed lines take no position, same as everywhere else.
        assert sl.script_line_pauses(act_folder, "Scene" + SUFFIX, SUFFIX) == [None, 1.5, 0.0]
    finally:
        shutil.rmtree(root)


def test_editing_a_pause_unreadies_a_done_script():
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, ["narrator | calm | One.", "narrator | calm | Two."])
        _write_done(act_folder, [
            {"index": 0, "pause_after": 0.3},
            {"index": 1, "pause_after": 0.0},
        ])
        assert _ready(act_folder) == ["Scene" + SUFFIX]

        # Every take file is untouched by this edit -- only the silence
        # between them changed, so the per-line pending check (the only
        # staleness signal there used to be) finds nothing at all.
        _write_script(act_folder, ["narrator | calm | One. | 2", "narrator | calm | Two."])
        assert _ready(act_folder) == []
    finally:
        shutil.rmtree(root)


def test_writing_a_pause_out_explicitly_at_its_default_is_not_a_change():
    """0.3 typed by hand and 0.3 by default are two spellings of the same
    track -- comparing RESOLVED plans, not raw fields, is what keeps that
    from reading as an edit."""
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, ["narrator | calm | One. | 0.3", "narrator | calm | Two. | 0"])
        _write_done(act_folder, [
            {"index": 0, "pause_after": 0.3},
            {"index": 1, "pause_after": 0.0},
        ])
        assert _ready(act_folder) == ["Scene" + SUFFIX]
    finally:
        shutil.rmtree(root)


def test_a_manifest_from_before_this_field_keeps_its_done_mark():
    """Every already-stitched track in a real project predates
    "pause_after" -- reading those as the fixed 0.3s-between-lines plan
    stitch used back then is what stops an upgrade from un-readying all of
    them at once."""
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, ["narrator | calm | One.", "narrator | calm | Two."])
        _write_done(act_folder, [
            {"index": 0, "start": 0.0, "end": 1.0},
            {"index": 1, "start": 1.3, "end": 2.0},
        ])
        assert _ready(act_folder) == ["Scene" + SUFFIX]

        # A pause added since then still un-readies it.
        _write_script(act_folder, ["narrator | calm | One. | 1.5", "narrator | calm | Two."])
        assert _ready(act_folder) == []
    finally:
        shutil.rmtree(root)


def test_deleting_a_line_from_a_done_script_unreadies_it_too():
    """The same comparison closes an older hole of its own: reorganize_lines
    shifts every remaining take's file down a position, so all of them stay
    valid and nothing flags the final track that still has the deleted line
    in it."""
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, ["narrator | calm | One.", "narrator | calm | Two."])
        _write_done(act_folder, [
            {"index": 0, "pause_after": 0.3},
            {"index": 1, "pause_after": 0.0},
        ])
        assert _ready(act_folder) == ["Scene" + SUFFIX]

        _write_script(act_folder, ["narrator | calm | One."])
        assert _ready(act_folder) == []
    finally:
        shutil.rmtree(root)


TESTS = [v for k, v in sorted(globals().items()) if k.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"OK: {t.__name__}")
    print(f"\n{len(TESTS)} passed")
