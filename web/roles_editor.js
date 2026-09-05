import { B as se, C as re, d as f, j as b, z as d, y as C, i as P, e as z, X as ue, Y as ye, D as y, v as W, F as G, k as ne, f as q, R as ze, $ as T, a0 as Fe, E as Pe, Z as oe, U as de, G as Te, h as J, t as A, c as R, A as le, n as te, a as N, T as Ee, x as Me, H as xe, _ as Be, l as De, w as Ae, o as Ke, J as He, u as U, L as Re, M as ce, I as je, r as ie, W as Ne, m as $e, p as Ue, P as Ge } from "./styles_link.js";
import { a as We, b as qe, s as Ze } from "./dialog.esm.js";
import { a as Je, s as he } from "./message.esm.js";
import { O as Ye } from "./overlayeventbus.esm.js";
var Qe = {
  root: "p-card p-component",
  header: "p-card-header",
  body: "p-card-body",
  caption: "p-card-caption",
  title: "p-card-title",
  subtitle: "p-card-subtitle",
  content: "p-card-content",
  footer: "p-card-footer"
}, Xe = se.extend({
  name: "card",
  classes: Qe
}), _e = {
  name: "BaseCard",
  extends: re,
  style: Xe
}, be = {
  name: "Card",
  extends: _e,
  inheritAttrs: !1
};
function et(t, e, i, s, r, n) {
  return f(), b("div", d({
    class: t.cx("root")
  }, t.ptmi("root")), [t.$slots.header ? (f(), b("div", d({
    key: 0,
    class: t.cx("header")
  }, t.ptm("header")), [C(t.$slots, "header")], 16)) : P("", !0), z("div", d({
    class: t.cx("body")
  }, t.ptm("body")), [t.$slots.title || t.$slots.subtitle ? (f(), b("div", d({
    key: 0,
    class: t.cx("caption")
  }, t.ptm("caption")), [t.$slots.title ? (f(), b("div", d({
    key: 0,
    class: t.cx("title")
  }, t.ptm("title")), [C(t.$slots, "title")], 16)) : P("", !0), t.$slots.subtitle ? (f(), b("div", d({
    key: 1,
    class: t.cx("subtitle")
  }, t.ptm("subtitle")), [C(t.$slots, "subtitle")], 16)) : P("", !0)], 16)) : P("", !0), z("div", d({
    class: t.cx("content")
  }, t.ptm("content")), [C(t.$slots, "content")], 16), t.$slots.footer ? (f(), b("div", d({
    key: 1,
    class: t.cx("footer")
  }, t.ptm("footer")), [C(t.$slots, "footer")], 16)) : P("", !0)], 16)], 16);
}
be.render = et;
var Oe = {
  name: "BlankIcon",
  extends: ue
}, tt = /* @__PURE__ */ z("rect", {
  width: "1",
  height: "1",
  fill: "currentColor",
  "fill-opacity": "0"
}, null, -1), it = [tt];
function nt(t, e, i, s, r, n) {
  return f(), b("svg", d({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), it, 16);
}
Oe.render = nt;
var Ie = {
  name: "ChevronDownIcon",
  extends: ue
}, st = /* @__PURE__ */ z("path", {
  d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
  fill: "currentColor"
}, null, -1), rt = [st];
function ot(t, e, i, s, r, n) {
  return f(), b("svg", d({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), rt, 16);
}
Ie.render = ot;
var Se = {
  name: "SearchIcon",
  extends: ue
}, lt = /* @__PURE__ */ z("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
  fill: "currentColor"
}, null, -1), at = [lt];
function ut(t, e, i, s, r, n) {
  return f(), b("svg", d({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), at, 16);
}
Se.render = ut;
var dt = `
@layer primevue {
    .p-virtualscroller {
        position: relative;
        overflow: auto;
        contain: strict;
        transform: translateZ(0);
        will-change: scroll-position;
        outline: 0 none;
    }

    .p-virtualscroller-content {
        position: absolute;
        top: 0;
        left: 0;
        /* contain: content; */
        min-height: 100%;
        min-width: 100%;
        will-change: transform;
    }

    .p-virtualscroller-spacer {
        position: absolute;
        top: 0;
        left: 0;
        height: 1px;
        width: 1px;
        transform-origin: 0 0;
        pointer-events: none;
    }

    .p-virtualscroller .p-virtualscroller-loader {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-virtualscroller-loader.p-component-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .p-virtualscroller-loading-icon {
        font-size: 2rem;
    }

    .p-virtualscroller-loading-icon.p-icon {
        width: 2rem;
        height: 2rem;
    }

    .p-virtualscroller-horizontal > .p-virtualscroller-content {
        display: flex;
    }

    /* Inline */
    .p-virtualscroller-inline .p-virtualscroller-content {
        position: static;
    }
}
`, pe = se.extend({
  name: "virtualscroller",
  css: dt
}), ct = {
  name: "BaseVirtualScroller",
  extends: re,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: pe,
  provide: function() {
    return {
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    pe.loadStyle({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function Y(t) {
  "@babel/helpers - typeof";
  return Y = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Y(t);
}
function fe(t, e) {
  var i = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t);
    e && (s = s.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), i.push.apply(i, s);
  }
  return i;
}
function Z(t) {
  for (var e = 1; e < arguments.length; e++) {
    var i = arguments[e] != null ? arguments[e] : {};
    e % 2 ? fe(Object(i), !0).forEach(function(s) {
      we(t, s, i[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(i)) : fe(Object(i)).forEach(function(s) {
      Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(i, s));
    });
  }
  return t;
}
function we(t, e, i) {
  return e = ht(e), e in t ? Object.defineProperty(t, e, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = i, t;
}
function ht(t) {
  var e = pt(t, "string");
  return Y(e) == "symbol" ? e : String(e);
}
function pt(t, e) {
  if (Y(t) != "object" || !t) return t;
  var i = t[Symbol.toPrimitive];
  if (i !== void 0) {
    var s = i.call(t, e);
    if (Y(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ce = {
  name: "VirtualScroller",
  extends: ct,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, i) {
      this.lazy && e !== i && e !== this.d_loading && (this.d_loading = e);
    },
    items: function(e, i) {
      (!i || i.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      y.isVisible(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.bindResizeListener(), this.defaultWidth = y.getWidth(this.element), this.defaultHeight = y.getHeight(this.element), this.defaultContentWidth = y.getWidth(this.content), this.defaultContentHeight = y.getHeight(this.content), this.initialized = !0);
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var i = this, s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), n = this.isHorizontal(), o = r ? e.every(function(B) {
        return B > -1;
      }) : e > -1;
      if (o) {
        var a = this.first, c = this.element, u = c.scrollTop, l = u === void 0 ? 0 : u, v = c.scrollLeft, m = v === void 0 ? 0 : v, k = this.calculateNumItems(), V = k.numToleratedItems, L = this.getContentPosition(), S = this.itemSize, E = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, p = arguments.length > 1 ? arguments[1] : void 0;
          return x <= p ? 0 : x;
        }, F = function(x, p, I) {
          return x * p + I;
        }, O = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return i.scrollTo({
            left: x,
            top: p,
            behavior: s
          });
        }, g = r ? {
          rows: 0,
          cols: 0
        } : 0, K = !1, M = !1;
        r ? (g = {
          rows: E(e[0], V[0]),
          cols: E(e[1], V[1])
        }, O(F(g.cols, S[1], L.left), F(g.rows, S[0], L.top)), M = this.lastScrollPos.top !== l || this.lastScrollPos.left !== m, K = g.rows !== a.rows || g.cols !== a.cols) : (g = E(e, V), n ? O(F(g, S, L.left), l) : O(m, F(g, S, L.top)), M = this.lastScrollPos !== (n ? m : l), K = g !== a), this.isRangeChanged = K, M && (this.first = g);
      }
    },
    scrollInView: function(e, i) {
      var s = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (i) {
        var n = this.isBoth(), o = this.isHorizontal(), a = n ? e.every(function(S) {
          return S > -1;
        }) : e > -1;
        if (a) {
          var c = this.getRenderedRange(), u = c.first, l = c.viewport, v = function() {
            var E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return s.scrollTo({
              left: E,
              top: F,
              behavior: r
            });
          }, m = i === "to-start", k = i === "to-end";
          if (m) {
            if (n)
              l.first.rows - u.rows > e[0] ? v(l.first.cols * this.itemSize[1], (l.first.rows - 1) * this.itemSize[0]) : l.first.cols - u.cols > e[1] && v((l.first.cols - 1) * this.itemSize[1], l.first.rows * this.itemSize[0]);
            else if (l.first - u > e) {
              var V = (l.first - 1) * this.itemSize;
              o ? v(V, 0) : v(0, V);
            }
          } else if (k) {
            if (n)
              l.last.rows - u.rows <= e[0] + 1 ? v(l.first.cols * this.itemSize[1], (l.first.rows + 1) * this.itemSize[0]) : l.last.cols - u.cols <= e[1] + 1 && v((l.first.cols + 1) * this.itemSize[1], l.first.rows * this.itemSize[0]);
            else if (l.last - u <= e + 1) {
              var L = (l.first + 1) * this.itemSize;
              o ? v(L, 0) : v(0, L);
            }
          }
        }
      } else
        this.scrollToIndex(e, r);
    },
    getRenderedRange: function() {
      var e = function(v, m) {
        return Math.floor(v / (m || v));
      }, i = this.first, s = 0;
      if (this.element) {
        var r = this.isBoth(), n = this.isHorizontal(), o = this.element, a = o.scrollTop, c = o.scrollLeft;
        if (r)
          i = {
            rows: e(a, this.itemSize[0]),
            cols: e(c, this.itemSize[1])
          }, s = {
            rows: i.rows + this.numItemsInViewport.rows,
            cols: i.cols + this.numItemsInViewport.cols
          };
        else {
          var u = n ? c : a;
          i = e(u, this.itemSize), s = i + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: i,
          last: s
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), i = this.isHorizontal(), s = this.itemSize, r = this.getContentPosition(), n = this.element ? this.element.offsetWidth - r.left : 0, o = this.element ? this.element.offsetHeight - r.top : 0, a = function(m, k) {
        return Math.ceil(m / (k || m));
      }, c = function(m) {
        return Math.ceil(m / 2);
      }, u = e ? {
        rows: a(o, s[0]),
        cols: a(n, s[1])
      } : a(i ? n : o, s), l = this.d_numToleratedItems || (e ? [c(u.rows), c(u.cols)] : c(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: l
      };
    },
    calculateOptions: function() {
      var e = this, i = this.isBoth(), s = this.first, r = this.calculateNumItems(), n = r.numItemsInViewport, o = r.numToleratedItems, a = function(l, v, m) {
        var k = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(l + v + (l < m ? 2 : 3) * m, k);
      }, c = i ? {
        rows: a(s.rows, n.rows, o[0]),
        cols: a(s.cols, n.cols, o[1], !0)
      } : a(s, n, o);
      this.last = c, this.numItemsInViewport = n, this.d_numToleratedItems = o, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = i ? Array.from({
        length: n.rows
      }).map(function() {
        return Array.from({
          length: n.cols
        });
      }) : Array.from({
        length: n
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? i ? {
            rows: 0,
            cols: s.cols
          } : 0 : s,
          last: Math.min(e.step ? e.step : c, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var i = e.isBoth(), s = e.isHorizontal(), r = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var n = [y.getWidth(e.element), y.getHeight(e.element)], o = n[0], a = n[1];
          (i || s) && (e.element.style.width = o < e.defaultWidth ? o + "px" : e.scrollWidth || e.defaultWidth + "px"), (i || r) && (e.element.style.height = a < e.defaultHeight ? a + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, i, s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((i = this.items) === null || i === void 0 ? void 0 : i.length) || 0, s) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), i = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), s = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), r = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), n = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: i,
          right: s,
          top: r,
          bottom: n,
          x: i + s,
          y: r + n
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var e = this;
      if (this.element) {
        var i = this.isBoth(), s = this.isHorizontal(), r = this.element.parentElement, n = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), o = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), a = function(u, l) {
          return e.element.style[u] = l;
        };
        i || s ? (a("height", o), a("width", n)) : a("height", o);
      }
    },
    setSpacerSize: function() {
      var e = this, i = this.items;
      if (i) {
        var s = this.isBoth(), r = this.isHorizontal(), n = this.getContentPosition(), o = function(c, u, l) {
          var v = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Z(Z({}, e.spacerStyle), we({}, "".concat(c), (u || []).length * l + v + "px"));
        };
        s ? (o("height", i, this.itemSize[0], n.y), o("width", this.columns || i[1], this.itemSize[1], n.x)) : r ? o("width", this.columns || i, this.itemSize, n.x) : o("height", i, this.itemSize, n.y);
      }
    },
    setContentPosition: function(e) {
      var i = this;
      if (this.content && !this.appendOnly) {
        var s = this.isBoth(), r = this.isHorizontal(), n = e ? e.first : this.first, o = function(l, v) {
          return l * v;
        }, a = function() {
          var l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, v = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return i.contentStyle = Z(Z({}, i.contentStyle), {
            transform: "translate3d(".concat(l, "px, ").concat(v, "px, 0)")
          });
        };
        if (s)
          a(o(n.cols, this.itemSize[1]), o(n.rows, this.itemSize[0]));
        else {
          var c = o(n, this.itemSize);
          r ? a(c, 0) : a(0, c);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var i = this, s = e.target, r = this.isBoth(), n = this.isHorizontal(), o = this.getContentPosition(), a = function(h, w) {
        return h ? h > w ? h - w : h : 0;
      }, c = function(h, w) {
        return Math.floor(h / (w || h));
      }, u = function(h, w, D, _, j, $) {
        return h <= j ? j : $ ? D - _ - j : w + j - 1;
      }, l = function(h, w, D, _, j, $, ee) {
        return h <= $ ? 0 : Math.max(0, ee ? h < w ? D : h - $ : h > w ? D : h - 2 * $);
      }, v = function(h, w, D, _, j, $) {
        var ee = w + _ + 2 * j;
        return h >= j && (ee += j + 1), i.getLast(ee, $);
      }, m = a(s.scrollTop, o.top), k = a(s.scrollLeft, o.left), V = r ? {
        rows: 0,
        cols: 0
      } : 0, L = this.last, S = !1, E = this.lastScrollPos;
      if (r) {
        var F = this.lastScrollPos.top <= m, O = this.lastScrollPos.left <= k;
        if (!this.appendOnly || this.appendOnly && (F || O)) {
          var g = {
            rows: c(m, this.itemSize[0]),
            cols: c(k, this.itemSize[1])
          }, K = {
            rows: u(g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], F),
            cols: u(g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], O)
          };
          V = {
            rows: l(g.rows, K.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], F),
            cols: l(g.cols, K.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], O)
          }, L = {
            rows: v(g.rows, V.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: v(g.cols, V.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, S = V.rows !== this.first.rows || L.rows !== this.last.rows || V.cols !== this.first.cols || L.cols !== this.last.cols || this.isRangeChanged, E = {
            top: m,
            left: k
          };
        }
      } else {
        var M = n ? k : m, B = this.lastScrollPos <= M;
        if (!this.appendOnly || this.appendOnly && B) {
          var x = c(M, this.itemSize), p = u(x, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, B);
          V = l(x, p, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, B), L = v(x, V, this.last, this.numItemsInViewport, this.d_numToleratedItems), S = V !== this.first || L !== this.last || this.isRangeChanged, E = M;
        }
      }
      return {
        first: V,
        last: L,
        isRangeChanged: S,
        scrollPos: E
      };
    },
    onScrollChange: function(e) {
      var i = this.onScrollPositionChange(e), s = i.first, r = i.last, n = i.isRangeChanged, o = i.scrollPos;
      if (n) {
        var a = {
          first: s,
          last: r
        };
        if (this.setContentPosition(a), this.first = s, this.last = r, this.lastScrollPos = o, this.$emit("scroll-index-change", a), this.lazy && this.isPageChanged(s)) {
          var c, u, l = {
            first: this.step ? Math.min(this.getPageByFirst(s) * this.step, (((c = this.items) === null || c === void 0 ? void 0 : c.length) || 0) - this.step) : s,
            last: Math.min(this.step ? (this.getPageByFirst(s) + 1) * this.step : r, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
          }, v = this.lazyLoadState.first !== l.first || this.lazyLoadState.last !== l.last;
          v && this.$emit("lazy-load", l), this.lazyLoadState = l;
        }
      }
    },
    onScroll: function(e) {
      var i = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var s = this.onScrollPositionChange(e), r = s.isRangeChanged, n = r || (this.step ? this.isPageChanged() : !1);
            n && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            i.onScrollChange(e), i.d_loading && i.showLoader && (!i.lazy || i.loading === void 0) && (i.d_loading = !1, i.page = i.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (y.isVisible(e.element)) {
          var i = e.isBoth(), s = e.isVertical(), r = e.isHorizontal(), n = [y.getWidth(e.element), y.getHeight(e.element)], o = n[0], a = n[1], c = o !== e.defaultWidth, u = a !== e.defaultHeight, l = i ? c || u : r ? c : s ? u : !1;
          l && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = o, e.defaultHeight = a, e.defaultContentWidth = y.getWidth(e.content), e.defaultContentHeight = y.getHeight(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null);
    },
    getOptions: function(e) {
      var i = (this.items || []).length, s = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: s,
        count: i,
        first: s === 0,
        last: s === i - 1,
        even: s % 2 === 0,
        odd: s % 2 !== 0
      };
    },
    getLoaderOptions: function(e, i) {
      var s = this.loaderArr.length;
      return Z({
        index: e,
        count: s,
        first: e === 0,
        last: e === s - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, i);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || y.findSingle(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-component-overlay": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(i) {
        return e.columns ? i : i.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), i = this.isHorizontal();
        if (e || i)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: ye
  }
}, ft = ["tabindex"];
function mt(t, e, i, s, r, n) {
  var o = W("SpinnerIcon");
  return t.disabled ? (f(), b(G, {
    key: 1
  }, [C(t.$slots, "default"), C(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: n.loadedColumns
  })], 64)) : (f(), b("div", d({
    key: 0,
    ref: n.elementRef,
    class: n.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return n.onScroll && n.onScroll.apply(n, arguments);
    })
  }, t.ptmi("root")), [C(t.$slots, "content", {
    styleClass: n.contentClass,
    items: n.loadedItems,
    getItemOptions: n.getOptions,
    loading: r.d_loading,
    getLoaderOptions: n.getLoaderOptions,
    itemSize: t.itemSize,
    rows: n.loadedRows,
    columns: n.loadedColumns,
    contentRef: n.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: n.isVertical(),
    horizontal: n.isHorizontal(),
    both: n.isBoth()
  }, function() {
    return [z("div", d({
      ref: n.contentRef,
      class: n.contentClass,
      style: r.contentStyle
    }, t.ptm("content")), [(f(!0), b(G, null, ne(n.loadedItems, function(a, c) {
      return C(t.$slots, "item", {
        key: c,
        item: a,
        options: n.getOptions(c)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (f(), b("div", d({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, t.ptm("spacer")), null, 16)) : P("", !0), !t.loaderDisabled && t.showLoader && r.d_loading ? (f(), b("div", d({
    key: 1,
    class: n.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (f(!0), b(G, {
    key: 0
  }, ne(r.loaderArr, function(a, c) {
    return C(t.$slots, "loader", {
      key: c,
      options: n.getLoaderOptions(c, n.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : P("", !0), C(t.$slots, "loadingicon", {}, function() {
    return [q(o, d({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : P("", !0)], 16, ft));
}
Ce.render = mt;
var vt = {
  root: function(e) {
    var i = e.instance, s = e.props, r = e.state;
    return ["p-dropdown p-component p-inputwrapper", {
      "p-disabled": s.disabled,
      "p-invalid": s.invalid,
      "p-variant-filled": s.variant ? s.variant === "filled" : i.$primevue.config.inputStyle === "filled",
      "p-dropdown-clearable": s.showClear,
      "p-focus": r.focused,
      "p-inputwrapper-filled": i.hasSelectedOption,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-overlay-open": r.overlayVisible
    }];
  },
  input: function(e) {
    var i, s = e.instance, r = e.props;
    return ["p-dropdown-label p-inputtext", {
      "p-placeholder": !r.editable && s.label === r.placeholder,
      "p-dropdown-label-empty": !r.editable && !s.$slots.value && (s.label === "p-emptylabel" || ((i = s.label) === null || i === void 0 ? void 0 : i.length) === 0)
    }];
  },
  clearIcon: "p-dropdown-clear-icon",
  trigger: "p-dropdown-trigger",
  loadingicon: "p-dropdown-trigger-icon",
  dropdownIcon: "p-dropdown-trigger-icon",
  panel: function(e) {
    e.props;
    var i = e.instance;
    return ["p-dropdown-panel p-component", {
      "p-ripple-disabled": i.$primevue.config.ripple === !1
    }];
  },
  header: "p-dropdown-header",
  filterContainer: "p-dropdown-filter-container",
  filterInput: function(e) {
    var i = e.props, s = e.instance;
    return ["p-dropdown-filter p-inputtext p-component", {
      "p-variant-filled": i.variant ? i.variant === "filled" : s.$primevue.config.inputStyle === "filled"
    }];
  },
  filterIcon: "p-dropdown-filter-icon",
  wrapper: "p-dropdown-items-wrapper",
  list: "p-dropdown-items",
  itemGroup: "p-dropdown-item-group",
  itemGroupLabel: "p-dropdown-item-group-label",
  item: function(e) {
    var i = e.instance, s = e.props, r = e.state, n = e.option, o = e.focusedOption;
    return ["p-dropdown-item", {
      "p-highlight": i.isSelected(n) && s.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === o,
      "p-disabled": i.isOptionDisabled(n)
    }];
  },
  itemLabel: "p-dropdown-item-label",
  checkIcon: "p-dropdown-check-icon",
  blankIcon: "p-dropdown-blank-icon",
  emptyMessage: "p-dropdown-empty-message"
}, gt = se.extend({
  name: "dropdown",
  classes: vt
}), yt = {
  name: "BaseDropdown",
  extends: re,
  props: {
    modelValue: null,
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "200px"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    invalid: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    inputProps: {
      type: null,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    panelProps: {
      type: null,
      default: null
    },
    filterInputProps: {
      type: null,
      default: null
    },
    clearIconProps: {
      type: null,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: gt,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
};
function Q(t) {
  "@babel/helpers - typeof";
  return Q = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Q(t);
}
function bt(t) {
  return wt(t) || St(t) || It(t) || Ot();
}
function Ot() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function It(t, e) {
  if (t) {
    if (typeof t == "string") return ae(t, e);
    var i = Object.prototype.toString.call(t).slice(8, -1);
    if (i === "Object" && t.constructor && (i = t.constructor.name), i === "Map" || i === "Set") return Array.from(t);
    if (i === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)) return ae(t, e);
  }
}
function St(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function wt(t) {
  if (Array.isArray(t)) return ae(t);
}
function ae(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var i = 0, s = new Array(e); i < e; i++) s[i] = t[i];
  return s;
}
function me(t, e) {
  var i = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t);
    e && (s = s.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), i.push.apply(i, s);
  }
  return i;
}
function ve(t) {
  for (var e = 1; e < arguments.length; e++) {
    var i = arguments[e] != null ? arguments[e] : {};
    e % 2 ? me(Object(i), !0).forEach(function(s) {
      Le(t, s, i[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(i)) : me(Object(i)).forEach(function(s) {
      Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(i, s));
    });
  }
  return t;
}
function Le(t, e, i) {
  return e = Ct(e), e in t ? Object.defineProperty(t, e, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = i, t;
}
function Ct(t) {
  var e = Lt(t, "string");
  return Q(e) == "symbol" ? e : String(e);
}
function Lt(t, e) {
  if (Q(t) != "object" || !t) return t;
  var i = t[Symbol.toPrimitive];
  if (i !== void 0) {
    var s = i.call(t, e);
    if (Q(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ke = {
  name: "Dropdown",
  extends: yt,
  inheritAttrs: !1,
  emits: ["update:modelValue", "change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      id: this.$attrs.id,
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1
    };
  },
  watch: {
    "$attrs.id": function(e) {
      this.id = e || de();
    },
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.id = this.id || de(), this.autoUpdateModel(), this.bindLabelClickListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (oe.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, i) {
      return this.virtualScrollerDisabled ? e : i && i(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? T.resolveFieldData(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? T.resolveFieldData(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, i) {
      return (this.dataKey ? T.resolveFieldData(e, this.dataKey) : this.getOptionLabel(e)) + "_" + i;
    },
    getPTItemOptions: function(e, i, s, r) {
      return this.ptm(r, {
        context: {
          option: e,
          index: s,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(s, i),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? T.resolveFieldData(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return T.resolveFieldData(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return T.resolveFieldData(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var i = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(s) {
        return i.isOptionGroup(s);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && y.focus(this.$refs.focusInput);
    },
    hide: function(e) {
      var i = this, s = function() {
        i.$emit("before-hide"), i.overlayVisible = !1, i.clicked = !1, i.focusedOptionIndex = -1, i.searchValue = "", i.resetFilterOnHide && (i.filterValue = null), e && y.focus(i.$refs.focusInput);
      };
      setTimeout(function() {
        s();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      this.focused = !1, this.focusedOptionIndex = -1, this.searchValue = "", this.$emit("blur", e);
    },
    onKeyDown: function(e) {
      if (this.disabled || y.isAndroid()) {
        e.preventDefault();
        return;
      }
      var i = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !i && T.isPrintableCharacter(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var i = e.target.value;
      this.searchValue = "";
      var s = this.searchOptions(e, i);
      !s && (this.focusedOptionIndex = -1), this.updateModel(e, i), !this.overlayVisible && T.isNotEmpty(i) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var i = e.relatedTarget === this.$refs.focusInput ? y.getFirstFocusableElement(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      y.focus(i);
    },
    onLastHiddenFocus: function(e) {
      var i = e.relatedTarget === this.$refs.focusInput ? y.getLastFocusableElement(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      y.focus(i);
    },
    onOptionSelect: function(e, i) {
      var s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, r = this.getOptionValue(i);
      this.updateModel(e, r), s && this.hide(!0);
    },
    onOptionMouseMove: function(e, i) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, i);
    },
    onFilterChange: function(e) {
      var i = e.target.value;
      this.filterValue = i, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: i
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, !0);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, !0);
          break;
        case "Home":
          this.onHomeKey(e, !0);
          break;
        case "End":
          this.onEndKey(e, !0);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e, !0);
          break;
      }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      Ye.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var i = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, i);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !i)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var s = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, s), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      i && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (i) {
        var s = e.currentTarget;
        e.shiftKey ? s.setSelectionRange(0, e.target.selectionStart) : (s.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (i) {
        var s = e.currentTarget;
        if (e.shiftKey)
          s.setSelectionRange(e.target.selectionStart, s.value.length);
        else {
          var r = s.value.length;
          s.setSelectionRange(r, r), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide()) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !i && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      i || (this.overlayVisible && this.hasFocusableElements() ? (y.focus(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      i && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      oe.set("overlay", e, this.$primevue.config.zIndex.overlay), y.addStyles(e, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.scrollInView(), this.autoFilterFocus && y.focus(this.$refs.filterInput);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      oe.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? y.relativePosition(this.overlay, this.$el) : (this.overlay.style.minWidth = y.getOuterWidth(this.$el) + "px", y.absolutePosition(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(i) {
        e.overlayVisible && e.overlay && !e.$el.contains(i.target) && !e.overlay.contains(i.target) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Pe(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !y.isTouchDevice() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var i = document.querySelector('label[for="'.concat(this.inputId, '"]'));
        i && y.isVisible(i) && (this.labelClickListener = function() {
          y.focus(e.$refs.focusInput);
        }, i.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.inputId, '"]'));
        e && y.isVisible(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    hasFocusableElements: function() {
      return y.getFocusableElements(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionMatched: function(e) {
      var i;
      return this.isValidOption(e) && ((i = this.getOptionLabel(e)) === null || i === void 0 ? void 0 : i.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return T.isNotEmpty(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return this.isValidOption(e) && T.equals(this.modelValue, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(i) {
        return e.isValidOption(i);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return T.findLastIndex(this.visibleOptions, function(i) {
        return e.isValidOption(i);
      });
    },
    findNextOptionIndex: function(e) {
      var i = this, s = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(r) {
        return i.isValidOption(r);
      }) : -1;
      return s > -1 ? s + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var i = this, s = e > 0 ? T.findLastIndex(this.visibleOptions.slice(0, e), function(r) {
        return i.isValidOption(r);
      }) : -1;
      return s > -1 ? s : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.hasSelectedOption ? this.visibleOptions.findIndex(function(i) {
        return e.isValidSelectedOption(i);
      }) : -1;
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, i) {
      var s = this;
      this.searchValue = (this.searchValue || "") + i;
      var r = -1, n = !1;
      return T.isNotEmpty(this.searchValue) && (this.focusedOptionIndex !== -1 ? (r = this.visibleOptions.slice(this.focusedOptionIndex).findIndex(function(o) {
        return s.isOptionMatched(o);
      }), r = r === -1 ? this.visibleOptions.slice(0, this.focusedOptionIndex).findIndex(function(o) {
        return s.isOptionMatched(o);
      }) : r + this.focusedOptionIndex) : r = this.visibleOptions.findIndex(function(o) {
        return s.isOptionMatched(o);
      }), r !== -1 && (n = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(e, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        s.searchValue = "", s.searchTimeout = null;
      }, 500), n;
    },
    changeFocusedOptionIndex: function(e, i) {
      this.focusedOptionIndex !== i && (this.focusedOptionIndex = i, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[i], !1));
    },
    scrollInView: function() {
      var e = this, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var s = i !== -1 ? "".concat(e.id, "_").concat(i) : e.focusedOptionId, r = y.findSingle(e.list, 'li[id="'.concat(s, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
          block: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(i !== -1 ? i : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.selectOnFocus && this.autoOptionFocus && !this.hasSelectedOption && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex(), this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1));
    },
    updateModel: function(e, i) {
      this.$emit("update:modelValue", i), this.$emit("change", {
        originalEvent: e,
        value: i
      });
    },
    flatOptions: function(e) {
      var i = this;
      return (e || []).reduce(function(s, r, n) {
        s.push({
          optionGroup: r,
          group: !0,
          index: n
        });
        var o = i.getOptionGroupChildren(r);
        return o && o.forEach(function(a) {
          return s.push(a);
        }), s;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, i) {
      this.list = e, i && i(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, i = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var s = Fe.filter(i, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], n = [];
          return r.forEach(function(o) {
            var a = e.getOptionGroupChildren(o), c = a.filter(function(u) {
              return s.includes(u);
            });
            c.length > 0 && n.push(ve(ve({}, o), {}, Le({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", bt(c))));
          }), this.flatOptions(n);
        }
        return s;
      }
      return i;
    },
    hasSelectedOption: function() {
      return T.isNotEmpty(this.modelValue);
    },
    label: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.modelValue || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return T.isNotEmpty(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.hasSelectedOption ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    listAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.listLabel : void 0;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var e = this;
      return this.visibleOptions.filter(function(i) {
        return !e.isOptionGroup(i);
      }).length;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    }
  },
  directives: {
    ripple: ze
  },
  components: {
    VirtualScroller: Ce,
    Portal: qe,
    TimesIcon: We,
    ChevronDownIcon: Ie,
    SpinnerIcon: ye,
    SearchIcon: Se,
    CheckIcon: Je,
    BlankIcon: Oe
  }
};
function X(t) {
  "@babel/helpers - typeof";
  return X = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, X(t);
}
function ge(t, e) {
  var i = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t);
    e && (s = s.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), i.push.apply(i, s);
  }
  return i;
}
function H(t) {
  for (var e = 1; e < arguments.length; e++) {
    var i = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ge(Object(i), !0).forEach(function(s) {
      kt(t, s, i[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(i)) : ge(Object(i)).forEach(function(s) {
      Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(i, s));
    });
  }
  return t;
}
function kt(t, e, i) {
  return e = Vt(e), e in t ? Object.defineProperty(t, e, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = i, t;
}
function Vt(t) {
  var e = zt(t, "string");
  return X(e) == "symbol" ? e : String(e);
}
function zt(t, e) {
  if (X(t) != "object" || !t) return t;
  var i = t[Symbol.toPrimitive];
  if (i !== void 0) {
    var s = i.call(t, e);
    if (X(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ft = ["id"], Pt = ["id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid"], Tt = ["id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-disabled"], Et = ["value", "placeholder", "aria-owns", "aria-activedescendant"], Mt = ["id", "aria-label"], xt = ["id"], Bt = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onClick", "onMousemove", "data-p-highlight", "data-p-focused", "data-p-disabled"];
function Dt(t, e, i, s, r, n) {
  var o = W("SpinnerIcon"), a = W("CheckIcon"), c = W("BlankIcon"), u = W("VirtualScroller"), l = W("Portal"), v = Te("ripple");
  return f(), b("div", d({
    ref: "container",
    id: r.id,
    class: t.cx("root"),
    onClick: e[16] || (e[16] = function() {
      return n.onContainerClick && n.onContainerClick.apply(n, arguments);
    })
  }, t.ptmi("root")), [t.editable ? (f(), b("input", d({
    key: 0,
    ref: "focusInput",
    id: t.inputId,
    type: "text",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    value: n.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.id + "_list",
    "aria-activedescendant": r.focused ? n.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return n.onFocus && n.onFocus.apply(n, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return n.onBlur && n.onBlur.apply(n, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return n.onKeyDown && n.onKeyDown.apply(n, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return n.onEditableInput && n.onEditableInput.apply(n, arguments);
    })
  }, H(H({}, t.inputProps), t.ptm("input"))), null, 16, Pt)) : (f(), b("span", d({
    key: 1,
    ref: "focusInput",
    id: t.inputId,
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (n.label === "p-emptylabel" ? void 0 : n.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.id + "_list",
    "aria-activedescendant": r.focused ? n.focusedOptionId : void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return n.onFocus && n.onFocus.apply(n, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return n.onBlur && n.onBlur.apply(n, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return n.onKeyDown && n.onKeyDown.apply(n, arguments);
    })
  }, H(H({}, t.inputProps), t.ptm("input"))), [C(t.$slots, "value", {
    value: t.modelValue,
    placeholder: t.placeholder
  }, function() {
    return [J(A(n.label === "p-emptylabel" ? " " : n.label || "empty"), 1)];
  })], 16, Tt)), t.showClear && t.modelValue != null ? C(t.$slots, "clearicon", {
    key: 2,
    class: te(t.cx("clearIcon")),
    onClick: n.onClearClick,
    clearCallback: n.onClearClick
  }, function() {
    return [(f(), R(le(t.clearIcon ? "i" : "TimesIcon"), d({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: n.onClearClick
    }, H(H({}, t.clearIconProps), t.ptm("clearIcon")), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : P("", !0), z("div", d({
    class: t.cx("trigger")
  }, t.ptm("trigger")), [t.loading ? C(t.$slots, "loadingicon", {
    key: 0,
    class: te(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (f(), b("span", d({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (f(), R(o, d({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : C(t.$slots, "dropdownicon", {
    key: 1,
    class: te(t.cx("dropdownIcon"))
  }, function() {
    return [(f(), R(le(t.dropdownIcon ? "span" : "ChevronDownIcon"), d({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true"
    }, t.ptm("dropdownIcon")), null, 16, ["class"]))];
  })], 16), q(l, {
    appendTo: t.appendTo
  }, {
    default: N(function() {
      return [q(Ee, d({
        name: "p-connected-overlay",
        onEnter: n.onOverlayEnter,
        onAfterEnter: n.onOverlayAfterEnter,
        onLeave: n.onOverlayLeave,
        onAfterLeave: n.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: N(function() {
          return [r.overlayVisible ? (f(), b("div", d({
            key: 0,
            ref: n.overlayRef,
            class: [t.cx("panel"), t.panelClass],
            style: t.panelStyle,
            onClick: e[14] || (e[14] = function() {
              return n.onOverlayClick && n.onOverlayClick.apply(n, arguments);
            }),
            onKeydown: e[15] || (e[15] = function() {
              return n.onOverlayKeyDown && n.onOverlayKeyDown.apply(n, arguments);
            })
          }, H(H({}, t.panelProps), t.ptm("panel"))), [z("span", d({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return n.onFirstHiddenFocus && n.onFirstHiddenFocus.apply(n, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), C(t.$slots, "header", {
            value: t.modelValue,
            options: n.visibleOptions
          }), t.filter ? (f(), b("div", d({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [z("div", d({
            class: t.cx("filterContainer")
          }, t.ptm("filterContainer")), [z("input", d({
            ref: "filterInput",
            type: "text",
            value: r.filterValue,
            onVnodeMounted: e[8] || (e[8] = function() {
              return n.onFilterUpdated && n.onFilterUpdated.apply(n, arguments);
            }),
            onVnodeUpdated: e[9] || (e[9] = function() {
              return n.onFilterUpdated && n.onFilterUpdated.apply(n, arguments);
            }),
            class: t.cx("filterInput"),
            placeholder: t.filterPlaceholder,
            role: "searchbox",
            autocomplete: "off",
            "aria-owns": r.id + "_list",
            "aria-activedescendant": n.focusedOptionId,
            onKeydown: e[10] || (e[10] = function() {
              return n.onFilterKeyDown && n.onFilterKeyDown.apply(n, arguments);
            }),
            onBlur: e[11] || (e[11] = function() {
              return n.onFilterBlur && n.onFilterBlur.apply(n, arguments);
            }),
            onInput: e[12] || (e[12] = function() {
              return n.onFilterChange && n.onFilterChange.apply(n, arguments);
            })
          }, H(H({}, t.filterInputProps), t.ptm("filterInput"))), null, 16, Et), C(t.$slots, "filtericon", {
            class: te(t.cx("filterIcon"))
          }, function() {
            return [(f(), R(le(t.filterIcon ? "span" : "SearchIcon"), d({
              class: [t.cx("filterIcon"), t.filterIcon]
            }, t.ptm("filterIcon")), null, 16, ["class"]))];
          })], 16), z("span", d({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), A(n.filterResultMessageText), 17)], 16)) : P("", !0), z("div", d({
            class: t.cx("wrapper"),
            style: {
              "max-height": n.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("wrapper")), [q(u, d({
            ref: n.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: n.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: n.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Me({
            content: N(function(m) {
              var k = m.styleClass, V = m.contentRef, L = m.items, S = m.getItemOptions, E = m.contentStyle, F = m.itemSize;
              return [z("ul", d({
                ref: function(g) {
                  return n.listRef(g, V);
                },
                id: r.id + "_list",
                class: [t.cx("list"), k],
                style: E,
                role: "listbox",
                "aria-label": n.listAriaLabel
              }, t.ptm("list")), [(f(!0), b(G, null, ne(L, function(O, g) {
                return f(), b(G, {
                  key: n.getOptionRenderKey(O, n.getOptionIndex(g, S))
                }, [n.isOptionGroup(O) ? (f(), b("li", d({
                  key: 0,
                  id: r.id + "_" + n.getOptionIndex(g, S),
                  style: {
                    height: F ? F + "px" : void 0
                  },
                  class: t.cx("itemGroup"),
                  role: "option"
                }, t.ptm("itemGroup")), [C(t.$slots, "optiongroup", {
                  option: O.optionGroup,
                  index: n.getOptionIndex(g, S)
                }, function() {
                  return [z("span", d({
                    class: t.cx("itemGroupLabel")
                  }, t.ptm("itemGroupLabel")), A(n.getOptionGroupLabel(O.optionGroup)), 17)];
                })], 16, xt)) : xe((f(), b("li", d({
                  key: 1,
                  id: r.id + "_" + n.getOptionIndex(g, S),
                  class: t.cx("item", {
                    option: O,
                    focusedOption: n.getOptionIndex(g, S)
                  }),
                  style: {
                    height: F ? F + "px" : void 0
                  },
                  role: "option",
                  "aria-label": n.getOptionLabel(O),
                  "aria-selected": n.isSelected(O),
                  "aria-disabled": n.isOptionDisabled(O),
                  "aria-setsize": n.ariaSetSize,
                  "aria-posinset": n.getAriaPosInset(n.getOptionIndex(g, S)),
                  onClick: function(M) {
                    return n.onOptionSelect(M, O);
                  },
                  onMousemove: function(M) {
                    return n.onOptionMouseMove(M, n.getOptionIndex(g, S));
                  },
                  "data-p-highlight": n.isSelected(O),
                  "data-p-focused": r.focusedOptionIndex === n.getOptionIndex(g, S),
                  "data-p-disabled": n.isOptionDisabled(O)
                }, n.getPTItemOptions(O, S, g, "item")), [t.checkmark ? (f(), b(G, {
                  key: 0
                }, [n.isSelected(O) ? (f(), R(a, d({
                  key: 0,
                  class: t.cx("checkIcon")
                }, t.ptm("checkIcon")), null, 16, ["class"])) : (f(), R(c, d({
                  key: 1,
                  class: t.cx("blankIcon")
                }, t.ptm("blankIcon")), null, 16, ["class"]))], 64)) : P("", !0), C(t.$slots, "option", {
                  option: O,
                  index: n.getOptionIndex(g, S)
                }, function() {
                  return [z("span", d({
                    class: t.cx("itemLabel")
                  }, t.ptm("itemLabel")), A(n.getOptionLabel(O)), 17)];
                })], 16, Bt)), [[v]])], 64);
              }), 128)), r.filterValue && (!L || L && L.length === 0) ? (f(), b("li", d({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [C(t.$slots, "emptyfilter", {}, function() {
                return [J(A(n.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (f(), b("li", d({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [C(t.$slots, "empty", {}, function() {
                return [J(A(n.emptyMessageText), 1)];
              })], 16)) : P("", !0)], 16, Mt)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: N(function(m) {
              var k = m.options;
              return [C(t.$slots, "loader", {
                options: k
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), C(t.$slots, "footer", {
            value: t.modelValue,
            options: n.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (f(), b("span", d({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), A(n.emptyMessageText), 17)) : P("", !0), z("span", d({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), A(n.selectedMessageText), 17), z("span", d({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[13] || (e[13] = function() {
              return n.onLastHiddenFocus && n.onLastHiddenFocus.apply(n, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16)) : P("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Ft);
}
ke.render = Dt;
var At = {
  root: function(e) {
    var i = e.instance, s = e.props;
    return ["p-inputtextarea p-inputtext p-component", {
      "p-filled": i.filled,
      "p-inputtextarea-resizable ": s.autoResize,
      "p-invalid": s.invalid,
      "p-variant-filled": s.variant ? s.variant === "filled" : i.$primevue.config.inputStyle === "filled"
    }];
  }
}, Kt = se.extend({
  name: "textarea",
  classes: At
}), Ht = {
  name: "BaseTextarea",
  extends: re,
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
  style: Kt,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ve = {
  name: "Textarea",
  extends: Ht,
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
    onInput: function(e) {
      this.autoResize && this.resize(), this.$emit("update:modelValue", e.target.value);
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
}, Rt = ["value", "aria-invalid"];
function jt(t, e, i, s, r, n) {
  return f(), b("textarea", d({
    class: t.cx("root"),
    value: t.modelValue,
    "aria-invalid": t.invalid || void 0,
    onInput: e[0] || (e[0] = function() {
      return n.onInput && n.onInput.apply(n, arguments);
    })
  }, t.ptmi("root", n.ptmParams)), null, 16, Rt);
}
Ve.render = jt;
const Nt = { class: "roles-list" }, $t = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, Ut = { class: "role-name" }, Gt = 600, Wt = 3e3, qt = 1500, Zt = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "_speakers.txt" },
    onClose: { type: Function, required: !0 }
  },
  setup(t) {
    const e = t, i = De(e.root, "_roles.json"), s = ie(!0), r = ie([]), n = ie([]), o = ie("");
    let a = null, c = 0, u = null, l = null;
    const v = /* @__PURE__ */ new Map();
    function m(p) {
      o.value = p;
    }
    const k = /* @__PURE__ */ new Map();
    function V(p, I) {
      if (!I) {
        k.delete(p);
        return;
      }
      k.set(p, I.$el ?? I);
    }
    function L(p) {
      p && (p.style.height = "auto", p.style.height = `${p.scrollHeight}px`);
    }
    function S() {
      k.forEach(L);
    }
    function E() {
      return JSON.stringify({ roles: r.value }, null, 2);
    }
    async function F() {
      const p = E();
      if (p !== a)
        try {
          const h = await (await fetch(`${ce}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: i, content: p })
          })).json();
          if (h.error) {
            m(`Save error: ${h.error}`);
            return;
          }
          a = p, m(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (I) {
          m(`Save failed: ${I}`);
        }
    }
    function O() {
      c = Date.now(), u && clearTimeout(u), u = setTimeout(F, Gt);
    }
    function g(p) {
      !p.code || v.get(p.code) === p.speaker || (v.set(p.code, p.speaker), Ne(e.root, p.code, e.suffix).then((h) => m(h.message)));
    }
    function K(p) {
      O(), g(p);
    }
    async function M() {
      try {
        const I = await (await fetch(Re)).json();
        n.value = I.presets || [];
      } catch {
        n.value = [];
      }
    }
    async function B({ isPoll: p = !1 } = {}) {
      try {
        const h = await (await fetch(`${ce}/read?path=${encodeURIComponent(i)}`)).json();
        if (h.error) {
          m(`Read error: ${h.error}`);
          return;
        }
        if (!h.exists) {
          p || (r.value = [], a = "", m("_roles.json does not exist yet"));
          return;
        }
        if (p && Date.now() - c < qt || h.content === a) return;
        let w;
        try {
          w = JSON.parse(h.content);
        } catch (D) {
          m(`_roles.json is not valid JSON: ${D}`);
          return;
        }
        r.value = Array.isArray(w.roles) ? w.roles : [], r.value.forEach((D) => {
          D.code && v.set(D.code, D.speaker);
        }), a = h.content, p || m(`Loaded ${r.value.length} role(s)`), je(() => {
          S(), requestAnimationFrame(S);
        });
      } catch (I) {
        m(`Read failed: ${I}`);
      }
    }
    function x() {
      u && (clearTimeout(u), F()), r.value.forEach((p) => g(p)), l && clearInterval(l), e.onClose();
    }
    return Ae(s, (p) => {
      p || x();
    }), Ke(async () => {
      M(), await B(), l = setInterval(() => B({ isPoll: !0 }), Wt);
    }), He(() => {
      l && clearInterval(l);
    }), (p, I) => (f(), R(U(Ze), {
      visible: s.value,
      "onUpdate:visible": I[1] || (I[1] = (h) => s.value = h),
      modal: "",
      "dismissable-mask": "",
      header: "Roles",
      style: { width: "80vw", maxWidth: "820px" }
    }, {
      default: N(() => [
        o.value ? (f(), R(U(he), {
          key: 0,
          severity: "secondary",
          closable: !1,
          class: "roles-status"
        }, {
          default: N(() => [
            J(A(o.value), 1)
          ]),
          _: 1
        })) : P("", !0),
        r.value.length ? P("", !0) : (f(), R(U(he), {
          key: 1,
          severity: "info",
          closable: !1
        }, {
          default: N(() => [...I[2] || (I[2] = [
            J("No roles found", -1)
          ])]),
          _: 1
        })),
        z("div", Nt, [
          (f(!0), b(G, null, ne(r.value, (h) => (f(), R(U(be), {
            key: h.code,
            class: "role-card"
          }, {
            title: N(() => [
              z("span", $t, A(h.code), 1),
              z("span", Ut, A(h.name), 1)
            ]),
            content: N(() => [
              q(U(ke), {
                modelValue: h.speaker,
                "onUpdate:modelValue": (w) => h.speaker = w,
                options: n.value,
                editable: "",
                filter: "",
                placeholder: "Speaker preset",
                title: "Real CosyVoice preset this role resolves to",
                class: "role-speaker",
                onInput: I[0] || (I[0] = (w) => O()),
                onChange: (w) => K(h),
                onBlur: (w) => g(h)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"]),
              q(U(Ve), {
                modelValue: h.description,
                "onUpdate:modelValue": (w) => h.description = w,
                ref_for: !0,
                ref: (w) => V(h.code, w),
                rows: "1",
                placeholder: "Description...",
                class: "role-description",
                onInput: (w) => {
                  O(), L(U(k).get(h.code));
                }
              }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"])
            ]),
            _: 2
          }, 1024))), 128))
        ])
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}, Jt = /* @__PURE__ */ Be(Zt, [["__scopeId", "data-v-2048209e"]]);
function ei({ root: t, suffix: e = "_speakers.txt" }) {
  $e(import.meta.url);
  const i = document.createElement("div");
  document.body.appendChild(i);
  const s = Ue(Jt, {
    root: t,
    suffix: e,
    onClose: () => {
      s.unmount(), i.remove();
    }
  });
  s.use(Ge, { ripple: !0 }), s.mount(i);
}
export {
  ei as openRolesEditor
};
