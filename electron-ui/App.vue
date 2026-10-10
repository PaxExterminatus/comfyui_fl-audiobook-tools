<script setup>
/*
 The application shell. Until this slice it was hand-written markup in
 index.html driven by getElementById from main.js; the mode lived in a module
 variable and nothing appeared in the URL. Now the route is the mode, so Back
 works and a screen can be linked to.

 The help dialog stays an ephemeral createApp on purpose: it is a modal that
 overlays whatever is on screen, and a route for it would mean a direct link
 had to rebuild the page underneath it.
*/
import { computed, watch } from "vue";
import { createApp } from "vue";
import { useRouter, useRoute } from "vue-router";
import PrimeVue from "primevue/config";
import HelpDialog from "../src/shared/HelpDialog.vue";
import { pinia } from "../src/shared/pinia.js";
import { registerPrimeVueComponents } from "../src/shared/primevue_components.js";
import { ensureStylesLinked } from "../src/shared/styles_link.js";
import { rootStore } from "./root_store_instance.js";
import "./style/App.css";

const router = useRouter();
const route = useRoute();

const MODES = {
    voicing: {
        label: "Озвучка",
        help: "ScriptLibraryPanel",
    },
    dubbing: {
        label: "Дубляж",
        help: "VoDubBrowserPanel",
    },
};

const currentMode = computed(() => (route.name === "dubbing" ? "dubbing" : "voicing"));

/*
 The store keeps its own notion of mode because each mode has its own
 recent-folder list (not yet surfaced in this shell -- see root_store.js's
 getRecent/rememberCurrent). The route is the source of truth, so push the
 change down rather than letting the two drift. Each panel (Script
 Library, VO Dub Browser) owns and persists its OWN project root itself
 (its own localStorage key, recalled on mount) -- this shell no longer
 tracks or displays a root of its own, see [[project-electron-ui-root-field]].
*/
watch(currentMode, (mode) => rootStore.setCurrentMode(mode), { immediate: true });

function openHelp() {
    ensureStylesLinked(import.meta.url);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const app = createApp(HelpDialog, {
        visible: true,
        component: MODES[currentMode.value].help,
        "onUpdate:visible": (visible) => {
            if (!visible) {
                app.unmount();
                container.remove();
            }
        },
    });
    app.use(pinia);
    app.use(PrimeVue, { ripple: true });
    registerPrimeVueComponents(app);
    app.mount(container);
}
</script>

<template>
  <div id="app-shell">
    <div id="app-header">
      <span id="app-title">FL Audiobook Tools</span>

      <div id="mode-switcher">
        <button
            v-for="(mode, name) in MODES"
            :key="name"
            type="button"
            :class="{ active: currentMode === name }"
            @click="router.push({ name })"
        >
          {{ mode.label }}
        </button>
      </div>

      <button id="help-btn" type="button" title="Справка по текущему режиму" @click="openHelp">?</button>
    </div>

    <div id="main-content">
      <RouterView/>
    </div>
  </div>
</template>
