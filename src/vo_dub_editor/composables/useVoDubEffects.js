/**
 * useVoDubEffects — Effect/Normalize/Speed для строки и диалог OutputFileDialog.
 *
 * Все три параметра применяются через /vo_dub/apply_effect к dry-копии
 * строки (или к выбранной версии в _dub_versions/) — без полного TTS-
 * перерендера. Значения хранятся в _dub_state.json и учитываются в
 * content-hash (см. row_hash на бэкенде и currentContentHash на клиенте).
 */

import { ref } from "vue";
import { VO_DUB_API } from "../../../web/fl_common.js";

export function useVoDubEffects(ctx) {
    const {
        props,
        entryFor,
        onTextEdit,
        setStatus,
        loadRows,
    } = ctx;

    // ── OutputFileDialog ─────────────────────────────────────────────────
    const outputDialogVisible = ref(false);
    const dialogRow = ref(null);

    function openOutputDialog(row) {
        dialogRow.value = row;
        outputDialogVisible.value = true;
    }

    function effectValue(row) {
        return entryFor(row).effect || "";
    }

    // ── применение к файлу ───────────────────────────────────────────────
    async function applyEffectToFile(row) {
        setStatus(`Applying settings to ${row.audio_key}...`);
        try {
            const resp = await fetch(`${VO_DUB_API}/apply_effect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    root: props.root,
                    audio_key: row.audio_key,
                    effect: entryFor(row).effect || "",
                    normalize: Boolean(entryFor(row).normalize),
                    speed: entryFor(row).speed ?? 1.0,
                    version: entryFor(row).active_version ?? null,
                }),
            });
            const data = await resp.json();
            if (data.error) {
                setStatus(`Couldn't apply settings to ${row.audio_key}: ${data.error}`);
                return;
            }

            const hash = await ctx.currentContentHash(row);
            entryFor(row).hash = hash;

            // Сбросить ?v= — <audio> в строке перечитает файл
            if (ctx.cacheBust) ctx.cacheBust[row.audio_key] = Date.now();

            await loadRows();
            ctx.refreshHistoryCounts?.();
            setStatus(`Applied settings to ${row.audio_key}`);
        } catch (e) {
            setStatus(`Couldn't apply settings to ${row.audio_key}: ${e}`);
        }
    }

    // ── диалог Apply ─────────────────────────────────────────────────────
    function onDialogApply(payload) {
        const row = dialogRow.value;
        if (!row) return;
        const entry = entryFor(row);
        entry.effect = payload.effect;
        entry.normalize = payload.normalize;
        entry.speed = payload.speed;
        onTextEdit(row);
        if (ctx.hasRuTake?.(row)) applyEffectToFile(row);
    }

    return {
        outputDialogVisible,
        dialogRow,
        openOutputDialog,
        onDialogApply,
        effectValue,
        applyEffectToFile,
    };
}
