"""Отдача аудиофайлов и список speaker-пресетов."""
import os

from aiohttp import web

from _speaker_presets import get_speaker_dir, list_speaker_presets


routes = web.RouteTableDef()


@routes.get("/fl_cosyvoice3/script_library/audio")
async def fl_cosyvoice3_script_library_audio(request):
    path = request.query.get("path", "").strip()
    if not path or not os.path.isfile(path):
        return web.json_response({"error": f"not a file: {path}"}, status=404)
    return web.FileResponse(path)


@routes.get("/fl_cosyvoice3/script_library/speaker_presets")
async def fl_cosyvoice3_script_library_speaker_presets(request):
    presets = [p for p in list_speaker_presets() if p != "[none]"]
    return web.json_response({"presets": presets, "dir": get_speaker_dir()})