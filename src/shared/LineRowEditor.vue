<script setup>
/*
 THE line-editing component -- extracted out of LineEditorApp.vue's own
 per-row markup so both the audiobook Line Editor and VO Dub's Line
 Editor mount the exact same component for a row's editable fields, not
 two hand-drifted copies of the same layout (see RoleDropdown.vue/
 InstructPickerDialog.vue/RoleInfoPopover.vue, already shared the same
 way -- this is that same policy applied to the row ASSEMBLY itself, not
 just its individual widgets).

 Deliberately prop/emit-driven, no `row` object dependency of its own --
 each caller's own row shape (LineEditorApp's script-line rows,
 VoDubLineEditor's csv rows) stays entirely on that caller's side; this
 component only ever sees plain values. What it does NOT own: whatever
 sits BEFORE this row's controls (a play button, an Identifier span --
 see the `leading` slot) or AFTER them (a global speaker-preset
 reassignment field, a pause field, a delete button -- see `trailing`),
 since those differ per caller in ways that aren't just "the same widget,
 different data" the way speaker/instruct/text are.

 A 3-root component (line-controls-row / instruct note / textarea) on
 purpose -- these already need to stack as siblings inside the caller's
 own `.line-body`-equivalent wrapper, not nest inside one extra div.
*/
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import RoleDropdown from "./RoleDropdown.vue";

const props = defineProps({
    // speaker / role
    speaker: { type: String, default: "" },
    roleEntries: { type: Array, default: () => [] },
    roleOptionSubLabel: { type: Function, default: () => "" },
    speakerPlaceholder: { type: String, default: "Speaker" },
    speakerTitle: { type: String, default: "Speaker (role code, or a literal preset/preset#tag)" },
    /*
     What the info-hover looks up -- may differ from `speaker` itself
     (VO Dub's per-row override falls back to the row's raw csv tag when
     empty; the info popover should still resolve THAT identity).
    */
    roleInfoCode: { type: String, default: "" },

    // instruct
    instruct: { type: String, default: "" },
    instructPlaceholder: { type: String, default: "Instruct" },
    instructTitle: { type: String, default: "Instruct text -- type freely, or pick from the phrase bank" },
    canUndoInstruct: { type: Boolean, default: false },
    undoInstructTitle: { type: String, default: "" },
    canApplyInstruct: { type: Boolean, default: false },
    applyInstructTitle: { type: String, default: "" },
    instructNote: { type: String, default: "" },

    // text
    text: { type: String, default: "" },
    textPlaceholder: { type: String, default: "" },
    fontSizePx: { type: Number, default: 13 },
    /*
     Forwarded straight to the underlying Textarea's own `ref` -- the
     caller's own useTextareaAutoGrow() Map (see textarea_autogrow.js)
     needs the real node, this component has no tracking of its own.
    */
    textareaRef: { type: Function, default: null },
    /*
     Called after a paste (see onPaste) -- preventDefault there skips
     PrimeVue's own resize, so the caller's autoGrow needs an explicit
     nudge same as it does after loading fresh content.
    */
    onAutoGrow: { type: Function, default: null },
});

const emit = defineEmits([
    "update:speaker", "update:instruct", "update:text",
    "open-instruct-picker", "undo-instruct", "apply-instruct",
    "role-info-enter", "role-info-leave",
]);

/*
 Writes el.value directly and skips PrimeVue's own onInput handler
 entirely (preventDefault stops the native paste from ever firing an
 `input` event) -- pasted text never introduces a literal newline into
 what's meant to stay one line of dialogue.
*/
function onPaste(event) {
    event.preventDefault();
    const el = event.target;
    const pasted = (event.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " ");
    const start = el.selectionStart, end = el.selectionEnd;
    el.value = el.value.slice(0, start) + pasted + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + pasted.length;
    emit("update:text", el.value);
    props.onAutoGrow?.(el);
}
</script>

<template>
    <div class="line-controls-row">
        <slot name="leading" />

        <InputGroup class="speaker-group">
            <InputGroupAddon><i class="pi pi-address-book" /></InputGroupAddon>
            <RoleDropdown
                :model-value="speaker"
                :role-entries="roleEntries"
                :option-sub-label="roleOptionSubLabel"
                :placeholder="speakerPlaceholder"
                :title="speakerTitle"
                @update:model-value="emit('update:speaker', $event)"
            />
            <InputGroupAddon
                class="role-info-btn"
                @mouseenter="emit('role-info-enter', $event.target, roleInfoCode)"
                @mouseleave="emit('role-info-leave')"
            ><i class="pi pi-info-circle" /></InputGroupAddon>
        </InputGroup>

        <InputGroup class="instruct-group">
            <InputGroupAddon><i class="pi pi-book" /></InputGroupAddon>
            <Button
                icon="pi pi-undo"
                size="small"
                class="instruct-undo-btn"
                :disabled="!canUndoInstruct"
                :title="undoInstructTitle"
                @click="emit('undo-instruct')"
            />
            <InputText
                :model-value="instruct"
                :placeholder="instructPlaceholder"
                :title="instructTitle"
                @update:model-value="emit('update:instruct', $event)"
            />
            <Button
                icon="pi pi-th-large"
                size="small"
                title="Pick an instruct phrase from the category bank"
                @click="emit('open-instruct-picker')"
            />
            <Button
                icon="pi pi-users"
                size="small"
                class="apply-instruct-btn"
                :disabled="!canApplyInstruct"
                :title="applyInstructTitle"
                @click="emit('apply-instruct')"
            />
        </InputGroup>

        <slot name="trailing" />
    </div>
    <div v-if="instructNote" class="instruct-desc">↳ {{ instructNote }}</div>
    <slot name="above-text" />

    <Textarea
        :model-value="text"
        auto-resize
        rows="1"
        class="fl-textarea"
        :style="{ fontSize: `${fontSizePx}px` }"
        :placeholder="textPlaceholder"
        :ref="textareaRef"
        @update:model-value="emit('update:text', $event)"
        @keydown.enter.prevent
        @paste="onPaste"
    />
</template>
