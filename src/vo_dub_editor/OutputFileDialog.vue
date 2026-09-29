<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import InputSwitch from "primevue/inputswitch";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Fieldset from "primevue/fieldset";
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
  <Dialog :visible="visible" modal header="Output File Settings" @update:visible="$emit('update:visible', $event)">

    <Fieldset legend="Effect">
      <InputGroup>
        <InputGroupAddon>
          <i class="pi pi-sliders-h" />
        </InputGroupAddon>
        <Dropdown
            inputId="ofd-effect"
            v-model="localEffect"
            :options="effectOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="No effect"
            aria-describedby="ofd-effect-help"
        />
      </InputGroup>
      <small id="ofd-effect-help">
        Аудио-эффект. Применяется после нормализации, перед сохранением файла.
      </small>
    </Fieldset>

    <Fieldset legend="Normalize">
      <InputGroup>
        <InputGroupAddon>
          <i class="pi pi-volume-up" />
        </InputGroupAddon>
        <div class="p-inputgroup-addon">
          <InputSwitch
              v-model="localNormalize"
              inputId="ofd-normalize"
              aria-describedby="ofd-normalize-help"
          />
          <label for="ofd-normalize" style="margin-left: 0.5rem;">
            {{ localNormalize ? "On" : "Off" }}
          </label>
        </div>
      </InputGroup>
      <small id="ofd-normalize-help">
        Приводит пиковую громкость к целевому уровню.
      </small>
    </Fieldset>

    <Fieldset legend="Speed">
      <InputGroup>
        <InputGroupAddon>
          EN&nbsp;{{ props.enDurationS != null ? props.enDurationS.toFixed(1) + "s" : "—" }}
          &nbsp;·&nbsp;
          RU&nbsp;{{ props.ruDurationS != null ? props.ruDurationS.toFixed(1) + "s" : "—" }}
        </InputGroupAddon>
        <Button
            text
            size="small"
            :label="speedMatchBtnLabel || 'Match'"
            :disabled="isSpeedMatchDisabled"
            @click="applySpeedMatch"
        />
        <InputGroupAddon>
          <span>{{ localSpeed.toFixed(2) }}×</span>
        </InputGroupAddon>
      </InputGroup>
      <small id="ofd-speed-help">
        Множитель скорости. «Match» подбирает коэффициент, чтобы RU-длительность совпала с EN.
      </small>
    </Fieldset>

    <template #footer>
      <Button label="Apply" @click="onApply"/>
    </template>
  </Dialog>
</template>
