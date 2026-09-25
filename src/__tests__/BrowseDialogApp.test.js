import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import BrowseDialogApp from "../browse_dialog/BrowseDialogApp.vue";

function mockListDir(byPath) {
    return vi.fn(async (url) => {
        const u = typeof url === "string" ? url : url.toString();
        const params = new URL(u, "http://localhost").searchParams;
        const path = params.get("path") || "";
        const ext = params.get("ext") || "";
        const entry = byPath[path];
        if (!entry) return { json: async () => ({ error: `not a folder: ${path}` }) };
        const files = ext ? (entry.files || []).filter((f) => f.toLowerCase().endsWith(ext)) : entry.files || [];
        return {
            json: async () => ({
                path,
                parent: entry.parent ?? null,
                dirs: entry.dirs || [],
                files,
                drives: entry.drives || [],
            }),
        };
    });
}

const FS = {
    "C:\\project": { parent: null, dirs: ["Act01"], files: ["notes.txt"] },
    "C:\\project\\Act01": { parent: "C:\\project", dirs: [], files: ["Scene1_speakers.txt"] },
};

describe("BrowseDialogApp", () => {
    let originalFetch;
    afterEach(() => {
        global.fetch = originalFetch;
        document.body.innerHTML = "";
    });

    function mountApp(overrides = {}) {
        originalFetch = global.fetch;
        global.fetch = mockListDir(overrides.fs || FS);
        const onSelect = vi.fn();
        const onClose = vi.fn();
        const wrapper = mount(BrowseDialogApp, {
            props: {
                mode: overrides.mode || "folder",
                startPath: overrides.startPath ?? "C:\\project",
                ext: overrides.ext || "",
                onSelect,
                onClose,
            },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        return { wrapper, onSelect, onClose };
    }

    it("lists the starting directory's folders", async () => {
        const { wrapper } = mountApp();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Act01"));
        wrapper.unmount();
    });

    it("navigates into a subfolder on click", async () => {
        const { wrapper } = mountApp();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Act01"));

        const row = [...document.body.querySelectorAll(".browse-row")].find((r) => r.textContent.includes("Act01"));
        row.click();

        await vi.waitFor(() => expect(document.body.querySelector(".browse-path-input").value).toBe("C:\\project\\Act01"));
        wrapper.unmount();
    });

    it("in folder mode, enables Select and returns the current directory", async () => {
        const { wrapper, onSelect, onClose } = mountApp();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Act01"));

        const selectBtn = [...document.body.querySelectorAll("button")].find((b) => b.textContent.includes("Select This Folder"));
        expect(selectBtn.disabled).toBe(false);
        selectBtn.click();

        expect(onSelect).toHaveBeenCalledWith("C:\\project");
        expect(onClose).toHaveBeenCalled();
        wrapper.unmount();
    });

    it("in file mode, only lists matching extensions and disables Select until a file is picked", async () => {
        const { wrapper, onSelect } = mountApp({ mode: "file", ext: ".txt" });
        await vi.waitFor(() => expect(document.body.textContent).toContain("notes.txt"));

        let selectBtn = [...document.body.querySelectorAll("button")].find((b) => b.textContent.includes("Select File"));
        expect(selectBtn.disabled).toBe(true);

        const row = [...document.body.querySelectorAll(".browse-row")].find((r) => r.textContent.includes("notes.txt"));
        row.click();
        await vi.waitFor(() => {
            selectBtn = [...document.body.querySelectorAll("button")].find((b) => b.textContent.includes("Select File"));
            expect(selectBtn.disabled).toBe(false);
        });

        selectBtn.click();
        expect(onSelect).toHaveBeenCalledWith("C:\\project\\notes.txt");
        wrapper.unmount();
    });

    it("shows the backend's error message instead of a listing", async () => {
        const { wrapper } = mountApp({ startPath: "C:\\missing", fs: {} });
        await vi.waitFor(() => expect(document.body.textContent).toContain("not a folder: C:\\missing"));
        wrapper.unmount();
    });

    it("calls onClose when the dialog's own close button is clicked", async () => {
        const { wrapper, onClose } = mountApp();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Act01"));

        const closeBtn = document.body.querySelector(".p-dialog-header-close, .p-dialog-header-icon");
        closeBtn.click();

        await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
        wrapper.unmount();
    });
});
