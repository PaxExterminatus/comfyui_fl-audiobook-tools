import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import VoDubLineEditor from "../vo_dub_editor/VoDubLineEditor.vue";
import OutputFileDialog from "../vo_dub_editor/OutputFileDialog.vue";
import { lineHash } from "../vo_dub_editor/../shared/line_hash.js";

// Constants copied from existing tests
const ROOT = "C:\\vo\\Observation";
const STATE_PATH = "C:\\vo\\Observation\\_dub_state.json";
const VO_DUB_API = "/fl_cosyvoice3/vo_dub"; // used by mockFetch

function mockFetch(overrides = {}) {
    const state = overrides.state || { rows: {} };
    const renderRow = overrides.renderRow || (async () => {});
    return vi.fn(async (url, opts) => {
        const u = typeof url === "string" ? url : url.toString();
        if (u.startsWith("/fl_cosyvoice3/script_editor/read")) {
            const path = new URL(u, "http://localhost").searchParams.get("path");
            if (path === STATE_PATH) {
                return { json: async () => ({ exists: true, content: JSON.stringify(state), mtime: 1 }) };
            }
        }
        if (u.startsWith("/fl_cosyvoice3/vo_dub/apply_effect")) {
            const body = JSON.parse(opts.body);
            overrides.onApplyEffect?.(body);
            if (overrides.applyEffectError) {
                return { json: async () => ({ error: overrides.applyEffectError }) };
            }
            return { json: async () => ({ ok: true }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_editor/write")) {
            const body = JSON.parse(opts.body);
            overrides.onWrite?.(body);
            return { json: async () => ({ mtime: 2 }) };
        }
        if (u.startsWith("/fl_cosyvoice3/vo_dub/rows")) {
            // Return the default rows used by other tests
            const ROWS_E1 = [
                {
                    audio_key: "Loc_E1_S1_A", episode: "1", speaker: "Ellie", speaker_tag: "Ellie",
                    english: "Hello.", russian: "Привет.", instruct: "", duration_s: 2.5, channels: 1,
                    status: "not_started", rendered_duration_s: null,
                },
                {
                    audio_key: "Loc_E1_S1_B", episode: "1", speaker: "Sam", speaker_tag: "Sam",
                    english: "Wait.", russian: "Подожди.", instruct: "Speak calmly.", duration_s: 3.0, channels: 1,
                    status: "done", rendered_duration_s: 3.1,
                },
            ];
            return { json: async () => ({ root: ROOT, bucket: "E1", rows: JSON.parse(JSON.stringify(ROWS_E1)) }) };
        }
        throw new Error(`unmocked fetch: ${u}`);
    });
}

async function mountEditor(overrides = {}) {
    global.fetch = mockFetch(overrides);
    const wrapper = mount(VoDubLineEditor, {
        props: { root: ROOT, bucket: "E1", onClose: vi.fn(), renderApi: overrides.renderApi },
        global: { plugins: [PrimeVue] },
        attachTo: document.body,
    });
    // Wait for rows to be rendered
    await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-row-js").length).toBeGreaterThan(0));
    return { wrapper };
}

describe("VoDub Output Wiring", () => {
    beforeEach(() => {
        // No special setup needed beyond mountEditor
    });
    afterEach(() => {
        document.body.innerHTML = "";
        vi.useRealTimers();
    });

    it("shows the output settings button and disables it on rows without a take", async () => {
        const { wrapper } = await mountEditor();
        const rows = document.querySelectorAll(".vo-dub-row-js");
        const btnA = rows[0].querySelector(".output-settings-btn");
        const btnB = rows[1].querySelector(".output-settings-btn");
        expect(btnA).toBeTruthy();
        expect(btnA.disabled).toBe(true);
        expect(btnB).toBeTruthy();
        expect(btnB.disabled).toBe(false);
        wrapper.unmount();
    });

    it("opens OutputFileDialog with the row's current effect, normalize, and speed as props", async () => {
        const { wrapper } = await mountEditor();
        const rows = document.querySelectorAll(".vo-dub-row-js");
        const btnB = rows[1].querySelector(".output-settings-btn");
        btnB.click();
        // Wait for the dialog component to appear
        await vi.waitFor(() => {
            const dlg = wrapper.findComponent({ name: "OutputFileDialog" });
            return dlg.exists() && dlg.props("visible") === true;
        });
        const dialog = wrapper.findComponent({ name: "OutputFileDialog" });
        // Expect default values (no effect, not normalized, speed 1.0)
        expect(dialog.props("effect")).toBe("");
        expect(dialog.props("normalize")).toBe(false);
        expect(dialog.props("speed")).toBeCloseTo(1.0);
        wrapper.unmount();
    });

    it("passes ruDurationS falling back to rendered_duration_s when no measured duration exists", async () => {
        const { wrapper } = await mountEditor();
        const rows = document.querySelectorAll(".vo-dub-row-js");
        const btnB = rows[1].querySelector(".output-settings-btn");
        btnB.click();
        await vi.waitFor(() => {
            const dlg = wrapper.findComponent({ name: "OutputFileDialog" });
            return dlg.exists();
        });
        const dialog = wrapper.findComponent({ name: "OutputFileDialog" });
        // For row B, rendered_duration_s is 3.1, and there is no measuredDuration yet.
        // The dialog should receive ruDurationS = 3.1.
        expect(dialog.props("ruDurationS")).toBeCloseTo(3.1);
        wrapper.unmount();
    });

    it("applying via the dialog POSTs to /apply_effect with all fields and updates state", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onApplyEffect = vi.fn();
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onApplyEffect, onWrite });
        const rows = document.querySelectorAll(".vo-dub-row-js");
        const rowB = rows[1];
        const btn = rowB.querySelector(".output-settings-btn");
        btn.click();
        await vi.waitFor(() => wrapper.findComponent({ name: "OutputFileDialog" }).exists());
        const dialog = wrapper.findComponent({ name: "OutputFileDialog" });
        // Change effect to "radio"
        const effectDropdown = dialog.findComponent({ name: "Dropdown" });
        await effectDropdown.vm.$emit("update:modelValue", "radio");
        // Toggle normalize on
        const normalizeCheckbox = dialog.findComponent({ name: "Checkbox" });
        await normalizeCheckbox.vm.$emit("update:modelValue", true);
        // Click Apply
        const applyBtn = dialog.find("button.apply-btn");
        applyBtn.trigger("click");
        // Wait for applyEffect to be called
        await vi.waitFor(() => expect(onApplyEffect).toHaveBeenCalled());
        const body = onApplyEffect.mock.calls[0][0];
        expect(body).toMatchObject({
            root: ROOT,
            audio_key: "Loc_E1_S1_B",
            effect: "radio",
            normalize: true,
            speed: 1.0,
        });
        // Verify state write includes the new settings
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const writeBody = onWrite.mock.calls.find((c) => c[0].path === STATE_PATH)[0];
        const content = JSON.parse(writeBody.content);
        expect(content.rows["Loc_E1_S1_B"].effect).toBe("radio");
        expect(content.rows["Loc_E1_S1_B"].normalize).toBe(true);
        expect(content.rows["Loc_E1_S1_B"].speed).toBeCloseTo(1.0);
        wrapper.unmount();
    });

    it("failed apply leaves a status message and does not clear dialog settings", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const applyError = "no dry take yet for this row -- render it once first";
        const onApplyEffect = vi.fn();
        const { wrapper } = await mountEditor({ onApplyEffect, applyEffectError: applyError });
        const rows = document.querySelectorAll(".vo-dub-row-js");
        const rowB = rows[1];
        const btn = rowB.querySelector(".output-settings-btn");
        btn.click();
        await vi.waitFor(() => wrapper.findComponent({ name: "OutputFileDialog" }).exists());
        const dialog = wrapper.findComponent({ name: "OutputFileDialog" });
        const effectDropdown = dialog.findComponent({ name: "Dropdown" });
        await effectDropdown.vm.$emit("update:modelValue", "radio");
        const applyBtn = dialog.find("button.apply-btn");
        applyBtn.trigger("click");
        await vi.waitFor(() => expect(onApplyEffect).toHaveBeenCalled());
        // Status line should contain the error
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-editor-status-js").textContent).toContain("no dry take"));
        // Settings should still be in state (we can't inspect directly, but ensure they weren't cleared)
        // The dialog should still show the chosen effect after error
        expect(dialog.props("effect")).toBe("radio");
        wrapper.unmount();
    });
});
