/**
 * useRowOps — структурные операции над строками:
 *   • merge (drag одной строки на другую)
 *   • delete (с подтверждением)
 *   • split (разрезать по курсору)
 *   • add (пустая строка в конец)
 *   • reorganize (синхронизация per-line файлов после сдвигов позиций)
 *   • управление DOM-узлами строк (refs, scroll, focus)
 *
 * Внешние зависимости через ctx:
 *   props, rows, audioBaseName, setStatus, confirmAsync,
 *   positionByIndex, updateRowHash, loadLineFiles,   (useLineFiles)
 *   scheduleSave                                     (useScriptIO)
 */

import { ref, nextTick } from "vue"
import { SCRIPT_LIBRARY_API as SCAN_API } from "../../shared/fl_common.js"
import { freshRow } from "./useScriptParsing.js"

export function useRowOps(ctx) {
    const {
        props, rows, audioBaseName, setStatus, confirmAsync,
        positionByIndex, updateRowHash, loadLineFiles,
        scheduleSave,
    } = ctx

    // ── DOM-узлы строк ─────────────────────────────────────────────────
    const rowEls = new Map()          // row.__key -> DOM-узел корня строки
    const rowsContainerEl = ref(null) // контейнер со списком строк
    const justAddedKey = ref(null)    // подсветка только что добавленной строки

    function setRowRef(key, el) {
        if (!el) { rowEls.delete(key); return }
        rowEls.set(key, el)
    }

    async function focusNewRow(key) {
        justAddedKey.value = key
        await nextTick()
        const el = rowEls.get(key)
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        el?.querySelector(".fl-input")?.focus()
        setTimeout(() => {
            if (justAddedKey.value === key) justAddedKey.value = null
        }, 500)
    }

    // ── merge ──────────────────────────────────────────────────────────
    let dragFromIndex = null

    async function mergeRows(idxA, idxB) {
        const rowA = rows.value[idxA]
        const rowB = rows.value[idxB]
        if (!rowA || !rowB || rowA.malformed || rowB.malformed) return

        const firstIdx = Math.min(idxA, idxB)
        const secondIdx = Math.max(idxA, idxB)
        const first = rows.value[firstIdx]
        const second = rows.value[secondIdx]

        if ((first.speaker || "").trim() !== (second.speaker || "").trim()) {
            const ok = await confirmAsync({
                title: "Merge lines with different speakers?",
                message: `"${first.speaker}" and "${second.speaker}" are different speakers. `
                    + `Merge anyway? The combined line keeps "${first.speaker}".`,
                okText: "Merge",
                cancelText: "Cancel",
            })
            if (!ok) return
        }

        const secondPos = positionByIndex.value.get(secondIdx)
        const totalPositions = positionByIndex.value.size

        first.text = `${first.text} ${second.text}`.trim()
        // Пауза «после строки» — у объединённой строки берётся со ВТОРОЙ половины
        // (пауза первой была тишиной в середине — исчезает вместе с ней)
        first.pause = second.pause || ""
        rows.value.splice(secondIdx, 1)
        // Хеш — только контент, поэтому пересчёт нужен только первой строке
        updateRowHash(first)
        scheduleSave()

        if (secondPos !== undefined) {
            const moves = []
            for (let p = secondPos + 1; p < totalPositions; p++) moves.push([p, p - 1])
            reorganizeLines({ deletes: [secondPos], moves })
        }
    }

    // ── drag-and-drop для merge ────────────────────────────────────────
    function attachDragHandlers(handleEl, index) {
        if (!handleEl || handleEl.__flDragAttached) return
        handleEl.__flDragAttached = true
        handleEl.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return
            e.preventDefault()

            const rowEl = handleEl.closest(".fl-line-row-js")
            dragFromIndex = Number(rowEl?.dataset.rowIndex)
            rowEl?.classList.add("fl-row-dragging-js")

            const onMove = (ev) => {
                rowsContainerEl.value
                    ?.querySelectorAll(".fl-row-drop-target-js")
                    .forEach((el) => el.classList.remove("fl-row-drop-target-js"))
                const el = document.elementFromPoint(ev.clientX, ev.clientY)
                const targetRow = el && el.closest ? el.closest(".fl-line-row-js") : null
                if (targetRow && targetRow !== rowEl) targetRow.classList.add("fl-row-drop-target-js")
            }

            const onUp = (ev) => {
                document.removeEventListener("pointermove", onMove)
                document.removeEventListener("pointerup", onUp)
                document.removeEventListener("pointercancel", onUp)

                const el = document.elementFromPoint(ev.clientX, ev.clientY)
                const targetRow = el && el.closest ? el.closest(".fl-line-row-js") : null
                const fromIdx = dragFromIndex
                dragFromIndex = null

                rowEl?.classList.remove("fl-row-dragging-js")
                rowsContainerEl.value
                    ?.querySelectorAll(".fl-row-drop-target-js")
                    .forEach((c) => c.classList.remove("fl-row-drop-target-js"))

                if (targetRow && targetRow !== rowEl) {
                    const toIdx = Number(targetRow.dataset.rowIndex)
                    if (!Number.isNaN(toIdx)) mergeRows(fromIdx, toIdx)
                }
            }

            document.addEventListener("pointermove", onMove)
            document.addEventListener("pointerup", onUp)
            document.addEventListener("pointercancel", onUp)
        })
    }

    // ── delete ─────────────────────────────────────────────────────────
    function deleteRow(index) {
        const pos = positionByIndex.value.get(index)
        const totalPositions = positionByIndex.value.size

        // Хеш — только контент, а удаление не меняет другие строки, только позиции
        rows.value.splice(index, 1)
        scheduleSave()

        if (pos !== undefined) {
            const moves = []
            for (let p = pos + 1; p < totalPositions; p++) moves.push([p, p - 1])
            reorganizeLines({ deletes: [pos], moves })
        }
    }

    async function confirmDeleteRow(index, previewText) {
        if (previewText && previewText.trim()) {
            const ok = await confirmAsync({
                title: "Delete this line?",
                message: previewText.length > 200 ? previewText.slice(0, 200) + "…" : previewText,
                okText: "Delete",
                cancelText: "Cancel",
            })
            if (!ok) return
        }
        deleteRow(index)
    }

    // ── split ──────────────────────────────────────────────────────────
    function splitFocusedLine() {
        const el = document.activeElement
        if (!el || el.tagName !== "TEXTAREA" || !el.classList.contains("fl-textarea-js")) {
            setStatus("Click into a line's text first, place the cursor where it should split")
            return
        }

        const rowEl = el.closest(".fl-line-row-js")
        const index = rowEl ? Number(rowEl.dataset.rowIndex) : -1
        const row = index >= 0 ? rows.value[index] : null
        if (!row || row.malformed) {
            setStatus("Can't split a malformed/raw line -- fix it to plain text first")
            return
        }

        const posOfSplitRow = positionByIndex.value.get(index)
        const totalPositions = positionByIndex.value.size

        const pos = el.selectionStart
        const before = row.text.slice(0, pos).trimEnd()
        const after = row.text.slice(pos).trimStart()
        row.text = before

        // Пауза остаётся после ВТОРОЙ половины
        const newRow = freshRow({
            speaker: row.speaker,
            instruct: row.instruct,
            text: after,
            pause: row.pause || "",
            raw: "",
            malformed: false,
        })
        row.pause = ""
        rows.value.splice(index + 1, 0, newRow)

        // Обе половины изменились, остальные строки — нет
        updateRowHash(row)
        updateRowHash(newRow)
        focusNewRow(newRow.__key)
        scheduleSave()

        if (posOfSplitRow !== undefined) {
            const newPos = posOfSplitRow + 1
            const moves = []
            for (let p = totalPositions - 1; p >= newPos; p--) moves.push([p, p + 1])
            reorganizeLines({ moves })
        }
    }

    // ── add ────────────────────────────────────────────────────────────
    function addLine() {
        // В конец — никто не сдвигается, reorganize не нужен
        const newRow = freshRow({
            speaker: "",
            instruct: "",
            text: "",
            pause: "",
            raw: "",
            malformed: false,
        })
        rows.value.push(newRow)
        updateRowHash(newRow)
        focusNewRow(newRow.__key)
        scheduleSave()
    }

    // ── reorganize (переименование файлов на диске) ────────────────────
    async function reorganizeLines({ deletes = [], moves = [] } = {}) {
        if (!deletes.length && !moves.length) return
        try {
            await fetch(`${SCAN_API}/reorganize_lines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folder: props.folder,
                    base_name: audioBaseName.value,
                    deletes,
                    moves,
                }),
            })
            await loadLineFiles()
        } catch (e) {
            // Best-effort: ошибка не откатывает само редактирование,
            // только оставляет файлы, которые можно переорганизовать вручную
        }
    }

    return {
        // DOM-узлы
        rowEls,
        rowsContainerEl,
        justAddedKey,
        setRowRef,
        focusNewRow,
        // операции
        mergeRows,
        attachDragHandlers,
        deleteRow,
        confirmDeleteRow,
        splitFocusedLine,
        addLine,
        reorganizeLines,
    }
}