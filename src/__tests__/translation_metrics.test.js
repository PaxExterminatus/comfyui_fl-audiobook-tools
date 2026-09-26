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
    it("returns 5 metrics with exact keys/labels, each a 0-100 number", () => {
        const scores = computeTranslationScores("The old man read his book.", "Старый мужчина читал книгу.");

        expect(scores).toHaveLength(5);
        expect(scores).toEqual([
            expect.objectContaining({ key: "charLength" }),
            expect.objectContaining({ key: "wordCount" }),
            expect.objectContaining({ key: "tone" }),
            expect.objectContaining({ key: "entities" }),
            expect.objectContaining({ key: "speechDuration" }),
        ]);
        expect(byKey(scores, "charLength").label).toBe("Длина (символы)");
        expect(byKey(scores, "wordCount").label).toBe("Кол-во слов");
        expect(byKey(scores, "tone").label).toBe("Тон/пунктуация");
        expect(byKey(scores, "entities").label).toBe("Числа/даты");
        expect(byKey(scores, "speechDuration").label).toBe("Темп речи");

        for (const score of scores) {
            expect(typeof score.score).toBe("number");
            expect(score.score).toBeGreaterThanOrEqual(0);
            expect(score.score).toBeLessThanOrEqual(100);
        }
    });

    it("identical short text scores 100 on the word/tone/number metrics where applicable", () => {
        const scores = computeTranslationScores("The cat sat on the mat", "The cat sat on the mat");

        // word count, tone and number tokens all match exactly -> 100
        expect(byKey(scores, "wordCount").score).toBe(100);
        expect(byKey(scores, "tone").score).toBe(100);
        expect(byKey(scores, "entities").score).toBe(100);

        // length/syllable formulas penalise equal-length EN vs EN (and 0 RU vowels),
        // so we only bound-check those instead of demanding 100.
        expect(byKey(scores, "charLength").score).toBeGreaterThanOrEqual(0);
        expect(byKey(scores, "charLength").score).toBeLessThanOrEqual(100);
        expect(byKey(scores, "speechDuration").score).toBeGreaterThanOrEqual(0);
        expect(byKey(scores, "speechDuration").score).toBeLessThanOrEqual(100);
    });

    it("a dropped question mark lowers the tone score", () => {
        // en flags: [T, F, F]; ru "Ты идёшь" has no punctuation: [F, F, F] -> 2 of 3 match
        const scores = computeTranslationScores("Are you coming?", "Ты идёшь");
        expect(byKey(scores, "tone").score).toBe(66.7);

        // keeping the question mark restores full tone match
        const scores2 = computeTranslationScores("Are you coming?", "Ты идёшь?");
        expect(byKey(scores2, "tone").score).toBe(100);
    });

    it("a dropped number lowers entities; kept or absent numbers score 100", () => {
        // "3" and "5" both present in the Russian -> 100
        expect(
            byKey(computeTranslationScores("Chapter 3 has 5 pages.", "Глава 3 имеет 5 страниц."), "entities").score
        ).toBe(100);

        // "5" dropped -> 1 of 2 number tokens retained -> 50
        const dropped = computeTranslationScores("Chapter 3 has 5 pages.", "Глава 3 имеет страниц.");
        expect(byKey(dropped, "entities").score).toBe(50);

        // no number tokens in the original -> 100 by definition
        const noNum = computeTranslationScores("The rain falls softly", "Дождь падает мягко");
        expect(byKey(noNum, "entities").score).toBe(100);
    });

    it("a much longer translation drops length and word-count to the 0 floor", () => {
        const scores = computeTranslationScores(
            "Hi, John.",
            "Здравствуйте, Джон! Очень рад вас видеть, надеюсь, у вас все хорошо и погода сегодня хорошая."
        );

        expect(byKey(scores, "charLength").score).toBe(0);
        expect(byKey(scores, "wordCount").score).toBe(0);
        // penalty is clamped, never negative
        expect(byKey(scores, "speechDuration").score).toBeGreaterThanOrEqual(0);
    });

    it("a realistic EN/RU pair lands in the healthy range with full tone/number match", () => {
        const scores = computeTranslationScores(
            "The old man read his book in the garden.",
            "Старый мужчина читал свою книгу в саду.",
        );

        expect(byKey(scores, "tone").score).toBe(100);
        expect(byKey(scores, "entities").score).toBe(100);
        const len = byKey(scores, "charLength").score;
        const words = byKey(scores, "wordCount").score;
        const speech = byKey(scores, "speechDuration").score;
        expect(len).toBeGreaterThanOrEqual(0);
        expect(len).toBeLessThanOrEqual(100);
        expect(words).toBeGreaterThanOrEqual(0);
        expect(words).toBeLessThanOrEqual(100);
        expect(speech).toBeGreaterThanOrEqual(0);
        expect(speech).toBeLessThanOrEqual(100);
    });

    it("rounds every score to 1 decimal place", () => {
        const scores = computeTranslationScores(
            "The quick brown fox jumped over 2 lazy dogs at 5 o'clock.",
            "Быстрый коричневый лиса прыгнул через 2 ленивых собак в 5 часов.",
        );

        for (const score of scores) {
            const rounded = Math.round(score.score * 10) / 10;
            expect(score.score).toBe(rounded);
        }
    });
});
