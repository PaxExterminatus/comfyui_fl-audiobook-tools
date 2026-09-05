import { _ as R, w as q, o as K, c as S, a as w, n as T, u as l, B as z, r as i, b as u, d as b, e as h, s as P, f as M, g as O, t as y, h as B, i as m, F as V, j as G, k as H, l as _, m as $, p as J, q as Q, P as X } from "./styles_link.js";
import { u as Y, P as Z, s as ee } from "./PanelWidthButtons.js";
import { s as te } from "./inputtext.esm.js";
import { s as oe } from "./message.esm.js";
const se = { class: "header-row" }, ae = { class: "dialog-title" }, le = { class: "browse-toolbar" }, ne = { class: "browse-list" }, re = {
  key: 0,
  class: "browse-row browse-row-note"
}, ie = ["onClick"], ue = {
  key: 0,
  class: "browse-row browse-row-note"
}, ce = {
  __name: "BrowseDialogApp",
  props: {
    mode: { type: String, default: "folder" },
    // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(g) {
    const a = g, v = i(!0), n = i(""), r = i(""), o = i(null), f = i(null), C = i(!1), c = i(null), { cssWidth: E, setWidth: F, presets: W } = Y({
      storageKey: "FL_CosyVoice3.BrowseDialog.widthPx",
      defaultWidth: 560,
      presets: [420, 700],
      // A file picker never needs to fill nearly the whole window the way
      // Line/Roles Editor's "100%" does -- capped much narrower.
      fullVw: 70
    }), D = _(() => a.mode === "folder" ? "Choose a folder" : "Choose a file"), U = _(() => a.mode === "folder" ? "Select This Folder" : "Select File"), I = _(
      () => a.mode === "folder" ? !n.value : !f.value
    );
    function L() {
      o.value && o.value.parent ? d(o.value.parent) : (o.value && o.value.parent === "" || n.value) && d("");
    }
    const x = _(() => {
      const t = o.value;
      if (!t) return [];
      const s = [];
      return (t.drives || []).forEach((e) => s.push({ type: "drive", name: e, icon: "💽", path: e })), (t.dirs || []).forEach((e) => s.push({ type: "dir", name: e, icon: "📁", path: $(n.value, e) })), a.mode === "file" && (t.files || []).forEach((e) => s.push({ type: "file", name: e, icon: "📄", path: $(n.value, e) })), s;
    });
    function j(t) {
      t.type === "file" ? f.value = t.path : d(t.path);
    }
    async function d(t) {
      C.value = !0, c.value = null, f.value = null;
      try {
        const s = `${z}?path=${encodeURIComponent(t)}${a.ext ? `&ext=${encodeURIComponent(a.ext)}` : ""}`, p = await (await fetch(s)).json();
        if (p.error) {
          c.value = p.error, o.value = null;
          return;
        }
        n.value = p.path, r.value = p.path || "", o.value = p;
      } catch (s) {
        c.value = String(s), o.value = null;
      } finally {
        C.value = !1;
      }
    }
    function A() {
      d(r.value.trim());
    }
    function N() {
      const t = a.mode === "folder" ? n.value : f.value;
      t && (a.onSelect(t), k());
    }
    function k() {
      a.onClose();
    }
    return q(v, (t) => {
      t || k();
    }), K(() => d(a.startPath || "")), (t, s) => (u(), S(l(ee), {
      visible: v.value,
      "onUpdate:visible": s[1] || (s[1] = (e) => v.value = e),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: T({ width: l(E) }),
      class: "browse-dialog"
    }, {
      header: w(() => [
        b("div", se, [
          b("div", ae, y(D.value), 1),
          h(Z, {
            presets: l(W),
            "set-width": l(F)
          }, null, 8, ["presets", "set-width"])
        ])
      ]),
      footer: w(() => [
        h(l(P), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: k
        }),
        h(l(P), {
          label: U.value,
          disabled: I.value,
          onClick: N
        }, null, 8, ["label", "disabled"])
      ]),
      default: w(() => [
        b("div", le, [
          h(l(P), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: L
          }),
          h(l(te), {
            modelValue: r.value,
            "onUpdate:modelValue": s[0] || (s[0] = (e) => r.value = e),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input",
            onKeydown: M(A, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        c.value ? (u(), S(l(oe), {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: w(() => [
            O(y(c.value), 1)
          ]),
          _: 1
        })) : B("", !0),
        b("div", ne, [
          C.value ? (u(), m("div", re, "Loading...")) : (u(), m(V, { key: 1 }, [
            (u(!0), m(V, null, G(x.value, (e) => (u(), m("div", {
              key: `${e.type}:${e.name}`,
              class: H(["browse-row", { "browse-row-selected": e.type === "file" && e.path === f.value }]),
              onClick: (p) => j(e)
            }, y(e.icon) + " " + y(e.name), 11, ie))), 128)),
            !x.value.length && !c.value ? (u(), m("div", ue, "(empty)")) : B("", !0)
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, de = /* @__PURE__ */ R(ce, [["__scopeId", "data-v-d2c8bc8b"]]);
function me({ mode: g = "folder", startPath: a = "", ext: v = "", onSelect: n }) {
  J(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const o = Q(de, {
    mode: g,
    startPath: a,
    ext: v,
    onSelect: n,
    onClose: () => {
      o.unmount(), r.remove();
    }
  });
  o.use(X, { ripple: !0 }), o.mount(r);
}
export {
  me as openBrowseDialog
};
