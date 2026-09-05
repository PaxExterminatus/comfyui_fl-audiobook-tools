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

<style scoped>
.pick-panel {
    width: min(360px, 90vw);
}
.pick-panel-filter {
    width: 100%;
    margin-bottom: 6px;
}
.pick-panel-rows {
    max-height: 280px;
    overflow-y: auto;
}
.pick-panel-empty {
    padding: 8px 10px;
    opacity: 0.55;
    font-size: 12px;
}
.pick-panel-row {
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
}
.pick-panel-row:hover {
    background: rgba(255, 255, 255, 0.08);
}
.pick-panel-label {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.pick-panel-sublabel {
    font-size: 10.5px;
    opacity: 0.55;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
