import { _ as ie, l as y, o as ce, L as ne, c as v, b as C, d as p, i as S, F as L, j as q, t as $, S as B, m as ae, r as le, A as N, a as g, n as T, M as W, p as de, v as ue, x as pe, P as fe, y as he } from "./styles_link.js";
const ve = { class: "script-library-panel list" }, ge = { class: "actions" }, ke = { class: "actions" }, _e = { class: "tree panel" }, me = {
  key: 0,
  class: "tree-empty p-text-secondary"
}, be = ["onClick"], Ce = ["checked", "onChange"], we = { class: "chevron p-text-secondary" }, ye = { class: "act-name ellipsis" }, Se = { class: "act-count p-text-secondary" }, $e = ["onClick"], xe = ["checked", "disabled", "title", "onChange"], Ee = ["onClick"], Re = {
  key: 0,
  title: "Marked done / ready to release"
}, Fe = ["title"], Le = {
  key: 1,
  title: "Has line(s) marked as needing re-voice (edited, or a role's speaker was recast)"
}, We = {
  key: 2,
  class: "row-icon-dim",
  title: "Rendered audio already exists for this script"
}, Ae = { class: "status-line p-text-secondary" }, D = "FL_CosyVoice3.ScriptLibrary.lastFolder", Ie = 3e3, Pe = "::", je = {
  __name: "ScriptLibraryPanel",
  props: {
    node: { type: Object, required: !0 },
    folderWidget: { type: Object, required: !0 },
    actWidget: { type: Object, required: !0 },
    filterWidget: { type: Object, default: null },
    scriptFileWidget: { type: Object, required: !0 },
    /*
     Every cross-editor entry point is passed in rather than statically
     imported: openBrowseDialog/openRolesEditor ARE separate Vite lib
     entries (see vite.config.js), and importing an entry's main.js
     directly from a THIRD entry's source made Rollup hoist that shared
     code into its own chunk named after the shared module's basename --
     "main.js" for every one of these, since every entry's own source
     file is called that within its own folder, which collided across
     entries. Passing these as props keeps every entry's build output
     independent (aside from the intentionally-shared
     src/shared/styles_link.js). openLineEditor/queueLineRevoice aren't
     Vite entries at all (line_editor.js is still vanilla JS, and
     queueLineRevoice lives in web/script_library.js's own module scope).
    */
    openBrowseDialog: { type: Function, required: !0 },
    openRolesEditor: { type: Function, required: !0 },
    openLineEditor: { type: Function, required: !0 },
    queueLineRevoice: { type: Function, required: !0 }
  },
  setup(x) {
    var O;
    const i = x;
    function l(e, o) {
      return `${e}${Pe}${o}`;
    }
    function E(e) {
      try {
        e && localStorage.setItem(D, e);
      } catch {
      }
    }
    function R() {
      try {
        return localStorage.getItem(D) || "";
      } catch {
        return "";
      }
    }
    const n = y(i.folderWidget.value || ""), d = y(i.actWidget.value || ""), a = y([]), c = N(/* @__PURE__ */ new Set()), f = N(/* @__PURE__ */ new Set()), _ = y(""), m = y(((O = i.filterWidget) == null ? void 0 : O.value) ?? "");
    function A() {
      i.filterWidget && (m.value = i.filterWidget.value ?? "");
    }
    const V = ae(() => n.value ? `📁 ${n.value}` : "📁 Click to browse for a project folder");
    function u(e) {
      _.value = e, i.node.setDirtyCanvas(!0, !0);
    }
    function M() {
      const e = [];
      return a.value.forEach((o) => o.scripts.forEach((s) => {
        c.has(l(o.act, s)) && e.push({ act: o.act, file: s });
      })), e;
    }
    function U() {
      i.node.properties = i.node.properties || {}, i.node.properties.checkedScripts = Array.from(c);
    }
    function z() {
      var o;
      const e = (o = i.node.properties) == null ? void 0 : o.checkedScripts;
      Array.isArray(e) && (c.clear(), e.forEach((s) => {
        typeof s == "string" && c.add(s);
      }));
    }
    function k() {
      U(), i.node._flCheckedItems = M();
      const e = a.value.reduce((s, t) => s + t.scripts.length, 0), o = a.value.length && !a.value.every((s) => s.filter_applied !== !1) ? ` (some acts have no "${m.value}" files -- showing all .txt there)` : "";
      u(`${a.value.length} act(s), ${e} script(s)${o} | ${c.size} checked`);
    }
    function H() {
      let e = !1;
      return a.value.forEach(({ act: o, ready_scripts: s }) => {
        (s || []).forEach((t) => {
          const r = l(o, t);
          c.has(r) && (c.delete(r), e = !0);
        });
      }), e;
    }
    function I(e, o, s) {
      const t = o.filter((h) => !s.has(h));
      if (!t.length) return "none";
      const r = t.filter((h) => c.has(l(e, h))).length;
      return r === 0 ? "none" : r === t.length ? "all" : "some";
    }
    function b(e) {
      return new Set(e.ready_scripts || []);
    }
    function P(e) {
      return e.scripts.filter((o) => c.has(l(e.act, o))).length;
    }
    function Y(e, o) {
      e && (e.indeterminate = I(o.act, o.scripts, b(o)) === "some");
    }
    function K(e) {
      d.value = e, i.actWidget.value = e, f.has(e) ? f.delete(e) : f.add(e);
    }
    function G(e, o) {
      const s = b(e);
      o ? e.scripts.forEach((t) => {
        s.has(t) || c.add(l(e.act, t));
      }) : e.scripts.forEach((t) => c.delete(l(e.act, t))), k();
    }
    function J(e, o, s) {
      s ? c.add(l(e, o)) : c.delete(l(e, o)), k();
    }
    function Q(e, o) {
      d.value = e, i.actWidget.value = e, i.scriptFileWidget.value = o;
    }
    function X() {
      a.value.forEach((e) => e.scripts.forEach((o) => {
        (e.ready_scripts || []).includes(o) || c.add(l(e.act, o));
      })), k();
    }
    function Z() {
      c.clear(), k();
    }
    function ee() {
      a.value.forEach((e) => e.scripts.forEach((o) => {
        const s = l(e.act, o), t = (e.ready_scripts || []).includes(o);
        c.has(s) ? c.delete(s) : t || c.add(s);
      })), k();
    }
    function te() {
      i.openBrowseDialog({
        mode: "folder",
        startPath: n.value,
        onSelect: (e) => {
          n.value = e, i.folderWidget.value = e, w();
        }
      });
    }
    function oe() {
      if (!n.value) {
        u("Set a project folder first");
        return;
      }
      i.openRolesEditor({ root: n.value, suffix: m.value });
    }
    function se(e, o) {
      i.openLineEditor({
        folder: de(n.value, e),
        filename: o,
        suffix: m.value,
        /*
         Lets the editor's own header checkbox reflect/toggle this
         script's checked-for-queueing state without closing the editor.
         Scoped to THIS act -- editor-side prev/next navigation never
         crosses into another act.
        */
        checkedApi: {
          isChecked: (s) => c.has(l(e, s)),
          setChecked: (s, t) => {
            t ? c.add(l(e, s)) : c.delete(l(e, s)), k();
          }
        },
        /*
         Backs the line editor's "Re-voice this line" button -- act is
         forced explicitly since the editor can be opened for any row, not
         just whichever one is "active" in the tree. `file: filename` is
         only a fallback for THIS script (spread after it, so it wins):
         Line Editor's own Prev/Next can switch this same editor instance
         to a different script post-open, and it always passes ITS
         current filename in `opts.file` -- this closure's `filename`
         param is fixed at the moment editScript() ran and never updates,
         so relying on it after Prev/Next would re-voice into the WRONG
         script's _audio\lines\ folder (see LineEditorApp.vue's revoiceRow).
        */
        revoiceApi: {
          revoiceLine: (s) => i.queueLineRevoice(i.node, { act: e, file: o, ...s })
        }
      });
    }
    async function w() {
      if (A(), !n.value) {
        a.value = [], u("No project folder set -- click below to browse for one");
        return;
      }
      try {
        const o = await (await fetch(`${B}/tree?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(m.value)}`)).json();
        if (o.error) {
          u(`Error: ${o.error}`);
          return;
        }
        if (E(n.value), a.value = o.tree, (!d.value || !a.value.some((t) => t.act === d.value)) && (d.value = a.value.length ? a.value[0].act : "", i.actWidget.value = d.value), d.value && f.add(d.value), !i.scriptFileWidget.value && d.value) {
          const t = a.value.find((r) => r.act === d.value);
          t != null && t.scripts.length && (i.scriptFileWidget.value = t.scripts[0]);
        }
        const s = H();
        k(), s && k();
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
        const r = await (await fetch(`${B}/pending_revoice?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(m.value)}`)).json();
        if (r.error) {
          u(`Error: ${r.error}`);
          return;
        }
        e = r.scripts || [];
      } catch (t) {
        u(`Error: ${t}`);
        return;
      }
      const o = e.reduce((t, r) => t + r.pending.length, 0);
      if (!o) {
        u("Nothing needs re-voicing");
        return;
      }
      let s = 0;
      u(`Re-voicing 0/${o}...`);
      for (const t of e)
        for (const r of t.pending) {
          try {
            await i.queueLineRevoice(i.node, {
              act: t.act,
              file: t.file,
              linePosition: r.position,
              speaker: r.speaker,
              instruct: r.instruct,
              text: r.text,
              /*
               Same output-location pinning the line editor does (see
               LineEditorApp's revoiceRow): folder/base_name here come
               from the pending_revoice scan, which resolved them with
               THIS panel's suffix -- so they're the same names the
               scan itself checked against. contentHash likewise comes
               straight from that same scan (nodes/script_library.py's
               script_pending_lines already computed it from this
               exact resolved speaker/instruct/text) instead of being
               recomputed here -- stamped onto Post-Process's
               line_hashes_json so the re-voice doesn't depend on the
               graph having that output/input wired.
              */
              folder: t.folder,
              baseName: t.base_name,
              contentHash: r.hash
            });
          } catch (h) {
            console.error(`FL_CosyVoice3.ScriptLibrary: re-voice-all failed for ${t.act}/${t.file} position ${r.position}`, h);
          }
          s++, u(`Re-voicing ${s}/${o}...`);
        }
      u(`Re-voiced ${s}/${o} line(s)`), w();
    }
    function j() {
      if (z(), A(), !n.value) {
        const e = R();
        e && (n.value = e, i.folderWidget.value = e);
      }
      n.value ? w() : u("No project folder set -- click below to browse for one");
    }
    let F = null;
    return ce(() => {
      const e = i.node.onConfigure;
      i.node.onConfigure = function(s) {
        const t = e ? e.apply(this, arguments) : void 0;
        return j(), t;
      };
      const o = i.folderWidget.callback;
      i.folderWidget.callback = function(s) {
        const t = o ? o.apply(this, arguments) : void 0;
        return n.value = s, w(), t;
      }, j(), F = setInterval(() => {
        n.value && w();
      }, Ie);
    }), ne(() => {
      F && clearInterval(F);
    }), (e, o) => {
      const s = le("Button");
      return g(), v("div", ve, [
        C(s, {
          label: V.value,
          title: n.value,
          text: "",
          class: "browse-button ellipsis w100p",
          onClick: te
        }, null, 8, ["label", "title"]),
        p("div", ge, [
          C(s, {
            label: "🎭 Roles",
            title: "Assign a real speaker preset to each role code (edits _roles.json)",
            outlined: "",
            class: "grow",
            onClick: oe
          }),
          C(s, {
            label: "🔁 Re-voice pending",
            title: "Re-voice every line across the whole project marked as needing it (stale or never voiced)",
            outlined: "",
            class: "grow",
            onClick: re
          })
        ]),
        p("div", ke, [
          C(s, {
            label: "☑ All",
            title: "Check every script in every act (skips scripts marked ready)",
            outlined: "",
            class: "grow",
            onClick: X
          }),
          C(s, {
            label: "☐ None",
            title: "Uncheck every script",
            outlined: "",
            class: "grow",
            onClick: Z
          }),
          C(s, {
            label: "⇄ Invert",
            title: "Flip every script's checked state (skips scripts marked ready)",
            outlined: "",
            class: "grow",
            onClick: ee
          })
        ]),
        p("div", _e, [
          a.value.length ? S("", !0) : (g(), v("div", me, "(no acts found)")),
          (g(!0), v(L, null, q(a.value, (t) => (g(), v(L, {
            key: t.act
          }, [
            p("div", {
              class: T(["act-row row", { "act-row-active": t.act === d.value }]),
              onClick: (r) => K(t.act)
            }, [
              p("input", {
                type: "checkbox",
                class: "row-checkbox",
                checked: I(t.act, t.scripts, b(t)) === "all",
                ref_for: !0,
                ref: (r) => Y(r, t),
                onClick: o[0] || (o[0] = W(() => {
                }, ["stop"])),
                onChange: (r) => G(t, r.target.checked)
              }, null, 40, Ce),
              p("span", we, $(f.has(t.act) ? "▾" : "▸"), 1),
              p("span", ye, $(t.act), 1),
              p("span", Se, $(P(t) ? `${P(t)}/${t.scripts.length}` : t.scripts.length), 1)
            ], 10, be),
            f.has(t.act) ? (g(!0), v(L, { key: 0 }, q(t.scripts, (r) => (g(), v("div", {
              key: r,
              class: T(["script-row row", { "script-row-active": t.act === d.value && x.scriptFileWidget.value === r }]),
              onClick: (h) => Q(t.act, r)
            }, [
              p("input", {
                type: "checkbox",
                class: "row-checkbox",
                checked: c.has(l(t.act, r)),
                disabled: b(t).has(r),
                title: b(t).has(r) ? "Marked ready to release -- unmark it in the editor (Done) to queue it again" : "",
                onClick: o[1] || (o[1] = W(() => {
                }, ["stop"])),
                onChange: (h) => J(t.act, r, h.target.checked)
              }, null, 40, xe),
              p("button", {
                class: "edit-btn",
                title: "Open the full-screen line-by-line editor",
                onClick: W((h) => se(t.act, r), ["stop"])
              }, "✏️", 8, Ee),
              b(t).has(r) ? (g(), v("span", Re, "✅")) : S("", !0),
              p("span", {
                class: "script-name ellipsis",
                title: r
              }, $(r), 9, Fe),
              (t.pending_scripts || []).includes(r) ? (g(), v("span", Le, "⚠️")) : S("", !0),
              (t.audio_scripts || []).includes(r) ? (g(), v("span", We, "🔊")) : S("", !0)
            ], 10, $e))), 128)) : S("", !0)
          ], 64))), 128))
        ]),
        p("div", Ae, $(_.value), 1)
      ]);
    };
  }
}, Oe = /* @__PURE__ */ ie(je, [["__scopeId", "data-v-81794971"]]);
function Be({ node: x, folderWidget: i, actWidget: l, filterWidget: E, scriptFileWidget: R, openBrowseDialog: n, openRolesEditor: d, openLineEditor: a, queueLineRevoice: c }) {
  ue(import.meta.url);
  const f = document.createElement("div");
  f.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const _ = pe(Oe, {
    node: x,
    folderWidget: i,
    actWidget: l,
    filterWidget: E,
    scriptFileWidget: R,
    openBrowseDialog: n,
    openRolesEditor: d,
    openLineEditor: a,
    queueLineRevoice: c
  });
  return _.use(fe, { ripple: !0 }), he(_), _.mount(f), { element: f, unmount: () => _.unmount() };
}
export {
  Be as mountScriptLibraryPanel
};
