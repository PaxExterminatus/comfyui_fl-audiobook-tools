import { _ as q, m as K, w as H, o as G, H as Q, c as $, a as m, n as x, u as o, I as X, K as b, J as Y, r as h, b as v, g as Z, h as ee, d as C, i as te, F as se, j as ae, e as k, t as A, T as oe, p as ne, q as re, P as ie } from "./styles_link.js";
import { u as le, a as ce, s as de, D as ue, b as pe } from "./DialogHeader.js";
import { a as fe, b as me, s as he } from "./dropdown.esm.js";
const ve = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, ye = { class: "role-name" }, Se = 600, we = 3e3, ge = 1500, _e = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(y) {
    const l = y, c = K(l.root, "_roles.json"), i = h(!0), r = h([]), S = h([]), P = h(""), { cssWidth: D, setWidth: F, presets: N } = le({
      storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: T, decrease: j, increase: L } = ce({
      storageKey: "FL_CosyVoice3.RolesEditor.fontSizePx",
      defaultSize: 13
    });
    let d = null, R = 0, u = null, p = null;
    const w = /* @__PURE__ */ new Map();
    function n(e) {
      P.value = e;
    }
    const g = /* @__PURE__ */ new Map();
    function U(e, s) {
      if (!s) {
        g.delete(e);
        return;
      }
      g.set(e, s.$el ?? s);
    }
    function B(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function V() {
      g.forEach(B);
    }
    function O() {
      return JSON.stringify({ roles: r.value }, null, 2);
    }
    async function z() {
      const e = O();
      if (e !== d)
        try {
          const t = await (await fetch(`${b}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: c, content: e })
          })).json();
          if (t.error) {
            n(`Save error: ${t.error}`);
            return;
          }
          d = e, n(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (s) {
          n(`Save failed: ${s}`);
        }
    }
    function _() {
      R = Date.now(), u && clearTimeout(u), u = setTimeout(z, Se);
    }
    function E(e) {
      !e.code || w.get(e.code) === e.speaker || (w.set(e.code, e.speaker), oe(l.root, e.code, l.suffix).then((t) => n(t.message)));
    }
    function M(e) {
      _(), E(e);
    }
    async function W() {
      try {
        const s = await (await fetch(X)).json();
        S.value = s.presets || [];
      } catch {
        S.value = [];
      }
    }
    async function I({ isPoll: e = !1 } = {}) {
      try {
        const t = await (await fetch(`${b}/read?path=${encodeURIComponent(c)}`)).json();
        if (t.error) {
          n(`Read error: ${t.error}`);
          return;
        }
        if (!t.exists) {
          e || (r.value = [], d = "", n("_roles.json does not exist yet"));
          return;
        }
        if (e && Date.now() - R < ge || t.content === d) return;
        let a;
        try {
          a = JSON.parse(t.content);
        } catch (f) {
          n(`_roles.json is not valid JSON: ${f}`);
          return;
        }
        r.value = Array.isArray(a.roles) ? a.roles : [], r.value.forEach((f) => {
          f.code && w.set(f.code, f.speaker);
        }), d = t.content, e || n(`Loaded ${r.value.length} role(s)`), Y(() => {
          V(), requestAnimationFrame(V);
        });
      } catch (s) {
        n(`Read failed: ${s}`);
      }
    }
    function J() {
      u && (clearTimeout(u), z()), r.value.forEach((e) => E(e)), p && clearInterval(p), l.onClose();
    }
    return H(i, (e) => {
      e || J();
    }), G(async () => {
      W(), await I(), p = setInterval(() => I({ isPoll: !0 }), we);
    }), Q(() => {
      p && clearInterval(p);
    }), (e, s) => (v(), $(o(pe), {
      visible: i.value,
      "onUpdate:visible": s[2] || (s[2] = (t) => i.value = t),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: x({ width: o(D) }),
      class: "roles-dialog"
    }, {
      header: m(() => [
        k(ue, {
          title: "Roles",
          status: P.value,
          "width-presets": o(N),
          "set-width": o(F),
          "font-size-decrease": o(j),
          "font-size-increase": o(L)
        }, null, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: m(() => [
        r.value.length ? ee("", !0) : (v(), $(o(de), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: m(() => [...s[3] || (s[3] = [
            Z("No roles found", -1)
          ])]),
          _: 1
        })),
        C("div", {
          class: "roles-list",
          style: x({ fontSize: `${o(T)}px` })
        }, [
          (v(!0), te(se, null, ae(r.value, (t) => (v(), $(o(fe), {
            key: t.code,
            class: "role-card"
          }, {
            title: m(() => [
              C("span", ve, A(t.code), 1),
              C("span", ye, A(t.name), 1)
            ]),
            content: m(() => [
              k(o(me), {
                modelValue: t.speaker,
                "onUpdate:modelValue": (a) => t.speaker = a,
                options: S.value,
                editable: "",
                filter: "",
                placeholder: "Speaker preset",
                title: "Real CosyVoice preset this role resolves to",
                class: "role-speaker",
                onInput: s[0] || (s[0] = (a) => _()),
                onChange: (a) => M(t),
                onBlur: (a) => E(t)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
              k(o(he), {
                modelValue: t.description,
                "onUpdate:modelValue": (a) => t.description = a,
                ref_for: !0,
                ref: (a) => U(t.code, a),
                "auto-resize": "",
                rows: "1",
                placeholder: "Description...",
                class: "role-description",
                style: x({ fontSize: `${o(T)}px` }),
                onInput: s[1] || (s[1] = (a) => _())
              }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, Ee = /* @__PURE__ */ q(_e, [["__scopeId", "data-v-d8b0cc39"]]);
function ke({ root: y, suffix: l = "" }) {
  ne(import.meta.url);
  const c = document.createElement("div");
  document.body.appendChild(c);
  const i = re(Ee, {
    root: y,
    suffix: l,
    onClose: () => {
      i.unmount(), c.remove();
    }
  });
  i.use(ie, { ripple: !0 }), i.mount(c);
}
export {
  ke as openRolesEditor
};
