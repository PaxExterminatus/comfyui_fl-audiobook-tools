import { _ as T, w as H, o as M, c as P, a as w, n as k, u as l, B as O, r as i, b as u, d as z, e as h, s as S, f as G, g as J, t as _, h as F, i as m, F as V, j as Q, k as X, l as y, m as B, p as Y, q as Z, P as ee } from "./styles_link.js";
import { u as te, a as se, s as ae, D as oe, b as le } from "./DialogHeader.js";
import { s as ne } from "./inputtext.esm.js";
const re = { class: "browse-toolbar" }, ie = {
  key: 0,
  class: "browse-row browse-row-note"
}, ue = ["onClick"], ce = {
  key: 0,
  class: "browse-row browse-row-note"
}, de = {
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
    const o = b, f = i(!0), n = i(""), r = i(""), s = i(null), v = i(null), g = i(!1), c = i(null), { cssWidth: $, setWidth: D, presets: E } = te({
      storageKey: "FL_CosyVoice3.BrowseDialog.widthPx",
      defaultWidth: 560,
      presets: [420, 700],
      // A file picker never needs to fill nearly the whole window the way
      // Line/Roles Editor's "100%" does -- capped much narrower.
      fullVw: 70
    }), { fontSizePx: L, decrease: W, increase: U } = se({
      storageKey: "FL_CosyVoice3.BrowseDialog.fontSizePx",
      defaultSize: 13
    }), I = y(() => o.mode === "folder" ? "Choose a folder" : "Choose a file"), j = y(() => o.mode === "folder" ? "Select This Folder" : "Select File"), A = y(
      () => o.mode === "folder" ? !n.value : !v.value
    );
    function K() {
      s.value && s.value.parent ? d(s.value.parent) : (s.value && s.value.parent === "" || n.value) && d("");
    }
    const x = y(() => {
      const t = s.value;
      if (!t) return [];
      const a = [];
      return (t.drives || []).forEach((e) => a.push({ type: "drive", name: e, icon: "💽", path: e })), (t.dirs || []).forEach((e) => a.push({ type: "dir", name: e, icon: "📁", path: B(n.value, e) })), o.mode === "file" && (t.files || []).forEach((e) => a.push({ type: "file", name: e, icon: "📄", path: B(n.value, e) })), a;
    });
    function N(t) {
      t.type === "file" ? v.value = t.path : d(t.path);
    }
    async function d(t) {
      g.value = !0, c.value = null, v.value = null;
      try {
        const a = `${O}?path=${encodeURIComponent(t)}${o.ext ? `&ext=${encodeURIComponent(o.ext)}` : ""}`, p = await (await fetch(a)).json();
        if (p.error) {
          c.value = p.error, s.value = null;
          return;
        }
        n.value = p.path, r.value = p.path || "", s.value = p;
      } catch (a) {
        c.value = String(a), s.value = null;
      } finally {
        g.value = !1;
      }
    }
    function R() {
      d(r.value.trim());
    }
    function q() {
      const t = o.mode === "folder" ? n.value : v.value;
      t && (o.onSelect(t), C());
    }
    function C() {
      o.onClose();
    }
    return H(f, (t) => {
      t || C();
    }), M(() => d(o.startPath || "")), (t, a) => (u(), P(l(le), {
      visible: f.value,
      "onUpdate:visible": a[1] || (a[1] = (e) => f.value = e),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: k({ width: l($) }),
      class: "browse-dialog"
    }, {
      header: w(() => [
        h(oe, {
          title: I.value,
          "width-presets": l(E),
          "set-width": l(D),
          "font-size-decrease": l(W),
          "font-size-increase": l(U)
        }, null, 8, ["title", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      footer: w(() => [
        h(l(S), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: C
        }),
        h(l(S), {
          label: j.value,
          disabled: A.value,
          onClick: q
        }, null, 8, ["label", "disabled"])
      ]),
      default: w(() => [
        z("div", re, [
          h(l(S), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: K
          }),
          h(l(ne), {
            modelValue: r.value,
            "onUpdate:modelValue": a[0] || (a[0] = (e) => r.value = e),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input",
            onKeydown: G(R, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        c.value ? (u(), P(l(ae), {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: w(() => [
            J(_(c.value), 1)
          ]),
          _: 1
        })) : F("", !0),
        z("div", {
          class: "browse-list",
          style: k({ fontSize: `${l(L)}px` })
        }, [
          g.value ? (u(), m("div", ie, "Loading...")) : (u(), m(V, { key: 1 }, [
            (u(!0), m(V, null, Q(x.value, (e) => (u(), m("div", {
              key: `${e.type}:${e.name}`,
              class: X(["browse-row", { "browse-row-selected": e.type === "file" && e.path === v.value }]),
              onClick: (p) => N(e)
            }, _(e.icon) + " " + _(e.name), 11, ue))), 128)),
            !x.value.length && !c.value ? (u(), m("div", ce, "(empty)")) : F("", !0)
          ], 64))
        ], 4)
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, pe = /* @__PURE__ */ T(de, [["__scopeId", "data-v-e4cd65a4"]]);
function me({ mode: b = "folder", startPath: o = "", ext: f = "", onSelect: n }) {
  Y(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const s = Z(pe, {
    mode: b,
    startPath: o,
    ext: f,
    onSelect: n,
    onClose: () => {
      s.unmount(), r.remove();
    }
  });
  s.use(ee, { ripple: !0 }), s.mount(r);
}
export {
  me as openBrowseDialog
};
