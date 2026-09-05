"""
FL CosyVoice3 Speaker Instruct2 Dialog Node
Multi-line, multi-speaker synthesis with intonation control.

Loops FL CosyVoice3 Speaker Instruct2's own logic (a saved .pt speaker
preset + an instruct_text style instruction, via inference_instruct2 and
zero_shot_spk_id) over a whole script, one line at a time. Outputs each
line's audio as a LIST (one item per script line) instead of one combined
track -- wire it into FL CosyVoice3 Audio Post-Process to normalize
loudness and stitch the lines back into a single track with pauses between
them. Splitting it this way lets the same post-processing/stitching logic
be reused after any of this plugin's synthesis nodes, not just this one.

This exists because the built-in FL CosyVoice3 Dialog node only accepts
live reference audio and has no instruct_text input (it calls
inference_zero_shot / inference_cross_lingual, not inference_instruct2),
so it cannot reuse saved presets or control intonation per line. This node
is a drop-in sibling that closes that gap.

Script format — one turn per line:
    preset_name | instruct text | line text

Example:
    narrator | нейтральным, спокойным тоном | Она услышала чей-то шёпот.
    hanna | испуганно, полушёпотом | Прости. Это всегда шокирует всех, кто видит его впервые.
    hermione | с тревогой в голосе | Что с тобой случилось?

Blank lines are ignored. A line must have exactly two "|" separators
(three fields) or it is skipped with a console warning, same as the
built-in Dialog node skips lines it can't parse.

Raw-clone escape hatch: leave the instruct field empty ("preset || line
text") to bypass instruct2 entirely for that line. No prompt_text override
happens and the line is synthesized with plain inference_zero_shot, using
the speaker preset exactly as it was saved (its own reference transcript,
untouched). This is the honest "no instruction at all" test — useful for
isolating whether an instruct2 style instruction (in any language/wording)
is itself responsible for an accent/quality regression on a given preset.

    arestovich | | Её правый глаз смотрел на Гермиону...

Optional character tag: "preset_name#tag" (e.g. "arestovich#v" for
arestovich playing Voldemort in that line, "monetochka#u" for monetochka
playing Umbridge). This is purely a find-and-replace convenience for
editing the script file -- it lets you grep/sed just one character's lines
out of a preset that plays several roles, and re-cast that one character
to a different voice later by editing only the base name in front of "#".
The node itself ignores everything from "#" onward: only the part before
it is ever used to load the .pt file / zero_shot_spk_id or key the
per-speaker seed table. See _instruct_rules.txt for the project's tag
legend (which tag means which character).

    arestovich#v | Speak coldly and menacingly. | Круцио!
    arestovich    | Speak like a audiobook narrator. | Волдеморт произнёс проклятие.
"""

import torch
import random
import os
import sys
import json
import hashlib
from typing import Tuple, Dict, Any, List, Optional

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from ..utils.audio_utils import tensor_to_comfyui_audio, trim_leading_silence
except (ImportError, ValueError):
    from utils.audio_utils import tensor_to_comfyui_audio, trim_leading_silence

try:
    from .speaker_instruct2 import get_speaker_dir, list_speaker_presets, is_cosyvoice3_model
except (ImportError, ValueError):
    from speaker_instruct2 import get_speaker_dir, list_speaker_presets, is_cosyvoice3_model

import comfy.utils

SYSTEM_PROMPT = "You are a helpful assistant."
ENDOFPROMPT = "<|endofprompt|>"


class FL_CosyVoice3_SpeakerInstruct2Dialog:
    """
    Scripted multi-speaker synthesis: each line names a saved speaker
    preset AND an intonation instruction, looping the same technique
    FL CosyVoice3 Speaker Instruct2 uses for a single line. Each line's
    audio comes out as its own list item -- pair with FL CosyVoice3 Audio
    Post-Process downstream to normalize and stitch them into one track.

    A line with an empty instruct field ("preset || text") skips instruct2
    for that line and falls back to plain zero-shot cloning with the
    preset's own saved reference transcript (see module docstring).
    """

    RETURN_TYPES = ("AUDIO", "STRING", "STRING")
    RETURN_NAMES = ("audio", "message", "line_texts_json")
    OUTPUT_IS_LIST = (True, False, False)
    OUTPUT_TOOLTIPS = (
        "One audio item per script line (not concatenated) -- wire into FL CosyVoice3 "
        "Audio Post-Process to normalize loudness and stitch them into a single track.",
        "Run summary (line count, duration is unavailable until stitched, per-line seeds).",
        "JSON array of each line's spoken text, same order as `audio` -- wire into FL "
        "CosyVoice3 Audio Post-Process's line_texts_json input so it can write a "
        "per-line timing manifest (used by the line editor's playback sync) alongside "
        "the stitched track. Not needed for anything else.",
    )
    FUNCTION = "generate"
    CATEGORY = "🔊FL CosyVoice3/Synthesis"

    @classmethod
    def INPUT_TYPES(cls):
        _ = list_speaker_presets()  # touch it so ComfyUI refreshes the dir on graph (re)load
        return {
            "required": {
                "model": ("COSYVOICE_MODEL", {
                    "tooltip": "Модель CosyVoice, приходит от Model Loader."
                }),
                "script": ("STRING", {
                    "default": (
                        "narrator | нейтральным, спокойным тоном | Она услышала чей-то шёпот.\n"
                        "hanna | испуганно, полушёпотом | Прости. Это всегда шокирует всех, кто видит его впервые.\n"
                        "hermione | с тревогой в голосе | Что с тобой случилось?"
                    ),
                    "multiline": True,
                    "tooltip": "Сам сценарий. Формат строки: preset | instruct-текст | текст "
                                   "реплики, ровно два |. Пустое поле instruct (preset || текст) — "
                                   "служебная \"лазейка\": пропускает instruct2 для этой строки и "
                                   "озвучивает голым zero-shot-клонированием, родным референс-текстом "
                                   "пресета, без стилевой инструкции — удобно, чтобы проверить, не "
                                   "сама ли инструкция портит акцент/качество."
                }),
                "speed": ("FLOAT", {
                    "default": 1.0, "min": 0.5, "max": 2.0, "step": 0.05,
                    "tooltip": "Множитель скорости речи, применяется ко всем строкам сразу."
                }),
            },
            "optional": {
                "text_frontend": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "Нормализация текста. Выключать для CMU-фонем или спецтегов."
                }),
                "trim_chunk_onset": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "Обрезает короткий \"спотыкающийся\" щелчок+тишину, который "
                                   "CosyVoice иногда генерирует в начале КАЖДОГО внутреннего чанка "
                                   "строки (длинная строка распадается на несколько отдельных TTS-"
                                   "вызовов), до их склейки в саму строку. Не путать с trim_line_onset/"
                                   "trim_line_tail у FL CosyVoice3 Audio Post-Process ниже по "
                                   "пайплайну -- та нода видит только уже готовый клип целиком и не "
                                   "может поймать щелчок ПОСРЕДИ длинной строки, только этот узел "
                                   "может, т.к. у него есть доступ к границам чанков."
                }),
                "trim_chunk_max_ms": ("FLOAT", {
                    "default": 600.0, "min": 0.0, "max": 2000.0, "step": 10.0,
                    "tooltip": "Предохранитель для trim_chunk_onset: сколько максимум миллисекунд "
                                   "можно срезать с начала одного чанка, даже если чистое начало "
                                   "речи не нашлось в этом бюджете."
                }),
                "seed_per_speaker": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "Пересевать сид перед каждой строкой на основе пресета этой "
                                   "строки, а не использовать один сид на весь сценарий. Держит "
                                   "реплики одного персонажа в своём \"семействе\" сидов, вместо того "
                                   "чтобы на них влияло случайное RNG-состояние, утёкшее от других "
                                   "спикеров ранее в сценарии."
                }),
                "seed_mode": (["family", "identical"], {
                    "default": "family",
                    "tooltip": "Работает только при включённом seed_per_speaker. family: каждая "
                                   "строка получает base_seed + номер_строки (рекомендуется — "
                                   "реплики одного спикера близки, но не идентичны, так что "
                                   "баг/залипание одного сида не повторяется на каждой строке). "
                                   "identical: все строки спикера используют ровно один и тот же сид "
                                   "— полезно для проверки консистентности тембра, но если сид "
                                   "неудачный, артефакт повторится на каждой его реплике."
                }),
                "disable_instructions": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "Принудительно голый zero-shot-клон (без стилевой инструкции) для "
                                   "ВСЕХ строк, игнорируя то, что написано в поле instruct у каждой. "
                                   "Эквивалент ручного обнуления всех instruct-полей, но без правки "
                                   "самого текста сценария — выключил обратно, и всё "
                                   "восстановилось как было."
                }),
                # Deliberately LAST (kept even after suppressing the control
                # widget below, in case some other ComfyUI build/version still
                # injects it): ComfyUI can auto-inject a hidden
                # "control_after_generate" widget right after any field named
                # "seed", which silently shifted every SUBSEQUENT widget's
                # restored value by one slot on load in earlier testing here
                # (confirmed live) -- keeping seed last means that, if it ever
                # recurs, it can only clobber seed's own display, nothing else.
                "seed": ("INT", {
                    "default": 42, "min": -1, "max": 2147483647,
                    "control_after_generate": False,
                    "tooltip": "Сид, применяется один раз на весь сценарий (если не включён "
                                   "seed_per_speaker). -1 = случайный."
                }),
            }
        }

    def _parse_script(self, script: str) -> List[Tuple[str, str, str]]:
        turns = []
        for raw_line in script.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            parts = line.split("|")
            if len(parts) != 3:
                print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] Skipping malformed line "
                      f"(need exactly 2 '|' separators): {line[:60]}")
                continue
            preset, instruct, content = (p.strip() for p in parts)

            # Optional character tag: "presetname#tag" (e.g. "arestovich#v" for
            # arestovich playing Voldemort). The tag is a pure authoring/
            # find-and-replace convenience -- it lets you grep/sed one
            # character's lines (e.g. all "#v" lines) without touching the
            # preset's other roles, and swap that one character to a
            # different voice later just by editing the base name in front
            # of "#". The node itself ignores the tag completely: only the
            # part before "#" is ever used to load the .pt file, look up
            # zero_shot_spk_id, or key the per-speaker seed table. See
            # _instruct_rules.txt for the tag legend.
            if "#" in preset:
                preset = preset.split("#", 1)[0].strip()

            if not preset or not content:
                print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] Skipping line with an empty preset or text field: {line[:60]}")
                continue
            # instruct may legitimately be empty: that's the raw-clone marker (see module docstring)
            turns.append((preset, instruct, content))
        return turns

    def _format_instruct(self, instruct_text: str, is_v3: bool) -> str:
        raw = instruct_text.strip()
        if raw.startswith(SYSTEM_PROMPT):
            raw = raw[len(SYSTEM_PROMPT):].lstrip("\n")
        if raw.endswith(ENDOFPROMPT):
            raw = raw[:-len(ENDOFPROMPT)].rstrip()
        if is_v3:
            return SYSTEM_PROMPT + "\n" + raw + ENDOFPROMPT
        return f"{raw}{ENDOFPROMPT}"

    def _stable_speaker_seed(self, preset: str) -> int:
        """Deterministic hash of a preset name -> int, stable across runs/processes
        (unlike Python's built-in hash(), which is randomized per-process by default)."""
        return int(hashlib.md5(preset.encode("utf-8")).hexdigest(), 16) % (2 ** 31 - 1)

    def _load_speaker_seed_override(self, speaker_dir: str, preset: str) -> Optional[int]:
        """
        Look for a sidecar <preset>.txt next to <preset>.pt in the speaker dir,
        containing a line like:
            seed=12345
        Lets a user pin a manually-found "good" seed to a specific preset — once
        they've confirmed a seed sounds right (clean onset, right accent, no
        looping), it applies to every script that uses that preset from then on,
        instead of only within the run where they found it. Returns None if the
        file doesn't exist or has no seed= line (falls back to the auto-derived
        per-speaker seed).
        """
        txt_path = os.path.join(speaker_dir, f"{preset}.txt")
        if not os.path.isfile(txt_path):
            return None
        try:
            with open(txt_path, "r", encoding="utf-8") as f:
                for raw_line in f:
                    line = raw_line.split("#", 1)[0].strip()  # allow trailing "# comment"
                    if not line or "=" not in line:
                        continue
                    key, _, value = line.partition("=")
                    if key.strip().lower() == "seed":
                        try:
                            return int(value.strip())
                        except ValueError:
                            print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] WARNING: "
                                  f"couldn't parse seed value in {txt_path}: '{value.strip()}'")
                            return None
        except OSError as e:
            print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] WARNING: couldn't read {txt_path}: {e}")
        return None

    def generate(
        self,
        model: Dict[str, Any],
        script: str,
        speed: float = 1.0,
        text_frontend: bool = True,
        trim_chunk_onset: bool = True,
        trim_chunk_max_ms: float = 600.0,
        seed_per_speaker: bool = True,
        seed_mode: str = "family",
        disable_instructions: bool = False,
        seed: int = -1,
    ) -> Tuple[List[Dict[str, Any]], str, str]:

        print(f"\n{'='*60}")
        print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] Starting scripted multi-voice generation...")
        print(f"{'='*60}\n")

        cosyvoice_model = model["model"]
        sample_rate = cosyvoice_model.sample_rate

        turns = self._parse_script(script)
        if not turns:
            empty_audio = {"waveform": torch.zeros(1, 1, sample_rate), "sample_rate": sample_rate}
            return ([empty_audio], "No valid lines found. Use format: preset | instruct | text", "[]")

        if not hasattr(cosyvoice_model, 'inference_instruct2'):
            raise RuntimeError(
                "inference_instruct2 is not available on this model. "
                "This node requires a CosyVoice2 or CosyVoice3 model."
            )
        if not hasattr(cosyvoice_model, 'inference_zero_shot'):
            raise RuntimeError(
                "inference_zero_shot is not available on this model, but is required for "
                "'-' (raw clone, bypass instruct2) lines."
            )

        try:
            if seed >= 0:
                torch.manual_seed(seed)
                random.seed(seed)
                if torch.cuda.is_available():
                    torch.cuda.manual_seed_all(seed)

            is_v3 = model.get("is_cosyvoice3", False) or is_cosyvoice3_model(model)
            speaker_dir = get_speaker_dir()
            load_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

            pbar = comfy.utils.ProgressBar(len(turns))
            line_audios: List[Dict[str, Any]] = []
            speaker_base_seeds: Dict[str, int] = {}
            speaker_line_counts: Dict[str, int] = {}
            seed_log: List[str] = []

            for i, (preset, instruct, content) in enumerate(turns):
                if seed_per_speaker:
                    if preset not in speaker_base_seeds:
                        seed_override = self._load_speaker_seed_override(speaker_dir, preset)
                        if seed_override is not None:
                            speaker_base_seeds[preset] = seed_override % (2 ** 31 - 1)
                            print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] Preset '{preset}': "
                                  f"using pinned seed {seed_override} from {preset}.txt")
                        elif seed >= 0:
                            speaker_base_seeds[preset] = (seed + self._stable_speaker_seed(preset)) % (2 ** 31 - 1)
                        else:
                            speaker_base_seeds[preset] = random.randint(0, 2 ** 31 - 1)
                        speaker_line_counts[preset] = 0
                    if seed_mode == "identical":
                        line_seed = speaker_base_seeds[preset]
                    else:
                        line_seed = (speaker_base_seeds[preset] + speaker_line_counts[preset]) % (2 ** 31 - 1)
                    speaker_line_counts[preset] += 1
                    seed_log.append(f"L{i+1} {preset}: {line_seed}")
                    torch.manual_seed(line_seed)
                    random.seed(line_seed)
                    if torch.cuda.is_available():
                        torch.cuda.manual_seed_all(line_seed)
                else:
                    line_seed = None

                raw_clone = disable_instructions or instruct.strip() == ""
                mode_label = "RAW CLONE (instruct2 bypassed)" if raw_clone else "instruct2"
                seed_note = f" seed={line_seed}" if line_seed is not None else ""
                print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] Line {i+1}/{len(turns)}: "
                      f"preset='{preset}' mode={mode_label}{seed_note} "
                      f"instruct='{instruct[:40]}{'...' if len(instruct) > 40 else ''}'")

                pt_path = os.path.join(speaker_dir, f"{preset}.pt")
                if not os.path.isfile(pt_path):
                    raise FileNotFoundError(
                        f"Speaker preset file not found: {pt_path}\n"
                        f"(line {i+1}: '{preset} | {instruct[:30]} | {content[:30]}...')\n"
                        f"Please run FL CosyVoice3 Save Speaker to create it first, "
                        f"or check the preset name for typos."
                    )

                spk2info = torch.load(pt_path, map_location=load_device)
                spk_id = next(iter(spk2info))
                cosyvoice_model.frontend.spk2info = spk2info

                if raw_clone:
                    # Bypass instruct2 entirely: leave spk2info's saved prompt_text as-is
                    # and use the plain zero-shot path, same as the built-in Dialog node.
                    output = cosyvoice_model.inference_zero_shot(
                        tts_text=content,
                        prompt_text='',
                        prompt_wav=None,
                        zero_shot_spk_id=spk_id,
                        stream=False,
                        speed=speed,
                        text_frontend=text_frontend,
                    )
                else:
                    formatted_instruct = self._format_instruct(instruct, is_v3)
                    prompt_text_token, prompt_text_token_len = cosyvoice_model.frontend._extract_text_token(formatted_instruct)
                    cosyvoice_model.frontend.spk2info[spk_id]['prompt_text'] = prompt_text_token
                    cosyvoice_model.frontend.spk2info[spk_id]['prompt_text_len'] = prompt_text_token_len

                    output = cosyvoice_model.inference_instruct2(
                        tts_text=content,
                        instruct_text=formatted_instruct,
                        prompt_wav=None,
                        zero_shot_spk_id=spk_id,
                        stream=False,
                        speed=speed,
                        text_frontend=text_frontend,
                    )

                all_speech = [chunk["tts_speech"] for chunk in output]
                if not all_speech:
                    raise RuntimeError(f"No audio was generated for line {i+1} (preset '{preset}').")

                # Each element of all_speech is its own fresh CosyVoice decode:
                # text_frontend splits long lines into ~60-80 token sub-chunks
                # (split_paragraph, cosyvoice/utils/frontend_utils.py) and
                # synthesizes each with its own call to self.model.tts()
                # (cosyvoice/cli/cosyvoice.py, inference_instruct2 /
                # inference_zero_shot). Every such call carries the same
                # fresh-decode onset-click/breath risk as the line's very
                # first chunk, so trim each chunk's own leading edge
                # individually BEFORE concatenating -- otherwise an artifact
                # sitting at an internal chunk boundary (chunk 2, 3, ...)
                # sails through untouched and shows up as an isolated
                # parasitic click/gasp floating mid-line, between two chunks
                # that each look clean on their own.
                total_trimmed_ms = 0.0
                if trim_chunk_onset:
                    trimmed_chunks = []
                    for c_idx, chunk_wav in enumerate(all_speech):
                        if chunk_wav.device != torch.device("cpu"):
                            chunk_wav = chunk_wav.cpu()
                        trimmed_chunk, chunk_trimmed_ms = trim_leading_silence(
                            chunk_wav, sample_rate, max_trim_ms=trim_chunk_max_ms
                        )
                        if chunk_trimmed_ms > 0:
                            cap_hit = chunk_trimmed_ms >= trim_chunk_max_ms - 1.0
                            note = (" [!] hit trim_chunk_max_ms cap -- artifact may be longer than "
                                    "the cap, likely NOT fully removed") if cap_hit else ""
                            chunk_label = f" chunk {c_idx+1}/{len(all_speech)}" if len(all_speech) > 1 else ""
                            print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] Line {i+1} ({preset}){chunk_label}: "
                                  f"trimmed {chunk_trimmed_ms:.0f}ms of onset artifact{note}")
                        total_trimmed_ms += chunk_trimmed_ms
                        trimmed_chunks.append(trimmed_chunk)
                    line_wav = torch.cat(trimmed_chunks, dim=-1) if len(trimmed_chunks) > 1 else trimmed_chunks[0]
                else:
                    line_wav = torch.cat(all_speech, dim=-1) if len(all_speech) > 1 else all_speech[0]

                if line_wav.device != torch.device("cpu"):
                    line_wav = line_wav.cpu()

                line_audios.append(tensor_to_comfyui_audio(line_wav, sample_rate))
                pbar.update_absolute(i + 1, len(turns))

            total_duration = sum(a["waveform"].shape[-1] for a in line_audios) / sample_rate
            message = f"Generated {len(turns)} lines, {total_duration:.2f}s total (before post-processing/stitching)."
            if seed_log:
                message += "\nSeeds:\n" + "\n".join(seed_log)
            elif seed >= 0:
                message += f"\nSeed (whole script): {seed}"
            print(f"\n{'='*60}")
            print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] {message}")
            print(f"{'='*60}\n")

            line_texts_json = json.dumps([content for (_, _, content) in turns], ensure_ascii=False)
            return (line_audios, message, line_texts_json)

        except Exception as e:
            error_msg = f"Error in speaker instruct2 dialog: {str(e)}"
            print(f"\n{'='*60}")
            print(f"[FL CosyVoice3 SpeakerInstruct2Dialog] ERROR: {error_msg}")
            import traceback
            traceback.print_exc()
            print(f"{'='*60}\n")

            empty_audio = {"waveform": torch.zeros(1, 1, sample_rate), "sample_rate": sample_rate}
            return ([empty_audio], error_msg, "[]")
