import { B as x, s as G, o as r, c as f, m as d, C as S, k as m, f as g, _ as Q, v as _, w as X, a as Y, H as Z, b as R, d as w, n as ee, u as c, I as te, K as j, J as se, r as b, j as ae, F as oe, l as re, g as V, t as U, Q as ne, x as le, y as ie, P as de } from "./styles_link.js";
import { u as ce, s as ue } from "./PanelWidthButtons.js";
import { s as pe } from "./message.esm.js";
import { a as fe, s as me, D as he } from "./DialogHeader.js";
var ve = {
  root: "p-card p-component",
  header: "p-card-header",
  body: "p-card-body",
  caption: "p-card-caption",
  title: "p-card-title",
  subtitle: "p-card-subtitle",
  content: "p-card-content",
  footer: "p-card-footer"
}, ye = x.extend({
  name: "card",
  classes: ve
}), $e = {
  name: "BaseCard",
  extends: G,
  style: ye
}, L = {
  name: "Card",
  extends: $e,
  inheritAttrs: !1
};
function Se(t, u, p, i, n, k) {
  return r(), f("div", d({
    class: t.cx("root")
  }, t.ptmi("root")), [t.$slots.header ? (r(), f("div", d({
    key: 0,
    class: t.cx("header")
  }, t.ptm("header")), [S(t.$slots, "header")], 16)) : m("", !0), g("div", d({
    class: t.cx("body")
  }, t.ptm("body")), [t.$slots.title || t.$slots.subtitle ? (r(), f("div", d({
    key: 0,
    class: t.cx("caption")
  }, t.ptm("caption")), [t.$slots.title ? (r(), f("div", d({
    key: 0,
    class: t.cx("title")
  }, t.ptm("title")), [S(t.$slots, "title")], 16)) : m("", !0), t.$slots.subtitle ? (r(), f("div", d({
    key: 1,
    class: t.cx("subtitle")
  }, t.ptm("subtitle")), [S(t.$slots, "subtitle")], 16)) : m("", !0)], 16)) : m("", !0), g("div", d({
    class: t.cx("content")
  }, t.ptm("content")), [S(t.$slots, "content")], 16), t.$slots.footer ? (r(), f("div", d({
    key: 1,
    class: t.cx("footer")
  }, t.ptm("footer")), [S(t.$slots, "footer")], 16)) : m("", !0)], 16)], 16);
}
L.render = Se;
const we = { class: "roles-list" }, ge = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, ke = { class: "role-name" }, be = 600, Ce = 3e3, Ee = 1500, Te = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(t) {
    const u = t, p = _(u.root, "_roles.json"), i = b(!0), n = b([]), k = b([]), I = b(""), { cssWidth: O, setWidth: F, presets: M } = ce({
      storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    });
    let h = null, A = 0, v = null, y = null;
    const C = /* @__PURE__ */ new Map();
    function l(e) {
      I.value = e;
    }
    const E = /* @__PURE__ */ new Map();
    function W(e, a) {
      if (!a) {
        E.delete(e);
        return;
      }
      E.set(e, a.$el ?? a);
    }
    function J(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function B() {
      E.forEach(J);
    }
    function q() {
      return JSON.stringify({ roles: n.value }, null, 2);
    }
    async function D() {
      const e = q();
      if (e !== h)
        try {
          const s = await (await fetch(`${j}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: p, content: e })
          })).json();
          if (s.error) {
            l(`Save error: ${s.error}`);
            return;
          }
          h = e, l(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (a) {
          l(`Save failed: ${a}`);
        }
    }
    function T() {
      A = Date.now(), v && clearTimeout(v), v = setTimeout(D, be);
    }
    function P(e) {
      !e.code || C.get(e.code) === e.speaker || (C.set(e.code, e.speaker), ne(u.root, e.code, u.suffix).then((s) => l(s.message)));
    }
    function z(e) {
      T(), P(e);
    }
    async function H() {
      try {
        const a = await (await fetch(te)).json();
        k.value = a.presets || [];
      } catch {
        k.value = [];
      }
    }
    async function N({ isPoll: e = !1 } = {}) {
      try {
        const s = await (await fetch(`${j}/read?path=${encodeURIComponent(p)}`)).json();
        if (s.error) {
          l(`Read error: ${s.error}`);
          return;
        }
        if (!s.exists) {
          e || (n.value = [], h = "", l("_roles.json does not exist yet"));
          return;
        }
        if (e && Date.now() - A < Ee || s.content === h) return;
        let o;
        try {
          o = JSON.parse(s.content);
        } catch ($) {
          l(`_roles.json is not valid JSON: ${$}`);
          return;
        }
        n.value = Array.isArray(o.roles) ? o.roles : [], n.value.forEach(($) => {
          $.code && C.set($.code, $.speaker);
        }), h = s.content, e || l(`Loaded ${n.value.length} role(s)`), se(() => {
          B(), requestAnimationFrame(B);
        });
      } catch (a) {
        l(`Read failed: ${a}`);
      }
    }
    function K() {
      v && (clearTimeout(v), D()), n.value.forEach((e) => P(e)), y && clearInterval(y), u.onClose();
    }
    return X(i, (e) => {
      e || K();
    }), Y(async () => {
      H(), await N(), y = setInterval(() => N({ isPoll: !0 }), Ce);
    }), Z(() => {
      y && clearInterval(y);
    }), (e, a) => (r(), R(c(ue), {
      visible: i.value,
      "onUpdate:visible": a[2] || (a[2] = (s) => i.value = s),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: ee({ width: c(O) }),
      class: "roles-dialog"
    }, {
      header: w(() => [
        V(he, {
          title: "Roles",
          status: I.value,
          "width-presets": c(M),
          "set-width": c(F)
        }, null, 8, ["status", "width-presets", "set-width"])
      ]),
      default: w(() => [
        n.value.length ? m("", !0) : (r(), R(c(pe), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: w(() => [...a[3] || (a[3] = [
            ae("No roles found", -1)
          ])]),
          _: 1
        })),
        g("div", we, [
          (r(!0), f(oe, null, re(n.value, (s) => (r(), R(c(L), {
            key: s.code,
            class: "role-card"
          }, {
            title: w(() => [
              g("span", ge, U(s.code), 1),
              g("span", ke, U(s.name), 1)
            ]),
            content: w(() => [
              V(c(fe), {
                modelValue: s.speaker,
                "onUpdate:modelValue": (o) => s.speaker = o,
                options: k.value,
                editable: "",
                filter: "",
                placeholder: "Speaker preset",
                title: "Real CosyVoice preset this role resolves to",
                class: "role-speaker",
                onInput: a[0] || (a[0] = (o) => T()),
                onChange: (o) => z(s),
                onBlur: (o) => P(s)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
              V(c(me), {
                modelValue: s.description,
                "onUpdate:modelValue": (o) => s.description = o,
                ref_for: !0,
                ref: (o) => W(s.code, o),
                "auto-resize": "",
                rows: "1",
                placeholder: "Description...",
                class: "role-description",
                onInput: a[1] || (a[1] = (o) => T())
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ]),
            _: 2
          }, 1024))), 128))
        ])
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, Pe = /* @__PURE__ */ Q(Te, [["__scopeId", "data-v-936d83fe"]]);
function Be({ root: t, suffix: u = "" }) {
  le(import.meta.url);
  const p = document.createElement("div");
  document.body.appendChild(p);
  const i = ie(Pe, {
    root: t,
    suffix: u,
    onClose: () => {
      i.unmount(), p.remove();
    }
  });
  i.use(de, { ripple: !0 }), i.mount(p);
}
export {
  Be as openRolesEditor
};
