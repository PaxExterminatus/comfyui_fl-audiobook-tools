"""
FL CosyVoice3 Script Editor Node
Live-linked script/play editor: an in-graph text box that stays synced with
a file on disk in both directions.

file_path set:
    - Edits typed into this node's text box are saved to the file
      (debounced) by the companion frontend widget (web/script_editor.js).
    - Edits made to the file by another program (external editor) are
      polled and pulled back into the node's text box.
    - At execution time this node re-reads file_path fresh from disk, so
      the output always reflects the current file content on disk rather
      than whatever the front-end polling happened to have caught.

file_path empty:
    - Behaves like a plain multiline text box; script's own value is the
      output, nothing touches disk.

Meant to feed FL CosyVoice3 Speaker Instruct2 Dialog's "text" input (script
format: "preset | instruct text | line text", one turn per line), but the
output is a plain STRING so it can go anywhere.
"""

import os
from typing import Tuple

try:
    from server import PromptServer
    from aiohttp import web
    _HAS_SERVER = PromptServer.instance is not None
except (ImportError, AttributeError):
    _HAS_SERVER = False

if _HAS_SERVER:
    routes = PromptServer.instance.routes

    @routes.get("/fl_cosyvoice3/script_editor/read")
    async def fl_cosyvoice3_script_editor_read(request):
        path = request.query.get("path", "")
        if not path:
            return web.json_response({"error": "path is required"})
        if not os.path.isfile(path):
            return web.json_response({"exists": False, "content": "", "mtime": None})
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            return web.json_response({
                "exists": True,
                "content": content,
                "mtime": os.path.getmtime(path),
            })
        except OSError as e:
            return web.json_response({"error": str(e)})

    @routes.post("/fl_cosyvoice3/script_editor/write")
    async def fl_cosyvoice3_script_editor_write(request):
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


class FL_CosyVoice3_ScriptEditor:
    """
    In-graph script/play editor, live-linked to a file on disk (see module
    docstring). Outputs the current script text as STRING.
    """

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("script",)
    FUNCTION = "get_script"
    CATEGORY = "🔊FL CosyVoice3/Synthesis"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "file_path": ("STRING", {
                    "default": "",
                    "description": "Path to a script/play text file on disk. When set, this node "
                                   "stays live-linked to it: edits typed here are saved to the file "
                                   "(debounced), and edits made to the file in another program are "
                                   "pulled back into this node's text box. Leave empty to use this "
                                   "node purely as an in-graph text box with nothing touching disk."
                }),
                "script": ("STRING", {
                    "default": (
                        "narrator | нейтральным, спокойным тоном | Она услышала чей-то шёпот.\n"
                        "hanna | испуганно, полушёпотом | Прости. Это всегда шокирует всех, кто видит его впервые.\n"
                        "hermione | с тревогой в голосе | Что с тобой случилось?"
                    ),
                    "multiline": True,
                    "description": "Script/play text. One turn per line: preset | instruct text | "
                                   "line text (the format FL CosyVoice3 Speaker Instruct2 Dialog "
                                   "expects). Kept in sync with file_path when one is set."
                }),
            }
        }

    @classmethod
    def IS_CHANGED(cls, file_path: str, script: str):
        # Force a fresh disk read every queue when a file is linked, so the
        # output reflects the file's current content even if the front-end
        # poll (web/script_editor.js) hasn't caught up to an external edit yet.
        if file_path and file_path.strip() and os.path.isfile(file_path.strip()):
            return os.path.getmtime(file_path.strip())
        return float("nan")

    def get_script(self, file_path: str, script: str) -> Tuple[str]:
        path = file_path.strip() if file_path else ""
        if path:
            if os.path.isfile(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                    print(f"[FL CosyVoice3 ScriptEditor] Read {len(content)} chars from {path}")
                    return (content,)
                except OSError as e:
                    print(f"[FL CosyVoice3 ScriptEditor] WARNING: couldn't read {path}: {e} "
                          f"-- falling back to the node's text box content")
            else:
                print(f"[FL CosyVoice3 ScriptEditor] file_path is set but not found yet: {path} "
                      f"-- using the node's text box content")
        return (script,)
