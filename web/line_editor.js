import { z as Pn, A as Rn, B as ut, s as dt, o as y, c as S, C as ie, m as ce, D as _t, b as Be, E as it, d as C, g as f, p as Q, f as p, F as Z, G as xt, k as M, t as T, h as E, _ as Rt, r as k, w as Oe, a as Ln, H as Dn, n as we, u as c, l as Et, S as se, I as Fn, e as At, J as ae, K as Me, v as Y, L as Ue, q as w, M as Nn, N as ze, i as Tt, O as On, Q as Mn, x as Un, y as zn, P as Bn } from "./styles_link.js";
import { s as Lt, u as Vn } from "./PanelWidthButtons.js";
import { s as jt, a as lt, D as Hn } from "./DialogHeader.js";
var ue = Pn(), Dt = Symbol();
function qn() {
  var a = Rn(Dt);
  if (!a)
    throw new Error("No PrimeVue Confirmation provided!");
  return a;
}
var Jn = {
  install: function(i) {
    var m = {
      require: function(g) {
        ue.emit("confirm", g);
      },
      close: function() {
        ue.emit("close");
      }
    };
    i.config.globalProperties.$confirm = m, i.provide(Dt, m);
  }
}, Gn = {
  root: "p-inputgroup"
}, Kn = ut.extend({
  name: "inputgroup",
  classes: Gn
}), Wn = {
  name: "BaseInputGroup",
  extends: dt,
  style: Kn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ve = {
  name: "InputGroup",
  extends: Wn,
  inheritAttrs: !1
};
function Xn(a, i, m, x, g, r) {
  return y(), S("div", ce({
    class: a.cx("root")
  }, a.ptmi("root")), [ie(a.$slots, "default")], 16);
}
Ve.render = Xn;
var Yn = {
  root: "p-inputgroup-addon"
}, Zn = ut.extend({
  name: "inputgroupaddon",
  classes: Yn
}), Qn = {
  name: "BaseInputGroupAddon",
  extends: dt,
  style: Zn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, He = {
  name: "InputGroupAddon",
  extends: Qn,
  inheritAttrs: !1
};
function eo(a, i, m, x, g, r) {
  return y(), S("div", ce({
    class: a.cx("root")
  }, a.ptmi("root")), [ie(a.$slots, "default")], 16);
}
He.render = eo;
var to = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var m = i.instance;
    return ["p-confirm-dialog-reject", m.confirmation && !m.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, no = ut.extend({
  name: "confirmdialog",
  classes: to
}), oo = {
  name: "BaseConfirmDialog",
  extends: dt,
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
  style: no,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ft = {
  name: "ConfirmDialog",
  extends: oo,
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
    this.confirmListener = function(m) {
      m && m.group === i.group && (i.confirmation = m, i.confirmation.onShow && i.confirmation.onShow(), i.visible = !0);
    }, this.closeListener = function() {
      i.visible = !1, i.confirmation = null;
    }, ue.on("confirm", this.confirmListener), ue.on("close", this.closeListener);
  },
  beforeUnmount: function() {
    ue.off("confirm", this.confirmListener), ue.off("close", this.closeListener);
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
    getCXOptions: function(i, m) {
      return {
        contenxt: {
          icon: i,
          iconClass: m.class
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
    CDialog: Lt,
    CDButton: E
  }
};
function so(a, i, m, x, g, r) {
  var I = _t("CDButton"), H = _t("CDialog");
  return y(), Be(H, {
    visible: g.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(L) {
      return g.visible = L;
    }), r.onHide],
    role: "alertdialog",
    class: Q(a.cx("root")),
    modal: !0,
    header: r.header,
    blockScroll: r.blockScroll,
    position: r.position,
    breakpoints: a.breakpoints,
    closeOnEscape: r.closeOnEscape,
    draggable: a.draggable,
    pt: a.pt,
    unstyled: a.unstyled
  }, it({
    default: C(function() {
      return [a.$slots.container ? M("", !0) : (y(), S(Z, {
        key: 0
      }, [a.$slots.message ? (y(), Be(xt(a.$slots.message), {
        key: 1,
        message: g.confirmation
      }, null, 8, ["message"])) : (y(), S(Z, {
        key: 0
      }, [ie(a.$slots, "icon", {}, function() {
        return [a.$slots.icon ? (y(), Be(xt(a.$slots.icon), {
          key: 0,
          class: Q(a.cx("icon"))
        }, null, 8, ["class"])) : g.confirmation.icon ? (y(), S("span", ce({
          key: 1,
          class: [g.confirmation.icon, a.cx("icon")]
        }, a.ptm("icon")), null, 16)) : M("", !0)];
      }), p("span", ce({
        class: a.cx("message")
      }, a.ptm("message")), T(r.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [a.$slots.container ? {
    name: "container",
    fn: C(function(L) {
      return [ie(a.$slots, "container", {
        message: g.confirmation,
        onClose: L.onClose,
        onAccept: r.accept,
        onReject: r.reject,
        closeCallback: L.onclose,
        acceptCallback: r.accept,
        rejectCallback: r.reject
      })];
    }),
    key: "0"
  } : void 0, a.$slots.container ? void 0 : {
    name: "footer",
    fn: C(function() {
      return [f(I, {
        label: r.rejectLabel,
        class: Q([a.cx("rejectButton"), g.confirmation.rejectClass]),
        onClick: i[0] || (i[0] = function(L) {
          return r.reject();
        }),
        autofocus: r.autoFocusReject,
        unstyled: a.unstyled,
        pt: a.ptm("rejectButton")
      }, it({
        _: 2
      }, [r.rejectIcon || a.$slots.rejecticon ? {
        name: "icon",
        fn: C(function(L) {
          return [ie(a.$slots, "rejecticon", {}, function() {
            return [p("span", ce({
              class: [r.rejectIcon, L.class]
            }, a.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), f(I, {
        label: r.acceptLabel,
        class: Q([a.cx("acceptButton"), g.confirmation.acceptClass]),
        onClick: i[1] || (i[1] = function(L) {
          return r.accept();
        }),
        autofocus: r.autoFocusAccept,
        unstyled: a.unstyled,
        pt: a.ptm("acceptButton")
      }, it({
        _: 2
      }, [r.acceptIcon || a.$slots.accepticon ? {
        name: "icon",
        fn: C(function(L) {
          return [ie(a.$slots, "accepticon", {}, function() {
            return [p("span", ce({
              class: [r.acceptIcon, L.class]
            }, a.ptm("acceptButton").icon, {
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
Ft.render = so;
const ao = { class: "sticky-panel" }, io = {
  __name: "StickyPanel",
  setup(a) {
    return (i, m) => (y(), S("div", ao, [
      ie(i.$slots, "default", {}, void 0, !0)
    ]));
  }
}, lo = /* @__PURE__ */ Rt(io, [["__scopeId", "data-v-2941a6c7"]]);
async function Pt(a, i, m) {
  const x = `${(a || "").trim()}|${(i || "").trim()}|${(m || "").trim()}`, g = new TextEncoder().encode(x), r = await crypto.subtle.digest("SHA-256", g);
  return [...new Uint8Array(r)].map((H) => H.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const ro = /^(\d+)_([0-9a-f]+)\.wav$/i;
function Nt(a, i) {
  return `${String(a).padStart(4, "0")}_${i}.wav`;
}
function co(a) {
  const i = ro.exec(a);
  return i ? { position: Number(i[1]), hash: i[2].toLowerCase() } : null;
}
function uo(a, i, m) {
  return a.has(Nt(i, m));
}
function fo(a, i, m) {
  let x = null, g = -1 / 0;
  for (const r of a) {
    const I = co(r);
    if (!I || I.position !== m) continue;
    const H = (i == null ? void 0 : i[r]) ?? 0;
    (x === null || H > g) && (x = r, g = H);
  }
  return x;
}
const po = { class: "font-row" }, vo = { class: "audio-content-row" }, mo = ["title"], ho = ["src"], yo = {
  key: 0,
  class: "timing-warning"
}, go = { class: "actions-row" }, ko = ["checked", "disabled"], bo = ["data-row-index"], wo = { class: "line-number" }, So = { class: "line-body" }, $o = { class: "malformed-warn-line" }, Co = { class: "line-controls-row" }, Io = ["title", "onClick"], _o = { class: "dropdown-option-label" }, xo = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Eo = { class: "dropdown-option-label" }, Ao = {
  key: 0,
  class: "dropdown-option-sublabel"
}, To = { class: "dropdown-option-label" }, jo = { class: "dropdown-option-sublabel" }, Po = {
  key: 0,
  class: "instruct-desc"
}, Ro = { key: 0 }, Lo = { class: "role-info-key" }, Do = { class: "role-info-value" }, Fo = 600, rt = 3e3, No = 1500, Oo = 11.5, Mo = 9, Uo = 22, ct = "FL_CosyVoice3.LineEditor.textFontSizePx", zo = {
  __name: "LineEditorApp",
  props: {
    folder: { type: String, required: !0 },
    filename: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    checkedApi: { type: Object, default: null },
    // {isChecked(fname), setChecked(fname, val)}
    revoiceApi: { type: Object, default: null },
    // {revoiceLine({linePosition, speaker, instruct, text}) => Promise}
    onClose: { type: Function, required: !0 }
  },
  setup(a) {
    const i = a;
    function m(t, e) {
      try {
        const n = parseFloat(localStorage.getItem(t));
        return Number.isFinite(n) ? n : e;
      } catch {
        return e;
      }
    }
    function x(t, e) {
      try {
        localStorage.setItem(t, String(e));
      } catch {
      }
    }
    function g(t) {
      const e = t.split("|");
      return e.length !== 3 ? null : { speaker: e[0].trim(), instruct: e[1].trim(), text: e[2].trim() };
    }
    let r = 1;
    function I(t) {
      return { ...t, __key: r++ };
    }
    function H(t) {
      return t.split(`
`).map((e) => e.replace(/\r$/, "")).filter((e) => e.trim()).map((e) => {
        const n = g(e);
        return I(n ? { ...n, raw: e, malformed: !1 } : { raw: e, malformed: !0 });
      });
    }
    function L(t) {
      return t.map((e) => e.malformed ? e.raw : `${e.speaker} | ${e.instruct} | ${e.text}`).join(`
`);
    }
    function Ot(t) {
      if (!t) return "rgba(255,255,255,0.1)";
      let e = 0;
      for (let n = 0; n < t.length; n++) e = e * 31 + t.charCodeAt(n) >>> 0;
      return `hsl(${e % 360}, 55%, 55%, 0.3)`;
    }
    const Mt = qn();
    function Se({ title: t = "Confirm", message: e = "", okText: n = "OK", cancelText: o = "Cancel" } = {}) {
      return new Promise((s) => {
        Mt.require({
          header: t,
          message: e,
          acceptLabel: n,
          rejectLabel: o,
          accept: () => s(!0),
          reject: () => s(!1),
          onHide: () => s(!1)
        });
      });
    }
    const qe = k(!0), _ = k(i.filename), d = k([]), $e = k([]), F = k([]), le = k(null), Je = k([]), U = k([]), ee = k([]), ft = k(""), { cssWidth: Ut, setWidth: zt, presets: Bt } = Vn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), z = k(m(ct, Oo)), te = k(null), de = k(-1), q = k(!1), J = k(-1), Ce = k(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), A = Ue({ checking: !0, best: null, mtime: null, error: null }), B = Ue({ visible: !1, top: 0, left: 0, code: null }), Ie = k(null), G = Ue(/* @__PURE__ */ new Set());
    let re = null, Ge = 0, ne = null, oe = null, K = null, fe = null, pe = null, ve = null, Ke = !1, We = null, me = null;
    const _e = k(null), Xe = k(null), he = /* @__PURE__ */ new Map(), ye = /* @__PURE__ */ new Map(), pt = w(() => Y(i.folder, _.value)), xe = w(() => Y(i.folder, "_audio")), V = w(() => Nn(_.value, i.suffix)), Ee = w(() => Y(Y(xe.value, "lines"), V.value)), ge = k(/* @__PURE__ */ new Set()), vt = k({});
    async function ke() {
      try {
        const e = await (await fetch(`${At}?path=${encodeURIComponent(Ee.value)}`)).json();
        ge.value = new Set(Array.isArray(e.files) ? e.files : []), vt.value = e.file_mtimes || {};
      } catch {
      }
    }
    const N = w(() => {
      const t = /* @__PURE__ */ new Map();
      let e = 0;
      return d.value.forEach((n, o) => {
        n.malformed || (t.set(o, e), e++);
      }), t;
    });
    function mt(t) {
      const e = N.value.get(t);
      return e === void 0 ? null : fo(ge.value, vt.value, e);
    }
    function ht(t) {
      const e = F.value.find((n) => n.code === t);
      return e && e.speaker ? e.speaker : t || "";
    }
    const Ye = Ue(/* @__PURE__ */ new Map());
    Oe(
      [d, F],
      async () => {
        const t = d.value.filter((n) => !n.malformed), e = await Promise.all(
          t.map((n) => Pt(ht(n.speaker), n.instruct, n.text))
        );
        t.forEach((n, o) => Ye.set(n.__key, e[o]));
      },
      { deep: !0, immediate: !0 }
    );
    function Ae(t) {
      return mt(t) !== null;
    }
    function Te(t, e) {
      const n = N.value.get(e);
      if (n === void 0) return !1;
      const o = Ye.get(t.__key);
      return o !== void 0 && uo(ge.value, n, o);
    }
    const b = w(() => U.value.includes(_.value)), Ze = w(() => {
      const t = [];
      return d.value.forEach((e, n) => {
        e.malformed || t.push(n);
      }), t.length > 0 && t.every((e) => Te(d.value[e], e));
    });
    function u(t) {
      ft.value = t;
    }
    function Vt(t) {
      if (!t) return "";
      const e = F.value.find((s) => s.code === t), n = e && e.speaker ? e.speaker : t, o = String(n).split("#", 1)[0].trim();
      return o ? `${o}.pt` : "";
    }
    function Ht() {
      const t = {};
      return F.value.forEach((e) => {
        const n = String(e.speaker || "").split("#", 1)[0].trim();
        !n || !e.code || (t[n] = t[n] || []).push(e.code);
      }), t;
    }
    async function qt() {
      if (!le.value)
        return u("No _roles.json found for this project -- can't save"), !1;
      try {
        const e = await (await fetch(`${Me}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: le.value, content: JSON.stringify({ roles: F.value }, null, 2) })
        })).json();
        return e.error ? (u(`Error saving _roles.json: ${e.error}`), !1) : !0;
      } catch (t) {
        return u(`Error saving _roles.json: ${t}`), !1;
      }
    }
    async function Jt(t) {
      if (!le.value) return;
      const e = On(le.value), n = await Mn(e, t, i.suffix);
      u(n.message), n.changed.some((o) => o.file === _.value) && (await Ct(), ne = null, oe = null, W(), be());
    }
    function Gt(t, e) {
      if (!Array.isArray(t) || !t.length) return null;
      const n = [];
      return e.forEach((o, s) => {
        o.malformed || n.push(s);
      }), n.length !== t.length ? null : { lines: t, rowIndexMap: n };
    }
    const D = w(() => b.value ? Gt(te.value, d.value) : null), je = w(() => {
      const t = /* @__PURE__ */ new Map();
      return D.value && D.value.rowIndexMap.forEach((e, n) => t.set(e, n)), t;
    }), Kt = w(() => !!(b.value && te.value && te.value.length && !D.value));
    function Pe() {
      me && (me.pause(), me.src = "", me = null), J.value = -1;
    }
    function yt(t) {
      Pe();
      const e = Ee.value, n = (o) => {
        var v, h;
        let s = null;
        for (; o < d.value.length && !(!d.value[o].malformed && (s = mt(o), s)); )
          o++;
        if (o >= d.value.length || !s) {
          J.value = -1;
          return;
        }
        J.value = o, (h = he.get((v = d.value[o]) == null ? void 0 : v.__key)) == null || h.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const l = new Audio(`${se}/audio?path=${encodeURIComponent(Y(e, s))}&v=${Date.now()}`);
        me = l, l.addEventListener("ended", () => n(o + 1)), l.play().catch(($) => u(`Playback failed: ${$}`));
      };
      n(t);
    }
    function Re() {
      var o;
      const t = _e.value;
      if (!D.value || !t) {
        de.value = -1;
        return;
      }
      const e = t.currentTime;
      let n = -1;
      for (let s = 0; s < D.value.lines.length; s++)
        if (e >= D.value.lines[s].start && e < D.value.lines[s].end) {
          n = s;
          break;
        }
      if (n !== de.value && (de.value = n, n >= 0 && q.value)) {
        const s = D.value.rowIndexMap[n], l = s !== void 0 ? he.get((o = d.value[s]) == null ? void 0 : o.__key) : null;
        l == null || l.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function be({ silent: t = !1 } = {}) {
      const e = Y(Y(xe.value, "timing"), `${V.value}.json`);
      try {
        const o = await (await fetch(`${Me}/read?path=${encodeURIComponent(e)}`)).json();
        if (!o.exists) {
          te.value = null, oe = null;
          return;
        }
        if (t && o.mtime === oe) return;
        const s = o.mtime !== oe;
        oe = o.mtime;
        let l;
        try {
          l = JSON.parse(o.content);
        } catch {
          te.value = null;
          return;
        }
        te.value = Array.isArray(l.lines) ? l.lines : null, s && ke(), ae(Re);
      } catch {
      }
    }
    function Wt() {
      Ke || (Ke = !0, K && (clearTimeout(K), Le()), fe && clearInterval(fe), pe && clearInterval(pe), ve && clearInterval(ve), i.onClose());
    }
    Oe(qe, (t) => {
      t || Wt();
    });
    function O() {
      Ge = Date.now(), K && clearTimeout(K), K = setTimeout(Le, Fo);
    }
    async function Le() {
      const t = L(d.value);
      if (t !== re)
        try {
          const n = await (await fetch(`${Me}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: pt.value, content: t })
          })).json();
          if (n.error) {
            u(`Save error: ${n.error}`);
            return;
          }
          re = t, u(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (e) {
          u(`Save failed: ${e}`);
        }
    }
    function De(t) {
      t && (t.style.height = "auto", t.style.height = `${t.scrollHeight}px`);
    }
    function gt(t, e) {
      if (!e) {
        ye.delete(t);
        return;
      }
      ye.set(t, e.$el ?? e);
    }
    function Xt() {
      ae(() => ye.forEach(De));
    }
    function Yt(t, e) {
      if (!e) {
        he.delete(t);
        return;
      }
      he.set(t, e);
    }
    async function kt(t) {
      var n;
      Ie.value = t, await ae();
      const e = he.get(t);
      e == null || e.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = e == null ? void 0 : e.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        Ie.value === t && (Ie.value = null);
      }, 500);
    }
    async function Qe({ deletes: t = [], moves: e = [] } = {}) {
      if (!(!t.length && !e.length))
        try {
          await fetch(`${se}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: V.value, deletes: t, moves: e })
          }), await ke();
        } catch {
        }
    }
    async function Zt(t, e) {
      const n = d.value[t], o = d.value[e];
      if (!n || !o || n.malformed || o.malformed) return;
      const s = Math.min(t, e), l = Math.max(t, e), v = d.value[s], h = d.value[l];
      if ((v.speaker || "").trim() !== (h.speaker || "").trim() && !await Se({
        title: "Merge lines with different speakers?",
        message: `"${v.speaker}" and "${h.speaker}" are different speakers. Merge anyway? The combined line keeps "${v.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }))
        return;
      const $ = N.value.get(l), j = N.value.size;
      if (v.text = `${v.text} ${h.text}`.trim(), d.value.splice(l, 1), O(), $ !== void 0) {
        const P = [];
        for (let R = $ + 1; R < j; R++) P.push([R, R - 1]);
        Qe({ deletes: [$], moves: P });
      }
    }
    function Qt(t, e) {
      !t || t.__flDragAttached || (t.__flDragAttached = !0, t.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const o = t.closest(".fl-line-row");
        We = Number(o == null ? void 0 : o.dataset.rowIndex), o == null || o.classList.add("fl-row-dragging");
        const s = (v) => {
          var j;
          (j = Xe.value) == null || j.querySelectorAll(".fl-row-drop-target").forEach((P) => P.classList.remove("fl-row-drop-target"));
          const h = document.elementFromPoint(v.clientX, v.clientY), $ = h && h.closest ? h.closest(".fl-line-row") : null;
          $ && $ !== o && $.classList.add("fl-row-drop-target");
        }, l = (v) => {
          var P;
          document.removeEventListener("pointermove", s), document.removeEventListener("pointerup", l), document.removeEventListener("pointercancel", l);
          const h = document.elementFromPoint(v.clientX, v.clientY), $ = h && h.closest ? h.closest(".fl-line-row") : null, j = We;
          if (We = null, o == null || o.classList.remove("fl-row-dragging"), (P = Xe.value) == null || P.querySelectorAll(".fl-row-drop-target").forEach((R) => R.classList.remove("fl-row-drop-target")), $ && $ !== o) {
            const R = Number($.dataset.rowIndex);
            Number.isNaN(R) || Zt(j, R);
          }
        };
        document.addEventListener("pointermove", s), document.addEventListener("pointerup", l), document.addEventListener("pointercancel", l);
      }));
    }
    function en(t) {
      const e = N.value.get(t), n = N.value.size;
      if (d.value.splice(t, 1), O(), e !== void 0) {
        const o = [];
        for (let s = e + 1; s < n; s++) o.push([s, s - 1]);
        Qe({ deletes: [e], moves: o });
      }
    }
    async function bt(t, e) {
      e && e.trim() && !await Se({
        title: "Delete this line?",
        message: e.length > 200 ? e.slice(0, 200) + "…" : e,
        okText: "Delete",
        cancelText: "Cancel"
      }) || en(t);
    }
    function tn(t) {
      O();
    }
    function nn(t) {
      O();
    }
    function et(t) {
      const e = (t.speaker || "").trim();
      return e ? d.value.filter((n) => n !== t && !n.malformed && (n.speaker || "").trim() === e).length : 0;
    }
    function on(t) {
      const e = et(t);
      return e > 0 ? `Apply this instruct to every other "${t.speaker.trim()}" line in this script (${e})` : "No other lines in this script use this speaker";
    }
    function sn(t) {
      const e = et(t);
      if (!e) return;
      const n = t.speaker.trim();
      d.value.forEach((o) => {
        o !== t && !o.malformed && (o.speaker || "").trim() === n && (o.instruct = t.instruct);
      }), O(), u(`Applied instruct to ${e} other "${n}" line(s) in this script`);
    }
    function an(t, e) {
      De(e), O();
    }
    function ln(t, e, n) {
      n.preventDefault();
      const o = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), s = e.selectionStart, l = e.selectionEnd;
      e.value = e.value.slice(0, s) + o + e.value.slice(l), e.selectionStart = e.selectionEnd = s + o.length, t.text = e.value, an(t, e);
    }
    function Fe(t) {
      return F.value.find((e) => e.code === t.speaker);
    }
    function rn(t) {
      const e = Fe(t), n = Vt(t.speaker);
      return e ? `Change "${e.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${t.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function cn(t) {
      const e = Ht()[t] || [];
      return e.length ? `used by: ${e.join(", ")} -- ${e.length} role(s)` : "not used by any role yet";
    }
    function wt(t) {
      const e = $e.value.find((n) => (n.text || "").trim() === t.instruct.trim());
      return e && e.note ? e.note : null;
    }
    function St(t) {
      return [t.name, t.speaker, t.description].filter(Boolean).join(" -- ");
    }
    async function un(t, e) {
      const n = Fe(t);
      if (!n) return;
      n.speaker = e, await qt() && (u(`"${n.code}" now uses "${e}" for the whole play`), await Jt(n.code));
    }
    function dn(t, e) {
      const n = t.getBoundingClientRect();
      B.left = Math.min(n.left, window.innerWidth - 280), B.top = n.bottom + 4, B.code = e, B.visible = !0;
    }
    function fn() {
      B.visible = !1;
    }
    const tt = w(() => {
      const t = B.code;
      if (!t) return { message: "No speaker set on this line yet" };
      const e = F.value.find((o) => o.code === t);
      if (!e) return { message: `"${t}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(e).filter(([, o]) => o !== "" && o !== null && o !== void 0 && o !== e.__key);
      return n.length ? { fields: n } : { message: `"${t}" has no fields set in _roles.json` };
    });
    function pn(t, e) {
      return G.has(t) ? "Re-voicing..." : Ae(e) && !Te(t, e) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : Te(t, e) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function vn(t, e) {
      if (!G.has(t)) {
        G.add(t), u("Re-voicing...");
        try {
          const n = await Pt(ht(t.speaker), t.instruct, t.text);
          await i.revoiceApi.revoiceLine({
            linePosition: N.value.get(e),
            speaker: t.speaker,
            instruct: t.instruct,
            text: t.text,
            contentHash: n,
            file: _.value,
            folder: i.folder,
            baseName: V.value
          }), await ke();
          const o = N.value.get(e), s = Nt(o, n), l = ge.value.has(s);
          console.log("[FL revoice] after render:", {
            position: o,
            expectedFile: s,
            foundOnDisk: l,
            linesDir: Ee.value,
            filesInDir: [...ge.value]
          }), u(l ? "Line re-voiced" : `Re-voice finished but ${s} is not in ${Ee.value} -- see the console`);
        } catch (n) {
          u(`Re-voice failed: ${n.message || n}`);
        } finally {
          G.delete(t), Le();
        }
      }
    }
    function $t(t) {
      return b.value ? de.value === je.value.get(t) && q.value : J.value === t;
    }
    function nt(t, e) {
      return b.value ? je.value.get(t) !== void 0 : Ae(t);
    }
    function mn(t, e) {
      if (nt(e))
        if (b.value) {
          const n = je.value.get(e), o = _e.value;
          if (n === void 0 || !o || !D.value) return;
          o.currentTime = D.value.lines[n].start, o.play();
        } else J.value === e ? Pe() : yt(e);
    }
    const ot = w(() => b.value ? q.value : J.value !== -1), st = w(() => b.value ? !!A.best : d.value.some((t, e) => !t.malformed && Ae(e))), hn = w(() => st.value ? ot.value ? "Pause" : b.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
    function yn() {
      if (st.value)
        if (b.value) {
          const t = _e.value;
          if (!t) return;
          q.value ? t.pause() : t.play();
        } else J.value !== -1 ? Pe() : yt(0);
    }
    async function W({ silent: t = !1 } = {}) {
      t || (A.checking = !0);
      try {
        const n = await (await fetch(`${At}?path=${encodeURIComponent(xe.value)}`)).json(), o = Array.isArray(n.files) ? n.files : [], s = n.file_mtimes || {}, l = V.value.toLowerCase(), v = o.filter((j) => {
          const P = j.lastIndexOf(".");
          return (P > 0 ? j.slice(0, P) : j).toLowerCase().startsWith(l);
        });
        v.sort();
        const h = v.length ? v[v.length - 1] : null, $ = h ? `${h}::${s[h] || ""}` : null;
        if (t && $ === ne) return;
        ne = $, A.checking = !1, A.error = null, A.best = h, A.mtime = h ? s[h] || Date.now() : null, h || (q.value = !1, ae(Re));
      } catch (e) {
        A.checking = !1, A.error = String(e);
      }
    }
    const gn = w(() => !A.best);
    async function kn() {
      if (!(!A.best || !await Se({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${V.value}" (currently: ${A.best})${b.value ? " -- this also un-marks the script as done" : ""}.`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${se}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: V.value, filename: _.value })
          })).json();
          if (n.error) {
            u(`Error: ${n.error}`);
            return;
          }
          u(`Deleted ${n.deleted.length} audio file(s)`), U.value = U.value.filter((o) => o !== _.value), ne = null, W();
        } catch (e) {
          u(`Error: ${e}`);
        }
    }
    function bn(t) {
      var e;
      (e = i.checkedApi) == null || e.setChecked(_.value, t);
    }
    const wn = w(() => !b.value && !Ze.value), Sn = w(() => b.value ? "Marked ready to release -- click to unmark and go back to editing" : Ze.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function $n() {
      var n;
      const t = !b.value;
      if (t && !Ze.value) {
        u("Every line needs to be voiced before marking done");
        return;
      }
      if (t) {
        u("Stitching final file...");
        const o = d.value.filter((s) => !s.malformed);
        try {
          const l = await (await fetch(`${se}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: i.folder,
              base_name: V.value,
              // Each position's own current hash -- lets stitch_lines
              // read the EXACT file that content hashes to, no
              // directory-scan guessing (see nodes/_line_audio.py's
              // expected_path).
              line_hashes: o.map((v) => Ye.get(v.__key)),
              line_texts: o.map((v) => v.text)
            })
          })).json();
          if (l.error) {
            u(`Stitch error: ${l.error}`);
            return;
          }
        } catch (s) {
          u(`Stitch failed: ${s}`);
          return;
        }
        U.value = [.../* @__PURE__ */ new Set([...U.value, _.value])], (n = i.checkedApi) == null || n.setChecked(_.value, !1), Ce.value = !1, u("Stitched and marked done"), ne = null, oe = null, W(), be();
        return;
      }
      if (await Se({
        title: "Unmark done?",
        message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
        okText: "Unmark",
        cancelText: "Cancel"
      }))
        try {
          const s = await (await fetch(`${se}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: V.value, filename: _.value })
          })).json();
          if (s.error) {
            u(`Error: ${s.error}`);
            return;
          }
          U.value = U.value.filter((l) => l !== _.value), u("Unmarked -- can be edited/re-voiced again"), ne = null, W();
        } catch (o) {
          u(`Error: ${o}`);
        }
    }
    function Cn() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" && t.tagName !== "INPUT") {
        u("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const e = t.selectionStart;
      t.value = t.value.slice(0, e) + "́" + t.value.slice(e), t.selectionStart = t.selectionEnd = e + 1, t.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function In() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" || !t.classList.contains("fl-textarea")) {
        u("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const e = t.closest(".fl-line-row"), n = e ? Number(e.dataset.rowIndex) : -1, o = n >= 0 ? d.value[n] : null;
      if (!o || o.malformed) {
        u("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const s = N.value.get(n), l = N.value.size, v = t.selectionStart, h = o.text.slice(0, v).trimEnd(), $ = o.text.slice(v).trimStart();
      o.text = h;
      const j = I({ speaker: o.speaker, instruct: o.instruct, text: $, raw: "", malformed: !1 });
      if (d.value.splice(n + 1, 0, j), kt(j.__key), O(), s !== void 0) {
        const P = s + 1, R = [];
        for (let Ne = l - 1; Ne >= P; Ne--) R.push([Ne, Ne + 1]);
        Qe({ moves: R });
      }
    }
    function _n() {
      const t = I({ speaker: "", instruct: "", text: "", raw: "", malformed: !1 });
      d.value.push(t), kt(t.__key), O();
    }
    const X = w(() => ee.value.indexOf(_.value)), xn = w(() => !(X.value > 0)), En = w(() => !(X.value >= 0 && X.value < ee.value.length - 1));
    function An() {
      X.value > 0 && It(ee.value[X.value - 1]);
    }
    function Tn() {
      X.value >= 0 && X.value < ee.value.length - 1 && It(ee.value[X.value + 1]);
    }
    async function jn() {
      try {
        const e = await (await fetch(Fn)).json();
        Je.value = e.presets || [];
      } catch {
        Je.value = [];
      }
    }
    async function Ct() {
      var t, e, n;
      try {
        const o = `${se}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, l = await (await fetch(o)).json();
        $e.value = ((t = l.instructions) == null ? void 0 : t.entries) || [], F.value = ((e = l.roles) == null ? void 0 : e.entries) || [], le.value = ((n = l.roles) == null ? void 0 : n.path) || null, ee.value = Array.isArray(l.scripts) ? l.scripts : [], U.value = Array.isArray(l.ready_scripts) ? l.ready_scripts : [];
      } catch {
        $e.value = [], F.value = [], le.value = null, ee.value = [], U.value = [];
      }
    }
    async function It(t) {
      !t || t === _.value || Ke || (K && (clearTimeout(K), K = null, await Le()), _.value = t, ne = null, te.value = null, oe = null, d.value = [], re = null, Ge = 0, Ce.value = i.checkedApi ? i.checkedApi.isChecked(t) : !1, u("Loading..."), await at(), W(), be());
    }
    async function at({ isPoll: t = !1 } = {}) {
      try {
        const n = await (await fetch(`${Me}/read?path=${encodeURIComponent(pt.value)}`)).json();
        if (n.error) {
          u(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          t || (d.value = [], re = "", u("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (t && Date.now() - Ge < No || n.content === re) return;
        d.value = H(n.content), re = n.content, t || u(`Loaded ${d.value.length} line(s)`);
      } catch (e) {
        u(`Read failed: ${e}`);
      }
    }
    return Oe(D, () => ae(Re)), Oe(z, Xt), Ln(() => {
      Ct(), jn(), W(), ke(), pe = setInterval(() => {
        W({ silent: !0 }), ke();
      }, rt), at().then(() => {
        fe = setInterval(() => at({ isPoll: !0 }), rt), be(), ve = setInterval(() => be({ silent: !0 }), rt);
      });
    }), Dn(() => {
      Pe(), fe && clearInterval(fe), pe && clearInterval(pe), ve && clearInterval(ve);
    }), (t, e) => (y(), S(Z, null, [
      f(c(Lt), {
        visible: qe.value,
        "onUpdate:visible": e[11] || (e[11] = (n) => qe.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: we({ width: c(Ut) }),
        class: "line-editor-dialog"
      }, {
        header: C(() => [
          f(Hn, {
            title: _.value,
            status: ft.value,
            "width-presets": c(Bt),
            "set-width": c(zt)
          }, {
            after: C(() => [
              p("div", po, [
                f(c(E), {
                  label: "A−",
                  text: "",
                  size: "small",
                  title: "Decrease line text font size",
                  onClick: e[0] || (e[0] = (n) => {
                    z.value = Math.max(Mo, z.value - 1), x(ct, z.value);
                  })
                }),
                f(c(E), {
                  label: "A+",
                  text: "",
                  size: "small",
                  title: "Increase line text font size",
                  onClick: e[1] || (e[1] = (n) => {
                    z.value = Math.min(Uo, z.value + 1), x(ct, z.value);
                  })
                })
              ])
            ]),
            _: 1
          }, 8, ["title", "status", "width-presets", "set-width"])
        ]),
        default: C(() => [
          f(lo, { class: "line-editor-controls" }, {
            default: C(() => [
              p("div", vo, [
                p("span", {
                  class: Q(["play-btn global-play-btn", { "is-playing": ot.value, disabled: !st.value }]),
                  title: hn.value,
                  onClick: yn
                }, T(ot.value ? "⏸" : "▶"), 11, mo),
                A.best ? (y(), S(Z, { key: 0 }, [
                  p("audio", {
                    ref_key: "audioElRef",
                    ref: _e,
                    controls: "",
                    class: "audio-el",
                    src: `${c(se)}/audio?path=${encodeURIComponent(c(Y)(xe.value, A.best))}&v=${encodeURIComponent(A.mtime || "")}`,
                    onTimeupdate: Re,
                    onPlay: e[2] || (e[2] = (n) => q.value = !0),
                    onPause: e[3] || (e[3] = (n) => q.value = !1),
                    onEnded: e[4] || (e[4] = (n) => q.value = !1)
                  }, null, 40, ho),
                  f(c(E), {
                    label: "Delete audio",
                    text: "",
                    size: "small",
                    disabled: gn.value,
                    title: b.value ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                    onClick: kn,
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title"])
                ], 64)) : M("", !0),
                f(c(E), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: e[5] || (e[5] = (n) => W())
                })
              ]),
              Kt.value ? (y(), S("div", yo, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : M("", !0),
              p("div", go, [
                p("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: Ce.value,
                  disabled: !a.checkedApi || b.value,
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: e[6] || (e[6] = (n) => {
                    Ce.value = n.target.checked, bn(n.target.checked);
                  })
                }, null, 40, ko),
                f(c(E), {
                  label: b.value ? "Done ✓" : "Done",
                  size: "small",
                  outlined: !b.value,
                  disabled: wn.value,
                  title: Sn.value,
                  onClick: $n
                }, null, 8, ["label", "outlined", "disabled", "title"]),
                e[12] || (e[12] = p("div", { class: "actions-divider" }, null, -1)),
                f(c(E), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: ze(Cn, ["prevent"])
                }),
                f(c(E), {
                  label: "✂ Split line",
                  text: "",
                  size: "small",
                  title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
                  onMousedown: ze(In, ["prevent"])
                }),
                f(c(E), {
                  label: "+ Add line",
                  text: "",
                  size: "small",
                  title: "Add a new empty line at the end of the script",
                  onClick: _n
                }),
                e[13] || (e[13] = p("div", { class: "actions-divider" }, null, -1)),
                f(c(E), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: xn.value,
                  title: "Open the previous script in this act",
                  onClick: An
                }, null, 8, ["disabled"]),
                f(c(E), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: En.value,
                  title: "Open the next script in this act",
                  onClick: Tn
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          p("div", {
            ref_key: "rowsContainerEl",
            ref: Xe,
            class: "rows-container"
          }, [
            (y(!0), S(Z, null, Et(d.value, (n, o) => (y(), S("div", {
              key: n.__key,
              class: Q(["fl-line-row", { "row-enter": Ie.value === n.__key, "row-playing": b.value ? je.value.get(o) === de.value : J.value === o }]),
              "data-row-index": o,
              ref_for: !0,
              ref: (s) => Yt(n.__key, s)
            }, [
              p("div", {
                class: "line-rail",
                style: we(n.malformed ? {} : { backgroundColor: Ot(n.speaker) }),
                title: "Drag onto another line to merge them",
                ref_for: !0,
                ref: (s) => Qt(s, o)
              }, [
                p("span", wo, T(o + 1), 1),
                e[14] || (e[14] = p("span", { class: "drag-handle" }, "⠿", -1))
              ], 4),
              p("div", So, [
                n.malformed ? (y(), S(Z, { key: 0 }, [
                  p("div", $o, [
                    e[15] || (e[15] = p("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                    f(c(E), {
                      icon: "pi pi-trash",
                      text: "",
                      size: "small",
                      title: "Delete this line",
                      onClick: (s) => bt(o, n.raw)
                    }, null, 8, ["onClick"])
                  ]),
                  f(c(jt), {
                    modelValue: n.raw,
                    "onUpdate:modelValue": [
                      (s) => n.raw = s,
                      e[7] || (e[7] = (s) => O())
                    ],
                    "auto-resize": "",
                    class: "fl-textarea malformed-textarea",
                    style: we({ fontSize: `${z.value}px` }),
                    rows: "1",
                    ref_for: !0,
                    ref: (s) => {
                      gt(n.__key, s), ae(() => De(c(ye).get(n.__key)));
                    },
                    onKeydown: e[8] || (e[8] = Tt(ze(() => {
                    }, ["prevent"]), ["enter"]))
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
                ], 64)) : (y(), S(Z, { key: 1 }, [
                  p("div", Co, [
                    p("span", {
                      class: Q(["play-btn", { "is-playing": $t(o), disabled: !nt(o, n) }]),
                      title: nt(o, n) ? b.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                      onClick: (s) => mn(n, o)
                    }, T($t(o) ? "⏸" : "▶"), 11, Io),
                    f(c(Ve), { class: "speaker-group" }, {
                      default: C(() => [
                        f(c(He), null, {
                          default: C(() => [...e[16] || (e[16] = [
                            p("i", { class: "pi pi-address-book" }, null, -1)
                          ])]),
                          _: 1
                        }),
                        f(c(lt), {
                          "model-value": n.speaker,
                          options: F.value,
                          "option-label": "code",
                          "option-value": "code",
                          editable: "",
                          filter: "",
                          placeholder: "Speaker",
                          title: "Speaker (role code, or a literal preset/preset#tag)",
                          "onUpdate:modelValue": (s) => {
                            n.speaker = s, tn(n);
                          }
                        }, {
                          option: C(({ option: s }) => [
                            p("div", _o, T(s.code), 1),
                            St(s) ? (y(), S("div", xo, T(St(s)), 1)) : M("", !0)
                          ]),
                          _: 1
                        }, 8, ["model-value", "options", "onUpdate:modelValue"])
                      ]),
                      _: 2
                    }, 1024),
                    f(c(Ve), { class: "instruct-group" }, {
                      default: C(() => [
                        f(c(He), null, {
                          default: C(() => [...e[17] || (e[17] = [
                            p("i", { class: "pi pi-book" }, null, -1)
                          ])]),
                          _: 1
                        }),
                        f(c(lt), {
                          "model-value": n.instruct,
                          options: $e.value,
                          "option-label": "text",
                          "option-value": "text",
                          editable: "",
                          filter: "",
                          placeholder: "Instruct",
                          title: "Instruct text",
                          "onUpdate:modelValue": (s) => {
                            n.instruct = s, nn(n);
                          }
                        }, {
                          option: C(({ option: s }) => [
                            p("div", Eo, T(s.text), 1),
                            s.note ? (y(), S("div", Ao, T(s.note), 1)) : M("", !0)
                          ]),
                          _: 1
                        }, 8, ["model-value", "options", "onUpdate:modelValue"]),
                        f(c(E), {
                          icon: "pi pi-users",
                          text: "",
                          size: "small",
                          class: "apply-instruct-btn",
                          disabled: et(n) === 0,
                          title: on(n),
                          onClick: (s) => sn(n)
                        }, null, 8, ["disabled", "title", "onClick"])
                      ]),
                      _: 2
                    }, 1024),
                    f(c(Ve), { class: "speaker-file-group" }, {
                      default: C(() => {
                        var s;
                        return [
                          a.revoiceApi && !b.value ? (y(), Be(c(E), {
                            key: 0,
                            class: Q(["revoice-btn", { pending: G.has(n), stale: !G.has(n) && Ae(o) && !Te(n, o) }]),
                            text: "",
                            size: "small",
                            icon: G.has(n) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                            disabled: G.has(n),
                            title: pn(n, o),
                            onClick: (l) => vn(n, o)
                          }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : M("", !0),
                          f(c(lt), {
                            "model-value": ((s = Fe(n)) == null ? void 0 : s.speaker) || "",
                            options: Je.value,
                            editable: "",
                            filter: "",
                            placeholder: "(no speaker)",
                            class: "speaker-file-dropdown",
                            disabled: !Fe(n),
                            title: rn(n),
                            "onUpdate:modelValue": (l) => un(n, l)
                          }, {
                            option: C(({ option: l }) => [
                              p("div", To, T(l), 1),
                              p("div", jo, T(cn(l)), 1)
                            ]),
                            _: 1
                          }, 8, ["model-value", "options", "disabled", "title", "onUpdate:modelValue"]),
                          f(c(He), {
                            class: "role-info-btn",
                            onMouseenter: (l) => dn(l.target, n.speaker),
                            onMouseleave: fn
                          }, {
                            default: C(() => [...e[18] || (e[18] = [
                              p("i", { class: "pi pi-info-circle" }, null, -1)
                            ])]),
                            _: 1
                          }, 8, ["onMouseenter"])
                        ];
                      }),
                      _: 2
                    }, 1024),
                    e[19] || (e[19] = p("div", { class: "spacer" }, null, -1)),
                    f(c(E), {
                      icon: "pi pi-times",
                      color: "red",
                      text: "",
                      size: "small",
                      title: "Delete this line",
                      onClick: (s) => bt(o, n.text)
                    }, null, 8, ["onClick"])
                  ]),
                  wt(n) ? (y(), S("div", Po, "↳ " + T(wt(n)), 1)) : M("", !0),
                  f(c(jt), {
                    modelValue: n.text,
                    "onUpdate:modelValue": [
                      (s) => n.text = s,
                      e[9] || (e[9] = (s) => O())
                    ],
                    "auto-resize": "",
                    class: "fl-textarea",
                    style: we({ fontSize: `${z.value}px` }),
                    rows: "1",
                    ref_for: !0,
                    ref: (s) => {
                      gt(n.__key, s), ae(() => De(c(ye).get(n.__key)));
                    },
                    onKeydown: e[10] || (e[10] = Tt(ze(() => {
                    }, ["prevent"]), ["enter"])),
                    onPaste: (s) => ln(n, s.target, s)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "style", "onPaste"])
                ], 64))
              ])
            ], 10, bo))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      f(c(Ft)),
      B.visible ? (y(), S("div", {
        key: 0,
        class: "role-info-popover",
        style: we({ left: `${B.left}px`, top: `${B.top}px` })
      }, [
        tt.value.message ? (y(), S("div", Ro, T(tt.value.message), 1)) : M("", !0),
        (y(!0), S(Z, null, Et(tt.value.fields, ([n, o]) => (y(), S("div", {
          key: n,
          class: "role-info-row"
        }, [
          p("span", Lo, T(n), 1),
          p("span", Do, T(o), 1)
        ]))), 128))
      ], 4)) : M("", !0)
    ], 64));
  }
}, Bo = /* @__PURE__ */ Rt(zo, [["__scopeId", "data-v-53469ce6"]]);
function Jo({ folder: a, filename: i, suffix: m = "", checkedApi: x, revoiceApi: g }) {
  Un(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const I = zn(Bo, {
    folder: a,
    filename: i,
    suffix: m,
    checkedApi: x || null,
    revoiceApi: g || null,
    onClose: () => {
      I.unmount(), r.remove();
    }
  });
  I.use(Bn, { ripple: !0 }), I.use(Jn), I.mount(r);
}
export {
  Jo as openLineEditor
};
