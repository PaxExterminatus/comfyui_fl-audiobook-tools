<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import Card from "primevue/card";
import Message from "primevue/message";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import DialogHeader from "../shared/DialogHeader.vue";
import { markRoleStale, joinPath, SCRIPT_EDITOR_API as FILE_API, SPEAKER_PRESETS_API as PRESETS_API } from "../../web/fl_common.js";

const props = defineProps({
    root: { type: String, required: true },
    suffix: { type: String, default: "" },
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
const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
    defaultWidth: 1200,
    presets: [900, 1200],
});
const { fontSizePx: cardFontSizePx, decrease: decreaseCardFontSize, increase: increaseCardFontSize } = useFontSize({
    storageKey: "FL_CosyVoice3.RolesEditor.fontSizePx",
    defaultSize: 13,
});

let lastSavedText = null;
let lastLocalEditAt = 0;
let saveTimer = null;
let pollTimer = null;
const lastNotifiedSpeaker = new Map();

function setStatus(text) {
    status.value = text;
}

const textareaEls = new Map(); // role.code -> the underlying <textarea> DOM node
function setTextareaRef(code, el) {
    if (!el) {
        textareaEls.delete(code);
        return;
    }
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
        roles.value.forEach((role) => {
            if (role.code) lastNotifiedSpeaker.set(role.code, role.speaker);
        });
        lastSavedText = data.content;
        if (!isPoll) setStatus(`Loaded ${roles.value.length} role(s)`);
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
    roles.value.forEach((role) => notifyIfSpeakerChanged(role));
    if (pollTimer) clearInterval(pollTimer);
    props.onClose();
}

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
    <div class="fl-roles-editor-content">
        <DialogHeader
            title="Roles" :status="status"
            :width-presets="widthPresets" :set-width="setPanelWidth"
            :font-size-decrease="decreaseCardFontSize" :font-size-increase="increaseCardFontSize"
        />

        <Message v-if="!roles.length" severity="info" :closable="false">No roles found</Message>

        <div class="roles-list" :style="{ fontSize: `${cardFontSizePx}px` }">
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
                        auto-resize
                        rows="1"
                        placeholder="Description..."
                        class="role-description"
                        :style="{ fontSize: `${cardFontSizePx}px` }"
                        @input="scheduleSave()"
                    />
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped src="../style/RolesEditorApp.css"></style>