import { describe, it, expect } from "vitest";
import { computeTranslationScores } from "../shared/translation_metrics.js";

function byKey(scores, key) {
    const found = scores.find((item) => item.key === key);
    if (!found) {
        throw new Error("missing metric: " + key);
    }
    return found;
}

describe("computeTranslationScores", () => {
    it("returns exactly 5 metrics with the new keys/labels, each a 0-100 number", () => {
        const scores = computeTranslationScores(
            "The old man read his book in the garden.",
            "Старый мужчина читал свою книгу в саду."
        );

        expect(scores).toHaveLength(5);
        expect(scores).toEqual([
            expect.objectContaining({ key: "syllableRatio" }),
            expect.objectContaining({ key: "acousticTexture" }),
            expect.objectContaining({ key: "edgeParity" }),
            expect.objectContaining({ key: "lexicalDiversity" }),
            expect.objectContaining({ key: "pauseDensity" }),
        ]);
        expect(byKey(scores, "syllableRatio").label).toBe("Акцентно-ритмическое соответствие (CosyVoice 3)");
        expect(byKey(scores, "acousticTexture").label).toBe("Звуковая/фонетическая согласованность");
        expect(byKey(scores, "edgeParity").label).toBe("Интонационно-краевые маркеры");
        expect(byKey(scores, "lexicalDiversity").label).toBe("Лексическое разнообразие (TTR)");
        expect(byKey(scores, "pauseDensity").label).toBe("Плотность микропауз");

        for (const score of scores) {
            expect(typeof score.score).toBe("number");
            expect(score.score).toBeGreaterThanOrEqual(0);
            expect(score.score).toBeLessThanOrEqual(100);
        }
    });

    it("identical EN/EN text: edges, TTR and pauses are 100; syllables/sounds reflect EN-only vowels", () => {
        // syllableRatio is now 60% stress peaks + 40% TTS length corridor, not
        // the old exp(-2*delta) curve, so the expected value changed with it.
        // "The quick brown fox": 0 RU vowels against 5 EN syllable groups ->
        // ratio 0, below MIN_SAFE_K 0.90 -> corridor 100 - 90 = 10.
        // Stress: 3 of 4 words count (the EN stop list drops "The", the RU one
        // does not) -> 75. Total 75*0.6 + 10*0.4 = 49.
        // sound-class: EN vowel prop 5/16 vs RU 0/16, EN sib x 1/16 -> soundScore 81.25, interj 100 -> 90.6
        const scores = computeTranslationScores("The quick brown fox", "The quick brown fox");

        expect(byKey(scores, "acousticTexture").score).toBe(90.6);
        expect(byKey(scores, "edgeParity").score).toBe(100);
        expect(byKey(scores, "lexicalDiversity").score).toBe(100); // <7 words -> TTR gate
        expect(byKey(scores, "pauseDensity").score).toBe(100);
        expect(byKey(scores, "syllableRatio").score).toBe(49);
    });

    it("a short original (<7 words) gates lexical diversity to 100", () => {
        const scores = computeTranslationScores("Hi there", "Привет, как дела?");
        expect(byKey(scores, "lexicalDiversity").score).toBe(100);
    });

    it("7+ words with genuinely different lexical diversity scales the TTR ratio", () => {
        // EN content tokens: cat, sat, mat, today -> TTR 1
        // RU content tokens: кот, сидел, коврике, кот, снова, сидел -> TTR 4/6
        // ratio -> 66.7
        const scores = computeTranslationScores(
            "The cat sat on the mat today",
            "Кот сидел на коврике, кот снова сидел"
        );
        expect(byKey(scores, "lexicalDiversity").score).toBe(66.7);
    });

    it("a dropped question mark lowers edgeParity; keeping it restores 100", () => {
        // EN flags: [T,F,F,F,F]; RU "Ты идёшь": [F,F,F,F,F] -> 4 of 5 match -> 80
        const scores = computeTranslationScores("Are you coming?", "Ты идёшь");
        expect(byKey(scores, "edgeParity").score).toBe(80);

        // keeping the question mark -> 5 of 5 match -> 100
        const scores2 = computeTranslationScores("Are you coming?", "Ты идёшь?");
        expect(byKey(scores2, "edgeParity").score).toBe(100);
    });

    it("mismatched interjection density drags acousticTexture down", () => {
        // EN: "oh"/"wow" density 50 per 100 words vs RU 0 -> interjScore ~0.02;
        // sound-class balance ~88.64 -> total ~44.3
        const scores = computeTranslationScores("Oh, wow, the sky!", "Небо!");
        expect(byKey(scores, "acousticTexture").score).toBe(44.3);
    });

    it("a realistic EN/RU pair scores high on edges/diversity/pauses, mid on syllables", () => {
        const scores = computeTranslationScores(
            "The old man read his book in the garden.",
            "Старый мужчина читал свою книгу в саду."
        );

        expect(byKey(scores, "edgeParity").score).toBe(100);
        expect(byKey(scores, "lexicalDiversity").score).toBe(100);
        expect(byKey(scores, "pauseDensity").score).toBe(100);
        // 10 EN syllable groups vs 13 RU vowels -> ratio 1.3, inside the 0.90..1.35
        // TTS corridor -> corridor 100. Stress 5 of 6 -> 83.3.
        // Total 83.3*0.6 + 100*0.4 = 90.
        expect(byKey(scores, "syllableRatio").score).toBe(90);
        expect(byKey(scores, "acousticTexture").score).toBe(95.6);
    });

    it("rounds every score to 1 decimal place", () => {
        const scores = computeTranslationScores(
            "The quick brown fox jumped over 2 lazy dogs at 5 o'clock.",
            "Быстрый лиса прыгнул через 2 ленивых собак в 5 часов."
        );

        for (const score of scores) {
            const rounded = Math.round(score.score * 10) / 10;
            expect(score.score).toBe(rounded);
        }
    });
});
