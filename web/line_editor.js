import { q as In, s as xn, B as At, v as at, d, c as de, x as tt, a as U, y as ue, f as k, n as be, e as p, z as Y, j as h, F as z, A as rt, i as R, t as j, C as jt, R as _n, U as Tn, D as Z, E as An, Z as nt, G as Et, T as jn, H as It, _ as Pt, u as g, k as Ue, I as ee, b as S, r as y, w as it, o as Pn, J as Rn, K as re, S as ce, L as Dn, M as ke, l as X, N as st, O as On, Q as Me, g as xt, V as $n, W as Nn, m as Fn, p as zn, P as Bn } from "./styles_link.js";
import { s as Rt, a as Mn, b as Kn, F as Un } from "./dialog.esm.js";
import { s as x } from "./button.esm.js";
import { s as ct } from "./inputtext.esm.js";
import { O as Ke } from "./overlayeventbus.esm.js";
var we = In(), Dt = Symbol();
function Hn() {
  var o = xn(Dt);
  if (!o)
    throw new Error("No PrimeVue Confirmation provided!");
  return o;
}
var Vn = {
  install: function(s) {
    var u = {
      require: function(b) {
        we.emit("confirm", b);
      },
      close: function() {
        we.emit("close");
      }
    };
    s.config.globalProperties.$confirm = u, s.provide(Dt, u);
  }
}, qn = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(s) {
    var u = s.instance;
    return ["p-confirm-dialog-reject", u.confirmation && !u.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, Jn = At.extend({
  name: "confirmdialog",
  classes: qn
}), Wn = {
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
  style: Jn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ot = {
  name: "ConfirmDialog",
  extends: Wn,
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
    }, we.on("confirm", this.confirmListener), we.on("close", this.closeListener);
  },
  beforeUnmount: function() {
    we.off("confirm", this.confirmListener), we.off("close", this.closeListener);
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
    CDialog: Rt,
    CDButton: x
  }
};
function Zn(o, s, u, L, b, a) {
  var E = at("CDButton"), B = at("CDialog");
  return d(), de(B, {
    visible: b.visible,
    "onUpdate:visible": [s[2] || (s[2] = function(T) {
      return b.visible = T;
    }), a.onHide],
    role: "alertdialog",
    class: be(o.cx("root")),
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
      }, [o.$slots.message ? (d(), de(rt(o.$slots.message), {
        key: 1,
        message: b.confirmation
      }, null, 8, ["message"])) : (d(), h(z, {
        key: 0
      }, [ue(o.$slots, "icon", {}, function() {
        return [o.$slots.icon ? (d(), de(rt(o.$slots.icon), {
          key: 0,
          class: be(o.cx("icon"))
        }, null, 8, ["class"])) : b.confirmation.icon ? (d(), h("span", Y({
          key: 1,
          class: [b.confirmation.icon, o.cx("icon")]
        }, o.ptm("icon")), null, 16)) : R("", !0)];
      }), p("span", Y({
        class: o.cx("message")
      }, o.ptm("message")), j(a.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [o.$slots.container ? {
    name: "container",
    fn: U(function(T) {
      return [ue(o.$slots, "container", {
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
        class: be([o.cx("rejectButton"), b.confirmation.rejectClass]),
        onClick: s[0] || (s[0] = function(T) {
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
          return [ue(o.$slots, "rejecticon", {}, function() {
            return [p("span", Y({
              class: [a.rejectIcon, T.class]
            }, o.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), k(E, {
        label: a.acceptLabel,
        class: be([o.cx("acceptButton"), b.confirmation.acceptClass]),
        onClick: s[1] || (s[1] = function(T) {
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
          return [ue(o.$slots, "accepticon", {}, function() {
            return [p("span", Y({
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
Ot.render = Zn;
var Xn = {
  root: function(s) {
    var u = s.instance;
    return ["p-overlaypanel p-component", {
      "p-ripple-disabled": u.$primevue.config.ripple === !1
    }];
  },
  content: "p-overlaypanel-content",
  closeButton: "p-overlaypanel-close p-link",
  closeIcon: "p-overlaypanel-close-icon"
}, Yn = At.extend({
  name: "overlaypanel",
  classes: Xn
}), Gn = {
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
  style: Yn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, $t = {
  name: "OverlayPanel",
  extends: Gn,
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
    this.dismissable && this.unbindOutsideClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.destroyStyle(), this.unbindResizeListener(), this.target = null, this.container && this.autoZIndex && nt.clear(this.container), this.overlayEventListener && (Ke.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null), this.container = null;
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
      this.container.setAttribute(this.attributeSelector, ""), Z.addStyles(s, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.dismissable && this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && nt.set("overlay", s, this.baseZIndex + this.$primevue.config.zIndex.overlay), this.overlayEventListener = function(L) {
        u.container.contains(L.target) && (u.selfClick = !0);
      }, this.focus(), Ke.on("overlay-click", this.overlayEventListener), this.$emit("show"), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    onLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.unbindDocumentKeyDownListener(), Ke.off("overlay-click", this.overlayEventListener), this.overlayEventListener = null, this.$emit("hide");
    },
    onAfterLeave: function(s) {
      this.autoZIndex && nt.clear(s);
    },
    alignOverlay: function() {
      Z.absolutePosition(this.container, this.target, !1);
      var s = Z.getOffset(this.container), u = Z.getOffset(this.target), L = 0;
      s.left < u.left && (L = u.left - s.left), this.container.style.setProperty("--overlayArrowLeft", "".concat(L, "px")), s.top < u.top && (this.container.setAttribute("data-p-overlaypanel-flipped", "true"), !this.isUnstyled && Z.addClass(this.container, "p-overlaypanel-flipped"));
    },
    onContentKeydown: function(s) {
      s.code === "Escape" && this.closeOnEscape && (this.hide(), Z.focus(this.target));
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
      !this.outsideClickListener && Z.isClient() && (this.outsideClickListener = function(u) {
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
        s.visible && !Z.isTouchDevice() && (s.visible = !1);
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Z.setAttribute(this.styleElement, "nonce", (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.csp) === null || s === void 0 ? void 0 : s.nonce), document.head.appendChild(this.styleElement);
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
    onOverlayClick: function(s) {
      Ke.emit("overlay-click", {
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
}, Qn = ["aria-modal"], ei = ["aria-label"];
function ti(o, s, u, L, b, a) {
  var E = at("Portal"), B = Et("ripple"), T = Et("focustrap");
  return d(), de(E, {
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
          return [b.visible ? It((d(), h("div", Y({
            key: 0,
            ref: a.containerRef,
            role: "dialog",
            "aria-modal": b.visible,
            onClick: s[5] || (s[5] = function() {
              return a.onOverlayClick && a.onOverlayClick.apply(a, arguments);
            }),
            class: o.cx("root")
          }, o.ptmi("root")), [o.$slots.container ? ue(o.$slots, "container", {
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
          }, [p("div", Y({
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
          }, o.ptm("content")), [ue(o.$slots, "default")], 16), o.showCloseIcon ? It((d(), h("button", Y({
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
          }, o.ptm("closeButton")), [ue(o.$slots, "closeicon", {}, function() {
            return [(d(), de(rt(o.closeIcon ? "span" : "TimesIcon"), Y({
              class: [o.cx("closeIcon"), o.closeIcon]
            }, o.ptm("closeIcon")), null, 16, ["class"]))];
          })], 16, ei)), [[B]]) : R("", !0)], 64))], 16, Qn)), [[T]]) : R("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
$t.render = ti;
const ni = { class: "pick-panel-rows" }, ii = {
  key: 0,
  class: "pick-panel-empty"
}, si = ["onClick"], oi = { class: "pick-panel-label" }, li = {
  key: 0,
  class: "pick-panel-sublabel"
}, ai = {
  __name: "PickPanel",
  setup(o, { expose: s }) {
    const u = y(null), L = y(""), b = y([]), a = y(($) => String($)), E = y(null), B = y(null), T = S(() => b.value.length > 6), fe = S(() => {
      const $ = L.value.trim().toLowerCase();
      return $ ? b.value.filter((D) => {
        const O = a.value(D) || "", H = E.value && E.value(D) || "";
        return `${O} ${H}`.toLowerCase().includes($);
      }) : b.value;
    });
    function M($, { items: D, getLabel: O, getSubLabel: H, onPick: ve }) {
      b.value = D, a.value = O, E.value = H || null, B.value = ve, L.value = "", u.value.toggle($), ee(() => {
        var A, v;
        return (v = (A = u.value.$el) == null ? void 0 : A.querySelector("input")) == null ? void 0 : v.focus();
      });
    }
    function He($) {
      var D;
      (D = B.value) == null || D.call(B, $), u.value.hide();
    }
    return s({ open: M }), ($, D) => (d(), de(g($t), {
      ref_key: "panelRef",
      ref: u,
      class: "pick-panel"
    }, {
      default: U(() => [
        T.value ? (d(), de(g(ct), {
          key: 0,
          modelValue: L.value,
          "onUpdate:modelValue": D[0] || (D[0] = (O) => L.value = O),
          placeholder: "Type to filter...",
          class: "pick-panel-filter"
        }, null, 8, ["modelValue"])) : R("", !0),
        p("div", ni, [
          fe.value.length ? R("", !0) : (d(), h("div", ii, "(no matches)")),
          (d(!0), h(z, null, Ue(fe.value, (O, H) => (d(), h("div", {
            key: H,
            class: "pick-panel-row",
            onClick: (ve) => He(O)
          }, [
            p("div", oi, j(a.value(O)), 1),
            E.value && E.value(O) ? (d(), h("div", li, j(E.value(O)), 1)) : R("", !0)
          ], 8, si))), 128))
        ])
      ]),
      _: 1
    }, 512));
  }
}, ri = /* @__PURE__ */ Pt(ai, [["__scopeId", "data-v-86b8a254"]]), ci = { class: "header-row" }, ui = ["checked", "disabled"], di = { class: "title-el" }, fi = { class: "status-el" }, vi = { class: "width-row" }, pi = { class: "font-row" }, mi = { class: "audio-row" }, hi = { class: "audio-content-row" }, yi = {
  key: 0,
  class: "muted-note"
}, gi = {
  key: 1,
  class: "muted-note"
}, ki = { class: "audio-label" }, bi = ["src"], wi = {
  key: 3,
  class: "muted-note"
}, Ci = {
  key: 0,
  class: "timing-warning"
}, Li = { class: "actions-row" }, Si = ["data-row-index"], Ei = { class: "malformed-warn-line" }, Ii = ["value", "onInput"], xi = { class: "top-line" }, _i = ["title", "onClick"], Ti = ["title", "onClick"], Ai = ["onMouseenter"], ji = { class: "instruct-line" }, Pi = {
  key: 0,
  class: "instruct-desc"
}, Ri = ["value", "onInput", "onPaste"], Di = { key: 0 }, Oi = { class: "role-info-key" }, $i = { class: "role-info-value" }, Ni = 600, ot = 3e3, Fi = 1500, _t = 1600, zi = 11.5, Bi = 9, Mi = 22, Tt = "FL_CosyVoice3.LineEditor.widthPx", lt = "FL_CosyVoice3.LineEditor.textFontSizePx", Ki = {
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
    const s = o, u = [1280, 1600];
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
        const e = localStorage.getItem(Tt);
        if (e === "full") return "full";
        const t = parseFloat(e);
        return Number.isFinite(t) ? t : _t;
      } catch {
        return _t;
      }
    }
    function E(e) {
      try {
        localStorage.setItem(Tt, String(e));
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
    let fe = 1;
    function M(e) {
      return { ...e, __key: fe++ };
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
    const O = Hn();
    function H({ title: e = "Confirm", message: t = "", okText: n = "OK", cancelText: i = "Cancel" } = {}) {
      return new Promise((l) => {
        O.require({
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
    const ve = y(!0), A = y(s.filename), v = y([]), Ce = y([]), N = y([]), pe = y(null), Re = y([]), De = y([]), te = y([]), ut = y(""), dt = y(a()), V = y(L(lt, zi)), q = y(null), me = y(-1), ne = y(!1), ie = y(-1), Oe = y(s.checkedApi ? s.checkedApi.isChecked(s.filename) : !1), _ = st({ checking: !0, best: null, mtime: null, error: null }), J = st({ visible: !1, top: 0, left: 0, code: null }), $e = y(null), se = st(/* @__PURE__ */ new Set());
    let he = 1, ye = null, Ne = null, Ve = 0, ge = null, oe = null, G = null, Le = null, Se = null, Ee = null, qe = !1, Je = null, Ie = null;
    const We = y(null), Ze = y(null), Fe = /* @__PURE__ */ new Map(), Xe = /* @__PURE__ */ new Map(), ze = y(null), ft = S(() => X(s.folder, A.value)), xe = S(() => X(s.folder, "_audio")), le = S(() => On(A.value, s.suffix)), vt = S(() => X(X(xe.value, "lines"), le.value)), pt = S(() => X(vt.value, "_state.json")), I = S(() => De.value.includes(A.value)), Ye = S(() => {
      const e = v.value.filter((t) => !t.malformed);
      return e.length > 0 && e.every((t) => t.status === "voiced");
    }), Nt = S(() => B(dt.value));
    function f(e) {
      ut.value = e;
    }
    function mt(e) {
      dt.value = e, E(e);
    }
    function ht(e) {
      if (!e) return "";
      const t = N.value.find((l) => l.code === e), n = t && t.speaker ? t.speaker : e, i = String(n).split("#", 1)[0].trim();
      return i ? `${i}.pt` : "";
    }
    function Ft() {
      const e = {};
      return N.value.forEach((t) => {
        const n = String(t.speaker || "").split("#", 1)[0].trim();
        !n || !t.code || (e[n] = e[n] || []).push(t.code);
      }), e;
    }
    async function zt() {
      if (!pe.value)
        return f("No _roles.json found for this project -- can't save"), !1;
      try {
        const t = await (await fetch(`${ke}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pe.value, content: JSON.stringify({ roles: N.value }, null, 2) })
        })).json();
        return t.error ? (f(`Error saving _roles.json: ${t.error}`), !1) : !0;
      } catch (e) {
        return f(`Error saving _roles.json: ${e}`), !1;
      }
    }
    async function Bt(e) {
      if (!pe.value) return;
      const t = $n(pe.value), n = await Nn(t, e, s.suffix);
      f(n.message), (n.changed.some((i) => i.file === A.value) || n.untracked.some((i) => i.file === A.value)) && (await yt(), await Lt(), ge = null, oe = null, ae(), Ae());
    }
    function Mt(e, t) {
      if (!Array.isArray(e) || !e.length) return null;
      const n = [];
      return t.forEach((i, l) => {
        i.malformed || n.push(l);
      }), n.length !== e.length ? null : { lines: e, rowIndexMap: n };
    }
    const F = S(() => I.value ? Mt(q.value, v.value) : null), _e = S(() => {
      const e = /* @__PURE__ */ new Map();
      return F.value && F.value.rowIndexMap.forEach((t, n) => e.set(t, n)), e;
    }), Kt = S(() => !!(I.value && q.value && q.value.length && !F.value));
    function Ut() {
      return JSON.stringify({
        next_id: he,
        lines: v.value.filter((e) => !e.malformed).map((e) => ({ id: e.id, text: e.text, status: e.status }))
      }, null, 2);
    }
    function Ht(e, t) {
      const n = t && Array.isArray(t.lines) ? t.lines : [];
      let i = t && Number.isFinite(t.next_id) ? t.next_id : 1;
      const l = e.filter((c) => !c.malformed);
      if (n.length === l.length)
        return l.forEach((c, w) => {
          const C = n[w];
          c.id = Number.isFinite(C.id) ? C.id : i++;
          const P = (C.text || "") === c.text;
          c.status = P ? C.status === "voiced" || C.status === "stale" ? C.status : "unvoiced" : C.status === "voiced" || C.status === "stale" ? "stale" : "unvoiced";
        }), Math.max(i, ...l.map((c) => c.id + 1), 1);
      const r = /* @__PURE__ */ new Map();
      n.forEach((c) => {
        const w = (c.text || "").trim();
        r.has(w) || r.set(w, []), r.get(w).push(c);
      });
      const m = /* @__PURE__ */ new Map();
      return l.forEach((c) => {
        const w = (c.text || "").trim(), C = r.get(w), P = m.get(w) || 0;
        if (C && P < C.length) {
          const W = C[P];
          m.set(w, P + 1), c.id = Number.isFinite(W.id) ? W.id : i++, c.status = W.status === "voiced" ? "voiced" : "unvoiced";
        } else
          c.id = i++, c.status = "unvoiced";
      }), i;
    }
    async function yt() {
      let e = null, t = null;
      try {
        const i = await (await fetch(`${ke}/read?path=${encodeURIComponent(pt.value)}`)).json();
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
      he = Ht(v.value, e), Ne = t;
    }
    function Te(e) {
      e.status === "voiced" && (e.status = "stale");
    }
    function Ge() {
      Ie && (Ie.pause(), Ie.src = "", Ie = null), ie.value = -1;
    }
    function Vt(e) {
      Ge();
      const t = vt.value, n = (i) => {
        for (; i < v.value.length && (v.value[i].malformed || v.value[i].status === "unvoiced"); ) i++;
        if (i >= v.value.length) {
          ie.value = -1;
          return;
        }
        ie.value = i;
        const l = v.value[i], r = new Audio(`${ce}/audio?path=${encodeURIComponent(X(t, `id${l.id}.wav`))}&v=${Date.now()}`);
        Ie = r, r.addEventListener("ended", () => n(i + 1)), r.play().catch((m) => f(`Playback failed: ${m}`));
      };
      n(e);
    }
    function Be() {
      var i;
      const e = We.value;
      if (!F.value || !e) {
        me.value = -1;
        return;
      }
      const t = e.currentTime;
      let n = -1;
      for (let l = 0; l < F.value.lines.length; l++)
        if (t >= F.value.lines[l].start && t < F.value.lines[l].end) {
          n = l;
          break;
        }
      if (n !== me.value && (me.value = n, n >= 0 && ne.value)) {
        const l = F.value.rowIndexMap[n], r = l !== void 0 ? Fe.get((i = v.value[l]) == null ? void 0 : i.__key) : null;
        r == null || r.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function Ae({ silent: e = !1 } = {}) {
      const t = X(X(xe.value, "timing"), `${le.value}.json`);
      try {
        const i = await (await fetch(`${ke}/read?path=${encodeURIComponent(t)}`)).json();
        if (!i.exists) {
          q.value = null, oe = null;
          return;
        }
        if (e && i.mtime === oe) return;
        const l = i.mtime !== oe;
        oe = i.mtime;
        let r;
        try {
          r = JSON.parse(i.content);
        } catch {
          q.value = null;
          return;
        }
        q.value = Array.isArray(r.lines) ? r.lines : null;
        const m = v.value.filter((c) => !c.malformed);
        l && q.value && q.value.length === m.length && m.length > 0 && await qt(m), ee(Be);
      } catch {
      }
    }
    async function qt(e) {
      try {
        const n = await (await fetch(`${ce}/commit_full_render`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: s.folder,
            base_name: le.value,
            row_texts: e.map((l) => l.text),
            row_ids: e.map((l) => Number.isFinite(l.id) ? l.id : null)
          })
        })).json();
        if (n.error || !Array.isArray(n.ids)) return;
        const i = new Set(n.committed_ids || []);
        e.forEach((l, r) => {
          l.id = n.ids[r], i.has(n.ids[r]) && (l.status = "voiced");
        }), Number.isFinite(n.next_id) && (he = Math.max(he, n.next_id)), i.size && je();
      } catch {
      }
    }
    function Jt() {
      qe || (qe = !0, G && (clearTimeout(G), je()), Le && clearInterval(Le), Se && clearInterval(Se), Ee && clearInterval(Ee), s.onClose());
    }
    it(ve, (e) => {
      e || Jt();
    });
    function K() {
      Ve = Date.now(), G && clearTimeout(G), G = setTimeout(je, Ni);
    }
    async function je() {
      const e = $(v.value), t = Ut(), n = e !== ye, i = t !== Ne;
      if (!(!n && !i))
        try {
          if (n) {
            const r = await (await fetch(`${ke}/write`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: ft.value, content: e })
            })).json();
            if (r.error) {
              f(`Save error: ${r.error}`);
              return;
            }
            ye = e;
          }
          i && (await fetch(`${ke}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: pt.value, content: t })
          }), Ne = t), f(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (l) {
          f(`Save failed: ${l}`);
        }
    }
    function Pe(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function gt(e, t) {
      if (!t) {
        Xe.delete(e);
        return;
      }
      Xe.set(e, t.$el ?? t);
    }
    function Wt() {
      ee(() => Xe.forEach(Pe));
    }
    function Zt(e, t) {
      if (!t) {
        Fe.delete(e);
        return;
      }
      Fe.set(e, t);
    }
    async function kt(e) {
      var n;
      $e.value = e, await ee();
      const t = Fe.get(e);
      t == null || t.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = t == null ? void 0 : t.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        $e.value === e && ($e.value = null);
      }, 500);
    }
    async function Xt(e, t) {
      const n = v.value[e], i = v.value[t];
      if (!n || !i || n.malformed || i.malformed) return;
      const l = Math.min(e, t), r = Math.max(e, t), m = v.value[l], c = v.value[r];
      (m.speaker || "").trim() !== (c.speaker || "").trim() && !await H({
        title: "Merge lines with different speakers?",
        message: `"${m.speaker}" and "${c.speaker}" are different speakers. Merge anyway? The combined line keeps "${m.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }) || (m.text = `${m.text} ${c.text}`.trim(), m.status = "unvoiced", v.value.splice(r, 1), K());
    }
    function Yt(e, t) {
      !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const i = e.closest(".fl-line-row");
        Je = Number(i == null ? void 0 : i.dataset.rowIndex), i == null || i.classList.add("fl-row-dragging");
        const l = (m) => {
          var C;
          (C = Ze.value) == null || C.querySelectorAll(".fl-row-drop-target").forEach((P) => P.classList.remove("fl-row-drop-target"));
          const c = document.elementFromPoint(m.clientX, m.clientY), w = c && c.closest ? c.closest(".fl-line-row") : null;
          w && w !== i && w.classList.add("fl-row-drop-target");
        }, r = (m) => {
          var P;
          document.removeEventListener("pointermove", l), document.removeEventListener("pointerup", r), document.removeEventListener("pointercancel", r);
          const c = document.elementFromPoint(m.clientX, m.clientY), w = c && c.closest ? c.closest(".fl-line-row") : null, C = Je;
          if (Je = null, i == null || i.classList.remove("fl-row-dragging"), (P = Ze.value) == null || P.querySelectorAll(".fl-row-drop-target").forEach((W) => W.classList.remove("fl-row-drop-target")), w && w !== i) {
            const W = Number(w.dataset.rowIndex);
            Number.isNaN(W) || Xt(C, W);
          }
        };
        document.addEventListener("pointermove", l), document.addEventListener("pointerup", r), document.addEventListener("pointercancel", r);
      }));
    }
    function Gt(e) {
      v.value.splice(e, 1), K();
    }
    async function bt(e, t) {
      t && t.trim() && !await H({
        title: "Delete this line?",
        message: t.length > 200 ? t.slice(0, 200) + "…" : t,
        okText: "Delete",
        cancelText: "Cancel"
      }) || Gt(e);
    }
    function Qt(e) {
      Te(e), K();
    }
    function en(e) {
      Te(e), K();
    }
    function wt(e, t) {
      Pe(t), Te(e), K();
    }
    function tn(e, t, n) {
      n.preventDefault();
      const i = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), l = t.selectionStart, r = t.selectionEnd;
      t.value = t.value.slice(0, l) + i + t.value.slice(r), t.selectionStart = t.selectionEnd = l + i.length, e.text = t.value, wt(e, t);
    }
    function nn(e) {
      const t = N.value.find((i) => i.code === e.speaker), n = ht(e.speaker);
      return t ? `Change "${t.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${e.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function Ct(e) {
      const t = Ce.value.find((n) => (n.text || "").trim() === e.instruct.trim());
      return t && t.note ? t.note : null;
    }
    function sn(e, t) {
      if (!N.value.length) {
        f("No roles catalog found for this project (_roles.json)");
        return;
      }
      ze.value.open(e, {
        items: N.value,
        getLabel: (n) => n.code || n.speaker || "",
        getSubLabel: (n) => [n.name, n.speaker, n.description].filter(Boolean).join(" -- "),
        onPick: (n) => {
          const i = n.code || n.speaker || "";
          t.speaker = i, Te(t), K();
        }
      });
    }
    function on(e, t) {
      const n = N.value.find((l) => l.code === t.speaker);
      if (!n) return;
      if (!Re.value.length) {
        f("No saved speaker presets found (FL CosyVoice3 Save Speaker)");
        return;
      }
      const i = Ft();
      ze.value.open(e, {
        items: Re.value,
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
      if (!Ce.value.length) {
        f("No instructions catalog found for this project (_instructions.json)");
        return;
      }
      ze.value.open(e, {
        items: Ce.value,
        getLabel: (n) => n.text,
        getSubLabel: (n) => n.note || "",
        onPick: (n) => {
          t.instruct = n.text, Te(t), K();
        }
      });
    }
    function an(e, t) {
      const n = e.getBoundingClientRect();
      J.left = Math.min(n.left, window.innerWidth - 280), J.top = n.bottom + 4, J.code = t, J.visible = !0;
    }
    function rn() {
      J.visible = !1;
    }
    const Qe = S(() => {
      const e = J.code;
      if (!e) return { message: "No speaker set on this line yet" };
      const t = N.value.find((i) => i.code === e);
      if (!t) return { message: `"${e}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(t).filter(([, i]) => i !== "" && i !== null && i !== void 0 && i !== t.__key);
      return n.length ? { fields: n } : { message: `"${e}" has no fields set in _roles.json` };
    });
    function cn(e) {
      return se.has(e) ? "Re-voicing..." : e.status === "stale" ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : e.status === "voiced" ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function un(e) {
      if (!se.has(e)) {
        se.add(e), f("Re-voicing...");
        try {
          await s.revoiceApi.revoiceLine({ lineId: e.id, speaker: e.speaker, instruct: e.instruct, text: e.text }), e.status = "voiced", f("Line re-voiced");
        } catch (t) {
          f(`Re-voice failed: ${t.message || t}`);
        } finally {
          se.delete(e), je();
        }
      }
    }
    function dn(e, t) {
      if (I.value) {
        const i = _e.value.get(t), l = We.value;
        if (i === void 0 || !l || !F.value) return;
        l.currentTime = F.value.lines[i].start, l.play();
      } else ie.value === t ? Ge() : Vt(t);
    }
    async function ae({ silent: e = !1 } = {}) {
      e || (_.checking = !0);
      try {
        const n = await (await fetch(`/fl_cosyvoice3/browse/list_dir?path=${encodeURIComponent(xe.value)}`)).json(), i = Array.isArray(n.files) ? n.files : [], l = n.file_mtimes || {}, r = le.value.toLowerCase(), m = i.filter((C) => {
          const P = C.lastIndexOf(".");
          return (P > 0 ? C.slice(0, P) : C).toLowerCase().startsWith(r);
        });
        m.sort();
        const c = m.length ? m[m.length - 1] : null, w = c ? `${c}::${l[c] || ""}` : null;
        if (e && w === ge) return;
        ge = w, _.checking = !1, _.error = null, _.best = c, _.mtime = c ? l[c] || Date.now() : null, c || (ne.value = !1, ee(Be));
      } catch (t) {
        _.checking = !1, _.error = String(t);
      }
    }
    const fn = S(() => !_.best || I.value);
    async function vn() {
      if (!(!_.best || I.value || !await H({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${le.value}" (currently: ${_.best}).`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${ce}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: s.folder, base_name: le.value, filename: A.value })
          })).json();
          if (n.error) {
            f(`Error: ${n.error}`);
            return;
          }
          f(`Deleted ${n.deleted.length} audio file(s)`), ge = null, ae();
        } catch (t) {
          f(`Error: ${t}`);
        }
    }
    function pn(e) {
      var t;
      (t = s.checkedApi) == null || t.setChecked(A.value, e);
    }
    const mn = S(() => !I.value && !Ye.value), hn = S(() => I.value ? "Marked ready to release -- click to unmark and go back to editing" : Ye.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function yn() {
      var t;
      const e = !I.value;
      if (e && !Ye.value) {
        f("Every line needs to be voiced before marking done");
        return;
      }
      if (e) {
        f("Stitching final file...");
        const n = v.value.filter((i) => !i.malformed);
        try {
          const l = await (await fetch(`${ce}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: s.folder,
              base_name: le.value,
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
        const i = await (await fetch(`${ce}/set_ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: s.folder, filename: A.value, ready: e })
        })).json();
        if (i.error) {
          f(`Error: ${i.error}`);
          return;
        }
        De.value = i.ready_scripts || [], e && ((t = s.checkedApi) == null || t.setChecked(A.value, !1), Oe.value = !1), f(e ? "Stitched and marked done" : "Unmarked -- can be edited/re-voiced again"), e && (ge = null, oe = null, ae(), Ae());
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
      const t = e.closest(".fl-line-row"), n = t ? Number(t.dataset.rowIndex) : -1, i = n >= 0 ? v.value[n] : null;
      if (!i || i.malformed) {
        f("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const l = e.selectionStart, r = i.text.slice(0, l).trimEnd(), m = i.text.slice(l).trimStart();
      i.text = r, i.status = "unvoiced";
      const c = M({ speaker: i.speaker, instruct: i.instruct, text: m, raw: "", malformed: !1, id: he++, status: "unvoiced" });
      v.value.splice(n + 1, 0, c), kt(c.__key), K();
    }
    function bn() {
      const e = M({ speaker: "", instruct: "", text: "", raw: "", malformed: !1, id: he++, status: "unvoiced" });
      v.value.push(e), kt(e.__key), K();
    }
    const Q = S(() => te.value.indexOf(A.value)), wn = S(() => !(Q.value > 0)), Cn = S(() => !(Q.value >= 0 && Q.value < te.value.length - 1));
    function Ln() {
      Q.value > 0 && St(te.value[Q.value - 1]);
    }
    function Sn() {
      Q.value >= 0 && Q.value < te.value.length - 1 && St(te.value[Q.value + 1]);
    }
    async function En() {
      try {
        const t = await (await fetch(Dn)).json();
        Re.value = t.presets || [];
      } catch {
        Re.value = [];
      }
    }
    async function Lt() {
      var e, t, n;
      try {
        const i = `${ce}/scan?path=${encodeURIComponent(s.folder)}&act=&suffix=${encodeURIComponent(s.suffix)}`, r = await (await fetch(i)).json();
        Ce.value = ((e = r.instructions) == null ? void 0 : e.entries) || [], N.value = ((t = r.roles) == null ? void 0 : t.entries) || [], pe.value = ((n = r.roles) == null ? void 0 : n.path) || null, te.value = Array.isArray(r.scripts) ? r.scripts : [], De.value = Array.isArray(r.ready_scripts) ? r.ready_scripts : [];
      } catch {
        Ce.value = [], N.value = [], pe.value = null, te.value = [], De.value = [];
      }
    }
    async function St(e) {
      !e || e === A.value || qe || (G && (clearTimeout(G), G = null, await je()), A.value = e, ge = null, q.value = null, oe = null, v.value = [], ye = null, Ve = 0, Oe.value = s.checkedApi ? s.checkedApi.isChecked(e) : !1, f("Loading..."), await et(), ae(), Ae());
    }
    async function et({ isPoll: e = !1 } = {}) {
      try {
        const n = await (await fetch(`${ke}/read?path=${encodeURIComponent(ft.value)}`)).json();
        if (n.error) {
          f(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          e || (v.value = [], ye = "", Ne = null, f("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (e && Date.now() - Ve < Fi || n.content === ye) return;
        v.value = He(n.content), ye = n.content, await yt(), e || f(`Loaded ${v.value.length} line(s)`);
      } catch (t) {
        f(`Read failed: ${t}`);
      }
    }
    return it(F, () => ee(Be)), it(V, Wt), Pn(() => {
      Lt(), En(), ae(), Se = setInterval(() => ae({ silent: !0 }), ot), et().then(() => {
        Le = setInterval(() => et({ isPoll: !0 }), ot), Ae(), Ee = setInterval(() => Ae({ silent: !0 }), ot);
      });
    }), Rn(() => {
      Ge(), Le && clearInterval(Le), Se && clearInterval(Se), Ee && clearInterval(Ee);
    }), (e, t) => (d(), h(z, null, [
      k(g(Rt), {
        visible: ve.value,
        "onUpdate:visible": t[10] || (t[10] = (n) => ve.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: re({ width: Nt.value, height: "92vh" }),
        "content-style": { display: "flex", flexDirection: "column", height: "100%", padding: 0 },
        class: "line-editor-dialog"
      }, {
        header: U(() => [
          p("div", ci, [
            p("input", {
              type: "checkbox",
              class: "row-checkbox",
              checked: Oe.value,
              disabled: !o.checkedApi || I.value,
              title: "Mark this script as checked for queueing (Script Library's tree)",
              onChange: t[0] || (t[0] = (n) => {
                Oe.value = n.target.checked, pn(n.target.checked);
              })
            }, null, 40, ui),
            k(g(x), {
              label: I.value ? "Done ✓" : "Done",
              size: "small",
              outlined: !I.value,
              disabled: mn.value,
              title: hn.value,
              onClick: yn
            }, null, 8, ["label", "outlined", "disabled", "title"]),
            p("div", di, j(A.value), 1),
            p("div", fi, j(ut.value), 1),
            p("div", vi, [
              (d(), h(z, null, Ue(u, (n) => k(g(x), {
                key: n,
                label: String(n),
                text: "",
                size: "small",
                title: `Set editor width to ${n}px (capped to the window's width)`,
                onClick: (i) => mt(n)
              }, null, 8, ["label", "title", "onClick"])), 64)),
              k(g(x), {
                label: "100%",
                text: "",
                size: "small",
                title: "Use the full available window width",
                onClick: t[1] || (t[1] = (n) => mt("full"))
              })
            ]),
            p("div", pi, [
              k(g(x), {
                label: "A−",
                text: "",
                size: "small",
                title: "Decrease line text font size",
                onClick: t[2] || (t[2] = (n) => {
                  V.value = Math.max(Bi, V.value - 1), b(lt, V.value);
                })
              }),
              k(g(x), {
                label: "A+",
                text: "",
                size: "small",
                title: "Increase line text font size",
                onClick: t[3] || (t[3] = (n) => {
                  V.value = Math.min(Mi, V.value + 1), b(lt, V.value);
                })
              })
            ])
          ])
        ]),
        default: U(() => [
          p("div", mi, [
            p("div", hi, [
              _.checking ? (d(), h("div", yi, "Checking for audio...")) : _.error ? (d(), h("div", gi, "Audio check failed: " + j(_.error), 1)) : _.best ? (d(), h(z, { key: 2 }, [
                p("div", ki, j(_.best), 1),
                p("audio", {
                  ref_key: "audioElRef",
                  ref: We,
                  controls: "",
                  class: "audio-el",
                  src: `${g(ce)}/audio?path=${encodeURIComponent(g(X)(xe.value, _.best))}&v=${encodeURIComponent(_.mtime || "")}`,
                  onTimeupdate: Be,
                  onPlay: t[4] || (t[4] = (n) => ne.value = !0),
                  onPause: t[5] || (t[5] = (n) => ne.value = !1),
                  onEnded: t[6] || (t[6] = (n) => ne.value = !1)
                }, null, 40, bi),
                k(g(x), {
                  label: "🗑 Delete audio",
                  text: "",
                  size: "small",
                  disabled: fn.value,
                  title: I.value ? "Marked ready to release -- unmark it (Done) before deleting audio" : "Delete the rendered audio for this script",
                  onClick: vn
                }, null, 8, ["disabled", "title"])
              ], 64)) : (d(), h("div", wi, "No audio yet in " + j(xe.value), 1)),
              k(g(x), {
                icon: "pi pi-refresh",
                text: "",
                size: "small",
                title: "Re-check _audio\\ for this script's rendered audio",
                onClick: t[7] || (t[7] = (n) => ae())
              })
            ]),
            Kt.value ? (d(), h("div", Ci, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : R("", !0)
          ]),
          p("div", Li, [
            k(g(x), {
              label: "´ Stress mark",
              text: "",
              size: "small",
              title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
              onMousedown: Me(gn, ["prevent"])
            }),
            k(g(x), {
              label: "✂ Split line",
              text: "",
              size: "small",
              title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
              onMousedown: Me(kn, ["prevent"])
            }),
            k(g(x), {
              label: "+ Add line",
              text: "",
              size: "small",
              title: "Add a new empty line at the end of the script",
              onClick: bn
            }),
            t[11] || (t[11] = p("div", { class: "actions-divider" }, null, -1)),
            k(g(x), {
              label: "◀ Prev",
              text: "",
              size: "small",
              disabled: wn.value,
              title: "Open the previous script in this act",
              onClick: Ln
            }, null, 8, ["disabled"]),
            k(g(x), {
              label: "Next ▶",
              text: "",
              size: "small",
              disabled: Cn.value,
              title: "Open the next script in this act",
              onClick: Sn
            }, null, 8, ["disabled"])
          ]),
          p("div", {
            ref_key: "rowsContainerEl",
            ref: Ze,
            class: "rows-container"
          }, [
            (d(!0), h(z, null, Ue(v.value, (n, i) => (d(), h("div", {
              key: n.__key,
              class: be(["fl-line-row", { "row-enter": $e.value === n.__key, "row-playing": I.value ? _e.value.get(i) === me.value : ie.value === i }]),
              "data-row-index": i,
              ref_for: !0,
              ref: (l) => Zt(n.__key, l),
              style: re(n.malformed ? {} : { borderLeftColor: D(n.speaker) })
            }, [
              n.malformed ? (d(), h(z, { key: 0 }, [
                p("div", Ei, [
                  t[12] || (t[12] = p("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  k(g(x), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => bt(i, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                p("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: re({ fontSize: `${V.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    gt(n.__key, l), ee(() => Pe(l));
                  },
                  onInput: (l) => {
                    n.raw = l.target.value, Pe(l.target), K();
                  },
                  onKeydown: t[8] || (t[8] = xt(Me(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, Ii)
              ], 64)) : (d(), h(z, { key: 1 }, [
                p("div", xi, [
                  p("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (l) => Yt(l, i)
                  }, "⠿", 512),
                  (I.value ? _e.value.get(i) !== void 0 : n.status !== "unvoiced") ? (d(), h("span", {
                    key: 0,
                    class: "play-btn",
                    style: re({ color: (I.value ? me.value === _e.value.get(i) : ie.value === i) && ne.value ? "#e0b030" : "#4caf50" }),
                    title: I.value ? "Play from this line" : "Play this line (and every voiced line after it)",
                    onClick: (l) => dn(n, i)
                  }, j((I.value ? me.value === _e.value.get(i) : ie.value === i) && ne.value ? "⏸" : "▶"), 13, _i)) : R("", !0),
                  o.revoiceApi && !I.value ? (d(), h("span", {
                    key: 1,
                    class: be(["revoice-btn", { pending: se.has(n) }]),
                    style: re({ color: !se.has(n) && n.status === "stale" ? "#e0a030" : "" }),
                    title: cn(n),
                    onClick: (l) => un(n)
                  }, j(se.has(n) ? "⏳" : "🔁"), 15, Ti)) : R("", !0),
                  k(g(x), {
                    icon: "pi pi-user",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from _roles.json",
                    onClick: (l) => sn(l, n)
                  }, null, 8, ["onClick"]),
                  k(g(ct), {
                    class: "speaker-input",
                    "model-value": n.speaker,
                    title: "Speaker (preset or preset#tag)",
                    "onUpdate:modelValue": (l) => {
                      n.speaker = l, Qt(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  k(g(x), {
                    class: "speaker-file-btn",
                    text: "",
                    size: "small",
                    label: ht(n.speaker) || "(no speaker)",
                    disabled: !N.value.find((l) => l.code === n.speaker),
                    title: nn(n),
                    onClick: (l) => on(l, n)
                  }, null, 8, ["label", "disabled", "title", "onClick"]),
                  p("span", {
                    class: "role-info-btn",
                    onMouseenter: (l) => an(l.target, n.speaker),
                    onMouseleave: rn
                  }, "ℹ", 40, Ai),
                  t[13] || (t[13] = p("div", { class: "spacer" }, null, -1)),
                  k(g(x), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (l) => bt(i, n.text)
                  }, null, 8, ["onClick"])
                ]),
                p("div", ji, [
                  k(g(x), {
                    icon: "pi pi-list",
                    text: "",
                    size: "small",
                    class: "icon-btn",
                    title: "Pick from the instructions catalog (_instructions.json)",
                    onClick: (l) => ln(l, n)
                  }, null, 8, ["onClick"]),
                  k(g(ct), {
                    class: "instruct-input",
                    "model-value": n.instruct,
                    title: "Instruct text",
                    "onUpdate:modelValue": (l) => {
                      n.instruct = l, en(n);
                    }
                  }, null, 8, ["model-value", "onUpdate:modelValue"])
                ]),
                Ct(n) ? (d(), h("div", Pi, "↳ " + j(Ct(n)), 1)) : R("", !0),
                p("textarea", {
                  class: "fl-textarea",
                  style: re({ fontSize: `${V.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (l) => {
                    gt(n.__key, l), ee(() => Pe(l));
                  },
                  onInput: (l) => {
                    n.text = l.target.value, wt(n, l.target);
                  },
                  onKeydown: t[9] || (t[9] = xt(Me(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (l) => tn(n, l.target, l)
                }, null, 44, Ri)
              ], 64))
            ], 14, Si))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      k(ri, {
        ref_key: "pickPanelRef",
        ref: ze
      }, null, 512),
      k(g(Ot)),
      J.visible ? (d(), h("div", {
        key: 0,
        class: "role-info-popover",
        style: re({ left: `${J.left}px`, top: `${J.top}px` })
      }, [
        Qe.value.message ? (d(), h("div", Di, j(Qe.value.message), 1)) : R("", !0),
        (d(!0), h(z, null, Ue(Qe.value.fields, ([n, i]) => (d(), h("div", {
          key: n,
          class: "role-info-row"
        }, [
          p("span", Oi, j(n), 1),
          p("span", $i, j(i), 1)
        ]))), 128))
      ], 4)) : R("", !0)
    ], 64));
  }
}, Ui = /* @__PURE__ */ Pt(Ki, [["__scopeId", "data-v-70d31e59"]]);
function Zi({ folder: o, filename: s, suffix: u = "_speakers.txt", checkedApi: L, revoiceApi: b }) {
  Fn(import.meta.url);
  const a = document.createElement("div");
  document.body.appendChild(a);
  const E = zn(Ui, {
    folder: o,
    filename: s,
    suffix: u,
    checkedApi: L || null,
    revoiceApi: b || null,
    onClose: () => {
      E.unmount(), a.remove();
    }
  });
  E.use(Bn, { ripple: !0 }), E.use(Vn), E.mount(a);
}
export {
  Zi as openLineEditor
};
