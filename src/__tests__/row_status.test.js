import { describe, it, expect } from "vitest";

// Imports from the shared module (to be implemented)
import {
    VO_DUB_STATUS_LABELS,
    VO_DUB_EXTRA_FILTERS,
    VO_DUB_STATUS_FILTER_OPTIONS,
    buildStatusFilterOptions,
} from "../shared/row_status.js";

// Imports from the store – these should stay in sync with the shared module
import {
    STATUS_LABELS as STORE_STATUS_LABELS,
    STATUS_FILTER_OPTIONS as STORE_STATUS_FILTER_OPTIONS,
} from "../stores/voDubStore.js";

describe("buildStatusFilterOptions", () => {
    it("places label options before extra filters while preserving order", () => {
        const labels = { "": "All", foo: "Foo", bar: "Bar" };
        const extras = [
            { value: "x", label: "X" },
            { value: "y", label: "Y" },
        ];
        const result = buildStatusFilterOptions(labels, extras);
        const expected = [
            ...Object.entries(labels).map(([value, label]) => ({ value, label })),
            ...extras,
        ];
        expect(result).toEqual(expected);
    });

    it("keeps the empty key as the first option", () => {
        const labels = { "": "All", baz: "Baz" };
        const result = buildStatusFilterOptions(labels, []);
        expect(result[0]).toEqual({ value: "", label: "All" });
    });

    it("handles empty, null and undefined extras", () => {
        const labels = { "": "All", qux: "Qux" };
        const emptyResult = buildStatusFilterOptions(labels, []);
        const nullResult = buildStatusFilterOptions(labels, null);
        const undefResult = buildStatusFilterOptions(labels, undefined);
        const expected = [
            { value: "", label: "All" },
            { value: "qux", label: "Qux" },
        ];
        expect(emptyResult).toEqual(expected);
        expect(nullResult).toEqual(expected);
        expect(undefResult).toEqual(expected);
    });

    // New test to cover null/undefined labels argument
    it("handles null or undefined labels", () => {
        const extras = [
            { value: "x", label: "X" },
            { value: "y", label: "Y" },
        ];
        const nullLabels = buildStatusFilterOptions(null, extras);
        const undefinedLabels = buildStatusFilterOptions(undefined, extras);
        const nullBoth = buildStatusFilterOptions(null, null);
        expect(nullLabels).toEqual(extras);
        expect(undefinedLabels).toEqual(extras);
        expect(nullBoth).toEqual([]);
    });

    it("does not mutate its arguments", () => {
        const labels = { "": "All", spam: "Spam" };
        const extras = [{ value: "egg", label: "Egg" }];
        const labelsCopy = { ...labels };
        const extrasCopy = extras.map((e) => ({ ...e }));
        buildStatusFilterOptions(labels, extras);
        expect(labels).toEqual(labelsCopy);
        expect(extras).toEqual(extrasCopy);
    });
});

describe("VO_DUB_STATUS_FILTER_OPTIONS integrity", () => {
    it("contains every entry of VO_DUB_STATUS_LABELS in order", () => {
        const expectedLabelOptions = Object.entries(VO_DUB_STATUS_LABELS).map(
            ([value, label]) => ({ value, label })
        );
        // The first N entries of the filter options should match the label options.
        const actualLabelOptions = VO_DUB_STATUS_FILTER_OPTIONS.slice(0, expectedLabelOptions.length);
        expect(actualLabelOptions).toEqual(expectedLabelOptions);
    });

    it("contains all extra filters after the label options", () => {
        const labelCount = Object.keys(VO_DUB_STATUS_LABELS).length;
        const extraPortion = VO_DUB_STATUS_FILTER_OPTIONS.slice(labelCount);
        expect(extraPortion).toEqual(VO_DUB_EXTRA_FILTERS);
    });

    it("matches the store's exported STATUS_FILTER_OPTIONS (no drift guarantee)", () => {
        expect(VO_DUB_STATUS_FILTER_OPTIONS).toEqual(STORE_STATUS_FILTER_OPTIONS);
    });
});
