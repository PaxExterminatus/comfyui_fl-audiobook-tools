<script setup>
/*
 Generic sticky-to-top wrapper for a dialog's row(s) of controls that
 should stay reachable while the dialog's content scrolls. PrimeVue's
 theme.css puts `overflow-y: auto` on .p-dialog-content itself (the
 whole body below the header scrolls as ONE block) -- an inner
 overflow:auto container (e.g. Line Editor's own rows-container) never
 actually gets to scroll on its own without an explicit min-height:0
 override, so pinning has to happen here, on whatever sits above that
 inner container, not inside it. A plain class on each caller's own
 wrapper div would've worked too, but every dialog wants the exact same
 three declarations -- this is the one place to keep them.
*/
</script>

<template>
    <div class="sticky-panel"><slot /></div>
</template>

<style scoped src="./StickyPanel.css"></style>
