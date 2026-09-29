"""
Tests for Part 2 of task-05-dry-foundation: after importing `server`, the private modules
`_audio_effects` and `_audio_utils` should be importable.

Currently `server.py` does not add the `nodes` directory to `sys.path`, so these imports
raise ``ModuleNotFoundError``. This test deliberately expects the imports to succeed, thus
it will FAIL until `server.py` is fixed.
"""

import importlib


def test_server_imports_audio_modules():
    """Import `server` and then import `_audio_effects` and `_audio_utils`.
    The test passes only if both modules can be imported without error.
    """
    # Ensure the electron-server directory is on sys.path for importing server
    import os, sys
    server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "electron-server"))
    if server_dir not in sys.path:
        sys.path.insert(0, server_dir)
    # Import the server module – this may modify sys.path.
    import server as srv  # noqa: F401

    # Attempt to import the private audio modules.
    import importlib
    ae = importlib.import_module("_audio_effects")
    au = importlib.import_module("_audio_utils")
    # Verify that the imports returned module objects.
    assert ae is not None
    assert au is not None
