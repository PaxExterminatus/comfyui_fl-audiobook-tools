"""Tests for the registration of the render line route.

This test verifies that the route is registered under the correct namespace
and uses the correct HTTP method. It is written before the implementation
change, so it is expected to fail initially.
"""

import os
import sys
import types

# ---------------------------------------------------------------------------
# Stubs for heavy dependencies to allow importing the routes module.
# ---------------------------------------------------------------------------

def _install_stubs() -> None:
    """Install lightweight stub modules into sys.modules to avoid loading 
    the heavy audio/ML stack during route inspection.
    """
    # Stub torch
    torch_mod = types.ModuleType("torch")
    sys.modules["torch"] = torch_mod

    # Stub soundfile
    sf_mod = types.ModuleType("soundfile")
    sys.modules["soundfile"] = sf_mod

    # We also stub the internal server modules if they pull in heavy deps
    # but usually stubbing torch and soundfile is enough for the import chain.
    # Based on test_apply_effect_route.py, these are the key ones.

# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

def test_render_line_route_registration():
    """Verify the /render/line route is correctly namespaced as /script_library/render/line.
    
    The test checks:
    1. The new namespaced path is registered.
    2. The old non-namespaced path is NOT registered.
    3. The route uses the POST method.
    """
    _install_stubs()

    # Setup sys.path: 
    # nodes/tests/test_render_line_route.py -> .. -> nodes -> .. -> root
    # Add 'electron-server' to sys.path so that 'import routes.script_render' works.
    server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "electron-server"))
    if server_dir not in sys.path:
        sys.path.insert(0, server_dir)

    # Import the routes definition from the script_render module.
    import routes.script_render as sr

    routes_table = sr.routes
    
    # aiohttp.web.RouteTableDef is iterable; entries are Route objects.
    registered_paths = {route.path: route.method for route in routes_table}

    # 1. Check for the new namespaced path.
    expected_path = "/fl_cosyvoice3/script_library/render/line"
    assert expected_path in registered_paths, \
        f"Route {expected_path!r} should be registered"

    # 2. Check that the old path is gone.
    old_path = "/fl_cosyvoice3/render/line"
    assert old_path not in registered_paths, \
        f"Route {old_path!r} should NOT be registered"

    # 3. Check the method.
    assert registered_paths[expected_path] == "POST", \
        f"Route {expected_path!r} must be a POST route"
