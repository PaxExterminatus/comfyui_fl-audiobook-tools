<script setup>
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import BrowseDialogContent from "./BrowseDialogContent.vue";

const props = defineProps({
    mode: { type: String, default: "folder" },
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: true },
    onClose: { type: Function, required: true },
});

const visible = ref(true);

watch(visible, v => {
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
        class="browse-dialog"
    >
        <BrowseDialogContent v-bind="$props" />
    </Dialog>
</template>

