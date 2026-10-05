<script setup>
/*
 Thin modal wrapper around the already-existing MarkdownReader.vue --
 shows one component's guide on demand instead of always-inline (see
 electron-ui/main.js's openHelp, which mounts this the same ephemeral way
 src/roles_editor/main.js's openRolesEditor mounts its own dialog: a fresh
 container appended to document.body, unmounted on close).
*/
import MarkdownReader from "./MarkdownReader.vue";

defineProps({
    visible: { type: Boolean, required: true },
    component: { type: String, required: true },
});
defineEmits(["update:visible"]);
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header="Справка"
        :style="{ width: '900px', maxHeight: '85vh' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <MarkdownReader :component="component" />
    </Dialog>
</template>
