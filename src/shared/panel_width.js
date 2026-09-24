import { ref, computed } from "vue";

/*
 Shared "resizable dialog width" control -- Line Editor had this
 (WIDTH_PRESETS buttons + 100% + localStorage persistence) and Roles
 Editor didn't; factored out here so both (and any future editor) share
 one implementation instead of copy-pasting it.

 @param {Object} opts
 @param {string} opts.storageKey - localStorage key this editor's width choice persists under.
 @param {number} opts.defaultWidth - px width used the first time (nothing saved yet).
 @param {number[]} opts.presets - px width buttons to offer, in the order shown.
 @param {number} [opts.fullVw=94] - viewport-width % the "100%" button maps to. Line
   Editor/Roles Editor genuinely want to fill nearly the whole window; a simple file
   picker (Browse Dialog) doesn't need that much, so it passes a smaller value.
*/
export function usePanelWidth({ storageKey, defaultWidth, presets, fullVw = 94 }) {
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
    /*
     "full" is a sentinel (not a px number) for "use (most of) the window" --
     fullVw still leaves a sliver of the ComfyUI canvas visible around the
     dialog's edge, and numeric presets stay capped to 94vw regardless.
    */
    function toCss(value) {
        return value === "full" ? `${fullVw}vw` : `min(94vw, ${value}px)`;
    }

    const widthPref = ref(load());
    const cssWidth = computed(() => toCss(widthPref.value));

    function setWidth(value) {
        widthPref.value = value;
        save(value);
    }

    return { cssWidth, setWidth, presets };
}
