<script setup>
// Reusable anchored picker used by three buttons in LineEditorApp (role
// catalog, instruction catalog, speaker-preset re-cast) -- replaces web/
// ui_kit.js's openFloatingPanel with PrimeVue's own OverlayPanel instead of
// a hand-positioned floating div. One instance is shared by the parent
// (controlled via the `open` method exposed below) rather than one per
// button, since only one can ever be open at a time.
import { ref, computed, nextTick } from "vue";
import OverlayPanel from "primevue/overlaypanel";
import InputText from "primevue/inputtext";

const panelRef = ref(null);
const filterText = ref("");
const items = ref([]);
const getLabel = ref((item) => String(item));
const getSubLabel = ref(null);
const onPick = ref(null);

// Matches the original's openFloatingPanel: the filter box only appears
// once there are enough items that scanning them by eye stops being
// faster than typing a few characters.
const showFilter = computed(() => items.value.length > 6);

const filtered = computed(() => {
    const needle = filterText.value.trim().toLowerCase();
    if (!needle) return items.value;
    return items.value.filter((item) => {
        const label = getLabel.value(item) || "";
        const sub = getSubLabel.value ? getSubLabel.value(item) || "" : "";
        return `${label} ${sub}`.toLowerCase().includes(needle);
    });
});

function open(event, { items: newItems, getLabel: label, getSubLabel: subLabel, onPick: pick }) {
    items.value = newItems;
    getLabel.value = label;
    getSubLabel.value = subLabel || null;
    onPick.value = pick;
    filterText.value = "";
    panelRef.value.toggle(event);
    nextTick(() => panelRef.value.$el?.querySelector("input")?.focus());
}

function pick(item) {
    onPick.value?.(item);
    panelRef.value.hide();
}

defineExpose({ open });
</script>

<template>
    <OverlayPanel ref="panelRef" class="pick-panel">
        <InputText
            v-if="showFilter"
            v-model="filterText"
            placeholder="Type to filter..."
            class="pick-panel-filter"
        />
        <div class="pick-panel-rows">
            <div v-if="!filtered.length" class="pick-panel-empty">(no matches)</div>
            <div
                v-for="(item, i) in filtered"
                :key="i"
                class="pick-panel-row"
                @click="pick(item)"
            >
                <div class="pick-panel-label">{{ getLabel(item) }}</div>
                <div v-if="getSubLabel && getSubLabel(item)" class="pick-panel-sublabel">{{ getSubLabel(item) }}</div>
            </div>
        </div>
    </OverlayPanel>
</template>

<style scoped lang="sass" src="./PickPanel.sass"></style>
