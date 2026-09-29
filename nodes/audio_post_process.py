"""
FL CosyVoice3 Audio Post-Process Node

Post-synthesis cleanup: trims the onset click/silence CosyVoice's vocoder
tends to leave at the START of a clip, smooths the cut with a short fade,
normalizes loudness to a target RMS (with a peak safety ceiling), optionally
applies a named effect and/or a speed multiplier.

Works the same way whether `audio` is a single AUDIO from any synthesis
node, or a LIST of AUDIO (e.g. FL CosyVoice3 Speaker Instruct2 Dialog's
per-line output, one item per script line) -- each item is processed and
written to its own per-line file INDEPENDENTLY, never concatenated.
Building the one final scene track is exclusively the "✅ Done" button's
job (nodes/script_library.py's stitch_lines).

This node is also the one place VO Dub's dry (pre-effect) reference copy is
written -- see `dry_output_path_override` -- so a later Effect/Normalize/
Speed change can be re-applied without re-running the whole TTS graph.
"""
import torch
import os
import json
from typing import Any, Dict, List

try:
    from ._audio_utils import (
        save_wav,
        tensor_to_comfyui_audio,
        trim_leading_silence,
        normalize_loudness,
        change_speed,
    )
    from ._audio_effects import apply_named_effect
    from . import _line_audio
except (ImportError, ValueError):
    from _audio_utils import (
        save_wav,
        tensor_to_comfyui_audio,
        trim_leading_silence,
        normalize_loudness,
        change_speed,
    )
    from _audio_effects import apply_named_effect
    import _line_audio


class FL_CosyVoice3_AudioPostProcess:
    """Trim onset click + fade + optional effect + optional normalize +
    optional speed change, per audio item, and write each item to its own
    per-line file."""

    RETURN_TYPES = ("AUDIO", "STRING")
    RETURN_NAMES = ("audio", "report")
    OUTPUT_IS_LIST = (True, False)
    OUTPUT_NODE = True
    OUTPUT_TOOLTIPS = (
        "The processed audio, one item per input item -- NOT concatenated.",
        "Per-item report: how much was trimmed, effect/normalize/speed applied.",
    )
    FUNCTION = "process"
    CATEGORY = "🔊FL CosyVoice3/Synthesis"
    INPUT_IS_LIST = True

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "audio": ("AUDIO", {
                    "tooltip": "Одно аудио или список -- каждый элемент обрабатывается независимо."
                }),
                "trim_line_onset": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "Обрезает щелчок+тишину в начале каждого клипа."
                }),
                "trim_max_ms": ("FLOAT", {
                    "default": 600.0, "min": 0.0, "max": 2000.0, "step": 10.0,
                    "tooltip": "Максимум миллисекунд, которые можно срезать с начала."
                }),
            },
            "optional": {
                "line_texts_json": ("STRING", {
                    "forceInput": True,
                    "tooltip": "JSON-массив текста каждой строки, тем же порядком, что и audio."
                }),
                "script_folder": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Папка акта, где лежит _audio\\lines\\<script>\\."
                }),
                "script_base_name": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Имя скрипта без суффикса -- задаёт _audio\\lines\\<имя>\\."
                }),
                "line_index_override": ("INT", {
                    "forceInput": True,
                    "tooltip": "Служебное поле для single-line re-voice."
                }),
                "line_hashes_json": ("STRING", {
                    "forceInput": True,
                    "tooltip": "JSON-массив хешей содержимого каждой строки."
                }),
                "output_path_override": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Служебное поле VO Dub: полный путь к файлу назначения."
                }),
                "effect_override": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Служебное поле VO Dub: именованный эффект (radio, phone, ...)."
                }),
                "dry_output_path_override": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Служебное поле VO Dub: путь для сухой копии (до эффекта/нормализации/скорости)."
                }),
                "normalize_override": ("BOOLEAN", {
                    "forceInput": True,
                    "default": False,
                    "tooltip": "Служебное поле VO Dub: RMS-нормализация громкости."
                }),
                "speed_override": ("FLOAT", {
                    "forceInput": True,
                    "default": 1.0,
                    "min": 0.5, "max": 2.0, "step": 0.01,
                    "tooltip": "Служебное поле VO Dub: множитель скорости (time-stretch, тон сохраняется)."
                }),
            }
        }

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        # Всегда перезапускается: файл на диске -- часть результата,
        # ComfyUI-кэш о нём ничего не знает.
        return float("nan")

    def process(
        self,
        audio: List[Dict[str, Any]],
        trim_line_onset: List[bool],
        trim_max_ms: List[float],
        line_texts_json: List[str] = [""],
        script_folder: List[str] = [""],
        script_base_name: List[str] = [""],
        line_index_override: List[int] = [-1],
        line_hashes_json: List[str] = [""],
        output_path_override: List[str] = [""],
        effect_override: List[str] = [""],
        dry_output_path_override: List[str] = [""],
        normalize_override: List[bool] = [False],
        speed_override: List[float] = [1.0],
    ):
        do_trim_onset = trim_line_onset[0]
        max_trim = trim_max_ms[0]
        line_texts_str = (line_texts_json[0] or "").strip()
        line_hashes_str = (line_hashes_json[0] or "").strip()
        timing_folder = (script_folder[0] or "").strip()
        timing_base_name = (script_base_name[0] or "").strip()
        index_override = line_index_override[0] if line_index_override else -1
        override_path = (output_path_override[0] or "").strip()
        effect_name = (effect_override[0] or "").strip()
        dry_override_path = (dry_output_path_override[0] or "").strip()
        normalize_flag = bool(normalize_override[0]) if normalize_override else False
        speed_value = float(speed_override[0]) if speed_override else 1.0

        print(f"[FL CosyVoice3 AudioPostProcess] ---- run: {len(audio)} audio item(s) ----")
        print(f"[FL CosyVoice3 AudioPostProcess]   script_folder       = {timing_folder!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   script_base_name    = {timing_base_name!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   line_index_override = {index_override!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   line_hashes_json    = {line_hashes_str[:200]!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   output_path_override = {override_path!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   effect_override     = {effect_name!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   normalize           = {normalize_flag}")
        print(f"[FL CosyVoice3 AudioPostProcess]   speed               = {speed_value}")
        print(f"[FL CosyVoice3 AudioPostProcess]   dry_output_path_override = {dry_override_path!r}")

        if not audio:
            raise ValueError("FL CosyVoice3 Audio Post-Process: no audio received.")
        if override_path and len(audio) != 1:
            raise ValueError(
                f"FL CosyVoice3 Audio Post-Process: output_path_override is set but {len(audio)} "
                f"clips arrived -- it only ever writes exactly one file."
            )

        sample_rate = audio[0]["sample_rate"]

        try:
            line_texts = json.loads(line_texts_str) if line_texts_str else []
        except json.JSONDecodeError:
            line_texts = []
        try:
            line_hashes = json.loads(line_hashes_str) if line_hashes_str else []
        except json.JSONDecodeError:
            line_hashes = []

        lines_dir = None
        if not override_path:
            if timing_folder and timing_base_name:
                lines_dir = os.path.join(timing_folder, "_audio", "lines", timing_base_name)
                try:
                    os.makedirs(lines_dir, exist_ok=True)
                except OSError as e:
                    print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't create lines dir: {e}")
                    lines_dir = None
            if lines_dir is None:
                print("[FL CosyVoice3 AudioPostProcess]   lines_dir = <none> -- NO per-line file will be written.")

        if not override_path and len(audio) == 1 and index_override < 0:
            print("[FL CosyVoice3 AudioPostProcess]   NOTE: single item and no line_index_override "
                  "-- writing at position 0.")

        if lines_dir is not None and len(audio) > 1:
            try:
                for pos, _, name in _line_audio.list_lines_dir(lines_dir):
                    if pos >= len(audio):
                        os.remove(os.path.join(lines_dir, name))
            except OSError as e:
                print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't clean up stale line files: {e}")
                lines_dir = None

        result_audios = []
        report_lines = [f"{len(audio)} item(s), sample_rate={sample_rate}"]
        total_samples = 0

        for i, item in enumerate(audio):
            wav = item["waveform"]
            if wav.device != torch.device("cpu"):
                wav = wav.cpu()

            notes = []

            if do_trim_onset:
                wav, trimmed_ms = trim_leading_silence(wav, sample_rate, max_trim_ms=max_trim)
                if trimmed_ms > 0:
                    cap_hit = trimmed_ms >= max_trim - 1.0
                    notes.append(f"trimmed {trimmed_ms:.0f}ms start" + (" [hit cap]" if cap_hit else ""))

            # Dry copy -- до effect/normalize/speed, чтобы apply_effect мог
            # переработать ИЗ НЕГО, а не из уже обработанного файла.
            if dry_override_path:
                try:
                    dry_dir = os.path.dirname(dry_override_path)
                    if dry_dir:
                        os.makedirs(dry_dir, exist_ok=True)
                    save_wav(wav, sample_rate, dry_override_path)
                except OSError as e:
                    print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't save dry take to "
                          f"{dry_override_path}: {e}")

            if effect_name:
                wav = apply_named_effect(wav, sample_rate, effect_name)
                notes.append(f"effect: {effect_name}")

            if normalize_flag:
                wav, gain_db = normalize_loudness(wav, sample_rate)
                notes.append(f"normalize: {gain_db:+.1f}dB")

            if speed_value != 1.0:
                wav = change_speed(wav, sample_rate, speed_value)
                notes.append(f"speed: {speed_value:.2f}x")

            line = f"Item {i + 1}/{len(audio)}: " + (", ".join(notes) if notes else "no changes")
            report_lines.append(line)
            print(f"[FL CosyVoice3 AudioPostProcess] {line}")

            if override_path:
                try:
                    override_dir = os.path.dirname(override_path)
                    if override_dir:
                        os.makedirs(override_dir, exist_ok=True)
                    save_wav(wav, sample_rate, override_path)
                    print(f"[FL CosyVoice3 AudioPostProcess]   wrote {override_path} "
                          f"(exists={os.path.isfile(override_path)})")
                except OSError as e:
                    print(f"[FL CosyVoice3 AudioPostProcess] ERROR: couldn't save to "
                          f"{override_path}: {e}")
                total_samples += wav.shape[-1]
                result_audios.append(tensor_to_comfyui_audio(wav, sample_rate))
                continue

            is_single_override = len(audio) == 1 and index_override >= 0
            position = index_override if is_single_override else i
            if lines_dir is not None:
                hash_source = "line_hashes_json" if i < len(line_hashes) else "text-only fallback"
                content_hash = (
                    line_hashes[i] if i < len(line_hashes)
                    else _line_audio.line_hash("", "", line_texts[i] if i < len(line_texts) else "")
                )
                out_path = _line_audio.expected_path(lines_dir, position, content_hash)
                try:
                    save_wav(wav, sample_rate, out_path)
                    stale = _line_audio.delete_stale_at_position(lines_dir, position, content_hash)
                    print(f"[FL CosyVoice3 AudioPostProcess]   line {position}: wrote {out_path} "
                          f"(hash {content_hash} from {hash_source}, exists={os.path.isfile(out_path)})"
                          + (f" -- deleted stale {stale}" if stale else ""))
                except OSError as e:
                    print(f"[FL CosyVoice3 AudioPostProcess] ERROR: couldn't save line {position} to {out_path}: {e}")

            total_samples += wav.shape[-1]
            result_audios.append(tensor_to_comfyui_audio(wav, sample_rate))

        report_lines.append(f"Total (no gaps, not stitched): {total_samples / sample_rate:.2f}s")
        report = "\n".join(report_lines)
        print(f"[FL CosyVoice3 AudioPostProcess] Processed {len(audio)} item(s), not stitched")

        return {"ui": {"report": [report]}, "result": (result_audios, report)}


NODE_CLASS_MAPPINGS = {
    "FL_CosyVoice3_AudioPostProcess": FL_CosyVoice3_AudioPostProcess,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "FL_CosyVoice3_AudioPostProcess": "🔊FL CosyVoice3 Audio Post-Process",
}
