import { _ as N, m as G, w as D, o as H, T as Q, a as v, c as I, b as S, u as r, f as C, g as _, h as X, i as Y, d as $, F as Z, r as ee, j as b, t as A, k as y, N as te, M as F, L as se, Q as oe, p as ae, q as re, v as ne, x as ie, P as le } from "./styles_link.js";
import { u as ce, a as de, D as ue, s as pe, b as fe } from "./DialogHeader.js";
import { a as me, s as he, b as ve } from "./dropdown.esm.js";
const ye = { class: "fl-roles-editor-content" }, Se = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, _e = { class: "role-name" }, ge = 600, we = 3e3, xe = 1500, Ee = {
  __name: "RolesEditorContent",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(d) {
    const c = d, n = G(c.root, "_roles.json"), i = y(!0), a = y([]), u = y([]), k = y(""), { setWidth: L, presets: j } = ce({
      storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: P, decrease: U, increase: B } = de({
      storageKey: "FL_CosyVoice3.RolesEditor.fontSizePx",
      defaultSize: 13
    });
    let p = null, R = 0, f = null, m = null;
    const g = /* @__PURE__ */ new Map();
    function l(e) {
      k.value = e;
    }
    const w = /* @__PURE__ */ new Map();
    function O(e, s) {
      if (!s) {
        w.delete(e);
        return;
      }
      w.set(e, s.$el ?? s);
    }
    function M(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function T() {
      w.forEach(M);
    }
    function q() {
      return JSON.stringify({ roles: a.value }, null, 2);
    }
    async function z() {
      const e = q();
      if (e !== p)
        try {
          const t = await (await fetch(`${F}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: n, content: e })
          })).json();
          if (t.error) {
            l(`Save error: ${t.error}`);
            return;
          }
          p = e, l(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (s) {
          l(`Save failed: ${s}`);
        }
    }
    function x() {
      R = Date.now(), f && clearTimeout(f), f = setTimeout(z, ge);
    }
    function E(e) {
      !e.code || g.get(e.code) === e.speaker || (g.set(e.code, e.speaker), oe(c.root, e.code, c.suffix).then((t) => l(t.message)));
    }
    function J(e) {
      x(), E(e);
    }
    async function W() {
      try {
        const s = await (await fetch(te)).json();
        u.value = s.presets || [];
      } catch {
        u.value = [];
      }
    }
    async function V({ isPoll: e = !1 } = {}) {
      try {
        const t = await (await fetch(`${F}/read?path=${encodeURIComponent(n)}`)).json();
        if (t.error) {
          l(`Read error: ${t.error}`);
          return;
        }
        if (!t.exists) {
          e || (a.value = [], p = "", l("_roles.json does not exist yet"));
          return;
        }
        if (e && Date.now() - R < xe || t.content === p) return;
        let o;
        try {
          o = JSON.parse(t.content);
        } catch (h) {
          l(`_roles.json is not valid JSON: ${h}`);
          return;
        }
        a.value = Array.isArray(o.roles) ? o.roles : [], a.value.forEach((h) => {
          h.code && g.set(h.code, h.speaker);
        }), p = t.content, e || l(`Loaded ${a.value.length} role(s)`), se(() => {
          T(), requestAnimationFrame(T);
        });
      } catch (s) {
        l(`Read failed: ${s}`);
      }
    }
    function K() {
      f && (clearTimeout(f), z()), a.value.forEach((e) => E(e)), m && clearInterval(m), c.onClose();
    }
    return D(i, (e) => {
      e || K();
    }), H(async () => {
      W(), await V(), m = setInterval(() => V({ isPoll: !0 }), we);
    }), Q(() => {
      m && clearInterval(m);
    }), (e, s) => (v(), I("div", ye, [
      S(ue, {
        title: "Roles",
        status: k.value,
        "width-presets": r(j),
        "set-width": r(L),
        "font-size-decrease": r(U),
        "font-size-increase": r(B)
      }, null, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
      a.value.length ? Y("", !0) : (v(), C(r(pe), {
        key: 0,
        severity: "info",
        closable: !1
      }, {
        default: _(() => [...s[2] || (s[2] = [
          X("No roles found", -1)
        ])]),
        _: 1
      })),
      $("div", {
        class: "roles-list",
        style: b({ fontSize: `${r(P)}px` })
      }, [
        (v(!0), I(Z, null, ee(a.value, (t) => (v(), C(r(ve), {
          key: t.code,
          class: "role-card"
        }, {
          title: _(() => [
            $("span", Se, A(t.code), 1),
            $("span", _e, A(t.name), 1)
          ]),
          content: _(() => [
            S(r(me), {
              modelValue: t.speaker,
              "onUpdate:modelValue": (o) => t.speaker = o,
              options: u.value,
              editable: "",
              filter: "",
              placeholder: "Speaker preset",
              title: "Real CosyVoice preset this role resolves to",
              class: "role-speaker",
              onInput: s[0] || (s[0] = (o) => x()),
              onChange: (o) => J(t),
              onBlur: (o) => E(t)
            }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
            S(r(he), {
              modelValue: t.description,
              "onUpdate:modelValue": (o) => t.description = o,
              ref_for: !0,
              ref: (o) => O(t.code, o),
              "auto-resize": "",
              rows: "1",
              placeholder: "Description...",
              class: "role-description",
              style: b({ fontSize: `${r(P)}px` }),
              onInput: s[1] || (s[1] = (o) => x())
            }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
          ]),
          _: 2
        }, 1024))), 128))
      ], 4)
    ]));
  }
}, $e = /* @__PURE__ */ N(Ee, [["__scopeId", "data-v-dc55a54a"]]), Ce = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(d) {
    const c = d, n = y(!0);
    return D(n, (i) => {
      i || c.onClose();
    }), (i, a) => (v(), C(r(fe), {
      visible: n.value,
      "onUpdate:visible": a[0] || (a[0] = (u) => n.value = u),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: { width: "1200px" },
      class: "roles-dialog"
    }, {
      default: _(() => [
        S($e, ae(re(i.$props)), null, 16)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}, ke = /* @__PURE__ */ N(Ce, [["__scopeId", "data-v-fd09558d"]]);
function ze({ root: d, suffix: c = "" }) {
  ne(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const i = ie(ke, {
    root: d,
    suffix: c,
    onClose: () => {
      i.unmount(), n.remove();
    }
  });
  i.use(le, { ripple: !0 }), i.mount(n);
}
export {
  ze as openRolesEditor
};
