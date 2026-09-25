<script setup>
/*
 Card-based picker for _instruct_categories.json's phrase bank -- pulled
 out of the instruct field's own Dropdown (see LineEditorApp.vue) into a
 separate dialog so each category's "when to use this register" guidance
 has real room to read as a subtitle, instead of a cramped tooltip on a
 group header inside a small inline list.

 Stateless picker: doesn't know which row it's editing, doesn't touch
 row.instruct itself -- it just emits the chosen phrase and lets the
 caller (LineEditorApp.vue) decide what to do with it (stash the old
 value, apply the new one).
*/
import Dialog from "primevue/dialog";
import Card from "primevue/card";
import Message from "primevue/message";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import DialogHeader from "../shared/DialogHeader.vue";

const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.InstructPicker.widthPx",
    defaultWidth: 900,
    presets: [700, 900],
});
const { fontSizePx: cardFontSizePx, decrease: decreaseCardFontSize, increase: increaseCardFontSize } = useFontSize({
    storageKey: "FL_CosyVoice3.InstructPicker.fontSizePx",
    defaultSize: 13,
});

defineProps({
    visible: { type: Boolean, required: true },
    categories: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:visible", "select"]);

function pick(example) {
    emit("select", example);
    emit("update:visible", false);
}
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header=" "
        :style="{ width: panelWidthCss }"
        @update:visible="$emit('update:visible', $event)"
    >
        <template #header>
            <DialogHeader
                title="Pick an instruct phrase"
                :width-presets="widthPresets" :set-width="setPanelWidth"
                :font-size-decrease="decreaseCardFontSize" :font-size-increase="increaseCardFontSize"
            />
        </template>

        <Message v-if="!categories.length" severity="info" :closable="false">
            No _instruct_categories.json found for this project -- you can still type any instruct text directly.
        </Message>
        <div class="instruct-categories-grid" :style="{ fontSize: `${cardFontSizePx}px` }">
            <Card v-for="category in categories" :key="category.name" class="instruct-category-card">
                <template #title>{{ category.title }}</template>
                <template #subtitle>{{ category.when }}</template>
                <template #content>
                    <ul class="instruct-example-list">
                        <li v-for="example in category.examples" :key="example">
                            <button type="button" class="instruct-example-btn" @click="pick(example)">{{ example }}</button>
                        </li>
                    </ul>
                </template>
            </Card>
        </div>
    </Dialog>
</template>

<style scoped src="../style/InstructPickerDialog.css"></style>
