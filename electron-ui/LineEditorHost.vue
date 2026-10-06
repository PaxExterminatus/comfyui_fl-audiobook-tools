<script setup>
/*
 Route component for /voicing/line.

 The editor used to be a PrimeVue <Dialog> floated over the panel by
 LineEditorApp.vue. That wrapper is skipped entirely here: the route renders
 LineEditorContent directly, so the editor IS the page. Closing it is
 router.back(), which is also what the browser's Back button does.

 folder and file travel as query parameters rather than path segments: they
 are absolute Windows paths, and a drive letter's colon plus the backslashes
 do not survive a path segment cleanly.
*/
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import LineEditorContent from "../src/line_editor/LineEditorContent.vue";
import { checkedApi, revoiceApi } from "./apis.js";

const router = useRouter();
const route = useRoute();

const folder = computed(() => String(route.query.folder || ""));
const filename = computed(() => String(route.query.file || ""));
const suffix = computed(() => String(route.query.suffix || ""));

function close() {
    router.back();
}
</script>

<template>
  <LineEditorContent
      :key="`${folder}|${filename}`"
      :folder="folder"
      :filename="filename"
      :suffix="suffix"
      :checked-api="checkedApi"
      :revoice-api="revoiceApi"
      :on-close="close"
  />
</template>
