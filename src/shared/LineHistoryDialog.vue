<script setup>
/*
 History/versions picker for one line's rendered takes -- same "stateless
 picker dialog" contract as SpeakerPickerDialog.vue/InstructPickerDialog.vue:
 props in, emits out, this component never fetches or writes anything
 itself. The caller (LineEditorContent.vue / VoDubLineEditorContent.vue)
 owns fetching `versions` for whichever row is open and applying `select`.

 `original`, when non-empty, means the caller has a real source-language
 text for this row (VO Dub's english field) -- only then is
 TranslationSimilarityRadar worth rendering per version; the audiobook
 Line Editor has no such field and always passes "".
*/
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Card from "primevue/card";
import Button from "primevue/button";
import Message from "primevue/message";
import { usePanelWidth } from "./panel_width.js";
import { useFontSize } from "./font_size.js";
import DialogHeader from "./DialogHeader.vue";
import TranslationSimilarityRadar from "./TranslationSimilarityRadar.vue";
import { SCRIPT_LIBRARY_API as SCAN_API } from "../../web/fl_common.js";

const props = defineProps({
    visible: { type: Boolean, required: true },
    versions: { type: Array, default: () => [] },
    chosenVersion: { type: Number, default: null },
    original: { type: String, default: "" },
});
const emit = defineEmits(["update:visible", "select"]);

const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
    storageKey: "FL_CosyVoice3.LineHistory.widthPx",
    defaultWidth: 1000,
    presets: [800, 1000, 1300],
});
const { fontSizePx: cardFontSizePx, decrease: decreaseCardFontSize, increase: increaseCardFontSize } = useFontSize({
    storageKey: "FL_CosyVoice3.LineHistory.fontSizePx",
    defaultSize: 13,
});

const sortedVersions = computed(() => [...props.versions].sort((a, b) => b.version - a.version));

function pick(version) {
    emit("select", version);
    emit("update:visible", false);
}

/*
 One shared <audio> for the whole dialog (not one per card) -- same
 posture as SpeakerPickerDialog's playSample, minus the mp3/wav fallback
 dance that exists there only for speaker samples; a version's file is
 always a plain .wav written by this addon's own render path.
*/
const playingVersion = ref(null);
let audioEl = null;

function audioUrl(path) {
    return `${SCAN_API}/audio?path=${encodeURIComponent(path)}`;
}

function stopPlayback() {
    audioEl?.pause();
    audioEl = null;
    playingVersion.value = null;
}

function togglePlay(v) {
    if (playingVersion.value === v.version) {
        stopPlayback();
        return;
    }
    stopPlayback();
    const el = new Audio(audioUrl(v.path));
    el.addEventListener("ended", () => { if (playingVersion.value === v.version) stopPlayback(); });
    el.addEventListener("error", () => { if (playingVersion.value === v.version) stopPlayback(); });
    el.play().catch(() => stopPlayback());
    audioEl = el;
    playingVersion.value = v.version;
}

function formatCreatedAt(iso) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header=" "
        :style="{ width: panelWidthCss }"
        @update:visible="stopPlayback(); $emit('update:visible', $event)"
    >
        <template #header>
            <DialogHeader
                title="История строки"
                :width-presets="widthPresets" :set-width="setPanelWidth"
                :font-size-decrease="decreaseCardFontSize" :font-size-increase="increaseCardFontSize"
            />
        </template>

        <Message v-if="!versions.length" severity="info" :closable="false">
            Для этой строки ещё нет истории озвучки.
        </Message>

        <div v-else class="history-grid" :style="{ fontSize: `${cardFontSizePx}px` }">
            <Card v-for="v in sortedVersions" :key="v.version" class="history-card">
                <template #content>
                    <div class="history-card-head">
                        <span class="history-version">Версия {{ v.version }}</span>
                        <span v-if="v.version === chosenVersion" class="history-active-badge">✓ Активна</span>
                    </div>
                    <div class="history-meta">сид {{ v.seed }} &middot; {{ formatCreatedAt(v.created_at) }}</div>
                    <div class="history-snapshot">
                        <div class="history-snapshot-speaker">{{ v.speaker }}</div>
                        <div class="history-snapshot-instruct">{{ v.instruct }}</div>
                        <div class="history-snapshot-text">{{ v.text }}</div>
                    </div>

                    <TranslationSimilarityRadar v-if="original" :original="original" :translation="v.text" />

                    <div class="history-card-actions">
                        <Button
                            :icon="playingVersion === v.version ? 'pi pi-pause' : 'pi pi-play'"
                            size="small"
                            title="Прослушать этот дубль"
                            @click="togglePlay(v)"
                        />
                        <Button
                            label="Сделать активной"
                            size="small"
                            :disabled="v.version === chosenVersion"
                            @click="pick(v.version)"
                        />
                    </div>
                </template>
            </Card>
        </div>
    </Dialog>
</template>

<style scoped src="../style/LineHistoryDialog.css"></style>
