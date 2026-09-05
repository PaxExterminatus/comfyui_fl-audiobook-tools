---
name: fl-audiobook-frontend
description: Vue 3 + PrimeVue 3 conventions for this addon's frontend (comfyui_fl-audiobook-tools) -- the 4 Vue editors (Roles Editor, Browse Dialog, Script Library's tree panel, Line Editor), their Vite lib-mode multi-entry build into web/, the shared Sass structure, and the 2 remaining hand-written vanilla widgets. Consult this whenever touching anything under src/, web/, vite.config.js, vitest.config.js, or a .sass file in this repo -- adding a new editor or PrimeVue component, adding a shared composable/component, changing the build, writing a component test, or debugging why a build/style/test isn't behaving as expected. Also check it before assuming what `npm run build`/`dev`/`test`/`dev:ui` do.
---

# FL Audiobook Tools -- frontend conventions

This addon's frontend has been fully migrated from hand-written vanilla
JS to Vue 3 + PrimeVue 3, one editor at a time, over a long series of
sessions -- the conventions below are the accumulated result of that
migration and several rounds of real bugs found and fixed along the way.
Read this before making changes so you don't re-discover the same
gotchas from scratch.

## Architecture at a glance

```
src/
  roles_editor/       RolesEditorApp.vue + .sass, main.js (entry)
  browse_dialog/       BrowseDialogApp.vue + .sass, main.js (entry)
  script_library/      ScriptLibraryPanel.vue + .sass, main.js (entry)
  line_editor/          LineEditorApp.vue + .sass, PickPanel.vue + .sass, main.js (entry)
  shared/               panel_width.js, PanelWidthButtons.vue/.sass, styles_link.js
  sass/                 _variables.sass, _placeholders.sass, global.sass
  __tests__/, */__tests__/   Vitest component tests
dev-ui/                 standalone (no-ComfyUI) dev harness -- index.html, main.js, mock-api.js
fixtures/                fake project data dev-ui/tests seed from
web/                     BUILD OUTPUT (the 4 entries + their shared chunks) alongside
                         the remaining hand-written vanilla files:
                           script_editor.js, script_library.js (queue-orchestration half only),
                           audio_post_process.js, ui_kit.js, styles.js, fl_common.js,
                           fl_shared.sass (source) / fl_shared.css (compiled)
scripts/                 clean-chunks.mjs, compile-vanilla-sass.mjs (both run pre-build)
```

Each editor is a **Vite library-mode entry** (see `vite.config.js`'s
`build.lib.entry`) that compiles straight into `web/`, *replacing* a
hand-written file of the same name. ComfyUI has no build step for end
users -- it just serves `web/` as static files -- so the compiled output
must be committed, same as any other file in `web/`. `emptyOutDir:
false` is load-bearing: `web/` also holds the still-hand-written vanilla
files, and a normal Vite build would otherwise delete them.

Because 4+ entries share one `web/` output directory with
`emptyOutDir: false`, Rollup's chunk-splitting heuristic can shift which
modules get shared between entries as their import graphs change from
one build to the next -- a chunk that was shared last time and isn't
anymore just sits there, orphaned, forever. `npm run build`/`dev` always
run `scripts/clean-chunks.mjs` first, which deletes every `*.esm.js`
chunk (PrimeVue's own per-component style chunks are always named that
way) before each build so this can't accumulate. If you ever see an
unfamiliar `*.esm.js` file in `web/` that nothing imports, that script
either hasn't run yet or something new is skipping it.

## The rules that came from real bugs

These aren't stylistic preferences -- each one below was a real,
observed failure during this project's Vue migration. Skipping them
tends to reproduce the exact same bug.

**Never statically import one entry's `main.js` from another entry's
component.** Every entry's own source file is named `main.js` within its
own folder (`src/roles_editor/main.js`, `src/line_editor/main.js`, ...).
Rollup names a chunk shared between 2+ entries after the *shared
module's own basename* -- so importing `../browse_dialog/main.js`
directly from `ScriptLibraryPanel.vue` made Rollup hoist that code into
a chunk literally named `main.js`, colliding with every other entry that
also happens to import a sibling's `main.js`. Fix: pass cross-editor
functions (`openBrowseDialog`, `openRolesEditor`, `openLineEditor`,
`queueLineRevoice`) in as **props** from whichever file does the
mounting, never as a static import of another entry.

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
button variants come from props, not overridden CSS. If you're about to
write CSS that changes how a PrimeVue component's own internals look
(padding, border-radius, colors *inside* it) rather than how it's
*positioned/sized* from the outside, stop and check whether a prop
already does what you want. (Card was chosen over Panel for Roles
Editor's per-role cards specifically because there's no per-card
collapse feature here -- see "cards flow horizontally" below.)

**Dialogs in this addon don't close on an outside click, except Line
Editor, which is deliberately non-modal.** Roles Editor and Browse
Dialog are `modal` but explicitly *not* `dismissable-mask` -- an
accidental click past the panel's edge shouldn't silently lose
in-progress edits. Line Editor goes further and is `:modal="false"`
entirely (no backdrop, clicks fall through to the ComfyUI canvas
underneath) so the user can keep it open while working the graph
(dragging nodes, hitting Run) -- that's a deliberate, different design
from the other two, not something to "fix" into consistency.

**Roles Editor's cards flow left-to-right in a CSS grid, not a single
vertical column, and none of them collapse.** An earlier version tried
`Panel` with `toggleable` (collapsed by default, click-to-expand) to
shorten a long vertical list -- this was explicitly reverted: an extra
click before every edit is a real slowdown for something used
constantly, and the actual fix for "list too long" was the *layout*
(`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`), not
hiding content. If you're tempted to add expand/collapse to make a list
"more compact," reach for a wrapping grid first.

## Sass

Every component's CSS lives in a **co-located `.sass` file** (indented
syntax, not SCSS), wired in via
`<style scoped lang="sass" src="./Name.sass">` -- Vue treats a
`src`-loaded style block exactly like an inline one (still scoped,
still preprocessed), it's just a real file with normal syntax
highlighting instead of a giant string inside the `.vue` file.

- `src/sass/_variables.sass` -- design tokens named by **role**
  (`$color-accent`, `$border-subtle`, `$font-sm`, ...), not by whatever
  number got typed first. Before this file existed, the "same"
  selection-highlight blue was `rgb(90,140,255)` in three files and
  `rgb(90,150,255)` in a fourth, and half a dozen near-identical
  `rgba(255,255,255, 0.08-0.16)` values had no real distinction between
  them. When you need "a subtle border" or "the accent color," check
  here before typing a new rgba.
- `src/sass/_placeholders.sass` -- `%ellipsis` (the exact 3-declaration
  overflow/ellipsis/nowrap combo was independently retyped 8+ times) and
  a `button-row` mixin (gap is a parameter -- call sites genuinely
  disagree on it, don't force one value).
- `src/sass/global.sass` -- truly unscoped CSS that can't live in any
  one component's scoped style (currently Line Editor's role-info
  Teleport-target popover). Imported once via `src/shared/
  styles_link.js`, the same way the PrimeVue theme CSS itself is.

Both partials auto-`@import` into every component's own `.sass` via
`vite.config.js`/`vitest.config.js`'s
`css.preprocessorOptions.sass.additionalData` -- don't add manual
`@import` lines to a component's `.sass` file, they're already there.

**`web/fl_shared.sass` is the one exception.** It styles the 2 remaining
hand-written vanilla widgets (`script_editor.js`'s browse button,
`ui_kit.js`'s report viewer) and isn't part of Vite's module graph at
all -- it's linked at runtime via a plain `<link>` tag
(`web/styles.js`'s `injectStyles()`), never `import`ed. It gets compiled
by its own tiny script, `scripts/compile-vanilla-sass.mjs`, and
explicitly `@import`s the shared partials itself since it can't rely on
Vite's additionalData. If you edit it, bump `STYLE_VERSION` in
`web/styles.js` (unversioned filename = browsers cache it forever).

**Adding a new shared token or pattern:** if you notice a value or CSS
pattern duplicated across 2+ components, that's the signal to add it to
`_variables.sass`/`_placeholders.sass` -- don't leave the duplicate,
and don't invent a third slightly-different value either.

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
- A component's Vue-devtools-style ref-based `:style` binding for a
  *genuinely dynamic* value (user-adjustable width, a live play/pause
  icon color) should stay bound in JS; a *static* one that happens to
  sit on a PrimeVue prop like `content-style` should move to the
  component's own `.sass` via `:deep(...)` instead -- see any of the 4
  editors' Dialog usage for the pattern.

**Always verify live, not just via tests.** `npm run dev:ui` (no
ComfyUI needed, mock backend seeded from `fixtures/`) is the fast loop;
confirm against the real ComfyUI instance too before calling a UI change
done -- several bugs in this project's history (the invisible dropdown
text, the Panel collapse that silently never re-collapsed) only showed
up against the real PrimeVue build/theme, not in isolation.

## Build & dev scripts

| Script | What it does |
|---|---|
| `npm run build` | clean-chunks → compile-vanilla-sass → `vite build` (all 4 entries + fl_shared.css) into `web/` |
| `npm run dev` | same, but `vite build --watch` -- rebuilds `web/*.js` on save; refresh ComfyUI's tab to see it |
| `npm run dev:ui` | real Vite dev server (HMR) serving `dev-ui/index.html` directly, no ComfyUI or rebuild-refresh cycle needed -- `dev-ui/mock-api.js` stands in for the aiohttp backend |
| `npm test` / `npm run test:watch` | Vitest, `happy-dom` |
| `npm run clean:chunks` / `npm run compile:vanilla-sass` | the two pre-build steps above, runnable standalone |

## Adding a new editor or shared piece

1. `src/<name>/<Name>App.vue` + co-located `<Name>App.sass` (`<style
   scoped lang="sass" src="./<Name>App.sass">`), `main.js` exporting an
   `open<Name>({...})` imperative function matching the existing
   editors' shape.
2. Register the entry in `vite.config.js`'s `build.lib.entry`.
3. If it needs to call another editor's `open...` function, receive it
   as a prop -- never `import` another entry's `main.js` (see the rule
   above).
4. Reuse `src/shared/panel_width.js` (`usePanelWidth`) +
   `src/shared/PanelWidthButtons.vue` if it needs a resizable-width
   dialog; reuse `web/fl_common.js`'s exported API path constants
   (`SCRIPT_EDITOR_API`, `SCRIPT_LIBRARY_API`, `BROWSE_API`, ...)
   instead of hardcoding a literal route string -- this has bitten the
   project before (two components independently hardcoded the same
   `/fl_cosyvoice3/browse/list_dir` literal instead of importing it).
5. Write a `src/<name>/__tests__/<Name>App.test.js` alongside the other
   4 editors' tests for the pattern to copy.
6. `npm run build && npm test`, then verify live in both `npm run
   dev:ui` and the real ComfyUI instance before calling it done.
