"""Plain-Python tests for nodes/_line_audio.py -- no torch/soundfile needed,
runnable directly (`python test_line_audio.py`) or via pytest, unlike the
rest of this addon's node code."""
import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import _line_audio as la  # noqa: E402
import _line_history as lh  # noqa: E402


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


def test_revoicing_a_changed_line_deletes_the_old_wording_file():
    d = tempfile.mkdtemp()
    try:
        hash_hello = la.line_hash("narrator", "calm", "Hello.")
        hash_hi = la.line_hash("narrator", "calm", "Hi.")
        open(la.expected_path(d, 0, hash_hello), "w").close()
        # Edit to "Hi." and revoice: the new take is written, THEN
        # delete_stale_at_position cleans up -- "Hello."'s file is gone,
        # not left as an orphan (see nodes/audio_post_process.py, which
        # calls this right after the write succeeds).
        open(la.expected_path(d, 0, hash_hi), "w").close()
        deleted = la.delete_stale_at_position(d, 0, hash_hi)
        assert deleted == [la.make_line_filename(0, hash_hello)]
        assert not os.path.isfile(la.expected_path(d, 0, hash_hello))
        assert os.path.isfile(la.expected_path(d, 0, hash_hi))
        assert len(la.list_lines_dir(d)) == 1
    finally:
        shutil.rmtree(d)


def test_delete_stale_at_position_ignores_other_positions_and_missing_dir():
    d = tempfile.mkdtemp()
    try:
        assert la.delete_stale_at_position(d, 0, "aaaaaaaa") == []
        open(la.expected_path(d, 0, "aaaaaaaa"), "w").close()
        open(la.expected_path(d, 1, "bbbbbbbb"), "w").close()
        deleted = la.delete_stale_at_position(d, 0, "aaaaaaaa")
        assert deleted == []
        assert os.path.isfile(la.expected_path(d, 0, "aaaaaaaa"))
        assert os.path.isfile(la.expected_path(d, 1, "bbbbbbbb"))
        assert la.delete_stale_at_position(os.path.join(d, "missing"), 0, "aaaaaaaa") == []
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


def pos_key(position):
    """Audiobook callers' own convention -- make_version_filename etc. take
    a plain string key now (see VERSION_FILE_RE's docstring), zero-padded
    to match the pre-generalization filename format exactly."""
    return f"{position:04d}"


def test_version_filename_roundtrip():
    h = la.line_hash("narrator", "calm", "Hello.")
    name = la.make_version_filename(pos_key(4), 2, h, 170234)
    assert name == f"0004_v002_{h}_s170234.wav"
    assert la.parse_version_filename(name) == ("0004", 2, h, 170234)
    assert la.parse_version_filename(la.make_line_filename(4, h)) is None


def test_version_filename_roundtrip_with_a_non_numeric_key():
    """VO Dub's own key (audio_key) is a string, not a zero-padded
    position -- the scheme must work for that too, unchanged."""
    h = la.line_hash("narrator", "calm", "Hello.")
    name = la.make_version_filename("ep1_line_003", 1, h, 555)
    assert name == f"ep1_line_003_v001_{h}_s555.wav"
    assert la.parse_version_filename(name) == ("ep1_line_003", 1, h, 555)


def test_next_version_number_starts_at_one_and_never_reuses():
    d = tempfile.mkdtemp()
    try:
        h = la.line_hash("narrator", "calm", "Hello.")
        assert la.next_version_number(d, pos_key(0)) == 1
        open(os.path.join(d, la.make_version_filename(pos_key(0), 1, h, 111)), "w").close()
        assert la.next_version_number(d, pos_key(0)) == 2
        # a different position doesn't interfere
        assert la.next_version_number(d, pos_key(1)) == 1
    finally:
        shutil.rmtree(d)


def test_delete_stale_at_position_ignores_version_files():
    d = tempfile.mkdtemp()
    try:
        h_old = la.line_hash("narrator", "calm", "Old.")
        h_new = la.line_hash("narrator", "calm", "New.")
        open(la.expected_path(d, 4, h_old), "w").close()
        version_name = la.make_version_filename(pos_key(4), 1, h_old, 111)
        open(os.path.join(d, version_name), "w").close()

        # a re-voice to new content must not touch the version/history file,
        # only the canonical one -- version files are additive, never part
        # of the "exactly one file per position" invariant delete_stale_at_
        # position enforces.
        open(la.expected_path(d, 4, h_new), "w").close()
        deleted = la.delete_stale_at_position(d, 4, h_new)
        assert deleted == [la.make_line_filename(4, h_old)]
        assert os.path.isfile(os.path.join(d, version_name))
    finally:
        shutil.rmtree(d)


def test_promote_version_copies_onto_the_canonical_path():
    d = tempfile.mkdtemp()
    try:
        h = la.line_hash("narrator", "calm", "Hello.")
        v1 = la.make_version_filename(pos_key(4), 1, h, 111)
        v2 = la.make_version_filename(pos_key(4), 2, h, 222)
        open(os.path.join(d, v1), "w").write("take one")
        open(os.path.join(d, v2), "w").write("take two")

        canonical = la.expected_path(d, 4, h)
        dest = la.promote_version(d, pos_key(4), 2, canonical)
        assert dest == canonical
        assert open(dest).read() == "take two"
        # both version files still exist -- promote COPIES, never moves
        assert os.path.isfile(os.path.join(d, v1))
        assert os.path.isfile(os.path.join(d, v2))
    finally:
        shutil.rmtree(d)


def test_promote_version_raises_when_that_version_does_not_exist():
    d = tempfile.mkdtemp()
    try:
        try:
            la.promote_version(d, pos_key(4), 1, os.path.join(d, "0004_deadbeef.wav"))
            assert False, "expected FileNotFoundError"
        except FileNotFoundError:
            pass
    finally:
        shutil.rmtree(d)


def test_reorganize_delete_also_removes_version_files_and_history_entry():
    d = tempfile.mkdtemp()
    try:
        h = la.line_hash("narrator", "calm", "Hello.")
        v1 = la.make_version_filename(pos_key(1), 1, h, 111)
        open(os.path.join(d, v1), "w").close()
        lh.append_version(d, 1, 1, h, 111, "narrator", "calm", "Hello.", "2026-01-01T00:00:00Z")

        result = la.reorganize_lines(d, deletes=[1], moves=[])
        assert v1 in result["deleted"]
        assert not os.path.isfile(os.path.join(d, v1))
        assert lh.get_entry(d, 1) is None
    finally:
        shutil.rmtree(d)


def test_reorganize_move_renames_version_files_and_moves_history_entry():
    d = tempfile.mkdtemp()
    try:
        h = la.line_hash("narrator", "calm", "Hello.")
        v1 = la.make_version_filename(pos_key(2), 1, h, 111)
        v2 = la.make_version_filename(pos_key(2), 2, h, 222)
        open(os.path.join(d, v1), "w").close()
        open(os.path.join(d, v2), "w").close()
        lh.append_version(d, 2, 1, h, 111, "narrator", "calm", "Hello.", "2026-01-01T00:00:00Z")
        lh.append_version(d, 2, 2, h, 222, "narrator", "calm", "Hello.", "2026-01-01T00:00:01Z")
        lh.set_chosen_version(d, 2, 1)

        la.reorganize_lines(d, deletes=[], moves=[(2, 1)])

        new_v1 = la.make_version_filename(pos_key(1), 1, h, 111)
        new_v2 = la.make_version_filename(pos_key(1), 2, h, 222)
        assert os.path.isfile(os.path.join(d, new_v1))
        assert os.path.isfile(os.path.join(d, new_v2))
        assert not os.path.isfile(os.path.join(d, v1))
        assert lh.get_entry(d, 2) is None
        moved_entry = lh.get_entry(d, 1)
        assert moved_entry is not None
        assert moved_entry["chosen_version"] == 1
        assert len(moved_entry["versions"]) == 2
    finally:
        shutil.rmtree(d)


def test_reorganize_multi_shift_lands_files_and_history_at_correct_final_positions():
    """delete position 1, shifting 2->1 and 3->2 -- version files and
    manifest entries on positions 0 (untouched), 2, and 3 must all end up
    exactly where the canonical files themselves end up."""
    d = tempfile.mkdtemp()
    try:
        h = la.line_hash("narrator", "calm", "Line.")
        for pos, seed in [(0, 10), (1, 20), (2, 30), (3, 40)]:
            name = la.make_version_filename(pos_key(pos), 1, h, seed)
            open(os.path.join(d, name), "w").close()
            lh.append_version(d, pos, 1, h, seed, "narrator", "calm", "Line.", "2026-01-01T00:00:00Z")

        la.reorganize_lines(d, deletes=[1], moves=[(2, 1), (3, 2)])

        # position 0 untouched
        assert lh.get_entry(d, 0)["versions"][0]["seed"] == 10
        assert os.path.isfile(os.path.join(d, la.make_version_filename(pos_key(0), 1, h, 10)))
        # position 1's original content (seed 20) is gone
        assert lh.get_entry(d, 1) is None or lh.get_entry(d, 1)["versions"][0]["seed"] != 20
        # old position 2 (seed 30) landed at new position 1
        assert lh.get_entry(d, 1)["versions"][0]["seed"] == 30
        assert os.path.isfile(os.path.join(d, la.make_version_filename(pos_key(1), 1, h, 30)))
        # old position 3 (seed 40) landed at new position 2
        assert lh.get_entry(d, 2)["versions"][0]["seed"] == 40
        assert os.path.isfile(os.path.join(d, la.make_version_filename(pos_key(2), 1, h, 40)))
        # nothing left at old position 3
        assert lh.get_entry(d, 3) is None
    finally:
        shutil.rmtree(d)


TESTS = [v for k, v in list(globals().items()) if k.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"OK: {t.__name__}")
    print(f"\n{len(TESTS)} passed")
