// Stable, cheap hash -> hue, so each distinct speaker gets a consistent
// accent color everywhere it's shown -- Line Editor's .line-rail
// background and the speaker picker dialog's avatars both need the EXACT
// same mapping, so this lives here once instead of two copies that could
// quietly drift apart.
export function speakerAccent(name) {
    if (!name) return "rgba(255,255,255,0.1)";
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return `hsl(${hash % 360}, 55%, 55%, 0.3)`;
}

// Two-letter avatar monogram: the first character, then the next DISTINCT
// character after it (skipping any repeats of the first) -- "AA" reads as
// a mistake at a glance, "AR"/"ZH" reads as a real abbreviation.
export function speakerInitials(name) {
    const letters = (name || "").toUpperCase().replace(/[^A-ZА-Я0-9]/g, "");
    if (!letters) return "?";
    const first = letters[0];
    const second = [...letters.slice(1)].find((c) => c !== first);
    return second ? first + second : first;
}
