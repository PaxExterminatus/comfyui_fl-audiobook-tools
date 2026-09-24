<script setup>
/*
 Pairs with font_size.js's useFontSize() -- the A-/A+ button pair itself
 was only ever built once, inline in Line Editor's own header slot;
 factored out so every dialog can offer the same control over whatever
 text it reads a lot of, the same way PanelWidthButtons already does for
 dialog width.
*/
import Button from "primevue/button";

defineProps({
    decrease: { type: Function, required: true },
    increase: { type: Function, required: true },
});
</script>

<template>
    <div class="font-size-row">
        <Button label="A−" text size="small" title="Decrease text size" @click="decrease" />
        <Button label="A+" text size="small" title="Increase text size" @click="increase" />
    </div>
</template>

<style scoped lang="sass" src="./FontSizeButtons.sass"></style>
