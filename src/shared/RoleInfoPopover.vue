<script setup>
/*
 Rendering half of useRoleInfoPopover (see role_info_popover.js) -- the
 popover shell itself has no opinion on WHICH fields a role carries
 (LineEditorApp.vue's _roles.json entries and VoDubLineEditor.vue's
 _dub_roles.json entries don't share a shape), so it just renders
 whatever [key, value] pairs the caller's own field-extractor produced.
 `.role-info-popover` (the fixed-position shell) lives in src/style/app.css
 (forwarded into every entry already); the rows inside it use the shared
 `.row`/`.space-between` type classes plus PrimeVue's own `.p-text-secondary`
 utility for the key -- this component has no scoped style of its own.
*/
defineProps({
    visible: { type: Boolean, default: false },
    left: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    message: { type: String, default: "" },
    fields: { type: Array, default: () => [] }, // [[key, value], ...]
});
</script>

<template>
    <div v-if="visible" class="role-info-popover" :style="{ left: `${left}px`, top: `${top}px` }">
        <div v-if="message">{{ message }}</div>
        <div v-for="([k, v]) in fields" :key="k" class="row space-between">
            <span class="p-text-secondary">{{ k }}</span>
            <span>{{ v }}</span>
        </div>
    </div>
</template>
