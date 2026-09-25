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
  row per script line: speaker, instruct text, spoken text, how long to
  hold after the line (see the 4th field below), drag-to-merge, split,
  add, delete. Each line's own per-line audio file is named
  `_audio/lines/<script>/<position>_<hash>.wav` -- `position` is this
  line's current rank among the script's lines (the editor keeps it in
  sync on every delete/merge/split), and `hash` is a short fingerprint of
  that line's CURRENT voice+instruct+text. A line is "voiced" exactly when
  that exact file already exists -- computed live, nothing is ever stored,
  and a 🔁 re-voice always leaves exactly ONE file behind: unchanged content
  overwrites its one file in place, and changed content deletes whatever
  used to be there the moment the fresh take is written (never a growing
  history of every wording a line has ever said -- reverting text back to
  an earlier wording needs a re-render, the same as any other edit), so
  editing, merging, deleting, or reordering lines never desyncs playback
  the way relying on one script-wide timing offset (or a separate state
  file that can silently drift from what's actually on disk) would. A 🔁
  button re-voices just one line through your currently-open graph; ✅ Done
  stitches every line's latest file into the final track once every line
  is voiced.
- **FL CosyVoice3 Script Editor** -- a simple in-graph text box live-linked
  to one file on disk (two-way: edits here save to the file, external
  edits get pulled back in).
- **FL CosyVoice3 Audio Post-Process** -- onset-click trim (start only --
  a tail trim existed once, removed after it cut into real trailing speech,
  see `nodes/_audio_utils.py`'s own module docstring), fade, and
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
- **FL CosyVoice3 VO Dub Library** -- a second, separate project shape for
  re-dubbing an existing GAME's voice-over instead of authoring a new
  audiobook: a flat `vo_dataset.csv` (one row per `audio_key`, e.g.
  `Loc_E1_S2_Ellie1`) with an existing English reference performance
  (`audio_en/<audio_key>.wav`) to dub against and a FIXED output filename
  (`audio_ru/<audio_key>.wav`) dictated by the game's own repack pipeline.
  Browses episode buckets with per-status counts (no source text / needs
  translation / not started / stale / done). A row with a take can also be
  manually marked "Done" (the pill next to its key, in the row head) --
  reads as done even if its content hash has since drifted, a deliberate
  "I know it changed, I don't care" override, sticky until unmarked;
  doesn't touch the file or the render hash, only how the row's status
  reads (`nodes/vo_dub_library.py`'s `compute_row_status(manually_marked_done=...)`).
  A "🔁 Render pending" toolbar button renders every not-started/stale row
  in the WHOLE open bucket, one at a time, awaited in sequence with a
  running "N/total" progress status -- mirrors `ScriptLibraryPanel.vue`'s
  own "🔁 Re-voice pending" button (same sequential-not-concurrent
  reasoning: flooding ComfyUI's queue with dozens of heavy TTS renders at
  once helps nobody). Opening a bucket shows each
  row's English and Russian takes side by side, with a left-aligned toolbar
  strip underneath: an Effect dropdown (post-render DSP -- "radio" (gritty
  walkie-talkie), "phone" (clean landline call), and "muffled" (a natural,
  non-telephony dampening -- a much wider passband than phone's, no
  clip/distortion, no static, for a voice heard through a thin barrier
  rather than a device) today, see `nodes/_audio_effects.py`'s `EFFECTS`
  registry -- and [docs/creating_audio_effects.md](docs/creating_audio_effects.md)
  for how to add a new one) with its own Save
  button next to it, Render/Re-render, "▶ Play both" (starts EN+RU together
  from 0 for a direct comparison). Both players are plain native
  `<audio controls>` elements (an earlier round replaced them with a
  bespoke waveform-driven player -- reverted after re-inventing bugs the
  native element never had, back to the same component every other
  editor in this addon already uses); a small canvas waveform
  (`src/vo_dub_editor/WaveformCanvas.vue`, decoded client-side via
  `decodeWaveformPeaks()`) sits above each purely as a visual overview,
  never touching playback. A toolbar "▶ Play in order" button plays
  through the open PAGE's own RU takes in sequence, auto-advancing on
  `ended` and skipping any row with no take -- mirrors
  `LineEditorApp.vue`'s own "mode 1" sequential playback; pausing the
  active row via its own native controls (for any reason other than
  reaching the end) stops the run instead of continuing past it. A labels
  row directly above the players
  shows EN's own duration on the left and RU's measured duration + drift %
  on the right, sharing the same 3-column grid as the players row so each
  label lands over its own player. Render/Re-render, the (now 200px-wide)
  Effect dropdown, and its Save button (shown only once the pick differs
  from what's saved) live in their own row below, left-aligned. Picking an
  Effect previews it INSTANTLY on the RU take via a live Web Audio graph
  (`src/vo_dub_editor/effect_preview.js`) -- no re-render, no save. Clicking
  the Save button commits it AND, if the row already has a take, reprocesses
  the actual file in a fraction of a second -- no TTS re-synthesis. This works
  because every render also writes a second, pre-effect reference copy
  (`_dub_dry/<audio_key>.wav`, this addon's own sidecar -- deliberately
  outside `audio_ru/` itself, which is the game's own external contract);
  Save's fast path (`POST /vo_dub/apply_effect`) just reprocesses THAT
  file with the newly chosen effect and overwrites `audio_ru/<audio_key>.wav`
  directly, pure DSP with no graph execution at all. A row with no take
  yet (nothing to reprocess) falls back to a normal Render. Either path is
  what actually applies the effect for real (`nodes/audio_post_process.py`'s
  `effect_override` input, AFTER trim/fade/normalize) -- folded into the
  row's own staleness hash either way, so changing the effect without
  either committing path shows as stale. A "Use original as sample"
  checkbox sits next to each row's Role field, plus a project-wide default
  in the toolbar (a row that's never touched its own checkbox follows the
  default; ticking/unticking it explicitly always wins). When resolved on,
  the row's `line_override` gains a 4th `|`-separated field (the row's own
  `audio_en\<key>.wav` path) -- FL CosyVoice3 Speaker Instruct2 Dialog's
  own live-reference-audio escape hatch (see that node's module docstring:
  a 4-field script line clones straight from that wav via
  `inference_instruct2`/`inference_cross_lingual` with `zero_shot_spk_id=''`,
  bypassing the saved `.pt` preset for that line entirely, instruct still
  applies). Folded into the row's staleness hash the same
  way Effect is. Every player, native or "Play both", is guarded against clipping
  its own first fraction of a second (`src/shared/audio_buffer_guard.js`):
  with lazy loading (`preload="none"`, see below), pressing play can start
  outputting audio before enough has actually buffered -- the guard pauses
  and resumes once buffered, transparently. Lets you edit the Russian
  text/instruct/role. Each row's editing
  controls are `src/shared/LineRowEditor.vue` -- THE SAME mounted component
  the audiobook Line Editor uses for a line, not a similar-looking
  re-implementation: a Role field (pick a known role code, resolving to
  whatever voice `_dub_roles.json` assigned it, or type a literal preset
  directly), an info icon that shows that role's full `_dub_roles.json`
  entry (character/gender/actor/description/dub direction/notes/voice) on
  hover, an instruct field with undo/pick-from-a-phrase-bank
  (`_instruct_categories.json`)/apply-to-every-other-row-with-the-same-role
  buttons, and the auto-resizing text field itself. The phrase bank grows
  from actual use, not just hand-curation: any instruct text a row ends up
  with that isn't ALREADY somewhere in `_instruct_categories.json` gets
  appended into its own "custom" category automatically, debounced the
  same way the row's own save is (`src/shared/instruct_library.js`, shared
  by this editor and VO Dub's) -- picking a phrase FROM the bank is a
  no-op here since it's already present. Plus a "´ Stress
  mark" button (`src/shared/stress_mark.js`) elsewhere in the toolbar that
  inserts a combining accent at the cursor of whichever field is focused.
  A read-only "Identifier" (the raw `speaker` tag pulled from the game's
  own resources -- e.g. `Ellie`, which this project's own casting document
  might resolve to a role coded `emma`) sits ahead of the Role field, fed
  into `LineRowEditor.vue` through its own `#leading` slot (the audiobook's
  ▶ play button occupies that same slot on its side) -- no bulk-selection
  UI, by design (see below). Edits save to `_dub_state.json`, a sidecar
  this addon owns exclusively -- **never**
  back into `vo_dataset.csv`, which is a file GENERATED by the game
  project's own tooling and gets silently overwritten on its next run.
  A per-row "🔁 Render" button queues the currently-open graph (same TTS
  nodes as the audiobook path) with that row's resolved
  speaker/instruct/text and writes straight to `audio_ru/<audio_key>.wav` --
  Audio Post-Process's `output_path_override` input bypasses the
  `_audio/lines/<script>/<position>_<hash>.wav` scheme entirely for this.
  Its own Roles editor (`_dub_roles.json`, opened via the "Roles" button)
  assigns a real CosyVoice preset per role -- but this addon doesn't
  invent that file's shape or identity model. `_dub_roles.json` is
  typically GENERATED by a project's own casting script (same class of
  file as `vo_dataset.csv` -- e.g. this repo was developed against a real
  project whose `scripts/06_assign_roles.py` matches regex rules against
  `audio_key` to assign a curated role code like `emma`/`sam`, not
  `vo_dataset.csv`'s own noisy `speaker` column), and each role there can
  carry a full casting document -- character name, gender (+ the evidence
  for it), actor, description, dub direction, notes, computed stats --
  that this addon reads and shows but never invents. `speaker` is the
  ONE field this editor adds or edits; everything else round-trips
  untouched on every save. The user has explicitly chosen to write that
  field directly into the project's own `_dub_roles.json` -- accepting
  that re-running a project's casting script wipes it, the same way
  re-running its dataset script would wipe an edit to `vo_dataset.csv`.
  "Seed from dataset" (creating one blank role per distinct raw `speaker`
  tag from `vo_dataset.csv`) still exists for a project with no casting
  document of its own yet, but is of limited use once one exists, since
  its curated role codes don't share a namespace with raw csv tags.
  Row<->role matching itself is deliberately NOT automated (a raw tag
  like `Prompt` doesn't reliably mean one character across an entire
  project, so there's no project-wide "alias" for one) -- assigning a role
  to a specific row is the per-row Role field described above, a manual
  override that always wins over the raw tag and, once set, resolves
  through `_dub_roles.json` exactly like the raw tag would.
  A handful of rows (6 out of 2083 in the real project) carry 3/4-channel
  audio split across multiple files (`.a`-`.d`) instead of one flat
  `<audio_key>.wav` -- this addon can only ever play or render a single
  mono/stereo file, so those show as `unsupported` (no players, no Identifier/
  Role fields, no render button) rather than silently failing to play or
  writing a file the game's own repack script would reject.

## Requirements

- **FL-CosyVoice3** installed and working (for the actual TTS nodes --
  Speaker Instruct2 Dialog, Speaker Clone, Zero-Shot, etc. -- that a
  workflow wires Script Library's output into).
- One upstream patch, described below.
- Script Library's `line_hashes_json` output wired into Audio Post-
  Process's `line_hashes_json` input (both nodes are in THIS addon, no
  upstream patch needed -- just a connection in your own workflow, the same
  way `folder_path`/`filename` already feed Post-Process's `script_folder`/
  `script_base_name`). The 🔁 per-line re-voice, "🔁 Re-voice all pending",
  and the checkbox tree's "🔊 Voice Selected/Act/All" queue all stamp the
  correct hash onto Post-Process directly already (they fetch/compute it
  from the exact same content they're rendering, so there's nothing for a
  missing wire to break there) -- this wire is only still needed for a
  plain "Run" with nothing checked in the tree (whatever script is
  currently "active"). Without it, that one path falls back to hashing
  just the text (no voice/instruct), so a role recast alone won't be
  detected as making one of its lines need re-voicing until it's re-voiced
  some other way at least once.

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
    _instruct_categories.json    <- {"categories": [{"name","title","when","examples"}, ...]} (optional phrase bank, by register)
    Act01/
        Scene 0101 Something.txt   <- "preset | instruct | line text[ | pause]", one turn per line
        _audio/                                        <- created automatically as you render
            lines/<script>/<position>_<hash>.wav  <- per-line audio (see above)
            timing/<script>.json                        <- per-line timing manifest for playback sync
            <script>.wav                    <- final stitched track (written ONLY by "✅ Done")
```

### The optional 4th field: how long to hold after a line

A line can name its own pause -- seconds of silence held *after* it,
written as a 4th field (a decimal comma works too, `1,5` == `1.5`):

```
voldemort | Speak coldly and quietly. | Crucio.  | 2
hermione  | Speak with quiet fear.    | Не надо. | 0
narrator  | Speak quietly and gravely. | Дверь закрылась.
```

- **Left off** (the normal case) the line holds `0.3s`, exactly what the
  stitch always used -- except the LAST line of a script, which holds
  nothing unless it asks to. A script with no pause fields anywhere
  stitches to bit-identical audio to what it did before this field
  existed.
- **`0`** is a real value, not "unset": the next line comes in on top of
  this one, which is how an interruption reads.
- **Unreadable or out of range** (0-10s) falls back to the default rather
  than erroring -- the line editor flags the cell but the line still
  renders. One typo'd pause can never make a line unvoiceable.
- The pause is **not part of a line's content hash**: it's silence the
  stitch inserts between takes, not audio the TTS renders, so editing one
  leaves every existing take valid -- no re-voicing. What it does
  invalidate is the *final stitched track*, and that's caught separately:
  "✅ Done" records the resolved pause of every line into the timing
  manifest, and a script whose pauses (or line count) no longer match its
  manifest simply stops counting as done, so pressing ✅ Done again
  re-stitches it. Nothing needs re-rendering for that.
- Downstream never sees this field. FL-CosyVoice3's Dialog node splits on
  `|` and requires exactly 3 parts, so Script Library drops the 4th on the
  way out (same place role codes get resolved to real presets).

Splitting a line hands the pause to the second half, and merging two keeps
the second one's -- in both cases because the pause belongs *after* what's
being said, not to the row it happened to be typed on.

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
- `app.sass` -- the manifest: `@forward "variables"` + `@forward
  "placeholders"`, in the order they should be available (`@forward`,
  not `@use` -- see the file's own comment for why: `@use` alone would
  keep their members private to app.sass itself). This is the ONE file
  that decides which shared modules exist and in what order --
  `vite.config.js`/`vitest.config.js`'s
  `css.preprocessorOptions.sass.additionalData` both auto-`@use "../sass/
  app" as *` THIS one file into every component's own `.sass` (the
  wildcard drops the namespace prefix `@use` would otherwise require,
  reproducing `@import`'s old "just works" ergonomics without its
  global-namespace-collision risk -- see [Dart Sass's own migration
  guide](https://sass-lang.com/documentation/breaking-changes/import/)),
  and `web/fl_shared.sass` (below) does the same, so that list is
  written once instead of copied three times. Only declarations belong
  here (variables, placeholders, mixins -- nothing that compiles to
  real CSS output on its own), since `@forward`'s styles ride along
  wherever this file is loaded -- every component's own separate
  compilation, for the additionalData path -- so anything with actual
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
`@use`s `src/sass/app` (`as *`, same reasoning as above) explicitly
since it doesn't go through Vite's additionalData.

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

## Test layout

All test files now live in `src/__tests__/`, a single flat folder.
Previously they were scattered in per-component `__tests__` subfolders.

## License

MIT.
