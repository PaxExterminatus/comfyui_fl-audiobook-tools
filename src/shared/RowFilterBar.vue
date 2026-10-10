<script setup>
import { computed } from "vue";

const props = defineProps({
    statusOptions: {
        type: Array,
        required: true,
    },
    selectedStatuses: {
        type: Set,
        required: true,
    },
    tristates: {
        type: Array,
        required: true,
    },
    tristateValues: {
        type: Object,
        required: true,
    },
    hasActive: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(["toggle-status", "cycle-tristate", "clear"]);

function onStatusClick(value) {
    emit("toggle-status", value);
}

function onTristateClick(key) {
    emit("cycle-tristate", key);
}

function onClearClick() {
    emit("clear");
}

function tristateLabel(tristate) {
    const state = props.tristateValues[tristate.key];
    const named = tristate.stateLabels && tristate.stateLabels[state];
    if (named) return named;
    if (state === "only") return `${tristate.label} \u2713`;
    if (state === "without") return `${tristate.label} \u2717`;
    return tristate.label;
}

function tristateSeverity(tristate) {
    const state = props.tristateValues[tristate.key];
    if (state === "only") return "success";
    if (state === "without") return "danger";
    return null;
}

function isStatusActive(value) {
    return props.selectedStatuses.has(value);
}
</script>

<template>
  <div class="row">
    <!-- Status toggle buttons -->
    <div class="row">
      <Button
        v-for="opt in statusOptions"
        :key="opt.value"
        :data-status="opt.value"
        :aria-pressed="isStatusActive(opt.value)"
        :outlined="!isStatusActive(opt.value)"
        @click="onStatusClick(opt.value)"
      >
        {{ opt.label }}
      </Button>
    </div>

    <!-- Tri-state filter buttons -->
    <div class="row">
      <Button
        v-for="ts in tristates"
        :key="ts.key"
        :data-tristate="ts.key"
        :data-state="tristateValues[ts.key]"
        :severity="tristateSeverity(ts)"
        :outlined="tristateValues[ts.key] === 'any'"
        @click="onTristateClick(ts.key)"
      >
        {{ tristateLabel(ts) }}
      </Button>
    </div>

    <!-- Clear button -->
    <div class="filter-clear-wrapper row">
      <Button
        data-testid="filter-clear"
        label="Clear"
        :disabled="!hasActive"
        @click="onClearClick"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-clear-wrapper {
  margin-left: auto;
  flex-shrink: 0;
}
</style>
