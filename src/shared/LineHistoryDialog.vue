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
    <div v-if="originalUrl" class="history-original-row">
      <ButtonGroup>
        <Button
            :severity="playingVersion === 'original' ? 'primary' : 'secondary'"
            :icon="playingVersion === 'original' ? 'pi pi-pause' : 'pi pi-volume-up'"
            label="Original (EN)"
            title="Play EN reference take"
            @click="toggleOriginal"
        />
      </ButtonGroup>
      <span v-if="originalDuration" class="history-original-dur">{{ formatSeconds(originalDuration) }}</span>
      <span v-if="original" class="history-original-text" :title="original">{{ original }}</span>
    </div>

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

          <div class="history-meta">
            сид {{ v.seed }} · {{ formatCreatedAt(v.created_at) }}
          </div>

          <!-- Длительность + VS Original -->
          <div class="history-duration-line">
                        <span class="history-duration-value">
                            {{ formatSeconds(getCached(versionFileUrl(v))) }}
                        </span>
            <span
                v-if="deltaFor(v)"
                :class="['history-duration-delta', `badge-${deltaFor(v).level}`]"
            >
                            {{ deltaFor(v).pctText }} vs EN
                        </span>
          </div>

          <div class="history-snapshot">
            <div class="history-snapshot-speaker">{{ v.speaker }}</div>
            <div class="history-snapshot-instruct">{{ v.instruct }}</div>
            <div class="history-snapshot-text">{{ v.text }}</div>
          </div>

          <div class="history-card-actions">
            <ButtonGroup>
              <Button
                  :severity="isPlayingVersion(v) ? 'primary' : 'secondary'"
                  :icon="isPlayingVersion(v) ? 'pi pi-pause' : 'pi pi-play'"
                  label="Play"
                  title="Прослушать этот дубль"
                  @click="togglePlay(v)"
              />
              <Button
                  size="small"
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

<style scoped src="../style/LineHistoryDialog.css"></style>
