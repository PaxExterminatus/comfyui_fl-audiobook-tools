import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { joinPath, stripSuffixAndExt, dirOf, markRoleStale, parsePauseField } from "../../web/fl_common.js";

describe("joinPath", () => {
    it("joins with a backslash when base already uses one", () => {
        expect(joinPath("C:\\project", "Act01")).toBe("C:\\project\\Act01");
    });

    it("joins with a forward slash when base uses one", () => {
        expect(joinPath("/project", "Act01")).toBe("/project/Act01");
    });

    it("doesn't double up an existing trailing separator", () => {
        expect(joinPath("C:\\project\\", "Act01")).toBe("C:\\project\\Act01");
    });

    it("returns base unchanged when name is empty", () => {
        expect(joinPath("C:\\project", "")).toBe("C:\\project");
    });

    it("returns name unchanged when base is empty", () => {
        expect(joinPath("", "Act01")).toBe("Act01");
    });
});

describe("stripSuffixAndExt", () => {
    it("strips a matching suffix case-insensitively", () => {
        expect(stripSuffixAndExt("Scene 0101_Speakers.TXT", "_speakers.txt")).toBe("Scene 0101");
    });

    it("falls back to stripping just the extension when the suffix doesn't match", () => {
        expect(stripSuffixAndExt("Scene 0101_dialog.txt", "_speakers.txt")).toBe("Scene 0101_dialog");
    });

    it("handles a name with no extension at all", () => {
        expect(stripSuffixAndExt("README", "_speakers.txt")).toBe("README");
    });
});

/*
 Must stay in lockstep with nodes/script_library.py's parse_pause_field:
 the editor sends /stitch_lines the numbers IT parsed, while every other
 reader (the tree's ready check, a plain re-scan) parses the same text off
 disk on the Python side -- a disagreement would show up as a script that
 un-readies itself the moment it's marked done.
*/
describe("parsePauseField", () => {
    it("reads plain seconds", () => {
        expect(parsePauseField("1.5")).toBe(1.5);
    });

    it("accepts a decimal comma", () => {
        expect(parsePauseField("1,5")).toBe(1.5);
    });

    it("treats an explicit zero as a real value, not as unset", () => {
        expect(parsePauseField("0")).toBe(0);
    });

    it("reads an empty/absent field as 'use the default'", () => {
        expect(parsePauseField("")).toBeNull();
        expect(parsePauseField("   ")).toBeNull();
        expect(parsePauseField(undefined)).toBeNull();
    });

    it("falls back to the default rather than erroring on junk or out-of-range", () => {
        expect(parsePauseField("soon")).toBeNull();
        expect(parsePauseField("-1")).toBeNull();
        expect(parsePauseField("99")).toBeNull();
    });
});

describe("dirOf", () => {
    it("returns the parent directory for a Windows path", () => {
        expect(dirOf("C:\\project\\_roles.json")).toBe("C:\\project");
    });

    it("returns the parent directory for a POSIX path", () => {
        expect(dirOf("/project/_roles.json")).toBe("/project");
    });

    it("returns the input unchanged when there's no separator to split on", () => {
        expect(dirOf("_roles.json")).toBe("_roles.json");
    });
});

describe("markRoleStale", () => {
    const originalFetch = global.fetch;
    afterEach(() => {
        global.fetch = originalFetch;
    });

    it("summarizes affected scripts", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => ({
                changed: [{ act: "Act01", file: "A_speakers.txt" }],
            }),
        });

        const result = await markRoleStale("C:\\project", "voldemort", "_speakers.txt");

        expect(global.fetch).toHaveBeenCalledWith(
            "/fl_cosyvoice3/script_library/mark_role_stale",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ root: "C:\\project", role_code: "voldemort", suffix: "_speakers.txt" }),
            }),
        );
        expect(result.changed).toHaveLength(1);
        expect(result.message).toBe('"voldemort" recast -- 1 script(s) need re-voice');
    });

    it("reports when nothing uses the role", async () => {
        global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ changed: [] }) });

        const result = await markRoleStale("C:\\project", "unused_role", "_speakers.txt");

        expect(result.message).toBe('"unused_role" recast -- no script uses this role');
    });

    it("surfaces a server-reported error without throwing", async () => {
        global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ error: "not a folder: C:\\project" }) });

        const result = await markRoleStale("C:\\project", "voldemort", "_speakers.txt");

        expect(result.error).toBe("not a folder: C:\\project");
        expect(result.changed).toEqual([]);
        expect(result.message).toContain("couldn't check affected scripts");
    });

    it("surfaces a network failure without throwing", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));

        const result = await markRoleStale("C:\\project", "voldemort", "_speakers.txt");

        expect(result.error).toContain("fetch failed");
        expect(result.message).toContain("couldn't check affected scripts");
    });
});
