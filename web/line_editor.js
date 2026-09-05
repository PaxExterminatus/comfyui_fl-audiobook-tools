import { q as wn, v as Cn, x as Lt, y as nt, d as f, c as ce, z as Ze, a as M, A as ae, f as b, n as re, e as v, C as X, j as h, F as B, D as it, i as D, t as j, s as A, E as St, R as Ln, U as Sn, G as J, H as En, Z as Ye, I as bt, T as In, J as wt, _ as Et, u as y, k as st, K as G, b as I, r as g, w as Ge, o as xn, L as _n, M as Te, S as le, N as Tn, B as An, O as he, l as W, Q as Qe, V as Pn, W as Fe, g as Ct, X as jn, Y as Rn, m as On, p as Dn, P as $n } from "./styles_link.js";
import { s as It, a as Nn, b as Fn, F as zn } from "./dialog.esm.js";
import { s as ot } from "./inputtext.esm.js";
import { O as ze, u as Bn, P as Mn } from "./PanelWidthButtons.js";
var ye = wn(), xt = Symbol();
function Kn() {
  var o = Cn(xt);
  if (!o)
    throw new Error("No PrimeVue Confirmation provided!");
  return o;
}
var Un = {
  install: function(i) {
    var u = {
      require: function(w) {
        ye.emit("confirm", w);
      },
      close: function() {
        ye.emit("close");
      }
    };
    i.config.globalProperties.$confirm = u, i.provide(xt, u);
  }
}, Vn = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var u = i.instance;
    return ["p-confirm-dialog-reject", u.confirmation && !u.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, Hn = Lt.extend({
  name: "confirmdialog",
  classes: Vn
}), qn = {
  name: "BaseConfirmDialog",
  extends: St,
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
  style: Hn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, _t = {
  name: "ConfirmDialog",
  extends: qn,
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
    this.confirmListener = function(u) {
      u && u.group === i.group && (i.confirmation = u, i.confirmation.onShow && i.confirmation.onShow(), i.visible = !0);
    }, this.closeListener = function() {
      i.visible = !1, i.confirmation = null;
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
    getCXOptions: function(i, u) {
      return {
        contenxt: {
          icon: i,
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
    CDialog: It,
    CDButton: A
  }
};
function Jn(o, i, u, C, w, a) {
  var L = nt("CDButton"), F = nt("CDialog");
  return f(), ce(F, {
    visible: w.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(T) {
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
  }, Ze({
    default: M(function() {
      return [o.$slots.container ? D("", !0) : (f(), h(B, {
        key: 0
      }, [o.$slots.message ? (f(), ce(it(o.$slots.message), {
        key: 1,
        message: w.confirmation
      }, null, 8, ["message"])) : (f(), h(B, {
        key: 0
      }, [ae(o.$slots, "icon", {}, function() {
        return [o.$slots.icon ? (f(), ce(it(o.$slots.icon), {
          key: 0,
          class: re(o.cx("icon"))
        }, null, 8, ["class"])) : w.confirmation.icon ? (f(), h("span", X({
          key: 1,
          class: [w.confirmation.icon, o.cx("icon")]
        }, o.ptm("icon")), null, 16)) : D("", !0)];
      }), v("span", X({
        class: o.cx("message")
      }, o.ptm("message")), j(a.message), 17)], 64))], 64))];
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
        onClick: i[0] || (i[0] = function(T) {
          return a.reject();
        }),
        autofocus: a.autoFocusReject,
        unstyled: o.unstyled,
        pt: o.ptm("rejectButton")
      }, Ze({
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
        onClick: i[1] || (i[1] = function(T) {
          return a.accept();
        }),
        autofocus: a.autoFocusAccept,
        unstyled: o.unstyled,
        pt: o.ptm("acceptButton")
      }, Ze({
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
_t.render = Jn;
var Wn = {
  root: function(i) {
    var u = i.instance;
    return ["p-overlaypanel p-component", {
      "p-ripple-disabled": u.$primevue.config.ripple === !1
    }];
  },
  content: "p-overlaypanel-content",
  closeButton: "p-overlaypanel-close p-link",
  closeIcon: "p-overlaypanel-close-icon"
}, Xn = Lt.extend({
  name: "overlaypanel",
  classes: Wn
}), Zn = {
  name: "BaseOverlayPanel",
  extends: St,
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
  style: Xn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Tt = {
  name: "OverlayPanel",
  extends: Zn,
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
    this.dismissable && this.unbindOutsideClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.destroyStyle(), this.unbindResizeListener(), this.target = null, this.container && this.autoZIndex && Ye.clear(this.container), this.overlayEventListener && (ze.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null), this.container = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    toggle: function(i, u) {
      this.visible ? this.hide() : this.show(i, u);
    },
    show: function(i, u) {
      this.visible = !0, this.eventTarget = i.currentTarget, this.target = u || i.currentTarget;
    },
    hide: function() {
      this.visible = !1;
    },
    onContentClick: function() {
      this.selfClick = !0;
    },
    onEnter: function(i) {
      var u = this;
      this.container.setAttribute(this.attributeSelector, ""), J.addStyles(i, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.dismissable && this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && Ye.set("overlay", i, this.baseZIndex + this.$primevue.config.zIndex.overlay), this.overlayEventListener = function(C) {
        u.container.contains(C.target) && (u.selfClick = !0);
      }, this.focus(), ze.on("overlay-click", this.overlayEventListener), this.$emit("show"), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    onLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.unbindDocumentKeyDownListener(), ze.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null, this.$emit("hide");
    },
    onAfterLeave: function(i) {
      this.autoZIndex && Ye.clear(i);
    },
    alignOverlay: function() {
      J.absolutePosition(this.container, this.target, !1);
      var i = J.getOffset(this.container), u = J.getOffset(this.target), C = 0;
      i.left < u.left && (C = u.left - i.left), this.container.style.setProperty("--overlayArrowLeft", "".concat(C, "px")), i.top < u.top && (this.container.setAttribute("data-p-overlaypanel-flipped", "true"), !this.isUnstyled && J.addClass(this.container, "p-overlaypanel-flipped"));
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
      !this.outsideClickListener && J.isClient() && (this.outsideClickListener = function(u) {
        i.visible && !i.selfClick && !i.isTargetClicked(u) && (i.visible = !1), i.selfClick = !1;
      }, document.addEventListener("click", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener), this.outsideClickListener = null, this.selfClick = !1);
    },
    bindScrollListener: function() {
      var i = this;
      this.scrollHandler || (this.scrollHandler = new En(this.target, function() {
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
    onOverlayClick: function(i) {
      ze.emit("overlay-click", {
        originalEvent: i,
        target: this.target
      });
    }
  },
  computed: {
    attributeSelector: function() {
      return Sn();
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    }
  },
  directives: {
    focustrap: zn,
    ripple: Ln
  },
  components: {
    Portal: Fn,
    TimesIcon: Nn
  }
}, Yn = ["aria-modal"], Gn = ["aria-label"];
function Qn(o, i, u, C, w, a) {
  var L = nt("Portal"), F = bt("ripple"), T = bt("focustrap");
  return f(), ce(L, {
    appendTo: o.appendTo
  }, {
    default: M(function() {
      return [b(In, X({
        name: "p-overlaypanel",
        onEnter: a.onEnter,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave
      }, o.ptm("transition")), {
        default: M(function() {
          return [w.visible ? wt((f(), h("div", X({
            key: 0,
            ref: a.containerRef,
            role: "dialog",
            "aria-modal": w.visible,
            onClick: i[5] || (i[5] = function() {
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
          }) : (f(), h(B, {
            key: 1
          }, [v("div", X({
            class: o.cx("content"),
            onClick: i[0] || (i[0] = function() {
              return a.onContentClick && a.onContentClick.apply(a, arguments);
            }),
            onMousedown: i[1] || (i[1] = function() {
              return a.onContentClick && a.onContentClick.apply(a, arguments);
            }),
            onKeydown: i[2] || (i[2] = function() {
              return a.onContentKeydown && a.onContentKeydown.apply(a, arguments);
            })
          }, o.ptm("content")), [ae(o.$slots, "default")], 16), o.showCloseIcon ? wt((f(), h("button", X({
            key: 0,
            class: o.cx("closeButton"),
            "aria-label": a.closeAriaLabel,
            type: "button",
            autofocus: "",
            onClick: i[3] || (i[3] = function() {
              return a.hide && a.hide.apply(a, arguments);
            }),
            onKeydown: i[4] || (i[4] = function() {
              return a.onButtonKeydown && a.onButtonKeydown.apply(a, arguments);
            })
          }, o.ptm("closeButton")), [ae(o.$slots, "closeicon", {}, function() {
            return [(f(), ce(it(o.closeIcon ? "span" : "TimesIcon"), X({
              class: [o.cx("closeIcon"), o.closeIcon]
            }, o.ptm("closeIcon")), null, 16, ["class"]))];
          })], 16, Gn)), [[F]]) : D("", !0)], 64))], 16, Yn)), [[T]]) : D("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Tt.render = Qn;
const ei = { class: "pick-panel-rows" }, ti = {
  key: 0,
  class: "pick-panel-empty"
}, ni = ["onClick"], ii = { class: "pick-panel-label" }, si = {
  key: 0,
  class: "pick-panel-sublabel"
}, oi = {
  __name: "PickPanel",
  setup(o, { expose: i }) {
    const u = g(null), C = g(""), w = g([]), a = g((R) => String(R)), L = g(null), F = g(null), T = I(() => w.value.length > 6), ue = I(() => {
      const R = C.value.trim().toLowerCase();
      return R ? w.value.filter((k) => {
        const d = a.value(k) || "", $ = L.value && L.value(k) || "";
        return `${d} ${$}`.toLowerCase().includes(R);
      }) : w.value;
    });
    function Q(R, { items: k, getLabel: d, getSubLabel: $, onPick: P }) {
      w.value = k, a.value = d, L.value = $ || null, F.value = P, C.value = "", u.value.toggle(R), G(() => {
        var K, ee;
        return (ee = (K = u.value.$el) == null ? void 0 : K.querySelector("input")) == null ? void 0 : ee.focus();
      });
    }
    function ge(R) {
      var k;
      (k = F.value) == null || k.call(F, R), u.value.hide();
    }
    return i({ open: Q }), (R, k) => (f(), ce(y(Tt), {
      ref_key: "panelRef",
      ref: u,
      class: "pick-panel"
    }, {
      default: M(() => [
        T.value ? (f(), ce(y(ot), {
          key: 0,
          modelValue: C.value,
          "onUpdate:modelValue": k[0] || (k[0] = (d) => C.value = d),
          placeholder: "Type to filter...",
          class: "pick-panel-filter"
        }, null, 8, ["modelValue"])) : D("", !0),
        v("div", ei, [
          ue.value.length ? D("", !0) : (f(), h("div", ti, "(no matches)")),
          (f(!0), h(B, null, st(ue.value, (d, $) => (f(), h("div", {
            key: $,
            class: "pick-panel-row",
            onClick: (P) => ge(d)
          }, [
            v("div", ii, j(a.value(d)), 1),
            L.value && L.value(d) ? (f(), h("div", si, j(L.value(d)), 1)) : D("", !0)
          ], 8, ni))), 128))
        ])
      ]),
      _: 1
    }, 512));
  }
}, li = /* @__PURE__ */ Et(oi, [["__scopeId", "data-v-6120c799"]]), ai = { class: "header-row" }, ri = ["checked", "disabled"], ci = { class: "title-el" }, ui = { class: "status-el" }, di = { class: "font-row" }, fi = { class: "audio-row" }, pi = { class: "audio-content-row" }, vi = {
  key: 0,
  class: "muted-note"
}, mi = {
  key: 1,
  class: "muted-note"
}, hi = { class: "audio-label" }, yi = ["src"], gi = {
  key: 3,
  class: "muted-note"
}, ki = {
  key: 0,
  class: "timing-warning"
}, bi = { class: "actions-row" }, wi = ["data-row-index"], Ci = { class: "malformed-warn-line" }, Li = ["value", "onInput"], Si = { class: "top-line" }, Ei = ["title", "onClick"], Ii = ["title", "onClick"], xi = ["onMouseenter"], _i = { class: "instruct-line" }, Ti = {
  key: 0,
  class: "instruct-desc"
}, Ai = ["value", "onInput", "onPaste"], Pi = { key: 0 }, ji = { class: "role-info-key" }, Ri = { class: "role-info-value" }, Oi = 600, et = 3e3, Di = 1500, $i = 11.5, Ni = 9, Fi = 22, tt = "FL_CosyVoice3.LineEditor.textFontSizePx", zi = {
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
    const i = o;
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
    const Q = Kn();
    function ge({ title: e = "Confirm", message: t = "", okText: n = "OK", cancelText: s = "Cancel" } = {}) {
      return new Promise((l) => {
        Q.require({
          header: e,
          message: t,
          acceptLabel: n,
          rejectLabel: s,
          accept: () => l(!0),
          reject: () => l(!1),
          onHide: () => l(!1)
        });
      });
    }
    const R = g(!0), k = g(i.filename), d = g([]), $ = g([]), P = g([]), K = g(null), ee = g([]), Ae = g([]), te = g([]), lt = g(""), { cssWidth: At, setWidth: Pt, presets: jt } = Bn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), U = g(u(tt, $i)), V = g(null), ke = g(-1), de = g(!1), fe = g(-1), Pe = g(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), x = Qe({ checking: !0, best: null, mtime: null, error: null }), H = Qe({ visible: !1, top: 0, left: 0, code: null }), je = g(null), ne = Qe(/* @__PURE__ */ new Set());
    let pe = 1, ve = null, Re = null, Be = 0, me = null, ie = null, Z = null, be = null, we = null, Ce = null, Me = !1, Ke = null, Le = null;
    const Ue = g(null), Ve = g(null), Oe = /* @__PURE__ */ new Map(), He = /* @__PURE__ */ new Map(), De = g(null), at = I(() => W(i.folder, k.value)), Se = I(() => W(i.folder, "_audio")), se = I(() => Pn(k.value, i.suffix)), rt = I(() => W(W(Se.value, "lines"), se.value)), ct = I(() => W(rt.value, "_state.json")), _ = I(() => Ae.value.includes(k.value)), qe = I(() => {
      const e = d.value.filter((t) => !t.malformed);
      return e.length > 0 && e.every((t) => t.status === "voiced");
    });
    function p(e) {
      lt.value = e;
    }
    function ut(e) {
      if (!e) return "";
      const t = P.value.find((l) => l.code === e), n = t && t.speaker ? t.speaker : e, s = String(n).split("#", 1)[0].trim();
      return s ? `${s}.pt` : "";
    }
    function Rt() {
      const e = {};
      return P.value.forEach((t) => {
        const n = String(t.speaker || "").split("#", 1)[0].trim();
        !n || !t.code || (e[n] = e[n] || []).push(t.code);
      }), e;
    }
    async function Ot() {
      if (!K.value)
        return p("No _roles.json found for this project -- can't save"), !1;
      try {
        const t = await (await fetch(`${he}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: K.value, content: JSON.stringify({ roles: P.value }, null, 2) })
        })).json();
        return t.error ? (p(`Error saving _roles.json: ${t.error}`), !1) : !0;
      } catch (e) {
        return p(`Error saving _roles.json: ${e}`), !1;
      }
    }
    async function Dt(e) {
      if (!K.value) return;
      const t = jn(K.value), n = await Rn(t, e, i.suffix);
      p(n.message), (n.changed.some((s) => s.file === k.value) || n.untracked.some((s) => s.file === k.value)) && (await dt(), await gt(), me = null, ie = null, oe(), Ie());
    }
    function $t(e, t) {
      if (!Array.isArray(e) || !e.length) return null;
      const n = [];
      return t.forEach((s, l) => {
        s.malformed || n.push(l);
      }), n.length !== e.length ? null : { lines: e, rowIndexMap: n };
    }
    const N = I(() => _.value ? $t(V.value, d.value) : null), $e = I(() => {
      const e = /* @__PURE__ */ new Map();
      return N.value && N.value.rowIndexMap.forEach((t, n) => e.set(t, n)), e;
    }), Nt = I(() => !!(_.value && V.value && V.value.length && !N.value));
    function Ft() {
      return JSON.stringify({
        next_id: pe,
        lines: d.value.filter((e) => !e.malformed).map((e) => ({ id: e.id, text: e.text, status: e.status }))
      }, null, 2);
    }
    function zt(e, t) {
      const n = t && Array.isArray(t.lines) ? t.lines : [];
      let s = t && Number.isFinite(t.next_id) ? t.next_id : 1;
      const l = e.filter((c) => !c.malformed);
      if (n.length === l.length)
        return l.forEach((c, S) => {
          const E = n[S];
          c.id = Number.isFinite(E.id) ? E.id : s++;
          const O = (E.text || "") === c.text;
          c.status = O ? E.status === "voiced" || E.status === "stale" ? E.status : "unvoiced" : E.status === "voiced" || E.status === "stale" ? "stale" : "unvoiced";
        }), Math.max(s, ...l.map((c) => c.id + 1), 1);
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
          m.set(S, O + 1), c.id = Number.isFinite(q.id) ? q.id : s++, c.status = q.status === "voiced" ? "voiced" : "unvoiced";
        } else
          c.id = s++, c.status = "unvoiced";
      }), s;
    }
    async function dt() {
      let e = null, t = null;
      try {
        const s = await (await fetch(`${he}/read?path=${encodeURIComponent(ct.value)}`)).json();
        if (s.exists) {
          t = s.content;
          try {
            e = JSON.parse(s.content);
          } catch {
            e = null;
          }
        }
      } catch {
        e = null;
      }
      pe = zt(d.value, e), Re = t;
    }
    function Ee(e) {
      e.status === "voiced" && (e.status = "stale");
    }
    function Je() {
      Le && (Le.pause(), Le.src = "", Le = null), fe.value = -1;
    }
    function Bt(e) {
      Je();
      const t = rt.value, n = (s) => {
        for (; s < d.value.length && (d.value[s].malformed || d.value[s].status === "unvoiced"); ) s++;
        if (s >= d.value.length) {
          fe.value = -1;
          return;
        }
        fe.value = s;
        const l = d.value[s], r = new Audio(`${le}/audio?path=${encodeURIComponent(W(t, `id${l.id}.wav`))}&v=${Date.now()}`);
        Le = r, r.addEventListener("ended", () => n(s + 1)), r.play().catch((m) => p(`Playback failed: ${m}`));
      };
      n(e);
    }
    function Ne() {
      var s;
      const e = Ue.value;
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
        const l = N.value.rowIndexMap[n], r = l !== void 0 ? Oe.get((s = d.value[l]) == null ? void 0 : s.__key) : null;
        r == null || r.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function Ie({ silent: e = !1 } = {}) {
      const t = W(W(Se.value, "timing"), `${se.value}.json`);
      try {
        const s = await (await fetch(`${he}/read?path=${encodeURIComponent(t)}`)).json();
        if (!s.exists) {
          V.value = null, ie = null;
          return;
        }
        if (e && s.mtime === ie) return;
        const l = s.mtime !== ie;
        ie = s.mtime;
        let r;
        try {
          r = JSON.parse(s.content);
        } catch {
          V.value = null;
          return;
        }
        V.value = Array.isArray(r.lines) ? r.lines : null;
        const m = d.value.filter((c) => !c.malformed);
        l && V.value && V.value.length === m.length && m.length > 0 && await Mt(m), G(Ne);
      } catch {
      }
    }
    async function Mt(e) {
      try {
        const n = await (await fetch(`${le}/commit_full_render`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: i.folder,
            base_name: se.value,
            row_texts: e.map((l) => l.text),
            row_ids: e.map((l) => Number.isFinite(l.id) ? l.id : null)
          })
        })).json();
        if (n.error || !Array.isArray(n.ids)) return;
        const s = new Set(n.committed_ids || []);
        e.forEach((l, r) => {
          l.id = n.ids[r], s.has(n.ids[r]) && (l.status = "voiced");
        }), Number.isFinite(n.next_id) && (pe = Math.max(pe, n.next_id)), s.size && xe();
      } catch {
      }
    }
    function Kt() {
      Me || (Me = !0, Z && (clearTimeout(Z), xe()), be && clearInterval(be), we && clearInterval(we), Ce && clearInterval(Ce), i.onClose());
    }
    Ge(R, (e) => {
      e || Kt();
    });
    function z() {
      Be = Date.now(), Z && clearTimeout(Z), Z = setTimeout(xe, Oi);
    }
    async function xe() {
      const e = T(d.value), t = Ft(), n = e !== ve, s = t !== Re;
      if (!(!n && !s))
        try {
          if (n) {
            const r = await (await fetch(`${he}/write`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: at.value, content: e })
            })).json();
            if (r.error) {
              p(`Save error: ${r.error}`);
              return;
            }
            ve = e;
          }
          s && (await fetch(`${he}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: ct.value, content: t })
          }), Re = t), p(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (l) {
          p(`Save failed: ${l}`);
        }
    }
    function _e(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function ft(e, t) {
      if (!t) {
        He.delete(e);
        return;
      }
      He.set(e, t.$el ?? t);
    }
    function Ut() {
      G(() => He.forEach(_e));
    }
    function Vt(e, t) {
      if (!t) {
        Oe.delete(e);
        return;
      }
      Oe.set(e, t);
    }
    async function pt(e) {
      var n;
      je.value = e, await G();
      const t = Oe.get(e);
      t == null || t.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = t == null ? void 0 : t.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        je.value === e && (je.value = null);
      }, 500);
    }
    async function Ht(e, t) {
      const n = d.value[e], s = d.value[t];
      if (!n || !s || n.malformed || s.malformed) return;
      const l = Math.min(e, t), r = Math.max(e, t), m = d.value[l], c = d.value[r];
      (m.speaker || "").trim() !== (c.speaker || "").trim() && !await ge({
        title: "Merge lines with different speakers?",
        message: `"${m.speaker}" and "${c.speaker}" are different speakers. Merge anyway? The combined line keeps "${m.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }) || (m.text = `${m.text} ${c.text}`.trim(), m.status = "unvoiced", d.value.splice(r, 1), z());
    }
    function qt(e, t) {
      !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const s = e.closest(".fl-line-row");
        Ke = Number(s == null ? void 0 : s.dataset.rowIndex), s == null || s.classList.add("fl-row-dragging");
        const l = (m) => {
          var E;
          (E = Ve.value) == null || E.querySelectorAll(".fl-row-drop-target").forEach((O) => O.classList.remove("fl-row-drop-target"));
          const c = document.elementFromPoint(m.clientX, m.clientY), S = c && c.closest ? c.closest(".fl-line-row") : null;
          S && S !== s && S.classList.add("fl-row-drop-target");
        }, r = (m) => {
          var O;
          document.removeEventListener("pointermove", l), document.removeEventListener("pointerup", r), document.removeEventListener("pointercancel", r);
          const c = document.elementFromPoint(m.clientX, m.clientY), S = c && c.closest ? c.closest(".fl-line-row") : null, E = Ke;
          if (Ke = null, s == null || s.classList.remove("fl-row-dragging"), (O = Ve.value) == null || O.querySelectorAll(".fl-row-drop-target").forEach((q) => q.classList.remove("fl-row-drop-target")), S && S !== s) {
            const q = Number(S.dataset.rowIndex);
            Number.isNaN(q) || Ht(E, q);
          }
        };
        document.addEventListener("pointermove", l), document.addEventListener("pointerup", r), document.addEventListener("pointercancel", r);
      }));
    }
    function Jt(e) {
      d.value.splice(e, 1), z();
    }
    async function vt(e, t) {
      t && t.trim() && !await ge({
        title: "Delete this line?",
        message: t.length > 200 ? t.slice(0, 200) + "…" : t,
        okText: "Delete",
        cancelText: "Cancel"
      }) || Jt(e);
    }
    function Wt(e) {
      Ee(e), z();
    }
    function Xt(e) {
      Ee(e), z();
    }
    function mt(e, t) {
      _e(t), Ee(e), z();
    }
    function Zt(e, t, n) {
      n.preventDefault();
      const s = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), l = t.selectionStart, r = t.selectionEnd;
      t.value = t.value.slice(0, l) + s + t.value.slice(r), t.selectionStart = t.selectionEnd = l + s.length, e.text = t.value, mt(e, t);
    }
    function Yt(e) {
      const t = P.value.find((s) => s.code === e.speaker), n = ut(e.speaker);
      return t ? `Change "${t.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${e.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function ht(e) {
      const t = $.value.find((n) => (n.text || "").trim() === e.instruct.trim());
      return t && t.note ? t.note : null;
    }
    function Gt(e, t) {
      if (!P.value.length) {
        p("No roles catalog found for this project (_roles.json)");
        return;
      }
      De.value.open(e, {
        items: P.value,
        getLabel: (n) => n.code || n.speaker || "",
        getSubLabel: (n) => [n.name, n.speaker, n.description].filter(Boolean).join(" -- "),
        onPick: (n) => {
          const s = n.code || n.speaker || "";
          t.speaker = s, Ee(t), z();
        }
      });
    }
    function Qt(e, t) {
      const n = P.value.find((l) => l.code === t.speaker);
      if (!n) return;
      if (!ee.value.length) {
        p("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
        return;
      }
      const s = Rt();
      De.value.open(e, {
        items: ee.value,
        getLabel: (l) => l,
        getSubLabel: (l) => {
          const r = s[l] || [];
          return r.length ? `used by: ${r.join(", ")} -- ${r.length} role(s)` : "not used by any role yet";
        },
        onPick: async (l) => {
          n.speaker = l, await Ot() && (p(`"${n.code}" now uses "${l}" for the whole play`), await Dt(n.code));
        }
      });
    }
    function en(e, t) {
      if (!$.value.length) {
        p("No instructions catalog found for this project (_instructions.json)");
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
    function tn(e, t) {
      const n = e.getBoundingClientRect();
      H.left = Math.min(n.left, window.innerWidth - 280), H.top = n.bottom + 4, H.code = t, H.visible = !0;
    }
    function nn() {
      H.visible = !1;
    }
    const We = I(() => {
      const e = H.code;
      if (!e) return { message: "No speaker set on this line yet" };
      const t = P.value.find((s) => s.code === e);
      if (!t) return { message: `"${e}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(t).filter(([, s]) => s !== "" && s !== null && s !== void 0 && s !== t.__key);
      return n.length ? { fields: n } : { message: `"${e}" has no fields set in _roles.json` };
    });
    function sn(e) {
      return ne.has(e) ? "Re-voicing..." : e.status === "stale" ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : e.status === "voiced" ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function on(e) {
      if (!ne.has(e)) {
        ne.add(e), p("Re-voicing...");
        try {
          await i.revoiceApi.revoiceLine({ lineId: e.id, speaker: e.speaker, instruct: e.instruct, text: e.text }), e.status = "voiced", p("Line re-voiced");
        } catch (t) {
          p(`Re-voice failed: ${t.message || t}`);
        } finally {
          ne.delete(e), xe();
        }
      }
    }
    function yt(e) {
      return (_.value ? ke.value === $e.value.get(e) : fe.value === e) && de.value;
    }
    function ln(e, t) {
      if (_.value) {
        const s = $e.value.get(t), l = Ue.value;
        if (s === void 0 || !l || !N.value) return;
        l.currentTime = N.value.lines[s].start, l.play();
      } else fe.value === t ? Je() : Bt(t);
    }
    async function oe({ silent: e = !1 } = {}) {
      e || (x.checking = !0);
      try {
        const n = await (await fetch(`${An}?path=${encodeURIComponent(Se.value)}`)).json(), s = Array.isArray(n.files) ? n.files : [], l = n.file_mtimes || {}, r = se.value.toLowerCase(), m = s.filter((E) => {
          const O = E.lastIndexOf(".");
          return (O > 0 ? E.slice(0, O) : E).toLowerCase().startsWith(r);
        });
        m.sort();
        const c = m.length ? m[m.length - 1] : null, S = c ? `${c}::${l[c] || ""}` : null;
        if (e && S === me) return;
        me = S, x.checking = !1, x.error = null, x.best = c, x.mtime = c ? l[c] || Date.now() : null, c || (de.value = !1, G(Ne));
      } catch (t) {
        x.checking = !1, x.error = String(t);
      }
    }
    const an = I(() => !x.best || _.value);
    async function rn() {
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
            body: JSON.stringify({ folder: i.folder, base_name: se.value, filename: k.value })
          })).json();
          if (n.error) {
            p(`Error: ${n.error}`);
            return;
          }
          p(`Deleted ${n.deleted.length} audio file(s)`), me = null, oe();
        } catch (t) {
          p(`Error: ${t}`);
        }
    }
    function cn(e) {
      var t;
      (t = i.checkedApi) == null || t.setChecked(k.value, e);
    }
    const un = I(() => !_.value && !qe.value), dn = I(() => _.value ? "Marked ready to release -- click to unmark and go back to editing" : qe.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function fn() {
      var t;
      const e = !_.value;
      if (e && !qe.value) {
        p("Every line needs to be voiced before marking done");
        return;
      }
      if (e) {
        p("Stitching final file...");
        const n = d.value.filter((s) => !s.malformed);
        try {
          const l = await (await fetch(`${le}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: i.folder,
              base_name: se.value,
              line_ids: n.map((r) => r.id),
              line_texts: n.map((r) => r.text)
            })
          })).json();
          if (l.error) {
            p(`Stitch error: ${l.error}`);
            return;
          }
        } catch (s) {
          p(`Stitch failed: ${s}`);
          return;
        }
      }
      try {
        const s = await (await fetch(`${le}/set_ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: i.folder, filename: k.value, ready: e })
        })).json();
        if (s.error) {
          p(`Error: ${s.error}`);
          return;
        }
        Ae.value = s.ready_scripts || [], e && ((t = i.checkedApi) == null || t.setChecked(k.value, !1), Pe.value = !1), p(e ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again"), e && (me = null, ie = null, oe(), Ie());
      } catch (n) {
        p(`Error: ${n}`);
      }
    }
    function pn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" && e.tagName !== "INPUT") {
        p("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const t = e.selectionStart;
      e.value = e.value.slice(0, t) + "́" + e.value.slice(t), e.selectionStart = e.selectionEnd = t + 1, e.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function vn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
        p("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const t = e.closest(".fl-line-row"), n = t ? Number(t.dataset.rowIndex) : -1, s = n >= 0 ? d.value[n] : null;
      if (!s || s.malformed) {
        p("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const l = e.selectionStart, r = s.text.slice(0, l).trimEnd(), m = s.text.slice(l).trimStart();
      s.text = r, s.status = "unvoiced";
      const c = L({ speaker: s.speaker, instruct: s.instruct, text: m, raw: "", malformed: !1, id: pe++, status: "unvoiced" });
      d.value.splice(n + 1, 0, c), pt(c.__key), z();
    }
    function mn() {
      const e = L({ speaker: "", instruct: "", text: "", raw: "", malformed: !1, id: pe++, status: "unvoiced" });
      d.value.push(e), pt(e.__key), z();
    }
    const Y = I(() => te.value.indexOf(k.value)), hn = I(() => !(Y.value > 0)), yn = I(() => !(Y.value >= 0 && Y.value < te.value.length - 1));
    function gn() {
      Y.value > 0 && kt(te.value[Y.value - 1]);
    }
    function kn() {
      Y.value >= 0 && Y.value < te.value.length - 1 && kt(te.value[Y.value + 1]);
    }
    async function bn() {
      try {
        const t = await (await fetch(Tn)).json();
        ee.value = t.presets || [];
      } catch {
        ee.value = [];
      }
    }
    async function gt() {
      var e, t, n;
      try {
        const s = `${le}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, r = await (await fetch(s)).json();
        $.value = ((e = r.instructions) == null ? void 0 : e.entries) || [], P.value = ((t = r.roles) == null ? void 0 : t.entries) || [], K.value = ((n = r.roles) == null ? void 0 : n.path) || null, te.value = Array.isArray(r.scripts) ? r.scripts : [], Ae.value = Array.isArray(r.ready_scripts) ? r.ready_scripts : [];
      } catch {
        $.value = [], P.value = [], K.value = null, te.value = [], Ae.value = [];
      }
    }
    async function kt(e) {
      !e || e === k.value || Me || (Z && (clearTimeout(Z), Z = null, await xe()), k.value = e, me = null, V.value = null, ie = null, d.value = [], ve = null, Be = 0, Pe.value = i.checkedApi ? i.checkedApi.isChecked(e) : !1, p("Loading..."), await Xe(), oe(), Ie());
    }
    async function Xe({ isPoll: e = !1 } = {}) {
      try {
        const n = await (await fetch(`${he}/read?path=${encodeURIComponent(at.value)}`)).json();
        if (n.error) {
          p(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          e || (d.value = [], ve = "", Re = null, p("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (e && Date.now() - Be < Di || n.content === ve) return;
        d.value = F(n.content), ve = n.content, await dt(), e || p(`Loaded ${d.value.length} line(s)`);
      } catch (t) {
        p(`Read failed: ${t}`);
      }
    }
    return Ge(N, () => G(Ne)), Ge(U, Ut), xn(() => {
      gt(), bn(), oe(), we = setInterval(() => oe({ silent: !0 }), et), Xe().then(() => {
        be = setInterval(() => Xe({ isPoll: !0 }), et), Ie(), Ce = setInterval(() => Ie({ silent: !0 }), et);
      });
    }), _n(() => {
      Je(), be && clearInterval(be), we && clearInterval(we), Ce && clearInterval(Ce);
    }), (e, t) => (f(), h(B, null, [
      b(y(It), {
        visible: R.value,
        "onUpdate:visible": t[9] || (t[9] = (n) => R.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: Te({ width: y(At) }),
        class: "line-editor-dialog"
      }, {
        header: M(() => [
          v("div", ai, [
            v("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: Pe.value,
              disabled: !o.checkedApi || _.value,
              title: "Mark this script as checked for queueing (Script Library's tree)",
              onChange: t[0] || (t[0] = (n) => {
                Pe.value = n.target.checked, cn(n.target.checked);
              })
            }, null, 40, ri),
            b(y(A), {
              label: _.value ? "Done ✓" : "Done",
              size: "small",
              outlined: !_.value,
              disabled: un.value,
              title: dn.value,
              onClick: fn
            }, null, 8, ["label", "outlined", "disabled", "title"]),
            v("div", ci, j(k.value), 1),
            v("div", ui, j(lt.value), 1),
            b(Mn, {
              presets: y(jt),
              "set-width": y(Pt)
            }, null, 8, ["presets", "set-width"]),
            v("div", di, [
              b(y(A), {
                label: "A−",
                text: "",
                size: "small",
                title: "Decrease line text font size",
                onClick: t[1] || (t[1] = (n) => {
                  U.value = Math.max(Ni, U.value - 1), C(tt, U.value);
                })
              }),
              b(y(A), {
                label: "A+",
                text: "",
                size: "small",
                title: "Increase line text font size",
                onClick: t[2] || (t[2] = (n) => {
                  U.value = Math.min(Fi, U.value + 1), C(tt, U.value);
                })
              })
            ])
          ])
        ]),
        default: M(() => [
          v("div", fi, [
            v("div", pi, [
              x.checking ? (f(), h("div", vi, "Checking for audio...")) : x.error ? (f(), h("div", mi, "Audio check failed: " + j(x.error), 1)) : x.best ? (f(), h(B, { key: 2 }, [
                v("div", hi, j(x.best), 1),
                v("audio", {
                  ref_key: "audioElRef",
                  ref: Ue,
                  controls: "",
                  class: "audio-el",
                  src: `${y(le)}/audio?path=${encodeURIComponent(y(W)(Se.value, x.best))}&v=${encodeURIComponent(x.mtime || "")}`,
                  onTimeupdate: Ne,
                  onPlay: t[3] || (t[3] = (n) => de.value = !0),
                  onPause: t[4] || (t[4] = (n) => de.value = !1),
                  onEnded: t[5] || (t[5] = (n) => de.value = !1)
                }, null, 40, yi),
                b(y(A), {
                  label: "🗑 Delete audio",
                  text: "",
                  size: "small",
                  disabled: an.value,
                  title: _.value ? "Marked ready to release -- unmark it (Done) before deleting audio" : "Delete the rendered audio for this script",
                  onClick: rn
                }, null, 8, ["disabled", "title"])
              ], 64)) : (f(), h("div", gi, "No audio yet in " + j(Se.value), 1)),
              b(y(A), {
                icon: "pi pi-refresh",
                text: "",
                size: "small",
                title: "Re-check _audio\\ for this script's rendered audio",
                onClick: t[6] || (t[6] = (n) => oe())
              })
            ]),
            Nt.value ? (f(), h("div", ki, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : D("", !0)
          ]),
          v("div", bi, [
            b(y(A), {
              label: "´ Stress mark",
              text: "",
              size: "small",
              title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
              onMousedown: Fe(pn, ["prevent"])
            }),
            b(y(A), {
              label: "✂ Split line",
              text: "",
              size: "small",
              title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
              onMousedown: Fe(vn, ["prevent"])
            }),
            b(y(A), {
              label: "+ Add line",
              text: "",
              size: "small",
              title: "Add a new empty line at the end of the script",
              onClick: mn
            }),
            t[10] || (t[10] = v("div", { class: "actions-divider" }, null, -1)),
            b(y(A), {
              label: "◀ Prev",
              text: "",
              size: "small",
              disabled: hn.value,
              title: "Open the previous script in this act",
              onClick: gn
            }, null, 8, ["disabled"]),
            b(y(A), {
              label: "Next ▶",
              text: "",
              size: "small",
              disabled: yn.value,
              title: "Open the next script in this act",
              onClick: kn
            }, null, 8, ["disabled"])
          ]),
          v("div", {
            ref_key: "rowsContainerEl",
            ref: Ve,
            class: "rows-container"
          }, [
            (f(!0), h(B, null, st(d.value, (n, s) => (f(), h("div", {
              key: n.__key,
              class: re(["fl-line-row", { "row-enter": je.value === n.__key, "row-playing": _.value ? $e.value.get(s) === ke.value : fe.value === s }]),
              "data-row-index": s,
              ref_for: !0,
              ref: (l) => Vt(n.__key, l),
              style: Te(n.malformed ? {} : { borderLeftColor: ue(n.speaker) })
            }, [
              n.malformed ? (f(), h(B, { key: 0 }, [
                v("div", Ci, [
                  t[11] || (t[11] = v("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  b(y(A), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => vt(s, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                v("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: Te({ fontSize: `${U.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    ft(n.__key, l), G(() => _e(l));
                  },
                  onInput: (l) => {
                    n.raw = l.target.value, _e(l.target), z();
                  },
                  onKeydown: t[7] || (t[7] = Ct(Fe(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, Li)
              ], 64)) : (f(), h(B, { key: 1 }, [
                v("div", Si, [
                  v("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (l) => qt(l, s)
                  }, "⠿", 512),
                  (_.value ? $e.value.get(s) !== void 0 : n.status !== "unvoiced") ? (f(), h("span", {
                    key: 0,
                    class: re(["play-btn", { "is-playing": yt(s) }]),
                    title: _.value ? "Play from this line" : "Play this line (and every voiced line after it)",
                    onClick: (l) => ln(n, s)
                  }, j(yt(s) ? "⏸" : "▶"), 11, Ei)) : D("", !0),
                  o.revoiceApi && !_.value ? (f(), h("span", {
                    key: 1,
                    class: re(["revoice-btn", { pending: ne.has(n), stale: !ne.has(n) && n.status === "stale" }]),
                    title: sn(n),
                    onClick: (l) => on(n)
                  }, j(ne.has(n) ? "⏳" : "🔁"), 11, Ii)) : D("", !0),
                  b(y(A), {
                    icon: "pi pi-user",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from _roles.json",
                    onClick: (l) => Gt(l, n)
                  }, null, 8, ["onClick"]),
                  b(y(ot), {
                    class: "speaker-input",
                    "model-value": n.speaker,
                    title: "Speaker (preset or preset#tag)",
                    "onUpdate:modelValue": (l) => {
                      n.speaker = l, Wt(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  b(y(A), {
                    class: "speaker-file-btn",
                    text: "",
                    size: "small",
                    label: ut(n.speaker) || "(no speaker)",
                    disabled: !P.value.find((l) => l.code === n.speaker),
                    title: Yt(n),
                    onClick: (l) => Qt(l, n)
                  }, null, 8, ["label", "disabled", "title", "onClick"]),
                  v("span", {
                    class: "role-info-btn",
                    onMouseenter: (l) => tn(l.target, n.speaker),
                    onMouseleave: nn
                  }, "ℹ", 40, xi),
                  t[12] || (t[12] = v("div", { class: "spacer" }, null, -1)),
                  b(y(A), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => vt(s, n.text)
                  }, null, 8, ["onClick"])
                ]),
                v("div", _i, [
                  b(y(A), {
                    icon: "pi pi-list",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from the instructions catalog (_instructions.json)",
                    onClick: (l) => en(l, n)
                  }, null, 8, ["onClick"]),
                  b(y(ot), {
                    class: "instruct-input",
                    "model-value": n.instruct,
                    title: "Instruct text",
                    "onUpdate:modelValue": (l) => {
                      n.instruct = l, Xt(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"])
                ]),
                ht(n) ? (f(), h("div", Ti, "↳ " + j(ht(n)), 1)) : D("", !0),
                v("textarea", {
                  class: "fl-textarea",
                  style: Te({ fontSize: `${U.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    ft(n.__key, l), G(() => _e(l));
                  },
                  onInput: (l) => {
                    n.text = l.target.value, mt(n, l.target);
                  },
                  onKeydown: t[8] || (t[8] = Ct(Fe(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (l) => Zt(n, l.target, l)
                }, null, 44, Ai)
              ], 64))
            ], 14, wi))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      b(li, {
        ref_key: "pickPanelRef",
        ref: De
      }, null, 512),
      b(y(_t)),
      H.visible ? (f(), h("div", {
        key: 0,
        class: "role-info-popover",
        style: Te({ left: `${H.left}px`, top: `${H.top}px` })
      }, [
        We.value.message ? (f(), h("div", Pi, j(We.value.message), 1)) : D("", !0),
        (f(!0), h(B, null, st(We.value.fields, ([n, s]) => (f(), h("div", {
          key: n,
          class: "role-info-row"
        }, [
          v("span", ji, j(n), 1),
          v("span", Ri, j(s), 1)
        ]))), 128))
      ], 4)) : D("", !0)
    ], 64));
  }
}, Bi = /* @__PURE__ */ Et(zi, [["__scopeId", "data-v-32a491c6"]]);
function Hi({ folder: o, filename: i, suffix: u = "_speakers.txt", checkedApi: C, revoiceApi: w }) {
  On(import.meta.url);
  const a = document.createElement("div");
  document.body.appendChild(a);
  const L = Dn(Bi, {
    folder: o,
    filename: i,
    suffix: u,
    checkedApi: C || null,
    revoiceApi: w || null,
    onClose: () => {
      L.unmount(), a.remove();
    }
  });
  L.use($n, { ripple: !0 }), L.use(Un), L.mount(a);
}
export {
  Hi as openLineEditor
};
