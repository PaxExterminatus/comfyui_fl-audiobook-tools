/**
 * usePlayback — воспроизведение, timing-манифест, mini-player, Done/Unmark.
 *
 * Внешние зависимости (приходят через ctx):
 *   props, rows, filename, selectChecked,
 *   confirmAsync, setStatus,
 *   audioFolder, audioBaseName, linesDirPath,
 *   loadLineFiles, latestFileFor, rowHasAnyTake, rowIsFresh, expectedHash,
 *   rowEls,
 *   rawTimingLines, lastTimingMtime, lastAudioFingerprint   ← объявлены в main
 *
 * Локальное состояние:
 *   activeTimingIdx, audioElRef, audioIsPlaying, mode1PlayingIdx,
 *   readyScripts, audioState — объявляются здесь.
 */

import { ref, reactive, computed, nextTick } from "vue"
import {
    joinPath, parsePauseField,
    SCRIPT_EDITOR_API as FILE_API,
    SCRIPT_LIBRARY_API as SCAN_API,
    BROWSE_API,
} from "../../shared/fl_common.js"

export function usePlayback(ctx) {
    const {
        props, rows, filename, selectChecked,
        confirmAsync, setStatus,
        audioFolder, audioBaseName, linesDirPath,
        loadLineFiles, latestFileFor, rowHasAnyTake, rowIsFresh, expectedHash,
        rowEls,
        rawTimingLines, lastTimingMtime, lastAudioFingerprint,
    } = ctx

    // ── локальное состояние ────────────────────────────────────────────
    const activeTimingIdx = ref(-1)
    const audioElRef = ref(null)
    const audioIsPlaying = ref(false)
    const mode1PlayingIdx = ref(-1)
    let mode1AudioEl = null

    const readyScripts = ref([])
    const audioState = reactive({ checking: true, best: null, mtime: null, error: null })

    // ── timing manifest ────────────────────────────────────────────────
    async function loadTiming({ silent = false } = {}) {
        const timingPath = joinPath(joinPath(audioFolder.value, "timing"), `${audioBaseName.value}.json`)
        try {
            const resp = await fetch(`${FILE_API}/read?path=${encodeURIComponent(timingPath)}`)
            const data = await resp.json()
            if (!data.exists) {
                rawTimingLines.value = null
                lastTimingMtime.value = null
                return
            }
            if (silent && data.mtime === lastTimingMtime.value) return
            const isFreshMtime = data.mtime !== lastTimingMtime.value
            lastTimingMtime.value = data.mtime

            let parsed
            try { parsed = JSON.parse(data.content) } catch (e) { rawTimingLines.value = null; return }
            rawTimingLines.value = Array.isArray(parsed.lines) ? parsed.lines : null

            // Свежий манифест → свежие per-line файлы, обновляем листинг сразу
            if (isFreshMtime) loadLineFiles()
            nextTick(syncActiveLine)
        } catch (e) {
            // Транзиентная ошибка сети — оставляем прежнее состояние
        }
    }

    function computeLineTiming(rawLines, rowsArr) {
        if (!Array.isArray(rawLines) || !rawLines.length) return null
        const rowIndexMap = []
        rowsArr.forEach((r, idx) => { if (!r.malformed) rowIndexMap.push(idx) })
        if (rowIndexMap.length !== rawLines.length) return null
        return { lines: rawLines, rowIndexMap }
    }

    const lineTiming = computed(() =>
        isCurrentlyReady.value ? computeLineTiming(rawTimingLines.value, rows.value) : null,
    )

    const currentRowToTimingIdx = computed(() => {
        const map = new Map()
        if (lineTiming.value) {
            lineTiming.value.rowIndexMap.forEach((rowIdx, timingIdx) => map.set(rowIdx, timingIdx))
        }
        return map
    })

    const timingWarningVisible = computed(() =>
        Boolean(isCurrentlyReady.value && rawTimingLines.value && rawTimingLines.value.length && !lineTiming.value),
    )

    function syncActiveLine() {
        const el = audioElRef.value
        if (!lineTiming.value || !el) {
            activeTimingIdx.value = -1
            return
        }
        const t = el.currentTime
        let idx = -1
        for (let i = 0; i < lineTiming.value.lines.length; i++) {
            if (t >= lineTiming.value.lines[i].start && t < lineTiming.value.lines[i].end) { idx = i; break }
        }
        if (idx === activeTimingIdx.value) return
        activeTimingIdx.value = idx
        if (idx >= 0 && audioIsPlaying.value) {
            const rowIdx = lineTiming.value.rowIndexMap[idx]
            const rowEl = rowIdx !== undefined ? rowEls.get(rows.value[rowIdx]?.__key) : null
            rowEl?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
    }

    // ── mode 1: последовательное воспроизведение по строкам ───────────
    function stopMode1Playback() {
        if (mode1AudioEl) {
            mode1AudioEl.pause()
            mode1AudioEl.src = ""
            mode1AudioEl = null
        }
        mode1PlayingIdx.value = -1
    }

    function playRowSequential(startIndex) {
        stopMode1Playback()
        const dir = linesDirPath.value
        const playIdx = (idx) => {
            let audioFilename = null
            while (idx < rows.value.length) {
                if (!rows.value[idx].malformed) {
                    audioFilename = latestFileFor(idx)
                    if (audioFilename) break
                }
                idx++
            }
            if (idx >= rows.value.length || !audioFilename) {
                mode1PlayingIdx.value = -1
                return
            }
            mode1PlayingIdx.value = idx
            rowEls.get(rows.value[idx]?.__key)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
            const el = new Audio(
                `${SCAN_API}/audio?path=${encodeURIComponent(joinPath(dir, audioFilename))}&v=${Date.now()}`,
            )
            mode1AudioEl = el
            el.addEventListener("ended", () => playIdx(idx + 1))
            el.play().catch((e) => setStatus(`Playback failed: ${e}`))
        }
        playIdx(startIndex)
    }

    // ── per-row / global play controls ─────────────────────────────────
    function isRowPlaying(index) {
        return isCurrentlyReady.value
            ? activeTimingIdx.value === currentRowToTimingIdx.value.get(index) && audioIsPlaying.value
            : mode1PlayingIdx.value === index
    }

    function canPlayRow(index, row) {
        return isCurrentlyReady.value
            ? currentRowToTimingIdx.value.get(index) !== undefined
            : rowHasAnyTake(index)
    }

    function onPlayClick(row, index) {
        if (!canPlayRow(index, row)) return
        if (isCurrentlyReady.value) {
            const timingIdx = currentRowToTimingIdx.value.get(index)
            const el = audioElRef.value
            if (timingIdx === undefined || !el || !lineTiming.value) return
            el.currentTime = lineTiming.value.lines[timingIdx].start
            el.play()
        } else if (mode1PlayingIdx.value === index) {
            stopMode1Playback()
        } else {
            playRowSequential(index)
        }
    }

    const isPlayingAnything = computed(() =>
        isCurrentlyReady.value ? audioIsPlaying.value : mode1PlayingIdx.value !== -1,
    )

    const canPlayGlobal = computed(() =>
        isCurrentlyReady.value
            ? Boolean(audioState.best)
            : rows.value.some((r, i) => !r.malformed && rowHasAnyTake(i)),
    )

    const globalPlayTitle = computed(() => {
        if (!canPlayGlobal.value) return "Not voiced yet -- nothing to play"
        if (isPlayingAnything.value) return "Pause"
        return isCurrentlyReady.value ? "Play the full rendered file" : "Play every voiced line in sequence"
    })

    function toggleGlobalPlayback() {
        if (!canPlayGlobal.value) return
        if (isCurrentlyReady.value) {
            const el = audioElRef.value
            if (!el) return
            if (audioIsPlaying.value) el.pause()
            else el.play()
        } else if (mode1PlayingIdx.value !== -1) {
            stopMode1Playback()
        } else {
            playRowSequential(0)
        }
    }

    // ── финальный микс (в _audio/) ─────────────────────────────────────
    async function loadAudio({ silent = false } = {}) {
        if (!silent) audioState.checking = true
        try {
            const resp = await fetch(`${BROWSE_API}?path=${encodeURIComponent(audioFolder.value)}`)
            const data = await resp.json()
            const files = Array.isArray(data.files) ? data.files : []
            const mtimes = data.file_mtimes || {}
            const needle = audioBaseName.value.toLowerCase()
            const matches = files.filter((f) => {
                const dot = f.lastIndexOf(".")
                const base = dot > 0 ? f.slice(0, dot) : f
                return base.toLowerCase().startsWith(needle)
            })
            matches.sort()
            const best = matches.length ? matches[matches.length - 1] : null
            const fingerprint = best ? `${best}::${mtimes[best] || ""}` : null

            if (silent && fingerprint === lastAudioFingerprint.value) return
            lastAudioFingerprint.value = fingerprint

            audioState.checking = false
            audioState.error = null
            audioState.best = best
            audioState.mtime = best ? (mtimes[best] || Date.now()) : null
            if (!best) { audioIsPlaying.value = false; nextTick(syncActiveLine) }
        } catch (e) {
            audioState.checking = false
            audioState.error = String(e)
        }
    }

    const deleteAudioDisabled = computed(() => !audioState.best)

    async function deleteAudio() {
        if (!audioState.best) return
        const ok = await confirmAsync({
            title: "Delete rendered audio?",
            message: `Deletes every _audio\\ file matching "${audioBaseName.value}" (currently: ${audioState.best})${isCurrentlyReady.value ? " -- this also un-marks the script as done" : ""}.`,
            okText: "Delete",
            cancelText: "Cancel",
        })
        if (!ok) return
        try {
            const resp = await fetch(`${SCAN_API}/delete_audio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folder: props.folder,
                    base_name: audioBaseName.value,
                    filename: filename.value,
                }),
            })
            const data = await resp.json()
            if (data.error) { setStatus(`Error: ${data.error}`); return }
            setStatus(`Deleted ${data.deleted.length} audio file(s)`)
            readyScripts.value = readyScripts.value.filter((f) => f !== filename.value)
            lastAudioFingerprint.value = null
            loadAudio()
        } catch (e) {
            setStatus(`Error: ${e}`)
        }
    }

    // ── Done / Unmark ──────────────────────────────────────────────────
    const isCurrentlyReady = computed(() => readyScripts.value.includes(filename.value))

    const allRowsVoiced = computed(() => {
        const indices = []
        rows.value.forEach((r, i) => { if (!r.malformed) indices.push(i) })
        return indices.length > 0 && indices.every((i) => rowIsFresh(rows.value[i], i))
    })

    const doneDisabled = computed(() => !isCurrentlyReady.value && !allRowsVoiced.value)

    const doneTitle = computed(() => (
        isCurrentlyReady.value
            ? "Marked ready to release -- click to unmark and go back to editing"
            : allRowsVoiced.value
                ? "Stitch every line into the final file and mark this script done / ready to release"
                : "Every line needs to be voiced first"
    ))

    async function toggleDone() {
        const newReady = !isCurrentlyReady.value
        if (newReady && !allRowsVoiced.value) {
            setStatus("Every line needs to be voiced before marking done")
            return
        }
        if (newReady) {
            setStatus("Stitching final file...")
            const nonMalformed = rows.value.filter((r) => !r.malformed)
            try {
                const stitchResp = await fetch(`${SCAN_API}/stitch_lines`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        folder: props.folder,
                        base_name: audioBaseName.value,
                        line_hashes: nonMalformed.map((r) => expectedHash.get(r.__key)),
                        line_texts: nonMalformed.map((r) => r.text),
                        pauses: nonMalformed.map((r) => parsePauseField(r.pause)),
                    }),
                })
                const stitchData = await stitchResp.json()
                if (stitchData.error) { setStatus(`Stitch error: ${stitchData.error}`); return }
            } catch (e) {
                setStatus(`Stitch failed: ${e}`)
                return
            }
            readyScripts.value = [...new Set([...readyScripts.value, filename.value])]
            props.checkedApi?.setChecked(filename.value, false)
            selectChecked.value = false
            setStatus("Stitched and marked done")
            lastAudioFingerprint.value = null
            lastTimingMtime.value = null
            loadAudio()
            loadTiming()
            return
        }

        const ok = await confirmAsync({
            title: "Unmark done?",
            message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
            okText: "Unmark",
            cancelText: "Cancel",
        })
        if (!ok) return
        try {
            const resp = await fetch(`${SCAN_API}/delete_audio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folder: props.folder,
                    base_name: audioBaseName.value,
                    filename: filename.value,
                }),
            })
            const data = await resp.json()
            if (data.error) { setStatus(`Error: ${data.error}`); return }
            readyScripts.value = readyScripts.value.filter((f) => f !== filename.value)
            setStatus("Unmarked -- can be edited/re-voiced again")
            lastAudioFingerprint.value = null
            loadAudio()
        } catch (e) {
            setStatus(`Error: ${e}`)
        }
    }

    return {
        rawTimingLines,
        activeTimingIdx,
        lastTimingMtime,
        audioElRef,
        loadTiming,
        computeLineTiming,
        lineTiming,
        currentRowToTimingIdx,
        timingWarningVisible,
        syncActiveLine,
        audioIsPlaying,
        mode1PlayingIdx,
        stopMode1Playback,
        playRowSequential,
        isRowPlaying,
        canPlayRow,
        onPlayClick,
        isPlayingAnything,
        canPlayGlobal,
        globalPlayTitle,
        toggleGlobalPlayback,
        readyScripts,
        audioState,
        lastAudioFingerprint,
        loadAudio,
        deleteAudioDisabled,
        deleteAudio,
        isCurrentlyReady,
        allRowsVoiced,
        doneDisabled,
        doneTitle,
        toggleDone,
    }
}
