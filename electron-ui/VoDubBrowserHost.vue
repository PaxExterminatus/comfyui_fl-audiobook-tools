<script setup>
/*
 Route component for /dubbing -- the dubbing twin of ScriptLibraryHost, moved
 out of renderDubbingMode() in main.js. Same reason for building the fake node
 and widget here: <RouterView/> passes no props.
*/
import VoDubBrowserPanel from "../src/vo_dub_editor/VoDubBrowserPanel.vue";
import { openBrowseDialog } from "../src/browse_dialog/main.js";
import { useRouter } from "vue-router";
import { renderApi, makeWidget } from "./apis.js";

const node = { properties: {}, setDirtyCanvas: () => {} };
/*
 Seeded empty, not from the shell's rootStore -- VoDubBrowserPanel.vue owns
 its own root persistence (its own localStorage key, recalled on mount) and
 syncs it back into this widget itself. Seeding from rootStore here used to
 shadow that recall whenever rootStore held a stale/wrong value (see
 [[project-electron-ui-root-field]]).
*/
const projectRootWidget = makeWidget();

const router = useRouter();
const openLineEditorWithRender = ({ root: r, bucket }) =>
    router.push({ name: "dubbing-bucket", query: { root: r, bucket } });
const openDubRolesEditor = ({ root: r }) =>
    router.push({ name: "dubbing-roles", query: { root: r } });
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
