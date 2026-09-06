import { z as xn, A as En, B as rt, s as ct, o as h, c as S, C as ie, m as ce, D as _t, b as Me, E as at, d as $, g as p, p as Q, f as d, F as Z, G as xt, k as N, t as L, h as A, _ as Pt, r as k, w as De, a as An, H as Tn, n as ke, u, l as Et, S as ae, I as jn, e as At, J as se, K as Fe, v as Y, L as Ne, q as w, M as Pn, N as Oe, i as Tt, O as Ln, Q as Rn, x as Dn, y as Fn, P as Nn } from "./styles_link.js";
import { s as Lt, u as On } from "./PanelWidthButtons.js";
import { s as st, D as Mn } from "./DialogHeader.js";
var ue = xn(), Rt = Symbol();
function Bn() {
  var s = En(Rt);
  if (!s)
    throw new Error("No PrimeVue Confirmation provided!");
  return s;
}
var Un = {
  install: function(i) {
    var m = {
      require: function(g) {
        ue.emit("confirm", g);
      },
      close: function() {
        ue.emit("close");
      }
    };
    i.config.globalProperties.$confirm = m, i.provide(Rt, m);
  }
}, zn = {
  root: "p-inputgroup"
}, Vn = rt.extend({
  name: "inputgroup",
  classes: zn
}), Hn = {
  name: "BaseInputGroup",
  extends: ct,
  style: Vn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Be = {
  name: "InputGroup",
  extends: Hn,
  inheritAttrs: !1
};
function qn(s, i, m, x, g, r) {
  return h(), S("div", ce({
    class: s.cx("root")
  }, s.ptmi("root")), [ie(s.$slots, "default")], 16);
}
Be.render = qn;
var Jn = {
  root: "p-inputgroup-addon"
}, Gn = rt.extend({
  name: "inputgroupaddon",
  classes: Jn
}), Kn = {
  name: "BaseInputGroupAddon",
  extends: ct,
  style: Gn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ue = {
  name: "InputGroupAddon",
  extends: Kn,
  inheritAttrs: !1
};
function Wn(s, i, m, x, g, r) {
  return h(), S("div", ce({
    class: s.cx("root")
  }, s.ptmi("root")), [ie(s.$slots, "default")], 16);
}
Ue.render = Wn;
var Xn = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var m = i.instance;
    return ["p-confirm-dialog-reject", m.confirmation && !m.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, Yn = rt.extend({
  name: "confirmdialog",
  classes: Xn
}), Zn = {
  name: "BaseConfirmDialog",
  extends: ct,
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
  style: Yn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Dt = {
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
function Qn(s, i, m, x, g, r) {
  var C = _t("CDButton"), V = _t("CDialog");
  return h(), Me(V, {
    visible: g.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(R) {
      return g.visible = R;
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
  }, at({
    default: $(function() {
      return [s.$slots.container ? N("", !0) : (h(), S(Z, {
        key: 0
      }, [s.$slots.message ? (h(), Me(xt(s.$slots.message), {
        key: 1,
        message: g.confirmation
      }, null, 8, ["message"])) : (h(), S(Z, {
        key: 0
      }, [ie(s.$slots, "icon", {}, function() {
        return [s.$slots.icon ? (h(), Me(xt(s.$slots.icon), {
          key: 0,
          class: Q(s.cx("icon"))
        }, null, 8, ["class"])) : g.confirmation.icon ? (h(), S("span", ce({
          key: 1,
          class: [g.confirmation.icon, s.cx("icon")]
        }, s.ptm("icon")), null, 16)) : N("", !0)];
      }), d("span", ce({
        class: s.cx("message")
      }, s.ptm("message")), L(r.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [s.$slots.container ? {
    name: "container",
    fn: $(function(R) {
      return [ie(s.$slots, "container", {
        message: g.confirmation,
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
    fn: $(function() {
      return [p(C, {
        label: r.rejectLabel,
        class: Q([s.cx("rejectButton"), g.confirmation.rejectClass]),
        onClick: i[0] || (i[0] = function(R) {
          return r.reject();
        }),
        autofocus: r.autoFocusReject,
        unstyled: s.unstyled,
        pt: s.ptm("rejectButton")
      }, at({
        _: 2
      }, [r.rejectIcon || s.$slots.rejecticon ? {
        name: "icon",
        fn: $(function(R) {
          return [ie(s.$slots, "rejecticon", {}, function() {
            return [d("span", ce({
              class: [r.rejectIcon, R.class]
            }, s.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), p(C, {
        label: r.acceptLabel,
        class: Q([s.cx("acceptButton"), g.confirmation.acceptClass]),
        onClick: i[1] || (i[1] = function(R) {
          return r.accept();
        }),
        autofocus: r.autoFocusAccept,
        unstyled: s.unstyled,
        pt: s.ptm("acceptButton")
      }, at({
        _: 2
      }, [r.acceptIcon || s.$slots.accepticon ? {
        name: "icon",
        fn: $(function(R) {
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
Dt.render = Qn;
const eo = { class: "sticky-panel" }, to = {
  __name: "StickyPanel",
  setup(s) {
    return (i, m) => (h(), S("div", eo, [
      ie(i.$slots, "default", {}, void 0, !0)
    ]));
  }
}, no = /* @__PURE__ */ Pt(to, [["__scopeId", "data-v-2941a6c7"]]);
async function jt(s, i, m) {
  const x = `${(s || "").trim()}|${(i || "").trim()}|${(m || "").trim()}`, g = new TextEncoder().encode(x), r = await crypto.subtle.digest("SHA-256", g);
  return [...new Uint8Array(r)].map((V) => V.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const oo = /^(\d+)_([0-9a-f]+)\.wav$/i;
function ao(s, i) {
  return `${String(s).padStart(4, "0")}_${i}.wav`;
}
function so(s) {
  const i = oo.exec(s);
  return i ? { position: Number(i[1]), hash: i[2].toLowerCase() } : null;
}
function io(s, i, m) {
  return s.has(ao(i, m));
}
function lo(s, i, m) {
  let x = null, g = -1 / 0;
  for (const r of s) {
    const C = so(r);
    if (!C || C.position !== m) continue;
    const V = (i == null ? void 0 : i[r]) ?? 0;
    (x === null || V > g) && (x = r, g = V);
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
}, Eo = ["value", "onInput", "onPaste"], Ao = { key: 0 }, To = { class: "role-info-key" }, jo = { class: "role-info-value" }, Po = 600, it = 3e3, Lo = 1500, Ro = 11.5, Do = 9, Fo = 22, lt = "FL_CosyVoice3.LineEditor.textFontSizePx", No = {
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
    function g(t) {
      const e = t.split("|");
      return e.length !== 3 ? null : { speaker: e[0].trim(), instruct: e[1].trim(), text: e[2].trim() };
    }
    let r = 1;
    function C(t) {
      return { ...t, __key: r++ };
    }
    function V(t) {
      return t.split(`
`).map((e) => e.replace(/\r$/, "")).filter((e) => e.trim()).map((e) => {
        const n = g(e);
        return C(n ? { ...n, raw: e, malformed: !1 } : { raw: e, malformed: !0 });
      });
    }
    function R(t) {
      return t.map((e) => e.malformed ? e.raw : `${e.speaker} | ${e.instruct} | ${e.text}`).join(`
`);
    }
    function Ft(t) {
      if (!t) return "rgba(255,255,255,0.15)";
      let e = 0;
      for (let n = 0; n < t.length; n++) e = e * 31 + t.charCodeAt(n) >>> 0;
      return `hsl(${e % 360}, 55%, 55%)`;
    }
    const Nt = Bn();
    function be({ title: t = "Confirm", message: e = "", okText: n = "OK", cancelText: o = "Cancel" } = {}) {
      return new Promise((a) => {
        Nt.require({
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
    const ze = k(!0), I = k(i.filename), f = k([]), we = k([]), F = k([]), le = k(null), Ve = k([]), O = k([]), ee = k([]), ut = k(""), { cssWidth: Ot, setWidth: Mt, presets: Bt } = On({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), M = k(m(lt, Ro)), te = k(null), de = k(-1), H = k(!1), q = k(-1), Se = k(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), E = Ne({ checking: !0, best: null, mtime: null, error: null }), B = Ne({ visible: !1, top: 0, left: 0, code: null }), $e = k(null), J = Ne(/* @__PURE__ */ new Set());
    let re = null, He = 0, ne = null, oe = null, G = null, fe = null, pe = null, ve = null, qe = !1, Je = null, me = null;
    const Ce = k(null), Ge = k(null), Ie = /* @__PURE__ */ new Map(), Ke = /* @__PURE__ */ new Map(), dt = w(() => Y(i.folder, I.value)), _e = w(() => Y(i.folder, "_audio")), U = w(() => Pn(I.value, i.suffix)), ft = w(() => Y(Y(_e.value, "lines"), U.value)), We = k(/* @__PURE__ */ new Set()), pt = k({});
    async function he() {
      try {
        const e = await (await fetch(`${At}?path=${encodeURIComponent(ft.value)}`)).json();
        We.value = new Set(Array.isArray(e.files) ? e.files : []), pt.value = e.file_mtimes || {};
      } catch {
      }
    }
    const z = w(() => {
      const t = /* @__PURE__ */ new Map();
      let e = 0;
      return f.value.forEach((n, o) => {
        n.malformed || (t.set(o, e), e++);
      }), t;
    });
    function vt(t) {
      const e = z.value.get(t);
      return e === void 0 ? null : lo(We.value, pt.value, e);
    }
    function mt(t) {
      const e = F.value.find((n) => n.code === t);
      return e && e.speaker ? e.speaker : t || "";
    }
    const Xe = Ne(/* @__PURE__ */ new Map());
    De(
      [f, F],
      async () => {
        const t = f.value.filter((n) => !n.malformed), e = await Promise.all(
          t.map((n) => jt(mt(n.speaker), n.instruct, n.text))
        );
        t.forEach((n, o) => Xe.set(n.__key, e[o]));
      },
      { deep: !0, immediate: !0 }
    );
    function xe(t) {
      return vt(t) !== null;
    }
    function Ee(t, e) {
      const n = z.value.get(e);
      if (n === void 0) return !1;
      const o = Xe.get(t.__key);
      return o !== void 0 && io(We.value, n, o);
    }
    const b = w(() => O.value.includes(I.value)), Ye = w(() => {
      const t = [];
      return f.value.forEach((e, n) => {
        e.malformed || t.push(n);
      }), t.length > 0 && t.every((e) => Ee(f.value[e], e));
    });
    function c(t) {
      ut.value = t;
    }
    function Ut(t) {
      if (!t) return "";
      const e = F.value.find((a) => a.code === t), n = e && e.speaker ? e.speaker : t, o = String(n).split("#", 1)[0].trim();
      return o ? `${o}.pt` : "";
    }
    function zt() {
      const t = {};
      return F.value.forEach((e) => {
        const n = String(e.speaker || "").split("#", 1)[0].trim();
        !n || !e.code || (t[n] = t[n] || []).push(e.code);
      }), t;
    }
    async function Vt() {
      if (!le.value)
        return c("No _roles.json found for this project -- can't save"), !1;
      try {
        const e = await (await fetch(`${Fe}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: le.value, content: JSON.stringify({ roles: F.value }, null, 2) })
        })).json();
        return e.error ? (c(`Error saving _roles.json: ${e.error}`), !1) : !0;
      } catch (t) {
        return c(`Error saving _roles.json: ${t}`), !1;
      }
    }
    async function Ht(t) {
      if (!le.value) return;
      const e = Ln(le.value), n = await Rn(e, t, i.suffix);
      c(n.message), n.changed.some((o) => o.file === I.value) && (await Ct(), ne = null, oe = null, W(), ge());
    }
    function qt(t, e) {
      if (!Array.isArray(t) || !t.length) return null;
      const n = [];
      return e.forEach((o, a) => {
        o.malformed || n.push(a);
      }), n.length !== t.length ? null : { lines: t, rowIndexMap: n };
    }
    const D = w(() => b.value ? qt(te.value, f.value) : null), Ae = w(() => {
      const t = /* @__PURE__ */ new Map();
      return D.value && D.value.rowIndexMap.forEach((e, n) => t.set(e, n)), t;
    }), Jt = w(() => !!(b.value && te.value && te.value.length && !D.value));
    function Te() {
      me && (me.pause(), me.src = "", me = null), q.value = -1;
    }
    function ht(t) {
      Te();
      const e = ft.value, n = (o) => {
        let a = null;
        for (; o < f.value.length && !(!f.value[o].malformed && (a = vt(o), a)); )
          o++;
        if (o >= f.value.length || !a) {
          q.value = -1;
          return;
        }
        q.value = o;
        const l = new Audio(`${ae}/audio?path=${encodeURIComponent(Y(e, a))}&v=${Date.now()}`);
        me = l, l.addEventListener("ended", () => n(o + 1)), l.play().catch((v) => c(`Playback failed: ${v}`));
      };
      n(t);
    }
    function je() {
      var o;
      const t = Ce.value;
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
        const a = D.value.rowIndexMap[n], l = a !== void 0 ? Ie.get((o = f.value[a]) == null ? void 0 : o.__key) : null;
        l == null || l.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function ge({ silent: t = !1 } = {}) {
      const e = Y(Y(_e.value, "timing"), `${U.value}.json`);
      try {
        const o = await (await fetch(`${Fe}/read?path=${encodeURIComponent(e)}`)).json();
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
        te.value = Array.isArray(l.lines) ? l.lines : null, a && he(), se(je);
      } catch {
      }
    }
    function Gt() {
      qe || (qe = !0, G && (clearTimeout(G), Pe()), fe && clearInterval(fe), pe && clearInterval(pe), ve && clearInterval(ve), i.onClose());
    }
    De(ze, (t) => {
      t || Gt();
    });
    function K() {
      He = Date.now(), G && clearTimeout(G), G = setTimeout(Pe, Po);
    }
    async function Pe() {
      const t = R(f.value);
      if (t !== re)
        try {
          const n = await (await fetch(`${Fe}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: dt.value, content: t })
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
    function ye(t) {
      t && (t.style.height = "auto", t.style.height = `${t.scrollHeight}px`);
    }
    function gt(t, e) {
      if (!e) {
        Ke.delete(t);
        return;
      }
      Ke.set(t, e.$el ?? e);
    }
    function Kt() {
      se(() => Ke.forEach(ye));
    }
    function Wt(t, e) {
      if (!e) {
        Ie.delete(t);
        return;
      }
      Ie.set(t, e);
    }
    async function yt(t) {
      var n;
      $e.value = t, await se();
      const e = Ie.get(t);
      e == null || e.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = e == null ? void 0 : e.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        $e.value === t && ($e.value = null);
      }, 500);
    }
    async function Ze({ deletes: t = [], moves: e = [] } = {}) {
      if (!(!t.length && !e.length))
        try {
          await fetch(`${ae}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: U.value, deletes: t, moves: e })
          }), await he();
        } catch {
        }
    }
    async function Xt(t, e) {
      const n = f.value[t], o = f.value[e];
      if (!n || !o || n.malformed || o.malformed) return;
      const a = Math.min(t, e), l = Math.max(t, e), v = f.value[a], y = f.value[l];
      if ((v.speaker || "").trim() !== (y.speaker || "").trim() && !await be({
        title: "Merge lines with different speakers?",
        message: `"${v.speaker}" and "${y.speaker}" are different speakers. Merge anyway? The combined line keeps "${v.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }))
        return;
      const _ = z.value.get(l), T = z.value.size;
      if (v.text = `${v.text} ${y.text}`.trim(), f.value.splice(l, 1), K(), _ !== void 0) {
        const j = [];
        for (let P = _ + 1; P < T; P++) j.push([P, P - 1]);
        Ze({ deletes: [_], moves: j });
      }
    }
    function Yt(t, e) {
      !t || t.__flDragAttached || (t.__flDragAttached = !0, t.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const o = t.closest(".fl-line-row");
        Je = Number(o == null ? void 0 : o.dataset.rowIndex), o == null || o.classList.add("fl-row-dragging");
        const a = (v) => {
          var T;
          (T = Ge.value) == null || T.querySelectorAll(".fl-row-drop-target").forEach((j) => j.classList.remove("fl-row-drop-target"));
          const y = document.elementFromPoint(v.clientX, v.clientY), _ = y && y.closest ? y.closest(".fl-line-row") : null;
          _ && _ !== o && _.classList.add("fl-row-drop-target");
        }, l = (v) => {
          var j;
          document.removeEventListener("pointermove", a), document.removeEventListener("pointerup", l), document.removeEventListener("pointercancel", l);
          const y = document.elementFromPoint(v.clientX, v.clientY), _ = y && y.closest ? y.closest(".fl-line-row") : null, T = Je;
          if (Je = null, o == null || o.classList.remove("fl-row-dragging"), (j = Ge.value) == null || j.querySelectorAll(".fl-row-drop-target").forEach((P) => P.classList.remove("fl-row-drop-target")), _ && _ !== o) {
            const P = Number(_.dataset.rowIndex);
            Number.isNaN(P) || Xt(T, P);
          }
        };
        document.addEventListener("pointermove", a), document.addEventListener("pointerup", l), document.addEventListener("pointercancel", l);
      }));
    }
    function Zt(t) {
      const e = z.value.get(t), n = z.value.size;
      if (f.value.splice(t, 1), K(), e !== void 0) {
        const o = [];
        for (let a = e + 1; a < n; a++) o.push([a, a - 1]);
        Ze({ deletes: [e], moves: o });
      }
    }
    async function kt(t, e) {
      e && e.trim() && !await be({
        title: "Delete this line?",
        message: e.length > 200 ? e.slice(0, 200) + "…" : e,
        okText: "Delete",
        cancelText: "Cancel"
      }) || Zt(t);
    }
    function Qt(t) {
      K();
    }
    function en(t) {
      K();
    }
    function bt(t, e) {
      ye(e), K();
    }
    function tn(t, e, n) {
      n.preventDefault();
      const o = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), a = e.selectionStart, l = e.selectionEnd;
      e.value = e.value.slice(0, a) + o + e.value.slice(l), e.selectionStart = e.selectionEnd = a + o.length, t.text = e.value, bt(t, e);
    }
    function Le(t) {
      return F.value.find((e) => e.code === t.speaker);
    }
    function nn(t) {
      const e = Le(t), n = Ut(t.speaker);
      return e ? `Change "${e.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${t.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function on(t) {
      const e = zt()[t] || [];
      return e.length ? `used by: ${e.join(", ")} -- ${e.length} role(s)` : "not used by any role yet";
    }
    function wt(t) {
      const e = we.value.find((n) => (n.text || "").trim() === t.instruct.trim());
      return e && e.note ? e.note : null;
    }
    function St(t) {
      return [t.name, t.speaker, t.description].filter(Boolean).join(" -- ");
    }
    async function an(t, e) {
      const n = Le(t);
      if (!n) return;
      n.speaker = e, await Vt() && (c(`"${n.code}" now uses "${e}" for the whole play`), await Ht(n.code));
    }
    function sn(t, e) {
      const n = t.getBoundingClientRect();
      B.left = Math.min(n.left, window.innerWidth - 280), B.top = n.bottom + 4, B.code = e, B.visible = !0;
    }
    function ln() {
      B.visible = !1;
    }
    const Qe = w(() => {
      const t = B.code;
      if (!t) return { message: "No speaker set on this line yet" };
      const e = F.value.find((o) => o.code === t);
      if (!e) return { message: `"${t}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(e).filter(([, o]) => o !== "" && o !== null && o !== void 0 && o !== e.__key);
      return n.length ? { fields: n } : { message: `"${t}" has no fields set in _roles.json` };
    });
    function rn(t, e) {
      return J.has(t) ? "Re-voicing..." : xe(e) && !Ee(t, e) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : Ee(t, e) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function cn(t, e) {
      if (!J.has(t)) {
        J.add(t), c("Re-voicing...");
        try {
          const n = await jt(mt(t.speaker), t.instruct, t.text);
          await i.revoiceApi.revoiceLine({
            linePosition: z.value.get(e),
            speaker: t.speaker,
            instruct: t.instruct,
            text: t.text,
            contentHash: n,
            file: I.value,
            folder: i.folder,
            baseName: U.value
          }), c("Line re-voiced"), await he();
        } catch (n) {
          c(`Re-voice failed: ${n.message || n}`);
        } finally {
          J.delete(t), Pe();
        }
      }
    }
    function $t(t) {
      return b.value ? de.value === Ae.value.get(t) && H.value : q.value === t;
    }
    function et(t, e) {
      return b.value ? Ae.value.get(t) !== void 0 : xe(t);
    }
    function un(t, e) {
      if (et(e))
        if (b.value) {
          const n = Ae.value.get(e), o = Ce.value;
          if (n === void 0 || !o || !D.value) return;
          o.currentTime = D.value.lines[n].start, o.play();
        } else q.value === e ? Te() : ht(e);
    }
    const tt = w(() => b.value ? H.value : q.value !== -1), nt = w(() => b.value ? !!E.best : f.value.some((t, e) => !t.malformed && xe(e))), dn = w(() => nt.value ? tt.value ? "Pause" : b.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
    function fn() {
      if (nt.value)
        if (b.value) {
          const t = Ce.value;
          if (!t) return;
          H.value ? t.pause() : t.play();
        } else q.value !== -1 ? Te() : ht(0);
    }
    async function W({ silent: t = !1 } = {}) {
      t || (E.checking = !0);
      try {
        const n = await (await fetch(`${At}?path=${encodeURIComponent(_e.value)}`)).json(), o = Array.isArray(n.files) ? n.files : [], a = n.file_mtimes || {}, l = U.value.toLowerCase(), v = o.filter((T) => {
          const j = T.lastIndexOf(".");
          return (j > 0 ? T.slice(0, j) : T).toLowerCase().startsWith(l);
        });
        v.sort();
        const y = v.length ? v[v.length - 1] : null, _ = y ? `${y}::${a[y] || ""}` : null;
        if (t && _ === ne) return;
        ne = _, E.checking = !1, E.error = null, E.best = y, E.mtime = y ? a[y] || Date.now() : null, y || (H.value = !1, se(je));
      } catch (e) {
        E.checking = !1, E.error = String(e);
      }
    }
    const pn = w(() => !E.best);
    async function vn() {
      if (!(!E.best || !await be({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${U.value}" (currently: ${E.best})${b.value ? " -- this also un-marks the script as done" : ""}.`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${ae}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: U.value, filename: I.value })
          })).json();
          if (n.error) {
            c(`Error: ${n.error}`);
            return;
          }
          c(`Deleted ${n.deleted.length} audio file(s)`), O.value = O.value.filter((o) => o !== I.value), ne = null, W();
        } catch (e) {
          c(`Error: ${e}`);
        }
    }
    function mn(t) {
      var e;
      (e = i.checkedApi) == null || e.setChecked(I.value, t);
    }
    const hn = w(() => !b.value && !Ye.value), gn = w(() => b.value ? "Marked ready to release -- click to unmark and go back to editing" : Ye.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function yn() {
      var n;
      const t = !b.value;
      if (t && !Ye.value) {
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
              base_name: U.value,
              // Each position's own current hash -- lets stitch_lines
              // read the EXACT file that content hashes to, no
              // directory-scan guessing (see nodes/_line_audio.py's
              // expected_path).
              line_hashes: o.map((v) => Xe.get(v.__key)),
              line_texts: o.map((v) => v.text)
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
        O.value = [.../* @__PURE__ */ new Set([...O.value, I.value])], (n = i.checkedApi) == null || n.setChecked(I.value, !1), Se.value = !1, c("Stitched and marked done"), ne = null, oe = null, W(), ge();
        return;
      }
      if (await be({
        title: "Unmark done?",
        message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
        okText: "Unmark",
        cancelText: "Cancel"
      }))
        try {
          const a = await (await fetch(`${ae}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: i.folder, base_name: U.value, filename: I.value })
          })).json();
          if (a.error) {
            c(`Error: ${a.error}`);
            return;
          }
          O.value = O.value.filter((l) => l !== I.value), c("Unmarked -- can be edited/re-voiced again"), ne = null, W();
        } catch (o) {
          c(`Error: ${o}`);
        }
    }
    function kn() {
      const t = document.activeElement;
      if (!t || t.tagName !== "TEXTAREA" && t.tagName !== "INPUT") {
        c("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const e = t.selectionStart;
      t.value = t.value.slice(0, e) + "́" + t.value.slice(e), t.selectionStart = t.selectionEnd = e + 1, t.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function bn() {
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
      const a = z.value.get(n), l = z.value.size, v = t.selectionStart, y = o.text.slice(0, v).trimEnd(), _ = o.text.slice(v).trimStart();
      o.text = y;
      const T = C({ speaker: o.speaker, instruct: o.instruct, text: _, raw: "", malformed: !1 });
      if (f.value.splice(n + 1, 0, T), yt(T.__key), K(), a !== void 0) {
        const j = a + 1, P = [];
        for (let Re = l - 1; Re >= j; Re--) P.push([Re, Re + 1]);
        Ze({ moves: P });
      }
    }
    function wn() {
      const t = C({ speaker: "", instruct: "", text: "", raw: "", malformed: !1 });
      f.value.push(t), yt(t.__key), K();
    }
    const X = w(() => ee.value.indexOf(I.value)), Sn = w(() => !(X.value > 0)), $n = w(() => !(X.value >= 0 && X.value < ee.value.length - 1));
    function Cn() {
      X.value > 0 && It(ee.value[X.value - 1]);
    }
    function In() {
      X.value >= 0 && X.value < ee.value.length - 1 && It(ee.value[X.value + 1]);
    }
    async function _n() {
      try {
        const e = await (await fetch(jn)).json();
        Ve.value = e.presets || [];
      } catch {
        Ve.value = [];
      }
    }
    async function Ct() {
      var t, e, n;
      try {
        const o = `${ae}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, l = await (await fetch(o)).json();
        we.value = ((t = l.instructions) == null ? void 0 : t.entries) || [], F.value = ((e = l.roles) == null ? void 0 : e.entries) || [], le.value = ((n = l.roles) == null ? void 0 : n.path) || null, ee.value = Array.isArray(l.scripts) ? l.scripts : [], O.value = Array.isArray(l.ready_scripts) ? l.ready_scripts : [];
      } catch {
        we.value = [], F.value = [], le.value = null, ee.value = [], O.value = [];
      }
    }
    async function It(t) {
      !t || t === I.value || qe || (G && (clearTimeout(G), G = null, await Pe()), I.value = t, ne = null, te.value = null, oe = null, f.value = [], re = null, He = 0, Se.value = i.checkedApi ? i.checkedApi.isChecked(t) : !1, c("Loading..."), await ot(), W(), ge());
    }
    async function ot({ isPoll: t = !1 } = {}) {
      try {
        const n = await (await fetch(`${Fe}/read?path=${encodeURIComponent(dt.value)}`)).json();
        if (n.error) {
          c(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          t || (f.value = [], re = "", c("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (t && Date.now() - He < Lo || n.content === re) return;
        f.value = V(n.content), re = n.content, t || c(`Loaded ${f.value.length} line(s)`);
      } catch (e) {
        c(`Read failed: ${e}`);
      }
    }
    return De(D, () => se(je)), De(M, Kt), An(() => {
      Ct(), _n(), W(), he(), pe = setInterval(() => {
        W({ silent: !0 }), he();
      }, it), ot().then(() => {
        fe = setInterval(() => ot({ isPoll: !0 }), it), ge(), ve = setInterval(() => ge({ silent: !0 }), it);
      });
    }), Tn(() => {
      Te(), fe && clearInterval(fe), pe && clearInterval(pe), ve && clearInterval(ve);
    }), (t, e) => (h(), S(Z, null, [
      p(u(Lt), {
        visible: ze.value,
        "onUpdate:visible": e[9] || (e[9] = (n) => ze.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: ke({ width: u(Ot) }),
        class: "line-editor-dialog"
      }, {
        header: $(() => [
          p(Mn, {
            title: I.value,
            status: ut.value,
            "width-presets": u(Bt),
            "set-width": u(Mt)
          }, {
            after: $(() => [
              d("div", ro, [
                p(u(A), {
                  label: "A−",
                  text: "",
                  size: "small",
                  title: "Decrease line text font size",
                  onClick: e[0] || (e[0] = (n) => {
                    M.value = Math.max(Do, M.value - 1), x(lt, M.value);
                  })
                }),
                p(u(A), {
                  label: "A+",
                  text: "",
                  size: "small",
                  title: "Increase line text font size",
                  onClick: e[1] || (e[1] = (n) => {
                    M.value = Math.min(Fo, M.value + 1), x(lt, M.value);
                  })
                })
              ])
            ]),
            _: 1
          }, 8, ["title", "status", "width-presets", "set-width"])
        ]),
        default: $(() => [
          p(no, { class: "line-editor-controls" }, {
            default: $(() => [
              d("div", co, [
                d("span", {
                  class: Q(["play-btn global-play-btn", { "is-playing": tt.value, disabled: !nt.value }]),
                  title: dn.value,
                  onClick: fn
                }, L(tt.value ? "⏸" : "▶"), 11, uo),
                E.best ? (h(), S(Z, { key: 0 }, [
                  d("audio", {
                    ref_key: "audioElRef",
                    ref: Ce,
                    controls: "",
                    class: "audio-el",
                    src: `${u(ae)}/audio?path=${encodeURIComponent(u(Y)(_e.value, E.best))}&v=${encodeURIComponent(E.mtime || "")}`,
                    onTimeupdate: je,
                    onPlay: e[2] || (e[2] = (n) => H.value = !0),
                    onPause: e[3] || (e[3] = (n) => H.value = !1),
                    onEnded: e[4] || (e[4] = (n) => H.value = !1)
                  }, null, 40, fo),
                  p(u(A), {
                    label: "Delete audio",
                    text: "",
                    size: "small",
                    disabled: pn.value,
                    title: b.value ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                    onClick: vn,
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title"])
                ], 64)) : N("", !0),
                p(u(A), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: e[5] || (e[5] = (n) => W())
                })
              ]),
              Jt.value ? (h(), S("div", po, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : N("", !0),
              d("div", vo, [
                d("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: Se.value,
                  disabled: !s.checkedApi || b.value,
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: e[6] || (e[6] = (n) => {
                    Se.value = n.target.checked, mn(n.target.checked);
                  })
                }, null, 40, mo),
                p(u(A), {
                  label: b.value ? "Done ✓" : "Done",
                  size: "small",
                  outlined: !b.value,
                  disabled: hn.value,
                  title: gn.value,
                  onClick: yn
                }, null, 8, ["label", "outlined", "disabled", "title"]),
                e[10] || (e[10] = d("div", { class: "actions-divider" }, null, -1)),
                p(u(A), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: Oe(kn, ["prevent"])
                }),
                p(u(A), {
                  label: "✂ Split line",
                  text: "",
                  size: "small",
                  title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
                  onMousedown: Oe(bn, ["prevent"])
                }),
                p(u(A), {
                  label: "+ Add line",
                  text: "",
                  size: "small",
                  title: "Add a new empty line at the end of the script",
                  onClick: wn
                }),
                e[11] || (e[11] = d("div", { class: "actions-divider" }, null, -1)),
                p(u(A), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: Sn.value,
                  title: "Open the previous script in this act",
                  onClick: Cn
                }, null, 8, ["disabled"]),
                p(u(A), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: $n.value,
                  title: "Open the next script in this act",
                  onClick: In
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          d("div", {
            ref_key: "rowsContainerEl",
            ref: Ge,
            class: "rows-container"
          }, [
            (h(!0), S(Z, null, Et(f.value, (n, o) => (h(), S("div", {
              key: n.__key,
              class: Q(["fl-line-row", { "row-enter": $e.value === n.__key, "row-playing": b.value ? Ae.value.get(o) === de.value : q.value === o }]),
              "data-row-index": o,
              ref_for: !0,
              ref: (a) => Wt(n.__key, a),
              style: ke(n.malformed ? {} : { borderLeftColor: Ft(n.speaker) })
            }, [
              n.malformed ? (h(), S(Z, { key: 0 }, [
                d("div", go, [
                  e[12] || (e[12] = d("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  p(u(A), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (a) => kt(o, n.raw)
                  }, null, 8, ["onClick"])
                ]),
                d("textarea", {
                  class: "fl-textarea malformed-textarea",
                  style: ke({ fontSize: `${M.value}px` }),
                  value: n.raw,
                  rows: "1",
                  ref_for: !0,
                  ref: (a) => {
                    gt(n.__key, a), se(() => ye(a));
                  },
                  onInput: (a) => {
                    n.raw = a.target.value, ye(a.target), K();
                  },
                  onKeydown: e[7] || (e[7] = Tt(Oe(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 44, yo)
              ], 64)) : (h(), S(Z, { key: 1 }, [
                d("div", ko, [
                  d("span", {
                    class: "drag-handle",
                    title: "Drag onto another line to merge them",
                    ref_for: !0,
                    ref: (a) => Yt(a, o)
                  }, "⠿", 512),
                  d("span", {
                    class: Q(["play-btn", { "is-playing": $t(o), disabled: !et(o, n) }]),
                    title: et(o, n) ? b.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                    onClick: (a) => un(n, o)
                  }, L($t(o) ? "⏸" : "▶"), 11, bo),
                  p(u(Be), { class: "speaker-group" }, {
                    default: $(() => [
                      p(u(Ue), null, {
                        default: $(() => [...e[13] || (e[13] = [
                          d("i", { class: "pi pi-address-book" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      p(u(st), {
                        "model-value": n.speaker,
                        options: F.value,
                        "option-label": "code",
                        "option-value": "code",
                        editable: "",
                        filter: "",
                        placeholder: "Speaker",
                        title: "Speaker (role code, or a literal preset/preset#tag)",
                        "onUpdate:modelValue": (a) => {
                          n.speaker = a, Qt(n);
                        }
                      }, {
                        option: $(({ option: a }) => [
                          d("div", wo, L(a.code), 1),
                          St(a) ? (h(), S("div", So, L(St(a)), 1)) : N("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  p(u(Be), { class: "instruct-group" }, {
                    default: $(() => [
                      p(u(Ue), null, {
                        default: $(() => [...e[14] || (e[14] = [
                          d("i", { class: "pi pi-book" }, null, -1)
                        ])]),
                        _: 1
                      }),
                      p(u(st), {
                        "model-value": n.instruct,
                        options: we.value,
                        "option-label": "text",
                        "option-value": "text",
                        editable: "",
                        filter: "",
                        placeholder: "Instruct",
                        title: "Instruct text",
                        "onUpdate:modelValue": (a) => {
                          n.instruct = a, en(n);
                        }
                      }, {
                        option: $(({ option: a }) => [
                          d("div", $o, L(a.text), 1),
                          a.note ? (h(), S("div", Co, L(a.note), 1)) : N("", !0)
                        ]),
                        _: 1
                      }, 8, ["model-value", "options", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1024),
                  p(u(Be), { class: "speaker-file-group" }, {
                    default: $(() => {
                      var a;
                      return [
                        s.revoiceApi && !b.value ? (h(), Me(u(A), {
                          key: 0,
                          class: Q(["revoice-btn", { pending: J.has(n), stale: !J.has(n) && xe(o) && !Ee(n, o) }]),
                          text: "",
                          size: "small",
                          icon: J.has(n) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                          disabled: J.has(n),
                          title: rn(n, o),
                          onClick: (l) => cn(n, o)
                        }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : N("", !0),
                        p(u(st), {
                          "model-value": ((a = Le(n)) == null ? void 0 : a.speaker) || "",
                          options: Ve.value,
                          editable: "",
                          filter: "",
                          placeholder: "(no speaker)",
                          class: "speaker-file-dropdown",
                          disabled: !Le(n),
                          title: nn(n),
                          "onUpdate:modelValue": (l) => an(n, l)
                        }, {
                          option: $(({ option: l }) => [
                            d("div", Io, L(l), 1),
                            d("div", _o, L(on(l)), 1)
                          ]),
                          _: 1
                        }, 8, ["model-value", "options", "disabled", "title", "onUpdate:modelValue"]),
                        p(u(Ue), {
                          class: "role-info-btn",
                          onMouseenter: (l) => sn(l.target, n.speaker),
                          onMouseleave: ln
                        }, {
                          default: $(() => [...e[15] || (e[15] = [
                            d("i", { class: "pi pi-info-circle" }, null, -1)
                          ])]),
                          _: 1
                        }, 8, ["onMouseenter"])
                      ];
                    }),
                    _: 2
                  }, 1024),
                  e[16] || (e[16] = d("div", { class: "spacer" }, null, -1)),
                  p(u(A), {
                    icon: "pi pi-times",
                    color: "red",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (a) => kt(o, n.text)
                  }, null, 8, ["onClick"])
                ]),
                wt(n) ? (h(), S("div", xo, "↳ " + L(wt(n)), 1)) : N("", !0),
                d("textarea", {
                  class: "fl-textarea",
                  style: ke({ fontSize: `${M.value}px` }),
                  value: n.text,
                  rows: "1",
                  ref_for: !0,
                  ref: (a) => {
                    gt(n.__key, a), se(() => ye(a));
                  },
                  onInput: (a) => {
                    n.text = a.target.value, bt(n, a.target);
                  },
                  onKeydown: e[8] || (e[8] = Tt(Oe(() => {
                  }, ["prevent"]), ["enter"])),
                  onPaste: (a) => tn(n, a.target, a)
                }, null, 44, Eo)
              ], 64))
            ], 14, ho))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      p(u(Dt)),
      B.visible ? (h(), S("div", {
        key: 0,
        class: "role-info-popover",
        style: ke({ left: `${B.left}px`, top: `${B.top}px` })
      }, [
        Qe.value.message ? (h(), S("div", Ao, L(Qe.value.message), 1)) : N("", !0),
        (h(!0), S(Z, null, Et(Qe.value.fields, ([n, o]) => (h(), S("div", {
          key: n,
          class: "role-info-row"
        }, [
          d("span", To, L(n), 1),
          d("span", jo, L(o), 1)
        ]))), 128))
      ], 4)) : N("", !0)
    ], 64));
  }
}, Oo = /* @__PURE__ */ Pt(No, [["__scopeId", "data-v-cdff0023"]]);
function zo({ folder: s, filename: i, suffix: m = "", checkedApi: x, revoiceApi: g }) {
  Dn(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const C = Fn(Oo, {
    folder: s,
    filename: i,
    suffix: m,
    checkedApi: x || null,
    revoiceApi: g || null,
    onClose: () => {
      C.unmount(), r.remove();
    }
  });
  C.use(Nn, { ripple: !0 }), C.use(Un), C.mount(r);
}
export {
  zo as openLineEditor
};
