/**
 * useRowHelpers — мелкие хелперы строк: пауза, счётчик по ролям, применение instruct к одноимённым ролям, Prev/Next-навигация по скриптам.
 */

import { computed } from "vue"
import { parsePauseField, DEFAULT_LINE_GAP_S } from "../../../web/fl_common.js"

export function useRowHelpers(ctx) {
    const {
        rows, filename, setStatus,
        scriptList,
        updateRowHash,
        scheduleSave, switchToFile,
    } = ctx

    // ──────────────────────────────────────────────────────────────────
    // Пауза после строки
    // ──────────────────────────────────────────────────────────────────

    // Индекс последней non-malformed строки. -1 если таких нет.
    const lastRowIndex = computed(() => {
        let last = -1
        rows.value.forEach((r, i) => { if (!r.malformed) last = i })
        return last
    })

    // Что показывать в placeholder, когда поле пустое:
    // последняя строка держит 0, остальные — дефолт между строками.
    function pauseDefaultFor(index) {
        return index === lastRowIndex.value ? 0 : DEFAULT_LINE_GAP_S
    }

    // Что-то набрано, но parsePauseField не может прочитать.
    // Строка всё равно рендерится — просто предупреждение, не ошибка.
    function pauseUnreadable(row) {
        return Boolean(row.pause) && parsePauseField(row.pause) === null
    }

    function pauseTitle(row, index) {
        const parsed = parsePauseField(row.pause)
        if (row.pause && parsed === null) {
            return `"${row.pause}" isn't a pause this can read -- expected seconds between 0 and 10 (e.g. 1.5). Falling back to ${pauseDefaultFor(index)}s.`
        }
        if (parsed !== null) {
            return parsed === 0
                ? "No pause after this line -- the next one comes in on top of it (an interruption)"
                : `Hold ${parsed}s of silence after this line`
        }
        return `Pause after this line, in seconds. Empty = ${pauseDefaultFor(index)}s`
            + (index === lastRowIndex.value
                ? " (nothing held after the last line)"
                : " (the default between lines)")
    }

    // ──────────────────────────────────────────────────────────────────
    // Счётчик по ролям (memoized)
    // ──────────────────────────────────────────────────────────────────

    // code -> сколько non-malformed строк в ЭТОМ скрипте используют эту роль.
    // Кэш, потому что шаблон вызывает это на каждую строку на каждом рендере.
    const roleCountByCode = computed(() => {
        const counts = new Map()
        for (const r of rows.value) {
            if (r.malformed) continue
            const code = (r.speaker || "").trim()
            if (!code) continue
            counts.set(code, (counts.get(code) || 0) + 1)
        }
        return counts
    })

    function sameRoleCount(row) {
        const code = (row.speaker || "").trim()
        if (!code) return 0
        const total = roleCountByCode.value.get(code) || 0
        return total > 0 ? total - 1 : 0
    }

    function applyInstructTitle(row) {
        const count = sameRoleCount(row)
        return count > 0
            ? `Apply this instruct to every other "${row.speaker.trim()}" line in this script (${count})`
            : "No other lines in this script use this speaker"
    }

    function applyInstructToSameRole(row) {
        const count = sameRoleCount(row)
        if (!count) return
        const code = row.speaker.trim()
        rows.value.forEach((r) => {
            if (r !== row && !r.malformed && (r.speaker || "").trim() === code) {
                r.instruct = row.instruct
                updateRowHash(r)
            }
        })
        scheduleSave()
        setStatus(`Applied instruct to ${count} other "${code}" line(s) in this script`)
    }

    // ──────────────────────────────────────────────────────────────────
    // Prev/Next по списку скриптов
    // ──────────────────────────────────────────────────────────────────

    const navIdx = computed(() => scriptList.value.indexOf(filename.value))

    const prevDisabled = computed(() => !(navIdx.value > 0))

    const nextDisabled = computed(() =>
        !(navIdx.value >= 0 && navIdx.value < scriptList.value.length - 1),
    )

    function goPrev() {
        if (navIdx.value > 0) switchToFile(scriptList.value[navIdx.value - 1])
    }

    function goNext() {
        if (navIdx.value >= 0 && navIdx.value < scriptList.value.length - 1) {
            switchToFile(scriptList.value[navIdx.value + 1])
        }
    }

    return {
        lastRowIndex,
        pauseDefaultFor,
        pauseUnreadable,
        pauseTitle,
        roleCountByCode,
        sameRoleCount,
        applyInstructTitle,
        applyInstructToSameRole,
        navIdx,
        prevDisabled,
        nextDisabled,
        goPrev,
        goNext,
    }
}
