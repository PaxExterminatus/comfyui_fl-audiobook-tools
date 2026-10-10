/**
 * useLineFiles — реестр per-line файлов на диске + хеши содержимого.
 *
 * Отвечает за:
 *   • листинг _audio/lines/<script>/ (какие файлы есть и когда изменены)
 *   • маппинг row index → position (ранг среди non-malformed)
 *   • проверку «есть ли у строки аудио» (rowHasAnyTake) и «свежее ли оно»
 *     (rowIsFresh — по content-hash)
 *   • пересчёт хешей при изменении строк или ролей
 *
 * Внешние зависимости через ctx:
 *   rows, linesDirPath,
 *   resolvedSpeakerForHash   (late-binding, из useLineCatalog)
 */

import { ref, reactive, computed } from "vue"
import { lineHash, hasExpectedFile, mostRecentAtPosition } from "../../shared/line_hash.js"
import { BROWSE_API } from "../../shared/fl_common.js"

export function useLineFiles(ctx) {
    const { rows, linesDirPath } = ctx

    // ── листинг файлов на диске ────────────────────────────────────────
    const lineFilesOnDisk = ref(new Set())
    const lineFileMtimes = ref({})

    async function loadLineFiles() {
        try {
            const resp = await fetch(`${BROWSE_API}?path=${encodeURIComponent(linesDirPath.value)}`)
            const data = await resp.json()
            lineFilesOnDisk.value = new Set(Array.isArray(data.files) ? data.files : [])
            lineFileMtimes.value = data.file_mtimes || {}
        } catch (e) {
            // Транзиентная ошибка сети — оставляем прежнее состояние
        }
    }

    // ── позиции строк ──────────────────────────────────────────────────
    // position — ранг среди non-malformed. Используется как адрес
    // per-line файла ("<position>_<hash>.wav").
    const positionByIndex = computed(() => {
        const map = new Map()
        let pos = 0
        rows.value.forEach((r, i) => {
            if (!r.malformed) { map.set(i, pos); pos++ }
        })
        return map
    })

    function latestFileFor(index) {
        const pos = positionByIndex.value.get(index)
        return pos === undefined
            ? null
            : mostRecentAtPosition(lineFilesOnDisk.value, lineFileMtimes.value, pos)
    }

    function rowHasAnyTake(index) {
        return latestFileFor(index) !== null
    }

    // ── хеши содержимого ───────────────────────────────────────────────
    // row.__key -> хеш (speaker+instruct+text), см. shared/line_hash.js.
    // Сравнивается с хешем файла в latestFileFor(index) → это и есть
    // проверка «озвучено ли то, что строка сейчас говорит».
    const expectedHash = reactive(new Map())
    const rowHashDebounce = new Map() // row.__key -> setTimeout id
    const ROW_HASH_DEBOUNCE_MS = 150

    function rowIsFresh(row, index) {
        const pos = positionByIndex.value.get(index)
        if (pos === undefined) return false
        const expected = expectedHash.get(row.__key)
        return expected !== undefined && hasExpectedFile(lineFilesOnDisk.value, pos, expected)
    }

    function updateRowHash(row) {
        if (row.malformed) return
        clearTimeout(rowHashDebounce.get(row.__key))
        rowHashDebounce.set(row.__key, setTimeout(async () => {
            rowHashDebounce.delete(row.__key)
            // late-binding: useLineCatalog ещё может быть не вызван,
            // поэтому обращаемся к ctx в момент исполнения, а не в setup.
            const speaker = ctx.resolvedSpeakerForHash(row.speaker)
            expectedHash.set(row.__key, await lineHash(speaker, row.instruct, row.text))
        }, ROW_HASH_DEBOUNCE_MS))
    }

    async function recomputeAllHashes() {
        const nonMalformed = rows.value.filter((r) => !r.malformed)
        const hashes = await Promise.all(
            nonMalformed.map((r) =>
                lineHash(ctx.resolvedSpeakerForHash(r.speaker), r.instruct, r.text),
            ),
        )
        nonMalformed.forEach((r, i) => expectedHash.set(r.__key, hashes[i]))
    }

    return {
        lineFilesOnDisk,
        lineFileMtimes,
        loadLineFiles,
        positionByIndex,
        latestFileFor,
        rowHasAnyTake,
        rowIsFresh,
        expectedHash,
        rowHashDebounce,
        ROW_HASH_DEBOUNCE_MS,
        updateRowHash,
        recomputeAllHashes,
    }
}
