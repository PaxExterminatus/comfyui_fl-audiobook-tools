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

/*
 Color class for each status, using the 3 shared semantic text-color
 classes from src/style/app.css (.text-warning/.text-active/.text-success)
 instead of VoDubBrowserPanel's own pill-* set and VoDubLineEditor's own
 status-* set -- two independently-invented class names for this exact
 same dictionary before this. A status with no entry here (not_started,
 unsupported) just gets the default ".muted" treatment at the call site.
*/
export const VO_DUB_STATUS_COLOR_CLASS = {
    no_text: "text-warning",
    needs_translation: "text-active",
    stale: "text-warning",
    done: "text-success",
};

export function statusColorClass(status) {
    return VO_DUB_STATUS_COLOR_CLASS[status] || "muted";
}

export const VO_DUB_STATUS_TOGGLE_OPTIONS = [
    { value: "no_text",           label: "No text" },
    { value: "needs_translation", label: "Needs translation" },
    { value: "not_started",       label: "Not started" },
    { value: "stale",             label: "Stale" },
    { value: "done",              label: "Ready" },
    { value: "unsupported",       label: "Unsupported" },
];

/*
 stateLabels \u0434\u0430\u0451\u0442 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044e "without" \u0438\u043c\u044f "Not done" -- \u0442\u0430\u043a \u044d\u0442\u043e\u0442 \u0444\u0438\u043b\u044c\u0442\u0440
 \u043d\u0430\u0437\u044b\u0432\u0430\u043b\u0441\u044f \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e\u0439 \u0441\u0442\u0440\u043e\u043a\u043e\u0439 \u0432 \u0432\u044b\u043f\u0430\u0434\u0430\u044e\u0449\u0435\u043c \u0441\u043f\u0438\u0441\u043a\u0435 (VO_DUB_EXTRA_FILTERS
 \u0432\u044b\u0448\u0435). \u0411\u0435\u0437 \u043d\u0435\u0433\u043e \u043e\u043d \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u043a\u0430\u043a "Done (manual) \u2717", \u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0435\u0433\u043e
 \u043f\u043e\u043f\u0440\u043e\u0441\u0442\u0443 \u043d\u0435 \u043d\u0430\u0445\u043e\u0434\u0438\u0442.
*/
export const VO_DUB_TRISTATE_FILTERS = [
    {
        key: "manuallyDone",
        label: "Done (manual)",
        stateLabels: { without: "Not done" },
    },
    { key: "issues",       label: "\u26a0 Issues" },
];
