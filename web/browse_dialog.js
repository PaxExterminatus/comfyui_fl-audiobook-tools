import { _ as M, w as B, o as H, r as y, a as i, c as m, b as h, u as _, d as S, e as O, f as V, g as D, h as G, t as P, i as k, F as z, j as J, n as Q, k as X, l as u, B as Y, m as g, p as F, q as Z, s as ee, v as te, x as oe, P as se, y as ae } from "./styles_link.js";
import { u as le, a as ne, D as re } from "./DialogHeader.js";
const ie = { class: "fl-browse-dialog-content" }, ue = { class: "browse-toolbar row" }, ce = {
  key: 0,
  class: "browse-row browse-row-note ellipsis"
}, de = ["onClick"], pe = {
  key: 0,
  class: "browse-row browse-row-note ellipsis"
}, fe = { class: "browse-dialog-footer actions" }, ve = {
  __name: "BrowseDialogContent",
  props: {
    mode: { type: String, default: "folder" },
    // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(w) {
    const o = w, c = u(!0), a = u(""), l = u(""), e = u(null), d = u(null), b = u(!1), f = u(null), { setWidth: $, presets: E } = le({
      storageKey: "FL_CosyVoice3.BrowseDialog.widthPx",
      defaultWidth: 560,
      presets: [420, 700],
      /*
       A file picker never needs to fill nearly the whole window the way
       Line/Roles Editor's "100%" does -- capped much narrower.
      */
      fullVw: 70
    }), { fontSizePx: L, decrease: I, increase: U } = ne({
      storageKey: "FL_CosyVoice3.BrowseDialog.fontSizePx",
      defaultSize: 13
    }), q = g(() => o.mode === "folder" ? "Choose a folder" : "Choose a file"), R = g(() => o.mode === "folder" ? "Select This Folder" : "Select File"), T = g(
      () => o.mode === "folder" ? !a.value : !d.value
    );
    function W() {
      e.value && e.value.parent ? v(e.value.parent) : (e.value && e.value.parent === "" || a.value) && v("");
    }
    const x = g(() => {
      const t = e.value;
      if (!t) return [];
      const n = [];
      return (t.drives || []).forEach((s) => n.push({ type: "drive", name: s, icon: "💽", path: s })), (t.dirs || []).forEach((s) => n.push({ type: "dir", name: s, icon: "📁", path: F(a.value, s) })), o.mode === "file" && (t.files || []).forEach((s) => n.push({ type: "file", name: s, icon: "📄", path: F(a.value, s) })), n;
    });
    function j(t) {
      t.type === "file" ? d.value = t.path : v(t.path);
    }
    async function v(t) {
      b.value = !0, f.value = null, d.value = null;
      try {
        const n = `${Y}?path=${encodeURIComponent(t)}${o.ext ? `&ext=${encodeURIComponent(o.ext)}` : ""}`, p = await (await fetch(n)).json();
        if (p.error) {
          f.value = p.error, e.value = null;
          return;
        }
        a.value = p.path, l.value = p.path || "", e.value = p;
      } catch (n) {
        f.value = String(n), e.value = null;
      } finally {
        b.value = !1;
      }
    }
    function K() {
      v(l.value.trim());
    }
    function N() {
      const t = o.mode === "folder" ? a.value : d.value;
      t && (o.onSelect(t), C());
    }
    function C() {
      o.onClose();
    }
    return B(c, (t) => {
      t || C();
    }), H(() => v(o.startPath || "")), (t, n) => {
      const s = y("Button"), p = y("InputText"), A = y("Message");
      return i(), m("div", ie, [
        h(re, {
          title: q.value,
          "width-presets": _(E),
          "set-width": _($),
          "font-size-decrease": _(I),
          "font-size-increase": _(U)
        }, null, 8, ["title", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
        S("div", ue, [
          h(s, {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            onClick: W
          }),
          h(p, {
            modelValue: l.value,
            "onUpdate:modelValue": n[0] || (n[0] = (r) => l.value = r),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input spacer",
            onKeydown: O(K, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        f.value ? (i(), V(A, {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: D(() => [
            G(P(f.value), 1)
          ]),
          _: 1
        })) : k("", !0),
        S("div", {
          class: "browse-list",
          style: X({ fontSize: `${_(L)}px` })
        }, [
          b.value ? (i(), m("div", ce, "Loading...")) : (i(), m(z, { key: 1 }, [
            (i(!0), m(z, null, J(x.value, (r) => (i(), m("div", {
              key: `${r.type}:${r.name}`,
              class: Q(["browse-row ellipsis", { "browse-row-selected": r.type === "file" && r.path === d.value }]),
              onClick: (we) => j(r)
            }, P(r.icon) + " " + P(r.name), 11, de))), 128)),
            !x.value.length && !f.value ? (i(), m("div", pe, "(empty)")) : k("", !0)
          ], 64))
        ], 4),
        S("div", fe, [
          h(s, {
            label: "Cancel",
            severity: "secondary",
            onClick: C
          }),
          h(s, {
            label: R.value,
            disabled: T.value,
            onClick: N
          }, null, 8, ["label", "disabled"])
        ])
      ]);
    };
  }
}, me = /* @__PURE__ */ M(ve, [["__scopeId", "data-v-b85d36b0"]]), he = {
  __name: "BrowseDialogApp",
  props: {
    mode: { type: String, default: "folder" },
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(w) {
    const o = w, c = u(!0);
    return B(c, (a) => {
      a || o.onClose();
    }), (a, l) => {
      const e = y("Dialog");
      return i(), V(e, {
        visible: c.value,
        "onUpdate:visible": l[0] || (l[0] = (d) => c.value = d),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        class: "browse-dialog"
      }, {
        default: D(() => [
          h(me, Z(ee(a.$props)), null, 16)
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
};
function ye({ mode: w = "folder", startPath: o = "", ext: c = "", onSelect: a }) {
  te(import.meta.url);
  const l = document.createElement("div");
  document.body.appendChild(l);
  const e = oe(he, {
    mode: w,
    startPath: o,
    ext: c,
    onSelect: a,
    onClose: () => {
      e.unmount(), l.remove();
    }
  });
  e.use(se, { ripple: !0 }), ae(e), e.mount(l);
}
export {
  ye as openBrowseDialog
};
