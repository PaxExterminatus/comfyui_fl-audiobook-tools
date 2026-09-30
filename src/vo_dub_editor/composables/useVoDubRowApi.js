/**
 * useVoDubRowApi — контракт для LineRowEditor через inject.
 */

import { provide } from "vue";

export function useVoDubRowApi(ctx) {
    const {
        roleEntries,
        roleOptionSubLabel,
        showRoleInfoPopover,
        hideRoleInfoPopover,
        fontSizePx,
        autoGrow,
        setTextareaRef,
        // audio URL + cacheBust — для диалога редактирования тегов
        audioUrl,
        cacheBust,
        entryFor,
        onTextEdit,
        scheduleInstructLibrarySave,
        roleCodeFor,
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
        roleEntries,
        roleOptionSubLabel,
        fontSizePx,
        autoGrow,
        setTextareaRef,
        showRoleInfoPopover,
        hideRoleInfoPopover,

        speakerPlaceholder: "Role",
        speakerTitle: "Role code (resolves to that role's assigned voice), or a literal preset/preset#tag",
        instructPlaceholder: "Instruct",
        instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
        textPlaceholder: "Russian text for this line",

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

        getRoleInfoCode: (row) => roleCodeFor(row),
        textKey:         (row) => row.audio_key,

        canUndoInstruct:         (row) => prevInstruct[row.audio_key] !== undefined,
        undoInstructTitle:       (row) => undoInstructTitle(row),
        undoInstruct:            (row) => undoInstruct(row),
        canApplyInstruct:        (row) => sameRoleCount(row) > 0,
        applyInstructTitle:      (row) => applyInstructTitle(row),
        applyInstructToSameRole: (row) => applyInstructToSameRole(row),
        instructNoteFor:         (row) => instructNoteFor(row),
        openInstructPicker:      (row) => openInstructPicker(row),

        // ── URL аудио для диалога редактирования тегов ──────────────────
        // original — EN-эталон (audio_en/<audio_key>.wav)
        // current — RU-тейк (audio_ru/<audio_key>.wav) с кэш-бастом
        getOriginalAudioUrl: (row) => audioUrl
            ? audioUrl("audio_en", row.audio_key)
            : "",
        getCurrentAudioUrl: (row) => audioUrl
            ? audioUrl("audio_ru", row.audio_key, cacheBust?.[row.audio_key])
            : "",
    });
}
