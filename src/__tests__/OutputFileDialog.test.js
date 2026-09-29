import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import OutputFileDialog from "../vo_dub_editor/OutputFileDialog.vue";
import { speedMatchLabel } from "../shared/speed_match.js";

describe("OutputFileDialog", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    function mountDialog(props = {}) {
        return mount(OutputFileDialog, {
            props: {
                visible: true,
                audioKey: "test_line_1",
                effect: "",
                normalize: false,
                speed: 1.0,
                enDurationS: 2.0,
                ruDurationS: 2.0,
                ...props,
            },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
    }

    it("the effect dropdown offers exactly the same options as EFFECT_OPTIONS", async () => {
        const wrapper = mountDialog();
        await wrapper.vm.$nextTick();
        
        // Find dropdown / select or check options in component instance / rendered DOM
        // PrimeVue Dropdown renders a container. Let's check vm or rendered items if open,
        // or we can verify the options prop/data directly on the component instance.
        const vm = wrapper.vm;
        expect(vm.effectOptions).toBeDefined();
        expect(vm.effectOptions).toEqual([
            { value: "", label: "No effect" },
            { value: "radio", label: "📻 Radio" },
            { value: "phone", label: "📞 Phone" },
            { value: "muffled", label: "🤫 Muffled" },
            { value: "radio_dry", label: "📻 Radio (no static)" },
            { value: "intercom", label: "🔊 Intercom" },
            { value: "suit", label: "🧑‍🚀 Suit" },
        ]);
        wrapper.unmount();
    });

    it("the speed button's caption is the label from speedMatchLabel for the given durations, and formats durations as EN X.Xs and RU Y.Ys", async () => {
        const wrapper = mountDialog({ enDurationS: 1.5, ruDurationS: 2.0 });
        await wrapper.vm.$nextTick();

        const expectedLabel = speedMatchLabel(1.5, 2.0).label; // e.g. "+33%"
        expect(wrapper.vm.speedMatchBtnLabel).toBe(expectedLabel);
        
        const text = document.body.textContent;
        expect(text).toContain("EN 1.5s");
        expect(text).toContain("RU 2.0s");
        expect(text).toContain(expectedLabel);
        wrapper.unmount();
    });

    it("the speed button is disabled when that label is empty - test equal durations and missing durations", async () => {
        // Equal durations -> label is "" -> button disabled
        const wrapperEqual = mountDialog({ enDurationS: 2.0, ruDurationS: 2.0 });
        await wrapperEqual.vm.$nextTick();
        expect(wrapperEqual.vm.speedMatchBtnLabel).toBe("");
        
        const btnEqual = wrapperEqual.find("button.speed-match-btn, button");
        // Let's check if the speed match button specifically or its disabled attribute is set
        expect(wrapperEqual.vm.isSpeedMatchDisabled).toBe(true);
        wrapperEqual.unmount();

        // Missing durations -> label is "" -> button disabled
        const wrapperMissing = mountDialog({ enDurationS: null, ruDurationS: null });
        await wrapperMissing.vm.$nextTick();
        expect(wrapperMissing.vm.speedMatchBtnLabel).toBe("");
        expect(wrapperMissing.vm.isSpeedMatchDisabled).toBe(true);
        wrapperMissing.unmount();
    });

    it("pressing the speed button does NOT emit apply", async () => {
        const wrapper = mountDialog({ enDurationS: 1.5, ruDurationS: 2.0 });
        await wrapper.vm.$nextTick();

        // Find and click speed match button
        const btn = wrapper.find(".speed-match-btn");
        if (btn.exists()) {
            await btn.trigger("click");
        } else {
            // fallback if class differs, invoke method or click button
            wrapper.vm.applySpeedMatch();
        }

        expect(wrapper.emitted("apply")).toBeUndefined();
        wrapper.unmount();
    });

    it("pressing Apply emits apply once, with current selections, including a speed set by the speed button beforehand", async () => {
        const wrapper = mountDialog({ enDurationS: 1.5, ruDurationS: 2.0, effect: "phone", normalize: false });
        await wrapper.vm.$nextTick();

        // Apply speed match first
        wrapper.vm.applySpeedMatch();
        await wrapper.vm.$nextTick();

        // Now press Apply button
        const applyBtn = wrapper.find(".apply-btn");
        if (applyBtn.exists()) {
            await applyBtn.trigger("click");
        } else {
            wrapper.vm.onApply();
        }

        const emittedApply = wrapper.emitted("apply");
        expect(emittedApply).toHaveLength(1);
        expect(emittedApply[0][0]).toEqual({
            effect: "phone",
            normalize: false,
            speed: speedMatchLabel(1.5, 2.0).ratio,
        });

        // Apply also closes the dialog (emits update:visible false)
        const emittedVisible = wrapper.emitted("update:visible");
        expect(emittedVisible).toBeTruthy();
        expect(emittedVisible[emittedVisible.length - 1]).toEqual([false]);

        wrapper.unmount();
    });

    // New test added per fix-09-tester brief: ensure Apply closes the dialog with a single update:visible emission.
    it("pressing Apply closes the dialog with a single update:visible emission", async () => {
        const wrapper = mountDialog({ enDurationS: 1.5, ruDurationS: 2.0, effect: "phone", normalize: false });
        await wrapper.vm.$nextTick();

        const applyBtn = wrapper.find(".apply-btn");
        if (applyBtn.exists()) {
            await applyBtn.trigger("click");
        } else {
            wrapper.vm.onApply();
        }

        const emittedVisible = wrapper.emitted("update:visible");
        // Exactly one emission should occur, with payload [false]
        expect(emittedVisible).toHaveLength(1);
        expect(emittedVisible[0]).toEqual([false]);

        wrapper.unmount();
    });

    it("changing a control and re-opening the dialog shows the prop values again, not the abandoned edit", async () => {
        const wrapper = mountDialog({ effect: "phone", normalize: false, speed: 1.0 });
        await wrapper.vm.$nextTick();

        // Change local state without applying
        wrapper.vm.localEffect = "radio";
        wrapper.vm.localNormalize = true;
        wrapper.vm.localSpeed = 1.5;

        // Re-open dialog (simulate visible changing from false to true, or props updating / re-seeding)
        await wrapper.setProps({ visible: false });
        await wrapper.setProps({ visible: true, effect: "phone", normalize: false, speed: 1.0 });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.localEffect).toBe("phone");
        expect(wrapper.vm.localNormalize).toBe(false);
        expect(wrapper.vm.localSpeed).toBe(1.0);

        wrapper.unmount();
    });
});
