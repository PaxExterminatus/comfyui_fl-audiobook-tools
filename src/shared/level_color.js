/*
 Maps a duration-delta "level" (good/warn/bad, from audio_files.js's
 calcDelta) to one of the 3 shared semantic text-color classes in
 src/style/app.css. LineHistoryDialog.vue and VoDubLineEditorContent.vue
 both render this same kind of badge and used to each invent their own
 color literals for it (and had drifted: one used raw hex, the other
 reused --color-warning for "bad" instead of a red that doesn't exist in
 this addon's palette) -- this is the one place that mapping lives now.
*/
const LEVEL_CLASS = {
    good: "text-success",
    warn: "text-active",
    bad: "text-warning",
};

export function levelColorClass(level) {
    return LEVEL_CLASS[level] || "";
}
