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
    name = la.make_line_filename(4, 1, "a1b2c3d4")
    assert name == "0004_01_a1b2c3d4.wav"
    assert la.parse_line_filename(name) == (4, 1, "a1b2c3d4")
    assert la.parse_line_filename("not_a_match.wav") is None
    assert la.parse_line_filename("_state.json") is None


def test_next_version_and_latest_by_position():
    d = tempfile.mkdtemp()
    try:
        assert la.next_version_at(d, 0) == 1
        open(os.path.join(d, la.make_line_filename(0, 1, "aaaaaaaa")), "w").close()
        assert la.next_version_at(d, 0) == 2
        open(os.path.join(d, la.make_line_filename(0, 2, "bbbbbbbb")), "w").close()
        assert la.next_version_at(d, 0) == 3
        # position 1 untouched -- independent counter
        assert la.next_version_at(d, 1) == 1

        latest = la.latest_by_position(d)
        assert latest[0] == (2, "bbbbbbbb", la.make_line_filename(0, 2, "bbbbbbbb"))
        assert 1 not in latest
    finally:
        shutil.rmtree(d)


def test_reorganize_delete_shifts_everything_after_down():
    d = tempfile.mkdtemp()
    try:
        for pos in range(4):
            open(os.path.join(d, la.make_line_filename(pos, 1, f"{pos}{pos}{pos}{pos}{pos}{pos}{pos}{pos}")), "w").close()
        # delete row 1 -- rows 2,3 shift down to 1,2
        result = la.reorganize_lines(d, deletes=[1], moves=[(2, 1), (3, 2)])
        assert len(result["deleted"]) == 1
        assert len(result["moved"]) == 2
        remaining = sorted(os.listdir(d))
        assert remaining == [
            la.make_line_filename(0, 1, "00000000"),
            la.make_line_filename(1, 1, "22222222"),
            la.make_line_filename(2, 1, "33333333"),
        ]
    finally:
        shutil.rmtree(d)


def test_reorganize_split_shifts_everything_after_up_without_collision():
    d = tempfile.mkdtemp()
    try:
        for pos in range(3):
            open(os.path.join(d, la.make_line_filename(pos, 1, f"{pos}{pos}{pos}{pos}{pos}{pos}{pos}{pos}")), "w").close()
        # insert a new row after position 0 -- rows 1,2 shift up to 2,3.
        # Must process descending (2->3 first) or 1->2 would collide with
        # the not-yet-moved row currently AT position 2.
        result = la.reorganize_lines(d, deletes=[], moves=[(1, 2), (2, 3)])
        assert len(result["moved"]) == 2
        remaining = sorted(os.listdir(d))
        assert remaining == [
            la.make_line_filename(0, 1, "00000000"),
            la.make_line_filename(2, 1, "11111111"),
            la.make_line_filename(3, 1, "22222222"),
        ]
    finally:
        shutil.rmtree(d)


def test_reorganize_merge_deletes_loser_and_keeps_winner_untouched():
    d = tempfile.mkdtemp()
    try:
        for pos in range(3):
            open(os.path.join(d, la.make_line_filename(pos, 2, f"{pos}{pos}{pos}{pos}{pos}{pos}{pos}{pos}")), "w").close()
        # merge row 0 (keeper) + row 1 (loser) -> row 2 shifts down to 1.
        result = la.reorganize_lines(d, deletes=[1], moves=[(2, 1)])
        remaining = sorted(os.listdir(d))
        assert remaining == [
            la.make_line_filename(0, 2, "00000000"),  # keeper untouched
            la.make_line_filename(1, 2, "22222222"),  # shifted
        ]
        assert result["deleted"] == [la.make_line_filename(1, 2, "11111111")]
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
