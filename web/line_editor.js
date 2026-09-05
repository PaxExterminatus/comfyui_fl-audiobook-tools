import { q as xn, s as _n, B as Pt, v as at, d, c as ce, x as tt, a as U, y as ae, f as k, n as re, e as v, z as Y, j as h, F as z, A as rt, i as R, t as P, C as jt, R as Tn, U as An, D as Z, E as Pn, Z as nt, G as It, T as jn, H as xt, _ as Rt, u as g, k as Ue, I as ee, b as S, r as y, w as it, o as Rn, J as Dn, K as Pe, S as le, L as On, M as ge, l as X, N as st, O as $n, Q as Me, g as _t, V as Nn, W as Fn, m as zn, p as Bn, P as Mn } from "./styles_link.js";
import { s as Dt, a as Kn, b as Un, F as Hn } from "./dialog.esm.js";
import { s as I } from "./button.esm.js";
import { s as ct } from "./inputtext.esm.js";
import { O as Ke } from "./overlayeventbus.esm.js";
var ke = xn(), Ot = Symbol();
function Vn() {
  var o = _n(Ot);
  if (!o)
    throw new Error("No PrimeVue Confirmation provided!");
  return o;
}
var qn = {
  install: function(i) {
    var u = {
      require: function(b) {
        ke.emit("confirm", b);
      },
      close: function() {
        ke.emit("close");
      }
    };
    i.config.globalProperties.$confirm = u, i.provide(Ot, u);
  }
}, Jn = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var u = i.instance;
    return ["p-confirm-dialog-reject", u.confirmation && !u.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, Wn = Pt.extend({
  name: "confirmdialog",
  classes: Jn
}), Zn = {
  name: "BaseConfirmDialog",
  extends: jt,
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
  style: Wn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, $t = {
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
    var i = this;
    this.confirmListener = function(u) {
      u && u.group === i.group && (i.confirmation = u, i.confirmation.onShow && i.confirmation.onShow(), i.visible = !0);
    }, this.closeListener = function() {
      i.visible = !1, i.confirmation = null;
    }, ke.on("confirm", this.confirmListener), ke.on("close", this.closeListener);
  },
  beforeUnmount: function() {
    ke.off("confirm", this.confirmListener), ke.off("close", this.closeListener);
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
    CDialog: Dt,
    CDButton: I
  }
};
function Xn(o, i, u, L, b, a) {
  var E = at("CDButton"), B = at("CDialog");
  return d(), ce(B, {
    visible: b.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(T) {
      return b.visible = T;
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
  }, tt({
    default: U(function() {
      return [o.$slots.container ? R("", !0) : (d(), h(z, {
        key: 0
      }, [o.$slots.message ? (d(), ce(rt(o.$slots.message), {
        key: 1,
        message: b.confirmation
      }, null, 8, ["message"])) : (d(), h(z, {
        key: 0
      }, [ae(o.$slots, "icon", {}, function() {
        return [o.$slots.icon ? (d(), ce(rt(o.$slots.icon), {
          key: 0,
          class: re(o.cx("icon"))
        }, null, 8, ["class"])) : b.confirmation.icon ? (d(), h("span", Y({
          key: 1,
          class: [b.confirmation.icon, o.cx("icon")]
        }, o.ptm("icon")), null, 16)) : R("", !0)];
      }), v("span", Y({
        class: o.cx("message")
      }, o.ptm("message")), P(a.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [o.$slots.container ? {
    name: "container",
    fn: U(function(T) {
      return [ae(o.$slots, "container", {
        message: b.confirmation,
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
    fn: U(function() {
      return [k(E, {
        label: a.rejectLabel,
        class: re([o.cx("rejectButton"), b.confirmation.rejectClass]),
        onClick: i[0] || (i[0] = function(T) {
          return a.reject();
        }),
        autofocus: a.autoFocusReject,
        unstyled: o.unstyled,
        pt: o.ptm("rejectButton")
      }, tt({
        _: 2
      }, [a.rejectIcon || o.$slots.rejecticon ? {
        name: "icon",
        fn: U(function(T) {
          return [ae(o.$slots, "rejecticon", {}, function() {
            return [v("span", Y({
              class: [a.rejectIcon, T.class]
            }, o.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), k(E, {
        label: a.acceptLabel,
        class: re([o.cx("acceptButton"), b.confirmation.acceptClass]),
        onClick: i[1] || (i[1] = function(T) {
          return a.accept();
        }),
        autofocus: a.autoFocusAccept,
        unstyled: o.unstyled,
        pt: o.ptm("acceptButton")
      }, tt({
        _: 2
      }, [a.acceptIcon || o.$slots.accepticon ? {
        name: "icon",
        fn: U(function(T) {
          return [ae(o.$slots, "accepticon", {}, function() {
            return [v("span", Y({
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
$t.render = Xn;
var Yn = {
  root: function(i) {
    var u = i.instance;
    return ["p-overlaypanel p-component", {
      "p-ripple-disabled": u.$primevue.config.ripple === !1
    }];
  },
  content: "p-overlaypanel-content",
  closeButton: "p-overlaypanel-close p-link",
  closeIcon: "p-overlaypanel-close-icon"
}, Gn = Pt.extend({
  name: "overlaypanel",
  classes: Yn
}), Qn = {
  name: "BaseOverlayPanel",
  extends: jt,
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
  style: Gn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Nt = {
  name: "OverlayPanel",
  extends: Qn,
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
    this.dismissable && this.unbindOutsideClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.destroyStyle(), this.unbindResizeListener(), this.target = null, this.container && this.autoZIndex && nt.clear(this.container), this.overlayEventListener && (Ke.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null), this.container = null;
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
      this.container.setAttribute(this.attributeSelector, ""), Z.addStyles(i, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.dismissable && this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && nt.set("overlay", i, this.baseZIndex + this.$primevue.config.zIndex.overlay), this.overlayEventListener = function(L) {
        u.container.contains(L.target) && (u.selfClick = !0);
      }, this.focus(), Ke.on("overlay-click", this.overlayEventListener), this.$emit("show"), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    onLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.unbindDocumentKeyDownListener(), Ke.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null, this.$emit("hide");
    },
    onAfterLeave: function(i) {
      this.autoZIndex && nt.clear(i);
    },
    alignOverlay: function() {
      Z.absolutePosition(this.container, this.target, !1);
      var i = Z.getOffset(this.container), u = Z.getOffset(this.target), L = 0;
      i.left < u.left && (L = u.left - i.left), this.container.style.setProperty("--overlayArrowLeft", "".concat(L, "px")), i.top < u.top && (this.container.setAttribute("data-p-overlaypanel-flipped", "true"), !this.isUnstyled && Z.addClass(this.container, "p-overlaypanel-flipped"));
    },
    onContentKeydown: function(i) {
      i.code === "Escape" && this.closeOnEscape && (this.hide(), Z.focus(this.target));
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
      !this.outsideClickListener && Z.isClient() && (this.outsideClickListener = function(u) {
        i.visible && !i.selfClick && !i.isTargetClicked(u) && (i.visible = !1), i.selfClick = !1;
      }, document.addEventListener("click", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener), this.outsideClickListener = null, this.selfClick = !1);
    },
    bindScrollListener: function() {
      var i = this;
      this.scrollHandler || (this.scrollHandler = new Pn(this.target, function() {
        i.visible && (i.visible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var i = this;
      this.resizeListener || (this.resizeListener = function() {
        i.visible && !Z.isTouchDevice() && (i.visible = !1);
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Z.setAttribute(this.styleElement, "nonce", (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.csp) === null || i === void 0 ? void 0 : i.nonce), document.head.appendChild(this.styleElement);
        var u = "";
        for (var L in this.breakpoints)
          u += `
                        @media screen and (max-width: `.concat(L, `) {
                            .p-overlaypanel[`).concat(this.attributeSelector, `] {
                                width: `).concat(this.breakpoints[L], ` !important;
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
      Ke.emit("overlay-click", {
        originalEvent: i,
        target: this.target
      });
    }
  },
  computed: {
    attributeSelector: function() {
      return An();
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    }
  },
  directives: {
    focustrap: Hn,
    ripple: Tn
  },
  components: {
    Portal: Un,
    TimesIcon: Kn
  }
}, ei = ["aria-modal"], ti = ["aria-label"];
function ni(o, i, u, L, b, a) {
  var E = at("Portal"), B = It("ripple"), T = It("focustrap");
  return d(), ce(E, {
    appendTo: o.appendTo
  }, {
    default: U(function() {
      return [k(jn, Y({
        name: "p-overlaypanel",
        onEnter: a.onEnter,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave
      }, o.ptm("transition")), {
        default: U(function() {
          return [b.visible ? xt((d(), h("div", Y({
            key: 0,
            ref: a.containerRef,
            role: "dialog",
            "aria-modal": b.visible,
            onClick: i[5] || (i[5] = function() {
              return a.onOverlayClick && a.onOverlayClick.apply(a, arguments);
            }),
            class: o.cx("root")
          }, o.ptmi("root")), [o.$slots.container ? ae(o.$slots, "container", {
            key: 0,
            onClose: a.hide,
            onKeydown: function(M) {
              return a.onButtonKeydown(M);
            },
            closeCallback: a.hide,
            keydownCallback: function(M) {
              return a.onButtonKeydown(M);
            }
          }) : (d(), h(z, {
            key: 1
          }, [v("div", Y({
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
          }, o.ptm("content")), [ae(o.$slots, "default")], 16), o.showCloseIcon ? xt((d(), h("button", Y({
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
            return [(d(), ce(rt(o.closeIcon ? "span" : "TimesIcon"), Y({
              class: [o.cx("closeIcon"), o.closeIcon]
            }, o.ptm("closeIcon")), null, 16, ["class"]))];
          })], 16, ti)), [[B]]) : R("", !0)], 64))], 16, ei)), [[T]]) : R("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Nt.render = ni;
const ii = { class: "pick-panel-rows" }, si = {
  key: 0,
  class: "pick-panel-empty"
}, oi = ["onClick"], li = { class: "pick-panel-label" }, ai = {
  key: 0,
  class: "pick-panel-sublabel"
}, ri = {
  __name: "PickPanel",
  setup(o, { expose: i }) {
    const u = y(null), L = y(""), b = y([]), a = y(($) => String($)), E = y(null), B = y(null), T = S(() => b.value.length > 6), ue = S(() => {
      const $ = L.value.trim().toLowerCase();
      return $ ? b.value.filter((D) => {
        const O = a.value(D) || "", H = E.value && E.value(D) || "";
        return `${O} ${H}`.toLowerCase().includes($);
      }) : b.value;
    });
    function M($, { items: D, getLabel: O, getSubLabel: H, onPick: de }) {
      b.value = D, a.value = O, E.value = H || null, B.value = de, L.value = "", u.value.toggle($), ee(() => {
        var A, p;
        return (p = (A = u.value.$el) == null ? void 0 : A.querySelector("input")) == null ? void 0 : p.focus();
      });
    }
    function He($) {
      var D;
      (D = B.value) == null || D.call(B, $), u.value.hide();
    }
    return i({ open: M }), ($, D) => (d(), ce(g(Nt), {
      ref_key: "panelRef",
      ref: u,
      class: "pick-panel"
    }, {
      default: U(() => [
        T.value ? (d(), ce(g(ct), {
          key: 0,
          modelValue: L.value,
          "onUpdate:modelValue": D[0] || (D[0] = (O) => L.value = O),
          placeholder: "Type to filter...",
          class: "pick-panel-filter"
        }, null, 8, ["modelValue"])) : R("", !0),
        v("div", ii, [
          ue.value.length ? R("", !0) : (d(), h("div", si, "(no matches)")),
          (d(!0), h(z, null, Ue(ue.value, (O, H) => (d(), h("div", {
            key: H,
            class: "pick-panel-row",
            onClick: (de) => He(O)
          }, [
            v("div", li, P(a.value(O)), 1),
            E.value && E.value(O) ? (d(), h("div", ai, P(E.value(O)), 1)) : R("", !0)
          ], 8, oi))), 128))
        ])
      ]),
      _: 1
    }, 512));
  }
}, ci = /* @__PURE__ */ Rt(ri, [["__scopeId", "data-v-86b8a254"]]), ui = { class: "header-row" }, di = ["checked", "disabled"], fi = { class: "title-el" }, pi = { class: "status-el" }, vi = { class: "width-row" }, mi = { class: "font-row" }, hi = { class: "audio-row" }, yi = { class: "audio-content-row" }, gi = {
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
}, Si = { class: "actions-row" }, Ei = ["data-row-index"], Ii = { class: "malformed-warn-line" }, xi = ["value", "onInput"], _i = { class: "top-line" }, Ti = ["title", "onClick"], Ai = ["title", "onClick"], Pi = ["onMouseenter"], ji = { class: "instruct-line" }, Ri = {
  key: 0,
  class: "instruct-desc"
}, Di = ["value", "onInput", "onPaste"], Oi = { key: 0 }, $i = { class: "role-info-key" }, Ni = { class: "role-info-value" }, Fi = 600, ot = 3e3, zi = 1500, Tt = 1600, Bi = 11.5, Mi = 9, Ki = 22, At = "FL_CosyVoice3.LineEditor.widthPx", lt = "FL_CosyVoice3.LineEditor.textFontSizePx", Ui = {
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
    const i = o, u = [1280, 1600];
    function L(e, t) {
      try {
        const n = parseFloat(localStorage.getItem(e));
        return Number.isFinite(n) ? n : t;
      } catch {
        return t;
      }
    }
    function b(e, t) {
      try {
        localStorage.setItem(e, String(t));
      } catch {
      }
    }
    function a() {
      try {
        const e = localStorage.getItem(At);
        if (e === "full") return "full";
        const t = parseFloat(e);
        return Number.isFinite(t) ? t : Tt;
      } catch {
        return Tt;
      }
    }
    function E(e) {
      try {
        localStorage.setItem(At, String(e));
      } catch {
      }
    }
    function B(e) {
      return e === "full" ? "94vw" : `min(94vw, ${e}px)`;
    }
    function T(e) {
      const t = e.split("|");
      return t.length !== 3 ? null : { speaker: t[0].trim(), instruct: t[1].trim(), text: t[2].trim() };
    }
    let ue = 1;
    function M(e) {
      return { ...e, __key: ue++ };
    }
    function He(e) {
      return e.split(`
`).map((t) => t.replace(/\r$/, "")).filter((t) => t.trim()).map((t) => {
        const n = T(t);
        return M(n ? { ...n, raw: t, malformed: !1 } : { raw: t, malformed: !0 });
      });
    }
    function $(e) {
      return e.map((t) => t.malformed ? t.raw : `${t.speaker} | ${t.instruct} | ${t.text}`).join(`
`);
    }
    function D(e) {
      if (!e) return "rgba(255,255,255,0.15)";
      let t = 0;
      for (let n = 0; n < e.length; n++) t = t * 31 + e.charCodeAt(n) >>> 0;
      return `hsl(${t % 360}, 55%, 55%)`;
    }
    const O = Vn();
    function H({ title: e = "Confirm", message: t = "", okText: n = "OK", cancelText: s = "Cancel" } = {}) {
      return new Promise((l) => {
        O.require({
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
    const de = y(!0), A = y(i.filename), p = y([]), be = y([]), N = y([]), fe = y(null), je = y([]), Re = y([]), te = y([]), ut = y(""), dt = y(a()), V = y(L(lt, Bi)), q = y(null), we = y(-1), pe = y(!1), ve = y(-1), De = y(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), x = st({ checking: !0, best: null, mtime: null, error: null }), J = st({ visible: !1, top: 0, left: 0, code: null }), Oe = y(null), ne = st(/* @__PURE__ */ new Set());
    let me = 1, he = null, $e = null, Ve = 0, ye = null, ie = null, G = null, Ce = null, Le = null, Se = null, qe = !1, Je = null, Ee = null;
    const We = y(null), Ze = y(null), Ne = /* @__PURE__ */ new Map(), Xe = /* @__PURE__ */ new Map(), Fe = y(null), ft = S(() => X(i.folder, A.value)), Ie = S(() => X(i.folder, "_audio")), se = S(() => $n(A.value, i.suffix)), pt = S(() => X(X(Ie.value, "lines"), se.value)), vt = S(() => X(pt.value, "_state.json")), _ = S(() => Re.value.includes(A.value)), Ye = S(() => {
      const e = p.value.filter((t) => !t.malformed);
      return e.length > 0 && e.every((t) => t.status === "voiced");
    }), Ft = S(() => B(dt.value));
    function f(e) {
      ut.value = e;
    }
    function mt(e) {
      dt.value = e, E(e);
    }
    function ht(e) {
      if (!e) return "";
      const t = N.value.find((l) => l.code === e), n = t && t.speaker ? t.speaker : e, s = String(n).split("#", 1)[0].trim();
      return s ? `${s}.pt` : "";
    }
    function zt() {
      const e = {};
      return N.value.forEach((t) => {
        const n = String(t.speaker || "").split("#", 1)[0].trim();
        !n || !t.code || (e[n] = e[n] || []).push(t.code);
      }), e;
    }
    async function Bt() {
      if (!fe.value)
        return f("No _roles.json found for this project -- can't save"), !1;
      try {
        const t = await (await fetch(`${ge}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: fe.value, content: JSON.stringify({ roles: N.value }, null, 2) })
        })).json();
        return t.error ? (f(`Error saving _roles.json: ${t.error}`), !1) : !0;
      } catch (e) {
        return f(`Error saving _roles.json: ${e}`), !1;
      }
    }
    async function Mt(e) {
      if (!fe.value) return;
      const t = Nn(fe.value), n = await Fn(t, e, i.suffix);
      f(n.message), (n.changed.some((s) => s.file === A.value) || n.untracked.some((s) => s.file === A.value)) && (await yt(), await St(), ye = null, ie = null, oe(), _e());
    }
    function Kt(e, t) {
      if (!Array.isArray(e) || !e.length) return null;
      const n = [];
      return t.forEach((s, l) => {
        s.malformed || n.push(l);
      }), n.length !== e.length ? null : { lines: e, rowIndexMap: n };
    }
    const F = S(() => _.value ? Kt(q.value, p.value) : null), ze = S(() => {
      const e = /* @__PURE__ */ new Map();
      return F.value && F.value.rowIndexMap.forEach((t, n) => e.set(t, n)), e;
    }), Ut = S(() => !!(_.value && q.value && q.value.length && !F.value));
    function Ht() {
      return JSON.stringify({
        next_id: me,
        lines: p.value.filter((e) => !e.malformed).map((e) => ({ id: e.id, text: e.text, status: e.status }))
      }, null, 2);
    }
    function Vt(e, t) {
      const n = t && Array.isArray(t.lines) ? t.lines : [];
      let s = t && Number.isFinite(t.next_id) ? t.next_id : 1;
      const l = e.filter((c) => !c.malformed);
      if (n.length === l.length)
        return l.forEach((c, w) => {
          const C = n[w];
          c.id = Number.isFinite(C.id) ? C.id : s++;
          const j = (C.text || "") === c.text;
          c.status = j ? C.status === "voiced" || C.status === "stale" ? C.status : "unvoiced" : C.status === "voiced" || C.status === "stale" ? "stale" : "unvoiced";
        }), Math.max(s, ...l.map((c) => c.id + 1), 1);
      const r = /* @__PURE__ */ new Map();
      n.forEach((c) => {
        const w = (c.text || "").trim();
        r.has(w) || r.set(w, []), r.get(w).push(c);
      });
      const m = /* @__PURE__ */ new Map();
      return l.forEach((c) => {
        const w = (c.text || "").trim(), C = r.get(w), j = m.get(w) || 0;
        if (C && j < C.length) {
          const W = C[j];
          m.set(w, j + 1), c.id = Number.isFinite(W.id) ? W.id : s++, c.status = W.status === "voiced" ? "voiced" : "unvoiced";
        } else
          c.id = s++, c.status = "unvoiced";
      }), s;
    }
    async function yt() {
      let e = null, t = null;
      try {
        const s = await (await fetch(`${ge}/read?path=${encodeURIComponent(vt.value)}`)).json();
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
      me = Vt(p.value, e), $e = t;
    }
    function xe(e) {
      e.status === "voiced" && (e.status = "stale");
    }
    function Ge() {
      Ee && (Ee.pause(), Ee.src = "", Ee = null), ve.value = -1;
    }
    function qt(e) {
      Ge();
      const t = pt.value, n = (s) => {
        for (; s < p.value.length && (p.value[s].malformed || p.value[s].status === "unvoiced"); ) s++;
        if (s >= p.value.length) {
          ve.value = -1;
          return;
        }
        ve.value = s;
        const l = p.value[s], r = new Audio(`${le}/audio?path=${encodeURIComponent(X(t, `id${l.id}.wav`))}&v=${Date.now()}`);
        Ee = r, r.addEventListener("ended", () => n(s + 1)), r.play().catch((m) => f(`Playback failed: ${m}`));
      };
      n(e);
    }
    function Be() {
      var s;
      const e = We.value;
      if (!F.value || !e) {
        we.value = -1;
        return;
      }
      const t = e.currentTime;
      let n = -1;
      for (let l = 0; l < F.value.lines.length; l++)
        if (t >= F.value.lines[l].start && t < F.value.lines[l].end) {
          n = l;
          break;
        }
      if (n !== we.value && (we.value = n, n >= 0 && pe.value)) {
        const l = F.value.rowIndexMap[n], r = l !== void 0 ? Ne.get((s = p.value[l]) == null ? void 0 : s.__key) : null;
        r == null || r.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function _e({ silent: e = !1 } = {}) {
      const t = X(X(Ie.value, "timing"), `${se.value}.json`);
      try {
        const s = await (await fetch(`${ge}/read?path=${encodeURIComponent(t)}`)).json();
        if (!s.exists) {
          q.value = null, ie = null;
          return;
        }
        if (e && s.mtime === ie) return;
        const l = s.mtime !== ie;
        ie = s.mtime;
        let r;
        try {
          r = JSON.parse(s.content);
        } catch {
          q.value = null;
          return;
        }
        q.value = Array.isArray(r.lines) ? r.lines : null;
        const m = p.value.filter((c) => !c.malformed);
        l && q.value && q.value.length === m.length && m.length > 0 && await Jt(m), ee(Be);
      } catch {
      }
    }
    async function Jt(e) {
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
        }), Number.isFinite(n.next_id) && (me = Math.max(me, n.next_id)), s.size && Te();
      } catch {
      }
    }
    function Wt() {
      qe || (qe = !0, G && (clearTimeout(G), Te()), Ce && clearInterval(Ce), Le && clearInterval(Le), Se && clearInterval(Se), i.onClose());
    }
    it(de, (e) => {
      e || Wt();
    });
    function K() {
      Ve = Date.now(), G && clearTimeout(G), G = setTimeout(Te, Fi);
    }
    async function Te() {
      const e = $(p.value), t = Ht(), n = e !== he, s = t !== $e;
      if (!(!n && !s))
        try {
          if (n) {
            const r = await (await fetch(`${ge}/write`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: ft.value, content: e })
            })).json();
            if (r.error) {
              f(`Save error: ${r.error}`);
              return;
            }
            he = e;
          }
          s && (await fetch(`${ge}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: vt.value, content: t })
          }), $e = t), f(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (l) {
          f(`Save failed: ${l}`);
        }
    }
    function Ae(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function gt(e, t) {
      if (!t) {
        Xe.delete(e);
        return;
      }
      Xe.set(e, t.$el ?? t);
    }
    function Zt() {
      ee(() => Xe.forEach(Ae));
    }
    function Xt(e, t) {
      if (!t) {
        Ne.delete(e);
        return;
      }
      Ne.set(e, t);
    }
    async function kt(e) {
      var n;
      Oe.value = e, await ee();
      const t = Ne.get(e);
      t == null || t.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = t == null ? void 0 : t.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        Oe.value === e && (Oe.value = null);
      }, 500);
    }
    async function Yt(e, t) {
      const n = p.value[e], s = p.value[t];
      if (!n || !s || n.malformed || s.malformed) return;
      const l = Math.min(e, t), r = Math.max(e, t), m = p.value[l], c = p.value[r];
      (m.speaker || "").trim() !== (c.speaker || "").trim() && !await H({
        title: "Merge lines with different speakers?",
        message: `"${m.speaker}" and "${c.speaker}" are different speakers. Merge anyway? The combined line keeps "${m.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }) || (m.text = `${m.text} ${c.text}`.trim(), m.status = "unvoiced", p.value.splice(r, 1), K());
    }
    function Gt(e, t) {
      !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const s = e.closest(".fl-line-row");
        Je = Number(s == null ? void 0 : s.dataset.rowIndex), s == null || s.classList.add("fl-row-dragging");
        const l = (m) => {
          var C;
          (C = Ze.value) == null || C.querySelectorAll(".fl-row-drop-target").forEach((j) => j.classList.remove("fl-row-drop-target"));
          const c = document.elementFromPoint(m.clientX, m.clientY), w = c && c.closest ? c.closest(".fl-line-row") : null;
          w && w !== s && w.classList.add("fl-row-drop-target");
        }, r = (m) => {
          var j;
          document.removeEventListener("pointermove", l), document.removeEventListener("pointerup", r), document.removeEventListener("pointercancel", r);
          const c = document.elementFromPoint(m.clientX, m.clientY), w = c && c.closest ? c.closest(".fl-line-row") : null, C = Je;
          if (Je = null, s == null || s.classList.remove("fl-row-dragging"), (j = Ze.value) == null || j.querySelectorAll(".fl-row-drop-target").forEach((W) => W.classList.remove("fl-row-drop-target")), w && w !== s) {
            const W = Number(w.dataset.rowIndex);
            Number.isNaN(W) || Yt(C, W);
          }
        };
        document.addEventListener("pointermove", l), document.addEventListener("pointerup", r), document.addEventListener("pointercancel", r);
      }));
    }
    function Qt(e) {
      p.value.splice(e, 1), K();
    }
    async function bt(e, t) {
      t && t.trim() && !await H({
        title: "Delete this line?",
        message: t.length > 200 ? t.slice(0, 200) + "…" : t,
        okText: "Delete",
        cancelText: "Cancel"
      }) || Qt(e);
    }
    function en(e) {
      xe(e), K();
    }
    function tn(e) {
      xe(e), K();
    }
    function wt(e, t) {
      Ae(t), xe(e), K();
    }
    function nn(e, t, n) {
      n.preventDefault();
      const s = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), l = t.selectionStart, r = t.selectionEnd;
      t.value = t.value.slice(0, l) + s + t.value.slice(r), t.selectionStart = t.selectionEnd = l + s.length, e.text = t.value, wt(e, t);
    }
    function sn(e) {
      const t = N.value.find((s) => s.code === e.speaker), n = ht(e.speaker);
      return t ? `Change "${t.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${e.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function Ct(e) {
      const t = be.value.find((n) => (n.text || "").trim() === e.instruct.trim());
      return t && t.note ? t.note : null;
    }
    function on(e, t) {
      if (!N.value.length) {
        f("No roles catalog found for this project (_roles.json)");
        return;
      }
      Fe.value.open(e, {
        items: N.value,
        getLabel: (n) => n.code || n.speaker || "",
        getSubLabel: (n) => [n.name, n.speaker, n.description].filter(Boolean).join(" -- "),
        onPick: (n) => {
          const s = n.code || n.speaker || "";
          t.speaker = s, xe(t), K();
        }
      });
    }
    function ln(e, t) {
      const n = N.value.find((l) => l.code === t.speaker);
      if (!n) return;
      if (!je.value.length) {
        f("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
        return;
      }
      const s = zt();
      Fe.value.open(e, {
        items: je.value,
        getLabel: (l) => l,
        getSubLabel: (l) => {
          const r = s[l] || [];
          return r.length ? `used by: ${r.join(", ")} -- ${r.length} role(s)` : "not used by any role yet";
        },
        onPick: async (l) => {
          n.speaker = l, await Bt() && (f(`"${n.code}" now uses "${l}" for the whole play`), await Mt(n.code));
        }
      });
    }
    function an(e, t) {
      if (!be.value.length) {
        f("No instructions catalog found for this project (_instructions.json)");
        return;
      }
      Fe.value.open(e, {
        items: be.value,
        getLabel: (n) => n.text,
        getSubLabel: (n) => n.note || "",
        onPick: (n) => {
          t.instruct = n.text, xe(t), K();
        }
      });
    }
    function rn(e, t) {
      const n = e.getBoundingClientRect();
      J.left = Math.min(n.left, window.innerWidth - 280), J.top = n.bottom + 4, J.code = t, J.visible = !0;
    }
    function cn() {
      J.visible = !1;
    }
    const Qe = S(() => {
      const e = J.code;
      if (!e) return { message: "No speaker set on this line yet" };
      const t = N.value.find((s) => s.code === e);
      if (!t) return { message: `"${e}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(t).filter(([, s]) => s !== "" && s !== null && s !== void 0 && s !== t.__key);
      return n.length ? { fields: n } : { message: `"${e}" has no fields set in _roles.json` };
    });
    function un(e) {
      return ne.has(e) ? "Re-voicing..." : e.status === "stale" ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : e.status === "voiced" ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function dn(e) {
      if (!ne.has(e)) {
        ne.add(e), f("Re-voicing...");
        try {
          await i.revoiceApi.revoiceLine({ lineId: e.id, speaker: e.speaker, instruct: e.instruct, text: e.text }), e.status = "voiced", f("Line re-voiced");
        } catch (t) {
          f(`Re-voice failed: ${t.message || t}`);
        } finally {
          ne.delete(e), Te();
        }
      }
    }
    function Lt(e) {
      return (_.value ? we.value === ze.value.get(e) : ve.value === e) && pe.value;
    }
    function fn(e, t) {
      if (_.value) {
        const s = ze.value.get(t), l = We.value;
        if (s === void 0 || !l || !F.value) return;
        l.currentTime = F.value.lines[s].start, l.play();
      } else ve.value === t ? Ge() : qt(t);
    }
    async function oe({ silent: e = !1 } = {}) {
      e || (x.checking = !0);
      try {
        const n = await (await fetch(`/fl_cosyvoice3/browse/list_dir?path=${encodeURIComponent(Ie.value)}`)).json(), s = Array.isArray(n.files) ? n.files : [], l = n.file_mtimes || {}, r = se.value.toLowerCase(), m = s.filter((C) => {
          const j = C.lastIndexOf(".");
          return (j > 0 ? C.slice(0, j) : C).toLowerCase().startsWith(r);
        });
        m.sort();
        const c = m.length ? m[m.length - 1] : null, w = c ? `${c}::${l[c] || ""}` : null;
        if (e && w === ye) return;
        ye = w, x.checking = !1, x.error = null, x.best = c, x.mtime = c ? l[c] || Date.now() : null, c || (pe.value = !1, ee(Be));
      } catch (t) {
        x.checking = !1, x.error = String(t);
      }
    }
    const pn = S(() => !x.best || _.value);
    async function vn() {
      if (!(!x.best || _.value || !await H({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${se.value}" (currently: ${x.best}).`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${le}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: se.value, filename: A.value })
          })).json();
          if (n.error) {
            f(`Error: ${n.error}`);
            return;
          }
          f(`Deleted ${n.deleted.length} audio file(s)`), ye = null, oe();
        } catch (t) {
          f(`Error: ${t}`);
        }
    }
    function mn(e) {
      var t;
      (t = i.checkedApi) == null || t.setChecked(A.value, e);
    }
    const hn = S(() => !_.value && !Ye.value), yn = S(() => _.value ? "Marked ready to release -- click to unmark and go back to editing" : Ye.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function gn() {
      var t;
      const e = !_.value;
      if (e && !Ye.value) {
        f("Every line needs to be voiced before marking done");
        return;
      }
      if (e) {
        f("Stitching final file...");
        const n = p.value.filter((s) => !s.malformed);
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
            f(`Stitch error: ${l.error}`);
            return;
          }
        } catch (s) {
          f(`Stitch failed: ${s}`);
          return;
        }
      }
      try {
        const s = await (await fetch(`${le}/set_ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: i.folder, filename: A.value, ready: e })
        })).json();
        if (s.error) {
          f(`Error: ${s.error}`);
          return;
        }
        Re.value = s.ready_scripts || [], e && ((t = i.checkedApi) == null || t.setChecked(A.value, !1), De.value = !1), f(e ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again"), e && (ye = null, ie = null, oe(), _e());
      } catch (n) {
        f(`Error: ${n}`);
      }
    }
    function kn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" && e.tagName !== "INPUT") {
        f("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const t = e.selectionStart;
      e.value = e.value.slice(0, t) + "́" + e.value.slice(t), e.selectionStart = e.selectionEnd = t + 1, e.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function bn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
        f("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const t = e.closest(".fl-line-row"), n = t ? Number(t.dataset.rowIndex) : -1, s = n >= 0 ? p.value[n] : null;
      if (!s || s.malformed) {
        f("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const l = e.selectionStart, r = s.text.slice(0, l).trimEnd(), m = s.text.slice(l).trimStart();
      s.text = r, s.status = "unvoiced";
      const c = M({ speaker: s.speaker, instruct: s.instruct, text: m, raw: "", malformed: !1, id: me++, status: "unvoiced" });
      p.value.splice(n + 1, 0, c), kt(c.__key), K();
    }
    function wn() {
      const e = M({ speaker: "", instruct: "", text: "", raw: "", malformed: !1, id: me++, status: "unvoiced" });
      p.value.push(e), kt(e.__key), K();
    }
    const Q = S(() => te.value.indexOf(A.value)), Cn = S(() => !(Q.value > 0)), Ln = S(() => !(Q.value >= 0 && Q.value < te.value.length - 1));
    function Sn() {
      Q.value > 0 && Et(te.value[Q.value - 1]);
    }
    function En() {
      Q.value >= 0 && Q.value < te.value.length - 1 && Et(te.value[Q.value + 1]);
    }
    async function In() {
      try {
        const t = await (await fetch(On)).json();
        je.value = t.presets || [];
      } catch {
        je.value = [];
      }
    }
    async function St() {
      var e, t, n;
      try {
        const s = `${le}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, r = await (await fetch(s)).json();
        be.value = ((e = r.instructions) == null ? void 0 : e.entries) || [], N.value = ((t = r.roles) == null ? void 0 : t.entries) || [], fe.value = ((n = r.roles) == null ? void 0 : n.path) || null, te.value = Array.isArray(r.scripts) ? r.scripts : [], Re.value = Array.isArray(r.ready_scripts) ? r.ready_scripts : [];
      } catch {
        be.value = [], N.value = [], fe.value = null, te.value = [], Re.value = [];
      }
    }
    async function Et(e) {
      !e || e === A.value || qe || (G && (clearTimeout(G), G = null, await Te()), A.value = e, ye = null, q.value = null, ie = null, p.value = [], he = null, Ve = 0, De.value = i.checkedApi ? i.checkedApi.isChecked(e) : !1, f("Loading..."), await et(), oe(), _e());
    }
    async function et({ isPoll: e = !1 } = {}) {
      try {
        const n = await (await fetch(`${ge}/read?path=${encodeURIComponent(ft.value)}`)).json();
        if (n.error) {
          f(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          e || (p.value = [], he = "", $e = null, f("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (e && Date.now() - Ve < zi || n.content === he) return;
        p.value = He(n.content), he = n.content, await yt(), e || f(`Loaded ${p.value.length} line(s)`);
      } catch (t) {
        f(`Read failed: ${t}`);
      }
    }
    return it(F, () => ee(Be)), it(V, Zt), Rn(() => {
      St(), In(), oe(), Le = setInterval(() => oe({ silent: !0 }), ot), et().then(() => {
        Ce = setInterval(() => et({ isPoll: !0 }), ot), _e(), Se = setInterval(() => _e({ silent: !0 }), ot);
      });
    }), Dn(() => {
      Ge(), Ce && clearInterval(Ce), Le && clearInterval(Le), Se && clearInterval(Se);
    }), (e, t) => (d(), h(z, null, [
      k(g(Dt), {
        visible: de.value,
        "onUpdate:visible": t[10] || (t[10] = (n) => de.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: Pe({ width: Ft.value }),
        class: "line-editor-dialog"
      }, {
        header: U(() => [
          v("div", ui, [
            v("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: De.value,
              disabled: !o.checkedApi || _.value,
              title: "Mark this script as checked for queueing (Script Library's tree)",
              onChange: t[0] || (t[0] = (n) => {
                De.value = n.target.checked, mn(n.target.checked);
              })
            }, null, 40, di),
            k(g(I), {
              label: _.value ? "Done ✓" : "Done",
              size: "small",
              outlined: !_.value,
              disabled: hn.value,
              title: yn.value,
              onClick: gn
            }, null, 8, ["label", "outlined", "disabled", "title"]),
            v("div", fi, P(A.value), 1),
            v("div", pi, P(ut.value), 1),
            v("div", vi, [
              (d(), h(z, null, Ue(u, (n) => k(g(I), {
                key: n,
                label: String(n),
                text: "",
                size: "small",
                title: `Set editor width to ${n}px (capped to the window's width)`,
                onClick: (s) => mt(n)
              }, null, 8, ["label", "title", "onClick"])), 64)),
              k(g(I), {
                label: "100%",
                text: "",
                size: "small",
                title: "Use the full available window width",
                onClick: t[1] || (t[1] = (n) => mt("full"))
              })
            ]),
            v("div", mi, [
              k(g(I), {
                label: "A−",
                text: "",
                size: "small",
                title: "Decrease line text font size",
                onClick: t[2] || (t[2] = (n) => {
                  V.value = Math.max(Mi, V.value - 1), b(lt, V.value);
                })
              }),
              k(g(I), {
                label: "A+",
                text: "",
                size: "small",
                title: "Increase line text font size",
                onClick: t[3] || (t[3] = (n) => {
                  V.value = Math.min(Ki, V.value + 1), b(lt, V.value);
                })
              })
            ])
          ])
        ]),
        default: U(() => [
          v("div", hi, [
            v("div", yi, [
              x.checking ? (d(), h("div", gi, "Checking for audio...")) : x.error ? (d(), h("div", ki, "Audio check failed: " + P(x.error), 1)) : x.best ? (d(), h(z, { key: 2 }, [
                v("div", bi, P(x.best), 1),
                v("audio", {
                  ref_key: "audioElRef",
                  ref: We,
                  controls: "",
                  class: "audio-el",
                  src: `${g(le)}/audio?path=${encodeURIComponent(g(X)(Ie.value, x.best))}&v=${encodeURIComponent(x.mtime || "")}`,
                  onTimeupdate: Be,
                  onPlay: t[4] || (t[4] = (n) => pe.value = !0),
                  onPause: t[5] || (t[5] = (n) => pe.value = !1),
                  onEnded: t[6] || (t[6] = (n) => pe.value = !1)
                }, null, 40, wi),
                k(g(I), {
                  label: "🗑 Delete audio",
                  text: "",
                  size: "small",
                  disabled: pn.value,
                  title: _.value ? "Marked ready to release -- unmark it (Done) before deleting audio" : "Delete the rendered audio for this script",
                  onClick: vn
                }, null, 8, ["disabled", "title"])
              ], 64)) : (d(), h("div", Ci, "No audio yet in " + P(Ie.value), 1)),
              k(g(I), {
                icon: "pi pi-refresh",
                text: "",
                size: "small",
                title: "Re-check _audio\\ for this script's rendered audio",
                onClick: t[7] || (t[7] = (n) => oe())
              })
            ]),
            Ut.value ? (d(), h("div", Li, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : R("", !0)
          ]),
          v("div", Si, [
            k(g(I), {
              label: "´ Stress mark",
              text: "",
              size: "small",
              title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
              onMousedown: Me(kn, ["prevent"])
            }),
            k(g(I), {
              label: "✂ Split line",
              text: "",
              size: "small",
              title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
              onMousedown: Me(bn, ["prevent"])
            }),
            k(g(I), {
              label: "+ Add line",
              text: "",
              size: "small",
              title: "Add a new empty line at the end of the script",
              onClick: wn
            }),
            t[11] || (t[11] = v("div", { class: "actions-divider" }, null, -1)),
            k(g(I), {
              label: "◀ Prev",
              text: "",
              size: "small",
              disabled: Cn.value,
              title: "Open the previous script in this act",
              onClick: Sn
            }, null, 8, ["disabled"]),
            k(g(I), {
              label: "Next ▶",
              text: "",
              size: "small",
              disabled: Ln.value,
              title: "Open the next script in this act",
              onClick: En
            }, null, 8, ["disabled"])
          ]),
          v("div", {
            ref_key: "rowsContainerEl",
            ref: Ze,
            class: "rows-container"
          }, [
            (d(!0), h(z, null, Ue(p.value, (n, s) => (d(), h("div", {
              key: n.__key,
              class: re(["fl-line-row", { "row-enter": Oe.value === n.__key, "row-playing": _.value ? ze.value.get(s) === we.value : ve.value === s }]),
              "data-row-index": s,
              ref_for: !0,
              ref: (l) => Xt(n.__key, l),
              style: Pe(n.malformed ? {} : { borderLeftColor: D(n.speaker) })
            }, [
              n.malformed ? (d(), h(z, { key: 0 }, [
                v("div", Ii, [
                  t[12] || (t[12] = v("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  k(g(I), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => bt(s, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                v("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: Pe({ fontSize: `${V.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    gt(n.__key, l), ee(() => Ae(l));
                  },
                  onInput: (l) => {
                    n.raw = l.target.value, Ae(l.target), K();
                  },
                  onKeydown: t[8] || (t[8] = _t(Me(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, xi)
              ], 64)) : (d(), h(z, { key: 1 }, [
                v("div", _i, [
                  v("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (l) => Gt(l, s)
                  }, "⠿", 512),
                  (_.value ? ze.value.get(s) !== void 0 : n.status !== "unvoiced") ? (d(), h("span", {
                    key: 0,
                    class: re(["play-btn", { "is-playing": Lt(s) }]),
                    title: _.value ? "Play from this line" : "Play this line (and every voiced line after it)",
                    onClick: (l) => fn(n, s)
                  }, P(Lt(s) ? "⏸" : "▶"), 11, Ti)) : R("", !0),
                  o.revoiceApi && !_.value ? (d(), h("span", {
                    key: 1,
                    class: re(["revoice-btn", { pending: ne.has(n), stale: !ne.has(n) && n.status === "stale" }]),
                    title: un(n),
                    onClick: (l) => dn(n)
                  }, P(ne.has(n) ? "⏳" : "🔁"), 11, Ai)) : R("", !0),
                  k(g(I), {
                    icon: "pi pi-user",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from _roles.json",
                    onClick: (l) => on(l, n)
                  }, null, 8, ["onClick"]),
                  k(g(ct), {
                    class: "speaker-input",
                    "model-value": n.speaker,
                    title: "Speaker (preset or preset#tag)",
                    "onUpdate:modelValue": (l) => {
                      n.speaker = l, en(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  k(g(I), {
                    class: "speaker-file-btn",
                    text: "",
                    size: "small",
                    label: ht(n.speaker) || "(no speaker)",
                    disabled: !N.value.find((l) => l.code === n.speaker),
                    title: sn(n),
                    onClick: (l) => ln(l, n)
                  }, null, 8, ["label", "disabled", "title", "onClick"]),
                  v("span", {
                    class: "role-info-btn",
                    onMouseenter: (l) => rn(l.target, n.speaker),
                    onMouseleave: cn
                  }, "ℹ", 40, Pi),
                  t[13] || (t[13] = v("div", { class: "spacer" }, null, -1)),
                  k(g(I), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => bt(s, n.text)
                  }, null, 8, ["onClick"])
                ]),
                v("div", ji, [
                  k(g(I), {
                    icon: "pi pi-list",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from the instructions catalog (_instructions.json)",
                    onClick: (l) => an(l, n)
                  }, null, 8, ["onClick"]),
                  k(g(ct), {
                    class: "instruct-input",
                    "model-value": n.instruct,
                    title: "Instruct text",
                    "onUpdate:modelValue": (l) => {
                      n.instruct = l, tn(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"])
                ]),
                Ct(n) ? (d(), h("div", Ri, "↳ " + P(Ct(n)), 1)) : R("", !0),
                v("textarea", {
                  class: "fl-textarea",
                  style: Pe({ fontSize: `${V.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    gt(n.__key, l), ee(() => Ae(l));
                  },
                  onInput: (l) => {
                    n.text = l.target.value, wt(n, l.target);
                  },
                  onKeydown: t[9] || (t[9] = _t(Me(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (l) => nn(n, l.target, l)
                }, null, 44, Di)
              ], 64))
            ], 14, Ei))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      k(ci, {
        ref_key: "pickPanelRef",
        ref: Fe
      }, null, 512),
      k(g($t)),
      J.visible ? (d(), h("div", {
        key: 0,
        class: "role-info-popover",
        style: Pe({ left: `${J.left}px`, top: `${J.top}px` })
      }, [
        Qe.value.message ? (d(), h("div", Oi, P(Qe.value.message), 1)) : R("", !0),
        (d(!0), h(z, null, Ue(Qe.value.fields, ([n, s]) => (d(), h("div", {
          key: n,
          class: "role-info-row"
        }, [
          v("span", $i, P(n), 1),
          v("span", Ni, P(s), 1)
        ]))), 128))
      ], 4)) : R("", !0)
    ], 64));
  }
}, Hi = /* @__PURE__ */ Rt(Ui, [["__scopeId", "data-v-ef2f5c94"]]);
function Xi({ folder: o, filename: i, suffix: u = "_speakers.txt", checkedApi: L, revoiceApi: b }) {
  zn(import.meta.url);
  const a = document.createElement("div");
  document.body.appendChild(a);
  const E = Bn(Hi, {
    folder: o,
    filename: i,
    suffix: u,
    checkedApi: L || null,
    revoiceApi: b || null,
    onClose: () => {
      E.unmount(), a.remove();
    }
  });
  E.use(Mn, { ripple: !0 }), E.use(qn), E.mount(a);
}
export {
  Xi as openLineEditor
};
