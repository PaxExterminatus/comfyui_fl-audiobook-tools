<script setup>
/* Route component for /dubbing/roles. */
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import DubRolesEditorApp from "../src/vo_dub_editor/DubRolesEditorApp.vue";

const router = useRouter();
const route = useRoute();

const root = computed(() => String(route.query.root || ""));

function close() {
    router.back();
}
</script>

<template>
  <DubRolesEditorApp :key="root" :root="root" inline :on-close="close"/>
</template>
