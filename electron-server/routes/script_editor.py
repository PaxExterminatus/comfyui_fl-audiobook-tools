"""Чтение/запись текстовых файлов для редактора скриптов."""
import os

from aiohttp import web


routes = web.RouteTableDef()


@routes.get("/fl_cosyvoice3/script_editor/read")
async def script_editor_read(request):
    path = request.query.get("path", "")
    if not path:
        return web.json_response({"error": "path is required"})
    if not os.path.isfile(path):
        return web.json_response({"exists": False, "content": "", "mtime": None})
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            content = f.read()
        return web.json_response({
            "exists": True,
            "content": content,
            "mtime": os.path.getmtime(path),
        })
    except OSError as e:
        return web.json_response({"error": str(e)})


@routes.post("/fl_cosyvoice3/script_editor/write")
async def script_editor_write(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})
    path = data.get("path", "")
    content = data.get("content", "")
    if not path:
        return web.json_response({"error": "path is required"})
    try:
        directory = os.path.dirname(path)
        if directory and not os.path.isdir(directory):
            os.makedirs(directory, exist_ok=True)
        tmp_path = path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(content)
        os.replace(tmp_path, path)
        return web.json_response({"mtime": os.path.getmtime(path)})
    except OSError as e:
        return web.json_response({"error": str(e)})