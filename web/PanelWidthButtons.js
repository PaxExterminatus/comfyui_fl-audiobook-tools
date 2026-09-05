import { q as p, r as w, b as v, _ as b, d as i, j as c, F as k, k as W, c as _, u, s as d, f as y } from "./styles_link.js";
var P = p();
function S({ storageKey: s, defaultWidth: n, presets: r }) {
  function e() {
    try {
      const t = localStorage.getItem(s);
      if (t === "full") return "full";
      const a = parseFloat(t);
      return Number.isFinite(a) ? a : n;
    } catch {
      return n;
    }
  }
  function l(t) {
    try {
      localStorage.setItem(s, String(t));
    } catch {
    }
  }
  function f(t) {
    return t === "full" ? "94vw" : `min(94vw, ${t}px)`;
  }
  const o = w(e()), h = v(() => f(o.value));
  function m(t) {
    o.value = t, l(t);
  }
  return { cssWidth: h, setWidth: m, presets: r };
}
const B = { class: "width-row" }, g = {
  __name: "PanelWidthButtons",
  props: {
    presets: { type: Array, required: !0 },
    // px width buttons to show, in order
    setWidth: { type: Function, required: !0 }
    // (value: number | "full") => void
  },
  setup(s) {
    return (n, r) => (i(), c("div", B, [
      (i(!0), c(k, null, W(s.presets, (e) => (i(), _(u(d), {
        key: e,
        label: String(e),
        text: "",
        size: "small",
        title: `Set editor width to ${e}px (capped to the window's width)`,
        onClick: (l) => s.setWidth(e)
      }, null, 8, ["label", "title", "onClick"]))), 128)),
      y(u(d), {
        label: "100%",
        text: "",
        size: "small",
        title: "Use the full available window width",
        onClick: r[0] || (r[0] = (e) => s.setWidth("full"))
      })
    ]));
  }
}, x = /* @__PURE__ */ b(g, [["__scopeId", "data-v-d114d08b"]]);
export {
  P as O,
  x as P,
  S as u
};
