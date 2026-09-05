"""Plain-Python tests for nodes/_line_audio.py -- no torch/soundfile needed,
runnable directly (`python test_line_audio.py`) or via pytest, unlike the
rest of this addon's node code."""
import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import _line_audio as la  # noqa: E402


def test_line_hash_is_stable_and_whitespace_insensitive():
    a = la.line_hash("voldemort.pt", "calm", "Hello.")
    b = la.line_hash(" voldemort.pt ", " calm ", " Hello. ")
    assert a == b
    assert len(a) == la.HASH_LEN


def test_line_hash_changes_with_any_field():
    base = la.line_hash("v.pt", "calm", "Hello.")
    assert la.line_hash("v.pt", "calm", "Hello!") != base
    assert la.line_hash("v.pt", "angry", "Hello.") != base
    assert la.line_hash("other.pt", "calm", "Hello.") != base


def test_parse_and_make_filename_roundtrip():
    name = la.make_line_filename(4, "a1b2c3d4")
    assert name == "0004_a1b2c3d4.wav"
    assert la.parse_line_filename(name) == (4, "a1b2c3d4")
    assert la.parse_line_filename("not_a_match.wav") is None
    assert la.parse_line_filename("_state.json") is None


def test_expected_path_is_a_pure_function_of_position_and_hash():
    path = la.expected_path("C:\\proj\\lines", 4, "a1b2c3d4")
    assert path == os.path.join("C:\\proj\\lines", "0004_a1b2c3d4.wav")


def test_revoicing_same_content_overwrites_in_place_not_a_new_file():
    d = tempfile.mkdtemp()
    try:
        path = la.expected_path(d, 0, "aaaaaaaa")
        with open(path, "w") as f:
            f.write("take one")
        # A second "re-voice" of the SAME content writes to the exact same
        # path -- no version bump, just an overwrite.
        with open(path, "w") as f:
            f.write("take two")
        assert os.path.isfile(path)
        with open(path) as f:
            assert f.read() == "take two"
        assert len(la.list_lines_dir(d)) == 1
    finally:
        shutil.rmtree(d)


def test_reverting_text_to_a_previously_rendered_wording_is_voiced_again_without_rerendering():
    d = tempfile.mkdtemp()
    try:
        hash_hello = la.line_hash("narrator", "calm", "Hello.")
        hash_hi = la.line_hash("narrator", "calm", "Hi.")
        open(la.expected_path(d, 0, hash_hello), "w").close()
        # Edit to "Hi." and revoice -- a SECOND file appears, "Hello."'s is
        # simply orphaned, not deleted.
        open(la.expected_path(d, 0, hash_hi), "w").close()
        assert os.path.isfile(la.expected_path(d, 0, hash_hello))
        assert os.path.isfile(la.expected_path(d, 0, hash_hi))
        # Revert the text back to "Hello." -- its file never went away, so
        # it's immediately voiced again with no re-render.
        assert os.path.isfile(la.expected_path(d, 0, la.line_hash("narrator", "calm", "Hello.")))
    finally:
        shutil.rmtree(d)


def test_most_recent_at_position_picks_by_mtime_regardless_of_hash():
    d = tempfile.mkdtemp()
    try:
        assert la.most_recent_at_position(d, 0) is None
        older = la.expected_path(d, 0, "aaaaaaaa")
        newer = la.expected_path(d, 0, "bbbbbbbb")
        open(older, "w").close()
        os.utime(older, (1000, 1000))
        open(newer, "w").close()
        os.utime(newer, (2000, 2000))
        assert la.most_recent_at_position(d, 0) == os.path.basename(newer)
        # a different position is untouched
        assert la.most_recent_at_position(d, 1) is None
    finally:
        shutil.rmtree(d)


def test_reorganize_delete_shifts_everything_after_down():
    d = tempfile.mkdtemp()
    try:
        for pos in range(4):
            open(os.path.join(d, la.make_line_filename(pos, f"{pos}{pos}{pos}{pos}{pos}{pos}{pos}{pos}")), "w").close()
        # delete row 1 -- rows 2,3 shift down to 1,2
        result = la.reorganize_lines(d, deletes=[1], moves=[(2, 1), (3, 2)])
        assert len(result["deleted"]) == 1
        assert len(result["moved"]) == 2
        remaining = sorted(os.listdir(d))
        assert remaining == [
            la.make_line_filename(0, "00000000"),
            la.make_line_filename(1, "22222222"),
            la.make_line_filename(2, "33333333"),
        ]
    finally:
        shutil.rmtree(d)


def test_reorganize_split_shifts_everything_after_up_without_collision():
    d = tempfile.mkdtemp()
    try:
        for pos in range(3):
            open(os.path.join(d, la.make_line_filename(pos, f"{pos}{pos}{pos}{pos}{pos}{pos}{pos}{pos}")), "w").close()
        # insert a new row after position 0 -- rows 1,2 shift up to 2,3.
        # Must process descending (2->3 first) or 1->2 would collide with
        # the not-yet-moved row currently AT position 2.
        result = la.reorganize_lines(d, deletes=[], moves=[(1, 2), (2, 3)])
        assert len(result["moved"]) == 2
        remaining = sorted(os.listdir(d))
        assert remaining == [
            la.make_line_filename(0, "00000000"),
            la.make_line_filename(2, "11111111"),
            la.make_line_filename(3, "22222222"),
        ]
    finally:
        shutil.rmtree(d)


def test_reorganize_merge_deletes_loser_and_keeps_winner_untouched():
    d = tempfile.mkdtemp()
    try:
        for pos in range(3):
            open(os.path.join(d, la.make_line_filename(pos, f"{pos}{pos}{pos}{pos}{pos}{pos}{pos}{pos}")), "w").close()
        # merge row 0 (keeper) + row 1 (loser) -> row 2 shifts down to 1.
        result = la.reorganize_lines(d, deletes=[1], moves=[(2, 1)])
        remaining = sorted(os.listdir(d))
        assert remaining == [
            la.make_line_filename(0, "00000000"),  # keeper untouched
            la.make_line_filename(1, "22222222"),  # shifted
        ]
        assert result["deleted"] == [la.make_line_filename(1, "11111111")]
    finally:
        shutil.rmtree(d)


def test_reorganize_moves_every_orphaned_hash_at_a_position_together():
    d = tempfile.mkdtemp()
    try:
        # position 0 has TWO files (an orphan from an earlier edit, plus
        # the current one) -- both must move together on a delete/shift.
        open(os.path.join(d, la.make_line_filename(0, "aaaaaaaa")), "w").close()
        open(os.path.join(d, la.make_line_filename(0, "bbbbbbbb")), "w").close()
        result = la.reorganize_lines(d, deletes=[], moves=[(0, 1)])
        assert len(result["moved"]) == 2
        remaining = sorted(os.listdir(d))
        assert remaining == sorted([
            la.make_line_filename(1, "aaaaaaaa"),
            la.make_line_filename(1, "bbbbbbbb"),
        ])
    finally:
        shutil.rmtree(d)


def test_reorganize_on_missing_dir_is_a_noop():
    result = la.reorganize_lines("D:\\definitely\\does\\not\\exist", deletes=[0], moves=[(1, 0)])
    assert result == {"deleted": [], "moved": []}


TESTS = [v for k, v in list(globals().items()) if k.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"OK: {t.__name__}")
    print(f"\n{len(TESTS)} passed")
