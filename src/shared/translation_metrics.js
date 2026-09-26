/**
 * Pure JS translation quality heuristics (no Vue, no DOM).
 *
 * Compares an English original against a Russian translation and returns
 * 5 metrics, each { key, label, score } with score in 0-100
 * (100 = perfectly matched, lower = drifted).
 */

function round1(value) {
    return Math.round(value * 10) / 10;
}

function splitWords(text) {
    return String(text).split(/\s+/).filter(Boolean);
}

function toneFlags(text) {
    return [
        text.includes("?"),
        text.includes("!"),
        text.includes("...") || text.includes("…"),
    ];
}

function countEnglishSyllables(text) {
    return (text.match(/[aeiouyAEIOUY]+/g) || []).length;
}

function countRussianSyllables(text) {
    return (text.match(/[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g) || []).length;
}

export function computeTranslationScores(original, translation) {
    const en = String(original);
    const ru = String(translation);

    // 1. charLength — Длина (символы)
    const ratio1 = ru.length / (en.length * 1.25);
    const score1 = Math.max(0, 100 - Math.abs(ratio1 - 1) * 200);

    // 2. wordCount — Кол-во слов
    const enWords = splitWords(en);
    const ruWords = splitWords(ru);
    const ratio2 = ruWords.length / enWords.length;
    const score2 =
        enWords.length === 0
            ? 100
            : Math.max(0, 100 - Math.abs(ratio2 - 1) * 150);

    // 3. tone — Тон/пунктуация
    const enFlags = toneFlags(en);
    const ruFlags = toneFlags(ru);
    let matchCount = 0;
    for (let i = 0; i < 3; i++) {
        if (enFlags[i] === ruFlags[i]) {
            matchCount += 1;
        }
    }
    const score3 = (matchCount / 3) * 100;

    // 4. entities — Числа/даты
    const numberTokens = en.match(/\d+/g) || [];
    let score4;
    if (numberTokens.length === 0) {
        score4 = 100;
    } else {
        const found = numberTokens.filter((token) => ru.includes(token));
        score4 = (found.length / numberTokens.length) * 100;
    }

    // 5. speechDuration — Темп речи
    const enSyllables = countEnglishSyllables(en);
    const ruSyllables = countRussianSyllables(ru);
    const ratio5 = ruSyllables / (enSyllables * 1.15);
    const score5 =
        enSyllables === 0
            ? 100
            : Math.max(0, 100 - Math.abs(ratio5 - 1) * 200);

    return [
        { key: "charLength", label: "Длина (символы)", score: round1(score1) },
        { key: "wordCount", label: "Кол-во слов", score: round1(score2) },
        { key: "tone", label: "Тон/пунктуация", score: round1(score3) },
        { key: "entities", label: "Числа/даты", score: round1(score4) },
        { key: "speechDuration", label: "Темп речи", score: round1(score5) },
    ];
}
