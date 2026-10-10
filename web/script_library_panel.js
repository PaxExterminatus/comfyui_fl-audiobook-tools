import { _ as re, l as S, o as ce, L as ne, c as h, b as C, d as p, i as $, F as L, j as B, t as E, S as N, m as ae, r as le, A as T, a as g, n as W, M as A, p as de, v as ue, x as pe, P as fe, y as ve } from "./styles_link.js";
const he = { class: "script-library-panel list" }, ge = { class: "actions" }, ke = { class: "actions" }, _e = { class: "tree panel" }, me = {
  key: 0,
  class: "tree-empty muted"
}, be = ["onClick"], Ce = ["checked", "onChange"], we = { class: "chevron muted" }, ye = { class: "act-name title ellipsis" }, Se = { class: "act-count muted" }, $e = ["onClick"], Ee = ["checked", "disabled", "title", "onChange"], Re = ["onClick"], xe = {
  key: 0,
  title: "Marked done / ready to release"
}, Fe = ["title"], Le = {
  key: 1,
  title: "Has line(s) marked as needing re-voice (edited, or a role's speaker was recast)"
}, We = {
  key: 2,
  class: "row-icon-dim",
  title: "Rendered audio already exists for this script"
}, Ae = { class: "status-line muted" }, D = "FL_CosyVoice3.ScriptLibrary.lastFolder", Ie = 3e3, Pe = "::", je = {
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
  setup(w) {
    var q;
    const r = w;
    function l(e, o) {
      return `${e}${Pe}${o}`;
    }
    function R(e) {
      try {
        e && localStorage.setItem(D, e);
      } catch {
      }
    }
    function x() {
      try {
        return localStorage.getItem(D) || "";
      } catch {
        return "";
      }
    }
    const n = S(r.folderWidget.value || ""), d = S(r.actWidget.value || ""), a = S([]), c = T(/* @__PURE__ */ new Set()), f = T(/* @__PURE__ */ new Set()), _ = S(""), m = S(((q = r.filterWidget) == null ? void 0 : q.value) ?? "");
    function I() {
      r.filterWidget && (m.value = r.filterWidget.value ?? "");
    }
    const V = ae(() => n.value ? `📁 ${n.value}` : "📁 Click to browse for a project folder");
    function u(e) {
      _.value = e, r.node.setDirtyCanvas(!0, !0);
    }
    function M() {
      const e = [];
      return a.value.forEach((o) => o.scripts.forEach((s) => {
        c.has(l(o.act, s)) && e.push({ act: o.act, file: s });
      })), e;
    }
    function U() {
      r.node.properties = r.node.properties || {}, r.node.properties.checkedScripts = Array.from(c);
    }
    function z() {
      var o;
      const e = (o = r.node.properties) == null ? void 0 : o.checkedScripts;
      Array.isArray(e) && (c.clear(), e.forEach((s) => {
        typeof s == "string" && c.add(s);
      }));
    }
    function k() {
      U(), r.node._flCheckedItems = M();
      const e = a.value.reduce((s, t) => s + t.scripts.length, 0), o = a.value.length && !a.value.every((s) => s.filter_applied !== !1) ? ` (some acts have no "${m.value}" files -- showing all .txt there)` : "";
      u(`${a.value.length} act(s), ${e} script(s)${o} | ${c.size} checked`);
    }
    function H() {
      let e = !1;
      return a.value.forEach(({ act: o, ready_scripts: s }) => {
        (s || []).forEach((t) => {
          const i = l(o, t);
          c.has(i) && (c.delete(i), e = !0);
        });
      }), e;
    }
    function P(e, o, s) {
      const t = o.filter((v) => !s.has(v));
      if (!t.length) return "none";
      const i = t.filter((v) => c.has(l(e, v))).length;
      return i === 0 ? "none" : i === t.length ? "all" : "some";
    }
    function b(e) {
      return new Set(e.ready_scripts || []);
    }
    function j(e) {
      return e.scripts.filter((o) => c.has(l(e.act, o))).length;
    }
    function Y(e, o) {
      e && (e.indeterminate = P(o.act, o.scripts, b(o)) === "some");
    }
    function K(e) {
      d.value = e, r.actWidget.value = e, f.has(e) ? f.delete(e) : f.add(e);
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
      d.value = e, r.actWidget.value = e, r.scriptFileWidget.value = o;
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
      r.openBrowseDialog({
        mode: "folder",
        startPath: n.value,
        onSelect: (e) => {
          n.value = e, r.folderWidget.value = e, y();
        }
      });
    }
    function oe() {
      if (!n.value) {
        u("Set a project folder first");
        return;
      }
      r.openRolesEditor({ root: n.value, suffix: m.value });
    }
    function se(e, o) {
      r.openLineEditor({
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
          revoiceLine: (s) => r.queueLineRevoice(r.node, { act: e, file: o, ...s })
        }
      });
    }
    async function y() {
      if (I(), !n.value) {
        a.value = [], u("No project folder set -- click below to browse for one");
        return;
      }
      try {
        const o = await (await fetch(`${N}/tree?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(m.value)}`)).json();
        if (o.error) {
          u(`Error: ${o.error}`);
          return;
        }
        if (R(n.value), a.value = o.tree, (!d.value || !a.value.some((t) => t.act === d.value)) && (d.value = a.value.length ? a.value[0].act : "", r.actWidget.value = d.value), d.value && f.add(d.value), !r.scriptFileWidget.value && d.value) {
          const t = a.value.find((i) => i.act === d.value);
          t != null && t.scripts.length && (r.scriptFileWidget.value = t.scripts[0]);
        }
        const s = H();
        k(), s && k();
      } catch (e) {
        u(`Error: ${e}`);
      }
    }
    async function ie() {
      if (!n.value) {
        u("Set a project folder first");
        return;
      }
      let e;
      try {
        const i = await (await fetch(`${N}/pending_revoice?path=${encodeURIComponent(n.value)}&suffix=${encodeURIComponent(m.value)}`)).json();
        if (i.error) {
          u(`Error: ${i.error}`);
          return;
        }
        e = i.scripts || [];
      } catch (t) {
        u(`Error: ${t}`);
        return;
      }
      const o = e.reduce((t, i) => t + i.pending.length, 0);
      if (!o) {
        u("Nothing needs re-voicing");
        return;
      }
      let s = 0;
      u(`Re-voicing 0/${o}...`);
      for (const t of e)
        for (const i of t.pending) {
          try {
            await r.queueLineRevoice(r.node, {
              act: t.act,
              file: t.file,
              linePosition: i.position,
              speaker: i.speaker,
              instruct: i.instruct,
              text: i.text,
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
              contentHash: i.hash
            });
          } catch (v) {
            console.error(`FL_CosyVoice3.ScriptLibrary: re-voice-all failed for ${t.act}/${t.file} position ${i.position}`, v);
          }
          s++, u(`Re-voicing ${s}/${o}...`);
        }
      u(`Re-voiced ${s}/${o} line(s)`), y();
    }
    function O() {
      if (z(), I(), !n.value) {
        const e = x();
        e && (n.value = e, r.folderWidget.value = e);
      }
      n.value ? y() : u("No project folder set -- click below to browse for one");
    }
    let F = null;
    return ce(() => {
      const e = r.node.onConfigure;
      r.node.onConfigure = function(s) {
        const t = e ? e.apply(this, arguments) : void 0;
        return O(), t;
      };
      const o = r.folderWidget.callback;
      r.folderWidget.callback = function(s) {
        const t = o ? o.apply(this, arguments) : void 0;
        return n.value = s, y(), t;
      }, O(), F = setInterval(() => {
        n.value && y();
      }, Ie);
    }), ne(() => {
      F && clearInterval(F);
    }), (e, o) => {
      const s = le("Button");
      return g(), h("div", he, [
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
            onClick: ie
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
          a.value.length ? $("", !0) : (g(), h("div", me, "(no acts found)")),
          (g(!0), h(L, null, B(a.value, (t) => (g(), h(L, {
            key: t.act
          }, [
            p("div", {
              class: W(["act-row row", { "act-row-active": t.act === d.value }]),
              onClick: (i) => K(t.act)
            }, [
              p("input", {
                type: "checkbox",
                class: "row-checkbox",
                checked: P(t.act, t.scripts, b(t)) === "all",
                ref_for: !0,
                ref: (i) => Y(i, t),
                onClick: o[0] || (o[0] = A(() => {
                }, ["stop"])),
                onChange: (i) => G(t, i.target.checked)
              }, null, 40, Ce),
              p("span", we, E(f.has(t.act) ? "▾" : "▸"), 1),
              p("span", ye, E(t.act), 1),
              p("span", Se, E(j(t) ? `${j(t)}/${t.scripts.length}` : t.scripts.length), 1)
            ], 10, be),
            f.has(t.act) ? (g(!0), h(L, { key: 0 }, B(t.scripts, (i) => (g(), h("div", {
              key: i,
              class: W(["script-row row", { "script-row-active": t.act === d.value && w.scriptFileWidget.value === i }]),
              onClick: (v) => Q(t.act, i)
            }, [
              p("input", {
                type: "checkbox",
                class: "row-checkbox",
                checked: c.has(l(t.act, i)),
                disabled: b(t).has(i),
                title: b(t).has(i) ? "Marked ready to release -- unmark it in the editor (Done) to queue it again" : "",
                onClick: o[1] || (o[1] = A(() => {
                }, ["stop"])),
                onChange: (v) => J(t.act, i, v.target.checked)
              }, null, 40, Ee),
              p("button", {
                class: "edit-btn",
                title: "Open the full-screen line-by-line editor",
                onClick: A((v) => se(t.act, i), ["stop"])
              }, "✏️", 8, Re),
              b(t).has(i) ? (g(), h("span", xe, "✅")) : $("", !0),
              p("span", {
                class: W(["script-name ellipsis", { "script-name-active title": t.act === d.value && w.scriptFileWidget.value === i }]),
                title: i
              }, E(i), 11, Fe),
              (t.pending_scripts || []).includes(i) ? (g(), h("span", Le, "⚠️")) : $("", !0),
              (t.audio_scripts || []).includes(i) ? (g(), h("span", We, "🔊")) : $("", !0)
            ], 10, $e))), 128)) : $("", !0)
          ], 64))), 128))
        ]),
        p("div", Ae, E(_.value), 1)
      ]);
    };
  }
}, Oe = /* @__PURE__ */ re(je, [["__scopeId", "data-v-47d07ce9"]]);
function Be({ node: w, folderWidget: r, actWidget: l, filterWidget: R, scriptFileWidget: x, openBrowseDialog: n, openRolesEditor: d, openLineEditor: a, queueLineRevoice: c }) {
  ue(import.meta.url);
  const f = document.createElement("div");
  f.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const _ = pe(Oe, {
    node: w,
    folderWidget: r,
    actWidget: l,
    filterWidget: R,
    scriptFileWidget: x,
    openBrowseDialog: n,
    openRolesEditor: d,
    openLineEditor: a,
    queueLineRevoice: c
  });
  return _.use(fe, { ripple: !0 }), ve(_), _.mount(f), { element: f, unmount: () => _.unmount() };
}
export {
  Be as mountScriptLibraryPanel
};
