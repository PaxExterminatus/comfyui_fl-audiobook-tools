import { B as A, O as L, s as E, o as s, c as p, r as P, a as U, t as S, m as f, R as Q, b as W, d as O, e as X, w as Y, n as T, f as C, g as k, h as z, _ as Z, i as ee, j as te, k as V, u as y, l as w, p as b, q as I, v as ne, x as ae, F, y as le, z as oe, A as N, C as ie, D as se, P as re } from "./styles_link.js";
var ue = {
  root: function(t) {
    var n = t.props, a = t.instance;
    return ["p-badge p-component", {
      "p-badge-no-gutter": L.isNotEmpty(n.value) && String(n.value).length === 1,
      "p-badge-dot": L.isEmpty(n.value) && !a.$slots.default,
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warning": n.severity === "warning",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, pe = A.extend({
  name: "badge",
  classes: ue
}), de = {
  name: "BaseBadge",
  extends: E,
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    severity: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },
  style: pe,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, j = {
  name: "Badge",
  extends: de,
  inheritAttrs: !1
};
function ce(e, t, n, a, u, l) {
  return s(), p("span", f({
    class: e.cx("root")
  }, e.ptmi("root")), [P(e.$slots, "default", {}, function() {
    return [U(S(e.value), 1)];
  })], 16);
}
j.render = ce;
function $(e) {
  "@babel/helpers - typeof";
  return $ = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $(e);
}
function c(e, t, n) {
  return t = fe(t), t in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function fe(e) {
  var t = ve(e, "string");
  return $(t) == "symbol" ? t : String(t);
}
function ve(e, t) {
  if ($(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if ($(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var be = {
  root: function(t) {
    var n = t.instance, a = t.props;
    return ["p-button p-component", c(c(c(c(c(c(c(c({
      "p-button-icon-only": n.hasIcon && !a.label && !a.badge,
      "p-button-vertical": (a.iconPos === "top" || a.iconPos === "bottom") && a.label,
      "p-disabled": n.$attrs.disabled || n.$attrs.disabled === "" || a.loading,
      "p-button-loading": a.loading,
      "p-button-loading-label-only": a.loading && !n.hasIcon && a.label,
      "p-button-link": a.link
    }, "p-button-".concat(a.severity), a.severity), "p-button-raised", a.raised), "p-button-rounded", a.rounded), "p-button-text", a.text), "p-button-outlined", a.outlined), "p-button-sm", a.size === "small"), "p-button-lg", a.size === "large"), "p-button-plain", a.plain)];
  },
  loadingIcon: "p-button-loading-icon pi-spin",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", {
      "p-button-icon-left": n.iconPos === "left" && n.label,
      "p-button-icon-right": n.iconPos === "right" && n.label,
      "p-button-icon-top": n.iconPos === "top" && n.label,
      "p-button-icon-bottom": n.iconPos === "bottom" && n.label
    }];
  },
  label: "p-button-label"
}, me = A.extend({
  name: "button",
  classes: be
}), ge = {
  name: "BaseButton",
  extends: E,
  props: {
    label: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: "left"
    },
    iconClass: {
      type: String,
      default: null
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: String,
      default: null
    },
    badgeSeverity: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    link: {
      type: Boolean,
      default: !1
    },
    severity: {
      type: String,
      default: null
    },
    raised: {
      type: Boolean,
      default: !1
    },
    rounded: {
      type: Boolean,
      default: !1
    },
    text: {
      type: Boolean,
      default: !1
    },
    outlined: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null
    },
    plain: {
      type: Boolean,
      default: !1
    }
  },
  style: me,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, B = {
  name: "Button",
  extends: ge,
  inheritAttrs: !1,
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
    },
    hasIcon: function() {
      return this.icon || this.$slots.icon;
    }
  },
  components: {
    SpinnerIcon: W,
    Badge: j
  },
  directives: {
    ripple: Q
  }
}, ye = ["aria-label", "disabled", "data-p-severity"];
function he(e, t, n, a, u, l) {
  var v = O("SpinnerIcon"), h = O("Badge"), d = X("ripple");
  return Y((s(), p("button", f({
    class: e.cx("root"),
    type: "button",
    "aria-label": l.defaultAriaLabel,
    disabled: l.disabled
  }, l.getPTOptions("root"), {
    "data-p-severity": e.severity
  }), [P(e.$slots, "default", {}, function() {
    return [e.loading ? P(e.$slots, "loadingicon", {
      key: 0,
      class: T([e.cx("loadingIcon"), e.cx("icon")])
    }, function() {
      return [e.loadingIcon ? (s(), p("span", f({
        key: 0,
        class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
      }, e.ptm("loadingIcon")), null, 16)) : (s(), C(v, f({
        key: 1,
        class: [e.cx("loadingIcon"), e.cx("icon")],
        spin: ""
      }, e.ptm("loadingIcon")), null, 16, ["class"]))];
    }) : P(e.$slots, "icon", {
      key: 1,
      class: T([e.cx("icon")])
    }, function() {
      return [e.icon ? (s(), p("span", f({
        key: 0,
        class: [e.cx("icon"), e.icon, e.iconClass]
      }, e.ptm("icon")), null, 16)) : k("", !0)];
    }), z("span", f({
      class: e.cx("label")
    }, e.ptm("label")), S(e.label || " "), 17), e.badge ? (s(), C(h, f({
      key: 2,
      value: e.badge,
      class: e.badgeClass,
      severity: e.badgeSeverity,
      unstyled: e.unstyled
    }, e.ptm("badge")), null, 16, ["value", "class", "severity", "unstyled"])) : k("", !0)];
  })], 16, ye)), [[d]]);
}
B.render = he;
var Se = {
  root: function(t) {
    var n = t.instance, a = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.filled,
      "p-inputtext-sm": a.size === "small",
      "p-inputtext-lg": a.size === "large",
      "p-invalid": a.invalid,
      "p-variant-filled": a.variant ? a.variant === "filled" : n.$primevue.config.inputStyle === "filled"
    }];
  }
}, $e = A.extend({
  name: "inputtext",
  classes: Se
}), we = {
  name: "BaseInputText",
  extends: E,
  props: {
    modelValue: null,
    size: {
      type: String,
      default: null
    },
    invalid: {
      type: Boolean,
      default: !1
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: $e,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, R = {
  name: "InputText",
  extends: we,
  inheritAttrs: !1,
  emits: ["update:modelValue"],
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          filled: this.filled,
          disabled: this.$attrs.disabled || this.$attrs.disabled === ""
        }
      });
    },
    onInput: function(t) {
      this.$emit("update:modelValue", t.target.value);
    }
  },
  computed: {
    filled: function() {
      return this.modelValue != null && this.modelValue.toString().length > 0;
    }
  }
}, Ie = ["value", "aria-invalid"];
function Pe(e, t, n, a, u, l) {
  return s(), p("input", f({
    class: e.cx("root"),
    value: e.modelValue,
    "aria-invalid": e.invalid || void 0,
    onInput: t[0] || (t[0] = function() {
      return l.onInput && l.onInput.apply(l, arguments);
    })
  }, l.getPTOptions("root")), null, 16, Ie);
}
R.render = Pe;
const Be = { class: "browse-toolbar" }, Ce = { class: "browse-list" }, ke = {
  key: 0,
  class: "browse-row browse-row-note"
}, xe = ["onClick"], Ve = {
  key: 0,
  class: "browse-row browse-row-note"
}, Te = "/fl_cosyvoice3/browse/list_dir", ze = {
  __name: "BrowseDialogApp",
  props: {
    mode: { type: String, default: "folder" },
    // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const t = e, n = b(!0), a = b(""), u = b(""), l = b(null), v = b(null), h = b(!1), d = b(null), q = w(() => t.mode === "folder" ? "Choose a folder" : "Choose a file"), K = w(() => t.mode === "folder" ? "Select This Folder" : "Select File"), M = w(
      () => t.mode === "folder" ? !a.value : !v.value
    );
    function _() {
      l.value && l.value.parent ? m(l.value.parent) : (l.value && l.value.parent === "" || a.value) && m("");
    }
    const D = w(() => {
      const i = l.value;
      if (!i) return [];
      const r = [];
      return (i.drives || []).forEach((o) => r.push({ type: "drive", name: o, icon: "💽", path: o })), (i.dirs || []).forEach((o) => r.push({ type: "dir", name: o, icon: "📁", path: N(a.value, o) })), t.mode === "file" && (i.files || []).forEach((o) => r.push({ type: "file", name: o, icon: "📄", path: N(a.value, o) })), r;
    });
    function G(i) {
      i.type === "file" ? v.value = i.path : m(i.path);
    }
    async function m(i) {
      h.value = !0, d.value = null, v.value = null;
      try {
        const r = `${Te}?path=${encodeURIComponent(i)}${t.ext ? `&ext=${encodeURIComponent(t.ext)}` : ""}`, g = await (await fetch(r)).json();
        if (g.error) {
          d.value = g.error, l.value = null;
          return;
        }
        a.value = g.path, u.value = g.path || "", l.value = g;
      } catch (r) {
        d.value = String(r), l.value = null;
      } finally {
        h.value = !1;
      }
    }
    function H() {
      m(u.value.trim());
    }
    function J() {
      const i = t.mode === "folder" ? a.value : v.value;
      i && (t.onSelect(i), x());
    }
    function x() {
      t.onClose();
    }
    return ee(n, (i) => {
      i || x();
    }), te(() => m(t.startPath || "")), (i, r) => (s(), C(y(oe), {
      visible: n.value,
      "onUpdate:visible": r[1] || (r[1] = (o) => n.value = o),
      modal: "",
      "dismissable-mask": "",
      header: q.value,
      style: { width: "min(560px, 90vw)" },
      "content-style": { display: "flex", flexDirection: "column" }
    }, {
      footer: V(() => [
        I(y(B), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: x
        }),
        I(y(B), {
          label: K.value,
          disabled: M.value,
          onClick: J
        }, null, 8, ["label", "disabled"])
      ]),
      default: V(() => [
        z("div", Be, [
          I(y(B), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: _
          }),
          I(y(R), {
            modelValue: u.value,
            "onUpdate:modelValue": r[0] || (r[0] = (o) => u.value = o),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input",
            onKeydown: ne(H, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        d.value ? (s(), C(y(ae), {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: V(() => [
            U(S(d.value), 1)
          ]),
          _: 1
        })) : k("", !0),
        z("div", Ce, [
          h.value ? (s(), p("div", ke, "Loading...")) : (s(), p(F, { key: 1 }, [
            (s(!0), p(F, null, le(D.value, (o) => (s(), p("div", {
              key: `${o.type}:${o.name}`,
              class: T(["browse-row", { "browse-row-selected": o.type === "file" && o.path === v.value }]),
              onClick: (g) => G(o)
            }, S(o.icon) + " " + S(o.name), 11, xe))), 128)),
            !D.value.length && !d.value ? (s(), p("div", Ve, "(empty)")) : k("", !0)
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["visible", "header"]));
  }
}, Ae = /* @__PURE__ */ Z(ze, [["__scopeId", "data-v-1d95d509"]]);
function De({ mode: e = "folder", startPath: t = "", ext: n = "", onSelect: a }) {
  ie(import.meta.url);
  const u = document.createElement("div");
  document.body.appendChild(u);
  const l = se(Ae, {
    mode: e,
    startPath: t,
    ext: n,
    onSelect: a,
    onClose: () => {
      l.unmount(), u.remove();
    }
  });
  l.use(re, { ripple: !0 }), l.mount(u);
}
export {
  De as openBrowseDialog
};
