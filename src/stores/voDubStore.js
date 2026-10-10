/**
 * voDubStore — Pinia-стор базового состояния VO Dub редактора.
 */
import { ref, reactive, computed, watch, toRaw } from "vue";
import { defineStore } from "pinia";
import {
    joinPath,
    SCRIPT_EDITOR_API as FILE_API,
    VO_DUB_API,
} from "../shared/fl_common.js";
import {
    VO_DUB_STATUS_LABELS as STATUS_LABELS,
    VO_DUB_STATUS_FILTER_OPTIONS as STATUS_FILTER_OPTIONS,
    VO_DUB_STATUS_TOGGLE_OPTIONS as STATUS_TOGGLE_OPTIONS,
    VO_DUB_TRISTATE_FILTERS as TRISTATE_FILTERS,
} from "../shared/row_status.js";

/*
 Re-exported so the vocabulary is reachable without instantiating the store
 (a Pinia instance just to read two constants is a lot of ceremony). Both
 names still come out of the store's own return below as well, which is what
 VoDubLineEditorContent.vue uses -- these are the same objects, not copies.
*/
export { STATUS_LABELS, STATUS_FILTER_OPTIONS };

const SAVE_DEBOUNCE_MS = 600;
const PAGE_SIZE = 50;

export const useVoDubStore = defineStore("voDub", () => {
    const root = ref("");
    const bucket = ref("");

    const rows = ref([]);
    const stateRows = reactive({});

    const filterStatuses = ref(new Set());
    const filterManuallyDone = ref("any");
    const filterIssues = ref("any");
    /*
     Deliberately NOT persisted alongside the filter state: a search term
     restored from a previous session with no visible sign of it hides rows
     for no apparent reason. The filter buttons at least show their own state.
    */
    const searchText = ref("");
    const status = ref("");
    // Backwards compatibility property for VoDubLineEditorContent.vue and existing references
    const statusFilter = computed({
        get() {
            if (filterStatuses.value.size === 1) {
                return Array.from(filterStatuses.value)[0];
            }
            if (filterManuallyDone.value === "only") return "manually_done";
            if (filterManuallyDone.value === "without") return "not_done";
            if (filterIssues.value === "only") return "issues";
            return "";
        },
        set(val) {
            if (!val) {
                filterStatuses.value = new Set();
                filterManuallyDone.value = "any";
                filterIssues.value = "any";
            } else if (val === "manually_done") {
                filterStatuses.value = new Set();
                filterManuallyDone.value = "only";
                filterIssues.value = "any";
            } else if (val === "not_done") {
                filterStatuses.value = new Set();
                filterManuallyDone.value = "without";
                filterIssues.value = "any";
            } else if (val === "issues") {
                filterStatuses.value = new Set();
                filterManuallyDone.value = "any";
                filterIssues.value = "only";
            } else {
                filterStatuses.value = new Set([val]);
                filterManuallyDone.value = "any";
                filterIssues.value = "any";
            }
            scheduleSaveFilter();
        }
    });
    const loading = ref(false);
    const useOriginalDefault = ref(false);

    // snapshot of Russian text for search, indexed by audio_key
    const searchSnapshot = ref({});
    const saveTimer = ref(null);
    const currentPage = ref(0);

    function statePath() {
        return joinPath(root.value, "_dub_state.json");
    }

    const FILTER_STORAGE_KEY = "FL_VoDub.filterState";

    function loadFilterState() {
        try {
            const raw = localStorage.getItem(FILTER_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                if (Array.isArray(parsed.statuses)) {
                    const validStatuses = Object.keys(STATUS_LABELS);
                    const filtered = parsed.statuses.filter(s => validStatuses.includes(s));
                    filterStatuses.value = new Set(filtered);
                }
                if (["any", "only", "without"].includes(parsed.manuallyDone)) {
                    filterManuallyDone.value = parsed.manuallyDone;
                }
                if (["any", "only", "without"].includes(parsed.issues)) {
                    filterIssues.value = parsed.issues;
                }
            }
        } catch (e) {
            // ignore corrupt JSON or throwing storage
        }
    }

    function saveFilterState() {
        try {
            const state = {
                statuses: Array.from(filterStatuses.value),
                manuallyDone: filterManuallyDone.value,
                issues: filterIssues.value,
            };
            localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            // ignore throwing storage
        }
    }

    function scheduleSaveFilter() {
        saveFilterState();
    }

    function toggleStatus(value) {
        // Ignore empty string (dropdown's "all statuses" sentinel) and invalid statuses
        if (!value || !STATUS_LABELS.hasOwnProperty(value)) {
            return;
        }
        const newSet = new Set(filterStatuses.value);
        if (newSet.has(value)) {
            newSet.delete(value);
        } else {
            newSet.add(value);
        }
        filterStatuses.value = newSet;
    }

    function cycleManuallyDone() {
        if (filterManuallyDone.value === "any") {
            filterManuallyDone.value = "only";
        } else if (filterManuallyDone.value === "only") {
            filterManuallyDone.value = "without";
        } else {
            filterManuallyDone.value = "any";
        }
    }

    function cycleIssues() {
        if (filterIssues.value === "any") {
            filterIssues.value = "only";
        } else if (filterIssues.value === "only") {
            filterIssues.value = "without";
        } else {
            filterIssues.value = "any";
        }
    }

    function clearFilters() {
        filterStatuses.value = new Set();
        filterManuallyDone.value = "any";
        filterIssues.value = "any";
    }

    const hasActiveFilters = computed(() =>
        filterStatuses.value.size > 0 ||
        filterManuallyDone.value !== "any" ||
        filterIssues.value !== "any"
    );

    function init({ root: r, bucket: b }) {
        root.value = r;
        bucket.value = b;
        filterStatuses.value = new Set();
        filterManuallyDone.value = "any";
        filterIssues.value = "any";
        loadFilterState();
        searchText.value = "";
        currentPage.value = 0;
    }

    async function loadState() {
        const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(statePath())}`);
        const data = await resp.json();

        let parsed = { rows: {} };
        if (data.exists) {
            try {
                const candidate = JSON.parse(data.content);
                if (candidate && typeof candidate.rows === "object") parsed = candidate;
            } catch (e) {
                console.warn("[VODubStore] _dub_state.json is not valid JSON:", e);
            }
        }

        Object.keys(stateRows).forEach((k) => delete stateRows[k]);
        Object.assign(stateRows, parsed.rows);
        useOriginalDefault.value = Boolean(parsed.use_original_default);
    }

    /*
     Снимок русского текста по audio_key — только для поиска. Существует
     затем, чтобы фильтрация не читала stateRows через реактивный прокси:
     правка одной строки иначе инвалидирует visibleRows и перерисовывает
     всю страницу на каждое нажатие клавиши (см. комментарий у toRaw ниже).

     Вызовы этой функции появились в 17-м срезе, а сама она — нет. loadRows
     падал на ReferenceError внутри собственного try/catch и молча
     превращался в статус "Couldn't load", то есть строки не грузились
     вообще. Тесты этого не видели: ни один из них не вызывает loadRows.
    */
    function rebuildSearchSnapshot() {
        const stateRaw = toRaw(stateRows);
        const snapshot = {};
        for (const row of rows.value) {
            const entry = stateRaw[row.audio_key];
            snapshot[row.audio_key] = (entry && entry.russian_text) || row.russian || "";
        }
        searchSnapshot.value = snapshot;
    }

    // Load rows and then rebuild the snapshot of searchable Russian text.
    async function loadRows() {
        if (!root.value) return;
        loading.value = true;
        try {
            const params = new URLSearchParams({
                path: root.value,
                bucket: bucket.value,
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

            for (const row of rows.value) {
                const entry = stateRows[row.audio_key] || (stateRows[row.audio_key] = {});
                if (!entry.russian_text) entry.russian_text = row.russian || "";
                if (entry.instruct === undefined) entry.instruct = row.instruct || "";
                if (entry.speaker_override === undefined) entry.speaker_override = "";
                if (entry.effect === undefined) entry.effect = "";
            }

            status.value = `${rows.value.length} row(s) in ${bucket.value}`;
            // Snapshot the Russian text for searching after rows have been loaded.
            rebuildSearchSnapshot();
        } catch (e) {
            status.value = `Couldn't load: ${e}`;
        } finally {
            loading.value = false;
        }
    }

    function entryFor(row) {
        return stateRows[row.audio_key] || (stateRows[row.audio_key] = {});
    }

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

    // ── фильтр + поиск + пагинация ───────────────────────────────────────
    const visibleRows = computed(() => {
        const needle = searchText.value.trim().toLowerCase();
        const statuses = filterStatuses.value;
        const mDone = filterManuallyDone.value;
        const issues = filterIssues.value;
        // Use the cached snapshot for Russian text to avoid recomputing on every keystroke.
        const snapshot = searchSnapshot.value;
        /*
         toRaw BEFORE the key lookup, not after. Reading stateRows[key] through
         the reactive proxy registers a dependency on that entry, and calling
         toRaw on the result afterwards does not undo it -- the tracking has
         already happened. That was the whole bug: one keystroke invalidated
         this computed, re-filtered all ~617 rows and re-rendered the page.
        */
        const stateRaw = toRaw(stateRows);
        return rows.value.filter((row) => {
            const entryRaw = stateRaw[row.audio_key] || null;
            const isManuallyDone = Boolean(entryRaw && entryRaw.manually_done);
            const isIssue = Boolean(row.manually_issue);

            // Status group: OR within the group. EMPTY set means every status passes.
            if (statuses.size > 0 && !statuses.has(row.status)) {
                return false;
            }

            // ManuallyDone tri-state
            if (mDone === "only") {
                if (!isManuallyDone) return false;
            } else if (mDone === "without") {
                if (isManuallyDone) return false;
                // When manuallyDone is "without", unsupported rows stay hidden unless the user has explicitly selected "unsupported" in the status group.
                if (row.status === "unsupported" && !statuses.has("unsupported")) {
                    return false;
                }
            }

            // Issues tri-state
            if (issues === "only") {
                if (!isIssue) return false;
            } else if (issues === "without") {
                if (isIssue) return false;
            }

            if (!needle) return true;
            const russianText = snapshot[row.audio_key] || row.russian;
            const haystack = `${row.audio_key} ${row.speaker_tag} ${row.english} ${russianText}`.toLowerCase();
            return haystack.includes(needle);
        });
    });

    const pageCount = computed(() =>
        Math.max(1, Math.ceil(visibleRows.value.length / PAGE_SIZE)),
    );

    const pagedRows = computed(() => {
        const start = currentPage.value * PAGE_SIZE;
        return visibleRows.value.slice(start, start + PAGE_SIZE);
    });

    watch([filterStatuses, filterManuallyDone, filterIssues], () => {
        currentPage.value = 0;
        loadRows();
        saveFilterState();
    });

    // When search text changes, rebuild the snapshot (so new changes to stateRows are considered).
    watch(searchText, () => {
        // Rebuild snapshot to ensure latest russian_text values are used when a new search is performed.
        rebuildSearchSnapshot();
        currentPage.value = 0;
    });


    watch(visibleRows, () => {
        if (currentPage.value > pageCount.value - 1) {
            currentPage.value = Math.max(0, pageCount.value - 1);
        }
    });

    return {
            root, bucket, init,
            rows, stateRows, statusFilter, filterStatuses, filterManuallyDone, filterIssues, searchText, status, loading, useOriginalDefault,
            entryFor,
            loadState, loadRows, scheduleSave, flushSave, onTextEdit, setStatus, saveTimer,
            visibleRows, PAGE_SIZE, currentPage, pageCount, pagedRows,
            SAVE_DEBOUNCE_MS, statePath,
            STATUS_LABELS, STATUS_FILTER_OPTIONS,
            STATUS_TOGGLE_OPTIONS, TRISTATE_FILTERS,
            toggleStatus, cycleManuallyDone, cycleIssues, clearFilters, hasActiveFilters,
        };
    });
