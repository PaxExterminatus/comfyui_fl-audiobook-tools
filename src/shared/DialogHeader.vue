<script setup>
// One shared header row for every editor's Dialog #header slot -- title,
// transient status text, and the width-preset buttons were the same
// three elements in the same order in Roles Editor, Line Editor and
// Browse Dialog, each retyping its own header-row/dialog-title/status-el
// markup and CSS. #after lets Line Editor still slot in its font-size
// buttons without forking the layout.
import PanelWidthButtons from "./PanelWidthButtons.vue";

defineProps({
    title: { type: String, required: true },
    status: { type: String, default: "" },
    widthPresets: { type: Array, required: true },
    setWidth: { type: Function, required: true },
});
</script>

<template>
    <div class="header-row">
        <div class="dialog-title">{{ title }}</div>
        <div class="status-el">{{ status }}</div>
        <PanelWidthButtons :presets="widthPresets" :set-width="setWidth" />
        <slot name="after" />
    </div>
</template>

<style scoped lang="sass" src="./DialogHeader.sass"></style>
