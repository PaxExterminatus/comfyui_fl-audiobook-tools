<script setup>
// Vue port of web/browse_dialog.js. Same imperative contract as before
// (see main.js's openBrowseDialog) -- browsers never expose a dropped/
// picked file's real OS path to page JS, so this lists directories/files
// through our own backend (list_dir) instead of any browser file API.
import { ref, computed, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { joinPath } from "../../web/fl_common.js";

const props = defineProps({
    mode: { type: String, default: "folder" }, // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: true },
    onClose: { type: Function, required: true },
});

const LIST_API = "/fl_cosyvoice3/browse/list_dir";

const visible = ref(true);
const currentPath = ref("");
const pathInputValue = ref("");
const listing = ref(null); // {drives, dirs, files, parent}
const selectedFilePath = ref(null);
const loading = ref(false);
const errorText = ref(null);

const title = computed(() => (props.mode === "folder" ? "Choose a folder" : "Choose a file"));
const selectLabel = computed(() => (props.mode === "folder" ? "Select This Folder" : "Select File"));
const selectDisabled = computed(() =>
    props.mode === "folder" ? !currentPath.value : !selectedFilePath.value,
);

// Same three-branch order as the original: prefer a real parent, then an
// explicit "" (one level above a drive root, i.e. back to the drive list),
// then fall back to the drive list if there's no listing yet at all.
function goUp() {
    if (listing.value && listing.value.parent) {
        load(listing.value.parent);
    } else if (listing.value && listing.value.parent === "") {
        load("");
    } else if (currentPath.value) {
        load("");
    }
}

const entries = computed(() => {
    const data = listing.value;
    if (!data) return [];
    const rows = [];
    (data.drives || []).forEach((d) => rows.push({ type: "drive", name: d, icon: "💽", path: d }));
    (data.dirs || []).forEach((d) => rows.push({ type: "dir", name: d, icon: "📁", path: joinPath(currentPath.value, d) }));
    if (props.mode === "file") {
        (data.files || []).forEach((f) => rows.push({ type: "file", name: f, icon: "📄", path: joinPath(currentPath.value, f) }));
    }
    return rows;
});

function onRowClick(entry) {
    if (entry.type === "file") {
        selectedFilePath.value = entry.path;
    } else {
        load(entry.path);
    }
}

async function load(path) {
    loading.value = true;
    errorText.value = null;
    selectedFilePath.value = null;
    try {
        const url = `${LIST_API}?path=${encodeURIComponent(path)}${props.ext ? `&ext=${encodeURIComponent(props.ext)}` : ""}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.error) {
            errorText.value = data.error;
            listing.value = null;
            return;
        }
        currentPath.value = data.path;
        pathInputValue.value = data.path || "";
        listing.value = data;
    } catch (e) {
        errorText.value = String(e);
        listing.value = null;
    } finally {
        loading.value = false;
    }
}

function onPathEnter() {
    load(pathInputValue.value.trim());
}

function confirmSelect() {
    const result = props.mode === "folder" ? currentPath.value : selectedFilePath.value;
    if (result) {
        props.onSelect(result);
        close();
    }
}

function close() {
    props.onClose();
}

// Dialog owns ESC-to-close, click-outside-to-close (dismissable-mask), and
// its own header close button -- all of them just flip v-model:visible to
// false, which lands here regardless of which one triggered it.
watch(visible, (v) => {
    if (!v) close();
});

onMounted(() => load(props.startPath || ""));
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        dismissable-mask
        :header="title"
        :style="{ width: 'min(560px, 90vw)' }"
        :content-style="{ display: 'flex', flexDirection: 'column' }"
    >
        <div class="browse-toolbar">
            <Button icon="pi pi-arrow-up" title="Up one level" text @click="goUp" />
            <InputText
                v-model="pathInputValue"
                placeholder="Path -- press Enter to jump here"
                class="browse-path-input"
                @keydown.enter="onPathEnter"
            />
        </div>

        <Message v-if="errorText" severity="error" :closable="false">{{ errorText }}</Message>

        <div class="browse-list">
            <div v-if="loading" class="browse-row browse-row-note">Loading...</div>
            <template v-else>
                <div
                    v-for="entry in entries"
                    :key="`${entry.type}:${entry.name}`"
                    class="browse-row"
                    :class="{ 'browse-row-selected': entry.type === 'file' && entry.path === selectedFilePath }"
                    @click="onRowClick(entry)"
                >
                    {{ entry.icon }} {{ entry.name }}
                </div>
                <div v-if="!entries.length && !errorText" class="browse-row browse-row-note">(empty)</div>
            </template>
        </div>

        <template #footer>
            <Button label="Cancel" severity="secondary" text @click="close" />
            <Button :label="selectLabel" :disabled="selectDisabled" @click="confirmSelect" />
        </template>
    </Dialog>
</template>

<style scoped>
.browse-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
}
.browse-path-input {
    flex: 1;
}
.browse-list {
    flex: 1;
    overflow-y: auto;
    min-height: 280px;
    max-height: 50vh;
}
.browse-row {
    padding: 6px 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    border-radius: 4px;
}
.browse-row:not(.browse-row-note):hover {
    background: rgba(255, 255, 255, 0.08);
}
.browse-row-selected {
    background: rgba(90, 150, 255, 0.25);
}
.browse-row-note {
    opacity: 0.6;
    cursor: default;
}
</style>
