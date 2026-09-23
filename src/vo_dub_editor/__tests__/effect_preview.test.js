import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// happy-dom/jsdom don't implement the Web Audio API at all, so this file
// hand-rolls just enough of a fake AudioContext for createEffectPreview's
// OWN call surface (createGain/createBiquadFilter/createWaveShaper/
// createBuffer/createBufferSource/createMediaElementSource/resume) --
// wide enough to catch the specific regression this module already shipped
// once (see below), not a general Web Audio emulator.
class FakeAudioContext {
    constructor() {
        this.state = "running";
        this.destination = { __isDestination: true };
        this.sampleRate = 24000;
        this.createGain = vi.fn(() => ({ gain: { value: 0 }, connect: vi.fn() }));
        this.createBiquadFilter = vi.fn(() => ({ type: "", frequency: { value: 0 }, connect: vi.fn() }));
        this.createWaveShaper = vi.fn(() => ({ curve: null, oversample: "", connect: vi.fn() }));
        this.createBuffer = vi.fn((_channels, length) => ({ getChannelData: () => new Float32Array(length) }));
        this.createBufferSource = vi.fn(() => ({ buffer: null, loop: false, connect: vi.fn(), start: vi.fn() }));
        this.createMediaElementSource = vi.fn(() => ({ connect: vi.fn() }));
        this.resume = vi.fn().mockResolvedValue(undefined);
        FakeAudioContext.instances.push(this);
    }
}
FakeAudioContext.instances = [];

function makeFakeAudioEl(paused) {
    const listeners = {};
    return {
        paused,
        addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
        removeEventListener(type, fn) {
            listeners[type] = (listeners[type] || []).filter((f) => f !== fn);
        },
        _fire(type) { (listeners[type] || []).forEach((fn) => fn()); },
    };
}

// createEffectPreview never exposes its internal "master" gate directly --
// identified here by the one gain node that connects straight to the fake
// context's own `destination` (every other gain -- dry, and each effect's
// own wet gain -- connects to THIS one instead, never to destination
// itself; see effect_preview.js's own comment on why).
function findMasterGain(ctx) {
    return ctx.createGain.mock.results
        .map((r) => r.value)
        .find((g) => g.connect.mock.calls.some(([target]) => target === ctx.destination));
}

describe("createEffectPreview", () => {
    let originalAudioContext;
    beforeEach(() => {
        FakeAudioContext.instances = [];
        originalAudioContext = window.AudioContext;
        window.AudioContext = FakeAudioContext;
    });
    afterEach(() => {
        window.AudioContext = originalAudioContext;
        vi.resetModules();
    });

    async function freshModule() {
        vi.resetModules(); // effect_preview.js caches its AudioContext at module scope
        return import("../effect_preview.js");
    }

    // The actual bug reported: a row with a previously SAVED effect (e.g.
    // "radio") calls preview.setEffect() immediately on mount (see
    // VoDubLineEditor.vue's setRuAudioRef) -- radio's own noise loop is a
    // wholly separate AudioBufferSourceNode, started once and looping
    // forever, that used to connect straight to the destination: audible
    // static the instant the window opened, with nothing ever pressed
    // play on. The master gate exists specifically to prevent this.
    it("stays silent (master gate at 0) the moment an effect is applied, before the element has ever played", async () => {
        const { createEffectPreview } = await freshModule();
        const el = makeFakeAudioEl(true); // never played
        createEffectPreview(el).setEffect("radio");

        const ctx = FakeAudioContext.instances.at(-1);
        const master = findMasterGain(ctx);
        expect(master).toBeTruthy();
        expect(master.gain.value).toBe(0);
    });

    it("opens the master gate once the element actually starts playing", async () => {
        const { createEffectPreview } = await freshModule();
        const el = makeFakeAudioEl(true);
        createEffectPreview(el).setEffect("radio");
        const ctx = FakeAudioContext.instances.at(-1);

        el.paused = false;
        el._fire("play");
        expect(findMasterGain(ctx).gain.value).toBe(1);
    });

    it("closes the master gate again on pause and on ended", async () => {
        const { createEffectPreview } = await freshModule();
        const el = makeFakeAudioEl(true);
        createEffectPreview(el).setEffect("radio");
        const ctx = FakeAudioContext.instances.at(-1);

        el.paused = false;
        el._fire("play");
        expect(findMasterGain(ctx).gain.value).toBe(1);

        el.paused = true;
        el._fire("pause");
        expect(findMasterGain(ctx).gain.value).toBe(0);

        el.paused = false;
        el._fire("play");
        el.paused = true;
        el._fire("ended");
        expect(findMasterGain(ctx).gain.value).toBe(0);
    });

    it("the 'phone' effect (no noise) also stays silent before playback -- the gate isn't only about the noise loop", async () => {
        const { createEffectPreview } = await freshModule();
        const el = makeFakeAudioEl(true);
        createEffectPreview(el).setEffect("phone");
        const ctx = FakeAudioContext.instances.at(-1);
        expect(findMasterGain(ctx).gain.value).toBe(0);
    });

    it("gracefully no-ops when the browser has no Web Audio support at all", async () => {
        window.AudioContext = undefined;
        const originalWebkit = window.webkitAudioContext;
        window.webkitAudioContext = undefined;
        const { createEffectPreview } = await freshModule();
        const el = makeFakeAudioEl(true);
        expect(() => createEffectPreview(el).setEffect("radio")).not.toThrow();
        window.webkitAudioContext = originalWebkit;
    });
});
