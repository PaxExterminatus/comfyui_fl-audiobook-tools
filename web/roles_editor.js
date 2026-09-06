import { B as U, s as F, o as l, c as h, m as f, C as S, k as m, f as b, _ as Y, v as X, w as Z, a as _, H as ee, b as P, d as w, n as te, u as c, I as se, K as N, J as ae, r as I, j as oe, F as re, l as ne, g as R, t as j, Q as ie, x as le, y as de, P as ue } from "./styles_link.js";
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
}, ye = U.extend({
  name: "card",
  classes: ve
}), $e = {
  name: "BaseCard",
  extends: F,
  style: ye
}, L = {
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
  }, e.ptm("header")), [S(e.$slots, "header")], 16)) : m("", !0), b("div", f({
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
  }, e.ptm("subtitle")), [S(e.$slots, "subtitle")], 16)) : m("", !0)], 16)) : m("", !0), b("div", f({
    class: e.cx("content")
  }, e.ptm("content")), [S(e.$slots, "content")], 16), e.$slots.footer ? (l(), h("div", f({
    key: 1,
    class: e.cx("footer")
  }, e.ptm("footer")), [S(e.$slots, "footer")], 16)) : m("", !0)], 16)], 16);
}
L.render = ge;
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
}, we = U.extend({
  name: "textarea",
  classes: Se
}), be = {
  name: "BaseTextarea",
  extends: F,
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
}, O = {
  name: "Textarea",
  extends: be,
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
}, ke = ["value", "aria-invalid"];
function Ie(e, o, i, r, d, u) {
  return l(), h("textarea", f({
    class: e.cx("root"),
    value: e.modelValue,
    "aria-invalid": e.invalid || void 0,
    onInput: o[0] || (o[0] = function() {
      return u.onInput && u.onInput.apply(u, arguments);
    })
  }, e.ptmi("root", u.ptmParams)), null, 16, ke);
}
O.render = Ie;
const Ve = { class: "roles-list" }, Ce = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, Ee = { class: "role-name" }, Pe = 600, Re = 3e3, Te = 1500, xe = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const o = e, i = X(o.root, "_roles.json"), r = I(!0), d = I([]), u = I([]), T = I(""), { cssWidth: H, setWidth: M, presets: W } = pe({
      storageKey: "FL_CosyVoice3.RolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    });
    let v = null, x = 0, y = null, $ = null;
    const V = /* @__PURE__ */ new Map();
    function p(t) {
      T.value = t;
    }
    const k = /* @__PURE__ */ new Map();
    function J(t, a) {
      if (!a) {
        k.delete(t);
        return;
      }
      k.set(t, a.$el ?? a);
    }
    function A(t) {
      t && (t.style.height = "auto", t.style.height = `${t.scrollHeight}px`);
    }
    function B() {
      k.forEach(A);
    }
    function q() {
      return JSON.stringify({ roles: d.value }, null, 2);
    }
    async function z() {
      const t = q();
      if (t !== v)
        try {
          const s = await (await fetch(`${N}/write`, {
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
    function C() {
      x = Date.now(), y && clearTimeout(y), y = setTimeout(z, Pe);
    }
    function E(t) {
      !t.code || V.get(t.code) === t.speaker || (V.set(t.code, t.speaker), ie(o.root, t.code, o.suffix).then((s) => p(s.message)));
    }
    function K(t) {
      C(), E(t);
    }
    async function G() {
      try {
        const a = await (await fetch(se)).json();
        u.value = a.presets || [];
      } catch {
        u.value = [];
      }
    }
    async function D({ isPoll: t = !1 } = {}) {
      try {
        const s = await (await fetch(`${N}/read?path=${encodeURIComponent(i)}`)).json();
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
          g.code && V.set(g.code, g.speaker);
        }), v = s.content, t || p(`Loaded ${d.value.length} role(s)`), ae(() => {
          B(), requestAnimationFrame(B);
        });
      } catch (a) {
        p(`Read failed: ${a}`);
      }
    }
    function Q() {
      y && (clearTimeout(y), z()), d.value.forEach((t) => E(t)), $ && clearInterval($), o.onClose();
    }
    return Z(r, (t) => {
      t || Q();
    }), _(async () => {
      G(), await D(), $ = setInterval(() => D({ isPoll: !0 }), Re);
    }), ee(() => {
      $ && clearInterval($);
    }), (t, a) => (l(), P(c(ce), {
      visible: r.value,
      "onUpdate:visible": a[1] || (a[1] = (s) => r.value = s),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: te({ width: c(H) }),
      class: "roles-dialog"
    }, {
      header: w(() => [
        R(me, {
          title: "Roles",
          status: T.value,
          "width-presets": c(W),
          "set-width": c(M)
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
        b("div", Ve, [
          (l(!0), h(re, null, ne(d.value, (s) => (l(), P(c(L), {
            key: s.code,
            class: "role-card"
          }, {
            title: w(() => [
              b("span", Ce, j(s.code), 1),
              b("span", Ee, j(s.name), 1)
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
                onInput: a[0] || (a[0] = (n) => C()),
                onChange: (n) => K(s),
                onBlur: (n) => E(s)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
              R(c(O), {
                modelValue: s.description,
                "onUpdate:modelValue": (n) => s.description = n,
                ref_for: !0,
                ref: (n) => J(s.code, n),
                rows: "1",
                placeholder: "Description...",
                class: "role-description",
                onInput: (n) => {
                  C(), A(c(k).get(s.code));
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
}, Ae = /* @__PURE__ */ Y(xe, [["__scopeId", "data-v-36603fd6"]]);
function je({ root: e, suffix: o = "" }) {
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
