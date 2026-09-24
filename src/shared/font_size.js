import { ref, watch } from "vue";

/**
 * @param {Object} opts
 * @param {string} opts.storageKey - localStorage key this dialog's font size choice persists under.
 * @param {number} [opts.defaultSize=13] - px size used the first time (nothing saved yet).
 * @param {number} [opts.min=9] - smallest size the buttons allow.
 * @param {number} [opts.max=22] - largest size the buttons allow.
 */
export function useFontSize({ storageKey, defaultSize = 13, min = 9, max = 22 }) {
    function load() {
        try {
            const v = parseFloat(localStorage.getItem(storageKey));
            return Number.isFinite(v) ? v : defaultSize;
        } catch (e) {
            return defaultSize;
        }
    }
    function save(value) {
        try { localStorage.setItem(storageKey, String(value)); } catch (e) { /* localStorage unavailable -- persistence just won't work this session */ }
    }

    const fontSizePx = ref(load());
    watch(fontSizePx, save);

    function decrease() { fontSizePx.value = Math.max(min, fontSizePx.value - 1); }
    function increase() { fontSizePx.value = Math.min(max, fontSizePx.value + 1); }

    return { fontSizePx, decrease, increase };
}
