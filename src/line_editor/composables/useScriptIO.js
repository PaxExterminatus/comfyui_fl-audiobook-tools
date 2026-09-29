/**
 * useScriptIO — I/O: автосохранение, загрузка, переключение скриптов.
 *
 * Отвечает за:
 *   • scheduleSave / flushSave  — дебаунс записи на диск
 *   • loadFromDisk              — чтение и парсинг, включая polling-режим
 *   • switchToFile              — Prev/Next без переоткрытия компонента
 *   • close                     — финализация и очистка таймеров
 *
 * Внешние зависимости через ctx:
 *   props, filename, rows, selectChecked,
 *   fullPath, setStatus,
 *   rawTimingLines, lastTimingMtime, lastAudioFingerprint,   (refs из main)
 *   recomputeAllHashes,                                       (useLineFiles)
 *   loadAudio, loadTiming,                                    (usePlayback)
 *   SAVE_DEBOUNCE_MS, EDIT_QUIET_MS
 */

import { ref } from "vue"
import { SCRIPT_EDITOR_API as FILE_API } from "../../../web/fl_common.js"
import { parseScript, serializeRows } from "./useScriptParsing.js"

export function useScriptIO(ctx) {
    const {
        props, filename, rows, selectChecked,
        fullPath, setStatus,
        rawTimingLines, lastTimingMtime, lastAudioFingerprint,
        recomputeAllHashes,
        loadAudio, loadTiming,
        SAVE_DEBOUNCE_MS, EDIT_QUIET_MS,
    } = ctx

    // ── внутреннее состояние ───────────────────────────────────────────
    const lastSavedText = ref(null)
    const lastLocalEditAt = ref(0)
    const saveTimer = ref(null)
    const closed = ref(false)

    // ── таймеры опроса — разделяются с main ─────────────────────────────
    const pollTimer = ref(null)
    const audioPollTimer = ref(null)
    const timingPollTimer = ref(null)

    // ── автосохранение ─────────────────────────────────────────────────
    function scheduleSave() {
        lastLocalEditAt.value = Date.now()
        if (saveTimer.value) clearTimeout(saveTimer.value)
        saveTimer.value = setTimeout(flushSave, SAVE_DEBOUNCE_MS)
    }

    async function flushSave() {
        const text = serializeRows(rows.value)
        if (text === lastSavedText.value) return
        try {
            const resp = await fetch(`${FILE_API}/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: fullPath.value, content: text }),
            })
            const data = await resp.json()
            if (data.error) { setStatus(`Save error: ${data.error}`); return }
            lastSavedText.value = text
            setStatus(`Saved ${new Date().toLocaleTimeString()}`)
        } catch (e) {
            setStatus(`Save failed: ${e}`)
        }
    }

    // ── загрузка с диска ───────────────────────────────────────────────
    async function loadFromDisk({ isPoll = false } = {}) {
        try {
            const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(fullPath.value)}`)
            const data = await resp.json()
            if (data.error) { setStatus(`Read error: ${data.error}`); return }

            if (!data.exists) {
                if (!isPoll) {
                    rows.value = []
                    lastSavedText.value = ""
                    setStatus("File does not exist yet (will be created on first edit)")
                }
                return
            }

            // Не перезагружаем во время активного редактирования
            if (isPoll && Date.now() - lastLocalEditAt.value < EDIT_QUIET_MS) return
            // Ничего не изменилось — не дёргаем реактивность
            if (data.content === lastSavedText.value) return

            rows.value = parseScript(data.content)
            lastSavedText.value = data.content
            recomputeAllHashes()
            if (!isPoll) setStatus(`Loaded ${rows.value.length} line(s)`)
        } catch (e) {
            setStatus(`Read failed: ${e}`)
        }
    }

    // ── переключение на другой скрипт (Prev/Next) ─────────────────────
    async function switchToFile(newFilename) {
        if (!newFilename || newFilename === filename.value || closed.value) return

        // Сбросить отложенный save и записать актуальное состояние
        if (saveTimer.value) {
            clearTimeout(saveTimer.value)
            saveTimer.value = null
            await flushSave()
        }

        filename.value = newFilename

        // Сброс кэшей, привязанных к прошлому скрипту
        lastAudioFingerprint.value = null
        rawTimingLines.value = null
        lastTimingMtime.value = null

        rows.value = []
        lastSavedText.value = null
        lastLocalEditAt.value = 0
        selectChecked.value = props.checkedApi
            ? props.checkedApi.isChecked(newFilename)
            : false

        setStatus("Loading...")
        await loadFromDisk()
        loadAudio()
        loadTiming()
    }

    // ── закрытие ──────────────────────────────────────────────────────
    function close() {
        if (closed.value) return
        closed.value = true

        // Дописать несохранённое перед выходом
        if (saveTimer.value) {
            clearTimeout(saveTimer.value)
            flushSave()
        }

        if (pollTimer.value) clearInterval(pollTimer.value)
        if (audioPollTimer.value) clearInterval(audioPollTimer.value)
        if (timingPollTimer.value) clearInterval(timingPollTimer.value)

        props.onClose()
    }

    return {
        // состояние
        lastSavedText,
        lastLocalEditAt,
        saveTimer,
        pollTimer,
        audioPollTimer,
        timingPollTimer,
        closed,
        // операции
        scheduleSave,
        flushSave,
        loadFromDisk,
        switchToFile,
        close,
    }
}