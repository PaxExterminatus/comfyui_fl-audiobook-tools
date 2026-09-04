"""
FL CosyVoice3 Audio Post-Process Node

Post-synthesis cleanup: trims the onset click/silence CosyVoice's vocoder
tends to leave at the start (and often the end) of a clip (see
COSYVOICE_ONSET_CLICK.md), smooths the cut with a short fade, and
normalizes loudness to a target RMS (with a peak safety ceiling).

Works the same way whether `audio` is:
- a single AUDIO from any synthesis node (Zero-Shot, Cross-Lingual, Speaker
  Clone, Instruct2, Voice Conversion, Speaker Instruct2) -- processed and
  returned as-is, nothing to stitch.
- a LIST of AUDIO, e.g. FL CosyVoice3 Speaker Instruct2 Dialog's per-line
  output (one item per script line) -- each item is trimmed/faded/
  normalized individually, then all of them are concatenated back-to-back
  with pause_between_lines of silence inserted between each, into one
  track.

This is what lets the same trim/normalize/stitch logic serve every
synthesis node in the plugin instead of being locked inside Dialog alone.

The one thing this node can NOT do that Dialog's own internal onset trim
still does: catch a click sitting at an INTERNAL chunk boundary inside one
long line (CosyVoice's text_frontend splits a long line into several
separate decodes, each with its own onset-click risk). This node only ever
sees a clip after its chunks are already concatenated, so it can only trim
the very start/end of each clip it receives. Dialog's trim_line_onset
input stays there for that reason.

See AUDIO_POST_PROCESS_BACKLOG.md for ideas considered but not (yet)
implemented here.
"""
import torch
import os
import json
from typing import Any, Dict, List

try:
    from ._audio_utils import (
        fade_edges,
        normalize_loudness_rms,
        save_wav,
        tensor_to_comfyui_audio,
        trim_leading_silence,
        trim_trailing_silence,
    )
except (ImportError, ValueError):
    from _audio_utils import (
        fade_edges,
        normalize_loudness_rms,
        save_wav,
        tensor_to_comfyui_audio,
        trim_leading_silence,
        trim_trailing_silence,
    )


class FL_CosyVoice3_AudioPostProcess:
    """Trim onset click (start + end) + fade edges + normalize loudness for one
    AUDIO, or a whole list of them (auto-stitched with pause_between_lines into
    a single track). Also reports what it did per item via the `report` output."""

    RETURN_TYPES = ("AUDIO", "STRING")
    RETURN_NAMES = ("audio", "report")
    OUTPUT_TOOLTIPS = (
        "The processed (and, if given a list, stitched) audio.",
        "Per-item report: how much was trimmed off each end, whether it was faded, "
        "and the loudness gain applied. Also viewable full-screen via the node's own "
        "\"📄 Report\" button, no need to wire this up just to read it.",
    )
    FUNCTION = "process"
    CATEGORY = "🔊FL CosyVoice3/Synthesis"
    INPUT_IS_LIST = True

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "audio": ("AUDIO", {
                    "tooltip": "Одно аудио с любой ноды синтеза, или список (например, выход FL "
                               "CosyVoice3 Speaker Instruct2 Dialog) — тогда каждый элемент "
                               "обрабатывается отдельно, а затем все склеиваются в один трек."
                }),
                "trim_line_onset": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "Обрезает щелчок+тишину в НАЧАЛЕ каждого клипа (см. "
                               "COSYVOICE_ONSET_CLICK.md). Видит только начало клипа целиком, а не "
                               "границы внутренних чанков длинной строки -- за это по-прежнему "
                               "отвечает trim_line_onset самого Dialog."
                }),
                "trim_line_tail": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "То же самое, но в КОНЦЕ каждого клипа -- CosyVoice иногда "
                               "оставляет похожий артефакт/лишнюю тишину и на хвосте, не только в "
                               "начале."
                }),
                "trim_max_ms": ("FLOAT", {
                    "default": 600.0, "min": 0.0, "max": 2000.0, "step": 10.0,
                    "tooltip": "Предохранитель: сколько максимум миллисекунд можно срезать с "
                               "каждого края клипа, даже если чистое начало/конец не нашлись в "
                               "этом бюджете. Общий для начала и конца."
                }),
                "fade_ms": ("FLOAT", {
                    "default": 8.0, "min": 0.0, "max": 100.0, "step": 1.0,
                    "tooltip": "Короткий линейный fade-in/fade-out на краях каждого клипа (после "
                               "обрезки) -- сглаживает щелчок, который иногда остаётся от жёсткого "
                               "среза. 0 = выключить."
                }),
                "normalize_loudness": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "Выравнивает громкость каждого клипа к общему целевому RMS (с "
                               "потолком по пикам, чтобы не клипповало) -- до склейки."
                }),
                "target_rms_db": ("FLOAT", {
                    "default": -20.0, "min": -40.0, "max": -6.0, "step": 1.0,
                    "tooltip": "Целевой уровень громкости (RMS, dBFS), к которому приводится "
                               "каждый клип."
                }),
                "pause_between_lines": ("FLOAT", {
                    "default": 0.3, "min": 0.0, "max": 3.0, "step": 0.05,
                    "tooltip": "Тишина между клипами при склейке. Ни на что не влияет, если "
                               "пришёл всего один клип -- склеивать не с чем."
                }),
            },
            "optional": {
                "line_texts_json": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Выход line_texts_json от FL CosyVoice3 Speaker Instruct2 Dialog "
                               "(JSON-массив текста каждой строки, тем же порядком, что и audio). "
                               "Нужен только вместе с script_folder + script_base_name ниже -- "
                               "тогда узел пишет файл тайминга по строкам (используется для "
                               "синхронизации проигрывания со списком строк в редакторе). Без него "
                               "склейка/обработка работает как обычно, файл тайминга просто не "
                               "создаётся."
                }),
                "script_folder": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Выход folder_path от FL CosyVoice3 Script Library -- папка акта, "
                               "где лежит _audio\\. Файл тайминга пишется в "
                               "<script_folder>\\_audio\\timing\\<script_base_name>.json."
                }),
                "script_base_name": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Выход filename от FL CosyVoice3 Script Library -- имя скрипта без "
                               "суффикса/расширения, используется как имя файла тайминга."
                }),
                "line_index_override": ("INT", {
                    "forceInput": True,
                    "tooltip": "Служебное поле для кнопки \"🔁 Переозвучить\" в редакторе строк -- "
                               "когда пришёл ОДИН клип (переозвучка одной строки), это стабильный id "
                               "этой строки (не позиция в сценарии), чтобы файл записался как "
                               "_audio\\lines\\<script>\\id<N>.wav и редактор мог найти его снова после "
                               "слияния/удаления/перестановки строк. Не подключён -- обычная нумерация "
                               "по порядку (полный рендер). Управляется автоматически через очередь "
                               "редактора -- подключать руками не нужно."
                }),
            }
        }

    def process(
        self,
        audio: List[Dict[str, Any]],
        trim_line_onset: List[bool],
        trim_line_tail: List[bool],
        trim_max_ms: List[float],
        fade_ms: List[float],
        normalize_loudness: List[bool],
        target_rms_db: List[float],
        pause_between_lines: List[float],
        line_texts_json: List[str] = [""],
        script_folder: List[str] = [""],
        script_base_name: List[str] = [""],
        line_index_override: List[int] = [-1],
    ):
        # INPUT_IS_LIST=True wraps EVERY input in a list, including plain
        # widget scalars -- those are single settings for this whole call,
        # not meant to vary per audio item, so just take index 0.
        do_trim_onset = trim_line_onset[0]
        do_trim_tail = trim_line_tail[0]
        max_trim = trim_max_ms[0]
        fade_len_ms = fade_ms[0]
        do_normalize = normalize_loudness[0]
        target_db = target_rms_db[0]
        pause_s = pause_between_lines[0]
        line_texts_str = (line_texts_json[0] or "").strip()
        timing_folder = (script_folder[0] or "").strip()
        timing_base_name = (script_base_name[0] or "").strip()
        index_override = line_index_override[0] if line_index_override else -1

        if not audio:
            raise ValueError("FL CosyVoice3 Audio Post-Process: no audio received.")

        sample_rate = audio[0]["sample_rate"]
        pause_samples = int(pause_s * sample_rate)

        # Per-line start/end (seconds) in the FINAL stitched track, so the
        # line editor can highlight/auto-scroll to the currently-playing
        # line and let a "▶" jump straight to it. Cheap to collect here --
        # this loop already walks every item to build `pieces` below, this
        # just also tracks a running sample cursor alongside it. Written out
        # near the end of this function, only if the caller wired enough
        # info to know where/what to name the file (see INPUT_TYPES).
        cursor_samples = 0
        timing_lines = []
        try:
            line_texts = json.loads(line_texts_str) if line_texts_str else []
        except json.JSONDecodeError:
            line_texts = []

        # Per-line files, one clip per item -- lets the line editor's "🔁
        # Переозвучить" button resynthesize just ONE line later and re-stitch
        # from these instead of re-running the whole script. index_override
        # (>= 0) is set by that same feature when re-voicing a single line
        # through this same node: audio always arrives as a length-1 list in
        # that case, and the enumerate() position below (always 0) is NOT
        # the line's real position in the script, so it overrides which
        # filename gets written -- everything else about single-item
        # processing is unaffected.
        lines_dir = None
        if timing_folder and timing_base_name:
            lines_dir = os.path.join(timing_folder, "_audio", "lines", timing_base_name)
            try:
                os.makedirs(lines_dir, exist_ok=True)
            except OSError as e:
                print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't create lines dir: {e}")
                lines_dir = None

        # On a FULL render (never for a single re-voiced line -- that would
        # wrongly nuke every other line's file), delete any leftover
        # POSITIONAL file (0000.wav..) whose index is >= this run's line
        # count -- pure disk hygiene at this point (nodes/script_library.py's
        # commit_full_render/stitch_lines only ever touch the exact ids/
        # positions the line editor tells them about, so a stray file here
        # can't corrupt anything the way it used to before per-line files
        # were addressed by stable id instead of raw directory contents),
        # but a shortened script would otherwise leave these behind forever.
        if lines_dir is not None and not (len(audio) == 1 and index_override >= 0):
            try:
                for f in os.listdir(lines_dir):
                    if not f.lower().endswith(".wav"):
                        continue
                    try:
                        idx = int(os.path.splitext(f)[0])
                    except ValueError:
                        continue
                    if idx >= len(audio):
                        os.remove(os.path.join(lines_dir, f))
            except OSError as e:
                print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't clean up stale line files: {e}")
                lines_dir = None

        pieces = []
        report_lines = [f"{len(audio)} item(s), sample_rate={sample_rate}"]
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

            if do_trim_tail:
                wav, trimmed_ms = trim_trailing_silence(wav, sample_rate, max_trim_ms=max_trim)
                if trimmed_ms > 0:
                    cap_hit = trimmed_ms >= max_trim - 1.0
                    notes.append(f"trimmed {trimmed_ms:.0f}ms end" + (" [hit cap]" if cap_hit else ""))

            if fade_len_ms > 0:
                wav = fade_edges(wav, sample_rate, fade_ms=fade_len_ms)
                notes.append(f"faded {fade_len_ms:.0f}ms edges")

            if do_normalize:
                pre_rms = torch.sqrt(torch.mean(wav.float() ** 2) + 1e-12)
                wav = normalize_loudness_rms(wav, target_rms_db=target_db)
                post_rms = torch.sqrt(torch.mean(wav.float() ** 2) + 1e-12)
                gain_db = 20 * torch.log10((post_rms + 1e-9) / (pre_rms + 1e-9))
                notes.append(f"loudness gain {gain_db:+.1f}dB")

            line = f"Item {i + 1}/{len(audio)}: " + (", ".join(notes) if notes else "no changes")
            report_lines.append(line)
            print(f"[FL CosyVoice3 AudioPostProcess] {line}")

            is_single_override = len(audio) == 1 and index_override >= 0
            file_index = index_override if is_single_override else i
            # A single re-voiced line writes to the STABLE-id filename the
            # line editor's per-line state addresses it by (id<N>.wav --
            # deliberately a different shape than the plain positional
            # name a full render uses, so the two naming schemes can never
            # collide); a full render still writes positional names, later
            # converted to id<N>.wav by the editor's commit step (see
            # nodes/script_library.py's commit_full_render) once every
            # line's file is in place.
            if lines_dir is not None:
                filename = f"id{file_index}.wav" if is_single_override else f"{file_index:04d}.wav"
                try:
                    save_wav(wav, sample_rate, os.path.join(lines_dir, filename))
                except OSError as e:
                    print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't save line {file_index}: {e}")

            line_samples = wav.shape[-1]
            timing_lines.append({
                "index": file_index,
                "start": round(cursor_samples / sample_rate, 3),
                "end": round((cursor_samples + line_samples) / sample_rate, 3),
                "text": line_texts[i] if i < len(line_texts) else "",
            })
            cursor_samples += line_samples

            pieces.append(wav)
            if pause_samples > 0 and i < len(audio) - 1:
                pause_shape = wav.shape[:-1] + (pause_samples,)
                pieces.append(wav.new_zeros(pause_shape))
                cursor_samples += pause_samples

        combined = torch.cat(pieces, dim=-1) if len(pieces) > 1 else pieces[0]
        duration = combined.shape[-1] / sample_rate
        report_lines.append(f"Total: {duration:.2f}s")
        report = "\n".join(report_lines)
        print(f"[FL CosyVoice3 AudioPostProcess] Processed {len(audio)} item(s) -> {duration:.2f}s")

        # Timing manifest for the line editor's playback sync (highlight +
        # auto-scroll + "▶ jump to this line", see web/line_editor.js).
        # Written under a fixed name per SCRIPT (not per rendered take,
        # which Save Audio names independently and this node has no way to
        # predict) -- so it's always "the timing for the latest render of
        # this script", overwritten each time. Silently skipped if the
        # caller didn't wire enough to know where/what to name it (e.g. a
        # single non-Dialog clip with nothing to time-sync), AND skipped
        # for a single re-voiced line (index_override >= 0): this run only
        # ever sees ONE line, so a manifest built from it would clobber
        # every other line's timing -- the re-voice merge endpoint
        # (nodes/script_library.py) rebuilds the full manifest afterward
        # from every line's actual file once this one is back in place.
        if line_texts and timing_folder and timing_base_name and not (len(audio) == 1 and index_override >= 0):
            try:
                timing_dir = os.path.join(timing_folder, "_audio", "timing")
                os.makedirs(timing_dir, exist_ok=True)
                timing_path = os.path.join(timing_dir, f"{timing_base_name}.json")
                with open(timing_path, "w", encoding="utf-8") as f:
                    json.dump({"lines": timing_lines}, f, ensure_ascii=False, indent=2)
                print(f"[FL CosyVoice3 AudioPostProcess] Wrote timing manifest: {timing_path}")
            except OSError as e:
                print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't write timing manifest: {e}")

        result_audio = tensor_to_comfyui_audio(combined, sample_rate)
        # "ui" surfaces the report to the node's own "📄 Report" full-screen
        # viewer (web/audio_post_process.js, via onExecuted) without forcing
        # the user to wire the `report` output into a separate text node
        # just to read it -- "result" is the normal (audio, report) tuple.
        return {"ui": {"report": [report]}, "result": (result_audio, report)}
