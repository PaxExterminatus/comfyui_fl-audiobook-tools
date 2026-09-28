"""
Direct FL-CosyVoice3 invocation, no ComfyUI involved -- module form of
tts_prototype.py's already-proven call sequence (saved-preset + instruct2),
reusable by server.py's /fl_cosyvoice3/render/line route.

Nothing here imports torch/cosyvoice at module level, so this file stays
importable even on a system Python without the ML stack -- the actual heavy
imports happen lazily inside _get_model()/synthesize(), matching the
lazy-import-and-gracefully-error posture server.py already uses for
stitch_lines/apply_effect. The loaded model is cached across calls (keyed
by model_dir) since loading it is slow and a fresh HTTP request per line
would otherwise reload it every time.
"""
import os
import sys

FL_COSYVOICE3_DIR = r"C:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\comfyui_fl-cosyvoice3"

SYSTEM_PROMPT = "You are a helpful assistant."
ENDOFPROMPT = "<|endofprompt|>"

_model_cache = {}


def _format_instruct(instruct_text, is_v3):
    """Ported from speaker_instruct2_dialog.py's _format_instruct (same as tts_prototype.py)."""
    raw = (instruct_text or "").strip()
    # Remove any existing wrapper to avoid duplication
    if raw.startswith(SYSTEM_PROMPT):
        raw = raw[len(SYSTEM_PROMPT):].lstrip("\n")
    if raw.endswith(ENDOFPROMPT):
        raw = raw[:-len(ENDOFPROMPT)].rstrip()
    if is_v3:
        return SYSTEM_PROMPT + "\n" + raw + ENDOFPROMPT
    return f"{raw}{ENDOFPROMPT}"


def _find_model_dir(models_dir):
    cosyvoice_models_root = os.path.join(models_dir, "cosyvoice")
    config_names = ("cosyvoice.yaml", "cosyvoice3.yaml", "cosyvoice2.yaml")
    if os.path.isdir(cosyvoice_models_root):
        for root, _dirs, files in os.walk(cosyvoice_models_root):
            if any(c in files for c in config_names):
                return root
    return None


def _get_model(models_dir):
    model_dir = _find_model_dir(models_dir)
    if not model_dir:
        raise FileNotFoundError(
            f"no downloaded CosyVoice model config found under {os.path.join(models_dir, 'cosyvoice')}"
        )
    if model_dir in _model_cache:
        return _model_cache[model_dir]

    if FL_COSYVOICE3_DIR not in sys.path:
        sys.path.insert(0, FL_COSYVOICE3_DIR)
    import torch
    from cosyvoice.cli.cosyvoice import AutoModel

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = AutoModel(model_dir=model_dir, load_trt=False, fp16=False)
    is_v3 = "cosyvoice3" in model_dir.lower() or "fun-cosyvoice3" in model_dir.lower()
    entry = {"model": model, "is_v3": is_v3, "device": device}
    _model_cache[model_dir] = entry
    return entry


def synthesize(models_dir, speaker_dir, preset_name, instruct_text, tts_text, out_path, seed=None, reference_audio_path=None):
    """Faithful port of speaker_instruct2_dialog.py's saved-preset + instruct2 path.
    Returns (duration_s, sample_rate). Raises FileNotFoundError/ImportError/RuntimeError
    on failure -- callers turn those into JSON error responses.

    `seed`, when given, is applied via torch.manual_seed/random.seed/
    torch.cuda.manual_seed_all right before inference -- the exact same
    global-RNG-seeding posture speaker_instruct2_dialog.py's node already
    uses (confirmed by reading the vendored cosyvoice package: the
    non-streaming flow-matching decoder draws fresh torch.randn_like noise
    per call, and LLM token sampling uses torch.multinomial, both gated by
    this global state at call time -- there is no seed kwarg on
    inference_instruct2 itself). None means "whatever the process's current
    RNG state happens to be" -- unseeded, non-reproducible, same as before
    this parameter existed.

    If `reference_audio_path` is provided and points to a valid audio file,
    it will be used as the prompt audio for zero-shot voice cloning,
    and `preset_name` will be ignored (can be empty). Otherwise, the
    function behaves as before: loads the speaker preset and uses zero_shot_spk_id.
    """
    import random
    import torch
    import soundfile as sf

    # Determine if we are using reference audio (original sample)
    use_reference = bool(reference_audio_path and os.path.isfile(reference_audio_path))

    if not use_reference:
        # Original behavior: load speaker preset
        preset_path = os.path.join(speaker_dir or "", f"{preset_name}.pt")
        if not os.path.isfile(preset_path):
            raise FileNotFoundError(f"no saved speaker preset: {preset_path}")
    else:
        # When using reference audio, we don't need a preset
        preset_path = None

    entry = _get_model(models_dir)
    model = entry["model"]
    is_v3 = entry["is_v3"]
    device = entry["device"]
    sample_rate = model.sample_rate

    if seed is not None:
        random.seed(seed)
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)

    if use_reference:
        # `prompt_wav` is a PATH, not audio data: CosyVoice's own
        # frontend_zero_shot loads it itself (three times, at two different
        # sample rates -- load_wav(prompt_wav, 16000) for the speech token and
        # the speaker embedding, load_wav(prompt_wav, 24000) for the speech
        # feature, see cosyvoice/cli/frontend.py), and load_wav() is a thin
        # wrapper over soundfile.read(). Handing it a preloaded tensor instead
        # made soundfile try to parse a raw float buffer as an audio file,
        # which surfaces as unattributable libsndfile chunk errors.
        prompt_wav = reference_audio_path
        # Empty string, NOT None: frontend_zero_shot only takes the
        # prompt_wav branch when `zero_shot_spk_id == ''` -- any other value,
        # None included, falls through to `self.spk2info[zero_shot_spk_id]`
        # and raises KeyError. '' is also inference_instruct2's own default.
        spk_id = ""
        spk2info = None  # not used
        prompt_wav_length = None
    else:
        # Load speaker preset as before. A preset that exists but isn't a real
        # torch archive (a leftover placeholder, a truncated download) fails
        # deep inside pickle with an unattributable message -- "could not find
        # MARK" names neither the file nor the reason -- so name both here.
        try:
            spk2info = torch.load(preset_path, map_location=device, weights_only=False)
        except Exception as e:
            size = os.path.getsize(preset_path) if os.path.isfile(preset_path) else 0
            raise RuntimeError(
                f"speaker preset is not a valid torch file: {preset_path} "
                f"({size} bytes) -- re-create this preset. Underlying error: {e}"
            )
        spk_id = next(iter(spk2info))
        model.frontend.spk2info = spk2info
        prompt_wav = None
        prompt_wav_length = None

    formatted_instruct = _format_instruct(instruct_text, is_v3)
    prompt_text_token, prompt_text_token_len = model.frontend._extract_text_token(formatted_instruct)

    if use_reference:
        # When using reference audio, we need to set the prompt_text in the model's frontend?
        # Actually, the reference audio path is used via prompt_wav, and the instruct_text is still used.
        # The model's frontend.spk2info is not used in this case.
        # We do not need to overwrite prompt_text in spk2info because we are not using spk2info.
        pass
    else:
        # Overwrite prompt_text in spk2info with the formatted instruct tokens.
        # This is necessary because frontend_zero_shot ignores instruct_text when
        # zero_shot_spk_id is provided, using the .pt data directly instead.
        model.frontend.spk2info[spk_id]["prompt_text"] = prompt_text_token
        model.frontend.spk2info[spk_id]["prompt_text_len"] = prompt_text_token_len

    output = model.inference_instruct2(
        tts_text=tts_text,
        instruct_text=formatted_instruct,
        prompt_wav=prompt_wav,
        zero_shot_spk_id=spk_id,
        stream=False,
        speed=1.0,
        text_frontend=True,
    )

    # Collect all output chunks
    all_speech = []
    chunk_count = 0
    for chunk in output:
        chunk_count += 1
        all_speech.append(chunk["tts_speech"])

    if not all_speech:
        raise RuntimeError("No audio was generated. Check model and inputs.")

    if len(all_speech) > 1:
        waveform = torch.cat(all_speech, dim=-1)
    else:
        waveform = all_speech[0]

    if waveform.device != torch.device("cpu"):
        waveform = waveform.cpu()

    # Save the audio
    out_dir = os.path.dirname(out_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    sf.write(out_path, waveform.numpy().T if waveform.ndim > 1 else waveform.numpy(), sample_rate)
    duration_s = waveform.shape[-1] / sample_rate
    return duration_s, sample_rate
