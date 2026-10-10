/**
 * row_status — единственный дом для словаря статусов строки и построителя
 * опций фильтра.
 *
 * До этого модуля STATUS_LABELS/EXTRA_FILTERS/STATUS_FILTER_OPTIONS были
 * объявлены дважды — в src/stores/voDubStore.js и в мёртвом
 * src/vo_dub_editor/composables/useVoDubState.js — с одинаковым содержимым.
 * Две копии одного словаря рано или поздно расходятся.
 *
 * buildStatusFilterOptions — именно функция, а не готовая константа: у
 * аудиокнижного редактора свой набор состояний строки, и он вызовет тот же
 * построитель со своими аргументами. Поэтому здесь нет ничего, что знало бы
 * про VO Dub, кроме самих VO_DUB_* констант.
 */

export const VO_DUB_STATUS_LABELS = {
    "": "All statuses",
    no_text: "No source text",
    needs_translation: "Needs translation",
    not_started: "Not started",
    stale: "Stale",
    done: "Ready",
    unsupported: "Unsupported (multi-channel)",
};

export const VO_DUB_EXTRA_FILTERS = [
    { value: "not_done",      label: "Not done" },
    { value: "manually_done", label: "Done (manual)" },
    { value: "issues",        label: "⚠ Issues only" },
];

/**
 * Опции выпадающего списка: сначала каждый ключ `labels` в его собственном
 * порядке (поэтому "" / «все статусы» остаётся первым и служит значением по
 * умолчанию), следом — записи `extras` как есть.
 *
 * null и undefined для любого аргумента означают «пусто», а не ошибку:
 * вызывающему не нужно подставлять заглушки, когда у его редактора нет
 * дополнительных фильтров. Ни один аргумент не изменяется.
 */
export function buildStatusFilterOptions(labels, extras) {
    const labelOptions = Object.entries(labels || {}).map(([value, label]) => ({ value, label }));
    return [...labelOptions, ...(extras || [])];
}

export const VO_DUB_STATUS_FILTER_OPTIONS = buildStatusFilterOptions(
    VO_DUB_STATUS_LABELS,
    VO_DUB_EXTRA_FILTERS,
);

export const VO_DUB_STATUS_SEVERITY = {
    no_text: "warn",
    needs_translation: "info",
    not_started: "secondary",
    stale: "warn",
    done: "success",
    unsupported: "contrast",
};

export function severityForStatus(status) {
    return VO_DUB_STATUS_SEVERITY[status] || "secondary";
}

export const VO_DUB_STATUS_TOGGLE_OPTIONS = [
    { value: "no_text",           label: "No text" },
    { value: "needs_translation", label: "Needs translation" },
    { value: "not_started",       label: "Not started" },
    { value: "stale",             label: "Stale" },
    { value: "done",              label: "Ready" },
    { value: "unsupported",       label: "Unsupported" },
];

export const VO_DUB_TRISTATE_FILTERS = [
    {
        key: "manuallyDone",
        label: "Done (manual)",
        stateLabels: { without: "Not done" },
    },
    { key: "issues",       label: "\u26a0 Issues" },
];
