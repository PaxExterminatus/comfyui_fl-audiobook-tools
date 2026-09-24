import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import VoDubLineEditor from "../VoDubLineEditor.vue";
import RoleDropdown from "../../shared/RoleDropdown.vue";
import InstructPickerDialog from "../../shared/InstructPickerDialog.vue";
import { lineHash } from "../../shared/line_hash.js";

const ROOT = "C:\\vo\\Observation";
const STATE_PATH = "C:\\vo\\Observation\\_dub_state.json";
const ROLES_PATH = "C:\\vo\\Observation\\_dub_roles.json";
const INSTRUCT_PATH = "C:\\vo\\Observation\\_instruct_categories.json";

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

function mockFetch(overrides = {}) {
    const state = overrides.state || { rows: {} };

    return vi.fn(async (url, opts) => {
        const u = typeof url === "string" ? url : url.toString();

        if (u.startsWith("/fl_cosyvoice3/script_editor/read")) {
            const path = new URL(u, "http://localhost").searchParams.get("path");
            if (path === STATE_PATH) {
                return { json: async () => ({ exists: true, content: JSON.stringify(state), mtime: 1 }) };
            }
            if (path === ROLES_PATH) {
                if (!overrides.roles) return { json: async () => ({ exists: false, content: "", mtime: null }) };
                return { json: async () => ({ exists: true, content: JSON.stringify({ roles: overrides.roles }), mtime: 1 }) };
            }
            if (path === INSTRUCT_PATH) {
                if (!overrides.instructCategories) return { json: async () => ({ exists: false, content: "", mtime: null }) };
                return { json: async () => ({ exists: true, content: JSON.stringify({ categories: overrides.instructCategories }), mtime: 1 }) };
            }
            return { json: async () => ({ exists: false, content: "", mtime: null }) };
        }
        if (u.startsWith("/fl_cosyvoice3/script_editor/write")) {
            const body = JSON.parse(opts.body);
            overrides.onWrite?.(body);
            return { json: async () => ({ mtime: 2 }) };
        }
        if (u.startsWith("/fl_cosyvoice3/vo_dub/rows")) {
            /*
             A real fetch always JSON-round-trips -- returning the SAME
             array/object references on every call (instead of a fresh
             deserialization) would let a raw in-place mutation of the
             test's own `rows` (bypassing Vue's reactivity proxy entirely)
             masquerade as a real backend update, hiding bugs a real
             fetch could never hide.
            */
            return { json: async () => ({ root: ROOT, bucket: "E1", rows: JSON.parse(JSON.stringify(overrides.rows || ROWS_E1)) }) };
        }
        if (u.startsWith("/fl_cosyvoice3/vo_dub/mark_rendered")) {
            overrides.onMarkRendered?.(JSON.parse(opts.body));
            return { json: async () => ({ ok: true }) };
        }
        if (u.startsWith("/fl_cosyvoice3/vo_dub/apply_effect")) {
            const body = JSON.parse(opts.body);
            overrides.onApplyEffect?.(body);
            if (overrides.applyEffectError) return { json: async () => ({ error: overrides.applyEffectError }) };
            return { json: async () => ({ ok: true }) };
        }
        throw new Error(`unmocked fetch: ${u}`);
    });
}

describe("VoDubLineEditor", () => {
    let originalFetch;
    let originalAudio;
    beforeEach(() => {
        originalFetch = global.fetch;
        originalAudio = global.Audio;
        /*
         renderRow's measureDuration() does a one-off `new Audio()` probe
         of the file it just rendered (see that function's own comment --
         distinct from the list's own preload="none" players, which never
         construct one). happy-dom's real HTMLAudioElement never fires
         loadedmetadata/error on its own, so without this every render
         test would hang on measureDuration's 8s fallback timeout.
        */
        global.Audio = class {
            constructor() { this.duration = 4.2; }
            addEventListener(event, cb) {
                if (event === "loadedmetadata") queueMicrotask(cb);
            }
            removeEventListener() {}
        };
    });
    afterEach(() => {
        global.fetch = originalFetch;
        global.Audio = originalAudio;
        vi.useRealTimers();
        document.body.innerHTML = "";
    });

    async function mountEditor(overrides = {}) {
        global.fetch = mockFetch(overrides);
        const onClose = vi.fn();
        const wrapper = mount(VoDubLineEditor, {
            props: { root: ROOT, bucket: "E1", onClose, renderApi: overrides.renderApi },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-row").length).toBeGreaterThan(0));
        return { wrapper, onClose };
    }

    it("renders both English and Russian players pointed at audio_en/audio_ru with the SAME filename", async () => {
        const { wrapper } = await mountEditor();

        const players = document.querySelectorAll(".vo-dub-row")[0].querySelectorAll("audio");
        const enSrc = decodeURIComponent(players[0].getAttribute("src"));
        expect(enSrc).toContain("audio_en");
        expect(enSrc).toContain("Loc_E1_S1_A.wav");

        // Row A has no take yet -- no RU <audio> at all, just the placeholder text.
        expect(players).toHaveLength(1);
        expect(document.querySelectorAll(".vo-dub-row")[0].textContent).toContain("not rendered yet");
        wrapper.unmount();
    });

    it("shows the RU player for a row with an existing take, pointed at audio_ru with the same filename", async () => {
        const { wrapper } = await mountEditor();

        const rowB = document.querySelectorAll(".vo-dub-row")[1];
        const players = rowB.querySelectorAll("audio");
        expect(players).toHaveLength(2);
        const ruSrc = decodeURIComponent(players[1].getAttribute("src"));
        expect(ruSrc).toContain("audio_ru");
        expect(ruSrc).toContain("Loc_E1_S1_B.wav");
        wrapper.unmount();
    });

    it("shows a waveform for the EN player always, and for RU only once a take exists", async () => {
        const { wrapper } = await mountEditor();

        const rowA = document.querySelectorAll(".vo-dub-row")[0]; // no RU take
        expect(rowA.querySelectorAll(".waveform-canvas")).toHaveLength(1);

        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // has a take
        expect(rowB.querySelectorAll(".waveform-canvas")).toHaveLength(2);
        wrapper.unmount();
    });

    it("shows EN's own duration and RU's duration+delta on one left-aligned label line", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // duration_s = 3.0, rendered_duration_s = 3.1
        const labels = rowB.querySelector(".vo-dub-players-labels");
        expect(labels.textContent).toContain("3.0s");
        expect(labels.textContent).toContain("RU");
        wrapper.unmount();
    });

    it("colors the duration badge green/amber/red by how far the measured take drifts from the original", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // duration_s = 3.0
        const ruAudio = rowB.querySelectorAll("audio")[1];

        Object.defineProperty(ruAudio, "duration", { value: 3.1, configurable: true }); // +3.3% -> good
        ruAudio.dispatchEvent(new Event("loadedmetadata"));
        await vi.waitFor(() => expect(rowB.querySelector(".vo-dub-duration-tag")).toBeTruthy());
        expect(rowB.querySelector(".vo-dub-duration-tag").className).toContain("badge-good");
        expect(rowB.querySelector(".vo-dub-duration-delta").className).toContain("badge-good");

        Object.defineProperty(ruAudio, "duration", { value: 3.9, configurable: true }); // +30% -> comfortably in the amber band
        ruAudio.dispatchEvent(new Event("loadedmetadata"));
        await vi.waitFor(() => expect(rowB.querySelector(".vo-dub-duration-tag").className).toContain("badge-warn"));

        Object.defineProperty(ruAudio, "duration", { value: 6.0, configurable: true }); // +100% -> bad
        ruAudio.dispatchEvent(new Event("loadedmetadata"));
        await vi.waitFor(() => expect(rowB.querySelector(".vo-dub-duration-tag").className).toContain("badge-bad"));
        wrapper.unmount();
    });

    // ── manual "Done" override (nodes/vo_dub_library.py's manually_done) ─
    it("offers a Mark-done button only for a row that already has a take", async () => {
        const { wrapper } = await mountEditor();
        const rowA = document.querySelectorAll(".vo-dub-row")[0]; // not_started, no take
        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // done, has a take
        expect(rowA.querySelector(".vo-dub-done-btn")).toBeNull();
        expect(rowB.querySelector(".vo-dub-done-btn")).toBeTruthy();
        wrapper.unmount();
    });

    it("clicking Mark done toggles and persists manually_done, and flips the button's own icon", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onWrite });
        const rowB = document.querySelectorAll(".vo-dub-row")[1];

        const doneBtn = rowB.querySelector(".vo-dub-done-btn");
        expect(doneBtn.classList.contains("active")).toBe(false);
        doneBtn.click();
        await vi.waitFor(() => expect(doneBtn.querySelector(".pi-check-circle")).toBeTruthy());
        expect(doneBtn.classList.contains("active")).toBe(true);

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite.mock.calls.some((c) => c[0].path === STATE_PATH)).toBe(true));
        const write = onWrite.mock.calls.find((c) => c[0].path === STATE_PATH);
        expect(JSON.parse(write[0].content).rows["Loc_E1_S1_B"].manually_done).toBe(true);

        // Click again -- unmarks it.
        doneBtn.click();
        await vi.waitFor(() => expect(doneBtn.querySelector(".pi-circle")).toBeTruthy());
        expect(doneBtn.classList.contains("active")).toBe(false);
        wrapper.unmount();
    });

    // ── play both tracks together ────────────────────────────────────────
    it("Play both is disabled until there's an RU take to compare against", async () => {
        const { wrapper } = await mountEditor();
        const rowA = document.querySelectorAll(".vo-dub-row")[0]; // no RU take yet
        expect(rowA.querySelector(".play-both-btn").className).toContain("disabled");
        wrapper.unmount();
    });

    it("Play both waits for both tracks to buffer, then plays them together from the start", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // has both EN and RU
        const [enAudio, ruAudio] = rowB.querySelectorAll("audio");
        Object.defineProperty(enAudio, "readyState", { value: 4, configurable: true }); // already buffered
        Object.defineProperty(ruAudio, "readyState", { value: 4, configurable: true });
        const enPlay = vi.spyOn(enAudio, "play").mockResolvedValue();
        const ruPlay = vi.spyOn(ruAudio, "play").mockResolvedValue();

        rowB.querySelector(".play-both-btn").click();
        await vi.waitFor(() => expect(enPlay).toHaveBeenCalled());
        expect(ruPlay).toHaveBeenCalled();
        wrapper.unmount();
    });

    it("clicking Play both again while playing pauses both tracks", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1];
        const [enAudio, ruAudio] = rowB.querySelectorAll("audio");
        Object.defineProperty(enAudio, "readyState", { value: 4, configurable: true });
        Object.defineProperty(ruAudio, "readyState", { value: 4, configurable: true });
        vi.spyOn(enAudio, "play").mockResolvedValue();
        vi.spyOn(ruAudio, "play").mockResolvedValue();
        const enPause = vi.spyOn(enAudio, "pause");
        const ruPause = vi.spyOn(ruAudio, "pause");

        const btn = rowB.querySelector(".play-both-btn");
        btn.click();
        await vi.waitFor(() => expect(enAudio.play).toHaveBeenCalled());
        btn.click(); // toggle back off
        expect(enPause).toHaveBeenCalled();
        expect(ruPause).toHaveBeenCalled();
        wrapper.unmount();
    });

    it("pausing either track individually (e.g. via its own play/pause button) clears the Play-both playing indicator", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1];
        const [enAudio, ruAudio] = rowB.querySelectorAll("audio");
        Object.defineProperty(enAudio, "readyState", { value: 4, configurable: true });
        Object.defineProperty(ruAudio, "readyState", { value: 4, configurable: true });
        vi.spyOn(enAudio, "play").mockResolvedValue();
        vi.spyOn(ruAudio, "play").mockResolvedValue();

        const btn = rowB.querySelector(".play-both-btn");
        btn.click();
        await vi.waitFor(() => expect(btn.querySelector(".pi-pause")).toBeTruthy());

        enAudio.dispatchEvent(new Event("pause")); // the EN track's own native pause button, say
        await vi.waitFor(() => expect(btn.querySelector(".pi-play")).toBeTruthy());
        wrapper.unmount();
    });

    /*
     ── native <audio controls> again, plus the waveform as a passive
     overview above it (a previous round replaced native controls with a
     bespoke player; reverted -- see WaveformCanvas.vue's own comment) ──
    */
    it("shows real native audio controls on both players, with the waveform purely as a visual overview above them", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1];
        for (const audio of rowB.querySelectorAll("audio")) {
            expect(audio.hasAttribute("controls")).toBe(true);
        }
        expect(rowB.querySelectorAll(".waveform-canvas")).toHaveLength(2); // still there, just decorative
        wrapper.unmount();
    });

    it("a native play on an unbuffered track pauses and resumes once buffered, instead of clipping its start", async () => {
        const { wrapper } = await mountEditor();
        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        const enAudio = rowA.querySelector("audio");
        Object.defineProperty(enAudio, "readyState", { value: 0, configurable: true }); // nothing buffered yet
        const pauseSpy = vi.spyOn(enAudio, "pause");
        const playSpy = vi.spyOn(enAudio, "play").mockResolvedValue();

        enAudio.dispatchEvent(new Event("play")); // e.g. the browser's own native play button
        expect(pauseSpy).toHaveBeenCalledTimes(1);

        Object.defineProperty(enAudio, "readyState", { value: 4, configurable: true });
        enAudio.dispatchEvent(new Event("canplaythrough"));
        await vi.waitFor(() => expect(playSpy).toHaveBeenCalled());
        wrapper.unmount();
    });

    // ── "Play in order" -- mirrors LineEditorApp.vue's own mode-1 sequential playback ──
    it("Play in order skips a row with no RU take and starts on the first that has one, highlighting it", async () => {
        const { wrapper } = await mountEditor();
        const rowA = document.querySelectorAll(".vo-dub-row")[0]; // no RU take
        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // has one
        const ruAudio = rowB.querySelectorAll("audio")[1];
        Object.defineProperty(ruAudio, "readyState", { value: 4, configurable: true });
        const playSpy = vi.spyOn(ruAudio, "play").mockResolvedValue();

        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Play in order"));
        btn.click();

        await vi.waitFor(() => expect(playSpy).toHaveBeenCalled());
        expect(rowA.classList.contains("row-playing")).toBe(false);
        expect(rowB.classList.contains("row-playing")).toBe(true);
        wrapper.unmount();
    });

    it("Play in order auto-advances to the next row once the current one ends", async () => {
        const { wrapper } = await mountEditor({ rows: PROMPT_ROWS_WITH_TAKES });
        const rows = document.querySelectorAll(".vo-dub-row");
        const ruAudios = [...rows].map((r) => r.querySelectorAll("audio")[1]);
        ruAudios.forEach((el) => {
            Object.defineProperty(el, "readyState", { value: 4, configurable: true });
            vi.spyOn(el, "play").mockResolvedValue();
        });

        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Play in order"));
        btn.click();
        await vi.waitFor(() => expect(ruAudios[0].play).toHaveBeenCalled());
        expect(rows[0].classList.contains("row-playing")).toBe(true);

        ruAudios[0].dispatchEvent(new Event("ended"));
        await vi.waitFor(() => expect(ruAudios[1].play).toHaveBeenCalled());
        expect(rows[0].classList.contains("row-playing")).toBe(false);
        expect(rows[1].classList.contains("row-playing")).toBe(true);
        wrapper.unmount();
    });

    it("clicking Play in order again while running stops it instead of starting over", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1];
        const ruAudio = rowB.querySelectorAll("audio")[1];
        Object.defineProperty(ruAudio, "readyState", { value: 4, configurable: true });
        vi.spyOn(ruAudio, "play").mockResolvedValue();
        const pauseSpy = vi.spyOn(ruAudio, "pause");

        const btn = () => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Play in order") || b.textContent.includes("Stop"));
        btn().click();
        await vi.waitFor(() => expect(ruAudio.play).toHaveBeenCalled());
        await vi.waitFor(() => expect(btn().textContent).toContain("Stop"));

        btn().click();
        expect(pauseSpy).toHaveBeenCalled();
        await vi.waitFor(() => expect(rowB.classList.contains("row-playing")).toBe(false));
        wrapper.unmount();
    });

    it("pausing the actively-sequential row via its own native controls stops the whole run", async () => {
        const { wrapper } = await mountEditor({ rows: PROMPT_ROWS_WITH_TAKES });
        const rows = document.querySelectorAll(".vo-dub-row");
        const ruAudios = [...rows].map((r) => r.querySelectorAll("audio")[1]);
        ruAudios.forEach((el) => {
            Object.defineProperty(el, "readyState", { value: 4, configurable: true });
            vi.spyOn(el, "play").mockResolvedValue();
        });

        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Play in order"));
        btn.click();
        await vi.waitFor(() => expect(ruAudios[0].play).toHaveBeenCalled());

        Object.defineProperty(ruAudios[0], "ended", { value: false, configurable: true }); // a manual pause, not a natural end
        ruAudios[0].dispatchEvent(new Event("pause"));
        await vi.waitFor(() => expect(rows[0].classList.contains("row-playing")).toBe(false));
        expect(ruAudios[1].play).not.toHaveBeenCalled(); // did NOT advance
        wrapper.unmount();
    });

    // ── "Render pending" -- mirrors ScriptLibraryPanel.vue's own "🔁 Re-voice pending" ──
    it("Render pending renders every not_started/stale row in the WHOLE bucket, one at a time, with progress", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const renderCalls = [];
        const renderRow = vi.fn(async ({ audioKey }) => { renderCalls.push(audioKey); });
        const { wrapper } = await mountEditor({ rows: PROMPT_ROWS, renderApi: { renderRow } });

        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Render pending"));
        btn.click();

        await vi.waitFor(() => expect(renderCalls).toEqual([
            "Loc_E1_Prompt_01", "Loc_E1_Prompt_02", "Loc_E1_Sam_01",
        ])); // sequential, not concurrent -- each awaited before the next starts
        wrapper.unmount();
    });

    it("Render pending does nothing when the bucket has nothing pending", async () => {
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = await mountEditor({ rows: PROMPT_ROWS_WITH_TAKES, renderApi: { renderRow } }); // all 3 already "done"

        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Render pending"));
        btn.click();
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-editor-status").textContent)
            .toContain("Nothing needs rendering"));
        expect(renderRow).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it("edits save to _dub_state.json, never anywhere resembling vo_dataset.csv", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onWrite });

        const textarea = document.querySelectorAll(".fl-textarea")[0];
        textarea.value = "Новый перевод.";
        textarea.dispatchEvent(new Event("input"));
        vi.advanceTimersByTime(700);

        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const [body] = onWrite.mock.calls.at(-1);
        expect(body.path).toBe(STATE_PATH);
        expect(body.path.toLowerCase()).not.toContain("vo_dataset.csv");
        const content = JSON.parse(body.content);
        expect(content.rows["Loc_E1_S1_A"].russian_text).toBe("Новый перевод.");
        wrapper.unmount();
    });

    it("seeds an untouched row's textarea from the csv's own russian text, not empty", async () => {
        const { wrapper } = await mountEditor();
        const textarea = document.querySelectorAll(".fl-textarea")[0];
        expect(textarea.value).toBe("Привет.");
        wrapper.unmount();
    });

    it("a prior edit in _dub_state.json overrides the csv's own russian text on load", async () => {
        const { wrapper } = await mountEditor({
            state: { rows: { Loc_E1_S1_A: { russian_text: "Уже отредактировано." } } },
        });
        const textarea = document.querySelectorAll(".fl-textarea")[0];
        expect(textarea.value).toBe("Уже отредактировано.");
        wrapper.unmount();
    });

    it("filters rows by status", async () => {
        const { wrapper } = await mountEditor();
        expect(document.querySelectorAll(".vo-dub-row")).toHaveLength(2);

        const dropdown = wrapper.findComponent({ name: "Dropdown" });
        await dropdown.vm.$emit("update:modelValue", "done");
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-row")).toHaveLength(1));
        expect(document.querySelector(".vo-dub-key").textContent).toBe("Loc_E1_S1_B");
        wrapper.unmount();
    });

    it("filters rows by a text search over the key/english/russian", async () => {
        const { wrapper } = await mountEditor();
        const search = document.querySelector(".vo-dub-search");
        search.value = "wait";
        search.dispatchEvent(new Event("input"));
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-row")).toHaveLength(1));
        expect(document.querySelector(".vo-dub-key").textContent).toBe("Loc_E1_S1_B");
        wrapper.unmount();
    });

    // ── render button ────────────────────────────────────────────────────
    it("has no render button at all when the node-wiring offered no renderApi", async () => {
        const { wrapper } = await mountEditor(); // no renderApi passed
        expect(document.querySelectorAll(".vo-dub-render-btn")).toHaveLength(0);
        wrapper.unmount();
    });

    it("clicking Render flushes any pending edit first, then renders with the resolved fields and stamps the matching hash", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const onMarkRendered = vi.fn();
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = await mountEditor({ onWrite, onMarkRendered, renderApi: { renderRow } });

        /*
         Edit row A's text right before rendering -- this must reach
         _dub_state.json BEFORE the render call, not just eventually.
        */
        const textarea = document.querySelectorAll(".fl-textarea")[0];
        textarea.value = "Свежий перевод.";
        textarea.dispatchEvent(new Event("input"));

        const renderBtn = document.querySelectorAll(".vo-dub-row")[0].querySelector(".vo-dub-render-btn");
        renderBtn.click();
        await vi.waitFor(() => expect(renderRow).toHaveBeenCalled());

        expect(onWrite).toHaveBeenCalled();
        const savedContent = JSON.parse(onWrite.mock.calls[0][0].content);
        expect(savedContent.rows["Loc_E1_S1_A"].russian_text).toBe("Свежий перевод.");

        expect(renderRow).toHaveBeenCalledWith({
            audioKey: "Loc_E1_S1_A",
            speaker: "Ellie",
            instruct: "",
            russianText: "Свежий перевод.",
            effect: "",
            outputPath: "C:\\vo\\Observation\\audio_ru\\Loc_E1_S1_A.wav",
            dryOutputPath: "C:\\vo\\Observation\\_dub_dry\\Loc_E1_S1_A.wav",
            referenceAudioPath: "",
        });

        await vi.waitFor(() => expect(onMarkRendered).toHaveBeenCalled());
        const markedHash = onMarkRendered.mock.calls[0][0].hash;
        expect(markedHash).toBe(await lineHash("Ellie", "", "Свежий перевод."));
        expect(onMarkRendered.mock.calls[0][0]).toMatchObject({ root: ROOT, audio_key: "Loc_E1_S1_A" });
        wrapper.unmount();
    });

    // ── per-row Effect (e.g. "radio", nodes/_audio_effects.py) ───────────
    it("choosing an Effect includes it when rendering, folded into the hash exactly like nodes/vo_dub_library.py's row_hash", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onMarkRendered = vi.fn();
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = await mountEditor({ onMarkRendered, renderApi: { renderRow } });

        const dropdowns = wrapper.findAllComponents({ name: "Dropdown" });
        const effectDropdown = dropdowns.find((d) => d.classes().includes("vo-dub-effect-select"));
        await effectDropdown.vm.$emit("update:modelValue", "radio");

        const renderBtn = document.querySelectorAll(".vo-dub-row")[0].querySelector(".vo-dub-render-btn");
        renderBtn.click();
        await vi.waitFor(() => expect(renderRow).toHaveBeenCalled());
        expect(renderRow).toHaveBeenCalledWith(expect.objectContaining({ effect: "radio" }));

        await vi.waitFor(() => expect(onMarkRendered).toHaveBeenCalled());
        const expectedHash = await lineHash("Ellie", "\x00effect=radio", "Привет.");
        expect(onMarkRendered.mock.calls[0][0].hash).toBe(expectedHash);
        wrapper.unmount();
    });

    it("offers Phone and Muffled as gentler alternatives to Radio", async () => {
        const { wrapper } = await mountEditor();
        const dropdowns = wrapper.findAllComponents({ name: "Dropdown" });
        const effectDropdown = dropdowns.find((d) => d.classes().includes("vo-dub-effect-select"));
        const values = effectDropdown.props("options").map((o) => o.value);
        expect(values).toEqual([
            "",
            "radio",
            "phone",
            "muffled",
            /*
             Dubbing a game that layers its own channel noise needs radio's
             band WITHOUT static, or the two stack; intercom and suit cover
             the station-speaker and inside-a-helmet cases next to it.
            */
            "radio_dry",
            "intercom",
            "suit",
        ]);
        wrapper.unmount();
    });

    // ── "use original as sample" checkboxes (project default + per-row) ──
    it("an untouched row follows the project-wide default; the row's own checkbox overrides it independently", async () => {
        const { wrapper } = await mountEditor();
        const rowA = document.querySelectorAll(".vo-dub-row")[0];

        const checkboxes = () => wrapper.findAllComponents({ name: "Checkbox" });
        /*
         .element.closest() walks the REAL DOM regardless of PrimeVue
         Dialog's own Teleport (same reason every other test here queries
         rows via document.querySelectorAll instead of wrapper.find).
        */
        const projectCheckbox = () => checkboxes().find((c) => c.element.closest(".vo-dub-original-default-label"));
        const rowACheckbox = () => checkboxes().find((c) => c.element.closest(".vo-dub-row") === rowA);

        expect(projectCheckbox().props("modelValue")).toBe(false);
        expect(rowACheckbox().props("modelValue")).toBe(false); // follows the (off) project default

        await projectCheckbox().vm.$emit("update:modelValue", true);
        await vi.waitFor(() => expect(rowACheckbox().props("modelValue")).toBe(true)); // still following, now on

        await rowACheckbox().vm.$emit("update:modelValue", false);
        await vi.waitFor(() => expect(rowACheckbox().props("modelValue")).toBe(false)); // explicit override

        await projectCheckbox().vm.$emit("update:modelValue", false);
        expect(rowACheckbox().props("modelValue")).toBe(false); // stays explicitly off regardless of the default flipping back
        wrapper.unmount();
    });

    it("rendering with 'use original as sample' on passes the EN reference audio path and folds it into the hash", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onMarkRendered = vi.fn();
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = await mountEditor({ onMarkRendered, renderApi: { renderRow } });
        const rowA = document.querySelectorAll(".vo-dub-row")[0];

        const rowACheckbox = wrapper.findAllComponents({ name: "Checkbox" })
            .find((c) => c.element.closest(".vo-dub-row") === rowA);
        await rowACheckbox.vm.$emit("update:modelValue", true);

        rowA.querySelector(".vo-dub-render-btn").click();
        await vi.waitFor(() => expect(renderRow).toHaveBeenCalled());
        expect(renderRow).toHaveBeenCalledWith(expect.objectContaining({
            referenceAudioPath: "C:\\vo\\Observation\\audio_en\\Loc_E1_S1_A.wav",
        }));

        await vi.waitFor(() => expect(onMarkRendered).toHaveBeenCalled());
        const expectedHash = await lineHash("Ellie", "\x00sample=original", "Привет.");
        expect(onMarkRendered.mock.calls[0][0].hash).toBe(expectedHash);
        wrapper.unmount();
    });

    it("offers no Effect selector for an unsupported row", async () => {
        const { wrapper } = await mountEditor({
            rows: [{
                audio_key: "Loc_DD_ALOG_01", episode: "", speaker: "", speaker_tag: "",
                english: "", russian: "", instruct: "", duration_s: 7.558, channels: 4,
                status: "unsupported", rendered_duration_s: null,
            }],
        });
        expect(document.querySelector(".vo-dub-effect-select")).toBeFalsy();
        wrapper.unmount();
    });

    it("picking an Effect previews it without saving -- only the Save button commits it to _dub_state.json", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onWrite });

        const dropdowns = wrapper.findAllComponents({ name: "Dropdown" });
        const effectDropdown = dropdowns.find((d) => d.classes().includes("vo-dub-effect-select"));
        await effectDropdown.vm.$emit("update:modelValue", "radio");

        vi.advanceTimersByTime(700);
        expect(onWrite).not.toHaveBeenCalled();

        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        const saveBtn = rowA.querySelector(".vo-dub-effect-save-btn");
        expect(saveBtn).toBeTruthy();
        saveBtn.click();

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const content = JSON.parse(onWrite.mock.calls.at(-1)[0].content);
        expect(content.rows["Loc_E1_S1_A"].effect).toBe("radio");
        wrapper.unmount();
    });

    it("the Effect Save button only appears once the picked value differs from what's already saved", async () => {
        const { wrapper } = await mountEditor();
        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        expect(rowA.querySelector(".vo-dub-effect-save-btn")).toBeFalsy();

        const dropdowns = wrapper.findAllComponents({ name: "Dropdown" });
        const effectDropdown = dropdowns.find((d) => d.classes().includes("vo-dub-effect-select"));
        await effectDropdown.vm.$emit("update:modelValue", "radio");
        await vi.waitFor(() => expect(rowA.querySelector(".vo-dub-effect-save-btn")).toBeTruthy());

        // Picking back to whatever's already saved ("") makes it clean again.
        await effectDropdown.vm.$emit("update:modelValue", "");
        await vi.waitFor(() => expect(rowA.querySelector(".vo-dub-effect-save-btn")).toBeFalsy());
        wrapper.unmount();
    });

    it("Save on a row that already has a take applies the effect immediately -- no full re-voice needed", async () => {
        const onApplyEffect = vi.fn();
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = await mountEditor({ onApplyEffect, renderApi: { renderRow } });

        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // Loc_E1_S1_B, status "done"
        const effectDropdowns = wrapper.findAllComponents({ name: "Dropdown" }).filter((d) => d.classes().includes("vo-dub-effect-select"));
        await effectDropdowns[1].vm.$emit("update:modelValue", "radio");

        const saveBtn = rowB.querySelector(".vo-dub-effect-save-btn");
        expect(saveBtn).toBeTruthy();
        saveBtn.click();

        await vi.waitFor(() => expect(onApplyEffect).toHaveBeenCalledWith({ root: ROOT, audio_key: "Loc_E1_S1_B", effect: "radio" }));
        expect(renderRow).not.toHaveBeenCalled(); // the fast path never touches the TTS graph at all
        wrapper.unmount();
    });

    it("Save on a row with no take yet does not try to reprocess a file that doesn't exist", async () => {
        const onApplyEffect = vi.fn();
        const { wrapper } = await mountEditor({ onApplyEffect }); // row A ("not_started") is first

        const dropdowns = wrapper.findAllComponents({ name: "Dropdown" });
        const effectDropdown = dropdowns.find((d) => d.classes().includes("vo-dub-effect-select"));
        await effectDropdown.vm.$emit("update:modelValue", "radio");

        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        rowA.querySelector(".vo-dub-effect-save-btn").click();

        expect(onApplyEffect).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it("a 'no dry take yet' error from the fast-apply path surfaces in the status line without crashing", async () => {
        const { wrapper } = await mountEditor({ applyEffectError: "no dry take yet for this row -- render it once first" });

        const rowB = document.querySelectorAll(".vo-dub-row")[1];
        const effectDropdowns = wrapper.findAllComponents({ name: "Dropdown" }).filter((d) => d.classes().includes("vo-dub-effect-select"));
        await effectDropdowns[1].vm.$emit("update:modelValue", "radio");
        rowB.querySelector(".vo-dub-effect-save-btn").click();

        await vi.waitFor(() => expect(document.querySelector(".vo-dub-editor-status").textContent).toContain("no dry take"));
        wrapper.unmount();
    });

    it("clicking Render commits a pending (unsaved) Effect pick too, not just whatever was already saved", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = await mountEditor({ onWrite, renderApi: { renderRow } });

        const dropdowns = wrapper.findAllComponents({ name: "Dropdown" });
        const effectDropdown = dropdowns.find((d) => d.classes().includes("vo-dub-effect-select"));
        await effectDropdown.vm.$emit("update:modelValue", "radio"); // picked, but Save never clicked

        const renderBtn = document.querySelectorAll(".vo-dub-row")[0].querySelector(".vo-dub-render-btn");
        renderBtn.click();
        await vi.waitFor(() => expect(renderRow).toHaveBeenCalled());
        expect(renderRow).toHaveBeenCalledWith(expect.objectContaining({ effect: "radio" }));

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const content = JSON.parse(onWrite.mock.calls.at(-1)[0].content);
        expect(content.rows["Loc_E1_S1_A"].effect).toBe("radio");
        /*
         Committed -- the Save button (had it not just rendered) would no
         longer have anything pending to offer.
        */
        wrapper.unmount();
    });

    it("shows the RU player immediately after a successful render, before the next status refresh confirms it", async () => {
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const { wrapper } = await mountEditor({ renderApi: { renderRow } });

        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        expect(rowA.querySelectorAll("audio")).toHaveLength(1); // EN only, no take yet

        rowA.querySelector(".vo-dub-render-btn").click();
        await vi.waitFor(() => expect(rowA.querySelectorAll("audio")).toHaveLength(2));
        wrapper.unmount();
    });

    it("disables the render button and shows a spinner while that row's render is in flight", async () => {
        let resolveRender;
        const renderRow = vi.fn(() => new Promise((r) => { resolveRender = r; }));
        const { wrapper } = await mountEditor({ renderApi: { renderRow } });

        const btn = document.querySelectorAll(".vo-dub-row")[0].querySelector(".vo-dub-render-btn");
        btn.click();
        await vi.waitFor(() => expect(btn.disabled).toBe(true));
        expect(btn.querySelector(".pi-spinner")).toBeTruthy();

        resolveRender();
        await vi.waitFor(() => expect(btn.disabled).toBe(false));
        wrapper.unmount();
    });

    // ── lazy audio ───────────────────────────────────────────────────────
    it("never preloads audio for any row -- both players wait for the browser's own play button", async () => {
        const { wrapper } = await mountEditor();
        const rowB = document.querySelectorAll(".vo-dub-row")[1]; // has both EN and RU players
        for (const audio of rowB.querySelectorAll("audio")) {
            expect(audio.getAttribute("preload")).toBe("none");
        }
        wrapper.unmount();
    });

    // ── pagination ───────────────────────────────────────────────────────
    function manyRows(count) {
        return Array.from({ length: count }, (_, i) => ({
            audio_key: `Loc_E1_R${String(i).padStart(3, "0")}`, episode: "1",
            speaker: "Ellie", speaker_tag: "Ellie",
            english: `Line ${i}.`, russian: `Строка ${i}.`, instruct: "",
            duration_s: 2.0, channels: 1,
            status: i % 5 === 0 ? "done" : "not_started", rendered_duration_s: null,
        }));
    }

    it("shows only the first 50 rows of a large bucket, with a page indicator", async () => {
        const { wrapper } = await mountEditor({ rows: manyRows(120) });
        expect(document.querySelectorAll(".vo-dub-row")).toHaveLength(50);
        expect(document.querySelector(".vo-dub-pager-label").textContent).toBe("Page 1 / 3 (120 row(s))");
        wrapper.unmount();
    });

    it("Next/Prev page through a large bucket without ever rendering more than 50 rows at once", async () => {
        const { wrapper } = await mountEditor({ rows: manyRows(120) });
        const [prevBtn, nextBtn] = document.querySelectorAll(".vo-dub-pager button");
        expect(prevBtn.disabled).toBe(true);

        nextBtn.click();
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-key").textContent).toBe("Loc_E1_R050"));
        expect(document.querySelectorAll(".vo-dub-row")).toHaveLength(50);
        expect(prevBtn.disabled).toBe(false);

        nextBtn.click();
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-key").textContent).toBe("Loc_E1_R100"));
        expect(document.querySelectorAll(".vo-dub-row")).toHaveLength(20); // 120 - 100
        expect(nextBtn.disabled).toBe(true);
        wrapper.unmount();
    });

    it("jumps back to page 1 when the search filter changes", async () => {
        const { wrapper } = await mountEditor({ rows: manyRows(120) });
        document.querySelectorAll(".vo-dub-pager button")[1].click(); // Next -> page 2
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-pager-label").textContent).toContain("Page 2"));

        const search = document.querySelector(".vo-dub-search");
        search.value = "R0";
        search.dispatchEvent(new Event("input"));

        await vi.waitFor(() => expect(document.querySelector(".vo-dub-pager-label").textContent).toContain("Page 1"));
        wrapper.unmount();
    });

    it("clamps the current page back into range when rendering narrows the filtered list out from under it", async () => {
        const renderRow = vi.fn().mockResolvedValue(undefined);
        const rows = manyRows(120);
        const { wrapper } = await mountEditor({ rows, renderApi: { renderRow } });

        const dropdown = wrapper.findComponent({ name: "Dropdown" });
        await dropdown.vm.$emit("update:modelValue", "not_started"); // 96 rows -> 2 pages
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-pager-label").textContent).toContain("Page 1 / 2"));

        document.querySelectorAll(".vo-dub-pager button")[1].click(); // Next -> page 2 (the last 46 "not_started" rows)
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-pager-label").textContent).toContain("Page 2 / 2"));

        /*
         Re-render every "not_started" row this filter still has as "done"
         -- once none are left, the filtered list (and page count) must
         shrink back to page 1 on its own, not point past the end.
        */
        rows.forEach((r) => { r.status = "done"; });
        const renderBtn = document.querySelectorAll(".vo-dub-row")[0].querySelector(".vo-dub-render-btn");
        renderBtn.click();

        /*
         The filter now matches nothing at all -- must land back on a
         valid page (1 of 1), not stay stuck on the "page 2" that no
         longer exists.
        */
        await vi.waitFor(() => expect(document.querySelector(".vo-dub-empty")).toBeTruthy());
        expect(document.querySelector(".vo-dub-pager-label").textContent).toBe("Page 1 / 1 (0 row(s))");
        wrapper.unmount();
    });

    // ── multi-channel rows (real example: Loc_DD_ALOG_01, 4ch/.a-.d) ────
    it("shows an explanation instead of players/fields for an unsupported multi-channel row, and no render button", async () => {
        const { wrapper } = await mountEditor({
            renderApi: { renderRow: vi.fn() },
            rows: [{
                audio_key: "Loc_DD_ALOG_01", episode: "", speaker: "", speaker_tag: "",
                english: "", russian: "", instruct: "", duration_s: 7.558, channels: 4,
                status: "unsupported", rendered_duration_s: null,
            }],
        });

        const row = document.querySelector(".vo-dub-row");
        expect(row.querySelectorAll("audio")).toHaveLength(0);
        expect(row.querySelector(".vo-dub-render-btn")).toBeFalsy();
        expect(row.querySelector(".vo-dub-fields")).toBeFalsy();
        expect(row.querySelector(".vo-dub-unsupported-note").textContent).toContain("4-channel");
        wrapper.unmount();
    });

    it("does not offer a render button for an unsupported row even when it also happens to have text", async () => {
        const { wrapper } = await mountEditor({
            renderApi: { renderRow: vi.fn() },
            rows: [{
                audio_key: "Loc_E5_S7_Ellie7", episode: "5", speaker: "Ellie", speaker_tag: "Ellie",
                english: "Hi.", russian: "Привет.", instruct: "", duration_s: 4.682, channels: 3,
                status: "unsupported", rendered_duration_s: null,
            }],
        });
        expect(document.querySelector(".vo-dub-render-btn")).toBeFalsy();
        wrapper.unmount();
    });

    // ── identifier field + role dropdown (_dub_roles.json) ──────────────
    const PROMPT_ROWS = [
        { audio_key: "Loc_E1_Prompt_01", episode: "1", speaker: "Prompt", speaker_tag: "Prompt", english: "Think.", russian: "Думай.", instruct: "", duration_s: 1.5, channels: 1, status: "not_started", rendered_duration_s: null },
        { audio_key: "Loc_E1_Prompt_02", episode: "1", speaker: "Prompt", speaker_tag: "Prompt", english: "Wait.", russian: "Жди.", instruct: "", duration_s: 1.2, channels: 1, status: "not_started", rendered_duration_s: null },
        { audio_key: "Loc_E1_Sam_01", episode: "1", speaker: "Sam", speaker_tag: "Sam", english: "Go.", russian: "Иди.", instruct: "", duration_s: 1.0, channels: 1, status: "not_started", rendered_duration_s: null },
    ];

    /*
     Same 3 rows, but each already has a take -- for exercising sequential
     playback's own auto-advance across MULTIPLE rows (PROMPT_ROWS itself
     has none, so hasRuTake(row) is false for all three there).
    */
    const PROMPT_ROWS_WITH_TAKES = PROMPT_ROWS.map((r) => ({ ...r, status: "done", rendered_duration_s: r.duration_s }));

    const ROLE_ENTRIES = {
        emma: { character: "Dr. Emma Fisher", speaker: "ellie_preset", description: "" },
        sam: { character: "S.A.M.", speaker: "", description: "" },
    };

    it("searching by speaker tag finds rows the text/audio_key wouldn't match", async () => {
        const { wrapper } = await mountEditor({ rows: PROMPT_ROWS });
        const search = document.querySelector(".vo-dub-search");
        search.value = "prompt";
        search.dispatchEvent(new Event("input"));
        await vi.waitFor(() => expect(document.querySelectorAll(".vo-dub-row")).toHaveLength(2));
        expect([...document.querySelectorAll(".vo-dub-key")].map((el) => el.textContent)).toEqual(["Loc_E1_Prompt_01", "Loc_E1_Prompt_02"]);
        wrapper.unmount();
    });

    it("shows the raw csv speaker tag in a read-only Identifier field, separate from the role", async () => {
        const { wrapper } = await mountEditor();
        const idField = document.querySelectorAll(".vo-dub-identifier")[0];
        expect(idField.textContent).toBe("Ellie");
        wrapper.unmount();
    });

    it("loads _dub_roles.json's roles into every row's role dropdown", async () => {
        const { wrapper } = await mountEditor({ roles: ROLE_ENTRIES });
        const dropdowns = wrapper.findAllComponents(RoleDropdown);
        expect(dropdowns.length).toBeGreaterThan(0);
        expect(dropdowns[0].props("roleEntries")).toEqual([
            { code: "emma", character: "Dr. Emma Fisher", speaker: "ellie_preset", description: "" },
            { code: "sam", character: "S.A.M.", speaker: "", description: "" },
        ]);
        wrapper.unmount();
    });

    it("shows the role's character and assigned voice as the dropdown option sub-label", async () => {
        const { wrapper } = await mountEditor({ roles: ROLE_ENTRIES });
        const dropdown = wrapper.findAllComponents(RoleDropdown)[0];
        expect(dropdown.props("optionSubLabel")({ character: "Dr. Emma Fisher", speaker: "ellie_preset" }))
            .toBe("Dr. Emma Fisher -- ellie_preset");
        wrapper.unmount();
    });

    it("picking a role in the dropdown sets that row's speaker_override and saves it", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ roles: ROLE_ENTRIES, onWrite });

        const dropdown = wrapper.findAllComponents(RoleDropdown)[0];
        await dropdown.vm.$emit("update:modelValue", "emma");

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const content = JSON.parse(onWrite.mock.calls.at(-1)[0].content);
        expect(content.rows["Loc_E1_S1_A"].speaker_override).toBe("emma");
        wrapper.unmount();
    });

    it("the Role field defaults to showing the raw Identifier tag when no override has been set yet", async () => {
        const { wrapper } = await mountEditor();
        const dropdown = wrapper.findAllComponents(RoleDropdown)[0];
        expect(dropdown.props("modelValue")).toBe("Ellie");
        wrapper.unmount();
    });

    it("the apply-role button copies the current Role to every other row sharing the same Identifier, across the whole bucket", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ rows: PROMPT_ROWS, roles: ROLE_ENTRIES, onWrite });

        const rowA = document.querySelectorAll(".vo-dub-row")[0]; // Loc_E1_Prompt_01, tag "Prompt"
        const dropdown = wrapper.findAllComponents(RoleDropdown)[0];
        await dropdown.vm.$emit("update:modelValue", "emma");

        const applyRoleBtn = rowA.querySelector(".apply-role-btn");
        await vi.waitFor(() => expect(applyRoleBtn.disabled).toBe(false));
        applyRoleBtn.click();

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const content = JSON.parse(onWrite.mock.calls.at(-1)[0].content);
        expect(content.rows["Loc_E1_Prompt_02"].speaker_override).toBe("emma"); // same "Prompt" tag
        expect(content.rows["Loc_E1_Sam_01"]?.speaker_override || "").not.toBe("emma"); // different tag, untouched
        wrapper.unmount();
    });

    // ── editing conveniences reused from the audiobook Line Editor ──────
    it("offers a Stress mark button that inserts a combining accent at the focused field's cursor", async () => {
        const { wrapper } = await mountEditor();
        const textarea = document.querySelectorAll(".fl-textarea")[0];
        textarea.value = "привет";
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = 3;
        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Stress mark"));
        btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
        expect(textarea.value).toBe("при́вет");
        wrapper.unmount();
    });

    it("opens the instruct picker, applies the picked phrase, and Undo restores the previous instruct", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onWrite });

        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        const instructInput = rowA.querySelector("input[placeholder='Instruct']");
        expect(instructInput.value).toBe("");

        const pickerBtn = [...rowA.querySelectorAll("button")].find((b) => b.querySelector(".pi-th-large"));
        pickerBtn.click();

        const picker = wrapper.findComponent(InstructPickerDialog);
        await vi.waitFor(() => expect(picker.props("visible")).toBe(true));
        picker.vm.$emit("select", "Speak warmly.");
        await vi.waitFor(() => expect(instructInput.value).toBe("Speak warmly."));

        const undoBtn = [...rowA.querySelectorAll("button")].find((b) => b.querySelector(".pi-undo"));
        expect(undoBtn.disabled).toBe(false);
        undoBtn.click();
        await vi.waitFor(() => expect(instructInput.value).toBe(""));

        vi.advanceTimersByTime(700);
        /*
         Picking a phrase ALSO schedules an instruct-library save (see
         scheduleInstructLibrarySave) on the SAME debounce as the state
         save -- both timers fire from this one advance, in no
         guaranteed order, so find the state write by its own path
         rather than assuming it's whichever call happened last.
        */
        await vi.waitFor(() => expect(onWrite.mock.calls.some((c) => c[0].path === STATE_PATH)).toBe(true));
        const stateWrite = onWrite.mock.calls.find((c) => c[0].path === STATE_PATH);
        const content = JSON.parse(stateWrite[0].content);
        expect(content.rows["Loc_E1_S1_A"].instruct).toBe("");
        wrapper.unmount();
    });

    // ── instruct library grows from actual typing (instruct_library.js) ──
    it("typing a new instruct that isn't in the bank yet saves it into _instruct_categories.json's own 'custom' category", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onWrite, instructCategories: [{ name: "cold", examples: ["Speak coldly."] }] });

        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        const instructInput = rowA.querySelector("input[placeholder='Instruct']");
        instructInput.value = "Совершенно новая фраза.";
        instructInput.dispatchEvent(new Event("input"));

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite.mock.calls.some((c) => c[0].path === INSTRUCT_PATH)).toBe(true));
        const write = onWrite.mock.calls.find((c) => c[0].path === INSTRUCT_PATH);
        const categories = JSON.parse(write[0].content).categories;
        expect(categories.find((c) => c.name === "cold")).toBeTruthy(); // untouched
        expect(categories.find((c) => c.name === "custom").examples).toEqual(["Совершенно новая фраза."]);
        wrapper.unmount();
    });

    it("does not write to the instruct library at all when the typed phrase is already in it", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ onWrite, instructCategories: [{ name: "cold", examples: ["Speak coldly."] }] });

        const rowA = document.querySelectorAll(".vo-dub-row")[0];
        const instructInput = rowA.querySelector("input[placeholder='Instruct']");
        instructInput.value = "Speak coldly.";
        instructInput.dispatchEvent(new Event("input"));

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite.mock.calls.some((c) => c[0].path === STATE_PATH)).toBe(true)); // the state save still happens
        expect(onWrite.mock.calls.some((c) => c[0].path === INSTRUCT_PATH)).toBe(false);
        wrapper.unmount();
    });

    it("the Apply-to-role button copies this row's instruct to every other row sharing its role, across the whole bucket", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountEditor({ rows: PROMPT_ROWS, onWrite });

        const rowA = document.querySelectorAll(".vo-dub-row")[0]; // Loc_E1_Prompt_01, tag "Prompt"
        const instructInput = rowA.querySelector("input[placeholder='Instruct']");
        instructInput.value = "Sound uneasy.";
        instructInput.dispatchEvent(new Event("input"));

        const applyBtn = [...rowA.querySelectorAll("button")].find((b) => b.querySelector(".pi-users"));
        await vi.waitFor(() => expect(applyBtn.disabled).toBe(false));
        applyBtn.click();

        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());
        const content = JSON.parse(onWrite.mock.calls.at(-1)[0].content);
        expect(content.rows["Loc_E1_Prompt_02"].instruct).toBe("Sound uneasy."); // same "Prompt" tag
        expect(content.rows["Loc_E1_Sam_01"]?.instruct || "").not.toBe("Sound uneasy."); // different tag, untouched
        wrapper.unmount();
    });

    it("hovering the role info button shows this role's catalog fields from _dub_roles.json", async () => {
        const { wrapper } = await mountEditor({
            roles: ROLE_ENTRIES,
            state: { rows: { Loc_E1_S1_A: { speaker_override: "emma" } } },
        });
        const infoBtn = document.querySelector(".role-info-btn");
        infoBtn.dispatchEvent(new Event("mouseenter", { bubbles: true }));
        await vi.waitFor(() => expect(document.querySelector(".role-info-popover")).toBeTruthy());
        expect(document.querySelector(".role-info-popover").textContent).toContain("Dr. Emma Fisher");
        wrapper.unmount();
    });

    it("offers no role dropdown or identifier field for an unsupported row", async () => {
        const { wrapper } = await mountEditor({
            rows: [{
                audio_key: "Loc_DD_ALOG_01", episode: "", speaker: "", speaker_tag: "",
                english: "", russian: "", instruct: "", duration_s: 7.558, channels: 4,
                status: "unsupported", rendered_duration_s: null,
            }],
        });
        expect(document.querySelector(".vo-dub-identifier")).toBeFalsy();
        expect(wrapper.findAllComponents(RoleDropdown)).toHaveLength(0);
        wrapper.unmount();
    });
});
