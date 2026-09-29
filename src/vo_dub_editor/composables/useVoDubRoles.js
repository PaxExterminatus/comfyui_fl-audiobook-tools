/**
 * useVoDubRoles — каталог ролей из _dub_roles.json.
 *
 * Отвечает за:
 *   • roleEntries    — [{ code, character, speaker, description, ... }]
 *   • loadRoleEntries()  — чтение каталога с диска
 *   • roleCodeFor(row)   — итоговый «код роли»: override или сырой csv-тег
 *   • roleOptionSubLabel(entry) — подпись в выпадающем списке
 *   • sameIdentifierCount(row) / applyRoleTitle(row) /
 *     applyRoleToSameIdentifier(row) — «применить роль ко всем строкам
 *     с тем же Identifier» (по audio_key-tag, не по роли)
 *   • roleInfoPopover — ховер-инфо по роли (использует useRoleInfoPopover)
 *
 * Внешние зависимости через ctx:
 *   props { root },          — путь к _dub_roles.json
 *   rows,                    — из useVoDubState, для sameIdentifierCount
 *   entryFor,                — из useVoDubState
 *   setStatus,               — из useVoDubState
 *   scheduleSave             — из useVoDubState
 *
 * Экспортирует:
 *   roleEntries, loadRoleEntries,
 *   roleCodeFor, roleOptionSubLabel,
 *   sameIdentifierCount, applyRoleTitle, applyRoleToSameIdentifier,
 *   roleInfoPopover, showRoleInfoPopover, hideRoleInfoPopover, roleInfoFields
 */

import { ref } from "vue";
import { useRoleInfoPopover } from "../../shared/role_info_popover.js";
import {
    joinPath,
    SCRIPT_EDITOR_API as FILE_API,
} from "../../../web/fl_common.js";

export function useVoDubRoles(ctx) {
    const { props, rows, entryFor, setStatus, scheduleSave } = ctx;

    // ── каталог ролей ────────────────────────────────────────────────────
    // [{ code, character, speaker, description, dub_direction, ... }]
    const roleEntries = ref([]);

    async function loadRoleEntries() {
        try {
            const resp = await fetch(
                `${FILE_API}/read?path=${encodeURIComponent(joinPath(props.root, "_dub_roles.json"))}`,
            );
            const data = await resp.json();
            if (!data.exists) {
                roleEntries.value = [];
                return;
            }
            const parsed = JSON.parse(data.content);
            const roles = (parsed && typeof parsed.roles === "object" && parsed.roles) || {};
            roleEntries.value = Object.entries(roles).map(([code, entry]) => ({ code, ...entry }));
        } catch (e) {
            roleEntries.value = [];
        }
    }

    // ── подпись под кодом роли в выпадающем списке ───────────────────────
    function roleOptionSubLabel(entry) {
        return [entry.character, entry.speaker].filter(Boolean).join(" -- ");
    }

    // ── итоговый код роли для строки ─────────────────────────────────────
    // «ручное значение, или сырой тег» — как в nodes/vo_dub_library.py's
    // resolved_speaker, но без role_map: важна только идентичность, не то,
    // в какой голос она резолвится.
    function roleCodeFor(row) {
        return (entryFor(row).speaker_override || row.speaker_tag || "").trim();
    }

    // ── ховер-инфо по роли ───────────────────────────────────────────────
    // Показывает поля из _dub_roles.json, а не плоские из _roles.json
    // (аудиокнижный редактор использует второй вариант, см. LineEditorContent).
    const {
        popover: roleInfoPopover,
        show: showRoleInfoPopover,
        hide: hideRoleInfoPopover,
        info: roleInfoFields,
    } = useRoleInfoPopover(
        roleEntries,
        (entry) => [
            ["character", entry.character],
            ["gender", entry.gender],
            ["actor", entry.actor],
            ["description", entry.description],
            ["dub direction", entry.dub_direction],
            ["notes", Array.isArray(entry.notes) ? entry.notes.join(" ") : entry.notes],
            ["voice", entry.speaker],
        ].filter(([, v]) => v !== undefined && v !== null && v !== ""),
    );

    // ── «применить роль ко всем строкам с тем же Identifier» ────────────
    // Игровой csv-тег (например, "Ellie") и курируемые коды проекта
    // (например, "emma") НЕ сопоставляются автоматически (см. docstring
    // vo_dub_library.py — сырой тег не гарантированно один и тот же
    // персонаж везде). Это ручное, one-click-per-tag действие: оно не
    // автоматизирует сопоставление, но масштабирует ручную работу
    // с уровня «строка» на уровень «тег».
    function sameIdentifierCount(row) {
        const tag = (row.speaker_tag || "").trim();
        if (!tag) return 0;
        return rows.value.filter(
            (r) =>
                r !== row &&
                r.status !== "unsupported" &&
                (r.speaker_tag || "").trim() === tag,
        ).length;
    }

    function applyRoleTitle(row) {
        const count = sameIdentifierCount(row);
        return count > 0
            ? `Apply this Role to every other "${row.speaker_tag}" row in this bucket (${count})`
            : "No other rows in this bucket share this Identifier";
    }

    function applyRoleToSameIdentifier(row) {
        const count = sameIdentifierCount(row);
        if (!count) return;
        const tag = (row.speaker_tag || "").trim();
        const value = entryFor(row).speaker_override || row.speaker_tag;
        rows.value.forEach((r) => {
            if (
                r !== row &&
                r.status !== "unsupported" &&
                (r.speaker_tag || "").trim() === tag
            ) {
                entryFor(r).speaker_override = value;
            }
        });
        scheduleSave();
        setStatus(`Applied Role to ${count} other "${tag}" row(s) in this bucket`);
    }

    return {
        roleEntries,
        loadRoleEntries,
        roleCodeFor,
        roleOptionSubLabel,
        sameIdentifierCount,
        applyRoleTitle,
        applyRoleToSameIdentifier,
        roleInfoPopover,
        showRoleInfoPopover,
        hideRoleInfoPopover,
        roleInfoFields,
    };
}
