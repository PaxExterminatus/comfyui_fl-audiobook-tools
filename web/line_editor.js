import { z as En, A as An, B as ct, s as ut, o as g, c as S, C as ie, m as ce, D as _t, b as Ue, E as st, d as C, g as v, p as Q, f as d, F as Z, G as xt, k as O, t as L, h as A, _ as Pt, r as k, w as Ne, a as Tn, H as jn, n as we, u, l as Et, S as ae, I as Pn, e as At, J as se, K as Oe, v as Y, L as Me, q as w, M as Ln, N as Be, i as Tt, O as Rn, Q as Dn, x as Fn, y as Nn, P as On } from "./styles_link.js";
import { s as Lt, u as Mn } from "./PanelWidthButtons.js";
import { s as it, D as Bn } from "./DialogHeader.js";
var ue = En(), Rt = Symbol();
function Un() {
  var s = An(Rt);
  if (!s)
    throw new Error("No PrimeVue Confirmation provided!");
  return s;
}
var zn = {
  install: function(i) {
    var m = {
      require: function(y) {
        ue.emit("confirm", y);
      },
      close: function() {
        ue.emit("close");
      }
    };
    i.config.globalProperties.$confirm = m, i.provide(Rt, m);
  }
}, Vn = {
  root: "p-inputgroup"
}, Hn = ct.extend({
  name: "inputgroup",
  classes: Vn
}), qn = {
  name: "BaseInputGroup",
  extends: ut,
  style: Hn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, ze = {
  name: "InputGroup",
  extends: qn,
  inheritAttrs: !1
};
function Jn(s, i, m, x, y, r) {
  return g(), S("div", ce({
    class: s.cx("root")
  }, s.ptmi("root")), [ie(s.$slots, "default")], 16);
}
ze.render = Jn;
var Gn = {
  root: "p-inputgroup-addon"
}, Kn = ct.extend({
  name: "inputgroupaddon",
  classes: Gn
}), Wn = {
  name: "BaseInputGroupAddon",
  extends: ut,
  style: Kn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ve = {
  name: "InputGroupAddon",
  extends: Wn,
  inheritAttrs: !1
};
function Xn(s, i, m, x, y, r) {
  return g(), S("div", ce({
    class: s.cx("root")
  }, s.ptmi("root")), [ie(s.$slots, "default")], 16);
}
Ve.render = Xn;
var Yn = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var m = i.instance;
    return ["p-confirm-dialog-reject", m.confirmation && !m.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, Zn = ct.extend({
  name: "confirmdialog",
  classes: Yn
}), Qn = {
  name: "BaseConfirmDialog",
  extends: ut,
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
  style: Zn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Dt = {
  name: "ConfirmDialog",
  extends: Qn,
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
    CDButton: A
  }
};
function eo(s, i, m, x, y, r) {
  var I = _t("CDButton"), V = _t("CDialog");
  return g(), Ue(V, {
    visible: y.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(R) {
      return y.visible = R;
    }), r.onHide],
    role: "alertdialog",
    class: Q(s.cx("root")),
    modal: !0,
    header: r.header,
    blockScroll: r.blockScroll,
    position: r.position,
    breakpoints: s.breakpoints,
    closeOnEscape: r.closeOnEscape,
    draggable: s.draggable,
    pt: s.pt,
    unstyled: s.unstyled
  }, st({
    default: C(function() {
      return [s.$slots.container ? O("", !0) : (g(), S(Z, {
        key: 0
      }, [s.$slots.message ? (g(), Ue(xt(s.$slots.message), {
        key: 1,
        message: y.confirmation
      }, null, 8, ["message"])) : (g(), S(Z, {
        key: 0
      }, [ie(s.$slots, "icon", {}, function() {
        return [s.$slots.icon ? (g(), Ue(xt(s.$slots.icon), {
          key: 0,
          class: Q(s.cx("icon"))
        }, null, 8, ["class"])) : y.confirmation.icon ? (g(), S("span", ce({
          key: 1,
          class: [y.confirmation.icon, s.cx("icon")]
        }, s.ptm("icon")), null, 16)) : O("", !0)];
      }), d("span", ce({
        class: s.cx("message")
      }, s.ptm("message")), L(r.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [s.$slots.container ? {
    name: "container",
    fn: C(function(R) {
      return [ie(s.$slots, "container", {
        message: y.confirmation,
        onClose: R.onClose,
        onAccept: r.accept,
        onReject: r.reject,
        closeCallback: R.onclose,
        acceptCallback: r.accept,
        rejectCallback: r.reject
      })];
    }),
    key: "0"
  } : void 0, s.$slots.container ? void 0 : {
    name: "footer",
    fn: C(function() {
      return [v(I, {
        label: r.rejectLabel,
        class: Q([s.cx("rejectButton"), y.confirmation.rejectClass]),
        onClick: i[0] || (i[0] = function(R) {
          return r.reject();
        }),
        autofocus: r.autoFocusReject,
        unstyled: s.unstyled,
        pt: s.ptm("rejectButton")
      }, st({
        _: 2
      }, [r.rejectIcon || s.$slots.rejecticon ? {
        name: "icon",
        fn: C(function(R) {
          return [ie(s.$slots, "rejecticon", {}, function() {
            return [d("span", ce({
              class: [r.rejectIcon, R.class]
            }, s.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), v(I, {
        label: r.acceptLabel,
        class: Q([s.cx("acceptButton"), y.confirmation.acceptClass]),
        onClick: i[1] || (i[1] = function(R) {
          return r.accept();
        }),
        autofocus: r.autoFocusAccept,
        unstyled: s.unstyled,
        pt: s.ptm("acceptButton")
      }, st({
        _: 2
      }, [r.acceptIcon || s.$slots.accepticon ? {
        name: "icon",
        fn: C(function(R) {
          return [ie(s.$slots, "accepticon", {}, function() {
            return [d("span", ce({
              class: [r.acceptIcon, R.class]
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
Dt.render = eo;
const to = { class: "sticky-panel" }, no = {
  __name: "StickyPanel",
  setup(s) {
    return (i, m) => (g(), S("div", to, [
      ie(i.$slots, "default", {}, void 0, !0)
    ]));
  }
}, oo = /* @__PURE__ */ Pt(no, [["__scopeId", "data-v-2941a6c7"]]);
async function jt(s, i, m) {
  const x = `${(s || "").trim()}|${(i || "").trim()}|${(m || "").trim()}`, y = new TextEncoder().encode(x), r = await crypto.subtle.digest("SHA-256", y);
  return [...new Uint8Array(r)].map((V) => V.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const ao = /^(\d+)_([0-9a-f]+)\.wav$/i;
function Ft(s, i) {
  return `${String(s).padStart(4, "0")}_${i}.wav`;
}
function so(s) {
  const i = ao.exec(s);
  return i ? { position: Number(i[1]), hash: i[2].toLowerCase() } : null;
}
function io(s, i, m) {
  return s.has(Ft(i, m));
}
function lo(s, i, m) {
  let x = null, y = -1 / 0;
  for (const r of s) {
    const I = so(r);
    if (!I || I.position !== m) continue;
    const V = (i == null ? void 0 : i[r]) ?? 0;
    (x === null || V > y) && (x = r, y = V);
  }
  return x;
}
const ro = { class: "font-row" }, co = { class: "audio-content-row" }, uo = ["title"], fo = ["src"], po = {
  key: 0,
  class: "timing-warning"
}, vo = { class: "actions-row" }, mo = ["checked", "disabled"], ho = ["data-row-index"], go = { class: "malformed-warn-line" }, yo = ["value", "onInput"], ko = { class: "line-controls-row" }, bo = ["title", "onClick"], wo = { class: "dropdown-option-label" }, So = {
  key: 0,
  class: "dropdown-option-sublabel"
}, $o = { class: "dropdown-option-label" }, Co = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Io = { class: "dropdown-option-label" }, _o = { class: "dropdown-option-sublabel" }, xo = {
  key: 0,
  class: "instruct-desc"
}, Eo = ["value", "onInput", "onPaste"], Ao = { key: 0 }, To = { class: "role-info-key" }, jo = { class: "role-info-value" }, Po = 600, lt = 3e3, Lo = 1500, Ro = 11.5, Do = 9, Fo = 22, rt = "FL_CosyVoice3.LineEditor.textFontSizePx", No = {
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
  setup(s) {
    const i = s;
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
    function y(t) {
      const e = t.split("|");
      return e.length !== 3 ? null : { speaker: e[0].trim(), instruct: e[1].trim(), text: e[2].trim() };
    }
    let r = 1;
    function I(t) {
      return { ...t, __key: r++ };
    }
    function V(t) {
      return t.split(`
`).map((e) => e.replace(/\r$/, "")).filter((e) => e.trim()).map((e) => {
        const n = y(e);
        return I(n ? { ...n, raw: e, malformed: !1 } : { raw: e, malformed: !0 });
      });
    }
    function R(t) {
      return t.map((e) => e.malformed ? e.raw : `${e.speaker} | ${e.instruct} | ${e.text}`).join(`
`);
    }
    function Nt(t) {
      if (!t) return "rgba(255,255,255,0.15)";
      let e = 0;
      for (let n = 0; n < t.length; n++) e = e * 31 + t.charCodeAt(n) >>> 0;
      return `hsl(${e % 360}, 55%, 55%)`;
    }
    const Ot = Un();
    function Se({ title: t = "Confirm", message: e = "", okText: n = "OK", cancelText: o = "Cancel" } = {}) {
      return new Promise((a) => {
        Ot.require({
          header: t,
          message: e,
          acceptLabel: n,
          rejectLabel: o,
          accept: () => a(!0),
          reject: () => a(!1),
          onHide: () => a(!1)
        });
      });
    }
    const He = k(!0), _ = k(i.filename), f = k([]), $e = k([]), F = k([]), le = k(null), qe = k([]), M = k([]), ee = k([]), dt = k(""), { cssWidth: Mt, setWidth: Bt, presets: Ut } = Mn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), B = k(m(rt, Ro)), te = k(null), de = k(-1), H = k(!1), q = k(-1), Ce = k(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), E = Me({ checking: !0, best: null, mtime: null, error: null }), U = Me({ visible: !1, top: 0, left: 0, code: null }), Ie = k(null), J = Me(/* @__PURE__ */ new Set());
    let re = null, Je = 0, ne = null, oe = null, G = null, fe = null, pe = null, ve = null, Ge = !1, Ke = null, me = null;
    const _e = k(null), We = k(null), he = /* @__PURE__ */ new Map(), Xe = /* @__PURE__ */ new Map(), ft = w(() => Y(i.folder, _.value)), xe = w(() => Y(i.folder, "_audio")), z = w(() => Ln(_.value, i.suffix)), Ee = w(() => Y(Y(xe.value, "lines"), z.value)), ge = k(/* @__PURE__ */ new Set()), pt = k({});
    async function ye() {
      try {
        const e = await (await fetch(`${At}?path=${encodeURIComponent(Ee.value)}`)).json();
        ge.value = new Set(Array.isArray(e.files) ? e.files : []), pt.value = e.file_mtimes || {};
      } catch {
      }
    }
    const N = w(() => {
      const t = /* @__PURE__ */ new Map();
      let e = 0;
      return f.value.forEach((n, o) => {
        n.malformed || (t.set(o, e), e++);
      }), t;
    });
    function vt(t) {
      const e = N.value.get(t);
      return e === void 0 ? null : lo(ge.value, pt.value, e);
    }
    function mt(t) {
      const e = F.value.find((n) => n.code === t);
      return e && e.speaker ? e.speaker : t || "";
    }
    const Ye = Me(/* @__PURE__ */ new Map());
    Ne(
      [f, F],
      async () => {
        const t = f.value.filter((n) => !n.malformed), e = await Promise.all(
          t.map((n) => jt(mt(n.speaker), n.instruct, n.text))
        );
        t.forEach((n, o) => Ye.set(n.__key, e[o]));
      },
      { deep: !0, immediate: !0 }
    );
    function Ae(t) {
      return vt(t) !== null;
    }
    function Te(t, e) {
      const n = N.value.get(e);
      if (n === void 0) return !1;
      const o = Ye.get(t.__key);
      return o !== void 0 && io(ge.value, n, o);
    }
    const b = w(() => M.value.includes(_.value)), Ze = w(() => {
      const t = [];
      return f.value.forEach((e, n) => {
        e.malformed || t.push(n);
      }), t.length > 0 && t.every((e) => Te(f.value[e], e));
    });
    function c(t) {
      dt.value = t;
    }
    function zt(t) {
      if (!t) return "";
      const e = F.value.find((a) => a.code === t), n = e && e.speaker ? e.speaker : t, o = String(n).split("#", 1)[0].trim();
      return o ? `${o}.pt` : "";
    }
    function Vt() {
      const t = {};
      return F.value.forEach((e) => {
        const n = String(e.speaker || "").split("#", 1)[0].trim();
        !n || !e.code || (t[n] = t[n] || []).push(e.code);
      }), t;
    }
    async function Ht() {
      if (!le.value)
        return c("No _roles.json found for this project -- can't save"), !1;
      try {
        const e = await (await fetch(`${Oe}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: le.value, content: JSON.stringify({ roles: F.value }, null, 2) })
        })).json();
        return e.error ? (c(`Error saving _roles.json: ${e.error}`), !1) : !0;
      } catch (t) {
        return c(`Error saving _roles.json: ${t}`), !1;
      }
    }
    async function qt(t) {
      if (!le.value) return;
      const e = Rn(le.value), n = await Dn(e, t, i.suffix);
      c(n.message), n.changed.some((o) => o.file === _.value) && (await Ct(), ne = null, oe = null, W(), ke());
    }
    function Jt(t, e) {
      if (!Array.isArray(t) || !t.length) return null;
      const n = [];
      return e.forEach((o, a) => {
        o.malformed || n.push(a);
      }), n.length !== t.length ? null : { lines: t, rowIndexMap: n };
    }
    const D = w(() => b.value ? Jt(te.value, f.value) : null), je = w(() => {
      const t = /* @__PURE__ */ new Map();
      return D.value && D.value.rowIndexMap.forEach((e, n) => t.set(e, n)), t;
    }), Gt = w(() => !!(b.value && te.value && te.value.length && !D.value));
    function Pe() {
      me && (me.pause(), me.src = "", me = null), q.value = -1;
    }
    function ht(t) {
      Pe();
      const e = Ee.value, n = (o) => {
        var p, h;
        let a = null;
        for (; o < f.value.length && !(!f.value[o].malformed && (a = vt(o), a)); )
          o++;
        if (o >= f.value.length || !a) {
          q.value = -1;
          return;
        }
        q.value = o, (h = he.get((p = f.value[o]) == null ? void 0 : p.__key)) == null || h.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const l = new Audio(`${ae}/audio?path=${encodeURIComponent(Y(e, a))}&v=${Date.now()}`);
        me = l, l.addEventListener("ended", () => n(o + 1)), l.play().catch(($) => c(`Playback failed: ${$}`));
      };
      n(t);
    }
    function Le() {
      var o;
      const t = _e.value;
      if (!D.value || !t) {
        de.value = -1;
        return;
      }
      const e = t.currentTime;
      let n = -1;
      for (let a = 0; a < D.value.lines.length; a++)
        if (e >= D.value.lines[a].start && e < D.value.lines[a].end) {
          n = a;
          break;
        }
      if (n !== de.value && (de.value = n, n >= 0 && H.value)) {
        const a = D.value.rowIndexMap[n], l = a !== void 0 ? he.get((o = f.value[a]) == null ? void 0 : o.__key) : null;
        l == null || l.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function ke({ silent: t = !1 } = {}) {
      const e = Y(Y(xe.value, "timing"), `${z.value}.json`);
      try {
        const o = await (await fetch(`${Oe}/read?path=${encodeURIComponent(e)}`)).json();
        if (!o.exists) {
          te.value = null, oe = null;
          return;
        }
        if (t && o.mtime === oe) return;
        const a = o.mtime !== oe;
        oe = o.mtime;
        let l;
        try {
          l = JSON.parse(o.content);
        } catch {
          te.value = null;
          return;
        }
        te.value = Array.isArray(l.lines) ? l.lines : null, a && ye(), se(Le);
      } catch {
      }
    }
    function Kt() {
      Ge || (Ge = !0, G && (clearTimeout(G), Re()), fe && clearInterval(fe), pe && clearInterval(pe), ve && clearInterval(ve), i.onClose());
    }
    Ne(He, (t) => {
      t || Kt();
    });
    function K() {
      Je = Date.now(), G && clearTimeout(G), G = setTimeout(Re, Po);
    }
    async function Re() {
      const t = R(f.value);
      if (t !== re)
        try {
          const n = await (await fetch(`${Oe}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: ft.value, content: t })
          })).json();
          if (n.error) {
            c(`Save error: ${n.error}`);
            return;
          }
          re = t, c(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (e) {
          c(`Save failed: ${e}`);
        }
    }
    function be(t) {
      t && (t.style.height = "auto", t.style.height = `${t.scrollHeight}px`);
    }
    function gt(t, e) {
      if (!e) {
        Xe.delete(t);
        return;
      }
      Xe.set(t, e.$el ?? e);
    }
    function Wt() {
      se(() => Xe.forEach(be));
    }
    function Xt(t, e) {
      if (!e) {
        he.delete(t);
        return;
      }
      he.set(t, e);
    }
    async function yt(t) {
      var n;
      Ie.value = t, await se();
      const e = he.get(t);
      e == null || e.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = e == null ? void 0 : e.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        Ie.value === t && (Ie.value = null);
      }, 500);
    }
    async function Qe({ deletes: t = [], moves: e = [] } = {}) {
      if (!(!t.length && !e.length))
        try {
          await fetch(`${ae}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: z.value, deletes: t, moves: e })
          }), await ye();
        } catch {
        }
    }
    async function Yt(t, e) {
      const n = f.value[t], o = f.value[e];
      if (!n || !o || n.malformed || o.malformed) return;
      const a = Math.min(t, e), l = Math.max(t, e), p = f.value[a], h = f.value[l];
      if ((p.speaker || "").trim() !== (h.speaker || "").trim() && !await Se({
        title: "Merge lines with different speakers?",
        message: `"${p.speaker}" and "${h.speaker}" are different speakers. Merge anyway? The combined line keeps "${p.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }))
        return;
      const $ = N.value.get(l), T = N.value.size;
      if (p.text = `${p.text} ${h.text}`.trim(), f.value.splice(l, 1), K(), $ !== void 0) {
        const j = [];
        for (let P = $ + 1; P < T; P++) j.push([P, P - 1]);
        Qe({ deletes: [$], moves: j });
      }
    }
    function Zt(t, e) {
      !t || t.__flDragAttached || (t.__flDragAttached = !0, t.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const o = t.closest(".fl-line-row");
        Ke = Number(o == null ? void 0 : o.dataset.rowIndex), o == null || o.classList.add("fl-row-dragging");
        const a = (p) => {
          var T;
          (T = We.value) == null || T.querySelectorAll(".fl-row-drop-target").forEach((j) => j.classList.remove("fl-row-drop-target"));
          const h = document.elementFromPoint(p.clientX, p.clientY), $ = h && h.closest ? h.closest(".fl-line-row") : null;
          $ && $ !== o && $.classList.add("fl-row-drop-target");
        }, l = (p) => {
          var j;
          document.removeEventListener("pointermove", a), document.removeEventListener("pointerup", l), document.removeEventListener("pointercancel", l);
          const h = document.elementFromPoint(p.clientX, p.clientY), $ = h && h.closest ? h.closest(".fl-line-row") : null, T = Ke;
          if (Ke = null, o == null || o.classList.remove("fl-row-dragging"), (j = We.value) == null || j.querySelectorAll(".fl-row-drop-target").forEach((P) => P.classList.remove("fl-row-drop-target")), $ && $ !== o) {
            const P = Number($.dataset.rowIndex);
            Number.isNaN(P) || Yt(T, P);
          }
        };
        document.addEventListener("pointermove", a), document.addEventListener("pointerup", l), document.addEventListener("pointercancel", l);
      }));
    }
    function Qt(t) {
      const e = N.value.get(t), n = N.value.size;
      if (f.value.splice(t, 1), K(), e !== void 0) {
        const o = [];
        for (let a = e + 1; a < n; a++) o.push([a, a - 1]);
        Qe({ deletes: [e], moves: o });
      }
    }
    async function kt(t, e) {
      e && e.trim() && !await Se({
        title: "Delete this line?",
        message: e.length > 200 ? e.slice(0, 200) + "…" : e,
        okText: "Delete",
        cancelText: "Cancel"
      }) || Qt(t);
    }
    function en(t) {
      K();
    }
    function tn(t) {
      K();
    }
    function bt(t, e) {
      be(e), K();
    }
    function nn(t, e, n) {
      n.preventDefault();
      const o = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), a = e.selectionStart, l = e.selectionEnd;
      e.value = e.value.slice(0, a) + o + e.value.slice(l), e.selectionStart = e.selectionEnd = a + o.length, t.text = e.value, bt(t, e);
    }
    function De(t) {
      return F.value.find((e) => e.code === t.speaker);
    }
    function on(t) {
      const e = De(t), n = zt(t.speaker);
      return e ? `Change "${e.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${t.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function an(t) {
      const e = Vt()[t] || [];
      return e.length ? `used by: ${e.join(", ")} -- ${e.length} role(s)` : "not used by any role yet";
    }
    function wt(t) {
      const e = $e.value.find((n) => (n.text || "").trim() === t.instruct.trim());
      return e && e.note ? e.note : null;
    }
    function St(t) {
      return [t.name, t.speaker, t.description].filter(Boolean).join(" -- ");
    }
    async function sn(t, e) {
      const n = De(t);
      if (!n) return;
      n.speaker = e, await Ht() && (c(`"${n.code}" now uses "${e}" for the whole play`), await qt(n.code));
    }
    function ln(t, e) {
      const n = t.getBoundingClientRect();
      U.left = Math.min(n.left, window.innerWidth - 280), U.top = n.bottom + 4, U.code = e, U.visible = !0;
    }
    function rn() {
      U.visible = !1;
    }
    const et = w(() => {
      const t = U.code;
      if (!t) return { message: "No speaker set on this line yet" };
      const e = F.value.find((o) => o.code === t);
      if (!e) return { message: `"${t}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(e).filter(([, o]) => o !== "" && o !== null && o !== void 0 && o !== e.__key);
      return n.length ? { fields: n } : { message: `"${t}" has no fields set in _roles.json` };
    });
    function cn(t, e) {
      return J.has(t) ? "Re-voicing..." : Ae(e) && !Te(t, e) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : Te(t, e) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function un(t, e) {
      if (!J.has(t)) {
        J.add(t), c("Re-voicing...");
        try {
          const n = await jt(mt(t.speaker), t.instruct, t.text);
          await i.revoiceApi.revoiceLine({
            linePosition: N.value.get(e),
            speaker: t.speaker,
            instruct: t.instruct,
            text: t.text,
            contentHash: n,
            file: _.value,
            folder: i.folder,
            baseName: z.value
          }), await ye();
          const o = N.value.get(e), a = Ft(o, n), l = ge.value.has(a);
          console.log("[FL revoice] after render:", {
            position: o,
            expectedFile: a,
            foundOnDisk: l,
            linesDir: Ee.value,
            filesInDir: [...ge.value]
          }), c(l ? "Line re-voiced" : `Re-voice finished but ${a} is not in ${Ee.value} -- see the console`);
        } catch (n) {
          c(`Re-voice failed: ${n.message || n}`);
        } finally {
          J.delete(t), Re();
        }
      }
    }
    function $t(t) {
      return b.value ? de.value === je.value.get(t) && H.value : q.value === t;
    }
    function tt(t, e) {
      return b.value ? je.value.get(t) !== void 0 : Ae(t);
    }
    function dn(t, e) {
      if (tt(e))
        if (b.value) {
          const n = je.value.get(e), o = _e.value;
          if (n === void 0 || !o || !D.value) return;
          o.currentTime = D.value.lines[n].start, o.play();
        } else q.value === e ? Pe() : ht(e);
    }
    const nt = w(() => b.value ? H.value : q.value !== -1), ot = w(() => b.value ? !!E.best : f.value.some((t, e) => !t.malformed && Ae(e))), fn = w(() => ot.value ? nt.value ? "Pause" : b.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
    function pn() {
      if (ot.value)
        if (b.value) {
          const t = _e.value;
          if (!t) return;
          H.value ? t.pause() : t.play();
        } else q.value !== -1 ? Pe() : ht(0);
    }
    async function W({ silent: t = !1 } = {}) {
      t || (E.checking = !0);
      try {
        const n = await (await fetch(`${At}?path=${encodeURIComponent(xe.value)}`)).json(), o = Array.isArray(n.files) ? n.files : [], a = n.file_mtimes || {}, l = z.value.toLowerCase(), p = o.filter((T) => {
          const j = T.lastIndexOf(".");
          return (j > 0 ? T.slice(0, j) : T).toLowerCase().startsWith(l);
        });
        p.sort();
        const h = p.length ? p[p.length - 1] : null, $ = h ? `${h}::${a[h] || ""}` : null;
        if (t && $ === ne) return;
        ne = $, E.checking = !1, E.error = null, E.best = h, E.mtime = h ? a[h] || Date.now() : null, h || (H.value = !1, se(Le));
      } catch (e) {
        E.checking = !1, E.error = String(e);
      }
    }
    const vn = w(() => !E.best);
    async function mn() {
      if (!(!E.best || !await Se({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${z.value}" (currently: ${E.best})${b.value ? " -- this also un-marks the script as done" : ""}.`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${ae}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: z.value, filename: _.value })
          })).json();
          if (n.error) {
            c(`Error: ${n.error}`);
            return;
          }
          c(`Deleted ${n.deleted.length} audio file(s)`), M.value = M.value.filter((o) => o !== _.value), ne = null, W();
        } catch (e) {
          c(`Error: ${e}`);
        }
    }
    function hn(t) {
      var e;
      (e = i.checkedApi) == null || e.setChecked(_.value, t);
    }
    const gn = w(() => !b.value && !Ze.value), yn = w(() => b.value ? "Marked ready to release -- click to unmark and go back to editing" : Ze.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function kn() {
      var n;
      const t = !b.value;
      if (t && !Ze.value) {
        c("Every line needs to be voiced before marking done");
        return;
      }
      if (t) {
        c("Stitching final file...");
        const o = f.value.filter((a) => !a.malformed);
        try {
          const l = await (await fetch(`${ae}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: i.folder,
              base_name: z.value,
              // Each position's own current hash -- lets stitch_lines
              // read the EXACT file that content hashes to, no
              // directory-scan guessing (see nodes/_line_audio.py's
              // expected_path).
              line_hashes: o.map((p) => Ye.get(p.__key)),
              line_texts: o.map((p) => p.text)
            })
          })).json();
          if (l.error) {
            c(`Stitch error: ${l.error}`);
            return;
          }
        } catch (a) {
          c(`Stitch failed: ${a}`);
          return;
        }
        M.value = [.../* @__PURE__ */ new Set([...M.value, _.value])], (n = i.checkedApi) == null || n.setChecked(_.value, !1), Ce.value = !1, c("Stitched and marked done"), ne = null, oe = null, W(), ke();
        return;
      }
      if (await Se({
        title: "Unmark done?",
        message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
        okText: "Unmark",
        cancelText: "Cancel"
      }))
        try {
          const a = await (await fetch(`${ae}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: z.value, filename: _.value })
          })).json();
          if (a.error) {
            c(`Error: ${a.error}`);
            return;
          }
          M.value = M.value.filter((l) => l !== _.value), c("Unmarked -- can be edited/re-voiced again"), ne = null, W();
        } catch (o) {
          c(`Error: ${o}`);
        }
    }
    function bn() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" && t.tagName !== "INPUT") {
        c("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const e = t.selectionStart;
      t.value = t.value.slice(0, e) + "́" + t.value.slice(e), t.selectionStart = t.selectionEnd = e + 1, t.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function wn() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" || !t.classList.contains("fl-textarea")) {
        c("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const e = t.closest(".fl-line-row"), n = e ? Number(e.dataset.rowIndex) : -1, o = n >= 0 ? f.value[n] : null;
      if (!o || o.malformed) {
        c("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const a = N.value.get(n), l = N.value.size, p = t.selectionStart, h = o.text.slice(0, p).trimEnd(), $ = o.text.slice(p).trimStart();
      o.text = h;
      const T = I({ speaker: o.speaker, instruct: o.instruct, text: $, raw: "", malformed: !1 });
      if (f.value.splice(n + 1, 0, T), yt(T.__key), K(), a !== void 0) {
        const j = a + 1, P = [];
        for (let Fe = l - 1; Fe >= j; Fe--) P.push([Fe, Fe + 1]);
        Qe({ moves: P });
      }
    }
    function Sn() {
      const t = I({ speaker: "", instruct: "", text: "", raw: "", malformed: !1 });
      f.value.push(t), yt(t.__key), K();
    }
    const X = w(() => ee.value.indexOf(_.value)), $n = w(() => !(X.value > 0)), Cn = w(() => !(X.value >= 0 && X.value < ee.value.length - 1));
    function In() {
      X.value > 0 && It(ee.value[X.value - 1]);
    }
    function _n() {
      X.value >= 0 && X.value < ee.value.length - 1 && It(ee.value[X.value + 1]);
    }
    async function xn() {
      try {
        const e = await (await fetch(Pn)).json();
        qe.value = e.presets || [];
      } catch {
        qe.value = [];
      }
    }
    async function Ct() {
      var t, e, n;
      try {
        const o = `${ae}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, l = await (await fetch(o)).json();
        $e.value = ((t = l.instructions) == null ? void 0 : t.entries) || [], F.value = ((e = l.roles) == null ? void 0 : e.entries) || [], le.value = ((n = l.roles) == null ? void 0 : n.path) || null, ee.value = Array.isArray(l.scripts) ? l.scripts : [], M.value = Array.isArray(l.ready_scripts) ? l.ready_scripts : [];
      } catch {
        $e.value = [], F.value = [], le.value = null, ee.value = [], M.value = [];
      }
    }
    async function It(t) {
      !t || t === _.value || Ge || (G && (clearTimeout(G), G = null, await Re()), _.value = t, ne = null, te.value = null, oe = null, f.value = [], re = null, Je = 0, Ce.value = i.checkedApi ? i.checkedApi.isChecked(t) : !1, c("Loading..."), await at(), W(), ke());
    }
    async function at({ isPoll: t = !1 } = {}) {
      try {
        const n = await (await fetch(`${Oe}/read?path=${encodeURIComponent(ft.value)}`)).json();
        if (n.error) {
          c(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          t || (f.value = [], re = "", c("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (t && Date.now() - Je < Lo || n.content === re) return;
        f.value = V(n.content), re = n.content, t || c(`Loaded ${f.value.length} line(s)`);
      } catch (e) {
        c(`Read failed: ${e}`);
      }
    }
    return Ne(D, () => se(Le)), Ne(B, Wt), Tn(() => {
      Ct(), xn(), W(), ye(), pe = setInterval(() => {
        W({ silent: !0 }), ye();
      }, lt), at().then(() => {
        fe = setInterval(() => at({ isPoll: !0 }), lt), ke(), ve = setInterval(() => ke({ silent: !0 }), lt);
      });
    }), jn(() => {
      Pe(), fe && clearInterval(fe), pe && clearInterval(pe), ve && clearInterval(ve);
    }), (t, e) => (g(), S(Z, null, [
      v(u(Lt), {
        visible: He.value,
        "onUpdate:visible": e[9] || (e[9] = (n) => He.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: we({ width: u(Mt) }),
        class: "line-editor-dialog"
      }, {
        header: C(() => [
          v(Bn, {
            title: _.value,
            status: dt.value,
            "width-presets": u(Ut),
            "set-width": u(Bt)
          }, {
            after: C(() => [
              d("div", ro, [
                v(u(A), {
                  label: "A−",
                  text: "",
                  size: "small",
                  title: "Decrease line text font size",
                  onClick: e[0] || (e[0] = (n) => {
                    B.value = Math.max(Do, B.value - 1), x(rt, B.value);
                  })
                }),
                v(u(A), {
                  label: "A+",
                  text: "",
                  size: "small",
                  title: "Increase line text font size",
                  onClick: e[1] || (e[1] = (n) => {
                    B.value = Math.min(Fo, B.value + 1), x(rt, B.value);
                  })
                })
              ])
            ]),
            _: 1
          }, 8, ["title", "status", "width-presets", "set-width"])
        ]),
        default: C(() => [
          v(oo, { class: "line-editor-controls" }, {
            default: C(() => [
              d("div", co, [
                d("span", {
                  class: Q(["play-btn global-play-btn", { "is-playing": nt.value, disabled: !ot.value }]),
                  title: fn.value,
                  onClick: pn
                }, L(nt.value ? "⏸" : "▶"), 11, uo),
                E.best ? (g(), S(Z, { key: 0 }, [
                  d("audio", {
                    ref_key: "audioElRef",
                    ref: _e,
                    controls: "",
                    class: "audio-el",
                    src: `${u(ae)}/audio?path=${encodeURIComponent(u(Y)(xe.value, E.best))}&v=${encodeURIComponent(E.mtime || "")}`,
                    onTimeupdate: Le,
                    onPlay: e[2] || (e[2] = (n) => H.value = !0),
                    onPause: e[3] || (e[3] = (n) => H.value = !1),
                    onEnded: e[4] || (e[4] = (n) => H.value = !1)
                  }, null, 40, fo),
                  v(u(A), {
                    label: "Delete audio",
                    text: "",
                    size: "small",
                    disabled: vn.value,
                    title: b.value ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                    onClick: mn,
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title"])
                ], 64)) : O("", !0),
                v(u(A), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: e[5] || (e[5] = (n) => W())
                })
              ]),
              Gt.value ? (g(), S("div", po, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : O("", !0),
              d("div", vo, [
                d("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: Ce.value,
                  disabled: !s.checkedApi || b.value,
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: e[6] || (e[6] = (n) => {
                    Ce.value = n.target.checked, hn(n.target.checked);
                  })
                }, null, 40, mo),
                v(u(A), {
                  label: b.value ? "Done ✓" : "Done",
                  size: "small",
                  outlined: !b.value,
                  disabled: gn.value,
                  title: yn.value,
                  onClick: kn
                }, null, 8, ["label", "outlined", "disabled", "title"]),
                e[10] || (e[10] = d("div", { class: "actions-divider" }, null, -1)),
                v(u(A), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: Be(bn, ["prevent"])
                }),
                v(u(A), {
                  label: "✂ Split line",
                  text: "",
                  size: "small",
                  title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
                  onMousedown: Be(wn, ["prevent"])
                }),
                v(u(A), {
                  label: "+ Add line",
                  text: "",
                  size: "small",
                  title: "Add a new empty line at the end of the script",
                  onClick: Sn
                }),
                e[11] || (e[11] = d("div", { class: "actions-divider" }, null, -1)),
                v(u(A), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: $n.value,
                  title: "Open the previous script in this act",
                  onClick: In
                }, null, 8, ["disabled"]),
                v(u(A), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: Cn.value,
                  title: "Open the next script in this act",
                  onClick: _n
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          d("div", {
            ref_key: "rowsContainerEl",
            ref: We,
            class: "rows-container"
          }, [
            (g(!0), S(Z, null, Et(f.value, (n, o) => (g(), S("div", {
              key: n.__key,
              class: Q(["fl-line-row", { "row-enter": Ie.value === n.__key, "row-playing": b.value ? je.value.get(o) === de.value : q.value === o }]),
              "data-row-index": o,
              ref_for: !0,
              ref: (a) => Xt(n.__key, a),
              style: we(n.malformed ? {} : { borderLeftColor: Nt(n.speaker) })
            }, [
              n.malformed ? (g(), S(Z, { key: 0 }, [
                d("div", go, [
                  e[12] || (e[12] = d("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  v(u(A), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (a) => kt(o, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                d("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: we({ fontSize: `${B.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (a) => {
                    gt(n.__key, a), se(() => be(a));
                  },
                  onInput: (a) => {
                    n.raw = a.target.value, be(a.target), K();
                  },
                  onKeydown: e[7] || (e[7] = Tt(Be(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, yo)
              ], 64)) : (g(), S(Z, { key: 1 }, [
                d("div", ko, [
                  d("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (a) => Zt(a, o)
                  }, "⠿", 512),
                  d("span", {
                    class: Q(["play-btn", { "is-playing": $t(o), disabled: !tt(o, n) }]),
                    title: tt(o, n) ? b.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                    onClick: (a) => dn(n, o)
                  }, L($t(o) ? "⏸" : "▶"), 11, bo),
                  v(u(ze), { class: "speaker-group" }, {
                    default: C(() => [
                      v(u(Ve), null, {
                        default: C(() => [...e[13] || (e[13] = [
                          d("i", { class: "pi pi-address-book" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      v(u(it), {
                        "model-value": n.speaker,
                        options: F.value,
                        "option-label": "code",
                        "option-value": "code",
                        editable: "",
                        filter: "",
                        placeholder: "Speaker",
                        title: "Speaker (role code, or a literal preset/preset#tag)",
                        "onUpdate:modelValue": (a) => {
                          n.speaker = a, en(n);
                        }
                      }, {
                        option: C(({ option: a }) => [
                          d("div", wo, L(a.code), 1),
                          St(a) ? (g(), S("div", So, L(St(a)), 1)) : O("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  v(u(ze), { class: "instruct-group" }, {
                    default: C(() => [
                      v(u(Ve), null, {
                        default: C(() => [...e[14] || (e[14] = [
                          d("i", { class: "pi pi-book" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      v(u(it), {
                        "model-value": n.instruct,
                        options: $e.value,
                        "option-label": "text",
                        "option-value": "text",
                        editable: "",
                        filter: "",
                        placeholder: "Instruct",
                        title: "Instruct text",
                        "onUpdate:modelValue": (a) => {
                          n.instruct = a, tn(n);
                        }
                      }, {
                        option: C(({ option: a }) => [
                          d("div", $o, L(a.text), 1),
                          a.note ? (g(), S("div", Co, L(a.note), 1)) : O("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  v(u(ze), { class: "speaker-file-group" }, {
                    default: C(() => {
                      var a;
                      return [
                        s.revoiceApi && !b.value ? (g(), Ue(u(A), {
                          key: 0,
                          class: Q(["revoice-btn", { pending: J.has(n), stale: !J.has(n) && Ae(o) && !Te(n, o) }]),
                          text: "",
                          size: "small",
                          icon: J.has(n) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                          disabled: J.has(n),
                          title: cn(n, o),
                          onClick: (l) => un(n, o)
                        }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : O("", !0),
                        v(u(it), {
                          "model-value": ((a = De(n)) == null ? void 0 : a.speaker) || "",
                          options: qe.value,
                          editable: "",
                          filter: "",
                          placeholder: "(no speaker)",
                          class: "speaker-file-dropdown",
                          disabled: !De(n),
                          title: on(n),
                          "onUpdate:modelValue": (l) => sn(n, l)
                        }, {
                          option: C(({ option: l }) => [
                            d("div", Io, L(l), 1),
                            d("div", _o, L(an(l)), 1)
                          ]),
                          _: 1
                        }, 8, ["model-value", "options", "disabled", "title", "onUpdate:modelValue"]),
                        v(u(Ve), {
                          class: "role-info-btn",
                          onMouseenter: (l) => ln(l.target, n.speaker),
                          onMouseleave: rn
                        }, {
                          default: C(() => [...e[15] || (e[15] = [
                            d("i", { class: "pi pi-info-circle" }, null, -1)
                          ])]),
                          _: 1
                        }, 8, ["onMouseenter"])
                      ];
                    }),
                    _: 2
                  }, 1024),
                  e[16] || (e[16] = d("div", { class: "spacer" }, null, -1)),
                  v(u(A), {
                    icon: "pi pi-times",
                    color: "red",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (a) => kt(o, n.text)
                  }, null, 8, ["onClick"])
                ]),
                wt(n) ? (g(), S("div", xo, "↳ " + L(wt(n)), 1)) : O("", !0),
                d("textarea", {
                  class: "fl-textarea",
                  style: we({ fontSize: `${B.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (a) => {
                    gt(n.__key, a), se(() => be(a));
                  },
                  onInput: (a) => {
                    n.text = a.target.value, bt(n, a.target);
                  },
                  onKeydown: e[8] || (e[8] = Tt(Be(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (a) => nn(n, a.target, a)
                }, null, 44, Eo)
              ], 64))
            ], 14, ho))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      v(u(Dt)),
      U.visible ? (g(), S("div", {
        key: 0,
        class: "role-info-popover",
        style: we({ left: `${U.left}px`, top: `${U.top}px` })
      }, [
        et.value.message ? (g(), S("div", Ao, L(et.value.message), 1)) : O("", !0),
        (g(!0), S(Z, null, Et(et.value.fields, ([n, o]) => (g(), S("div", {
          key: n,
          class: "role-info-row"
        }, [
          d("span", To, L(n), 1),
          d("span", jo, L(o), 1)
        ]))), 128))
      ], 4)) : O("", !0)
    ], 64));
  }
}, Oo = /* @__PURE__ */ Pt(No, [["__scopeId", "data-v-a1ef8a80"]]);
function zo({ folder: s, filename: i, suffix: m = "", checkedApi: x, revoiceApi: y }) {
  Fn(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const I = Nn(Oo, {
    folder: s,
    filename: i,
    suffix: m,
    checkedApi: x || null,
    revoiceApi: y || null,
    onClose: () => {
      I.unmount(), r.remove();
    }
  });
  I.use(On, { ripple: !0 }), I.use(zn), I.mount(r);
}
export {
  zo as openLineEditor
};
