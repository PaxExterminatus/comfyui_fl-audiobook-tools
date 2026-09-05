import { _ as ce, r as x, o as ne, J as ae, j as h, f as b, u as m, e as p, i as E, F as A, k as T, K as le, t as R, S as W, b as z, N as B, d as v, n as j, Q as P, l as de, m as ue, p as pe, P as fe } from "./styles_link.js";
import { s as C } from "./button.esm.js";
const he = { class: "script-library-panel" }, ve = { class: "tools-row" }, ke = { class: "tools-row" }, ge = {
  key: 0,
  class: "tree-empty"
}, _e = ["onClick"], be = ["checked", "onChange"], me = { class: "chevron" }, Ce = { class: "act-name" }, we = { class: "act-count" }, ye = ["onClick"], Se = ["checked", "disabled", "title", "onChange"], $e = ["onClick"], Ee = {
  key: 0,
  class: "row-icon",
  title: "Marked done / ready to release"
}, Re = ["title"], xe = {
  key: 1,
  class: "row-icon",
  title: "Has line(s) marked as needing re-voice (edited, or a role's speaker was recast)"
}, Fe = {
  key: 2,
  class: "row-icon row-icon-dim",
  title: "Rendered audio already exists for this script"
}, Le = { class: "status-line" }, D = "FL_CosyVoice3.ScriptLibrary.lastFolder", Ie = 90, Ae = 3e3, We = "::", je = {
  __name: "ScriptLibraryPanel",
  props: {
    node: { type: Object, required: !0 },
    folderWidget: { type: Object, required: !0 },
    actWidget: { type: Object, required: !0 },
    filterWidget: { type: Object, default: null },
    scriptFileWidget: { type: Object, required: !0 },
    // Every cross-editor entry point is passed in rather than statically
    // imported: openBrowseDialog/openRolesEditor ARE separate Vite lib
    // entries (see vite.config.js), and importing an entry's main.js
    // directly from a THIRD entry's source made Rollup hoist that shared
    // code into its own chunk named after the shared module's basename --
    // "main.js" for every one of these, since every entry's own source
    // file is called that within its own folder, which collided across
    // entries. Passing these as props keeps every entry's build output
    // independent (aside from the intentionally-shared
    // src/shared/styles_link.js). openLineEditor/queueLineRevoice aren't
    // Vite entries at all (line_editor.js is still vanilla JS, and
    // queueLineRevoice lives in web/script_library.js's own module scope).
    openBrowseDialog: { type: Function, required: !0 },
    openRolesEditor: { type: Function, required: !0 },
    openLineEditor: { type: Function, required: !0 },
    queueLineRevoice: { type: Function, required: !0 }
  },
  setup(w) {
    const i = w;
    function l(e, s) {
      return `${e}${We}${s}`;
    }
    function F(e) {
      try {
        e && localStorage.setItem(D, e);
      } catch {
      }
    }
    function L() {
      try {
        return localStorage.getItem(D) || "";
      } catch {
        return "";
      }
    }
    const n = x(i.folderWidget.value || ""), d = x(i.actWidget.value || ""), a = x([]), r = B(/* @__PURE__ */ new Set()), f = B(/* @__PURE__ */ new Set()), g = x(""), y = z(() => {
      var e;
      return ((e = i.filterWidget) == null ? void 0 : e.value) || "_speakers.txt";
    }), M = z(() => n.value ? `📁 ${n.value}` : "📁 Click to browse for a project folder");
    function u(e) {
      g.value = e, i.node.setDirtyCanvas(!0, !0);
    }
    function U() {
      const e = [];
      return a.value.forEach((s) => s.scripts.forEach((t) => {
        r.has(l(s.act, t)) && e.push({ act: s.act, file: t });
      })), e;
    }
    function V() {
      i.node.properties = i.node.properties || {}, i.node.properties.checkedScripts = Array.from(r);
    }
    function H() {
      var s;
      const e = (s = i.node.properties) == null ? void 0 : s.checkedScripts;
      Array.isArray(e) && (r.clear(), e.forEach((t) => {
        typeof t == "string" && r.add(t);
      }));
    }
    function k() {
      V(), i.node._flCheckedItems = U();
      const e = a.value.reduce((t, o) => t + o.scripts.length, 0), s = a.value.length && !a.value.every((t) => t.filter_applied !== !1) ? ` (some acts have no "${y.value}" files -- showing all .txt there)` : "";
      u(`${a.value.length} act(s), ${e} script(s)${s} | ${r.size} checked`);
    }
    function J() {
      let e = !1;
      return a.value.forEach(({ act: s, ready_scripts: t }) => {
        (t || []).forEach((o) => {
          const c = l(s, o);
          r.has(c) && (r.delete(c), e = !0);
        });
      }), e;
    }
    function O(e, s, t) {
      const o = s.filter(($) => !t.has($));
      if (!o.length) return "none";
      const c = o.filter(($) => r.has(l(e, $))).length;
      return c === 0 ? "none" : c === o.length ? "all" : "some";
    }
    function _(e) {
      return new Set(e.ready_scripts || []);
    }
    function q(e) {
      return e.scripts.filter((s) => r.has(l(e.act, s))).length;
    }
    function K(e, s) {
      e && (e.indeterminate = O(s.act, s.scripts, _(s)) === "some");
    }
    function Y(e) {
      d.value = e, i.actWidget.value = e, f.has(e) ? f.delete(e) : f.add(e);
    }
    function G(e, s) {
      const t = _(e);
      s ? e.scripts.forEach((o) => {
        t.has(o) || r.add(l(e.act, o));
      }) : e.scripts.forEach((o) => r.delete(l(e.act, o))), k();
    }
    function Q(e, s, t) {
      t ? r.add(l(e, s)) : r.delete(l(e, s)), k();
    }
    function X(e, s) {
      d.value = e, i.actWidget.value = e, i.scriptFileWidget.value = s;
    }
    function Z() {
      a.value.forEach((e) => e.scripts.forEach((s) => {
        (e.ready_scripts || []).includes(s) || r.add(l(e.act, s));
      })), k();
    }
    function ee() {
      r.clear(), k();
    }
    function te() {
      a.value.forEach((e) => e.scripts.forEach((s) => {
        const t = l(e.act, s), o = (e.ready_scripts || []).includes(s);
        r.has(t) ? r.delete(t) : o || r.add(t);
      })), k();
    }
    function oe() {
      i.openBrowseDialog({
        mode: "folder",
        startPath: n.value,
        onSelect: (e) => {
          n.value = e, i.folderWidget.value = e, S();
        }
      });
    }
    function se() {
      if (!n.value) {
        u("Set a project folder first");
        return;
      }
      i.openRolesEditor({ root: n.value, suffix: y.value });
    }
    function ie(e, s) {
      i.openLineEditor({
        folder: de(n.value, e),
        filename: s,
        suffix: y.value,
        // Lets the editor's own header checkbox reflect/toggle this
        // script's checked-for-queueing state without closing the editor.
        // Scoped to THIS act -- editor-side prev/next navigation never
        // crosses into another act.
        checkedApi: {
          isChecked: (t) => r.has(l(e, t)),
          setChecked: (t, o) => {
            o ? r.add(l(e, t)) : r.delete(l(e, t)), k();
          }
        },
        // Backs the line editor's "Re-voice this line" button -- act/file
        // are forced explicitly since the editor can be opened for any
        // row, not just whichever one is "active" in the tree.
        revoiceApi: {
          revoiceLine: (t) => i.queueLineRevoice(i.node, { act: e, file: s, ...t })
        }
      });
    }
    async function S() {
      if (!n.value) {
        a.value = [], u("No project folder set -- click below to browse for one");
        return;
      }
      try {
        const s = await (await fetch(`${W}/tree?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(y.value)}`)).json();
        if (s.error) {
          u(`Error: ${s.error}`);
          return;
        }
        if (F(n.value), a.value = s.tree, (!d.value || !a.value.some((o) => o.act === d.value)) && (d.value = a.value.length ? a.value[0].act : "", i.actWidget.value = d.value), d.value && f.add(d.value), !i.scriptFileWidget.value && d.value) {
          const o = a.value.find((c) => c.act === d.value);
          o != null && o.scripts.length && (i.scriptFileWidget.value = o.scripts[0]);
        }
        const t = J();
        k(), t && k();
      } catch (e) {
        u(`Error: ${e}`);
      }
    }
    async function re() {
      if (!n.value) {
        u("Set a project folder first");
        return;
      }
      let e;
      try {
        const c = await (await fetch(`${W}/pending_revoice?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(y.value)}`)).json();
        if (c.error) {
          u(`Error: ${c.error}`);
          return;
        }
        e = c.scripts || [];
      } catch (o) {
        u(`Error: ${o}`);
        return;
      }
      const s = e.reduce((o, c) => o + c.pending.length, 0);
      if (!s) {
        u("Nothing needs re-voicing");
        return;
      }
      let t = 0;
      u(`Re-voicing 0/${s}...`);
      for (const o of e)
        for (const c of o.pending) {
          try {
            await i.queueLineRevoice(i.node, {
              act: o.act,
              file: o.file,
              lineId: c.id,
              speaker: c.speaker,
              instruct: c.instruct,
              text: c.text
            }), await fetch(`${W}/mark_line_voiced`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ folder: o.folder, base_name: o.base_name, line_id: c.id })
            });
          } catch ($) {
            console.error(`FL_CosyVoice3.ScriptLibrary: re-voice-all failed for ${o.act}/${o.file} line ${c.id}`, $);
          }
          t++, u(`Re-voicing ${t}/${s}...`);
        }
      u(`Re-voiced ${t}/${s} line(s)`), S();
    }
    function N() {
      if (H(), !n.value) {
        const e = L();
        e && (n.value = e, i.folderWidget.value = e);
      }
      n.value ? S() : u("No project folder set -- click below to browse for one");
    }
    let I = null;
    return ne(() => {
      const e = i.node.onConfigure;
      i.node.onConfigure = function(t) {
        const o = e ? e.apply(this, arguments) : void 0;
        return N(), o;
      };
      const s = i.folderWidget.callback;
      i.folderWidget.callback = function(t) {
        const o = s ? s.apply(this, arguments) : void 0;
        return n.value = t, S(), o;
      }, N(), I = setInterval(() => {
        n.value && S();
      }, Ae);
    }), ae(() => {
      I && clearInterval(I);
    }), (e, s) => (v(), h("div", he, [
      b(m(C), {
        label: M.value,
        title: n.value,
        text: "",
        class: "browse-button",
        onClick: oe
      }, null, 8, ["label", "title"]),
      p("div", ve, [
        b(m(C), {
          label: "🎭 Roles",
          title: "Assign a real speaker preset to each role code (edits _roles.json)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: se
        }),
        b(m(C), {
          label: "🔁 Re-voice pending",
          title: "Re-voice every line across the whole project marked as needing it (stale or never voiced)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: re
        })
      ]),
      p("div", ke, [
        b(m(C), {
          label: "☑ All",
          title: "Check every script in every act (skips scripts marked ready)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: Z
        }),
        b(m(C), {
          label: "☐ None",
          title: "Uncheck every script",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: ee
        }),
        b(m(C), {
          label: "⇄ Invert",
          title: "Flip every script's checked state (skips scripts marked ready)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: te
        })
      ]),
      p("div", {
        class: "tree",
        style: le({ minHeight: `${Ie}px` })
      }, [
        a.value.length ? E("", !0) : (v(), h("div", ge, "(no acts found)")),
        (v(!0), h(A, null, T(a.value, (t) => (v(), h(A, {
          key: t.act
        }, [
          p("div", {
            class: j(["act-row", { "act-row-active": t.act === d.value }]),
            onClick: (o) => Y(t.act)
          }, [
            p("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: O(t.act, t.scripts, _(t)) === "all",
              ref_for: !0,
              ref: (o) => K(o, t),
              onClick: s[0] || (s[0] = P(() => {
              }, ["stop"])),
              onChange: (o) => G(t, o.target.checked)
            }, null, 40, be),
            p("span", me, R(f.has(t.act) ? "▾" : "▸"), 1),
            p("span", Ce, R(t.act), 1),
            p("span", we, R(q(t) ? `${q(t)}/${t.scripts.length}` : t.scripts.length), 1)
          ], 10, _e),
          f.has(t.act) ? (v(!0), h(A, { key: 0 }, T(t.scripts, (o) => (v(), h("div", {
            key: o,
            class: j(["script-row", { "script-row-active": t.act === d.value && w.scriptFileWidget.value === o }]),
            onClick: (c) => X(t.act, o)
          }, [
            p("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: r.has(l(t.act, o)),
              disabled: _(t).has(o),
              title: _(t).has(o) ? "Marked ready to release -- unmark it in the editor (Done) to queue it again" : "",
              onClick: s[1] || (s[1] = P(() => {
              }, ["stop"])),
              onChange: (c) => Q(t.act, o, c.target.checked)
            }, null, 40, Se),
            p("button", {
              class: "edit-btn",
              title: "Open the full-screen line-by-line editor",
              onClick: P((c) => ie(t.act, o), ["stop"])
            }, "✏️", 8, $e),
            _(t).has(o) ? (v(), h("span", Ee, "✅")) : E("", !0),
            p("span", {
              class: j(["script-name", { "script-name-active": t.act === d.value && w.scriptFileWidget.value === o }]),
              title: o
            }, R(o), 11, Re),
            (t.pending_scripts || []).includes(o) ? (v(), h("span", xe, "⚠️")) : E("", !0),
            (t.audio_scripts || []).includes(o) ? (v(), h("span", Fe, "🔊")) : E("", !0)
          ], 10, ye))), 128)) : E("", !0)
        ], 64))), 128))
      ], 4),
      p("div", Le, R(g.value), 1)
    ]));
  }
}, Pe = /* @__PURE__ */ ce(je, [["__scopeId", "data-v-b460ec79"]]);
function Ne({ node: w, folderWidget: i, actWidget: l, filterWidget: F, scriptFileWidget: L, openBrowseDialog: n, openRolesEditor: d, openLineEditor: a, queueLineRevoice: r }) {
  ue(import.meta.url);
  const f = document.createElement("div");
  f.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const g = pe(Pe, {
    node: w,
    folderWidget: i,
    actWidget: l,
    filterWidget: F,
    scriptFileWidget: L,
    openBrowseDialog: n,
    openRolesEditor: d,
    openLineEditor: a,
    queueLineRevoice: r
  });
  return g.use(fe, { ripple: !0 }), g.mount(f), { element: f, unmount: () => g.unmount() };
}
export {
  Ne as mountScriptLibraryPanel
};
