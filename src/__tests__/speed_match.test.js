import { describe, it, expect } from "vitest";
import { speedMatchLabel } from "../shared/speed_match.js";

/**
 * Tests for the pure function speedMatchLabel(enDurationS, ruDurationS).
 * The implementation is not present yet – these tests should fail until the
 * function is added.
 */

describe("speedMatchLabel", () => {
    it("calculates ratio, percent, and label when RU is longer than EN", () => {
        const result = speedMatchLabel(1.5, 2.0);
        // Expected ratio: 2.0 / 1.5 = 1.33333…
        expect(result.ratio).toBeCloseTo(1.33333, 5);
        // Percent = (ratio - 1) * 100, rounded => 33
        expect(result.percent).toBe(33);
        expect(result.label).toBe("+33%");
    });

    it("calculates negative percent and label when RU is shorter than EN", () => {
        const result = speedMatchLabel(2.0, 1.6);
        expect(result.ratio).toBeCloseTo(0.8, 5);
        expect(result.percent).toBe(-20);
        expect(result.label).toBe("-20%");
    });

    it("returns neutral values when durations are equal", () => {
        const result = speedMatchLabel(2.0, 2.0);
        expect(result.ratio).toBeCloseTo(1.0, 5);
        expect(result.percent).toBe(0);
        expect(result.label).toBe("");
    });

    it("produces an empty label when the rounded percent would be 0", () => {
        // A tiny difference that rounds to 0% (e.g. 0.4% rounds down)
        const result = speedMatchLabel(2.0, 2.008); // ratio ≈ 1.004, percent ≈ 0.4 → 0
        expect(result.ratio).toBeCloseTo(1.004, 5);
        expect(result.percent).toBe(0);
        expect(result.label).toBe("");
    });

    it("clamps the ratio to the upper bound (2.0) and calculates percent 100", () => {
        const result = speedMatchLabel(0.5, 2.0); // raw ratio 4 -> clamped to 2
        expect(result.ratio).toBeCloseTo(2.0, 5);
        expect(result.percent).toBe(100);
        expect(result.label).toBe("+100%");
    });

    it("clamps the ratio to the lower bound (0.5) and calculates percent -50", () => {
        const result = speedMatchLabel(2.0, 0.5); // raw ratio 0.25 -> clamped to 0.5
        expect(result.ratio).toBeCloseTo(0.5, 5);
        expect(result.percent).toBe(-50);
        expect(result.label).toBe("-50%");
    });

    it.each([
        [null, 2.0],
        [undefined, 2.0],
        [0, 2.0],
        [-1, 2.0],
        [2.0, null],
        [2.0, undefined],
        [2.0, 0],
        [2.0, -1],
    ])("invalid inputs %p, %p produce a neutral output", (en, ru) => {
        const result = speedMatchLabel(en, ru);
        expect(result.ratio).toBe(1);
        expect(result.percent).toBe(0);
        expect(result.label).toBe("");
    });
});
