/**
 * useAudioFiles — синглтон-утилиты для аудиофайлов проекта:
 *
 *   • построение URL: enUrl / ruUrl / versionUrl / buildUrl
 *     (все пути идут через SCAN_API/audio?path=...)
 *   • кэш длительностей по URL (reactive Map + защита от параллельных замеров)
 *   • calcDelta(ref, cur) → { level, pct, pctText } — «насколько отличается
 *     от эталона»
 *
 * Один экземпляр на всё приложение: `durations` — модульный reactive-объект,
 * все компоненты видят одинаковые значения.
 */
import { reactive } from "vue";
import { SCRIPT_LIBRARY_API as SCAN_API } from "../../web/fl_common.js";

const durations = reactive({});       // url → seconds | null
const pending = new Map();             // url → Promise, дедуп параллельных замеров

const DURATION_GREEN = 0.15;
const DURATION_AMBER = 0.40;


export function useAudioFiles() {

    // ── построение URL ────────────────────────────────────────────────

    function buildUrl(absPath) {
        return `${SCAN_API}/audio?path=${encodeURIComponent(absPath)}`;
    }

    /** EN-эталон: <root>/audio_en/<audioKey>.wav */
    function enUrl(root, audioKey) {
        if (!root || !audioKey) return "";
        const r = String(root).replace(/\\/g, "/").replace(/\/$/, "");
        return buildUrl(`${r}/audio_en/${audioKey}.wav`);
    }

    /** RU-тейк: <root>/audio_ru/<audioKey>.wav (+ опциональный cache-bust) */
    function ruUrl(root, audioKey, cacheBust) {
        if (!root || !audioKey) return "";
        const r = String(root).replace(/\\/g, "/").replace(/\/$/, "");
        const u = buildUrl(`${r}/audio_ru/${audioKey}.wav`);
        return cacheBust ? `${u}&v=${cacheBust}` : u;
    }

    /** Версия: <root>/_dub_versions/<audioKey>_v<NNN>_<hash>_s<seed>.wav */
    function versionUrl(root, audioKey, version, hash, seed) {
        if (!root || !audioKey || version == null || !hash || seed == null) return "";
        const r = String(root).replace(/\\/g, "/").replace(/\/$/, "");
        const ver = String(version).padStart(3, "0");
        const file = `${audioKey}_v${ver}_${hash}_s${seed}.wav`;
        return buildUrl(`${r}/_dub_versions/${file}`);
    }

    // ── длительности ─────────────────────────────────────────────────

    function getDuration(url) {
        if (!url) return Promise.resolve(null);
        if (url in durations) return Promise.resolve(durations[url]);
        if (pending.has(url)) return pending.get(url);

        const promise = new Promise((resolve) => {
            const el = new Audio();
            let settled = false;
            const finish = (value) => {
                if (settled) return;
                settled = true;
                durations[url] = value;
                pending.delete(url);
                resolve(value);
            };
            el.addEventListener("loadedmetadata", () => finish(el.duration || null));
            el.addEventListener("error", () => finish(null));
            setTimeout(() => finish(null), 8000);
            el.preload = "metadata";
            el.src = url;
        });

        pending.set(url, promise);
        return promise;
    }

    function getCached(url) {
        if (!url) return null;
        return url in durations ? durations[url] : null;
    }

    function calcDelta(referenceS, currentS) {
        if (referenceS == null || currentS == null || referenceS <= 0) return null;
        const delta = (currentS - referenceS) / referenceS;
        const pct = Math.round(delta * 100);
        const abs = Math.abs(delta);
        const level = abs <= DURATION_GREEN ? "good" : abs <= DURATION_AMBER ? "warn" : "bad";
        return { level, pct, pctText: `${pct >= 0 ? "+" : ""}${pct}%` };
    }

    function formatSeconds(s) {
        return s == null ? "—" : `${s.toFixed(2)}s`;
    }

    function clear() {
        Object.keys(durations).forEach((k) => delete durations[k]);
        pending.clear();
    }

    return {
        durations,
        buildUrl, enUrl, ruUrl, versionUrl,
        getDuration, getCached, calcDelta, formatSeconds, clear,
    };
}
