<script setup>
// Card-based picker for saved CosyVoice speaker presets -- same pattern as
// InstructPickerDialog.vue (a Dialog full of Cards instead of a Dropdown),
// just one card per preset instead of one per category. Stateless: doesn't
// know which row it's assigning a speaker for, just emits the chosen
// preset and lets the caller (LineEditorApp.vue) decide what to do with
// it -- same contract as InstructPickerDialog's own `select` emit.
import { ref } from "vue";
import Dialog from "primevue/dialog";
import Card from "primevue/card";
import Button from "primevue/button";
import Message from "primevue/message";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import { speakerAccent, speakerInitials } from "../shared/speaker_accent.js";
import DialogHeader from "../shared/DialogHeader.vue";
import { joinPath, SCRIPT_LIBRARY_API as SCAN_API } from "../../web/fl_common.js";

const props = defineProps({
    visible: { type: Boolean, required: true },
    presets: { type: Array, default: () => [] },
    // Absolute folder holding each preset's OWN .pt file -- also where a
    // same-named sample .mp3/.wav is expected to live (see the /audio
    // route this samples from; "" means presets haven't loaded yet, no
    // preview is offered until they have).
    sampleDir: { type: String, default: "" },
    // Optional (preset: string) => sublabel text, e.g. "used by: ..." --
    // the caller already has this logic (see LineEditorApp.vue's
    // speakerUsageSubLabel); kept out of this component so it stays a
    // plain preset-picker with no opinion on who's "using" what.
    usageFor: { type: Function, default: null },
});
const emit = defineEmits(["update:visible", "select"]);

const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.SpeakerPicker.widthPx",
    defaultWidth: 900,
    presets: [700, 900],
});
const { fontSizePx: cardFontSizePx, decrease: decreaseCardFontSize, increase: increaseCardFontSize } = useFontSize({
    storageKey: "FL_CosyVoice3.SpeakerPicker.fontSizePx",
    defaultSize: 13,
});

function pick(preset) {
    emit("select", preset);
    emit("update:visible", false);
}

// ── sample preview: one <audio> shared across every card, mp3 first, wav
// as a fallback (see nodes/script_library.py's speaker_presets route --
// neither extension is confirmed to exist server-side, the element itself
// just tries one then the other, same "let the browser tell us" approach
// the rest of this addon already uses for "is there a take yet").
const playingPreset = ref(null);
let sampleEl = null;

function sampleUrl(preset, ext) {
    return `${SCAN_API}/audio?path=${encodeURIComponent(joinPath(props.sampleDir, `${preset}.${ext}`))}`;
}

function stopSample() {
    sampleEl?.pause();
    sampleEl = null;
    playingPreset.value = null;
}

function playSample(preset) {
    if (playingPreset.value === preset) {
        stopSample();
        return;
    }
    stopSample();
    if (!props.sampleDir) return;
    const el = new Audio(sampleUrl(preset, "mp3"));
    let triedWav = false;
    el.addEventListener("error", () => {
        if (triedWav) { if (playingPreset.value === preset) stopSample(); return; }
        triedWav = true;
        el.src = sampleUrl(preset, "wav");
        el.play().catch(() => stopSample());
    });
    el.addEventListener("ended", () => { if (playingPreset.value === preset) stopSample(); });
    el.play().catch(() => stopSample());
    sampleEl = el;
    playingPreset.value = preset;
}
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header=" "
        :style="{ width: panelWidthCss }"
        @update:visible="stopSample(); $emit('update:visible', $event)"
    >
        <template #header>
            <DialogHeader
                title="Pick a speaker"
                :width-presets="widthPresets" :set-width="setPanelWidth"
                :font-size-decrease="decreaseCardFontSize" :font-size-increase="increaseCardFontSize"
            />
        </template>

        <Message v-if="!presets.length" severity="info" :closable="false">
            No saved speaker presets found.
        </Message>
        <div class="speaker-grid" :style="{ fontSize: `${cardFontSizePx}px` }">
            <Card
                v-for="preset in presets" :key="preset"
                class="speaker-card"
            >
                <template #content>
                    <!-- @click lives here, not on <Card> itself -- Card's
                    root is `inheritAttrs: false` and its ptmi() re-merge
                    (see BaseComponent.vue) doesn't end up forwarding a
                    plain @click from a <script setup> caller onto it, so a
                    listener on the Card tag itself is silently never
                    attached. This div is ours, no such surprise. -->
                    <div class="speaker-card-row" @click="pick(preset)">
                        <div class="speaker-avatar" :style="{ backgroundColor: speakerAccent(preset) }">{{ speakerInitials(preset) }}</div>
                        <div class="speaker-card-text">
                            <div class="speaker-name">{{ preset }}</div>
                            <div v-if="usageFor && usageFor(preset)" class="speaker-usage">{{ usageFor(preset) }}</div>
                        </div>
                        <!-- Same story as Card above: Button also has
                        `inheritAttrs: false`, so a bare @click.stop placed
                        directly on <Button> never reaches its native root
                        <button> -- the click keeps bubbling up to
                        .speaker-card-row's own handler, which is why this
                        used to "select" instead of "play". A plain wrapper
                        owns the stop instead. -->
                        <span class="speaker-play-wrap" @click.stop="playSample(preset)">
                            <Button
                                :icon="playingPreset === preset ? 'pi pi-pause' : 'pi pi-play'"
                                size="small"
                                :disabled="!sampleDir"
                                title="Preview this speaker's sample"
                            />
                        </span>
                    </div>
                </template>
            </Card>
        </div>
    </Dialog>
</template>

<style scoped lang="sass" src="./SpeakerPickerDialog.sass"></style>
