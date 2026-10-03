<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { computeTranslationScores } from './translation_metrics.js';
import TranslationSimilarityRadar from './TranslationSimilarityRadar.vue';

const props = defineProps({
  original: { type: String, default: "" },
  translation: { type: String, default: "" },
});

const overallScore = computed(() => {
  try {
    const scores = computeTranslationScores(props.original, props.translation);
    if (!Array.isArray(scores) || scores.length === 0) return 0;
    const sum = scores.reduce((acc, item) => acc + (item.score || 0), 0);
    return Math.round(sum / scores.length);
  } catch (e) {
    return 0;
  }
});

// ── popover: teleport в body + fixed-позиция от кружка ─────────────────
const circleRef = ref(null);
const popoverPos = ref({ top: 0, left: 0, placement: "below" });
const visible = ref(false);
let hideTimer = null;

const POPOVER_WIDTH = 400;   // макс. ширина radar (см. его CSS max-width 380 + запас)
const POPOVER_MARGIN = 8;    // отступ от кружка

function computePosition() {
  const el = circleRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Размеры popover — оцениваем по radar. Стили radar фиксированы (~400x520),
  // но точные значения не критичны: главное — уместить в viewport.
  const estimatedWidth = POPOVER_WIDTH;
  const estimatedHeight = 540;

  // По умолчанию — снизу от кружка.
  let placement = "below";
  let top = rect.bottom + POPOVER_MARGIN;
  // Если снизу не помещается — показать сверху.
  if (top + estimatedHeight > vh && rect.top - estimatedHeight - POPOVER_MARGIN > 0) {
    placement = "above";
    top = rect.top - estimatedHeight - POPOVER_MARGIN;
  }

  // Горизонталь: центрируем относительно кружка, потом поджимаем к краям окна.
  let left = rect.left + rect.width / 2 - estimatedWidth / 2;
  if (left + estimatedWidth > vw - 8) left = vw - estimatedWidth - 8;
  if (left < 8) left = 8;

  popoverPos.value = { top, left, placement };
}

function show() {
  clearTimeout(hideTimer);
  computePosition();
  visible.value = true;
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { visible.value = false; }, 120);
}

function cancelHide() {
  clearTimeout(hideTimer);
}

function onWindowChange() {
  if (visible.value) computePosition();
}

window.addEventListener("scroll", onWindowChange, true);
window.addEventListener("resize", onWindowChange);

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onWindowChange, true);
  window.removeEventListener("resize", onWindowChange);
  clearTimeout(hideTimer);
});
</script>

<template>
  <div
      ref="circleRef"
      class="similarity-compact-wrapper"
      @mouseenter="show"
      @mouseleave="scheduleHide"
  >
    <div class="compact-circle">
      {{ overallScore }}%
    </div>
  </div>

  <Teleport to="body">
    <div
        v-if="visible"
        class="similarity-popover"
        :style="{ top: popoverPos.top + 'px', left: popoverPos.left + 'px' }"
        @mouseenter="cancelHide"
        @mouseleave="scheduleHide"
    >
      <TranslationSimilarityRadar
          :original="original"
          :translation="translation"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.similarity-compact-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.compact-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #1e1e22;
  border: 2px solid rgb(90, 140, 255);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  transition: transform 0.15s;
}

.similarity-compact-wrapper:hover .compact-circle {
  transform: scale(1.05);
}
</style>

<style>
/* Popover живёт вне scoped (Teleport), стилизуем через глобальный селектор. */
.similarity-popover {
  position: fixed;
  z-index: 9999;
  pointer-events: auto;
}
</style>
