<script setup>
/*
 Vue port of web/browse_dialog.js. Same imperative contract as before
 (see main.js's openBrowseDialog) -- browsers never expose a dropped/
 picked file's real OS path to page JS, so this lists directories/files
 through our own backend (list_dir) instead of any browser file API.
*/
import { ref, computed, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import DialogHeader from "../shared/DialogHeader.vue";
import { joinPath, BROWSE_API as LIST_API } from "../../web/fl_common.js";

const props = defineProps({
    mode: { type: String, default: "folder" }, // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: true },
    onClose: { type: Function, required: true },
});

const visible = ref(true);
const currentPath = ref("");
const pathInputValue = ref("");
const listing = ref(null); // {drives, dirs, files, parent}
const selectedFilePath = ref(null);
const loading = ref(false);
const errorText = ref(null);

const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.BrowseDialog.widthPx",
    defaultWidth: 560,
    presets: [420, 700],
    /*
     A file picker never needs to fill nearly the whole window the way
     Line/Roles Editor's "100%" does -- capped much narrower.
    */
    fullVw: 70,
});
const { fontSizePx: listFontSizePx, decrease: decreaseListFontSize, increase: increaseListFontSize } = useFontSize({
    storageKey: "FL_CosyVoice3.BrowseDialog.fontSizePx",
    defaultSize: 13,
});

const title = computed(() => (props.mode === "folder" ? "Choose a folder" : "Choose a file"));
const selectLabel = computed(() => (props.mode === "folder" ? "Select This Folder" : "Select File"));
const selectDisabled = computed(() =>
    props.mode === "folder" ? !currentPath.value : !selectedFilePath.value,
);

/*
 Same three-branch order as the original: prefer a real parent, then an
 explicit "" (one level above a drive root, i.e. back to the drive list),
 then fall back to the drive list if there's no listing yet at all.
*/
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

/*
 Dialog owns ESC-to-close and its own header close button -- both just
 flip v-model:visible to false, which lands here regardless of which one
 triggered it. Non-modal and never dismissable-mask -- same behavior as
 every dialog in this addon, so an accidental click past the panel's
 edge can't silently lose an in-progress pick or close it unexpectedly.
*/
watch(visible, (v) => {
    if (!v) close();
});

onMounted(() => load(props.startPath || ""));
</script>

<template>
    <Dialog
        v-model:visible="visible"
        :modal="false"
        :draggable="false"
        close-on-escape
        header=" "
        :style="{ width: panelWidthCss }"
        class="browse-dialog"
    >
        <template #header>
            <DialogHeader
                :title="title"
                :width-presets="widthPresets" :set-width="setPanelWidth"
                :font-size-decrease="decreaseListFontSize" :font-size-increase="increaseListFontSize"
            />
        </template>

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

        <div class="browse-list" :style="{ fontSize: `${listFontSizePx}px` }">
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

<style scoped src="../style/BrowseDialogApp.css"></style>
