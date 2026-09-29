// Electron main process -- spawns the standalone Python backend
// (electron-server/server.py), waits for it to answer /health, then loads
// electron-ui. Packaging (bundling Python, a built electron-ui dist) is
// Phase 4 -- for now this only supports dev mode: electron-ui's OWN Vite
// dev server (`npm run dev:electron-ui`) must already be running at
// PY_UI_URL below.
import { app, BrowserWindow } from "electron";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PY_HOST = "127.0.0.1";
const PY_PORT = 8765;
const UI_URL = "http://localhost:5199";

let pyProc = null;
let mainWindow = null;

// The plain system Python (or PATH `python`/`python3`) doesn't have
// torch/cosyvoice installed -- server.py's own routes degrade gracefully
// under it (a clean JSON "ML stack not installed" error, not a crash), but
// that means EVERY render silently fails from the user's point of view. The
// venv that actually has the ML stack is a real, separately-installed
// ComfyUI checkout -- same env var (FL_ML_PYTHON) as
// server.py's own FL_COSYVOICE_MODELS_DIR override pattern, falling back to
// the same known-machine path this whole project's own testing has used,
// and only falling back further to plain PATH python as a last resort
// (with a console warning, since that means rendering won't work).
const DEFAULT_ML_PYTHON = "C:\\Comfy-Desktop\\ComfyUI-Installs\\ComfyUI\\ComfyUI\\.venv\\Scripts\\python.exe";

function pythonCommand() {
    const envOverride = (process.env.FL_ML_PYTHON || "").trim();
    if (envOverride && fs.existsSync(envOverride)) return envOverride;
    if (process.platform === "win32" && fs.existsSync(DEFAULT_ML_PYTHON)) return DEFAULT_ML_PYTHON;
    console.warn(
        "[electron-main] no ML-capable Python found (set FL_ML_PYTHON to its full path) -- " +
        "falling back to plain PATH python; rendering will fail with a 'module not found' error."
    );
    return process.platform === "win32" ? "python" : "python3";
}

function startPythonServer() {
    const serverDir = path.join(__dirname, "..", "electron-server");
    pyProc = spawn(pythonCommand(), ["server.py"], {
        cwd: serverDir,
        stdio: "inherit",
    });
    pyProc.on("exit", (code) => {
        console.log(`[electron-main] python backend exited with code ${code}`);
        pyProc = null;
    });
    pyProc.on("error", (err) => {
        console.error("[electron-main] failed to start python backend:", err.message);
    });
}

function waitForHealth(retries = 40, delayMs = 250) {
    return new Promise((resolve, reject) => {
        const attempt = (remaining) => {
            const req = http.get({ host: PY_HOST, port: PY_PORT, path: "/health", timeout: 1000 }, (res) => {
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    retry(remaining);
                }
                res.resume();
            });
            req.on("error", () => retry(remaining));
            req.on("timeout", () => { req.destroy(); retry(remaining); });
        };
        const retry = (remaining) => {
            if (remaining <= 0) {
                reject(new Error("python backend did not answer /health in time"));
                return;
            }
            setTimeout(() => attempt(remaining - 1), delayMs);
        };
        attempt(retries);
    });
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: "#18181b",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    /*
     The UI is served by electron-ui's OWN Vite dev server, which this process
     does NOT start (see the module docstring). When it isn't running, loadURL
     rejects with ERR_CONNECTION_REFUSED -- and since createWindow is only ever
     awaited inside a .then(), that surfaced as an UnhandledPromiseRejection
     dump with no hint of the actual cause. Catch it and put the fix on screen
     instead: an empty window plus a stack trace is the least useful thing to
     show someone who simply hasn't started the dev server yet.
    */
    try {
        await mainWindow.loadURL(UI_URL);
    } catch (e) {
        console.error(`[electron-main] couldn't load ${UI_URL}: ${e.message}`);
        console.error("[electron-main] start the UI dev server first: npm run dev:electron-ui");
        const message = `
            <body style="background:#18181b;color:#e4e4e7;font:14px/1.6 system-ui;padding:48px">
              <h2 style="margin:0 0 16px">UI dev server isn't running</h2>
              <p>Nothing is serving <code>${UI_URL}</code>.</p>
              <p>Start it in a second terminal, then reopen this app:</p>
              <pre style="background:#27272a;padding:12px 16px;border-radius:6px">npm run dev:electron-ui</pre>
              <p style="color:#a1a1aa">The Python backend started fine -- only the UI is missing.</p>
            </body>`;
        await mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(message));
    }
    // Phase 4 (packaging) hasn't happened yet -- this only ever runs in dev
    // today, so always opening DevTools costs nothing and means a render
    // failure is visible immediately instead of depending on F12 actually
    // being bound (it isn't guaranteed to be -- Electron's default menu
    // accelerator for it varies by version/platform and this app has never
    // explicitly wired a shortcut of its own).
    mainWindow.webContents.openDevTools({ mode: "right" });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    startPythonServer();
    try {
        await waitForHealth();
        console.log("[electron-main] python backend healthy");
    } catch (e) {
        console.error("[electron-main]", e.message, "-- loading UI anyway; API calls will fail until the backend is up.");
    }
    await createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

function killPython() {
    if (pyProc) {
        pyProc.kill();
        pyProc = null;
    }
}

app.on("window-all-closed", () => {
    killPython();
    if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", killPython);
