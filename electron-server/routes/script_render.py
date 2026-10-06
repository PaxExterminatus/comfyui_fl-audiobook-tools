"""Прямой TTS-синтез для аудиокниги: /render/line и line_history ручки."""
import os
import random

from aiohttp import web

from _line_audio import (
    expected_path,
    line_hash,
    list_version_files,
    make_version_filename,
    next_version_number,
    promote_version,
)
from _speaker_presets import cosyvoice_models_dir as _cosyvoice_models_dir
from _speaker_presets import get_speaker_dir


DEFAULT_TAKE_COUNT = 3

routes = web.RouteTableDef()


@routes.post("/fl_cosyvoice3/script_library/render/line")
async def fl_cosyvoice3_render_line(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = (data.get("folder") or "").strip()
    base_name = (data.get("base_name") or "").strip()
    speaker = (data.get("speaker") or "").strip()
    instruct = data.get("instruct") or ""
    text = (data.get("text") or "").strip()
    try:
        position = int(data.get("position"))
    except (TypeError, ValueError):
        return web.json_response({"error": "position must be an integer"})
    try:
        takes = int(data.get("takes") or DEFAULT_TAKE_COUNT)
    except (TypeError, ValueError):
        return web.json_response({"error": "takes must be an integer"})
    if takes < 1:
        return web.json_response({"error": "takes must be at least 1"})
    explicit_seeds = data.get("seeds")
    if explicit_seeds is not None:
        if not isinstance(explicit_seeds, list) or len(explicit_seeds) != takes:
            return web.json_response({"error": f"seeds must be an array of exactly {takes} integers"})
        try:
            seeds = [int(s) for s in explicit_seeds]
        except (TypeError, ValueError):
            return web.json_response({"error": "seeds must be integers"})
    else:
        seeds = [random.randint(0, 2**31 - 1) for _ in range(takes)]

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})
    if not speaker:
        return web.json_response({"error": "speaker is required"})
    if not text:
        return web.json_response({"error": "text is required"})

    models_dir = _cosyvoice_models_dir()
    if not models_dir:
        return web.json_response({"error": "no CosyVoice models dir found (set FL_COSYVOICE_MODELS_DIR)"})

    content_hash = line_hash(speaker, instruct, text)
    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    speaker_dir = get_speaker_dir()

    try:
        import _tts_engine
        import _line_history

        results = []
        from datetime import datetime, timezone
        created_at = datetime.now(timezone.utc).isoformat()
        for seed in seeds:
            version = next_version_number(lines_dir, f"{position:04d}")
            version_path = os.path.join(lines_dir, make_version_filename(f"{position:04d}", version, content_hash, seed))
            duration_s, sample_rate = _tts_engine.synthesize(
                models_dir, speaker_dir, speaker, instruct, text, version_path, seed=seed
            )
            _line_history.append_version(
                lines_dir, position, version, content_hash, seed, speaker, instruct, text, created_at
            )
            results.append({
                "version": version, "seed": seed, "path": version_path,
                "duration_s": round(duration_s, 3), "sample_rate": sample_rate,
            })
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    except Exception as e:
        return web.json_response({"error": f"synthesis failed: {e}"})

    chosen_version = results[0]["version"]
    out_path = promote_version(lines_dir, f"{position:04d}", chosen_version, expected_path(lines_dir, position, content_hash))
    _line_history.set_chosen_version(lines_dir, position, chosen_version)

    return web.json_response({
        "ok": True,
        "path": out_path,
        "hash": content_hash,
        "chosen_version": chosen_version,
        "takes": results,
    })


@routes.get("/fl_cosyvoice3/script_library/line_history")
async def fl_cosyvoice3_script_library_line_history(request):
    folder = request.query.get("folder", "").strip()
    base_name = request.query.get("base_name", "").strip()
    try:
        position = int(request.query.get("position", ""))
    except (TypeError, ValueError):
        return web.json_response({"error": "position must be an integer"})
    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    import _line_history
    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    entry = _line_history.get_entry(lines_dir, position) or {"chosen_version": None, "versions": []}
    return web.json_response(entry)


@routes.get("/fl_cosyvoice3/script_library/line_history/counts")
async def fl_cosyvoice3_script_library_line_history_counts(request):
    folder = request.query.get("folder", "").strip()
    base_name = request.query.get("base_name", "").strip()
    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    import _line_history
    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    return web.json_response(_line_history.version_counts(lines_dir))


@routes.post("/fl_cosyvoice3/script_library/line_history/choose")
async def fl_cosyvoice3_script_library_line_history_choose(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    folder = (data.get("folder") or "").strip()
    base_name = (data.get("base_name") or "").strip()
    try:
        position = int(data.get("position"))
        version = int(data.get("version"))
    except (TypeError, ValueError):
        return web.json_response({"error": "position and version must be integers"})
    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    import _line_history
    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    key = f"{position:04d}"
    match = next((v for v in list_version_files(lines_dir, key) if v[0] == version), None)
    if match is None:
        return web.json_response({"error": f"no version {version} at position {position}"})
    _, content_hash, _, _ = match
    try:
        out_path = promote_version(lines_dir, key, version, expected_path(lines_dir, position, content_hash))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    _line_history.set_chosen_version(lines_dir, position, version)
    return web.json_response({"ok": True, "path": out_path, "chosen_version": version})