// Grows _instruct_categories.json from actual USE instead of staying a
// read-only, hand-curated bank -- every instruct a user types into a row
// that isn't ALREADY somewhere in the bank gets appended into its own
// "custom" category automatically. InstructPickerDialog.vue itself stays
// unchanged (still just picks); this is the write side neither editor had
// before.
const CUSTOM_CATEGORY_NAME = "custom";
const CUSTOM_CATEGORY_TITLE = "My phrases";
const CUSTOM_CATEGORY_WHEN = "Typed directly into an instruct field -- not curated, just captured for reuse.";

// Exact-match only (after trimming) -- a near-duplicate ("тепло" vs
// "тёпло, с улыбкой") is still worth keeping as its own example; this only
// guards against re-saving the SAME phrase every time its row is edited.
export function containsPhrase(categories, phrase) {
    const needle = phrase.trim();
    return categories.some((c) => (c.examples || []).some((ex) => ex.trim() === needle));
}

// Pure function, no I/O -- appends into the existing "custom" category if
// one's already there, else creates it. Returns a NEW array (categories
// themselves are mutated in place when appending to an existing one,
// same as the picker's own read-only consumption never needed a strict
// immutability guarantee here).
export function addPhraseToCategories(categories, phrase) {
    const trimmed = phrase.trim();
    if (!trimmed || containsPhrase(categories, trimmed)) return categories;
    const custom = categories.find((c) => c.name === CUSTOM_CATEGORY_NAME);
    if (custom) {
        custom.examples = [...(custom.examples || []), trimmed];
        return categories;
    }
    return [
        ...categories,
        { name: CUSTOM_CATEGORY_NAME, title: CUSTOM_CATEGORY_TITLE, when: CUSTOM_CATEGORY_WHEN, examples: [trimmed] },
    ];
}

// Read-modify-write against the file's CURRENT on-disk content (not
// whatever a caller's own in-memory `instructCategories` ref happens to
// hold) -- two rows saving different new phrases moments apart must not
// let the second write clobber the first's addition just because its own
// in-memory copy was fetched before the first write landed.
//
// `categoriesPath` must be the file's own RESOLVED path (e.g.
// data.instruct_categories?.path from script_library.py's /scan route, or
// VO Dub's own joinPath(root, "_instruct_categories.json")) -- null/empty
// means "no _instruct_categories.json found for this project", the same
// "nothing to save into, skip silently" posture _roles.json's own
// saveRolesJson() already has, not an error worth surfacing loudly for
// something this incidental.
//
// Returns the updated categories array if a write happened, or null if
// there was nothing to do (empty phrase, already present, or no file to
// save into) -- callers use a non-null result to refresh their own
// in-memory ref without a full re-fetch.
export async function saveInstructPhrase(fileApi, categoriesPath, phrase) {
    const trimmed = (phrase || "").trim();
    if (!trimmed || !categoriesPath) return null;
    let parsed = { categories: [] };
    try {
        const resp = await fetch(`${fileApi}/read?path=${encodeURIComponent(categoriesPath)}`);
        const data = await resp.json();
        if (data.exists) {
            const candidate = JSON.parse(data.content);
            if (candidate && Array.isArray(candidate.categories)) parsed = candidate;
        }
    } catch (e) {
        // Corrupt/unreadable file -- same "never let a broken sidecar block
        // the editor" posture every OTHER json load in this addon takes;
        // falls through to writing a fresh { categories: [...] } rather
        // than losing the phrase the user just typed.
    }
    if (containsPhrase(parsed.categories, trimmed)) return null;
    parsed.categories = addPhraseToCategories(parsed.categories, trimmed);
    await fetch(`${fileApi}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: categoriesPath, content: JSON.stringify(parsed, null, 2) }),
    });
    return parsed.categories;
}
