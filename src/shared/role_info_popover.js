import { reactive, computed } from "vue";

/*
 Shared "hover a role code, see its catalog entry" behavior -- extracted
 from LineEditorApp.vue's own role-info-btn so both editors' role
 catalogs (_roles.json's flat entries, _dub_roles.json's richer casting
 documents) show through the SAME popover mechanism, each with its own
 `fieldsFor(entry) => [[key, value], ...]` extractor for what's worth
 surfacing on hover.
*/
export function useRoleInfoPopover(roleEntries, fieldsFor) {
    const popover = reactive({ visible: false, left: 0, top: 0, code: "" });

    function show(anchorEl, code) {
        const rect = anchorEl.getBoundingClientRect();
        popover.left = Math.min(rect.left, window.innerWidth - 280);
        popover.top = rect.bottom + 4;
        popover.code = code;
        popover.visible = true;
    }
    function hide() {
        popover.visible = false;
    }

    const info = computed(() => {
        const code = popover.code;
        if (!code) return { message: "No speaker set on this line yet" };
        const entry = roleEntries.value.find((e) => e.code === code);
        if (!entry) return { message: `"${code}" is not a known role code -- used directly as a preset name` };
        const fields = fieldsFor(entry);
        return fields.length ? { fields } : { message: `"${code}" has no fields set` };
    });

    return { popover, show, hide, info };
}
