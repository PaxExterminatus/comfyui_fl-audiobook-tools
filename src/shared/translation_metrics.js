/**
 * Pure JS translation quality heuristics (no Vue, no DOM).
 * Updated for CosyVoice 3 TTS model with Stress Parity (Акцентно-ритмический расчёт).
 *
 * Compares an English original against a Russian translation and returns
 * 5 metrics, each { key, label, score } with score in 0-100
 * (100 = perfectly matched, lower = drifted).
 */

const EN_STRESS_STOP = new Set([
    "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", "by", "for", "with",
    "about", "against", "between", "into", "through", "during", "before", "after", "above", "below",
    "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "can", "could", "should", "would", "may", "might", "must", "shall", "will", "i", "you", "he",
    "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "their",
    "this", "that", "these", "those", "though", "please"
]);

const RU_STRESS_STOP = new Set([
    "и", "да", "но", "а", "или", "ли", "бы", "же", "что", "чтобы", "как", "будто", "словно",
    "в", "во", "на", "с", "со", "к", "ко", "из", "изо", "по", "за", "от", "ото", "до", "без",
    "под", "над", "при", "про", "о", "об", "обо", "у", "для", "из-за", "из-под",
    "я", "ты", "он", "она", "оно", "мы", "вы", "они", "меня", "тебя", "его", "ее", "нас", "вас", "их",
    "мой", "твой", "свой", "наш", "ваш", "это", "этот", "эта", "эти", "то", "тот", "та", "те",
    "все-таки", "всё-таки", "уж", "вот"
]);

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

function countStressedWords(text, stopWordsSet) {
    const words = String(text)
        .toLowerCase()
        .replace(/[^a-zа-яё\s]/gi, "")
        .split(/\s+/)
        .filter(Boolean);

    const contentWords = words.filter(w => !stopWordsSet.has(w));
    return Math.max(1, contentWords.length);
}

export function computeTranslationScores(original, translation) {
    const en = String(original);
    const ru = String(translation);

    // 1. accentRhythm (бывший syllableRatio) — Акцентно-ритмическое соответствие (CosyVoice 3)
    const enStresses = countStressedWords(en, EN_STRESS_STOP);
    const ruStresses = countStressedWords(ru, RU_STRESS_STOP);
    const stressRatio = Math.min(enStresses, ruStresses) / Math.max(enStresses, ruStresses);
    const stressScore = stressRatio * 100;

    const enSyll = countEnglishSyllables(en);
    const ruSyll = countRussianSyllables(ru);
    let corridorScore = 100;

    if (enSyll > 0) {
        const actualRatio = ruSyll / enSyll;
        const MAX_SAFE_K = 1.35; // Верхний порог безопасного ускорения CosyVoice 3
        const MIN_SAFE_K = 0.90; // Нижний порог без растяжения гласных

        if (actualRatio > MAX_SAFE_K) {
            const overflow = actualRatio - MAX_SAFE_K;
            corridorScore = Math.max(0, 100 - overflow * 100);
        } else if (actualRatio < MIN_SAFE_K) {
            const underflow = MIN_SAFE_K - actualRatio;
            corridorScore = Math.max(0, 100 - underflow * 100);
        }
    }

    // Итоговый балл: 60% — акцентные пики, 40% — коридор допустимой длины для TTS
    const score1 = (stressScore * 0.6) + (corridorScore * 0.4);

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
        { key: "syllableRatio", label: "Акцентно-ритмическое соответствие (CosyVoice 3)", score: round1(score1) },
        { key: "acousticTexture", label: "Звуковая/фонетическая согласованность", score: round1(score2) },
        { key: "edgeParity", label: "Интонационно-краевые маркеры", score: round1(score3) },
        { key: "lexicalDiversity", label: "Лексическое разнообразие (TTR)", score: round1(score4) },
        { key: "pauseDensity", label: "Плотность микропауз", score: round1(score5) },
    ];
}
