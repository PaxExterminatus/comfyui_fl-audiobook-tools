/**
 * useVoDubHistory — история версий одной строки (audio_key).
 *
 * Отвечает за:
 *   • historyVisible / historyRow / historyVersions / historyChosenVersion
 *   • historyCounts — количество версий по каждой строке (для бейджа)
 *   • refreshHistoryCounts()  — один запрос на весь bucket
 *   • openLineHistory(row)    — открыть диалог для строки
 *   • onHistoryVersionChosen(version) — переключить активную версию
 */

import { ref, reactive } from "vue";
import { VO_DUB_API } from "../../../web/fl_common.js";

export function useVoDubHistory(ctx) {
    const { props, setStatus, entryFor, scheduleSave } = ctx;

    // ── состояние диалога ────────────────────────────────────────────────
    const historyVisible = ref(false);
    const historyRow = ref(null);
    const historyVersions = ref([]);
    const historyChosenVersion = ref(null);

    // audio_key → количество версий. Заполняется ОДНИМ запросом на весь
    // bucket (не по запросу на строку) — используется как label кнопки.
    const historyCounts = reactive({});

    // ── счётчики версий ──────────────────────────────────────────────────
    async function refreshHistoryCounts() {
        try {
            const resp = await fetch(
                `${VO_DUB_API}/line_history/counts?root=${encodeURIComponent(props.root)}`,
            );
            const data = await resp.json();
            if (data && !data.error) Object.assign(historyCounts, data);
        } catch (e) {
            console.error("[FL history] couldn't load version counts", e);
        }
    }

    // ── открыть диалог истории для строки ────────────────────────────────
    async function openLineHistory(row) {
        historyRow.value = row;
        try {
            const resp = await fetch(
                `${VO_DUB_API}/line_history?root=${encodeURIComponent(props.root)}&audio_key=${encodeURIComponent(row.audio_key)}`,
            );
            const data = await resp.json();
            historyVersions.value = data.versions || [];
            historyChosenVersion.value = data.chosen_version ?? null;
        } catch (e) {
            console.error("[FL history] couldn't load line history", e);
            historyVersions.value = [];
            historyChosenVersion.value = null;
        }
        historyVisible.value = true;
    }

    // ── пользователь выбрал версию ───────────────────────────────────────
    async function onHistoryVersionChosen(version) {
        const row = historyRow.value;
        if (!row) return;
        try {
            const resp = await fetch(`${VO_DUB_API}/line_history/choose`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    root: props.root,
                    audio_key: row.audio_key,
                    version,
                }),
            });
            const data = await resp.json();
            if (data && data.error) {
                setStatus(`Couldn't switch version: ${data.error}`);
                return;
            }

            // Обновить выбранную версию в диалоге
            historyChosenVersion.value = version;
            setStatus(`Switched ${row.audio_key} to version ${version}`);

            // Запомнить активную версию -- apply_effect будет читать
            // источник из _dub_versions/<эта версия>, а не из _dub_dry
            // (которая остаётся от последнего ПОЛНОГО рендера).
            entryFor(row).active_version = version;
            scheduleSave();

            // Сбросить ?v= — иначе <audio> в строке продолжит играть
            // старый файл из кэша браузера, хотя на диске уже новый.
            if (ctx.cacheBust) {
                ctx.cacheBust[row.audio_key] = Date.now();
            }

            // Перечитать строки — статус (stale/done) мог поменяться
            if (ctx.loadRows) await ctx.loadRows();

            // Обновить счётчики версий
            refreshHistoryCounts();
        } catch (e) {
            setStatus(`Couldn't switch version: ${e.message || e}`);
        }
    }

    return {
        historyVisible,
        historyRow,
        historyVersions,
        historyChosenVersion,
        historyCounts,
        refreshHistoryCounts,
        openLineHistory,
        onHistoryVersionChosen,
    };
}
