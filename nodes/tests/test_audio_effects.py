"""
Plain-Python tests for nodes/_audio_effects.speed_ratio_for_match.

The pure function computes how much a dubbed Russian take must be sped up or
slowed down to match the length of the original English take.
"""

import sys
import os
import types

# Ensure the repository's ``nodes`` package is importable.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Stub heavy third‑party imports that ``_audio_effects.py`` pulls in at import time.
# It imports ``torch`` at module level and refers to ``torch.Tensor`` in type
# annotations. The dummy module therefore needs a ``Tensor`` attribute – a simple
# placeholder class is sufficient because the tests never use any torch
# functionality.
for name in ("torch",):
    if name not in sys.modules:
        mod = types.ModuleType(name)
        # Provide a minimal ``Tensor`` attribute to satisfy type annotations.
        mod.Tensor = type("Tensor", (object,), {})
        sys.modules[name] = mod

# Import the module under test. ``speed_ratio_for_match`` is currently missing –
# the test suite is intentionally written to fail until the implementation is
# added.
import _audio_effects as ae


def test_normal_case_returns_ru_divided_by_en():
    en = 1.5
    ru = 2.0
    expected = ru / en
    assert ae.speed_ratio_for_match(en, ru) == expected


def test_ratio_is_clamped_to_upper_bound_when_too_large():
    # Ratio would be 4.0, but spec caps at 2.0.
    en = 0.5
    ru = 2.0
    assert ae.speed_ratio_for_match(en, ru) == 2.0


def test_ratio_is_clamped_to_lower_bound_when_too_small():
    # Ratio would be 0.25, but spec floors at 0.5.
    en = 2.0
    ru = 0.5
    assert ae.speed_ratio_for_match(en, ru) == 0.5


def test_missing_durations_return_default_ratio():
    assert ae.speed_ratio_for_match(None, 2.0) == 1.0
    assert ae.speed_ratio_for_match(1.0, None) == 1.0
    assert ae.speed_ratio_for_match(None, None) == 1.0


def test_zero_or_negative_durations_return_default_ratio():
    assert ae.speed_ratio_for_match(0, 2.0) == 1.0
    assert ae.speed_ratio_for_match(2.0, 0) == 1.0
    assert ae.speed_ratio_for_match(-1.0, 2.0) == 1.0
    assert ae.speed_ratio_for_match(1.5, -2.0) == 1.0

# Collect and run tests when executed directly (mirrors the style of other test files).
TESTS = [v for k, v in globals().items() if k.startswith("test_")]

if __name__ == "__main__":
    for t in TESTS:
        try:
            t()
            print(f"OK: {t.__name__}")
        except Exception as e:
            print(f"FAIL: {t.__name__}: {e}")
            raise
    print(f"\n{len(TESTS)} tests run")
