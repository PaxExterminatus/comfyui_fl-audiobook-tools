<script setup>
/* Route component for /voicing/roles. RolesEditorApp.vue's Dialog is bypassed. */
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import RolesEditorContent from "../src/roles_editor/RolesEditorContent.vue";

const router = useRouter();
const route = useRoute();

const root = computed(() => String(route.query.root || ""));
const suffix = computed(() => String(route.query.suffix || ""));

function close() {
    router.back();
}
</script>

<template>
  <RolesEditorContent :key="root" :root="root" :suffix="suffix" :on-close="close"/>
</template>
