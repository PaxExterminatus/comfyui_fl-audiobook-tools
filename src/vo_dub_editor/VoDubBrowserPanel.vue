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
import { VO_DUB_API } from "../../web/fl_common.js";

const props = defineProps({
  node: { type: Object, required: true },
  projectRootWidget: { type: Object, required: true },
  openBrowseDialog: { type: Function, required: true },
  openVoDubLineEditor: { type: Function, required: true },
  openDubRolesEditor: { type: Function, required: true },
  queueVoDubRender: { type: Function, default: null }, // (node, opts) => Promise -- from web/vo_dub_library.js
});

const TREE_POLL_MS = 9000;
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

function openRoles() {
  if (!root.value) return;
  props.openDubRolesEditor({ root: root.value });
}

// Список счётчиков бакета: [поле, label, severity PrimeVue].
// Порядок — от «требует внимания» к «всё ок».
const STATUS_PILLS = [
  { key: "no_text",           label: "no text",    severity: "warn" },
  { key: "needs_translation", label: "needs RU",   severity: "info" },
  { key: "not_started",       label: "not started", severity: "secondary" },
  { key: "stale",             label: "stale",      severity: "warn" },
  { key: "done",              label: "done",       severity: "success" },
  { key: "unsupported",       label: "unsupported", severity: "contrast" },
];

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
      <Button label="Browse..." @click="openBrowse" />
      <Button label="Roles" :disabled="!root" title="Assign a voice preset to each character tag" @click="openRoles" />
      <Button icon="pi pi-refresh" title="Re-scan" @click="loadTree" />
    </div>

    <div class="vo-dub-buckets">
      <div v-for="b in buckets" :key="b.bucket" class="vo-dub-bucket-row" :class="{ 'has-issues': b.issue > 0 }" @click="openBucket(b)">
        <InlineMessage severity="secondary">{{ b.bucket }} {{ b.count }}</InlineMessage>

        <template v-for="p in STATUS_PILLS" :key="p.key">
          <InlineMessage v-if="b[p.key]" :severity="p.severity">{{ p.label }} {{ b[p.key] }}</InlineMessage>
        </template>

        <InlineMessage v-if="b.issue > 0" severity="error" :title="`${b.issue} row(s) marked as issue`">issue {{ b.issue }}</InlineMessage>
      </div>
    </div>

    <div class="vo-dub-status">{{ loading ? "Loading..." : status }}</div>
  </div>
</template>

<style scoped src="../style/VoDubBrowserPanel.css"></style>
