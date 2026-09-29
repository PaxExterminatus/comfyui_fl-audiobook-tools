/**
 * useVoDubEffects — эффекты (radio / phone / muffled / ...) и диалог
 *                    OutputFileDialog.
 *
 * Отвечает за:
 *   • EFFECT_OPTIONS — список доступных эффектов (дублирует реестр
 *     nodes/_audio_effects.py; редактор сам эффект не применяет — только
 *     передаёт имя в renderRow/apply_effect)
 *   • previewEffect  — pending-выбор эффекта: мгновенно применяется к
 *     RU-элементу для прослушивания, но в _dub_state.json попадёт
 *     только после commitEffect()
 *   • effectValue / effectIsDirty / onEffectPicked — чтение/запись
 *     pending-выбора и мгновенная перерисовка превью
 *   • commitEffect / saveEffect — фиксация выбора + мгновенная
 *     переработка файла (applyEffectToFile) без TTS
 *   • applyEffectToFile — быстрый путь: переработать dry-копию с новым
 *     эффектом через бэкенд /vo_dub/apply_effect
 *   • OutputFileDialog — openOutputDialog / onDialogApply
 *
 * Внешние зависимости через ctx:
 *   props { root }              — для apply_effect endpoint
 *   entryFor, onTextEdit, setStatus, loadRows  — из useVoDubState
 *   effectPreviews              — shared Map из главного файла (создаётся
 *                                 в useVoDubPlayers при setRuAudioRef)
 *   hasRuTake                   — из useVoDubRender (late-binding)
 *   currentContentHash          — из useVoDubRender (late-binding)
 *   finalizeRuTake              — из useVoDubRender (late-binding)
 *
 * Late-binding для hasRuTake, currentContentHash и finalizeRuTake — потому
 * что useVoDubRender вызывается ПОСЛЕ этого composable, и сам вызывает
 * effectValue / commitEffect. Деструктуринг замкнул бы цикл в setup.
 */

import { ref, reactive } from "vue";
import { VO_DUB_API } from "../../../web/fl_common.js";

export function useVoDubEffects(ctx) {
    const {
        props,
        entryFor,
        onTextEdit,
        setStatus,
        loadRows,
        effectPreviews,   // shared Map из main
        // hasRuTake — через ctx.hasRuTake?.(row) в момент вызова (Render позже)
    } = ctx;

    // ── список эффектов ──────────────────────────────────────────────────
    // Дублирует nodes/_audio_effects.py EFFECTS registry — при добавлении
    // нового эффекта на бэкенде, добавь и здесь.
    const EFFECT_OPTIONS = [
        { value: "", label: "No effect" },
        { value: "radio", label: "📻 Radio" },
        { value: "phone", label: "📞 Phone" },
        { value: "muffled", label: "🤫 Muffled" },
        { value: "radio_dry", label: "📻 Radio (no static)" },
        { value: "intercom", label: "🔊 Intercom" },
        { value: "suit", label: "🧑‍🚀 Suit" },
    ];

    // ── pending-выбор ────────────────────────────────────────────────────
    // audio_key → pending effect value, или undefined, если в этой сессии
    // пользователь поле не трогал. Хранится отдельно от stateRows, чтобы
    // «просто попробовать эффект» не записывался в _dub_state.json.
    const previewEffect = reactive({});

    function effectValue(row) {
        const pending = previewEffect[row.audio_key];
        return pending !== undefined ? pending : (entryFor(row).effect || "");
    }

    function effectIsDirty(row) {
        const pending = previewEffect[row.audio_key];
        return pending !== undefined && pending !== (entryFor(row).effect || "");
    }

    function onEffectPicked(row, value) {
        previewEffect[row.audio_key] = value;
        // Мгновенно применяем превью к текущему <audio>-элементу, если он
        // смонтирован. Map — shared, из useVoDubPlayers.
        effectPreviews.get(row.audio_key)?.setEffect(value);
    }

    // ── фиксация выбора ──────────────────────────────────────────────────
    // Фолдит pending в сохранённый entry. Зовётся и явной кнопкой Save,
    // и renderRow() — рендер отражает именно текущий выбор.
    function commitEffect(row) {
        if (previewEffect[row.audio_key] !== undefined) {
            entryFor(row).effect = previewEffect[row.audio_key];
            delete previewEffect[row.audio_key];
        }
    }

    // Сохранить в _dub_state.json; если take уже есть — переработать файл
    // сразу (applyEffectToFile), без TTS-синтеза.
    function saveEffect(row) {
        commitEffect(row);
        onTextEdit(row);
        if (ctx.hasRuTake?.(row)) applyEffectToFile(row);
    }

    // ── быстрая переработка файла ────────────────────────────────────────
    // Перерабатывает dry-копию строки с новым эффектом — без TTS-синтеза,
    // без полного прогона графа, только лёгкий вызов бэкенда (см.
    // nodes/vo_dub_library.py's /vo_dub/apply_effect). Доступен только когда
    // dry-take уже существует (был хотя бы один рендер).
    async function applyEffectToFile(row) {
        setStatus(`Applying effect to ${row.audio_key}...`);
        try {
            const resp = await fetch(`${VO_DUB_API}/apply_effect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    root: props.root,
                    audio_key: row.audio_key,
                    effect: entryFor(row).effect || "",
                }),
            });
            const data = await resp.json();
            if (data.error) {
                setStatus(`Couldn't apply effect to ${row.audio_key}: ${data.error}`);
                return;
            }
            // Late-binding: useVoDubRender ещё может быть не вызван.
            const hash = await ctx.currentContentHash(row);
            entryFor(row).hash = hash;
            await ctx.finalizeRuTake(row, hash);
            setStatus(`Applied effect to ${row.audio_key}`);
            await loadRows();
        } catch (e) {
            setStatus(`Couldn't apply effect to ${row.audio_key}: ${e}`);
        }
    }

    // ── OutputFileDialog ─────────────────────────────────────────────────
    // Отдельный диалог для редактирования effect / normalize / speed
    // (заменил inline-dropdown эффекта).
    const outputDialogVisible = ref(false);
    const dialogRow = ref(null);

    function openOutputDialog(row) {
        dialogRow.value = row;
        outputDialogVisible.value = true;
    }

    function onDialogApply(payload) {
        const row = dialogRow.value;
        if (!row) return;
        const entry = entryFor(row);
        entry.effect = payload.effect;
        entry.normalize = payload.normalize;
        entry.speed = payload.speed;
        // Персистим через onTextEdit (запланирует save)
        onTextEdit(row);
        // Если файл уже есть — переработать его сразу с новыми настройками
        if (ctx.hasRuTake?.(row)) applyEffectToFile(row);
    }

    return {
        EFFECT_OPTIONS,
        previewEffect,
        effectValue,
        effectIsDirty,
        onEffectPicked,
        commitEffect,
        saveEffect,
        applyEffectToFile,
        outputDialogVisible,
        dialogRow,
        openOutputDialog,
        onDialogApply,
    };
}
