import { _ as X, p as Y, w as j, o as Z, L as ee, r as S, a as _, c as F, b as C, u as d, f as T, g as x, h as te, i as oe, d as R, F as se, j as ne, k as A, t as N, l as g, H as ae, G as L, E as re, J as ie, q as le, s as ce, v as ue, x as de, P as pe, y as fe } from "./styles_link.js";
import { u as me, a as he, D as ve } from "./DialogHeader.js";
const ye = { class: "fl-roles-editor-content" }, Se = {
  class: "role-code mono",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, _e = { class: "role-name muted" }, ge = 600, we = 3e3, Ce = 1500, xe = {
  __name: "RolesEditorContent",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(p) {
    const c = p, n = Y(c.root, "_roles.json"), a = g(!0), s = g([]), f = g([]), w = g(""), { setWidth: U, presets: B } = me({
      storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: V, decrease: M, increase: O } = he({
      storageKey: "FL_CosyVoice3.RolesEditor.fontSizePx",
      defaultSize: 13
    });
    let m = null, z = 0, h = null, v = null;
    const E = /* @__PURE__ */ new Map();
    function i(e) {
      w.value = e;
    }
    const P = /* @__PURE__ */ new Map();
    function q(e, t) {
      if (!t) {
        P.delete(e);
        return;
      }
      P.set(e, t.$el ?? t);
    }
    function J(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function D() {
      P.forEach(J);
    }
    function W() {
      return JSON.stringify({ roles: s.value }, null, 2);
    }
    async function I() {
      const e = W();
      if (e !== m)
        try {
          const o = await (await fetch(`${L}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: n, content: e })
          })).json();
          if (o.error) {
            i(`Save error: ${o.error}`);
            return;
          }
          m = e, i(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (t) {
          i(`Save failed: ${t}`);
        }
    }
    function k() {
      z = Date.now(), h && clearTimeout(h), h = setTimeout(I, ge);
    }
    function $(e) {
      !e.code || E.get(e.code) === e.speaker || (E.set(e.code, e.speaker), ie(c.root, e.code, c.suffix).then((o) => i(o.message)));
    }
    function G(e) {
      k(), $(e);
    }
    async function H() {
      try {
        const t = await (await fetch(ae)).json();
        f.value = t.presets || [];
      } catch {
        f.value = [];
      }
    }
    async function b({ isPoll: e = !1 } = {}) {
      try {
        const o = await (await fetch(`${L}/read?path=${encodeURIComponent(n)}`)).json();
        if (o.error) {
          i(`Read error: ${o.error}`);
          return;
        }
        if (!o.exists) {
          e || (s.value = [], m = "", i("_roles.json does not exist yet"));
          return;
        }
        if (e && Date.now() - z < Ce || o.content === m) return;
        let y;
        try {
          y = JSON.parse(o.content);
        } catch (u) {
          i(`_roles.json is not valid JSON: ${u}`);
          return;
        }
        s.value = Array.isArray(y.roles) ? y.roles : [], s.value.forEach((u) => {
          u.code && E.set(u.code, u.speaker);
        }), m = o.content, e || i(`Loaded ${s.value.length} role(s)`), re(() => {
          D(), requestAnimationFrame(D);
        });
      } catch (t) {
        i(`Read failed: ${t}`);
      }
    }
    function K() {
      h && (clearTimeout(h), I()), s.value.forEach((e) => $(e)), v && clearInterval(v), c.onClose();
    }
    return j(a, (e) => {
      e || K();
    }), Z(async () => {
      H(), await b(), v = setInterval(() => b({ isPoll: !0 }), we);
    }), ee(() => {
      v && clearInterval(v);
    }), (e, t) => {
      const o = S("Message"), y = S("Dropdown"), u = S("Textarea"), Q = S("Card");
      return _(), F("div", ye, [
        C(ve, {
          title: "Roles",
          status: w.value,
          "width-presets": d(B),
          "set-width": d(U),
          "font-size-decrease": d(M),
          "font-size-increase": d(O)
        }, null, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
        s.value.length ? oe("", !0) : (_(), T(o, {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: x(() => [...t[2] || (t[2] = [
            te("No roles found", -1)
          ])]),
          _: 1
        })),
        R("div", {
          class: "grid",
          style: A({ fontSize: `${d(V)}px` })
        }, [
          (_(!0), F(se, null, ne(s.value, (r) => (_(), T(Q, {
            key: r.code
          }, {
            title: x(() => [
              R("span", Se, N(r.code), 1),
              R("span", _e, N(r.name), 1)
            ]),
            content: x(() => [
              C(y, {
                modelValue: r.speaker,
                "onUpdate:modelValue": (l) => r.speaker = l,
                options: f.value,
                editable: "",
                filter: "",
                placeholder: "Speaker preset",
                title: "Real CosyVoice preset this role resolves to",
                class: "role-speaker w100p",
                onInput: t[0] || (t[0] = (l) => k()),
                onChange: (l) => G(r),
                onBlur: (l) => $(r)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
              C(u, {
                modelValue: r.description,
                "onUpdate:modelValue": (l) => r.description = l,
                ref_for: !0,
                ref: (l) => q(r.code, l),
                "auto-resize": "",
                rows: "1",
                placeholder: "Description...",
                class: "role-description w100p",
                style: A({ fontSize: `${d(V)}px` }),
                onInput: t[1] || (t[1] = (l) => k())
              }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)
      ]);
    };
  }
}, Ee = /* @__PURE__ */ X(xe, [["__scopeId", "data-v-f7b4016b"]]), Pe = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(p) {
    const c = p, n = g(!0);
    return j(n, (a) => {
      a || c.onClose();
    }), (a, s) => {
      const f = S("Dialog");
      return _(), T(f, {
        visible: n.value,
        "onUpdate:visible": s[0] || (s[0] = (w) => n.value = w),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: { width: "1200px" },
        class: "roles-dialog"
      }, {
        default: x(() => [
          C(Ee, le(ce(a.$props)), null, 16)
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
};
function Re({ root: p, suffix: c = "" }) {
  ue(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const a = de(Pe, {
    root: p,
    suffix: c,
    onClose: () => {
      a.unmount(), n.remove();
    }
  });
  a.use(pe, { ripple: !0 }), fe(a), a.mount(n);
}
export {
  Re as openRolesEditor
};
