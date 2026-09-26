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

function countPauses(text, conjRegex) {
    return (text.match(/[,;]/g) || []).length + (text.match(conjRegex) || []).length;
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

    // 1. syllableRatio — Слогая ёмкость строки
    const enSyll = countEnglishSyllables(en);
    const ruSyll = countRussianSyllables(ru);
    let score1;
    if (enSyll === 0) {
        score1 = 100;
    } else {
        const ratio1 = ruSyll / enSyll;
        const delta1 = Math.abs(ratio1 - 1);
        score1 = 100 * Math.exp(-2 * delta1);
    }

    // 2. acousticTexture — Звуковая/фонетическая согласованность
    // Part A: interjection density parity (per 100 words)
    const EN_INTERJECTIONS = /\b(oh|ah|hm|ha|hey|ugh|wow|oops|tsk)\b/gi;
    const RU_INTERJECTIONS = /\b(ох|ах|хм|ха|эй|уф|ого|ой|упс|мда)\b/gi;
    const fEn = (en.match(EN_INTERJECTIONS) || []).length / Math.max(1, splitWords(en).length) * 100;
    const fRu = (ru.match(RU_INTERJECTIONS) || []).length / Math.max(1, splitWords(ru).length) * 100;
    const interjRatio = (Math.min(fEn, fRu) + 0.01) / (Math.max(fEn, fRu) + 0.01);
    const interjScore = 100 * interjRatio;

    // Part B: sound-class (vowel / sibilant) balance
    const EN_VOWELS = /[aeiouyAEIOUY]/g;
    const EN_SIBILANTS = /[sxzSXZ]/g;
    const RU_VOWELS = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g;
    const RU_SIBILANTS = /[шжщчсзШЖЩЧСЗ]/g;
    const totalLettersEn = (en.match(/[a-zA-Z]/g) || []).length || 1;
    const totalLettersRu = (ru.match(/[а-яёА-ЯЁ]/g) || []).length || 1;
    const vowelPropEn = (en.match(EN_VOWELS) || []).length / totalLettersEn;
    const vowelPropRu = (ru.match(RU_VOWELS) || []).length / totalLettersRu;
    const sibPropEn = (en.match(EN_SIBILANTS) || []).length / totalLettersEn;
    const sibPropRu = (ru.match(RU_SIBILANTS) || []).length / totalLettersRu;
    const vowelDiff = Math.abs(vowelPropEn - vowelPropRu);
    const sibDiff = Math.abs(sibPropEn - sibPropRu);
    const soundScore = 100 * (1 - Math.min(1, (vowelDiff + sibDiff) / 2));
    const score2 = (interjScore + soundScore) / 2;

    // 3. edgeParity — Интонационно-краевые маркеры
    const edgeFlags = (text) => [
        text.includes("?"),
        text.includes("!"),
        text.includes("...") || text.includes("…"),
        /["«»]/.test(text),
        /^\s*[—-]/.test(text),
    ];
    const enFlags = edgeFlags(en);
    const ruFlags = edgeFlags(ru);
    let matchCount = 0;
    for (let i = 0; i < 5; i++) {
        if (enFlags[i] === ruFlags[i]) {
            matchCount += 1;
        }
    }
    const score3 = (matchCount / 5) * 100;

    // 4. lexicalDiversity — Лексическое разнообразие (TTR)
    const enWords = splitWords(en);
    let score4 = 100;
    if (enWords.length >= 7) {
        const EN_STOP = new Set([
            "the", "a", "an", "is", "are", "was", "were", "and", "or", "but", "of", "to", "in", "on", "at", "it",
        ]);
        const RU_STOP = new Set([
            "и", "а", "но", "в", "на", "с", "к", "о", "у", "что", "это", "я", "ты", "он", "она",
        ]);
        const normalize = (text) =>
            String(text)
                .toLowerCase()
                .replace(/[^a-zа-яё\s]/gi, "")
                .split(/\s+/)
                .filter(Boolean);
        const enTokens = normalize(en).filter((w) => !EN_STOP.has(w));
        const ruTokens = normalize(ru).filter((w) => !RU_STOP.has(w));
        const ttrEn = new Set(enTokens).size / Math.max(1, enTokens.length);
        const ttrRu = new Set(ruTokens).size / Math.max(1, ruTokens.length);
        const ratio3 = Math.min(ttrEn, ttrRu) / Math.max(ttrEn, ttrRu, 0.0001);
        score4 = ratio3 * 100;
    }

    // 5. pauseDensity — Плотность микропауз
    const EN_CONJ = /\b(and|but|or|so|because|although)\b/gi;
    const RU_CONJ = /\b(и|а|но|или|потому|хотя)\b/gi;
    const ruWords = splitWords(ru);
    const pEn = countPauses(en, EN_CONJ) / (enWords.length || 1) * 10;
    const pRu = countPauses(ru, RU_CONJ) / (ruWords.length || 1) * 10;
    const ratio4 = (Math.min(pEn, pRu) + 0.01) / (Math.max(pEn, pRu) + 0.01);
    const score5 = 100 * ratio4;

    return [
        { key: "syllableRatio", label: "Слоговая ёмкость строки", score: round1(score1) },
        { key: "acousticTexture", label: "Звуковая/фонетическая согласованность", score: round1(score2) },
        { key: "edgeParity", label: "Интонационно-краевые маркеры", score: round1(score3) },
        { key: "lexicalDiversity", label: "Лексическое разнообразие (TTR)", score: round1(score4) },
        { key: "pauseDensity", label: "Плотность микропауз", score: round1(score5) },
    ];
}
