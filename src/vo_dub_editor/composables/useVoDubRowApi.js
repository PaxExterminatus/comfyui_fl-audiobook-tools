/**
 * useVoDubRowApi — контракт для LineRowEditor через inject.
 *
 * Никакой собственной логики: только provide("lineRowApi", {...}),
 * собранный из функций и refs, которые предоставляют другие composables.
 * Каждый getter/setter знает про форму stateRows[row.audio_key] именно
 * VO Dub'а — этим LineRowEditor остаётся caller-agnostic.
 *
 * Внешние зависимости через ctx:
 *   roleEntries, roleOptionSubLabel,
 *   showRoleInfoPopover, hideRoleInfoPopover,
 *   fontSizePx, autoGrow, setTextareaRef,
 *   entryFor, onTextEdit, scheduleInstructLibrarySave,
 *   roleCodeFor,
 *   prevInstruct, undoInstructTitle, undoInstruct,
 *   sameRoleCount, applyInstructTitle, applyInstructToSameRole,
 *   instructNoteFor, openInstructPicker
 *
 * Ничего не возвращает — только side-effect provide().
 */

import { provide } from "vue";

export function useVoDubRowApi(ctx) {
    const {
        // каталог и UI
        roleEntries,
        roleOptionSubLabel,
        showRoleInfoPopover,
        hideRoleInfoPopover,
        fontSizePx,
        autoGrow,
        setTextareaRef,
        // state
        entryFor,
        onTextEdit,
        scheduleInstructLibrarySave,
        // roles
        roleCodeFor,
        // instruct
        prevInstruct,
        undoInstructTitle,
        undoInstruct,
        sameRoleCount,
        applyInstructTitle,
        applyInstructToSameRole,
        instructNoteFor,
        openInstructPicker,
    } = ctx;

    provide("lineRowApi", {
        // ── общий каталог и UI ─────────────────────────────────────────────
        roleEntries,
        roleOptionSubLabel,
        fontSizePx,
        autoGrow,
        setTextareaRef,
        showRoleInfoPopover,
        hideRoleInfoPopover,

        // ── подписи, специфичные для VO Dub ────────────────────────────────
        speakerPlaceholder: "Role",
        speakerTitle: "Role code (resolves to that role's assigned voice), or a literal preset/preset#tag",
        instructPlaceholder: "Instruct",
        instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
        textPlaceholder: "Russian text for this line",

        // ── доступ к полям row (специфично для VO Dub) ─────────────────────
        // speaker override — отдельное поле; fallback на сырой csv-тег.
        getSpeaker:  (row) => entryFor(row).speaker_override || row.speaker_tag,
        setSpeaker:  (row, v) => { entryFor(row).speaker_override = v; onTextEdit(row); },

        getInstruct: (row) => entryFor(row).instruct,
        setInstruct: (row, v) => {
            entryFor(row).instruct = v;
            onTextEdit(row);
            scheduleInstructLibrarySave(row);
        },

        getText:     (row) => entryFor(row).russian_text,
        setText:     (row, v) => { entryFor(row).russian_text = v; onTextEdit(row); },

        // идентификатор для ховер-инфо — итоговый код роли, не сам override.
        getRoleInfoCode: (row) => roleCodeFor(row),

        // ключ для textarea-ref: у VO Dub — audio_key.
        textKey:     (row) => row.audio_key,

        // ── instruct-действия ──────────────────────────────────────────────
        canUndoInstruct:     (row) => prevInstruct[row.audio_key] !== undefined,
        undoInstructTitle:   (row) => undoInstructTitle(row),
        undoInstruct:        (row) => undoInstruct(row),
        canApplyInstruct:    (row) => sameRoleCount(row) > 0,
        applyInstructTitle:  (row) => applyInstructTitle(row),
        applyInstructToSameRole: (row) => applyInstructToSameRole(row),
        instructNoteFor:     (row) => instructNoteFor(row),
        openInstructPicker:  (row) => openInstructPicker(row),
    });
}
