/**
 * useVoDubRender — рендер одной строки и пакетный рендер, а также
 *                    метаданные готового take'а (hash, duration, badge).
 *
 * Отвечает за:
 *   • currentContentHash(row)  — свёртка speaker/instruct/text/effect/
 *     sample в тот же хеш, что считает nodes/vo_dub_library.py's row_hash
 *   • finalizeRuTake(row, hash) — measure + /mark_rendered + cache-bust
 *   • renderRow(row)            — одиночный рендер + stamping
 *   • renderAllPending()        — «🔁 Render pending» по всему bucket'у
 *   • hasRuTake(row)            — есть ли у строки готовый take
 *   • manuallyDone / toggleManuallyDone — ручная отметка «done»
 *   • measuredDuration / onRuMetadata — длина RU-файла, измеряется
 *     лениво через <audio loadedmetadata>
 *   • durationBadge / enDurationText — бейдж «EN 3.4s vs 4.4s RU +29%»
 *   • resolvedUseOriginal / onToggleRowUseOriginal /
 *     onToggleUseOriginalDefault — «использовать EN как sample»
 *   • renderedOnce / cacheBust / renderingKeys — служебное состояние
 *
 * Внешние зависимости через ctx:
 *   props { root, renderApi }   — входные данные
 *   rows, entryFor, onTextEdit,
 *   setStatus, loadRows, scheduleSave,
 *   useOriginalDefault          — из useVoDubState
 *
 *   Через late-bind (composables вызываются ПОЗЖЕ Render):
 *   ctx.commitEffect?.(row)     — из useVoDubEffects
 *   ctx.audioUrl?(...)          — из useVoDubPlayers
 *   ctx.ruFilePath?(row)        — из useVoDubPlayers
 *   ctx.dryFilePath?(row)       — из useVoDubPlayers
 *   ctx.rawAudioPath?(dir, key) — из useVoDubPlayers
 *
 * Экспортирует:
 *   renderedOnce, cacheBust, renderingKeys, isRenderingAllPending,
 *   currentContentHash, finalizeRuTake, renderRow, renderAllPending,
 *   hasRuTake, manuallyDone, toggleManuallyDone,
 *   measuredDuration, onRuMetadata,
 *   durationBadge, enDurationText,
 *   resolvedUseOriginal, onToggleRowUseOriginal, onToggleUseOriginalDefault,
 *   DURATION_GREEN, DURATION_AMBER
 */

import { ref, reactive } from "vue";
import { lineHash } from "../../shared/line_hash.js";
import { VO_DUB_API } from "../../../web/fl_common.js";

export function useVoDubRender(ctx) {
    const {
        props,
        rows,
        entryFor,
        onTextEdit,
        setStatus,
        loadRows,
        scheduleSave,
        useOriginalDefault,
    } = ctx;

    // ── «use original as sample» ─────────────────────────────────────────
    // У строки — override, если пользователь когда-либо трогал ЕЁ чекбокс;
    // иначе наследует project-wide default. Ключ НЕ бэкфилится значением
    // при загрузке — отсутствие ключа = «всё ещё наследует дефолт».
    function resolvedUseOriginal(row) {
        const override = entryFor(row).use_original_sample;
        return override === undefined ? useOriginalDefault.value : Boolean(override);
    }

    function onToggleRowUseOriginal(row, value) {
        entryFor(row).use_original_sample = value;
        onTextEdit(row);
    }

    function onToggleUseOriginalDefault() {
        scheduleSave();
    }

    // ── служебные множества и токены ────────────────────────────────────
    // Строки, которые редактор сам успешно рендерил в этой сессии, ДО того
    // как loadRows() перечитает бэкенд. Иначе hasRuTake(row) читал бы
    // устаревший «not_started» пару секунд после рендера.
    const renderedOnce = reactive(new Set());

    // audio_key → ?v=-токен для RU <audio>: src меняется после перерендера
    // того же имени, чтобы браузер не отдал старый кэш (или 404).
    const cacheBust = reactive({});

    // audio_key → идёт рендер? (для спиннера и блокировки двойного клика)
    const renderingKeys = reactive(new Set());

    // ── измерение длительности ───────────────────────────────────────────
    // Лениво, по одному файлу. null вместо reject — отсутствие длины не
    // повод падать всему рендеру.
    const measuredDuration = reactive({});

    function onRuMetadata(row, event) {
        measuredDuration[row.audio_key] = event.target.duration;
    }

    function measureDuration(url, timeoutMs = 8000) {
        return new Promise((resolve) => {
            const el = new Audio();
            let settled = false;
            const finish = (value) => {
                if (settled) return;
                settled = true;
                el.removeEventListener("loadedmetadata", onLoaded);
                el.removeEventListener("error", onError);
                resolve(value);
            };
            const onLoaded = () => finish(el.duration || null);
            const onError = () => finish(null);
            el.addEventListener("loadedmetadata", onLoaded);
            el.addEventListener("error", onError);
            setTimeout(() => finish(null), timeoutMs);
            el.preload = "metadata";
            el.src = url;
        });
    }

    // ── готов ли take у строки ───────────────────────────────────────────
    function hasRuTake(row) {
        return row.status === "done"
            || row.status === "stale"
            || renderedOnce.has(row.audio_key);
    }

    // ── ручная отметка «done» ────────────────────────────────────────────
    // Живёт в entry, не трогает файл и хеш. Sticky до явного снятия.
    function manuallyDone(row) {
        return Boolean(entryFor(row).manually_done);
    }

    function toggleManuallyDone(row) {
        entryFor(row).manually_done = !manuallyDone(row);
        onTextEdit(row);
    }

    // ── hash содержимого ─────────────────────────────────────────────────
    // Тот же формат, что row_hash() в nodes/vo_dub_library.py: effect и
    // «use original as sample» доклеиваются к instruct через \x00, чтобы
    // lineHash() остался строгим 3-аргументным контрактом.
    async function currentContentHash(row) {
        const entry = entryFor(row);
        const speaker = row.speaker; // уже резолвнут на бэкенде
        const instruct = entry.instruct || "";
        const russianText = entry.russian_text || "";
        const effect = entry.effect || "";

        let instructForHash = instruct;
        if (effect) instructForHash += `\x00effect=${effect}`;
        if (resolvedUseOriginal(row)) instructForHash += "\x00sample=original";

        return lineHash(speaker, instructForHash, russianText);
    }

    // ── финализация take'а ───────────────────────────────────────────────
    // Общий хвост для полного рендера и fast-path apply_effect: измерить
    // длину, сообщить бэкенду hash + duration, обновить cache-bust.
    async function finalizeRuTake(row, hash) {
        const freshCacheBust = Date.now();
        const renderedDuration = await measureDuration(
            ctx.audioUrl?.("audio_ru", row.audio_key, freshCacheBust) || "",
        );

        await fetch(`${VO_DUB_API}/mark_rendered`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                root: props.root,
                audio_key: row.audio_key,
                hash,
                duration_s: renderedDuration,
            }),
        });

        if (renderedDuration !== null) {
            measuredDuration[row.audio_key] = renderedDuration;
        }
        renderedOnce.add(row.audio_key);
        cacheBust[row.audio_key] = freshCacheBust;
    }

    // ── рендер одной строки ──────────────────────────────────────────────
    async function renderRow(row) {
        if (!props.renderApi || renderingKeys.has(row.audio_key)) return;
        if (!props.root) {
            setStatus("Project root is not set. Please set it in the project root input above.");
            return;
        }
        renderingKeys.add(row.audio_key);
        setStatus(`Rendering ${row.audio_key}...`);

        try {
            // Pending effect становится официальным: файл, который сейчас
            // запишется, будет отражать именно текущий выбор.
            ctx.commitEffect?.(row);

            // Всё, что висит в debounce, обязано лечь на диск ДО рендера:
            // mark_rendered штампует hash по живым полям, а следующий loadRows
            // пересчитает свою версию из _dub_state.json — если там старая
            // версия, строка сразу прочтётся «stale».
            clearTimeout(ctx.saveTimer);
            await ctx.flushSave?.();

            const entry = entryFor(row);
            const speaker = row.speaker;
            const instruct = entry.instruct || "";
            const russianText = entry.russian_text || "";
            const effect = entry.effect || "";
            const referenceAudioPath = resolvedUseOriginal(row)
                ? (ctx.rawAudioPath?.("audio_en", row.audio_key) || "")
                : "";
            const hash = await currentContentHash(row);
            const outputPath = ctx.ruFilePath?.(row) || "";
            const dryOutputPath = ctx.dryFilePath?.(row) || "";

            await props.renderApi.renderRow({
                audioKey: row.audio_key,
                speaker,
                instruct,
                russianText,
                effect,
                outputPath,
                dryOutputPath,
                referenceAudioPath,
            });

            entry.hash = hash;
            await finalizeRuTake(row, hash);
            setStatus(`Rendered ${row.audio_key}`);
            await loadRows();
        } catch (e) {
            setStatus(`Render failed for ${row.audio_key}: ${e}`);
        } finally {
            renderingKeys.delete(row.audio_key);
        }
    }

    // ── пакетный рендер ──────────────────────────────────────────────────
    // Один за раз, последовательно — намеренно не конкурентно, чтобы не
    // залить очередь ComfyUI десятками тяжёлых TTS-рендеров.
    const isRenderingAllPending = ref(false);

    async function renderAllPending() {
        if (!props.renderApi || isRenderingAllPending.value) return;
        const pending = rows.value.filter(
            (r) => r.status === "not_started" || r.status === "stale",
        );
        if (!pending.length) {
            setStatus("Nothing needs rendering in this bucket");
            return;
        }
        isRenderingAllPending.value = true;
        let done = 0;
        setStatus(`Rendering 0/${pending.length}...`);
        try {
            for (const row of pending) {
                try {
                    await renderRow(row);
                } catch (err) {
                    console.error(
                        `[FL CosyVoice3 VODubEditor] render-all-pending failed for ${row.audio_key}`,
                        err,
                    );
                }
                done++;
                setStatus(`Rendering ${done}/${pending.length}...`);
            }
        } finally {
            isRenderingAllPending.value = false;
        }
    }

    // ── отображение длительности ─────────────────────────────────────────
    const DURATION_GREEN = 0.15;
    const DURATION_AMBER = 0.40;

    function enDurationText(row) {
        return row.duration_s ? `EN ${row.duration_s.toFixed(1)}s` : "EN";
    }

    function durationBadge(row) {
        // measuredDuration заполняется только после первого play RU-элемента
        // (preload="none"). До этого — значение из _dub_state.json, записанное
        // самим редактором в предыдущем рендере.
        const measured = measuredDuration[row.audio_key] ?? row.rendered_duration_s;
        const original = row.duration_s;
        if (!hasRuTake(row) || measured === undefined || measured === null || !original) {
            return null;
        }
        const delta = (measured - original) / original;
        const pct = Math.round(delta * 100);
        const abs = Math.abs(delta);
        const level = abs <= DURATION_GREEN ? "good" : abs <= DURATION_AMBER ? "warn" : "bad";
        return {
            level,
            ruSeconds: `${measured.toFixed(1)}s`,
            pctText: `${pct >= 0 ? "+" : ""}${pct}%`,
        };
    }

    return {
        // служебное
        renderedOnce,
        cacheBust,
        renderingKeys,
        isRenderingAllPending,
        DURATION_GREEN,
        DURATION_AMBER,
        // hash / финализация
        currentContentHash,
        finalizeRuTake,
        // рендер
        renderRow,
        renderAllPending,
        // состояние строки
        hasRuTake,
        manuallyDone,
        toggleManuallyDone,
        // длительность
        measuredDuration,
        onRuMetadata,
        durationBadge,
        enDurationText,
        // «use original as sample»
        resolvedUseOriginal,
        onToggleRowUseOriginal,
        onToggleUseOriginalDefault,
    };
}
