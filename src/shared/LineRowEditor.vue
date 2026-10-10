<script setup>
/*
 THE line-editing component -- rendered into a row's editable fields by
 both the audiobook Line Editor (LineEditorContent.vue) and VO Dub's Line
 Editor (VoDubLineEditor.vue).

 Caller-agnostic: takes `row` + `index`, and asks a provided API object
 (inject: "lineRowApi") how to READ and WRITE each editable field.

 A 3-root component (line-controls-row / instruct note / textarea) on
 purpose -- these already need to stack as siblings inside the caller's
 own `.line-body`-equivalent wrapper, not nest inside one extra div.
*/
import { inject, ref } from "vue";
import RoleDropdown from "./RoleDropdown.vue";
import TextTagEditorDialog from "./TextTagEditorDialog.vue";

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

// ── диалог тегов ─────────────────────────────────────────────────────
const tagEditorVisible = ref(false);

function openTagEditor() {
  tagEditorVisible.value = true;
}

function onTagEditorSave(newText) {
  api.setText(props.row, newText);
}

/*
 Writes el.value directly and skips PrimeVue's own onInput handler
 entirely -- pasted text never introduces a literal newline.
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
  <div class="row">
    <slot name="leading" />

    <InputGroup class="speaker-group shrink-0">
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
          class="instruct-undo-btn shrink-0"
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
          title="Pick an instruct phrase from the category bank"
          @click="api.openInstructPicker(row)"
      />
      <Button
          icon="pi pi-users"
          class="apply-instruct-btn"
          :disabled="!api.canApplyInstruct(row)"
          :title="api.applyInstructTitle(row)"
          @click="api.applyInstructToSameRole(row)"
      />
    </InputGroup>

    <slot name="trailing" />
  </div>

  <div v-if="api.instructNoteFor(row)" class="instruct-desc p-text-secondary">↳ {{ api.instructNoteFor(row) }}</div>

  <slot name="above-text" />

  <div class="text-row row">
    <Button
        icon="pi pi-pencil"
        class="text-edit-btn"
        title="Edit text with tag palette"
        @click="openTagEditor"
    />
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
  </div>

  <TextTagEditorDialog
      v-model:visible="tagEditorVisible"
      :text="api.getText(row)"
      :original-url="api.getOriginalAudioUrl?.(row) || ''"
      :current-url="api.getCurrentAudioUrl?.(row) || ''"
      @save="onTagEditorSave"
  />
</template>

<style scoped>
.instruct-group {
  flex: 1 1 160px;
  min-width: 140px;
}
.instruct-desc {
  padding-left: 22px;
}
.text-row {
  align-items: flex-start;
  width: 100%;
}
.text-edit-btn {
  flex: 0 0 auto;
  margin-top: 4px;
}
</style>
