<script setup>
import { ref, watch, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import InputSwitch from "primevue/inputswitch";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Fieldset from "primevue/fieldset";

const props = defineProps({
  visible: { type: Boolean, required: true },
  audioKey: { type: String, default: "" },
  effect: { type: String, default: "" },
  normalize: { type: Boolean, default: false },
  speedMatch: { type: Boolean, default: false },
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
const localSpeedMatch = ref(props.speedMatch);

watch(() => props.visible, (v) => {
  if (v) {
    localEffect.value = props.effect;
    localNormalize.value = props.normalize;
    localSpeedMatch.value = props.speedMatch;
  }
});

const speedHint = computed(() => {
  if (props.enDurationS == null || props.ruDurationS == null) {
    return "Одна из длительностей неизвестна — сопоставление недоступно.";
  }
  const ratio = props.ruDurationS / props.enDurationS;
  const pct = Math.round((ratio - 1) * 100);
  if (Math.abs(pct) < 1) {
    return "Длительности уже совпадают.";
  }
  return `RU ${pct > 0 ? "длиннее" : "короче"} на ${Math.abs(pct)}% — при включении RU подстроится под EN (тон сохранится).`;
});

function onApply() {
  emit("apply", {
    effect: localEffect.value,
    normalize: localNormalize.value,
    speedMatch: localSpeedMatch.value,
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
        />
      </InputGroup>
      <small>
        Аудио-эффект. Применяется после нормализации, перед сохранением файла.
      </small>
    </Fieldset>

    <Fieldset legend="Normalize">
      <InputGroup>
        <InputGroupAddon>
          <i class="pi pi-volume-up" />
        </InputGroupAddon>
        <div class="p-inputgroup-addon">
          <InputSwitch v-model="localNormalize" />
          <label style="margin-left: 0.5rem;">
            {{ localNormalize ? "On" : "Off" }}
          </label>
        </div>
      </InputGroup>
      <small>
        Приводит пиковую громкость к целевому уровню.
      </small>
    </Fieldset>

    <Fieldset legend="Match duration">
      <InputGroup>
        <InputGroupAddon>
          EN {{ props.enDurationS != null ? props.enDurationS.toFixed(2) + "s" : "—" }} RU {{ props.ruDurationS != null ? props.ruDurationS.toFixed(2) + "s" : "—" }}
        </InputGroupAddon>
        <div class="p-inputgroup-addon">
          <InputSwitch v-model="localSpeedMatch" />
          <label style="margin-left: 0.5rem;">
            {{ localSpeedMatch ? "On" : "Off" }}
          </label>
        </div>
      </InputGroup>
      <small>{{ speedHint }}</small>
    </Fieldset>

    <template #footer>
      <Button label="Apply" @click="onApply"/>
    </template>
  </Dialog>
</template>
