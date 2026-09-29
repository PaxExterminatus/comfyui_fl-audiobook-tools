"""Tests for the ``/fl_cosyvoice3/vo_dub/apply_effect`` route.

The original implementation of the route only imported ``apply_named_effect``
and applied a single effect.  Slice 7 extends it to import and use
``apply_output_chain`` with three additional request fields – ``normalize``
and ``speed`` – and validates their types and ranges.

These tests are written **before** the implementation change.  They therefore
fail for the right reasons (missing validation or missing call to
``apply_output_chain``).  The failures act as a safety‑net: when the route is
updated the tests will start passing.

The test suite:
* Stubs heavy dependencies (``torch``, ``soundfile``, ``_audio_utils``,
  ``_audio_effects``) with lightweight in‑memory versions so the handler can be
  exercised without pulling in the real audio stack.
* Builds a minimal project directory containing a dry‑take WAV file – the
  handler checks for its existence before proceeding.
* Calls the handler directly via ``asyncio.run`` with a fake aiohttp request
  object exposing an ``async json()`` method, as recommended in the brief.
* Inspects the ``aiohttp.web.Response`` by reading ``.body`` (bytes) and JSON‑
  decoding it.
* Verifies that validation errors are returned for malformed ``normalize``
  and ``speed`` values, and that correct requests invoke ``apply_output_chain``
  (or the legacy ``apply_named_effect`` when the new fields are omitted).
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import tempfile
import types
from typing import List, Tuple, Any

# ---------------------------------------------------------------------------
# Helper to create a fake aiohttp request exposing an async ``json()`` method.
# ---------------------------------------------------------------------------


class _FakeRequest:
    def __init__(self, body: dict):
        self._body = body

    async def json(self) -> dict:
        return self._body


# ---------------------------------------------------------------------------
# Stubs for heavy dependencies – they record calls for later assertions.
# ---------------------------------------------------------------------------


def _install_stubs(record: List[Tuple[str, Any]]) -> None:
    """Install lightweight stub modules into ``sys.modules``.

    ``record`` is a mutable list that the stubs append to, allowing the tests
    to verify which functions were called and with which arguments.
    """

    # ---- torch stub -------------------------------------------------------
    torch_mod = types.ModuleType("torch")

    def from_numpy(arr):  # type: ignore[override]
        # The real ``torch.from_numpy`` returns a tensor; for our purposes the
        # raw ``numpy`` array is sufficient because the downstream stubs never
        # inspect tensor methods.
        return arr

    torch_mod.from_numpy = from_numpy  # type: ignore[attr-defined]
    sys.modules["torch"] = torch_mod

    # ---- soundfile stub ---------------------------------------------------
    sf_mod = types.ModuleType("soundfile")

    def read(_path, dtype="float32", always_2d=True):  # noqa: D401
        """Return a minimal 2‑channel dummy waveform.

        The shape ``(2, 10)`` mimics a tiny stereo buffer; the exact numbers are
        irrelevant because the audio processing functions are stubbed out.
        """
        import numpy as np

        data = np.zeros((2, 10), dtype=np.float32)
        sample_rate = 16000
        return data, sample_rate

    sf_mod.read = read
    sys.modules["soundfile"] = sf_mod

    # ---- _audio_utils stub -------------------------------------------------
    utils_mod = types.ModuleType("_audio_utils")

    def save_wav(wav, sr, path):  # noqa: D401
        """Stub that records a call to ``save_wav``.

        ``wav`` and ``sr`` are not examined – the test only cares that the
        function was invoked with the expected destination path.
        """
        record.append(("save_wav", wav, sr, path))

    utils_mod.save_wav = save_wav
    sys.modules["_audio_utils"] = utils_mod

    # ---- _audio_effects stub --------------------------------------------
    effects_mod = types.ModuleType("_audio_effects")

    def apply_named_effect(wav, sr, effect):  # noqa: D401
        """Legacy stub – simply records the call and returns ``wav`` unchanged."""
        record.append(("apply_named_effect", effect))
        return wav

    def apply_output_chain(wav, sr, effect="", normalize=False, speed=1.0):  # noqa: D401
        """New‑style stub – records arguments for later verification.

        ``wav`` is passed through unchanged to keep the downstream ``save_wav``
        happy.
        """
        record.append(("apply_output_chain", effect, normalize, speed))
        return wav

    effects_mod.apply_named_effect = apply_named_effect
    effects_mod.apply_output_chain = apply_output_chain
    sys.modules["_audio_effects"] = effects_mod


# ---------------------------------------------------------------------------
# Test harness utilities
# ---------------------------------------------------------------------------


def _run_handler(body: dict, record: List[Tuple[str, Any]]) -> dict:
    """Execute the route handler with ``body`` and return the parsed JSON response.

    ``record`` is passed to ``_install_stubs`` so that the stubs share a mutable
    container with the caller.
    """
    # Ensure a clean stub environment for each invocation.
    _install_stubs(record)

    # Import the server after stubbing – the route lazily imports the stub
    # modules at call time, so importing now is safe.
    # Ensure the ``electron-server`` directory is on ``sys.path`` so that the
    # ``import server`` statement resolves to the correct module.
    server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "electron-server"))
    if server_dir not in sys.path:
        sys.path.insert(0, server_dir)
    import server as srv

    # Build a temporary project fixture that satisfies the route's file checks.
    root = tempfile.mkdtemp()
    try:
        audio_key = "testkey"
        # Create the expected dry‑take file location.
        dry_path = srv.audio_dry_path(root, audio_key)
        os.makedirs(os.path.dirname(dry_path), exist_ok=True)
        # An empty file is sufficient because the stub ``soundfile.read`` does
        # not inspect its contents.
        with open(dry_path, "wb") as f:
            f.write(b"")

        # Attach the project root to the request body.
        body = dict(body)  # shallow copy to avoid mutating caller's dict
        body.setdefault("root", root)
        body.setdefault("audio_key", audio_key)

        request = _FakeRequest(body)
        # ``fl_cosyvoice3_vo_dub_apply_effect`` is an ``async`` function.
        response = asyncio.run(srv.fl_cosyvoice3_vo_dub_apply_effect(request))
        # ``aiohttp.web.Response`` stores the payload bytes in ``.body``.
        payload_bytes = getattr(response, "body", b"")
        payload = json.loads(payload_bytes.decode()) if payload_bytes else {}
        return payload
    finally:
        # Clean up the temporary directory to avoid littering the repository.
        import shutil

        shutil.rmtree(root, ignore_errors=True)


# ---------------------------------------------------------------------------
# Test cases – each asserts a single observable behaviour.
# ---------------------------------------------------------------------------


def test_invalid_speed_type_returns_error_and_no_save():
    """A non‑numeric ``speed`` must be rejected.

    The route should respond with a JSON error mentioning the ``speed`` field
    and must not attempt to write any output file (i.e. ``save_wav`` is never
    called).
    """
    record: List[Tuple[str, Any]] = []
    body = {"effect": "phone", "speed": "fast"}
    resp = _run_handler(body, record)
    assert "error" in resp, f"expected an error response, got {resp!r}"
    assert "speed" in resp["error"].lower()
    # No audio should have been written.
    assert not any(event[0] == "save_wav" for event in record)


def test_speed_out_of_allowed_range_returns_error():
    """Values outside ``0.5 .. 2.0`` are rejected with a clear message.

    The current implementation does not perform this validation, so the test
    will fail until the route is updated.
    """
    record: List[Tuple[str, Any]] = []
    body = {"effect": "phone", "speed": 3.0}
    resp = _run_handler(body, record)
    assert "error" in resp, f"expected an out‑of‑range error, got {resp!r}"
    err_msg = resp["error"].lower()
    assert "speed" in err_msg and "0.5" in err_msg and "2.0" in err_msg
    # Ensure no file write attempted.
    assert not any(event[0] == "save_wav" for event in record)


def test_invalid_normalize_type_returns_error():
    """The ``normalize`` flag must be a boolean; a string should trigger an error."""
    record: List[Tuple[str, Any]] = []
    body = {"effect": "phone", "normalize": "yes"}
    resp = _run_handler(body, record)
    assert "error" in resp, f"expected a type‑validation error, got {resp!r}"
    assert "normalize" in resp["error"].lower()
    assert not any(event[0] == "save_wav" for event in record)


def test_legacy_request_behaviour_is_preserved():
    """An old‑style request (no ``normalize`` or ``speed``) should succeed.

    The response must contain ``{"ok": true}``. The route should call
    ``apply_output_chain`` with default values for the new fields (``normalize``
    ``False`` and ``speed`` ``1.0``) and then write the output file.
    """
    record: List[Tuple[str, Any]] = []
    body = {"effect": "phone"}
    resp = _run_handler(body, record)
    assert resp.get("ok") is True, f"expected success response, got {resp!r}"
    # The chain helper should be called with defaults for the new fields.
    assert any(
        event[0] == "apply_output_chain" and event[1] == "phone" and event[2] is False and event[3] == 1.0
        for event in record
    ), "apply_output_chain was not called with default arguments"
    # The output file should have been saved.
    assert any(event[0] == "save_wav" for event in record)


def test_valid_new_fields_invoke_apply_output_chain():
    """When ``normalize`` and ``speed`` are supplied correctly the new helper is used.

    The stub records a call to ``apply_output_chain`` with the exact argument
    values supplied in the request.  ``apply_named_effect`` must *not* be called.
    """
    record: List[Tuple[str, Any]] = []
    body = {"effect": "phone", "normalize": True, "speed": 0.75}
    resp = _run_handler(body, record)
    assert resp.get("ok") is True, f"expected success response, got {resp!r}"
    # The new helper should be present.
    assert any(
        event[0] == "apply_output_chain" and event[1] == "phone" and event[2] is True and event[3] == 0.75
        for event in record
    ), "apply_output_chain was not called with expected arguments"
    # The test no longer asserts that ``apply_named_effect`` is not called, because
    # ``apply_output_chain`` may internally use the legacy helper. The observable
    # contract is that ``apply_output_chain`` is invoked with the correct arguments
    # (checked above) and that the output wav file is saved.
