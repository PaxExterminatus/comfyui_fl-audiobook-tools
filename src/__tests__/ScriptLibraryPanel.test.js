import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import ScriptLibraryPanel from "../script_library/ScriptLibraryPanel.vue";

function makeWidget(initial = "") {
    return { value: initial, callback: null };
}

function makeNode() {
    return { properties: {}, _flCheckedItems: [], setDirtyCanvas: vi.fn() };
}

const TREE = [
    {
        act: "Act01",
        scripts: ["Scene1_speakers.txt", "Scene2_speakers.txt"],
        audio_scripts: ["Scene1_speakers.txt"],
        ready_scripts: ["Scene2_speakers.txt"],
        pending_scripts: [],
        filter_applied: true,
    },
    {
        act: "Act02",
        scripts: ["Scene3_speakers.txt"],
        audio_scripts: [],
        ready_scripts: [],
        pending_scripts: ["Scene3_speakers.txt"],
        filter_applied: true,
    },
];

function mockFetch(overrides = {}) {
    return vi.fn(async (url, opts) => {
        const u = typeof url === "string" ? url : url.toString();
        if (u.startsWith("/fl_cosyvoice3/script_library/tree")) {
            return { json: async () => ({ tree: overrides.tree ?? TREE }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_library/pending_revoice")) {
            return { json: async () => (overrides.pendingRevoice ?? { scripts: [] }) };
        }
        throw new Error(`unmocked fetch: ${u}`);
    });
}

describe("ScriptLibraryPanel", () => {
    let originalFetch;
    afterEach(() => {
        global.fetch = originalFetch;
        document.body.innerHTML = "";
        try { localStorage.clear(); } catch (e) { /* noop */ }
    });

    function mountPanel(overrides = {}) {
        originalFetch = global.fetch;
        global.fetch = mockFetch(overrides);
        const node = overrides.node || makeNode();
        const folderWidget = overrides.folderWidget || makeWidget(overrides.folder ?? "C:\\project");
        const actWidget = makeWidget();
        const scriptFileWidget = makeWidget();
        const filterWidget = overrides.filterWidget;
        const openBrowseDialog = vi.fn();
        const openRolesEditor = vi.fn();
        const openLineEditor = vi.fn();
        const queueLineRevoice = overrides.queueLineRevoice || vi.fn().mockResolvedValue(undefined);
        const wrapper = mount(ScriptLibraryPanel, {
            props: {
                node, folderWidget, actWidget, scriptFileWidget, filterWidget,
                openBrowseDialog, openRolesEditor, openLineEditor, queueLineRevoice,
            },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        return { wrapper, node, folderWidget, actWidget, scriptFileWidget, openBrowseDialog, openRolesEditor, openLineEditor, queueLineRevoice };
    }

    it("loads the tree and shows both acts collapsed (only the active act auto-expands)", async () => {
        const { wrapper } = mountPanel();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Act01"));
        expect(document.body.textContent).toContain("Act02");
        expect(document.body.textContent).not.toContain("Scene3_speakers.txt");
        expect(document.body.textContent).toContain("Scene1_speakers.txt"); // Act01 auto-expanded (first act, becomes active)
        wrapper.unmount();
    });

    it("checking a script updates node._flCheckedItems and node.properties for persistence", async () => {
        const { wrapper, node } = mountPanel();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        const row = [...document.body.querySelectorAll(".script-row")].find((r) => r.textContent.includes("Scene1_speakers.txt"));
        const checkbox = row.querySelector(".row-checkbox");
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change"));

        expect(node._flCheckedItems).toEqual([{ act: "Act01", file: "Scene1_speakers.txt" }]);
        expect(node.properties.checkedScripts).toEqual(["Act01::Scene1_speakers.txt"]);
        wrapper.unmount();
    });

    it("disables the checkbox for a script marked ready, and 'All' skips it", async () => {
        const { wrapper, node } = mountPanel();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene2_speakers.txt"));

        const readyRow = [...document.body.querySelectorAll(".script-row")].find((r) => r.textContent.includes("Scene2_speakers.txt"));
        expect(readyRow.querySelector(".row-checkbox").disabled).toBe(true);

        const allBtn = [...document.body.querySelectorAll("button")].find((b) => b.textContent.includes("All"));
        allBtn.click();
        // Scene2 (ready) skipped; Scene1 and Act02's Scene3 (not ready) both checked.
        expect(node._flCheckedItems).toEqual([
            { act: "Act01", file: "Scene1_speakers.txt" },
            { act: "Act02", file: "Scene3_speakers.txt" },
        ]);
        wrapper.unmount();
    });

    it("shows the pending-revoice warning icon and the has-audio icon on the right rows", async () => {
        const { wrapper } = mountPanel();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        const audioRow = [...document.body.querySelectorAll(".script-row")].find((r) => r.textContent.includes("Scene1_speakers.txt"));
        expect(audioRow.textContent).toContain("🔊");

        /*
         Act02 isn't expanded (Act01 is the auto-active/expanded one) --
         expand it to see Scene3's pending warning icon.
        */
        const act02Row = [...document.body.querySelectorAll(".act-row")].find((r) => r.textContent.includes("Act02"));
        act02Row.click();
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene3_speakers.txt"));
        const pendingRow = [...document.body.querySelectorAll(".script-row")].find((r) => r.textContent.includes("Scene3_speakers.txt"));
        expect(pendingRow.textContent).toContain("⚠️");
        wrapper.unmount();
    });

    it("restores previously-checked scripts from node.properties on load", async () => {
        const node = makeNode();
        node.properties.checkedScripts = ["Act01::Scene1_speakers.txt"];
        const { wrapper } = mountPanel({ node });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        const row = [...document.body.querySelectorAll(".script-row")].find((r) => r.textContent.includes("Scene1_speakers.txt"));
        expect(row.querySelector(".row-checkbox").checked).toBe(true);
        wrapper.unmount();
    });

    it("'Re-voice pending' runs queueLineRevoice for each pending line", async () => {
        /*
         No follow-up "mark voiced" call any more -- there's nothing to
         flip (see nodes/script_library.py's script_pending_lines): the
         next tree refresh just re-hashes and finds a match.
        */
        const queueLineRevoice = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = mountPanel({
            queueLineRevoice,
            pendingRevoice: {
                scripts: [{
                    act: "Act01", file: "Scene1_speakers.txt", folder: "C:\\project\\Act01", base_name: "Scene1",
                    pending: [{ position: 3, speaker: "narrator", instruct: "calm", text: "Hello." }],
                }],
            },
        });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        const revoiceBtn = [...document.body.querySelectorAll("button")].find((b) => b.textContent.includes("Re-voice pending"));
        revoiceBtn.click();

        await vi.waitFor(() => expect(queueLineRevoice).toHaveBeenCalled());
        expect(queueLineRevoice.mock.calls[0][1]).toMatchObject({ act: "Act01", file: "Scene1_speakers.txt", linePosition: 3 });
        wrapper.unmount();
    });

    it("revoiceApi.revoiceLine forwards the CALLER's file, not the script it was opened for (Prev/Next in Line Editor)", async () => {
        /*
         editScript()'s revoiceApi.revoiceLine closes over `filename` as a
         fallback for scripts that never provide their own `file` -- but
         Line Editor's Prev/Next can switch the SAME open editor to a
         different script, and always passes its own current filename in
         opts.file. That must win over this closure's (now-stale) value --
         see LineEditorApp.vue's revoiceRow.
        */
        const queueLineRevoice = vi.fn().mockResolvedValue(undefined);
        const { wrapper, openLineEditor } = mountPanel({ queueLineRevoice });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        const editBtn = [...document.body.querySelectorAll(".edit-btn")][0];
        editBtn.click();
        expect(openLineEditor).toHaveBeenCalled();

        const { revoiceApi } = openLineEditor.mock.calls[0][0];
        await revoiceApi.revoiceLine({ file: "Scene2_speakers.txt", linePosition: 1, speaker: "narrator", instruct: "calm", text: "Hi." });

        expect(queueLineRevoice).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            act: "Act01", file: "Scene2_speakers.txt", linePosition: 1,
        }));
        wrapper.unmount();
    });

    it("picks up a script_filter value set AFTER mount (the widget is a plain object Vue can't observe)", async () => {
        /*
         Root cause of a silent audio-loss bug: `suffix` used to be
         computed(() => props.filterWidget?.value) -- but filterWidget is a
         plain LiteGraph widget object, so Vue never sees a mutation to its
         .value and the computed served its FIRST reading for the whole
         session. The backend meanwhile serializes the widget's real current
         value into every prompt. Once the two drifted, this panel and
         nodes/script_library.py derived different base names for the same
         script, and a re-voice wrote its audio into a parallel
         _audio\lines\<script>_speakers\ tree that the editor never reads
         from -- the line kept playing its old take, with no error anywhere.
        */
        const filterWidget = makeWidget("");
        const { wrapper, node, openLineEditor } = mountPanel({ filterWidget });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        /*
         ComfyUI applies a saved workflow's widget values after the node
         (and this panel) already exists -- exactly the mutation Vue can't
         observe on its own.
        */
        filterWidget.value = "_speakers.txt";
        node.onConfigure({});
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        const editBtn = [...document.body.querySelectorAll(".edit-btn")][0];
        editBtn.click();

        expect(openLineEditor).toHaveBeenCalledWith(expect.objectContaining({ suffix: "_speakers.txt" }));
        wrapper.unmount();
    });

    it("'Re-voice pending' pins each line's output folder to the scan's own folder/base_name", async () => {
        /*
         The backend must not re-derive where to write from its own
         script_filter widget -- see LineEditorApp's revoiceRow.
        */
        const queueLineRevoice = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = mountPanel({
            queueLineRevoice,
            pendingRevoice: {
                scripts: [{
                    act: "Act01", file: "Scene1_speakers.txt", folder: "C:\\project\\Act01", base_name: "Scene1",
                    pending: [{ id: 3, speaker: "narrator", instruct: "calm", text: "Hello." }],
                }],
            },
        });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        [...document.body.querySelectorAll("button")].find((b) => b.textContent.includes("Re-voice pending")).click();

        await vi.waitFor(() => expect(queueLineRevoice).toHaveBeenCalled());
        expect(queueLineRevoice.mock.calls[0][1]).toMatchObject({
            folder: "C:\\project\\Act01", baseName: "Scene1",
        });
        wrapper.unmount();
    });

    it("passes an empty script_filter through as-is to the Line Editor, not a hardcoded default", async () => {
        /*
         A blank script_filter is a deliberate, documented choice on the
         node (list every .txt file) -- and the backend's own
         strip_suffix_and_ext treats "" as "don't strip anything" when
         naming a script's audio/timing files on disk. Silently
         substituting "_speakers.txt" here made this component guess a
         DIFFERENT base name than the backend actually used, so the Line
         Editor could never find that script's audio/timing files (every
         per-line play button showing disabled) whenever a project left
         script_filter blank.
        */
        const { wrapper, openLineEditor } = mountPanel({ filterWidget: makeWidget("") });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Scene1_speakers.txt"));

        const editBtn = [...document.body.querySelectorAll(".edit-btn")][0];
        editBtn.click();

        expect(openLineEditor).toHaveBeenCalledWith(expect.objectContaining({ suffix: "" }));
        wrapper.unmount();
    });

    it("opens the browse dialog and reloads the tree on folder selection", async () => {
        const { wrapper, openBrowseDialog, folderWidget } = mountPanel({ folder: "" });
        await vi.waitFor(() => expect(document.body.textContent).toContain("No project folder set"));

        const browseBtn = document.body.querySelector(".browse-button");
        browseBtn.click();
        expect(openBrowseDialog).toHaveBeenCalled();

        const { onSelect } = openBrowseDialog.mock.calls[0][0];
        onSelect("C:\\project");
        expect(folderWidget.value).toBe("C:\\project");
        await vi.waitFor(() => expect(document.body.textContent).toContain("Act01"));
        wrapper.unmount();
    });
});
