<script setup>
import { computed } from 'vue';
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
</script>

<template>
  <div class="similarity-compact-wrapper">
    <div class="compact-circle">
      {{ overallScore }}%
    </div>
    <div class="popover-container">
      <TranslationSimilarityRadar 
        :original="original" 
        :translation="translation" 
      />
    </div>
  </div>
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

.popover-container {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(8px) scale(0.95);
  opacity: 0;
  visibility: hidden;
  z-index: 50;
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
}

.similarity-compact-wrapper:hover .popover-container {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0) scale(1);
}
</style>
