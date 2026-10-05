import { describe, it, expect, beforeEach } from "vitest";
import { nextTick } from "vue";
import { pinia } from "../shared/pinia.js";
import { useVoDubStore } from "../stores/voDubStore.js";

/**
 * Helper to reset the store between tests.
 */
function resetStore() {
    const store = useVoDubStore();
    // Re‑initialize trivial config
    store.init({ root: "C:/dummy", bucket: "test" });
    // Clear rows and stateRows
    store.rows = [];
    for (const key in store.stateRows) delete store.stateRows[key];
    store.statusFilter = "";
    store.searchText = "";
    return store;
}

/**
 * Creates a shallow copy of a row that contains the properties used by the
 * store's filtering logic. The `audio_key` uniquely identifies the row.
 */
function makeRow(overrides = {}) {
    return {
        audio_key: "row_" + Math.random().toString(36).substring(2, 8),
        speaker_tag: "Speaker",
        english: "English text",
        russian: "Русский текст",
        // Optional flags used by some filters.
        manually_issue: false,
        status: "not_started",
        ...overrides,
    };
}

describe("voDubStore filtering and search behavior", () => {
    beforeEach(() => {
        // Ensure each test works with a clean Pinia store.
        resetStore();
    });

    it("filter \"\" (empty) returns all rows", () => {
        const store = useVoDubStore();
        const rows = [
            makeRow({ audio_key: "a", status: "not_started" }),
            makeRow({ audio_key: "b", status: "done" }),
            makeRow({ audio_key: "c", status: "unsupported" }),
        ];
        store.rows = rows;
        store.statusFilter = "";
        store.searchText = "";
        const visible = store.visibleRows;
        const keys = visible.map((r) => r.audio_key).sort();
        expect(keys).toEqual(["a", "b", "c"].sort());
    });

    it("filter \"issues\" returns only rows with manually_issue", () => {
        const store = useVoDubStore();
        const rows = [
            makeRow({ audio_key: "a", manually_issue: true }),
            makeRow({ audio_key: "b", manually_issue: false }),
        ];
        store.rows = rows;
        store.statusFilter = "issues";
        const visible = store.visibleRows;
        expect(visible).toHaveLength(1);
        expect(visible[0].audio_key).toBe("a");
    });

    it("filter \"manually_done\" returns only rows with entry.manually_done", () => {
        const store = useVoDubStore();
        const rows = [
            makeRow({ audio_key: "a" }),
            makeRow({ audio_key: "b" }),
        ];
        store.rows = rows;
        // Mark row "b" as manually done via the state entry.
        const entryB = store.entryFor(rows[1]);
        entryB.manually_done = true;
        store.statusFilter = "manually_done";
        const visible = store.visibleRows;
        expect(visible).toHaveLength(1);
        expect(visible[0].audio_key).toBe("b");
    });

    it("filter \"not_done\" excludes unsupported and manually_done rows but **includes** rows with status \"done\" as per the store's logic", () => {
        const store = useVoDubStore();
        const rows = [
            makeRow({ audio_key: "a", status: "not_started" }), // should stay
            makeRow({ audio_key: "b", status: "done" }), // **should stay** – done rows are not filtered out here
            makeRow({ audio_key: "c", status: "unsupported" }), // excluded
            makeRow({ audio_key: "d", status: "not_started" }), // will be manually_done and thus excluded
        ];
        store.rows = rows;
        // Mark row "d" as manually_done.
        const entryD = store.entryFor(rows[3]);
        entryD.manually_done = true;
        store.statusFilter = "not_done";
        const visible = store.visibleRows;
        const keys = visible.map((r) => r.audio_key).sort();
        // Expected to see rows "a" and "b".
        expect(keys).toEqual(["a", "b"].sort());
    });

    it("filter by a plain status value (e.g. \"done\") returns matching rows", () => {
        const store = useVoDubStore();
        const rows = [
            makeRow({ audio_key: "a", status: "done" }),
            makeRow({ audio_key: "b", status: "not_started" }),
        ];
        store.rows = rows;
        store.statusFilter = "done";
        const visible = store.visibleRows;
        expect(visible).toHaveLength(1);
        expect(visible[0].audio_key).toBe("a");
    });

    it("search matches audio_key, speaker_tag, english and russian text case‑insensitively", () => {
        const store = useVoDubStore();
        const rows = [
            makeRow({
                audio_key: "UniqueKey",
                speaker_tag: "SpeakerOne",
                english: "HelloWorld",
                russian: "Привет",
            }),
            makeRow({
                audio_key: "OtherKey",
                speaker_tag: "SpeakerTwo",
                english: "GoodBye",
                russian: "Пока",
            }),
        ];
        store.rows = rows;
        // No extra stateRows required – we rely on the built‑in russian field.
        // 1️⃣ match by audio_key (different case)
        store.searchText = "uniquekey";
        expect(store.visibleRows.map((r) => r.audio_key)).toEqual(["UniqueKey"]);
        // 2️⃣ match by speaker_tag
        store.searchText = "speAKertwo";
        expect(store.visibleRows.map((r) => r.audio_key)).toEqual(["OtherKey"]);
        // 3️⃣ match by english text
        store.searchText = "helloworld";
        expect(store.visibleRows.map((r) => r.audio_key)).toEqual(["UniqueKey"]);
        // 4️⃣ match by russian text (using the raw field when no entry overrides it)
        store.searchText = "пока";
        expect(store.visibleRows.map((r) => r.audio_key)).toEqual(["OtherKey"]);
    });

    it("editing a row's russian text does NOT change the visibleRows array reference", () => {
        const store = useVoDubStore();
        const row = makeRow({ audio_key: "rowX", russian: "Привет" });
        store.rows = [row];
        // Ensure the search matches the initial russian text.
        store.searchText = "привет";
        const before = store.visibleRows; // array reference
        // Edit the russian text via the store's own entry path.
        const entry = store.entryFor(row);
        entry.russian_text = "Пока"; // change to something that no longer matches the search
        // Trigger the same code path that an editor would use.
        store.onTextEdit(row);
        const after = store.visibleRows;
        // The array reference must stay the same even though the content no longer
        // matches the search term – the row should stay visible while typing.
        expect(after).toBe(before);
        // Compared by key, not identity: store.rows wraps each row in a reactive
        // proxy, so the array holds the proxy while `row` here is the raw object.
        expect(after.map((r) => r.audio_key)).toContain("rowX");
    });

    it("changing searchText produces a new filtered array reference", () => {
        const store = useVoDubStore();
        const rows = [
            makeRow({ audio_key: "rowA", english: "Hello" }),
            makeRow({ audio_key: "rowB", english: "World" }),
        ];
        store.rows = rows;
        // First search term.
        store.searchText = "hello";
        const first = store.visibleRows;
        expect(first).toHaveLength(1);
        expect(first[0].audio_key).toBe("rowA");
        // Change the search term.
        store.searchText = "world";
        const second = store.visibleRows;
        expect(second).toHaveLength(1);
        expect(second[0].audio_key).toBe("rowB");
        // The two results must be different array instances.
        expect(second).not.toBe(first);
    });

    it("a row stays in the list while typing even if the new russian text stops matching the active search", () => {
        const store = useVoDubStore();
        const row = makeRow({ audio_key: "rowY", russian: "Привет" });
        store.rows = [row];
        // Search matches the original russian text.
        store.searchText = "привет";
        expect(store.visibleRows).toHaveLength(1);
        // Edit the russian text to something else.
        const entry = store.entryFor(row);
        entry.russian_text = "незнакомый";
        store.onTextEdit(row);
        // The row must still be present despite no longer matching the needle.
        expect(store.visibleRows).toHaveLength(1);
        expect(store.visibleRows[0].audio_key).toBe("rowY");
    });

    it("paging behavior clamps currentPage when visibleRows shrinks", async () => {
        const store = useVoDubStore();
        const PAGE_SIZE = store.PAGE_SIZE; // 50 from the store
        
        // Create enough rows to fill 3 pages (150 rows)
        const rows = [];
        for (let i = 0; i < 150; i++) {
            rows.push(makeRow({ audio_key: `row_${i}` }));
        }
        store.rows = rows;
        
        // Move to the last page (page 2, since 0-indexed: 0, 1, 2)
        store.currentPage = 2;
        expect(store.currentPage).toBe(2);
        
        // Verify we're on the last page with full rows
        expect(store.pageCount).toBe(3); // 150 rows / 50 per page = 3 pages
        expect(store.pagedRows).toHaveLength(50); // Full page
        
        // Now narrow the list with a filter so only 10 rows match
        // We'll manually set the first 10 rows to have a specific status
        for (let i = 0; i < 10; i++) {
            rows[i].status = "filtered";
        }
        // Reassign rows to ensure reactivity picks up the changes
        store.rows = [...rows];
        store.statusFilter = "filtered";
        
        // Now only 10 rows should be visible
        expect(store.visibleRows).toHaveLength(10);
        expect(store.pageCount).toBe(1); // 10 rows / 50 per page = 1 page (min 1)
        
        // The clamp lives in a watch(visibleRows), and Vue watchers flush on the
        // next tick, not synchronously -- without this await currentPage is still
        // the stale 2 and the test fails against a store that is behaving correctly.
        await nextTick();

        // The watcher should have clamped currentPage back to 0
        // since page 2 is now out of bounds (max page is 0)
        expect(store.currentPage).toBe(0);
        expect(store.currentPage).toBeLessThanOrEqual(store.pageCount - 1);
        expect(store.currentPage).toBeGreaterThanOrEqual(0);
        
        // And pagedRows should be non-empty (should contain all 10 rows)
        expect(store.pagedRows).toHaveLength(10);
    });
});
