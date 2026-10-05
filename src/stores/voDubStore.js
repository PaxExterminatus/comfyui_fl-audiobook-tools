/**
 * voDubStore — Pinia-стор базового состояния VO Dub редактора.
 */
import { ref, reactive, computed, watch } from "vue";
import { defineStore } from "pinia";
import {
    joinPath,
    SCRIPT_EDITOR_API as FILE_API,
    VO_DUB_API,
} from "../../web/fl_common.js";
import {
    VO_DUB_STATUS_LABELS as STATUS_LABELS,
    VO_DUB_STATUS_FILTER_OPTIONS as STATUS_FILTER_OPTIONS,
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

    const statusFilter = ref("");
    const searchText = ref("");
    const status = ref("");
    const loading = ref(false);
    const useOriginalDefault = ref(false);

    const saveTimer = ref(null);
    const currentPage = ref(0);

    function statePath() {
        return joinPath(root.value, "_dub_state.json");
    }

    function init({ root: r, bucket: b }) {
        root.value = r;
        bucket.value = b;
        statusFilter.value = "";
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
        const sf = statusFilter.value;
        return rows.value.filter((row) => {
            const entry = stateRows[row.audio_key];

            if (sf === "issues") {
                if (!row.manually_issue) return false;
            } else if (sf === "manually_done") {
                if (!entry || !entry.manually_done) return false;
            } else if (sf === "not_done") {
                // Not done = всё, кроме unsupported и строк с РУЧНОЙ отметкой Done.
                // Auto-Ready (status=done) остаётся в списке — человек ещё не подтвердил.
                if (row.status === "unsupported") return false;
                if (entry && entry.manually_done) return false;
            } else if (sf && row.status !== sf) {
                return false;
            }

            if (!needle) return true;
            const haystack = `${row.audio_key} ${row.speaker_tag} ${row.english} ${(entry && entry.russian_text) || row.russian}`.toLowerCase();
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
        root, bucket, init,
        rows, stateRows, statusFilter, searchText, status, loading, useOriginalDefault,
        entryFor,
        loadState, loadRows, scheduleSave, flushSave, onTextEdit, setStatus, saveTimer,
        visibleRows, PAGE_SIZE, currentPage, pageCount, pagedRows,
        SAVE_DEBOUNCE_MS, statePath,
        STATUS_LABELS, STATUS_FILTER_OPTIONS,
    };
});
