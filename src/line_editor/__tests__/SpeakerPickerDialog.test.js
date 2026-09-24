import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import SpeakerPickerDialog from "../SpeakerPickerDialog.vue";

/*
 This suite exists for one specific failure mode. PrimeVue's Button and
 Card both declare `inheritAttrs: false`, so an @click / @click.stop
 written directly on <Button> is never attached to the native <button>
 underneath -- the click just keeps bubbling to the card row's own
 handler, and previewing a voice silently SELECTS it instead. The
 component defends against that with a plain <span> wrapper that owns the
 .stop; the comment explaining why kept getting removed along with the
 wrapper, so the guard is a test now instead of a comment.
*/
describe("SpeakerPickerDialog", () => {
    let originalAudio;
    let plays;

    beforeEach(() => {
        originalAudio = global.Audio;
        plays = [];
        global.Audio = class {
            constructor(src) { this.src = src; plays.push(src); }
            addEventListener() {}
            play() { return Promise.resolve(); }
            pause() {}
        };
    });

    afterEach(() => {
        global.Audio = originalAudio;
        document.body.innerHTML = "";
    });

    function mountPicker(props = {}) {
        return mount(SpeakerPickerDialog, {
            props: {
                visible: true,
                presets: ["voldemort", "hermione"],
                sampleDir: "C:\\models\\cosyvoice\\speaker",
                ...props,
            },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
    }

    /*
     Dialog Teleports its content to document.body on the next tick, so
     nothing is queryable until it lands (see the frontend skill's testing
     notes) -- every case here waits for the cards first.
    */
    async function cards() {
        await vi.waitFor(() => expect(document.querySelectorAll(".speaker-card-row").length).toBe(2));
    }

    it("plays a sample when the play button is clicked, and does NOT pick that speaker", async () => {
        const wrapper = mountPicker();
        await cards();

        document.querySelectorAll(".speaker-play-wrap")[0].click();

        expect(plays).toHaveLength(1);
        expect(plays[0]).toContain("voldemort.mp3");
        expect(wrapper.emitted("select")).toBeUndefined();
        expect(wrapper.emitted("update:visible")).toBeUndefined();
        wrapper.unmount();
    });

    it("picks the speaker when the card itself is clicked", async () => {
        const wrapper = mountPicker();
        await cards();

        document.querySelectorAll(".speaker-card-row")[1].click();

        expect(wrapper.emitted("select")[0]).toEqual(["hermione"]);
        expect(wrapper.emitted("update:visible")[0]).toEqual([false]);
        expect(plays).toHaveLength(0);
        wrapper.unmount();
    });

    it("offers no preview at all until the preset folder is known", async () => {
        const wrapper = mountPicker({ sampleDir: "" });
        await cards();

        document.querySelectorAll(".speaker-play-wrap")[0].click();

        expect(plays).toHaveLength(0);
        expect(wrapper.emitted("select")).toBeUndefined();
        wrapper.unmount();
    });
});
