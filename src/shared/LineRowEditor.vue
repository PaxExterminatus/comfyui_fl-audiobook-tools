<script setup>
/*
 THE line-editing component -- rendered into a row's editable fields by
 both the audiobook Line Editor (LineEditorContent.vue) and VO Dub's Line
 Editor (VoDubLineEditor.vue).

 Caller-agnostic: takes `row` + `index`, and asks a provided API object
 (inject: "lineRowApi") how to READ and WRITE each editable field. Each
 caller provides its own API — audiobook's row has .speaker/.instruct/.text,
 VO Dub's row wraps its state in an entryFor(row) object — but the UI here
 is one component, not two hand-drifted copies.

 What this component does NOT own: what sits BEFORE the controls (a play
 button, an Identifier span — see `leading` slot) or AFTER them (speaker
 presets, pause fields, delete buttons — see `trailing`), since those
 differ per caller in ways that aren't "the same widget, different data".

 A 3-root component (line-controls-row / instruct note / textarea) on
 purpose — these already need to stack as siblings inside the caller's own
 `.line-body`-equivalent wrapper, not nest inside one extra div.
*/
import { inject } from "vue";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import RoleDropdown from "./RoleDropdown.vue";

const props = defineProps({
  row:   { type: Object, required: true },
  index: { type: Number, default: -1 },
});

const api = inject("lineRowApi");
if (!api) {
  throw new Error(
      "LineRowEditor: provide('lineRowApi', {...}) отсутствует в родителе",
  );
}

/*
 Writes el.value directly and skips PrimeVue's own onInput handler
 entirely (preventDefault stops the native paste from ever firing an
 `input` event) -- pasted text never introduces a literal newline into
 what's meant to stay one line of dialogue.
*/
function onPaste(event) {
  event.preventDefault();
  const el = event.target;
  const pasted = (event.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/[\r\n]+/g, " ");
  const start = el.selectionStart;
  const end = el.selectionEnd;
  el.value = el.value.slice(0, start) + pasted + el.value.slice(end);
  el.selectionStart = el.selectionEnd = start + pasted.length;
  api.setText(props.row, el.value);
  api.autoGrow?.(el);
}
</script>

<template>
  <div class="line-controls-row">
    <slot name="leading" />

    <InputGroup class="speaker-group">
      <InputGroupAddon><i class="pi pi-address-book" /></InputGroupAddon>
      <RoleDropdown
          :model-value="api.getSpeaker(row)"
          :role-entries="api.roleEntries.value"
          :option-sub-label="api.roleOptionSubLabel"
          :placeholder="api.speakerPlaceholder"
          :title="api.speakerTitle"
          @update:model-value="api.setSpeaker(row, $event)"
      />
      <InputGroupAddon
          class="role-info-btn"
          @mouseenter="api.showRoleInfoPopover($event.target, api.getRoleInfoCode(row))"
          @mouseleave="api.hideRoleInfoPopover"
      ><i class="pi pi-info-circle" /></InputGroupAddon>
    </InputGroup>

    <InputGroup class="instruct-group">
      <InputGroupAddon><i class="pi pi-book" /></InputGroupAddon>
      <Button
          icon="pi pi-undo"
          size="small"
          class="instruct-undo-btn"
          :disabled="!api.canUndoInstruct(row)"
          :title="api.undoInstructTitle(row)"
          @click="api.undoInstruct(row)"
      />
      <InputText
          :model-value="api.getInstruct(row)"
          :placeholder="api.instructPlaceholder"
          :title="api.instructTitle"
          @update:model-value="api.setInstruct(row, $event)"
      />
      <Button
          icon="pi pi-th-large"
          size="small"
          title="Pick an instruct phrase from the category bank"
          @click="api.openInstructPicker(row)"
      />
    </InputGroup>

    <slot name="trailing" />
  </div>

  <div v-if="api.instructNoteFor(row)" class="instruct-desc">↳ {{ api.instructNoteFor(row) }}</div>

  <slot name="above-text" />

  <Textarea
      :model-value="api.getText(row)"
      auto-resize
      rows="1"
      class="fl-textarea"
      :style="{ fontSize: `${api.fontSizePx.value}px` }"
      :placeholder="api.textPlaceholder"
      :ref="(el) => api.setTextareaRef(api.textKey(row), el)"
      @update:model-value="api.setText(row, $event)"
      @keydown.enter.prevent
      @paste="onPaste"
  />
</template>
