import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import VoDubBrowserPanel from "../VoDubBrowserPanel.vue";

const ROOT = "C:\\vo\\Observation";
const TREE = {
    root: ROOT,
    buckets: [
        { bucket: "E1", count: 320, no_text: 7, needs_translation: 10, not_started: 303, stale: 0, done: 0 },
        { bucket: "Other", count: 243, no_text: 18, needs_translation: 2, not_started: 223, stale: 0, done: 0 },
    ],
};

function mockFetch(overrides = {}) {
    return vi.fn(async (url) => {
        const u = typeof url === "string" ? url : url.toString();
        if (u.startsWith("/fl_cosyvoice3/vo_dub/tree")) {
            return { json: async () => overrides.tree || TREE };
        }
        throw new Error(`unmocked fetch: ${u}`);
    });
}

describe("VoDubBrowserPanel", () => {
    let originalFetch;
    beforeEach(() => { originalFetch = global.fetch; });
    afterEach(() => {
        global.fetch = originalFetch;
        document.body.innerHTML = "";
    });

    function mountPanel(overrides = {}) {
        global.fetch = mockFetch(overrides);
        const openVoDubLineEditor = vi.fn();
        const wrapper = mount(VoDubBrowserPanel, {
            props: {
                node: {},
                projectRootWidget: { value: ROOT },
                openBrowseDialog: vi.fn(),
                openVoDubLineEditor,
                openDubRolesEditor: vi.fn(),
            },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        return { wrapper, openVoDubLineEditor };
    }

    it("lists every bucket with its per-status counts", async () => {
        const { wrapper } = mountPanel();
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-bucket-row")).toHaveLength(2));

        const e1 = document.querySelectorAll(".vo-dub-bucket-row")[0];
        expect(e1.textContent).toContain("E1");
        expect(e1.textContent).toContain("320");
        expect(e1.textContent).toContain("not started 303");
        wrapper.unmount();
    });

    it("opens the line editor for the clicked bucket, scoped to the current root", async () => {
        const { wrapper, openVoDubLineEditor } = mountPanel();
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-bucket-row")).toHaveLength(2));

        document.querySelectorAll(".vo-dub-bucket-row")[1].click();

        expect(openVoDubLineEditor).toHaveBeenCalledWith({ root: ROOT, bucket: "Other", renderApi: null });
        wrapper.unmount();
    });

    it("wires renderApi.renderRow to call queueVoDubRender with THIS panel's own node", async () => {
        const queueVoDubRender = vi.fn().mockResolvedValue(undefined);
        global.fetch = mockFetch();
        const node = { id: 7 };
        const openVoDubLineEditor = vi.fn();
        const wrapper = mount(VoDubBrowserPanel, {
            props: {
                node,
                projectRootWidget: { value: ROOT },
                openBrowseDialog: vi.fn(),
                openVoDubLineEditor,
                openDubRolesEditor: vi.fn(),
                queueVoDubRender,
            },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-bucket-row")).toHaveLength(2));

        document.querySelectorAll(".vo-dub-bucket-row")[0].click();
        const { renderApi } = openVoDubLineEditor.mock.calls[0][0];
        await renderApi.renderRow({ audioKey: "Loc_A" });

        expect(queueVoDubRender).toHaveBeenCalledWith(node, { audioKey: "Loc_A" });
        wrapper.unmount();
    });

    it("surfaces a server error instead of silently showing an empty list", async () => {
        const { wrapper } = mountPanel({ tree: { error: "not a folder: C:\\nope" } });
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-status").textContent).toContain("not a folder"));
        expect(document.querySelectorAll(".vo-dub-bucket-row")).toHaveLength(0);
        wrapper.unmount();
    });

    it("opens the roles editor for the current root", async () => {
        const openDubRolesEditor = vi.fn();
        global.fetch = mockFetch();
        const wrapper = mount(VoDubBrowserPanel, {
            props: {
                node: {},
                projectRootWidget: { value: ROOT },
                openBrowseDialog: vi.fn(),
                openVoDubLineEditor: vi.fn(),
                openDubRolesEditor,
            },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-bucket-row")).toHaveLength(2));

        const rolesBtn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Roles");
        rolesBtn.click();

        expect(openDubRolesEditor).toHaveBeenCalledWith({ root: ROOT });
        wrapper.unmount();
    });
});
