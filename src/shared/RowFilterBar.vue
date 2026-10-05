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

/*
 \u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 "without" \u0443 \u043d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0445 \u0444\u0438\u043b\u044c\u0442\u0440\u043e\u0432 \u0438\u043c\u0435\u0435\u0442 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435 \u0438\u043c\u044f, \u043f\u043e\u0434
 \u043a\u043e\u0442\u043e\u0440\u044b\u043c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0435\u0433\u043e \u0437\u043d\u0430\u0435\u0442: \u043e\u0442\u0440\u0438\u0446\u0430\u043d\u0438\u0435 "Done (manual)" -- \u044d\u0442\u043e "Not
 done", \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u043f\u0443\u043d\u043a\u0442 \u0441\u0442\u0430\u0440\u043e\u0433\u043e \u0432\u044b\u043f\u0430\u0434\u0430\u044e\u0449\u0435\u0433\u043e \u0441\u043f\u0438\u0441\u043a\u0430. "Done (manual) \u2717"
 \u0444\u043e\u0440\u043c\u0430\u043b\u044c\u043d\u043e \u0442\u043e \u0436\u0435 \u0441\u0430\u043c\u043e\u0435, \u043d\u043e \u043d\u0430\u0439\u0442\u0438 \u0435\u0433\u043e \u043f\u043e\u0434 \u044d\u0442\u0438\u043c \u0432\u0438\u0434\u043e\u043c \u043d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e.

 \u041f\u043e\u044d\u0442\u043e\u043c\u0443 stateLabels, \u0435\u0441\u043b\u0438 \u043e\u043d \u0437\u0430\u0434\u0430\u043d \u0434\u043b\u044f \u0442\u0435\u043a\u0443\u0449\u0435\u0433\u043e \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f, \u0432\u044b\u0442\u0435\u0441\u043d\u044f\u0435\u0442 \u0438
 \u043f\u043e\u0434\u043f\u0438\u0441\u044c, \u0438 \u0437\u043d\u0430\u0447\u043e\u043a: \u0438\u043c\u044f \u0443\u0436\u0435 \u043d\u0435\u0441\u0451\u0442 \u043e\u0442\u0440\u0438\u0446\u0430\u043d\u0438\u0435, \u0433\u0430\u043b\u043e\u0447\u043a\u0430 \u043f\u043e\u0432\u0435\u0440\u0445 \u043d\u0435\u0433\u043e \u0442\u043e\u043b\u044c\u043a\u043e
 \u043f\u0443\u0442\u0430\u0435\u0442. \u041e\u043f\u0438\u0441\u0430\u0442\u0435\u043b\u0438 \u0431\u0435\u0437 stateLabels \u0432\u0435\u0434\u0443\u0442 \u0441\u0435\u0431\u044f \u043a\u0430\u043a \u0440\u0430\u043d\u044c\u0448\u0435.
*/
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
  <div class="row-filter-bar">
    <!-- Status toggle buttons -->
    <div class="filter-group filter-statuses">
      <Button
        v-for="opt in statusOptions"
        :key="opt.value"
        :data-status="opt.value"
        :aria-pressed="isStatusActive(opt.value)"
        :outlined="!isStatusActive(opt.value)"
        size="small"
        @click="onStatusClick(opt.value)"
      >
        {{ opt.label }}
      </Button>
    </div>

    <!-- Tri-state filter buttons -->
    <div class="filter-group filter-tristates">
      <Button
        v-for="ts in tristates"
        :key="ts.key"
        :data-tristate="ts.key"
        :data-state="tristateValues[ts.key]"
        :severity="tristateSeverity(ts)"
        :outlined="tristateValues[ts.key] === 'any'"
        size="small"
        @click="onTristateClick(ts.key)"
      >
        {{ tristateLabel(ts) }}
      </Button>
    </div>

    <!-- Clear button -->
    <div class="filter-group filter-clear-wrapper">
      <Button
        data-testid="filter-clear"
        label="Clear"
        size="small"
        :disabled="!hasActive"
        @click="onClearClick"
      />
    </div>
  </div>
</template>

<style scoped>
.row-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.filter-clear-wrapper {
  margin-left: auto;
  flex-shrink: 0;
}
</style>