import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { joinPath, stripSuffixAndExt, dirOf, markRoleStale } from "../../web/fl_common.js";

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

    it("summarizes a mix of changed and untracked scripts", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => ({
                changed: [{ act: "Act01", file: "A_speakers.txt" }],
                untracked: [{ act: "Act01", file: "B_speakers.txt" }, { act: "Act02", file: "C_speakers.txt" }],
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
        expect(result.untracked).toHaveLength(2);
        expect(result.message).toBe('"voldemort" recast -- 1 script(s) marked for re-voice; 2 script(s) using "voldemort" haven\'t been opened in the line editor yet');
    });

    it("reports when nothing uses the role", async () => {
        global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ changed: [], untracked: [] }) });

        const result = await markRoleStale("C:\\project", "unused_role", "_speakers.txt");

        expect(result.message).toBe('"unused_role" recast -- no script uses this role');
    });

    it("surfaces a server-reported error without throwing", async () => {
        global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ error: "not a folder: C:\\project" }) });

        const result = await markRoleStale("C:\\project", "voldemort", "_speakers.txt");

        expect(result.error).toBe("not a folder: C:\\project");
        expect(result.changed).toEqual([]);
        expect(result.message).toContain("couldn't mark affected scripts");
    });

    it("surfaces a network failure without throwing", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));

        const result = await markRoleStale("C:\\project", "voldemort", "_speakers.txt");

        expect(result.error).toContain("fetch failed");
        expect(result.message).toContain("couldn't mark affected scripts");
    });
});
