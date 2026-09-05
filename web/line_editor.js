import { v as In, x as xn, y as _t, z as lt, b as p, c as ce, A as et, a as M, C as ae, e as b, k as re, d as v, D as X, i as g, F as B, E as at, h as D, t as P, s as A, G as Tt, R as _n, U as Tn, H as J, I as An, Z as tt, J as St, T as jn, K as Et, _ as At, u as y, j as rt, L as G, l as I, r as h, w as nt, o as Pn, M as Rn, n as Te, S as le, N as On, B as It, O as he, m as W, Q as it, V as Dn, W as ze, f as xt, X as $n, Y as Nn, p as Fn, q as zn, P as Bn } from "./styles_link.js";
import { s as jt, a as Mn, b as Kn, F as Un, u as Vn, P as Hn } from "./PanelWidthButtons.js";
import { s as ct } from "./inputtext.esm.js";
import { O as Be } from "./overlayeventbus.esm.js";
var ye = In(), Pt = Symbol();
function qn() {
  var o = xn(Pt);
  if (!o)
    throw new Error("No PrimeVue Confirmation provided!");
  return o;
}
var Jn = {
  install: function(s) {
    var u = {
      require: function(w) {
        ye.emit("confirm", w);
      },
      close: function() {
        ye.emit("close");
      }
    };
    s.config.globalProperties.$confirm = u, s.provide(Pt, u);
  }
}, Wn = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(s) {
    var u = s.instance;
    return ["p-confirm-dialog-reject", u.confirmation && !u.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, Xn = _t.extend({
  name: "confirmdialog",
  classes: Wn
}), Zn = {
  name: "BaseConfirmDialog",
  extends: Tt,
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
  style: Xn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Rt = {
  name: "ConfirmDialog",
  extends: Zn,
  confirmListener: null,
  closeListener: null,
  data: function() {
    return {
      visible: !1,
      confirmation: null
    };
  },
  mounted: function() {
    var s = this;
    this.confirmListener = function(u) {
      u && u.group === s.group && (s.confirmation = u, s.confirmation.onShow && s.confirmation.onShow(), s.visible = !0);
    }, this.closeListener = function() {
      s.visible = !1, s.confirmation = null;
    }, ye.on("confirm", this.confirmListener), ye.on("close", this.closeListener);
  },
  beforeUnmount: function() {
    ye.off("confirm", this.confirmListener), ye.off("close", this.closeListener);
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
    getCXOptions: function(s, u) {
      return {
        contenxt: {
          icon: s,
          iconClass: u.class
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
    CDialog: jt,
    CDButton: A
  }
};
function Yn(o, s, u, C, w, a) {
  var L = lt("CDButton"), F = lt("CDialog");
  return p(), ce(F, {
    visible: w.visible,
    "onUpdate:visible": [s[2] || (s[2] = function(T) {
      return w.visible = T;
    }), a.onHide],
    role: "alertdialog",
    class: re(o.cx("root")),
    modal: !0,
    header: a.header,
    blockScroll: a.blockScroll,
    position: a.position,
    breakpoints: o.breakpoints,
    closeOnEscape: a.closeOnEscape,
    draggable: o.draggable,
    pt: o.pt,
    unstyled: o.unstyled
  }, et({
    default: M(function() {
      return [o.$slots.container ? D("", !0) : (p(), g(B, {
        key: 0
      }, [o.$slots.message ? (p(), ce(at(o.$slots.message), {
        key: 1,
        message: w.confirmation
      }, null, 8, ["message"])) : (p(), g(B, {
        key: 0
      }, [ae(o.$slots, "icon", {}, function() {
        return [o.$slots.icon ? (p(), ce(at(o.$slots.icon), {
          key: 0,
          class: re(o.cx("icon"))
        }, null, 8, ["class"])) : w.confirmation.icon ? (p(), g("span", X({
          key: 1,
          class: [w.confirmation.icon, o.cx("icon")]
        }, o.ptm("icon")), null, 16)) : D("", !0)];
      }), v("span", X({
        class: o.cx("message")
      }, o.ptm("message")), P(a.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [o.$slots.container ? {
    name: "container",
    fn: M(function(T) {
      return [ae(o.$slots, "container", {
        message: w.confirmation,
        onClose: T.onClose,
        onAccept: a.accept,
        onReject: a.reject,
        closeCallback: T.onclose,
        acceptCallback: a.accept,
        rejectCallback: a.reject
      })];
    }),
    key: "0"
  } : void 0, o.$slots.container ? void 0 : {
    name: "footer",
    fn: M(function() {
      return [b(L, {
        label: a.rejectLabel,
        class: re([o.cx("rejectButton"), w.confirmation.rejectClass]),
        onClick: s[0] || (s[0] = function(T) {
          return a.reject();
        }),
        autofocus: a.autoFocusReject,
        unstyled: o.unstyled,
        pt: o.ptm("rejectButton")
      }, et({
        _: 2
      }, [a.rejectIcon || o.$slots.rejecticon ? {
        name: "icon",
        fn: M(function(T) {
          return [ae(o.$slots, "rejecticon", {}, function() {
            return [v("span", X({
              class: [a.rejectIcon, T.class]
            }, o.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), b(L, {
        label: a.acceptLabel,
        class: re([o.cx("acceptButton"), w.confirmation.acceptClass]),
        onClick: s[1] || (s[1] = function(T) {
          return a.accept();
        }),
        autofocus: a.autoFocusAccept,
        unstyled: o.unstyled,
        pt: o.ptm("acceptButton")
      }, et({
        _: 2
      }, [a.acceptIcon || o.$slots.accepticon ? {
        name: "icon",
        fn: M(function(T) {
          return [ae(o.$slots, "accepticon", {}, function() {
            return [v("span", X({
              class: [a.acceptIcon, T.class]
            }, o.ptm("acceptButton").icon, {
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
Rt.render = Yn;
var Gn = {
  root: function(s) {
    var u = s.instance;
    return ["p-overlaypanel p-component", {
      "p-ripple-disabled": u.$primevue.config.ripple === !1
    }];
  },
  content: "p-overlaypanel-content",
  closeButton: "p-overlaypanel-close p-link",
  closeIcon: "p-overlaypanel-close-icon"
}, Qn = _t.extend({
  name: "overlaypanel",
  classes: Gn
}), ei = {
  name: "BaseOverlayPanel",
  extends: Tt,
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
  style: Qn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ot = {
  name: "OverlayPanel",
  extends: ei,
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
      handler: function(s) {
        s ? this.bindOutsideClickListener() : this.unbindOutsideClickListener();
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
    this.dismissable && this.unbindOutsideClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.destroyStyle(), this.unbindResizeListener(), this.target = null, this.container && this.autoZIndex && tt.clear(this.container), this.overlayEventListener && (Be.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null), this.container = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    toggle: function(s, u) {
      this.visible ? this.hide() : this.show(s, u);
    },
    show: function(s, u) {
      this.visible = !0, this.eventTarget = s.currentTarget, this.target = u || s.currentTarget;
    },
    hide: function() {
      this.visible = !1;
    },
    onContentClick: function() {
      this.selfClick = !0;
    },
    onEnter: function(s) {
      var u = this;
      this.container.setAttribute(this.attributeSelector, ""), J.addStyles(s, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.dismissable && this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && tt.set("overlay", s, this.baseZIndex + this.$primevue.config.zIndex.overlay), this.overlayEventListener = function(C) {
        u.container.contains(C.target) && (u.selfClick = !0);
      }, this.focus(), Be.on("overlay-click", this.overlayEventListener), this.$emit("show"), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    onLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.unbindDocumentKeyDownListener(), Be.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null, this.$emit("hide");
    },
    onAfterLeave: function(s) {
      this.autoZIndex && tt.clear(s);
    },
    alignOverlay: function() {
      J.absolutePosition(this.container, this.target, !1);
      var s = J.getOffset(this.container), u = J.getOffset(this.target), C = 0;
      s.left < u.left && (C = u.left - s.left), this.container.style.setProperty("--overlayArrowLeft", "".concat(C, "px")), s.top < u.top && (this.container.setAttribute("data-p-overlaypanel-flipped", "true"), !this.isUnstyled && J.addClass(this.container, "p-overlaypanel-flipped"));
    },
    onContentKeydown: function(s) {
      s.code === "Escape" && this.closeOnEscape && (this.hide(), J.focus(this.target));
    },
    onButtonKeydown: function(s) {
      switch (s.code) {
        case "ArrowDown":
        case "ArrowUp":
        case "ArrowLeft":
        case "ArrowRight":
          s.preventDefault();
      }
    },
    focus: function() {
      var s = this.container.querySelector("[autofocus]");
      s && s.focus();
    },
    onKeyDown: function(s) {
      s.code === "Escape" && this.closeOnEscape && (this.visible = !1);
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    bindOutsideClickListener: function() {
      var s = this;
      !this.outsideClickListener && J.isClient() && (this.outsideClickListener = function(u) {
        s.visible && !s.selfClick && !s.isTargetClicked(u) && (s.visible = !1), s.selfClick = !1;
      }, document.addEventListener("click", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener), this.outsideClickListener = null, this.selfClick = !1);
    },
    bindScrollListener: function() {
      var s = this;
      this.scrollHandler || (this.scrollHandler = new An(this.target, function() {
        s.visible && (s.visible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var s = this;
      this.resizeListener || (this.resizeListener = function() {
        s.visible && !J.isTouchDevice() && (s.visible = !1);
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    isTargetClicked: function(s) {
      return this.eventTarget && (this.eventTarget === s.target || this.eventTarget.contains(s.target));
    },
    containerRef: function(s) {
      this.container = s;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var s;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", J.setAttribute(this.styleElement, "nonce", (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.csp) === null || s === void 0 ? void 0 : s.nonce), document.head.appendChild(this.styleElement);
        var u = "";
        for (var C in this.breakpoints)
          u += `
                        @media screen and (max-width: `.concat(C, `) {
                            .p-overlaypanel[`).concat(this.attributeSelector, `] {
                                width: `).concat(this.breakpoints[C], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = u;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    onOverlayClick: function(s) {
      Be.emit("overlay-click", {
        originalEvent: s,
        target: this.target
      });
    }
  },
  computed: {
    attributeSelector: function() {
      return Tn();
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    }
  },
  directives: {
    focustrap: Un,
    ripple: _n
  },
  components: {
    Portal: Kn,
    TimesIcon: Mn
  }
}, ti = ["aria-modal"], ni = ["aria-label"];
function ii(o, s, u, C, w, a) {
  var L = lt("Portal"), F = St("ripple"), T = St("focustrap");
  return p(), ce(L, {
    appendTo: o.appendTo
  }, {
    default: M(function() {
      return [b(jn, X({
        name: "p-overlaypanel",
        onEnter: a.onEnter,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave
      }, o.ptm("transition")), {
        default: M(function() {
          return [w.visible ? Et((p(), g("div", X({
            key: 0,
            ref: a.containerRef,
            role: "dialog",
            "aria-modal": w.visible,
            onClick: s[5] || (s[5] = function() {
              return a.onOverlayClick && a.onOverlayClick.apply(a, arguments);
            }),
            class: o.cx("root")
          }, o.ptmi("root")), [o.$slots.container ? ae(o.$slots, "container", {
            key: 0,
            onClose: a.hide,
            onKeydown: function(Q) {
              return a.onButtonKeydown(Q);
            },
            closeCallback: a.hide,
            keydownCallback: function(Q) {
              return a.onButtonKeydown(Q);
            }
          }) : (p(), g(B, {
            key: 1
          }, [v("div", X({
            class: o.cx("content"),
            onClick: s[0] || (s[0] = function() {
              return a.onContentClick && a.onContentClick.apply(a, arguments);
            }),
            onMousedown: s[1] || (s[1] = function() {
              return a.onContentClick && a.onContentClick.apply(a, arguments);
            }),
            onKeydown: s[2] || (s[2] = function() {
              return a.onContentKeydown && a.onContentKeydown.apply(a, arguments);
            })
          }, o.ptm("content")), [ae(o.$slots, "default")], 16), o.showCloseIcon ? Et((p(), g("button", X({
            key: 0,
            class: o.cx("closeButton"),
            "aria-label": a.closeAriaLabel,
            type: "button",
            autofocus: "",
            onClick: s[3] || (s[3] = function() {
              return a.hide && a.hide.apply(a, arguments);
            }),
            onKeydown: s[4] || (s[4] = function() {
              return a.onButtonKeydown && a.onButtonKeydown.apply(a, arguments);
            })
          }, o.ptm("closeButton")), [ae(o.$slots, "closeicon", {}, function() {
            return [(p(), ce(at(o.closeIcon ? "span" : "TimesIcon"), X({
              class: [o.cx("closeIcon"), o.closeIcon]
            }, o.ptm("closeIcon")), null, 16, ["class"]))];
          })], 16, ni)), [[F]]) : D("", !0)], 64))], 16, ti)), [[T]]) : D("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Ot.render = ii;
const si = { class: "pick-panel-rows" }, oi = {
  key: 0,
  class: "pick-panel-empty"
}, li = ["onClick"], ai = { class: "pick-panel-label" }, ri = {
  key: 0,
  class: "pick-panel-sublabel"
}, ci = {
  __name: "PickPanel",
  setup(o, { expose: s }) {
    const u = h(null), C = h(""), w = h([]), a = h((R) => String(R)), L = h(null), F = h(null), T = I(() => w.value.length > 6), ue = I(() => {
      const R = C.value.trim().toLowerCase();
      return R ? w.value.filter((k) => {
        const d = a.value(k) || "", $ = L.value && L.value(k) || "";
        return `${d} ${$}`.toLowerCase().includes(R);
      }) : w.value;
    });
    function Q(R, { items: k, getLabel: d, getSubLabel: $, onPick: j }) {
      w.value = k, a.value = d, L.value = $ || null, F.value = j, C.value = "", u.value.toggle(R), G(() => {
        var K, ee;
        return (ee = (K = u.value.$el) == null ? void 0 : K.querySelector("input")) == null ? void 0 : ee.focus();
      });
    }
    function ge(R) {
      var k;
      (k = F.value) == null || k.call(F, R), u.value.hide();
    }
    return s({ open: Q }), (R, k) => (p(), ce(y(Ot), {
      ref_key: "panelRef",
      ref: u,
      class: "pick-panel"
    }, {
      default: M(() => [
        T.value ? (p(), ce(y(ct), {
          key: 0,
          modelValue: C.value,
          "onUpdate:modelValue": k[0] || (k[0] = (d) => C.value = d),
          placeholder: "Type to filter...",
          class: "pick-panel-filter"
        }, null, 8, ["modelValue"])) : D("", !0),
        v("div", si, [
          ue.value.length ? D("", !0) : (p(), g("div", oi, "(no matches)")),
          (p(!0), g(B, null, rt(ue.value, (d, $) => (p(), g("div", {
            key: $,
            class: "pick-panel-row",
            onClick: (j) => ge(d)
          }, [
            v("div", ai, P(a.value(d)), 1),
            L.value && L.value(d) ? (p(), g("div", ri, P(L.value(d)), 1)) : D("", !0)
          ], 8, li))), 128))
        ])
      ]),
      _: 1
    }, 512));
  }
}, ui = /* @__PURE__ */ At(ci, [["__scopeId", "data-v-6120c799"]]), di = { class: "header-row" }, fi = ["checked", "disabled"], pi = { class: "dialog-title" }, vi = { class: "status-el" }, mi = { class: "font-row" }, hi = { class: "audio-row" }, yi = { class: "audio-content-row" }, gi = {
  key: 0,
  class: "muted-note"
}, ki = {
  key: 1,
  class: "muted-note"
}, bi = { class: "audio-label" }, wi = ["src"], Ci = {
  key: 3,
  class: "muted-note"
}, Li = {
  key: 0,
  class: "timing-warning"
}, Si = { class: "actions-row" }, Ei = ["data-row-index"], Ii = { class: "malformed-warn-line" }, xi = ["value", "onInput"], _i = { class: "top-line" }, Ti = ["title", "onClick"], Ai = ["title", "onClick"], ji = ["onMouseenter"], Pi = { class: "instruct-line" }, Ri = {
  key: 0,
  class: "instruct-desc"
}, Oi = ["value", "onInput", "onPaste"], Di = { key: 0 }, $i = { class: "role-info-key" }, Ni = { class: "role-info-value" }, Fi = 600, st = 3e3, zi = 1500, Bi = 11.5, Mi = 9, Ki = 22, ot = "FL_CosyVoice3.LineEditor.textFontSizePx", Ui = {
  __name: "LineEditorApp",
  props: {
    folder: { type: String, required: !0 },
    filename: { type: String, required: !0 },
    suffix: { type: String, default: "_speakers.txt" },
    checkedApi: { type: Object, default: null },
    // {isChecked(fname), setChecked(fname, val)}
    revoiceApi: { type: Object, default: null },
    // {revoiceLine({lineId, speaker, instruct, text}) => Promise}
    onClose: { type: Function, required: !0 }
  },
  setup(o) {
    const s = o;
    function u(e, t) {
      try {
        const n = parseFloat(localStorage.getItem(e));
        return Number.isFinite(n) ? n : t;
      } catch {
        return t;
      }
    }
    function C(e, t) {
      try {
        localStorage.setItem(e, String(t));
      } catch {
      }
    }
    function w(e) {
      const t = e.split("|");
      return t.length !== 3 ? null : { speaker: t[0].trim(), instruct: t[1].trim(), text: t[2].trim() };
    }
    let a = 1;
    function L(e) {
      return { ...e, __key: a++ };
    }
    function F(e) {
      return e.split(`
`).map((t) => t.replace(/\r$/, "")).filter((t) => t.trim()).map((t) => {
        const n = w(t);
        return L(n ? { ...n, raw: t, malformed: !1 } : { raw: t, malformed: !0 });
      });
    }
    function T(e) {
      return e.map((t) => t.malformed ? t.raw : `${t.speaker} | ${t.instruct} | ${t.text}`).join(`
`);
    }
    function ue(e) {
      if (!e) return "rgba(255,255,255,0.15)";
      let t = 0;
      for (let n = 0; n < e.length; n++) t = t * 31 + e.charCodeAt(n) >>> 0;
      return `hsl(${t % 360}, 55%, 55%)`;
    }
    const Q = qn();
    function ge({ title: e = "Confirm", message: t = "", okText: n = "OK", cancelText: i = "Cancel" } = {}) {
      return new Promise((l) => {
        Q.require({
          header: e,
          message: t,
          acceptLabel: n,
          rejectLabel: i,
          accept: () => l(!0),
          reject: () => l(!1),
          onHide: () => l(!1)
        });
      });
    }
    const R = h(!0), k = h(s.filename), d = h([]), $ = h([]), j = h([]), K = h(null), ee = h([]), Ae = h([]), te = h([]), ut = h(""), { cssWidth: Dt, setWidth: $t, presets: Nt } = Vn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), U = h(u(ot, Bi)), V = h(null), ke = h(-1), de = h(!1), fe = h(-1), je = h(s.checkedApi ? s.checkedApi.isChecked(s.filename) : !1), x = it({ checking: !0, best: null, mtime: null, error: null }), H = it({ visible: !1, top: 0, left: 0, code: null }), Pe = h(null), ne = it(/* @__PURE__ */ new Set());
    let pe = 1, ve = null, Re = null, Me = 0, me = null, ie = null, Z = null, be = null, we = null, Ce = null, Ke = !1, Ue = null, Le = null;
    const Ve = h(null), He = h(null), Oe = /* @__PURE__ */ new Map(), qe = /* @__PURE__ */ new Map(), De = h(null), dt = I(() => W(s.folder, k.value)), Se = I(() => W(s.folder, "_audio")), se = I(() => Dn(k.value, s.suffix)), Je = I(() => W(W(Se.value, "lines"), se.value)), ft = I(() => W(Je.value, "_state.json")), We = h(/* @__PURE__ */ new Set());
    async function $e() {
      try {
        const t = await (await fetch(`${It}?path=${encodeURIComponent(Je.value)}`)).json();
        We.value = new Set(Array.isArray(t.files) ? t.files : []);
      } catch {
      }
    }
    function pt(e, t) {
      const n = `id${e.id}.wav`;
      if (We.value.has(n)) return n;
      const i = `${String(t).padStart(4, "0")}.wav`;
      return We.value.has(i) ? i : null;
    }
    const _ = I(() => Ae.value.includes(k.value)), Xe = I(() => {
      const e = d.value.filter((t) => !t.malformed);
      return e.length > 0 && e.every((t) => t.status === "voiced");
    });
    function f(e) {
      ut.value = e;
    }
    function vt(e) {
      if (!e) return "";
      const t = j.value.find((l) => l.code === e), n = t && t.speaker ? t.speaker : e, i = String(n).split("#", 1)[0].trim();
      return i ? `${i}.pt` : "";
    }
    function Ft() {
      const e = {};
      return j.value.forEach((t) => {
        const n = String(t.speaker || "").split("#", 1)[0].trim();
        !n || !t.code || (e[n] = e[n] || []).push(t.code);
      }), e;
    }
    async function zt() {
      if (!K.value)
        return f("No _roles.json found for this project -- can't save"), !1;
      try {
        const t = await (await fetch(`${he}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: K.value, content: JSON.stringify({ roles: j.value }, null, 2) })
        })).json();
        return t.error ? (f(`Error saving _roles.json: ${t.error}`), !1) : !0;
      } catch (e) {
        return f(`Error saving _roles.json: ${e}`), !1;
      }
    }
    async function Bt(e) {
      if (!K.value) return;
      const t = $n(K.value), n = await Nn(t, e, s.suffix);
      f(n.message), (n.changed.some((i) => i.file === k.value) || n.untracked.some((i) => i.file === k.value)) && (await mt(), await Ct(), me = null, ie = null, oe(), Ie());
    }
    function Mt(e, t) {
      if (!Array.isArray(e) || !e.length) return null;
      const n = [];
      return t.forEach((i, l) => {
        i.malformed || n.push(l);
      }), n.length !== e.length ? null : { lines: e, rowIndexMap: n };
    }
    const N = I(() => _.value ? Mt(V.value, d.value) : null), Ne = I(() => {
      const e = /* @__PURE__ */ new Map();
      return N.value && N.value.rowIndexMap.forEach((t, n) => e.set(t, n)), e;
    }), Kt = I(() => !!(_.value && V.value && V.value.length && !N.value));
    function Ut() {
      return JSON.stringify({
        next_id: pe,
        lines: d.value.filter((e) => !e.malformed).map((e) => ({ id: e.id, text: e.text, status: e.status }))
      }, null, 2);
    }
    function Vt(e, t) {
      const n = t && Array.isArray(t.lines) ? t.lines : [];
      let i = t && Number.isFinite(t.next_id) ? t.next_id : 1;
      const l = e.filter((c) => !c.malformed);
      if (n.length === l.length)
        return l.forEach((c, S) => {
          const E = n[S];
          c.id = Number.isFinite(E.id) ? E.id : i++;
          const O = (E.text || "") === c.text;
          c.status = O ? E.status === "voiced" || E.status === "stale" ? E.status : "unvoiced" : E.status === "voiced" || E.status === "stale" ? "stale" : "unvoiced";
        }), Math.max(i, ...l.map((c) => c.id + 1), 1);
      const r = /* @__PURE__ */ new Map();
      n.forEach((c) => {
        const S = (c.text || "").trim();
        r.has(S) || r.set(S, []), r.get(S).push(c);
      });
      const m = /* @__PURE__ */ new Map();
      return l.forEach((c) => {
        const S = (c.text || "").trim(), E = r.get(S), O = m.get(S) || 0;
        if (E && O < E.length) {
          const q = E[O];
          m.set(S, O + 1), c.id = Number.isFinite(q.id) ? q.id : i++, c.status = q.status === "voiced" ? "voiced" : "unvoiced";
        } else
          c.id = i++, c.status = "unvoiced";
      }), i;
    }
    async function mt() {
      let e = null, t = null;
      try {
        const i = await (await fetch(`${he}/read?path=${encodeURIComponent(ft.value)}`)).json();
        if (i.exists) {
          t = i.content;
          try {
            e = JSON.parse(i.content);
          } catch {
            e = null;
          }
        }
      } catch {
        e = null;
      }
      pe = Vt(d.value, e), Re = t;
    }
    function Ee(e) {
      e.status === "voiced" && (e.status = "stale");
    }
    function Ze() {
      Le && (Le.pause(), Le.src = "", Le = null), fe.value = -1;
    }
    function Ht(e) {
      Ze();
      const t = Je.value, n = (i) => {
        let l = null;
        for (; i < d.value.length && !(!d.value[i].malformed && (l = pt(d.value[i], i), l)); )
          i++;
        if (i >= d.value.length || !l) {
          fe.value = -1;
          return;
        }
        fe.value = i;
        const r = new Audio(`${le}/audio?path=${encodeURIComponent(W(t, l))}&v=${Date.now()}`);
        Le = r, r.addEventListener("ended", () => n(i + 1)), r.play().catch((m) => f(`Playback failed: ${m}`));
      };
      n(e);
    }
    function Fe() {
      var i;
      const e = Ve.value;
      if (!N.value || !e) {
        ke.value = -1;
        return;
      }
      const t = e.currentTime;
      let n = -1;
      for (let l = 0; l < N.value.lines.length; l++)
        if (t >= N.value.lines[l].start && t < N.value.lines[l].end) {
          n = l;
          break;
        }
      if (n !== ke.value && (ke.value = n, n >= 0 && de.value)) {
        const l = N.value.rowIndexMap[n], r = l !== void 0 ? Oe.get((i = d.value[l]) == null ? void 0 : i.__key) : null;
        r == null || r.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function Ie({ silent: e = !1 } = {}) {
      const t = W(W(Se.value, "timing"), `${se.value}.json`);
      try {
        const i = await (await fetch(`${he}/read?path=${encodeURIComponent(t)}`)).json();
        if (!i.exists) {
          V.value = null, ie = null;
          return;
        }
        if (e && i.mtime === ie) return;
        const l = i.mtime !== ie;
        ie = i.mtime;
        let r;
        try {
          r = JSON.parse(i.content);
        } catch {
          V.value = null;
          return;
        }
        V.value = Array.isArray(r.lines) ? r.lines : null;
        const m = d.value.filter((c) => !c.malformed);
        l && V.value && V.value.length === m.length && m.length > 0 && await qt(m), G(Fe);
      } catch {
      }
    }
    async function qt(e) {
      try {
        const n = await (await fetch(`${le}/commit_full_render`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: s.folder,
            base_name: se.value,
            row_texts: e.map((l) => l.text),
            row_ids: e.map((l) => Number.isFinite(l.id) ? l.id : null)
          })
        })).json();
        if (n.error || !Array.isArray(n.ids)) return;
        const i = new Set(n.committed_ids || []);
        e.forEach((l, r) => {
          l.id = n.ids[r], i.has(n.ids[r]) && (l.status = "voiced");
        }), Number.isFinite(n.next_id) && (pe = Math.max(pe, n.next_id)), i.size && (xe(), $e());
      } catch {
      }
    }
    function Jt() {
      Ke || (Ke = !0, Z && (clearTimeout(Z), xe()), be && clearInterval(be), we && clearInterval(we), Ce && clearInterval(Ce), s.onClose());
    }
    nt(R, (e) => {
      e || Jt();
    });
    function z() {
      Me = Date.now(), Z && clearTimeout(Z), Z = setTimeout(xe, Fi);
    }
    async function xe() {
      const e = T(d.value), t = Ut(), n = e !== ve, i = t !== Re;
      if (!(!n && !i))
        try {
          if (n) {
            const r = await (await fetch(`${he}/write`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: dt.value, content: e })
            })).json();
            if (r.error) {
              f(`Save error: ${r.error}`);
              return;
            }
            ve = e;
          }
          i && (await fetch(`${he}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: ft.value, content: t })
          }), Re = t), f(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (l) {
          f(`Save failed: ${l}`);
        }
    }
    function _e(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function ht(e, t) {
      if (!t) {
        qe.delete(e);
        return;
      }
      qe.set(e, t.$el ?? t);
    }
    function Wt() {
      G(() => qe.forEach(_e));
    }
    function Xt(e, t) {
      if (!t) {
        Oe.delete(e);
        return;
      }
      Oe.set(e, t);
    }
    async function yt(e) {
      var n;
      Pe.value = e, await G();
      const t = Oe.get(e);
      t == null || t.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = t == null ? void 0 : t.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        Pe.value === e && (Pe.value = null);
      }, 500);
    }
    async function Zt(e, t) {
      const n = d.value[e], i = d.value[t];
      if (!n || !i || n.malformed || i.malformed) return;
      const l = Math.min(e, t), r = Math.max(e, t), m = d.value[l], c = d.value[r];
      (m.speaker || "").trim() !== (c.speaker || "").trim() && !await ge({
        title: "Merge lines with different speakers?",
        message: `"${m.speaker}" and "${c.speaker}" are different speakers. Merge anyway? The combined line keeps "${m.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }) || (m.text = `${m.text} ${c.text}`.trim(), m.status = "unvoiced", d.value.splice(r, 1), z());
    }
    function Yt(e, t) {
      !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const i = e.closest(".fl-line-row");
        Ue = Number(i == null ? void 0 : i.dataset.rowIndex), i == null || i.classList.add("fl-row-dragging");
        const l = (m) => {
          var E;
          (E = He.value) == null || E.querySelectorAll(".fl-row-drop-target").forEach((O) => O.classList.remove("fl-row-drop-target"));
          const c = document.elementFromPoint(m.clientX, m.clientY), S = c && c.closest ? c.closest(".fl-line-row") : null;
          S && S !== i && S.classList.add("fl-row-drop-target");
        }, r = (m) => {
          var O;
          document.removeEventListener("pointermove", l), document.removeEventListener("pointerup", r), document.removeEventListener("pointercancel", r);
          const c = document.elementFromPoint(m.clientX, m.clientY), S = c && c.closest ? c.closest(".fl-line-row") : null, E = Ue;
          if (Ue = null, i == null || i.classList.remove("fl-row-dragging"), (O = He.value) == null || O.querySelectorAll(".fl-row-drop-target").forEach((q) => q.classList.remove("fl-row-drop-target")), S && S !== i) {
            const q = Number(S.dataset.rowIndex);
            Number.isNaN(q) || Zt(E, q);
          }
        };
        document.addEventListener("pointermove", l), document.addEventListener("pointerup", r), document.addEventListener("pointercancel", r);
      }));
    }
    function Gt(e) {
      d.value.splice(e, 1), z();
    }
    async function gt(e, t) {
      t && t.trim() && !await ge({
        title: "Delete this line?",
        message: t.length > 200 ? t.slice(0, 200) + "…" : t,
        okText: "Delete",
        cancelText: "Cancel"
      }) || Gt(e);
    }
    function Qt(e) {
      Ee(e), z();
    }
    function en(e) {
      Ee(e), z();
    }
    function kt(e, t) {
      _e(t), Ee(e), z();
    }
    function tn(e, t, n) {
      n.preventDefault();
      const i = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), l = t.selectionStart, r = t.selectionEnd;
      t.value = t.value.slice(0, l) + i + t.value.slice(r), t.selectionStart = t.selectionEnd = l + i.length, e.text = t.value, kt(e, t);
    }
    function nn(e) {
      const t = j.value.find((i) => i.code === e.speaker), n = vt(e.speaker);
      return t ? `Change "${t.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${e.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function bt(e) {
      const t = $.value.find((n) => (n.text || "").trim() === e.instruct.trim());
      return t && t.note ? t.note : null;
    }
    function sn(e, t) {
      if (!j.value.length) {
        f("No roles catalog found for this project (_roles.json)");
        return;
      }
      De.value.open(e, {
        items: j.value,
        getLabel: (n) => n.code || n.speaker || "",
        getSubLabel: (n) => [n.name, n.speaker, n.description].filter(Boolean).join(" -- "),
        onPick: (n) => {
          const i = n.code || n.speaker || "";
          t.speaker = i, Ee(t), z();
        }
      });
    }
    function on(e, t) {
      const n = j.value.find((l) => l.code === t.speaker);
      if (!n) return;
      if (!ee.value.length) {
        f("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
        return;
      }
      const i = Ft();
      De.value.open(e, {
        items: ee.value,
        getLabel: (l) => l,
        getSubLabel: (l) => {
          const r = i[l] || [];
          return r.length ? `used by: ${r.join(", ")} -- ${r.length} role(s)` : "not used by any role yet";
        },
        onPick: async (l) => {
          n.speaker = l, await zt() && (f(`"${n.code}" now uses "${l}" for the whole play`), await Bt(n.code));
        }
      });
    }
    function ln(e, t) {
      if (!$.value.length) {
        f("No instructions catalog found for this project (_instructions.json)");
        return;
      }
      De.value.open(e, {
        items: $.value,
        getLabel: (n) => n.text,
        getSubLabel: (n) => n.note || "",
        onPick: (n) => {
          t.instruct = n.text, Ee(t), z();
        }
      });
    }
    function an(e, t) {
      const n = e.getBoundingClientRect();
      H.left = Math.min(n.left, window.innerWidth - 280), H.top = n.bottom + 4, H.code = t, H.visible = !0;
    }
    function rn() {
      H.visible = !1;
    }
    const Ye = I(() => {
      const e = H.code;
      if (!e) return { message: "No speaker set on this line yet" };
      const t = j.value.find((i) => i.code === e);
      if (!t) return { message: `"${e}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(t).filter(([, i]) => i !== "" && i !== null && i !== void 0 && i !== t.__key);
      return n.length ? { fields: n } : { message: `"${e}" has no fields set in _roles.json` };
    });
    function cn(e) {
      return ne.has(e) ? "Re-voicing..." : e.status === "stale" ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : e.status === "voiced" ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function un(e) {
      if (!ne.has(e)) {
        ne.add(e), f("Re-voicing...");
        try {
          await s.revoiceApi.revoiceLine({ lineId: e.id, speaker: e.speaker, instruct: e.instruct, text: e.text }), e.status = "voiced", f("Line re-voiced"), $e();
        } catch (t) {
          f(`Re-voice failed: ${t.message || t}`);
        } finally {
          ne.delete(e), xe();
        }
      }
    }
    function wt(e) {
      return _.value ? ke.value === Ne.value.get(e) && de.value : fe.value === e;
    }
    function Ge(e, t) {
      return _.value ? Ne.value.get(e) !== void 0 : pt(t, e) !== null;
    }
    function dn(e, t) {
      if (Ge(t, e))
        if (_.value) {
          const n = Ne.value.get(t), i = Ve.value;
          if (n === void 0 || !i || !N.value) return;
          i.currentTime = N.value.lines[n].start, i.play();
        } else fe.value === t ? Ze() : Ht(t);
    }
    async function oe({ silent: e = !1 } = {}) {
      e || (x.checking = !0);
      try {
        const n = await (await fetch(`${It}?path=${encodeURIComponent(Se.value)}`)).json(), i = Array.isArray(n.files) ? n.files : [], l = n.file_mtimes || {}, r = se.value.toLowerCase(), m = i.filter((E) => {
          const O = E.lastIndexOf(".");
          return (O > 0 ? E.slice(0, O) : E).toLowerCase().startsWith(r);
        });
        m.sort();
        const c = m.length ? m[m.length - 1] : null, S = c ? `${c}::${l[c] || ""}` : null;
        if (e && S === me) return;
        me = S, x.checking = !1, x.error = null, x.best = c, x.mtime = c ? l[c] || Date.now() : null, c || (de.value = !1, G(Fe));
      } catch (t) {
        x.checking = !1, x.error = String(t);
      }
    }
    const fn = I(() => !x.best || _.value);
    async function pn() {
      if (!(!x.best || _.value || !await ge({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${se.value}" (currently: ${x.best}).`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${le}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: s.folder, base_name: se.value, filename: k.value })
          })).json();
          if (n.error) {
            f(`Error: ${n.error}`);
            return;
          }
          f(`Deleted ${n.deleted.length} audio file(s)`), me = null, oe();
        } catch (t) {
          f(`Error: ${t}`);
        }
    }
    function vn(e) {
      var t;
      (t = s.checkedApi) == null || t.setChecked(k.value, e);
    }
    const mn = I(() => !_.value && !Xe.value), hn = I(() => _.value ? "Marked ready to release -- click to unmark and go back to editing" : Xe.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function yn() {
      var t;
      const e = !_.value;
      if (e && !Xe.value) {
        f("Every line needs to be voiced before marking done");
        return;
      }
      if (e) {
        f("Stitching final file...");
        const n = d.value.filter((i) => !i.malformed);
        try {
          const l = await (await fetch(`${le}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: s.folder,
              base_name: se.value,
              line_ids: n.map((r) => r.id),
              line_texts: n.map((r) => r.text)
            })
          })).json();
          if (l.error) {
            f(`Stitch error: ${l.error}`);
            return;
          }
        } catch (i) {
          f(`Stitch failed: ${i}`);
          return;
        }
      }
      try {
        const i = await (await fetch(`${le}/set_ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: s.folder, filename: k.value, ready: e })
        })).json();
        if (i.error) {
          f(`Error: ${i.error}`);
          return;
        }
        Ae.value = i.ready_scripts || [], e && ((t = s.checkedApi) == null || t.setChecked(k.value, !1), je.value = !1), f(e ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again"), e && (me = null, ie = null, oe(), Ie());
      } catch (n) {
        f(`Error: ${n}`);
      }
    }
    function gn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" && e.tagName !== "INPUT") {
        f("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const t = e.selectionStart;
      e.value = e.value.slice(0, t) + "́" + e.value.slice(t), e.selectionStart = e.selectionEnd = t + 1, e.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function kn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
        f("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const t = e.closest(".fl-line-row"), n = t ? Number(t.dataset.rowIndex) : -1, i = n >= 0 ? d.value[n] : null;
      if (!i || i.malformed) {
        f("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const l = e.selectionStart, r = i.text.slice(0, l).trimEnd(), m = i.text.slice(l).trimStart();
      i.text = r, i.status = "unvoiced";
      const c = L({ speaker: i.speaker, instruct: i.instruct, text: m, raw: "", malformed: !1, id: pe++, status: "unvoiced" });
      d.value.splice(n + 1, 0, c), yt(c.__key), z();
    }
    function bn() {
      const e = L({ speaker: "", instruct: "", text: "", raw: "", malformed: !1, id: pe++, status: "unvoiced" });
      d.value.push(e), yt(e.__key), z();
    }
    const Y = I(() => te.value.indexOf(k.value)), wn = I(() => !(Y.value > 0)), Cn = I(() => !(Y.value >= 0 && Y.value < te.value.length - 1));
    function Ln() {
      Y.value > 0 && Lt(te.value[Y.value - 1]);
    }
    function Sn() {
      Y.value >= 0 && Y.value < te.value.length - 1 && Lt(te.value[Y.value + 1]);
    }
    async function En() {
      try {
        const t = await (await fetch(On)).json();
        ee.value = t.presets || [];
      } catch {
        ee.value = [];
      }
    }
    async function Ct() {
      var e, t, n;
      try {
        const i = `${le}/scan?path=${encodeURIComponent(s.folder)}&act=&suffix=${encodeURIComponent(s.suffix)}`, r = await (await fetch(i)).json();
        $.value = ((e = r.instructions) == null ? void 0 : e.entries) || [], j.value = ((t = r.roles) == null ? void 0 : t.entries) || [], K.value = ((n = r.roles) == null ? void 0 : n.path) || null, te.value = Array.isArray(r.scripts) ? r.scripts : [], Ae.value = Array.isArray(r.ready_scripts) ? r.ready_scripts : [];
      } catch {
        $.value = [], j.value = [], K.value = null, te.value = [], Ae.value = [];
      }
    }
    async function Lt(e) {
      !e || e === k.value || Ke || (Z && (clearTimeout(Z), Z = null, await xe()), k.value = e, me = null, V.value = null, ie = null, d.value = [], ve = null, Me = 0, je.value = s.checkedApi ? s.checkedApi.isChecked(e) : !1, f("Loading..."), await Qe(), oe(), Ie());
    }
    async function Qe({ isPoll: e = !1 } = {}) {
      try {
        const n = await (await fetch(`${he}/read?path=${encodeURIComponent(dt.value)}`)).json();
        if (n.error) {
          f(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          e || (d.value = [], ve = "", Re = null, f("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (e && Date.now() - Me < zi || n.content === ve) return;
        d.value = F(n.content), ve = n.content, await mt(), e || f(`Loaded ${d.value.length} line(s)`);
      } catch (t) {
        f(`Read failed: ${t}`);
      }
    }
    return nt(N, () => G(Fe)), nt(U, Wt), Pn(() => {
      Ct(), En(), oe(), $e(), we = setInterval(() => {
        oe({ silent: !0 }), $e();
      }, st), Qe().then(() => {
        be = setInterval(() => Qe({ isPoll: !0 }), st), Ie(), Ce = setInterval(() => Ie({ silent: !0 }), st);
      });
    }), Rn(() => {
      Ze(), be && clearInterval(be), we && clearInterval(we), Ce && clearInterval(Ce);
    }), (e, t) => (p(), g(B, null, [
      b(y(jt), {
        visible: R.value,
        "onUpdate:visible": t[9] || (t[9] = (n) => R.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: Te({ width: y(Dt) }),
        class: "line-editor-dialog"
      }, {
        header: M(() => [
          v("div", di, [
            v("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: je.value,
              disabled: !o.checkedApi || _.value,
              title: "Mark this script as checked for queueing (Script Library's tree)",
              onChange: t[0] || (t[0] = (n) => {
                je.value = n.target.checked, vn(n.target.checked);
              })
            }, null, 40, fi),
            b(y(A), {
              label: _.value ? "Done ✓" : "Done",
              size: "small",
              outlined: !_.value,
              disabled: mn.value,
              title: hn.value,
              onClick: yn
            }, null, 8, ["label", "outlined", "disabled", "title"]),
            v("div", pi, P(k.value), 1),
            v("div", vi, P(ut.value), 1),
            b(Hn, {
              presets: y(Nt),
              "set-width": y($t)
            }, null, 8, ["presets", "set-width"]),
            v("div", mi, [
              b(y(A), {
                label: "A−",
                text: "",
                size: "small",
                title: "Decrease line text font size",
                onClick: t[1] || (t[1] = (n) => {
                  U.value = Math.max(Mi, U.value - 1), C(ot, U.value);
                })
              }),
              b(y(A), {
                label: "A+",
                text: "",
                size: "small",
                title: "Increase line text font size",
                onClick: t[2] || (t[2] = (n) => {
                  U.value = Math.min(Ki, U.value + 1), C(ot, U.value);
                })
              })
            ])
          ])
        ]),
        default: M(() => [
          v("div", hi, [
            v("div", yi, [
              x.checking ? (p(), g("div", gi, "Checking for audio...")) : x.error ? (p(), g("div", ki, "Audio check failed: " + P(x.error), 1)) : x.best ? (p(), g(B, { key: 2 }, [
                v("div", bi, P(x.best), 1),
                v("audio", {
                  ref_key: "audioElRef",
                  ref: Ve,
                  controls: "",
                  class: "audio-el",
                  src: `${y(le)}/audio?path=${encodeURIComponent(y(W)(Se.value, x.best))}&v=${encodeURIComponent(x.mtime || "")}`,
                  onTimeupdate: Fe,
                  onPlay: t[3] || (t[3] = (n) => de.value = !0),
                  onPause: t[4] || (t[4] = (n) => de.value = !1),
                  onEnded: t[5] || (t[5] = (n) => de.value = !1)
                }, null, 40, wi),
                b(y(A), {
                  label: "🗑 Delete audio",
                  text: "",
                  size: "small",
                  disabled: fn.value,
                  title: _.value ? "Marked ready to release -- unmark it (Done) before deleting audio" : "Delete the rendered audio for this script",
                  onClick: pn
                }, null, 8, ["disabled", "title"])
              ], 64)) : (p(), g("div", Ci, "No audio yet in " + P(Se.value), 1)),
              b(y(A), {
                icon: "pi pi-refresh",
                text: "",
                size: "small",
                title: "Re-check _audio\\ for this script's rendered audio",
                onClick: t[6] || (t[6] = (n) => oe())
              })
            ]),
            Kt.value ? (p(), g("div", Li, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : D("", !0)
          ]),
          v("div", Si, [
            b(y(A), {
              label: "´ Stress mark",
              text: "",
              size: "small",
              title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
              onMousedown: ze(gn, ["prevent"])
            }),
            b(y(A), {
              label: "✂ Split line",
              text: "",
              size: "small",
              title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
              onMousedown: ze(kn, ["prevent"])
            }),
            b(y(A), {
              label: "+ Add line",
              text: "",
              size: "small",
              title: "Add a new empty line at the end of the script",
              onClick: bn
            }),
            t[10] || (t[10] = v("div", { class: "actions-divider" }, null, -1)),
            b(y(A), {
              label: "◀ Prev",
              text: "",
              size: "small",
              disabled: wn.value,
              title: "Open the previous script in this act",
              onClick: Ln
            }, null, 8, ["disabled"]),
            b(y(A), {
              label: "Next ▶",
              text: "",
              size: "small",
              disabled: Cn.value,
              title: "Open the next script in this act",
              onClick: Sn
            }, null, 8, ["disabled"])
          ]),
          v("div", {
            ref_key: "rowsContainerEl",
            ref: He,
            class: "rows-container"
          }, [
            (p(!0), g(B, null, rt(d.value, (n, i) => (p(), g("div", {
              key: n.__key,
              class: re(["fl-line-row", { "row-enter": Pe.value === n.__key, "row-playing": _.value ? Ne.value.get(i) === ke.value : fe.value === i }]),
              "data-row-index": i,
              ref_for: !0,
              ref: (l) => Xt(n.__key, l),
              style: Te(n.malformed ? {} : { borderLeftColor: ue(n.speaker) })
            }, [
              n.malformed ? (p(), g(B, { key: 0 }, [
                v("div", Ii, [
                  t[11] || (t[11] = v("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  b(y(A), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => gt(i, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                v("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: Te({ fontSize: `${U.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    ht(n.__key, l), G(() => _e(l));
                  },
                  onInput: (l) => {
                    n.raw = l.target.value, _e(l.target), z();
                  },
                  onKeydown: t[7] || (t[7] = xt(ze(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, xi)
              ], 64)) : (p(), g(B, { key: 1 }, [
                v("div", _i, [
                  v("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (l) => Yt(l, i)
                  }, "⠿", 512),
                  v("span", {
                    class: re(["play-btn", { "is-playing": wt(i), disabled: !Ge(i, n) }]),
                    title: Ge(i, n) ? _.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                    onClick: (l) => dn(n, i)
                  }, P(wt(i) ? "⏸" : "▶"), 11, Ti),
                  o.revoiceApi && !_.value ? (p(), g("span", {
                    key: 0,
                    class: re(["revoice-btn", { pending: ne.has(n), stale: !ne.has(n) && n.status === "stale" }]),
                    title: cn(n),
                    onClick: (l) => un(n)
                  }, P(ne.has(n) ? "⏳" : "🔁"), 11, Ai)) : D("", !0),
                  b(y(A), {
                    icon: "pi pi-user",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from _roles.json",
                    onClick: (l) => sn(l, n)
                  }, null, 8, ["onClick"]),
                  b(y(ct), {
                    class: "speaker-input",
                    "model-value": n.speaker,
                    title: "Speaker (preset or preset#tag)",
                    "onUpdate:modelValue": (l) => {
                      n.speaker = l, Qt(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  b(y(A), {
                    class: "speaker-file-btn",
                    text: "",
                    size: "small",
                    label: vt(n.speaker) || "(no speaker)",
                    disabled: !j.value.find((l) => l.code === n.speaker),
                    title: nn(n),
                    onClick: (l) => on(l, n)
                  }, null, 8, ["label", "disabled", "title", "onClick"]),
                  v("span", {
                    class: "role-info-btn",
                    onMouseenter: (l) => an(l.target, n.speaker),
                    onMouseleave: rn
                  }, "ℹ", 40, ji),
                  t[12] || (t[12] = v("div", { class: "spacer" }, null, -1)),
                  b(y(A), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => gt(i, n.text)
                  }, null, 8, ["onClick"])
                ]),
                v("div", Pi, [
                  b(y(A), {
                    icon: "pi pi-list",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from the instructions catalog (_instructions.json)",
                    onClick: (l) => ln(l, n)
                  }, null, 8, ["onClick"]),
                  b(y(ct), {
                    class: "instruct-input",
                    "model-value": n.instruct,
                    title: "Instruct text",
                    "onUpdate:modelValue": (l) => {
                      n.instruct = l, en(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"])
                ]),
                bt(n) ? (p(), g("div", Ri, "↳ " + P(bt(n)), 1)) : D("", !0),
                v("textarea", {
                  class: "fl-textarea",
                  style: Te({ fontSize: `${U.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    ht(n.__key, l), G(() => _e(l));
                  },
                  onInput: (l) => {
                    n.text = l.target.value, kt(n, l.target);
                  },
                  onKeydown: t[8] || (t[8] = xt(ze(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (l) => tn(n, l.target, l)
                }, null, 44, Oi)
              ], 64))
            ], 14, Ei))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      b(ui, {
        ref_key: "pickPanelRef",
        ref: De
      }, null, 512),
      b(y(Rt)),
      H.visible ? (p(), g("div", {
        key: 0,
        class: "role-info-popover",
        style: Te({ left: `${H.left}px`, top: `${H.top}px` })
      }, [
        Ye.value.message ? (p(), g("div", Di, P(Ye.value.message), 1)) : D("", !0),
        (p(!0), g(B, null, rt(Ye.value.fields, ([n, i]) => (p(), g("div", {
          key: n,
          class: "role-info-row"
        }, [
          v("span", $i, P(n), 1),
          v("span", Ni, P(i), 1)
        ]))), 128))
      ], 4)) : D("", !0)
    ], 64));
  }
}, Vi = /* @__PURE__ */ At(Ui, [["__scopeId", "data-v-43487bf8"]]);
function Xi({ folder: o, filename: s, suffix: u = "_speakers.txt", checkedApi: C, revoiceApi: w }) {
  Fn(import.meta.url);
  const a = document.createElement("div");
  document.body.appendChild(a);
  const L = zn(Vi, {
    folder: o,
    filename: s,
    suffix: u,
    checkedApi: C || null,
    revoiceApi: w || null,
    onClose: () => {
      L.unmount(), a.remove();
    }
  });
  L.use(Bn, { ripple: !0 }), L.use(Jn), L.mount(a);
}
export {
  Xi as openLineEditor
};
