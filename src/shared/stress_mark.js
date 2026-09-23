// Shared by both editors' "´ Stress mark" button (see LineEditorApp.vue and
// vo_dub_editor/VoDubLineEditor.vue). Uses mousedown+preventDefault on the
// caller's <Button> (not click): a plain click on a <button> steals focus
// from the textarea in Chromium before any click handler runs, which would
// leave document.activeElement pointing at the button, not the field the
// user was just typing into.
export function insertStressMark(setStatus) {
    const el = document.activeElement;
    if (!el || (el.tagName !== "TEXTAREA" && el.tagName !== "INPUT")) {
        setStatus?.("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
    }
    const pos = el.selectionStart;
    el.value = el.value.slice(0, pos) + "́" + el.value.slice(pos);
    el.selectionStart = el.selectionEnd = pos + 1;
    el.dispatchEvent(new Event("input", { bubbles: true }));
}
