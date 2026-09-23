import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import WaveformCanvas from "../WaveformCanvas.vue";

class FakeAudioContext {
    async decodeAudioData() {
        return { getChannelData: () => new Float32Array(64).fill(0.4) };
    }
}

describe("WaveformCanvas", () => {
    let originalFetch;
    let originalAudioContext;
    beforeEach(() => {
        originalFetch = global.fetch;
        originalAudioContext = window.AudioContext;
    });
    afterEach(() => {
        global.fetch = originalFetch;
        window.AudioContext = originalAudioContext;
        document.body.innerHTML = "";
    });

    it("clears the loading indicator once its file decodes successfully", async () => {
        window.AudioContext = FakeAudioContext;
        global.fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(200) });

        const wrapper = mount(WaveformCanvas, { props: { src: "http://x/audio.wav" }, attachTo: document.body });
        expect(wrapper.find(".waveform-canvas").exists()).toBe(true);
        await vi.waitFor(() => expect(wrapper.find(".waveform-status").exists()).toBe(false));
        wrapper.unmount();
    });

    it("shows a failure indicator instead of crashing when there's no Web Audio support", async () => {
        window.AudioContext = undefined;
        const originalWebkit = window.webkitAudioContext;
        window.webkitAudioContext = undefined;

        const wrapper = mount(WaveformCanvas, { props: { src: "http://x/audio.wav" }, attachTo: document.body });
        await vi.waitFor(() => expect(wrapper.find(".waveform-status").text()).toBe("⚠"));

        window.webkitAudioContext = originalWebkit;
        wrapper.unmount();
    });

    it("re-decodes when its src prop changes", async () => {
        window.AudioContext = FakeAudioContext;
        const fetchSpy = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(200) });
        global.fetch = fetchSpy;

        const wrapper = mount(WaveformCanvas, { props: { src: "http://x/a.wav" }, attachTo: document.body });
        await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

        await wrapper.setProps({ src: "http://x/b.wav" });
        await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
        expect(fetchSpy.mock.calls[1][0]).toBe("http://x/b.wav");
        wrapper.unmount();
    });
});
