import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import RolesEditorApp from "../RolesEditorApp.vue";

function mockFetchResponses(overrides = {}) {
    const rolesContent =
        overrides.rolesContent ??
        JSON.stringify({
            roles: [{ code: "narrator", name: "Narrator", speaker: "arestovich", description: "Calm." }],
        });
    return vi.fn(async (url, opts) => {
        const u = typeof url === "string" ? url : url.toString();
        if (u.startsWith("/fl_cosyvoice3/script_editor/read")) {
            return { json: async () => ({ exists: true, content: rolesContent, mtime: 1 }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_editor/write")) {
            overrides.onWrite?.(JSON.parse(opts.body));
            return { json: async () => ({ mtime: 2 }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/speaker_presets")) {
            return { json: async () => ({ presets: ["arestovich", "monetochka"] }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/mark_role_stale")) {
            overrides.onMarkStale?.(JSON.parse(opts.body));
            return { json: async () => ({ changed: [], untracked: [] }) };
        }
        throw new Error(`unmocked fetch: ${u}`);
    });
}

describe("RolesEditorApp", () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.useRealTimers();
        document.body.innerHTML = "";
        localStorage.clear();
    });

    async function mountApp(overrides = {}) {
        global.fetch = mockFetchResponses(overrides);
        const onClose = vi.fn();
        const wrapper = mount(RolesEditorApp, {
            props: { root: "C:\\fake\\project", suffix: "_speakers.txt", onClose },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        // Dialog teleports its content to document.body, and onMounted's
        // loadFromDisk() is async -- wait for the real DOM to reflect it
        // rather than asserting against `wrapper` (which only sees what
        // stayed in the component's own tree pre-teleport).
        await vi.waitFor(() => expect(document.body.textContent).toContain("narrator"));
        return { wrapper, onClose };
    }

    it("loads and renders roles from the backend", async () => {
        const { wrapper } = await mountApp();
        expect(document.body.textContent).toContain("Narrator");
        wrapper.unmount();
    });

    it("resizes via the width preset buttons and persists the choice, same system as the Line Editor", async () => {
        // PrimeVue's Dialog merges its own internal positioning style with
        // the `:style` prop we pass in a way happy-dom doesn't reproduce
        // (confirmed working live in a real browser -- width visibly
        // changes and the merged inline style shows the new value) --
        // asserting against localStorage instead verifies the actual logic
        // this component owns (usePanelWidth's setWidth), rather than
        // PrimeVue's own internal DOM merging.
        const { wrapper } = await mountApp();

        const btn900 = [...document.body.querySelectorAll("button")].find((b) => b.textContent.trim() === "900");
        btn900.click();
        expect(localStorage.getItem("FL_CosyVoice3.RolesEditor.widthPx")).toBe("900");

        const btnFull = [...document.body.querySelectorAll("button")].find((b) => b.textContent.trim() === "100%");
        btnFull.click();
        expect(localStorage.getItem("FL_CosyVoice3.RolesEditor.widthPx")).toBe("full");
        wrapper.unmount();
    });

    it("shows every role's speaker/description fields at once, with no expand step", async () => {
        const { wrapper } = await mountApp();
        expect(document.body.querySelector(".role-speaker input").value).toBe("arestovich");
        expect(document.body.querySelector("textarea.role-description").value).toBe("Calm.");
        wrapper.unmount();
    });

    it("saves after editing a description (debounced)", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountApp({ onWrite });

        const textarea = document.body.querySelector("textarea.role-description");
        textarea.value = "Calm, updated.";
        textarea.dispatchEvent(new Event("input"));

        vi.advanceTimersByTime(700); // past the 600ms save debounce
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());

        const written = onWrite.mock.calls[0][0];
        expect(JSON.parse(written.content).roles[0].description).toBe("Calm, updated.");
        wrapper.unmount();
    });

    it("scans for stale lines when a speaker value is committed via blur", async () => {
        const onMarkStale = vi.fn();
        const { wrapper } = await mountApp({ onMarkStale });

        const input = document.body.querySelector(".role-speaker input");
        input.value = "monetochka";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("blur"));

        await vi.waitFor(() => expect(onMarkStale).toHaveBeenCalled());
        expect(onMarkStale.mock.calls[0][0]).toEqual({
            root: "C:\\fake\\project",
            role_code: "narrator",
            suffix: "_speakers.txt",
        });
        wrapper.unmount();
    });

    it("does not re-scan when blurring without changing the speaker", async () => {
        const onMarkStale = vi.fn();
        const { wrapper } = await mountApp({ onMarkStale });

        const input = document.body.querySelector(".role-speaker input");
        input.dispatchEvent(new Event("blur"));
        await new Promise((r) => setTimeout(r, 10));

        expect(onMarkStale).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it("calls onClose when the dialog's own close button is clicked", async () => {
        const { wrapper, onClose } = await mountApp();

        const closeBtn = document.body.querySelector(".p-dialog-header-close, .p-dialog-header-icon");
        expect(closeBtn).toBeTruthy();
        closeBtn.click();

        await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
        wrapper.unmount();
    });

    it("shows the empty state when there are no roles", async () => {
        global.fetch = mockFetchResponses({ rolesContent: JSON.stringify({ roles: [] }) });
        const wrapper = mount(RolesEditorApp, {
            props: { root: "C:\\fake\\project", suffix: "_speakers.txt", onClose: vi.fn() },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(document.body.textContent).toContain("No roles found"));
        wrapper.unmount();
    });
});
