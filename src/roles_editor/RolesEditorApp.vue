<script setup>
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import RolesEditorContent from "./RolesEditorContent.vue";

const props = defineProps({
    root: { type: String, required: true },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: true },
});

const visible = ref(true);

watch(visible, (v) => {
    if (!v) props.onClose();
});
</script>

<template>
    <Dialog
        v-model:visible="visible"
        :modal="false"
        :draggable="false"
        close-on-escape
        header=" "
        :style="{ width: '1200px' }"
        class="roles-dialog"
    >
        <RolesEditorContent v-bind="$props" />
    </Dialog>
</template>

<style scoped src="../style/RolesEditorApp.css"></style>
