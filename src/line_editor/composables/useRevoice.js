/**
 * useRevoice — re-voice одной строки и batch re-voice всех устаревших.
 *
 * Внешние зависимости через ctx:
 *   props, rows, filename,
 *   audioBaseName, linesDirPath, setStatus,
 *   positionByIndex, rowHasAnyTake, rowIsFresh, lineFilesOnDisk, loadLineFiles,
 *   resolvedSpeakerForHash,
 *   refreshHistoryCounts,
 *   flushSave
 */

import { ref, reactive, computed } from "vue"
import { lineHash, makeLineFilename } from "../../shared/line_hash.js"

export function useRevoice(ctx) {
    const {
        props, rows, filename,
        audioBaseName, linesDirPath, setStatus,
        positionByIndex, rowHasAnyTake, rowIsFresh, lineFilesOnDisk, loadLineFiles,
        resolvedSpeakerForHash,
        refreshHistoryCounts,
        flushSave,
    } = ctx

    // ── локальное состояние ────────────────────────────────────────────
    const pendingRevoiceRows = reactive(new Set())
    const isRevoicingStale = ref(false)

    // ── производные ────────────────────────────────────────────────────
    const staleRowCount = computed(() =>
        rows.value.filter((r, i) => isRowStale(r, i)).length,
    )

    const revoiceStaleTitle = computed(() =>
        staleRowCount.value > 0
            ? `Re-voice ${staleRowCount.value} line(s) whose text/speaker/instruct changed since they were last rendered (the gold 🔁 rows), one at a time`
            : "No line in this script needs re-voicing right now",
    )

    // ── предикаты ──────────────────────────────────────────────────────
    function isRowStale(row, index) {
        return !row.malformed && rowHasAnyTake(index) && !rowIsFresh(row, index)
    }

    function revoiceTitle(row, index) {
        if (pendingRevoiceRows.has(row)) return "Re-voicing..."
        if (rowHasAnyTake(index) && !rowIsFresh(row, index)) {
            return "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content"
        }
        if (rowIsFresh(row, index)) return "Re-voice just this line (uses the currently open workflow)"
        return "Not voiced yet -- click to render just this line"
    }

    // ── одиночный re-voice ─────────────────────────────────────────────
    async function revoiceRow(row, index) {
        if (pendingRevoiceRows.has(row)) return
        pendingRevoiceRows.add(row)
        setStatus("Re-voicing...")

        try {
            /*
             * `file` должен идти из текущего filename.value — closure
             * revoiceApi.revoiceLine держит filename, который был при
             * открытии, и устаревает после Prev/Next.
             * folder/baseName пиннят выход к той же папке, откуда читаем
             * per-line файлы (linesDirPath).
             * linePosition — ранг строки среди non-malformed (см. positionByIndex).
             *
             * contentHash считается здесь, клиентски, и штампуется прямо в
             * line_hashes_json вход Post-Process'а — гарантирует, что файл,
             * который сейчас запишется, будет иметь ровно тот хеш, который
             * rowIsFresh потом ищет, независимо от того, соединён ли граф.
             */
            const contentHash = await lineHash(
                resolvedSpeakerForHash(row.speaker),
                row.instruct,
                row.text,
            )

            await props.revoiceApi.revoiceLine({
                linePosition: positionByIndex.value.get(index),
                speaker: row.speaker,
                instruct: row.instruct,
                text: row.text,
                contentHash,
                file: filename.value,
                folder: props.folder,
                baseName: audioBaseName.value,
            })

            await loadLineFiles()
            await refreshHistoryCounts()

            // Диагностика: файл, по которому строка будет судиться, реально
            // есть на диске?
            const position = positionByIndex.value.get(index)
            const expectedName = makeLineFilename(position, contentHash)
            const landed = lineFilesOnDisk.value.has(expectedName)

            console.log("[FL revoice] after render:", {
                position,
                expectedFile: expectedName,
                foundOnDisk: landed,
                linesDir: linesDirPath.value,
                filesInDir: [...lineFilesOnDisk.value],
            })

            setStatus(
                landed
                    ? "Line re-voiced"
                    : `Re-voice finished but ${expectedName} is not in ${linesDirPath.value} -- see the console`,
            )
        } catch (e) {
            setStatus(`Re-voice failed: ${e.message || e}`)
        } finally {
            pendingRevoiceRows.delete(row)
            flushSave()
        }
    }

    // ── batch re-voice ─────────────────────────────────────────────────
    async function revoiceStaleRows() {
        if (isRevoicingStale.value) return

        // Снимок ROWS (не индексов) — re-voice одной строки не двигает
        // другие, но пересбор `rows` на каждой итерации мог бы выкинуть
        // строку, которую ещё не успели обработать.
        const targets = rows.value.filter((r, i) => isRowStale(r, i))
        if (!targets.length) return

        isRevoicingStale.value = true
        try {
            for (const row of targets) {
                const index = rows.value.indexOf(row)
                if (index === -1) continue
                await revoiceRow(row, index)
            }
            setStatus(`Re-voiced ${targets.length} line(s)`)
        } finally {
            isRevoicingStale.value = false
        }
    }

    return {
        pendingRevoiceRows,
        isRevoicingStale,
        staleRowCount,
        revoiceStaleTitle,
        isRowStale,
        revoiceTitle,
        revoiceRow,
        revoiceStaleRows,
    }
}
