# FL CosyVoice3 Audiobook Tools

Script/act project management for producing multi-line, multi-character
audio dramas and audiobooks with [FL-CosyVoice3](https://github.com/filliptm/ComfyUI_FL-CosyVoice3).
This is an **add-on**, not a fork -- it does no TTS synthesis itself, and
requires FL-CosyVoice3 installed alongside it for the actual voice models.

## What's in here

- **FL CosyVoice3 Script Library** -- browse a project (root folder with
  `Act01/`, `Act02/`, ... subfolders, each holding `*_speakers.txt` dialog
  scripts). Checkbox-queue one/many/all scripts through your own graph, a
  role catalog (`_roles.json`) for reassigning a character's voice
  project-wide, per-script ✅ Done / 🔊 has-audio / ⚠ needs-re-voice status.
- **Full-screen line editor** (opens from the Script Library tree) -- one
  row per script line: speaker, instruct text, spoken text, drag-to-merge,
  split, add, delete. Each line tracks its own voice status (`unvoiced` /
  `voiced` / `stale`) and its own per-line audio file
  (`_audio/lines/<script>/id<N>.wav`), so editing, merging, deleting, or
  reordering lines never desyncs playback the way relying on one
  script-wide timing offset would. A 🔁 button re-voices just one line
  through your currently-open graph; ✅ Done stitches every line's file
  into the final track once every line is voiced.
- **FL CosyVoice3 Script Editor** -- a simple in-graph text box live-linked
  to one file on disk (two-way: edits here save to the file, external
  edits get pulled back in).
- **FL CosyVoice3 Audio Post-Process** -- onset-click/tail trim, fade,
  loudness normalization, and list-stitching for any synthesis node's
  output; also the node that writes each line's per-line file and the
  per-line timing manifest the line editor's playback sync reads.
- **Roles editor** -- reassign a role's speaker (voice preset) for the
  whole project; recasting a role automatically marks every already-voiced
  line using that role stale across every act (and un-readies + deletes
  the final file of any script that was marked Done), so nothing silently
  ships with the old voice.

## Requirements

- **FL-CosyVoice3** installed and working (for the actual TTS nodes --
  Speaker Instruct2 Dialog, Speaker Clone, Zero-Shot, etc. -- that a
  workflow wires Script Library's output into).
- One upstream patch, described below.

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
        Scene 0101 Something_speakers.txt   <- "preset | instruct | line text", one turn per line
        _audio/                             <- created automatically as you render
            lines/<script>/id<N>.wav        <- per-line audio, one file per script line
            timing/<script>.json            <- per-line timing manifest for playback sync
            <script>_00001_.flac            <- final stitched track (Save Audio, or "✅ Done")
```

## Frontend development

The editors are being migrated from hand-written vanilla JS to Vue 3 +
PrimeVue 3, one at a time -- Roles Editor, Browse Dialog, and the Script
Library node's tree panel are done so far (Line Editor is still vanilla
JS). Each is built with Vite in library mode straight into `web/`,
replacing the hand-written file of the same name -- end users never need
Node.js, only whoever's developing this addon. Script Library's own
`web/script_library.js` still holds a hand-written remainder: the
`app.graphToPrompt`/`app.queuePrompt` queue-orchestration patch (running
the checked scripts, per-line re-voice) isn't UI and stays untouched --
only the tree/browse-button/tools-row rendering moved to
`src/script_library/ScriptLibraryPanel.vue`.

```bash
npm install
npm run dev     # rebuilds web/*.js on save -- refresh ComfyUI's tab to see changes
npm run build   # one-off production build
```

### Developing the UI without ComfyUI running

`npm run dev:ui` starts a real Vite dev server (HMR, no rebuild-and-
refresh needed) serving `dev-ui/index.html` directly in a plain browser
tab -- `dev-ui/mock-api.js` stands in for the aiohttp backend
(`nodes/script_editor.py` / `nodes/script_library.py`'s routes), seeded
from the JSON/text files under `fixtures/`. Edits made in the UI are kept
in memory for that dev-server session (not written back to the fixture
files); restart the server to reset to the fixtures' on-disk content.

```bash
npm run dev:ui   # http://localhost:5173 -- opens the Roles Editor immediately
```

### Tests

Vitest + `@vue/test-utils`, `happy-dom` for the DOM environment:

```bash
npm test         # run once
npm run test:watch
```

`src/__tests__/` covers the pure helpers in `web/fl_common.js`;
`src/roles_editor/__tests__/`, `src/browse_dialog/__tests__/`, and
`src/script_library/__tests__/` each mount their component with a mocked
`fetch` and drive it through the DOM.

## License

MIT.
