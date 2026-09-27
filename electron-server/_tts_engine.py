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


def synthesize(models_dir, speaker_dir, preset_name, instruct_text, tts_text, out_path, seed=None):
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
    this parameter existed."""
    import random
    import torch
    import soundfile as sf

    preset_path = os.path.join(speaker_dir or "", f"{preset_name}.pt")
    if not os.path.isfile(preset_path):
        raise FileNotFoundError(f"no saved speaker preset: {preset_path}")

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

    spk2info = torch.load(preset_path, map_location=device)
    spk_id = next(iter(spk2info))
    model.frontend.spk2info = spk2info

    formatted_instruct = _format_instruct(instruct_text, is_v3)
    prompt_text_token, prompt_text_token_len = model.frontend._extract_text_token(formatted_instruct)
    model.frontend.spk2info[spk_id]["prompt_text"] = prompt_text_token
    model.frontend.spk2info[spk_id]["prompt_text_len"] = prompt_text_token_len

    output = model.inference_instruct2(
        tts_text=tts_text,
        instruct_text=formatted_instruct,
        prompt_wav=None,
        zero_shot_spk_id=spk_id,
        stream=False,
        speed=1.0,
        text_frontend=True,
    )

    chunks = [chunk["tts_speech"] for chunk in output]
    if not chunks:
        raise RuntimeError("model produced no audio chunks")
    wav = torch.cat(chunks, dim=-1) if len(chunks) > 1 else chunks[0]
    if wav.device != torch.device("cpu"):
        wav = wav.cpu()

    out_dir = os.path.dirname(out_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    sf.write(out_path, wav.numpy().T if wav.dim() > 1 else wav.numpy(), sample_rate)
    duration_s = wav.shape[-1] / sample_rate
    return duration_s, sample_rate
