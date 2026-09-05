import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import LineEditorApp from "../LineEditorApp.vue";

const SCRIPT_TEXT = "narrator | calm | First line.\nnarrator | calm | Second line.";

function mockFetch(overrides = {}) {
    const files = new Map([
        ["Test_speakers.txt", SCRIPT_TEXT],
    ]);
    if (overrides.stateJson) files.set("_state.json", overrides.stateJson);

    return vi.fn(async (url, opts) => {
        const u = typeof url === "string" ? url : url.toString();

        if (u.startsWith("/fl_cosyvoice3/script_editor/read")) {
            const params = new URL(u, "http://localhost").searchParams;
            const path = params.get("path") || "";
            const key = [...files.keys()].find((k) => path.endsWith(k));
            if (!key) return { json: async () => ({ exists: false, content: "", mtime: null }) };
            return { json: async () => ({ exists: true, content: files.get(key), mtime: 1 }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_editor/write")) {
            const body = JSON.parse(opts.body);
            const key = [...files.keys()].find((k) => body.path.endsWith(k)) || "Test_speakers.txt";
            files.set(key, body.content);
            overrides.onWrite?.(key, body.content);
            return { json: async () => ({ mtime: 2 }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/scan")) {
            return {
                json: async () => ({
                    instructions: { entries: overrides.instructions || [] },
                    roles: { entries: overrides.roles || [], path: "C:\\project\\_roles.json" },
                    scripts: overrides.scriptList || ["Test_speakers.txt"],
                    ready_scripts: overrides.readyScripts || [],
                }),
            };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/speaker_presets")) {
            return { json: async () => ({ presets: overrides.presets || [] }) };
        }
        if (u.startsWith("/fl_cosyvoice3/browse/list_dir")) {
            return { json: async () => ({ files: [], file_mtimes: {} }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/set_ready")) {
            overrides.onSetReady?.(JSON.parse(opts.body));
            return { json: async () => ({ ready: true, ready_scripts: ["Test_speakers.txt"] }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/stitch_lines")) {
            return { json: async () => ({ ok: true }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/delete_audio")) {
            return { json: async () => ({ deleted: [] }) };
        }
        throw new Error(`unmocked fetch: ${u}`);
    });
}

describe("LineEditorApp", () => {
    let originalFetch;
    beforeEach(() => { originalFetch = global.fetch; });
    afterEach(() => {
        global.fetch = originalFetch;
        vi.useRealTimers();
        document.body.innerHTML = "";
    });

    async function mountEditor(overrides = {}) {
        global.fetch = mockFetch(overrides);
        const onClose = vi.fn();
        const checkedApi = overrides.checkedApi || { isChecked: vi.fn(() => false), setChecked: vi.fn() };
        const revoiceApi = overrides.revoiceApi || { revoiceLine: vi.fn().mockResolvedValue(undefined) };
        const wrapper = mount(LineEditorApp, {
            props: {
                folder: "C:\\project\\Act01",
                filename: "Test_speakers.txt",
                suffix: "_speakers.txt",
                checkedApi,
                revoiceApi,
                onClose,
            },
            global: { plugins: [PrimeVue, ConfirmationService] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(lineTexts()).toContain("First line."));
        return { wrapper, onClose, checkedApi, revoiceApi };
    }

    function lineTexts() {
        return [...document.querySelectorAll(".fl-line-row .fl-textarea")].map((el) => el.value);
    }

    it("loads and renders every line from the script file", async () => {
        const { wrapper } = await mountEditor();
        expect(lineTexts()).toEqual(["First line.", "Second line."]);
        expect(document.querySelectorAll(".fl-line-row").length).toBe(2);
        wrapper.unmount();
    });

    it("saves after editing a line's text (debounced)", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onWrite });

        const textarea = [...document.querySelectorAll(".fl-textarea")][0];
        textarea.value = "First line, edited.";
        textarea.dispatchEvent(new Event("input"));

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const [, content] = onWrite.mock.calls.find(([key]) => key === "Test_speakers.txt");
        expect(content).toContain("First line, edited.");
        wrapper.unmount();
    });

    it("adds a new empty line at the end", async () => {
        const { wrapper } = await mountEditor();
        const addBtn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Add line"));
        addBtn.click();
        await vi.waitFor(() => expect(document.querySelectorAll(".fl-line-row").length).toBe(3));
        wrapper.unmount();
    });

    it("deletes a line after confirming", async () => {
        const { wrapper } = await mountEditor();
        const deleteBtns = [...document.querySelectorAll(".fl-line-row .p-button")].filter((b) => b.title === "Delete this line");
        deleteBtns[0].click();

        // ConfirmDialog renders into document.body via Teleport.
        await vi.waitFor(() => expect(document.querySelector(".p-confirm-dialog-accept")).toBeTruthy());
        document.querySelector(".p-confirm-dialog-accept").click();

        await vi.waitFor(() => expect(document.querySelectorAll(".fl-line-row").length).toBe(1));
        expect(lineTexts()).toEqual(["Second line."]);
        wrapper.unmount();
    });

    it("marks a line stale after editing it, and re-voicing it clears that", async () => {
        const revoiceApi = { revoiceLine: vi.fn().mockResolvedValue(undefined) };
        const { wrapper } = await mountEditor({
            revoiceApi,
            stateJson: JSON.stringify({ next_id: 3, lines: [{ id: 1, text: "First line.", status: "voiced" }, { id: 2, text: "Second line.", status: "voiced" }] }),
        });

        const textarea = [...document.querySelectorAll(".fl-textarea")][0];
        textarea.value = "First line, changed.";
        textarea.dispatchEvent(new Event("input"));

        const revoiceBtn = document.querySelector(".revoice-btn");
        await vi.waitFor(() => expect(revoiceBtn.classList.contains("pending")).toBe(false));
        revoiceBtn.click();

        await vi.waitFor(() => expect(revoiceApi.revoiceLine).toHaveBeenCalledWith(
            expect.objectContaining({ lineId: 1, text: "First line, changed." }),
        ));
        wrapper.unmount();
    });

    it("toggles the header checkbox through checkedApi", async () => {
        const checkedApi = { isChecked: vi.fn(() => false), setChecked: vi.fn() };
        const { wrapper } = await mountEditor({ checkedApi });

        const checkbox = document.querySelector(".row-checkbox");
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change"));

        expect(checkedApi.setChecked).toHaveBeenCalledWith("Test_speakers.txt", true);
        wrapper.unmount();
    });

    it("marking Done stitches, marks ready, and unchecks the header checkbox", async () => {
        const checkedApi = { isChecked: vi.fn(() => true), setChecked: vi.fn() };
        const onSetReady = vi.fn();
        const { wrapper } = await mountEditor({
            checkedApi,
            onSetReady,
            stateJson: JSON.stringify({ next_id: 3, lines: [{ id: 1, text: "First line.", status: "voiced" }, { id: 2, text: "Second line.", status: "voiced" }] }),
        });

        const doneBtn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Done"));
        await vi.waitFor(() => expect(doneBtn.disabled).toBe(false));
        doneBtn.click();

        await vi.waitFor(() => expect(onSetReady).toHaveBeenCalledWith(expect.objectContaining({ filename: "Test_speakers.txt", ready: true })));
        expect(checkedApi.setChecked).toHaveBeenCalledWith("Test_speakers.txt", false);
        wrapper.unmount();
    });

    it("calls onClose when the dialog's own close button is clicked", async () => {
        const { wrapper, onClose } = await mountEditor();
        const closeBtn = document.body.querySelector(".p-dialog-header-close, .p-dialog-header-icon");
        expect(closeBtn).toBeTruthy();
        closeBtn.click();
        await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
        wrapper.unmount();
    });
});
