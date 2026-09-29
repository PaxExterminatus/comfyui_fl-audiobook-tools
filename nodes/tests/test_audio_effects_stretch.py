"""
Plain-Python tests for the `time_stretch` function in `nodes/_audio_effects.py`.

These tests are written *before* the implementation exists. They verify the
required behaviour described in `task-03-time-stretch.md`:

* Output length approximates ``input_length / rate``.
* Pitch is preserved – a pure sine wave retains its dominant frequency after
  stretching.
* ``rate == 1.0`` yields an output of essentially the same length.
* Channel count is preserved for mono and stereo input.
* All‑zero input produces all‑zero output (no NaNs or Infs).
* A rate of zero or a negative rate returns the input unchanged.

The real ``torch`` and ``torchaudio`` libraries are used – no stubs are
installed. The repository root is added to ``sys.path`` so the module under
test can be imported.
"""

import sys
import os
import math
import numpy as np

# Make the repository's ``nodes`` package importable.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import torch
import _audio_effects as ae

# Helper: compute the dominant frequency of a waveform using a real‑valued FFT.
def dominant_frequency(wav: torch.Tensor, sample_rate: int) -> float:
    """Return the frequency (Hz) of the strongest FFT bin of ``wav``.

    ``wav`` is expected to be a 1‑D tensor (mono) or have shape ``(channels, N)``.
    The function analyses the first channel only – the tests generate mono
    waveforms.
    """
    # Ensure a 1‑D tensor for the FFT.
    if wav.dim() == 2:
        wav = wav[0]
    # Compute one‑sided FFT.
    spec = torch.fft.rfft(wav.float())
    mags = torch.abs(spec)
    # Ignore the DC bin to avoid pathological silence cases.
    mags[0] = 0
    peak_bin = torch.argmax(mags).item()
    # Convert bin index to frequency.
    n = wav.shape[-1]
    return peak_bin * sample_rate / n


def test_output_length_approximately_input_divided_by_rate():
    sample_rate = 16000
    duration_s = 1.0
    t = torch.linspace(0, duration_s, steps=int(sample_rate * duration_s), dtype=torch.float32)
    wav = torch.sin(2 * math.pi * 440 * t).unsqueeze(0)  # (1, N)
    rate = 2.0  # Faster → shorter output.
    out = ae.time_stretch(wav, rate)
    # Expected length is input_len / rate.
    expected_len = wav.shape[-1] / rate
    # Allow a 5% tolerance (STFT framing can cause small deviations).
    rel_tol = 0.05
    assert math.isclose(out.shape[-1], expected_len, rel_tol=rel_tol)


def test_pitch_is_preserved_for_pure_tone():
    sample_rate = 16000
    freq = 440.0
    duration_s = 1.0
    t = torch.linspace(0, duration_s, steps=int(sample_rate * duration_s), dtype=torch.float32)
    wav = torch.sin(2 * math.pi * freq * t).unsqueeze(0)
    rate = 0.75  # Slower → longer output.
    out = ae.time_stretch(wav, rate)
    # Compute dominant frequencies of input and output (first channel).
    in_freq = dominant_frequency(wav, sample_rate)
    out_freq = dominant_frequency(out, sample_rate)
    # Frequencies should match within 2 Hz (tiny tolerance).
    assert math.isclose(in_freq, out_freq, abs_tol=2.0)


def test_rate_one_returns_near_identical_length():
    sample_rate = 16000
    t = torch.linspace(0, 1.0, steps=sample_rate, dtype=torch.float32)
    wav = torch.cos(2 * math.pi * 220 * t).unsqueeze(0)
    out = ae.time_stretch(wav, 1.0)
    assert math.isclose(out.shape[-1], wav.shape[-1], rel_tol=1e-5)


def test_stereo_preserves_channel_count():
    sample_rate = 16000
    t = torch.linspace(0, 1.0, steps=sample_rate, dtype=torch.float32)
    left = torch.sin(2 * math.pi * 300 * t)
    right = torch.sin(2 * math.pi * 600 * t)
    wav = torch.stack([left, right], dim=0)  # (2, N)
    out = ae.time_stretch(wav, 1.2)
    assert out.shape[0] == 2
    # Also check length scaling.
    expected_len = wav.shape[-1] / 1.2
    assert math.isclose(out.shape[-1], expected_len, rel_tol=0.05)


def test_all_zero_input_produces_all_zero_output():
    wav = torch.zeros(1, 1024, dtype=torch.float32)
    rate = 1.5
    out = ae.time_stretch(wav, rate)
    # Channel count should be preserved.
    assert out.shape[0] == wav.shape[0]
    # Length should follow input_length / rate.
    expected_len = wav.shape[-1] / rate
    assert math.isclose(out.shape[-1], expected_len, rel_tol=0.05)
    # Output should be all zeros.
    assert torch.allclose(out, torch.zeros_like(out))
    # Ensure no NaN/Inf.
    assert torch.isfinite(out).all()


def test_invalid_rate_returns_input_unchanged():
    sample_rate = 16000
    wav = torch.randn(1, 2048, dtype=torch.float32)
    # Zero rate.
    out_zero = ae.time_stretch(wav, 0.0)
    assert out_zero.shape == wav.shape
    assert torch.allclose(out_zero, wav)
    # Negative rate.
    out_neg = ae.time_stretch(wav, -0.5)
    assert out_neg.shape == wav.shape
    assert torch.allclose(out_neg, wav)

# Test harness – run when file is executed directly.
TESTS = [obj for name, obj in globals().items() if name.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        try:
            t()
            print(f"OK: {t.__name__}")
        except Exception as e:
            print(f"FAIL: {t.__name__}: {e}")
            raise
    print(f"\n{len(TESTS)} tests run")
