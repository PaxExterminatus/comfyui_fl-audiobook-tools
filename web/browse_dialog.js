import { _ as A, w as N, o as T, c as S, a as C, u as d, b as h, r, d as i, e as P, f as w, g as R, h as q, t as k, i as $, j as m, F as V, k as K, n as z, l as B, m as M, p as G, P as H } from "./styles_link.js";
import { s as J } from "./dialog.esm.js";
import { s as g } from "./button.esm.js";
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
    const a = b, v = r(!0), s = r(""), n = r(""), o = r(null), f = r(null), y = r(!1), u = r(null), E = h(() => a.mode === "folder" ? "Choose a folder" : "Choose a file"), F = h(() => a.mode === "folder" ? "Select This Folder" : "Select File"), D = h(
      () => a.mode === "folder" ? !s.value : !f.value
    );
    function I() {
      o.value && o.value.parent ? c(o.value.parent) : (o.value && o.value.parent === "" || s.value) && c("");
    }
    const x = h(() => {
      const t = o.value;
      if (!t) return [];
      const l = [];
      return (t.drives || []).forEach((e) => l.push({ type: "drive", name: e, icon: "💽", path: e })), (t.dirs || []).forEach((e) => l.push({ type: "dir", name: e, icon: "📁", path: B(s.value, e) })), a.mode === "file" && (t.files || []).forEach((e) => l.push({ type: "file", name: e, icon: "📄", path: B(s.value, e) })), l;
    });
    function U(t) {
      t.type === "file" ? f.value = t.path : c(t.path);
    }
    async function c(t) {
      y.value = !0, u.value = null, f.value = null;
      try {
        const l = `${te}?path=${encodeURIComponent(t)}${a.ext ? `&ext=${encodeURIComponent(a.ext)}` : ""}`, p = await (await fetch(l)).json();
        if (p.error) {
          u.value = p.error, o.value = null;
          return;
        }
        s.value = p.path, n.value = p.path || "", o.value = p;
      } catch (l) {
        u.value = String(l), o.value = null;
      } finally {
        y.value = !1;
      }
    }
    function L() {
      c(n.value.trim());
    }
    function j() {
      const t = a.mode === "folder" ? s.value : f.value;
      t && (a.onSelect(t), _());
    }
    function _() {
      a.onClose();
    }
    return N(v, (t) => {
      t || _();
    }), T(() => c(a.startPath || "")), (t, l) => (i(), S(d(J), {
      visible: v.value,
      "onUpdate:visible": l[1] || (l[1] = (e) => v.value = e),
      modal: "",
      "dismissable-mask": "",
      header: E.value,
      style: { width: "min(560px, 90vw)" },
      "content-style": { display: "flex", flexDirection: "column" }
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
          disabled: D.value,
          onClick: j
        }, null, 8, ["label", "disabled"])
      ]),
      default: C(() => [
        P("div", W, [
          w(d(g), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: I
          }),
          w(d(O), {
            modelValue: n.value,
            "onUpdate:modelValue": l[0] || (l[0] = (e) => n.value = e),
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
            q(k(u.value), 1)
          ]),
          _: 1
        })) : $("", !0),
        P("div", X, [
          y.value ? (i(), m("div", Y, "Loading...")) : (i(), m(V, { key: 1 }, [
            (i(!0), m(V, null, K(x.value, (e) => (i(), m("div", {
              key: `${e.type}:${e.name}`,
              class: z(["browse-row", { "browse-row-selected": e.type === "file" && e.path === f.value }]),
              onClick: (p) => U(e)
            }, k(e.icon) + " " + k(e.name), 11, Z))), 128)),
            !x.value.length && !u.value ? (i(), m("div", ee, "(empty)")) : $("", !0)
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["visible", "header"]));
  }
}, le = /* @__PURE__ */ A(oe, [["__scopeId", "data-v-1d95d509"]]);
function ue({ mode: b = "folder", startPath: a = "", ext: v = "", onSelect: s }) {
  M(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const o = G(le, {
    mode: b,
    startPath: a,
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
