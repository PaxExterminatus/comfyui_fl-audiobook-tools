<script setup>
/*
 Route component for /dubbing -- the dubbing twin of ScriptLibraryHost, moved
 out of renderDubbingMode() in main.js. Same reason for building the fake node
 and widget here: <RouterView/> passes no props.
*/
import VoDubBrowserPanel from "../src/vo_dub_editor/VoDubBrowserPanel.vue";
import { openBrowseDialog } from "../src/browse_dialog/main.js";
import { openVoDubLineEditor, openDubRolesEditor } from "../src/vo_dub_editor/main.js";
import { renderApi, makeWidget } from "./apis.js";
import { rootStore } from "./root_store_instance.js";

const node = { properties: {}, setDirtyCanvas: () => {} };
const projectRootWidget = makeWidget(rootStore.getCurrentModeRoot());

const openLineEditorWithRender = (opts) => openVoDubLineEditor({ ...opts, renderApi });
const queueVoDubRender = async (_node, opts) => renderApi.renderRow(opts);
</script>

<template>
  <VoDubBrowserPanel
      :node="node"
      :project-root-widget="projectRootWidget"
      :open-browse-dialog="openBrowseDialog"
      :open-vo-dub-line-editor="openLineEditorWithRender"
      :open-dub-roles-editor="openDubRolesEditor"
      :queue-vo-dub-render="queueVoDubRender"
  />
</template>
