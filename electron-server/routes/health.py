"""Проверка живости сервера."""
from aiohttp import web


routes = web.RouteTableDef()


@routes.get("/health")
async def health(request):
    return web.json_response({"status": "ok"})