"""
Vendored subset of FL CosyVoice3's utils/audio_utils.py -- just the
functions audio_post_process.py actually needs (onset trim, fade,
loudness normalization, tensor<->ComfyUI-AUDIO conversion, exact-path wav
write). Copied rather than imported across package boundaries: this addon
lives in its own custom_nodes folder, separate from FL-CosyVoice3's, so a
relative import reaching into that other package would break the moment
either package's internal layout changes, or if FL-CosyVoice3 isn't
installed at all in a given ComfyUI instance (you'd still want a clear
Python error, not a silent one from renamed internals). Keep in sync with
FL-CosyVoice3's copy by hand if its trim/fade/normalize behavior changes.
"""

from typing import Any, Dict, Tuple

import torch
import soundfile as sf


def tensor_to_comfyui_audio(waveform: torch.Tensor, sample_rate: int) -> Dict[str, Any]:
    """Convert tensor to ComfyUI AUDIO format."""
    if waveform.device != torch.device("cpu"):
        waveform = waveform.cpu()

    if waveform.ndim == 1:
        waveform = waveform.unsqueeze(0).unsqueeze(0)
    elif waveform.ndim == 2:
        waveform = waveform.unsqueeze(0)

    return {"waveform": waveform, "sample_rate": sample_rate}


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
    specific to any one preset or mode. Two shapes of artifact are handled:

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

        is_leading_enough = run_start_sample <= win
        is_burst_shaped = (run_dur_ms <= burst_max_ms) and (
            gap_to_next_windows is not None and gap_to_next_windows >= gap_windows
        )

        if idx == 0 and is_leading_enough and is_burst_shaped:
            cut_sample = runs[idx + 1][0] * win if idx + 1 < len(runs) else re_ * win
            continue
        elif idx == 0 and not is_leading_enough:
            cut_sample = run_start_sample
            break
        elif idx > 0 and is_burst_shaped and run_start_sample <= cut_sample + win:
            cut_sample = runs[idx + 1][0] * win if idx + 1 < len(runs) else re_ * win
            continue
        else:
            if idx == 0:
                cut_sample = 0
            break

    cut_sample = min(cut_sample, max_trim_samples)
    if cut_sample <= 0:
        return wav, 0.0
    trimmed_ms = cut_sample / sample_rate * 1000
    return wav[..., cut_sample:], trimmed_ms


def save_wav(waveform: torch.Tensor, sample_rate: int, path: str) -> None:
    """Writes a waveform tensor straight to an exact path (no tempfile
    indirection) -- used for per-line
    _audio/lines/<script>/<position>_<version>_<hash>.wav files (see
    nodes/_line_audio.py)."""
    if waveform.device != torch.device("cpu"):
        waveform = waveform.cpu()
    if waveform.ndim == 3:
        waveform = waveform.squeeze(0)
    audio_np = waveform.numpy()
    if audio_np.ndim == 2:
        audio_np = audio_np.T
    sf.write(path, audio_np, sample_rate)
