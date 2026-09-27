"""
Phase 3 prototype: prove FL-CosyVoice3's model can be invoked DIRECTLY,
with zero ComfyUI involvement (no graph, no queue, no PromptServer) --
faithfully reproducing the exact call sequence
comfyui_fl-cosyvoice3/nodes/speaker_instruct2_dialog.py's real node uses
for one "preset | instruct | text" line, since that's the node this
addon's actual production workflows are wired to.

Run directly: `python tts_prototype.py`. Prints progress; writes
tts_prototype_output.wav next to this file on success.

Not wired into electron-server/server.py yet -- this is a standalone proof
before any real endpoint gets built around it (see the project plan,
"Phase 3 -- prototype in total isolation first").
"""
import os
import sys
import glob

FL_COSYVOICE3_DIR = r"C:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\comfyui_fl-cosyvoice3"
MODELS_DIR = r"C:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\models"
SPEAKER_DIR = os.path.join(MODELS_DIR, "cosyvoice", "speaker")

SYSTEM_PROMPT = "You are a helpful assistant."
ENDOFPROMPT = "<|endofprompt|>"


def format_instruct(instruct_text: str, is_v3: bool) -> str:
    """Ported from speaker_instruct2_dialog.py's _format_instruct."""
    raw = instruct_text.strip()
    if raw.startswith(SYSTEM_PROMPT):
        raw = raw[len(SYSTEM_PROMPT):].lstrip("\n")
    if raw.endswith(ENDOFPROMPT):
        raw = raw[:-len(ENDOFPROMPT)].rstrip()
    if is_v3:
        return SYSTEM_PROMPT + "\n" + raw + ENDOFPROMPT
    return f"{raw}{ENDOFPROMPT}"


def find_a_real_preset():
    """Pick any one .pt speaker preset already saved on this machine --
    reuses whatever's real instead of inventing a fake one."""
    if not os.path.isdir(SPEAKER_DIR):
        return None
    presets = sorted(glob.glob(os.path.join(SPEAKER_DIR, "*.pt")))
    return presets[0] if presets else None


def main():
    print("=" * 60)
    print("Phase 3 prototype: direct FL-CosyVoice3 invocation, no ComfyUI")
    print("=" * 60)

    preset_path = find_a_real_preset()
    if not preset_path:
        print(f"No .pt speaker preset found under {SPEAKER_DIR} -- nothing to test against.")
        sys.exit(1)
    preset_name = os.path.splitext(os.path.basename(preset_path))[0]
    print(f"Using real saved preset: {preset_name} ({preset_path})")

    # Make the vendored cosyvoice package (bundled inside the ComfyUI node
    # pack) importable without ComfyUI itself ever running -- same
    # sys.path trick model_manager.py's own load_cosyvoice_model uses.
    vendored_path = FL_COSYVOICE3_DIR
    if vendored_path not in sys.path:
        sys.path.insert(0, vendored_path)

    import torch

    try:
        import soundfile as sf
    except ImportError:
        print("soundfile not installed in this Python -- pip install soundfile first.")
        sys.exit(1)

    print("Importing vendored cosyvoice package...")
    from cosyvoice.cli.cosyvoice import AutoModel

    # Find the actual model dir (whichever CosyVoice model is already
    # downloaded under MODELS_DIR/cosyvoice/<version>/...) -- same
    # config-file walk load_cosyvoice_model does, so this prototype uses
    # whatever's REALLY on disk rather than assuming a specific version.
    cosyvoice_models_root = os.path.join(MODELS_DIR, "cosyvoice")
    config_names = ("cosyvoice.yaml", "cosyvoice3.yaml", "cosyvoice2.yaml")
    model_dir = None
    if os.path.isdir(cosyvoice_models_root):
        for root, _dirs, files in os.walk(cosyvoice_models_root):
            if any(c in files for c in config_names):
                model_dir = root
                break
    if not model_dir:
        print(f"No downloaded CosyVoice model config found under {cosyvoice_models_root}.")
        print("This prototype does NOT auto-download a model -- run the real "
              "FL CosyVoice3 Model Loader node once inside ComfyUI first, or "
              "point MODELS_DIR at wherever one already lives.")
        sys.exit(1)
    print(f"Found model config in: {model_dir}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    print("Loading model via AutoModel (this can take a while on first load)...")
    model = AutoModel(model_dir=model_dir, load_trt=False, fp16=False)
    sample_rate = model.sample_rate
    print(f"Model loaded. sample_rate={sample_rate}")

    is_v3 = "cosyvoice3" in model_dir.lower() or "fun-cosyvoice3" in model_dir.lower()

    # --- Faithful port of speaker_instruct2_dialog.py's saved-preset + instruct2 path ---
    spk2info = torch.load(preset_path, map_location=device)
    spk_id = next(iter(spk2info))
    model.frontend.spk2info = spk2info

    instruct_text = "спокойным, тёплым тоном рассказчика"
    tts_text = "Однажды в далёкой стране жил да был маленький дракон."

    formatted_instruct = format_instruct(instruct_text, is_v3)
    prompt_text_token, prompt_text_token_len = model.frontend._extract_text_token(formatted_instruct)
    model.frontend.spk2info[spk_id]["prompt_text"] = prompt_text_token
    model.frontend.spk2info[spk_id]["prompt_text_len"] = prompt_text_token_len

    print(f"Synthesizing: \"{tts_text}\" (instruct: \"{instruct_text}\")")
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
        print("No audio was generated -- something is wrong with the model/preset.")
        sys.exit(1)
    wav = torch.cat(chunks, dim=-1) if len(chunks) > 1 else chunks[0]
    if wav.device != torch.device("cpu"):
        wav = wav.cpu()

    out_path = os.path.join(os.path.dirname(__file__), "tts_prototype_output.wav")
    sf.write(out_path, wav.numpy().T if wav.dim() > 1 else wav.numpy(), sample_rate)
    duration_s = wav.shape[-1] / sample_rate
    print("=" * 60)
    print(f"SUCCESS -- wrote {out_path} ({duration_s:.2f}s, {sample_rate}Hz)")
    print("This proves direct TTS invocation works with zero ComfyUI involvement.")
    print("=" * 60)


if __name__ == "__main__":
    main()
