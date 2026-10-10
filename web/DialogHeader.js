import { l as p, m as g, w as F, r as w, a as o, c as d, F as _, j as k, f as y, b as f, _ as z, d as v, t as S, i as B, a4 as C } from "./styles_link.js";
function A({ storageKey: e, defaultWidth: n, presets: a, fullVw: s = 94 }) {
  function i() {
    try {
      const t = localStorage.getItem(e);
      if (t === "full") return "full";
      const m = parseFloat(t);
      return Number.isFinite(m) ? m : n;
    } catch {
      return n;
    }
  }
  function l(t) {
    try {
      localStorage.setItem(e, String(t));
    } catch {
    }
  }
  function r(t) {
    return t === "full" ? `${s}vw` : `min(94vw, ${t}px)`;
  }
  const u = p(i()), h = g(() => r(u.value));
  function c(t) {
    u.value = t, l(t);
  }
  return { cssWidth: h, setWidth: c, presets: a };
}
function V({ storageKey: e, defaultSize: n = 13, min: a = 9, max: s = 22 }) {
  function i() {
    try {
      const c = parseFloat(localStorage.getItem(e));
      return Number.isFinite(c) ? c : n;
    } catch {
      return n;
    }
  }
  function l(c) {
    try {
      localStorage.setItem(e, String(c));
    } catch {
    }
  }
  const r = p(i());
  F(r, l);
  function u() {
    r.value = Math.max(a, r.value - 1);
  }
  function h() {
    r.value = Math.min(s, r.value + 1);
  }
  return { fontSizePx: r, decrease: u, increase: h };
}
const $ = { class: "actions" }, b = {
  __name: "PanelWidthButtons",
  props: {
    presets: { type: Array, required: !0 },
    // px width buttons to show, in order
    setWidth: { type: Function, required: !0 }
    // (value: number | "full") => void
  },
  setup(e) {
    return (n, a) => {
      const s = w("Button");
      return o(), d("div", $, [
        (o(!0), d(_, null, k(e.presets, (i) => (o(), y(s, {
          key: i,
          label: String(i),
          title: `Set editor width to ${i}px (capped to the window's width)`,
          onClick: (l) => e.setWidth(i)
        }, null, 8, ["label", "title", "onClick"]))), 128)),
        f(s, {
          label: "100%",
          title: "Use the full available window width",
          onClick: a[0] || (a[0] = (i) => e.setWidth("full"))
        })
      ]);
    };
  }
}, I = { class: "actions" }, D = {
  __name: "FontSizeButtons",
  props: {
    decrease: { type: Function, required: !0 },
    increase: { type: Function, required: !0 }
  },
  setup(e) {
    return (n, a) => {
      const s = w("Button");
      return o(), d("div", I, [
        f(s, {
          label: "A−",
          title: "Decrease text size",
          onClick: e.decrease
        }, null, 8, ["onClick"]),
        f(s, {
          label: "A+",
          title: "Increase text size",
          onClick: e.increase
        }, null, 8, ["onClick"])
      ]);
    };
  }
}, W = { class: "row" }, q = { class: "dialog-title title ellipsis" }, x = { class: "dialog-status muted ellipsis" }, P = {
  __name: "DialogHeader",
  props: {
    title: { type: String, required: !0 },
    status: { type: String, default: "" },
    widthPresets: { type: Array, required: !0 },
    setWidth: { type: Function, required: !0 },
    fontSizeDecrease: { type: Function, default: null },
    fontSizeIncrease: { type: Function, default: null }
  },
  setup(e) {
    return (n, a) => (o(), d("div", W, [
      v("div", q, S(e.title), 1),
      v("div", x, S(e.status), 1),
      f(b, {
        presets: e.widthPresets,
        "set-width": e.setWidth
      }, null, 8, ["presets", "set-width"]),
      e.fontSizeDecrease && e.fontSizeIncrease ? (o(), y(D, {
        key: 0,
        decrease: e.fontSizeDecrease,
        increase: e.fontSizeIncrease
      }, null, 8, ["decrease", "increase"])) : B("", !0),
      C(n.$slots, "after", {}, void 0, !0)
    ]));
  }
}, H = /* @__PURE__ */ z(P, [["__scopeId", "data-v-93c2771a"]]);
export {
  H as D,
  V as a,
  A as u
};
