import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import LineEditorApp from "../LineEditorApp.vue";
import { lineHash } from "../../shared/line_hash.js";

const SCRIPT_TEXT = "narrator | calm | First line.\nnarrator | calm | Second line.";

// No _state.json any more -- a line's voiced/fresh state is purely
// "does _audio\lines\<script>\ have a <position>_<version>_<hash>.wav
// whose hash matches this row's CURRENT (role-resolved) content" (see
// src/shared/line_hash.js). Builds a real filename the same way the app
// itself will compute the EXPECTED one, so these tests exercise the actual
// hashing path instead of a stand-in.
async function lineFileName(position, version, speaker, instruct, text) {
    const hash = await lineHash(speaker, instruct, text);
    return `${String(position).padStart(4, "0")}_${String(version).padStart(2, "0")}_${hash}.wav`;
}

function mockFetch(overrides = {}) {
    const files = new Map([
        ["Test_speakers.txt", SCRIPT_TEXT],
    ]);
    Object.entries(overrides.extraFiles || {}).forEach(([name, content]) => files.set(name, content));

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
            return { json: async () => ({ files: overrides.lineFiles || [], file_mtimes: {} }) };
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
        if (u.startsWith("/fl_cosyvoice3/script_library/reorganize_lines")) {
            overrides.onReorganize?.(JSON.parse(opts.body));
            return { json: async () => ({ deleted: [], moved: [] }) };
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

    it("deletes a line after confirming, and reorganizes the lines folder to close the gap", async () => {
        const onReorganize = vi.fn();
        const { wrapper } = await mountEditor({ onReorganize });
        const deleteBtns = [...document.querySelectorAll(".fl-line-row .p-button")].filter((b) => b.title === "Delete this line");
        deleteBtns[0].click();

        // ConfirmDialog renders into document.body via Teleport.
        await vi.waitFor(() => expect(document.querySelector(".p-confirm-dialog-accept")).toBeTruthy());
        document.querySelector(".p-confirm-dialog-accept").click();

        await vi.waitFor(() => expect(document.querySelectorAll(".fl-line-row").length).toBe(1));
        expect(lineTexts()).toEqual(["Second line."]);
        // Position 0 (the deleted row) is gone; position 1 (Second line.,
        // now the only row) shifts down to 0 -- see reorganizeLines.
        await vi.waitFor(() => expect(onReorganize).toHaveBeenCalledWith(
            expect.objectContaining({ deletes: [0], moves: [[1, 0]] }),
        ));
        wrapper.unmount();
    });

    it("re-voicing a fresh line is not offered as stale, but editing its text makes it so, and revoices with the new text at its position", async () => {
        const revoiceApi = { revoiceLine: vi.fn().mockResolvedValue(undefined) };
        const { wrapper } = await mountEditor({
            revoiceApi,
            lineFiles: [
                await lineFileName(0, 1, "narrator", "calm", "First line."),
                await lineFileName(1, 1, "narrator", "calm", "Second line."),
            ],
        });

        const revoiceBtn = document.querySelector(".revoice-btn");
        await vi.waitFor(() => expect(revoiceBtn.classList.contains("stale")).toBe(false));

        const textarea = [...document.querySelectorAll(".fl-textarea")][0];
        textarea.value = "First line, changed.";
        textarea.dispatchEvent(new Event("input"));
        await vi.waitFor(() => expect(revoiceBtn.classList.contains("stale")).toBe(true));

        revoiceBtn.click();
        await vi.waitFor(() => expect(revoiceApi.revoiceLine).toHaveBeenCalledWith(
            expect.objectContaining({ linePosition: 0, text: "First line, changed." }),
        ));
        wrapper.unmount();
    });

    it("re-voicing a line after Prev/Next passes the CURRENTLY open filename, not the one the editor first opened for", async () => {
        // Regression test: ScriptLibraryPanel's editScript() builds
        // revoiceApi.revoiceLine with a `file` closed over whatever script
        // was passed to openLineEditor -- that closure never updates when
        // this same editor instance switches to a different script via
        // Prev/Next (switchToFile only touches this component's own
        // filename ref). Re-voicing a line after navigating used to re-voice
        // into the ORIGINAL script's _audio\lines\ folder while the line
        // being edited (in the NEW script) kept showing its old audio.
        const revoiceApi = { revoiceLine: vi.fn().mockResolvedValue(undefined) };
        const { wrapper } = await mountEditor({
            revoiceApi,
            scriptList: ["Test_speakers.txt", "Second_speakers.txt"],
            extraFiles: { "Second_speakers.txt": "narrator | calm | Third line.\nnarrator | calm | Fourth line." },
        });

        const nextBtn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Next"));
        nextBtn.click();
        await vi.waitFor(() => expect(lineTexts()).toContain("Third line."));

        const textarea = [...document.querySelectorAll(".fl-textarea")][0];
        textarea.value = "Third line, changed.";
        textarea.dispatchEvent(new Event("input"));

        const revoiceBtn = document.querySelector(".revoice-btn");
        await vi.waitFor(() => expect(revoiceBtn.classList.contains("pending")).toBe(false));
        revoiceBtn.click();

        await vi.waitFor(() => expect(revoiceApi.revoiceLine).toHaveBeenCalledWith(
            expect.objectContaining({ text: "Third line, changed.", file: "Second_speakers.txt" }),
        ));
        wrapper.unmount();
    });

    it("re-voicing pins the output location to the folder this editor actually reads lines from", async () => {
        // The re-voiced file must land in the SAME _audio\lines\<base>\ this
        // editor lists (linesDirPath). Letting the backend re-derive that from
        // its own script_filter widget is a second, independent derivation of
        // the same name -- when the two drifted, the audio was written to
        // lines\<script>_speakers\ while the editor kept reading lines\<script>\,
        // so the edited line played its old take and the render looked like a
        // no-op despite completing without errors.
        const revoiceApi = { revoiceLine: vi.fn().mockResolvedValue(undefined) };
        const { wrapper } = await mountEditor({ revoiceApi });

        document.querySelector(".revoice-btn").click();

        await vi.waitFor(() => expect(revoiceApi.revoiceLine).toHaveBeenCalledWith(
            // "Test_speakers.txt" minus the "_speakers.txt" suffix -- the same
            // base name audioBaseName/linesDirPath resolve to.
            expect.objectContaining({ folder: "C:\\project\\Act01", baseName: "Test" }),
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

    it("marking Done stitches by line count, marks ready, and unchecks the header checkbox", async () => {
        const checkedApi = { isChecked: vi.fn(() => true), setChecked: vi.fn() };
        const onSetReady = vi.fn();
        const { wrapper } = await mountEditor({
            checkedApi,
            onSetReady,
            lineFiles: [
                await lineFileName(0, 1, "narrator", "calm", "First line."),
                await lineFileName(1, 1, "narrator", "calm", "Second line."),
            ],
        });

        const doneBtn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Done"));
        await vi.waitFor(() => expect(doneBtn.disabled).toBe(false));
        doneBtn.click();

        await vi.waitFor(() => expect(onSetReady).toHaveBeenCalledWith(expect.objectContaining({ filename: "Test_speakers.txt", ready: true })));
        expect(checkedApi.setChecked).toHaveBeenCalledWith("Test_speakers.txt", false);
        wrapper.unmount();
    });

    it("play button is present but disabled on an unvoiced line, and does nothing when clicked", async () => {
        const { wrapper } = await mountEditor();
        const playBtn = document.querySelectorAll(".play-btn")[0];
        expect(playBtn).toBeTruthy();
        expect(playBtn.classList.contains("disabled")).toBe(true);
        playBtn.click();
        await vi.waitFor(() => expect(document.querySelector(".fl-line-row").classList.contains("row-playing")).toBe(false));
        expect(playBtn.classList.contains("is-playing")).toBe(false);
        wrapper.unmount();
    });

    it("play button on a voiced line starts mode-1 playback, and clicking again stops it", async () => {
        const { wrapper } = await mountEditor({
            lineFiles: [
                await lineFileName(0, 1, "narrator", "calm", "First line."),
                await lineFileName(1, 1, "narrator", "calm", "Second line."),
            ],
        });

        const playBtn = document.querySelectorAll(".play-btn")[0];
        expect(playBtn.classList.contains("disabled")).toBe(false);

        playBtn.click();
        await vi.waitFor(() => expect(playBtn.classList.contains("is-playing")).toBe(true));
        expect(document.querySelectorAll(".fl-line-row")[0].classList.contains("row-playing")).toBe(true);

        playBtn.click();
        await vi.waitFor(() => expect(playBtn.classList.contains("is-playing")).toBe(false));
        wrapper.unmount();
    });

    it("play button still plays an old take even when its hash no longer matches the current text (stale, not absent)", async () => {
        // A latest-version file that doesn't match current content isn't
        // "nothing to play" -- rowHasAnyTake (position has SOME file) gates
        // playability, rowIsFresh (Done, "stale" styling) is a separate,
        // stricter check. Built from completely different text so its hash
        // can't coincidentally match "First line.".
        const { wrapper } = await mountEditor({
            lineFiles: [await lineFileName(0, 1, "narrator", "calm", "Some older take entirely.")],
        });

        const playBtn = document.querySelectorAll(".play-btn")[0];
        expect(playBtn.classList.contains("disabled")).toBe(false);

        playBtn.click();
        await vi.waitFor(() => expect(playBtn.classList.contains("is-playing")).toBe(true));
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
