/**
 * useVoDubPlayers — аудио-плееры: EN и RU, «Play both», sequential
 *                    playback, кэш-бастинг.
 *
 * Отвечает за:
 *   • enAudioEls / ruAudioEls — Map DOM-узлов <audio> по audio_key
 *   • setEnAudioRef / setRuAudioRef — :ref-колбэки для шаблона;
 *     setRuAudioRef ещё и подключает createEffectPreview
 *   • audioUrl / rawAudioPath / ruFilePath / dryFilePath — построение URL
 *   • dualPlayingRows / dualLoadingRows / playBoth — «Play both»
 *   • onTrackPaused — сброс «both playing» + прерывание sequential-run
 *   • sequentialPlayingKey / stopSequentialPlayback /
 *     playSequentialFrom / toggleSequentialPlayback — «Play in order»
 *   • rowEls / setRowRef — Map корневых DOM-узлов строк для scrollIntoView
 *
 * Внешние зависимости через ctx:
 *   props { root }              — корень проекта для построения путей
 *   pagedRows                   — из useVoDubState (sequential scoped на
 *                                 текущую страницу)
 *   effectValue                 — из useVoDubEffects
 *   effectPreviews              — shared Map из main (наполняется здесь,
 *                                 читается в useVoDubEffects)
 *   hasRuTake                   — из useVoDubRender (через ctx, потому
 *                                 что Render идёт позже)
 *
 * Экспортирует:
 *   rawAudioPath, audioUrl, ruFilePath, dryFilePath,
 *   setEnAudioRef, setRuAudioRef,
 *   dualPlayingRows, dualLoadingRows, playBoth, onTrackPaused,
 *   sequentialPlayingKey, stopSequentialPlayback,
 *   playSequentialFrom, toggleSequentialPlayback,
 *   rowEls, setRowRef
 */

import { ref, reactive } from "vue";
import { guardAgainstUnbufferedPlay, waitUntilBuffered } from "../../shared/audio_buffer_guard.js";
import { createEffectPreview } from "../effect_preview.js";
import { joinPath, SCRIPT_LIBRARY_API as SCAN_API } from "../../shared/fl_common.js";

export function useVoDubPlayers(ctx) {
    const {
        props,
        pagedRows,
        effectValue,
        effectPreviews,
        // hasRuTake — через ctx.hasRuTake?.() в момент вызова (Render позже)
    } = ctx;

    // ── построение путей ─────────────────────────────────────────────────
    function rawAudioPath(dir, audioKey) {
        return joinPath(joinPath(props.root, dir), `${audioKey}.wav`);
    }

    function audioUrl(dir, audioKey, cacheBust) {
        const url = `${SCAN_API}/audio?path=${encodeURIComponent(rawAudioPath(dir, audioKey))}`;
        // ?v= добавлен только после рендера — браузер иначе может отдать
        // старый кэш по тому же имени (включая закэшированный 404).
        return cacheBust ? `${url}&v=${cacheBust}` : url;
    }

    function ruFilePath(row) {
        return rawAudioPath("audio_ru", row.audio_key);
    }

    function dryFilePath(row) {
        return rawAudioPath("_dub_dry", row.audio_key);
    }

    // ── реестр DOM-элементов ─────────────────────────────────────────────
    const enAudioEls = new Map(); // audio_key → EN <audio>
    const ruAudioEls = new Map(); // audio_key → RU <audio>

    function setEnAudioRef(key, el) {
        if (!el) { enAudioEls.delete(key); return; }
        enAudioEls.set(key, el);
        guardAgainstUnbufferedPlay(el);
    }

    function setRuAudioRef(row, el) {
        const key = row.audio_key;
        if (!el) {
            ruAudioEls.delete(key);
            effectPreviews.delete(key);
            return;
        }
        ruAudioEls.set(key, el);
        guardAgainstUnbufferedPlay(el);
        // createEffectPreview оборачивает createMediaElementSource —
        // вызвать можно ОДИН раз на элемент. Поэтому создаём здесь и
        // сносим при размонтировании (пагинация/фильтр).
        const preview = createEffectPreview(el);
        effectPreviews.set(key, preview);
        preview.setEffect(effectValue(row));
    }

    // ── Play both ────────────────────────────────────────────────────────
    const dualPlayingRows = reactive(new Set());
    const dualLoadingRows = reactive(new Set());

    function onTrackPaused(row, side) {
        dualPlayingRows.delete(row.audio_key);
        // Пауза RU во время sequential-run'а = прерывание всего прогона.
        // (Сравниваем с ключом до того, как его очистит stopSequentialPlayback.)
        if (side === "ru" && sequentialPlayingKey.value === row.audio_key) {
            const el = ruAudioEls.get(row.audio_key);
            if (el && !el.ended) stopSequentialPlayback();
        }
    }

    async function playBoth(row) {
        const en = enAudioEls.get(row.audio_key);
        const ru = ruAudioEls.get(row.audio_key);
        if (!en || !ru) return;

        // Повторный клик = остановить оба.
        if (dualPlayingRows.has(row.audio_key) || dualLoadingRows.has(row.audio_key)) {
            dualLoadingRows.delete(row.audio_key);
            dualPlayingRows.delete(row.audio_key);
            en.pause();
            ru.pause();
            return;
        }

        en.pause();
        ru.pause();
        en.currentTime = 0;
        ru.currentTime = 0;

        dualLoadingRows.add(row.audio_key);
        await Promise.all([waitUntilBuffered(en), waitUntilBuffered(ru)]);
        dualLoadingRows.delete(row.audio_key);

        // Строку могли выкинуть пагинацией, пока грузились.
        if (!enAudioEls.has(row.audio_key)) return;

        // currentTime переставляем ПОСЛЕ буферизации: если src только что
        // сменился (bump cache-buster), reset до метаданных может не сработать.
        en.currentTime = 0;
        ru.currentTime = 0;
        dualPlayingRows.add(row.audio_key);
        en.play().catch(() => {});
        ru.play().catch(() => {});
    }

    // ── Sequential playback ──────────────────────────────────────────────
    // Играет по одному RU-take за раз, автоматически переходит к следующей
    // строке с take'ом. Scoped на текущую страницу: строки вне её даже не
    // смонтированы, играть нечего.
    const sequentialPlayingKey = ref(null);
    let sequentialEndedListener = null; // {el, fn} — чтобы чисто снять listener

    function stopSequentialPlayback() {
        if (sequentialEndedListener) {
            sequentialEndedListener.el.removeEventListener("ended", sequentialEndedListener.fn);
            sequentialEndedListener = null;
        }
        // Сбрасываем флаг ДО pause(): pause() синхронно шлёт `pause`,
        // onTrackPaused увидит флаг и не вызовет нас рекурсивно.
        const key = sequentialPlayingKey.value;
        sequentialPlayingKey.value = null;
        if (key) ruAudioEls.get(key)?.pause();
    }

    async function playSequentialFrom(startIndex) {
        stopSequentialPlayback();
        const list = pagedRows.value;

        // Пропускаем строки без take.
        let idx = startIndex;
        while (idx < list.length && !ctx.hasRuTake?.(list[idx])) idx++;
        if (idx >= list.length) return;

        const row = list[idx];
        const el = ruAudioEls.get(row.audio_key);
        if (!el) return;

        sequentialPlayingKey.value = row.audio_key;
        rowEls.get(row.audio_key)?.scrollIntoView({ behavior: "smooth", block: "nearest" });

        await waitUntilBuffered(el);
        // Могли остановить (или строку выкинули) пока грузилось.
        if (sequentialPlayingKey.value !== row.audio_key) return;

        const onEnded = () => {
            el.removeEventListener("ended", onEnded);
            sequentialEndedListener = null;
            playSequentialFrom(idx + 1);
        };
        sequentialEndedListener = { el, fn: onEnded };
        el.addEventListener("ended", onEnded);
        el.currentTime = 0;
        el.play().catch(() => {});
    }

    function toggleSequentialPlayback() {
        if (sequentialPlayingKey.value) stopSequentialPlayback();
        else playSequentialFrom(0);
    }

    // ── корневые DOM-узлы строк ──────────────────────────────────────────
    // Используются только для scrollIntoView в sequential-run'е.
    const rowEls = new Map();
    function setRowRef(key, el) {
        if (!el) { rowEls.delete(key); return; }
        rowEls.set(key, el);
    }

    return {
        rawAudioPath,
        audioUrl,
        ruFilePath,
        dryFilePath,
        setEnAudioRef,
        setRuAudioRef,
        dualPlayingRows,
        dualLoadingRows,
        playBoth,
        onTrackPaused,
        sequentialPlayingKey,
        stopSequentialPlayback,
        playSequentialFrom,
        toggleSequentialPlayback,
        rowEls,
        setRowRef,
    };
}
