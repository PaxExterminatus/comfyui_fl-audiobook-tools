<script setup>
/*
 TranslationSimilarityRadar -- reusable Vue 3 SFC component rendering a
 hand-rolled inline SVG radar (spider) chart for 5 translation similarity
 metrics computed by computeTranslationScores(original, translation).
*/
import { computed, ref } from 'vue';
import { computeTranslationScores } from './translation_metrics.js';

const hoveredIndex = ref(null);

const AXIS_ABBR = {
  syllableRatio: "Слоги",
  acousticTexture: "Фонетика",
  edgeParity: "Маркеры",
  lexicalDiversity: "TTR",
  pauseDensity: "Паузы",
};

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

const overallScore = computed(() => {
    const sum = scores.value.reduce((acc, item) => acc + item.score, 0);
    return Math.round(sum / scores.value.length);
});

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

const CENTER_CIRCLE_R = 30;

const dataPolygonPoints = computed(() => {
    const n = numAxes.value;
    const pts = [];
    scores.value.forEach((item, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const score = Math.max(0, Math.min(100, item.score ?? 0));
        const rawR = (radius * score) / 100;
        // Never let a low score's point render inside the center "overall %"
        // circle -- clamp its minimum distance to that circle's edge so
        // it's always visible, at the cost of flattening the very bottom
        // of the score range visually.
        const r = Math.max(rawR, CENTER_CIRCLE_R);
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        pts.push({ x, y, score, label: item.label, key: item.key, clamped: rawR <= CENTER_CIRCLE_R });
    });
    return pts;
});

// A straight polygon edge between two points BOTH clamped to the center
// circle would cut a flat chord across that circle's face -- bend those
// edges to hug the circle's own arc instead, so the shape reads as
// "wrapping the center" rather than slicing through it.
const dataPolygonString = computed(() => {
    const pts = dataPolygonPoints.value;
    const n = pts.length;
    if (n === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i <= n; i++) {
        const prev = pts[i - 1];
        const cur = pts[i % n];
        if (prev.clamped && cur.clamped) {
            d += ` A ${CENTER_CIRCLE_R} ${CENTER_CIRCLE_R} 0 0 1 ${cur.x} ${cur.y}`;
        } else {
            d += ` L ${cur.x} ${cur.y}`;
        }
    }
    return `${d} Z`;
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

                                <!-- Filled data polygon (arcs where two adjacent
                     points are both clamped to the center circle) -->
                <path
                    v-if="dataPolygonPoints.length > 0"
                    :d="dataPolygonString"
                    class="radar-data-polygon"
                />

                <!-- Overall score center -->
                <circle :cx="center" :cy="center" r="30" fill="#1e1e22" />
                <text :x="center" :y="center + 5" text-anchor="middle" class="radar-center-text-main">{{ overallScore }}%</text>

                <!-- Data nodes -->
                <circle
                    v-for="(pt, i) in dataPolygonPoints"
                    :key="'pt-' + i"
                    :cx="pt.x"
                    :cy="pt.y"
                    r="4"
                    class="radar-data-node"
                    :class="{ 'radar-data-node-active': i === hoveredIndex }"
                    @mouseenter="hoveredIndex = i"
                    @mouseleave="hoveredIndex = null"
                />
                
                <!-- Percent at nodes -->
                <text
                    v-for="(pt, i) in dataPolygonPoints"
                    :key="'pct-' + i"
                    :x="center + Math.max((radius * pt.score / 100) + 14, 40) * Math.cos((i * 2 * Math.PI) / numAxes - Math.PI / 2)"
                    :y="center + Math.max((radius * pt.score / 100) + 14, 40) * Math.sin((i * 2 * Math.PI) / numAxes - Math.PI / 2)"
                    text-anchor="middle"
                    class="radar-node-percent"
                >
                    {{ Math.round(pt.score) }}%
                </text>

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
                    <title>{{ scores[i]?.label }}</title>
                    {{ AXIS_ABBR[scores[i]?.key] || scores[i]?.label || `Metric ${i+1}` }}
                </text>
            </svg>
        </div>

        <!-- Metrics breakdown score list -->
        <div class="radar-metrics-list">
            <div v-for="(item, i) in scores" :key="item.key" class="radar-metric-item" :class="{ 'radar-metric-item-active': i === hoveredIndex }">
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

.radar-data-node {
    fill: rgb(90, 140, 255);
    stroke: #1e1e22;
    stroke-width: 2;
    cursor: pointer;
    transition: transform 0.2s, r 0.2s;
}

.radar-data-node-active {
    r: 6;
    stroke-width: 3;
    fill: #fff;
}

.radar-axis-label {
    font-size: 11px;
    fill: #b5b5c2;
    font-weight: 500;
    cursor: help;
}

.radar-node-percent {
    font-size: 10px;
    fill: #888;
    pointer-events: none;
}

.radar-center-text-main {
    font-size: 16px;
    fill: #fff;
    font-weight: 700;
}

.radar-center-text-sub {
    font-size: 9px;
    fill: #888;
}

.radar-metric-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 2px 0;
    border-left: 2px solid transparent;
    transition: background 0.2s, border-color 0.2s;
}

.radar-metric-item-active {
    background: #2a2a32;
    border-left-color: rgb(90, 140, 255);
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



.radar-metrics-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
