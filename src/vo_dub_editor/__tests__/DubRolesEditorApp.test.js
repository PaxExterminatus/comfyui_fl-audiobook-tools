import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import DubRolesEditorApp from "../DubRolesEditorApp.vue";

const ROOT = "C:\\vo\\Observation";

// Shaped like the REAL _dub_roles.json (see nodes/vo_dub_library.py's
// read_dub_roles_document): "roles" is a dict keyed by role code, each a
// casting document this addon never generated -- project-level fields
// (project/generated_by/totals/unmatched_keys) exist alongside "roles"
// and must round-trip through a save untouched.
function realDoc(overrides = {}) {
    return {
        project: "Observation - Russian AI dub",
        generated_by: "scripts/06_assign_roles.py",
        totals: { voiced_lines: 2083 },
        roles: {
            emma: {
                character: "Dr. Emma Fisher", gender: "female", actor: "Kezia Burrows",
                description: "The station's medical officer and the human lead.",
                dub_direction: "Cast the strongest actress here.",
                notes: ["'Ellie' in key names is the development codename for this character."],
                lines: 1230, audio_minutes: 74.4, lines_needing_translation: 40, lines_without_any_text: 291,
                longest_files: ["Loc_EMMA_AUD_03.wav"],
                speaker: "some_preset",
            },
            sam: {
                character: "S.A.M.", gender: "male", actor: "Anthony Howell",
                description: "The station's AI.", dub_direction: "Neutral male voice.",
                lines: 287, audio_minutes: 19.2,
                speaker: "",
            },
        },
        unmatched_keys: [],
        ...overrides,
    };
}

function mockFetchResponses(overrides = {}) {
    const rolesContent = overrides.rolesContent ?? JSON.stringify(realDoc());
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
            return { json: async () => ({ presets: ["some_preset", "another_preset"], dir: "C:\\models\\speaker" }) };
        }
        if (u.startsWith("/fl_cosyvoice3/vo_dub/mark_role_stale")) {
            overrides.onMarkStale?.(JSON.parse(opts.body));
            return { json: async () => ({ changed: [] }) };
        }
        if (u.startsWith("/fl_cosyvoice3/vo_dub/seed_roles")) {
            overrides.onSeed?.(JSON.parse(opts.body));
            return { json: async () => (overrides.seedResult ?? { added: ["Sam"] }) };
        }
        throw new Error(`unmocked fetch: ${u}`);
    });
}

describe("DubRolesEditorApp", () => {
    let originalFetch;
    beforeEach(() => { originalFetch = global.fetch; });
    afterEach(() => {
        global.fetch = originalFetch;
        vi.useRealTimers();
        document.body.innerHTML = "";
        localStorage.clear();
    });

    async function mountApp(overrides = {}) {
        global.fetch = mockFetchResponses(overrides);
        const onClose = vi.fn();
        const wrapper = mount(DubRolesEditorApp, {
            props: { root: ROOT, onClose },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Dr. Emma Fisher"));
        return { wrapper, onClose };
    }

    it("loads from _dub_roles.json (not _roles.json)", async () => {
        const readPaths = [];
        global.fetch = vi.fn(async (url) => {
            const u = typeof url === "string" ? url : url.toString();
            if (u.startsWith("/fl_cosyvoice3/script_editor/read")) {
                readPaths.push(new URL(u, "http://localhost").searchParams.get("path"));
                return { json: async () => ({ exists: true, content: JSON.stringify({ roles: {} }), mtime: 1 }) };
            }
            if (u.startsWith("/fl_cosyvoice3/script_library/speaker_presets")) return { json: async () => ({ presets: [] }) };
            throw new Error(`unmocked fetch: ${u}`);
        });
        const wrapper = mount(DubRolesEditorApp, {
            props: { root: ROOT, onClose: vi.fn() },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(readPaths.length).toBeGreaterThan(0));
        expect(readPaths[0]).toBe("C:\\vo\\Observation\\_dub_roles.json");
        wrapper.unmount();
    });

    it("renders a role's rich casting fields -- character, gender, actor, description, dub direction, notes, stats", async () => {
        const { wrapper } = await mountApp();
        const card = document.querySelectorAll(".role-card")[0]; // emma sorts first (1230 lines > sam's 287)
        expect(card.querySelector(".role-name").textContent).toBe("Dr. Emma Fisher");
        expect(card.querySelector(".role-code").textContent).toBe("emma");
        expect(card.querySelector(".role-gender").textContent).toBe("female");
        expect(card.querySelector(".role-actor").textContent).toBe("Kezia Burrows");
        expect(card.querySelector(".role-dub-direction").textContent).toContain("strongest actress");
        expect(card.querySelector(".role-notes").textContent).toContain("development codename");
        expect(card.querySelector(".role-stats").textContent).toContain("1230 line(s)");
        expect(card.querySelector(".role-stats").textContent).toContain("40 need translation");
        wrapper.unmount();
    });

    it("sorts roles by line count descending, biggest role first", async () => {
        const { wrapper } = await mountApp();
        const names = [...document.querySelectorAll(".role-name")].map((el) => el.textContent);
        expect(names).toEqual(["Dr. Emma Fisher", "S.A.M."]);
        wrapper.unmount();
    });

    it("shows every role's assigned (or blank) speaker preset", async () => {
        const { wrapper } = await mountApp();
        const speakerInputs = [...document.querySelectorAll(".role-speaker")];
        expect(speakerInputs[0].value).toBe("some_preset"); // emma
        expect(speakerInputs[1].value).toBe(""); // sam, not assigned yet
        wrapper.unmount();
    });

    it("the mic button opens the SAME speaker picker dialog as the audiobook editor, with sample audition wired", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onMarkStale = vi.fn();
        const { wrapper } = await mountApp({ onMarkStale });

        const roleCards = document.querySelectorAll(".role-card");
        const micBtn = [...roleCards[1].querySelectorAll("button")].find((b) => b.querySelector(".pi-microphone"));
        micBtn.click();

        await vi.waitFor(() => expect(document.body.textContent).toContain("Pick a speaker"));
        expect(document.body.textContent).toContain("another_preset"); // sam's picker offers every loaded preset

        const card = [...document.querySelectorAll(".speaker-card-row")].find((c) => c.querySelector(".speaker-name").textContent === "another_preset");
        card.click();

        await vi.waitFor(() => expect(document.querySelectorAll(".role-speaker")[1].value).toBe("another_preset"));
        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onMarkStale).toHaveBeenCalledWith({ root: ROOT, role_code: "sam" }));
        wrapper.unmount();
    });

    it("saving preserves every field this addon didn't generate -- project metadata, and each role's own casting fields", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onWrite = vi.fn();
        const { wrapper } = await mountApp({ onWrite });

        // Edit ONLY sam's speaker -- nothing else should so much as move.
        const samSpeakerInput = document.querySelectorAll(".role-speaker")[1];
        samSpeakerInput.value = "another_preset";
        samSpeakerInput.dispatchEvent(new Event("input", { bubbles: true }));
        vi.advanceTimersByTime(700);
        await vi.waitFor(() => expect(onWrite).toHaveBeenCalled());

        const written = onWrite.mock.calls.at(-1)[0];
        expect(written.path).toBe("C:\\vo\\Observation\\_dub_roles.json");
        const saved = JSON.parse(written.content);
        expect(saved.project).toBe("Observation - Russian AI dub");
        expect(saved.generated_by).toBe("scripts/06_assign_roles.py");
        expect(saved.totals).toEqual({ voiced_lines: 2083 });
        expect(saved.roles.emma.character).toBe("Dr. Emma Fisher");
        expect(saved.roles.emma.dub_direction).toBe("Cast the strongest actress here.");
        expect(saved.roles.emma.notes).toEqual(["'Ellie' in key names is the development codename for this character."]);
        expect(saved.roles.emma.speaker).toBe("some_preset"); // untouched
        expect(saved.roles.sam.speaker).toBe("another_preset"); // the one edit
        wrapper.unmount();
    });

    it("recasts through vo_dub/mark_role_stale (not script_library's), keyed by role code", async () => {
        const onMarkStale = vi.fn();
        const { wrapper } = await mountApp({ onMarkStale });

        const emmaSpeakerInput = document.querySelectorAll(".role-speaker")[0];
        emmaSpeakerInput.value = "another_preset";
        emmaSpeakerInput.dispatchEvent(new Event("input", { bubbles: true }));
        emmaSpeakerInput.dispatchEvent(new Event("blur"));

        await vi.waitFor(() => expect(onMarkStale).toHaveBeenCalled());
        expect(onMarkStale.mock.calls[0][0]).toEqual({ root: ROOT, role_code: "emma" });
        wrapper.unmount();
    });

    it("Seed from dataset calls vo_dub/seed_roles and reloads the role list", async () => {
        const onSeed = vi.fn();
        const { wrapper } = await mountApp({ onSeed, seedResult: { added: ["Sam"] } });

        const seedBtn = [...document.body.querySelectorAll("button")].find((b) => b.textContent.includes("Seed from dataset"));
        expect(seedBtn).toBeTruthy();
        seedBtn.click();

        await vi.waitFor(() => expect(onSeed).toHaveBeenCalledWith({ root: ROOT }));
        await vi.waitFor(() => expect(document.body.textContent).toContain("Added 1 role(s)"));
        wrapper.unmount();
    });

    it("shows the empty state with a pointer to Seed from dataset when there are no roles yet", async () => {
        global.fetch = mockFetchResponses({ rolesContent: JSON.stringify({ roles: {} }) });
        const wrapper = mount(DubRolesEditorApp, {
            props: { root: ROOT, onClose: vi.fn() },
            global: { plugins: [PrimeVue] },
            attachTo: document.body,
        });
        await vi.waitFor(() => expect(document.body.textContent).toContain("Seed from dataset"));
        expect(document.body.textContent).toContain("No roles yet");
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
});
