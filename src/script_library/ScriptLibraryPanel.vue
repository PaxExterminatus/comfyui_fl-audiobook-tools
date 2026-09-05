<script setup>
// Vue port of web/script_library.js's tree UI (everything from that file's
// old nodeCreated EXCEPT the module-scope app.graphToPrompt/app.queuePrompt
// patching, which stays put in web/script_library.js -- it's queue
// orchestration, not UI, and far too delicate to risk touching in the same
// change as a rendering rewrite). This component owns: the browse-for-
// project button, the two tool rows, and the act/script checkbox tree.
//
// Bridges to plain ComfyUI widget objects (folderWidget/actWidget/
// scriptFileWidget) by keeping its OWN reactive copies and writing back to
// `.value` on every change -- Vue can't observe mutations to a plain
// object's properties made from outside itself, and these widgets' values
// must stay correct for ComfyUI's own workflow serialization regardless of
// whether this panel is even mounted.
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import Button from "primevue/button";
import { joinPath, SCRIPT_LIBRARY_API as SCAN_API } from "../../web/fl_common.js";

const props = defineProps({
    node: { type: Object, required: true },
    folderWidget: { type: Object, required: true },
    actWidget: { type: Object, required: true },
    filterWidget: { type: Object, default: null },
    scriptFileWidget: { type: Object, required: true },
    // Every cross-editor entry point is passed in rather than statically
    // imported: openBrowseDialog/openRolesEditor ARE separate Vite lib
    // entries (see vite.config.js), and importing an entry's main.js
    // directly from a THIRD entry's source made Rollup hoist that shared
    // code into its own chunk named after the shared module's basename --
    // "main.js" for every one of these, since every entry's own source
    // file is called that within its own folder, which collided across
    // entries. Passing these as props keeps every entry's build output
    // independent (aside from the intentionally-shared
    // src/shared/styles_link.js). openLineEditor/queueLineRevoice aren't
    // Vite entries at all (line_editor.js is still vanilla JS, and
    // queueLineRevoice lives in web/script_library.js's own module scope).
    openBrowseDialog: { type: Function, required: true },
    openRolesEditor: { type: Function, required: true },
    openLineEditor: { type: Function, required: true },
    queueLineRevoice: { type: Function, required: true },
});

const LAST_FOLDER_KEY = "FL_CosyVoice3.ScriptLibrary.lastFolder";
const MIN_TREE_HEIGHT = 90;
const TREE_POLL_MS = 3000;
const ACT_FILE_SEP = "::";

function keyOf(act, file) {
    return `${act}${ACT_FILE_SEP}${file}`;
}

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

const folderPath = ref(props.folderWidget.value || "");
const activeAct = ref(props.actWidget.value || "");
const treeData = ref([]); // [{act, scripts, audio_scripts, ready_scripts, pending_scripts, filter_applied}]
const checked = reactive(new Set()); // keyOf(act, file) -- which scripts Run should queue
const expanded = reactive(new Set()); // act names
const status = ref("");

const suffix = computed(() => props.filterWidget?.value || "_speakers.txt");
const browseLabel = computed(() => (folderPath.value ? `📁 ${folderPath.value}` : "📁 Click to browse for a project folder"));

function setStatus(text) {
    status.value = text;
    props.node.setDirtyCanvas(true, true);
}

function checkedItemsInOrder() {
    const items = [];
    treeData.value.forEach((a) => a.scripts.forEach((f) => {
        if (checked.has(keyOf(a.act, f))) items.push({ act: a.act, file: f });
    }));
    return items;
}

function saveCheckedToProperties() {
    props.node.properties = props.node.properties || {};
    props.node.properties.checkedScripts = Array.from(checked);
}

function restoreCheckedFromProperties() {
    const saved = props.node.properties?.checkedScripts;
    if (!Array.isArray(saved)) return;
    checked.clear();
    saved.forEach((k) => { if (typeof k === "string") checked.add(k); });
}

function updateSelectionSummary() {
    saveCheckedToProperties();
    props.node._flCheckedItems = checkedItemsInOrder();
    const totalScripts = treeData.value.reduce((n, a) => n + a.scripts.length, 0);
    const filterNote = treeData.value.length && !treeData.value.every((a) => a.filter_applied !== false)
        ? ` (some acts have no "${suffix.value}" files -- showing all .txt there)`
        : "";
    setStatus(`${treeData.value.length} act(s), ${totalScripts} script(s)${filterNote} | ${checked.size} checked`);
}

// A script marked ready to release can never stay checked for queueing --
// pruned whenever treeData refreshes (a role recast or the poll tick can
// mark a script ready from outside any checkbox click).
function pruneReadyFromChecked() {
    let pruned = false;
    treeData.value.forEach(({ act, ready_scripts }) => {
        (ready_scripts || []).forEach((f) => {
            const k = keyOf(act, f);
            if (checked.has(k)) {
                checked.delete(k);
                pruned = true;
            }
        });
    });
    return pruned;
}

// `readySet`'s scripts are excluded from "checkable" so the act checkbox's
// tri-state doesn't get stuck on "some" forever just because a ready
// script can never be checked.
function actCheckState(act, scripts, readySet) {
    const checkable = scripts.filter((f) => !readySet.has(f));
    if (!checkable.length) return "none";
    const n = checkable.filter((f) => checked.has(keyOf(act, f))).length;
    if (n === 0) return "none";
    return n === checkable.length ? "all" : "some";
}

function readySetOf(entry) {
    return new Set(entry.ready_scripts || []);
}

function checkedCountOf(entry) {
    return entry.scripts.filter((f) => checked.has(keyOf(entry.act, f))).length;
}

function setActIndeterminate(el, entry) {
    if (el) el.indeterminate = actCheckState(entry.act, entry.scripts, readySetOf(entry)) === "some";
}

function toggleActRow(act) {
    activeAct.value = act;
    props.actWidget.value = act;
    if (expanded.has(act)) expanded.delete(act);
    else expanded.add(act);
}

function onActCheckboxChange(entry, isChecked) {
    const readySet = readySetOf(entry);
    if (isChecked) entry.scripts.forEach((f) => { if (!readySet.has(f)) checked.add(keyOf(entry.act, f)); });
    else entry.scripts.forEach((f) => checked.delete(keyOf(entry.act, f)));
    updateSelectionSummary();
}

function onScriptCheckboxChange(act, filename, isChecked) {
    if (isChecked) checked.add(keyOf(act, filename));
    else checked.delete(keyOf(act, filename));
    updateSelectionSummary();
}

function selectRow(act, filename) {
    activeAct.value = act;
    props.actWidget.value = act;
    props.scriptFileWidget.value = filename;
}

function selectAll() {
    treeData.value.forEach((a) => a.scripts.forEach((f) => {
        if (!(a.ready_scripts || []).includes(f)) checked.add(keyOf(a.act, f));
    }));
    updateSelectionSummary();
}

function selectNone() {
    checked.clear();
    updateSelectionSummary();
}

function invertSelection() {
    treeData.value.forEach((a) => a.scripts.forEach((f) => {
        const k = keyOf(a.act, f);
        const isReady = (a.ready_scripts || []).includes(f);
        if (checked.has(k)) checked.delete(k);
        else if (!isReady) checked.add(k);
    }));
    updateSelectionSummary();
}

function openBrowse() {
    props.openBrowseDialog({
        mode: "folder",
        startPath: folderPath.value,
        onSelect: (path) => {
            folderPath.value = path;
            props.folderWidget.value = path;
            loadTree();
        },
    });
}

function openRoles() {
    if (!folderPath.value) {
        setStatus("Set a project folder first");
        return;
    }
    props.openRolesEditor({ root: folderPath.value, suffix: suffix.value });
}

function editScript(act, filename) {
    props.openLineEditor({
        folder: joinPath(folderPath.value, act),
        filename,
        suffix: suffix.value,
        // Lets the editor's own header checkbox reflect/toggle this
        // script's checked-for-queueing state without closing the editor.
        // Scoped to THIS act -- editor-side prev/next navigation never
        // crosses into another act.
        checkedApi: {
            isChecked: (fname) => checked.has(keyOf(act, fname)),
            setChecked: (fname, val) => {
                if (val) checked.add(keyOf(act, fname));
                else checked.delete(keyOf(act, fname));
                updateSelectionSummary();
            },
        },
        // Backs the line editor's "Re-voice this line" button -- act/file
        // are forced explicitly since the editor can be opened for any
        // row, not just whichever one is "active" in the tree.
        revoiceApi: {
            revoiceLine: (opts) => props.queueLineRevoice(props.node, { act, file: filename, ...opts }),
        },
    });
}

async function loadTree() {
    if (!folderPath.value) {
        treeData.value = [];
        setStatus("No project folder set -- click below to browse for one");
        return;
    }
    try {
        const resp = await fetch(`${SCAN_API}/tree?path=${encodeURIComponent(folderPath.value)}&suffix=${encodeURIComponent(suffix.value)}`);
        const data = await resp.json();
        if (data.error) {
            setStatus(`Error: ${data.error}`);
            return;
        }
        rememberFolder(folderPath.value);
        treeData.value = data.tree;

        if (!activeAct.value || !treeData.value.some((a) => a.act === activeAct.value)) {
            activeAct.value = treeData.value.length ? treeData.value[0].act : "";
            props.actWidget.value = activeAct.value;
        }
        if (activeAct.value) expanded.add(activeAct.value);

        if (!props.scriptFileWidget.value && activeAct.value) {
            const entry = treeData.value.find((a) => a.act === activeAct.value);
            if (entry?.scripts.length) props.scriptFileWidget.value = entry.scripts[0];
        }

        const pruned = pruneReadyFromChecked();
        updateSelectionSummary();
        if (pruned) updateSelectionSummary();
    } catch (e) {
        setStatus(`Error: ${e}`);
    }
}

// Project-wide "Re-voice pending" button: finds every line (any act, any
// script) the line editor's per-line state marked stale/unvoiced -- e.g.
// every line a role recast just invalidated -- and re-voices each one in
// place. Sequential on purpose: queuing dozens of heavy TTS renders
// concurrently would just flood ComfyUI's own queue for no benefit.
async function revoiceAllPending() {
    if (!folderPath.value) {
        setStatus("Set a project folder first");
        return;
    }
    let scripts;
    try {
        const resp = await fetch(`${SCAN_API}/pending_revoice?path=${encodeURIComponent(folderPath.value)}&suffix=${encodeURIComponent(suffix.value)}`);
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
                await props.queueLineRevoice(props.node, {
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

// Recall-from-localStorage + refresh + (re)load the tree. Runs both right
// after mount AND after node.onConfigure (wired below) -- a fresh node
// (dragged onto the canvas) only ever mounts fresh, but a node coming from
// a saved/reloaded workflow mounts FIRST (folder_path still at its Python
// default, usually empty) and THEN configure() restores the actual saved
// folder_path. Running this only on mount meant an empty saved
// folder_path never got the localStorage fallback applied after configure
// overwrote it back to "", and even a real saved folder_path never
// refreshed the tree that was drawn before configure ran.
function syncFolderAndReload() {
    restoreCheckedFromProperties();
    if (!folderPath.value) {
        const remembered = recallFolder();
        if (remembered) {
            folderPath.value = remembered;
            props.folderWidget.value = remembered;
        }
    }
    if (folderPath.value) loadTree();
    else setStatus("No project folder set -- click below to browse for one");
}

let pollTimer = null;

onMounted(() => {
    const origOnConfigure = props.node.onConfigure;
    props.node.onConfigure = function (info) {
        const result = origOnConfigure ? origOnConfigure.apply(this, arguments) : undefined;
        syncFolderAndReload();
        return result;
    };

    const origFolderCallback = props.folderWidget.callback;
    props.folderWidget.callback = function (value) {
        const result = origFolderCallback ? origFolderCallback.apply(this, arguments) : undefined;
        folderPath.value = value;
        loadTree();
        return result;
    };

    syncFolderAndReload();

    // Keep the "already rendered" icon current while this node sits on the
    // canvas -- e.g. finishing a render for a checked script should light
    // its icon up on its own, without the user re-browsing the folder.
    pollTimer = setInterval(() => {
        if (folderPath.value) loadTree();
    }, TREE_POLL_MS);
});

onBeforeUnmount(() => {
    if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
    <div class="script-library-panel">
        <Button
            :label="browseLabel"
            :title="folderPath"
            text
            class="browse-button"
            @click="openBrowse"
        />

        <div class="tools-row">
            <Button
                label="🎭 Roles"
                title="Assign a real speaker preset to each role code (edits _roles.json)"
                size="small"
                outlined
                class="tool-btn"
                @click="openRoles"
            />
            <Button
                label="🔁 Re-voice pending"
                title="Re-voice every line across the whole project marked as needing it (stale or never voiced)"
                size="small"
                outlined
                class="tool-btn"
                @click="revoiceAllPending"
            />
        </div>

        <div class="tools-row">
            <Button label="☑ All" title="Check every script in every act (skips scripts marked ready)" size="small" outlined class="tool-btn" @click="selectAll" />
            <Button label="☐ None" title="Uncheck every script" size="small" outlined class="tool-btn" @click="selectNone" />
            <Button label="⇄ Invert" title="Flip every script's checked state (skips scripts marked ready)" size="small" outlined class="tool-btn" @click="invertSelection" />
        </div>

        <div class="tree" :style="{ minHeight: `${MIN_TREE_HEIGHT}px` }">
            <div v-if="!treeData.length" class="tree-empty">(no acts found)</div>
            <template v-for="entry in treeData" :key="entry.act">
                <div
                    class="act-row"
                    :class="{ 'act-row-active': entry.act === activeAct }"
                    @click="toggleActRow(entry.act)"
                >
                    <input
                        type="checkbox"
                        class="row-checkbox"
                        :checked="actCheckState(entry.act, entry.scripts, readySetOf(entry)) === 'all'"
                        :ref="(el) => setActIndeterminate(el, entry)"
                        @click.stop
                        @change="onActCheckboxChange(entry, $event.target.checked)"
                    />
                    <span class="chevron">{{ expanded.has(entry.act) ? "▾" : "▸" }}</span>
                    <span class="act-name">{{ entry.act }}</span>
                    <span class="act-count">{{ checkedCountOf(entry) ? `${checkedCountOf(entry)}/${entry.scripts.length}` : entry.scripts.length }}</span>
                </div>

                <template v-if="expanded.has(entry.act)">
                    <div
                        v-for="filename in entry.scripts"
                        :key="filename"
                        class="script-row"
                        :class="{ 'script-row-active': entry.act === activeAct && scriptFileWidget.value === filename }"
                        @click="selectRow(entry.act, filename)"
                    >
                        <input
                            type="checkbox"
                            class="row-checkbox"
                            :checked="checked.has(keyOf(entry.act, filename))"
                            :disabled="readySetOf(entry).has(filename)"
                            :title="readySetOf(entry).has(filename) ? 'Marked ready to release -- unmark it in the editor (Done) to queue it again' : ''"
                            @click.stop
                            @change="onScriptCheckboxChange(entry.act, filename, $event.target.checked)"
                        />
                        <button
                            class="edit-btn"
                            title="Open the full-screen line-by-line editor"
                            @click.stop="editScript(entry.act, filename)"
                        >✏️</button>
                        <span v-if="readySetOf(entry).has(filename)" class="row-icon" title="Marked done / ready to release">✅</span>
                        <span class="script-name" :class="{ 'script-name-active': entry.act === activeAct && scriptFileWidget.value === filename }" :title="filename">{{ filename }}</span>
                        <span v-if="(entry.pending_scripts || []).includes(filename)" class="row-icon" title="Has line(s) marked as needing re-voice (edited, or a role's speaker was recast)">⚠️</span>
                        <span v-if="(entry.audio_scripts || []).includes(filename)" class="row-icon row-icon-dim" title="Rendered audio already exists for this script">🔊</span>
                    </div>
                </template>
            </template>
        </div>

        <div class="status-line">{{ status }}</div>
    </div>
</template>

<style scoped>
.script-library-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 5px;
}
.browse-button {
    flex: 0 0 auto;
    width: 100%;
    justify-content: flex-start;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tools-row {
    display: flex;
    gap: 5px;
    flex: 0 0 auto;
}
.tool-btn {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tree {
    flex: 1 1 auto;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
}
.tree-empty {
    opacity: 0.6;
    padding: 8px;
    font-size: 12px;
}
.act-row,
.script-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    border-radius: 6px;
    cursor: pointer;
}
.act-row-active {
    background: rgba(90, 140, 255, 0.12);
}
.script-row {
    padding-left: 24px;
    font-size: 11px;
}
.script-row-active {
    background: rgba(90, 140, 255, 0.18);
}
.row-checkbox {
    flex: 0 0 auto;
    cursor: pointer;
}
.chevron {
    font-size: 10px;
    opacity: 0.6;
    width: 10px;
    flex: 0 0 auto;
}
.act-name {
    font-weight: 600;
    font-size: 12px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.act-count {
    font-size: 10px;
    opacity: 0.5;
    flex: 0 0 auto;
}
.edit-btn {
    flex: 0 0 auto;
    font-size: 10px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    cursor: pointer;
    padding: 1px 4px;
}
.script-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.script-name-active {
    font-weight: 600;
}
.row-icon {
    flex: 0 0 auto;
    font-size: 10px;
}
.row-icon-dim {
    opacity: 0.85;
}
.status-line {
    flex: 0 0 auto;
    width: 100%;
    box-sizing: border-box;
    padding: 2px;
    white-space: normal;
    font-size: 11px;
    opacity: 0.85;
    min-height: 14px;
}
</style>
