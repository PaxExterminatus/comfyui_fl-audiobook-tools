import { v as xn, x as Pn, y as Ve, z as qe, b as d, i as m, A as U, C as z, D as ut, c as fe, E as lt, a as _, e as g, k as ie, d as v, F as K, G as dt, h as R, t as $, s as P, R as Rn, U as Dn, H as J, I as jn, Z as at, J as Rt, T as On, K as Dt, _ as mt, u as y, j as ft, L as ne, l as L, r as k, w as ze, o as Nn, M as Fn, n as _e, S as de, N as Bn, B as jt, O as Me, m as te, Q as Ke, V as zn, W as Ue, f as Ot, X as Mn, Y as Kn, p as Un, q as Hn, P as Vn } from "./styles_link.js";
import { s as Ft, a as qn, b as Jn, F as Wn, u as Xn } from "./PanelWidthButtons.js";
import { O as He, s as Nt, D as Zn } from "./DialogHeader.js";
import { s as Gn } from "./inputtext.esm.js";
var he = xn(), Bt = Symbol();
function Yn() {
  var s = Pn(Bt);
  if (!s)
    throw new Error("No PrimeVue Confirmation provided!");
  return s;
}
var Qn = {
  install: function(i) {
    var r = {
      require: function(h) {
        he.emit("confirm", h);
      },
      close: function() {
        he.emit("close");
      }
    };
    i.config.globalProperties.$confirm = r, i.provide(Bt, r);
  }
}, ei = {
  root: "p-inputgroup"
}, ti = Ve.extend({
  name: "inputgroup",
  classes: ei
}), ni = {
  name: "BaseInputGroup",
  extends: qe,
  style: ti,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, pt = {
  name: "InputGroup",
  extends: ni,
  inheritAttrs: !1
};
function ii(s, i, r, f, h, a) {
  return d(), m("div", z({
    class: s.cx("root")
  }, s.ptmi("root")), [U(s.$slots, "default")], 16);
}
pt.render = ii;
var si = {
  root: "p-inputgroup-addon"
}, oi = Ve.extend({
  name: "inputgroupaddon",
  classes: si
}), li = {
  name: "BaseInputGroupAddon",
  extends: qe,
  style: oi,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, vt = {
  name: "InputGroupAddon",
  extends: li,
  inheritAttrs: !1
};
function ai(s, i, r, f, h, a) {
  return d(), m("div", z({
    class: s.cx("root")
  }, s.ptmi("root")), [U(s.$slots, "default")], 16);
}
vt.render = ai;
var ri = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var r = i.instance;
    return ["p-confirm-dialog-reject", r.confirmation && !r.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, ci = Ve.extend({
  name: "confirmdialog",
  classes: ri
}), ui = {
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
  style: ci,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, zt = {
  name: "ConfirmDialog",
  extends: ui,
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
    CDialog: Ft,
    CDButton: P
  }
};
function di(s, i, r, f, h, a) {
  var S = ut("CDButton"), F = ut("CDialog");
  return d(), fe(F, {
    visible: h.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(T) {
      return h.visible = T;
    }), a.onHide],
    role: "alertdialog",
    class: ie(s.cx("root")),
    modal: !0,
    header: a.header,
    blockScroll: a.blockScroll,
    position: a.position,
    breakpoints: s.breakpoints,
    closeOnEscape: a.closeOnEscape,
    draggable: s.draggable,
    pt: s.pt,
    unstyled: s.unstyled
  }, lt({
    default: _(function() {
      return [s.$slots.container ? R("", !0) : (d(), m(K, {
        key: 0
      }, [s.$slots.message ? (d(), fe(dt(s.$slots.message), {
        key: 1,
        message: h.confirmation
      }, null, 8, ["message"])) : (d(), m(K, {
        key: 0
      }, [U(s.$slots, "icon", {}, function() {
        return [s.$slots.icon ? (d(), fe(dt(s.$slots.icon), {
          key: 0,
          class: ie(s.cx("icon"))
        }, null, 8, ["class"])) : h.confirmation.icon ? (d(), m("span", z({
          key: 1,
          class: [h.confirmation.icon, s.cx("icon")]
        }, s.ptm("icon")), null, 16)) : R("", !0)];
      }), v("span", z({
        class: s.cx("message")
      }, s.ptm("message")), $(a.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [s.$slots.container ? {
    name: "container",
    fn: _(function(T) {
      return [U(s.$slots, "container", {
        message: h.confirmation,
        onClose: T.onClose,
        onAccept: a.accept,
        onReject: a.reject,
        closeCallback: T.onclose,
        acceptCallback: a.accept,
        rejectCallback: a.reject
      })];
    }),
    key: "0"
  } : void 0, s.$slots.container ? void 0 : {
    name: "footer",
    fn: _(function() {
      return [g(S, {
        label: a.rejectLabel,
        class: ie([s.cx("rejectButton"), h.confirmation.rejectClass]),
        onClick: i[0] || (i[0] = function(T) {
          return a.reject();
        }),
        autofocus: a.autoFocusReject,
        unstyled: s.unstyled,
        pt: s.ptm("rejectButton")
      }, lt({
        _: 2
      }, [a.rejectIcon || s.$slots.rejecticon ? {
        name: "icon",
        fn: _(function(T) {
          return [U(s.$slots, "rejecticon", {}, function() {
            return [v("span", z({
              class: [a.rejectIcon, T.class]
            }, s.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), g(S, {
        label: a.acceptLabel,
        class: ie([s.cx("acceptButton"), h.confirmation.acceptClass]),
        onClick: i[1] || (i[1] = function(T) {
          return a.accept();
        }),
        autofocus: a.autoFocusAccept,
        unstyled: s.unstyled,
        pt: s.ptm("acceptButton")
      }, lt({
        _: 2
      }, [a.acceptIcon || s.$slots.accepticon ? {
        name: "icon",
        fn: _(function(T) {
          return [U(s.$slots, "accepticon", {}, function() {
            return [v("span", z({
              class: [a.acceptIcon, T.class]
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
zt.render = di;
var fi = {
  root: function(i) {
    var r = i.instance;
    return ["p-overlaypanel p-component", {
      "p-ripple-disabled": r.$primevue.config.ripple === !1
    }];
  },
  content: "p-overlaypanel-content",
  closeButton: "p-overlaypanel-close p-link",
  closeIcon: "p-overlaypanel-close-icon"
}, pi = Ve.extend({
  name: "overlaypanel",
  classes: fi
}), vi = {
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
  style: pi,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Mt = {
  name: "OverlayPanel",
  extends: vi,
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
    this.dismissable && this.unbindOutsideClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.destroyStyle(), this.unbindResizeListener(), this.target = null, this.container && this.autoZIndex && at.clear(this.container), this.overlayEventListener && (He.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null), this.container = null;
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
      this.container.setAttribute(this.attributeSelector, ""), J.addStyles(i, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.dismissable && this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && at.set("overlay", i, this.baseZIndex + this.$primevue.config.zIndex.overlay), this.overlayEventListener = function(f) {
        r.container.contains(f.target) && (r.selfClick = !0);
      }, this.focus(), He.on("overlay-click", this.overlayEventListener), this.$emit("show"), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    onLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.unbindDocumentKeyDownListener(), He.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null, this.$emit("hide");
    },
    onAfterLeave: function(i) {
      this.autoZIndex && at.clear(i);
    },
    alignOverlay: function() {
      J.absolutePosition(this.container, this.target, !1);
      var i = J.getOffset(this.container), r = J.getOffset(this.target), f = 0;
      i.left < r.left && (f = r.left - i.left), this.container.style.setProperty("--overlayArrowLeft", "".concat(f, "px")), i.top < r.top && (this.container.setAttribute("data-p-overlaypanel-flipped", "true"), !this.isUnstyled && J.addClass(this.container, "p-overlaypanel-flipped"));
    },
    onContentKeydown: function(i) {
      i.code === "Escape" && this.closeOnEscape && (this.hide(), J.focus(this.target));
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
      !this.outsideClickListener && J.isClient() && (this.outsideClickListener = function(r) {
        i.visible && !i.selfClick && !i.isTargetClicked(r) && (i.visible = !1), i.selfClick = !1;
      }, document.addEventListener("click", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener), this.outsideClickListener = null, this.selfClick = !1);
    },
    bindScrollListener: function() {
      var i = this;
      this.scrollHandler || (this.scrollHandler = new jn(this.target, function() {
        i.visible && (i.visible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var i = this;
      this.resizeListener || (this.resizeListener = function() {
        i.visible && !J.isTouchDevice() && (i.visible = !1);
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", J.setAttribute(this.styleElement, "nonce", (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.csp) === null || i === void 0 ? void 0 : i.nonce), document.head.appendChild(this.styleElement);
        var r = "";
        for (var f in this.breakpoints)
          r += `
                        @media screen and (max-width: `.concat(f, `) {
                            .p-overlaypanel[`).concat(this.attributeSelector, `] {
                                width: `).concat(this.breakpoints[f], ` !important;
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
      return Dn();
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    }
  },
  directives: {
    focustrap: Wn,
    ripple: Rn
  },
  components: {
    Portal: Jn,
    TimesIcon: qn
  }
}, mi = ["aria-modal"], hi = ["aria-label"];
function yi(s, i, r, f, h, a) {
  var S = ut("Portal"), F = Rt("ripple"), T = Rt("focustrap");
  return d(), fe(S, {
    appendTo: s.appendTo
  }, {
    default: _(function() {
      return [g(On, z({
        name: "p-overlaypanel",
        onEnter: a.onEnter,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave
      }, s.ptm("transition")), {
        default: _(function() {
          return [h.visible ? Dt((d(), m("div", z({
            key: 0,
            ref: a.containerRef,
            role: "dialog",
            "aria-modal": h.visible,
            onClick: i[5] || (i[5] = function() {
              return a.onOverlayClick && a.onOverlayClick.apply(a, arguments);
            }),
            class: s.cx("root")
          }, s.ptmi("root")), [s.$slots.container ? U(s.$slots, "container", {
            key: 0,
            onClose: a.hide,
            onKeydown: function(se) {
              return a.onButtonKeydown(se);
            },
            closeCallback: a.hide,
            keydownCallback: function(se) {
              return a.onButtonKeydown(se);
            }
          }) : (d(), m(K, {
            key: 1
          }, [v("div", z({
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
          }, s.ptm("content")), [U(s.$slots, "default")], 16), s.showCloseIcon ? Dt((d(), m("button", z({
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
            return [(d(), fe(dt(s.closeIcon ? "span" : "TimesIcon"), z({
              class: [s.cx("closeIcon"), s.closeIcon]
            }, s.ptm("closeIcon")), null, 16, ["class"]))];
          })], 16, hi)), [[F]]) : R("", !0)], 64))], 16, mi)), [[T]]) : R("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Mt.render = yi;
const gi = { class: "pick-panel-rows" }, ki = {
  key: 0,
  class: "pick-panel-empty"
}, bi = ["onClick"], wi = { class: "pick-panel-label" }, Ci = {
  key: 0,
  class: "pick-panel-sublabel"
}, Li = {
  __name: "PickPanel",
  setup(s, { expose: i }) {
    const r = k(null), f = k(""), h = k([]), a = k((D) => String(D)), S = k(null), F = k(null), T = L(() => h.value.length > 6), pe = L(() => {
      const D = f.value.trim().toLowerCase();
      return D ? h.value.filter((b) => {
        const u = a.value(b) || "", M = S.value && S.value(b) || "";
        return `${u} ${M}`.toLowerCase().includes(D);
      }) : h.value;
    });
    function se(D, { items: b, getLabel: u, getSubLabel: M, onPick: x }) {
      h.value = b, a.value = u, S.value = M || null, F.value = x, f.value = "", r.value.toggle(D), ne(() => {
        var H, oe;
        return (oe = (H = r.value.$el) == null ? void 0 : H.querySelector("input")) == null ? void 0 : oe.focus();
      });
    }
    function ye(D) {
      var b;
      (b = F.value) == null || b.call(F, D), r.value.hide();
    }
    return i({ open: se }), (D, b) => (d(), fe(y(Mt), {
      ref_key: "panelRef",
      ref: r,
      class: "pick-panel"
    }, {
      default: _(() => [
        T.value ? (d(), fe(y(Gn), {
          key: 0,
          modelValue: f.value,
          "onUpdate:modelValue": b[0] || (b[0] = (u) => f.value = u),
          placeholder: "Type to filter...",
          class: "pick-panel-filter"
        }, null, 8, ["modelValue"])) : R("", !0),
        v("div", gi, [
          pe.value.length ? R("", !0) : (d(), m("div", ki, "(no matches)")),
          (d(!0), m(K, null, ft(pe.value, (u, M) => (d(), m("div", {
            key: M,
            class: "pick-panel-row",
            onClick: (x) => ye(u)
          }, [
            v("div", wi, $(a.value(u)), 1),
            S.value && S.value(u) ? (d(), m("div", Ci, $(S.value(u)), 1)) : R("", !0)
          ], 8, bi))), 128))
        ])
      ]),
      _: 1
    }, 512));
  }
}, Si = /* @__PURE__ */ mt(Li, [["__scopeId", "data-v-6120c799"]]), Ii = { class: "sticky-panel" }, Ei = {
  __name: "StickyPanel",
  setup(s) {
    return (i, r) => (d(), m("div", Ii, [
      U(i.$slots, "default", {}, void 0, !0)
    ]));
  }
}, _i = /* @__PURE__ */ mt(Ei, [["__scopeId", "data-v-2941a6c7"]]);
async function $i(s, i, r) {
  const f = `${(s || "").trim()}|${(i || "").trim()}|${(r || "").trim()}`, h = new TextEncoder().encode(f), a = await crypto.subtle.digest("SHA-256", h);
  return [...new Uint8Array(a)].map((F) => F.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const Ti = /^(\d+)_(\d+)_([0-9a-f]+)\.wav$/i;
function Ai(s) {
  const i = Ti.exec(s);
  return i ? { position: Number(i[1]), version: Number(i[2]), hash: i[3].toLowerCase() } : null;
}
function xi(s) {
  const i = /* @__PURE__ */ new Map();
  for (const r of s) {
    const f = Ai(r);
    if (!f) continue;
    const h = i.get(f.position);
    (!h || f.version > h.version) && i.set(f.position, { ...f, filename: r });
  }
  return i;
}
const Pi = { class: "font-row" }, Ri = { class: "audio-content-row" }, Di = ["title"], ji = {
  key: 0,
  class: "muted-note"
}, Oi = {
  key: 1,
  class: "muted-note"
}, Ni = { class: "audio-label" }, Fi = ["src"], Bi = {
  key: 3,
  class: "muted-note"
}, zi = {
  key: 0,
  class: "timing-warning"
}, Mi = { class: "actions-row" }, Ki = ["checked", "disabled"], Ui = ["data-row-index"], Hi = { class: "malformed-warn-line" }, Vi = ["value", "onInput"], qi = { class: "line-controls-row" }, Ji = ["title", "onClick"], Wi = { class: "dropdown-option-label" }, Xi = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Zi = { class: "dropdown-option-label" }, Gi = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Yi = ["title", "onClick"], Qi = ["onMouseenter"], es = {
  key: 0,
  class: "instruct-desc"
}, ts = ["value", "onInput", "onPaste"], ns = { key: 0 }, is = { class: "role-info-key" }, ss = { class: "role-info-value" }, os = 600, rt = 3e3, ls = 1500, as = 11.5, rs = 9, cs = 22, ct = "FL_CosyVoice3.LineEditor.textFontSizePx", us = {
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
    function f(t, e) {
      try {
        localStorage.setItem(t, String(e));
      } catch {
      }
    }
    function h(t) {
      const e = t.split("|");
      return e.length !== 3 ? null : { speaker: e[0].trim(), instruct: e[1].trim(), text: e[2].trim() };
    }
    let a = 1;
    function S(t) {
      return { ...t, __key: a++ };
    }
    function F(t) {
      return t.split(`
`).map((e) => e.replace(/\r$/, "")).filter((e) => e.trim()).map((e) => {
        const n = h(e);
        return S(n ? { ...n, raw: e, malformed: !1 } : { raw: e, malformed: !0 });
      });
    }
    function T(t) {
      return t.map((e) => e.malformed ? e.raw : `${e.speaker} | ${e.instruct} | ${e.text}`).join(`
`);
    }
    function pe(t) {
      if (!t) return "rgba(255,255,255,0.15)";
      let e = 0;
      for (let n = 0; n < t.length; n++) e = e * 31 + t.charCodeAt(n) >>> 0;
      return `hsl(${e % 360}, 55%, 55%)`;
    }
    const se = Yn();
    function ye({ title: t = "Confirm", message: e = "", okText: n = "OK", cancelText: o = "Cancel" } = {}) {
      return new Promise((l) => {
        se.require({
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
    const D = k(!0), b = k(i.filename), u = k([]), M = k([]), x = k([]), H = k(null), oe = k([]), $e = k([]), le = k([]), ht = k(""), { cssWidth: Kt, setWidth: Ut, presets: Ht } = Xn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), V = k(r(ct, as)), ae = k(null), ge = k(-1), W = k(!1), X = k(-1), Te = k(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), E = Ke({ checking: !0, best: null, mtime: null, error: null }), q = Ke({ visible: !1, top: 0, left: 0, code: null }), Ae = k(null), re = Ke(/* @__PURE__ */ new Set());
    let ve = null, Je = 0, me = null, ce = null, Z = null, ke = null, be = null, we = null, We = !1, Xe = null, Ce = null;
    const xe = k(null), Ze = k(null), Pe = /* @__PURE__ */ new Map(), Ge = /* @__PURE__ */ new Map(), yt = k(null), gt = L(() => te(i.folder, b.value)), Le = L(() => te(i.folder, "_audio")), G = L(() => zn(b.value, i.suffix)), kt = L(() => te(te(Le.value, "lines"), G.value)), bt = k(/* @__PURE__ */ new Set());
    async function Se() {
      try {
        const e = await (await fetch(`${jt}?path=${encodeURIComponent(kt.value)}`)).json();
        bt.value = new Set(Array.isArray(e.files) ? e.files : []);
      } catch {
      }
    }
    const Vt = L(() => xi(bt.value)), Y = L(() => {
      const t = /* @__PURE__ */ new Map();
      let e = 0;
      return u.value.forEach((n, o) => {
        n.malformed || (t.set(o, e), e++);
      }), t;
    });
    function Ye(t) {
      const e = Y.value.get(t);
      return e === void 0 ? null : Vt.value.get(e) || null;
    }
    function qt(t) {
      const e = x.value.find((n) => n.code === t);
      return e && e.speaker ? e.speaker : t || "";
    }
    const wt = Ke(/* @__PURE__ */ new Map());
    ze(
      [u, x],
      async () => {
        const t = u.value.filter((n) => !n.malformed), e = await Promise.all(
          t.map((n) => $i(qt(n.speaker), n.instruct, n.text))
        );
        t.forEach((n, o) => wt.set(n.__key, e[o]));
      },
      { deep: !0, immediate: !0 }
    );
    function Re(t) {
      return Ye(t) !== null;
    }
    function De(t, e) {
      const n = Ye(e);
      if (!n) return !1;
      const o = wt.get(t.__key);
      return o !== void 0 && n.hash === o;
    }
    const I = L(() => $e.value.includes(b.value)), Qe = L(() => {
      const t = [];
      return u.value.forEach((e, n) => {
        e.malformed || t.push(n);
      }), t.length > 0 && t.every((e) => De(u.value[e], e));
    });
    function p(t) {
      ht.value = t;
    }
    function Ct(t) {
      if (!t) return "";
      const e = x.value.find((l) => l.code === t), n = e && e.speaker ? e.speaker : t, o = String(n).split("#", 1)[0].trim();
      return o ? `${o}.pt` : "";
    }
    function Jt() {
      const t = {};
      return x.value.forEach((e) => {
        const n = String(e.speaker || "").split("#", 1)[0].trim();
        !n || !e.code || (t[n] = t[n] || []).push(e.code);
      }), t;
    }
    async function Wt() {
      if (!H.value)
        return p("No _roles.json found for this project -- can't save"), !1;
      try {
        const e = await (await fetch(`${Me}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: H.value, content: JSON.stringify({ roles: x.value }, null, 2) })
        })).json();
        return e.error ? (p(`Error saving _roles.json: ${e.error}`), !1) : !0;
      } catch (t) {
        return p(`Error saving _roles.json: ${t}`), !1;
      }
    }
    async function Xt(t) {
      if (!H.value) return;
      const e = Mn(H.value), n = await Kn(e, t, i.suffix);
      p(n.message), n.changed.some((o) => o.file === b.value) && (await xt(), me = null, ce = null, ue(), Ie());
    }
    function Zt(t, e) {
      if (!Array.isArray(t) || !t.length) return null;
      const n = [];
      return e.forEach((o, l) => {
        o.malformed || n.push(l);
      }), n.length !== t.length ? null : { lines: t, rowIndexMap: n };
    }
    const B = L(() => I.value ? Zt(ae.value, u.value) : null), je = L(() => {
      const t = /* @__PURE__ */ new Map();
      return B.value && B.value.rowIndexMap.forEach((e, n) => t.set(e, n)), t;
    }), Gt = L(() => !!(I.value && ae.value && ae.value.length && !B.value));
    function Oe() {
      Ce && (Ce.pause(), Ce.src = "", Ce = null), X.value = -1;
    }
    function Lt(t) {
      Oe();
      const e = kt.value, n = (o) => {
        var w;
        let l = null;
        for (; o < u.value.length && !(!u.value[o].malformed && (l = ((w = Ye(o)) == null ? void 0 : w.filename) ?? null, l)); )
          o++;
        if (o >= u.value.length || !l) {
          X.value = -1;
          return;
        }
        X.value = o;
        const c = new Audio(`${de}/audio?path=${encodeURIComponent(te(e, l))}&v=${Date.now()}`);
        Ce = c, c.addEventListener("ended", () => n(o + 1)), c.play().catch((C) => p(`Playback failed: ${C}`));
      };
      n(t);
    }
    function Ne() {
      var o;
      const t = xe.value;
      if (!B.value || !t) {
        ge.value = -1;
        return;
      }
      const e = t.currentTime;
      let n = -1;
      for (let l = 0; l < B.value.lines.length; l++)
        if (e >= B.value.lines[l].start && e < B.value.lines[l].end) {
          n = l;
          break;
        }
      if (n !== ge.value && (ge.value = n, n >= 0 && W.value)) {
        const l = B.value.rowIndexMap[n], c = l !== void 0 ? Pe.get((o = u.value[l]) == null ? void 0 : o.__key) : null;
        c == null || c.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function Ie({ silent: t = !1 } = {}) {
      const e = te(te(Le.value, "timing"), `${G.value}.json`);
      try {
        const o = await (await fetch(`${Me}/read?path=${encodeURIComponent(e)}`)).json();
        if (!o.exists) {
          ae.value = null, ce = null;
          return;
        }
        if (t && o.mtime === ce) return;
        const l = o.mtime !== ce;
        ce = o.mtime;
        let c;
        try {
          c = JSON.parse(o.content);
        } catch {
          ae.value = null;
          return;
        }
        ae.value = Array.isArray(c.lines) ? c.lines : null, l && Se(), ne(Ne);
      } catch {
      }
    }
    function Yt() {
      We || (We = !0, Z && (clearTimeout(Z), Fe()), ke && clearInterval(ke), be && clearInterval(be), we && clearInterval(we), i.onClose());
    }
    ze(D, (t) => {
      t || Yt();
    });
    function Q() {
      Je = Date.now(), Z && clearTimeout(Z), Z = setTimeout(Fe, os);
    }
    async function Fe() {
      const t = T(u.value);
      if (t !== ve)
        try {
          const n = await (await fetch(`${Me}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: gt.value, content: t })
          })).json();
          if (n.error) {
            p(`Save error: ${n.error}`);
            return;
          }
          ve = t, p(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (e) {
          p(`Save failed: ${e}`);
        }
    }
    function Ee(t) {
      t && (t.style.height = "auto", t.style.height = `${t.scrollHeight}px`);
    }
    function St(t, e) {
      if (!e) {
        Ge.delete(t);
        return;
      }
      Ge.set(t, e.$el ?? e);
    }
    function Qt() {
      ne(() => Ge.forEach(Ee));
    }
    function en(t, e) {
      if (!e) {
        Pe.delete(t);
        return;
      }
      Pe.set(t, e);
    }
    async function It(t) {
      var n;
      Ae.value = t, await ne();
      const e = Pe.get(t);
      e == null || e.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = e == null ? void 0 : e.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        Ae.value === t && (Ae.value = null);
      }, 500);
    }
    async function et({ deletes: t = [], moves: e = [] } = {}) {
      if (!(!t.length && !e.length))
        try {
          await fetch(`${de}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: G.value, deletes: t, moves: e })
          }), await Se();
        } catch {
        }
    }
    async function tn(t, e) {
      const n = u.value[t], o = u.value[e];
      if (!n || !o || n.malformed || o.malformed) return;
      const l = Math.min(t, e), c = Math.max(t, e), w = u.value[l], C = u.value[c];
      if ((w.speaker || "").trim() !== (C.speaker || "").trim() && !await ye({
        title: "Merge lines with different speakers?",
        message: `"${w.speaker}" and "${C.speaker}" are different speakers. Merge anyway? The combined line keeps "${w.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }))
        return;
      const A = Y.value.get(c), j = Y.value.size;
      if (w.text = `${w.text} ${C.text}`.trim(), u.value.splice(c, 1), Q(), A !== void 0) {
        const O = [];
        for (let N = A + 1; N < j; N++) O.push([N, N - 1]);
        et({ deletes: [A], moves: O });
      }
    }
    function nn(t, e) {
      !t || t.__flDragAttached || (t.__flDragAttached = !0, t.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const o = t.closest(".fl-line-row");
        Xe = Number(o == null ? void 0 : o.dataset.rowIndex), o == null || o.classList.add("fl-row-dragging");
        const l = (w) => {
          var j;
          (j = Ze.value) == null || j.querySelectorAll(".fl-row-drop-target").forEach((O) => O.classList.remove("fl-row-drop-target"));
          const C = document.elementFromPoint(w.clientX, w.clientY), A = C && C.closest ? C.closest(".fl-line-row") : null;
          A && A !== o && A.classList.add("fl-row-drop-target");
        }, c = (w) => {
          var O;
          document.removeEventListener("pointermove", l), document.removeEventListener("pointerup", c), document.removeEventListener("pointercancel", c);
          const C = document.elementFromPoint(w.clientX, w.clientY), A = C && C.closest ? C.closest(".fl-line-row") : null, j = Xe;
          if (Xe = null, o == null || o.classList.remove("fl-row-dragging"), (O = Ze.value) == null || O.querySelectorAll(".fl-row-drop-target").forEach((N) => N.classList.remove("fl-row-drop-target")), A && A !== o) {
            const N = Number(A.dataset.rowIndex);
            Number.isNaN(N) || tn(j, N);
          }
        };
        document.addEventListener("pointermove", l), document.addEventListener("pointerup", c), document.addEventListener("pointercancel", c);
      }));
    }
    function sn(t) {
      const e = Y.value.get(t), n = Y.value.size;
      if (u.value.splice(t, 1), Q(), e !== void 0) {
        const o = [];
        for (let l = e + 1; l < n; l++) o.push([l, l - 1]);
        et({ deletes: [e], moves: o });
      }
    }
    async function Et(t, e) {
      e && e.trim() && !await ye({
        title: "Delete this line?",
        message: e.length > 200 ? e.slice(0, 200) + "…" : e,
        okText: "Delete",
        cancelText: "Cancel"
      }) || sn(t);
    }
    function on(t) {
      Q();
    }
    function ln(t) {
      Q();
    }
    function _t(t, e) {
      Ee(e), Q();
    }
    function an(t, e, n) {
      n.preventDefault();
      const o = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), l = e.selectionStart, c = e.selectionEnd;
      e.value = e.value.slice(0, l) + o + e.value.slice(c), e.selectionStart = e.selectionEnd = l + o.length, t.text = e.value, _t(t, e);
    }
    function rn(t) {
      const e = x.value.find((o) => o.code === t.speaker), n = Ct(t.speaker);
      return e ? `Change "${e.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${t.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function $t(t) {
      const e = M.value.find((n) => (n.text || "").trim() === t.instruct.trim());
      return e && e.note ? e.note : null;
    }
    function Tt(t) {
      return [t.name, t.speaker, t.description].filter(Boolean).join(" -- ");
    }
    function cn(t, e) {
      const n = x.value.find((l) => l.code === e.speaker);
      if (!n) return;
      if (!oe.value.length) {
        p("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
        return;
      }
      const o = Jt();
      yt.value.open(t, {
        items: oe.value,
        getLabel: (l) => l,
        getSubLabel: (l) => {
          const c = o[l] || [];
          return c.length ? `used by: ${c.join(", ")} -- ${c.length} role(s)` : "not used by any role yet";
        },
        onPick: async (l) => {
          n.speaker = l, await Wt() && (p(`"${n.code}" now uses "${l}" for the whole play`), await Xt(n.code));
        }
      });
    }
    function un(t, e) {
      const n = t.getBoundingClientRect();
      q.left = Math.min(n.left, window.innerWidth - 280), q.top = n.bottom + 4, q.code = e, q.visible = !0;
    }
    function dn() {
      q.visible = !1;
    }
    const tt = L(() => {
      const t = q.code;
      if (!t) return { message: "No speaker set on this line yet" };
      const e = x.value.find((o) => o.code === t);
      if (!e) return { message: `"${t}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(e).filter(([, o]) => o !== "" && o !== null && o !== void 0 && o !== e.__key);
      return n.length ? { fields: n } : { message: `"${t}" has no fields set in _roles.json` };
    });
    function fn(t, e) {
      return re.has(t) ? "Re-voicing..." : Re(e) && !De(t, e) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : De(t, e) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function pn(t, e) {
      if (!re.has(t)) {
        re.add(t), p("Re-voicing...");
        try {
          await i.revoiceApi.revoiceLine({
            linePosition: Y.value.get(e),
            speaker: t.speaker,
            instruct: t.instruct,
            text: t.text,
            file: b.value,
            folder: i.folder,
            baseName: G.value
          }), p("Line re-voiced"), await Se();
        } catch (n) {
          p(`Re-voice failed: ${n.message || n}`);
        } finally {
          re.delete(t), Fe();
        }
      }
    }
    function At(t) {
      return I.value ? ge.value === je.value.get(t) && W.value : X.value === t;
    }
    function nt(t, e) {
      return I.value ? je.value.get(t) !== void 0 : Re(t);
    }
    function vn(t, e) {
      if (nt(e))
        if (I.value) {
          const n = je.value.get(e), o = xe.value;
          if (n === void 0 || !o || !B.value) return;
          o.currentTime = B.value.lines[n].start, o.play();
        } else X.value === e ? Oe() : Lt(e);
    }
    const it = L(() => I.value ? W.value : X.value !== -1), st = L(() => I.value ? !!E.best : u.value.some((t, e) => !t.malformed && Re(e))), mn = L(() => st.value ? it.value ? "Pause" : I.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
    function hn() {
      if (st.value)
        if (I.value) {
          const t = xe.value;
          if (!t) return;
          W.value ? t.pause() : t.play();
        } else X.value !== -1 ? Oe() : Lt(0);
    }
    async function ue({ silent: t = !1 } = {}) {
      t || (E.checking = !0);
      try {
        const n = await (await fetch(`${jt}?path=${encodeURIComponent(Le.value)}`)).json(), o = Array.isArray(n.files) ? n.files : [], l = n.file_mtimes || {}, c = G.value.toLowerCase(), w = o.filter((j) => {
          const O = j.lastIndexOf(".");
          return (O > 0 ? j.slice(0, O) : j).toLowerCase().startsWith(c);
        });
        w.sort();
        const C = w.length ? w[w.length - 1] : null, A = C ? `${C}::${l[C] || ""}` : null;
        if (t && A === me) return;
        me = A, E.checking = !1, E.error = null, E.best = C, E.mtime = C ? l[C] || Date.now() : null, C || (W.value = !1, ne(Ne));
      } catch (e) {
        E.checking = !1, E.error = String(e);
      }
    }
    const yn = L(() => !E.best || I.value);
    async function gn() {
      if (!(!E.best || I.value || !await ye({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${G.value}" (currently: ${E.best}).`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${de}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: G.value, filename: b.value })
          })).json();
          if (n.error) {
            p(`Error: ${n.error}`);
            return;
          }
          p(`Deleted ${n.deleted.length} audio file(s)`), me = null, ue();
        } catch (e) {
          p(`Error: ${e}`);
        }
    }
    function kn(t) {
      var e;
      (e = i.checkedApi) == null || e.setChecked(b.value, t);
    }
    const bn = L(() => !I.value && !Qe.value), wn = L(() => I.value ? "Marked ready to release -- click to unmark and go back to editing" : Qe.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function Cn() {
      var e;
      const t = !I.value;
      if (t && !Qe.value) {
        p("Every line needs to be voiced before marking done");
        return;
      }
      if (t) {
        p("Stitching final file...");
        const n = u.value.filter((o) => !o.malformed);
        try {
          const l = await (await fetch(`${de}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: i.folder,
              base_name: G.value,
              line_count: n.length,
              line_texts: n.map((c) => c.text)
            })
          })).json();
          if (l.error) {
            p(`Stitch error: ${l.error}`);
            return;
          }
        } catch (o) {
          p(`Stitch failed: ${o}`);
          return;
        }
      }
      try {
        const o = await (await fetch(`${de}/set_ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: i.folder, filename: b.value, ready: t })
        })).json();
        if (o.error) {
          p(`Error: ${o.error}`);
          return;
        }
        $e.value = o.ready_scripts || [], t && ((e = i.checkedApi) == null || e.setChecked(b.value, !1), Te.value = !1), p(t ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again"), t && (me = null, ce = null, ue(), Ie());
      } catch (n) {
        p(`Error: ${n}`);
      }
    }
    function Ln() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" && t.tagName !== "INPUT") {
        p("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const e = t.selectionStart;
      t.value = t.value.slice(0, e) + "́" + t.value.slice(e), t.selectionStart = t.selectionEnd = e + 1, t.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function Sn() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" || !t.classList.contains("fl-textarea")) {
        p("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const e = t.closest(".fl-line-row"), n = e ? Number(e.dataset.rowIndex) : -1, o = n >= 0 ? u.value[n] : null;
      if (!o || o.malformed) {
        p("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const l = Y.value.get(n), c = Y.value.size, w = t.selectionStart, C = o.text.slice(0, w).trimEnd(), A = o.text.slice(w).trimStart();
      o.text = C;
      const j = S({ speaker: o.speaker, instruct: o.instruct, text: A, raw: "", malformed: !1 });
      if (u.value.splice(n + 1, 0, j), It(j.__key), Q(), l !== void 0) {
        const O = l + 1, N = [];
        for (let Be = c - 1; Be >= O; Be--) N.push([Be, Be + 1]);
        et({ moves: N });
      }
    }
    function In() {
      const t = S({ speaker: "", instruct: "", text: "", raw: "", malformed: !1 });
      u.value.push(t), It(t.__key), Q();
    }
    const ee = L(() => le.value.indexOf(b.value)), En = L(() => !(ee.value > 0)), _n = L(() => !(ee.value >= 0 && ee.value < le.value.length - 1));
    function $n() {
      ee.value > 0 && Pt(le.value[ee.value - 1]);
    }
    function Tn() {
      ee.value >= 0 && ee.value < le.value.length - 1 && Pt(le.value[ee.value + 1]);
    }
    async function An() {
      try {
        const e = await (await fetch(Bn)).json();
        oe.value = e.presets || [];
      } catch {
        oe.value = [];
      }
    }
    async function xt() {
      var t, e, n;
      try {
        const o = `${de}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, c = await (await fetch(o)).json();
        M.value = ((t = c.instructions) == null ? void 0 : t.entries) || [], x.value = ((e = c.roles) == null ? void 0 : e.entries) || [], H.value = ((n = c.roles) == null ? void 0 : n.path) || null, le.value = Array.isArray(c.scripts) ? c.scripts : [], $e.value = Array.isArray(c.ready_scripts) ? c.ready_scripts : [];
      } catch {
        M.value = [], x.value = [], H.value = null, le.value = [], $e.value = [];
      }
    }
    async function Pt(t) {
      !t || t === b.value || We || (Z && (clearTimeout(Z), Z = null, await Fe()), b.value = t, me = null, ae.value = null, ce = null, u.value = [], ve = null, Je = 0, Te.value = i.checkedApi ? i.checkedApi.isChecked(t) : !1, p("Loading..."), await ot(), ue(), Ie());
    }
    async function ot({ isPoll: t = !1 } = {}) {
      try {
        const n = await (await fetch(`${Me}/read?path=${encodeURIComponent(gt.value)}`)).json();
        if (n.error) {
          p(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          t || (u.value = [], ve = "", p("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (t && Date.now() - Je < ls || n.content === ve) return;
        u.value = F(n.content), ve = n.content, t || p(`Loaded ${u.value.length} line(s)`);
      } catch (e) {
        p(`Read failed: ${e}`);
      }
    }
    return ze(B, () => ne(Ne)), ze(V, Qt), Nn(() => {
      xt(), An(), ue(), Se(), be = setInterval(() => {
        ue({ silent: !0 }), Se();
      }, rt), ot().then(() => {
        ke = setInterval(() => ot({ isPoll: !0 }), rt), Ie(), we = setInterval(() => Ie({ silent: !0 }), rt);
      });
    }), Fn(() => {
      Oe(), ke && clearInterval(ke), be && clearInterval(be), we && clearInterval(we);
    }), (t, e) => (d(), m(K, null, [
      g(y(Ft), {
        visible: D.value,
        "onUpdate:visible": e[9] || (e[9] = (n) => D.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: _e({ width: y(Kt) }),
        class: "line-editor-dialog"
      }, {
        header: _(() => [
          g(Zn, {
            title: b.value,
            status: ht.value,
            "width-presets": y(Ht),
            "set-width": y(Ut)
          }, {
            after: _(() => [
              v("div", Pi, [
                g(y(P), {
                  label: "A−",
                  text: "",
                  size: "small",
                  title: "Decrease line text font size",
                  onClick: e[0] || (e[0] = (n) => {
                    V.value = Math.max(rs, V.value - 1), f(ct, V.value);
                  })
                }),
                g(y(P), {
                  label: "A+",
                  text: "",
                  size: "small",
                  title: "Increase line text font size",
                  onClick: e[1] || (e[1] = (n) => {
                    V.value = Math.min(cs, V.value + 1), f(ct, V.value);
                  })
                })
              ])
            ]),
            _: 1
          }, 8, ["title", "status", "width-presets", "set-width"])
        ]),
        default: _(() => [
          g(_i, { class: "line-editor-controls" }, {
            default: _(() => [
              v("div", Ri, [
                v("span", {
                  class: ie(["play-btn global-play-btn", { "is-playing": it.value, disabled: !st.value }]),
                  title: mn.value,
                  onClick: hn
                }, $(it.value ? "⏸" : "▶"), 11, Di),
                E.checking ? (d(), m("div", ji, "Checking for audio...")) : E.error ? (d(), m("div", Oi, "Audio check failed: " + $(E.error), 1)) : E.best ? (d(), m(K, { key: 2 }, [
                  v("div", Ni, $(E.best), 1),
                  v("audio", {
                    ref_key: "audioElRef",
                    ref: xe,
                    controls: "",
                    class: "audio-el",
                    src: `${y(de)}/audio?path=${encodeURIComponent(y(te)(Le.value, E.best))}&v=${encodeURIComponent(E.mtime || "")}`,
                    onTimeupdate: Ne,
                    onPlay: e[2] || (e[2] = (n) => W.value = !0),
                    onPause: e[3] || (e[3] = (n) => W.value = !1),
                    onEnded: e[4] || (e[4] = (n) => W.value = !1)
                  }, null, 40, Fi),
                  g(y(P), {
                    label: "🗑 Delete audio",
                    text: "",
                    size: "small",
                    disabled: yn.value,
                    title: I.value ? "Marked ready to release -- unmark it (Done) before deleting audio" : "Delete the rendered audio for this script",
                    onClick: gn
                  }, null, 8, ["disabled", "title"])
                ], 64)) : (d(), m("div", Bi, "No audio yet in " + $(Le.value), 1)),
                g(y(P), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: e[5] || (e[5] = (n) => ue())
                })
              ]),
              Gt.value ? (d(), m("div", zi, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : R("", !0),
              v("div", Mi, [
                v("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: Te.value,
                  disabled: !s.checkedApi || I.value,
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: e[6] || (e[6] = (n) => {
                    Te.value = n.target.checked, kn(n.target.checked);
                  })
                }, null, 40, Ki),
                g(y(P), {
                  label: I.value ? "Done ✓" : "Done",
                  size: "small",
                  outlined: !I.value,
                  disabled: bn.value,
                  title: wn.value,
                  onClick: Cn
                }, null, 8, ["label", "outlined", "disabled", "title"]),
                e[10] || (e[10] = v("div", { class: "actions-divider" }, null, -1)),
                g(y(P), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: Ue(Ln, ["prevent"])
                }),
                g(y(P), {
                  label: "✂ Split line",
                  text: "",
                  size: "small",
                  title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
                  onMousedown: Ue(Sn, ["prevent"])
                }),
                g(y(P), {
                  label: "+ Add line",
                  text: "",
                  size: "small",
                  title: "Add a new empty line at the end of the script",
                  onClick: In
                }),
                e[11] || (e[11] = v("div", { class: "actions-divider" }, null, -1)),
                g(y(P), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: En.value,
                  title: "Open the previous script in this act",
                  onClick: $n
                }, null, 8, ["disabled"]),
                g(y(P), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: _n.value,
                  title: "Open the next script in this act",
                  onClick: Tn
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          v("div", {
            ref_key: "rowsContainerEl",
            ref: Ze,
            class: "rows-container"
          }, [
            (d(!0), m(K, null, ft(u.value, (n, o) => (d(), m("div", {
              key: n.__key,
              class: ie(["fl-line-row", { "row-enter": Ae.value === n.__key, "row-playing": I.value ? je.value.get(o) === ge.value : X.value === o }]),
              "data-row-index": o,
              ref_for: !0,
              ref: (l) => en(n.__key, l),
              style: _e(n.malformed ? {} : { borderLeftColor: pe(n.speaker) })
            }, [
              n.malformed ? (d(), m(K, { key: 0 }, [
                v("div", Hi, [
                  e[12] || (e[12] = v("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  g(y(P), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => Et(o, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                v("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: _e({ fontSize: `${V.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    St(n.__key, l), ne(() => Ee(l));
                  },
                  onInput: (l) => {
                    n.raw = l.target.value, Ee(l.target), Q();
                  },
                  onKeydown: e[7] || (e[7] = Ot(Ue(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, Vi)
              ], 64)) : (d(), m(K, { key: 1 }, [
                v("div", qi, [
                  v("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (l) => nn(l, o)
                  }, "⠿", 512),
                  v("span", {
                    class: ie(["play-btn", { "is-playing": At(o), disabled: !nt(o, n) }]),
                    title: nt(o, n) ? I.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                    onClick: (l) => vn(n, o)
                  }, $(At(o) ? "⏸" : "▶"), 11, Ji),
                  g(y(pt), { class: "speaker-group" }, {
                    default: _(() => [
                      g(y(vt), null, {
                        default: _(() => [...e[13] || (e[13] = [
                          v("i", { class: "pi pi-user" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      g(y(Nt), {
                        "model-value": n.speaker,
                        options: x.value,
                        "option-label": "code",
                        "option-value": "code",
                        editable: "",
                        filter: "",
                        placeholder: "Speaker",
                        title: "Speaker (role code, or a literal preset/preset#tag)",
                        "onUpdate:modelValue": (l) => {
                          n.speaker = l, on(n);
                        }
                      }, {
                        option: _(({ option: l }) => [
                          v("div", Wi, $(l.code), 1),
                          Tt(l) ? (d(), m("div", Xi, $(Tt(l)), 1)) : R("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  g(y(pt), { class: "instruct-group" }, {
                    default: _(() => [
                      g(y(vt), null, {
                        default: _(() => [...e[14] || (e[14] = [
                          v("i", { class: "pi pi-list" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      g(y(Nt), {
                        "model-value": n.instruct,
                        options: M.value,
                        "option-label": "text",
                        "option-value": "text",
                        editable: "",
                        filter: "",
                        placeholder: "Instruct",
                        title: "Instruct text",
                        "onUpdate:modelValue": (l) => {
                          n.instruct = l, ln(n);
                        }
                      }, {
                        option: _(({ option: l }) => [
                          v("div", Zi, $(l.text), 1),
                          l.note ? (d(), m("div", Gi, $(l.note), 1)) : R("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  s.revoiceApi && !I.value ? (d(), m("span", {
                    key: 0,
                    class: ie(["revoice-btn", { pending: re.has(n), stale: !re.has(n) && Re(o) && !De(n, o) }]),
                    title: fn(n, o),
                    onClick: (l) => pn(n, o)
                  }, $(re.has(n) ? "⏳" : "🔁"), 11, Yi)) : R("", !0),
                  g(y(P), {
                    class: "speaker-file-btn",
                    text: "",
                    size: "small",
                    label: Ct(n.speaker) || "(no speaker)",
                    disabled: !x.value.find((l) => l.code === n.speaker),
                    title: rn(n),
                    onClick: (l) => cn(l, n)
                  }, null, 8, ["label", "disabled", "title", "onClick"]),
                  v("span", {
                    class: "role-info-btn",
                    onMouseenter: (l) => un(l.target, n.speaker),
                    onMouseleave: dn
                  }, "ℹ", 40, Qi),
                  e[15] || (e[15] = v("div", { class: "spacer" }, null, -1)),
                  g(y(P), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => Et(o, n.text)
                  }, null, 8, ["onClick"])
                ]),
                $t(n) ? (d(), m("div", es, "↳ " + $($t(n)), 1)) : R("", !0),
                v("textarea", {
                  class: "fl-textarea",
                  style: _e({ fontSize: `${V.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    St(n.__key, l), ne(() => Ee(l));
                  },
                  onInput: (l) => {
                    n.text = l.target.value, _t(n, l.target);
                  },
                  onKeydown: e[8] || (e[8] = Ot(Ue(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (l) => an(n, l.target, l)
                }, null, 44, ts)
              ], 64))
            ], 14, Ui))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      g(Si, {
        ref_key: "pickPanelRef",
        ref: yt
      }, null, 512),
      g(y(zt)),
      q.visible ? (d(), m("div", {
        key: 0,
        class: "role-info-popover",
        style: _e({ left: `${q.left}px`, top: `${q.top}px` })
      }, [
        tt.value.message ? (d(), m("div", ns, $(tt.value.message), 1)) : R("", !0),
        (d(!0), m(K, null, ft(tt.value.fields, ([n, o]) => (d(), m("div", {
          key: n,
          class: "role-info-row"
        }, [
          v("span", is, $(n), 1),
          v("span", ss, $(o), 1)
        ]))), 128))
      ], 4)) : R("", !0)
    ], 64));
  }
}, ds = /* @__PURE__ */ mt(us, [["__scopeId", "data-v-3e3cc00f"]]);
function hs({ folder: s, filename: i, suffix: r = "_speakers.txt", checkedApi: f, revoiceApi: h }) {
  Un(import.meta.url);
  const a = document.createElement("div");
  document.body.appendChild(a);
  const S = Hn(ds, {
    folder: s,
    filename: i,
    suffix: r,
    checkedApi: f || null,
    revoiceApi: h || null,
    onClose: () => {
      S.unmount(), a.remove();
    }
  });
  S.use(Vn, { ripple: !0 }), S.use(Qn), S.mount(a);
}
export {
  hs as openLineEditor
};
