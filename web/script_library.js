import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { openBrowseDialog } from "./browse_dialog.js";
import { hideWidget } from "./ui_kit.js";
import { openLineEditor } from "./line_editor.js";
import { openRolesEditor } from "./roles_editor.js";
import { injectStyles } from "./styles.js";
import { joinPath, SCRIPT_LIBRARY_API as SCAN_API } from "./fl_common.js";

// FL CosyVoice3 Script Library: folder_path is a PROJECT ROOT. Shows every
// "Act01"/"Act02"/... subfolder and its "_speakers.txt" scripts as a
// checkbox tree. Clicking a script's name previews it (this node always
// outputs exactly one script's content).
//
// Checkboxes (plus the All/None/Invert row) mark which scripts to queue.
// There is deliberately NO separate "queue" button -- the ordinary
// ComfyUI Run button drives it, same contract as Prompt Multi Pixaroma
// (see ComfyUI-Pixaroma-by-Pax/js/prompt_multi/index.js): if any script
// is checked when Run is clicked, the app.queuePrompt patch below loops
// once per checked script (each its own separate run, so a multi-scene
// batch produces N separate audio outputs instead of one merged blob);
// with nothing checked, Run behaves exactly as if this node had no queue
// logic at all -- a single normal run using whichever script is
// currently "active" (last clicked).
//
// Earlier versions of this mechanism mutated the act/script_file widgets'
// .value directly in a loop around repeated app.queuePrompt() calls. That
// is a race: nothing guarantees a given queuePrompt() call finishes
// reading widget values for ITS prompt before the next mutation lands,
// so multi-item batches could serialize the wrong (often just the first)
// script into more than one queued run. The fix, copied from Prompt
// Multi: never touch widget.value for this. Keep the per-run override
// (WeakMap keyed by node -> {act, file}) and apply it inside an
// app.graphToPrompt hook, which fires once per queued prompt and is the
// actual serialization point -- so the override is atomic with the
// prompt it's meant for. app.queuePrompt itself only decides how many
// times to call the original and which override is active for each call.
// Each script also has its own "Edit" button opening the full-screen
// per-line editor from line_editor.js.
const LAST_FOLDER_KEY = "FL_CosyVoice3.ScriptLibrary.lastFolder";
const MIN_TREE_HEIGHT = 90;
// How often to re-check which scripts already have rendered audio, while
// this node is on the canvas -- so the 🔊 icon in the tree comes on by
// itself once a render finishes, without the user having to touch anything.
const TREE_POLL_MS = 3000;

function rememberFolder(path) {
    try {
        if (path) localStorage.setItem(LAST_FOLDER_KEY, path);
    } catch (e) {
        /* localStorage unavailable (private mode, etc.) -- persistence just won't work this session */
    }
}

function recallFolder() {
    try {
        return localStorage.getItem(LAST_FOLDER_KEY) || "";
    } catch (e) {
        return "";
    }
}

const ACT_FILE_SEP = "::";
function keyOf(act, file) {
    return `${act}${ACT_FILE_SEP}${file}`;
}

app.registerExtension({
    name: "FL_CosyVoice3.ScriptLibrary",
    async nodeCreated(node) {
        if (node.comfyClass !== "FL_CosyVoice3_ScriptLibrary") return;
        injectStyles();

        const folderWidget = node.widgets?.find((w) => w.name === "folder_path");
        const actWidget = node.widgets?.find((w) => w.name === "act");
        const filterWidget = node.widgets?.find((w) => w.name === "script_filter");
        const scriptFileWidget = node.widgets?.find((w) => w.name === "script_file");
        const scriptWidget = node.widgets?.find((w) => w.name === "script");
        const lineOverrideWidget = node.widgets?.find((w) => w.name === "line_override");
        if (!folderWidget || !actWidget || !scriptFileWidget || !scriptWidget) return;

        hideWidget(node, folderWidget);
        hideWidget(node, actWidget);
        hideWidget(node, scriptFileWidget);
        hideWidget(node, scriptWidget);
        if (filterWidget) hideWidget(node, filterWidget);
        if (lineOverrideWidget) hideWidget(node, lineOverrideWidget);

        let treeData = []; // [{act, scripts: [...]}]
        const checked = new Set(); // keyOf(act, file) -- which scripts Run should queue
        const expanded = new Set(); // act names
        let activeAct = actWidget.value || "";
        node._flCheckedItems = []; // read by the module-level app.queuePrompt hook below

        // --- status line ---
        const statusEl = document.createElement("div");
        statusEl.className = "fl-status";
        statusEl.style.cssText = "width:100%;box-sizing:border-box;padding:2px 2px;white-space:normal;flex:0 0 auto;";
        function setStatus(text) {
            statusEl.textContent = text;
            node.setDirtyCanvas(true, true);
        }

        // Checked scripts in tree order (act, then script order within the
        // act) -- this ordering is what the queuePrompt hook queues in.
        function checkedItemsInOrder() {
            const items = [];
            treeData.forEach((a) => a.scripts.forEach((f) => {
                if (checked.has(keyOf(a.act, f))) items.push({ act: a.act, file: f });
            }));
            return items;
        }

        // Persists which scripts are checked into node.properties, which
        // ComfyUI serializes with the workflow -- so the selection survives
        // a save + page reload, same as any other node property. Restored
        // in syncFolderAndReload() below (called from both nodeCreated and
        // onConfigure, for the same "configure() restores properties AFTER
        // nodeCreated" reason the folder_path recall needs both).
        function saveCheckedToProperties() {
            node.properties = node.properties || {};
            node.properties.checkedScripts = Array.from(checked);
        }

        function restoreCheckedFromProperties() {
            const saved = node.properties?.checkedScripts;
            if (!Array.isArray(saved)) return;
            checked.clear();
            saved.forEach((k) => { if (typeof k === "string") checked.add(k); });
        }

        function updateSelectionSummary() {
            saveCheckedToProperties();
            node._flCheckedItems = checkedItemsInOrder();
            const totalScripts = treeData.reduce((n, a) => n + a.scripts.length, 0);
            const filterNote = treeData.length && !treeData.every((a) => a.filter_applied !== false)
                ? " (some acts have no \"" + (filterWidget?.value || "_speakers.txt") + "\" files -- showing all .txt there)"
                : "";
            setStatus(`${treeData.length} act(s), ${totalScripts} script(s)${filterNote} | ${checked.size} checked`);
        }

        // --- browse button ---
        const browsePlaceholder = "📁 Click to browse for a project folder";
        const browseButtonEl = document.createElement("div");
        browseButtonEl.className = "fl-browse-btn";
        browseButtonEl.style.flex = "0 0 auto";
        browseButtonEl.textContent = browsePlaceholder;
        function refreshBrowseLabel() {
            browseButtonEl.textContent = folderWidget.value ? `📁 ${folderWidget.value}` : browsePlaceholder;
            browseButtonEl.title = folderWidget.value || "";
        }
        browseButtonEl.addEventListener("click", () => {
            openBrowseDialog({
                mode: "folder",
                startPath: folderWidget.value,
                onSelect: (path) => {
                    folderWidget.value = path;
                    refreshBrowseLabel();
                    loadTree();
                },
            });
        });

        function actionButton(label, title, onClick) {
            const btn = document.createElement("button");
            btn.className = "fl-btn fl-btn-flex";
            btn.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
            btn.textContent = label;
            btn.title = title;
            btn.addEventListener("click", onClick);
            return btn;
        }

        // --- project-scoped tools (not tied to the active act/script) ---
        const toolsRow = document.createElement("div");
        toolsRow.style.cssText = "display:flex;gap:5px;flex:0 0 auto;";
        toolsRow.appendChild(actionButton("🎭 Roles", "Assign a real speaker preset to each role code (edits _roles.json)", () => {
            if (!folderWidget.value) {
                setStatus("Set a project folder first");
                return;
            }
            openRolesEditor({ root: folderWidget.value, suffix: filterWidget?.value || "_speakers.txt" });
        }));
        // Project-wide "fix everything a role recast just invalidated" --
        // scans every act's scripts for lines the line editor marked
        // stale/unvoiced (see nodes/script_library.py's
        // find_pending_revoice) and re-voices each one in place, forcing
        // that line's own act/script_file per script the same way a
        // single 🔁 click would from an open line editor -- just without
        // needing one open for every affected script.
        toolsRow.appendChild(actionButton("🔁 Re-voice pending", "Re-voice every line across the whole project marked as needing it (stale or never voiced)", () => revoiceAllPending()));

        // --- checkbox selection helpers (the ordinary Run button is the
        // queueing trigger -- see the app.queuePrompt hook below) ---
        const buttonsRow = document.createElement("div");
        buttonsRow.style.cssText = "display:flex;gap:5px;flex:0 0 auto;";

        // A script marked "ready to release" (✅ Done in the line editor)
        // can never be checked for queueing -- skipped by every bulk-select
        // button below, same as the per-row checkbox (see renderTree).
        buttonsRow.appendChild(actionButton("☑ All", "Check every script in every act (skips scripts marked ready)", () => {
            treeData.forEach((a) => a.scripts.forEach((f) => {
                if (!(a.ready_scripts || []).includes(f)) checked.add(keyOf(a.act, f));
            }));
            updateSelectionSummary();
            renderTree();
        }));
        buttonsRow.appendChild(actionButton("☐ None", "Uncheck every script", () => {
            checked.clear();
            updateSelectionSummary();
            renderTree();
        }));
        buttonsRow.appendChild(actionButton("⇄ Invert", "Flip every script's checked state (skips scripts marked ready)", () => {
            treeData.forEach((a) => a.scripts.forEach((f) => {
                const k = keyOf(a.act, f);
                const isReady = (a.ready_scripts || []).includes(f);
                if (checked.has(k)) checked.delete(k);
                else if (!isReady) checked.add(k);
            }));
            updateSelectionSummary();
            renderTree();
        }));

        // --- tree ---
        const treeEl = document.createElement("div");
        treeEl.style.cssText =
            "overflow-y:auto;display:flex;flex-direction:column;gap:1px;padding:4px;" +
            "border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:rgba(0,0,0,0.15);box-sizing:border-box;";

        // `readySet`'s scripts are excluded from "checkable" so the act
        // checkbox's tri-state doesn't get stuck on "some" forever just
        // because a ready script can never be checked.
        function actCheckState(act, scripts, readySet) {
            const checkable = scripts.filter((f) => !readySet.has(f));
            if (!checkable.length) return "none";
            const n = checkable.filter((f) => checked.has(keyOf(act, f))).length;
            if (n === 0) return "none";
            return n === checkable.length ? "all" : "some";
        }

        function renderTree() {
            treeEl.innerHTML = "";
            if (!treeData.length) {
                const empty = document.createElement("div");
                empty.className = "fl-empty";
                empty.textContent = "(no acts found)";
                treeEl.appendChild(empty);
                return;
            }

            // A script marked ready to release can never stay checked for
            // queueing -- prune here so this stays true even when a script
            // became ready from outside a checkbox click (the editor's ✅
            // Done button, or the next poll tick picking up a change made
            // there).
            let prunedReady = false;
            treeData.forEach(({ act, ready_scripts }) => {
                (ready_scripts || []).forEach((f) => {
                    const k = keyOf(act, f);
                    if (checked.has(k)) {
                        checked.delete(k);
                        prunedReady = true;
                    }
                });
            });

            treeData.forEach(({ act, scripts, audio_scripts, ready_scripts, pending_scripts }) => {
                const isExpanded = expanded.has(act);
                const readySet = new Set(ready_scripts || []);
                const state = actCheckState(act, scripts, readySet);
                const checkedCount = scripts.filter((f) => checked.has(keyOf(act, f))).length;
                const audioSet = new Set(audio_scripts || []);
                const pendingSet = new Set(pending_scripts || []);

                const actRow = document.createElement("div");
                actRow.style.cssText =
                    "display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:6px;cursor:pointer;" +
                    (act === activeAct ? "background:rgba(90,140,255,0.12);" : "");

                const actCheckbox = document.createElement("input");
                actCheckbox.type = "checkbox";
                actCheckbox.checked = state === "all";
                actCheckbox.indeterminate = state === "some";
                actCheckbox.style.cssText = "flex:0 0 auto;cursor:pointer;";
                actCheckbox.addEventListener("click", (e) => e.stopPropagation());
                actCheckbox.addEventListener("change", () => {
                    if (actCheckbox.checked) scripts.forEach((f) => { if (!readySet.has(f)) checked.add(keyOf(act, f)); });
                    else scripts.forEach((f) => checked.delete(keyOf(act, f)));
                    updateSelectionSummary();
                    renderTree();
                });

                const chevron = document.createElement("span");
                chevron.textContent = isExpanded ? "▾" : "▸";
                chevron.style.cssText = "font-size:10px;opacity:0.6;width:10px;flex:0 0 auto;";

                const actNameEl = document.createElement("span");
                actNameEl.textContent = act;
                actNameEl.style.cssText = "font-weight:600;font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

                const countEl = document.createElement("span");
                countEl.textContent = checkedCount ? `${checkedCount}/${scripts.length}` : `${scripts.length}`;
                countEl.style.cssText = "font-size:10px;opacity:0.5;flex:0 0 auto;";

                actRow.appendChild(actCheckbox);
                actRow.appendChild(chevron);
                actRow.appendChild(actNameEl);
                actRow.appendChild(countEl);
                actRow.addEventListener("click", () => {
                    activeAct = act;
                    actWidget.value = act;
                    if (expanded.has(act)) expanded.delete(act);
                    else expanded.add(act);
                    renderTree();
                });
                treeEl.appendChild(actRow);

                if (isExpanded) {
                    scripts.forEach((filename) => {
                        const isChecked = checked.has(keyOf(act, filename));
                        const isActiveFile = act === activeAct && scriptFileWidget.value === filename;
                        const isReady = readySet.has(filename);

                        const row = document.createElement("div");
                        row.style.cssText =
                            "display:flex;align-items:center;gap:6px;padding:3px 6px 3px 24px;border-radius:6px;" +
                            "cursor:pointer;font-size:11px;" + (isActiveFile ? "background:rgba(90,140,255,0.18);" : "");

                        const cb = document.createElement("input");
                        cb.type = "checkbox";
                        cb.checked = isChecked;
                        cb.disabled = isReady;
                        cb.style.cssText = "flex:0 0 auto;cursor:pointer;";
                        cb.title = isReady
                            ? "Marked ready to release -- unmark it in the editor (✅ Done) to queue it again"
                            : "";
                        cb.addEventListener("click", (e) => e.stopPropagation());
                        cb.addEventListener("change", () => {
                            if (cb.checked) checked.add(keyOf(act, filename));
                            else checked.delete(keyOf(act, filename));
                            updateSelectionSummary();
                            renderTree();
                        });

                        const nameEl = document.createElement("span");
                        nameEl.textContent = filename;
                        nameEl.title = filename;
                        nameEl.style.cssText =
                            "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" + (isActiveFile ? "font-weight:600;" : "");

                        const editBtn = document.createElement("button");
                        editBtn.className = "fl-btn fl-btn-icon";
                        editBtn.style.fontSize = "10px";
                        editBtn.textContent = "✏️";
                        editBtn.title = "Open the full-screen line-by-line editor";
                        editBtn.addEventListener("click", (e) => {
                            e.stopPropagation();
                            openLineEditor({
                                folder: joinPath(folderWidget.value, act),
                                filename,
                                suffix: filterWidget?.value || "_speakers.txt",
                                // Lets the editor's own header checkbox reflect/toggle
                                // this script's checked-for-queueing state without the
                                // user having to close the editor and go back to the
                                // tree. Scoped to THIS act -- editor-side prev/next
                                // navigation never crosses into another act.
                                checkedApi: {
                                    isChecked: (fname) => checked.has(keyOf(act, fname)),
                                    setChecked: (fname, val) => {
                                        const k = keyOf(act, fname);
                                        if (val) checked.add(k); else checked.delete(k);
                                        updateSelectionSummary();
                                        renderTree();
                                    },
                                },
                                // Backs the line editor's "🔁 Re-voice this line" button --
                                // runs THIS node's current graph (same model) for just
                                // one line's text. act/file are passed explicitly and
                                // FORCED onto the node for this one queued run -- the
                                // node's own act/script_file widgets reflect whatever is
                                // "active" in the tree UI, which is NOT necessarily this
                                // script (the editor can be opened for any row, active or
                                // not), so folder_path/filename would otherwise resolve to
                                // the wrong script and Post-Process would write the
                                // re-voiced line into the wrong script's _audio/lines/.
                                revoiceApi: {
                                    revoiceLine: (opts) => queueLineRevoice(node, {
                                        act,
                                        file: filename,
                                        ...opts,
                                    }),
                                },
                            });
                        });

                        row.appendChild(cb);
                        row.appendChild(editBtn);
                        if (isReady) {
                            const readyIcon = document.createElement("span");
                            readyIcon.textContent = "✅";
                            readyIcon.title = "Marked done / ready to release";
                            readyIcon.style.cssText = "flex:0 0 auto;font-size:10px;";
                            row.appendChild(readyIcon);
                        }
                        row.appendChild(nameEl);
                        if (pendingSet.has(filename)) {
                            const pendingIcon = document.createElement("span");
                            pendingIcon.textContent = "⚠️";
                            pendingIcon.title = "Has line(s) marked as needing re-voice (edited, or a role's speaker was recast)";
                            pendingIcon.style.cssText = "flex:0 0 auto;font-size:10px;";
                            row.appendChild(pendingIcon);
                        }
                        if (audioSet.has(filename)) {
                            const audioIcon = document.createElement("span");
                            audioIcon.textContent = "🔊";
                            audioIcon.title = "Rendered audio already exists for this script";
                            audioIcon.style.cssText = "flex:0 0 auto;font-size:10px;opacity:0.85;";
                            row.appendChild(audioIcon);
                        }
                        row.addEventListener("click", () => {
                            activeAct = act;
                            actWidget.value = act;
                            scriptFileWidget.value = filename;
                            renderTree();
                        });
                        treeEl.appendChild(row);
                    });
                }
            });

            if (prunedReady) updateSelectionSummary();
        }

        // --- loading ---
        async function loadTree() {
            if (!folderWidget.value) {
                treeData = [];
                renderTree();
                setStatus("No project folder set -- click below to browse for one");
                return;
            }
            try {
                const suffix = encodeURIComponent(filterWidget?.value ?? "_speakers.txt");
                const resp = await fetch(`${SCAN_API}/tree?path=${encodeURIComponent(folderWidget.value)}&suffix=${suffix}`);
                const data = await resp.json();
                if (data.error) {
                    setStatus(`Error: ${data.error}`);
                    return;
                }
                rememberFolder(folderWidget.value);
                treeData = data.tree;

                if (!activeAct || !treeData.some((a) => a.act === activeAct)) {
                    activeAct = treeData.length ? treeData[0].act : "";
                    actWidget.value = activeAct;
                }
                if (activeAct) expanded.add(activeAct);

                if (!scriptFileWidget.value && activeAct) {
                    const entry = treeData.find((a) => a.act === activeAct);
                    if (entry?.scripts.length) scriptFileWidget.value = entry.scripts[0];
                }

                renderTree();
                updateSelectionSummary();
            } catch (e) {
                setStatus(`Error: ${e}`);
            }
        }

        // Project-wide "🔁 Re-voice pending" button: finds every line
        // (any act, any script) the line editor's per-line state marked
        // stale/unvoiced -- e.g. every line a role recast just invalidated
        // via nodes/script_library.py's mark_role_stale -- and re-voices
        // each one in place, one at a time (queueLineRevoice forces that
        // line's own act/script_file for its own request, same as a
        // single 🔁 click would). Sequential on purpose: this can span
        // many scripts at once, and queuing dozens of heavy TTS renders
        // concurrently would just flood ComfyUI's own queue for no
        // benefit -- the per-line UI's own concurrency (see line_editor.js's
        // pendingRevoiceRows) is for a human clicking a few buttons by
        // hand, not a bulk sweep like this.
        async function revoiceAllPending() {
            if (!folderWidget.value) {
                setStatus("Set a project folder first");
                return;
            }
            const suffix = filterWidget?.value || "_speakers.txt";
            let scripts;
            try {
                const resp = await fetch(`${SCAN_API}/pending_revoice?path=${encodeURIComponent(folderWidget.value)}&suffix=${encodeURIComponent(suffix)}`);
                const data = await resp.json();
                if (data.error) {
                    setStatus(`Error: ${data.error}`);
                    return;
                }
                scripts = data.scripts || [];
            } catch (e) {
                setStatus(`Error: ${e}`);
                return;
            }

            const total = scripts.reduce((n, s) => n + s.pending.length, 0);
            if (!total) {
                setStatus("Nothing needs re-voicing");
                return;
            }

            let done = 0;
            setStatus(`Re-voicing 0/${total}...`);
            for (const script of scripts) {
                for (const line of script.pending) {
                    try {
                        await queueLineRevoice(node, {
                            act: script.act, file: script.file,
                            lineId: line.id, speaker: line.speaker, instruct: line.instruct, text: line.text,
                        });
                        await fetch(`${SCAN_API}/mark_line_voiced`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ folder: script.folder, base_name: script.base_name, line_id: line.id }),
                        });
                    } catch (err) {
                        console.error(`FL_CosyVoice3.ScriptLibrary: re-voice-all failed for ${script.act}/${script.file} line ${line.id}`, err);
                    }
                    done++;
                    setStatus(`Re-voicing ${done}/${total}...`);
                }
            }
            setStatus(`Re-voiced ${done}/${total} line(s)`);
            loadTree();
        }

        const origFolderCallback = folderWidget.callback;
        folderWidget.callback = function (value) {
            const result = origFolderCallback ? origFolderCallback.apply(this, arguments) : undefined;
            refreshBrowseLabel();
            loadTree();
            return result;
        };

        // Recall-from-localStorage + refresh + (re)load the tree. Called both
        // right after node creation AND after onConfigure (see below) -- a
        // fresh node (dragged onto the canvas) only ever gets nodeCreated, but
        // a node coming from a saved/reloaded workflow gets nodeCreated FIRST
        // (with folder_path still at its Python default, usually empty) and
        // THEN configure() restores the actual saved folder_path. Running this
        // only in nodeCreated meant: (a) an empty saved folder_path never got
        // the localStorage fallback applied after configure overwrote it back
        // to "", and (b) even when the saved folder_path WAS a real path, the
        // tree that got drawn during nodeCreated (before configure ran) never
        // got refreshed for it -- the node just sat there showing whatever
        // state it had before its real value was restored, until the user
        // manually re-browsed. Both are why the picked folder "didn't stick"
        // across a page reload.
        function syncFolderAndReload() {
            restoreCheckedFromProperties();
            if (!folderWidget.value) {
                const remembered = recallFolder();
                if (remembered) folderWidget.value = remembered;
            }
            refreshBrowseLabel();
            if (folderWidget.value) loadTree();
            else setStatus("No project folder set -- click below to browse for one");
        }

        const origOnConfigure = node.onConfigure;
        node.onConfigure = function (info) {
            const result = origOnConfigure ? origOnConfigure.apply(this, arguments) : undefined;
            syncFolderAndReload();
            return result;
        };

        // Visual order top-to-bottom: pick the project, project-wide tools,
        // bulk-select presets, the tree (flex-fills remaining node height),
        // then a status line. Each DOM widget's actual rendered height comes
        // from options.getMinHeight/getMaxHeight (DOMWidgetImpl.computeLayoutSize)
        // -- NOT from widget.computeSize, which the DOM widget layout path
        // never consults. Pinning min===max on every fixed-content row keeps
        // it from being stretched to share in whatever extra height the user
        // drags the node to; leaving script_tree's max unset is what lets it
        // alone absorb all of that extra space.
        const fixedHeight = (px) => ({ getMinHeight: () => px, getMaxHeight: () => px });
        node.addDOMWidget("folder_browse_button", "custom", browseButtonEl, { serialize: false, ...fixedHeight(32) });
        node.addDOMWidget("tools_row", "custom", toolsRow, { serialize: false, ...fixedHeight(38) });
        node.addDOMWidget("action_buttons", "custom", buttonsRow, { serialize: false, ...fixedHeight(38) });
        node.addDOMWidget("script_tree", "custom", treeEl, { serialize: false, getMinHeight: () => MIN_TREE_HEIGHT });

        const order = ["folder_browse_button", "tools_row", "action_buttons", "script_tree"];
        node.widgets.sort((a, b) => {
            const ia = order.indexOf(a.name);
            const ib = order.indexOf(b.name);
            if (ia === -1 && ib === -1) return 0;
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });
        node.addDOMWidget("status_line", "custom", statusEl, { serialize: false, getMinHeight: () => 18, getMaxHeight: () => 40 });
        node.setSize(node.computeSize());
        node.setDirtyCanvas(true, true);

        syncFolderAndReload();

        // Keep the 🔊 "already rendered" icon current while this node sits
        // on the canvas -- e.g. finishing a render for a checked script
        // should light its icon up on its own, without the user having to
        // re-browse the folder or reopen the node.
        const treePollTimer = setInterval(() => {
            if (folderWidget.value) loadTree();
        }, TREE_POLL_MS);
        const origOnRemoved = node.onRemoved;
        node.onRemoved = function () {
            clearInterval(treePollTimer);
            return origOnRemoved ? origOnRemoved.apply(this, arguments) : undefined;
        };
    },
});

// ── Checked-scripts queue loop (module scope, patched once) ────────────────
// Mirrors ComfyUI-Pixaroma-by-Pax's Prompt Multi node (js/prompt_multi/index.js):
// an app.graphToPrompt hook overrides this node's inputs at the moment a given
// prompt is actually serialized (never by mutating widget.value), and an
// app.queuePrompt hook owns the "call the original N times" loop, one call
// per checked script.
const FL_CLASS = "FL_CosyVoice3_ScriptLibrary";
const POST_PROCESS_CLASS = "FL_CosyVoice3_AudioPostProcess";

function isFlNodeActive(node) {
    // mode 2 = muted (LiteGraph), mode 4 = bypass (ComfyUI). Anything else counts as active.
    return node.mode !== 2 && node.mode !== 4;
}

// Subgraph-safe node lookup: ComfyUI flattens subgraph-contained nodes into
// the prompt with composite ids ("5:12") that app.graph.getNodeById (top-level
// only) can't resolve, so a plain parseInt(tail)+getNodeById would silently
// miss any Script Library node living inside a subgraph.
function buildFlNodeIndex() {
    const index = new Map();
    const visit = (graph) => {
        if (!graph) return;
        const nodes = graph._nodes || graph.nodes || [];
        for (const n of nodes) {
            if (!n) continue;
            if (n.comfyClass === FL_CLASS || n.type === FL_CLASS) index.set(String(n.id), n);
            const inner = n.subgraph || n.graph || n._graph;
            if (inner && inner !== graph) visit(inner);
        }
    };
    visit(app.graph);
    return index;
}

function findFlNode(index, promptId) {
    const sId = String(promptId);
    if (index.has(sId)) return index.get(sId);
    const tail = sId.includes(":") ? sId.slice(sId.lastIndexOf(":") + 1) : null;
    return (tail && index.has(tail)) ? index.get(tail) : null;
}

// Per-run override: while a Script Library node's queue loop (or a single
// re-voice request, see queueLineRevoice below) is driving, this holds
// what the CURRENTLY-serializing prompt should get for that node --
// {act, file} for the checked-items batch loop, {lineOverride} for a
// re-voice request (leaves act/script_file untouched -- same script,
// just one line's content instead of the whole file). Absent (or node not
// in the map) means "don't touch this node's inputs" -- the normal
// single-run case, whatever its widgets currently hold.
const flActiveItem = new WeakMap();

// Set only during a re-voice request's synchronous submit window (see
// queueLineRevoice) -- the STABLE id (not array position) of the ONE line
// being re-rendered, stamped onto every Post-Process node found in the
// prompt so it names that line's _audio/lines/ file as id<N>.wav instead
// of always 0 (see nodes/audio_post_process.py's line_index_override).
let pendingRevoiceLineIndex = null;

// Same subgraph-safe walk as buildFlNodeIndex, but collecting every
// Post-Process node instead of indexing by id (a re-voice run has no
// specific "this is the id we're looking for" -- every Post-Process node
// found in the CURRENT prompt gets the override, matching "work within
// the current flow" -- one Dialog/Post-Process pair per graph is the
// assumption here, same as the checked-items loop assumes one driving
// Script Library node).
function buildPostProcessList() {
    const found = [];
    const visit = (graph) => {
        if (!graph) return;
        const nodes = graph._nodes || graph.nodes || [];
        for (const n of nodes) {
            if (!n) continue;
            if (n.comfyClass === POST_PROCESS_CLASS || n.type === POST_PROCESS_CLASS) found.push(n);
            const inner = n.subgraph || n.graph || n._graph;
            if (inner && inner !== graph) visit(inner);
        }
    };
    visit(app.graph);
    return found;
}

// Matches ComfyUI core's SaveAudio/SaveAudioMP3/SaveAudioOpus, VHS_SaveAudio,
// and similar third-party audio-saver nodes by name, not by an exact class
// list -- see stripDownstreamAudioSavers below.
const AUDIO_SAVER_CLASS_RE = /saveaudio|audiosave/i;

// A single-line re-voice only needs Post-Process's own per-line file write
// (_audio\lines\<script>\id<N>.wav, via line_index_override) -- our own
// "✅ Done" (stitch_lines) owns producing the actual final scene file now,
// entirely server-side. If the user's graph still has a Save Audio node
// wired downstream of Post-Process (needed for a FULL render to produce a
// usable draft file), queuing the WHOLE graph for just one line makes that
// SAME Save Audio node fire too -- writing this one short line's audio into
// _audio\ under the script's own filename_prefix, where the mini player's
// "latest file wins" match (see nodes/script_library.py's scripts_with_audio
// / web/line_editor.js's loadAudio) then mistakes it for the actual
// full-scene take. Dropping any audio-saver node from THIS ONE queued
// prompt (never from the graph itself) avoids that -- these are always
// terminal/sink nodes (no outputs), so nothing else in the prompt can be
// depending on one being present.
function stripDownstreamAudioSavers(prompt) {
    for (const key of Object.keys(prompt)) {
        const entry = prompt[key];
        if (entry && AUDIO_SAVER_CLASS_RE.test(entry.class_type || "")) {
            delete prompt[key];
        }
    }
}

// Assigned inside the patch guard below (needs closure access to
// flQueueLoopActive/_origQueuePrompt) -- exposed here so editBtn's click
// handler (inside registerExtension's nodeCreated, a separate top-level
// statement) can call it.
let queueLineRevoice = null;

if (!app._flScriptLibraryPatched) {
    app._flScriptLibraryPatched = true;

    const _origGraphToPrompt = app.graphToPrompt;
    app.graphToPrompt = async function (...args) {
        const result = await _origGraphToPrompt.apply(this, args);
        try {
            const prompt = result?.output;
            if (prompt && typeof prompt === "object") {
                let index = null;
                for (const key of Object.keys(prompt)) {
                    const entry = prompt[key];
                    if (!entry || entry.class_type !== FL_CLASS) continue;
                    if (!index) index = buildFlNodeIndex();
                    const node = findFlNode(index, key);
                    if (!node || !flActiveItem.has(node)) continue;
                    const item = flActiveItem.get(node);
                    entry.inputs = entry.inputs || {};
                    if (item.act !== undefined) entry.inputs.act = item.act;
                    if (item.file !== undefined) entry.inputs.script_file = item.file;
                    if (item.lineOverride !== undefined) entry.inputs.line_override = item.lineOverride;
                }
                if (pendingRevoiceLineIndex !== null) {
                    for (const ppNode of buildPostProcessList()) {
                        const ppEntry = prompt[String(ppNode.id)];
                        if (!ppEntry || ppEntry.class_type !== POST_PROCESS_CLASS) continue;
                        ppEntry.inputs = ppEntry.inputs || {};
                        ppEntry.inputs.line_index_override = pendingRevoiceLineIndex;
                    }
                    stripDownstreamAudioSavers(prompt);
                }
            }
        } catch (err) {
            console.error("FL_CosyVoice3.ScriptLibrary: graphToPrompt hook failed", err);
        }
        return result;
    };

    // Find the first Script Library node that should drive the queue: active
    // (not muted/bypassed) and has at least one checked script. Only the
    // first such node drives -- same simplification Prompt Multi makes for
    // multiple driver nodes in one graph.
    function findDrivingNode() {
        const top = app.graph?._nodes || app.graph?.nodes || [];
        const isDriving = (n) => n && (n.comfyClass === FL_CLASS || n.type === FL_CLASS)
            && isFlNodeActive(n) && (n._flCheckedItems || []).length > 0;
        for (const n of top) if (isDriving(n)) return n;
        const walk = (nodes) => {
            for (const n of nodes || []) {
                if (isDriving(n)) return n;
                const sub = n?.subgraph?._nodes || n?.subgraph?.nodes;
                if (sub) {
                    const hit = walk(sub);
                    if (hit) return hit;
                }
            }
            return null;
        };
        return walk(top);
    }

    // Reentrancy guard: our own loop below calls the original queuePrompt
    // once per checked script. If something (another click, another patch)
    // called app.queuePrompt again while that loop is running, it must NOT
    // start a second overlapping loop -- both would set flActiveItem on the
    // same node and stomp each other's act/script_file. Local to this
    // module only; it does not coordinate with other plugins' own queue
    // loops (e.g. Pixaroma's), which is a real but rare residual edge case.
    let flQueueLoopActive = false;

    const _origQueuePrompt = app.queuePrompt;
    app.queuePrompt = async function (...args) {
        if (flQueueLoopActive) return _origQueuePrompt.apply(app, args);

        const node = findDrivingNode();
        const items = node ? node._flCheckedItems : null;
        if (!node || !items || !items.length) return _origQueuePrompt.apply(app, args);

        flQueueLoopActive = true;
        try {
            const results = [];
            for (const item of items) {
                flActiveItem.set(node, item);
                try {
                    const loopArgs = args.slice(); loopArgs[1] = 1; // batchCount=1, keep number + queueNodeIds
                    results.push(await _origQueuePrompt.apply(app, loopArgs));
                } catch (err) {
                    console.error("FL_CosyVoice3.ScriptLibrary: per-script enqueue failed", err);
                }
            }
            return results[results.length - 1];
        } finally {
            flActiveItem.delete(node);
            flQueueLoopActive = false;
        }
    };

    // Serializes the "stamp the override, call queuePrompt" critical
    // section so two re-voice clicks fired close together can't stomp each
    // other's flActiveItem/pendingRevoiceLineIndex values -- graphToPrompt
    // reads them synchronously at the start of queuePrompt, so as long as
    // submissions themselves don't overlap, each one's actual EXECUTION
    // (which can take a while and does run one-at-a-time regardless, via
    // ComfyUI's own queue) is free to be in flight concurrently with
    // others. This only guards the brief submit window, not the render.
    let revoiceSubmitChain = Promise.resolve();
    function withRevoiceSubmitLock(fn) {
        const run = revoiceSubmitChain.then(fn, fn);
        revoiceSubmitChain = run.catch(() => {});
        return run;
    }

    // Submits an already-built prompt and resolves with its prompt_id via
    // the "execution_start" websocket event -- NOT via api.queuePrompt's
    // own return value. This install has a long chain of OTHER extensions
    // (rgthree, Pixaroma, inspire-pack, easy-use, DaSiWa) each wrapping
    // api.queuePrompt, and confirmed live that {prompt_id} does not
    // reliably survive that chain back to the original caller even though
    // the server receives and queues the prompt correctly. The websocket
    // event comes straight from the server, unaffected by any of those
    // JS-level wrappers. Minor residual risk: if something ELSE is queued
    // ahead of this one, the next execution_start could belong to that
    // other job instead -- acceptable for "work within the current flow"
    // (nothing else is expected to be queuing at the same time).
    async function submitAndTrackPromptId(promptResult, { timeoutMs = 10 * 60 * 1000 } = {}) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                api.removeEventListener("execution_start", onStart);
                reject(new Error("Timed out waiting for the re-voice render to start"));
            }, timeoutMs);
            function onStart(event) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                api.removeEventListener("execution_start", onStart);
                resolve(event.detail?.prompt_id);
            }
            api.addEventListener("execution_start", onStart);
            api.queuePrompt(0, promptResult).catch((err) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                api.removeEventListener("execution_start", onStart);
                reject(err);
            });
        });
    }

    async function pollPromptCompletion(promptId, { intervalMs = 1000, timeoutMs = 10 * 60 * 1000 } = {}) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const resp = await fetch(`/history/${promptId}`);
            const data = await resp.json();
            const entry = data[promptId];
            if (entry) {
                if (entry.status?.completed) return entry;
                if (entry.status?.status_str === "error") {
                    throw new Error("Re-voice render failed -- check the ComfyUI console for details");
                }
            }
            await new Promise((r) => setTimeout(r, intervalMs));
        }
        throw new Error("Timed out waiting for the re-voice render to finish");
    }

    // Runs `node`'s CURRENT graph exactly as a normal Run would (same
    // model) but with act/script_file FORCED to the script the line editor
    // has open and line_override set to just one line's content -- see
    // nodes/script_library.py's line_override. act/file must be forced
    // (not left at whatever the node's widgets currently show): the editor
    // can be opened for any row in the tree, not just whichever one is
    // "active", so folder_path/filename would otherwise resolve to a
    // DIFFERENT script than the one being re-voiced. Only saves that one
    // line's own _audio/lines/<script>/id<N>.wav file (via
    // line_index_override = lineId) -- it does NOT touch the script's
    // final stitched file any more (see web/line_editor.js's per-line
    // "voiced/stale" state model): that only happens once, when "✅ Done"
    // stitches every line together.
    queueLineRevoice = async function (node, { act, file, lineId, speaker, instruct, text }) {
        const lineOverride = `${speaker} | ${instruct} | ${text}`;

        // Lock covers ONLY building the prompt (act/file/line_override are
        // read synchronously by the graphToPrompt hook right here) -- not
        // the actual submit-and-wait below, so a second re-voice click
        // doesn't have to wait for the first one's render to even START,
        // only for its prompt to finish being BUILT (fast).
        let promptResult;
        await withRevoiceSubmitLock(async () => {
            flActiveItem.set(node, { act, file, lineOverride });
            pendingRevoiceLineIndex = lineId;
            try {
                promptResult = await app.graphToPrompt();
            } finally {
                flActiveItem.delete(node);
                pendingRevoiceLineIndex = null;
            }
        });

        const promptId = await submitAndTrackPromptId(promptResult);
        await pollPromptCompletion(promptId);
    };
}
