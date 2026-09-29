<script setup>
/*
 History/versions picker for one line's rendered takes -- stateless:
 props in, emits out, ничего не fetch'ит и не пишет сам.

 Путь к аудио версии собирается из параметров строки:
   VO Dub:     {root}\_dub_versions\{audioKey}_v{version:03d}_{hash}_s{seed}.wav
   Аудиокнига: v.path (если бэкенд отдаёт), иначе кнопка Play неактивна.
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
  // Параметры строки для сборки пути к аудио версии.
  root:     { type: String, default: "" },  // VO Dub: корень проекта
  audioKey: { type: String, default: "" },  // VO Dub: row.audio_key
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

// ── аудио версии ────────────────────────────────────────────────────────
const playingVersion = ref(null);
let audioEl = null;

// VO Dub: {root}\_dub_versions\{audioKey}_v{NNN}_{hash}_s{seed}.wav
function voDubPath(v) {
  if (!props.root || !props.audioKey) return "";
  if (!v.hash || v.seed == null || v.version == null) return "";
  const ver = String(v.version).padStart(3, "0");
  const filename = `${props.audioKey}_v${ver}_${v.hash}_s${v.seed}.wav`;
  const root = String(props.root).replace(/\\/g, "/").replace(/\/$/, "");
  return `${root}/_dub_versions/${filename}`;
}

function audioUrl(v) {
  // Приоритет: собрать по формуле VO Dub. Fallback: путь из бэкенда.
  const path = voDubPath(v) || v.path || v.audio_path || v.file || "";
  if (!path) return "";
  return `${SCAN_API}/audio?path=${encodeURIComponent(path)}`;
}

function stopPlayback() {
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  playingVersion.value = null;
}

function togglePlay(v) {
  if (playingVersion.value === v.version) {
    stopPlayback();
    return;
  }
  stopPlayback();

  const url = audioUrl(v);
  if (!url) {
    console.warn("[FL history] не удалось собрать путь к версии:", v);
    return;
  }

  const el = new Audio(url);
  audioEl = el;
  playingVersion.value = v.version;

  el.addEventListener("ended", () => {
    if (playingVersion.value === v.version) stopPlayback();
  });
  el.addEventListener("error", (e) => {
    console.error("[FL history] audio error", { version: v.version, url, error: e });
    if (playingVersion.value === v.version) stopPlayback();
  });
  el.play().catch((e) => {
    console.error("[FL history] play() rejected", { version: v.version, url, error: e });
    if (playingVersion.value === v.version) stopPlayback();
  });
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

                    <div class="history-card-actions">
                        <Button :icon="playingVersion === v.version ? 'pi pi-pause' : 'pi pi-play'" size="small" title="Прослушать этот дубль" @click="togglePlay(v)"/>
                        <Button label="Сделать активной" size="small" :disabled="v.version === chosenVersion" @click="pick(v.version)"/>
                    </div>
                </template>
            </Card>
        </div>
    </Dialog>
</template>

<style scoped src="../style/LineHistoryDialog.css"></style>
