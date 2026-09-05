import { _ as A, w as N, o as T, c as S, a as C, u as d, b as h, r, d as i, e as P, f as w, g as R, h as q, t as g, i as $, j as m, F as V, k as K, n as z, l as B, m as M, p as G, P as H } from "./styles_link.js";
import { s as J } from "./dialog.esm.js";
import { s as k } from "./button.esm.js";
import { s as O } from "./inputtext.esm.js";
import { s as Q } from "./message.esm.js";
const W = { class: "browse-toolbar" }, X = { class: "browse-list" }, Y = {
  key: 0,
  class: "browse-row browse-row-note"
}, Z = ["onClick"], ee = {
  key: 0,
  class: "browse-row browse-row-note"
}, te = "/fl_cosyvoice3/browse/list_dir", oe = {
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
    const l = b, v = r(!0), s = r(""), n = r(""), o = r(null), f = r(null), _ = r(!1), u = r(null), E = h(() => l.mode === "folder" ? "Choose a folder" : "Choose a file"), F = h(() => l.mode === "folder" ? "Select This Folder" : "Select File"), I = h(
      () => l.mode === "folder" ? !s.value : !f.value
    );
    function U() {
      o.value && o.value.parent ? c(o.value.parent) : (o.value && o.value.parent === "" || s.value) && c("");
    }
    const x = h(() => {
      const t = o.value;
      if (!t) return [];
      const a = [];
      return (t.drives || []).forEach((e) => a.push({ type: "drive", name: e, icon: "💽", path: e })), (t.dirs || []).forEach((e) => a.push({ type: "dir", name: e, icon: "📁", path: B(s.value, e) })), l.mode === "file" && (t.files || []).forEach((e) => a.push({ type: "file", name: e, icon: "📄", path: B(s.value, e) })), a;
    });
    function D(t) {
      t.type === "file" ? f.value = t.path : c(t.path);
    }
    async function c(t) {
      _.value = !0, u.value = null, f.value = null;
      try {
        const a = `${te}?path=${encodeURIComponent(t)}${l.ext ? `&ext=${encodeURIComponent(l.ext)}` : ""}`, p = await (await fetch(a)).json();
        if (p.error) {
          u.value = p.error, o.value = null;
          return;
        }
        s.value = p.path, n.value = p.path || "", o.value = p;
      } catch (a) {
        u.value = String(a), o.value = null;
      } finally {
        _.value = !1;
      }
    }
    function L() {
      c(n.value.trim());
    }
    function j() {
      const t = l.mode === "folder" ? s.value : f.value;
      t && (l.onSelect(t), y());
    }
    function y() {
      l.onClose();
    }
    return N(v, (t) => {
      t || y();
    }), T(() => c(l.startPath || "")), (t, a) => (i(), S(d(J), {
      visible: v.value,
      "onUpdate:visible": a[1] || (a[1] = (e) => v.value = e),
      modal: "",
      header: E.value,
      class: "browse-dialog"
    }, {
      footer: C(() => [
        w(d(k), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: y
        }),
        w(d(k), {
          label: F.value,
          disabled: I.value,
          onClick: j
        }, null, 8, ["label", "disabled"])
      ]),
      default: C(() => [
        P("div", W, [
          w(d(k), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: U
          }),
          w(d(O), {
            modelValue: n.value,
            "onUpdate:modelValue": a[0] || (a[0] = (e) => n.value = e),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input",
            onKeydown: R(L, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        u.value ? (i(), S(d(Q), {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: C(() => [
            q(g(u.value), 1)
          ]),
          _: 1
        })) : $("", !0),
        P("div", X, [
          _.value ? (i(), m("div", Y, "Loading...")) : (i(), m(V, { key: 1 }, [
            (i(!0), m(V, null, K(x.value, (e) => (i(), m("div", {
              key: `${e.type}:${e.name}`,
              class: z(["browse-row", { "browse-row-selected": e.type === "file" && e.path === f.value }]),
              onClick: (p) => D(e)
            }, g(e.icon) + " " + g(e.name), 11, Z))), 128)),
            !x.value.length && !u.value ? (i(), m("div", ee, "(empty)")) : $("", !0)
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["visible", "header"]));
  }
}, ae = /* @__PURE__ */ A(oe, [["__scopeId", "data-v-016f0af1"]]);
function ue({ mode: b = "folder", startPath: l = "", ext: v = "", onSelect: s }) {
  M(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const o = G(ae, {
    mode: b,
    startPath: l,
    ext: v,
    onSelect: s,
    onClose: () => {
      o.unmount(), n.remove();
    }
  });
  o.use(H, { ripple: !0 }), o.mount(n);
}
export {
  ue as openBrowseDialog
};
