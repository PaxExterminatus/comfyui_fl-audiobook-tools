import { y as _n, z as $n, A as An, s as te, C as Ln, D as dt, a as ne, f as be, E as We, g as oe, G as Ae, b as x, n as re, d as J, H as Le, c as ce, F as ge, I as ft, i as Ie, t as Fe, J as De, l as M, B as Ze, k as b, S as le, K as Qe, L as je, m as ve, M as Se, N as ht, O as En, Q as Fn, R as yt, _ as gt, w as Ce, o as jn, T as Dn, u as t, U as Ge, r as xn, j as pt, e as On, V as Xe, W as Nn, X as Hn, p as Mn, q as Bn, v as Un, x as Vn, P as zn } from "./styles_link.js";
import { b as kt, u as qn, a as Jn, D as Kn } from "./DialogHeader.js";
import { s as vt } from "./inputtext.esm.js";
import { s as Wn } from "./dropdown.esm.js";
import { l as Ye, h as Gn, m as Xn, s as Qn, a as Yn, S as Zn, b as es, c as mt, d as ts, _ as ns, I as ss, e as is, L as os, f as as, u as ls, i as rs, g as cs } from "./instruct_library.js";
var ke = _n(), bt = Symbol();
function us() {
  var n = $n(bt);
  if (!n)
    throw new Error("No PrimeVue Confirmation provided!");
  return n;
}
var ds = {
  install: function(i) {
    var a = {
      require: function(C) {
        ke.emit("confirm", C);
      },
      close: function() {
        ke.emit("close");
      }
    };
    i.config.globalProperties.$confirm = a, i.provide(bt, a);
  }
}, fs = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(i) {
    var a = i.instance;
    return ["p-confirm-dialog-reject", a.confirmation && !a.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, ps = An.extend({
  name: "confirmdialog",
  classes: fs
}), vs = {
  name: "BaseConfirmDialog",
  extends: Ln,
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
  style: ps,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, St = {
  name: "ConfirmDialog",
  extends: vs,
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
    this.confirmListener = function(a) {
      a && a.group === i.group && (i.confirmation = a, i.confirmation.onShow && i.confirmation.onShow(), i.visible = !0);
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
    getCXOptions: function(i, a) {
      return {
        contenxt: {
          icon: i,
          iconClass: a.class
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
    CDialog: kt,
    CDButton: te
  }
};
function ms(n, i, a, h, C, r) {
  var l = dt("CDButton"), O = dt("CDialog");
  return ne(), be(O, {
    visible: C.visible,
    "onUpdate:visible": [i[2] || (i[2] = function(I) {
      return C.visible = I;
    }), r.onHide],
    role: "alertdialog",
    class: re(n.cx("root")),
    modal: !0,
    header: r.header,
    blockScroll: r.blockScroll,
    position: r.position,
    breakpoints: n.breakpoints,
    closeOnEscape: r.closeOnEscape,
    draggable: n.draggable,
    pt: n.pt,
    unstyled: n.unstyled
  }, We({
    default: oe(function() {
      return [n.$slots.container ? Ie("", !0) : (ne(), ce(ge, {
        key: 0
      }, [n.$slots.message ? (ne(), be(ft(n.$slots.message), {
        key: 1,
        message: C.confirmation
      }, null, 8, ["message"])) : (ne(), ce(ge, {
        key: 0
      }, [Ae(n.$slots, "icon", {}, function() {
        return [n.$slots.icon ? (ne(), be(ft(n.$slots.icon), {
          key: 0,
          class: re(n.cx("icon"))
        }, null, 8, ["class"])) : C.confirmation.icon ? (ne(), ce("span", Le({
          key: 1,
          class: [C.confirmation.icon, n.cx("icon")]
        }, n.ptm("icon")), null, 16)) : Ie("", !0)];
      }), J("span", Le({
        class: n.cx("message")
      }, n.ptm("message")), Fe(r.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [n.$slots.container ? {
    name: "container",
    fn: oe(function(I) {
      return [Ae(n.$slots, "container", {
        message: C.confirmation,
        onClose: I.onClose,
        onAccept: r.accept,
        onReject: r.reject,
        closeCallback: I.onclose,
        acceptCallback: r.accept,
        rejectCallback: r.reject
      })];
    }),
    key: "0"
  } : void 0, n.$slots.container ? void 0 : {
    name: "footer",
    fn: oe(function() {
      return [x(l, {
        label: r.rejectLabel,
        class: re([n.cx("rejectButton"), C.confirmation.rejectClass]),
        onClick: i[0] || (i[0] = function(I) {
          return r.reject();
        }),
        autofocus: r.autoFocusReject,
        unstyled: n.unstyled,
        pt: n.ptm("rejectButton")
      }, We({
        _: 2
      }, [r.rejectIcon || n.$slots.rejecticon ? {
        name: "icon",
        fn: oe(function(I) {
          return [Ae(n.$slots, "rejecticon", {}, function() {
            return [J("span", Le({
              class: [r.rejectIcon, I.class]
            }, n.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), x(l, {
        label: r.acceptLabel,
        class: re([n.cx("acceptButton"), C.confirmation.acceptClass]),
        onClick: i[1] || (i[1] = function(I) {
          return r.accept();
        }),
        autofocus: r.autoFocusAccept,
        unstyled: n.unstyled,
        pt: n.ptm("acceptButton")
      }, We({
        _: 2
      }, [r.acceptIcon || n.$slots.accepticon ? {
        name: "icon",
        fn: oe(function(I) {
          return [Ae(n.$slots, "accepticon", {}, function() {
            return [J("span", Le({
              class: [r.acceptIcon, I.class]
            }, n.ptm("acceptButton").icon, {
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
St.render = ms;
let hs = 1;
function Re(n) {
  return { ...n, __key: hs++ };
}
function wt(n) {
  const i = n.split("|");
  return i.length !== 3 && i.length !== 4 ? null : {
    speaker: i[0].trim(),
    instruct: i[1].trim(),
    text: i[2].trim(),
    pause: i.length === 4 ? i[3].trim() : ""
  };
}
function Ct(n) {
  return n.split(`
`).map((i) => i.replace(/\r$/, "")).filter((i) => i.trim()).map((i) => {
    const a = wt(i);
    return Re(a ? { ...a, raw: i, malformed: !1 } : { raw: i, malformed: !0 });
  });
}
function It(n) {
  return n.map((i) => {
    if (i.malformed) return i.raw;
    const a = `${i.speaker} | ${i.instruct} | ${i.text}`;
    return i.pause ? `${a} | ${i.pause}` : a;
  }).join(`
`);
}
function ys(n) {
  const { rows: i, linesDirPath: a } = n, h = b(/* @__PURE__ */ new Set()), C = b({});
  async function r() {
    try {
      const d = await (await fetch(`${Ze}?path=${encodeURIComponent(a.value)}`)).json();
      h.value = new Set(Array.isArray(d.files) ? d.files : []), C.value = d.file_mtimes || {};
    } catch {
    }
  }
  const l = M(() => {
    const c = /* @__PURE__ */ new Map();
    let d = 0;
    return i.value.forEach((S, A) => {
      S.malformed || (c.set(A, d), d++);
    }), c;
  });
  function O(c) {
    const d = l.value.get(c);
    return d === void 0 ? null : Xn(h.value, C.value, d);
  }
  function I(c) {
    return O(c) !== null;
  }
  const E = De(/* @__PURE__ */ new Map()), N = /* @__PURE__ */ new Map(), V = 150;
  function B(c, d) {
    const S = l.value.get(d);
    if (S === void 0) return !1;
    const A = E.get(c.__key);
    return A !== void 0 && Gn(h.value, S, A);
  }
  function K(c) {
    c.malformed || (clearTimeout(N.get(c.__key)), N.set(c.__key, setTimeout(async () => {
      N.delete(c.__key);
      const d = n.resolvedSpeakerForHash(c.speaker);
      E.set(c.__key, await Ye(d, c.instruct, c.text));
    }, V)));
  }
  async function W() {
    const c = i.value.filter((S) => !S.malformed), d = await Promise.all(
      c.map(
        (S) => Ye(n.resolvedSpeakerForHash(S.speaker), S.instruct, S.text)
      )
    );
    c.forEach((S, A) => E.set(S.__key, d[A]));
  }
  return {
    lineFilesOnDisk: h,
    lineFileMtimes: C,
    loadLineFiles: r,
    positionByIndex: l,
    latestFileFor: O,
    rowHasAnyTake: I,
    rowIsFresh: B,
    expectedHash: E,
    rowHashDebounce: N,
    ROW_HASH_DEBOUNCE_MS: V,
    updateRowHash: K,
    recomputeAllHashes: W
  };
}
function gs(n) {
  const {
    props: i,
    rows: a,
    filename: h,
    selectChecked: C,
    confirmAsync: r,
    setStatus: l,
    audioFolder: O,
    audioBaseName: I,
    linesDirPath: E,
    loadLineFiles: N,
    latestFileFor: V,
    rowHasAnyTake: B,
    rowIsFresh: K,
    expectedHash: W,
    rowEls: c,
    rawTimingLines: d,
    lastTimingMtime: S,
    lastAudioFingerprint: A
  } = n, H = b(-1), G = b(null), y = b(!1), w = b(-1);
  let e = null;
  const s = b([]), o = De({ checking: !0, best: null, mtime: null, error: null });
  async function p({ silent: P = !1 } = {}) {
    const j = ve(ve(O.value, "timing"), `${I.value}.json`);
    try {
      const _ = await (await fetch(`${Se}/read?path=${encodeURIComponent(j)}`)).json();
      if (!_.exists) {
        d.value = null, S.value = null;
        return;
      }
      if (P && _.mtime === S.value) return;
      const D = _.mtime !== S.value;
      S.value = _.mtime;
      let Y;
      try {
        Y = JSON.parse(_.content);
      } catch {
        d.value = null;
        return;
      }
      d.value = Array.isArray(Y.lines) ? Y.lines : null, D && N(), je(T);
    } catch {
    }
  }
  function v(P, j) {
    if (!Array.isArray(P) || !P.length) return null;
    const $ = [];
    return j.forEach((_, D) => {
      _.malformed || $.push(D);
    }), $.length !== P.length ? null : { lines: P, rowIndexMap: $ };
  }
  const R = M(
    () => F.value ? v(d.value, a.value) : null
  ), m = M(() => {
    const P = /* @__PURE__ */ new Map();
    return R.value && R.value.rowIndexMap.forEach((j, $) => P.set(j, $)), P;
  }), X = M(
    () => !!(F.value && d.value && d.value.length && !R.value)
  );
  function T() {
    var _;
    const P = G.value;
    if (!R.value || !P) {
      H.value = -1;
      return;
    }
    const j = P.currentTime;
    let $ = -1;
    for (let D = 0; D < R.value.lines.length; D++)
      if (j >= R.value.lines[D].start && j < R.value.lines[D].end) {
        $ = D;
        break;
      }
    if ($ !== H.value && (H.value = $, $ >= 0 && y.value)) {
      const D = R.value.rowIndexMap[$], Y = D !== void 0 ? c.get((_ = a.value[D]) == null ? void 0 : _.__key) : null;
      Y == null || Y.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  function Q() {
    e && (e.pause(), e.src = "", e = null), w.value = -1;
  }
  function Z(P) {
    Q();
    const j = E.value, $ = (_) => {
      var ee, ae;
      let D = null;
      for (; _ < a.value.length && !(!a.value[_].malformed && (D = V(_), D)); )
        _++;
      if (_ >= a.value.length || !D) {
        w.value = -1;
        return;
      }
      w.value = _, (ae = c.get((ee = a.value[_]) == null ? void 0 : ee.__key)) == null || ae.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const Y = new Audio(
        `${le}/audio?path=${encodeURIComponent(ve(j, D))}&v=${Date.now()}`
      );
      e = Y, Y.addEventListener("ended", () => $(_ + 1)), Y.play().catch((we) => l(`Playback failed: ${we}`));
    };
    $(P);
  }
  function q(P) {
    return F.value ? H.value === m.value.get(P) && y.value : w.value === P;
  }
  function ie(P, j) {
    return F.value ? m.value.get(P) !== void 0 : B(P);
  }
  function me(P, j) {
    if (ie(j))
      if (F.value) {
        const $ = m.value.get(j), _ = G.value;
        if ($ === void 0 || !_ || !R.value) return;
        _.currentTime = R.value.lines[$].start, _.play();
      } else w.value === j ? Q() : Z(j);
  }
  const ue = M(
    () => F.value ? y.value : w.value !== -1
  ), de = M(
    () => F.value ? !!o.best : a.value.some((P, j) => !P.malformed && B(j))
  ), Pe = M(() => de.value ? ue.value ? "Pause" : F.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
  function he() {
    if (de.value)
      if (F.value) {
        const P = G.value;
        if (!P) return;
        y.value ? P.pause() : P.play();
      } else w.value !== -1 ? Q() : Z(0);
  }
  async function ye({ silent: P = !1 } = {}) {
    P || (o.checking = !0);
    try {
      const $ = await (await fetch(`${Ze}?path=${encodeURIComponent(O.value)}`)).json(), _ = Array.isArray($.files) ? $.files : [], D = $.file_mtimes || {}, Y = I.value.toLowerCase(), ee = _.filter((Te) => {
        const _e = Te.lastIndexOf(".");
        return (_e > 0 ? Te.slice(0, _e) : Te).toLowerCase().startsWith(Y);
      });
      ee.sort();
      const ae = ee.length ? ee[ee.length - 1] : null, we = ae ? `${ae}::${D[ae] || ""}` : null;
      if (P && we === A.value) return;
      A.value = we, o.checking = !1, o.error = null, o.best = ae, o.mtime = ae ? D[ae] || Date.now() : null, ae || (y.value = !1, je(T));
    } catch (j) {
      o.checking = !1, o.error = String(j);
    }
  }
  const g = M(() => !o.best);
  async function L() {
    if (!(!o.best || !await r({
      title: "Delete rendered audio?",
      message: `Deletes every _audio\\ file matching "${I.value}" (currently: ${o.best})${F.value ? " -- this also un-marks the script as done" : ""}.`,
      okText: "Delete",
      cancelText: "Cancel"
    })))
      try {
        const $ = await (await fetch(`${le}/delete_audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: i.folder,
            base_name: I.value,
            filename: h.value
          })
        })).json();
        if ($.error) {
          l(`Error: ${$.error}`);
          return;
        }
        l(`Deleted ${$.deleted.length} audio file(s)`), s.value = s.value.filter((_) => _ !== h.value), A.value = null, ye();
      } catch (j) {
        l(`Error: ${j}`);
      }
  }
  const F = M(() => s.value.includes(h.value)), se = M(() => {
    const P = [];
    return a.value.forEach((j, $) => {
      j.malformed || P.push($);
    }), P.length > 0 && P.every((j) => K(a.value[j], j));
  }), fe = M(() => !F.value && !se.value), xe = M(() => F.value ? "Marked ready to release -- click to unmark and go back to editing" : se.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
  async function Oe() {
    var $;
    const P = !F.value;
    if (P && !se.value) {
      l("Every line needs to be voiced before marking done");
      return;
    }
    if (P) {
      l("Stitching final file...");
      const _ = a.value.filter((D) => !D.malformed);
      try {
        const Y = await (await fetch(`${le}/stitch_lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: i.folder,
            base_name: I.value,
            line_hashes: _.map((ee) => W.get(ee.__key)),
            line_texts: _.map((ee) => ee.text),
            pauses: _.map((ee) => Qe(ee.pause))
          })
        })).json();
        if (Y.error) {
          l(`Stitch error: ${Y.error}`);
          return;
        }
      } catch (D) {
        l(`Stitch failed: ${D}`);
        return;
      }
      s.value = [.../* @__PURE__ */ new Set([...s.value, h.value])], ($ = i.checkedApi) == null || $.setChecked(h.value, !1), C.value = !1, l("Stitched and marked done"), A.value = null, S.value = null, ye(), p();
      return;
    }
    if (await r({
      title: "Unmark done?",
      message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
      okText: "Unmark",
      cancelText: "Cancel"
    }))
      try {
        const D = await (await fetch(`${le}/delete_audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: i.folder,
            base_name: I.value,
            filename: h.value
          })
        })).json();
        if (D.error) {
          l(`Error: ${D.error}`);
          return;
        }
        s.value = s.value.filter((Y) => Y !== h.value), l("Unmarked -- can be edited/re-voiced again"), A.value = null, ye();
      } catch (_) {
        l(`Error: ${_}`);
      }
  }
  return {
    rawTimingLines: d,
    activeTimingIdx: H,
    lastTimingMtime: S,
    audioElRef: G,
    loadTiming: p,
    computeLineTiming: v,
    lineTiming: R,
    currentRowToTimingIdx: m,
    timingWarningVisible: X,
    syncActiveLine: T,
    audioIsPlaying: y,
    mode1PlayingIdx: w,
    stopMode1Playback: Q,
    playRowSequential: Z,
    isRowPlaying: q,
    canPlayRow: ie,
    onPlayClick: me,
    isPlayingAnything: ue,
    canPlayGlobal: de,
    globalPlayTitle: Pe,
    toggleGlobalPlayback: he,
    readyScripts: s,
    audioState: o,
    lastAudioFingerprint: A,
    loadAudio: ye,
    deleteAudioDisabled: g,
    deleteAudio: L,
    isCurrentlyReady: F,
    allRowsVoiced: se,
    doneDisabled: fe,
    doneTitle: xe,
    toggleDone: Oe
  };
}
function ks(n) {
  const {
    props: i,
    filename: a,
    setStatus: h,
    lastAudioFingerprint: C,
    lastTimingMtime: r
  } = n, l = b([]), O = b(null), I = b([]), E = b(null), N = b([]), V = b(""), B = b([]), K = M(() => {
    const e = /* @__PURE__ */ new Map();
    for (const s of I.value) e.set(s.code, s);
    return e;
  });
  function W(e) {
    return K.value.get(e.speaker);
  }
  function c(e) {
    if (!e) return "";
    const s = I.value.find((v) => v.code === e), o = s && s.speaker ? s.speaker : e, p = String(o).split("#", 1)[0].trim();
    return p ? `${p}.pt` : "";
  }
  function d(e) {
    const s = I.value.find((o) => o.code === e);
    return s && s.speaker ? s.speaker : e || "";
  }
  function S() {
    const e = {};
    return I.value.forEach((s) => {
      const o = String(s.speaker || "").split("#", 1)[0].trim();
      !o || !s.code || (e[o] = e[o] || []).push(s.code);
    }), e;
  }
  function A(e) {
    return [e.name, e.speaker, e.description].filter(Boolean).join(" -- ");
  }
  async function H() {
    if (!E.value)
      return h("No _roles.json found for this project -- can't save"), !1;
    try {
      const s = await (await fetch(`${Se}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: E.value,
          content: JSON.stringify({ roles: I.value }, null, 2)
        })
      })).json();
      return s.error ? (h(`Error saving _roles.json: ${s.error}`), !1) : !0;
    } catch (e) {
      return h(`Error saving _roles.json: ${e}`), !1;
    }
  }
  async function G(e) {
    var p, v;
    if (!E.value) return;
    const s = En(E.value), o = await Fn(s, e, i.suffix);
    h(o.message), o.changed.some((R) => R.file === a.value) && (await w(), C && (C.value = null), r && (r.value = null), (p = n.loadAudio) == null || p.call(n), (v = n.loadTiming) == null || v.call(n));
  }
  async function y() {
    try {
      const s = await (await fetch(ht)).json();
      N.value = s.presets || [], V.value = s.dir || "";
    } catch {
      N.value = [], V.value = "";
    }
  }
  async function w() {
    var e, s, o, p;
    try {
      const v = `${le}/scan?path=${encodeURIComponent(i.folder)}&act=&suffix=${encodeURIComponent(i.suffix)}`, m = await (await fetch(v)).json();
      l.value = ((e = m.instruct_categories) == null ? void 0 : e.entries) || [], O.value = ((s = m.instruct_categories) == null ? void 0 : s.path) || null, I.value = ((o = m.roles) == null ? void 0 : o.entries) || [], E.value = ((p = m.roles) == null ? void 0 : p.path) || null, B.value = Array.isArray(m.scripts) ? m.scripts : [], n.readyScripts && (n.readyScripts.value = Array.isArray(m.ready_scripts) ? m.ready_scripts : []);
    } catch {
      l.value = [], O.value = null, I.value = [], E.value = null, B.value = [], n.readyScripts && (n.readyScripts.value = []);
    }
  }
  return {
    instructCategories: l,
    instructCategoriesPath: O,
    roleEntries: I,
    rolesJsonPath: E,
    presets: N,
    speakerSampleDir: V,
    scriptList: B,
    roleEntryByCode: K,
    roleEntryFor: W,
    resolveSpeakerFile: c,
    resolvedSpeakerForHash: d,
    speakerUsageIndex: S,
    roleOptionSubLabel: A,
    saveRolesJson: H,
    notifyRoleSpeakerChanged: G,
    loadPresets: y,
    loadCatalog: w
  };
}
function bs(n) {
  const {
    props: i,
    filename: a,
    rows: h,
    selectChecked: C,
    fullPath: r,
    setStatus: l,
    rawTimingLines: O,
    lastTimingMtime: I,
    lastAudioFingerprint: E,
    recomputeAllHashes: N,
    loadAudio: V,
    loadTiming: B,
    SAVE_DEBOUNCE_MS: K,
    EDIT_QUIET_MS: W
  } = n, c = b(null), d = b(0), S = b(null), A = b(!1), H = b(null), G = b(null), y = b(null);
  function w() {
    d.value = Date.now(), S.value && clearTimeout(S.value), S.value = setTimeout(e, K);
  }
  async function e() {
    const v = It(h.value);
    if (v !== c.value)
      try {
        const m = await (await fetch(`${Se}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: r.value, content: v })
        })).json();
        if (m.error) {
          l(`Save error: ${m.error}`);
          return;
        }
        c.value = v, l(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
      } catch (R) {
        l(`Save failed: ${R}`);
      }
  }
  async function s({ isPoll: v = !1 } = {}) {
    try {
      const m = await (await fetch(`${Se}/read?path=${encodeURIComponent(r.value)}`)).json();
      if (m.error) {
        l(`Read error: ${m.error}`);
        return;
      }
      if (!m.exists) {
        v || (h.value = [], c.value = "", l("File does not exist yet (will be created on first edit)"));
        return;
      }
      if (v && Date.now() - d.value < W || m.content === c.value) return;
      h.value = Ct(m.content), c.value = m.content, N(), v || l(`Loaded ${h.value.length} line(s)`);
    } catch (R) {
      l(`Read failed: ${R}`);
    }
  }
  async function o(v) {
    !v || v === a.value || A.value || (S.value && (clearTimeout(S.value), S.value = null, await e()), a.value = v, E.value = null, O.value = null, I.value = null, h.value = [], c.value = null, d.value = 0, C.value = i.checkedApi ? i.checkedApi.isChecked(v) : !1, l("Loading..."), await s(), V(), B());
  }
  function p() {
    A.value || (A.value = !0, S.value && (clearTimeout(S.value), e()), H.value && clearInterval(H.value), G.value && clearInterval(G.value), y.value && clearInterval(y.value), i.onClose());
  }
  return {
    // состояние
    lastSavedText: c,
    lastLocalEditAt: d,
    saveTimer: S,
    pollTimer: H,
    audioPollTimer: G,
    timingPollTimer: y,
    closed: A,
    // операции
    scheduleSave: w,
    flushSave: e,
    loadFromDisk: s,
    switchToFile: o,
    close: p
  };
}
function Ss(n) {
  const {
    props: i,
    rows: a,
    audioBaseName: h,
    setStatus: C,
    confirmAsync: r,
    positionByIndex: l,
    updateRowHash: O,
    loadLineFiles: I,
    scheduleSave: E
  } = n, N = /* @__PURE__ */ new Map(), V = b(null), B = b(null);
  function K(e, s) {
    if (!s) {
      N.delete(e);
      return;
    }
    N.set(e, s);
  }
  async function W(e) {
    var o;
    B.value = e, await je();
    const s = N.get(e);
    s == null || s.scrollIntoView({ behavior: "smooth", block: "nearest" }), (o = s == null ? void 0 : s.querySelector(".fl-input")) == null || o.focus(), setTimeout(() => {
      B.value === e && (B.value = null);
    }, 500);
  }
  let c = null;
  async function d(e, s) {
    const o = a.value[e], p = a.value[s];
    if (!o || !p || o.malformed || p.malformed) return;
    const v = Math.min(e, s), R = Math.max(e, s), m = a.value[v], X = a.value[R];
    if ((m.speaker || "").trim() !== (X.speaker || "").trim() && !await r({
      title: "Merge lines with different speakers?",
      message: `"${m.speaker}" and "${X.speaker}" are different speakers. Merge anyway? The combined line keeps "${m.speaker}".`,
      okText: "Merge",
      cancelText: "Cancel"
    }))
      return;
    const T = l.value.get(R), Q = l.value.size;
    if (m.text = `${m.text} ${X.text}`.trim(), m.pause = X.pause || "", a.value.splice(R, 1), O(m), E(), T !== void 0) {
      const Z = [];
      for (let q = T + 1; q < Q; q++) Z.push([q, q - 1]);
      w({ deletes: [T], moves: Z });
    }
  }
  function S(e, s) {
    !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (o) => {
      if (o.button !== 0) return;
      o.preventDefault();
      const p = e.closest(".fl-line-row");
      c = Number(p == null ? void 0 : p.dataset.rowIndex), p == null || p.classList.add("fl-row-dragging");
      const v = (m) => {
        var Q;
        (Q = V.value) == null || Q.querySelectorAll(".fl-row-drop-target").forEach((Z) => Z.classList.remove("fl-row-drop-target"));
        const X = document.elementFromPoint(m.clientX, m.clientY), T = X && X.closest ? X.closest(".fl-line-row") : null;
        T && T !== p && T.classList.add("fl-row-drop-target");
      }, R = (m) => {
        var Z;
        document.removeEventListener("pointermove", v), document.removeEventListener("pointerup", R), document.removeEventListener("pointercancel", R);
        const X = document.elementFromPoint(m.clientX, m.clientY), T = X && X.closest ? X.closest(".fl-line-row") : null, Q = c;
        if (c = null, p == null || p.classList.remove("fl-row-dragging"), (Z = V.value) == null || Z.querySelectorAll(".fl-row-drop-target").forEach((q) => q.classList.remove("fl-row-drop-target")), T && T !== p) {
          const q = Number(T.dataset.rowIndex);
          Number.isNaN(q) || d(Q, q);
        }
      };
      document.addEventListener("pointermove", v), document.addEventListener("pointerup", R), document.addEventListener("pointercancel", R);
    }));
  }
  function A(e) {
    const s = l.value.get(e), o = l.value.size;
    if (a.value.splice(e, 1), E(), s !== void 0) {
      const p = [];
      for (let v = s + 1; v < o; v++) p.push([v, v - 1]);
      w({ deletes: [s], moves: p });
    }
  }
  async function H(e, s) {
    s && s.trim() && !await r({
      title: "Delete this line?",
      message: s.length > 200 ? s.slice(0, 200) + "…" : s,
      okText: "Delete",
      cancelText: "Cancel"
    }) || A(e);
  }
  function G() {
    const e = document.activeElement;
    if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
      C("Click into a line's text first, place the cursor where it should split");
      return;
    }
    const s = e.closest(".fl-line-row"), o = s ? Number(s.dataset.rowIndex) : -1, p = o >= 0 ? a.value[o] : null;
    if (!p || p.malformed) {
      C("Can't split a malformed/raw line -- fix it to plain text first");
      return;
    }
    const v = l.value.get(o), R = l.value.size, m = e.selectionStart, X = p.text.slice(0, m).trimEnd(), T = p.text.slice(m).trimStart();
    p.text = X;
    const Q = Re({
      speaker: p.speaker,
      instruct: p.instruct,
      text: T,
      pause: p.pause || "",
      raw: "",
      malformed: !1
    });
    if (p.pause = "", a.value.splice(o + 1, 0, Q), O(p), O(Q), W(Q.__key), E(), v !== void 0) {
      const Z = v + 1, q = [];
      for (let ie = R - 1; ie >= Z; ie--) q.push([ie, ie + 1]);
      w({ moves: q });
    }
  }
  function y() {
    const e = Re({
      speaker: "",
      instruct: "",
      text: "",
      pause: "",
      raw: "",
      malformed: !1
    });
    a.value.push(e), O(e), W(e.__key), E();
  }
  async function w({ deletes: e = [], moves: s = [] } = {}) {
    if (!(!e.length && !s.length))
      try {
        await fetch(`${le}/reorganize_lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: i.folder,
            base_name: h.value,
            deletes: e,
            moves: s
          })
        }), await I();
      } catch {
      }
  }
  return {
    // DOM-узлы
    rowEls: N,
    rowsContainerEl: V,
    justAddedKey: B,
    setRowRef: K,
    focusNewRow: W,
    // операции
    mergeRows: d,
    attachDragHandlers: S,
    deleteRow: A,
    confirmDeleteRow: H,
    splitFocusedLine: G,
    addLine: y,
    reorganizeLines: w
  };
}
function ws(n) {
  const {
    props: i,
    rows: a,
    audioBaseName: h,
    positionByIndex: C,
    setStatus: r,
    updateRowHash: l,
    recomputeAllHashes: O,
    loadLineFiles: I,
    scheduleSave: E,
    roleEntryFor: N,
    resolveSpeakerFile: V,
    saveRolesJson: B,
    notifyRoleSpeakerChanged: K,
    instructCategories: W,
    instructCategoriesPath: c,
    SAVE_DEBOUNCE_MS: d
  } = n, S = b(!1), A = b(null);
  function H(g) {
    A.value = g, S.value = !0;
  }
  function G(g) {
    const L = A.value;
    L && (L.__prevInstruct = L.instruct, L.instruct = g, v(L));
  }
  function y(g) {
    return g.__prevInstruct !== void 0 ? `Restore previous instruct: "${g.__prevInstruct}"` : "No previous instruct to restore";
  }
  function w(g) {
    if (g.__prevInstruct === void 0) return;
    const L = g.instruct;
    g.instruct = g.__prevInstruct, g.__prevInstruct = L, v(g);
  }
  const e = M(() => {
    const g = /* @__PURE__ */ new Map();
    for (const L of W.value)
      for (const F of L.examples || [])
        g.set(F.trim(), L.title);
    return g;
  });
  function s(g) {
    return e.value.get(g.instruct.trim()) || null;
  }
  const o = /* @__PURE__ */ new Map();
  function p(g) {
    clearTimeout(o.get(g.__key)), o.set(g.__key, setTimeout(async () => {
      o.delete(g.__key);
      const L = await Qn(
        Se,
        c.value,
        g.instruct
      );
      L && (W.value = L);
    }, d));
  }
  function v(g) {
    l(g), E(), p(g);
  }
  const R = b(!1), m = b(null);
  function X(g) {
    m.value = g, R.value = !0;
  }
  async function T(g) {
    const L = m.value;
    L && await Q(L, g);
  }
  async function Q(g, L) {
    const F = N(g);
    if (!F) return;
    F.speaker = L, O(), await B() && (r(`"${F.code}" now uses "${L}" for the whole play`), await K(F.code));
  }
  function Z(g) {
    const L = N(g), F = V(g.speaker);
    return L ? `Change "${L.code}"'s speaker for the whole play (currently ${F || "unset"})` : F ? `"${g.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
  }
  const q = b(!1), ie = b(null), me = b([]), ue = b(null), de = De(/* @__PURE__ */ new Map());
  async function Pe() {
    try {
      const L = await (await fetch(
        `${le}/line_history/counts?folder=${encodeURIComponent(i.folder)}&base_name=${encodeURIComponent(h.value)}`
      )).json();
      if (L && !L.error) {
        de.clear();
        for (const [F, se] of Object.entries(L))
          de.set(Number(F), se);
      }
    } catch (g) {
      console.error("[FL history] couldn't load version counts", g);
    }
  }
  async function he(g, L) {
    ie.value = g;
    const F = C.value.get(L);
    try {
      const fe = await (await fetch(
        `${le}/line_history?folder=${encodeURIComponent(i.folder)}&base_name=${encodeURIComponent(h.value)}&position=${F}`
      )).json();
      me.value = fe.versions || [], ue.value = fe.chosen_version ?? null;
    } catch (se) {
      console.error("[FL history] couldn't load line history", se), me.value = [], ue.value = null;
    }
    q.value = !0;
  }
  async function ye(g) {
    const L = ie.value;
    if (!L) return;
    const F = a.value.indexOf(L), se = C.value.get(F);
    try {
      await fetch(`${le}/line_history/choose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: i.folder,
          base_name: h.value,
          position: se,
          version: g
        })
      }), r(`Line switched to version ${g}`), await I();
    } catch (fe) {
      r(`Couldn't switch version: ${fe.message || fe}`);
    }
  }
  return {
    // InstructPicker
    instructPickerVisible: S,
    instructPickerRow: A,
    openInstructPicker: H,
    onInstructPicked: G,
    undoInstructTitle: y,
    undoInstruct: w,
    instructCategoryByPhrase: e,
    instructNoteFor: s,
    instructLibrarySaveDebounce: o,
    scheduleInstructLibrarySave: p,
    onInstructInput: v,
    // SpeakerPicker
    speakerPickerVisible: R,
    speakerPickerRow: m,
    openSpeakerPicker: X,
    onSpeakerPicked: T,
    onSpeakerFileRecast: Q,
    speakerFileTitle: Z,
    // LineHistory
    historyVisible: q,
    historyRow: ie,
    historyVersions: me,
    historyChosenVersion: ue,
    historyCounts: de,
    refreshHistoryCounts: Pe,
    openLineHistory: he,
    onHistoryVersionChosen: ye
  };
}
function Cs(n) {
  const {
    props: i,
    rows: a,
    filename: h,
    audioBaseName: C,
    linesDirPath: r,
    setStatus: l,
    positionByIndex: O,
    rowHasAnyTake: I,
    rowIsFresh: E,
    lineFilesOnDisk: N,
    loadLineFiles: V,
    resolvedSpeakerForHash: B,
    refreshHistoryCounts: K,
    flushSave: W
  } = n, c = De(/* @__PURE__ */ new Set()), d = b(!1), S = M(
    () => a.value.filter((e, s) => H(e, s)).length
  ), A = M(
    () => S.value > 0 ? `Re-voice ${S.value} line(s) whose text/speaker/instruct changed since they were last rendered (the gold 🔁 rows), one at a time` : "No line in this script needs re-voicing right now"
  );
  function H(e, s) {
    return !e.malformed && I(s) && !E(e, s);
  }
  function G(e, s) {
    return c.has(e) ? "Re-voicing..." : I(s) && !E(e, s) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : E(e, s) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
  }
  async function y(e, s) {
    if (!c.has(e)) {
      c.add(e), l("Re-voicing...");
      try {
        const o = await Ye(
          B(e.speaker),
          e.instruct,
          e.text
        );
        await i.revoiceApi.revoiceLine({
          linePosition: O.value.get(s),
          speaker: e.speaker,
          instruct: e.instruct,
          text: e.text,
          contentHash: o,
          file: h.value,
          folder: i.folder,
          baseName: C.value
        }), await V(), await K();
        const p = O.value.get(s), v = Yn(p, o), R = N.value.has(v);
        console.log("[FL revoice] after render:", {
          position: p,
          expectedFile: v,
          foundOnDisk: R,
          linesDir: r.value,
          filesInDir: [...N.value]
        }), l(
          R ? "Line re-voiced" : `Re-voice finished but ${v} is not in ${r.value} -- see the console`
        );
      } catch (o) {
        l(`Re-voice failed: ${o.message || o}`);
      } finally {
        c.delete(e), W();
      }
    }
  }
  async function w() {
    if (d.value) return;
    const e = a.value.filter((s, o) => H(s, o));
    if (e.length) {
      d.value = !0;
      try {
        for (const s of e) {
          const o = a.value.indexOf(s);
          o !== -1 && await y(s, o);
        }
        l(`Re-voiced ${e.length} line(s)`);
      } finally {
        d.value = !1;
      }
    }
  }
  return {
    pendingRevoiceRows: c,
    isRevoicingStale: d,
    staleRowCount: S,
    revoiceStaleTitle: A,
    isRowStale: H,
    revoiceTitle: G,
    revoiceRow: y,
    revoiceStaleRows: w
  };
}
function Is(n) {
  const {
    rows: i,
    filename: a,
    setStatus: h,
    scriptList: C,
    updateRowHash: r,
    scheduleSave: l,
    switchToFile: O
  } = n, I = M(() => {
    let y = -1;
    return i.value.forEach((w, e) => {
      w.malformed || (y = e);
    }), y;
  });
  function E(y) {
    return y === I.value ? 0 : yt;
  }
  function N(y) {
    return !!y.pause && Qe(y.pause) === null;
  }
  function V(y, w) {
    const e = Qe(y.pause);
    return y.pause && e === null ? `"${y.pause}" isn't a pause this can read -- expected seconds between 0 and 10 (e.g. 1.5). Falling back to ${E(w)}s.` : e !== null ? e === 0 ? "No pause after this line -- the next one comes in on top of it (an interruption)" : `Hold ${e}s of silence after this line` : `Pause after this line, in seconds. Empty = ${E(w)}s` + (w === I.value ? " (nothing held after the last line)" : " (the default between lines)");
  }
  const B = M(() => {
    const y = /* @__PURE__ */ new Map();
    for (const w of i.value) {
      if (w.malformed) continue;
      const e = (w.speaker || "").trim();
      e && y.set(e, (y.get(e) || 0) + 1);
    }
    return y;
  });
  function K(y) {
    const w = (y.speaker || "").trim();
    if (!w) return 0;
    const e = B.value.get(w) || 0;
    return e > 0 ? e - 1 : 0;
  }
  function W(y) {
    const w = K(y);
    return w > 0 ? `Apply this instruct to every other "${y.speaker.trim()}" line in this script (${w})` : "No other lines in this script use this speaker";
  }
  function c(y) {
    const w = K(y);
    if (!w) return;
    const e = y.speaker.trim();
    i.value.forEach((s) => {
      s !== y && !s.malformed && (s.speaker || "").trim() === e && (s.instruct = y.instruct, r(s));
    }), l(), h(`Applied instruct to ${w} other "${e}" line(s) in this script`);
  }
  const d = M(() => C.value.indexOf(a.value)), S = M(() => !(d.value > 0)), A = M(
    () => !(d.value >= 0 && d.value < C.value.length - 1)
  );
  function H() {
    d.value > 0 && O(C.value[d.value - 1]);
  }
  function G() {
    d.value >= 0 && d.value < C.value.length - 1 && O(C.value[d.value + 1]);
  }
  return {
    lastRowIndex: I,
    pauseDefaultFor: E,
    pauseUnreadable: N,
    pauseTitle: V,
    roleCountByCode: B,
    sameRoleCount: K,
    applyInstructTitle: W,
    applyInstructToSameRole: c,
    navIdx: d,
    prevDisabled: S,
    nextDisabled: A,
    goPrev: H,
    goNext: G
  };
}
const Rs = { class: "fl-line-editor-content" }, Ps = { class: "audio-content-row" }, Ts = ["title"], _s = ["src"], $s = {
  key: 0,
  class: "timing-warning"
}, As = { class: "actions-row" }, Ls = ["checked", "disabled"], Es = ["data-row-index"], Fs = { class: "line-number" }, js = { class: "line-body" }, Ds = { class: "malformed-warn-line" }, xs = ["title", "onClick"], Os = 600, Ee = 3e3, Ns = 1500, Hs = {
  __name: "LineEditorContent",
  props: {
    folder: { type: String, required: !0 },
    filename: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    checkedApi: { type: Object, default: null },
    revoiceApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(n) {
    const i = n, a = b(!0), h = b(i.filename), C = b([]), r = b(""), l = b(i.checkedApi ? i.checkedApi.isChecked(i.filename) : !1), O = b(null), I = b(null), E = b(null), N = /* @__PURE__ */ new Map(), V = us();
    function B({ title: k = "Confirm", message: f = "", okText: u = "OK", cancelText: U = "Cancel" } = {}) {
      return new Promise((z) => {
        V.require({
          header: k,
          message: f,
          acceptLabel: u,
          rejectLabel: U,
          accept: () => z(!0),
          reject: () => z(!1),
          onHide: () => z(!1)
        });
      });
    }
    const { setWidth: K, presets: W } = qn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), { fontSizePx: c, decrease: d, increase: S } = Jn({
      storageKey: "FL_CosyVoice3.LineEditor.textFontSizePx",
      defaultSize: 11.5
    }), { autoGrow: A, setTextareaRef: H, regrowAll: G } = ls(), y = M(() => ve(i.folder, h.value)), w = M(() => ve(i.folder, "_audio")), e = M(() => Nn(h.value, i.suffix)), s = M(() => ve(ve(w.value, "lines"), e.value));
    function o(k) {
      r.value = k;
    }
    const p = b(null), v = b(null), R = b(null), m = b(null), X = b(!1), T = {
      props: i,
      visible: a,
      filename: h,
      rows: C,
      status: r,
      selectChecked: l,
      parseLine: wt,
      parseScript: Ct,
      serializeRows: It,
      freshRow: Re,
      confirmAsync: B,
      setStatus: o,
      setTextareaRef: H,
      autoGrow: A,
      fullPath: y,
      audioFolder: w,
      audioBaseName: e,
      linesDirPath: s,
      saveTimer: p,
      pollTimer: v,
      audioPollTimer: R,
      timingPollTimer: m,
      closed: X,
      rawTimingLines: O,
      lastTimingMtime: I,
      lastAudioFingerprint: E,
      rowEls: N,
      SAVE_DEBOUNCE_MS: Os,
      POLL_MS: Ee,
      EDIT_QUIET_MS: Ns,
      FILE_API: Se,
      SCAN_API: le,
      BROWSE_API: Ze,
      PRESETS_API: ht,
      DEFAULT_LINE_GAP_S: yt
    };
    Object.assign(T, ys(T)), Object.assign(T, gs(T)), Object.assign(T, ks(T)), Object.assign(T, bs(T)), Object.assign(T, Ss(T)), Object.assign(T, ws(T)), Object.assign(T, Cs(T)), Object.assign(T, Is(T));
    const {
      // useLineCatalog
      instructCategories: Q,
      instructCategoriesPath: Z,
      roleEntries: q,
      rolesJsonPath: ie,
      presets: me,
      speakerSampleDir: ue,
      scriptList: de,
      roleEntryByCode: Pe,
      roleEntryFor: he,
      resolveSpeakerFile: ye,
      resolvedSpeakerForHash: g,
      speakerUsageIndex: L,
      roleOptionSubLabel: F,
      saveRolesJson: se,
      notifyRoleSpeakerChanged: fe,
      loadPresets: xe,
      loadCatalog: Oe,
      // useLineFiles
      lineFilesOnDisk: P,
      lineFileMtimes: j,
      loadLineFiles: $,
      positionByIndex: _,
      latestFileFor: D,
      rowHasAnyTake: Y,
      rowIsFresh: ee,
      expectedHash: ae,
      rowHashDebounce: we,
      ROW_HASH_DEBOUNCE_MS: Te,
      updateRowHash: _e,
      recomputeAllHashes: et,
      // useScriptIO
      lastSavedText: Vs,
      lastLocalEditAt: zs,
      scheduleSave: Ne,
      flushSave: qs,
      loadFromDisk: tt,
      switchToFile: Js,
      close: Rt,
      // usePlayback
      activeTimingIdx: Pt,
      audioElRef: Tt,
      loadTiming: nt,
      computeLineTiming: Ks,
      lineTiming: _t,
      currentRowToTimingIdx: $t,
      timingWarningVisible: At,
      syncActiveLine: He,
      audioIsPlaying: Me,
      mode1PlayingIdx: Lt,
      stopMode1Playback: Et,
      playRowSequential: Ws,
      isRowPlaying: st,
      canPlayRow: it,
      onPlayClick: Ft,
      isPlayingAnything: ot,
      canPlayGlobal: jt,
      globalPlayTitle: Dt,
      toggleGlobalPlayback: at,
      readyScripts: Gs,
      audioState: Be,
      loadAudio: Ue,
      deleteAudioDisabled: xt,
      deleteAudio: Ot,
      isCurrentlyReady: pe,
      allRowsVoiced: Xs,
      doneDisabled: Nt,
      doneTitle: Ht,
      toggleDone: Mt,
      // useRowOps
      mergeRows: Qs,
      attachDragHandlers: Bt,
      deleteRow: Ys,
      confirmDeleteRow: lt,
      splitFocusedLine: Ut,
      addLine: Vt,
      reorganizeLines: Zs,
      rowsContainerEl: zt,
      justAddedKey: qt,
      setRowRef: Jt,
      focusNewRow: ei,
      // useDialogs
      instructPickerVisible: Ve,
      instructPickerRow: ti,
      openInstructPicker: Kt,
      onInstructPicked: Wt,
      undoInstructTitle: Gt,
      undoInstruct: Xt,
      instructCategoryByPhrase: ni,
      instructNoteFor: Qt,
      instructLibrarySaveDebounce: si,
      scheduleInstructLibrarySave: ii,
      onInstructInput: Yt,
      speakerPickerVisible: ze,
      speakerPickerRow: oi,
      openSpeakerPicker: Zt,
      onSpeakerPicked: en,
      onSpeakerFileRecast: tn,
      speakerFileTitle: nn,
      historyVisible: qe,
      historyRow: ai,
      historyVersions: sn,
      historyChosenVersion: on,
      historyCounts: rt,
      refreshHistoryCounts: an,
      openLineHistory: ln,
      onHistoryVersionChosen: rn,
      // useRevoice
      pendingRevoiceRows: $e,
      isRevoicingStale: cn,
      staleRowCount: un,
      revoiceStaleTitle: dn,
      isRowStale: li,
      revoiceTitle: fn,
      revoiceRow: pn,
      revoiceStaleRows: vn,
      // useRowHelpers
      lastRowIndex: ri,
      pauseDefaultFor: mn,
      pauseUnreadable: ct,
      pauseTitle: hn,
      roleCountByCode: ci,
      sameRoleCount: yn,
      applyInstructTitle: gn,
      applyInstructToSameRole: kn,
      navIdx: ui,
      prevDisabled: bn,
      nextDisabled: Sn,
      goPrev: wn,
      goNext: Cn
    } = T, {
      popover: Je,
      show: In,
      hide: Rn,
      info: ut
    } = cs(
      q,
      (k) => Object.entries(k).filter(
        ([, f]) => f !== "" && f !== null && f !== void 0 && f !== k.__key
      )
    );
    Hn("lineRowApi", {
      // общий каталог и UI
      roleEntries: q,
      roleOptionSubLabel: F,
      fontSizePx: c,
      autoGrow: A,
      setTextareaRef: H,
      showRoleInfoPopover: In,
      hideRoleInfoPopover: Rn,
      // подписи, специфичные для audiobook
      speakerPlaceholder: "Speaker",
      speakerTitle: "Speaker (role code, or a literal preset/preset#tag)",
      instructPlaceholder: "Instruct",
      instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
      textPlaceholder: "",
      // доступ к полям row
      getSpeaker: (k) => k.speaker,
      setSpeaker: (k, f) => {
        k.speaker = f, onSpeakerInput(k);
      },
      getInstruct: (k) => k.instruct,
      setInstruct: (k, f) => {
        k.instruct = f, Yt(k);
      },
      getText: (k) => k.text,
      setText: (k, f) => {
        k.text = f, _e(k), Ne();
      },
      getRoleInfoCode: (k) => k.speaker,
      textKey: (k) => k.__key,
      // instruct-действия
      canUndoInstruct: (k) => k.__prevInstruct !== void 0,
      undoInstructTitle: (k) => Gt(k),
      undoInstruct: (k) => Xt(k),
      canApplyInstruct: (k) => yn(k) > 0,
      applyInstructTitle: (k) => gn(k),
      applyInstructToSameRole: (k) => kn(k),
      instructNoteFor: (k) => Qt(k),
      openInstructPicker: (k) => Kt(k)
    });
    function Pn(k) {
      var f;
      (f = i.checkedApi) == null || f.setChecked(h.value, k);
    }
    function Tn() {
      rs(o);
    }
    return Ce(q, et), Ce(a, (k) => {
      k || Rt();
    }), Ce(_t, () => je(He)), Ce(c, G), jn(() => {
      Oe(), xe(), Ue(), $(), an(), R.value = setInterval(() => {
        Ue({ silent: !0 }), $();
      }, Ee), tt().then(() => {
        v.value = setInterval(() => tt({ isPoll: !0 }), Ee), nt(), m.value = setInterval(() => nt({ silent: !0 }), Ee);
      });
    }), Dn(() => {
      Et(), v.value && clearInterval(v.value), R.value && clearInterval(R.value), m.value && clearInterval(m.value);
    }), (k, f) => (ne(), ce(ge, null, [
      J("div", Rs, [
        x(Kn, {
          title: h.value,
          status: r.value,
          "width-presets": t(W),
          "set-width": t(K),
          "font-size-decrease": t(d),
          "font-size-increase": t(S)
        }, null, 8, ["title", "status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
        x(Zn, { class: "line-editor-controls" }, {
          default: oe(() => [
            J("div", Ps, [
              J("span", {
                class: re(["play-btn global-play-btn", { "is-playing": t(ot), disabled: !t(jt) }]),
                title: t(Dt),
                onClick: f[0] || (f[0] = (...u) => t(at) && t(at)(...u))
              }, Fe(t(ot) ? "⏸" : "▶"), 11, Ts),
              t(Be).best ? (ne(), ce(ge, { key: 0 }, [
                J("audio", {
                  ref_key: "audioElRef",
                  ref: Tt,
                  controls: "",
                  class: "audio-el",
                  src: `${t(le)}/audio?path=${encodeURIComponent(t(ve)(w.value, t(Be).best))}&v=${encodeURIComponent(t(Be).mtime || "")}`,
                  onTimeupdate: f[1] || (f[1] = (...u) => t(He) && t(He)(...u)),
                  onPlay: f[2] || (f[2] = (u) => Me.value = !0),
                  onPause: f[3] || (f[3] = (u) => Me.value = !1),
                  onEnded: f[4] || (f[4] = (u) => Me.value = !1)
                }, null, 40, _s),
                x(t(te), {
                  label: "Delete audio",
                  text: "",
                  size: "small",
                  disabled: t(xt),
                  title: t(pe) ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                  onClick: t(Ot),
                  icon: "pi pi-times-circle"
                }, null, 8, ["disabled", "title", "onClick"])
              ], 64)) : Ie("", !0),
              x(t(te), {
                icon: "pi pi-refresh",
                text: "",
                size: "small",
                title: "Re-check _audio\\ for this script's rendered audio",
                onClick: f[5] || (f[5] = (u) => t(Ue)())
              })
            ]),
            t(At) ? (ne(), ce("div", $s, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : Ie("", !0),
            J("div", As, [
              J("input", {
                type: "checkbox",
                class: "row-checkbox",
                checked: l.value,
                disabled: !n.checkedApi || t(pe),
                title: "Mark this script as checked for queueing (Script Library's tree)",
                onChange: f[6] || (f[6] = (u) => {
                  l.value = u.target.checked, Pn(u.target.checked);
                })
              }, null, 40, Ls),
              x(t(te), {
                label: t(pe) ? "Done ✓" : "Done",
                size: "small",
                outlined: !t(pe),
                disabled: t(Nt),
                title: t(Ht),
                onClick: t(Mt)
              }, null, 8, ["label", "outlined", "disabled", "title", "onClick"]),
              f[13] || (f[13] = J("div", { class: "actions-divider" }, null, -1)),
              x(t(te), {
                label: "´ Stress mark",
                text: "",
                size: "small",
                title: "Insert a stress mark at the cursor",
                onMousedown: Ge(Tn, ["prevent"])
              }),
              x(t(te), {
                label: "✂ Split line",
                text: "",
                size: "small",
                title: "Split this line into two at the cursor",
                onMousedown: Ge(t(Ut), ["prevent"])
              }, null, 8, ["onMousedown"]),
              x(t(te), {
                label: "+ Add line",
                text: "",
                size: "small",
                title: "Add a new empty line at the end of the script",
                onClick: t(Vt)
              }, null, 8, ["onClick"]),
              x(t(te), {
                label: "🔁 Re-voice pending",
                text: "",
                size: "small",
                disabled: !n.revoiceApi || t(pe) || t(un) === 0 || t(cn),
                title: t(dn),
                onClick: t(vn)
              }, null, 8, ["disabled", "title", "onClick"]),
              f[14] || (f[14] = J("div", { class: "actions-divider" }, null, -1)),
              x(t(te), {
                label: "◀ Prev",
                text: "",
                size: "small",
                disabled: t(bn),
                title: "Open the previous script in this act",
                onClick: t(wn)
              }, null, 8, ["disabled", "onClick"]),
              x(t(te), {
                label: "Next ▶",
                text: "",
                size: "small",
                disabled: t(Sn),
                title: "Open the next script in this act",
                onClick: t(Cn)
              }, null, 8, ["disabled", "onClick"])
            ])
          ]),
          _: 1
        }),
        J("div", {
          ref_key: "rowsContainerEl",
          ref: zt,
          class: "rows-container"
        }, [
          (ne(!0), ce(ge, null, xn(C.value, (u, U) => (ne(), ce("div", {
            key: u.__key,
            class: re(["fl-line-row", { "row-enter": t(qt) === u.__key, "row-playing": t(pe) ? t($t).get(U) === t(Pt) : t(Lt) === U }]),
            "data-row-index": U,
            ref_for: !0,
            ref: (z) => t(Jt)(u.__key, z)
          }, [
            J("div", {
              class: "line-rail",
              style: pt(u.malformed ? {} : { backgroundColor: t(es)(u.speaker) }),
              title: "Drag onto another line to merge them",
              ref_for: !0,
              ref: (z) => t(Bt)(z, U)
            }, [
              J("span", Fs, Fe(U + 1), 1),
              f[15] || (f[15] = J("i", { class: "pi pi-arrows-v" }, null, -1))
            ], 4),
            J("div", js, [
              u.malformed ? (ne(), ce(ge, { key: 0 }, [
                J("div", Ds, [
                  f[16] || (f[16] = J("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                  x(t(te), {
                    icon: "pi pi-trash",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (z) => t(lt)(U, u.raw)
                  }, null, 8, ["onClick"])
                ]),
                x(t(Wn), {
                  modelValue: u.raw,
                  "onUpdate:modelValue": [
                    (z) => u.raw = z,
                    f[7] || (f[7] = (z) => t(Ne)())
                  ],
                  "auto-resize": "",
                  class: "fl-textarea malformed-textarea",
                  style: pt({ fontSize: `${t(c)}px` }),
                  rows: "1",
                  ref_for: !0,
                  ref: (z) => t(H)(u.__key, z),
                  onKeydown: f[8] || (f[8] = On(Ge(() => {
                  }, ["prevent"]), ["enter"]))
                }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
              ], 64)) : (ne(), be(ns, {
                key: 1,
                row: u,
                index: U
              }, {
                leading: oe(() => [
                  J("span", {
                    class: re(["play-btn", { "is-playing": t(st)(U), disabled: !t(it)(U, u) }]),
                    title: t(it)(U, u) ? t(pe) ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                    onClick: (z) => t(Ft)(u, U)
                  }, Fe(t(st)(U) ? "⏸" : "▶"), 11, xs)
                ]),
                trailing: oe(() => [
                  x(t(mt), { class: "speaker-file-group" }, {
                    default: oe(() => {
                      var z;
                      return [
                        n.revoiceApi && !t(pe) ? (ne(), be(t(te), {
                          key: 0,
                          class: re(["revoice-btn", { pending: t($e).has(u), stale: !t($e).has(u) && t(Y)(U) && !t(ee)(u, U) }]),
                          size: "small",
                          icon: t($e).has(u) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                          disabled: t($e).has(u),
                          title: t(fn)(u, U),
                          onClick: (Ke) => t(pn)(u, U)
                        }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : Ie("", !0),
                        x(t(vt), {
                          "model-value": ((z = t(he)(u)) == null ? void 0 : z.speaker) || "",
                          placeholder: "(no speaker)",
                          class: "speaker-file-input",
                          disabled: !t(he)(u),
                          title: t(nn)(u),
                          "onUpdate:modelValue": (Ke) => t(tn)(u, Ke)
                        }, null, 8, ["model-value", "disabled", "title", "onUpdate:modelValue"]),
                        x(t(te), {
                          icon: "pi pi-microphone",
                          size: "small",
                          disabled: !t(he)(u),
                          title: "Pick a speaker from the preset gallery",
                          onClick: (Ke) => t(Zt)(u)
                        }, null, 8, ["disabled", "onClick"])
                      ];
                    }),
                    _: 2
                  }, 1024),
                  x(t(mt), { class: "pause-group" }, {
                    default: oe(() => [
                      x(t(ts), null, {
                        default: oe(() => [
                          J("i", {
                            class: re(t(ct)(u) ? "pi pi-exclamation-triangle pause-warn" : "pi pi-stopwatch")
                          }, null, 2)
                        ]),
                        _: 2
                      }, 1024),
                      x(t(vt), {
                        modelValue: u.pause,
                        "onUpdate:modelValue": [
                          (z) => u.pause = z,
                          f[9] || (f[9] = (z) => t(Ne)())
                        ],
                        class: re(["pause-input", { "p-invalid": t(ct)(u) }]),
                        placeholder: String(t(mn)(U)),
                        title: t(hn)(u, U)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "class", "placeholder", "title"])
                    ]),
                    _: 2
                  }, 1024),
                  f[17] || (f[17] = J("div", { class: "spacer" }, null, -1)),
                  x(t(te), {
                    icon: "pi pi-history",
                    size: "small",
                    text: "",
                    label: t(rt).get(t(_).get(U)) ? String(t(rt).get(t(_).get(U))) : "",
                    title: "Line history (previous takes/versions)",
                    onClick: (z) => t(ln)(u, U)
                  }, null, 8, ["label", "onClick"]),
                  x(t(te), {
                    icon: "pi pi-times",
                    color: "red",
                    text: "",
                    size: "small",
                    title: "Delete this line",
                    onClick: (z) => t(lt)(U, u.text)
                  }, null, 8, ["onClick"])
                ]),
                _: 2
              }, 1032, ["row", "index"]))
            ])
          ], 10, Es))), 128))
        ], 512)
      ]),
      x(t(St)),
      x(ss, {
        visible: t(Ve),
        "onUpdate:visible": f[10] || (f[10] = (u) => Xe(Ve) ? Ve.value = u : null),
        categories: t(Q),
        onSelect: t(Wt)
      }, null, 8, ["visible", "categories", "onSelect"]),
      x(is, {
        visible: t(ze),
        "onUpdate:visible": f[11] || (f[11] = (u) => Xe(ze) ? ze.value = u : null),
        presets: t(me),
        "sample-dir": t(ue),
        "usage-for": k.speakerUsageSubLabel,
        onSelect: t(en)
      }, null, 8, ["visible", "presets", "sample-dir", "usage-for", "onSelect"]),
      x(os, {
        visible: t(qe),
        "onUpdate:visible": f[12] || (f[12] = (u) => Xe(qe) ? qe.value = u : null),
        versions: t(sn),
        "chosen-version": t(on),
        original: "",
        onSelect: t(rn)
      }, null, 8, ["visible", "versions", "chosen-version", "onSelect"]),
      x(as, {
        visible: t(Je).visible,
        left: t(Je).left,
        top: t(Je).top,
        message: t(ut).message,
        fields: t(ut).fields
      }, null, 8, ["visible", "left", "top", "message", "fields"])
    ], 64));
  }
}, Ms = /* @__PURE__ */ gt(Hs, [["__scopeId", "data-v-eb002b4a"]]), Bs = {
  __name: "LineEditorApp",
  props: {
    folder: { type: String, required: !0 },
    filename: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    checkedApi: { type: Object, default: null },
    revoiceApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(n) {
    const i = n, a = b(!0);
    return Ce(a, (h) => {
      h || i.onClose();
    }), (h, C) => (ne(), be(t(kt), {
      visible: a.value,
      "onUpdate:visible": C[0] || (C[0] = (r) => a.value = r),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: { width: "1600px" },
      class: "line-editor-dialog"
    }, {
      default: oe(() => [
        x(Ms, Mn(Bn(h.$props)), null, 16)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}, Us = /* @__PURE__ */ gt(Bs, [["__scopeId", "data-v-52aa9942"]]);
function hi({ folder: n, filename: i, suffix: a = "", checkedApi: h, revoiceApi: C }) {
  Un(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const l = Vn(Us, {
    folder: n,
    filename: i,
    suffix: a,
    checkedApi: h || null,
    revoiceApi: C || null,
    onClose: () => {
      l.unmount(), r.remove();
    }
  });
  l.use(zn, { ripple: !0 }), l.use(ds), l.mount(r);
}
export {
  hi as openLineEditor
};
