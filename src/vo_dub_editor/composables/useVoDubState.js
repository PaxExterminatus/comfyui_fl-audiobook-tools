/**
 * useVoDubState — состояние bucket'а VO Dub: rows, stateRows, фильтры,
 * пагинация, дебаунс-сохранение в _dub_state.json.
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

    const rows = ref([]);
    const stateRows = reactive({});

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

    // Фильтры не по row.status, а по отдельным флагам (обрабатываются на бэкенде).
    const EXTRA_FILTERS = [
        { value: "not_done", label: "Not done" },
        { value: "issues",   label: "⚠ Issues only" },
    ];

    const STATUS_FILTER_OPTIONS = [
        ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
        ...EXTRA_FILTERS,
    ];

    function statePath() {
        return joinPath(props.root, "_dub_state.json");
    }

    const useOriginalDefault = ref(false);

    async function loadState() {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(statePath())}`);
        const data = await resp.json();

        let parsed = { rows: {} };
        if (data.exists) {
            try {
                const candidate = JSON.parse(data.content);
                if (candidate && typeof candidate.rows === "object") parsed = candidate;
            } catch (e) {
                console.warn("[VODubEditor] _dub_state.json не парсится:", e);
            }
        }

        Object.keys(stateRows).forEach((k) => delete stateRows[k]);
        Object.assign(stateRows, parsed.rows);
        useOriginalDefault.value = Boolean(parsed.use_original_default);
    }

    async function loadRows() {
        loading.value = true;
        try {
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

            // Backfill entry для каждой строки (не перезаписываем существующие правки)
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

    function entryFor(row) {
        return stateRows[row.audio_key] || (stateRows[row.audio_key] = {});
    }

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
            loadRows();
        } catch (e) {
            status.value = `Save failed: ${e}`;
        }
    }

    function onTextEdit(row) {
        void entryFor(row);
        scheduleSave();
    }

    function setStatus(msg) {
        status.value = msg;
    }

    // Клиентский фильтр — страховка на время refetch (бэкенд фильтрует сам).
    const visibleRows = computed(() => {
        const needle = searchText.value.trim().toLowerCase();
        const sf = statusFilter.value;
        return rows.value.filter((row) => {
            if (sf === "issues") {
                if (!row.manually_issue) return false;
            } else if (sf === "not_done") {
                if (row.status === "done" || row.status === "unsupported") return false;
            } else if (sf && row.status !== sf) {
                return false;
            }
            if (!needle) return true;
            const entry = stateRows[row.audio_key];
            const haystack = `${row.audio_key} ${row.speaker_tag} ${row.english} ${(entry && entry.russian_text) || row.russian}`.toLowerCase();
            return haystack.includes(needle);
        });
    });

    const PAGE_SIZE = 50;
    const currentPage = ref(0);

    const pageCount = computed(() =>
        Math.max(1, Math.ceil(visibleRows.value.length / PAGE_SIZE)),
    );

    const pagedRows = computed(() => {
        const start = currentPage.value * PAGE_SIZE;
        return visibleRows.value.slice(start, start + PAGE_SIZE);
    });

    watch(statusFilter, () => {
        currentPage.value = 0;
        loadRows();
    });

    watch(searchText, () => {
        currentPage.value = 0;
    });

    watch(visibleRows, () => {
        if (currentPage.value > pageCount.value - 1) {
            currentPage.value = Math.max(0, pageCount.value - 1);
        }
    });

    return {
        rows,
        stateRows,
        statusFilter,
        searchText,
        status,
        loading,
        useOriginalDefault,
        entryFor,
        loadState,
        loadRows,
        scheduleSave,
        flushSave,
        onTextEdit,
        setStatus,
        saveTimer,
        visibleRows,
        PAGE_SIZE,
        currentPage,
        pageCount,
        pagedRows,
        SAVE_DEBOUNCE_MS,
        statePath,
        STATUS_LABELS,
        STATUS_FILTER_OPTIONS,
    };
}
