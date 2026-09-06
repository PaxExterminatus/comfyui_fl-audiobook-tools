import { _ as ne, r as E, a as ae, H as le, c as h, g as m, u as C, f as p, k as R, F as I, l as z, n as ue, t as x, S as B, q as de, L as D, o as v, h as w, p as A, N as P, v as pe, x as fe, y as he, P as ve } from "./styles_link.js";
const ge = { class: "script-library-panel" }, ke = { class: "tools-row" }, _e = { class: "tools-row" }, be = {
  key: 0,
  class: "tree-empty"
}, me = ["onClick"], Ce = ["checked", "onChange"], we = { class: "chevron" }, ye = { class: "act-name" }, Se = { class: "act-count" }, $e = ["onClick"], Ee = ["checked", "disabled", "title", "onChange"], Re = ["onClick"], xe = {
  key: 0,
  class: "row-icon",
  title: "Marked done / ready to release"
}, Fe = ["title"], Le = {
  key: 1,
  class: "row-icon",
  title: "Has line(s) marked as needing re-voice (edited, or a role's speaker was recast)"
}, We = {
  key: 2,
  class: "row-icon row-icon-dim",
  title: "Rendered audio already exists for this script"
}, Ie = { class: "status-line" }, H = "FL_CosyVoice3.ScriptLibrary.lastFolder", Ae = 90, Pe = 3e3, je = "::", qe = {
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
  setup(y) {
    var T;
    const i = y;
    function l(e, s) {
      return `${e}${je}${s}`;
    }
    function F(e) {
      try {
        e && localStorage.setItem(H, e);
      } catch {
      }
    }
    function L() {
      try {
        return localStorage.getItem(H) || "";
      } catch {
        return "";
      }
    }
    const n = E(i.folderWidget.value || ""), u = E(i.actWidget.value || ""), a = E([]), r = D(/* @__PURE__ */ new Set()), f = D(/* @__PURE__ */ new Set()), k = E(""), _ = E(((T = i.filterWidget) == null ? void 0 : T.value) ?? "");
    function j() {
      i.filterWidget && (_.value = i.filterWidget.value ?? "");
    }
    const M = de(() => n.value ? `📁 ${n.value}` : "📁 Click to browse for a project folder");
    function d(e) {
      k.value = e, i.node.setDirtyCanvas(!0, !0);
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
    function Y() {
      var s;
      const e = (s = i.node.properties) == null ? void 0 : s.checkedScripts;
      Array.isArray(e) && (r.clear(), e.forEach((t) => {
        typeof t == "string" && r.add(t);
      }));
    }
    function g() {
      V(), i.node._flCheckedItems = U();
      const e = a.value.reduce((t, o) => t + o.scripts.length, 0), s = a.value.length && !a.value.every((t) => t.filter_applied !== !1) ? ` (some acts have no "${_.value}" files -- showing all .txt there)` : "";
      d(`${a.value.length} act(s), ${e} script(s)${s} | ${r.size} checked`);
    }
    function G() {
      let e = !1;
      return a.value.forEach(({ act: s, ready_scripts: t }) => {
        (t || []).forEach((o) => {
          const c = l(s, o);
          r.has(c) && (r.delete(c), e = !0);
        });
      }), e;
    }
    function q(e, s, t) {
      const o = s.filter(($) => !t.has($));
      if (!o.length) return "none";
      const c = o.filter(($) => r.has(l(e, $))).length;
      return c === 0 ? "none" : c === o.length ? "all" : "some";
    }
    function b(e) {
      return new Set(e.ready_scripts || []);
    }
    function O(e) {
      return e.scripts.filter((s) => r.has(l(e.act, s))).length;
    }
    function K(e, s) {
      e && (e.indeterminate = q(s.act, s.scripts, b(s)) === "some");
    }
    function J(e) {
      u.value = e, i.actWidget.value = e, f.has(e) ? f.delete(e) : f.add(e);
    }
    function Q(e, s) {
      const t = b(e);
      s ? e.scripts.forEach((o) => {
        t.has(o) || r.add(l(e.act, o));
      }) : e.scripts.forEach((o) => r.delete(l(e.act, o))), g();
    }
    function X(e, s, t) {
      t ? r.add(l(e, s)) : r.delete(l(e, s)), g();
    }
    function Z(e, s) {
      u.value = e, i.actWidget.value = e, i.scriptFileWidget.value = s;
    }
    function ee() {
      a.value.forEach((e) => e.scripts.forEach((s) => {
        (e.ready_scripts || []).includes(s) || r.add(l(e.act, s));
      })), g();
    }
    function te() {
      r.clear(), g();
    }
    function oe() {
      a.value.forEach((e) => e.scripts.forEach((s) => {
        const t = l(e.act, s), o = (e.ready_scripts || []).includes(s);
        r.has(t) ? r.delete(t) : o || r.add(t);
      })), g();
    }
    function se() {
      i.openBrowseDialog({
        mode: "folder",
        startPath: n.value,
        onSelect: (e) => {
          n.value = e, i.folderWidget.value = e, S();
        }
      });
    }
    function ie() {
      if (!n.value) {
        d("Set a project folder first");
        return;
      }
      i.openRolesEditor({ root: n.value, suffix: _.value });
    }
    function re(e, s) {
      i.openLineEditor({
        folder: pe(n.value, e),
        filename: s,
        suffix: _.value,
        // Lets the editor's own header checkbox reflect/toggle this
        // script's checked-for-queueing state without closing the editor.
        // Scoped to THIS act -- editor-side prev/next navigation never
        // crosses into another act.
        checkedApi: {
          isChecked: (t) => r.has(l(e, t)),
          setChecked: (t, o) => {
            o ? r.add(l(e, t)) : r.delete(l(e, t)), g();
          }
        },
        // Backs the line editor's "Re-voice this line" button -- act is
        // forced explicitly since the editor can be opened for any row, not
        // just whichever one is "active" in the tree. `file: filename` is
        // only a fallback for THIS script (spread after it, so it wins):
        // Line Editor's own Prev/Next can switch this same editor instance
        // to a different script post-open, and it always passes ITS
        // current filename in `opts.file` -- this closure's `filename`
        // param is fixed at the moment editScript() ran and never updates,
        // so relying on it after Prev/Next would re-voice into the WRONG
        // script's _audio\lines\ folder (see LineEditorApp.vue's revoiceRow).
        revoiceApi: {
          revoiceLine: (t) => i.queueLineRevoice(i.node, { act: e, file: s, ...t })
        }
      });
    }
    async function S() {
      if (j(), !n.value) {
        a.value = [], d("No project folder set -- click below to browse for one");
        return;
      }
      try {
        const s = await (await fetch(`${B}/tree?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(_.value)}`)).json();
        if (s.error) {
          d(`Error: ${s.error}`);
          return;
        }
        if (F(n.value), a.value = s.tree, (!u.value || !a.value.some((o) => o.act === u.value)) && (u.value = a.value.length ? a.value[0].act : "", i.actWidget.value = u.value), u.value && f.add(u.value), !i.scriptFileWidget.value && u.value) {
          const o = a.value.find((c) => c.act === u.value);
          o != null && o.scripts.length && (i.scriptFileWidget.value = o.scripts[0]);
        }
        const t = G();
        g(), t && g();
      } catch (e) {
        d(`Error: ${e}`);
      }
    }
    async function ce() {
      if (!n.value) {
        d("Set a project folder first");
        return;
      }
      let e;
      try {
        const c = await (await fetch(`${B}/pending_revoice?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(_.value)}`)).json();
        if (c.error) {
          d(`Error: ${c.error}`);
          return;
        }
        e = c.scripts || [];
      } catch (o) {
        d(`Error: ${o}`);
        return;
      }
      const s = e.reduce((o, c) => o + c.pending.length, 0);
      if (!s) {
        d("Nothing needs re-voicing");
        return;
      }
      let t = 0;
      d(`Re-voicing 0/${s}...`);
      for (const o of e)
        for (const c of o.pending) {
          try {
            await i.queueLineRevoice(i.node, {
              act: o.act,
              file: o.file,
              linePosition: c.position,
              speaker: c.speaker,
              instruct: c.instruct,
              text: c.text,
              // Same output-location pinning the line editor does (see
              // LineEditorApp's revoiceRow): folder/base_name here come
              // from the pending_revoice scan, which resolved them with
              // THIS panel's suffix -- so they're the same names the
              // scan itself checked against. contentHash likewise comes
              // straight from that same scan (nodes/script_library.py's
              // script_pending_lines already computed it from this
              // exact resolved speaker/instruct/text) instead of being
              // recomputed here -- stamped onto Post-Process's
              // line_hashes_json so the re-voice doesn't depend on the
              // graph having that output/input wired.
              folder: o.folder,
              baseName: o.base_name,
              contentHash: c.hash
            });
          } catch ($) {
            console.error(`FL_CosyVoice3.ScriptLibrary: re-voice-all failed for ${o.act}/${o.file} position ${c.position}`, $);
          }
          t++, d(`Re-voicing ${t}/${s}...`);
        }
      d(`Re-voiced ${t}/${s} line(s)`), S();
    }
    function N() {
      if (Y(), j(), !n.value) {
        const e = L();
        e && (n.value = e, i.folderWidget.value = e);
      }
      n.value ? S() : d("No project folder set -- click below to browse for one");
    }
    let W = null;
    return ae(() => {
      const e = i.node.onConfigure;
      i.node.onConfigure = function(t) {
        const o = e ? e.apply(this, arguments) : void 0;
        return N(), o;
      };
      const s = i.folderWidget.callback;
      i.folderWidget.callback = function(t) {
        const o = s ? s.apply(this, arguments) : void 0;
        return n.value = t, S(), o;
      }, N(), W = setInterval(() => {
        n.value && S();
      }, Pe);
    }), le(() => {
      W && clearInterval(W);
    }), (e, s) => (v(), h("div", ge, [
      m(C(w), {
        label: M.value,
        title: n.value,
        text: "",
        class: "browse-button",
        onClick: se
      }, null, 8, ["label", "title"]),
      p("div", ke, [
        m(C(w), {
          label: "🎭 Roles",
          title: "Assign a real speaker preset to each role code (edits _roles.json)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: ie
        }),
        m(C(w), {
          label: "🔁 Re-voice pending",
          title: "Re-voice every line across the whole project marked as needing it (stale or never voiced)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: ce
        })
      ]),
      p("div", _e, [
        m(C(w), {
          label: "☑ All",
          title: "Check every script in every act (skips scripts marked ready)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: ee
        }),
        m(C(w), {
          label: "☐ None",
          title: "Uncheck every script",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: te
        }),
        m(C(w), {
          label: "⇄ Invert",
          title: "Flip every script's checked state (skips scripts marked ready)",
          size: "small",
          outlined: "",
          class: "tool-btn",
          onClick: oe
        })
      ]),
      p("div", {
        class: "tree",
        style: ue({ minHeight: `${Ae}px` })
      }, [
        a.value.length ? R("", !0) : (v(), h("div", be, "(no acts found)")),
        (v(!0), h(I, null, z(a.value, (t) => (v(), h(I, {
          key: t.act
        }, [
          p("div", {
            class: A(["act-row", { "act-row-active": t.act === u.value }]),
            onClick: (o) => J(t.act)
          }, [
            p("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: q(t.act, t.scripts, b(t)) === "all",
              ref_for: !0,
              ref: (o) => K(o, t),
              onClick: s[0] || (s[0] = P(() => {
              }, ["stop"])),
              onChange: (o) => Q(t, o.target.checked)
            }, null, 40, Ce),
            p("span", we, x(f.has(t.act) ? "▾" : "▸"), 1),
            p("span", ye, x(t.act), 1),
            p("span", Se, x(O(t) ? `${O(t)}/${t.scripts.length}` : t.scripts.length), 1)
          ], 10, me),
          f.has(t.act) ? (v(!0), h(I, { key: 0 }, z(t.scripts, (o) => (v(), h("div", {
            key: o,
            class: A(["script-row", { "script-row-active": t.act === u.value && y.scriptFileWidget.value === o }]),
            onClick: (c) => Z(t.act, o)
          }, [
            p("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: r.has(l(t.act, o)),
              disabled: b(t).has(o),
              title: b(t).has(o) ? "Marked ready to release -- unmark it in the editor (Done) to queue it again" : "",
              onClick: s[1] || (s[1] = P(() => {
              }, ["stop"])),
              onChange: (c) => X(t.act, o, c.target.checked)
            }, null, 40, Ee),
            p("button", {
              class: "edit-btn",
              title: "Open the full-screen line-by-line editor",
              onClick: P((c) => re(t.act, o), ["stop"])
            }, "✏️", 8, Re),
            b(t).has(o) ? (v(), h("span", xe, "✅")) : R("", !0),
            p("span", {
              class: A(["script-name", { "script-name-active": t.act === u.value && y.scriptFileWidget.value === o }]),
              title: o
            }, x(o), 11, Fe),
            (t.pending_scripts || []).includes(o) ? (v(), h("span", Le, "⚠️")) : R("", !0),
            (t.audio_scripts || []).includes(o) ? (v(), h("span", We, "🔊")) : R("", !0)
          ], 10, $e))), 128)) : R("", !0)
        ], 64))), 128))
      ], 4),
      p("div", Ie, x(k.value), 1)
    ]));
  }
}, Oe = /* @__PURE__ */ ne(qe, [["__scopeId", "data-v-06adc896"]]);
function Te({ node: y, folderWidget: i, actWidget: l, filterWidget: F, scriptFileWidget: L, openBrowseDialog: n, openRolesEditor: u, openLineEditor: a, queueLineRevoice: r }) {
  fe(import.meta.url);
  const f = document.createElement("div");
  f.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const k = he(Oe, {
    node: y,
    folderWidget: i,
    actWidget: l,
    filterWidget: F,
    scriptFileWidget: L,
    openBrowseDialog: n,
    openRolesEditor: u,
    openLineEditor: a,
    queueLineRevoice: r
  });
  return k.use(ve, { ripple: !0 }), k.mount(f), { element: f, unmount: () => k.unmount() };
}
export {
  Te as mountScriptLibraryPanel
};
