<script setup>
/*
 Route component for /voicing.

 Everything below used to live in renderVoicingMode() in main.js. The panel
 was written for ComfyUI and still expects a node plus four widget objects;
 those fakes are built here rather than passed in, because a component
 rendered by <RouterView/> receives no props. Untangling the widget contract
 itself is a later slice -- this one only moves where the panel is mounted.
*/
import ScriptLibraryPanel from "../src/script_library/ScriptLibraryPanel.vue";
import { useRouter } from "vue-router";
import { openBrowseDialog } from "../src/browse_dialog/main.js";
import { revoiceApi, makeWidget } from "./apis.js";
import { rootStore } from "./root_store_instance.js";

const node = { properties: {}, _flCheckedItems: [], setDirtyCanvas: () => {} };
const folderWidget = makeWidget(rootStore.getCurrentModeRoot());
const actWidget = makeWidget();
const filterWidget = makeWidget("_speakers.txt");
const scriptFileWidget = makeWidget();

const queueLineRevoice = async (_node, opts) => revoiceApi.revoiceLine(opts);

/*
 The panel still calls these the way it called the dialog openers, with the
 same argument object -- it does not know the editors stopped being modals.
 Everything the editor needs rides in the query string, so the screen can be
 linked to and Back returns here.
*/
const router = useRouter();
const openRolesEditor = ({ root, suffix: s }) =>
    router.push({ name: "voicing-roles", query: { root, suffix: s } });
const openLineEditor = ({ folder, filename, suffix: s }) =>
    router.push({ name: "voicing-line", query: { folder, file: filename, suffix: s } });
</script>

<template>
  <ScriptLibraryPanel
      :node="node"
      :folder-widget="folderWidget"
      :act-widget="actWidget"
      :filter-widget="filterWidget"
      :script-file-widget="scriptFileWidget"
      :open-browse-dialog="openBrowseDialog"
      :open-roles-editor="openRolesEditor"
      :open-line-editor="openLineEditor"
      :queue-line-revoice="queueLineRevoice"
  />
</template>
