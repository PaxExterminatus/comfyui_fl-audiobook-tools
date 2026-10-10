import { _ as Y, p as Z, w as U, o as ee, L as te, r as S, a as _, c as b, b as x, u as d, f as R, g, h as F, i as oe, d as A, F as se, j as ne, k as N, t as L, l as w, H as ae, G as j, E as re, J as ie, q as le, s as ce, v as ue, x as de, P as pe, y as fe } from "./styles_link.js";
import { u as me, a as he, D as ve } from "./DialogHeader.js";
const ye = { class: "fl-roles-editor-content" }, Se = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, _e = 600, ge = 3e3, we = 1500, Ce = {
  __name: "RolesEditorContent",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(p) {
    const c = p, n = Z(c.root, "_roles.json"), a = w(!0), s = w([]), f = w([]), C = w(""), { setWidth: B, presets: M } = me({
      storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: T, decrease: O, increase: q } = he({
      storageKey: "FL_CosyVoice3.RolesEditor.fontSizePx",
      defaultSize: 13
    });
    let m = null, V = 0, h = null, v = null;
    const E = /* @__PURE__ */ new Map();
    function i(e) {
      C.value = e;
    }
    const P = /* @__PURE__ */ new Map();
    function J(e, t) {
      if (!t) {
        P.delete(e);
        return;
      }
      P.set(e, t.$el ?? t);
    }
    function W(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function z() {
      P.forEach(W);
    }
    function G() {
      return JSON.stringify({ roles: s.value }, null, 2);
    }
    async function D() {
      const e = G();
      if (e !== m)
        try {
          const o = await (await fetch(`${j}/write`, {
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
      V = Date.now(), h && clearTimeout(h), h = setTimeout(D, _e);
    }
    function $(e) {
      !e.code || E.get(e.code) === e.speaker || (E.set(e.code, e.speaker), ie(c.root, e.code, c.suffix).then((o) => i(o.message)));
    }
    function H(e) {
      k(), $(e);
    }
    async function K() {
      try {
        const t = await (await fetch(ae)).json();
        f.value = t.presets || [];
      } catch {
        f.value = [];
      }
    }
    async function I({ isPoll: e = !1 } = {}) {
      try {
        const o = await (await fetch(`${j}/read?path=${encodeURIComponent(n)}`)).json();
        if (o.error) {
          i(`Read error: ${o.error}`);
          return;
        }
        if (!o.exists) {
          e || (s.value = [], m = "", i("_roles.json does not exist yet"));
          return;
        }
        if (e && Date.now() - V < we || o.content === m) return;
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
          z(), requestAnimationFrame(z);
        });
      } catch (t) {
        i(`Read failed: ${t}`);
      }
    }
    function Q() {
      h && (clearTimeout(h), D()), s.value.forEach((e) => $(e)), v && clearInterval(v), c.onClose();
    }
    return U(a, (e) => {
      e || Q();
    }), ee(async () => {
      K(), await I(), v = setInterval(() => I({ isPoll: !0 }), ge);
    }), te(() => {
      v && clearInterval(v);
    }), (e, t) => {
      const o = S("Message"), y = S("Dropdown"), u = S("Textarea"), X = S("Card");
      return _(), b("div", ye, [
        x(ve, {
          title: "Roles",
          status: C.value,
          "width-presets": d(M),
          "set-width": d(B),
          "font-size-decrease": d(O),
          "font-size-increase": d(q)
        }, null, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
        s.value.length ? oe("", !0) : (_(), R(o, {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: g(() => [...t[2] || (t[2] = [
            F("No roles found", -1)
          ])]),
          _: 1
        })),
        A("div", {
          class: "grid",
          style: N({ fontSize: `${d(T)}px` })
        }, [
          (_(!0), b(se, null, ne(s.value, (r) => (_(), R(X, {
            key: r.code
          }, {
            title: g(() => [
              A("span", Se, L(r.code), 1)
            ]),
            subtitle: g(() => [
              F(L(r.name), 1)
            ]),
            content: g(() => [
              x(y, {
                modelValue: r.speaker,
                "onUpdate:modelValue": (l) => r.speaker = l,
                options: f.value,
                editable: "",
                filter: "",
                placeholder: "Speaker preset",
                title: "Real CosyVoice preset this role resolves to",
                class: "role-speaker w100p",
                onInput: t[0] || (t[0] = (l) => k()),
                onChange: (l) => H(r),
                onBlur: (l) => $(r)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
              x(u, {
                modelValue: r.description,
                "onUpdate:modelValue": (l) => r.description = l,
                ref_for: !0,
                ref: (l) => J(r.code, l),
                "auto-resize": "",
                rows: "1",
                placeholder: "Description...",
                class: "role-description w100p",
                style: N({ fontSize: `${d(T)}px` }),
                onInput: t[1] || (t[1] = (l) => k())
              }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)
      ]);
    };
  }
}, xe = /* @__PURE__ */ Y(Ce, [["__scopeId", "data-v-b630c035"]]), Ee = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(p) {
    const c = p, n = w(!0);
    return U(n, (a) => {
      a || c.onClose();
    }), (a, s) => {
      const f = S("Dialog");
      return _(), R(f, {
        visible: n.value,
        "onUpdate:visible": s[0] || (s[0] = (C) => n.value = C),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: { width: "1200px" },
        class: "roles-dialog"
      }, {
        default: g(() => [
          x(xe, le(ce(a.$props)), null, 16)
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
};
function $e({ root: p, suffix: c = "" }) {
  ue(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const a = de(Ee, {
    root: p,
    suffix: c,
    onClose: () => {
      a.unmount(), n.remove();
    }
  });
  a.use(pe, { ripple: !0 }), fe(a), a.mount(n);
}
export {
  $e as openRolesEditor
};
