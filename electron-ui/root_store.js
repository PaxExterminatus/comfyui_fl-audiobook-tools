/**
 * root_store — какая папка проекта принадлежит какому режиму.
 *
 * Отдельный модуль, а не часть main.js, намеренно: main.js при импорте сразу
 * трогает DOM (читает #vo-dub-root-input), поэтому в тесте его не поднять —
 * импорт падает на `Cannot set properties of null`. Здесь чистая
 * бухгалтерия, хранилище приходит аргументом, и тест подставляет своё.
 *
 * Зачем вообще: озвучка и дубляж — разные проекты. У первого папка с
 * .txt-сценариями по актам, у второго — папка с vo_dataset.csv. Это никогда
 * не один каталог, а раньше оба режима кормились из одного поля ввода, и
 * переключение молча подсовывало режиму чужую папку.
 */

export const VOICING_KEY = "FL_Electron.voicingRoot";
export const DUBBING_KEY = "FL_Electron.dubbingRoot";
/** Ключ до разделения режимов. Хранил корень VO Dub — что видно по имени. */
export const LEGACY_KEY = "FL_Electron.voDubRoot";

// Recent‑folder history keys – introduced in slice 15.
export const VOICING_RECENT_KEY = "FL_Electron.voicingRecent";
export const DUBBING_RECENT_KEY = "FL_Electron.dubbingRecent";

const KEY_BY_MODE = { voicing: VOICING_KEY, dubbing: DUBBING_KEY };
// Mapping mode → recent‑history storage key.
const RECENT_KEY_BY_MODE = { voicing: VOICING_RECENT_KEY, dubbing: DUBBING_RECENT_KEY };

export function makeRootStore(storage) {
    /*
     Любое обращение к хранилищу может бросить: приватный режим, запрет
     куки-политикой, переполнение квоты. Это не повод ронять редактор — без
     сохранения он работает, просто забывает папки между запусками.
    */
    function readRaw(key) {
        try {
            return storage.getItem(key) || "";
        } catch (e) {
            return "";
        }
    }

    function writeRaw(key, value) {
        try {
            storage.setItem(key, value);
        } catch (e) {
            /* не сохранилось — работаем дальше без запоминания */
        }
    }

    /*
     Значения живут в памяти, а хранилище — только зеркало. Иначе каждый
     геттер бил бы в localStorage, а в тестах подставное хранилище вообще
     ничего не помнит между вызовами.
    */
    const roots = {
        [VOICING_KEY]: readRaw(VOICING_KEY),
        [DUBBING_KEY]: readRaw(DUBBING_KEY),
    };

    // ---------------------------------------------------------------------
    // Recent‑folder history handling (slice 15).
    // ---------------------------------------------------------------------
    // Load recent lists from storage, falling back to empty arrays on any
    // parse error or storage read failure. The storage value is expected to be a
    // JSON‑encoded array of strings.
    function readRecent(key) {
        try {
            const raw = storage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // Corrupt JSON, storage failure, etc. – treat as empty list.
            return [];
        }
    }

    function writeRecent(key, list) {
        try {
            storage.setItem(key, JSON.stringify(list));
        } catch (e) {
            // Persist errors are ignored – we still keep the in‑memory list.
        }
    }

    const recents = {
        voicing: readRecent(VOICING_RECENT_KEY),
        dubbing: readRecent(DUBBING_RECENT_KEY),
    };

    /*
     Разовый перенос со старого ключа, при создании стора. Условие «оба
     новых пусты» и есть защита от повторного запуска: как только хоть один
     заполнен, перенос не трогает ничего — в том числе папку дубляжа,
     которую пользователь успел поменять сам.

     Старый ключ не удаляем: откат на предыдущую версию не должен оставлять
     человека вообще без папки.
    */
    if (!roots[VOICING_KEY] && !roots[DUBBING_KEY]) {
        const legacy = readRaw(LEGACY_KEY);
        if (legacy) {
            roots[DUBBING_KEY] = legacy;
            writeRaw(DUBBING_KEY, legacy);
        }
    }

    let mode = "voicing";

    function set(key, value) {
        const v = value ?? "";
        roots[key] = v;
        writeRaw(key, v);
    }

    // ---------------------------------------------------------------------
    // Recent‑history public API.
    // ---------------------------------------------------------------------
    function getRecent() {
        // Return a shallow copy to avoid accidental external mutation.
        const list = recents[mode] || [];
        return list.slice();
    }

    function getRecentFor(m) {
        const list = recents[m] || [];
        return list.slice();
    }

    function rememberCurrent() {
        // Pull the current root for the active mode.
        const root = roots[KEY_BY_MODE[mode]];
        if (typeof root !== "string") return;
        const trimmed = root.trim();
        if (!trimmed) return; // ignore empty/whitespace only.
        // Work on the in‑memory list for the active mode.
        const list = recents[mode] || [];
        // Remove any existing occurrence to avoid duplicates.
        const existingIdx = list.indexOf(trimmed);
        if (existingIdx !== -1) {
            list.splice(existingIdx, 1);
        }
        // Insert at the front (newest first).
        list.unshift(trimmed);
        // Enforce a maximum of eight entries.
        if (list.length > 8) {
            list.splice(8);
        }
        // Persist the updated list.
        writeRecent(RECENT_KEY_BY_MODE[mode], list);
    }

    return {
        getCurrentMode: () => mode,
        setCurrentMode(next) {
            if (KEY_BY_MODE[next]) mode = next;
            return mode;
        },
        getVoicingRoot: () => roots[VOICING_KEY],
        getDubbingRoot: () => roots[DUBBING_KEY],
        setVoicingRoot: (v) => set(VOICING_KEY, v),
        setDubbingRoot: (v) => set(DUBBING_KEY, v),
        getCurrentModeRoot: () => roots[KEY_BY_MODE[mode]],
        setCurrentModeRoot: (v) => set(KEY_BY_MODE[mode], v),
        // Recent‑folder history API (slice 15)
        getRecent,
        getRecentFor,
        rememberCurrent,
    };
}
