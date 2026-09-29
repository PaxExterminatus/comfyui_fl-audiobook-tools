import { _ as A, w as F, o as T, a as i, c as v, b as h, u as r, d as _, s as S, e as H, f as $, g as B, h as M, t as C, i as x, F as k, r as O, n as G, j as J, k as u, B as Q, l as b, m as z, p as X, q as Y, v as Z, x as ee, P as te } from "./styles_link.js";
import { u as oe, a as se, D as ae, s as le, b as ne } from "./DialogHeader.js";
import { s as re } from "./inputtext.esm.js";
const ie = { class: "fl-browse-dialog-content" }, ue = { class: "browse-toolbar" }, ce = {
  key: 0,
  class: "browse-row browse-row-note"
}, de = ["onClick"], pe = {
  key: 0,
  class: "browse-row browse-row-note"
}, fe = { class: "browse-dialog-footer" }, ve = {
  __name: "BrowseDialogContent",
  props: {
    mode: { type: String, default: "folder" },
    // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(m) {
    const s = m, c = u(!0), a = u(""), l = u(""), o = u(null), w = u(null), y = u(!1), d = u(null), { setWidth: V, presets: D } = oe({
      storageKey: "FL_CosyVoice3.BrowseDialog.widthPx",
      defaultWidth: 560,
      presets: [420, 700],
      /*
       A file picker never needs to fill nearly the whole window the way
       Line/Roles Editor's "100%" does -- capped much narrower.
      */
      fullVw: 70
    }), { fontSizePx: E, decrease: L, increase: U } = se({
      storageKey: "FL_CosyVoice3.BrowseDialog.fontSizePx",
      defaultSize: 13
    }), q = b(() => s.mode === "folder" ? "Choose a folder" : "Choose a file"), I = b(() => s.mode === "folder" ? "Select This Folder" : "Select File"), R = b(
      () => s.mode === "folder" ? !a.value : !w.value
    );
    function W() {
      o.value && o.value.parent ? p(o.value.parent) : (o.value && o.value.parent === "" || a.value) && p("");
    }
    const P = b(() => {
      const t = o.value;
      if (!t) return [];
      const n = [];
      return (t.drives || []).forEach((e) => n.push({ type: "drive", name: e, icon: "💽", path: e })), (t.dirs || []).forEach((e) => n.push({ type: "dir", name: e, icon: "📁", path: z(a.value, e) })), s.mode === "file" && (t.files || []).forEach((e) => n.push({ type: "file", name: e, icon: "📄", path: z(a.value, e) })), n;
    });
    function j(t) {
      t.type === "file" ? w.value = t.path : p(t.path);
    }
    async function p(t) {
      y.value = !0, d.value = null, w.value = null;
      try {
        const n = `${Q}?path=${encodeURIComponent(t)}${s.ext ? `&ext=${encodeURIComponent(s.ext)}` : ""}`, f = await (await fetch(n)).json();
        if (f.error) {
          d.value = f.error, o.value = null;
          return;
        }
        a.value = f.path, l.value = f.path || "", o.value = f;
      } catch (n) {
        d.value = String(n), o.value = null;
      } finally {
        y.value = !1;
      }
    }
    function K() {
      p(l.value.trim());
    }
    function N() {
      const t = s.mode === "folder" ? a.value : w.value;
      t && (s.onSelect(t), g());
    }
    function g() {
      s.onClose();
    }
    return F(c, (t) => {
      t || g();
    }), T(() => p(s.startPath || "")), (t, n) => (i(), v("div", ie, [
      h(ae, {
        title: q.value,
        "width-presets": r(D),
        "set-width": r(V),
        "font-size-decrease": r(L),
        "font-size-increase": r(U)
      }, null, 8, ["title", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
      _("div", ue, [
        h(r(S), {
          icon: "pi pi-arrow-up",
          title: "Up one level",
          text: "",
          onClick: W
        }),
        h(r(re), {
          modelValue: l.value,
          "onUpdate:modelValue": n[0] || (n[0] = (e) => l.value = e),
          placeholder: "Path -- press Enter to jump here",
          class: "browse-path-input",
          onKeydown: H(K, ["enter"])
        }, null, 8, ["modelValue"])
      ]),
      d.value ? (i(), $(r(le), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: B(() => [
          M(C(d.value), 1)
        ]),
        _: 1
      })) : x("", !0),
      _("div", {
        class: "browse-list",
        style: J({ fontSize: `${r(E)}px` })
      }, [
        y.value ? (i(), v("div", ce, "Loading...")) : (i(), v(k, { key: 1 }, [
          (i(!0), v(k, null, O(P.value, (e) => (i(), v("div", {
            key: `${e.type}:${e.name}`,
            class: G(["browse-row", { "browse-row-selected": e.type === "file" && e.path === w.value }]),
            onClick: (f) => j(e)
          }, C(e.icon) + " " + C(e.name), 11, de))), 128)),
          !P.value.length && !d.value ? (i(), v("div", pe, "(empty)")) : x("", !0)
        ], 64))
      ], 4),
      _("div", fe, [
        h(r(S), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: g
        }),
        h(r(S), {
          label: I.value,
          disabled: R.value,
          onClick: N
        }, null, 8, ["label", "disabled"])
      ])
    ]));
  }
}, he = /* @__PURE__ */ A(ve, [["__scopeId", "data-v-bc382bbf"]]), me = {
  __name: "BrowseDialogApp",
  props: {
    mode: { type: String, default: "folder" },
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(m) {
    const s = m, c = u(!0);
    return F(c, (a) => {
      a || s.onClose();
    }), (a, l) => (i(), $(r(ne), {
      visible: c.value,
      "onUpdate:visible": l[0] || (l[0] = (o) => c.value = o),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      class: "browse-dialog"
    }, {
      default: B(() => [
        h(he, X(Y(a.$props)), null, 16)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
};
function ge({ mode: m = "folder", startPath: s = "", ext: c = "", onSelect: a }) {
  Z(import.meta.url);
  const l = document.createElement("div");
  document.body.appendChild(l);
  const o = ee(me, {
    mode: m,
    startPath: s,
    ext: c,
    onSelect: a,
    onClose: () => {
      o.unmount(), l.remove();
    }
  });
  o.use(te, { ripple: !0 }), o.mount(l);
}
export {
  ge as openBrowseDialog
};
