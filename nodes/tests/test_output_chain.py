"""
Tests for the `apply_output_chain` function in `nodes/_audio_effects.py`.

The function is not yet implemented, so these tests should initially fail with an
`AttributeError` indicating that `apply_output_chain` is missing. The tests are
written in the same style as the existing plain‑Python test files in this
repository.
"""

import os
import sys
import math
import types

# Make the repository's ``nodes`` package importable.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ---------------------------------------------------------------------------
# Clean up any stub ``torch`` that other tests may have installed earlier.
# ---------------------------------------------------------------------------
if "torch" in sys.modules:
    del sys.modules["torch"]
if "_audio_effects" in sys.modules:
    del sys.modules["_audio_effects"]

# Import the real ``torch`` library from the project's virtual environment.
import torch  # type: ignore  # noqa: E402

# Import the module under test – it will see the real ``torch``.
import _audio_effects as ae  # noqa: E402

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _make_sine_wave(freq_hz: float, sample_rate: int, duration_s: float) -> torch.Tensor:
    """Return a mono sine wave tensor of shape ``(1, N)``.

    The output is a ``torch.float32`` tensor with values in ``[-1, 1]``.
    """
    t = torch.linspace(0.0, duration_s, steps=int(sample_rate * duration_s), dtype=torch.float32)
    wav = torch.sin(2 * math.pi * freq_hz * t).unsqueeze(0)  # (1, N)
    return wav

# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

def test_defaults_are_noop_and_do_not_mutate_input():
    """Calling ``apply_output_chain`` with default arguments must return a tensor
    that is exactly equal to the input – same shape, dtype and values – and must
    not modify the original tensor.
    """
    sample_rate = 16000
    wav = _make_sine_wave(440, sample_rate, 1.0)
    wav_clone = wav.clone()
    out = ae.apply_output_chain(wav, sample_rate)
    # Unchanged: shape, dtype and values.
    assert out.shape == wav.shape
    assert out.dtype == wav.dtype
    assert torch.allclose(out, wav)
    # Input not mutated.
    assert torch.allclose(wav, wav_clone)


def test_effect_alone_matches_apply_named_effect():
    """When ``effect`` is a non‑empty string the output must be identical to the
    result of ``apply_named_effect`` called with the same arguments.
    """
    sample_rate = 16000
    wav = _make_sine_wave(440, sample_rate, 1.0)
    effect_name = "phone"  # deterministic – ``noise_level`` = 0
    expected = ae.apply_named_effect(wav, sample_rate, effect_name)
    out = ae.apply_output_chain(wav, sample_rate, effect=effect_name)
    assert out.shape == expected.shape
    assert torch.allclose(out, expected)


def test_normalize_alone_matches_normalize_loudness():
    """When ``normalize=True`` and ``effect`` is empty, the output must be the
    same as ``normalize_loudness`` applied directly.
    """
    sample_rate = 16000
    # Use a quiet signal to ensure the normaliser applies a noticeable gain.
    t = torch.linspace(0.0, 1.0, steps=sample_rate, dtype=torch.float32)
    wav = (0.01 * torch.sin(2 * math.pi * 440 * t)).unsqueeze(0)
    expected = ae.normalize_loudness(wav)
    out = ae.apply_output_chain(wav, sample_rate, normalize=True)
    assert out.shape == wav.shape
    assert out.dtype == wav.dtype
    assert torch.allclose(out, expected)


def test_speed_alone_matches_time_stretch():
    """When ``speed`` is not ``1.0`` and the other flags are at defaults the
    result must be exactly what ``time_stretch`` returns.
    """
    sample_rate = 16000
    wav = _make_sine_wave(440, sample_rate, 1.0)
    speed = 1.5
    expected = ae.time_stretch(wav, speed)
    out = ae.apply_output_chain(wav, sample_rate, speed=speed)
    assert out.shape == expected.shape
    assert torch.allclose(out, expected)


def test_order_normalize_then_speed_is_pinned():
    """With both ``normalize`` and ``speed`` enabled the function must apply
    normalisation **before** time‑stretching. The output must equal
    ``time_stretch(normalize_loudness(wav), speed)`` and must differ from the
    reverse order.
    """
    sample_rate = 16000
    wav = _make_sine_wave(440, sample_rate, 1.0) * 0.2  # non‑zero amplitude
    speed = 0.75
    out = ae.apply_output_chain(wav, sample_rate, normalize=True, speed=speed)
    expected = ae.time_stretch(ae.normalize_loudness(wav), speed)
    assert out.shape == expected.shape
    assert torch.allclose(out, expected)
    # The reverse order should not be identical for a non‑trivial signal.
    reverse_expected = ae.normalize_loudness(ae.time_stretch(wav, speed))
    assert not torch.allclose(out, reverse_expected)


def test_all_zero_input_stays_finite():
    """All‑zero input combined with any non‑default arguments must never produce
    ``NaN`` or ``inf`` values. The result should remain all zeros.
    """
    sample_rate = 16000
    wav = torch.zeros(1, 1024, dtype=torch.float32)
    out = ae.apply_output_chain(
        wav,
        sample_rate,
        effect="phone",
        normalize=True,
        speed=2.0,
    )
    assert torch.isfinite(out).all()
    # Verify channel count preserved.
    assert out.shape[0] == wav.shape[0]
    # Length should follow input_length / speed (2.0).
    assert out.shape[1] == wav.shape[1] // 2
    # Output should be all zeros.
    assert torch.allclose(out, torch.zeros_like(out))


def test_input_tensor_is_not_mutated_when_all_steps_used():
    """Run the function with all three steps enabled and verify the original
    tensor has not been altered.
    """
    sample_rate = 16000
    wav = _make_sine_wave(440, sample_rate, 1.0) * 0.3
    wav_clone = wav.clone()
    _ = ae.apply_output_chain(
        wav, sample_rate, effect="phone", normalize=True, speed=0.5
    )
    assert torch.allclose(wav, wav_clone)

# ---------------------------------------------------------------------------
# Test harness – run the tests when the file is executed directly.
# ---------------------------------------------------------------------------
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