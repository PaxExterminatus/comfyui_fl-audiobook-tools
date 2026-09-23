"""
FL CosyVoice3 Audio Post-Process Node

Post-synthesis cleanup: trims the onset click/silence CosyVoice's vocoder
tends to leave at the start (and often the end) of a clip (see
COSYVOICE_ONSET_CLICK.md), smooths the cut with a short fade, and
normalizes loudness to a target RMS (with a peak safety ceiling).

Works the same way whether `audio` is a single AUDIO from any synthesis
node, or a LIST of AUDIO (e.g. FL CosyVoice3 Speaker Instruct2 Dialog's
per-line output, one item per script line) -- each item is trimmed/faded/
normalized and written to its own per-line file INDEPENDENTLY, never
concatenated. Building the one final scene track is exclusively the "✅
Done" button's job now (nodes/script_library.py's stitch_lines, reading
these per-line files back once every one of them matches its line's
current content) -- this node used to ALSO concatenate every item into one
track + write a timing manifest on every run, which was pure duplicate
work stitch_lines already does correctly (reading the verified, hash-
matched file per position, not whatever this node happened to be handed
this particular run), and just needed to be kept in sync by hand.

This is what lets the same trim/normalize logic serve every synthesis node
in the plugin instead of being locked inside Dialog alone.

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
    from ._audio_effects import apply_named_effect
    from . import _line_audio
except (ImportError, ValueError):
    from _audio_utils import (
        fade_edges,
        normalize_loudness_rms,
        save_wav,
        tensor_to_comfyui_audio,
        trim_leading_silence,
        trim_trailing_silence,
    )
    from _audio_effects import apply_named_effect
    import _line_audio


class FL_CosyVoice3_AudioPostProcess:
    """Trim onset click (start + end) + fade edges + normalize loudness for one
    AUDIO, or a whole list of them, EACH INDEPENDENTLY -- never concatenated.
    Also reports what it did per item via the `report` output."""

    RETURN_TYPES = ("AUDIO", "STRING")
    RETURN_NAMES = ("audio", "report")
    OUTPUT_IS_LIST = (True, False)
    # This node's REAL product is a file on disk (_audio\lines\<script>\
    # <position>_<hash>.wav), exactly like core's SaveAudio/SaveImage -- and
    # in ComfyUI only an OUTPUT_NODE is an execution root. Without this,
    # whether this node runs at all depends on something downstream of it
    # being an output node.
    #
    # A single-line re-voice deliberately strips every audio-saver node out
    # of its prompt (see web/script_library.js's stripDownstreamAudioSavers
    # -- otherwise that saver writes one 12-second line into _audio\ under
    # the script's own prefix, where it masquerades as the full scene take).
    # In a graph shaped Script Library -> Dialog -> Post-Process -> Save
    # Audio, that saver WAS the only output node on this branch, so
    # stripping it left the whole branch with nothing to pull it: ComfyUI
    # walked back from whatever other output node the graph had, never
    # reached Post-Process, and reported the prompt as executed
    # successfully having written nothing at all.
    OUTPUT_NODE = True
    OUTPUT_TOOLTIPS = (
        "The processed audio, one item per input item -- NOT concatenated (see the "
        "node's own docstring for why stitching moved to the \"✅ Done\" button).",
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
                               "CosyVoice3 Speaker Instruct2 Dialog) — каждый элемент "
                               "обрабатывается и сохраняется НЕЗАВИСИМО, без склейки в один трек "
                               "(склейка теперь только по кнопке «✅ Done»)."
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
                               "потолком по пикам, чтобы не клипповало)."
                }),
                "target_rms_db": ("FLOAT", {
                    "default": -20.0, "min": -40.0, "max": -6.0, "step": 1.0,
                    "tooltip": "Целевой уровень громкости (RMS, dBFS), к которому приводится "
                               "каждый клип."
                }),
            },
            "optional": {
                "line_texts_json": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Выход line_texts_json от FL CosyVoice3 Speaker Instruct2 Dialog "
                               "(JSON-массив текста каждой строки, тем же порядком, что и audio). "
                               "Используется как запасной источник для хеша имени файла, если "
                               "line_hashes_json ниже не подключён."
                }),
                "script_folder": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Выход folder_path от FL CosyVoice3 Script Library -- папка акта, "
                               "где лежит _audio\\lines\\<script>\\, куда пишется файл каждой строки."
                }),
                "script_base_name": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Выход filename от FL CosyVoice3 Script Library -- имя скрипта без "
                               "суффикса/расширения, задаёт папку _audio\\lines\\<это имя>\\."
                }),
                "line_index_override": ("INT", {
                    "forceInput": True,
                    "tooltip": "Служебное поле для кнопки \"🔁 Переозвучить\" в редакторе строк -- "
                               "когда пришёл ОДИН клип (переозвучка одной строки), это ТЕКУЩАЯ позиция "
                               "этой строки в сценарии (редактор сам следит, чтобы позиция не съезжала "
                               "при удалении/слиянии/разбиении строк). Не подключён -- обычная "
                               "нумерация по порядку (полный рендер). Управляется автоматически через "
                               "очередь редактора -- подключать руками не нужно."
                }),
                "line_hashes_json": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Выход line_hashes_json от FL CosyVoice3 Script Library -- JSON-массив "
                               "короткого хеша содержимого (голос+instruct+текст) каждой строки, тем "
                               "же порядком, что и audio. Записывается в имя каждого файла "
                               "(<позиция>_<хеш>.wav) -- редактор строк сравнивает его с хешем "
                               "ТЕКУЩЕГО содержимого строки, чтобы понять, нужна ли переозвучка, без "
                               "отдельного файла состояния. Не подключён -- используется хеш только "
                               "от текста (без голоса/instruct), это работает, но менее точно."
                }),
                "output_path_override": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Служебное поле для VO Dub Library: когда задан ПОЛНЫЙ путь к файлу, "
                               "клип пишется РОВНО туда, минуя схему <позиция>_<хеш>.wav целиком -- "
                               "нужно для дубляжа игр, где имя файла (audio_ru\\<audio_key>.wav) "
                               "задано внешним контрактом (см. nodes/vo_dub_library.py), а не этим "
                               "аддоном. Требует ровно ОДНОГО клипа на входе. Не подключён -- обычная "
                               "схема _audio\\lines\\<script>\\<позиция>_<хеш>.wav, как всегда."
                }),
                "effect_override": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Служебное поле для VO Dub Library: применяет именованный эффект "
                               "(см. nodes/_audio_effects.py, например \"radio\") к каждому клипу "
                               "ПОСЛЕ обрезки/fade/нормализации, перед сохранением. Пустая строка "
                               "или неизвестное имя = без эффекта."
                }),
                "dry_output_path_override": ("STRING", {
                    "forceInput": True,
                    "tooltip": "Служебное поле для VO Dub Library: если задано, клип СРАЗУ ПОСЛЕ "
                               "обрезки/fade/нормализации (но ДО effect_override) дополнительно "
                               "сохраняется и сюда, ещё раз, без эффекта -- эта \"сухая\" копия "
                               "позволяет /vo_dub/apply_effect потом сменить эффект в один клик, БЕЗ "
                               "повторного прогона всего графа синтеза. Требует ровно ОДНОГО клипа "
                               "на входе, как и output_path_override."
                }),
            }
        }

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        # This node's output isn't just the AUDIO it returns -- it's the
        # per-line file it writes. ComfyUI's cache only knows about node
        # INPUTS, so an identical prompt after that file was deleted OUTSIDE
        # the graph (the line editor's 🗑, or by hand in Explorer -- both
        # normal here) would be served straight from cache: no execution, no
        # re-write, and a "Prompt executed" that restored nothing. NaN never
        # equals itself, so this node always re-runs and the file on disk is
        # always brought back in line with what the graph says it should be.
        return float("nan")

    def process(
        self,
        audio: List[Dict[str, Any]],
        trim_line_onset: List[bool],
        trim_line_tail: List[bool],
        trim_max_ms: List[float],
        fade_ms: List[float],
        normalize_loudness: List[bool],
        target_rms_db: List[float],
        line_texts_json: List[str] = [""],
        script_folder: List[str] = [""],
        script_base_name: List[str] = [""],
        line_index_override: List[int] = [-1],
        line_hashes_json: List[str] = [""],
        output_path_override: List[str] = [""],
        effect_override: List[str] = [""],
        dry_output_path_override: List[str] = [""],
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
        line_texts_str = (line_texts_json[0] or "").strip()
        line_hashes_str = (line_hashes_json[0] or "").strip()
        timing_folder = (script_folder[0] or "").strip()
        timing_base_name = (script_base_name[0] or "").strip()
        index_override = line_index_override[0] if line_index_override else -1
        override_path = (output_path_override[0] or "").strip()
        effect_name = (effect_override[0] or "").strip()
        dry_override_path = (dry_output_path_override[0] or "").strip()

        # Unconditional per-run diagnostics. "The re-voice finished fine but
        # no file appeared" looks identical at the UI for at least four
        # different causes -- this node never executing at all (nothing in
        # the prompt pulled it), script_folder/script_base_name never
        # arriving (so nothing is written), the position landing somewhere
        # other than the row being re-voiced, or the hash differing from the
        # one the editor will look for. Only the first of those is even
        # visible from outside, and only by this block being absent. One
        # short header per queue is a cheap price for telling them apart.
        print(f"[FL CosyVoice3 AudioPostProcess] ---- run: {len(audio)} audio item(s) ----")
        print(f"[FL CosyVoice3 AudioPostProcess]   script_folder       = {timing_folder!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   script_base_name    = {timing_base_name!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   line_index_override = {index_override!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   line_hashes_json    = {line_hashes_str[:200]!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   line_texts_json     = {line_texts_str[:120]!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   output_path_override = {override_path!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   effect_override     = {effect_name!r}")
        print(f"[FL CosyVoice3 AudioPostProcess]   dry_output_path_override = {dry_override_path!r}")

        if not audio:
            raise ValueError("FL CosyVoice3 Audio Post-Process: no audio received.")
        if override_path and len(audio) != 1:
            raise ValueError(
                f"FL CosyVoice3 Audio Post-Process: output_path_override is set but {len(audio)} "
                f"clips arrived -- it only ever writes exactly one file, at exactly the path given."
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

        # Per-line files, one clip per item -- lets the line editor's "🔁
        # Переозвучить" button resynthesize just ONE line later, and "✅
        # Done" stitch every line's file into the final track (see
        # nodes/_line_audio.py for the <position>_<hash>.wav naming this
        # writes, and nodes/script_library.py's stitch_lines for the actual
        # stitch). index_override (>= 0) is set by the re-voice feature when
        # re-voicing a single line through this same node: audio always
        # arrives as a length-1 list in that case, and the enumerate()
        # position below (always 0) is NOT the line's real position in the
        # script, so it overrides which position gets written -- everything
        # else about single-item processing is unaffected.
        lines_dir = None
        if override_path:
            # A fixed, externally-dictated filename (see the tooltip above)
            # -- there's no <script>/<position> scheme to derive here, so
            # none of the lines_dir/index_override machinery below applies.
            print(f"[FL CosyVoice3 AudioPostProcess]   writing to output_path_override, "
                  f"bypassing the _audio\\lines\\ scheme entirely")
        elif timing_folder and timing_base_name:
            lines_dir = os.path.join(timing_folder, "_audio", "lines", timing_base_name)
            try:
                os.makedirs(lines_dir, exist_ok=True)
            except OSError as e:
                print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't create lines dir: {e}")
                lines_dir = None
        if not override_path:
            if lines_dir is None:
                print("[FL CosyVoice3 AudioPostProcess]   lines_dir = <none> -- NO per-line file will be "
                      "written this run. Wire Script Library's folder_path -> script_folder and "
                      "filename -> script_base_name.")
            else:
                print(f"[FL CosyVoice3 AudioPostProcess]   lines_dir = {lines_dir}")

        if not override_path and len(audio) == 1 and index_override < 0:
            # A per-line re-voice always stamps its real position (see
            # web/script_library.js's queueLineRevoice); a 1-item run
            # WITHOUT one is either a genuinely 1-line script or that stamp
            # failing to reach here, and the two are indistinguishable from
            # this side -- so say which assumption is being made rather than
            # silently writing over position 0.
            print("[FL CosyVoice3 AudioPostProcess]   NOTE: single item and no line_index_override "
                  "-- writing at position 0 (if this was a 🔁 re-voice, its position never reached "
                  "this node).")

        # On a FULL render (never for a single re-voiced line -- that would
        # wrongly nuke every other line's file), delete every file whose
        # POSITION is >= this run's line count -- pure disk hygiene, since a
        # shortened script (edited outside the line editor's own
        # delete/merge, which keeps positions in sync itself via
        # reorganize_lines) would otherwise leave these behind forever.
        # `len(audio) > 1` rather than "not a single re-voice": a 1-item run
        # is AMBIGUOUS -- it's either a genuinely 1-line script's full render
        # or a per-line re-voice whose index_override didn't reach us (a
        # front-end/prompt-wiring failure, which has happened: see
        # findPromptEntry in web/script_library.js). Reading the second case
        # as the first deletes every OTHER position, i.e. the whole rest of
        # the scene, to "clean up" after a render that never produced those
        # lines. A 1-line script keeping a stale leftover file is a trivially
        # recoverable cost next to that.
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

            if dry_override_path:
                # The pre-effect reference copy -- written EVERY run this
                # is wired, regardless of whether effect_override is set
                # this particular time, so it always reflects the LATEST
                # synthesized content. Lets a later Effect change reprocess
                # THIS file (see nodes/vo_dub_library.py's own
                # /vo_dub/apply_effect route) instead of re-running the
                # whole TTS graph just to switch which effect is baked in.
                try:
                    dry_dir = os.path.dirname(dry_override_path)
                    if dry_dir:
                        os.makedirs(dry_dir, exist_ok=True)
                    save_wav(wav, sample_rate, dry_override_path)
                except OSError as e:
                    print(f"[FL CosyVoice3 AudioPostProcess] WARNING: couldn't save dry take to "
                          f"{dry_override_path}: {e}")

            if effect_name:
                # AFTER trim/fade/normalize, on the already-clean take -- an
                # effect is a creative choice layered on top, not baked into
                # what the TTS itself produced (see _audio_effects.py's own
                # module docstring for why that order matters).
                wav = apply_named_effect(wav, sample_rate, effect_name)
                notes.append(f"effect: {effect_name}")

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
                # Falls back to hashing just the text when line_hashes_json
                # isn't wired (an older workflow that hasn't added the new
                # connection yet) -- the file still gets written under this
                # scheme, just without voice/instruct in its fingerprint, so
                # a role recast alone wouldn't be detected as making it stale.
                hash_source = "line_hashes_json" if i < len(line_hashes) else "text-only fallback"
                content_hash = (
                    line_hashes[i] if i < len(line_hashes)
                    else _line_audio.line_hash("", "", line_texts[i] if i < len(line_texts) else "")
                )
                # Deterministic path -- re-voicing a line whose content
                # (hence hash) hasn't changed overwrites this SAME file in
                # place, on purpose (see nodes/_line_audio.py's module
                # docstring): a line has exactly ONE current file, never a
                # growing history of every wording it's ever said.
                out_path = _line_audio.expected_path(lines_dir, position, content_hash)
                try:
                    save_wav(wav, sample_rate, out_path)
                    # Only after the NEW take is confirmed on disk -- deleting
                    # first and having the write fail would leave the line
                    # with nothing at all. A plain re-roll of unchanged
                    # content is a no-op here (the only file at this position
                    # already IS content_hash).
                    stale = _line_audio.delete_stale_at_position(lines_dir, position, content_hash)
                    # Confirms the write actually landed rather than assuming
                    # it did -- this exact path is what the line editor
                    # checks for to call the row voiced, so seeing it here is
                    # what makes "rendered but still shows unvoiced" a
                    # one-glance comparison instead of a guess.
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

        # "ui" surfaces the report to the node's own "📄 Report" full-screen
        # viewer (web/audio_post_process.js, via onExecuted) without forcing
        # the user to wire the `report` output into a separate text node
        # just to read it -- "result" is the normal (audio, report) tuple.
        # `audio` is a LIST here (OUTPUT_IS_LIST[0] = True) -- one item per
        # input item, never concatenated (see this node's own docstring).
        return {"ui": {"report": [report]}, "result": (result_audios, report)}
