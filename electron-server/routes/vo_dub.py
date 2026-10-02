"""Все роуты VO Dub: tree/rows/mark_*/seed_roles/use_original/apply_effect/
render_row/line_history."""
import os
import random
import traceback
from datetime import datetime, timezone

from aiohttp import web

from _line_audio import (
    list_version_files,
    make_version_filename,
    next_version_number,
    promote_version,
)
from _speaker_presets import cosyvoice_models_dir as _cosyvoice_models_dir
from _speaker_presets import get_speaker_dir
from _vo_dub_helpers import (
    _to_float,
    audio_dry_path,
    audio_en_path,
    audio_ru_path,
    bucket_rows,
    build_tree,
    effective_russian,
    mark_dub_role_stale,
    read_dataset,
    read_dub_state,
    resolved_speaker,
    row_hash,
    seed_dub_roles,
    uses_original_as_sample,
    write_dry_copy,
    write_dub_state,
)


DEFAULT_TAKE_COUNT = 3

routes = web.RouteTableDef()


@routes.get("/fl_cosyvoice3/vo_dub/tree")
async def fl_cosyvoice3_vo_dub_tree(request):
    root = request.query.get("path", "").strip()
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    try:
        return web.json_response(build_tree(root))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})


@routes.get("/fl_cosyvoice3/vo_dub/rows")
async def fl_cosyvoice3_vo_dub_rows(request):
    root = request.query.get("path", "").strip()
    bucket = request.query.get("bucket", "").strip()
    status_filter = request.query.get("status", "").strip()
    if not root:
        return web.json_response({"error": "path is required"})
    if not bucket:
        return web.json_response({"error": "bucket is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    try:
        rows = bucket_rows(root, bucket, status_filter)
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    return web.json_response({"root": root, "bucket": bucket, "rows": rows})


@routes.post("/fl_cosyvoice3/vo_dub/mark_role_stale")
async def fl_cosyvoice3_vo_dub_mark_role_stale(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    role_code = (data.get("role_code") or "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not role_code:
        return web.json_response({"error": "role_code is required"})
    return web.json_response(mark_dub_role_stale(root, role_code))


@routes.post("/fl_cosyvoice3/vo_dub/mark_rendered")
async def fl_cosyvoice3_vo_dub_mark_rendered(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    content_hash = (data.get("hash") or "").strip()
    duration_s = _to_float(data.get("duration_s"))
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key or not content_hash:
        return web.json_response({"error": "audio_key and hash are required"})

    state = read_dub_state(root)
    entry = state["rows"].setdefault(audio_key, {})
    entry["hash"] = content_hash
    if duration_s is not None:
        entry["rendered_duration_s"] = duration_s
    write_dub_state(root, state)
    return web.json_response({"ok": True})


@routes.post("/fl_cosyvoice3/vo_dub/seed_roles")
async def fl_cosyvoice3_vo_dub_seed_roles(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    try:
        return web.json_response(seed_dub_roles(root))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})


@routes.post("/fl_cosyvoice3/vo_dub/use_original")
async def fl_cosyvoice3_vo_dub_use_original(request):
    """
    Копирует EN-оригинал в RU-выход без TTS-рендера. Dry-копия пишется тоже,
    чтобы последующий apply_effect (effect/normalize/speed_match) мог
    работать с тем же файлом. Помечает строку как manually_done.
    """
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()

    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})

    en_path = audio_en_path(root, audio_key)
    if not os.path.isfile(en_path):
        return web.json_response({"error": f"no EN reference: {en_path}"})

    ru_path = audio_ru_path(root, audio_key)
    ru_dir = os.path.dirname(ru_path)
    if ru_dir:
        os.makedirs(ru_dir, exist_ok=True)

    dry_path = audio_dry_path(root, audio_key)
    dry_dir = os.path.dirname(dry_path)
    if dry_dir:
        os.makedirs(dry_dir, exist_ok=True)

    import shutil
    try:
        shutil.copyfile(en_path, ru_path)
        shutil.copyfile(en_path, dry_path)
    except OSError as e:
        return web.json_response({"error": f"copy failed: {e}"})

    state = read_dub_state(root)
    entry = state["rows"].setdefault(audio_key, {})
    entry["manually_done"] = True
    entry["source"] = "original"
    entry.pop("active_version", None)
    write_dub_state(root, state)

    return web.json_response({"ok": True, "path": ru_path})


@routes.post("/fl_cosyvoice3/vo_dub/apply_effect")
async def fl_cosyvoice3_vo_dub_apply_effect(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    effect = (data.get("effect") or "").strip()
    normalize = data.get("normalize", False)
    normalize_db = data.get("normalize_db", -20.0)
    speed_match = data.get("speed_match", False)
    version = data.get("version")

    if not isinstance(normalize, bool):
        return web.json_response({"error": "'normalize' must be a boolean"})
    if not isinstance(speed_match, bool):
        return web.json_response({"error": "'speed_match' must be a boolean"})
    if isinstance(normalize_db, bool) or not isinstance(normalize_db, (int, float)):
        return web.json_response({"error": "'normalize_db' must be a number"})
    if normalize_db < -40.0 or normalize_db > 0.0:
        return web.json_response({"error": "'normalize_db' must be between -40 and 0"})

    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})

    if version is not None:
        try:
            version = int(version)
        except (TypeError, ValueError):
            return web.json_response({"error": "version must be an integer"})

        versions_dir = os.path.join(root, "_dub_versions")
        match = next(
            (v for v in list_version_files(versions_dir, audio_key) if v[0] == version),
            None,
        )
        if match is None:
            return web.json_response(
                {"error": f"no version {version} for audio_key {audio_key}"}
            )
        _, _, _, filename = match
        source_path = os.path.join(versions_dir, filename)
    else:
        source_path = audio_dry_path(root, audio_key)

    if not os.path.isfile(source_path):
        return web.json_response({"error": f"no source take: {source_path}"})

    try:
        import torch
        import soundfile as sf_local
        from _audio_utils import save_wav, normalize_loudness, change_speed
        from _audio_effects import apply_named_effect
    except ImportError as e:
        return web.json_response({"error": f"couldn't load the audio engine: {e}"})

    try:
        data_np, sample_rate = sf_local.read(source_path, dtype="float32", always_2d=True)
    except Exception as e:
        return web.json_response({"error": f"couldn't read source take: {e}"})
    wav = torch.from_numpy(data_np.T.copy())

    if effect:
        wav = apply_named_effect(wav, sample_rate, effect)
    if normalize:
        wav, _gain = normalize_loudness(wav, sample_rate, target_db=float(normalize_db))
    if speed_match:
        en_path = audio_en_path(root, audio_key)
        if os.path.isfile(en_path):
            try:
                en_info = sf_local.info(en_path)
                ru_len = float(wav.shape[-1]) / sample_rate
                en_len = float(en_info.duration)
                if en_len > 0:
                    ratio = ru_len / en_len
                    if abs(ratio - 1.0) > 0.001:
                        wav = change_speed(wav, sample_rate, ratio)
            except Exception as e:
                print(f"[electron-server] speed_match failed for {audio_key}: {e}")

    ru_path = audio_ru_path(root, audio_key)
    try:
        ru_dir = os.path.dirname(ru_path)
        if ru_dir:
            os.makedirs(ru_dir, exist_ok=True)
        save_wav(wav, sample_rate, ru_path)
    except OSError as e:
        return web.json_response({"error": f"couldn't write {ru_path}: {e}"})

    return web.json_response({"ok": True, "source": os.path.basename(source_path)})


@routes.post("/fl_cosyvoice3/vo_dub/render/row")
async def fl_cosyvoice3_vo_dub_render_row(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})
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

    try:
        rows = read_dataset(root)
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    row = next((r for r in rows if r.get("audio_key") == audio_key), None)
    if row is None:
        return web.json_response({"error": f"audio_key not found: {audio_key}"})
    state = read_dub_state(root)
    state_entry = state["rows"].get(audio_key)
    text = effective_russian(row, state_entry)
    if not text:
        return web.json_response({"error": "no Russian text yet for this row"})
    instruct = (state_entry or {}).get("instruct", "")
    speaker = resolved_speaker(row, state_entry, None)
    if not speaker:
        return web.json_response({"error": "no speaker resolved for this row"})
    content_hash = row_hash(row, state_entry, None, bool(state.get("use_original_default")))
    use_original = uses_original_as_sample(state_entry, bool(state.get("use_original_default")))
    if use_original:
        speaker_for_tts = ""
    else:
        speaker_for_tts = speaker

    versions_dir = os.path.join(root, "_dub_versions")
    os.makedirs(versions_dir, exist_ok=True)
    models_dir = _cosyvoice_models_dir()
    if not models_dir:
        return web.json_response({"error": "no CosyVoice models dir found"})
    speaker_dir = get_speaker_dir()

    try:
        import _tts_engine
        import _line_history
        results = []
        created_at = datetime.now(timezone.utc).isoformat()
        for seed in seeds:
            version = next_version_number(versions_dir, audio_key)
            version_path = os.path.join(versions_dir, make_version_filename(audio_key, version, content_hash, seed))
            reference_path = audio_en_path(root, audio_key) if use_original else None
            duration_s, sample_rate = _tts_engine.synthesize(
                models_dir, speaker_dir, speaker_for_tts, instruct, text,
                version_path, seed=seed, reference_audio_path=reference_path,
            )
            _line_history.append_version(
                versions_dir, audio_key, version, content_hash, seed,
                speaker, instruct, text, created_at,
            )
            results.append({
                "version": version, "seed": seed, "path": version_path,
                "duration_s": round(duration_s, 3), "sample_rate": sample_rate,
            })
    except Exception as e:
        traceback.print_exc()
        return web.json_response({"error": f"synthesis failed: {e}"})

    chosen_version = results[0]["version"]
    out_path = promote_version(versions_dir, audio_key, chosen_version, audio_ru_path(root, audio_key))
    try:
        write_dry_copy(root, audio_key, out_path)
    except Exception as e:
        print(f"[electron-server] WARNING: write_dry_copy failed: {e}")
    _line_history.set_chosen_version(versions_dir, audio_key, chosen_version)

    # Сбрасываем маркер "source: original" — это уже настоящий рендер.
    state = read_dub_state(root)
    entry = state["rows"].setdefault(audio_key, {})
    entry.pop("source", None)
    write_dub_state(root, state)

    return web.json_response({
        "ok": True, "path": out_path, "hash": content_hash,
        "chosen_version": chosen_version, "takes": results,
    })


@routes.get("/fl_cosyvoice3/vo_dub/line_history")
async def fl_cosyvoice3_vo_dub_line_history(request):
    root = request.query.get("root", "").strip()
    audio_key = request.query.get("audio_key", "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})
    import _line_history
    lines_dir = os.path.join(root, "_dub_versions")
    entry = _line_history.get_entry(lines_dir, audio_key) or {"chosen_version": None, "versions": []}
    return web.json_response(entry)


@routes.get("/fl_cosyvoice3/vo_dub/line_history/counts")
async def fl_cosyvoice3_vo_dub_line_history_counts(request):
    root = request.query.get("root", "").strip()
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    import _line_history
    lines_dir = os.path.join(root, "_dub_versions")
    return web.json_response(_line_history.version_counts(lines_dir))


@routes.post("/fl_cosyvoice3/vo_dub/line_history/choose")
async def fl_cosyvoice3_vo_dub_line_history_choose(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    root = (data.get("root") or "").strip()
    audio_key = (data.get("audio_key") or "").strip()
    try:
        version = int(data.get("version"))
    except (TypeError, ValueError):
        return web.json_response({"error": "version must be an integer"})
    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not audio_key:
        return web.json_response({"error": "audio_key is required"})
    import _line_history
    lines_dir = os.path.join(root, "_dub_versions")
    match = next((v for v in list_version_files(lines_dir, audio_key) if v[0] == version), None)
    if match is None:
        return web.json_response({"error": f"no version {version} for audio_key {audio_key}"})
    _, content_hash, _, _ = match
    try:
        out_path = promote_version(lines_dir, audio_key, version, audio_ru_path(root, audio_key))
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)})
    _line_history.set_chosen_version(lines_dir, audio_key, version)

    # Сброс маркера "source: original" — выбрана конкретная версия рендера.
    state = read_dub_state(root)
    entry = state["rows"].setdefault(audio_key, {})
    entry.pop("source", None)
    entry["active_version"] = version
    write_dub_state(root, state)

    return web.json_response({"ok": True, "path": out_path, "chosen_version": version})