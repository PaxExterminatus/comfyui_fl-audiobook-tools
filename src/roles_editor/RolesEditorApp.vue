<script setup>
// Vue port of the old web/roles_editor.js: lists every role from the
// project's _roles.json and lets you reassign its "speaker" (the real
// CosyVoice preset that role code currently resolves to) -- code/name/
// description are read-only display here, since renaming a role code
// would silently orphan every script line that already references it.
// Edits save straight back to _roles.json (debounced), the single source
// of truth Script Library's "script" output resolves role codes against
// (see nodes/script_library.py resolve_roles).
//
// Built from PrimeVue's own structural components (Dialog, Card, Message)
// rather than hand-rolled overlay/panel/card markup -- Dialog alone
// already handles the backdrop, ESC-to-close, click-outside-to-close, and
// its own close button, none of which this file needs to reimplement or
// fight with custom CSS.
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import Dialog from "primevue/dialog";
import Card from "primevue/card";
import Message from "primevue/message";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
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
const visible = ref(true);
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
        // The nextTick call alone can catch the textareas mid-layout (e.g.
        // right as this dialog is still settling into its final size) and
        // measure an inflated scrollHeight that never gets recalculated
        // afterward -- one more pass on the next animation frame
        // re-measures once layout has actually settled.
        nextTick(() => {
            autoGrowAll();
            requestAnimationFrame(autoGrowAll);
        });
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
    props.onClose();
}

// Dialog owns ESC-to-close, click-outside-to-close (dismissable-mask),
// and its own header close button -- all of them just flip v-model:visible
// to false, which lands here regardless of which one triggered it.
watch(visible, (v) => {
    if (!v) close();
});

onMounted(async () => {
    loadPresets();
    await loadFromDisk();
    pollTimer = setInterval(() => loadFromDisk({ isPoll: true }), POLL_MS);
});

onBeforeUnmount(() => {
    if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        dismissable-mask
        header="Roles"
        :style="{ width: '80vw', maxWidth: '820px' }"
    >
        <Message v-if="status" severity="secondary" :closable="false" class="roles-status">{{ status }}</Message>
        <Message v-if="!roles.length" severity="info" :closable="false">No roles found</Message>

        <div class="roles-list">
            <Card v-for="role in roles" :key="role.code" class="role-card">
                <template #title>
                    <span class="role-code" title="Role code (read-only here -- renaming would orphan script lines that already use it)">{{ role.code }}</span>
                    <span class="role-name">{{ role.name }}</span>
                </template>
                <template #content>
                    <Dropdown
                        v-model="role.speaker"
                        :options="presets"
                        editable
                        filter
                        placeholder="Speaker preset"
                        title="Real CosyVoice preset this role resolves to"
                        class="role-speaker"
                        @input="scheduleSave()"
                        @change="onSpeakerCommitted(role)"
                        @blur="notifyIfSpeakerChanged(role)"
                    />
                    <Textarea
                        v-model="role.description"
                        :ref="(el) => setTextareaRef(role.code, el)"
                        rows="1"
                        placeholder="Description..."
                        class="role-description"
                        @input="scheduleSave(); autoGrow(textareaEls.get(role.code))"
                    />
                </template>
            </Card>
        </div>
    </Dialog>
</template>

<style scoped>
/* Pure layout for the list of Cards -- nothing here overrides a PrimeVue
   component's own internal styling (padding/background/border-radius all
   still come from the theme via Card itself). */
.roles-status {
    margin: 0 0 10px;
}
.roles-list {
    max-height: 74vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.role-card {
    flex: 0 0 auto;
}
.role-code {
    font-family: monospace;
    margin-right: 8px;
}
.role-name {
    font-size: 0.85em;
    font-weight: 400;
    opacity: 0.75;
}
/* Card's #content slot stacks the Dropdown above the Textarea by default
   (block flow) -- this is the one place a bit of spacing/width is needed
   between them, not an override of either component's own look. */
.role-speaker {
    display: block;
    width: 100%;
    margin-bottom: 8px;
}
.role-description {
    width: 100%;
}
</style>
