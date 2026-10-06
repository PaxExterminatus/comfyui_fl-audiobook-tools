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
import { openBrowseDialog } from "../src/browse_dialog/main.js";
import { openRolesEditor } from "../src/roles_editor/main.js";
import { openLineEditor } from "../src/line_editor/main.js";
import { revoiceApi, makeWidget } from "./apis.js";
import { rootStore } from "./root_store_instance.js";

const node = { properties: {}, _flCheckedItems: [], setDirtyCanvas: () => {} };
const folderWidget = makeWidget(rootStore.getCurrentModeRoot());
const actWidget = makeWidget();
const filterWidget = makeWidget("_speakers.txt");
const scriptFileWidget = makeWidget();

const queueLineRevoice = async (_node, opts) => revoiceApi.revoiceLine(opts);
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
