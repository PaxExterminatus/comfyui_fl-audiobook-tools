"""
Plain-Python tests for the `normalize_loudness` DSP function in
`nodes/_audio_effects.py`.

These tests are written *before* the implementation exists.  They check the
behaviour required by `task-02-normalize.md`:

* RMS‑based gain to a target dBFS.
* Optional peak‑ceiling enforcement.
* Short‑circuit for an all‑zero signal.
* Preservation of shape, dtype and (for stereo) channel‑gain ratio.

The repository already contains a stubbed‑torch test suite
(`test_audio_effects.py`) which installs a fake ``torch`` module.  To make these
DSP tests use the *real* torch library we explicitly delete any existing stub
module and reload the target module after importing the genuine library.
"""

from __future__ import annotations

import os
import sys
import importlib
import math

# Make the repository's ``nodes`` package importable.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ---------------------------------------------------------------------------
# Clean up any stub ``torch`` that other tests may have injected.
# ---------------------------------------------------------------------------
if "torch" in sys.modules:
    del sys.modules["torch"]
if "_audio_effects" in sys.modules:
    del sys.modules["_audio_effects"]

# Import the real torch library from the project's virtual environment.
import torch  # type: ignore  # noqa: E402

# Now import the module under test – it will see the real ``torch``.
import _audio_effects as ae  # noqa: E402

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def rms(tensor: torch.Tensor) -> float:
    """Return the root‑mean‑square of ``tensor`` as a plain ``float``.

    ``torch`` may be on CPU or GPU, but the tests run on CPU.
    """
    # Add a tiny epsilon to avoid sqrt(0) weirdness – not required for the test
    # but mirrors the implementation's safety margin.
    return math.sqrt(torch.mean(tensor.float() ** 2).item() + 1e-12)


def dbfs_from_rms(rms_val: float) -> float:
    """Convert an RMS amplitude to dBFS using ``20 * log10``.

    Full‑scale reference is ``1.0``.
    """
    return 20.0 * math.log10(rms_val)

# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

def test_all_zero_signal_is_unchanged():
    wav = torch.zeros(1, 1024, dtype=torch.float32)
    out = ae.normalize_loudness(wav)
    assert out.shape == wav.shape
    assert out.dtype == wav.dtype
    # The output should be numerically identical (all zeros).
    assert torch.allclose(out, wav)
    # No NaN/inf should appear.
    assert torch.isfinite(out).all()


def test_quiet_signal_is_raised_to_target_rms():
    # A low‑amplitude sine wave (~0.01 RMS) – far quieter than the default
    # target of –20 dBFS (RMS ≈ 0.1).
    t = torch.linspace(0.0, 2 * math.pi, steps=16000, dtype=torch.float32)
    wav = 0.01 * torch.sin(t)
    wav = wav.unsqueeze(0)  # shape (1, N)

    out = ae.normalize_loudness(wav)
    target_rms = 10 ** (-20.0 / 20.0)  # –20 dBFS → 0.1 amplitude
    out_rms = rms(out)
    assert math.isclose(out_rms, target_rms, rel_tol=1e-3, abs_tol=1e-4)

    # The peak must not exceed the default ceiling (–1 dBFS).
    peak_ceiling = 10 ** (-1.0 / 20.0)
    assert out.abs().max().item() <= peak_ceiling + 1e-6


def test_loud_signal_is_reduced_to_target_rms():
    # A high‑amplitude sine wave – RMS far above the target.
    t = torch.linspace(0.0, 2 * math.pi, steps=16000, dtype=torch.float32)
    wav = 5.0 * torch.sin(t)  # RMS ≈ 5 / sqrt(2) ≈ 3.54
    wav = wav.unsqueeze(0)

    out = ae.normalize_loudness(wav)
    target_rms = 10 ** (-20.0 / 20.0)
    out_rms = rms(out)
    assert math.isclose(out_rms, target_rms, rel_tol=1e-3, abs_tol=1e-4)

    peak_ceiling = 10 ** (-1.0 / 20.0)
    assert out.abs().max().item() <= peak_ceiling + 1e-6


def test_peak_ceiling_overrides_target_when_needed():
    # Waveform with a single large impulse that would clip after scaling to the
    # target RMS. The function should apply a second scaling step that limits the
    # peak to the ceiling.
    N = 1024
    wav = torch.zeros(1, N, dtype=torch.float32)
    wav[0, 0] = 10.0  # a huge spike

    out = ae.normalize_loudness(wav)
    expected_ceiling = 10 ** (-1.0 / 20.0)
    peak = out.abs().max().item()
    assert math.isclose(peak, expected_ceiling, rel_tol=1e-4, abs_tol=1e-5)
    # Because we had to clamp the peak, the RMS will be lower than the target.
    target_rms = 10 ** (-20.0 / 20.0)
    assert rms(out) < target_rms


def test_stereo_signal_keeps_channel_gain_ratio():
    # Left channel at 0.1 amplitude, right channel at 0.2 – a fixed 1:2 ratio.
    t = torch.linspace(0.0, 2 * math.pi, steps=16000, dtype=torch.float32)
    left = 0.1 * torch.sin(t)
    right = 0.2 * torch.sin(t)
    wav = torch.stack([left, right], dim=0)  # shape (2, N)

    # Record the original max‑amplitude ratio.
    orig_ratio = left.abs().max().item() / right.abs().max().item()

    out = ae.normalize_loudness(wav)
    # Shape and dtype must be preserved.
    assert out.shape == wav.shape
    assert out.dtype == wav.dtype

    new_ratio = out[0].abs().max().item() / out[1].abs().max().item()
    assert math.isclose(new_ratio, orig_ratio, rel_tol=1e-5, abs_tol=1e-8)

# End of file

# ---------------------------------------------------------------------------
# Test harness – run the tests when the file is executed directly.
# ---------------------------------------------------------------------------
TESTS = [obj for name, obj in globals().items() if name.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        try:
            t()
            print(f"OK: {t.__name__}")
        except Exception as err:  # noqa: BLE001 – capture any exception for reporting
            print(f"FAIL: {t.__name__}: {err}")
            raise
    print(f"\n{len(TESTS)} tests run")
