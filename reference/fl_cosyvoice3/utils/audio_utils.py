"""
Audio Utilities for FL CosyVoice3
Handles audio format conversions and processing
"""

import torch
import torchaudio
import soundfile as sf
import tempfile
import os
from typing import Dict, Any, Tuple, Optional


def comfyui_audio_to_tensor(audio: Dict[str, Any]) -> Tuple[torch.Tensor, int]:
    """
    Convert ComfyUI AUDIO format to tensor and sample rate

    Args:
        audio: ComfyUI audio dict {"waveform": tensor, "sample_rate": int}

    Returns:
        Tuple of (waveform_tensor, sample_rate)
    """
    waveform = audio['waveform']
    sample_rate = audio['sample_rate']

    return waveform, sample_rate


def tensor_to_comfyui_audio(waveform: torch.Tensor, sample_rate: int) -> Dict[str, Any]:
    """
    Convert tensor to ComfyUI AUDIO format

    Args:
        waveform: Audio tensor
        sample_rate: Sample rate in Hz

    Returns:
        ComfyUI audio dict
    """
    # Ensure waveform is on CPU
    if waveform.device != torch.device('cpu'):
        waveform = waveform.cpu()

    # Ensure proper shape [batch, channels, samples]
    if waveform.ndim == 1:
        # Mono, no batch -> [1, 1, samples]
        waveform = waveform.unsqueeze(0).unsqueeze(0)
    elif waveform.ndim == 2:
        # Either [channels, samples] or [batch, samples]
        # Assume [channels, samples] and add batch dim
        waveform = waveform.unsqueeze(0)

    return {
        "waveform": waveform,
        "sample_rate": sample_rate
    }


def save_audio_to_tempfile(waveform: torch.Tensor, sample_rate: int, suffix: str = ".wav") -> str:
    """
    Save audio tensor to a temporary file

    Args:
        waveform: Audio tensor [channels, samples] or [batch, channels, samples]
        sample_rate: Sample rate in Hz
        suffix: File suffix

    Returns:
        Path to temporary file
    """
    # Ensure waveform is on CPU
    if waveform.device != torch.device('cpu'):
        waveform = waveform.cpu()

    # Remove batch dimension if present
    if waveform.ndim == 3:
        waveform = waveform.squeeze(0)

    # Create temp file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = temp_file.name
    temp_file.close()

    # Save audio using soundfile directly (avoids torchaudio's torchcodec requirement)
    # soundfile expects shape (samples, channels), so transpose from (channels, samples)
    audio_np = waveform.cpu().numpy()
    if audio_np.ndim == 2:
        audio_np = audio_np.T  # (channels, samples) -> (samples, channels)
    sf.write(temp_path, audio_np, sample_rate)

    return temp_path


def load_audio_from_path(audio_path: str, target_sample_rate: Optional[int] = None) -> Dict[str, Any]:
    """
    Load audio file from path into ComfyUI AUDIO format

    Args:
        audio_path: Path to audio file
        target_sample_rate: Target sample rate (None to keep original)

    Returns:
        ComfyUI audio dict
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Load audio
    waveform, sample_rate = torchaudio.load(audio_path)

    # Resample if needed
    if target_sample_rate is not None and target_sample_rate != sample_rate:
        resampler = torchaudio.transforms.Resample(sample_rate, target_sample_rate)
        waveform = resampler(waveform)
        sample_rate = target_sample_rate

    # Convert to ComfyUI format
    return tensor_to_comfyui_audio(waveform, sample_rate)


def resample_audio(waveform: torch.Tensor, orig_sample_rate: int, target_sample_rate: int) -> torch.Tensor:
    """
    Resample audio tensor to target sample rate

    Args:
        waveform: Audio tensor
        orig_sample_rate: Original sample rate
        target_sample_rate: Target sample rate

    Returns:
        Resampled audio tensor
    """
    if orig_sample_rate == target_sample_rate:
        return waveform

    resampler = torchaudio.transforms.Resample(orig_sample_rate, target_sample_rate)
    return resampler(waveform)


def ensure_mono(waveform: torch.Tensor) -> torch.Tensor:
    """
    Convert audio to mono by averaging channels

    Args:
        waveform: Audio tensor [..., channels, samples]

    Returns:
        Mono audio tensor [..., 1, samples]
    """
    if waveform.shape[-2] == 1:
        return waveform

    # Average across channels
    return waveform.mean(dim=-2, keepdim=True)


def ensure_stereo(waveform: torch.Tensor) -> torch.Tensor:
    """
    Convert audio to stereo

    Args:
        waveform: Audio tensor [..., channels, samples]

    Returns:
        Stereo audio tensor [..., 2, samples]
    """
    if waveform.shape[-2] == 2:
        return waveform

    if waveform.shape[-2] == 1:
        # Duplicate mono to stereo
        return waveform.repeat(*([1] * (waveform.ndim - 2)), 2, 1)

    # Multiple channels - take first two
    return waveform[..., :2, :]


def normalize_audio(waveform: torch.Tensor, target_peak: float = 0.95) -> torch.Tensor:
    """
    Normalize audio to target peak amplitude

    Args:
        waveform: Audio tensor
        target_peak: Target peak amplitude (0.0 - 1.0)

    Returns:
        Normalized audio tensor
    """
    current_peak = waveform.abs().max()

    if current_peak > 0:
        waveform = waveform * (target_peak / current_peak)

    return waveform


def prepare_audio_for_cosyvoice(
    audio: Dict[str, Any],
    target_sample_rate: int = 16000,
    mono: bool = True
) -> Tuple[torch.Tensor, int, Optional[str]]:
    """
    Prepare ComfyUI audio for CosyVoice inference

    Args:
        audio: ComfyUI audio dict
        target_sample_rate: Target sample rate for CosyVoice
        mono: Convert to mono

    Returns:
        Tuple of (waveform, sample_rate, temp_file_path)
    """
    waveform, sample_rate = comfyui_audio_to_tensor(audio)

    # Remove batch dimension if present
    if waveform.ndim == 3:
        waveform = waveform.squeeze(0)

    # Convert to mono if needed
    if mono and waveform.shape[0] > 1:
        waveform = ensure_mono(waveform)

    # Resample if needed
    if sample_rate != target_sample_rate:
        waveform = resample_audio(waveform, sample_rate, target_sample_rate)
        sample_rate = target_sample_rate

    # Save to temp file (CosyVoice may expect file paths)
    temp_path = save_audio_to_tempfile(waveform, sample_rate)

    return waveform, sample_rate, temp_path


def save_raw_audio_to_tempfile(audio: Dict[str, Any]) -> str:
    """
    Save ComfyUI audio to temp file WITHOUT any processing.

    CosyVoice's load_wav() handles mono conversion and resampling internally,
    so we should NOT preprocess the audio.

    Args:
        audio: ComfyUI audio dict {"waveform": tensor, "sample_rate": int}

    Returns:
        Path to temporary file
    """
    waveform = audio['waveform']
    sample_rate = audio['sample_rate']

    # Remove batch dim if present
    if waveform.ndim == 3:
        waveform = waveform.squeeze(0)

    # Ensure CPU
    if waveform.device != torch.device('cpu'):
        waveform = waveform.cpu()

    # Save directly without any processing
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
    temp_path = temp_file.name
    temp_file.close()

    # soundfile expects (samples, channels) format
    audio_np = waveform.numpy()
    if audio_np.ndim == 2:
        audio_np = audio_np.T  # (channels, samples) -> (samples, channels)
    sf.write(temp_path, audio_np, sample_rate)

    return temp_path


def trim_leading_silence(
    wav: torch.Tensor,
    sample_rate: int,
    threshold_db: float = -35.0,
    min_sustain_ms: float = 30.0,
    max_trim_ms: float = 600.0,
    burst_max_ms: float = 320.0,
    burst_gap_ms: float = 50.0,
) -> Tuple[torch.Tensor, float]:
    """
    Strip leading onset artifacts CosyVoice sometimes produces before real
    speech starts -- a known characteristic of every fresh LLM decode, not
    specific to any one preset or mode (see COSYVOICE_ONSET_CLICK.md). Two
    shapes of artifact are handled:

      1. A brief click/stutter directly followed by near-silence before
         real speech begins (the original case this function handled).
      2. A short, isolated burst -- click, breath, whisper-gasp -- that is
         itself loud/long enough to look like "sustained speech" by a naive
         threshold check, but is followed by a real silence gap before the
         actual line content starts. Left alone, a naive "first window that
         sustains min_sustain_ms" check locks onto the burst itself and
         stops trimming right there, letting the artifact through.

    Algorithm: scan forward in 5ms windows, group into contiguous
    above-threshold "runs". Walk runs from the start; a run that starts at
    (or near) sample 0, is no longer than burst_max_ms, AND is followed by
    a silence gap of at least burst_gap_ms before the next run -- is
    treated as a parasitic burst and skipped over (cut point advances past
    the gap, to the start of the next run). This repeats as long as we keep
    finding burst-shaped runs, capped at max_trim_ms total. The first run
    that does NOT look like an isolated burst (i.e. real sustained speech,
    nothing but more speech after it) ends the scan -- everything before it
    is cut, nothing from it onward is touched.

    Returns (trimmed_wav, trimmed_ms).
    """
    win = max(1, int(sample_rate * 0.005))  # 5ms windows
    sustain_windows = max(1, int(round(min_sustain_ms / 5)))
    gap_windows = max(1, int(round(burst_gap_ms / 5)))
    max_trim_samples = int(sample_rate * max_trim_ms / 1000)
    burst_max_samples = int(sample_rate * burst_max_ms / 1000)

    flat = wav.reshape(-1).float()
    n = flat.shape[-1]
    # scan a bit past max_trim_ms so we can see whether a burst sitting
    # right at the edge of the budget is followed by a real gap or not
    scan_samples = min(n, max_trim_samples + burst_max_samples + gap_windows * win)
    n_win = scan_samples // win
    if n_win < sustain_windows:
        return wav, 0.0

    above = []
    for i in range(n_win):
        seg = flat[i * win:(i + 1) * win]
        rms = torch.sqrt(torch.mean(seg ** 2) + 1e-12)
        db = 20 * torch.log10(rms + 1e-9)
        above.append(bool(db > threshold_db))

    # collapse to runs of consecutive True windows: [(start_win, end_win), ...]
    runs = []
    run_start = None
    for i, a in enumerate(above):
        if a and run_start is None:
            run_start = i
        elif not a and run_start is not None:
            runs.append((run_start, i))
            run_start = None
    if run_start is not None:
        runs.append((run_start, len(above)))

    cut_sample = 0
    for idx, (rs, re_) in enumerate(runs):
        run_start_sample = rs * win
        run_dur_ms = (re_ - rs) * 5
        gap_to_next_windows = (runs[idx + 1][0] - re_) if idx + 1 < len(runs) else None

        is_leading_enough = run_start_sample <= win  # basically touches the very start
        is_burst_shaped = (run_dur_ms <= burst_max_ms) and (
            gap_to_next_windows is not None and gap_to_next_windows >= gap_windows
        )

        if idx == 0 and is_leading_enough and is_burst_shaped:
            # this run + the silence after it is parasitic; skip past it
            cut_sample = runs[idx + 1][0] * win if idx + 1 < len(runs) else re_ * win
            continue
        elif idx == 0 and not is_leading_enough:
            # real speech doesn't start at sample 0 -- just plain leading
            # silence before it, cut up to where it starts
            cut_sample = run_start_sample
            break
        elif idx > 0 and is_burst_shaped and run_start_sample <= cut_sample + win:
            # a second consecutive burst right after the one we just skipped
            cut_sample = runs[idx + 1][0] * win if idx + 1 < len(runs) else re_ * win
            continue
        else:
            # first non-burst run: this is real sustained speech, stop here
            if idx == 0:
                cut_sample = 0
            break

    cut_sample = min(cut_sample, max_trim_samples)
    if cut_sample <= 0:
        return wav, 0.0
    trimmed_ms = cut_sample / sample_rate * 1000
    return wav[..., cut_sample:], trimmed_ms


def normalize_loudness_rms(
    wav: torch.Tensor,
    target_rms_db: float = -20.0,
    peak_ceiling_db: float = -1.0,
) -> torch.Tensor:
    """
    Simple RMS-based loudness normalization: scales the whole clip so its
    RMS level matches target_rms_db, then clamps the gain so the result
    never exceeds peak_ceiling_db (no clipping). Evens out volume jumps
    between independently generated lines/speakers when applied per line,
    before concatenation. Pure torch, no external tool or extra dependency.
    """
    flat = wav.reshape(-1).float()
    rms = torch.sqrt(torch.mean(flat ** 2) + 1e-12)
    if rms < 1e-6:
        return wav  # near-silent clip (e.g. fully trimmed): nothing to normalize against

    target_rms = 10 ** (target_rms_db / 20.0)
    gain = target_rms / rms

    peak = flat.abs().max()
    peak_ceiling = 10 ** (peak_ceiling_db / 20.0)
    if peak * gain > peak_ceiling:
        gain = peak_ceiling / (peak + 1e-9)

    return wav * gain


def trim_trailing_silence(wav: torch.Tensor, sample_rate: int, max_trim_ms: float = 600.0, **kwargs) -> Tuple[torch.Tensor, float]:
    """
    Mirror of trim_leading_silence for the END of a clip instead of the
    start: flip the waveform, reuse the exact same leading-edge detection,
    flip the result back. Same artifact shape/threshold kwargs apply --
    see trim_leading_silence for the algorithm itself.

    Returns (trimmed_wav, trimmed_ms).
    """
    flipped = wav.flip(-1)
    trimmed_flipped, trimmed_ms = trim_leading_silence(flipped, sample_rate, max_trim_ms=max_trim_ms, **kwargs)
    return trimmed_flipped.flip(-1), trimmed_ms


def fade_edges(wav: torch.Tensor, sample_rate: int, fade_ms: float = 8.0) -> torch.Tensor:
    """
    Short linear fade-in and fade-out at the very start/end of a clip --
    smooths over the small click a hard cut can leave right after
    trim_leading_silence/trim_trailing_silence, or just softens a clip's
    natural edges before it gets concatenated next to another one.
    No-op if fade_ms <= 0 or the clip is shorter than twice the fade length.
    """
    if fade_ms <= 0:
        return wav
    n = wav.shape[-1]
    fade_samples = int(sample_rate * fade_ms / 1000)
    if fade_samples <= 0 or n < fade_samples * 2:
        return wav

    wav = wav.clone()
    ramp = torch.linspace(0.0, 1.0, fade_samples, dtype=wav.dtype, device=wav.device)
    wav[..., :fade_samples] *= ramp
    wav[..., -fade_samples:] *= ramp.flip(0)
    return wav


def save_wav(waveform: torch.Tensor, sample_rate: int, path: str) -> None:
    """
    Writes a waveform tensor straight to an exact path (no tempfile
    indirection) -- used by FL CosyVoice3 Audio Post-Process's per-line
    "_audio/lines/<script>/<index>.wav" files, which the line editor's
    re-voice-this-line feature reads back and re-stitches.
    """
    if waveform.device != torch.device("cpu"):
        waveform = waveform.cpu()
    if waveform.ndim == 3:
        waveform = waveform.squeeze(0)
    audio_np = waveform.numpy()
    if audio_np.ndim == 2:
        audio_np = audio_np.T  # (channels, samples) -> (samples, channels)
    sf.write(path, audio_np, sample_rate)


def cleanup_temp_file(temp_path: Optional[str]):
    """
    Clean up temporary audio file

    Args:
        temp_path: Path to temporary file
    """
    if temp_path and os.path.exists(temp_path):
        try:
            os.unlink(temp_path)
        except:
            pass
