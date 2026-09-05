import { _ as L, w as N, o as R, c as S, a as C, u as d, B as T, b as h, r, d as i, e as P, f as w, s as g, g as q, h as K, t as k, i as $, j as m, F as B, k as z, n as M, l as V, m as O, p as W, P as G } from "./styles_link.js";
import { s as H } from "./dialog.esm.js";
import { s as J } from "./inputtext.esm.js";
import { s as Q } from "./message.esm.js";
const X = { class: "browse-toolbar" }, Y = { class: "browse-list" }, Z = {
  key: 0,
  class: "browse-row browse-row-note"
}, ee = ["onClick"], te = {
  key: 0,
  class: "browse-row browse-row-note"
}, oe = {
  __name: "BrowseDialogApp",
  props: {
    mode: { type: String, default: "folder" },
    // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(b) {
    const l = b, v = r(!0), s = r(""), n = r(""), o = r(null), f = r(null), y = r(!1), u = r(null), E = h(() => l.mode === "folder" ? "Choose a folder" : "Choose a file"), F = h(() => l.mode === "folder" ? "Select This Folder" : "Select File"), U = h(
      () => l.mode === "folder" ? !s.value : !f.value
    );
    function D() {
      o.value && o.value.parent ? c(o.value.parent) : (o.value && o.value.parent === "" || s.value) && c("");
    }
    const x = h(() => {
      const t = o.value;
      if (!t) return [];
      const a = [];
      return (t.drives || []).forEach((e) => a.push({ type: "drive", name: e, icon: "💽", path: e })), (t.dirs || []).forEach((e) => a.push({ type: "dir", name: e, icon: "📁", path: V(s.value, e) })), l.mode === "file" && (t.files || []).forEach((e) => a.push({ type: "file", name: e, icon: "📄", path: V(s.value, e) })), a;
    });
    function I(t) {
      t.type === "file" ? f.value = t.path : c(t.path);
    }
    async function c(t) {
      y.value = !0, u.value = null, f.value = null;
      try {
        const a = `${T}?path=${encodeURIComponent(t)}${l.ext ? `&ext=${encodeURIComponent(l.ext)}` : ""}`, p = await (await fetch(a)).json();
        if (p.error) {
          u.value = p.error, o.value = null;
          return;
        }
        s.value = p.path, n.value = p.path || "", o.value = p;
      } catch (a) {
        u.value = String(a), o.value = null;
      } finally {
        y.value = !1;
      }
    }
    function j() {
      c(n.value.trim());
    }
    function A() {
      const t = l.mode === "folder" ? s.value : f.value;
      t && (l.onSelect(t), _());
    }
    function _() {
      l.onClose();
    }
    return N(v, (t) => {
      t || _();
    }), R(() => c(l.startPath || "")), (t, a) => (i(), S(d(H), {
      visible: v.value,
      "onUpdate:visible": a[1] || (a[1] = (e) => v.value = e),
      modal: "",
      header: E.value,
      class: "browse-dialog"
    }, {
      footer: C(() => [
        w(d(g), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: _
        }),
        w(d(g), {
          label: F.value,
          disabled: U.value,
          onClick: A
        }, null, 8, ["label", "disabled"])
      ]),
      default: C(() => [
        P("div", X, [
          w(d(g), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: D
          }),
          w(d(J), {
            modelValue: n.value,
            "onUpdate:modelValue": a[0] || (a[0] = (e) => n.value = e),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input",
            onKeydown: q(j, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        u.value ? (i(), S(d(Q), {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: C(() => [
            K(k(u.value), 1)
          ]),
          _: 1
        })) : $("", !0),
        P("div", Y, [
          y.value ? (i(), m("div", Z, "Loading...")) : (i(), m(B, { key: 1 }, [
            (i(!0), m(B, null, z(x.value, (e) => (i(), m("div", {
              key: `${e.type}:${e.name}`,
              class: M(["browse-row", { "browse-row-selected": e.type === "file" && e.path === f.value }]),
              onClick: (p) => I(e)
            }, k(e.icon) + " " + k(e.name), 11, ee))), 128)),
            !x.value.length && !u.value ? (i(), m("div", te, "(empty)")) : $("", !0)
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["visible", "header"]));
  }
}, ae = /* @__PURE__ */ L(oe, [["__scopeId", "data-v-effaa217"]]);
function ie({ mode: b = "folder", startPath: l = "", ext: v = "", onSelect: s }) {
  O(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const o = W(ae, {
    mode: b,
    startPath: l,
    ext: v,
    onSelect: s,
    onClose: () => {
      o.unmount(), n.remove();
    }
  });
  o.use(G, { ripple: !0 }), o.mount(n);
}
export {
  ie as openBrowseDialog
};
