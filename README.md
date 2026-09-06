# FL CosyVoice3 Audiobook Tools

Script/act project management for producing multi-line, multi-character
audio dramas and audiobooks with [FL-CosyVoice3](https://github.com/filliptm/ComfyUI_FL-CosyVoice3).
This is an **add-on**, not a fork -- it does no TTS synthesis itself, and
requires FL-CosyVoice3 installed alongside it for the actual voice models.

## What's in here

- **FL CosyVoice3 Script Library** -- browse a project (root folder with
  `Act01/`, `Act02/`, ... subfolders, each holding `*.txt` dialog scripts).
  Checkbox-queue one/many/all scripts through your own graph, a role
  catalog (`_roles.json`) for reassigning a character's voice project-wide,
  per-script ✅ Done / 🔊 has-audio / ⚠ needs-re-voice status. ✅ Done is a
  plain disk fact, not a stored flag: a script is "done" exactly when its
  final stitched track already exists in `_audio/` (written only by "✅
  Done" itself), and un-marking it just deletes that file.
- **Full-screen line editor** (opens from the Script Library tree) -- one
  row per script line: speaker, instruct text, spoken text, drag-to-merge,
  split, add, delete. Each line's own per-line audio file is named
  `_audio/lines/<script>/<position>_<hash>.wav` -- `position` is this
  line's current rank among the script's lines (the editor keeps it in
  sync on every delete/merge/split), and `hash` is a short fingerprint of
  that line's CURRENT voice+instruct+text. A line is "voiced" exactly when
  that exact file already exists -- computed live, nothing is ever stored,
  and a 🔁 re-voice of unchanged content simply overwrites its one file in
  place (a line has one current take per distinct wording it's ever said,
  not a growing history -- if an edit is later reverted back to some
  earlier wording, whatever was rendered for that wording, if still on
  disk, is immediately "voiced" again with no re-render needed), so
  editing, merging, deleting, or reordering lines never desyncs playback
  the way relying on one script-wide timing offset (or a separate state
  file that can silently drift from what's actually on disk) would. A 🔁
  button re-voices just one line through your currently-open graph; ✅ Done
  stitches every line's latest file into the final track once every line
  is voiced.
- **FL CosyVoice3 Script Editor** -- a simple in-graph text box live-linked
  to one file on disk (two-way: edits here save to the file, external
  edits get pulled back in).
- **FL CosyVoice3 Audio Post-Process** -- onset-click/tail trim, fade, and
  loudness normalization for any synthesis node's output, one item at a
  time (never concatenated); also the node that writes each line's
  per-line file. Building the final scene track is exclusively "✅ Done"'s
  job (see below) -- this node used to also stitch every run into one
  track + write a timing manifest, which was pure duplicate work Done's
  own stitch already did correctly.
- **Roles editor** -- reassign a role's speaker (voice preset) for the
  whole project; recasting a role changes what every line using that role
  code resolves to, so the very next check (an open line editor, or the
  tree's ⚠ icon) already finds that line's hash no longer matches its
  rendered file -- no separate step "marks" anything. Any script that was
  marked Done still gets un-readied and its now-invalid final file deleted,
  since that frozen file can't invalidate itself the same way.

## Requirements

- **FL-CosyVoice3** installed and working (for the actual TTS nodes --
  Speaker Instruct2 Dialog, Speaker Clone, Zero-Shot, etc. -- that a
  workflow wires Script Library's output into).
- One upstream patch, described below.
- Script Library's `line_hashes_json` output wired into Audio Post-
  Process's `line_hashes_json` input (both nodes are in THIS addon, no
  upstream patch needed -- just a connection in your own workflow, the same
  way `folder_path`/`filename` already feed Post-Process's `script_folder`/
  `script_base_name`). Only needed for a FULL script render (queueing a
  whole checked script through your graph) -- the 🔁 per-line re-voice and
  "🔁 Re-voice all pending" buttons already stamp the correct hash onto
  Post-Process directly (they compute it from the exact same content
  they're re-voicing, so there's nothing for a missing wire to break there).
  Without this wire, a FULL render falls back to hashing just the text (no
  voice/instruct), so a role recast alone won't be detected as making one
  of its lines need re-voicing until it's re-voiced through the line editor
  or the pending-all button at least once.

### Required patch: FL CosyVoice3 Speaker Instruct2 Dialog needs a 3rd output

The per-line timing/re-voice features (playback sync, 🔁 re-voice-this-line,
✅ Done) need FL-CosyVoice3's `nodes/speaker_instruct2_dialog.py` to expose
a third `line_texts_json` output alongside `audio`/`message` -- a JSON
array of each line's spoken text, same order as `audio`, wired into Audio
Post-Process's `line_texts_json` input so it can write the per-line timing
manifest. If your installed copy doesn't have it yet, add:

```python
class FL_CosyVoice3_SpeakerInstruct2Dialog:
    ...
    RETURN_TYPES = ("AUDIO", "STRING", "STRING")
    RETURN_NAMES = ("audio", "message", "line_texts_json")
    OUTPUT_IS_LIST = (True, False, False)
```

and build/return that third value everywhere the node currently returns
`(audio, message)` -- e.g.:

```python
line_texts_json = json.dumps([content for (_, _, content) in turns], ensure_ascii=False)
return (line_audios, message, line_texts_json)
```

(and `"[]"` for the third slot on the early-return/error paths). Without
this, Script Library/the line editor still work for browsing, checkbox
queueing, and role management -- only the per-line timing manifest and the
re-voice-this-line/Done workflow need it.

## Installation

1. Install [FL-CosyVoice3](https://github.com/filliptm/ComfyUI_FL-CosyVoice3)
   as usual and confirm it works.
2. Apply the patch above to its `nodes/speaker_instruct2_dialog.py`.
3. Clone/copy this repo into `ComfyUI/custom_nodes/`.
4. Restart ComfyUI.

## Project folder layout this expects

```
MyPlay/                          <- Script Library's folder_path
    _roles.json                  <- {"roles": [{"code","name","description","speaker"}, ...]}
    _instructions.json           <- {"instructions": [{"role","text","note"}, ...]} (optional phrase bank)
    Act01/
        Scene 0101 Something.txt   <- "preset | instruct | line text", one turn per line
        _audio/                                        <- created automatically as you render
            lines/<script>/<position>_<hash>.wav  <- per-line audio (see above)
            timing/<script>.json                        <- per-line timing manifest for playback sync
            <script>.wav                    <- final stitched track (written ONLY by "✅ Done")
```

## Frontend development

Every editor has been migrated from hand-written vanilla JS to Vue 3 +
PrimeVue 3: Roles Editor, Browse Dialog, the Script Library node's tree
panel, and the Line Editor. Each is built with Vite in library mode
straight into `web/`, replacing the hand-written file of the same name --
end users never need Node.js, only whoever's developing this addon.
`ui_kit.js`/`styles.js` stay as plain JS (still used by
`audio_post_process.js`'s report viewer and `script_editor.js`'s browse
button), and `web/script_library.js` keeps one hand-written remainder:
the `app.graphToPrompt`/`app.queuePrompt` queue-orchestration patch
(running the checked scripts, per-line re-voice) isn't UI and stays
untouched -- only the tree/browse-button/tools-row rendering moved to
`src/script_library/ScriptLibraryPanel.vue`.

A cross-entry gotcha worth knowing: every entry's own source file is
named `main.js` within its own folder (`src/roles_editor/main.js`, `src/
browse_dialog/main.js`, ...). Importing one entry's `main.js` directly
from a DIFFERENT entry's component (rather than passing the function in
as a prop) makes Rollup hoist the shared code into its own chunk named
after that shared module's basename -- i.e. also `main.js`, colliding
across entries. `ScriptLibraryPanel.vue` and `LineEditorApp.vue` both
avoid this by receiving `openBrowseDialog`/`openRolesEditor`/
`openLineEditor` as props from whichever hand-written `web/*.js` file
mounts them, never importing another entry's `main.js` directly.

```bash
npm install
npm run dev     # rebuilds web/*.js on save -- refresh ComfyUI's tab to see changes
npm run build   # one-off production build
```

### Styling (Sass, indented syntax -- not SCSS)

Every component's CSS lives in its own co-located `.sass` file (e.g.
`src/roles_editor/RolesEditorApp.sass`), wired in via
`<style scoped lang="sass" src="./Name.sass">` -- Vue's SFC compiler
treats a `src`-loaded style block exactly like an inline one (still
scoped, still preprocessed), it just keeps the CSS in a real file with
normal syntax highlighting instead of a giant string inside the `.vue`
file.

`src/sass/` holds what's shared across components:
- `_variables.sass` -- design tokens (colors, borders, type scale),
  named by ROLE rather than by whatever number first got typed --
  an audit before this existed found the "same" selection-highlight
  blue as two different RGB triples in two files, and half a dozen
  near-identical `rgba(255,255,255, 0.08–0.16)` values with no real
  distinction between them.
- `_placeholders.sass` -- `%ellipsis` and a `button-row` mixin,
  `@extend`/`@include`d wherever the exact same declarations were
  previously retyped across 2+ components.
- `app.sass` -- the manifest: just `@import "variables"` +
  `@import "placeholders"`, in the order they should be available.
  This is the ONE file that decides which shared partials exist and
  in what order -- `vite.config.js`/`vitest.config.js`'s
  `css.preprocessorOptions.sass.additionalData` both auto-`@import`
  THIS one file into every component's own `.sass` (no component
  imports it by hand), and `web/fl_shared.sass` (below) imports it
  too, so that list is written once instead of copied three times.
  Only declarations belong here (variables, placeholders, mixins --
  nothing that compiles to real CSS output on its own), since it's
  re-injected into every component's bundle; anything with actual
  unscoped rules belongs in `global.sass` instead.
- `global.sass` -- truly unscoped CSS (currently just Line Editor's
  role-info hover popover), imported once via
  `src/shared/styles_link.js` the same way the PrimeVue theme itself
  is -- deliberately NOT part of `app.sass`'s additionalData injection,
  since that would duplicate its actual output into every Vue entry's
  own compiled CSS instead of loading it once.

`web/fl_shared.sass` is the one exception: it styles the remaining
hand-written vanilla widgets (`script_editor.js`'s browse button,
`ui_kit.js`'s report viewer), which aren't part of Vite's module graph
at all (linked at runtime via a plain `<link>` tag, not `import`ed) --
`scripts/compile-vanilla-sass.mjs` compiles it to `web/fl_shared.css`
as its own tiny build step (wired into `npm run build`/`dev`), and it
`@import`s `src/sass/app` explicitly since it doesn't go through Vite's
additionalData.

### Developing the UI without ComfyUI running

`npm run dev:ui` starts a real Vite dev server (HMR, no rebuild-and-
refresh needed) serving `dev-ui/index.html` directly in a plain browser
tab -- `dev-ui/mock-api.js` stands in for the aiohttp backend
(`nodes/script_editor.py` / `nodes/script_library.py`'s routes), seeded
from the JSON/text files under `fixtures/`. Edits made in the UI are kept
in memory for that dev-server session (not written back to the fixture
files); restart the server to reset to the fixtures' on-disk content.

```bash
npm run dev:ui   # http://localhost:5173 -- opens the Roles Editor immediately;
                 # buttons in the toolbar open the others (Browse Dialog,
                 # Script Library panel, Line Editor)
```

### Tests

Vitest + `@vue/test-utils`, `happy-dom` for the DOM environment:

```bash
npm test         # run once
npm run test:watch
```

`src/__tests__/` covers the pure helpers in `web/fl_common.js`;
`src/roles_editor/__tests__/`, `src/browse_dialog/__tests__/`,
`src/script_library/__tests__/`, and `src/line_editor/__tests__/` each
mount their component with a mocked `fetch` and drive it through the DOM
(the Line Editor's suite also exercises its `ConfirmDialog` flow --
delete-with-confirm -- via `primevue/confirmationservice`).

## License

MIT.
