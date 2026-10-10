/**
 * useLineCatalog — каталог проекта: роли, instruct-категории, пресеты,
 * список скриптов, готовые скрипты. Плюс сохранение _roles.json и
 * пометка ролей устаревшими.
 *
 * Внешние зависимости через ctx:
 *   props, filename, setStatus,
 *   lastAudioFingerprint, lastTimingMtime            (refs из main)
 *   readyScripts                                     (из usePlayback)
 *   loadAudio, loadTiming                            (из usePlayback)
 *
 * Cross-composable зависимости (readyScripts, loadAudio, loadTiming)
 * читаются через ctx.xxx в момент вызова, а не деструктурируются —
 * это разруливает цикл useLineFiles ↔ useLineCatalog ↔ usePlayback.
 */

import { ref, computed } from "vue"
import {
    dirOf, markRoleStale,
    SCRIPT_EDITOR_API as FILE_API,
    SCRIPT_LIBRARY_API as SCAN_API,
    SPEAKER_PRESETS_API as PRESETS_API,
} from "../../shared/fl_common.js"

export function useLineCatalog(ctx) {
    const {
        props, filename, setStatus,
        lastAudioFingerprint, lastTimingMtime,
    } = ctx

    // ── каталог проекта ────────────────────────────────────────────────
    const instructCategories = ref([])  // [{name, title, when, examples}, ...]
    const instructCategoriesPath = ref(null)
    const roleEntries = ref([])
    const rolesJsonPath = ref(null)
    const presets = ref([])
    const speakerSampleDir = ref("")
    const scriptList = ref([])

    // ── роли ───────────────────────────────────────────────────────────
    // Кэш code -> entry, чтобы per-row lookup в шаблоне не был O(N)
    const roleEntryByCode = computed(() => {
        const map = new Map()
        for (const e of roleEntries.value) map.set(e.code, e)
        return map
    })

    function roleEntryFor(row) {
        return roleEntryByCode.value.get(row.speaker)
    }

    function resolveSpeakerFile(code) {
        if (!code) return ""
        const entry = roleEntries.value.find((e) => e.code === code)
        const preset = entry && entry.speaker ? entry.speaker : code
        const base = String(preset).split("#", 1)[0].trim()
        return base ? `${base}.pt` : ""
    }

    function resolvedSpeakerForHash(code) {
        const entry = roleEntries.value.find((e) => e.code === code)
        return (entry && entry.speaker) ? entry.speaker : (code || "")
    }

    function speakerUsageIndex() {
        const usage = {}
        roleEntries.value.forEach((r) => {
            const preset = String(r.speaker || "").split("#", 1)[0].trim()
            if (!preset || !r.code) return
                ;(usage[preset] = usage[preset] || []).push(r.code)
        })
        return usage
    }

    function roleOptionSubLabel(entry) {
        return [entry.name, entry.speaker, entry.description].filter(Boolean).join(" -- ")
    }

    // ── сохранение _roles.json ─────────────────────────────────────────
    async function saveRolesJson() {
        if (!rolesJsonPath.value) {
            setStatus("No _roles.json found for this project -- can't save")
            return false
        }
        try {
            const resp = await fetch(`${FILE_API}/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: rolesJsonPath.value,
                    content: JSON.stringify({ roles: roleEntries.value }, null, 2),
                }),
            })
            const data = await resp.json()
            if (data.error) {
                setStatus(`Error saving _roles.json: ${data.error}`)
                return false
            }
            return true
        } catch (e) {
            setStatus(`Error saving _roles.json: ${e}`)
            return false
        }
    }

    // ── переключение спикера роли (project-wide) ───────────────────────
    async function notifyRoleSpeakerChanged(roleCode) {
        if (!rolesJsonPath.value) return
        const root = dirOf(rolesJsonPath.value)
        const result = await markRoleStale(root, roleCode, props.suffix)
        setStatus(result.message)

        if (result.changed.some((c) => c.file === filename.value)) {
            // loadCatalog — локальная, self-call без ctx
            await loadCatalog()
            // Cross-composable: late-binding через ctx
            if (lastAudioFingerprint) lastAudioFingerprint.value = null
            if (lastTimingMtime) lastTimingMtime.value = null
            ctx.loadAudio?.()
            ctx.loadTiming?.()
        }
    }

    // ── загрузка пресетов ──────────────────────────────────────────────
    async function loadPresets() {
        try {
            const resp = await fetch(PRESETS_API)
            const data = await resp.json()
            presets.value = data.presets || []
            speakerSampleDir.value = data.dir || ""
        } catch (e) {
            presets.value = []
            speakerSampleDir.value = ""
        }
    }

    // ── загрузка каталога проекта ──────────────────────────────────────
    async function loadCatalog() {
        try {
            const url = `${SCAN_API}/scan?path=${encodeURIComponent(props.folder)}&act=&suffix=${encodeURIComponent(props.suffix)}`
            const resp = await fetch(url)
            const data = await resp.json()

            instructCategories.value = data.instruct_categories?.entries || []
            instructCategoriesPath.value = data.instruct_categories?.path || null
            roleEntries.value = data.roles?.entries || []
            rolesJsonPath.value = data.roles?.path || null
            scriptList.value = Array.isArray(data.scripts) ? data.scripts : []

            // Cross-composable: late-binding через ctx
            if (ctx.readyScripts) {
                ctx.readyScripts.value = Array.isArray(data.ready_scripts) ? data.ready_scripts : []
            }
        } catch (e) {
            instructCategories.value = []
            instructCategoriesPath.value = null
            roleEntries.value = []
            rolesJsonPath.value = null
            scriptList.value = []
            if (ctx.readyScripts) ctx.readyScripts.value = []
        }
    }

    return {
        instructCategories,
        instructCategoriesPath,
        roleEntries,
        rolesJsonPath,
        presets,
        speakerSampleDir,
        scriptList,
        roleEntryByCode,
        roleEntryFor,
        resolveSpeakerFile,
        resolvedSpeakerForHash,
        speakerUsageIndex,
        roleOptionSubLabel,
        saveRolesJson,
        notifyRoleSpeakerChanged,
        loadPresets,
        loadCatalog,
    }
}
