/**
 * useVoDubInstruct — instruct-банк (_instruct_categories.json) и работа с полем «Instruct» у строки.
 */

import { ref, reactive } from "vue";
import { saveInstructPhrase } from "../../shared/instruct_library.js";
import {
    joinPath,
    SCRIPT_EDITOR_API as FILE_API,
} from "../../../web/fl_common.js";

export function useVoDubInstruct(ctx) {
    const {
        props,
        rows,
        entryFor,
        onTextEdit,
        setStatus,
        scheduleSave,
        roleCodeFor,
    } = ctx;

    // ── банк instruct'ов ─────────────────────────────────────────────────
    const instructCategories = ref([]); // [{ name, title, when, examples }, ...]

    function instructCategoriesPath() {
        return joinPath(props.root, "_instruct_categories.json");
    }

    async function loadInstructCategories() {
        try {
            const resp = await fetch(
                `${FILE_API}/read?path=${encodeURIComponent(instructCategoriesPath())}`,
            );
            const data = await resp.json();
            if (!data.exists) {
                instructCategories.value = [];
                return;
            }
            const parsed = JSON.parse(data.content);
            instructCategories.value = (parsed && parsed.categories) || [];
        } catch (e) {
            instructCategories.value = [];
        }
    }

    // ── автопополнение банка ─────────────────────────────────────────────
    // Дебаунс на строку: пока пользователь печатает — не дёргаем сеть,
    // только когда ввод «устоялся». Дубликаты отсекает сам saveInstructPhrase.
    const instructLibrarySaveTimers = new Map(); // audio_key → setTimeout handle

    function scheduleInstructLibrarySave(row) {
        clearTimeout(instructLibrarySaveTimers.get(row.audio_key));
        instructLibrarySaveTimers.set(
            row.audio_key,
            setTimeout(async () => {
                const phrase = entryFor(row).instruct;
                const updated = await saveInstructPhrase(
                    FILE_API,
                    instructCategoriesPath(),
                    phrase,
                );
                if (updated) instructCategories.value = updated;
            }, 600), // синхронно с SAVE_DEBOUNCE_MS из state
        );
    }

    // ── picker-диалог ────────────────────────────────────────────────────
    const instructPickerVisible = ref(false);
    const instructPickerRow = ref(null);

    function openInstructPicker(row) {
        instructPickerRow.value = row;
        instructPickerVisible.value = true;
    }

    // Предыдущий instruct держим ОТДЕЛЬНО от stateRows: это чисто UI-буфер
    // undo, ему нечего делать в _dub_state.json.
    const prevInstruct = reactive({}); // audio_key → предыдущее значение

    function onInstructPicked(example) {
        const row = instructPickerRow.value;
        if (!row) return;
        prevInstruct[row.audio_key] = entryFor(row).instruct;
        entryFor(row).instruct = example;
        onTextEdit(row);
        // Уже пришло из банка — saveInstructPhrase сдедует no-op по дедупу;
        // вызов безвреден на случай, если категорию поправили руками.
        scheduleInstructLibrarySave(row);
    }

    function undoInstructTitle(row) {
        return prevInstruct[row.audio_key] !== undefined
            ? `Restore previous instruct: "${prevInstruct[row.audio_key]}"`
            : "No previous instruct to restore";
    }

    function undoInstruct(row) {
        if (prevInstruct[row.audio_key] === undefined) return;
        const current = entryFor(row).instruct;
        entryFor(row).instruct = prevInstruct[row.audio_key];
        prevInstruct[row.audio_key] = current;
        onTextEdit(row);
    }

    // ── note: к какой категории относится текущий instruct ───────────────
    // Только если дословно совпадает с примером из банка. Свободный ввод
    // не подсвечивается — это чисто информационная подсказка.
    function instructNoteFor(row) {
        const text = (entryFor(row).instruct || "").trim();
        const category = instructCategories.value.find((c) =>
            (c.examples || []).some((ex) => ex.trim() === text),
        );
        return category ? category.title : null;
    }

    // ── «применить instruct ко всем строкам той же роли» ─────────────────
    // Группируем по roleCodeFor по ВСЕМУ bucket'у (rows.value), а не только
    // по текущей странице — как в аудиокнижном редакторе.
    function sameRoleCount(row) {
        const code = roleCodeFor(row);
        if (!code) return 0;
        return rows.value.filter(
            (r) =>
                r !== row &&
                r.status !== "unsupported" &&
                roleCodeFor(r) === code,
        ).length;
    }

    function applyInstructToSameRole(row) {
        const count = sameRoleCount(row);
        if (!count) return;
        const code = roleCodeFor(row);
        const instruct = entryFor(row).instruct;
        rows.value.forEach((r) => {
            if (
                r !== row &&
                r.status !== "unsupported" &&
                roleCodeFor(r) === code
            ) {
                entryFor(r).instruct = instruct;
            }
        });
        scheduleSave();
        setStatus(`Applied instruct to ${count} other "${code}" row(s) in this bucket`);
    }

    return {
        instructCategories,
        loadInstructCategories,
        instructPickerVisible,
        instructPickerRow,
        openInstructPicker,
        onInstructPicked,
        prevInstruct,
        undoInstructTitle,
        undoInstruct,
        instructNoteFor,
        sameRoleCount,
        applyInstructToSameRole,
    };
}
