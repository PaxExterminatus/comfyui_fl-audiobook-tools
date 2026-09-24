<script setup>
/*
 Pairs with panel_width.js's usePanelWidth() -- the width-preset button
 row itself was duplicated verbatim (same markup, same props, only the
 preset numbers differed) between Roles Editor and Line Editor before
 this existed.
*/
import Button from "primevue/button";

defineProps({
    presets: { type: Array, required: true }, // px width buttons to show, in order
    setWidth: { type: Function, required: true }, // (value: number | "full") => void
});
</script>

<template>
    <div class="width-row">
        <Button
            v-for="px in presets"
            :key="px"
            :label="String(px)"
            text size="small"
            :title="`Set editor width to ${px}px (capped to the window's width)`"
            @click="setWidth(px)"
        />
        <Button label="100%" text size="small" title="Use the full available window width" @click="setWidth('full')" />
    </div>
</template>

<style scoped lang="sass" src="./PanelWidthButtons.sass"></style>
