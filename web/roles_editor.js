import { y as L, z as O, b as l, i as h, C as f, A as S, h as m, d as k, _, m as Q, w as X, o as Z, M as ee, c as P, a as w, n as te, u as c, N as se, O as D, L as ae, r as V, g as oe, F as re, j as ne, e as R, t as j, Y as ie, p as le, q as de, P as ue } from "./styles_link.js";
import { u as pe, s as ce } from "./PanelWidthButtons.js";
import { s as fe } from "./message.esm.js";
import { s as he, D as me } from "./DialogHeader.js";
var ve = {
  root: "p-card p-component",
  header: "p-card-header",
  body: "p-card-body",
  caption: "p-card-caption",
  title: "p-card-title",
  subtitle: "p-card-subtitle",
  content: "p-card-content",
  footer: "p-card-footer"
}, ye = L.extend({
  name: "card",
  classes: ve
}), $e = {
  name: "BaseCard",
  extends: O,
  style: ye
}, U = {
  name: "Card",
  extends: $e,
  inheritAttrs: !1
};
function ge(e, o, i, r, d, u) {
  return l(), h("div", f({
    class: e.cx("root")
  }, e.ptmi("root")), [e.$slots.header ? (l(), h("div", f({
    key: 0,
    class: e.cx("header")
  }, e.ptm("header")), [S(e.$slots, "header")], 16)) : m("", !0), k("div", f({
    class: e.cx("body")
  }, e.ptm("body")), [e.$slots.title || e.$slots.subtitle ? (l(), h("div", f({
    key: 0,
    class: e.cx("caption")
  }, e.ptm("caption")), [e.$slots.title ? (l(), h("div", f({
    key: 0,
    class: e.cx("title")
  }, e.ptm("title")), [S(e.$slots, "title")], 16)) : m("", !0), e.$slots.subtitle ? (l(), h("div", f({
    key: 1,
    class: e.cx("subtitle")
  }, e.ptm("subtitle")), [S(e.$slots, "subtitle")], 16)) : m("", !0)], 16)) : m("", !0), k("div", f({
    class: e.cx("content")
  }, e.ptm("content")), [S(e.$slots, "content")], 16), e.$slots.footer ? (l(), h("div", f({
    key: 1,
    class: e.cx("footer")
  }, e.ptm("footer")), [S(e.$slots, "footer")], 16)) : m("", !0)], 16)], 16);
}
U.render = ge;
var Se = {
  root: function(o) {
    var i = o.instance, r = o.props;
    return ["p-inputtextarea p-inputtext p-component", {
      "p-filled": i.filled,
      "p-inputtextarea-resizable ": r.autoResize,
      "p-invalid": r.invalid,
      "p-variant-filled": r.variant ? r.variant === "filled" : i.$primevue.config.inputStyle === "filled"
    }];
  }
}, we = L.extend({
  name: "textarea",
  classes: Se
}), ke = {
  name: "BaseTextarea",
  extends: O,
  props: {
    modelValue: null,
    autoResize: Boolean,
    invalid: {
      type: Boolean,
      default: !1
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: we,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, F = {
  name: "Textarea",
  extends: ke,
  inheritAttrs: !1,
  emits: ["update:modelValue"],
  mounted: function() {
    this.$el.offsetParent && this.autoResize && this.resize();
  },
  updated: function() {
    this.$el.offsetParent && this.autoResize && this.resize();
  },
  methods: {
    resize: function() {
      this.$el.style.height = "auto", this.$el.style.height = this.$el.scrollHeight + "px", parseFloat(this.$el.style.height) >= parseFloat(this.$el.style.maxHeight) ? (this.$el.style.overflowY = "scroll", this.$el.style.height = this.$el.style.maxHeight) : this.$el.style.overflow = "hidden";
    },
    onInput: function(o) {
      this.autoResize && this.resize(), this.$emit("update:modelValue", o.target.value);
    }
  },
  computed: {
    filled: function() {
      return this.modelValue != null && this.modelValue.toString().length > 0;
    },
    ptmParams: function() {
      return {
        context: {
          disabled: this.$attrs.disabled || this.$attrs.disabled === ""
        }
      };
    }
  }
}, be = ["value", "aria-invalid"];
function Ve(e, o, i, r, d, u) {
  return l(), h("textarea", f({
    class: e.cx("root"),
    value: e.modelValue,
    "aria-invalid": e.invalid || void 0,
    onInput: o[0] || (o[0] = function() {
      return u.onInput && u.onInput.apply(u, arguments);
    })
  }, e.ptmi("root", u.ptmParams)), null, 16, be);
}
F.render = Ve;
const Ce = { class: "roles-list" }, Ee = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, Ie = { class: "role-name" }, Pe = 600, Re = 3e3, Te = 1500, xe = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "_speakers.txt" },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const o = e, i = Q(o.root, "_roles.json"), r = V(!0), d = V([]), u = V([]), T = V(""), { cssWidth: M, setWidth: W, presets: H } = pe({
      storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    });
    let v = null, x = 0, y = null, $ = null;
    const C = /* @__PURE__ */ new Map();
    function p(t) {
      T.value = t;
    }
    const b = /* @__PURE__ */ new Map();
    function q(t, a) {
      if (!a) {
        b.delete(t);
        return;
      }
      b.set(t, a.$el ?? a);
    }
    function A(t) {
      t && (t.style.height = "auto", t.style.height = `${t.scrollHeight}px`);
    }
    function z() {
      b.forEach(A);
    }
    function J() {
      return JSON.stringify({ roles: d.value }, null, 2);
    }
    async function B() {
      const t = J();
      if (t !== v)
        try {
          const s = await (await fetch(`${D}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: i, content: t })
          })).json();
          if (s.error) {
            p(`Save error: ${s.error}`);
            return;
          }
          v = t, p(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (a) {
          p(`Save failed: ${a}`);
        }
    }
    function E() {
      x = Date.now(), y && clearTimeout(y), y = setTimeout(B, Pe);
    }
    function I(t) {
      !t.code || C.get(t.code) === t.speaker || (C.set(t.code, t.speaker), ie(o.root, t.code, o.suffix).then((s) => p(s.message)));
    }
    function G(t) {
      E(), I(t);
    }
    async function K() {
      try {
        const a = await (await fetch(se)).json();
        u.value = a.presets || [];
      } catch {
        u.value = [];
      }
    }
    async function N({ isPoll: t = !1 } = {}) {
      try {
        const s = await (await fetch(`${D}/read?path=${encodeURIComponent(i)}`)).json();
        if (s.error) {
          p(`Read error: ${s.error}`);
          return;
        }
        if (!s.exists) {
          t || (d.value = [], v = "", p("_roles.json does not exist yet"));
          return;
        }
        if (t && Date.now() - x < Te || s.content === v) return;
        let n;
        try {
          n = JSON.parse(s.content);
        } catch (g) {
          p(`_roles.json is not valid JSON: ${g}`);
          return;
        }
        d.value = Array.isArray(n.roles) ? n.roles : [], d.value.forEach((g) => {
          g.code && C.set(g.code, g.speaker);
        }), v = s.content, t || p(`Loaded ${d.value.length} role(s)`), ae(() => {
          z(), requestAnimationFrame(z);
        });
      } catch (a) {
        p(`Read failed: ${a}`);
      }
    }
    function Y() {
      y && (clearTimeout(y), B()), d.value.forEach((t) => I(t)), $ && clearInterval($), o.onClose();
    }
    return X(r, (t) => {
      t || Y();
    }), Z(async () => {
      K(), await N(), $ = setInterval(() => N({ isPoll: !0 }), Re);
    }), ee(() => {
      $ && clearInterval($);
    }), (t, a) => (l(), P(c(ce), {
      visible: r.value,
      "onUpdate:visible": a[1] || (a[1] = (s) => r.value = s),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: te({ width: c(M) }),
      class: "roles-dialog"
    }, {
      header: w(() => [
        R(me, {
          title: "Roles",
          status: T.value,
          "width-presets": c(H),
          "set-width": c(W)
        }, null, 8, ["status", "width-presets", "set-width"])
      ]),
      default: w(() => [
        d.value.length ? m("", !0) : (l(), P(c(fe), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: w(() => [...a[2] || (a[2] = [
            oe("No roles found", -1)
          ])]),
          _: 1
        })),
        k("div", Ce, [
          (l(!0), h(re, null, ne(d.value, (s) => (l(), P(c(U), {
            key: s.code,
            class: "role-card"
          }, {
            title: w(() => [
              k("span", Ee, j(s.code), 1),
              k("span", Ie, j(s.name), 1)
            ]),
            content: w(() => [
              R(c(he), {
                modelValue: s.speaker,
                "onUpdate:modelValue": (n) => s.speaker = n,
                options: u.value,
                editable: "",
                filter: "",
                placeholder: "Speaker preset",
                title: "Real CosyVoice preset this role resolves to",
                class: "role-speaker",
                onInput: a[0] || (a[0] = (n) => E()),
                onChange: (n) => G(s),
                onBlur: (n) => I(s)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
              R(c(F), {
                modelValue: s.description,
                "onUpdate:modelValue": (n) => s.description = n,
                ref_for: !0,
                ref: (n) => q(s.code, n),
                rows: "1",
                placeholder: "Description...",
                class: "role-description",
                onInput: (n) => {
                  E(), A(c(b).get(s.code));
                }
              }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"])
            ]),
            _: 2
          }, 1024))), 128))
        ])
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, Ae = /* @__PURE__ */ _(xe, [["__scopeId", "data-v-28e46361"]]);
function je({ root: e, suffix: o = "_speakers.txt" }) {
  le(import.meta.url);
  const i = document.createElement("div");
  document.body.appendChild(i);
  const r = de(Ae, {
    root: e,
    suffix: o,
    onClose: () => {
      r.unmount(), i.remove();
    }
  });
  r.use(ue, { ripple: !0 }), r.mount(i);
}
export {
  je as openRolesEditor
};
