import { v as Wn, x as Kn, y as Gn, z as Ft, b as R, c as ke, A as ut, a as A, C as Le, e as p, k as D, d as k, D as Te, i as N, F as ne, E as Ot, h as ye, t as Fe, s as P, G as Xn, _ as Yn, r as d, w as Ee, o as Qn, H as Zn, n as ft, u as o, S as Q, I as ea, B as Ut, J as De, K as ge, m as W, L as dt, l as h, M as ta, N as pt, j as na, f as aa, O as vt, Q as sa, R as ia, T as la, p as oa, q as ra, P as ca } from "./styles_link.js";
import { b as Bt, u as ua, a as fa, D as da } from "./DialogHeader.js";
import { s as Nt } from "./inputtext.esm.js";
import { s as pa } from "./dropdown.esm.js";
import { I as va, S as ma, _ as ha, l as mt, a as ga, s as ka, b as ya, c as zt, d as ba, u as Sa, i as Ca, e as wa, m as Ia, h as $a, f as Pa, g as Ra } from "./line_hash.js";
var ae = Wn(), Vt = Symbol();
function _a() {
  var i = Kn(Vt);
  if (!i)
    throw new Error("No PrimeVue Confirmation provided!");
  return i;
}
var xa = {
  install: function(l) {
    var S = {
      require: function(b) {
        ae.emit("confirm", b);
      },
      close: function() {
        ae.emit("close");
      }
    };
    l.config.globalProperties.$confirm = S, l.provide(Vt, S);
  }
}, Aa = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(l) {
    var S = l.instance;
    return ["p-confirm-dialog-reject", S.confirmation && !S.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, ja = Gn.extend({
  name: "confirmdialog",
  classes: Aa
}), La = {
  name: "BaseConfirmDialog",
  extends: Xn,
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
  style: ja,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ht = {
  name: "ConfirmDialog",
  extends: La,
  confirmListener: null,
  closeListener: null,
  data: function() {
    return {
      visible: !1,
      confirmation: null
    };
  },
  mounted: function() {
    var l = this;
    this.confirmListener = function(S) {
      S && S.group === l.group && (l.confirmation = S, l.confirmation.onShow && l.confirmation.onShow(), l.visible = !0);
    }, this.closeListener = function() {
      l.visible = !1, l.confirmation = null;
    }, ae.on("confirm", this.confirmListener), ae.on("close", this.closeListener);
  },
  beforeUnmount: function() {
    ae.off("confirm", this.confirmListener), ae.off("close", this.closeListener);
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
    getCXOptions: function(l, S) {
      return {
        contenxt: {
          icon: l,
          iconClass: S.class
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
    CDialog: Bt,
    CDButton: P
  }
};
function Ta(i, l, S, Z, b, v) {
  var F = Ft("CDButton"), Oe = Ft("CDialog");
  return R(), ke(Oe, {
    visible: b.visible,
    "onUpdate:visible": [l[2] || (l[2] = function(w) {
      return b.visible = w;
    }), v.onHide],
    role: "alertdialog",
    class: D(i.cx("root")),
    modal: !0,
    header: v.header,
    blockScroll: v.blockScroll,
    position: v.position,
    breakpoints: i.breakpoints,
    closeOnEscape: v.closeOnEscape,
    draggable: i.draggable,
    pt: i.pt,
    unstyled: i.unstyled
  }, ut({
    default: A(function() {
      return [i.$slots.container ? ye("", !0) : (R(), N(ne, {
        key: 0
      }, [i.$slots.message ? (R(), ke(Ot(i.$slots.message), {
        key: 1,
        message: b.confirmation
      }, null, 8, ["message"])) : (R(), N(ne, {
        key: 0
      }, [Le(i.$slots, "icon", {}, function() {
        return [i.$slots.icon ? (R(), ke(Ot(i.$slots.icon), {
          key: 0,
          class: D(i.cx("icon"))
        }, null, 8, ["class"])) : b.confirmation.icon ? (R(), N("span", Te({
          key: 1,
          class: [b.confirmation.icon, i.cx("icon")]
        }, i.ptm("icon")), null, 16)) : ye("", !0)];
      }), k("span", Te({
        class: i.cx("message")
      }, i.ptm("message")), Fe(v.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [i.$slots.container ? {
    name: "container",
    fn: A(function(w) {
      return [Le(i.$slots, "container", {
        message: b.confirmation,
        onClose: w.onClose,
        onAccept: v.accept,
        onReject: v.reject,
        closeCallback: w.onclose,
        acceptCallback: v.accept,
        rejectCallback: v.reject
      })];
    }),
    key: "0"
  } : void 0, i.$slots.container ? void 0 : {
    name: "footer",
    fn: A(function() {
      return [p(F, {
        label: v.rejectLabel,
        class: D([i.cx("rejectButton"), b.confirmation.rejectClass]),
        onClick: l[0] || (l[0] = function(w) {
          return v.reject();
        }),
        autofocus: v.autoFocusReject,
        unstyled: i.unstyled,
        pt: i.ptm("rejectButton")
      }, ut({
        _: 2
      }, [v.rejectIcon || i.$slots.rejecticon ? {
        name: "icon",
        fn: A(function(w) {
          return [Le(i.$slots, "rejecticon", {}, function() {
            return [k("span", Te({
              class: [v.rejectIcon, w.class]
            }, i.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), p(F, {
        label: v.acceptLabel,
        class: D([i.cx("acceptButton"), b.confirmation.acceptClass]),
        onClick: l[1] || (l[1] = function(w) {
          return v.accept();
        }),
        autofocus: v.autoFocusAccept,
        unstyled: i.unstyled,
        pt: i.ptm("acceptButton")
      }, ut({
        _: 2
      }, [v.acceptIcon || i.$slots.accepticon ? {
        name: "icon",
        fn: A(function(w) {
          return [Le(i.$slots, "accepticon", {}, function() {
            return [k("span", Te({
              class: [v.acceptIcon, w.class]
            }, i.ptm("acceptButton").icon, {
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
Ht.render = Ta;
const Ea = { class: "audio-content-row" }, Da = ["title"], Fa = ["src"], Oa = {
  key: 0,
  class: "timing-warning"
}, Ua = { class: "actions-row" }, Na = ["checked", "disabled"], za = ["data-row-index"], Ma = { class: "line-number" }, Ba = { class: "line-body" }, Va = { class: "malformed-warn-line" }, Ha = ["title", "onClick"], Mt = 600, ht = 3e3, qa = 1500, Ja = 150, Wa = {
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
  setup(i) {
    const l = i;
    function S(e) {
      const t = e.split("|");
      return t.length !== 3 && t.length !== 4 ? null : {
        speaker: t[0].trim(),
        instruct: t[1].trim(),
        text: t[2].trim(),
        pause: t.length === 4 ? t[3].trim() : ""
      };
    }
    let Z = 1;
    function b(e) {
      return { ...e, __key: Z++ };
    }
    function v(e) {
      return e.split(`
`).map((t) => t.replace(/\r$/, "")).filter((t) => t.trim()).map((t) => {
        const n = S(t);
        return b(n ? { ...n, raw: t, malformed: !1 } : { raw: t, malformed: !0 });
      });
    }
    function F(e) {
      return e.map((t) => {
        if (t.malformed) return t.raw;
        const n = `${t.speaker} | ${t.instruct} | ${t.text}`;
        return t.pause ? `${n} | ${t.pause}` : n;
      }).join(`
`);
    }
    const Oe = _a();
    function w({ title: e = "Confirm", message: t = "", okText: n = "OK", cancelText: a = "Cancel" } = {}) {
      return new Promise((s) => {
        Oe.require({
          header: e,
          message: t,
          acceptLabel: n,
          rejectLabel: a,
          accept: () => s(!0),
          reject: () => s(!1),
          onHide: () => s(!1)
        });
      });
    }
    const Ue = d(!0), C = d(l.filename), u = d([]), se = d([]), Ne = d(null), L = d([]), ee = d(null), { popover: ze, show: qt, hide: Jt, info: gt } = wa(
      L,
      (e) => Object.entries(e).filter(([, t]) => t !== "" && t !== null && t !== void 0 && t !== e.__key)
    ), Me = d([]), Be = d(""), O = d([]), K = d([]), kt = d(""), { cssWidth: Wt, setWidth: Kt, presets: Gt } = ua({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), { fontSizePx: Ve, decrease: Xt, increase: Yt } = fa({
      storageKey: "FL_CosyVoice3.LineEditor.textFontSizePx",
      defaultSize: 11.5
    }), G = d(null), ie = d(-1), z = d(!1), M = d(-1), be = d(l.checkedApi ? l.checkedApi.isChecked(l.filename) : !1), I = dt({ checking: !0, best: null, mtime: null, error: null }), Se = d(null), B = dt(/* @__PURE__ */ new Set());
    let te = null, He = 0, X = null, Y = null, V = null, le = null, oe = null, re = null, qe = !1, Je = null, ce = null;
    const Ce = d(null), We = d(null), ue = /* @__PURE__ */ new Map(), { autoGrow: Qt, setTextareaRef: yt, regrowAll: Zt } = Sa(), bt = h(() => W(l.folder, C.value)), we = h(() => W(l.folder, "_audio")), U = h(() => ta(C.value, l.suffix)), Ie = h(() => W(W(we.value, "lines"), U.value)), fe = d(/* @__PURE__ */ new Set()), St = d({});
    async function de() {
      try {
        const t = await (await fetch(`${Ut}?path=${encodeURIComponent(Ie.value)}`)).json();
        fe.value = new Set(Array.isArray(t.files) ? t.files : []), St.value = t.file_mtimes || {};
      } catch {
      }
    }
    const T = h(() => {
      const e = /* @__PURE__ */ new Map();
      let t = 0;
      return u.value.forEach((n, a) => {
        n.malformed || (e.set(a, t), t++);
      }), e;
    });
    function Ct(e) {
      const t = T.value.get(e);
      return t === void 0 ? null : Ra(fe.value, St.value, t);
    }
    function Ke(e) {
      const t = L.value.find((n) => n.code === e);
      return t && t.speaker ? t.speaker : e || "";
    }
    const $e = dt(/* @__PURE__ */ new Map()), Ge = /* @__PURE__ */ new Map();
    function H(e) {
      e.malformed || (clearTimeout(Ge.get(e.__key)), Ge.set(e.__key, setTimeout(async () => {
        Ge.delete(e.__key), $e.set(e.__key, await mt(Ke(e.speaker), e.instruct, e.text));
      }, Ja)));
    }
    async function Xe() {
      const e = u.value.filter((n) => !n.malformed), t = await Promise.all(
        e.map((n) => mt(Ke(n.speaker), n.instruct, n.text))
      );
      e.forEach((n, a) => $e.set(n.__key, t[a]));
    }
    Ee(L, Xe);
    function pe(e) {
      return Ct(e) !== null;
    }
    function ve(e, t) {
      const n = T.value.get(t);
      if (n === void 0) return !1;
      const a = $e.get(e.__key);
      return a !== void 0 && $a(fe.value, n, a);
    }
    const g = h(() => O.value.includes(C.value)), Ye = h(() => {
      const e = [];
      return u.value.forEach((t, n) => {
        t.malformed || e.push(n);
      }), e.length > 0 && e.every((t) => ve(u.value[t], t));
    });
    function f(e) {
      kt.value = e;
    }
    function en(e) {
      if (!e) return "";
      const t = L.value.find((s) => s.code === e), n = t && t.speaker ? t.speaker : e, a = String(n).split("#", 1)[0].trim();
      return a ? `${a}.pt` : "";
    }
    function tn() {
      const e = {};
      return L.value.forEach((t) => {
        const n = String(t.speaker || "").split("#", 1)[0].trim();
        !n || !t.code || (e[n] = e[n] || []).push(t.code);
      }), e;
    }
    async function nn() {
      if (!ee.value)
        return f("No _roles.json found for this project -- can't save"), !1;
      try {
        const t = await (await fetch(`${ge}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: ee.value, content: JSON.stringify({ roles: L.value }, null, 2) })
        })).json();
        return t.error ? (f(`Error saving _roles.json: ${t.error}`), !1) : !0;
      } catch (e) {
        return f(`Error saving _roles.json: ${e}`), !1;
      }
    }
    async function an(e) {
      if (!ee.value) return;
      const t = ia(ee.value), n = await la(t, e, l.suffix);
      f(n.message), n.changed.some((a) => a.file === C.value) && (await Et(), X = null, Y = null, q(), me());
    }
    function sn(e, t) {
      if (!Array.isArray(e) || !e.length) return null;
      const n = [];
      return t.forEach((a, s) => {
        a.malformed || n.push(s);
      }), n.length !== e.length ? null : { lines: e, rowIndexMap: n };
    }
    const j = h(() => g.value ? sn(G.value, u.value) : null), Pe = h(() => {
      const e = /* @__PURE__ */ new Map();
      return j.value && j.value.rowIndexMap.forEach((t, n) => e.set(t, n)), e;
    }), ln = h(() => !!(g.value && G.value && G.value.length && !j.value));
    function Re() {
      ce && (ce.pause(), ce.src = "", ce = null), M.value = -1;
    }
    function wt(e) {
      Re();
      const t = Ie.value, n = (a) => {
        var r, m;
        let s = null;
        for (; a < u.value.length && !(!u.value[a].malformed && (s = Ct(a), s)); )
          a++;
        if (a >= u.value.length || !s) {
          M.value = -1;
          return;
        }
        M.value = a, (m = ue.get((r = u.value[a]) == null ? void 0 : r.__key)) == null || m.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const c = new Audio(`${Q}/audio?path=${encodeURIComponent(W(t, s))}&v=${Date.now()}`);
        ce = c, c.addEventListener("ended", () => n(a + 1)), c.play().catch((y) => f(`Playback failed: ${y}`));
      };
      n(e);
    }
    function _e() {
      var a;
      const e = Ce.value;
      if (!j.value || !e) {
        ie.value = -1;
        return;
      }
      const t = e.currentTime;
      let n = -1;
      for (let s = 0; s < j.value.lines.length; s++)
        if (t >= j.value.lines[s].start && t < j.value.lines[s].end) {
          n = s;
          break;
        }
      if (n !== ie.value && (ie.value = n, n >= 0 && z.value)) {
        const s = j.value.rowIndexMap[n], c = s !== void 0 ? ue.get((a = u.value[s]) == null ? void 0 : a.__key) : null;
        c == null || c.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function me({ silent: e = !1 } = {}) {
      const t = W(W(we.value, "timing"), `${U.value}.json`);
      try {
        const a = await (await fetch(`${ge}/read?path=${encodeURIComponent(t)}`)).json();
        if (!a.exists) {
          G.value = null, Y = null;
          return;
        }
        if (e && a.mtime === Y) return;
        const s = a.mtime !== Y;
        Y = a.mtime;
        let c;
        try {
          c = JSON.parse(a.content);
        } catch {
          G.value = null;
          return;
        }
        G.value = Array.isArray(c.lines) ? c.lines : null, s && de(), De(_e);
      } catch {
      }
    }
    function on() {
      qe || (qe = !0, V && (clearTimeout(V), xe()), le && clearInterval(le), oe && clearInterval(oe), re && clearInterval(re), l.onClose());
    }
    Ee(Ue, (e) => {
      e || on();
    });
    function E() {
      He = Date.now(), V && clearTimeout(V), V = setTimeout(xe, Mt);
    }
    async function xe() {
      const e = F(u.value);
      if (e !== te)
        try {
          const n = await (await fetch(`${ge}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: bt.value, content: e })
          })).json();
          if (n.error) {
            f(`Save error: ${n.error}`);
            return;
          }
          te = e, f(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (t) {
          f(`Save failed: ${t}`);
        }
    }
    function rn(e, t) {
      if (!t) {
        ue.delete(e);
        return;
      }
      ue.set(e, t);
    }
    async function It(e) {
      var n;
      Se.value = e, await De();
      const t = ue.get(e);
      t == null || t.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = t == null ? void 0 : t.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        Se.value === e && (Se.value = null);
      }, 500);
    }
    async function Qe({ deletes: e = [], moves: t = [] } = {}) {
      if (!(!e.length && !t.length))
        try {
          await fetch(`${Q}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: l.folder, base_name: U.value, deletes: e, moves: t })
          }), await de();
        } catch {
        }
    }
    async function cn(e, t) {
      const n = u.value[e], a = u.value[t];
      if (!n || !a || n.malformed || a.malformed) return;
      const s = Math.min(e, t), c = Math.max(e, t), r = u.value[s], m = u.value[c];
      if ((r.speaker || "").trim() !== (m.speaker || "").trim() && !await w({
        title: "Merge lines with different speakers?",
        message: `"${r.speaker}" and "${m.speaker}" are different speakers. Merge anyway? The combined line keeps "${r.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }))
        return;
      const y = T.value.get(c), $ = T.value.size;
      if (r.text = `${r.text} ${m.text}`.trim(), r.pause = m.pause || "", u.value.splice(c, 1), H(r), E(), y !== void 0) {
        const _ = [];
        for (let x = y + 1; x < $; x++) _.push([x, x - 1]);
        Qe({ deletes: [y], moves: _ });
      }
    }
    function un(e, t) {
      !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const a = e.closest(".fl-line-row");
        Je = Number(a == null ? void 0 : a.dataset.rowIndex), a == null || a.classList.add("fl-row-dragging");
        const s = (r) => {
          var $;
          ($ = We.value) == null || $.querySelectorAll(".fl-row-drop-target").forEach((_) => _.classList.remove("fl-row-drop-target"));
          const m = document.elementFromPoint(r.clientX, r.clientY), y = m && m.closest ? m.closest(".fl-line-row") : null;
          y && y !== a && y.classList.add("fl-row-drop-target");
        }, c = (r) => {
          var _;
          document.removeEventListener("pointermove", s), document.removeEventListener("pointerup", c), document.removeEventListener("pointercancel", c);
          const m = document.elementFromPoint(r.clientX, r.clientY), y = m && m.closest ? m.closest(".fl-line-row") : null, $ = Je;
          if (Je = null, a == null || a.classList.remove("fl-row-dragging"), (_ = We.value) == null || _.querySelectorAll(".fl-row-drop-target").forEach((x) => x.classList.remove("fl-row-drop-target")), y && y !== a) {
            const x = Number(y.dataset.rowIndex);
            Number.isNaN(x) || cn($, x);
          }
        };
        document.addEventListener("pointermove", s), document.addEventListener("pointerup", c), document.addEventListener("pointercancel", c);
      }));
    }
    function fn(e) {
      const t = T.value.get(e), n = T.value.size;
      if (u.value.splice(e, 1), E(), t !== void 0) {
        const a = [];
        for (let s = t + 1; s < n; s++) a.push([s, s - 1]);
        Qe({ deletes: [t], moves: a });
      }
    }
    async function $t(e, t) {
      t && t.trim() && !await w({
        title: "Delete this line?",
        message: t.length > 200 ? t.slice(0, 200) + "…" : t,
        okText: "Delete",
        cancelText: "Cancel"
      }) || fn(e);
    }
    function dn(e) {
      H(e), E();
    }
    const Ze = /* @__PURE__ */ new Map();
    function pn(e) {
      clearTimeout(Ze.get(e.__key)), Ze.set(e.__key, setTimeout(async () => {
        Ze.delete(e.__key);
        const t = await Pa(ge, Ne.value, e.instruct);
        t && (se.value = t);
      }, Mt));
    }
    function et(e) {
      H(e), E(), pn(e);
    }
    const Pt = h(() => {
      let e = -1;
      return u.value.forEach((t, n) => {
        t.malformed || (e = n);
      }), e;
    });
    function tt(e) {
      return e === Pt.value ? 0 : sa;
    }
    function Rt(e) {
      return !!e.pause && vt(e.pause) === null;
    }
    function vn(e, t) {
      const n = vt(e.pause);
      return e.pause && n === null ? `"${e.pause}" isn't a pause this can read -- expected seconds between 0 and 10 (e.g. 1.5). Falling back to ${tt(t)}s.` : n !== null ? n === 0 ? "No pause after this line -- the next one comes in on top of it (an interruption)" : `Hold ${n}s of silence after this line` : `Pause after this line, in seconds. Empty = ${tt(t)}s` + (t === Pt.value ? " (nothing held after the last line)" : " (the default between lines)");
    }
    function nt(e) {
      const t = (e.speaker || "").trim();
      return t ? u.value.filter((n) => n !== e && !n.malformed && (n.speaker || "").trim() === t).length : 0;
    }
    function mn(e) {
      const t = nt(e);
      return t > 0 ? `Apply this instruct to every other "${e.speaker.trim()}" line in this script (${t})` : "No other lines in this script use this speaker";
    }
    function hn(e) {
      const t = nt(e);
      if (!t) return;
      const n = e.speaker.trim();
      u.value.forEach((a) => {
        a !== e && !a.malformed && (a.speaker || "").trim() === n && (a.instruct = e.instruct, H(a));
      }), E(), f(`Applied instruct to ${t} other "${n}" line(s) in this script`);
    }
    function he(e) {
      return L.value.find((t) => t.code === e.speaker);
    }
    function gn(e) {
      const t = he(e), n = en(e.speaker);
      return t ? `Change "${t.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${e.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function kn(e) {
      const t = tn()[e] || [];
      return t.length ? `used by: ${t.join(", ")} -- ${t.length} role(s)` : "not used by any role yet";
    }
    function yn(e) {
      const t = e.instruct.trim(), n = se.value.find((a) => (a.examples || []).some((s) => s.trim() === t));
      return n ? n.title : null;
    }
    const at = d(!1), _t = d(null);
    function bn(e) {
      _t.value = e, at.value = !0;
    }
    function Sn(e) {
      const t = _t.value;
      t && (t.__prevInstruct = t.instruct, t.instruct = e, et(t));
    }
    function Cn(e) {
      return e.__prevInstruct !== void 0 ? `Restore previous instruct: "${e.__prevInstruct}"` : "No previous instruct to restore";
    }
    function wn(e) {
      if (e.__prevInstruct === void 0) return;
      const t = e.instruct;
      e.instruct = e.__prevInstruct, e.__prevInstruct = t, et(e);
    }
    function In(e) {
      return [e.name, e.speaker, e.description].filter(Boolean).join(" -- ");
    }
    async function xt(e, t) {
      const n = he(e);
      if (!n) return;
      n.speaker = t, Xe(), await nn() && (f(`"${n.code}" now uses "${t}" for the whole play`), await an(n.code));
    }
    const st = d(!1), At = d(null);
    function $n(e) {
      At.value = e, st.value = !0;
    }
    async function Pn(e) {
      const t = At.value;
      t && await xt(t, e);
    }
    function Rn(e, t) {
      return B.has(e) ? "Re-voicing..." : pe(t) && !ve(e, t) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : ve(e, t) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function jt(e, t) {
      if (!B.has(e)) {
        B.add(e), f("Re-voicing...");
        try {
          const n = await mt(Ke(e.speaker), e.instruct, e.text);
          await l.revoiceApi.revoiceLine({
            linePosition: T.value.get(t),
            speaker: e.speaker,
            instruct: e.instruct,
            text: e.text,
            contentHash: n,
            file: C.value,
            folder: l.folder,
            baseName: U.value
          }), await de();
          const a = T.value.get(t), s = Ia(a, n), c = fe.value.has(s);
          console.log("[FL revoice] after render:", {
            position: a,
            expectedFile: s,
            foundOnDisk: c,
            linesDir: Ie.value,
            filesInDir: [...fe.value]
          }), f(c ? "Line re-voiced" : `Re-voice finished but ${s} is not in ${Ie.value} -- see the console`);
        } catch (n) {
          f(`Re-voice failed: ${n.message || n}`);
        } finally {
          B.delete(e), xe();
        }
      }
    }
    function Lt(e, t) {
      return !e.malformed && pe(t) && !ve(e, t);
    }
    const Ae = d(!1), it = h(() => u.value.filter((e, t) => Lt(e, t)).length), _n = h(() => it.value > 0 ? `Re-voice ${it.value} line(s) whose text/speaker/instruct changed since they were last rendered (the gold 🔁 rows), one at a time` : "No line in this script needs re-voicing right now");
    async function xn() {
      if (Ae.value) return;
      const e = u.value.filter((t, n) => Lt(t, n));
      if (e.length) {
        Ae.value = !0;
        try {
          for (const t of e) {
            const n = u.value.indexOf(t);
            n !== -1 && await jt(t, n);
          }
          f(`Re-voiced ${e.length} line(s)`);
        } finally {
          Ae.value = !1;
        }
      }
    }
    function Tt(e) {
      return g.value ? ie.value === Pe.value.get(e) && z.value : M.value === e;
    }
    function lt(e, t) {
      return g.value ? Pe.value.get(e) !== void 0 : pe(e);
    }
    function An(e, t) {
      if (lt(t))
        if (g.value) {
          const n = Pe.value.get(t), a = Ce.value;
          if (n === void 0 || !a || !j.value) return;
          a.currentTime = j.value.lines[n].start, a.play();
        } else M.value === t ? Re() : wt(t);
    }
    const ot = h(() => g.value ? z.value : M.value !== -1), rt = h(() => g.value ? !!I.best : u.value.some((e, t) => !e.malformed && pe(t))), jn = h(() => rt.value ? ot.value ? "Pause" : g.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
    function Ln() {
      if (rt.value)
        if (g.value) {
          const e = Ce.value;
          if (!e) return;
          z.value ? e.pause() : e.play();
        } else M.value !== -1 ? Re() : wt(0);
    }
    async function q({ silent: e = !1 } = {}) {
      e || (I.checking = !0);
      try {
        const n = await (await fetch(`${Ut}?path=${encodeURIComponent(we.value)}`)).json(), a = Array.isArray(n.files) ? n.files : [], s = n.file_mtimes || {}, c = U.value.toLowerCase(), r = a.filter(($) => {
          const _ = $.lastIndexOf(".");
          return (_ > 0 ? $.slice(0, _) : $).toLowerCase().startsWith(c);
        });
        r.sort();
        const m = r.length ? r[r.length - 1] : null, y = m ? `${m}::${s[m] || ""}` : null;
        if (e && y === X) return;
        X = y, I.checking = !1, I.error = null, I.best = m, I.mtime = m ? s[m] || Date.now() : null, m || (z.value = !1, De(_e));
      } catch (t) {
        I.checking = !1, I.error = String(t);
      }
    }
    const Tn = h(() => !I.best);
    async function En() {
      if (!(!I.best || !await w({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${U.value}" (currently: ${I.best})${g.value ? " -- this also un-marks the script as done" : ""}.`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${Q}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: l.folder, base_name: U.value, filename: C.value })
          })).json();
          if (n.error) {
            f(`Error: ${n.error}`);
            return;
          }
          f(`Deleted ${n.deleted.length} audio file(s)`), O.value = O.value.filter((a) => a !== C.value), X = null, q();
        } catch (t) {
          f(`Error: ${t}`);
        }
    }
    function Dn(e) {
      var t;
      (t = l.checkedApi) == null || t.setChecked(C.value, e);
    }
    const Fn = h(() => !g.value && !Ye.value), On = h(() => g.value ? "Marked ready to release -- click to unmark and go back to editing" : Ye.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function Un() {
      var n;
      const e = !g.value;
      if (e && !Ye.value) {
        f("Every line needs to be voiced before marking done");
        return;
      }
      if (e) {
        f("Stitching final file...");
        const a = u.value.filter((s) => !s.malformed);
        try {
          const c = await (await fetch(`${Q}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: l.folder,
              base_name: U.value,
              /*
               Each position's own current hash -- lets stitch_lines
               read the EXACT file that content hashes to, no
               directory-scan guessing (see nodes/_line_audio.py's
               expected_path).
              */
              line_hashes: a.map((r) => $e.get(r.__key)),
              line_texts: a.map((r) => r.text),
              /*
               Silence to hold after each line, null where the row
               names none -- the stitch resolves those to its own
               defaults and records the finished plan in the timing
               manifest, which is what later tells a done script
               its pauses have since been edited (see
               _manifest_matches_script_pauses).
              */
              pauses: a.map((r) => vt(r.pause))
            })
          })).json();
          if (c.error) {
            f(`Stitch error: ${c.error}`);
            return;
          }
        } catch (s) {
          f(`Stitch failed: ${s}`);
          return;
        }
        O.value = [.../* @__PURE__ */ new Set([...O.value, C.value])], (n = l.checkedApi) == null || n.setChecked(C.value, !1), be.value = !1, f("Stitched and marked done"), X = null, Y = null, q(), me();
        return;
      }
      if (await w({
        title: "Unmark done?",
        message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
        okText: "Unmark",
        cancelText: "Cancel"
      }))
        try {
          const s = await (await fetch(`${Q}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: l.folder, base_name: U.value, filename: C.value })
          })).json();
          if (s.error) {
            f(`Error: ${s.error}`);
            return;
          }
          O.value = O.value.filter((c) => c !== C.value), f("Unmarked -- can be edited/re-voiced again"), X = null, q();
        } catch (a) {
          f(`Error: ${a}`);
        }
    }
    function Nn() {
      Ca(f);
    }
    function zn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
        f("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const t = e.closest(".fl-line-row"), n = t ? Number(t.dataset.rowIndex) : -1, a = n >= 0 ? u.value[n] : null;
      if (!a || a.malformed) {
        f("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const s = T.value.get(n), c = T.value.size, r = e.selectionStart, m = a.text.slice(0, r).trimEnd(), y = a.text.slice(r).trimStart();
      a.text = m;
      const $ = b({ speaker: a.speaker, instruct: a.instruct, text: y, pause: a.pause || "", raw: "", malformed: !1 });
      if (a.pause = "", u.value.splice(n + 1, 0, $), H(a), H($), It($.__key), E(), s !== void 0) {
        const _ = s + 1, x = [];
        for (let je = c - 1; je >= _; je--) x.push([je, je + 1]);
        Qe({ moves: x });
      }
    }
    function Mn() {
      const e = b({ speaker: "", instruct: "", text: "", pause: "", raw: "", malformed: !1 });
      u.value.push(e), H(e), It(e.__key), E();
    }
    const J = h(() => K.value.indexOf(C.value)), Bn = h(() => !(J.value > 0)), Vn = h(() => !(J.value >= 0 && J.value < K.value.length - 1));
    function Hn() {
      J.value > 0 && Dt(K.value[J.value - 1]);
    }
    function qn() {
      J.value >= 0 && J.value < K.value.length - 1 && Dt(K.value[J.value + 1]);
    }
    async function Jn() {
      try {
        const t = await (await fetch(ea)).json();
        Me.value = t.presets || [], Be.value = t.dir || "";
      } catch {
        Me.value = [], Be.value = "";
      }
    }
    async function Et() {
      var e, t, n, a;
      try {
        const s = `${Q}/scan?path=${encodeURIComponent(l.folder)}&act=&suffix=${encodeURIComponent(l.suffix)}`, r = await (await fetch(s)).json();
        se.value = ((e = r.instruct_categories) == null ? void 0 : e.entries) || [], Ne.value = ((t = r.instruct_categories) == null ? void 0 : t.path) || null, L.value = ((n = r.roles) == null ? void 0 : n.entries) || [], ee.value = ((a = r.roles) == null ? void 0 : a.path) || null, K.value = Array.isArray(r.scripts) ? r.scripts : [], O.value = Array.isArray(r.ready_scripts) ? r.ready_scripts : [];
      } catch {
        se.value = [], Ne.value = null, L.value = [], ee.value = null, K.value = [], O.value = [];
      }
    }
    async function Dt(e) {
      !e || e === C.value || qe || (V && (clearTimeout(V), V = null, await xe()), C.value = e, X = null, G.value = null, Y = null, u.value = [], te = null, He = 0, be.value = l.checkedApi ? l.checkedApi.isChecked(e) : !1, f("Loading..."), await ct(), q(), me());
    }
    async function ct({ isPoll: e = !1 } = {}) {
      try {
        const n = await (await fetch(`${ge}/read?path=${encodeURIComponent(bt.value)}`)).json();
        if (n.error) {
          f(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          e || (u.value = [], te = "", f("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (e && Date.now() - He < qa || n.content === te) return;
        u.value = v(n.content), te = n.content, Xe(), e || f(`Loaded ${u.value.length} line(s)`);
      } catch (t) {
        f(`Read failed: ${t}`);
      }
    }
    return Ee(j, () => De(_e)), Ee(Ve, Zt), Qn(() => {
      Et(), Jn(), q(), de(), oe = setInterval(() => {
        q({ silent: !0 }), de();
      }, ht), ct().then(() => {
        le = setInterval(() => ct({ isPoll: !0 }), ht), me(), re = setInterval(() => me({ silent: !0 }), ht);
      });
    }), Zn(() => {
      Re(), le && clearInterval(le), oe && clearInterval(oe), re && clearInterval(re);
    }), (e, t) => (R(), N(ne, null, [
      p(o(Bt), {
        visible: Ue.value,
        "onUpdate:visible": t[8] || (t[8] = (n) => Ue.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: ft({ width: o(Wt) }),
        class: "line-editor-dialog"
      }, {
        header: A(() => [
          p(da, {
            title: C.value,
            status: kt.value,
            "width-presets": o(Gt),
            "set-width": o(Kt),
            "font-size-decrease": o(Xt),
            "font-size-increase": o(Yt)
          }, null, 8, ["title", "status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: A(() => [
          p(ga, { class: "line-editor-controls" }, {
            default: A(() => [
              k("div", Ea, [
                k("span", {
                  class: D(["play-btn global-play-btn", { "is-playing": ot.value, disabled: !rt.value }]),
                  title: jn.value,
                  onClick: Ln
                }, Fe(ot.value ? "⏸" : "▶"), 11, Da),
                I.best ? (R(), N(ne, { key: 0 }, [
                  k("audio", {
                    ref_key: "audioElRef",
                    ref: Ce,
                    controls: "",
                    class: "audio-el",
                    src: `${o(Q)}/audio?path=${encodeURIComponent(o(W)(we.value, I.best))}&v=${encodeURIComponent(I.mtime || "")}`,
                    onTimeupdate: _e,
                    onPlay: t[0] || (t[0] = (n) => z.value = !0),
                    onPause: t[1] || (t[1] = (n) => z.value = !1),
                    onEnded: t[2] || (t[2] = (n) => z.value = !1)
                  }, null, 40, Fa),
                  p(o(P), {
                    label: "Delete audio",
                    text: "",
                    size: "small",
                    disabled: Tn.value,
                    title: g.value ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                    onClick: En,
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title"])
                ], 64)) : ye("", !0),
                p(o(P), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: t[3] || (t[3] = (n) => q())
                })
              ]),
              ln.value ? (R(), N("div", Oa, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : ye("", !0),
              k("div", Ua, [
                k("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: be.value,
                  disabled: !i.checkedApi || g.value,
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: t[4] || (t[4] = (n) => {
                    be.value = n.target.checked, Dn(n.target.checked);
                  })
                }, null, 40, Na),
                p(o(P), {
                  label: g.value ? "Done ✓" : "Done",
                  size: "small",
                  outlined: !g.value,
                  disabled: Fn.value,
                  title: On.value,
                  onClick: Un
                }, null, 8, ["label", "outlined", "disabled", "title"]),
                t[11] || (t[11] = k("div", { class: "actions-divider" }, null, -1)),
                p(o(P), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: pt(Nn, ["prevent"])
                }),
                p(o(P), {
                  label: "✂ Split line",
                  text: "",
                  size: "small",
                  title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
                  onMousedown: pt(zn, ["prevent"])
                }),
                p(o(P), {
                  label: "+ Add line",
                  text: "",
                  size: "small",
                  title: "Add a new empty line at the end of the script",
                  onClick: Mn
                }),
                p(o(P), {
                  label: "🔁 Re-voice pending",
                  text: "",
                  size: "small",
                  disabled: !i.revoiceApi || g.value || it.value === 0 || Ae.value,
                  title: _n.value,
                  onClick: xn
                }, null, 8, ["disabled", "title"]),
                t[12] || (t[12] = k("div", { class: "actions-divider" }, null, -1)),
                p(o(P), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: Bn.value,
                  title: "Open the previous script in this act",
                  onClick: Hn
                }, null, 8, ["disabled"]),
                p(o(P), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: Vn.value,
                  title: "Open the next script in this act",
                  onClick: qn
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          k("div", {
            ref_key: "rowsContainerEl",
            ref: We,
            class: "rows-container"
          }, [
            (R(!0), N(ne, null, na(u.value, (n, a) => (R(), N("div", {
              key: n.__key,
              class: D(["fl-line-row", { "row-enter": Se.value === n.__key, "row-playing": g.value ? Pe.value.get(a) === ie.value : M.value === a }]),
              "data-row-index": a,
              ref_for: !0,
              ref: (s) => rn(n.__key, s)
            }, [
              k("div", {
                class: "line-rail",
                style: ft(n.malformed ? {} : { backgroundColor: o(ka)(n.speaker) }),
                title: "Drag onto another line to merge them",
                ref_for: !0,
                ref: (s) => un(s, a)
              }, [
                k("span", Ma, Fe(a + 1), 1),
                t[13] || (t[13] = k("i", { class: "pi pi-arrows-v" }, null, -1))
              ], 4),
              k("div", Ba, [
                n.malformed ? (R(), N(ne, { key: 0 }, [
                  k("div", Va, [
                    t[14] || (t[14] = k("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                    p(o(P), {
                      icon: "pi pi-trash",
                      text: "",
                      size: "small",
                      title: "Delete this line",
                      onClick: (s) => $t(a, n.raw)
                    }, null, 8, ["onClick"])
                  ]),
                  p(o(pa), {
                    modelValue: n.raw,
                    "onUpdate:modelValue": [
                      (s) => n.raw = s,
                      t[5] || (t[5] = (s) => E())
                    ],
                    "auto-resize": "",
                    class: "fl-textarea malformed-textarea",
                    style: ft({ fontSize: `${o(Ve)}px` }),
                    rows: "1",
                    ref_for: !0,
                    ref: (s) => o(yt)(n.__key, s),
                    onKeydown: t[6] || (t[6] = aa(pt(() => {
                    }, ["prevent"]), ["enter"]))
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
                ], 64)) : (R(), ke(ya, {
                  key: 1,
                  speaker: n.speaker,
                  "role-entries": L.value,
                  "role-option-sub-label": In,
                  "role-info-code": n.speaker,
                  instruct: n.instruct,
                  "can-undo-instruct": n.__prevInstruct !== void 0,
                  "undo-instruct-title": Cn(n),
                  "can-apply-instruct": nt(n) > 0,
                  "apply-instruct-title": mn(n),
                  "instruct-note": yn(n),
                  text: n.text,
                  "font-size-px": o(Ve),
                  "textarea-ref": (s) => o(yt)(n.__key, s),
                  "on-auto-grow": o(Qt),
                  "onUpdate:speaker": (s) => {
                    n.speaker = s, dn(n);
                  },
                  "onUpdate:instruct": (s) => {
                    n.instruct = s, et(n);
                  },
                  "onUpdate:text": (s) => {
                    n.text = s, H(n), E();
                  },
                  onOpenInstructPicker: (s) => bn(n),
                  onUndoInstruct: (s) => wn(n),
                  onApplyInstruct: (s) => hn(n),
                  onRoleInfoEnter: o(qt),
                  onRoleInfoLeave: o(Jt)
                }, {
                  leading: A(() => [
                    k("span", {
                      class: D(["play-btn", { "is-playing": Tt(a), disabled: !lt(a, n) }]),
                      title: lt(a, n) ? g.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                      onClick: (s) => An(n, a)
                    }, Fe(Tt(a) ? "⏸" : "▶"), 11, Ha)
                  ]),
                  trailing: A(() => [
                    p(o(zt), { class: "speaker-file-group" }, {
                      default: A(() => {
                        var s;
                        return [
                          i.revoiceApi && !g.value ? (R(), ke(o(P), {
                            key: 0,
                            class: D(["revoice-btn", { pending: B.has(n), stale: !B.has(n) && pe(a) && !ve(n, a) }]),
                            size: "small",
                            icon: B.has(n) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                            disabled: B.has(n),
                            title: Rn(n, a),
                            onClick: (c) => jt(n, a)
                          }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : ye("", !0),
                          p(o(Nt), {
                            "model-value": ((s = he(n)) == null ? void 0 : s.speaker) || "",
                            placeholder: "(no speaker)",
                            class: "speaker-file-input",
                            disabled: !he(n),
                            title: gn(n),
                            "onUpdate:modelValue": (c) => xt(n, c)
                          }, null, 8, ["model-value", "disabled", "title", "onUpdate:modelValue"]),
                          p(o(P), {
                            icon: "pi pi-microphone",
                            size: "small",
                            disabled: !he(n),
                            title: "Pick a speaker from the preset gallery",
                            onClick: (c) => $n(n)
                          }, null, 8, ["disabled", "onClick"])
                        ];
                      }),
                      _: 2
                    }, 1024),
                    p(o(zt), { class: "pause-group" }, {
                      default: A(() => [
                        p(o(ba), null, {
                          default: A(() => [
                            k("i", {
                              class: D(Rt(n) ? "pi pi-exclamation-triangle pause-warn" : "pi pi-stopwatch")
                            }, null, 2)
                          ]),
                          _: 2
                        }, 1024),
                        p(o(Nt), {
                          modelValue: n.pause,
                          "onUpdate:modelValue": [
                            (s) => n.pause = s,
                            t[7] || (t[7] = (s) => E())
                          ],
                          class: D(["pause-input", { "p-invalid": Rt(n) }]),
                          placeholder: String(tt(a)),
                          title: vn(n, a)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "class", "placeholder", "title"])
                      ]),
                      _: 2
                    }, 1024),
                    t[15] || (t[15] = k("div", { class: "spacer" }, null, -1)),
                    p(o(P), {
                      icon: "pi pi-times",
                      color: "red",
                      text: "",
                      size: "small",
                      title: "Delete this line",
                      onClick: (s) => $t(a, n.text)
                    }, null, 8, ["onClick"])
                  ]),
                  _: 2
                }, 1032, ["speaker", "role-entries", "role-info-code", "instruct", "can-undo-instruct", "undo-instruct-title", "can-apply-instruct", "apply-instruct-title", "instruct-note", "text", "font-size-px", "textarea-ref", "on-auto-grow", "onUpdate:speaker", "onUpdate:instruct", "onUpdate:text", "onOpenInstructPicker", "onUndoInstruct", "onApplyInstruct", "onRoleInfoEnter", "onRoleInfoLeave"]))
              ])
            ], 10, za))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      p(o(Ht)),
      p(va, {
        visible: at.value,
        "onUpdate:visible": t[9] || (t[9] = (n) => at.value = n),
        categories: se.value,
        onSelect: Sn
      }, null, 8, ["visible", "categories"]),
      p(ma, {
        visible: st.value,
        "onUpdate:visible": t[10] || (t[10] = (n) => st.value = n),
        presets: Me.value,
        "sample-dir": Be.value,
        "usage-for": kn,
        onSelect: Pn
      }, null, 8, ["visible", "presets", "sample-dir"]),
      p(ha, {
        visible: o(ze).visible,
        left: o(ze).left,
        top: o(ze).top,
        message: o(gt).message,
        fields: o(gt).fields
      }, null, 8, ["visible", "left", "top", "message", "fields"])
    ], 64));
  }
}, Ka = /* @__PURE__ */ Yn(Wa, [["__scopeId", "data-v-426fb3c8"]]);
function es({ folder: i, filename: l, suffix: S = "", checkedApi: Z, revoiceApi: b }) {
  oa(import.meta.url);
  const v = document.createElement("div");
  document.body.appendChild(v);
  const F = ra(Ka, {
    folder: i,
    filename: l,
    suffix: S,
    checkedApi: Z || null,
    revoiceApi: b || null,
    onClose: () => {
      F.unmount(), v.remove();
    }
  });
  F.use(ca, { ripple: !0 }), F.use(xa), F.mount(v);
}
export {
  es as openLineEditor
};
