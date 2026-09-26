<!--
  Reads markdown guide files written by delegated agents (see
  dev-ui's docs section) and renders them, with a tab per component and a
  secondary tab per version when more than one exists for that component.

  Discovery is filename-convention based, via Vite's import.meta.glob:
    docs/component-guides/<ComponentName>.md            -- single/default version
    docs/component-guides/<ComponentName>.<version>.md   -- a named version
  e.g. "RolesEditorApp.md" (default) and "RolesEditorApp.gemini.md" (a
  version tagged "gemini") both group under the "RolesEditorApp" component tab.
-->
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { marked } from "marked";

const props = defineProps({
    component: {
        type: String,
        required: true,
    },
});

const fullscreen = ref(false);

function toggleFullscreen() {
    fullscreen.value = !fullscreen.value;
}

function onKeyDown(e) {
    if (e.key === "Escape" && fullscreen.value) {
        fullscreen.value = false;
    }
}

onMounted(() => window.addEventListener("keydown", onKeyDown));
onUnmounted(() => window.removeEventListener("keydown", onKeyDown));

const rawGuides = import.meta.glob("../../docs/component-guides/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
});

// Group by component name, splitting "<Component>.md" / "<Component>.<version>.md".
const versions = computed(() => {
    const list = [];
    for (const [path, content] of Object.entries(rawGuides)) {
        const filename = path.split("/").pop().replace(/\.md$/, "");
        const dotIndex = filename.indexOf(".");
        const componentName = dotIndex === -1 ? filename : filename.slice(0, dotIndex);
        if (componentName === props.component) {
            const version = dotIndex === -1 ? "Основная" : filename.slice(dotIndex + 1);
            list.push({ version, content });
        }
    }
    return list.sort((a, b) => a.version.localeCompare(b.version));
});

const activeVersion = ref("");

function activeVersionFor() {
    const list = versions.value;
    if (activeVersion.value && list.some((v) => v.version === activeVersion.value)) return activeVersion.value;
    return list[0]?.version ?? "";
}

function selectVersion(version) {
    activeVersion.value = version;
}

const activeHtml = computed(() => {
    const list = versions.value;
    const version = activeVersionFor();
    const entry = list.find((v) => v.version === version);
    return entry ? marked.parse(entry.content) : "";
});
</script>

<template>
    <div class="md-reader" :class="{ 'fullscreen': fullscreen }">
        <button class="md-reader-fs-toggle" @click="toggleFullscreen">
            {{ fullscreen ? '⛶' : '⛶' }}
        </button>
        <div v-if="versions.length === 0" class="md-reader-empty">
            Гайды по компонентам не найдены для {{ props.component }} (docs/component-guides/{{ props.component }}*.md).
        </div>
        <template v-else>
            <div
                v-if="versions.length > 1"
                class="md-reader-version-tabs"
            >
                <button
                    v-for="v in versions"
                    :key="v.version"
                    class="md-reader-version-tab"
                    :class="{ active: v.version === activeVersionFor() }"
                    @click="selectVersion(v.version)"
                >
                    {{ v.version }}
                </button>
            </div>

            <div class="md-reader-content" v-html="activeHtml"></div>
        </template>
    </div>
</template>

<style scoped>
.md-reader {
    background: #1a1a1e;
    border-top: 1px solid #333;
    padding: 12px 16px 20px;
    position: relative;
}
.md-reader.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    padding: 40px;
    overflow-y: auto;
}
.md-reader-fs-toggle {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #26262b;
    color: #aaa;
    border: 1px solid #3a3a40;
    border-radius: 4px;
    cursor: pointer;
    padding: 2px 6px;
}
.md-reader.fullscreen .md-reader-fs-toggle {
    top: 16px;
    right: 16px;
}
.md-reader-empty {
    color: #777;
    font-size: 13px;
}
.md-reader-version-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
}
.md-reader-version-tab {
    background: #26262b;
    color: #aaa;
    border: 1px solid #3a3a40;
    border-radius: 4px;
    padding: 3px 9px;
    font-size: 11px;
    cursor: pointer;
}
.md-reader-version-tab.active {
    background: #2f3a52;
    color: #cdd8ff;
    border-color: #5a8cff;
}
.md-reader-content {
    color: #ccc;
    font-size: 13px;
    line-height: 1.55;
    max-height: 360px;
    overflow-y: auto;
}
.md-reader.fullscreen .md-reader-content {
    max-height: none;
}
.md-reader-content :deep(h1),
.md-reader-content :deep(h2),
.md-reader-content :deep(h3) {
    color: #eee;
    margin: 14px 0 6px;
}
.md-reader-content :deep(h1:first-child),
.md-reader-content :deep(h2:first-child),
.md-reader-content :deep(h3:first-child) {
    margin-top: 0;
}
.md-reader-content :deep(code) {
    background: #26262b;
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 12px;
}
.md-reader-content :deep(pre) {
    background: #26262b;
    border-radius: 6px;
    padding: 10px;
    overflow-x: auto;
}
.md-reader-content :deep(a) {
    color: #5a8cff;
}
</style>
