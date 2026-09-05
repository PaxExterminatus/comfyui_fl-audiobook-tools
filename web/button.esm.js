import { B as y, $ as u, d as l, j as p, y as d, h as P, t as v, z as i, C as m, v as c, G as z, H as C, n as b, c as g, i as f, e as k, R as w, Y as N } from "./styles_link.js";
var A = {
  root: function(n) {
    var t = n.props, a = n.instance;
    return ["p-badge p-component", {
      "p-badge-no-gutter": u.isNotEmpty(t.value) && String(t.value).length === 1,
      "p-badge-dot": u.isEmpty(t.value) && !a.$slots.default,
      "p-badge-lg": t.size === "large",
      "p-badge-xl": t.size === "xlarge",
      "p-badge-info": t.severity === "info",
      "p-badge-success": t.severity === "success",
      "p-badge-warning": t.severity === "warning",
      "p-badge-danger": t.severity === "danger",
      "p-badge-secondary": t.severity === "secondary",
      "p-badge-contrast": t.severity === "contrast"
    }];
  }
}, O = y.extend({
  name: "badge",
  classes: A
}), T = {
  name: "BaseBadge",
  extends: m,
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
  style: O,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, h = {
  name: "Badge",
  extends: T,
  inheritAttrs: !1
};
function E(e, n, t, a, S, r) {
  return l(), p("span", i({
    class: e.cx("root")
  }, e.ptmi("root")), [d(e.$slots, "default", {}, function() {
    return [P(v(e.value), 1)];
  })], 16);
}
h.render = E;
function s(e) {
  "@babel/helpers - typeof";
  return s = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, s(e);
}
function o(e, n, t) {
  return n = L(n), n in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function L(e) {
  var n = D(e, "string");
  return s(n) == "symbol" ? n : String(n);
}
function D(e, n) {
  if (s(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var a = t.call(e, n);
    if (s(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(e);
}
var V = {
  root: function(n) {
    var t = n.instance, a = n.props;
    return ["p-button p-component", o(o(o(o(o(o(o(o({
      "p-button-icon-only": t.hasIcon && !a.label && !a.badge,
      "p-button-vertical": (a.iconPos === "top" || a.iconPos === "bottom") && a.label,
      "p-disabled": t.$attrs.disabled || t.$attrs.disabled === "" || a.loading,
      "p-button-loading": a.loading,
      "p-button-loading-label-only": a.loading && !t.hasIcon && a.label,
      "p-button-link": a.link
    }, "p-button-".concat(a.severity), a.severity), "p-button-raised", a.raised), "p-button-rounded", a.rounded), "p-button-text", a.text), "p-button-outlined", a.outlined), "p-button-sm", a.size === "small"), "p-button-lg", a.size === "large"), "p-button-plain", a.plain)];
  },
  loadingIcon: "p-button-loading-icon pi-spin",
  icon: function(n) {
    var t = n.props;
    return ["p-button-icon", {
      "p-button-icon-left": t.iconPos === "left" && t.label,
      "p-button-icon-right": t.iconPos === "right" && t.label,
      "p-button-icon-top": t.iconPos === "top" && t.label,
      "p-button-icon-bottom": t.iconPos === "bottom" && t.label
    }];
  },
  label: "p-button-label"
}, j = y.extend({
  name: "button",
  classes: V
}), R = {
  name: "BaseButton",
  extends: m,
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
  style: j,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, G = {
  name: "Button",
  extends: R,
  inheritAttrs: !1,
  methods: {
    getPTOptions: function(n) {
      var t = n === "root" ? this.ptmi : this.ptm;
      return t(n, {
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
    SpinnerIcon: N,
    Badge: h
  },
  directives: {
    ripple: w
  }
}, H = ["aria-label", "disabled", "data-p-severity"];
function K(e, n, t, a, S, r) {
  var $ = c("SpinnerIcon"), B = c("Badge"), I = z("ripple");
  return C((l(), p("button", i({
    class: e.cx("root"),
    type: "button",
    "aria-label": r.defaultAriaLabel,
    disabled: r.disabled
  }, r.getPTOptions("root"), {
    "data-p-severity": e.severity
  }), [d(e.$slots, "default", {}, function() {
    return [e.loading ? d(e.$slots, "loadingicon", {
      key: 0,
      class: b([e.cx("loadingIcon"), e.cx("icon")])
    }, function() {
      return [e.loadingIcon ? (l(), p("span", i({
        key: 0,
        class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
      }, e.ptm("loadingIcon")), null, 16)) : (l(), g($, i({
        key: 1,
        class: [e.cx("loadingIcon"), e.cx("icon")],
        spin: ""
      }, e.ptm("loadingIcon")), null, 16, ["class"]))];
    }) : d(e.$slots, "icon", {
      key: 1,
      class: b([e.cx("icon")])
    }, function() {
      return [e.icon ? (l(), p("span", i({
        key: 0,
        class: [e.cx("icon"), e.icon, e.iconClass]
      }, e.ptm("icon")), null, 16)) : f("", !0)];
    }), k("span", i({
      class: e.cx("label")
    }, e.ptm("label")), v(e.label || " "), 17), e.badge ? (l(), g(B, i({
      key: 2,
      value: e.badge,
      class: e.badgeClass,
      severity: e.badgeSeverity,
      unstyled: e.unstyled
    }, e.ptm("badge")), null, 16, ["value", "class", "severity", "unstyled"])) : f("", !0)];
  })], 16, H)), [[I]]);
}
G.render = K;
export {
  G as s
};
