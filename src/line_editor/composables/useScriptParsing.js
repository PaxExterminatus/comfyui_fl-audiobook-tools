/**
 * useScriptParsing — парсинг и сериализация строк скрипта.
 *
 * Чистые функции: state не хранят, ctx не нужен, можно использовать
 * как обычные утилиты.
 *
 * Формат строки скрипта:
 *   speaker | instruct | text
 *   speaker | instruct | text | pause      (опционально)
 *
 * Разделитель — вертикальная черта '|'. Строка без 3 или 4 частей
 * считается malformed и остаётся как raw-текст.
 */

// Глобальный счётчик для уникальных ключей строк.
// Не сбрасывается между экземплярами компонента — это ок: ключ
// нужен только для v-for и Map внутри одного сеанса.
let nextRowKey = 1

/**
 * Создаёт строку с уникальным __key.
 * @param {object} fields — { speaker, instruct, text, pause, raw, malformed }
 * @returns {object}
 */
export function freshRow(fields) {
    return { ...fields, __key: nextRowKey++ }
}

/**
 * Парсит одну строку формата "speaker | instruct | text [| pause]".
 * @param {string} line
 * @returns {{speaker: string, instruct: string, text: string, pause: string} | null}
 *   null — если частей не 3 и не 4
 */
export function parseLine(line) {
    const parts = line.split("|")
    if (parts.length !== 3 && parts.length !== 4) return null
    return {
        speaker: parts[0].trim(),
        instruct: parts[1].trim(),
        text: parts[2].trim(),
        pause: parts.length === 4 ? parts[3].trim() : "",
    }
}

/**
 * Парсит весь скрипт: разбивает по \n, пропускает пустые строки,
 * каждую строку превращает в объект row. Если parseLine вернул null —
 * строка помечается malformed и сохраняется как raw.
 *
 * @param {string} content — содержимое .txt файла
 * @returns {Array<object>} — массив row-объектов
 */
export function parseScript(content) {
    return content
        .split("\n")
        .map((raw) => raw.replace(/\r$/, ""))
        .filter((line) => line.trim())
        .map((line) => {
            const parsed = parseLine(line)
            return parsed
                ? freshRow({ ...parsed, raw: line, malformed: false })
                : freshRow({ raw: line, malformed: true })
        })
}

/**
 * Собирает строки обратно в текст скрипта.
 * Malformed-строки выводятся как есть; pause пишется только если он
 * явно задан — иначе строка остаётся в старом формате из 3 полей.
 *
 * @param {Array<object>} rowsArr
 * @returns {string}
 */
export function serializeRows(rowsArr) {
    return rowsArr
        .map((r) => {
            if (r.malformed) return r.raw
            const base = `${r.speaker} | ${r.instruct} | ${r.text}`
            return r.pause ? `${base} | ${r.pause}` : base
        })
        .join("\n")
}
