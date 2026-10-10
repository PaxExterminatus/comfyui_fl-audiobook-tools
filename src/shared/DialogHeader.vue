<script setup>
/*
 One shared header row for every dialog's #header slot -- title,
 transient status text, the width-preset buttons, and (optionally) a
 font-size A-/A+ pair were the same elements retyped in Roles Editor,
 Line Editor and Browse Dialog's own header-row/dialog-title/status-el
 markup and CSS before this existed. fontSizeDecrease/fontSizeIncrease
 are optional -- pass both (from font_size.js's useFontSize()) to get the
 A-/A+ pair, or omit them for a dialog with no size-adjustable content of
 its own. #after still exists for anything genuinely dialog-specific.
*/
import PanelWidthButtons from "./PanelWidthButtons.vue";
import FontSizeButtons from "./FontSizeButtons.vue";

defineProps({
    title: { type: String, required: true },
    status: { type: String, default: "" },
    widthPresets: { type: Array, required: true },
    setWidth: { type: Function, required: true },
    fontSizeDecrease: { type: Function, default: null },
    fontSizeIncrease: { type: Function, default: null },
});
</script>

<template>
    <div class="row">
        <div class="dialog-title ellipsis">{{ title }}</div>
        <div class="dialog-status ellipsis p-text-secondary">{{ status }}</div>
        <PanelWidthButtons :presets="widthPresets" :set-width="setWidth" />
        <FontSizeButtons v-if="fontSizeDecrease && fontSizeIncrease" :decrease="fontSizeDecrease" :increase="fontSizeIncrease" />
        <slot name="after" />
    </div>
</template>

<style scoped>
.dialog-title {
    flex: 1;
}
.dialog-status {
    flex: 0 0 auto;
    max-width: 260px;
}
</style>
