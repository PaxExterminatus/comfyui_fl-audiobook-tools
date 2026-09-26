<script setup>
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import VoDubLineEditorContent from "./VoDubLineEditorContent.vue";

const props = defineProps({
    root: { type: String, required: true },
    bucket: { type: String, required: true },
    renderApi: { type: Object, default: null },
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
        :style="{ width: '1600px' }"
        class="vo-dub-editor-dialog"
    >
        <VoDubLineEditorContent v-bind="$props" />
    </Dialog>
</template>

<style scoped src="../style/VoDubLineEditor.css"></style>
