<script setup>
/*
 Inline node-panel for FL_CosyVoice3_VODubLibrary -- shows a VO dub
 project's episode buckets with per-status counts (see
 nodes/vo_dub_library.py's build_tree), same "one panel embedded in the
 node's own body" shape as ScriptLibraryPanel.vue, but there is
 deliberately no checkbox tree here: a VO dub project has no per-script
 queue to build (see that node's own module docstring -- line_override
 drives one row at a time, there's no "run everything checked").
 Clicking a bucket opens VoDubLineEditor.vue for it.
*/
import { ref, onMounted, onBeforeUnmount } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { VO_DUB_API } from "../../web/fl_common.js";

const props = defineProps({
    node: { type: Object, required: true },
    projectRootWidget: { type: Object, required: true },
    openBrowseDialog: { type: Function, required: true },
    openVoDubLineEditor: { type: Function, required: true },
    openDubRolesEditor: { type: Function, required: true },
    queueVoDubRender: { type: Function, default: null }, // (node, opts) => Promise -- from web/vo_dub_library.js
});

const TREE_POLL_MS = 3000;
const STORAGE_KEY = "FL_CosyVoice3.VODubLibrary.lastRoot";

const root = ref(props.projectRootWidget.value || localStorage.getItem(STORAGE_KEY) || "");
const buckets = ref([]);
const status = ref("");
const loading = ref(false);
let pollTimer = null;

async function loadTree() {
    if (!root.value) {
        buckets.value = [];
        return;
    }
    loading.value = true;
    try {
        const resp = await fetch(`${VO_DUB_API}/tree?path=${encodeURIComponent(root.value)}`);
        const data = await resp.json();
        if (data.error) {
            status.value = data.error;
            buckets.value = [];
            return;
        }
        buckets.value = data.buckets || [];
        status.value = `${buckets.value.length} bucket(s), ${buckets.value.reduce((n, b) => n + b.count, 0)} row(s)`;
    } catch (e) {
        status.value = `Couldn't load: ${e}`;
    } finally {
        loading.value = false;
    }
}

function openBrowse() {
    props.openBrowseDialog({
        mode: "folder",
        startPath: root.value,
        onSelect: (path) => {
            root.value = path;
            props.projectRootWidget.value = path;
            localStorage.setItem(STORAGE_KEY, path);
            loadTree();
        },
    });
}

function openBucket(bucket) {
    props.openVoDubLineEditor({
        root: root.value,
        bucket: bucket.bucket,
        /*
         Only offered when this panel's node-wiring actually has a render
         mechanism (it always does in practice -- null only ever shows up
         in a test that doesn't pass one) -- see queueVoDubRender's own
         docstring in web/vo_dub_library.js for what it does.
        */
        renderApi: props.queueVoDubRender ? {
            renderRow: (opts) => props.queueVoDubRender(props.node, opts),
        } : null,
    });
}

function pillCount(bucket, key, label) {
    return bucket[key] ? `${label} ${bucket[key]}` : "";
}

function openRoles() {
    if (!root.value) return;
    props.openDubRolesEditor({ root: root.value });
}

onMounted(() => {
    loadTree();
    pollTimer = setInterval(loadTree, TREE_POLL_MS);
});
onBeforeUnmount(() => clearInterval(pollTimer));
</script>

<template>
    <div class="vo-dub-panel">
        <div class="vo-dub-toolbar">
            <InputText v-model="root" class="vo-dub-root-input" placeholder="VO dub project root (holds vo_dataset.csv)" @change="loadTree()" />
            <Button label="Browse..." size="small" @click="openBrowse" />
            <Button label="Roles" size="small" :disabled="!root" title="Assign a voice preset to each character tag" @click="openRoles" />
            <Button icon="pi pi-refresh" size="small" text title="Re-scan" @click="loadTree" />
        </div>

        <div class="vo-dub-buckets">
            <div
                v-for="b in buckets" :key="b.bucket"
                class="vo-dub-bucket-row"
                @click="openBucket(b)"
            >
                <span class="vo-dub-bucket-name">{{ b.bucket }}</span>
                <span class="vo-dub-bucket-count">{{ b.count }}</span>
                <span class="vo-dub-bucket-pills">
                    <span v-if="b.no_text" class="vo-dub-pill pill-no-text">no text {{ b.no_text }}</span>
                    <span v-if="b.needs_translation" class="vo-dub-pill pill-needs-translation">needs RU {{ b.needs_translation }}</span>
                    <span v-if="b.not_started" class="vo-dub-pill pill-not-started">not started {{ b.not_started }}</span>
                    <span v-if="b.stale" class="vo-dub-pill pill-stale">stale {{ b.stale }}</span>
                    <span v-if="b.done" class="vo-dub-pill pill-done">done {{ b.done }}</span>
                    <span v-if="b.unsupported" class="vo-dub-pill pill-unsupported" title="Multi-channel rows this addon can't render or play">unsupported {{ b.unsupported }}</span>
                </span>
            </div>
        </div>

        <div class="vo-dub-status">{{ loading ? "Loading..." : status }}</div>
    </div>
</template>

<style scoped lang="sass" src="./VoDubBrowserPanel.sass"></style>
