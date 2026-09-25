import { describe, it, expect, vi, afterEach } from "vitest";
import { containsPhrase, addPhraseToCategories, saveInstructPhrase } from "../shared/instruct_library.js";

describe("containsPhrase", () => {
    it("matches an existing example exactly, ignoring surrounding whitespace", () => {
        const categories = [{ name: "cold", examples: ["  Speak coldly.  ", "Другое."] }];
        expect(containsPhrase(categories, "Speak coldly.")).toBe(true);
        expect(containsPhrase(categories, "Speak warmly.")).toBe(false);
    });

    it("is false against an empty category list", () => {
        expect(containsPhrase([], "anything")).toBe(false);
    });
});

describe("addPhraseToCategories", () => {
    it("creates a new 'custom' category when none exists yet", () => {
        const result = addPhraseToCategories([{ name: "cold", examples: ["a"] }], "Новая фраза");
        const custom = result.find((c) => c.name === "custom");
        expect(custom).toBeTruthy();
        expect(custom.examples).toEqual(["Новая фраза"]);
        expect(custom.title).toBeTruthy();
    });

    it("appends to an existing 'custom' category instead of duplicating it", () => {
        const categories = [{ name: "custom", title: "My phrases", examples: ["first"] }];
        const result = addPhraseToCategories(categories, "second");
        expect(result).toHaveLength(1);
        expect(result[0].examples).toEqual(["first", "second"]);
    });

    it("is a no-op when the phrase already exists anywhere in the bank", () => {
        const categories = [{ name: "cold", examples: ["Speak coldly."] }];
        const result = addPhraseToCategories(categories, "Speak coldly.");
        expect(result).toBe(categories); // unchanged reference -- nothing written
        expect(result.find((c) => c.name === "custom")).toBeUndefined();
    });

    it("is a no-op for an empty/whitespace-only phrase", () => {
        const categories = [{ name: "cold", examples: [] }];
        expect(addPhraseToCategories(categories, "   ")).toBe(categories);
    });
});

describe("saveInstructPhrase", () => {
    let originalFetch;
    afterEach(() => { global.fetch = originalFetch; });

    function mockFetch({ exists, content } = {}) {
        originalFetch = global.fetch;
        const write = vi.fn().mockResolvedValue({ json: async () => ({ mtime: 1 }) });
        global.fetch = vi.fn(async (url, opts) => {
            if (String(url).includes("/read")) {
                return { json: async () => ({ exists: !!exists, content: content || "", mtime: exists ? 1 : null }) };
            }
            if (String(url).includes("/write")) {
                return write(url, opts);
            }
            throw new Error(`unmocked fetch: ${url}`);
        });
        return write;
    }

    it("does nothing when categoriesPath is null (no bank found for this project)", async () => {
        const write = mockFetch();
        const result = await saveInstructPhrase("/fl_cosyvoice3/script_editor", null, "Тепло.");
        expect(result).toBeNull();
        expect(write).not.toHaveBeenCalled();
    });

    it("does nothing for an empty phrase", async () => {
        const write = mockFetch({ exists: true, content: JSON.stringify({ categories: [] }) });
        const result = await saveInstructPhrase("/fl_cosyvoice3/script_editor", "/proj/_instruct_categories.json", "   ");
        expect(result).toBeNull();
        expect(write).not.toHaveBeenCalled();
    });

    it("creates a fresh file (starting from {categories: []}) when none exists yet, and writes the new phrase", async () => {
        const write = mockFetch({ exists: false });
        const result = await saveInstructPhrase("/fl_cosyvoice3/script_editor", "/proj/_instruct_categories.json", "Новая фраза");
        expect(result).toEqual([{ name: "custom", title: "My phrases", when: expect.any(String), examples: ["Новая фраза"] }]);
        expect(write).toHaveBeenCalledTimes(1);
        const body = JSON.parse(write.mock.calls[0][1].body);
        expect(body.path).toBe("/proj/_instruct_categories.json");
        expect(JSON.parse(body.content).categories[0].examples).toEqual(["Новая фраза"]);
    });

    it("re-fetches the CURRENT on-disk content before appending -- doesn't clobber another category added since load", async () => {
        const write = mockFetch({
            exists: true,
            content: JSON.stringify({ categories: [{ name: "cold", examples: ["Speak coldly."] }] }),
        });
        const result = await saveInstructPhrase("/fl_cosyvoice3/script_editor", "/proj/_instruct_categories.json", "Тепло, с улыбкой.");
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("cold"); // untouched
        expect(result[1].examples).toEqual(["Тепло, с улыбкой."]);
    });

    it("skips the write entirely when the phrase is already in the bank", async () => {
        const write = mockFetch({
            exists: true,
            content: JSON.stringify({ categories: [{ name: "cold", examples: ["Speak coldly."] }] }),
        });
        const result = await saveInstructPhrase("/fl_cosyvoice3/script_editor", "/proj/_instruct_categories.json", "Speak coldly.");
        expect(result).toBeNull();
        expect(write).not.toHaveBeenCalled();
    });

    it("falls back to a fresh bank instead of losing the phrase when the file is corrupt JSON", async () => {
        const write = mockFetch({ exists: true, content: "{not valid json" });
        const result = await saveInstructPhrase("/fl_cosyvoice3/script_editor", "/proj/_instruct_categories.json", "Новая фраза");
        expect(result).toEqual([{ name: "custom", title: "My phrases", when: expect.any(String), examples: ["Новая фраза"] }]);
    });
});
