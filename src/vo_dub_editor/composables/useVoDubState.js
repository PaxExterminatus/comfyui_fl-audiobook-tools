/**
 * useVoDubState — базовое состояние одного bucket'а VO Dub.
 *
 * Отвечает за:
 *   • rows         — серверный список строк (audio_key, english, status, ...)
 *   • stateRows    — локальные правки, keyed by audio_key → _dub_state.json
 *   • фильтр/поиск/пагинацию
 *   • дебаунсенное сохранение stateRows в _dub_state.json
 *   • entryFor(row) — доступ к записи правки конкретной строки
 *
 * Внешние зависимости через ctx:
 *   props { root, bucket }
 */

import { ref, reactive, computed, watch } from "vue";
import {
    joinPath,
    SCRIPT_EDITOR_API as FILE_API,
    VO_DUB_API,
} from "../../../web/fl_common.js";

export function useVoDubState(ctx) {
    const { props } = ctx;

    const SAVE_DEBOUNCE_MS = 600;

    // ── серверный список + локальные правки ──────────────────────────────
    const rows = ref([]); // [{audio_key, episode, english, duration_s, channels,
                          //   status, speaker, speaker_tag, russian, instruct}]
    const stateRows = reactive({}); // audio_key → entry (правки + метаданные)

    // ── UI-состояние ─────────────────────────────────────────────────────
    const statusFilter = ref("");
    const searchText = ref("");
    const status = ref("");
    const loading = ref(false);

    const STATUS_LABELS = {
        "": "All statuses",
        no_text: "No source text",
        needs_translation: "Needs translation",
        not_started: "Not started",
        stale: "Stale",
        done: "Done",
        unsupported: "Unsupported (multi-channel)",
    };

    // Дополнительные фильтры, которые обрабатываются НЕ по row.status,
    // а по отдельным флагам. Бэкенд знает про значение "issues" и делает
    // свою фильтрацию (см. bucket_rows в _vo_dub_helpers.py).
    const EXTRA_FILTERS = [
        { value: "issues", label: "⚠ Issues only" },
    ];

    const STATUS_FILTER_OPTIONS = [
        ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
        ...EXTRA_FILTERS,
    ];

    // ── путь к _dub_state.json ───────────────────────────────────────────
    function statePath() {
        return joinPath(props.root, "_dub_state.json");
    }

    // ── глобальный дефолт «use original as sample» ───────────────────────
    // Живёт в _dub_state.json рядом с rows, поэтому держим здесь.
    const useOriginalDefault = ref(false);

    // ── загрузка состояния с диска ───────────────────────────────────────
    async function loadState() {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(statePath())}`);
        const data = await resp.json();

        let parsed = { rows: {} };
        if (data.exists) {
            try {
                const candidate = JSON.parse(data.content);
                if (candidate && typeof candidate.rows === "object") parsed = candidate;
            } catch (e) {
                console.warn("[FL CosyVoice3 VODubEditor] _dub_state.json is not valid JSON:", e);
            }
        }

        // Чистим предыдущий stateRows и заливаем новый (без переаллокации reactive)
        Object.keys(stateRows).forEach((k) => delete stateRows[k]);
        Object.assign(stateRows, parsed.rows);
        useOriginalDefault.value = Boolean(parsed.use_original_default);
    }

    // ── загрузка списка строк с сервера ──────────────────────────────────
    async function loadRows() {
        loading.value = true;
        try {
            // Фильтр по status отправляем на бэкенд: для "issues" — отдельная
            // ветка логики в bucket_rows, для остальных — прямое сравнение
            // с row.status. Это позволяет бэкенду считать актуальные флаги
            // (manually_issue) из state-файла, а не полагаться на клиентский кэш.
            const params = new URLSearchParams({
                path: props.root,
                bucket: props.bucket,
            });
            if (statusFilter.value) params.set("status", statusFilter.value);

            const resp = await fetch(`${VO_DUB_API}/rows?${params.toString()}`);
            const data = await resp.json();
            if (data.error) {
                status.value = data.error;
                rows.value = [];
                return;
            }
            rows.value = data.rows || [];

            // Backfill: каждая строка имеет свой entry, чтобы textarea/inputs
            // сразу биндились к реальным значениям. НЕ перезаписываем то,
            // что уже отредактировано (см. entryFor).
            for (const row of rows.value) {
                const entry = stateRows[row.audio_key] || (stateRows[row.audio_key] = {});
                if (!entry.russian_text) entry.russian_text = row.russian || "";
                if (entry.instruct === undefined) entry.instruct = row.instruct || "";
                if (entry.speaker_override === undefined) entry.speaker_override = "";
                if (entry.effect === undefined) entry.effect = "";
            }

            status.value = `${rows.value.length} row(s) in ${props.bucket}`;
        } catch (e) {
            status.value = `Couldn't load: ${e}`;
        } finally {
            loading.value = false;
        }
    }

    // ── доступ к записи правки ───────────────────────────────────────────
    // Единственная точка чтения/записи stateRows. Все остальные
    // composables ходят только через неё.
    function entryFor(row) {
        return stateRows[row.audio_key] || (stateRows[row.audio_key] = {});
    }

    // ── дебаунсенное сохранение ──────────────────────────────────────────
    // saveTimer — ref, а не локальный let: он экспортируется наружу,
    // чтобы main.close() и useVoDubRender.renderRow() могли сбросить
    // отложенный save и вызвать flushSave() немедленно (данные не теряются).
    const saveTimer = ref(null);

    function scheduleSave() {
        if (saveTimer.value) clearTimeout(saveTimer.value);
        saveTimer.value = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
    }

    async function flushSave() {
        try {
            await fetch(`${FILE_API}/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: statePath(),
                    content: JSON.stringify(
                        { rows: stateRows, use_original_default: useOriginalDefault.value },
                        null,
                        2,
                    ),
                }),
            });
            status.value = "Saved";

            // Перечитываем строки: статус-пилюли (not_started/stale/done)
            // пересчитываются на бэкенде из актуального state-файла и хешей.
            loadRows();
        } catch (e) {
            status.value = `Save failed: ${e}`;
        }
    }

    // ── колбэк «пользователь что-то изменил в строке» ────────────────────
    // Единственное место, где гарантируется, что entry существует до save.
    function onTextEdit(row) {
        void entryFor(row);
        scheduleSave();
    }

    // ── статусная строка ─────────────────────────────────────────────────
    function setStatus(msg) {
        status.value = msg;
    }

    // ── фильтр + поиск (клиентская страховка) ────────────────────────────
    // Основной фильтр по status делается на бэкенде (см. loadRows выше).
    // Здесь — только страховка на случай, если statusFilter изменился
    // без перезагрузки: клиентский фильтр повторяет логику бэкенда, чтобы
    // UI не показывал лишнее, пока идёт refetch. Плюс — поиск по тексту
    // (searchText), который на бэкенд не уходит — он чисто клиентский.
    const visibleRows = computed(() => {
        const needle = searchText.value.trim().toLowerCase();
        const sf = statusFilter.value;
        return rows.value.filter((row) => {
            // status: "issues" → фильтруем по manually_issue, иначе по row.status
            if (sf === "issues") {
                if (!row.manually_issue) return false;
            } else if (sf && row.status !== sf) {
                return false;
            }
            if (!needle) return true;
            const entry = stateRows[row.audio_key];
            const haystack = `${row.audio_key} ${row.speaker_tag} ${row.english} ${(entry && entry.russian_text) || row.russian}`.toLowerCase();
            return haystack.includes(needle);
        });
    });

    // ── пагинация ────────────────────────────────────────────────────────
    // Bucket может быть на 600+ строк; рендер всех <audio> сразу — это то,
    // что делало редактор медленным. Пагинация держит DOM маленьким.
    const PAGE_SIZE = 50;
    const currentPage = ref(0);

    const pageCount = computed(() =>
        Math.max(1, Math.ceil(visibleRows.value.length / PAGE_SIZE)),
    );

    const pagedRows = computed(() => {
        const start = currentPage.value * PAGE_SIZE;
        return visibleRows.value.slice(start, start + PAGE_SIZE);
    });

    // Смена фильтра — на первую страницу И перезагрузка строк с сервера
    // (бэкенд делает фильтрацию сам, клиентская страховка — только чтобы
    // не показывать лишнее во время refetch).
    watch(statusFilter, () => {
        currentPage.value = 0;
        loadRows();
    });

    watch(searchText, () => {
        currentPage.value = 0;
    });

    // Если после рендера строк стало меньше — не «улететь» за конец.
    watch(visibleRows, () => {
        if (currentPage.value > pageCount.value - 1) {
            currentPage.value = Math.max(0, pageCount.value - 1);
        }
    });

    return {
        // состояние
        rows,
        stateRows,
        statusFilter,
        searchText,
        status,
        loading,
        useOriginalDefault,
        // доступ
        entryFor,
        // загрузка/сохранение
        loadState,
        loadRows,
        scheduleSave,
        flushSave,
        onTextEdit,
        setStatus,
        saveTimer,          // ← экспортируется для main.close() и Render
        // фильтр/пагинация
        visibleRows,
        PAGE_SIZE,
        currentPage,
        pageCount,
        pagedRows,
        // константы и утилиты
        SAVE_DEBOUNCE_MS,
        statePath,
        STATUS_LABELS,
        STATUS_FILTER_OPTIONS,
    };
}
