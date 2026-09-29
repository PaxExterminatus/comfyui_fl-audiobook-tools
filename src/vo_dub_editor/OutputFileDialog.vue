<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import { speedMatchLabel } from "../shared/speed_match.js";

const props = defineProps({
    visible: { type: Boolean, required: true },
    audioKey: { type: String, default: "" },
    effect: { type: String, default: "" },
    normalize: { type: Boolean, default: false },
    speed: { type: Number, default: 1.0 },
    enDurationS: { type: Number, default: null },
    ruDurationS: { type: Number, default: null },
});

const emit = defineEmits(["update:visible", "apply"]);

const effectOptions = [
    { value: "", label: "No effect" },
    { value: "radio", label: "📻 Radio" },
    { value: "phone", label: "📞 Phone" },
    { value: "muffled", label: "🤫 Muffled" },
    { value: "radio_dry", label: "📻 Radio (no static)" },
    { value: "intercom", label: "🔊 Intercom" },
    { value: "suit", label: "🧑‍🚀 Suit" },
];

const localEffect = ref(props.effect);
const localNormalize = ref(props.normalize);
const localSpeed = ref(props.speed);

watch(() => props.visible, (v) => {
    if (v) {
        localEffect.value = props.effect;
        localNormalize.value = props.normalize;
        localSpeed.value = props.speed;
    }
});

const matchResult = computed(() => speedMatchLabel(props.enDurationS, props.ruDurationS));
const speedMatchBtnLabel = computed(() => matchResult.value.label);
const isSpeedMatchDisabled = computed(() => !speedMatchBtnLabel.value);

function applySpeedMatch() {
    if (!isSpeedMatchDisabled.value) {
        localSpeed.value = matchResult.value.ratio;
    }
}

function onApply() {
    emit("apply", {
        effect: localEffect.value,
        normalize: localNormalize.value,
        speed: localSpeed.value,
    });
    emit("update:visible", false);
}
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header="Output File Settings"
        :style="{ width: '500px' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="output-file-dialog-content">
            <div class="field-row">
                <label>Effect:</label>
                <Dropdown v-model="localEffect" :options="effectOptions" optionLabel="label" optionValue="value" />
            </div>
            <div class="field-row">
                <label>Normalize:</label>
                <Checkbox v-model="localNormalize" :binary="true" />
            </div>
            <div class="field-row speed-row">
                <span>EN {{ props.enDurationS != null ? props.enDurationS.toFixed(1) : '-' }}s</span>
                <span>RU {{ props.ruDurationS != null ? props.ruDurationS.toFixed(1) : '-' }}s</span>
                <Button
                    class="speed-match-btn"
                    :label="speedMatchBtnLabel || 'Match speed'"
                    :disabled="isSpeedMatchDisabled"
                    @click="applySpeedMatch"
                />
                <span>Speed: {{ localSpeed.toFixed(2) }}</span>
            </div>
            <div class="dialog-actions">
                <Button label="Apply" class="apply-btn" @click="onApply" />
            </div>
        </div>
    </Dialog>
</template>
