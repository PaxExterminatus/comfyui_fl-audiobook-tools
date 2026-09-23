import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// happy-dom has no Web Audio API at all, so this hand-rolls just enough of
// a fake AudioContext for decodeWaveformPeaks' own call surface
// (decodeAudioData -> an object with getChannelData) -- not a general
// Web Audio emulator, see effect_preview.test.js for the same approach.
class FakeAudioContext {
    async decodeAudioData(arrayBuffer) {
        const length = arrayBuffer.byteLength;
        const data = new Float32Array(length);
        for (let i = 0; i < length; i++) data[i] = i % 2 === 0 ? 0.5 : -0.5;
        return { getChannelData: () => data };
    }
}

describe("decodeWaveformPeaks", () => {
    let originalFetch;
    let originalAudioContext;
    beforeEach(() => {
        originalFetch = global.fetch;
        originalAudioContext = window.AudioContext;
    });
    afterEach(() => {
        global.fetch = originalFetch;
        window.AudioContext = originalAudioContext;
    });

    async function freshModule() {
        vi.resetModules(); // effect_preview.js's sibling caches its context at module scope; waveform.js does the same
        return import("../waveform.js");
    }

    it("returns one peak value per bucket, each within [0, 1]", async () => {
        window.AudioContext = FakeAudioContext;
        global.fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(1000) });
        const { decodeWaveformPeaks } = await freshModule();

        const peaks = await decodeWaveformPeaks("http://x/audio.wav", 20);
        expect(peaks.length).toBe(20);
        expect(Math.max(...peaks)).toBeLessThanOrEqual(1);
        expect(Math.max(...peaks)).toBeGreaterThan(0); // real (fake) data, not silence
    });

    it("rejects when the fetch itself fails", async () => {
        window.AudioContext = FakeAudioContext;
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
        const { decodeWaveformPeaks } = await freshModule();

        await expect(decodeWaveformPeaks("http://x/missing.wav")).rejects.toThrow();
    });

    it("rejects when there's no Web Audio support at all", async () => {
        window.AudioContext = undefined;
        const originalWebkit = window.webkitAudioContext;
        window.webkitAudioContext = undefined;
        const { decodeWaveformPeaks } = await freshModule();

        await expect(decodeWaveformPeaks("http://x/audio.wav")).rejects.toThrow();
        window.webkitAudioContext = originalWebkit;
    });
});
