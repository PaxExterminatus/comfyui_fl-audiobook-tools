import { describe, it, expect, beforeEach } from "vitest";
import { pinia } from "../shared/pinia.js";
import { useVoDubStore } from "../stores/voDubStore.js";

function resetStore() {
    const store = useVoDubStore();
    store.init({ root: "C:/dummy", bucket: "test" });
    // Explicitly reset filter state to defaults
    store.filterStatuses = new Set();
    store.filterManuallyDone = "any";
    store.filterIssues = "any";
    return store;
}

describe("voDubFilterActions", () => {
    beforeEach(() => {
        resetStore();
    });

    describe("toggleStatus", () => {
        it("adds a status if absent", () => {
            const store = useVoDubStore();
            const status = "done";
            const oldSet = store.filterStatuses;
            
            store.toggleStatus(status);
            
            expect(store.filterStatuses.has(status)).toBe(true);
            expect(store.filterStatuses).not.toBe(oldSet); // Must assign a new Set
        });

        it("removes a status if present", () => {
            const store = useVoDubStore();
            const status = "done";
            store.filterStatuses = new Set([status]);
            const oldSet = store.filterStatuses;
            
            store.toggleStatus(status);
            
            expect(store.filterStatuses.has(status)).toBe(false);
            expect(store.filterStatuses).not.toBe(oldSet); // Must assign a new Set
        });

        it("ignores values not in VO_DUB_STATUS_LABELS", () => {
            const store = useVoDubStore();
            const invalidStatus = "non_existent_status";
            const oldSet = store.filterStatuses;
            
            store.toggleStatus(invalidStatus);
            
            expect(store.filterStatuses.size).toBe(0);
            expect(store.filterStatuses).toBe(oldSet); // Should not change the ref if ignored
        });

        it("ignores empty string", () => {
            const store = useVoDubStore();
            const oldSet = store.filterStatuses;
            
            store.toggleStatus("");
            
            expect(store.filterStatuses.size).toBe(0);
            expect(store.filterStatuses).toBe(oldSet);
        });

        it("allows multiple statuses to be selected simultaneously", () => {
            const store = useVoDubStore();
            const status1 = "done";
            const status2 = "no_text";
            
            store.toggleStatus(status1);
            store.toggleStatus(status2);
            
            expect(store.filterStatuses.size).toBe(2);
            expect(store.filterStatuses.has(status1)).toBe(true);
            expect(store.filterStatuses.has(status2)).toBe(true);
        });

        it("keeps other statuses selected when one is toggled off", () => {
            const store = useVoDubStore();
            const status1 = "done";
            const status2 = "no_text";
            
            store.toggleStatus(status1);
            store.toggleStatus(status2);
            store.toggleStatus(status1);
            
            expect(store.filterStatuses.size).toBe(1);
            expect(store.filterStatuses.has(status1)).toBe(false);
            expect(store.filterStatuses.has(status2)).toBe(true);
        });
    });

    describe("cycleManuallyDone", () => {
        it("cycles: any -> only -> without -> any", () => {
            const store = useVoDubStore();
            
            store.filterManuallyDone = "any";
            store.cycleManuallyDone();
            expect(store.filterManuallyDone).toBe("only");
            
            store.cycleManuallyDone();
            expect(store.filterManuallyDone).toBe("without");
            
            store.cycleManuallyDone();
            expect(store.filterManuallyDone).toBe("any");
        });
    });

    describe("cycleIssues", () => {
        it("cycles: any -> only -> without -> any", () => {
            const store = useVoDubStore();
            
            store.filterIssues = "any";
            store.cycleIssues();
            expect(store.filterIssues).toBe("only");
            
            store.cycleIssues();
            expect(store.filterIssues).toBe("without");
            
            store.cycleIssues();
            expect(store.filterIssues).toBe("any");
        });
    });

    describe("clearFilters", () => {
        it("resets all filters to defaults", () => {
            const store = useVoDubStore();
            store.filterStatuses = new Set(["done", "stale"]);
            store.filterManuallyDone = "without";
            store.filterIssues = "only";
            
            store.clearFilters();
            
            expect(store.filterStatuses.size).toBe(0);
            expect(store.filterManuallyDone).toBe("any");
            expect(store.filterIssues).toBe("any");
        });
    });

    describe("hasActiveFilters", () => {
        it("is false when all filters are at default", () => {
            const store = useVoDubStore();
            store.filterStatuses = new Set();
            store.filterManuallyDone = "any";
            store.filterIssues = "any";
            expect(store.hasActiveFilters).toBe(false);
        });

        it("is true when status set is non-empty", () => {
            const store = useVoDubStore();
            store.filterStatuses = new Set(["done"]);
            expect(store.hasActiveFilters).toBe(true);
        });

        it("is true when manuallyDone is not 'any'", () => {
            const store = useVoDubStore();
            store.filterManuallyDone = "only";
            expect(store.hasActiveFilters).toBe(true);
        });

        it("is true when issues is not 'any'", () => {
            const store = useVoDubStore();
            store.filterIssues = "without";
            expect(store.hasActiveFilters).toBe(true);
        });
    });
});
