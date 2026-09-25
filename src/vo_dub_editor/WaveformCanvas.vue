<script setup>
/*
 A small static waveform overview for one audio file -- purely visual,
 never a substitute for the native <audio controls> element sitting
 below it in VoDubLineEditor.vue's own template. An earlier round of
 this editor tried making the waveform itself into a custom player
 (progress overlay + click-to-seek + custom play/pause buttons,
 replacing native controls entirely) -- reverted: it kept re-inventing
 bugs the browser's own player never had (a play/pause icon that
 flickered during buffering, a track that didn't restart from 0 after
 ending, a progress bar that could desync), and the user explicitly
 asked for the native component back rather than a bespoke one. See
 effect_preview.js's own comment for the same "don't rebuild what the
 platform already does well" reasoning.

 Decodes lazily on mount -- a genuine, deliberate tradeoff over this
 editor's usual "preload=none, fetch nothing until pressed play"
 posture: a waveform has to fetch+decode the WHOLE file to draw anything
 at all, so there's no way to make it free. Pagination (50 rows/page)
 keeps the worst case bounded to 100 fetches for a page, not the
 thousand-plus a whole unbounded bucket would cost.
*/
import { ref, watch, onMounted } from "vue";
import { decodeWaveformPeaks } from "./waveform.js";

const props = defineProps({
    src: { type: String, default: "" },
});

const canvasEl = ref(null);
const loading = ref(false);
const failed = ref(false);

function renderPeaks(canvas, peaks) {
    /*
     Decoding can succeed in an environment with no 2D canvas support at
     all (e.g. this addon's own test suite -- happy-dom implements no
     canvas rendering context whatsoever) -- that's a drawing limitation,
     not a decode failure, so it's guarded separately from load()'s own
     try/catch rather than being lumped in with "couldn't load this file".
    */
    if (typeof canvas.getContext !== "function") return;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 200;
    const cssHeight = canvas.clientHeight || 28;
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    const barWidth = cssWidth / peaks.length;
    const mid = cssHeight / 2;
    ctx.fillStyle = getComputedStyle(canvas).color || "#4caf50";
    for (let i = 0; i < peaks.length; i++) {
        const h = Math.max(1, peaks[i] * cssHeight);
        ctx.fillRect(i * barWidth, mid - h / 2, Math.max(1, barWidth - 1), h);
    }
}

async function load() {
    if (!props.src || !canvasEl.value) return;
    loading.value = true;
    failed.value = false;
    try {
        const width = canvasEl.value.clientWidth || 200;
        const peaks = await decodeWaveformPeaks(props.src, Math.max(20, Math.round(width / 3)));
        if (canvasEl.value) renderPeaks(canvasEl.value, peaks);
    } catch (e) {
        failed.value = true;
    } finally {
        loading.value = false;
    }
}

onMounted(load);
watch(() => props.src, load);
</script>

<template>
    <div class="waveform-wrap">
        <canvas ref="canvasEl" class="waveform-canvas" />
        <span v-if="loading" class="waveform-status">…</span>
        <span v-else-if="failed" class="waveform-status" title="Couldn't load a waveform for this file">⚠</span>
    </div>
</template>

<style scoped>
/*
 These rules must live HERE, not in a caller's own scoped CSS file --
 Vue's scoped-CSS attribute is only stamped onto THIS component's own
 root node when rendered from a parent, never onto elements nested
 inside its own template (the <canvas>, the status <span>s). A parent
 rule targeting `.waveform-canvas` would silently never match and this
 canvas would fall back to its intrinsic default size (300x150 CSS
 pixels) with no clipping on the wrap -- exactly what overlapped every
 row below it before this was caught.
*/
.waveform-wrap {
    position: relative;
    width: 100%;
    height: 28px;
    overflow: hidden;
}

.waveform-canvas {
    display: block;
    width: 100%;
    height: 100%;
    color: var(--color-success);
}

.waveform-status {
    position: absolute;
    top: 0;
    right: 4px;
    font-size: var(--font-xs);
    opacity: 0.6;
}
</style>
