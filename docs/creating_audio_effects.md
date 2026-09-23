# Creating audio effects for the TTS pipeline (CosyVoice3)

A guide to adding a new post-render effect (like `radio`, `phone`, `muffled`)
to this addon's VO Dub tooling. An "effect" is a creative DSP pass applied
**after** synthesis and cleanup, never baked into the TTS generation itself
— so the underlying clean take stays reusable if the effect is later changed
or removed.

## The two places every effect lives

Every effect exists **twice**, on purpose:

| | File | Runs when | Purpose |
|---|---|---|---|
| Real | `nodes/_audio_effects.py` | Render/Save | Actually processes the wav that gets written to disk (`audio_ru/<key>.wav`) |
| Preview | `src/vo_dub_editor/effect_preview.js` | Picking the effect in the UI | A live Web Audio approximation, heard instantly with no re-render |

The preview is **not** required to be bit-identical to the real effect — it
only has to sound "recognizably different in the right direction" for an
A/B listen. The file on disk only ever reflects what the Python side
actually computed.

## The shared-recipe pattern

Don't write a new effect from scratch if it's a variation on an existing
family. `radio`, `phone`, and `muffled` are all one shared recipe,
`_telephony_effect()`, called with different parameters:

```python
def _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level):
    voice = bandpass(wav, sample_rate, low_hz, high_hz)
    voice = soft_clip(voice, drive)
    if noise_level > 0:
        ...mix in band-limited static, scaled to the voice's own RMS...
    return voice
```

The building blocks it's made of, all in `nodes/_audio_effects.py`:

- **`bandpass(wav, sample_rate, low_hz, high_hz, taper_hz=150.0)`** — FFT-domain
  bandpass with a soft sigmoid taper on each edge (a hard brick-wall cutoff
  rings audibly; a taper doesn't).
- **`soft_clip(wav, drive=1.0)`** — tanh saturation. `drive <= 0` is a
  **true no-op** (returns `wav` unchanged) — this matters, see the pitfall
  below.
- **`band_limited_noise(shape, sample_rate, low_hz, high_hz, ...)`** — white
  noise filtered to the same band the voice uses, so static reads as
  "this channel's own noise," not room hiss.

**Order matters**: bandpass *then* clip, never the reverse — clipping the
full-band signal first generates harmonics across the whole spectrum, and a
bandpass applied afterward would let some of those harmonics back **into**
the passband from outside it.

If your new effect is a genuinely different *kind* of processing (not a
band/drive/noise variation), write it as its own function using `bandpass`/
`soft_clip`/`band_limited_noise` directly, or introduce a new primitive
alongside them if none of the existing ones fit.

## Step by step: adding a new effect

### 1. Python — the real effect (`nodes/_audio_effects.py`)

Write a function with this signature:

```python
def my_effect(
    wav: torch.Tensor,
    sample_rate: int,
    # ...your own tunable params, with sensible defaults...
) -> torch.Tensor:
    """One paragraph: what it sounds like, and why these particular
    parameter choices."""
    return _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level)
    # — or your own combination of bandpass/soft_clip/band_limited_noise —
```

Register it:

```python
EFFECTS = {
    "radio": radio_effect,
    "phone": phone_effect,
    "muffled": muffled_effect,
    "my_effect": my_effect,   # <-- add here
}
```

That's the *entire* backend wiring — `apply_named_effect(wav, sample_rate, name)`
already looks up the registry generically, and
`nodes/audio_post_process.py`'s `effect_override` input already calls
`apply_named_effect()` after trim/fade/normalize, before save. Nothing else
in the Python backend needs to change for a new effect.

**Verification**: there is no automated test for this file — it needs
`torch`, which isn't installed in the dev/test sandbox this repo's own test
suite runs in. The only mechanical check available there is:

```bash
python -m py_compile nodes/_audio_effects.py
```

Actual correctness (does it sound right) can only be verified by ear against
a real ComfyUI + ComfyUI-FL-CosyVoice3 install.

### 2. JavaScript — the live preview (`src/vo_dub_editor/effect_preview.js`)

Add a matching entry to `EFFECT_CHAINS`:

```js
const EFFECT_CHAINS = {
    radio: (ctx) => buildTelephonyChain(ctx, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0.05 }),
    phone: (ctx) => buildTelephonyChain(ctx, { lowHz: 300, highHz: 3400, drive: 1.05, noiseLevel: 0 }),
    muffled: (ctx) => buildTelephonyChain(ctx, { lowHz: 120, highHz: 6000, drive: 0, noiseLevel: 0 }),
    my_effect: (ctx) => buildTelephonyChain(ctx, { lowHz: ..., highHz: ..., drive: ..., noiseLevel: ... }),
};
```

`buildTelephonyChain` is the live-graph equivalent of `_telephony_effect` —
a highpass+lowpass `BiquadFilter` pair, an optional `WaveShaper` distortion,
an optional filtered-noise loop. Use the **same parameter values** as your
Python function's defaults so the preview and the real render agree.

If your effect isn't a telephony-family variant, build your own Web Audio
graph instead, returning `{ input, output }` (an entry node to connect the
voice source into, and an exit node to connect onward to the mix).

**Pitfall already hit once this session**: `drive <= 0` must **skip the
WaveShaper node entirely**, not just build a "gentle" curve for it.
`makeDistortionCurve(0)` normalizes by `Math.tanh(0) === 0`, and the `|| 1`
guard only rescues *that* division — every sample still maps through
`tanh(x * 0) = 0`, i.e. **total silence**. `buildTelephonyChain` already
guards this (`if (drive > 0) { ...build shaper... }`), but if you write a
custom graph for a non-telephony effect and use `drive`/distortion at all,
carry the same guard over.

### 3. UI — the Effect dropdown (`src/vo_dub_editor/VoDubLineEditor.vue`)

Add one line to `EFFECT_OPTIONS`:

```js
const EFFECT_OPTIONS = [
    { value: "", label: "No effect" },
    { value: "radio", label: "📻 Radio" },
    { value: "phone", label: "📞 Phone" },
    { value: "muffled", label: "🤫 Muffled" },
    { value: "my_effect", label: "🎛️ My Effect" },
];
```

Nothing else needs to change here — the whole pipeline (dropdown → live
preview → pending/dirty state → Save/Render → hash folding → Post-Process's
`effect_override`) is already generic over the effect *name*, never
hardcoded to a specific one.

## How it reaches the rendered file (for context)

1. User picks an effect in the dropdown → `onEffectPicked` previews it
   instantly via `effect_preview.js`, no I/O.
2. Clicking **Save** (or **Render/Re-render**) commits the pick into
   `_dub_state.json`'s `rows[audio_key].effect`, folded into the row's
   content hash as `\x00effect=<name>` (so a changed effect alone is enough
   to mark a row stale).
3. **Render** queues the graph with `effect_override` stamped onto every
   `FL_CosyVoice3_AudioPostProcess` node (`web/vo_dub_library.js`), which
   applies `apply_named_effect()` after its own trim/fade/normalize pass.
4. **Save on an already-rendered row** takes a faster path instead:
   `POST /vo_dub/apply_effect` reprocesses the row's own pre-effect
   reference copy (`_dub_dry/<key>.wav`) with the new effect and overwrites
   `audio_ru/<key>.wav` directly — no TTS re-synthesis, no graph run.

## Checklist for a new effect

- [ ] Python function in `nodes/_audio_effects.py`, added to `EFFECTS`
- [ ] `python -m py_compile nodes/_audio_effects.py` passes
- [ ] Matching entry in `effect_preview.js`'s `EFFECT_CHAINS`, same
      parameter values as the Python defaults
- [ ] If using distortion/drive: confirmed `drive <= 0` is a true no-op on
      **both** sides
- [ ] New option in `VoDubLineEditor.vue`'s `EFFECT_OPTIONS`
- [ ] Docstring explaining what it sounds like and why these parameters
- [ ] Listened to it for real in ComfyUI (this can't be verified any other way)
