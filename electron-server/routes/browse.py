"""Список директорий/файлов для диалога выбора папки."""
import os

from aiohttp import web

from _cors import windows_drives as _windows_drives


routes = web.RouteTableDef()


@routes.get("/fl_cosyvoice3/browse/list_dir")
async def browse_list_dir(request):
    raw_path = request.query.get("path", "").strip()
    ext = request.query.get("ext", "").strip().lower()

    if not raw_path:
        return web.json_response({"path": "", "parent": None, "dirs": [], "files": [], "drives": _windows_drives()})

    if not os.path.isdir(raw_path):
        return web.json_response({"error": f"not a folder: {raw_path}"})

    try:
        entries = os.listdir(raw_path)
    except OSError as e:
        return web.json_response({"error": str(e)})

    dirs = sorted([e for e in entries if os.path.isdir(os.path.join(raw_path, e))], key=str.lower)
    files = sorted(
        [e for e in entries if os.path.isfile(os.path.join(raw_path, e)) and (not ext or e.lower().endswith(ext))],
        key=str.lower,
    )
    file_mtimes = {}
    for f in files:
        try:
            file_mtimes[f] = os.path.getmtime(os.path.join(raw_path, f))
        except OSError:
            pass

    normalized = raw_path.rstrip("\\/") or raw_path
    parent = os.path.dirname(normalized)
    is_drive_root = os.name == "nt" and len(normalized) <= 3 and normalized[1:3] in (":", ":\\")
    if is_drive_root:
        parent = ""
    elif parent == normalized:
        parent = None

    return web.json_response({
        "path": raw_path,
        "parent": parent,
        "dirs": dirs,
        "files": files,
        "file_mtimes": file_mtimes,
        "drives": [],
    })