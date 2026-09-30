/**
 * useVoDubRender — рендер одной строки и пакетный рендер, а также метаданные готового take'а (hash, duration, badge).
 */
import { ref, reactive } from "vue";
import { lineHash } from "../../shared/line_hash.js";
import { VO_DUB_API } from "../../../web/fl_common.js";

const DURATION_GREEN = 0.15;
const DURATION_AMBER = 0.40;

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

    // ── служебное состояние ─────────────────────────────────────────────
    const renderedOnce = reactive(new Set());
    const renderingKeys = reactive(new Set());
    const measuredDuration = reactive({});

    // audio_key → ?v=-токен для RU <audio>: src меняется после рендера
    // того же имени, чтобы браузер не отдал старый кэш (или 404).
    // Используется в шаблоне строки и сбрасывается из useVoDubHistory /
    // useVoDubEffects через ctx.cacheBust.
    const cacheBust = reactive({});

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

    function hasRuTake(row) {
        return row.status === "done"
            || row.status === "stale"
            || renderedOnce.has(row.audio_key);
    }

    function manuallyDone(row) {
        return Boolean(entryFor(row).manually_done);
    }

    function toggleManuallyDone(row) {
        entryFor(row).manually_done = !manuallyDone(row);
        onTextEdit(row);
    }

    // ── hash содержимого ─────────────────────────────────────────────────
    // Формула совпадает с row_hash() в nodes/vo_dub_library.py.
    async function currentContentHash(row) {
        const entry = entryFor(row);
        const speaker = row.speaker;
        const instruct = entry.instruct || "";
        const russianText = entry.russian_text || "";
        const effect = entry.effect || "";

        let instructForHash = instruct;
        if (effect) instructForHash += `\x00effect=${effect}`;
        if (entry.normalize) {
            const db = Number(entry.normalize_db ?? -20.0);
            instructForHash += `\x00normalize=${db.toFixed(1)}`;
        }
        if (entry.speed_match) instructForHash += "\x00speed=match";
        if (resolvedUseOriginal(row)) instructForHash += "\x00sample=original";

        return lineHash(speaker, instructForHash, russianText);
    }

    // ── финализация take'а ───────────────────────────────────────────────
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
            setStatus("Project root is not set.");
            return;
        }
        renderingKeys.add(row.audio_key);
        setStatus(`Rendering ${row.audio_key}...`);

        try {
            // Сбросить отложенный save: mark_rendered штампует hash по живым
            // полям, а следующий loadRows пересчитает из _dub_state.json --
            // если там старая версия, строка сразу прочтётся "stale".
            if (ctx.saveTimer?.value) clearTimeout(ctx.saveTimer.value);
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
                normalize: Boolean(entry.normalize),
                normalize_db: Number(entry.normalize_db ?? -20.0),
                speed_match: Boolean(entry.speed_match),
            });

            entry.hash = hash;
            await finalizeRuTake(row, hash);
            setStatus(`Rendered ${row.audio_key}`);
            await loadRows();
            ctx.refreshHistoryCounts?.();
        } catch (e) {
            setStatus(`Render failed for ${row.audio_key}: ${e}`);
        } finally {
            renderingKeys.delete(row.audio_key);
        }
    }

    // ── пакетный рендер ──────────────────────────────────────────────────
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
                    console.error(`[FL VODubEditor] render-all-pending failed for ${row.audio_key}`, err);
                }
                done++;
                setStatus(`Rendering ${done}/${pending.length}...`);
            }
        } finally {
            isRenderingAllPending.value = false;
        }
    }

    // ── отображение длительности ─────────────────────────────────────────
    function enDurationText(row) {
        return row.duration_s ? `EN ${row.duration_s.toFixed(1)}s` : "EN";
    }

    function durationBadge(row) {
        const measured = measuredDuration[row.audio_key] ?? row.rendered_duration_s;
        const original = row.duration_s;
        if (!hasRuTake(row) || measured == null || !original) return null;
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
        renderedOnce,
        renderingKeys,
        cacheBust,
        isRenderingAllPending,
        currentContentHash,
        finalizeRuTake,
        renderRow,
        renderAllPending,
        hasRuTake,
        manuallyDone,
        toggleManuallyDone,
        measuredDuration,
        onRuMetadata,
        durationBadge,
        enDurationText,
        resolvedUseOriginal,
        onToggleRowUseOriginal,
        onToggleUseOriginalDefault,
    };
}
