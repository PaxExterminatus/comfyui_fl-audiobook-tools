"""
Plain-Python tests for the read-only hash-based pending/role-recast logic
in nodes/script_library.py (script_pending_lines, mark_role_stale,
find_pending_revoice, scripts_pending_revoice) -- the replacement for
_state.json's per-line status.

Stubs `soundfile`/`numpy` in sys.modules before importing script_library:
this environment has neither installed (they're this addon's real runtime
dependencies, only present inside an actual ComfyUI env), but nothing
tested here calls into them -- only stitch_lines does, and that's not
exercised by this file. Runnable directly (`python
test_script_library_pending.py`) or via pytest.
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


def _make_project():
    root = tempfile.mkdtemp()
    act_folder = os.path.join(root, "Act01")
    os.makedirs(act_folder)
    with open(os.path.join(root, "_roles.json"), "w", encoding="utf-8") as f:
        json.dump({"roles": [{"code": "narrator", "speaker": "narrator_v1.pt"}]}, f)
    return root, act_folder


def _write_script(act_folder, filename, lines):
    with open(os.path.join(act_folder, filename), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def test_script_pending_lines_reports_missing_audio():
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, "Scene_speakers.txt", ["narrator | calm | Hello."])
        role_map = sl.root_role_map(root)
        base_name, pending = sl.script_pending_lines(act_folder, "Scene_speakers.txt", "_speakers.txt", role_map)
        assert base_name == "Scene"
        # "hash" lets a caller (web/script_library.js's queueLineRevoice)
        # stamp the correct expected hash onto Post-Process directly for a
        # re-voice, without depending on the Script Library -> Post-Process
        # line_hashes_json graph wire being present.
        expected_hash = la.line_hash("narrator_v1.pt", "calm", "Hello.")
        assert pending == [{"position": 0, "speaker": "narrator_v1.pt", "instruct": "calm", "text": "Hello.", "hash": expected_hash}]
    finally:
        shutil.rmtree(root)


def test_script_pending_lines_empty_once_matching_file_exists():
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, "Scene_speakers.txt", ["narrator | calm | Hello."])
        lines_dir = os.path.join(act_folder, "_audio", "lines", "Scene")
        os.makedirs(lines_dir)
        expected_hash = la.line_hash("narrator_v1.pt", "calm", "Hello.")
        open(os.path.join(lines_dir, la.make_line_filename(0, expected_hash)), "w").close()

        role_map = sl.root_role_map(root)
        _, pending = sl.script_pending_lines(act_folder, "Scene_speakers.txt", "_speakers.txt", role_map)
        assert pending == []
    finally:
        shutil.rmtree(root)


def test_role_recast_makes_a_previously_fresh_line_pending_again():
    """The exact mechanism that replaces mark_role_stale's old active
    'flip status' step: nothing touches the audio file or any state -- a
    changed _roles.json alone is enough for the SAME line to start
    reporting pending again."""
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, "Scene_speakers.txt", ["narrator | calm | Hello."])
        lines_dir = os.path.join(act_folder, "_audio", "lines", "Scene")
        os.makedirs(lines_dir)
        open(os.path.join(lines_dir, la.make_line_filename(0, la.line_hash("narrator_v1.pt", "calm", "Hello."))), "w").close()

        role_map_before = sl.root_role_map(root)
        _, pending_before = sl.script_pending_lines(act_folder, "Scene_speakers.txt", "_speakers.txt", role_map_before)
        assert pending_before == []

        # Recast "narrator" to a different voice -- no per-line state touched.
        with open(os.path.join(root, "_roles.json"), "w", encoding="utf-8") as f:
            json.dump({"roles": [{"code": "narrator", "speaker": "narrator_v2.pt"}]}, f)

        role_map_after = sl.root_role_map(root)
        _, pending_after = sl.script_pending_lines(act_folder, "Scene_speakers.txt", "_speakers.txt", role_map_after)
        assert pending_after == [{
            "position": 0, "speaker": "narrator_v2.pt", "instruct": "calm", "text": "Hello.",
            "hash": la.line_hash("narrator_v2.pt", "calm", "Hello."),
        }]
    finally:
        shutil.rmtree(root)


def test_mark_role_stale_unreadies_and_deletes_final_file_for_affected_ready_script():
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, "Scene_speakers.txt", ["narrator | calm | Hello."])
        sl.set_script_ready(act_folder, "Scene_speakers.txt", True)
        audio_dir = os.path.join(act_folder, "_audio")
        os.makedirs(audio_dir)
        open(os.path.join(audio_dir, "Scene.wav"), "w").close()

        with open(os.path.join(root, "_roles.json"), "w", encoding="utf-8") as f:
            json.dump({"roles": [{"code": "narrator", "speaker": "narrator_v2.pt"}]}, f)

        result = sl.mark_role_stale(root, "narrator", "_speakers.txt")
        assert len(result["changed"]) == 1
        assert result["changed"][0]["was_ready"] is True
        assert "Scene_speakers.txt" not in sl.scripts_ready(act_folder)
        assert not os.path.isfile(os.path.join(audio_dir, "Scene.wav"))
    finally:
        shutil.rmtree(root)


def test_mark_role_stale_ignores_scripts_not_using_the_role():
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, "Scene_speakers.txt", ["someone_else | calm | Hi."])
        result = sl.mark_role_stale(root, "narrator", "_speakers.txt")
        assert result["changed"] == []
    finally:
        shutil.rmtree(root)


def test_browse_line_hashes_json_matches_resolved_roles_and_skips_malformed():
    """browse()'s 4th output (line_hashes_json) must align with the SAME
    lines Dialog will actually synthesize -- i.e. skip malformed ones, and
    hash the RESOLVED preset (already substituted into `script` by
    resolve_roles), not the raw role code."""
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, "Scene_speakers.txt", [
            "narrator | calm | Hello.",
            "this is not a valid line",
            "narrator | sharp | Again.",
        ])
        node = sl.FL_CosyVoice3_ScriptLibrary()
        script, folder, filename_out, line_hashes_json = node.browse(
            folder_path=root, act="Act01", script_filter="_speakers.txt",
            script_file="Scene_speakers.txt", script="",
        )
        assert "narrator_v1.pt | calm | Hello." in script
        hashes = json.loads(line_hashes_json)
        assert hashes == [
            la.line_hash("narrator_v1.pt", "calm", "Hello."),
            la.line_hash("narrator_v1.pt", "sharp", "Again."),
        ]
    finally:
        shutil.rmtree(root)


def test_find_pending_revoice_across_acts():
    root, act_folder = _make_project()
    try:
        _write_script(act_folder, "Scene_speakers.txt", ["narrator | calm | Hello."])
        result = sl.find_pending_revoice(root, "_speakers.txt")
        assert len(result) == 1
        assert result[0]["act"] == "Act01"
        assert result[0]["base_name"] == "Scene"
        assert result[0]["pending"][0]["text"] == "Hello."
    finally:
        shutil.rmtree(root)


TESTS = [v for k, v in sorted(globals().items()) if k.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"OK: {t.__name__}")
    print(f"\n{len(TESTS)} passed")
