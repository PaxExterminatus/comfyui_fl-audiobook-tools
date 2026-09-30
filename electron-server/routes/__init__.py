"""
Сборка всех RouteTableDef из модулей routes/.
server.py импортирует ALL_ROUTE_TABLES и регистрирует их в create_app().
"""
from .browse import routes as browse_routes
from .script_editor import routes as script_editor_routes
from .media import routes as media_routes
from .script_library import routes as script_library_routes
from .script_render import routes as script_render_routes
from .vo_dub import routes as vo_dub_routes
from .health import routes as health_routes


ALL_ROUTE_TABLES = [
    browse_routes,
    script_editor_routes,
    media_routes,
    script_library_routes,
    script_render_routes,
    vo_dub_routes,
    health_routes,
]