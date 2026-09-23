import { nextTick } from "vue";

// Shared "this textarea grows to fit its content, and can be re-measured
// on demand" tracker -- PrimeVue's own Textarea `auto-resize` only reacts
// to its OWN native 'input' event, which never fires for two cases every
// per-line editor needs: a paste handler that calls preventDefault (see
// LineRowEditor.vue's onPaste -- writing el.value directly skips
// PrimeVue's own resize entirely), and a font-size change (nothing was
// typed at all). This Map lets either caller force a resize for one row
// or every row at once.
export function useTextareaAutoGrow() {
    const els = new Map(); // key -> the real <textarea> DOM node

    function autoGrow(el) {
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }
    // Bind as `:ref="(el) => setTextareaRef(key, el)"` on the Textarea --
    // PrimeVue's Textarea is a component, not a plain element, so `el` is
    // its instance; `el.$el` unwraps to the real DOM node the Map (and
    // autoGrow, which needs .style/.scrollHeight) actually needs.
    function setTextareaRef(key, el) {
        if (!el) { els.delete(key); return; }
        const node = el.$el ?? el;
        els.set(key, node);
        nextTick(() => autoGrow(node));
    }
    function regrowAll() {
        nextTick(() => els.forEach(autoGrow));
    }

    return { autoGrow, setTextareaRef, regrowAll };
}
