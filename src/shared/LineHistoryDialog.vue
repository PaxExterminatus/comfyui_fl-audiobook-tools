<script setup>
/*
 History/versions picker for one line's rendered takes -- stateless.
 Все URL строятся через useAudioFiles() из root + audioKey (уже есть в props).
 Длительность и % отклонения от EN берутся из того же composable.
*/
import { ref, computed, watch } from "vue";
import { usePanelWidth } from "./panel_width.js";
import { useFontSize } from "./font_size.js";
import DialogHeader from "./DialogHeader.vue";
import { useAudioFiles } from "./audio_files.js";
import { levelColorClass } from "./level_color.js";

const props = defineProps({
  visible: { type: Boolean, required: true },
  versions: { type: Array, default: () => [] },
  chosenVersion: { type: Number, default: null },
  original: { type: String, default: "" },
  root: { type: String, default: "" },
  audioKey: { type: String, default: "" },
});
const emit = defineEmits(["update:visible", "select"]);

const { enUrl, versionUrl, getDuration, getCached, calcDelta, formatSeconds } = useAudioFiles();

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

// EN URL строится на месте, без проброса через родителя
const originalUrl = computed(() => enUrl(props.root, props.audioKey));
const originalDuration = computed(() => getCached(originalUrl.value));

function versionFileUrl(v) {
  return versionUrl(props.root, props.audioKey, v.version, v.hash, v.seed);
}

function deltaFor(v) {
  return calcDelta(originalDuration.value, getCached(versionFileUrl(v)));
}

async function loadDurations() {
  if (originalUrl.value) await getDuration(originalUrl.value);
  for (const v of sortedVersions.value) {
    const u = versionFileUrl(v);
    if (u) await getDuration(u);
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    stopPlayback();
    loadDurations();
  } else {
    stopPlayback();
  }
});

// ── прослушивание ────────────────────────────────────────────────────
const playingVersion = ref(null); // null | 'original' | number
let audioEl = null;

function stopPlayback() {
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  playingVersion.value = null;
}

function playUrl(url, mode) {
  stopPlayback();
  if (!url) return;
  const el = new Audio(url);
  audioEl = el;
  playingVersion.value = mode;
  el.addEventListener("ended", () => {
    if (playingVersion.value === mode) stopPlayback();
  });
  el.addEventListener("error", () => {
    if (playingVersion.value === mode) stopPlayback();
  });
  el.play().catch(() => {
    if (playingVersion.value === mode) stopPlayback();
  });
}

function toggleOriginal() {
  if (playingVersion.value === "original") stopPlayback();
  else playUrl(originalUrl.value, "original");
}

function togglePlay(v) {
  const mode = v.version;
  if (playingVersion.value === mode) stopPlayback();
  else playUrl(versionFileUrl(v), mode);
}

function isPlayingVersion(v) {
  return playingVersion.value === v.version;
}

function pick(version) {
  emit("select", version);
  emit("update:visible", false);
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
  <Dialog :visible="visible" modal header="История строки" :style="{ width: panelWidthCss }"
          @update:visible="stopPlayback(); $emit('update:visible', $event)"
  >
    <!-- Play Original (EN) -->
    <div v-if="originalUrl" class="history-original-row row panel">
      <ButtonGroup>
        <Button
            :severity="playingVersion === 'original' ? 'primary' : 'secondary'"
            :icon="playingVersion === 'original' ? 'pi pi-pause' : 'pi pi-volume-up'"
            label="Original (EN)"
            title="Play EN reference take"
            @click="toggleOriginal"
        />
      </ButtonGroup>
      <span v-if="originalDuration" class="p-text-secondary">{{ formatSeconds(originalDuration) }}</span>
      <span v-if="original" :title="original">{{ original }}</span>
    </div>

    <Message v-if="!versions.length" severity="info" :closable="false">
      Для этой строки ещё нет истории озвучки.
    </Message>

    <div v-else class="grid" style="--grid-min: 320px;" :style="{ fontSize: `${cardFontSizePx}px` }">
      <Card v-for="v in sortedVersions" :key="v.version">
        <template #title>
          <div class="row">
            <span>Версия {{ v.version }}</span>
            <InlineMessage v-if="v.version === chosenVersion" severity="success">✓ Активна</InlineMessage>
          </div>
        </template>
        <template #subtitle>
          сид {{ v.seed }} · {{ formatCreatedAt(v.created_at) }}
        </template>
        <template #content>
          <!-- Длительность + VS Original -->
          <div class="row">
                        <span class="p-text-secondary">
                            {{ formatSeconds(getCached(versionFileUrl(v))) }}
                        </span>
            <span
                v-if="deltaFor(v)"
                class="history-duration-delta"
                :class="levelColorClass(deltaFor(v).level)"
            >
                            {{ deltaFor(v).pctText }} vs EN
                        </span>
          </div>

          <div class="history-snapshot card">
            <div>{{ v.speaker }}</div>
            <div class="p-text-secondary">{{ v.instruct }}</div>
            <div class="history-snapshot-text">{{ v.text }}</div>
          </div>

          <div class="history-card-actions actions">
            <ButtonGroup>
              <Button
                  :severity="isPlayingVersion(v) ? 'primary' : 'secondary'"
                  :icon="isPlayingVersion(v) ? 'pi pi-pause' : 'pi pi-play'"
                  label="Play"
                  title="Прослушать этот дубль"
                  @click="togglePlay(v)"
              />
              <Button
                  label="Сделать активной"
                  icon="pi pi-check"
                  :disabled="v.version === chosenVersion"
                  @click="pick(v.version)"
              />
            </ButtonGroup>
          </div>
        </template>
      </Card>
    </div>
  </Dialog>
</template>

<style scoped>
.history-original-row {
  padding: 8px 12px;
  margin-bottom: 12px;
}
.history-snapshot {
  margin-top: 8px;
}
.history-snapshot-text {
  margin-top: 4px;
  word-break: break-word;
}
.history-card-actions {
  margin-top: 10px;
}
</style>
