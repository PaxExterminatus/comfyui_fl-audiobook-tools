/**
 * useDialogs — три диалога редактора строк:
 *   • InstructPickerDialog  — выбор instruct-фразы
 *   • SpeakerPickerDialog   — выбор пресета-спикера для роли
 *   • LineHistoryDialog     — история версий реплики
 *
 * Внешние зависимости через ctx:
 *   props, rows, audioBaseName, positionByIndex, setStatus,
 *   updateRowHash, recomputeAllHashes, loadLineFiles,
 *   scheduleSave,
 *   roleEntryFor, resolveSpeakerFile, saveRolesJson, notifyRoleSpeakerChanged,
 *   instructCategories, instructCategoriesPath,
 *   SAVE_DEBOUNCE_MS
 */

import { ref, reactive, computed } from "vue"
import { saveInstructPhrase } from "../../shared/instruct_library.js"
import {
    SCRIPT_EDITOR_API as FILE_API,
    SCRIPT_LIBRARY_API as SCAN_API,
} from "../../../web/fl_common.js"

export function useDialogs(ctx) {
    const {
        props, rows, audioBaseName, positionByIndex, setStatus,
        updateRowHash, recomputeAllHashes, loadLineFiles,
        scheduleSave,
        roleEntryFor, resolveSpeakerFile, saveRolesJson, notifyRoleSpeakerChanged,
        instructCategories, instructCategoriesPath,
        SAVE_DEBOUNCE_MS,
    } = ctx

    // ──────────────────────────────────────────────────────────────────
    // 1. InstructPicker
    // ──────────────────────────────────────────────────────────────────
    const instructPickerVisible = ref(false)
    const instructPickerRow = ref(null)

    function openInstructPicker(row) {
        instructPickerRow.value = row
        instructPickerVisible.value = true
    }

    function onInstructPicked(example) {
        const row = instructPickerRow.value
        if (!row) return
        row.__prevInstruct = row.instruct
        row.instruct = example
        onInstructInput(row)
    }

    function undoInstructTitle(row) {
        return row.__prevInstruct !== undefined
            ? `Restore previous instruct: "${row.__prevInstruct}"`
            : "No previous instruct to restore"
    }

    function undoInstruct(row) {
        if (row.__prevInstruct === undefined) return
        const current = row.instruct
        row.instruct = row.__prevInstruct
        row.__prevInstruct = current
        onInstructInput(row)
    }

    // Кэш: example phrase -> category title. Строится один раз при
    // изменении instructCategories, чтобы не сканировать на каждый рендер.
    const instructCategoryByPhrase = computed(() => {
        const map = new Map()
        for (const c of instructCategories.value) {
            for (const ex of c.examples || []) {
                map.set(ex.trim(), c.title)
            }
        }
        return map
    })

    function instructNoteFor(row) {
        return instructCategoryByPhrase.value.get(row.instruct.trim()) || null
    }

    // Дебаунс записи в instruct-библиотеку — на каждую строку свой таймер
    const instructLibrarySaveDebounce = new Map() // row.__key -> setTimeout id

    function scheduleInstructLibrarySave(row) {
        clearTimeout(instructLibrarySaveDebounce.get(row.__key))
        instructLibrarySaveDebounce.set(row.__key, setTimeout(async () => {
            instructLibrarySaveDebounce.delete(row.__key)
            const updated = await saveInstructPhrase(
                FILE_API,
                instructCategoriesPath.value,
                row.instruct,
            )
            if (updated) instructCategories.value = updated
        }, SAVE_DEBOUNCE_MS))
    }

    function onInstructInput(row) {
        updateRowHash(row)
        scheduleSave()
        scheduleInstructLibrarySave(row)
    }

    // ──────────────────────────────────────────────────────────────────
    // 2. SpeakerPicker
    // ──────────────────────────────────────────────────────────────────
    const speakerPickerVisible = ref(false)
    const speakerPickerRow = ref(null)

    function openSpeakerPicker(row) {
        speakerPickerRow.value = row
        speakerPickerVisible.value = true
    }

    async function onSpeakerPicked(preset) {
        const row = speakerPickerRow.value
        if (!row) return
        await onSpeakerFileRecast(row, preset)
    }

    async function onSpeakerFileRecast(row, newPreset) {
        const entry = roleEntryFor(row)
        if (!entry) return
        entry.speaker = newPreset
        // Мутация существующего элемента roleEntries, а не переприсваивание
        // roleEntries.value — поэтому watch(roleEntries, ...) не сработает,
        // нужен явный recompute.
        recomputeAllHashes()
        const ok = await saveRolesJson()
        if (ok) {
            setStatus(`"${entry.code}" now uses "${newPreset}" for the whole play`)
            await notifyRoleSpeakerChanged(entry.code)
        }
    }

    function speakerFileTitle(row) {
        const entry = roleEntryFor(row)
        const file = resolveSpeakerFile(row.speaker)
        if (entry) {
            return `Change "${entry.code}"'s speaker for the whole play (currently ${file || "unset"})`
        }
        if (file) {
            return `"${row.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it`
        }
        return "No speaker set on this line yet"
    }

    // ──────────────────────────────────────────────────────────────────
    // 3. LineHistory
    // ──────────────────────────────────────────────────────────────────
    const historyVisible = ref(false)
    const historyRow = ref(null)
    const historyVersions = ref([])
    const historyChosenVersion = ref(null)
    const historyCounts = reactive(new Map())

    async function refreshHistoryCounts() {
        try {
            const resp = await fetch(
                `${SCAN_API}/line_history/counts?folder=${encodeURIComponent(props.folder)}&base_name=${encodeURIComponent(audioBaseName.value)}`,
            )
            const data = await resp.json()
            if (data && !data.error) {
                historyCounts.clear()
                for (const [pos, count] of Object.entries(data)) {
                    historyCounts.set(Number(pos), count)
                }
            }
        } catch (e) {
            console.error("[FL history] couldn't load version counts", e)
        }
    }

    async function openLineHistory(row, index) {
        historyRow.value = row
        const position = positionByIndex.value.get(index)
        try {
            const resp = await fetch(
                `${SCAN_API}/line_history?folder=${encodeURIComponent(props.folder)}&base_name=${encodeURIComponent(audioBaseName.value)}&position=${position}`,
            )
            const data = await resp.json()
            historyVersions.value = data.versions || []
            historyChosenVersion.value = data.chosen_version ?? null
        } catch (e) {
            console.error("[FL history] couldn't load line history", e)
            historyVersions.value = []
            historyChosenVersion.value = null
        }
        historyVisible.value = true
    }

    async function onHistoryVersionChosen(version) {
        const row = historyRow.value
        if (!row) return
        const index = rows.value.indexOf(row)
        const position = positionByIndex.value.get(index)
        try {
            await fetch(`${SCAN_API}/line_history/choose`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folder: props.folder,
                    base_name: audioBaseName.value,
                    position,
                    version,
                }),
            })
            setStatus(`Line switched to version ${version}`)
            await loadLineFiles()
        } catch (e) {
            setStatus(`Couldn't switch version: ${e.message || e}`)
        }
    }

    return {
        // InstructPicker
        instructPickerVisible,
        instructPickerRow,
        openInstructPicker,
        onInstructPicked,
        undoInstructTitle,
        undoInstruct,
        instructCategoryByPhrase,
        instructNoteFor,
        instructLibrarySaveDebounce,
        scheduleInstructLibrarySave,
        onInstructInput,
        // SpeakerPicker
        speakerPickerVisible,
        speakerPickerRow,
        openSpeakerPicker,
        onSpeakerPicked,
        onSpeakerFileRecast,
        speakerFileTitle,
        // LineHistory
        historyVisible,
        historyRow,
        historyVersions,
        historyChosenVersion,
        historyCounts,
        refreshHistoryCounts,
        openLineHistory,
        onHistoryVersionChosen,
    }
}
