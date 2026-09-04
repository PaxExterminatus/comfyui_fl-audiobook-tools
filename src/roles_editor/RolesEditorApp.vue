<script setup>
// Vue port of the old web/roles_editor.js: lists every role from the
// project's _roles.json and lets you reassign its "speaker" (the real
// CosyVoice preset that role code currently resolves to) -- code/name/
// description are read-only display here, since renaming a role code
// would silently orphan every script line that already references it.
// Edits save straight back to _roles.json (debounced), the single source
// of truth Script Library's "script" output resolves role codes against
// (see nodes/script_library.py resolve_roles).
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import { markRoleStale, joinPath, SCRIPT_EDITOR_API as FILE_API, SPEAKER_PRESETS_API as PRESETS_API } from "../../web/fl_common.js";

const props = defineProps({
    root: { type: String, required: true },
    suffix: { type: String, default: "_speakers.txt" },
    onClose: { type: Function, required: true },
});

const SAVE_DEBOUNCE_MS = 600;
const POLL_MS = 3000;
const EDIT_QUIET_MS = 1500;

const fullPath = joinPath(props.root, "_roles.json");
const roles = ref([]);
const presets = ref([]);
const status = ref("");

let lastSavedText = null;
let lastLocalEditAt = 0;
let saveTimer = null;
let pollTimer = null;
// Last speaker value we already ran a stale-scan for, per role code --
// seeded from disk on every load so a genuine change (typed or picked) is
// detected relative to what's ACTUALLY saved, not just "different from a
// moment ago".
const lastNotifiedSpeaker = new Map();

function setStatus(text) {
    status.value = text;
}

// PrimeVue's own `auto-resize` measured scrollHeight unreliably in this
// embedding (mounted into an arbitrary page's DOM, not a full standalone
// app) -- wildly overshooting on first render. This is the same plain
// manual auto-grow the vanilla-JS editors already use successfully:
// collapse to "auto" first so scrollHeight reflects the CURRENT content
// (not whatever height was set last), then set the real height from that.
const textareaEls = new Map(); // role.code -> the underlying <textarea> DOM node
function setTextareaRef(code, el) {
    if (!el) {
        textareaEls.delete(code);
        return;
    }
    // PrimeVue's Textarea root IS the <textarea> itself, but a template/
    // function ref on a component resolves to its instance proxy -- $el
    // gets the real DOM node either way, and also handles the (unlikely
    // here) plain-element case.
    textareaEls.set(code, el.$el ?? el);
}
function autoGrow(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
}
function autoGrowAll() {
    textareaEls.forEach(autoGrow);
}

function serialize() {
    return JSON.stringify({ roles: roles.value }, null, 2);
}

async function flushSave() {
    const text = serialize();
    if (text === lastSavedText) return;
    try {
        const resp = await fetch(`${FILE_API}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: fullPath, content: text }),
        });
        const data = await resp.json();
        if (data.error) {
            setStatus(`Save error: ${data.error}`);
            return;
        }
        lastSavedText = text;
        setStatus(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (e) {
        setStatus(`Save failed: ${e}`);
    }
}

function scheduleSave() {
    lastLocalEditAt = Date.now();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
}

// Recasting a role changes what EVERY line using that role code resolves
// to, project-wide -- but a script line's own row never changes, so
// nothing about the per-line state model would otherwise notice. See
// fl_common.js's markRoleStale for what actually gets marked/un-readied
// server-side. Only called on a discrete "this value is now committed"
// moment (an option picked, or the field loses focus after free typing) --
// never on every keystroke, which would spam the project-wide scan.
function notifyIfSpeakerChanged(role) {
    if (!role.code) return;
    const prev = lastNotifiedSpeaker.get(role.code);
    if (prev === role.speaker) return;
    lastNotifiedSpeaker.set(role.code, role.speaker);
    markRoleStale(props.root, role.code, props.suffix).then((result) => setStatus(result.message));
}

function onSpeakerCommitted(role) {
    scheduleSave();
    notifyIfSpeakerChanged(role);
}

async function loadPresets() {
    try {
        const resp = await fetch(PRESETS_API);
        const data = await resp.json();
        presets.value = data.presets || [];
    } catch (e) {
        presets.value = [];
    }
}

async function loadFromDisk({ isPoll = false } = {}) {
    try {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(fullPath)}`);
        const data = await resp.json();
        if (data.error) {
            setStatus(`Read error: ${data.error}`);
            return;
        }
        if (!data.exists) {
            if (!isPoll) {
                roles.value = [];
                lastSavedText = "";
                setStatus("_roles.json does not exist yet");
            }
            return;
        }
        if (isPoll && Date.now() - lastLocalEditAt < EDIT_QUIET_MS) return;
        if (data.content === lastSavedText) return;
        let parsed;
        try {
            parsed = JSON.parse(data.content);
        } catch (e) {
            setStatus(`_roles.json is not valid JSON: ${e}`);
            return;
        }
        roles.value = Array.isArray(parsed.roles) ? parsed.roles : [];
        // Baseline for notifyIfSpeakerChanged -- whatever's on disk right
        // now isn't a pending change to scan for.
        roles.value.forEach((role) => {
            if (role.code) lastNotifiedSpeaker.set(role.code, role.speaker);
        });
        lastSavedText = data.content;
        if (!isPoll) setStatus(`Loaded ${roles.value.length} role(s)`);
        nextTick(autoGrowAll);
    } catch (e) {
        setStatus(`Read failed: ${e}`);
    }
}

function close() {
    if (saveTimer) {
        clearTimeout(saveTimer);
        flushSave();
    }
    // Catches a speaker change whose commit event never fired (e.g.
    // closing while still focused in a freshly-typed field).
    roles.value.forEach((role) => notifyIfSpeakerChanged(role));
    if (pollTimer) clearInterval(pollTimer);
    document.removeEventListener("keydown", onKeydown);
    props.onClose();
}

function onKeydown(e) {
    if (e.key === "Escape") close();
}

function onOverlayMousedown(e) {
    if (e.target === e.currentTarget) close();
}

onMounted(async () => {
    document.addEventListener("keydown", onKeydown);
    loadPresets();
    await loadFromDisk();
    pollTimer = setInterval(() => loadFromDisk({ isPoll: true }), POLL_MS);
});

onBeforeUnmount(() => {
    if (pollTimer) clearInterval(pollTimer);
    document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
    <div class="roles-overlay" @mousedown="onOverlayMousedown">
        <div class="roles-panel">
            <div class="roles-header">
                <div class="roles-title">Roles</div>
                <div class="roles-status">{{ status }}</div>
                <Button icon="pi pi-times" text rounded severity="secondary" aria-label="Close" @click="close" />
            </div>
            <div class="roles-list">
                <div v-if="!roles.length" class="roles-empty">(no roles found)</div>
                <div v-for="role in roles" :key="role.code" class="role-card">
                    <div class="role-row">
                        <span class="role-code" :title="'Role code (read-only here -- renaming would orphan script lines that already use it)'">{{ role.code }}</span>
                        <span class="role-name">{{ role.name }}</span>
                        <Dropdown
                            v-model="role.speaker"
                            :options="presets"
                            editable
                            filter
                            placeholder="Speaker preset"
                            class="role-speaker"
                            title="Real CosyVoice preset this role resolves to"
                            @input="scheduleSave()"
                            @change="onSpeakerCommitted(role)"
                            @blur="notifyIfSpeakerChanged(role)"
                        />
                    </div>
                    <Textarea
                        v-model="role.description"
                        :ref="(el) => setTextareaRef(role.code, el)"
                        rows="1"
                        placeholder="Description..."
                        class="role-description"
                        @input="scheduleSave(); autoGrow(textareaEls.get(role.code))"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.roles-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 6vh;
}
.roles-panel {
    width: 80vw;
    max-width: 820px;
    height: 88vh;
    background: #1b1b1f;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}
.roles-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex: 0 0 auto;
}
.roles-title {
    font-weight: 600;
    font-size: 14px;
    flex: 1;
    color: #eee;
}
.roles-status {
    font-size: 11px;
    color: #999;
    flex: 0 0 auto;
}
.roles-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.roles-empty {
    color: #888;
    font-size: 12px;
    text-align: center;
    padding: 20px;
}
.role-card {
    flex: 0 0 auto;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.role-row {
    display: flex;
    align-items: center;
    gap: 10px;
}
.role-code {
    flex: 0 0 130px;
    font-size: 11.5px;
    font-weight: 600;
    font-family: monospace;
    color: #ccc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.role-name {
    flex: 1 1 180px;
    min-width: 0;
    font-size: 11.5px;
    color: #ddd;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.role-speaker {
    flex: 0 0 240px;
}
/* PrimeVue's Textarea puts the class passed via `class=` directly on the
   <textarea> element itself (no wrapper), so this targets it directly --
   not a :deep() descendant selector, which would never match here. An
   explicit width matters more than usual: PrimeVue's autoResize measures
   scrollHeight to set the inline height, and an unconstrained-width
   textarea intrinsically sizing to its default ~20-column width makes
   that measurement wrap the text across many lines, wildly inflating the
   computed height. */
.role-description {
    flex: 0 0 auto;
    width: 100%;
    font-size: 11px;
}
</style>
