<script setup>
/**
 * Диалог редактирования текста строки с панелью вставки тэгов CosyVoice3.
 *
 * Сверху ButtonGroup с четырьмя кнопками прослушивания:
 *   🔊 Original   — EN-эталон
 *   🔁 Loop EN    — EN-эталон в цикле
 *   ▶ Current     — текущий RU-тейк
 *   🔁 Loop RU    — RU-тейк в цикле
 */
import { ref, watch, nextTick, computed } from "vue";

const props = defineProps({
  visible: { type: Boolean, required: true },
  text: { type: String, default: "" },
  title: { type: String, default: "Edit text" },
  originalUrl: { type: String, default: "" },
  currentUrl: { type: String, default: "" },
});

const emit = defineEmits(["update:visible", "save"]);

const localText = ref(props.text);
const textareaRef = ref(null);

// ── вставка по курсору ────────────────────────────────────────────────
let savedSelStart = 0;
let savedSelEnd = 0;

watch(() => props.visible, async (v) => {
  if (v) {
    localText.value = props.text;
    savedSelStart = props.text.length;
    savedSelEnd = props.text.length;
    await nextTick();
    focusTextarea();
  } else {
    stopAudio();
  }
});

function focusTextarea() {
  const el = textareaRef.value?.$el ?? textareaRef.value;
  if (el && typeof el.focus === "function") el.focus();
}

function rememberSelection() {
  const el = textareaRef.value?.$el ?? textareaRef.value;
  if (!el || typeof el.selectionStart !== "number") return;
  savedSelStart = el.selectionStart;
  savedSelEnd = el.selectionEnd;
}

function applyEdit(newText, cursorStart, cursorEnd) {
  localText.value = newText;
  savedSelStart = cursorStart;
  savedSelEnd = cursorEnd;
  nextTick(() => {
    const el = textareaRef.value?.$el ?? textareaRef.value;
    if (!el) return;
    el.focus();
    el.setSelectionRange(cursorStart, cursorEnd);
  });
}

function insertSingle(tag) {
  const text = localText.value;
  const start = savedSelStart;
  const end = savedSelEnd;
  const tagStr = `<${tag}>`;
  const before = text.slice(0, start);
  const prefix = before.length && !/\s$/.test(before) ? " " : "";
  const insert = `${prefix}${tagStr}`;
  const newText = text.slice(0, start) + insert + text.slice(end);
  const newCursor = start + insert.length;
  applyEdit(newText, newCursor, newCursor);
}

function insertWrapper(tag) {
  const text = localText.value;
  const start = savedSelStart;
  const end = savedSelEnd;
  const open = `<${tag}>`;
  const close = `</${tag}>`;

  if (end > start) {
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + open + selected + close + text.slice(end);
    const newCursor = start + open.length + selected.length + close.length;
    applyEdit(newText, newCursor, newCursor);
    return;
  }

  const before = text.slice(0, start);
  const prefix = before.length && !/\s$/.test(before) ? " " : "";
  const insert = `${prefix}${open}${close}`;
  const newText = text.slice(0, start) + insert + text.slice(end);
  const cursorBetween = start + prefix.length + open.length;
  applyEdit(newText, cursorBetween, cursorBetween);
}

// ── прослушивание ─────────────────────────────────────────────────────
// playingMode: null | 'original' | 'original-loop' | 'current' | 'loop'
const playingMode = ref(null);
let audioEl = null;

const canPlayOriginal = computed(() => Boolean(props.originalUrl));
const canPlayCurrent = computed(() => Boolean(props.currentUrl));

function stopAudio() {
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  playingMode.value = null;
}

function playUrl(url, mode, loop) {
  stopAudio();
  if (!url) return;
  const el = new Audio(url);
  el.loop = loop;

  audioEl = el;
  playingMode.value = mode;

  el.addEventListener("ended", () => {
    if (playingMode.value === mode) stopAudio();
  });
  el.addEventListener("error", (e) => {
    console.error("[TagEditor] audio error", { url, error: e });
    if (playingMode.value === mode) stopAudio();
  });
  el.play().catch((e) => {
    console.error("[TagEditor] play rejected", { url, error: e });
    if (playingMode.value === mode) stopAudio();
  });
}

function toggleOriginal() {
  if (playingMode.value === "original") stopAudio();
  else playUrl(props.originalUrl, "original", false);
}

function toggleOriginalLoop() {
  if (playingMode.value === "original-loop") stopAudio();
  else playUrl(props.originalUrl, "original-loop", true);
}

function toggleCurrent() {
  if (playingMode.value === "current") stopAudio();
  else playUrl(props.currentUrl, "current", false);
}

function toggleLoop() {
  if (playingMode.value === "loop") stopAudio();
  else playUrl(props.currentUrl, "loop", true);
}

// ── кнопки диалога ────────────────────────────────────────────────────
function onSave() {
  stopAudio();
  emit("save", localText.value);
  emit("update:visible", false);
}

function onCancel() {
  stopAudio();
  emit("update:visible", false);
}

function onTextareaInput() { rememberSelection(); }
function onTextareaKeyup() { rememberSelection(); }
function onTextareaClick() { rememberSelection(); }
</script>

<template>
  <Dialog
      :visible="visible"
      modal
      :style="{ width: '720px' }"
      @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="tte-header row space-between">
        <span class="title">{{ title }}</span>
        <ButtonGroup>
          <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="onCancel"
          />
          <Button
              label="Save"
              icon="pi pi-check"
              @click="onSave"
          />
        </ButtonGroup>
      </div>
    </template>

    <div class="tte-body list">
      <!-- Прослушивание -->
      <div class="tte-play-row row">
        <span class="tte-play-label muted">EN</span>
        <ButtonGroup>
          <Button
              :severity="playingMode === 'original' ? 'primary' : 'secondary'"
              :disabled="!canPlayOriginal"
              :icon="playingMode === 'original' ? 'pi pi-pause' : 'pi pi-volume-up'"
              label="Original"
              :title="canPlayOriginal ? 'Play EN reference take' : 'No EN audio for this row'"
              @click="toggleOriginal"
          />
          <Button
              :severity="playingMode === 'original-loop' ? 'primary' : 'secondary'"
              :disabled="!canPlayOriginal"
              :icon="playingMode === 'original-loop' ? 'pi pi-pause' : 'pi pi-replay'"
              label="Loop"
              :title="canPlayOriginal ? 'Play EN reference take in a loop' : 'No EN audio for this row'"
              @click="toggleOriginalLoop"
          />
        </ButtonGroup>

        <span class="divider" />

        <span class="tte-play-label muted">RU</span>
        <ButtonGroup>
          <Button
              :severity="playingMode === 'current' ? 'primary' : 'secondary'"
              :disabled="!canPlayCurrent"
              :icon="playingMode === 'current' ? 'pi pi-pause' : 'pi pi-play'"
              label="Current"
              :title="canPlayCurrent ? 'Play current RU take' : 'No RU audio for this row yet'"
              @click="toggleCurrent"
          />
          <Button
              :severity="playingMode === 'loop' ? 'primary' : 'secondary'"
              :disabled="!canPlayCurrent"
              :icon="playingMode === 'loop' ? 'pi pi-pause' : 'pi pi-replay'"
              label="Loop"
              :title="canPlayCurrent ? 'Play current RU take in a loop' : 'No RU audio for this row yet'"
              @click="toggleLoop"
          />
        </ButtonGroup>
      </div>

      <!-- Одиночные тэги -->
      <div class="tte-section list">
        <div class="tte-section-title muted">Insert tag</div>
        <div class="tte-tag-grid actions">
          <Button
              v-for="t in [
                { tag: 'breath', label: 'Breath' },
                { tag: 'quick_breath', label: 'Quick breath' },
                { tag: 'laughter', label: 'Laughter' },
                { tag: 'cough', label: 'Cough' },
                { tag: 'sigh', label: 'Sigh' },
                { tag: 'gasp', label: 'Gasp' },
                { tag: 'noise', label: 'Noise' },
                { tag: 'hissing', label: 'Hissing' },
                { tag: 'vocalized-noise', label: 'Vocalized' },
                { tag: 'lipsmack', label: 'Lipsmack' },
                { tag: 'mn', label: 'Mn' },
                { tag: 'clucking', label: 'Clucking' },
                { tag: 'accent', label: 'Accent' },
              ]"
              :key="t.tag"
              :label="t.label"
              severity="secondary"
              @mousedown.prevent="insertSingle(t.tag)"
          />
        </div>
      </div>

      <!-- Wrapper-тэги -->
      <div class="tte-section list">
        <div class="tte-section-title muted">Wrapper tags</div>
        <div class="tte-tag-grid actions">
          <Button
              v-for="t in [
                { tag: 'laughing', label: 'Laughing' },
                { tag: 'strong', label: 'Strong' },
              ]"
              :key="t.tag"
              :label="t.label"
              severity="secondary"
              @mousedown.prevent="insertWrapper(t.tag)"
          />
        </div>
      </div>

      <!-- Текст -->
      <div class="tte-section list">
        <div class="tte-section-title muted">Text</div>
        <Textarea
            ref="textareaRef"
            v-model="localText"
            auto-resize
            rows="6"
            class="tte-textarea w100p"
            @input="onTextareaInput"
            @keyup="onTextareaKeyup"
            @click="onTextareaClick"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.tte-header {
  width: 100%;
  gap: 12px;
}
.tte-body {
  gap: 18px;
}
.tte-play-row {
  padding: 8px 10px;
  background: var(--surface-100, rgba(127, 127, 127, 0.08));
  border-radius: 6px;
}
.tte-play-label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  min-width: 24px;
}
.tte-section-title {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tte-textarea {
  font-family: inherit;
}
</style>
