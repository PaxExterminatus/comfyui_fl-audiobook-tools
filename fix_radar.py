import re

with open('src/shared/TranslationSimilarityRadar.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ref to script
content = content.replace("import { computed } from 'vue';", "import { computed, ref } from 'vue';")
content = content.replace("const props = defineProps({", "const hoveredIndex = ref(null);\n\nconst AXIS_ABBR = {\n  syllableRatio: \"Слоги\",\n  acousticTexture: \"Фонетика\",\n  edgeParity: \"Маркеры\",\n  lexicalDiversity: \"TTR\",\n  pauseDensity: \"Паузы\",\n};\n\nconst props = defineProps({")

# 2. Add overallScore computed
content = content.replace("const numAxes = computed(() => scores.value.length || 5);", """const overallScore = computed(() => {
    const sum = scores.value.reduce((acc, item) => acc + item.score, 0);
    return Math.round(sum / scores.value.length);
});

const numAxes = computed(() => scores.value.length || 5);""")

# 3. Modify dataPolygonPoints to include key
content = content.replace("pts.push({ x, y, score, label: item.label });", "pts.push({ x, y, score, label: item.label, key: item.key });")

# 4. Modify Template SVG
template_replacement = """                <!-- Filled data polygon -->
                <polygon
                    v-if="dataPolygonPoints.length > 0"
                    :points="dataPolygonString"
                    class="radar-data-polygon"
                />

                <!-- Overall score center -->
                <circle :cx="center" :cy="center" r="30" fill="#1e1e22" />
                <text :x="center" :y="center - 4" text-anchor="middle" class="radar-center-text-main">{{ overallScore }}%</text>
                <text :x="center" :y="center + 12" text-anchor="middle" class="radar-center-text-sub">сходство</text>

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
                    :x="center + ((radius * pt.score / 100) + 14) * Math.cos((i * 2 * Math.PI) / numAxes - Math.PI / 2)"
                    :y="center + ((radius * pt.score / 100) + 14) * Math.sin((i * 2 * Math.PI) / numAxes - Math.PI / 2)"
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
                </text>"""

# Using a simpler regex to catch the whole block for replacement
content = re.sub(r'<!-- Filled data polygon -->\n.*?<!-- Axis labels -->\n.*?</text>', template_replacement, content, flags=re.DOTALL)

# 5. Modify Template List
content = content.replace('<div v-for="item in scores" :key="item.key" class="radar-metric-item">', '<div v-for="(item, i) in scores" :key="item.key" class="radar-metric-item" :class="{ \'radar-metric-item-active\': i === hoveredIndex }">')

# 6. Add CSS
new_css = """.radar-data-node {
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
}"""

# Remove old CSS and add new
content = re.sub(r'\.radar-data-node \{.*?\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'\.radar-axis-label \{.*?\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'\.radar-metric-item \{.*?\}\n', '', content, flags=re.DOTALL)
content = content.replace('.radar-chart-container {', f'{new_css}\n\n.radar-chart-container {{')

with open('src/shared/TranslationSimilarityRadar.vue', 'w', encoding='utf-8') as f:
    f.write(content)
