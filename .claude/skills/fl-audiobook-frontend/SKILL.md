---
name: fl-audiobook-frontend
description: Vue 3 + PrimeVue 3 conventions for this Electron app's frontend (comfyui_fl-audiobook-tools) -- the shared Vue component library under src/ (Roles Editor, Browse Dialog, Script Library, Line Editor, VO Dub editors), the two apps that mount it (electron-ui/ for the real Electron app, dev-ui/ for a mock-backed preview harness), the shared CSS vocabulary, and the aiohttp backend under electron-server/. Consult this whenever touching anything under src/, electron-ui/, electron-server/, dev-ui/, vite.config.js, or vitest.config.js -- adding a new editor or PrimeVue component, adding a shared composable/component, writing a component test, or debugging why a build/style/test isn't behaving as expected. Also check it before assuming what `npm run dev:ui`/`dev:electron-ui`/`electron:dev`/`test` do.
---

# FL Audiobook Tools -- frontend conventions

This is a standalone Electron app (ComfyUI is not involved at runtime --
TTS synthesis is invoked directly, see `electron-server/_tts_engine.py`).
The conventions below are the accumulated result of a long Vue migration
and several rounds of real bugs found and fixed along the way. Read this
before making changes so you don't re-discover the same gotchas from
scratch.

## Architecture at a glance

```
src/
  roles_editor/        RolesEditorContent.vue, main.js
  browse_dialog/        BrowseDialogContent.vue, main.js
  script_library/       ScriptLibraryPanel.vue, main.js
  line_editor/            LineEditorContent.vue, SpeakerPickerDialog.vue, composables/, main.js
  vo_dub_editor/          VoDubBrowserPanel.vue, VoDubLineEditorContent.vue,
                          DubRolesEditorApp.vue, WaveformCanvas.vue, composables/, main.js
  shared/                 components reused across editors (DialogHeader, LineRowEditor,
                          RoleDropdown, RoleInfoPopover, LineHistoryDialog, ...),
                          fl_common.js (API path constants), styles_link.js,
                          primevue_components.js (component registration), pinia.js
  stores/                 Pinia stores (voDubStore.js)
  style/                  app.css -- the shared CSS vocabulary, loaded globally
  __tests__/              Vitest tests, one flat folder
electron/                  Electron main process (electron/main.js) -- spawns
                           electron-server/server.py, opens the window onto electron-ui/
electron-ui/               Vue-Router app for the real Electron window -- routes to
                           "Host" components that mount the src/*.vue content
                           components with widget-shaped props (apis.js's makeWidget())
electron-server/            standalone aiohttp backend -- server.py + routes/*.py,
                            shared per-line audio/history/speaker-preset/effects helpers
dev-ui/                     standalone mock-backed dev harness -- index.html, main.js, mock-api.js
fixtures/                   fake project data dev-ui/tests seed from
```

Each editor's content component (`RolesEditorContent.vue`,
`ScriptLibraryPanel.vue`, ...) is framework-agnostic about how it's
mounted: `electron-ui/`'s Host components wrap it for the real app,
`dev-ui/main.js` wraps it for the mock-backed preview, and Vitest mounts
it directly in tests. There is no build step that compiles these into a
separate output directory -- `vite.config.js` only serves `dev-ui/` (for
`npm run dev:ui`); `vite.electron.config.js` only serves `electron-ui/`
(for `npm run dev:electron-ui`).

## The rules that came from real bugs

These aren't stylistic preferences -- each one below was a real,
observed failure during this project's Vue migration. Skipping them
tends to reproduce the exact same bug.

**Don't set `display` in a scoped style targeting a PrimeVue element
that relies on the theme's own flex layout.** PrimeVue's `theme.css`
wraps almost everything in `@layer primevue { ... }`, and CSS Cascade
Layers rules make an *unlayered* declaration always beat a *layered* one
for the same property, regardless of specificity. A component's own
`<style scoped>` is unlayered. Setting `display: block` on a Dropdown's
root (even just to set its width) silently killed the `display:
inline-flex` PrimeVue needs internally, collapsing its label to a few
px. Rule of thumb: only set `width`/`margin`/positioning on a PrimeVue
component's root from outside -- never `display`, and be suspicious of
any layout property a PrimeVue component's own docs mention needing
internally.

**Use PrimeVue's own structural components, don't fight them with
custom CSS.** Dialog handles its own backdrop, ESC-to-close, and close
button. Panel's `toggleable` prop gives a free collapse/expand button.
OverlayPanel dismisses on outside click by default. ConfirmDialog +
`useConfirm()` replaces a hand-rolled confirm modal. ripple/rounded/text
button variants come from props, not overridden CSS. InlineMessage's
`severity` prop replaces a hand-rolled status-color class set. If you're
about to write CSS that changes how a PrimeVue component's own internals
look (padding, border-radius, colors *inside* it) rather than how it's
*positioned/sized* from the outside, stop and check whether a prop
already does what you want.

**Dialogs in this app don't close on an outside click, except Line
Editor, which is deliberately non-modal.** Roles Editor and Browse
Dialog are `modal` but explicitly *not* `dismissable-mask` -- an
accidental click past the panel's edge shouldn't silently lose
in-progress edits. Line Editor goes further and is `:modal="false"`
entirely (no backdrop) so the user can keep it open while working
elsewhere -- that's a deliberate, different design from the other two,
not something to "fix" into consistency.

**Roles Editor's cards flow left-to-right in a CSS grid, not a single
vertical column, and none of them collapse.** An earlier version tried
`Panel` with `toggleable` (collapsed by default, click-to-expand) to
shorten a long vertical list -- this was explicitly reverted: an extra
click before every edit is a real slowdown for something used
constantly, and the actual fix for "list too long" was the *layout*
(the shared `.grid` class, `grid-template-columns: repeat(auto-fill,
minmax(var(--grid-min, 260px), 1fr))`), not hiding content. If you're
tempted to add expand/collapse to make a list "more compact," reach for
a wrapping grid first.

## Styling

No Sass/SCSS -- plain CSS only, either a component's own `<style
scoped>` block or the shared vocabulary in `src/style/app.css` (loaded
once globally via `src/shared/styles_link.js`).

`app.css` holds a small, closed set of classes used by structural/
semantic ROLE across every editor instead of a bespoke class per
component: `.row`/`.actions` (horizontal flex groups), `.list` (vertical
stack), `.grid` (card grid, `--grid-min` overridable per call site),
`.panel`/`.card` (bordered containers), `.space-between`/`.spacer`/
`.shrink-0`/`.grow` (flex modifiers), `.text-warning`/`.text-active`/
`.text-success` (semantic color), `.w100p`/`.ellipsis`. A visual
difference between two call sites is a modifier combined with one of
these, never a new bespoke class. Prefer a PrimeVue component/prop over
a custom class first (see "use PrimeVue's own structural components"
above) -- the vocabulary is for layout shapes PrimeVue has no opinion on,
not a replacement for its own styling.

**The `-js` suffix convention:** any CSS class read by JavaScript
(`querySelector`, `classList`, `closest`, in component/composable code
or test files) carries a `-js` suffix (e.g. `vo-dub-row-js`,
`is-playing-js`, `stale-js`) so it's visually obvious which classes are
behavioral hooks -- renaming one breaks logic or tests, not just looks
-- versus pure styling classes, which are safe to rename/restyle freely.
When renaming a `-js` class, update its template `class`/`:class`,
every plain-JS reference to it, its own `<style scoped>` selectors, and
every test that queries it, all in the same pass.

**Adding a new shared token or pattern:** if you notice a value or CSS
pattern duplicated across 2+ components, that's the signal to add it to
`app.css` -- don't leave the duplicate, and don't invent a third
slightly-different value either.

## Testing

Vitest + `happy-dom` + `@vue/test-utils`. A few environment-specific
things that aren't bugs in the component under test:

- **PrimeVue's Dialog/OverlayPanel/ConfirmDialog Teleport their content
  to `document.body`.** Mount with `attachTo: document.body` and query
  `document.body`, not the `wrapper`, for anything inside them.
- **Assert on `.value`, not `.textContent`, for `<input>`/`<textarea>`.**
  Their content isn't part of the DOM's rendered text nodes; a
  `document.body.textContent` check will silently pass while missing
  the actual field values entirely.
- **ConfirmDialog's own buttons have stable classes** --
  `.p-confirm-dialog-accept` / `.p-confirm-dialog-reject` -- more
  reliable to query than matching button text.
- **happy-dom doesn't reproduce how PrimeVue's Dialog merges an
  externally-passed `:style` prop with its own internal positioning
  style.** This is confirmed working correctly in a real browser (the
  width visibly changes, the merged inline style shows the new value)
  but a test asserting `dialogEl.style.width` in happy-dom will see the
  old value forever. Assert on the actual logic your component owns
  instead (e.g. what `usePanelWidth`'s `setWidth` persisted to
  `localStorage`), not on PrimeVue's own DOM merge.
- A `:ref` callback on a Vue **component** (e.g. `<Card :ref="...">`)
  receives that component's public instance, not its root DOM element --
  use `el?.$el ?? el` to get the actual element (needed for
  `scrollIntoView`, focus, measuring, etc.).
- A component's `:style` binding for a *genuinely dynamic* value
  (user-adjustable width, a live play/pause icon color) should stay
  bound in JS; a *static* value belongs in a real named class in
  `<style scoped>` instead -- never use `style="..."` as a substitute
  for a named class.

**Always verify live, not just via tests.** `npm run dev:ui` (mock
backend seeded from `fixtures/`) is the fast loop; confirm against
`npm run dev:electron-ui` + `npm run electron:dev` (the real Electron
app + `electron-server/`) too before calling a UI change done --
PrimeVue's own build/theme only renders fully in a real browser, not in
`happy-dom`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev:ui` | Vite dev server (HMR) serving `dev-ui/index.html` -- `dev-ui/mock-api.js` stands in for `electron-server/`'s routes |
| `npm run dev:electron-ui` | Vite dev server serving `electron-ui/` (`vite.electron.config.js`), talking to a real `electron-server/` |
| `npm run electron:dev` | launches the actual Electron app (spawns `electron-server/server.py`, opens the window onto `electron-ui/`) |
| `npm test` / `npm run test:watch` | Vitest, `happy-dom` |

## Adding a new editor or shared piece

1. `src/<name>/<Name>Content.vue` (or `<Name>App.vue` for a dialog-shaped
   one), `main.js` exporting an `open<Name>({...})` function matching
   the existing editors' shape.
2. If `electron-ui/` needs to open it, add a Host component there
   (mirroring e.g. `ScriptLibraryHost.vue`) and a route in
   `electron-ui/router.js`; if `dev-ui/` should preview it too, wire a
   toolbar button in `dev-ui/main.js`.
3. Reuse `src/shared/fl_common.js`'s exported API path constants
   (`SCRIPT_EDITOR_API`, `SCRIPT_LIBRARY_API`, `BROWSE_API`, `VO_DUB_API`,
   ...) instead of hardcoding a literal route string -- this has bitten
   the project before (two components independently hardcoded the same
   route literal instead of importing it).
4. Reuse `src/shared/panel_width.js` (`usePanelWidth`) +
   `src/shared/PanelWidthButtons.vue` if it needs a resizable-width
   dialog.
5. Write a `src/__tests__/<Name>.test.js` alongside the other editors'
   tests for the pattern to copy.
6. `npm test`, then verify live in both `npm run dev:ui` and `npm run
   dev:electron-ui`/`electron:dev` before calling it done.
