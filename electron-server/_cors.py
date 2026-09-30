"""
CORS middleware + preflight handler + Windows drive enumeration.

Выделено из server.py — модуль не зависит ни от чего, кроме os и aiohttp.
"""
import os

from aiohttp import web


def windows_drives():
    if os.name != "nt":
        return []
    drives = []
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        drive = f"{letter}:\\"
        if os.path.isdir(drive):
            drives.append(drive)
    return drives


@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        resp = web.Response()
    else:
        resp = await handler(request)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp


async def preflight_handler(request):
    return web.Response()