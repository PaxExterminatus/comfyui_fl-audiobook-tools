<script setup>
/*
 Shared "speaker/role" Dropdown -- extracted from LineEditorApp.vue's own
 speaker field so the audiobook's Line Editor and VO Dub's Line Editor
 use the EXACT same component/behavior instead of two hand-drifted
 copies. Looks up a role CODE against whichever role catalog the caller
 is using (_roles.json for an audiobook, _dub_roles.json for a VO dub
 project) -- editable, so typing a value that ISN'T a known code just
 passes it straight through as a literal preset name (both backends'
 own role resolution already does the same: `role_map.get(value,
 value)`, never an error for an unrecognized value).
*/
import Dropdown from "primevue/dropdown";

const props = defineProps({
    modelValue: { type: String, default: "" },
    roleEntries: { type: Array, default: () => [] }, // [{code, ...}] -- shape beyond `code` is the caller's own
    optionSubLabel: { type: Function, default: () => "" }, // (entry) => string, shown under each option's code
    placeholder: { type: String, default: "Speaker" },
    title: { type: String, default: "Role code, or a literal preset/preset#tag" },
});
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
    <Dropdown
        :model-value="modelValue"
        :options="roleEntries"
        option-label="code"
        option-value="code"
        editable
        filter
        :placeholder="placeholder"
        :title="title"
        class="role-dropdown"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <template #option="{ option }">
            <div class="dropdown-option-label">{{ option.code }}</div>
            <div v-if="optionSubLabel(option)" class="dropdown-option-sublabel">{{ optionSubLabel(option) }}</div>
        </template>
    </Dropdown>
</template>

<style scoped src="../style/RoleDropdown.css"></style>
