# FL CosyVoice3 Audiobook Tools

A standalone Electron app for producing multi-line, multi-character audio
dramas and audiobooks, and for re-dubbing a game's existing voice-over, built
on [FL-CosyVoice3](https://github.com/filliptm/ComfyUI_FL-CosyVoice3) for the
actual TTS synthesis. ComfyUI is not involved at runtime -- `electron-server/`
invokes FL-CosyVoice3's Python library directly (see `_tts_engine.py`).

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
  see `electron-server/_audio_utils.py`'s own module docstring), fade, and
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
  reads (`electron-server/_vo_dub_helpers.py`'s `compute_row_status(manually_marked_done=...)`).
  A "🔁 Render pending" toolbar button renders every not-started/stale row
  in the WHOLE open bucket, one at a time, awaited in sequence with a
  running "N/total" progress status -- mirrors `ScriptLibraryPanel.vue`'s
  own "🔁 Re-voice pending" button (same sequential-not-concurrent
  reasoning: flooding the TTS engine with dozens of heavy renders at once
  helps nobody). Opening a bucket shows each
  row's English and Russian takes side by side, with a left-aligned toolbar
  strip underneath: an Effect dropdown (post-render DSP -- "radio" (gritty
  walkie-talkie), "phone" (clean landline call), and "muffled" (a natural,
  non-telephony dampening -- a much wider passband than phone's, no
  clip/distortion, no static, for a voice heard through a thin barrier
  rather than a device) today, see `electron-server/_audio_effects.py`'s `EFFECTS`
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
  what actually applies the effect for real (`electron-server/routes/vo_dub.py`'s
  render route, AFTER trim/fade/normalize) -- folded into the
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

- A downloaded CosyVoice model (`_tts_engine.py`'s `_find_model_dir` looks
  under `<models_dir>/cosyvoice/` for a `cosyvoice*.yaml` config).
- FL-CosyVoice3's own Python package available for `_tts_engine.py` to
  import (`FL_COSYVOICE3_DIR` in that file points at its install location).
- Node.js, for the Electron app and its frontend build.

## Installation

```bash
npm install
npm run electron:dev   # launches electron-server/ + the Electron window
```

## Project folder layout this expects

```
MyPlay/                          <- the project root you browse to in Script Library
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

The UI is Vue 3 + PrimeVue 3 throughout, living in `src/` as a shared
component library: Roles Editor, Browse Dialog, Script Library's tree
panel, the Line Editor, and the VO Dub editors. Two apps mount these
components:

- `electron-ui/` -- the real Electron app's Vue-Router frontend
  (`npm run dev:electron-ui` / `npm run electron:dev`). Its "Host"
  components (e.g. `ScriptLibraryHost.vue`) build the widget-shaped
  objects these components expect via `electron-ui/apis.js`'s
  `makeWidget()`, and talk to `electron-server/`'s aiohttp routes.
- `dev-ui/` -- a lightweight mock-backed harness for developing/clicking
  through the components without the real backend running (see below).

### Styling

Component CSS lives in co-located `<style scoped>` blocks or plain CSS
files (no Sass/SCSS preprocessing). `src/style/app.css`, loaded once
globally via `src/shared/styles_link.js`, holds the shared "type
vocabulary" classes (`.row`, `.actions`, `.list`, `.grid`, `.panel`,
`.card`, ...) used by structural role across every editor instead of a
bespoke class per component -- see that file's own comment for the full
set. Any class read by JavaScript (`querySelector`, `classList`,
`closest`, in component code or tests) carries a `-js` suffix so it
reads as a behavioral hook, not just styling.

### Developing the UI without a running backend

`npm run dev:ui` starts a real Vite dev server (HMR, no rebuild-and-
refresh needed) serving `dev-ui/index.html` directly in a plain browser
tab -- `dev-ui/mock-api.js` stands in for `electron-server/`'s aiohttp
routes, seeded from the JSON/text files under `fixtures/`. Edits made in
the UI are kept in memory for that dev-server session (not written back
to the fixture files); restart the server to reset to the fixtures'
on-disk content.

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

All test files live in `src/__tests__/`, a single flat folder: pure-helper
tests (e.g. `fl_common.test.js` for `src/shared/fl_common.js`) alongside
component tests that mount their component with a mocked `fetch` and
drive it through the DOM (the Line Editor's suite also exercises its
`ConfirmDialog` flow -- delete-with-confirm -- via
`primevue/confirmationservice`).

## License

MIT.
