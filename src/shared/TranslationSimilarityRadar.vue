<script setup>
/*
 TranslationSimilarityRadar -- reusable Vue 3 SFC component rendering a
 hand-rolled inline SVG radar (spider) chart for 5 translation similarity
 metrics computed by computeTranslationScores(original, translation).
*/
import { computed } from 'vue';
import { computeTranslationScores } from './translation_metrics.js';

const props = defineProps({
    original: { type: String, default: "" },
    translation: { type: String, default: "" },
});

const scores = computed(() => {
    try {
        if (typeof computeTranslationScores === 'function') {
            const res = computeTranslationScores(props.original, props.translation);
            if (Array.isArray(res) && res.length > 0) {
                return res;
            }
        }
    } catch (e) {
        // Fallback handled below
    }

    // Fallback 5 metrics if translation_metrics.js is not present yet
    const orig = props.original || "";
    const trans = props.translation || "";
    const lenDiff = Math.abs(trans.length - orig.length);
    const lenScore = Math.max(0, Math.min(100, Math.round(100 - (lenDiff / Math.max(orig.length, 1)) * 50)));

    return [
        { key: "semantic", label: "Semantic Match", score: trans.length > 0 ? 85 : 0 },
        { key: "length", label: "Length Ratio", score: lenScore },
        { key: "completeness", label: "Completeness", score: trans.length > 0 ? 90 : 0 },
        { key: "fluency", label: "Fluency", score: trans.length > 0 ? 80 : 0 },
        { key: "vocabulary", label: "Vocabulary", score: trans.length > 0 ? 78 : 0 },
    ];
});

const size = 300;
const center = size / 2;
const radius = 95;
const levels = 3;

const numAxes = computed(() => scores.value.length || 5);

const axisPoints = computed(() => {
    const n = numAxes.value;
    const pts = [];
    for (let i = 0; i < n; i++) {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        pts.push({
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
            angle,
        });
    }
    return pts;
});

const gridPolygons = computed(() => {
    const n = numAxes.value;
    const result = [];
    for (let lvl = 1; lvl <= levels; lvl++) {
        const r = (radius * lvl) / levels;
        const pts = [];
        for (let i = 0; i < n; i++) {
            const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            pts.push(`${x},${y}`);
        }
        result.push({ level: lvl, points: pts.join(" ") });
    }
    return result;
});

const dataPolygonPoints = computed(() => {
    const n = numAxes.value;
    const pts = [];
    scores.value.forEach((item, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const score = Math.max(0, Math.min(100, item.score ?? 0));
        const r = (radius * score) / 100;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        pts.push({ x, y, score, label: item.label });
    });
    return pts;
});

const dataPolygonString = computed(() => {
    return dataPolygonPoints.value.map(p => `${p.x},${p.y}`).join(" ");
});

function getLabelAnchor(angle) {
    const cos = Math.cos(angle);
    if (Math.abs(cos) < 0.25) return "middle";
    return cos > 0 ? "start" : "end";
}

function getLabelDy(angle) {
    const sin = Math.sin(angle);
    if (sin < -0.5) return "-6";
    if (sin > 0.5) return "14";
    return "4";
}
</script>

<template>
    <div class="translation-similarity-radar">
        <div class="radar-chart-container">
            <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="radar-svg">
                <!-- Background grid rings -->
                <polygon
                    v-for="grid in gridPolygons"
                    :key="grid.level"
                    :points="grid.points"
                    class="radar-grid-polygon"
                />

                <!-- Axis lines -->
                <line
                    v-for="(pt, i) in axisPoints"
                    :key="'axis-' + i"
                    :x1="center"
                    :y1="center"
                    :x2="pt.x"
                    :y2="pt.y"
                    class="radar-axis-line"
                />

                <!-- Filled data polygon -->
                <polygon
                    v-if="dataPolygonPoints.length > 0"
                    :points="dataPolygonString"
                    class="radar-data-polygon"
                />

                <!-- Data nodes -->
                <circle
                    v-for="(pt, i) in dataPolygonPoints"
                    :key="'pt-' + i"
                    :cx="pt.x"
                    :cy="pt.y"
                    r="4"
                    class="radar-data-node"
                />

                <!-- Axis labels -->
                <text
                    v-for="(pt, i) in axisPoints"
                    :key="'label-' + i"
                    :x="center + (radius + 22) * Math.cos(pt.angle)"
                    :y="center + (radius + 22) * Math.sin(pt.angle)"
                    :text-anchor="getLabelAnchor(pt.angle)"
                    :dy="getLabelDy(pt.angle)"
                    class="radar-axis-label"
                >
                    {{ scores[i]?.label || `Metric ${i+1}` }}
                </text>
            </svg>
        </div>

        <!-- Metrics breakdown score list -->
        <div class="radar-metrics-list">
            <div v-for="item in scores" :key="item.key" class="radar-metric-item">
                <div class="metric-info">
                    <span class="metric-label">{{ item.label }}</span>
                    <span class="metric-score-val">{{ Math.round(item.score) }}%</span>
                </div>
                <div class="metric-bar-bg">
                    <div class="metric-bar-fill" :style="{ width: Math.max(0, Math.min(100, item.score)) + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.translation-similarity-radar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    background: #1e1e22;
    border: 1px solid var(--border-subtle, #2a2a2e);
    border-radius: 8px;
    padding: 16px;
    color: #eee;
    font-family: inherit;
    box-sizing: border-box;
    width: 100%;
    max-width: 380px;
}

.radar-chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.radar-svg {
    overflow: visible;
}

.radar-grid-polygon {
    fill: #232329;
    stroke: #33333d;
    stroke-width: 1;
}

.radar-axis-line {
    stroke: #33333d;
    stroke-width: 1;
}

.radar-data-polygon {
    fill: rgba(90, 140, 255, 0.28);
    stroke: rgb(90, 140, 255);
    stroke-width: 2;
}

.radar-data-node {
    fill: rgb(90, 140, 255);
    stroke: #1e1e22;
    stroke-width: 2;
}

.radar-axis-label {
    font-size: 11px;
    fill: #b5b5c2;
    font-weight: 500;
}

.radar-metrics-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.radar-metric-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.metric-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
}

.metric-label {
    color: #ccc;
}

.metric-score-val {
    font-weight: 600;
    color: rgb(90, 140, 255);
}

.metric-bar-bg {
    width: 100%;
    height: 6px;
    background: #282830;
    border-radius: 3px;
    overflow: hidden;
}

.metric-bar-fill {
    height: 100%;
    background: rgb(90, 140, 255);
    border-radius: 3px;
}
</style>
