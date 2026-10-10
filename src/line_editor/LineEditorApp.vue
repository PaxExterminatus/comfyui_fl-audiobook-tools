<script setup>
import { ref, watch } from "vue";
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

<style scoped>
.line-editor-dialog {
  height: 92vh;
}
.line-editor-dialog :deep(.p-dialog-header) {
  padding: 8px 12px;
}
.line-editor-dialog :deep(.p-dialog-content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}
</style>
