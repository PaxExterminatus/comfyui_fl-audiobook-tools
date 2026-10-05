import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import RowFilterBar from "../shared/RowFilterBar.vue";

describe("RowFilterBar", () => {
    const statusOptions = [
        { value: "no_text", label: "No text" },
        { value: "done", label: "Ready" },
    ];
    const tristates = [
        { key: "manuallyDone", label: "Done (manual)" },
        { key: "issues", label: "⚠ Issues" },
    ];

    function createWrapper(props = {}) {
        return mount(RowFilterBar, {
            props: {
                statusOptions,
                selectedStatuses: new Set(),
                tristates,
                tristateValues: { manuallyDone: "any", issues: "any" },
                hasActive: false,
                ...props,
            },
            global: {
                plugins: [PrimeVue],
            },
        });
    }

    it("renders status buttons with correct data attributes", () => {
        const wrapper = createWrapper({
            selectedStatuses: new Set(["done"]),
        });

        const btnNoText = wrapper.find('[data-status="no_text"]');
        const btnDone = wrapper.find('[data-status="done"]');

        expect(btnNoText.exists()).toBe(true);
        expect(btnNoText.attributes("aria-pressed")).toBe("false");
        
        expect(btnDone.exists()).toBe(true);
        expect(btnDone.attributes("aria-pressed")).toBe("true");
    });

    it("renders status buttons with correct labels", () => {
        const wrapper = createWrapper();
        
        statusOptions.forEach(opt => {
            const btn = wrapper.find(`[data-status="${opt.value}"]`);
            expect(btn.exists()).toBe(true);
            expect(btn.text()).toBe(opt.label);
        });
    });

    it("emits toggle-status when a status button is clicked", async () => {
        const wrapper = createWrapper();
        const btn = wrapper.find('[data-status="no_text"]');
        
        await btn.trigger("click");
        
        expect(wrapper.emitted("toggle-status")[0]).toEqual(["no_text"]);
    });

    it("renders tri-state buttons with correct state and labels", () => {
        const wrapper = createWrapper({
            tristateValues: {
                manuallyDone: "only",
                issues: "without",
            },
        });

        const btnDone = wrapper.find('[data-tristate="manuallyDone"]');
        const btnIssues = wrapper.find('[data-tristate="issues"]');

        expect(btnDone.attributes("data-state")).toBe("only");
        expect(btnDone.text()).toContain("Done (manual) ✓");

        expect(btnIssues.attributes("data-state")).toBe("without");
        expect(btnIssues.text()).toContain("⚠ Issues ✗");
    });

    it("renders tri-state button in 'any' state without mark", () => {
        const wrapper = createWrapper({
            tristateValues: { manuallyDone: "any", issues: "any" },
        });

        const btn = wrapper.find('[data-tristate="manuallyDone"]');
        expect(btn.attributes("data-state")).toBe("any");
        expect(btn.text()).toBe("Done (manual)");
    });

    it("a stateLabels entry replaces both the label and the mark for that state", () => {
        const named = [
            { key: "manuallyDone", label: "Done (manual)", stateLabels: { without: "Not done" } },
            { key: "issues", label: "⚠ Issues" },
        ];

        const without = createWrapper({
            tristates: named,
            tristateValues: { manuallyDone: "without", issues: "any" },
        });
        const btn = without.find('[data-tristate="manuallyDone"]');
        expect(btn.attributes("data-state")).toBe("without");
        expect(btn.text()).toBe("Not done");

        // States the map says nothing about keep the plain label plus its mark.
        const only = createWrapper({
            tristates: named,
            tristateValues: { manuallyDone: "only", issues: "any" },
        });
        expect(only.find('[data-tristate="manuallyDone"]').text()).toBe("Done (manual) ✓");
    });

    it("emits cycle-tristate when a tri-state button is clicked", async () => {
        const wrapper = createWrapper();
        const btn = wrapper.find('[data-tristate="manuallyDone"]');
        
        await btn.trigger("click");
        
        expect(wrapper.emitted("cycle-tristate")[0]).toEqual(["manuallyDone"]);
    });

    it("handles the clear button based on hasActive prop", async () => {
        // Case 1: Disabled when hasActive is false
        const wrapperDisabled = createWrapper({ hasActive: false });
        const btnDisabled = wrapperDisabled.find('[data-testid="filter-clear"]');
        expect(btnDisabled.element.disabled).toBe(true);

        // Case 2: Enabled when hasActive is true
        const wrapperEnabled = createWrapper({ hasActive: true });
        const btnEnabled = wrapperEnabled.find('[data-testid="filter-clear"]');
        expect(btnEnabled.element.disabled).toBe(false);
        
        await btnEnabled.trigger("click");
        expect(wrapperEnabled.emitted("clear")).toBeDefined();
    });
});
