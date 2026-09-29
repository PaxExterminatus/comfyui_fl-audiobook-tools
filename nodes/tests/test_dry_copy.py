"""
Tests for the `write_dry_copy` function in `electron-server/server.py`.
The function is supposed to copy a source wav file into the project's `_dub_dry`
folder and return the destination path (as computed by `audio_dry_path`).
These tests will initially fail because `write_dry_copy` is not yet implemented.

The tests follow the same structure as `nodes/tests/test_vo_dub_hash_fold.py`:
* heavy dependencies (soundfile, numpy, folder_paths) are stubbed with
  empty `ModuleType` objects.
* `electron-server` is added to `sys.path` so the module can be imported as
  `server`.
* temporary project directories are created using `tempfile.mkdtemp()` and the
  standard CSV layout (via a small helper).
"""

import os
import sys
import shutil
import tempfile
import types

# ---------------------------------------------------------------------------
# Stub heavy dependencies – the server module imports ``soundfile`` and ``numpy``
# only when the audio engine is used. The tests do not need the real libraries.
# ---------------------------------------------------------------------------
for name in ("soundfile", "numpy", "folder_paths"):
    if name not in sys.modules:
        sys.modules[name] = types.ModuleType(name)

# ---------------------------------------------------------------------------
# Import the server module under the name ``server``.
# ---------------------------------------------------------------------------
server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "electron-server"))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)
import server as srv  # noqa: E402

# ---------------------------------------------------------------------------
# Helper to build a minimal project fixture – a temporary directory with the
# expected CSV layout. ``write_dry_copy`` does not touch these files, but the
# helper mirrors the pattern used in other test suites.
# ---------------------------------------------------------------------------
def _make_project():
    root = tempfile.mkdtemp()
    # Create a dummy CSV file (the server expects it for other helpers).
    csv_path = os.path.join(root, "vo_dataset.csv")
    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        f.write("audio_key,episode,speaker,english,russian\n")
    # Ensure the regular output directories exist.
    os.makedirs(os.path.join(root, "audio_en"), exist_ok=True)
    os.makedirs(os.path.join(root, "audio_ru"), exist_ok=True)
    return root

# ---------------------------------------------------------------------------
# Test cases for write_dry_copy.
# ---------------------------------------------------------------------------

def test_copy_creates_dub_dry_and_matches_contents():
    """If the project has no ``_dub_dry`` directory, `write_dry_copy` should
    create it and copy the source file verbatim.
    """
    root = _make_project()
    try:
        src_path = os.path.join(root, "source.wav")
        data = b"dummy wav data"
        with open(src_path, "wb") as f:
            f.write(data)
        audio_key = "Loc_A"
        dest_path = srv.write_dry_copy(root, audio_key, src_path)
        # The returned path should match `audio_dry_path` for the same key.
        assert dest_path == srv.audio_dry_path(root, audio_key)
        # The destination file must exist and contain exactly the same bytes.
        with open(dest_path, "rb") as f:
            copied = f.read()
        assert copied == data
        # The `_dub_dry` directory must now exist.
        assert os.path.isdir(os.path.join(root, "_dub_dry"))
    finally:
        shutil.rmtree(root)


def test_copy_overwrites_existing_file():
    """If a dry file already exists, `write_dry_copy` must replace its contents.
    """
    root = _make_project()
    try:
        src_path = os.path.join(root, "new.wav")
        original_data = b"old data"
        new_data = b"new data"
        # Create the initial dry file.
        dry_path = srv.audio_dry_path(root, "Loc_B")
        os.makedirs(os.path.dirname(dry_path), exist_ok=True)
        with open(dry_path, "wb") as f:
            f.write(original_data)
        # Write a new source file.
        with open(src_path, "wb") as f:
            f.write(new_data)
        # Perform the copy – it should overwrite the old file.
        returned = srv.write_dry_copy(root, "Loc_B", src_path)
        assert returned == dry_path
        with open(dry_path, "rb") as f:
            assert f.read() == new_data
    finally:
        shutil.rmtree(root)


def test_missing_source_raises_and_leaves_no_destination():
    """When `src_path` does not exist, `write_dry_copy` should raise
    ``FileNotFoundError`` and guarantee that no file is created at the destination.
    """
    root = _make_project()
    try:
        missing = os.path.join(root, "does_not_exist.wav")
        dest_path = srv.audio_dry_path(root, "Loc_C")
        try:
            srv.write_dry_copy(root, "Loc_C", missing)
            assert False, "expected FileNotFoundError"
        except FileNotFoundError as e:
            # Ensure the exception mentions the missing source path.
            assert str(missing) in str(e)
        # The destination file must not exist.
        assert not os.path.exists(dest_path)
    finally:
        shutil.rmtree(root)


def test_returned_path_matches_audio_dry_path():
    """The function must return the exact path that `audio_dry_path` calculates.
    """
    root = _make_project()
    try:
        src = os.path.join(root, "src.wav")
        with open(src, "wb") as f:
            f.write(b"x")
        key = "MyKey"
        returned = srv.write_dry_copy(root, key, src)
        expected = srv.audio_dry_path(root, key)
        assert returned == expected
    finally:
        shutil.rmtree(root)
