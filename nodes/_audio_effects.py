"""
Post-synthesis audio EFFECTS -- distinct from _audio_utils.py's cleanup
pass (trim/fade/normalize, always applied to every clip). An effect is an
optional, per-line CREATIVE choice (radio/telephone/PA speaker, ...),
meant to run AFTER that cleanup on an already-clean take -- not baked
into the TTS generation itself, so the clean take stays re-usable if the
effect is later changed or removed.

This module is deliberately just the DSP recipes -- pure functions, no
I/O, no idea what an "effect catalog" or a per-line UI field even is (that
design is a separate step: where recipes like radio_effect() get named,
parameterized per _effects.json entry, and wired into a node). Every
function here takes/returns a torch.Tensor shaped like _audio_utils' own
wav tensors (arbitrary leading batch/channel dims, time last) plus a
sample_rate, following that module's own conventions so the two compose
directly in a processing chain.

NOTE: this file needs torch, which isn't installed in this repo's own dev/
test environment (only inside a real ComfyUI + FL-CosyVoice3 install) --
same as _audio_utils.py and audio_post_process.py, neither of which has
automated test coverage here either. Verify by ear against a real ComfyUI
instance; there is no nodes/tests/test_audio_effects.py for that reason.
"""
import math
from typing import Tuple

import torch


def _smooth_bandpass_mask(freqs: torch.Tensor, low_hz: float, high_hz: float, taper_hz: float = 150.0) -> torch.Tensor:
    """A soft-edged bandpass gain curve over `freqs` (values in [0, 1], one
    per FFT bin) -- a hard brick-wall cutoff rings (Gibbs phenomenon),
    audible as a metallic ripple riding on the voice; a sigmoid taper on
    each edge rolls off smoothly instead, closer to how an actual radio's
    analog IF filter behaves, and cheap to compute (no filter-order/
    stability concerns the way a biquad or FIR design would have)."""
    low_edge = torch.sigmoid((freqs - low_hz) / taper_hz)
    high_edge = torch.sigmoid((high_hz - freqs) / taper_hz)
    return low_edge * high_edge


def bandpass(wav: torch.Tensor, sample_rate: int, low_hz: float, high_hz: float, taper_hz: float = 150.0) -> torch.Tensor:
    """FFT-domain bandpass: attenuates everything outside [low_hz, high_hz]
    with a smooth taper (see _smooth_bandpass_mask). Operates along the
    last dimension -- any leading batch/channel dims pass through
    untouched, same convention as _audio_utils.py's trim/fade functions."""
    n = wav.shape[-1]
    spec = torch.fft.rfft(wav.float(), dim=-1)
    freqs = torch.fft.rfftfreq(n, d=1.0 / sample_rate).to(wav.device)
    mask = _smooth_bandpass_mask(freqs, low_hz, high_hz, taper_hz)
    return torch.fft.irfft(spec * mask, n=n, dim=-1).to(wav.dtype)


def soft_clip(wav: torch.Tensor, drive: float = 1.0) -> torch.Tensor:
    """tanh soft-clip/saturation for that compressed, slightly gritty radio-
    AGC quality. `drive` <= 1 barely touches typical -1..1 audio (near
    identity); `drive` > 1 pushes progressively more of the waveform into
    the curve's compressed region. Dividing by tanh(drive) keeps the
    output from quietly shrinking in level as drive increases on already-
    modest material."""
    if drive <= 0:
        return wav
    # math.tanh (a plain Python float), not torch.tanh(torch.tensor(...)) --
    # a 0-dim CPU tensor divided into a GPU wav tensor would raise a
    # cross-device error; a plain float divides into any device/dtype fine.
    return torch.tanh(wav * drive) / math.tanh(drive)


def band_limited_noise(
    shape: Tuple[int, ...],
    sample_rate: int,
    low_hz: float,
    high_hz: float,
    device=None,
    dtype=None,
) -> torch.Tensor:
    """White noise passed through the same bandpass window an effect's
    voice uses -- so the static this produces sits in the same "radio
    band" as the voice, not a broadband hiss that would read as room noise
    instead of a channel's own static. Unscaled (RMS ~ arbitrary) -- the
    caller matches its level to the voice's own RMS, see radio_effect."""
    noise = torch.randn(shape, device=device, dtype=dtype)
    return bandpass(noise, sample_rate, low_hz, high_hz)


def _telephony_effect(
    wav: torch.Tensor,
    sample_rate: int,
    low_hz: float,
    high_hz: float,
    drive: float,
    noise_level: float,
) -> torch.Tensor:
    """
    Shared recipe behind both radio_effect() and phone_effect() -- a
    band-limited, (optionally) distorted, (optionally) noisy voice. Only
    the four parameters differ between the two; the ORDER never should
    (see below), so it lives in one place both call into.

    Recipe, in order (order matters):
      1. bandpass -- the passband that gives this its "coming through a
         channel" quality in the first place.
      2. soft_clip -- the compressed/gritty AGC quality. Deliberately
         AFTER bandpass, not before: clipping the full-band signal first
         generates harmonics across the whole spectrum, and a bandpass
         applied afterward would let some of those harmonics back INTO the
         passband from outside it (the distortion's own overtones
         aliasing back in) -- filtering first means soft_clip only ever
         distorts what's already inside the channel's own bandwidth.
      3. band-limited static, mixed in at `noise_level` fraction of the
         processed voice's own RMS (not the noise's raw amplitude, which
         has no fixed relationship to how loud the voice ended up after
         bandpass+clip) -- so the same noise_level reads as roughly the
         same "static-to-voice" balance regardless of how loud the
         original line was.

    `noise_level` <= 0 skips the static step entirely.
    """
    voice = bandpass(wav, sample_rate, low_hz, high_hz)
    voice = soft_clip(voice, drive)

    if noise_level > 0:
        voice_rms = torch.sqrt(torch.mean(voice.float() ** 2) + 1e-12)
        noise = band_limited_noise(voice.shape, sample_rate, low_hz, high_hz, device=voice.device, dtype=voice.dtype)
        noise_rms = torch.sqrt(torch.mean(noise.float() ** 2) + 1e-12)
        if noise_rms > 1e-9:
            noise = noise * (voice_rms * noise_level / noise_rms)
        voice = voice + noise

    return voice


def radio_effect(
    wav: torch.Tensor,
    sample_rate: int,
    low_hz: float = 400.0,
    high_hz: float = 2800.0,
    drive: float = 1.6,
    noise_level: float = 0.03,
) -> torch.Tensor:
    """
    Walkie-talkie / two-way-radio voice -- a narrow, obviously "coming
    through a radio" passband, heavy compressed/gritty AGC-style clipping,
    and audible channel static. Deliberately the AGGRESSIVE end of the
    telephony-effect family; see phone_effect() for the "good landline
    call" end of it, and _telephony_effect()'s own docstring for the
    shared recipe/ordering both are built from.
    """
    return _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level)


def phone_effect(
    wav: torch.Tensor,
    sample_rate: int,
    low_hz: float = 300.0,
    high_hz: float = 3400.0,
    drive: float = 1.05,
    noise_level: float = 0.0,
) -> torch.Tensor:
    """
    Good-quality phone call -- the standard 300-3400Hz telephone passband
    (wider than radio_effect's own narrower, grittier band), only a hair
    of soft-clip (drive just above 1.0: a good connection reads as
    band-limited, not distorted), and no static by default (a clean call
    doesn't have channel noise -- pass a small noise_level if a slightly
    worse line is wanted). Meant to be the gentle, "clear call" end of the
    telephony-effect family, next to radio_effect's aggressive walkie-
    talkie end -- see _telephony_effect()'s own docstring for the shared
    recipe/ordering both are built from.
    """
    return _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level)


def muffled_effect(
    wav: torch.Tensor,
    sample_rate: int,
    low_hz: float = 120.0,
    high_hz: float = 6000.0,
    drive: float = 0.0,
    noise_level: float = 0.0,
) -> torch.Tensor:
    """
    A natural, non-telephony "muffled" quality -- a voice heard through a
    thin barrier (a mask, a door, a hand cupped near the mic), NOT a
    channel effect: `drive=0` skips soft_clip entirely (bandpass() itself
    returns `wav` unchanged when drive<=0, so this has none of
    radio/phone's compressed/gritty AGC quality) and there's no static.
    The passband is far WIDER than phone_effect's own 300-3400Hz (120Hz to
    6000Hz) -- most of a voice's natural low-end body survives, only the
    extreme rumble and the top-end sibilance/"air" get rolled off, which
    is what reads as "muffled but still clear" rather than "coming through
    a device". Tuned by inspecting the FFT of Observation's own
    Loc_E1_S10b_Ellie5Alt.wav (an in-fiction muffled delivery) against
    neighboring plain lines: that file carries almost no energy below
    ~300Hz and measurably less above ~6kHz -- a single-line comparison is
    noisy (speech content varies a lot line to line, so this is a starting
    point to tune by ear, not a precise spectral match).
    """
    return _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level)


def radio_dry_effect(
    wav: torch.Tensor,
    sample_rate: int,
    low_hz: float = 400.0,
    high_hz: float = 2800.0,
    drive: float = 1.6,
    noise_level: float = 0.0,
) -> torch.Tensor:
    """
    radio_effect's passband and grit with NO static of its own -- for
    dubbing a game that already plays its own channel noise as a separate
    sound layered over the line.

    Observation is exactly that case: its dialogue bank holds the voice
    alone, and the SFX bank next to it carries RadioStatic, RadioStatic2,
    RadioStaticTalkLoop2, SpeakerphoneCrackle1/2 and StaticNoise1/2 as
    independent samples, triggered by their own FMOD events
    (SFX_RadioStatic, SFX_RadioStaticIntro, SFX_RadioStaticIntroVA). Using
    radio_effect there would bake a SECOND layer of static into the file
    and the two would stack at playback. Measuring the shipped lines backs
    this up: the ground-control radio lines are not band-limited at all in
    the file itself (full low end intact), so the "radio" quality is
    entirely runtime -- which is what this effect reproduces for a dub,
    minus the part the game still adds by itself.
    """
    return _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level)


def intercom_effect(
    wav: torch.Tensor,
    sample_rate: int,
    low_hz: float = 250.0,
    high_hz: float = 4000.0,
    drive: float = 1.2,
    noise_level: float = 0.0,
) -> torch.Tensor:
    """
    A hard-wired intercom/PA panel -- someone a few rooms away talking
    through the building's own speaker. Sits deliberately between
    phone_effect and radio_effect: wider than the telephone band at both
    ends (250-4000Hz, so it keeps some chest and some consonant edge a
    phone line would lose), with more grit than phone's near-transparent
    1.05 but well short of radio's aggressive 1.6. No static -- a wired
    intercom's character is the cheap speaker and the small-signal
    compression, not channel noise.
    """
    return _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level)


def suit_effect(
    wav: torch.Tensor,
    sample_rate: int,
    low_hz: float = 150.0,
    high_hz: float = 5000.0,
    drive: float = 0.6,
    noise_level: float = 0.0,
) -> torch.Tensor:
    """
    A voice inside a sealed helmet -- close, boxed-in, slightly pressed.
    Wider and far gentler than any of the channel effects: the low end is
    mostly kept (150Hz, so the voice stays bodied rather than thinned the
    way a phone band thins it), only the top "air" is rolled off by the
    visor, and `drive` below 1.0 stays in soft_clip's near-identity region
    -- just enough to suggest a small enclosed volume without reading as
    distortion. Distinct from muffled_effect, which is a barrier BETWEEN
    the listener and the voice; this one is the voice's own enclosure.
    """
    return _telephony_effect(wav, sample_rate, low_hz, high_hz, drive, noise_level)


# Named-effect registry -- the one place a per-line "effect" selector (see
# nodes/audio_post_process.py's effect_override input, and
# VoDubLineEditor.vue's own Effect dropdown) resolves a short name to an
# actual recipe. Deliberately just a name -> function map, no
# _effects.json catalog yet (that's a later step for per-project custom
# parameters).
EFFECTS = {
    "radio": radio_effect,
    "phone": phone_effect,
    "muffled": muffled_effect,
    "radio_dry": radio_dry_effect,
    "intercom": intercom_effect,
    "suit": suit_effect,
}


def apply_named_effect(wav: torch.Tensor, sample_rate: int, name: str) -> torch.Tensor:
    """Looks `name` up in EFFECTS and applies it -- unknown/empty names are
    a no-op (returns `wav` unchanged) rather than an error, since an older
    saved `_dub_state.json` row naming a since-removed effect shouldn't
    break rendering."""
    effect = EFFECTS.get(name)
    return effect(wav, sample_rate) if effect else wav
