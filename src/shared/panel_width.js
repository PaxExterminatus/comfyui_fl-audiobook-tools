import { ref, computed } from "vue";

// Shared "resizable dialog width" control -- Line Editor had this
// (WIDTH_PRESETS buttons + 100% + localStorage persistence) and Roles
// Editor didn't; factored out here so both (and any future editor) share
// one implementation instead of copy-pasting it.
//
// @param {Object} opts
// @param {string} opts.storageKey - localStorage key this editor's width choice persists under.
// @param {number} opts.defaultWidth - px width used the first time (nothing saved yet).
// @param {number[]} opts.presets - px width buttons to offer, in the order shown.
export function usePanelWidth({ storageKey, defaultWidth, presets }) {
    function load() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw === "full") return "full";
            const v = parseFloat(raw);
            return Number.isFinite(v) ? v : defaultWidth;
        } catch (e) {
            return defaultWidth;
        }
    }
    function save(value) {
        try { localStorage.setItem(storageKey, String(value)); } catch (e) { /* localStorage unavailable -- persistence just won't work this session */ }
    }
    // "full" is a sentinel (not a px number) for "use the whole window" --
    // capped to 94vw either way so there's always a sliver of the ComfyUI
    // canvas visible around the dialog's edge.
    function toCss(value) {
        return value === "full" ? "94vw" : `min(94vw, ${value}px)`;
    }

    const widthPref = ref(load());
    const cssWidth = computed(() => toCss(widthPref.value));

    function setWidth(value) {
        widthPref.value = value;
        save(value);
    }

    return { cssWidth, setWidth, presets };
}
