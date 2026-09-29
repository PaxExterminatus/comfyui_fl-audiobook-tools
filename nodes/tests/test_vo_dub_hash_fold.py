"""
Tests for the two copies of ``row_hash`` (the ComfyUI node and the Electron
standalone server). The task description asks for a set of assertions that
exercise the *new* ``normalize`` and ``speed`` settings – those settings are
*not* yet implemented in either copy of ``row_hash``. Consequently the tests
that expect a hash change when those settings are present will fail. This is
intentional: the failing assertions expose the missing behaviour we need to
implement.

The test file follows the same style as ``nodes/tests/test_vo_dub_library.py``:
* ``soundfile``, ``numpy`` and ``folder_paths`` are stubbed so the modules can be
  imported without the heavy ML stack.
* The ``electron-server`` directory is added to ``sys.path`` so we can import
  the server module directly as ``server``.
* All tests are plain functions whose names start with ``test_`` – they are run
  by ``pytest``.

Only the assertions are important – the surrounding helper functions are
identical to the original test suite and do not need to be modified.
"""

import json
import os
import shutil
import sys
import tempfile
import types

# ---------------------------------------------------------------------------
# Stub heavy dependencies – ``vo_dub_library`` imports ``_line_audio`` which in
# turn imports ``soundfile`` and ``numpy`` at module import time. The original
# test suite replaces those modules with empty ``ModuleType`` objects.
# ---------------------------------------------------------------------------
for name in ("soundfile", "numpy", "folder_paths"):
    if name not in sys.modules:
        sys.modules[name] = types.ModuleType(name)

# ---------------------------------------------------------------------------
# Import the two copies of ``row_hash`` we need to compare.
# ---------------------------------------------------------------------------
# The node implementation lives in ``nodes/vo_dub_library.py``. We add the
# ``nodes`` package directory to ``sys.path`` so it can be imported as a top‑level
# module, mirroring the pattern used in the original ``test_vo_dub_library.py``.
nodes_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if nodes_dir not in sys.path:
    sys.path.insert(0, nodes_dir)
import vo_dub_library as vdl  # noqa: E402

# The server implementation lives in ``electron-server/server.py``. Add that
# directory to ``sys.path`` and import the module under the name ``server``.
server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "electron-server"))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)
import server as srv  # noqa: E402

# ---------------------------------------------------------------------------
# Helper to build a minimal project fixture – a temporary directory with the
# expected CSV layout. ``row_hash`` does not touch any files, but the fixture is
# useful for parity with the original test suite and for future extensions.
# ---------------------------------------------------------------------------
def _make_project(rows):
    root = tempfile.mkdtemp()
    csv_path = os.path.join(root, "vo_dataset.csv")
    # ``vo_dub_library`` expects a CSV with a BOM; the exact column order is not
    # important for the hash function, only the keys we use.
    headers = ["audio_key", "episode", "speaker", "english", "russian"]
    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        f.write(",".join(headers) + "\n")
        for row in rows:
            values = [row.get(h, "") for h in headers]
            f.write(",".join(values) + "\n")
    # Create the output directories expected by ``row_hash``.
    os.makedirs(os.path.join(root, "audio_en"), exist_ok=True)
    os.makedirs(os.path.join(root, "audio_ru"), exist_ok=True)
    return root

# ---------------------------------------------------------------------------
# A simple row used across many tests – speaker ``Ellie`` with some Russian text.
# ---------------------------------------------------------------------------
BASE_ROW = {"audio_key": "Loc_A", "speaker": "Ellie", "english": "Hi.", "russian": "Привет."}


def _baseline_hash(row, state_entry=None):
    """Convenience wrapper that calls both implementations for the same input.
    Returns a tuple ``(node_hash, server_hash)``.
    """
    return (
        vdl.row_hash(row, state_entry),
        srv.row_hash(row, state_entry),
    )


def test_hash_without_normalize_and_speed_is_consistent():
    """A row with no ``normalize`` or ``speed`` entries should produce the same
    hash as a completely empty ``state_entry`` – this verifies the *no churn*
    guarantee for the existing implementation.
    """
    root = _make_project([BASE_ROW])
    try:
        # ``row_hash`` does not need the filesystem for the hash itself, but we
        # keep the temporary project alive for completeness.
        node_hash, server_hash = _baseline_hash(BASE_ROW, None)
        # Empty dict should be equivalent to ``None`` – the hash must be identical.
        node_hash2, server_hash2 = _baseline_hash(BASE_ROW, {})
        assert node_hash == node_hash2
        assert server_hash == server_hash2
        # Finally, the two copies must agree with each other.
        assert node_hash == server_hash
    finally:
        shutil.rmtree(root)


def test_normalize_changes_hash():
    """When ``normalize`` is truthy it must affect the hash. The current
    implementation *does not* look at this key, so the assertion fails – the
    intended behaviour for the exercise.
    """
    root = _make_project([BASE_ROW])
    try:
        baseline = vdl.row_hash(BASE_ROW, None)
        with_normalize = vdl.row_hash(BASE_ROW, {"normalize": True})
        assert baseline != with_normalize, "normalize flag should modify the hash"
    finally:
        shutil.rmtree(root)


def test_speed_changes_hash():
    """A non‑default ``speed`` value must affect the hash. The existing code
    ignores ``speed`` entirely, so the test currently fails.
    """
    root = _make_project([BASE_ROW])
    try:
        baseline = vdl.row_hash(BASE_ROW, None)
        with_speed = vdl.row_hash(BASE_ROW, {"speed": 1.2345})
        assert baseline != with_speed, "speed value should modify the hash"
    finally:
        shutil.rmtree(root)


def test_speed_one_point_zero_has_no_effect():
    """A speed of exactly ``1.0`` is the default and must not change the hash.
    This test should *pass* both before and after the implementation change.
    """
    root = _make_project([BASE_ROW])
    try:
        baseline = vdl.row_hash(BASE_ROW, None)
        speed_one = vdl.row_hash(BASE_ROW, {"speed": 1.0})
        assert baseline == speed_one
    finally:
        shutil.rmtree(root)


def test_speed_precision_is_ignored_beyond_four_decimals():
    """Two ``speed`` values that differ only after the fourth decimal place must
    generate the same hash. The current implementation ignores ``speed``
    completely, so the hashes are equal and this test *passes* – it serves as a
    reference for the required formatting behaviour.
    """
    root = _make_project([BASE_ROW])
    try:
        h1 = vdl.row_hash(BASE_ROW, {"speed": 1.3333333})
        h2 = vdl.row_hash(BASE_ROW, {"speed": 1.33334})
        assert h1 == h2
    finally:
        shutil.rmtree(root)


def test_speed_precision_differs_at_fourth_decimal():
    """Two ``speed`` values that differ at the fourth decimal place must produce
    *different* hashes. This ensures the implementation respects a precision of
    exactly four decimal places – coarser rounding would make these equal and the
    test would fail, while finer rounding would break the ``*_ignored_beyond``
    test.
    """
    root = _make_project([BASE_ROW])
    try:
        h1 = vdl.row_hash(BASE_ROW, {"speed": 1.3333})
        h2 = vdl.row_hash(BASE_ROW, {"speed": 1.3334})
        assert h1 != h2, "speed values differing at the fourth decimal must affect the hash"
    finally:
        shutil.rmtree(root)


def test_normalize_and_speed_together_differ_from_either_alone():
    """Combining both flags must produce a hash distinct from using either flag
    alone. Since the unimplemented ``row_hash`` ignores both, all three hashes are
    identical and this assertion fails.
    """
    root = _make_project([BASE_ROW])
    try:
        h_norm = vdl.row_hash(BASE_ROW, {"normalize": True})
        h_speed = vdl.row_hash(BASE_ROW, {"speed": 2.0})
        h_both = vdl.row_hash(BASE_ROW, {"normalize": True, "speed": 2.0})
        assert h_both != h_norm, "combined flags should not equal normalize‑only hash"
        assert h_both != h_speed, "combined flags should not equal speed‑only hash"
    finally:
        shutil.rmtree(root)


def test_node_and_server_implementations_agree():
    """The two copies of ``row_hash`` must stay byte‑for‑byte equivalent. This
    test checks a handful of representative inputs; it should pass before the
    change because both implementations are currently identical.
    """
    root = _make_project([BASE_ROW])
    try:
        cases = [
            (None, {}),
            ({"normalize": True}, {"normalize": True}),
            ({"speed": 2.5}, {"speed": 2.5}),
            ({"normalize": True, "speed": 0.8}, {"normalize": True, "speed": 0.8}),
        ]
        for node_state, server_state in cases:
            node_h = vdl.row_hash(BASE_ROW, node_state)
            server_h = srv.row_hash(BASE_ROW, server_state)
            assert node_h == server_h, f"hash mismatch for state {node_state}"
    finally:
        shutil.rmtree(root)
