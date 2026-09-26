<script setup>
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import LineEditorContent from "./LineEditorContent.vue";

const props = defineProps({
    folder: { type: String, required: true },
    filename: { type: String, required: true },
    suffix: { type: String, default: "" },
    checkedApi: { type: Object, default: null },
    revoiceApi: { type: Object, default: null },
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
        class="line-editor-dialog"
    >
        <LineEditorContent v-bind="$props" />
    </Dialog>
</template>

<style scoped src="../style/LineEditorApp.css"></style>
