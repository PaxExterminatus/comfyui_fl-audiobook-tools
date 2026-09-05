import { q as f, r as m, b as v } from "./styles_link.js";
var h = f();
function d({ storageKey: e, defaultWidth: n, presets: o }) {
  function u() {
    try {
      const t = localStorage.getItem(e);
      if (t === "full") return "full";
      const r = parseFloat(t);
      return Number.isFinite(r) ? r : n;
    } catch {
      return n;
    }
  }
  function a(t) {
    try {
      localStorage.setItem(e, String(t));
    } catch {
    }
  }
  function c(t) {
    return t === "full" ? "94vw" : `min(94vw, ${t}px)`;
  }
  const s = m(u()), i = v(() => c(s.value));
  function l(t) {
    s.value = t, a(t);
  }
  return { cssWidth: i, setWidth: l, presets: o };
}
export {
  h as O,
  d as u
};
