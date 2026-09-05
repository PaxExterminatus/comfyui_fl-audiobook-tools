import { v as Pn, x as Rn, y as Ve, z as qe, b as d, i as k, A as U, C as B, D as dt, c as oe, E as at, a as E, e as g, k as se, d as p, F as M, G as ft, h as P, t as N, s as A, R as Dn, U as jn, H as W, I as On, Z as rt, J as jt, T as Fn, K as Ot, _ as ht, u as h, j as pt, L as ie, l as L, r as y, w as Be, o as Nn, M as zn, n as Ee, S as fe, N as Bn, B as Ft, O as Ke, m as ne, Q as Me, V as Kn, W as Ue, f as Nt, X as Mn, Y as Un, p as Hn, q as Vn, P as qn } from "./styles_link.js";
import { s as Kt, a as Jn, b as Wn, F as Xn, u as Zn } from "./PanelWidthButtons.js";
import { O as He, s as zt, D as Gn } from "./DialogHeader.js";
import { s as Yn } from "./inputtext.esm.js";
var he = Pn(), Mt = Symbol();
function Qn() {
  var s = Rn(Mt);
  if (!s)
    throw new Error("No PrimeVue Confirmation provided!");
  return s;
}
var ei = {
  install: function(i) {
    var r = {
      require: function(m) {
        he.emit("confirm", m);
      },
      close: function() {
        he.emit("close");
      }
    };
    i.config.globalProperties.$confirm = r, i.provide(Mt, r);
  }
}, ti = {
  root: "p-inputgroup"
}, ni = Ve.extend({
  name: "inputgroup",
  classes: ti
}), ii = {
  name: "BaseInputGroup",
  extends: qe,
  style: ni,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, vt = {
  name: "InputGroup",
  extends: ii,
  inheritAttrs: !1
};
function si(s, i, r, v, m, a) {
  return d(), k("div", B({
    class: s.cx("root")
  }, s.ptmi("root")), [U(s.$slots, "default")], 16);
}
vt.render = si;
var oi = {
  root: "p-inputgroup-addon"
}, li = Ve.extend({
  name: "inputgroupaddon",
  classes: oi
}), ai = {
  name: "BaseInputGroupAddon",
  extends: qe,
  style: li,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, mt = {
  name: "InputGroupAddon",
  extends: ai,
  inheritAttrs: !1
};
function ri(s, i, r, v, m, a) {
  return d(), k("div", B({
    class: s.cx("root")
  }, s.ptmi("root")), [U(s.$slots, "default")], 16);
}
mt.render = ri;
var ci = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var r = i.instance;
    return ["p-confirm-dialog-reject", r.confirmation && !r.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, ui = Ve.extend({
  name: "confirmdialog",
  classes: ci
}), di = {
  name: "BaseConfirmDialog",
  extends: qe,
  props: {
    group: String,
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    }
  },
  style: ui,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ut = {
  name: "ConfirmDialog",
  extends: di,
  confirmListener: null,
  closeListener: null,
  data: function() {
    return {
      visible: !1,
      confirmation: null
    };
  },
  mounted: function() {
    var i = this;
    this.confirmListener = function(r) {
      r && r.group === i.group && (i.confirmation = r, i.confirmation.onShow && i.confirmation.onShow(), i.visible = !0);
    }, this.closeListener = function() {
      i.visible = !1, i.confirmation = null;
    }, he.on("confirm", this.confirmListener), he.on("close", this.closeListener);
  },
  beforeUnmount: function() {
    he.off("confirm", this.confirmListener), he.off("close", this.closeListener);
  },
  methods: {
    accept: function() {
      this.confirmation.accept && this.confirmation.accept(), this.visible = !1;
    },
    reject: function() {
      this.confirmation.reject && this.confirmation.reject(), this.visible = !1;
    },
    onHide: function() {
      this.confirmation.onHide && this.confirmation.onHide(), this.visible = !1;
    },
    getCXOptions: function(i, r) {
      return {
        contenxt: {
          icon: i,
          iconClass: r.class
        }
      };
    }
  },
  computed: {
    header: function() {
      return this.confirmation ? this.confirmation.header : null;
    },
    message: function() {
      return this.confirmation ? this.confirmation.message : null;
    },
    blockScroll: function() {
      return this.confirmation ? this.confirmation.blockScroll : !0;
    },
    position: function() {
      return this.confirmation ? this.confirmation.position : null;
    },
    acceptLabel: function() {
      return this.confirmation ? this.confirmation.acceptLabel || this.$primevue.config.locale.accept : null;
    },
    rejectLabel: function() {
      return this.confirmation ? this.confirmation.rejectLabel || this.$primevue.config.locale.reject : null;
    },
    acceptIcon: function() {
      return this.confirmation ? this.confirmation.acceptIcon : null;
    },
    rejectIcon: function() {
      return this.confirmation ? this.confirmation.rejectIcon : null;
    },
    autoFocusAccept: function() {
      return this.confirmation.defaultFocus === void 0 || this.confirmation.defaultFocus === "accept";
    },
    autoFocusReject: function() {
      return this.confirmation.defaultFocus === "reject";
    },
    closeOnEscape: function() {
      return this.confirmation ? this.confirmation.closeOnEscape : !0;
    }
  },
  components: {
    CDialog: Kt,
    CDButton: A
  }
};
function fi(s, i, r, v, m, a) {
  var b = dt("CDButton"), x = dt("CDialog");
  return d(), oe(x, {
    visible: m.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(_) {
      return m.visible = _;
    }), a.onHide],
    role: "alertdialog",
    class: se(s.cx("root")),
    modal: !0,
    header: a.header,
    blockScroll: a.blockScroll,
    position: a.position,
    breakpoints: s.breakpoints,
    closeOnEscape: a.closeOnEscape,
    draggable: s.draggable,
    pt: s.pt,
    unstyled: s.unstyled
  }, at({
    default: E(function() {
      return [s.$slots.container ? P("", !0) : (d(), k(M, {
        key: 0
      }, [s.$slots.message ? (d(), oe(ft(s.$slots.message), {
        key: 1,
        message: m.confirmation
      }, null, 8, ["message"])) : (d(), k(M, {
        key: 0
      }, [U(s.$slots, "icon", {}, function() {
        return [s.$slots.icon ? (d(), oe(ft(s.$slots.icon), {
          key: 0,
          class: se(s.cx("icon"))
        }, null, 8, ["class"])) : m.confirmation.icon ? (d(), k("span", B({
          key: 1,
          class: [m.confirmation.icon, s.cx("icon")]
        }, s.ptm("icon")), null, 16)) : P("", !0)];
      }), p("span", B({
        class: s.cx("message")
      }, s.ptm("message")), N(a.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [s.$slots.container ? {
    name: "container",
    fn: E(function(_) {
      return [U(s.$slots, "container", {
        message: m.confirmation,
        onClose: _.onClose,
        onAccept: a.accept,
        onReject: a.reject,
        closeCallback: _.onclose,
        acceptCallback: a.accept,
        rejectCallback: a.reject
      })];
    }),
    key: "0"
  } : void 0, s.$slots.container ? void 0 : {
    name: "footer",
    fn: E(function() {
      return [g(b, {
        label: a.rejectLabel,
        class: se([s.cx("rejectButton"), m.confirmation.rejectClass]),
        onClick: i[0] || (i[0] = function(_) {
          return a.reject();
        }),
        autofocus: a.autoFocusReject,
        unstyled: s.unstyled,
        pt: s.ptm("rejectButton")
      }, at({
        _: 2
      }, [a.rejectIcon || s.$slots.rejecticon ? {
        name: "icon",
        fn: E(function(_) {
          return [U(s.$slots, "rejecticon", {}, function() {
            return [p("span", B({
              class: [a.rejectIcon, _.class]
            }, s.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), g(b, {
        label: a.acceptLabel,
        class: se([s.cx("acceptButton"), m.confirmation.acceptClass]),
        onClick: i[1] || (i[1] = function(_) {
          return a.accept();
        }),
        autofocus: a.autoFocusAccept,
        unstyled: s.unstyled,
        pt: s.ptm("acceptButton")
      }, at({
        _: 2
      }, [a.acceptIcon || s.$slots.accepticon ? {
        name: "icon",
        fn: E(function(_) {
          return [U(s.$slots, "accepticon", {}, function() {
            return [p("span", B({
              class: [a.acceptIcon, _.class]
            }, s.ptm("acceptButton").icon, {
              "data-pc-section": "acceptbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"])];
    }),
    key: "1"
  }]), 1032, ["visible", "class", "header", "blockScroll", "position", "breakpoints", "closeOnEscape", "draggable", "onUpdate:visible", "pt", "unstyled"]);
}
Ut.render = fi;
var pi = {
  root: function(i) {
    var r = i.instance;
    return ["p-overlaypanel p-component", {
      "p-ripple-disabled": r.$primevue.config.ripple === !1
    }];
  },
  content: "p-overlaypanel-content",
  closeButton: "p-overlaypanel-close p-link",
  closeIcon: "p-overlaypanel-close-icon"
}, vi = Ve.extend({
  name: "overlaypanel",
  classes: pi
}), mi = {
  name: "BaseOverlayPanel",
  extends: qe,
  props: {
    dismissable: {
      type: Boolean,
      default: !0
    },
    showCloseIcon: {
      type: Boolean,
      default: !1
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    breakpoints: {
      type: Object,
      default: null
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    }
  },
  style: vi,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ht = {
  name: "OverlayPanel",
  extends: mi,
  inheritAttrs: !1,
  emits: ["show", "hide"],
  data: function() {
    return {
      visible: !1
    };
  },
  watch: {
    dismissable: {
      immediate: !0,
      handler: function(i) {
        i ? this.bindOutsideClickListener() : this.unbindOutsideClickListener();
      }
    }
  },
  selfClick: !1,
  target: null,
  eventTarget: null,
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  container: null,
  styleElement: null,
  overlayEventListener: null,
  documentKeydownListener: null,
  beforeUnmount: function() {
    this.dismissable && this.unbindOutsideClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.destroyStyle(), this.unbindResizeListener(), this.target = null, this.container && this.autoZIndex && rt.clear(this.container), this.overlayEventListener && (He.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null), this.container = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    toggle: function(i, r) {
      this.visible ? this.hide() : this.show(i, r);
    },
    show: function(i, r) {
      this.visible = !0, this.eventTarget = i.currentTarget, this.target = r || i.currentTarget;
    },
    hide: function() {
      this.visible = !1;
    },
    onContentClick: function() {
      this.selfClick = !0;
    },
    onEnter: function(i) {
      var r = this;
      this.container.setAttribute(this.attributeSelector, ""), W.addStyles(i, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.dismissable && this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && rt.set("overlay", i, this.baseZIndex + this.$primevue.config.zIndex.overlay), this.overlayEventListener = function(v) {
        r.container.contains(v.target) && (r.selfClick = !0);
      }, this.focus(), He.on("overlay-click", this.overlayEventListener), this.$emit("show"), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    onLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.unbindDocumentKeyDownListener(), He.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null, this.$emit("hide");
    },
    onAfterLeave: function(i) {
      this.autoZIndex && rt.clear(i);
    },
    alignOverlay: function() {
      W.absolutePosition(this.container, this.target, !1);
      var i = W.getOffset(this.container), r = W.getOffset(this.target), v = 0;
      i.left < r.left && (v = r.left - i.left), this.container.style.setProperty("--overlayArrowLeft", "".concat(v, "px")), i.top < r.top && (this.container.setAttribute("data-p-overlaypanel-flipped", "true"), !this.isUnstyled && W.addClass(this.container, "p-overlaypanel-flipped"));
    },
    onContentKeydown: function(i) {
      i.code === "Escape" && this.closeOnEscape && (this.hide(), W.focus(this.target));
    },
    onButtonKeydown: function(i) {
      switch (i.code) {
        case "ArrowDown":
        case "ArrowUp":
        case "ArrowLeft":
        case "ArrowRight":
          i.preventDefault();
      }
    },
    focus: function() {
      var i = this.container.querySelector("[autofocus]");
      i && i.focus();
    },
    onKeyDown: function(i) {
      i.code === "Escape" && this.closeOnEscape && (this.visible = !1);
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    bindOutsideClickListener: function() {
      var i = this;
      !this.outsideClickListener && W.isClient() && (this.outsideClickListener = function(r) {
        i.visible && !i.selfClick && !i.isTargetClicked(r) && (i.visible = !1), i.selfClick = !1;
      }, document.addEventListener("click", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener), this.outsideClickListener = null, this.selfClick = !1);
    },
    bindScrollListener: function() {
      var i = this;
      this.scrollHandler || (this.scrollHandler = new On(this.target, function() {
        i.visible && (i.visible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var i = this;
      this.resizeListener || (this.resizeListener = function() {
        i.visible && !W.isTouchDevice() && (i.visible = !1);
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    isTargetClicked: function(i) {
      return this.eventTarget && (this.eventTarget === i.target || this.eventTarget.contains(i.target));
    },
    containerRef: function(i) {
      this.container = i;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var i;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", W.setAttribute(this.styleElement, "nonce", (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.csp) === null || i === void 0 ? void 0 : i.nonce), document.head.appendChild(this.styleElement);
        var r = "";
        for (var v in this.breakpoints)
          r += `
                        @media screen and (max-width: `.concat(v, `) {
                            .p-overlaypanel[`).concat(this.attributeSelector, `] {
                                width: `).concat(this.breakpoints[v], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = r;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    onOverlayClick: function(i) {
      He.emit("overlay-click", {
        originalEvent: i,
        target: this.target
      });
    }
  },
  computed: {
    attributeSelector: function() {
      return jn();
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    }
  },
  directives: {
    focustrap: Xn,
    ripple: Dn
  },
  components: {
    Portal: Wn,
    TimesIcon: Jn
  }
}, hi = ["aria-modal"], yi = ["aria-label"];
function gi(s, i, r, v, m, a) {
  var b = dt("Portal"), x = jt("ripple"), _ = jt("focustrap");
  return d(), oe(b, {
    appendTo: s.appendTo
  }, {
    default: E(function() {
      return [g(Fn, B({
        name: "p-overlaypanel",
        onEnter: a.onEnter,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave
      }, s.ptm("transition")), {
        default: E(function() {
          return [m.visible ? Ot((d(), k("div", B({
            key: 0,
            ref: a.containerRef,
            role: "dialog",
            "aria-modal": m.visible,
            onClick: i[5] || (i[5] = function() {
              return a.onOverlayClick && a.onOverlayClick.apply(a, arguments);
            }),
            class: s.cx("root")
          }, s.ptmi("root")), [s.$slots.container ? U(s.$slots, "container", {
            key: 0,
            onClose: a.hide,
            onKeydown: function(le) {
              return a.onButtonKeydown(le);
            },
            closeCallback: a.hide,
            keydownCallback: function(le) {
              return a.onButtonKeydown(le);
            }
          }) : (d(), k(M, {
            key: 1
          }, [p("div", B({
            class: s.cx("content"),
            onClick: i[0] || (i[0] = function() {
              return a.onContentClick && a.onContentClick.apply(a, arguments);
            }),
            onMousedown: i[1] || (i[1] = function() {
              return a.onContentClick && a.onContentClick.apply(a, arguments);
            }),
            onKeydown: i[2] || (i[2] = function() {
              return a.onContentKeydown && a.onContentKeydown.apply(a, arguments);
            })
          }, s.ptm("content")), [U(s.$slots, "default")], 16), s.showCloseIcon ? Ot((d(), k("button", B({
            key: 0,
            class: s.cx("closeButton"),
            "aria-label": a.closeAriaLabel,
            type: "button",
            autofocus: "",
            onClick: i[3] || (i[3] = function() {
              return a.hide && a.hide.apply(a, arguments);
            }),
            onKeydown: i[4] || (i[4] = function() {
              return a.onButtonKeydown && a.onButtonKeydown.apply(a, arguments);
            })
          }, s.ptm("closeButton")), [U(s.$slots, "closeicon", {}, function() {
            return [(d(), oe(ft(s.closeIcon ? "span" : "TimesIcon"), B({
              class: [s.cx("closeIcon"), s.closeIcon]
            }, s.ptm("closeIcon")), null, 16, ["class"]))];
          })], 16, yi)), [[x]]) : P("", !0)], 64))], 16, hi)), [[_]]) : P("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Ht.render = gi;
const ki = { class: "pick-panel-rows" }, bi = {
  key: 0,
  class: "pick-panel-empty"
}, wi = ["onClick"], Ci = { class: "pick-panel-label" }, Li = {
  key: 0,
  class: "pick-panel-sublabel"
}, Si = {
  __name: "PickPanel",
  setup(s, { expose: i }) {
    const r = y(null), v = y(""), m = y([]), a = y((D) => String(D)), b = y(null), x = y(null), _ = L(() => m.value.length > 6), pe = L(() => {
      const D = v.value.trim().toLowerCase();
      return D ? m.value.filter((w) => {
        const u = a.value(w) || "", K = b.value && b.value(w) || "";
        return `${u} ${K}`.toLowerCase().includes(D);
      }) : m.value;
    });
    function le(D, { items: w, getLabel: u, getSubLabel: K, onPick: T }) {
      m.value = w, a.value = u, b.value = K || null, x.value = T, v.value = "", r.value.toggle(D), ie(() => {
        var H, ae;
        return (ae = (H = r.value.$el) == null ? void 0 : H.querySelector("input")) == null ? void 0 : ae.focus();
      });
    }
    function ye(D) {
      var w;
      (w = x.value) == null || w.call(x, D), r.value.hide();
    }
    return i({ open: le }), (D, w) => (d(), oe(h(Ht), {
      ref_key: "panelRef",
      ref: r,
      class: "pick-panel"
    }, {
      default: E(() => [
        _.value ? (d(), oe(h(Yn), {
          key: 0,
          modelValue: v.value,
          "onUpdate:modelValue": w[0] || (w[0] = (u) => v.value = u),
          placeholder: "Type to filter...",
          class: "pick-panel-filter"
        }, null, 8, ["modelValue"])) : P("", !0),
        p("div", ki, [
          pe.value.length ? P("", !0) : (d(), k("div", bi, "(no matches)")),
          (d(!0), k(M, null, pt(pe.value, (u, K) => (d(), k("div", {
            key: K,
            class: "pick-panel-row",
            onClick: (T) => ye(u)
          }, [
            p("div", Ci, N(a.value(u)), 1),
            b.value && b.value(u) ? (d(), k("div", Li, N(b.value(u)), 1)) : P("", !0)
          ], 8, wi))), 128))
        ])
      ]),
      _: 1
    }, 512));
  }
}, Ii = /* @__PURE__ */ ht(Si, [["__scopeId", "data-v-6120c799"]]), Ei = { class: "sticky-panel" }, _i = {
  __name: "StickyPanel",
  setup(s) {
    return (i, r) => (d(), k("div", Ei, [
      U(i.$slots, "default", {}, void 0, !0)
    ]));
  }
}, $i = /* @__PURE__ */ ht(_i, [["__scopeId", "data-v-2941a6c7"]]);
async function Bt(s, i, r) {
  const v = `${(s || "").trim()}|${(i || "").trim()}|${(r || "").trim()}`, m = new TextEncoder().encode(v), a = await crypto.subtle.digest("SHA-256", m);
  return [...new Uint8Array(a)].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const xi = /^(\d+)_([0-9a-f]+)\.wav$/i;
function Ti(s, i) {
  return `${String(s).padStart(4, "0")}_${i}.wav`;
}
function Ai(s) {
  const i = xi.exec(s);
  return i ? { position: Number(i[1]), hash: i[2].toLowerCase() } : null;
}
function Pi(s, i, r) {
  return s.has(Ti(i, r));
}
function Ri(s, i, r) {
  let v = null, m = -1 / 0;
  for (const a of s) {
    const b = Ai(a);
    if (!b || b.position !== r) continue;
    const x = (i == null ? void 0 : i[a]) ?? 0;
    (v === null || x > m) && (v = a, m = x);
  }
  return v;
}
const Di = { class: "font-row" }, ji = { class: "audio-content-row" }, Oi = ["title"], Fi = ["src"], Ni = {
  key: 0,
  class: "timing-warning"
}, zi = { class: "actions-row" }, Bi = ["checked", "disabled"], Ki = ["data-row-index"], Mi = { class: "malformed-warn-line" }, Ui = ["value", "onInput"], Hi = { class: "line-controls-row" }, Vi = ["title", "onClick"], qi = { class: "dropdown-option-label" }, Ji = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Wi = { class: "dropdown-option-label" }, Xi = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Zi = ["onMouseenter"], Gi = {
  key: 0,
  class: "instruct-desc"
}, Yi = ["value", "onInput", "onPaste"], Qi = { key: 0 }, es = { class: "role-info-key" }, ts = { class: "role-info-value" }, ns = 600, ct = 3e3, is = 1500, ss = 11.5, os = 9, ls = 22, ut = "FL_CosyVoice3.LineEditor.textFontSizePx", as = {
  __name: "LineEditorApp",
  props: {
    folder: { type: String, required: !0 },
    filename: { type: String, required: !0 },
    suffix: { type: String, default: "_speakers.txt" },
    checkedApi: { type: Object, default: null },
    // {isChecked(fname), setChecked(fname, val)}
    revoiceApi: { type: Object, default: null },
    // {revoiceLine({linePosition, speaker, instruct, text}) => Promise}
    onClose: { type: Function, required: !0 }
  },
  setup(s) {
    const i = s;
    function r(t, e) {
      try {
        const n = parseFloat(localStorage.getItem(t));
        return Number.isFinite(n) ? n : e;
      } catch {
        return e;
      }
    }
    function v(t, e) {
      try {
        localStorage.setItem(t, String(e));
      } catch {
      }
    }
    function m(t) {
      const e = t.split("|");
      return e.length !== 3 ? null : { speaker: e[0].trim(), instruct: e[1].trim(), text: e[2].trim() };
    }
    let a = 1;
    function b(t) {
      return { ...t, __key: a++ };
    }
    function x(t) {
      return t.split(`
`).map((e) => e.replace(/\r$/, "")).filter((e) => e.trim()).map((e) => {
        const n = m(e);
        return b(n ? { ...n, raw: e, malformed: !1 } : { raw: e, malformed: !0 });
      });
    }
    function _(t) {
      return t.map((e) => e.malformed ? e.raw : `${e.speaker} | ${e.instruct} | ${e.text}`).join(`
`);
    }
    function pe(t) {
      if (!t) return "rgba(255,255,255,0.15)";
      let e = 0;
      for (let n = 0; n < t.length; n++) e = e * 31 + t.charCodeAt(n) >>> 0;
      return `hsl(${e % 360}, 55%, 55%)`;
    }
    const le = Qn();
    function ye({ title: t = "Confirm", message: e = "", okText: n = "OK", cancelText: o = "Cancel" } = {}) {
      return new Promise((l) => {
        le.require({
          header: t,
          message: e,
          acceptLabel: n,
          rejectLabel: o,
          accept: () => l(!0),
          reject: () => l(!1),
          onHide: () => l(!1)
        });
      });
    }
    const D = y(!0), w = y(i.filename), u = y([]), K = y([]), T = y([]), H = y(null), ae = y([]), _e = y([]), re = y([]), yt = y(""), { cssWidth: Vt, setWidth: qt, presets: Jt } = Zn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), V = y(r(ut, ss)), ce = y(null), ge = y(-1), X = y(!1), Z = y(-1), $e = y(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), R = Me({ checking: !0, best: null, mtime: null, error: null }), q = Me({ visible: !1, top: 0, left: 0, code: null }), xe = y(null), G = Me(/* @__PURE__ */ new Set());
    let ve = null, Je = 0, me = null, ue = null, Y = null, ke = null, be = null, we = null, We = !1, Xe = null, Ce = null;
    const Te = y(null), Ze = y(null), Ae = /* @__PURE__ */ new Map(), Ge = /* @__PURE__ */ new Map(), gt = y(null), kt = L(() => ne(i.folder, w.value)), Pe = L(() => ne(i.folder, "_audio")), Q = L(() => Kn(w.value, i.suffix)), bt = L(() => ne(ne(Pe.value, "lines"), Q.value)), Ye = y(/* @__PURE__ */ new Set()), wt = y({});
    async function Le() {
      try {
        const e = await (await fetch(`${Ft}?path=${encodeURIComponent(bt.value)}`)).json();
        Ye.value = new Set(Array.isArray(e.files) ? e.files : []), wt.value = e.file_mtimes || {};
      } catch {
      }
    }
    const J = L(() => {
      const t = /* @__PURE__ */ new Map();
      let e = 0;
      return u.value.forEach((n, o) => {
        n.malformed || (t.set(o, e), e++);
      }), t;
    });
    function Ct(t) {
      const e = J.value.get(t);
      return e === void 0 ? null : Ri(Ye.value, wt.value, e);
    }
    function Lt(t) {
      const e = T.value.find((n) => n.code === t);
      return e && e.speaker ? e.speaker : t || "";
    }
    const Qe = Me(/* @__PURE__ */ new Map());
    Be(
      [u, T],
      async () => {
        const t = u.value.filter((n) => !n.malformed), e = await Promise.all(
          t.map((n) => Bt(Lt(n.speaker), n.instruct, n.text))
        );
        t.forEach((n, o) => Qe.set(n.__key, e[o]));
      },
      { deep: !0, immediate: !0 }
    );
    function Re(t) {
      return Ct(t) !== null;
    }
    function De(t, e) {
      const n = J.value.get(e);
      if (n === void 0) return !1;
      const o = Qe.get(t.__key);
      return o !== void 0 && Pi(Ye.value, n, o);
    }
    const S = L(() => _e.value.includes(w.value)), et = L(() => {
      const t = [];
      return u.value.forEach((e, n) => {
        e.malformed || t.push(n);
      }), t.length > 0 && t.every((e) => De(u.value[e], e));
    });
    function f(t) {
      yt.value = t;
    }
    function St(t) {
      if (!t) return "";
      const e = T.value.find((l) => l.code === t), n = e && e.speaker ? e.speaker : t, o = String(n).split("#", 1)[0].trim();
      return o ? `${o}.pt` : "";
    }
    function Wt() {
      const t = {};
      return T.value.forEach((e) => {
        const n = String(e.speaker || "").split("#", 1)[0].trim();
        !n || !e.code || (t[n] = t[n] || []).push(e.code);
      }), t;
    }
    async function Xt() {
      if (!H.value)
        return f("No _roles.json found for this project -- can't save"), !1;
      try {
        const e = await (await fetch(`${Ke}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: H.value, content: JSON.stringify({ roles: T.value }, null, 2) })
        })).json();
        return e.error ? (f(`Error saving _roles.json: ${e.error}`), !1) : !0;
      } catch (t) {
        return f(`Error saving _roles.json: ${t}`), !1;
      }
    }
    async function Zt(t) {
      if (!H.value) return;
      const e = Mn(H.value), n = await Un(e, t, i.suffix);
      f(n.message), n.changed.some((o) => o.file === w.value) && (await Rt(), me = null, ue = null, de(), Se());
    }
    function Gt(t, e) {
      if (!Array.isArray(t) || !t.length) return null;
      const n = [];
      return e.forEach((o, l) => {
        o.malformed || n.push(l);
      }), n.length !== t.length ? null : { lines: t, rowIndexMap: n };
    }
    const z = L(() => S.value ? Gt(ce.value, u.value) : null), je = L(() => {
      const t = /* @__PURE__ */ new Map();
      return z.value && z.value.rowIndexMap.forEach((e, n) => t.set(e, n)), t;
    }), Yt = L(() => !!(S.value && ce.value && ce.value.length && !z.value));
    function Oe() {
      Ce && (Ce.pause(), Ce.src = "", Ce = null), Z.value = -1;
    }
    function It(t) {
      Oe();
      const e = bt.value, n = (o) => {
        let l = null;
        for (; o < u.value.length && !(!u.value[o].malformed && (l = Ct(o), l)); )
          o++;
        if (o >= u.value.length || !l) {
          Z.value = -1;
          return;
        }
        Z.value = o;
        const c = new Audio(`${fe}/audio?path=${encodeURIComponent(ne(e, l))}&v=${Date.now()}`);
        Ce = c, c.addEventListener("ended", () => n(o + 1)), c.play().catch((C) => f(`Playback failed: ${C}`));
      };
      n(t);
    }
    function Fe() {
      var o;
      const t = Te.value;
      if (!z.value || !t) {
        ge.value = -1;
        return;
      }
      const e = t.currentTime;
      let n = -1;
      for (let l = 0; l < z.value.lines.length; l++)
        if (e >= z.value.lines[l].start && e < z.value.lines[l].end) {
          n = l;
          break;
        }
      if (n !== ge.value && (ge.value = n, n >= 0 && X.value)) {
        const l = z.value.rowIndexMap[n], c = l !== void 0 ? Ae.get((o = u.value[l]) == null ? void 0 : o.__key) : null;
        c == null || c.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function Se({ silent: t = !1 } = {}) {
      const e = ne(ne(Pe.value, "timing"), `${Q.value}.json`);
      try {
        const o = await (await fetch(`${Ke}/read?path=${encodeURIComponent(e)}`)).json();
        if (!o.exists) {
          ce.value = null, ue = null;
          return;
        }
        if (t && o.mtime === ue) return;
        const l = o.mtime !== ue;
        ue = o.mtime;
        let c;
        try {
          c = JSON.parse(o.content);
        } catch {
          ce.value = null;
          return;
        }
        ce.value = Array.isArray(c.lines) ? c.lines : null, l && Le(), ie(Fe);
      } catch {
      }
    }
    function Qt() {
      We || (We = !0, Y && (clearTimeout(Y), Ne()), ke && clearInterval(ke), be && clearInterval(be), we && clearInterval(we), i.onClose());
    }
    Be(D, (t) => {
      t || Qt();
    });
    function ee() {
      Je = Date.now(), Y && clearTimeout(Y), Y = setTimeout(Ne, ns);
    }
    async function Ne() {
      const t = _(u.value);
      if (t !== ve)
        try {
          const n = await (await fetch(`${Ke}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: kt.value, content: t })
          })).json();
          if (n.error) {
            f(`Save error: ${n.error}`);
            return;
          }
          ve = t, f(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (e) {
          f(`Save failed: ${e}`);
        }
    }
    function Ie(t) {
      t && (t.style.height = "auto", t.style.height = `${t.scrollHeight}px`);
    }
    function Et(t, e) {
      if (!e) {
        Ge.delete(t);
        return;
      }
      Ge.set(t, e.$el ?? e);
    }
    function en() {
      ie(() => Ge.forEach(Ie));
    }
    function tn(t, e) {
      if (!e) {
        Ae.delete(t);
        return;
      }
      Ae.set(t, e);
    }
    async function _t(t) {
      var n;
      xe.value = t, await ie();
      const e = Ae.get(t);
      e == null || e.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = e == null ? void 0 : e.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        xe.value === t && (xe.value = null);
      }, 500);
    }
    async function tt({ deletes: t = [], moves: e = [] } = {}) {
      if (!(!t.length && !e.length))
        try {
          await fetch(`${fe}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: Q.value, deletes: t, moves: e })
          }), await Le();
        } catch {
        }
    }
    async function nn(t, e) {
      const n = u.value[t], o = u.value[e];
      if (!n || !o || n.malformed || o.malformed) return;
      const l = Math.min(t, e), c = Math.max(t, e), C = u.value[l], I = u.value[c];
      if ((C.speaker || "").trim() !== (I.speaker || "").trim() && !await ye({
        title: "Merge lines with different speakers?",
        message: `"${C.speaker}" and "${I.speaker}" are different speakers. Merge anyway? The combined line keeps "${C.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }))
        return;
      const $ = J.value.get(c), j = J.value.size;
      if (C.text = `${C.text} ${I.text}`.trim(), u.value.splice(c, 1), ee(), $ !== void 0) {
        const O = [];
        for (let F = $ + 1; F < j; F++) O.push([F, F - 1]);
        tt({ deletes: [$], moves: O });
      }
    }
    function sn(t, e) {
      !t || t.__flDragAttached || (t.__flDragAttached = !0, t.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const o = t.closest(".fl-line-row");
        Xe = Number(o == null ? void 0 : o.dataset.rowIndex), o == null || o.classList.add("fl-row-dragging");
        const l = (C) => {
          var j;
          (j = Ze.value) == null || j.querySelectorAll(".fl-row-drop-target").forEach((O) => O.classList.remove("fl-row-drop-target"));
          const I = document.elementFromPoint(C.clientX, C.clientY), $ = I && I.closest ? I.closest(".fl-line-row") : null;
          $ && $ !== o && $.classList.add("fl-row-drop-target");
        }, c = (C) => {
          var O;
          document.removeEventListener("pointermove", l), document.removeEventListener("pointerup", c), document.removeEventListener("pointercancel", c);
          const I = document.elementFromPoint(C.clientX, C.clientY), $ = I && I.closest ? I.closest(".fl-line-row") : null, j = Xe;
          if (Xe = null, o == null || o.classList.remove("fl-row-dragging"), (O = Ze.value) == null || O.querySelectorAll(".fl-row-drop-target").forEach((F) => F.classList.remove("fl-row-drop-target")), $ && $ !== o) {
            const F = Number($.dataset.rowIndex);
            Number.isNaN(F) || nn(j, F);
          }
        };
        document.addEventListener("pointermove", l), document.addEventListener("pointerup", c), document.addEventListener("pointercancel", c);
      }));
    }
    function on(t) {
      const e = J.value.get(t), n = J.value.size;
      if (u.value.splice(t, 1), ee(), e !== void 0) {
        const o = [];
        for (let l = e + 1; l < n; l++) o.push([l, l - 1]);
        tt({ deletes: [e], moves: o });
      }
    }
    async function $t(t, e) {
      e && e.trim() && !await ye({
        title: "Delete this line?",
        message: e.length > 200 ? e.slice(0, 200) + "…" : e,
        okText: "Delete",
        cancelText: "Cancel"
      }) || on(t);
    }
    function ln(t) {
      ee();
    }
    function an(t) {
      ee();
    }
    function xt(t, e) {
      Ie(e), ee();
    }
    function rn(t, e, n) {
      n.preventDefault();
      const o = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), l = e.selectionStart, c = e.selectionEnd;
      e.value = e.value.slice(0, l) + o + e.value.slice(c), e.selectionStart = e.selectionEnd = l + o.length, t.text = e.value, xt(t, e);
    }
    function cn(t) {
      const e = T.value.find((o) => o.code === t.speaker), n = St(t.speaker);
      return e ? `Change "${e.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${t.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function Tt(t) {
      const e = K.value.find((n) => (n.text || "").trim() === t.instruct.trim());
      return e && e.note ? e.note : null;
    }
    function At(t) {
      return [t.name, t.speaker, t.description].filter(Boolean).join(" -- ");
    }
    function un(t, e) {
      const n = T.value.find((l) => l.code === e.speaker);
      if (!n) return;
      if (!ae.value.length) {
        f("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
        return;
      }
      const o = Wt();
      gt.value.open(t, {
        items: ae.value,
        getLabel: (l) => l,
        getSubLabel: (l) => {
          const c = o[l] || [];
          return c.length ? `used by: ${c.join(", ")} -- ${c.length} role(s)` : "not used by any role yet";
        },
        onPick: async (l) => {
          n.speaker = l, await Xt() && (f(`"${n.code}" now uses "${l}" for the whole play`), await Zt(n.code));
        }
      });
    }
    function dn(t, e) {
      const n = t.getBoundingClientRect();
      q.left = Math.min(n.left, window.innerWidth - 280), q.top = n.bottom + 4, q.code = e, q.visible = !0;
    }
    function fn() {
      q.visible = !1;
    }
    const nt = L(() => {
      const t = q.code;
      if (!t) return { message: "No speaker set on this line yet" };
      const e = T.value.find((o) => o.code === t);
      if (!e) return { message: `"${t}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(e).filter(([, o]) => o !== "" && o !== null && o !== void 0 && o !== e.__key);
      return n.length ? { fields: n } : { message: `"${t}" has no fields set in _roles.json` };
    });
    function pn(t, e) {
      return G.has(t) ? "Re-voicing..." : Re(e) && !De(t, e) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : De(t, e) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function vn(t, e) {
      if (!G.has(t)) {
        G.add(t), f("Re-voicing...");
        try {
          const n = await Bt(Lt(t.speaker), t.instruct, t.text);
          await i.revoiceApi.revoiceLine({
            linePosition: J.value.get(e),
            speaker: t.speaker,
            instruct: t.instruct,
            text: t.text,
            contentHash: n,
            file: w.value,
            folder: i.folder,
            baseName: Q.value
          }), f("Line re-voiced"), await Le();
        } catch (n) {
          f(`Re-voice failed: ${n.message || n}`);
        } finally {
          G.delete(t), Ne();
        }
      }
    }
    function Pt(t) {
      return S.value ? ge.value === je.value.get(t) && X.value : Z.value === t;
    }
    function it(t, e) {
      return S.value ? je.value.get(t) !== void 0 : Re(t);
    }
    function mn(t, e) {
      if (it(e))
        if (S.value) {
          const n = je.value.get(e), o = Te.value;
          if (n === void 0 || !o || !z.value) return;
          o.currentTime = z.value.lines[n].start, o.play();
        } else Z.value === e ? Oe() : It(e);
    }
    const st = L(() => S.value ? X.value : Z.value !== -1), ot = L(() => S.value ? !!R.best : u.value.some((t, e) => !t.malformed && Re(e))), hn = L(() => ot.value ? st.value ? "Pause" : S.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
    function yn() {
      if (ot.value)
        if (S.value) {
          const t = Te.value;
          if (!t) return;
          X.value ? t.pause() : t.play();
        } else Z.value !== -1 ? Oe() : It(0);
    }
    async function de({ silent: t = !1 } = {}) {
      t || (R.checking = !0);
      try {
        const n = await (await fetch(`${Ft}?path=${encodeURIComponent(Pe.value)}`)).json(), o = Array.isArray(n.files) ? n.files : [], l = n.file_mtimes || {}, c = Q.value.toLowerCase(), C = o.filter((j) => {
          const O = j.lastIndexOf(".");
          return (O > 0 ? j.slice(0, O) : j).toLowerCase().startsWith(c);
        });
        C.sort();
        const I = C.length ? C[C.length - 1] : null, $ = I ? `${I}::${l[I] || ""}` : null;
        if (t && $ === me) return;
        me = $, R.checking = !1, R.error = null, R.best = I, R.mtime = I ? l[I] || Date.now() : null, I || (X.value = !1, ie(Fe));
      } catch (e) {
        R.checking = !1, R.error = String(e);
      }
    }
    const gn = L(() => !R.best || S.value);
    async function kn() {
      if (!(!R.best || S.value || !await ye({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${Q.value}" (currently: ${R.best}).`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${fe}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: Q.value, filename: w.value })
          })).json();
          if (n.error) {
            f(`Error: ${n.error}`);
            return;
          }
          f(`Deleted ${n.deleted.length} audio file(s)`), me = null, de();
        } catch (e) {
          f(`Error: ${e}`);
        }
    }
    function bn(t) {
      var e;
      (e = i.checkedApi) == null || e.setChecked(w.value, t);
    }
    const wn = L(() => !S.value && !et.value), Cn = L(() => S.value ? "Marked ready to release -- click to unmark and go back to editing" : et.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function Ln() {
      var e;
      const t = !S.value;
      if (t && !et.value) {
        f("Every line needs to be voiced before marking done");
        return;
      }
      if (t) {
        f("Stitching final file...");
        const n = u.value.filter((o) => !o.malformed);
        try {
          const l = await (await fetch(`${fe}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: i.folder,
              base_name: Q.value,
              // Each position's own current hash -- lets stitch_lines
              // read the EXACT file that content hashes to, no
              // directory-scan guessing (see nodes/_line_audio.py's
              // expected_path).
              line_hashes: n.map((c) => Qe.get(c.__key)),
              line_texts: n.map((c) => c.text)
            })
          })).json();
          if (l.error) {
            f(`Stitch error: ${l.error}`);
            return;
          }
        } catch (o) {
          f(`Stitch failed: ${o}`);
          return;
        }
      }
      try {
        const o = await (await fetch(`${fe}/set_ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: i.folder, filename: w.value, ready: t })
        })).json();
        if (o.error) {
          f(`Error: ${o.error}`);
          return;
        }
        _e.value = o.ready_scripts || [], t && ((e = i.checkedApi) == null || e.setChecked(w.value, !1), $e.value = !1), f(t ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again"), t && (me = null, ue = null, de(), Se());
      } catch (n) {
        f(`Error: ${n}`);
      }
    }
    function Sn() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" && t.tagName !== "INPUT") {
        f("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const e = t.selectionStart;
      t.value = t.value.slice(0, e) + "́" + t.value.slice(e), t.selectionStart = t.selectionEnd = e + 1, t.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function In() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" || !t.classList.contains("fl-textarea")) {
        f("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const e = t.closest(".fl-line-row"), n = e ? Number(e.dataset.rowIndex) : -1, o = n >= 0 ? u.value[n] : null;
      if (!o || o.malformed) {
        f("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const l = J.value.get(n), c = J.value.size, C = t.selectionStart, I = o.text.slice(0, C).trimEnd(), $ = o.text.slice(C).trimStart();
      o.text = I;
      const j = b({ speaker: o.speaker, instruct: o.instruct, text: $, raw: "", malformed: !1 });
      if (u.value.splice(n + 1, 0, j), _t(j.__key), ee(), l !== void 0) {
        const O = l + 1, F = [];
        for (let ze = c - 1; ze >= O; ze--) F.push([ze, ze + 1]);
        tt({ moves: F });
      }
    }
    function En() {
      const t = b({ speaker: "", instruct: "", text: "", raw: "", malformed: !1 });
      u.value.push(t), _t(t.__key), ee();
    }
    const te = L(() => re.value.indexOf(w.value)), _n = L(() => !(te.value > 0)), $n = L(() => !(te.value >= 0 && te.value < re.value.length - 1));
    function xn() {
      te.value > 0 && Dt(re.value[te.value - 1]);
    }
    function Tn() {
      te.value >= 0 && te.value < re.value.length - 1 && Dt(re.value[te.value + 1]);
    }
    async function An() {
      try {
        const e = await (await fetch(Bn)).json();
        ae.value = e.presets || [];
      } catch {
        ae.value = [];
      }
    }
    async function Rt() {
      var t, e, n;
      try {
        const o = `${fe}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, c = await (await fetch(o)).json();
        K.value = ((t = c.instructions) == null ? void 0 : t.entries) || [], T.value = ((e = c.roles) == null ? void 0 : e.entries) || [], H.value = ((n = c.roles) == null ? void 0 : n.path) || null, re.value = Array.isArray(c.scripts) ? c.scripts : [], _e.value = Array.isArray(c.ready_scripts) ? c.ready_scripts : [];
      } catch {
        K.value = [], T.value = [], H.value = null, re.value = [], _e.value = [];
      }
    }
    async function Dt(t) {
      !t || t === w.value || We || (Y && (clearTimeout(Y), Y = null, await Ne()), w.value = t, me = null, ce.value = null, ue = null, u.value = [], ve = null, Je = 0, $e.value = i.checkedApi ? i.checkedApi.isChecked(t) : !1, f("Loading..."), await lt(), de(), Se());
    }
    async function lt({ isPoll: t = !1 } = {}) {
      try {
        const n = await (await fetch(`${Ke}/read?path=${encodeURIComponent(kt.value)}`)).json();
        if (n.error) {
          f(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          t || (u.value = [], ve = "", f("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (t && Date.now() - Je < is || n.content === ve) return;
        u.value = x(n.content), ve = n.content, t || f(`Loaded ${u.value.length} line(s)`);
      } catch (e) {
        f(`Read failed: ${e}`);
      }
    }
    return Be(z, () => ie(Fe)), Be(V, en), Nn(() => {
      Rt(), An(), de(), Le(), be = setInterval(() => {
        de({ silent: !0 }), Le();
      }, ct), lt().then(() => {
        ke = setInterval(() => lt({ isPoll: !0 }), ct), Se(), we = setInterval(() => Se({ silent: !0 }), ct);
      });
    }), zn(() => {
      Oe(), ke && clearInterval(ke), be && clearInterval(be), we && clearInterval(we);
    }), (t, e) => (d(), k(M, null, [
      g(h(Kt), {
        visible: D.value,
        "onUpdate:visible": e[9] || (e[9] = (n) => D.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: Ee({ width: h(Vt) }),
        class: "line-editor-dialog"
      }, {
        header: E(() => [
          g(Gn, {
            title: w.value,
            status: yt.value,
            "width-presets": h(Jt),
            "set-width": h(qt)
          }, {
            after: E(() => [
              p("div", Di, [
                g(h(A), {
                  label: "A−",
                  text: "",
                  size: "small",
                  title: "Decrease line text font size",
                  onClick: e[0] || (e[0] = (n) => {
                    V.value = Math.max(os, V.value - 1), v(ut, V.value);
                  })
                }),
                g(h(A), {
                  label: "A+",
                  text: "",
                  size: "small",
                  title: "Increase line text font size",
                  onClick: e[1] || (e[1] = (n) => {
                    V.value = Math.min(ls, V.value + 1), v(ut, V.value);
                  })
                })
              ])
            ]),
            _: 1
          }, 8, ["title", "status", "width-presets", "set-width"])
        ]),
        default: E(() => [
          g($i, { class: "line-editor-controls" }, {
            default: E(() => [
              p("div", ji, [
                p("span", {
                  class: se(["play-btn global-play-btn", { "is-playing": st.value, disabled: !ot.value }]),
                  title: hn.value,
                  onClick: yn
                }, N(st.value ? "⏸" : "▶"), 11, Oi),
                R.best ? (d(), k(M, { key: 0 }, [
                  p("audio", {
                    ref_key: "audioElRef",
                    ref: Te,
                    controls: "",
                    class: "audio-el",
                    src: `${h(fe)}/audio?path=${encodeURIComponent(h(ne)(Pe.value, R.best))}&v=${encodeURIComponent(R.mtime || "")}`,
                    onTimeupdate: Fe,
                    onPlay: e[2] || (e[2] = (n) => X.value = !0),
                    onPause: e[3] || (e[3] = (n) => X.value = !1),
                    onEnded: e[4] || (e[4] = (n) => X.value = !1)
                  }, null, 40, Fi),
                  g(h(A), {
                    label: "Delete audio",
                    text: "",
                    size: "small",
                    disabled: gn.value,
                    title: S.value ? "Marked ready to release -- unmark it (Done) before deleting audio" : "Delete the rendered audio for this script",
                    onClick: kn,
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title"])
                ], 64)) : P("", !0),
                g(h(A), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: e[5] || (e[5] = (n) => de())
                })
              ]),
              Yt.value ? (d(), k("div", Ni, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : P("", !0),
              p("div", zi, [
                p("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: $e.value,
                  disabled: !s.checkedApi || S.value,
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: e[6] || (e[6] = (n) => {
                    $e.value = n.target.checked, bn(n.target.checked);
                  })
                }, null, 40, Bi),
                g(h(A), {
                  label: S.value ? "Done ✓" : "Done",
                  size: "small",
                  outlined: !S.value,
                  disabled: wn.value,
                  title: Cn.value,
                  onClick: Ln
                }, null, 8, ["label", "outlined", "disabled", "title"]),
                e[10] || (e[10] = p("div", { class: "actions-divider" }, null, -1)),
                g(h(A), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: Ue(Sn, ["prevent"])
                }),
                g(h(A), {
                  label: "✂ Split line",
                  text: "",
                  size: "small",
                  title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
                  onMousedown: Ue(In, ["prevent"])
                }),
                g(h(A), {
                  label: "+ Add line",
                  text: "",
                  size: "small",
                  title: "Add a new empty line at the end of the script",
                  onClick: En
                }),
                e[11] || (e[11] = p("div", { class: "actions-divider" }, null, -1)),
                g(h(A), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: _n.value,
                  title: "Open the previous script in this act",
                  onClick: xn
                }, null, 8, ["disabled"]),
                g(h(A), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: $n.value,
                  title: "Open the next script in this act",
                  onClick: Tn
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          p("div", {
            ref_key: "rowsContainerEl",
            ref: Ze,
            class: "rows-container"
          }, [
            (d(!0), k(M, null, pt(u.value, (n, o) => (d(), k("div", {
              key: n.__key,
              class: se(["fl-line-row", { "row-enter": xe.value === n.__key, "row-playing": S.value ? je.value.get(o) === ge.value : Z.value === o }]),
              "data-row-index": o,
              ref_for: !0,
              ref: (l) => tn(n.__key, l),
              style: Ee(n.malformed ? {} : { borderLeftColor: pe(n.speaker) })
            }, [
              n.malformed ? (d(), k(M, { key: 0 }, [
                p("div", Mi, [
                  e[12] || (e[12] = p("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  g(h(A), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => $t(o, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                p("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: Ee({ fontSize: `${V.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    Et(n.__key, l), ie(() => Ie(l));
                  },
                  onInput: (l) => {
                    n.raw = l.target.value, Ie(l.target), ee();
                  },
                  onKeydown: e[7] || (e[7] = Nt(Ue(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, Ui)
              ], 64)) : (d(), k(M, { key: 1 }, [
                p("div", Hi, [
                  p("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (l) => sn(l, o)
                  }, "⠿", 512),
                  p("span", {
                    class: se(["play-btn", { "is-playing": Pt(o), disabled: !it(o, n) }]),
                    title: it(o, n) ? S.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                    onClick: (l) => mn(n, o)
                  }, N(Pt(o) ? "⏸" : "▶"), 11, Vi),
                  g(h(vt), { class: "speaker-group" }, {
                    default: E(() => [
                      g(h(mt), null, {
                        default: E(() => [...e[13] || (e[13] = [
                          p("i", { class: "pi pi-address-book" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      g(h(zt), {
                        "model-value": n.speaker,
                        options: T.value,
                        "option-label": "code",
                        "option-value": "code",
                        editable: "",
                        filter: "",
                        placeholder: "Speaker",
                        title: "Speaker (role code, or a literal preset/preset#tag)",
                        "onUpdate:modelValue": (l) => {
                          n.speaker = l, ln(n);
                        }
                      }, {
                        option: E(({ option: l }) => [
                          p("div", qi, N(l.code), 1),
                          At(l) ? (d(), k("div", Ji, N(At(l)), 1)) : P("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  g(h(vt), { class: "instruct-group" }, {
                    default: E(() => [
                      g(h(mt), null, {
                        default: E(() => [...e[14] || (e[14] = [
                          p("i", { class: "pi pi-book" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      g(h(zt), {
                        "model-value": n.instruct,
                        options: K.value,
                        "option-label": "text",
                        "option-value": "text",
                        editable: "",
                        filter: "",
                        placeholder: "Instruct",
                        title: "Instruct text",
                        "onUpdate:modelValue": (l) => {
                          n.instruct = l, an(n);
                        }
                      }, {
                        option: E(({ option: l }) => [
                          p("div", Wi, N(l.text), 1),
                          l.note ? (d(), k("div", Xi, N(l.note), 1)) : P("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  s.revoiceApi && !S.value ? (d(), oe(h(A), {
                    key: 0,
                    class: se(["revoice-btn", { pending: G.has(n), stale: !G.has(n) && Re(o) && !De(n, o) }]),
                    text: "",
                    size: "small",
                    icon: G.has(n) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                    disabled: G.has(n),
                    title: pn(n, o),
                    onClick: (l) => vn(n, o)
                  }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : P("", !0),
                  g(h(A), {
                    class: "speaker-file-btn",
                    text: "",
                    size: "small",
                    label: St(n.speaker) || "(no speaker)",
                    disabled: !T.value.find((l) => l.code === n.speaker),
                    title: cn(n),
                    onClick: (l) => un(l, n)
                  }, null, 8, ["label", "disabled", "title", "onClick"]),
                  p("span", {
                    class: "role-info-btn",
                    onMouseenter: (l) => dn(l.target, n.speaker),
                    onMouseleave: fn
                  }, "ℹ", 40, Zi),
                  e[15] || (e[15] = p("div", { class: "spacer" }, null, -1)),
                  g(h(A), {
                    icon: "pi pi-times",
                    color: "red",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => $t(o, n.text)
                  }, null, 8, ["onClick"])
                ]),
                Tt(n) ? (d(), k("div", Gi, "↳ " + N(Tt(n)), 1)) : P("", !0),
                p("textarea", {
                  class: "fl-textarea",
                  style: Ee({ fontSize: `${V.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    Et(n.__key, l), ie(() => Ie(l));
                  },
                  onInput: (l) => {
                    n.text = l.target.value, xt(n, l.target);
                  },
                  onKeydown: e[8] || (e[8] = Nt(Ue(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (l) => rn(n, l.target, l)
                }, null, 44, Yi)
              ], 64))
            ], 14, Ki))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      g(Ii, {
        ref_key: "pickPanelRef",
        ref: gt
      }, null, 512),
      g(h(Ut)),
      q.visible ? (d(), k("div", {
        key: 0,
        class: "role-info-popover",
        style: Ee({ left: `${q.left}px`, top: `${q.top}px` })
      }, [
        nt.value.message ? (d(), k("div", Qi, N(nt.value.message), 1)) : P("", !0),
        (d(!0), k(M, null, pt(nt.value.fields, ([n, o]) => (d(), k("div", {
          key: n,
          class: "role-info-row"
        }, [
          p("span", es, N(n), 1),
          p("span", ts, N(o), 1)
        ]))), 128))
      ], 4)) : P("", !0)
    ], 64));
  }
}, rs = /* @__PURE__ */ ht(as, [["__scopeId", "data-v-f9be48c5"]]);
function ps({ folder: s, filename: i, suffix: r = "_speakers.txt", checkedApi: v, revoiceApi: m }) {
  Hn(import.meta.url);
  const a = document.createElement("div");
  document.body.appendChild(a);
  const b = Vn(rs, {
    folder: s,
    filename: i,
    suffix: r,
    checkedApi: v || null,
    revoiceApi: m || null,
    onClose: () => {
      b.unmount(), a.remove();
    }
  });
  b.use(qn, { ripple: !0 }), b.use(ei), b.mount(a);
}
export {
  ps as openLineEditor
};
