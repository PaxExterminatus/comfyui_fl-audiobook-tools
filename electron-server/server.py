"""
Standalone aiohttp server для Electron-приложения.

Точка входа: create_app() собирает все RouteTableDef из routes/.
Хелперы: _line_audio, _script_helpers, _vo_dub_helpers, _speaker_presets, _cors.
"""
import os
import sys

# Add nodes directory to sys.path to make audio engine importable.
nodes_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "nodes"))
if nodes_dir not in sys.path:
    sys.path.append(nodes_dir)


from aiohttp import web

from _cors import cors_middleware, preflight_handler
from routes import ALL_ROUTE_TABLES


def create_app():
    app = web.Application(middlewares=[cors_middleware])
    for table in ALL_ROUTE_TABLES:
        app.add_routes(table)
    app.router.add_route("OPTIONS", "/{path:.*}", preflight_handler)
    return app


if __name__ == "__main__":
    web.run_app(create_app(), host="127.0.0.1", port=8765)