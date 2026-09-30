"""Роуты библиотеки скриптов (аудиокнига): акты, дерево, scan, line_hashes,
pending_revoice, delete_audio, mark_role_stale, reorganize_lines, stitch_lines,
replace_speaker."""
import os

from aiohttp import web

from _line_audio import expected_path, reorganize_lines_impl
from _script_helpers import (
    delete_final_audio,
    find_db_file,
    find_pending_revoice,
    list_acts,
    list_scripts,
    mark_role_stale_impl,
    resolved_line_hashes,
    root_role_map,
    scripts_pending_revoice,
    scripts_ready,
    scripts_with_audio,
    split_script_line,
    stitch_lines_impl,
)


try:
    import soundfile  # noqa: F401
    import numpy  # noqa: F401
    _HAS_AUDIO_LIBS = True
except ImportError:
    _HAS_AUDIO_LIBS = False


routes = web.RouteTableDef()


@routes.get("/fl_cosyvoice3/script_library/acts")
async def fl_cosyvoice3_script_library_acts(request):
    root = request.query.get("path", "").strip()
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})

    acts, filter_applied = list_acts(root)
    return web.json_response({"root": root, "acts": acts, "filter_applied": filter_applied})


@routes.get("/fl_cosyvoice3/script_library/tree")
async def fl_cosyvoice3_script_library_tree(request):
    root = request.query.get("path", "").strip()
    suffix = request.query.get("suffix", "")
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})

    acts, filter_applied = list_acts(root)
    role_map = root_role_map(root)
    tree = []
    for act in acts:
        act_folder = os.path.join(root, act)
        scripts, act_filter_applied = list_scripts(act_folder, suffix)
        audio_scripts = scripts_with_audio(act_folder, scripts, suffix)
        ready_scripts = scripts_ready(act_folder, scripts, suffix)
        pending_scripts = scripts_pending_revoice(act_folder, scripts, suffix, role_map)
        tree.append({
            "act": act,
            "scripts": scripts,
            "audio_scripts": audio_scripts,
            "ready_scripts": ready_scripts,
            "pending_scripts": pending_scripts,
            "filter_applied": act_filter_applied,
        })

    return web.json_response({"root": root, "tree": tree, "filter_applied": filter_applied})


@routes.get("/fl_cosyvoice3/script_library/scan")
async def fl_cosyvoice3_script_library_scan(request):
    root = request.query.get("path", "").strip()
    act = request.query.get("act", "").strip()
    suffix = request.query.get("suffix", "")
    if not root:
        return web.json_response({"error": "path is required"})

    selected_file = None
    if os.path.isfile(root):
        selected_file = os.path.basename(root)
        root = os.path.dirname(root)

    folder = os.path.join(root, act) if act else root
    if not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})

    scripts, filter_applied = list_scripts(folder, suffix)
    ready_scripts = scripts_ready(folder, scripts, suffix)
    roles_path, roles_count, _, roles_list = find_db_file(folder, "_roles.json", "roles")
    categories_path, categories_count, _, categories_list = find_db_file(folder, "_instruct_categories.json", "categories")

    return web.json_response({
        "root": root,
        "act": act,
        "folder": folder,
        "selected_file": selected_file,
        "scripts": scripts,
        "ready_scripts": ready_scripts,
        "filter_applied": filter_applied,
        "roles": {"path": roles_path, "count": roles_count, "entries": roles_list} if roles_path else None,
        "instruct_categories": {"path": categories_path, "count": categories_count, "entries": categories_list} if categories_path else None,
    })


@routes.get("/fl_cosyvoice3/script_library/line_hashes")
async def fl_cosyvoice3_script_library_line_hashes(request):
    root = request.query.get("root", "").strip()
    act = request.query.get("act", "").strip()
    file = request.query.get("file", "").strip()

    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not file:
        return web.json_response({"error": "file is required"})

    act_folder = os.path.join(root, act) if act else root
    if not os.path.isdir(act_folder):
        return web.json_response({"error": f"not a folder: {act_folder}"})

    role_map = root_role_map(root)
    return web.json_response({"line_hashes": resolved_line_hashes(act_folder, file, role_map)})


@routes.get("/fl_cosyvoice3/script_library/pending_revoice")
async def fl_cosyvoice3_script_library_pending_revoice(request):
    root = request.query.get("path", "").strip()
    suffix = request.query.get("suffix", "")
    if not root:
        return web.json_response({"error": "path is required"})
    if not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})

    return web.json_response({"scripts": find_pending_revoice(root, suffix)})


@routes.post("/fl_cosyvoice3/script_library/delete_audio")
async def fl_cosyvoice3_script_library_delete_audio(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    base_name = data.get("base_name", "").strip()

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})

    return web.json_response({"deleted": delete_final_audio(folder, base_name)})


@routes.post("/fl_cosyvoice3/script_library/mark_role_stale")
async def fl_cosyvoice3_script_library_mark_role_stale(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    root = data.get("root", "").strip()
    role_code = data.get("role_code", "").strip()
    suffix = data.get("suffix", "")

    if not root or not os.path.isdir(root):
        return web.json_response({"error": f"not a folder: {root}"})
    if not role_code:
        return web.json_response({"error": "role_code is required"})

    return web.json_response(mark_role_stale_impl(root, role_code, suffix))


@routes.post("/fl_cosyvoice3/script_library/reorganize_lines")
async def fl_cosyvoice3_script_library_reorganize_lines(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    base_name = data.get("base_name", "").strip()
    deletes = data.get("deletes") or []
    moves = data.get("moves") or []

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})
    try:
        deletes = [int(p) for p in deletes]
        moves = [(int(m[0]), int(m[1])) for m in moves]
    except (TypeError, ValueError, IndexError):
        return web.json_response({"error": "deletes must be integers, moves must be [from, to] integer pairs"})

    lines_dir = os.path.join(folder, "_audio", "lines", base_name)
    return web.json_response(reorganize_lines_impl(lines_dir, deletes, moves))


@routes.post("/fl_cosyvoice3/script_library/stitch_lines")
async def fl_cosyvoice3_script_library_stitch_lines(request):
    if not _HAS_AUDIO_LIBS:
        return web.json_response({"error": "soundfile/numpy not installed on this server"})

    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    base_name = data.get("base_name", "").strip()
    line_texts = data.get("line_texts")
    line_hashes = data.get("line_hashes") or []
    pauses = data.get("pauses")
    if pauses is not None and not isinstance(pauses, list):
        return web.json_response({"error": "pauses must be an array"})

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not base_name:
        return web.json_response({"error": "base_name is required"})
    if not line_hashes or not all(isinstance(h, str) for h in line_hashes):
        return web.json_response({"error": "line_hashes must be a non-empty array of strings"})

    try:
        result = stitch_lines_impl(folder, base_name, line_hashes, line_texts=line_texts, pauses=pauses)
    except (FileNotFoundError, ValueError) as e:
        return web.json_response({"error": str(e)})
    except OSError as e:
        return web.json_response({"error": f"stitch failed: {e}"})

    return web.json_response(result)


@routes.post("/fl_cosyvoice3/script_library/replace_speaker")
async def fl_cosyvoice3_script_library_replace_speaker(request):
    try:
        data = await request.json()
    except Exception as e:
        return web.json_response({"error": f"invalid request body: {e}"})

    folder = data.get("folder", "").strip()
    old = data.get("old", "").strip()
    new = data.get("new", "").strip()
    suffix = data.get("suffix", "")

    if not folder or not os.path.isdir(folder):
        return web.json_response({"error": f"not a folder: {folder}"})
    if not old or not new:
        return web.json_response({"error": "both old and new speaker values are required"})
    if old == new:
        return web.json_response({"files_changed": [], "lines_changed": 0})

    scripts, _ = list_scripts(folder, suffix)
    files_changed = []
    total_lines_changed = 0

    for filename in scripts:
        path = os.path.join(folder, filename)
        try:
            with open(path, "r", encoding="utf-8") as f:
                file_lines = f.read().splitlines()
        except OSError as e:
            print(f"[electron-server] WARNING: couldn't read {path}: {e}")
            continue

        changed = False
        file_lines_changed = 0
        new_lines = []
        for line in file_lines:
            parsed = split_script_line(line)
            if parsed and parsed[0] == old:
                rebuilt = f"{new} | {parsed[1]} | {parsed[2]}"
                if line.count("|") == 3:
                    rebuilt += f" | {line.split('|')[3].strip()}"
                new_lines.append(rebuilt)
                changed = True
                file_lines_changed += 1
            else:
                new_lines.append(line)

        if changed:
            try:
                with open(path, "w", encoding="utf-8") as f:
                    f.write("\n".join(new_lines) + "\n")
                files_changed.append({"file": filename, "lines_changed": file_lines_changed})
                total_lines_changed += file_lines_changed
            except OSError as e:
                print(f"[electron-server] WARNING: couldn't write {path}: {e}")

    return web.json_response({"files_changed": files_changed, "lines_changed": total_lines_changed})