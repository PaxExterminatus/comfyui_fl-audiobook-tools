<script setup>
/*
 Route component for /dubbing/bucket -- the dubbing twin of LineEditorHost.
 VoDubLineEditor.vue's <Dialog> wrapper is bypassed the same way.
*/
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import VoDubLineEditorContent from "../src/vo_dub_editor/VoDubLineEditorContent.vue";
import { renderApi } from "./apis.js";

const router = useRouter();
const route = useRoute();

const root = computed(() => String(route.query.root || ""));
const bucket = computed(() => String(route.query.bucket || ""));

function close() {
    router.back();
}
</script>

<template>
  <VoDubLineEditorContent
      :key="`${root}|${bucket}`"
      :root="root"
      :bucket="bucket"
      :render-api="renderApi"
      :on-close="close"
  />
</template>
