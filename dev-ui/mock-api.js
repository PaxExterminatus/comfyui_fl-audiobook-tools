// Dev-server-only mock of the ComfyUI/aiohttp routes this addon's editors
// call (see nodes/script_editor.py, nodes/script_library.py) -- lets the
// Vue components be developed and clicked around in a plain browser tab
// via `npm run dev:ui`, without a running ComfyUI instance at all.
//
// Seeded from fixtures/*.json/*.txt on startup, then mutated in memory as
// you edit in the UI (a save is reflected back on the next read/poll,
// same as the real backend) -- restart the dev server to reset to the
// fixture files' on-disk content. This is a Vite plugin applied ONLY to
// `vite`/`vite dev` (command "serve"); it's never included in the
// `vite build` that produces the real web/*.js bundles.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "..", "fixtures");

function readFixtureJson(filename, fallback) {
    try {
        return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf-8"));
    } catch (e) {
        return fallback;
    }
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
        req.on("error", reject);
    });
}

function sendJson(res, status, body) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
}

// "Files" this mock knows about, keyed by how the real path ends -- the
// dev entry passes a made-up `root` (see dev-ui/main.js), so matching by
// suffix (not the exact path) is what lets the same mock work regardless
// of what fake root string is used.
function readFixtureText(filename, fallback) {
    try {
        return fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf-8");
    } catch (e) {
        return fallback;
    }
}

function makeFileStore() {
    const roles = readFixtureJson("_roles.json", { roles: [] });
    const instructions = readFixtureJson("_instructions.json", { instructions: [] });
    return new Map([
        ["_roles.json", JSON.stringify(roles, null, 2)],
        ["_instructions.json", JSON.stringify(instructions, null, 2)],
        ["Test_speakers.txt", readFixtureText("Test_speakers.txt", "")],
    ]);
}

// A tiny made-up directory tree for the Browse Dialog to click through --
// keyed by normalized (no trailing slash) path, mirroring the shape
// nodes/script_library.py's list_dir route returns (dirs/files sorted,
// drives only at the "" root). Good enough for clicking around in dev;
// doesn't need to touch real disk.
const FAKE_FS = {
    "": { dirs: [], files: [], drives: ["C:\\"] },
    "C:\\": { dirs: ["fake"], files: [] },
    "C:\\fake": { dirs: ["project"], files: [] },
    "C:\\fake\\project": { dirs: ["Act01"], files: ["_roles.json", "_instructions.json"] },
    "C:\\fake\\project\\Act01": { dirs: [], files: ["Test_speakers.txt"] },
};

function normalizeFakeDir(p) {
    return (p || "").replace(/[\\/]+$/, "");
}

function fakeParentOf(norm) {
    if (!norm) return null;
    if (/^[A-Za-z]:$/.test(norm)) return ""; // drive root -> back to the drive list
    const idx = Math.max(norm.lastIndexOf("\\"), norm.lastIndexOf("/"));
    return idx > 0 ? norm.slice(0, idx) : null;
}

// Mirrors nodes/script_library.py's strip_suffix_and_ext against this
// dev fixture set's own "_speakers.txt" naming -- just enough to derive a
// base_name a script's own readiness can be looked up by, same as the real
// backend does from stitch_lines/delete_audio's own base_name.
function fixtureBaseName(filename) {
    return filename.replace(/_speakers\.txt$/i, "").replace(/\.txt$/i, "");
}

export function mockComfyApiPlugin() {
    const files = makeFileStore();
    // "Ready" is a disk fact now (see nodes/script_library.py's
    // scripts_ready) -- no more /set_ready flag to flip, so this mock
    // tracks it the same way: stitch_lines adds a base_name, delete_audio
    // removes one.
    const readyBaseNames = new Set();

    return {
        name: "mock-comfy-api",
        apply: "serve", // dev server only -- never applied during `vite build`
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = new URL(req.url, "http://localhost");

                if (url.pathname === "/fl_cosyvoice3/script_editor/read" && req.method === "GET") {
                    const reqPath = url.searchParams.get("path") || "";
                    const key = [...files.keys()].find((k) => reqPath.endsWith(k));
                    if (!key) return sendJson(res, 200, { exists: false, content: "", mtime: null });
                    return sendJson(res, 200, { exists: true, content: files.get(key), mtime: Date.now() / 1000 });
                }

                if (url.pathname === "/fl_cosyvoice3/script_editor/write" && req.method === "POST") {
                    const body = JSON.parse((await readBody(req)) || "{}");
                    const reqPath = body.path || "";
                    const key = [...files.keys()].find((k) => reqPath.endsWith(k)) || path.basename(reqPath);
                    files.set(key, body.content || "");
                    console.log(`[mock-comfy-api] wrote ${key} (${(body.content || "").length} chars)`);
                    return sendJson(res, 200, { mtime: Date.now() / 1000 });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/speaker_presets" && req.method === "GET") {
                    return sendJson(res, 200, { presets: readFixtureJson("presets.json", []) });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/mark_role_stale" && req.method === "POST") {
                    const body = JSON.parse((await readBody(req)) || "{}");
                    console.log(`[mock-comfy-api] mark_role_stale for role "${body.role_code}"`);
                    // A made-up but plausible response -- one script found
                    // affected -- so the status message's wording can
                    // actually be seen during dev without a real project on
                    // disk (see nodes/script_library.py's mark_role_stale).
                    return sendJson(res, 200, {
                        changed: [{ act: "Act01", file: "Test_speakers.txt", positions: [0], was_ready: false, deleted_audio: [] }],
                    });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/tree" && req.method === "GET") {
                    return sendJson(res, 200, {
                        tree: [
                            {
                                act: "Act01",
                                scripts: ["Test_speakers.txt", "Second_speakers.txt"],
                                audio_scripts: ["Test_speakers.txt"],
                                ready_scripts: [],
                                pending_scripts: ["Second_speakers.txt"],
                                filter_applied: true,
                            },
                            {
                                act: "Act02",
                                scripts: ["Third_speakers.txt"],
                                audio_scripts: [],
                                ready_scripts: ["Third_speakers.txt"],
                                pending_scripts: [],
                                filter_applied: true,
                            },
                        ],
                    });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/pending_revoice" && req.method === "GET") {
                    return sendJson(res, 200, {
                        scripts: [{
                            act: "Act01", file: "Second_speakers.txt", folder: "C:\\fake\\project\\Act01", base_name: "Second",
                            pending: [{ position: 0, speaker: "narrator", instruct: "calm", text: "A second, different test scene." }],
                        }],
                    });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/scan" && req.method === "GET") {
                    const scripts = ["Second_speakers.txt", "Test_speakers.txt"];
                    return sendJson(res, 200, {
                        instructions: { entries: readFixtureJson("_instructions.json", { instructions: [] }).instructions || [] },
                        roles: { entries: readFixtureJson("_roles.json", { roles: [] }).roles || [], path: "C:\\fake\\project\\_roles.json" },
                        scripts,
                        ready_scripts: scripts.filter((f) => readyBaseNames.has(fixtureBaseName(f))),
                    });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/stitch_lines" && req.method === "POST") {
                    const body = JSON.parse((await readBody(req)) || "{}");
                    readyBaseNames.add(body.base_name);
                    console.log(`[mock-comfy-api] stitch_lines -> ${body.base_name} marked ready`);
                    return sendJson(res, 200, { ok: true });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/delete_audio" && req.method === "POST") {
                    const body = JSON.parse((await readBody(req)) || "{}");
                    readyBaseNames.delete(body.base_name);
                    console.log(`[mock-comfy-api] delete_audio -> ${body.base_name} un-marked`);
                    return sendJson(res, 200, { deleted: [] });
                }

                if (url.pathname === "/fl_cosyvoice3/script_library/reorganize_lines" && req.method === "POST") {
                    const body = JSON.parse((await readBody(req)) || "{}");
                    console.log(`[mock-comfy-api] reorganize_lines ${body.base_name} deletes=${JSON.stringify(body.deletes)} moves=${JSON.stringify(body.moves)}`);
                    return sendJson(res, 200, { deleted: [], moved: [] });
                }

                if (url.pathname === "/fl_cosyvoice3/browse/list_dir" && req.method === "GET") {
                    const norm = normalizeFakeDir(url.searchParams.get("path") || "");
                    const ext = (url.searchParams.get("ext") || "").toLowerCase();
                    const entry = FAKE_FS[norm];
                    if (!entry) return sendJson(res, 200, { error: `not a folder: ${norm}` });
                    const listedFiles = ext ? entry.files.filter((f) => f.toLowerCase().endsWith(ext)) : entry.files;
                    return sendJson(res, 200, {
                        path: norm,
                        parent: norm ? fakeParentOf(norm) : null,
                        dirs: entry.dirs,
                        files: listedFiles,
                        drives: entry.drives || [],
                    });
                }

                next();
            });
        },
    };
}
