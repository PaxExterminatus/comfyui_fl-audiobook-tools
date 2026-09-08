import { v as ns, x as ss, y as wt, z as Ct, b as v, i as S, A as fe, C as ve, D as Ht, c as J, E as bt, a as g, e as f, k as le, d as p, F as W, G as qt, h as B, t as D, s as A, _ as Qe, u as o, g as Ge, j as je, n as K, r as k, H as Ae, S as ae, m as Q, w as qe, o as is, I as as, J as ls, B as Kt, K as de, L as Ke, M as Je, l as I, N as os, f as Jt, O as rs, Q as cs, p as us, q as ds, P as fs } from "./styles_link.js";
import { b as Ze, u as _t, a as It, s as Yt, D as Pt } from "./DialogHeader.js";
import { s as Qt, a as Gt, b as ps } from "./card.esm.js";
import { s as Xt } from "./inputtext.esm.js";
var me = ns(), Zt = Symbol();
function vs() {
  var i = ss(Zt);
  if (!i)
    throw new Error("No PrimeVue Confirmation provided!");
  return i;
}
var ms = {
  install: function(l) {
    var u = {
      require: function(h) {
        me.emit("confirm", h);
      },
      close: function() {
        me.emit("close");
      }
    };
    l.config.globalProperties.$confirm = u, l.provide(Zt, u);
  }
}, hs = {
  root: "p-inputgroup"
}, ys = wt.extend({
  name: "inputgroup",
  classes: hs
}), ks = {
  name: "BaseInputGroup",
  extends: Ct,
  style: ys,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Xe = {
  name: "InputGroup",
  extends: ks,
  inheritAttrs: !1
};
function gs(i, l, u, w, h, d) {
  return v(), S("div", ve({
    class: i.cx("root")
  }, i.ptmi("root")), [fe(i.$slots, "default")], 16);
}
Xe.render = gs;
var bs = {
  root: "p-inputgroup-addon"
}, Ss = wt.extend({
  name: "inputgroupaddon",
  classes: bs
}), $s = {
  name: "BaseInputGroupAddon",
  extends: Ct,
  style: Ss,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Ye = {
  name: "InputGroupAddon",
  extends: $s,
  inheritAttrs: !1
};
function ws(i, l, u, w, h, d) {
  return v(), S("div", ve({
    class: i.cx("root")
  }, i.ptmi("root")), [fe(i.$slots, "default")], 16);
}
Ye.render = ws;
var Cs = {
  root: "p-confirm-dialog",
  icon: "p-confirm-dialog-icon",
  message: "p-confirm-dialog-message",
  rejectButton: function(l) {
    var u = l.instance;
    return ["p-confirm-dialog-reject", u.confirmation && !u.confirmation.rejectClass ? "p-button-text" : null];
  },
  acceptButton: "p-confirm-dialog-accept"
}, _s = wt.extend({
  name: "confirmdialog",
  classes: Cs
}), Is = {
  name: "BaseConfirmDialog",
  extends: Ct,
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
  style: _s,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, en = {
  name: "ConfirmDialog",
  extends: Is,
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
    this.confirmListener = function(u) {
      u && u.group === l.group && (l.confirmation = u, l.confirmation.onShow && l.confirmation.onShow(), l.visible = !0);
    }, this.closeListener = function() {
      l.visible = !1, l.confirmation = null;
    }, me.on("confirm", this.confirmListener), me.on("close", this.closeListener);
  },
  beforeUnmount: function() {
    me.off("confirm", this.confirmListener), me.off("close", this.closeListener);
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
    getCXOptions: function(l, u) {
      return {
        contenxt: {
          icon: l,
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
    CDialog: Ze,
    CDButton: A
  }
};
function Ps(i, l, u, w, h, d) {
  var j = Ht("CDButton"), V = Ht("CDialog");
  return v(), J(V, {
    visible: h.visible,
    "onUpdate:visible": [l[2] || (l[2] = function(x) {
      return h.visible = x;
    }), d.onHide],
    role: "alertdialog",
    class: le(i.cx("root")),
    modal: !0,
    header: d.header,
    blockScroll: d.blockScroll,
    position: d.position,
    breakpoints: i.breakpoints,
    closeOnEscape: d.closeOnEscape,
    draggable: i.draggable,
    pt: i.pt,
    unstyled: i.unstyled
  }, bt({
    default: g(function() {
      return [i.$slots.container ? B("", !0) : (v(), S(W, {
        key: 0
      }, [i.$slots.message ? (v(), J(qt(i.$slots.message), {
        key: 1,
        message: h.confirmation
      }, null, 8, ["message"])) : (v(), S(W, {
        key: 0
      }, [fe(i.$slots, "icon", {}, function() {
        return [i.$slots.icon ? (v(), J(qt(i.$slots.icon), {
          key: 0,
          class: le(i.cx("icon"))
        }, null, 8, ["class"])) : h.confirmation.icon ? (v(), S("span", ve({
          key: 1,
          class: [h.confirmation.icon, i.cx("icon")]
        }, i.ptm("icon")), null, 16)) : B("", !0)];
      }), p("span", ve({
        class: i.cx("message")
      }, i.ptm("message")), D(d.message), 17)], 64))], 64))];
    }),
    _: 2
  }, [i.$slots.container ? {
    name: "container",
    fn: g(function(x) {
      return [fe(i.$slots, "container", {
        message: h.confirmation,
        onClose: x.onClose,
        onAccept: d.accept,
        onReject: d.reject,
        closeCallback: x.onclose,
        acceptCallback: d.accept,
        rejectCallback: d.reject
      })];
    }),
    key: "0"
  } : void 0, i.$slots.container ? void 0 : {
    name: "footer",
    fn: g(function() {
      return [f(j, {
        label: d.rejectLabel,
        class: le([i.cx("rejectButton"), h.confirmation.rejectClass]),
        onClick: l[0] || (l[0] = function(x) {
          return d.reject();
        }),
        autofocus: d.autoFocusReject,
        unstyled: i.unstyled,
        pt: i.ptm("rejectButton")
      }, bt({
        _: 2
      }, [d.rejectIcon || i.$slots.rejecticon ? {
        name: "icon",
        fn: g(function(x) {
          return [fe(i.$slots, "rejecticon", {}, function() {
            return [p("span", ve({
              class: [d.rejectIcon, x.class]
            }, i.ptm("rejectButton").icon, {
              "data-pc-section": "rejectbuttonicon"
            }), null, 16)];
          })];
        }),
        key: "0"
      } : void 0]), 1032, ["label", "class", "autofocus", "unstyled", "pt"]), f(j, {
        label: d.acceptLabel,
        class: le([i.cx("acceptButton"), h.confirmation.acceptClass]),
        onClick: l[1] || (l[1] = function(x) {
          return d.accept();
        }),
        autofocus: d.autoFocusAccept,
        unstyled: i.unstyled,
        pt: i.ptm("acceptButton")
      }, bt({
        _: 2
      }, [d.acceptIcon || i.$slots.accepticon ? {
        name: "icon",
        fn: g(function(x) {
          return [fe(i.$slots, "accepticon", {}, function() {
            return [p("span", ve({
              class: [d.acceptIcon, x.class]
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
en.render = Ps;
const xs = { class: "sticky-panel" }, Rs = {
  __name: "StickyPanel",
  setup(i) {
    return (l, u) => (v(), S("div", xs, [
      fe(l.$slots, "default", {}, void 0, !0)
    ]));
  }
}, As = /* @__PURE__ */ Qe(Rs, [["__scopeId", "data-v-2941a6c7"]]), js = { class: "instruct-example-list" }, Es = ["onClick"], Ls = {
  __name: "InstructPickerDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    categories: { type: Array, default: () => [] }
  },
  emits: ["update:visible", "select"],
  setup(i, { emit: l }) {
    const { cssWidth: u, setWidth: w, presets: h } = _t({
      storageKey: "FL_CosyVoice3.InstructPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: d, decrease: j, increase: V } = It({
      storageKey: "FL_CosyVoice3.InstructPicker.fontSizePx",
      defaultSize: 13
    }), x = l;
    function oe(C) {
      x("select", C), x("update:visible", !1);
    }
    return (C, c) => (v(), J(o(Ze), {
      visible: i.visible,
      modal: "",
      header: " ",
      style: K({ width: o(u) }),
      "onUpdate:visible": c[0] || (c[0] = (E) => C.$emit("update:visible", E))
    }, {
      header: g(() => [
        f(Pt, {
          title: "Pick an instruct phrase",
          "width-presets": o(h),
          "set-width": o(w),
          "font-size-decrease": o(j),
          "font-size-increase": o(V)
        }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: g(() => [
        i.categories.length ? B("", !0) : (v(), J(o(Yt), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: g(() => [...c[1] || (c[1] = [
            Ge(" No _instruct_categories.json found for this project -- you can still type any instruct text directly. ", -1)
          ])]),
          _: 1
        })),
        p("div", {
          class: "instruct-categories-grid",
          style: K({ fontSize: `${o(d)}px` })
        }, [
          (v(!0), S(W, null, je(i.categories, (E) => (v(), J(o(Qt), {
            key: E.name,
            class: "instruct-category-card"
          }, {
            title: g(() => [
              Ge(D(E.title), 1)
            ]),
            subtitle: g(() => [
              Ge(D(E.when), 1)
            ]),
            content: g(() => [
              p("ul", js, [
                (v(!0), S(W, null, je(E.examples, (L) => (v(), S("li", { key: L }, [
                  p("button", {
                    type: "button",
                    class: "instruct-example-btn",
                    onClick: (z) => oe(L)
                  }, D(L), 9, Es)
                ]))), 128))
              ])
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, Ts = /* @__PURE__ */ Qe(Ls, [["__scopeId", "data-v-86e0ee1a"]]);
function tn(i) {
  if (!i) return "rgba(255,255,255,0.1)";
  let l = 0;
  for (let u = 0; u < i.length; u++) l = l * 31 + i.charCodeAt(u) >>> 0;
  return `hsl(${l % 360}, 55%, 55%, 0.3)`;
}
function Ds(i) {
  const l = (i || "").toUpperCase().replace(/[^A-ZА-Я0-9]/g, "");
  if (!l) return "?";
  const u = l[0], w = [...l.slice(1)].find((h) => h !== u);
  return w ? u + w : u;
}
const zs = ["onClick"], Fs = { class: "speaker-card-text" }, Ns = { class: "speaker-name" }, Os = {
  key: 0,
  class: "speaker-usage"
}, Us = ["onClick"], Vs = {
  __name: "SpeakerPickerDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    presets: { type: Array, default: () => [] },
    // Absolute folder holding each preset's OWN .pt file -- also where a
    // same-named sample .mp3/.wav is expected to live (see the /audio
    // route this samples from; "" means presets haven't loaded yet, no
    // preview is offered until they have).
    sampleDir: { type: String, default: "" },
    // Optional (preset: string) => sublabel text, e.g. "used by: ..." --
    // the caller already has this logic (see LineEditorApp.vue's
    // speakerUsageSubLabel); kept out of this component so it stays a
    // plain preset-picker with no opinion on who's "using" what.
    usageFor: { type: Function, default: null }
  },
  emits: ["update:visible", "select"],
  setup(i, { emit: l }) {
    const u = i, w = l, { cssWidth: h, setWidth: d, presets: j } = _t({
      storageKey: "FL_CosyVoice3.SpeakerPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: V, decrease: x, increase: oe } = It({
      storageKey: "FL_CosyVoice3.SpeakerPicker.fontSizePx",
      defaultSize: 13
    });
    function C(T) {
      w("select", T), w("update:visible", !1);
    }
    const c = k(null);
    let E = null;
    function L(T, $) {
      return `${ae}/audio?path=${encodeURIComponent(Q(u.sampleDir, `${T}.${$}`))}`;
    }
    function z() {
      E == null || E.pause(), E = null, c.value = null;
    }
    function he(T) {
      if (c.value === T) {
        z();
        return;
      }
      if (z(), !u.sampleDir) return;
      const $ = new Audio(L(T, "mp3"));
      let _ = !1;
      $.addEventListener("error", () => {
        if (_) {
          c.value === T && z();
          return;
        }
        _ = !0, $.src = L(T, "wav"), $.play().catch(() => z());
      }), $.addEventListener("ended", () => {
        c.value === T && z();
      }), $.play().catch(() => z()), E = $, c.value = T;
    }
    return (T, $) => (v(), J(o(Ze), {
      visible: i.visible,
      modal: "",
      header: " ",
      style: K({ width: o(h) }),
      "onUpdate:visible": $[0] || ($[0] = (_) => {
        z(), T.$emit("update:visible", _);
      })
    }, {
      header: g(() => [
        f(Pt, {
          title: "Pick a speaker",
          "width-presets": o(j),
          "set-width": o(d),
          "font-size-decrease": o(x),
          "font-size-increase": o(oe)
        }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: g(() => [
        i.presets.length ? B("", !0) : (v(), J(o(Yt), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: g(() => [...$[1] || ($[1] = [
            Ge(" No saved speaker presets found. ", -1)
          ])]),
          _: 1
        })),
        p("div", {
          class: "speaker-grid",
          style: K({ fontSize: `${o(V)}px` })
        }, [
          (v(!0), S(W, null, je(i.presets, (_) => (v(), J(o(Qt), {
            key: _,
            class: "speaker-card"
          }, {
            content: g(() => [
              p("div", {
                class: "speaker-card-row",
                onClick: (Ee) => C(_)
              }, [
                p("div", {
                  class: "speaker-avatar",
                  style: K({ backgroundColor: o(tn)(_) })
                }, D(o(Ds)(_)), 5),
                p("div", Fs, [
                  p("div", Ns, D(_), 1),
                  i.usageFor && i.usageFor(_) ? (v(), S("div", Os, D(i.usageFor(_)), 1)) : B("", !0)
                ]),
                p("span", {
                  class: "speaker-play-wrap",
                  onClick: Ae((Ee) => he(_), ["stop"])
                }, [
                  f(o(A), {
                    icon: c.value === _ ? "pi pi-pause" : "pi pi-play",
                    size: "small",
                    disabled: !i.sampleDir,
                    title: "Preview this speaker's sample"
                  }, null, 8, ["icon", "disabled"])
                ], 8, Us)
              ], 8, zs)
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, Bs = /* @__PURE__ */ Qe(Vs, [["__scopeId", "data-v-210e5f8b"]]);
async function St(i, l, u) {
  const w = `${(i || "").trim()}|${(l || "").trim()}|${(u || "").trim()}`, h = new TextEncoder().encode(w), d = await crypto.subtle.digest("SHA-256", h);
  return [...new Uint8Array(d)].map((V) => V.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const Ms = /^(\d+)_([0-9a-f]+)\.wav$/i;
function nn(i, l) {
  return `${String(i).padStart(4, "0")}_${l}.wav`;
}
function Ws(i) {
  const l = Ms.exec(i);
  return l ? { position: Number(l[1]), hash: l[2].toLowerCase() } : null;
}
function Hs(i, l, u) {
  return i.has(nn(l, u));
}
function qs(i, l, u) {
  let w = null, h = -1 / 0;
  for (const d of i) {
    const j = Ws(d);
    if (!j || j.position !== u) continue;
    const V = (l == null ? void 0 : l[d]) ?? 0;
    (w === null || V > h) && (w = d, h = V);
  }
  return w;
}
const Ks = { class: "audio-content-row" }, Js = ["title"], Gs = ["src"], Xs = {
  key: 0,
  class: "timing-warning"
}, Ys = { class: "actions-row" }, Qs = ["checked", "disabled"], Zs = ["data-row-index"], ei = { class: "line-number" }, ti = { class: "line-body" }, ni = { class: "malformed-warn-line" }, si = { class: "line-controls-row" }, ii = ["title", "onClick"], ai = { class: "dropdown-option-label" }, li = {
  key: 0,
  class: "dropdown-option-sublabel"
}, oi = {
  key: 0,
  class: "instruct-desc"
}, ri = { key: 0 }, ci = { class: "role-info-key" }, ui = { class: "role-info-value" }, di = 600, $t = 3e3, fi = 1500, pi = 150, vi = {
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
    function u(e) {
      const t = e.split("|");
      return t.length !== 3 ? null : { speaker: t[0].trim(), instruct: t[1].trim(), text: t[2].trim() };
    }
    let w = 1;
    function h(e) {
      return { ...e, __key: w++ };
    }
    function d(e) {
      return e.split(`
`).map((t) => t.replace(/\r$/, "")).filter((t) => t.trim()).map((t) => {
        const n = u(t);
        return h(n ? { ...n, raw: t, malformed: !1 } : { raw: t, malformed: !0 });
      });
    }
    function j(e) {
      return e.map((t) => t.malformed ? t.raw : `${t.speaker} | ${t.instruct} | ${t.text}`).join(`
`);
    }
    const V = vs();
    function x({ title: e = "Confirm", message: t = "", okText: n = "OK", cancelText: s = "Cancel" } = {}) {
      return new Promise((a) => {
        V.require({
          header: e,
          message: t,
          acceptLabel: n,
          rejectLabel: s,
          accept: () => a(!0),
          reject: () => a(!1),
          onHide: () => a(!1)
        });
      });
    }
    const oe = k(!0), C = k(l.filename), c = k([]), E = k([]), L = k([]), z = k(null), he = k([]), T = k(""), $ = k([]), _ = k([]), Ee = k(""), { cssWidth: sn, setWidth: an, presets: ln } = _t({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), { fontSizePx: et, decrease: on, increase: rn } = It({
      storageKey: "FL_CosyVoice3.LineEditor.textFontSizePx",
      defaultSize: 11.5
    }), re = k(null), ye = k(-1), Z = k(!1), ee = k(-1), Le = k(l.checkedApi ? l.checkedApi.isChecked(l.filename) : !1), F = Je({ checking: !0, best: null, mtime: null, error: null }), G = Je({ visible: !1, top: 0, left: 0, code: null }), Te = k(null), te = Je(/* @__PURE__ */ new Set());
    let pe = null, tt = 0, ce = null, ue = null, ne = null, ke = null, ge = null, be = null, nt = !1, st = null, Se = null;
    const De = k(null), it = k(null), $e = /* @__PURE__ */ new Map(), we = /* @__PURE__ */ new Map(), xt = I(() => Q(l.folder, C.value)), ze = I(() => Q(l.folder, "_audio")), X = I(() => os(C.value, l.suffix)), Fe = I(() => Q(Q(ze.value, "lines"), X.value)), Ce = k(/* @__PURE__ */ new Set()), Rt = k({});
    async function _e() {
      try {
        const t = await (await fetch(`${Kt}?path=${encodeURIComponent(Fe.value)}`)).json();
        Ce.value = new Set(Array.isArray(t.files) ? t.files : []), Rt.value = t.file_mtimes || {};
      } catch {
      }
    }
    const H = I(() => {
      const e = /* @__PURE__ */ new Map();
      let t = 0;
      return c.value.forEach((n, s) => {
        n.malformed || (e.set(s, t), t++);
      }), e;
    });
    function At(e) {
      const t = H.value.get(e);
      return t === void 0 ? null : qs(Ce.value, Rt.value, t);
    }
    function at(e) {
      const t = L.value.find((n) => n.code === e);
      return t && t.speaker ? t.speaker : e || "";
    }
    const Ne = Je(/* @__PURE__ */ new Map()), lt = /* @__PURE__ */ new Map();
    function Y(e) {
      e.malformed || (clearTimeout(lt.get(e.__key)), lt.set(e.__key, setTimeout(async () => {
        lt.delete(e.__key), Ne.set(e.__key, await St(at(e.speaker), e.instruct, e.text));
      }, pi)));
    }
    async function ot() {
      const e = c.value.filter((n) => !n.malformed), t = await Promise.all(
        e.map((n) => St(at(n.speaker), n.instruct, n.text))
      );
      e.forEach((n, s) => Ne.set(n.__key, t[s]));
    }
    qe(L, ot);
    function Ie(e) {
      return At(e) !== null;
    }
    function Pe(e, t) {
      const n = H.value.get(t);
      if (n === void 0) return !1;
      const s = Ne.get(e.__key);
      return s !== void 0 && Hs(Ce.value, n, s);
    }
    const P = I(() => $.value.includes(C.value)), rt = I(() => {
      const e = [];
      return c.value.forEach((t, n) => {
        t.malformed || e.push(n);
      }), e.length > 0 && e.every((t) => Pe(c.value[t], t));
    });
    function m(e) {
      Ee.value = e;
    }
    function cn(e) {
      if (!e) return "";
      const t = L.value.find((a) => a.code === e), n = t && t.speaker ? t.speaker : e, s = String(n).split("#", 1)[0].trim();
      return s ? `${s}.pt` : "";
    }
    function un() {
      const e = {};
      return L.value.forEach((t) => {
        const n = String(t.speaker || "").split("#", 1)[0].trim();
        !n || !t.code || (e[n] = e[n] || []).push(t.code);
      }), e;
    }
    async function dn() {
      if (!z.value)
        return m("No _roles.json found for this project -- can't save"), !1;
      try {
        const t = await (await fetch(`${Ke}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: z.value, content: JSON.stringify({ roles: L.value }, null, 2) })
        })).json();
        return t.error ? (m(`Error saving _roles.json: ${t.error}`), !1) : !0;
      } catch (e) {
        return m(`Error saving _roles.json: ${e}`), !1;
      }
    }
    async function fn(e) {
      if (!z.value) return;
      const t = rs(z.value), n = await cs(t, e, l.suffix);
      m(n.message), n.changed.some((s) => s.file === C.value) && (await Mt(), ce = null, ue = null, se(), xe());
    }
    function pn(e, t) {
      if (!Array.isArray(e) || !e.length) return null;
      const n = [];
      return t.forEach((s, a) => {
        s.malformed || n.push(a);
      }), n.length !== e.length ? null : { lines: e, rowIndexMap: n };
    }
    const M = I(() => P.value ? pn(re.value, c.value) : null), Oe = I(() => {
      const e = /* @__PURE__ */ new Map();
      return M.value && M.value.rowIndexMap.forEach((t, n) => e.set(t, n)), e;
    }), vn = I(() => !!(P.value && re.value && re.value.length && !M.value));
    function Ue() {
      Se && (Se.pause(), Se.src = "", Se = null), ee.value = -1;
    }
    function jt(e) {
      Ue();
      const t = Fe.value, n = (s) => {
        var y, b;
        let a = null;
        for (; s < c.value.length && !(!c.value[s].malformed && (a = At(s), a)); )
          s++;
        if (s >= c.value.length || !a) {
          ee.value = -1;
          return;
        }
        ee.value = s, (b = $e.get((y = c.value[s]) == null ? void 0 : y.__key)) == null || b.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const r = new Audio(`${ae}/audio?path=${encodeURIComponent(Q(t, a))}&v=${Date.now()}`);
        Se = r, r.addEventListener("ended", () => n(s + 1)), r.play().catch((R) => m(`Playback failed: ${R}`));
      };
      n(e);
    }
    function Ve() {
      var s;
      const e = De.value;
      if (!M.value || !e) {
        ye.value = -1;
        return;
      }
      const t = e.currentTime;
      let n = -1;
      for (let a = 0; a < M.value.lines.length; a++)
        if (t >= M.value.lines[a].start && t < M.value.lines[a].end) {
          n = a;
          break;
        }
      if (n !== ye.value && (ye.value = n, n >= 0 && Z.value)) {
        const a = M.value.rowIndexMap[n], r = a !== void 0 ? $e.get((s = c.value[a]) == null ? void 0 : s.__key) : null;
        r == null || r.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    async function xe({ silent: e = !1 } = {}) {
      const t = Q(Q(ze.value, "timing"), `${X.value}.json`);
      try {
        const s = await (await fetch(`${Ke}/read?path=${encodeURIComponent(t)}`)).json();
        if (!s.exists) {
          re.value = null, ue = null;
          return;
        }
        if (e && s.mtime === ue) return;
        const a = s.mtime !== ue;
        ue = s.mtime;
        let r;
        try {
          r = JSON.parse(s.content);
        } catch {
          re.value = null;
          return;
        }
        re.value = Array.isArray(r.lines) ? r.lines : null, a && _e(), de(Ve);
      } catch {
      }
    }
    function mn() {
      nt || (nt = !0, ne && (clearTimeout(ne), Be()), ke && clearInterval(ke), ge && clearInterval(ge), be && clearInterval(be), l.onClose());
    }
    qe(oe, (e) => {
      e || mn();
    });
    function q() {
      tt = Date.now(), ne && clearTimeout(ne), ne = setTimeout(Be, di);
    }
    async function Be() {
      const e = j(c.value);
      if (e !== pe)
        try {
          const n = await (await fetch(`${Ke}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: xt.value, content: e })
          })).json();
          if (n.error) {
            m(`Save error: ${n.error}`);
            return;
          }
          pe = e, m(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (t) {
          m(`Save failed: ${t}`);
        }
    }
    function Me(e) {
      e && (e.style.height = "auto", e.style.height = `${e.scrollHeight}px`);
    }
    function Et(e, t) {
      if (!t) {
        we.delete(e);
        return;
      }
      we.set(e, t.$el ?? t);
    }
    function hn() {
      de(() => we.forEach(Me));
    }
    function yn(e, t) {
      if (!t) {
        $e.delete(e);
        return;
      }
      $e.set(e, t);
    }
    async function Lt(e) {
      var n;
      Te.value = e, await de();
      const t = $e.get(e);
      t == null || t.scrollIntoView({ behavior: "smooth", block: "nearest" }), (n = t == null ? void 0 : t.querySelector(".fl-input")) == null || n.focus(), setTimeout(() => {
        Te.value === e && (Te.value = null);
      }, 500);
    }
    async function ct({ deletes: e = [], moves: t = [] } = {}) {
      if (!(!e.length && !t.length))
        try {
          await fetch(`${ae}/reorganize_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: l.folder, base_name: X.value, deletes: e, moves: t })
          }), await _e();
        } catch {
        }
    }
    async function kn(e, t) {
      const n = c.value[e], s = c.value[t];
      if (!n || !s || n.malformed || s.malformed) return;
      const a = Math.min(e, t), r = Math.max(e, t), y = c.value[a], b = c.value[r];
      if ((y.speaker || "").trim() !== (b.speaker || "").trim() && !await x({
        title: "Merge lines with different speakers?",
        message: `"${y.speaker}" and "${b.speaker}" are different speakers. Merge anyway? The combined line keeps "${y.speaker}".`,
        okText: "Merge",
        cancelText: "Cancel"
      }))
        return;
      const R = H.value.get(r), N = H.value.size;
      if (y.text = `${y.text} ${b.text}`.trim(), c.value.splice(r, 1), Y(y), q(), R !== void 0) {
        const O = [];
        for (let U = R + 1; U < N; U++) O.push([U, U - 1]);
        ct({ deletes: [R], moves: O });
      }
    }
    function gn(e, t) {
      !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (n) => {
        if (n.button !== 0) return;
        n.preventDefault();
        const s = e.closest(".fl-line-row");
        st = Number(s == null ? void 0 : s.dataset.rowIndex), s == null || s.classList.add("fl-row-dragging");
        const a = (y) => {
          var N;
          (N = it.value) == null || N.querySelectorAll(".fl-row-drop-target").forEach((O) => O.classList.remove("fl-row-drop-target"));
          const b = document.elementFromPoint(y.clientX, y.clientY), R = b && b.closest ? b.closest(".fl-line-row") : null;
          R && R !== s && R.classList.add("fl-row-drop-target");
        }, r = (y) => {
          var O;
          document.removeEventListener("pointermove", a), document.removeEventListener("pointerup", r), document.removeEventListener("pointercancel", r);
          const b = document.elementFromPoint(y.clientX, y.clientY), R = b && b.closest ? b.closest(".fl-line-row") : null, N = st;
          if (st = null, s == null || s.classList.remove("fl-row-dragging"), (O = it.value) == null || O.querySelectorAll(".fl-row-drop-target").forEach((U) => U.classList.remove("fl-row-drop-target")), R && R !== s) {
            const U = Number(R.dataset.rowIndex);
            Number.isNaN(U) || kn(N, U);
          }
        };
        document.addEventListener("pointermove", a), document.addEventListener("pointerup", r), document.addEventListener("pointercancel", r);
      }));
    }
    function bn(e) {
      const t = H.value.get(e), n = H.value.size;
      if (c.value.splice(e, 1), q(), t !== void 0) {
        const s = [];
        for (let a = t + 1; a < n; a++) s.push([a, a - 1]);
        ct({ deletes: [t], moves: s });
      }
    }
    async function Tt(e, t) {
      t && t.trim() && !await x({
        title: "Delete this line?",
        message: t.length > 200 ? t.slice(0, 200) + "…" : t,
        okText: "Delete",
        cancelText: "Cancel"
      }) || bn(e);
    }
    function Sn(e) {
      Y(e), q();
    }
    function ut(e) {
      Y(e), q();
    }
    function dt(e) {
      const t = (e.speaker || "").trim();
      return t ? c.value.filter((n) => n !== e && !n.malformed && (n.speaker || "").trim() === t).length : 0;
    }
    function $n(e) {
      const t = dt(e);
      return t > 0 ? `Apply this instruct to every other "${e.speaker.trim()}" line in this script (${t})` : "No other lines in this script use this speaker";
    }
    function wn(e) {
      const t = dt(e);
      if (!t) return;
      const n = e.speaker.trim();
      c.value.forEach((s) => {
        s !== e && !s.malformed && (s.speaker || "").trim() === n && (s.instruct = e.instruct, Y(s));
      }), q(), m(`Applied instruct to ${t} other "${n}" line(s) in this script`);
    }
    function Cn(e, t) {
      Me(t), Y(e), q();
    }
    function _n(e, t, n) {
      n.preventDefault();
      const s = (n.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), a = t.selectionStart, r = t.selectionEnd;
      t.value = t.value.slice(0, a) + s + t.value.slice(r), t.selectionStart = t.selectionEnd = a + s.length, e.text = t.value, Cn(e, t);
    }
    function Re(e) {
      return L.value.find((t) => t.code === e.speaker);
    }
    function In(e) {
      const t = Re(e), n = cn(e.speaker);
      return t ? `Change "${t.code}"'s speaker for the whole play (currently ${n || "unset"})` : n ? `"${e.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
    }
    function Pn(e) {
      const t = un()[e] || [];
      return t.length ? `used by: ${t.join(", ")} -- ${t.length} role(s)` : "not used by any role yet";
    }
    function Dt(e) {
      const t = e.instruct.trim(), n = E.value.find((s) => (s.examples || []).some((a) => a.trim() === t));
      return n ? n.title : null;
    }
    const ft = k(!1), zt = k(null);
    function xn(e) {
      zt.value = e, ft.value = !0;
    }
    function Rn(e) {
      const t = zt.value;
      t && (t.__prevInstruct = t.instruct, t.instruct = e, ut(t));
    }
    function An(e) {
      return e.__prevInstruct !== void 0 ? `Restore previous instruct: "${e.__prevInstruct}"` : "No previous instruct to restore";
    }
    function jn(e) {
      if (e.__prevInstruct === void 0) return;
      const t = e.instruct;
      e.instruct = e.__prevInstruct, e.__prevInstruct = t, ut(e);
    }
    function Ft(e) {
      return [e.name, e.speaker, e.description].filter(Boolean).join(" -- ");
    }
    async function Nt(e, t) {
      const n = Re(e);
      if (!n) return;
      n.speaker = t, ot(), await dn() && (m(`"${n.code}" now uses "${t}" for the whole play`), await fn(n.code));
    }
    const pt = k(!1), Ot = k(null);
    function En(e) {
      Ot.value = e, pt.value = !0;
    }
    async function Ln(e) {
      const t = Ot.value;
      t && await Nt(t, e);
    }
    function Tn(e, t) {
      const n = e.getBoundingClientRect();
      G.left = Math.min(n.left, window.innerWidth - 280), G.top = n.bottom + 4, G.code = t, G.visible = !0;
    }
    function Dn() {
      G.visible = !1;
    }
    const vt = I(() => {
      const e = G.code;
      if (!e) return { message: "No speaker set on this line yet" };
      const t = L.value.find((s) => s.code === e);
      if (!t) return { message: `"${e}" is not a role code in _roles.json -- used directly as a preset name` };
      const n = Object.entries(t).filter(([, s]) => s !== "" && s !== null && s !== void 0 && s !== t.__key);
      return n.length ? { fields: n } : { message: `"${e}" has no fields set in _roles.json` };
    });
    function zn(e, t) {
      return te.has(e) ? "Re-voicing..." : Ie(t) && !Pe(e, t) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : Pe(e, t) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
    }
    async function Ut(e, t) {
      if (!te.has(e)) {
        te.add(e), m("Re-voicing...");
        try {
          const n = await St(at(e.speaker), e.instruct, e.text);
          await l.revoiceApi.revoiceLine({
            linePosition: H.value.get(t),
            speaker: e.speaker,
            instruct: e.instruct,
            text: e.text,
            contentHash: n,
            file: C.value,
            folder: l.folder,
            baseName: X.value
          }), await _e();
          const s = H.value.get(t), a = nn(s, n), r = Ce.value.has(a);
          console.log("[FL revoice] after render:", {
            position: s,
            expectedFile: a,
            foundOnDisk: r,
            linesDir: Fe.value,
            filesInDir: [...Ce.value]
          }), m(r ? "Line re-voiced" : `Re-voice finished but ${a} is not in ${Fe.value} -- see the console`);
        } catch (n) {
          m(`Re-voice failed: ${n.message || n}`);
        } finally {
          te.delete(e), Be();
        }
      }
    }
    function Vt(e, t) {
      return !e.malformed && Ie(t) && !Pe(e, t);
    }
    const We = k(!1), mt = I(() => c.value.filter((e, t) => Vt(e, t)).length), Fn = I(() => mt.value > 0 ? `Re-voice ${mt.value} line(s) whose text/speaker/instruct changed since they were last rendered (the gold 🔁 rows), one at a time` : "No line in this script needs re-voicing right now");
    async function Nn() {
      if (We.value) return;
      const e = c.value.filter((t, n) => Vt(t, n));
      if (e.length) {
        We.value = !0;
        try {
          for (const t of e) {
            const n = c.value.indexOf(t);
            n !== -1 && await Ut(t, n);
          }
          m(`Re-voiced ${e.length} line(s)`);
        } finally {
          We.value = !1;
        }
      }
    }
    function Bt(e) {
      return P.value ? ye.value === Oe.value.get(e) && Z.value : ee.value === e;
    }
    function ht(e, t) {
      return P.value ? Oe.value.get(e) !== void 0 : Ie(e);
    }
    function On(e, t) {
      if (ht(t))
        if (P.value) {
          const n = Oe.value.get(t), s = De.value;
          if (n === void 0 || !s || !M.value) return;
          s.currentTime = M.value.lines[n].start, s.play();
        } else ee.value === t ? Ue() : jt(t);
    }
    const yt = I(() => P.value ? Z.value : ee.value !== -1), kt = I(() => P.value ? !!F.best : c.value.some((e, t) => !e.malformed && Ie(t))), Un = I(() => kt.value ? yt.value ? "Pause" : P.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
    function Vn() {
      if (kt.value)
        if (P.value) {
          const e = De.value;
          if (!e) return;
          Z.value ? e.pause() : e.play();
        } else ee.value !== -1 ? Ue() : jt(0);
    }
    async function se({ silent: e = !1 } = {}) {
      e || (F.checking = !0);
      try {
        const n = await (await fetch(`${Kt}?path=${encodeURIComponent(ze.value)}`)).json(), s = Array.isArray(n.files) ? n.files : [], a = n.file_mtimes || {}, r = X.value.toLowerCase(), y = s.filter((N) => {
          const O = N.lastIndexOf(".");
          return (O > 0 ? N.slice(0, O) : N).toLowerCase().startsWith(r);
        });
        y.sort();
        const b = y.length ? y[y.length - 1] : null, R = b ? `${b}::${a[b] || ""}` : null;
        if (e && R === ce) return;
        ce = R, F.checking = !1, F.error = null, F.best = b, F.mtime = b ? a[b] || Date.now() : null, b || (Z.value = !1, de(Ve));
      } catch (t) {
        F.checking = !1, F.error = String(t);
      }
    }
    const Bn = I(() => !F.best);
    async function Mn() {
      if (!(!F.best || !await x({
        title: "Delete rendered audio?",
        message: `Deletes every _audio\\ file matching "${X.value}" (currently: ${F.best})${P.value ? " -- this also un-marks the script as done" : ""}.`,
        okText: "Delete",
        cancelText: "Cancel"
      })))
        try {
          const n = await (await fetch(`${ae}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: l.folder, base_name: X.value, filename: C.value })
          })).json();
          if (n.error) {
            m(`Error: ${n.error}`);
            return;
          }
          m(`Deleted ${n.deleted.length} audio file(s)`), $.value = $.value.filter((s) => s !== C.value), ce = null, se();
        } catch (t) {
          m(`Error: ${t}`);
        }
    }
    function Wn(e) {
      var t;
      (t = l.checkedApi) == null || t.setChecked(C.value, e);
    }
    const Hn = I(() => !P.value && !rt.value), qn = I(() => P.value ? "Marked ready to release -- click to unmark and go back to editing" : rt.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
    async function Kn() {
      var n;
      const e = !P.value;
      if (e && !rt.value) {
        m("Every line needs to be voiced before marking done");
        return;
      }
      if (e) {
        m("Stitching final file...");
        const s = c.value.filter((a) => !a.malformed);
        try {
          const r = await (await fetch(`${ae}/stitch_lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder: l.folder,
              base_name: X.value,
              // Each position's own current hash -- lets stitch_lines
              // read the EXACT file that content hashes to, no
              // directory-scan guessing (see nodes/_line_audio.py's
              // expected_path).
              line_hashes: s.map((y) => Ne.get(y.__key)),
              line_texts: s.map((y) => y.text)
            })
          })).json();
          if (r.error) {
            m(`Stitch error: ${r.error}`);
            return;
          }
        } catch (a) {
          m(`Stitch failed: ${a}`);
          return;
        }
        $.value = [.../* @__PURE__ */ new Set([...$.value, C.value])], (n = l.checkedApi) == null || n.setChecked(C.value, !1), Le.value = !1, m("Stitched and marked done"), ce = null, ue = null, se(), xe();
        return;
      }
      if (await x({
        title: "Unmark done?",
        message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
        okText: "Unmark",
        cancelText: "Cancel"
      }))
        try {
          const a = await (await fetch(`${ae}/delete_audio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: l.folder, base_name: X.value, filename: C.value })
          })).json();
          if (a.error) {
            m(`Error: ${a.error}`);
            return;
          }
          $.value = $.value.filter((r) => r !== C.value), m("Unmarked -- can be edited/re-voiced again"), ce = null, se();
        } catch (s) {
          m(`Error: ${s}`);
        }
    }
    function Jn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" && e.tagName !== "INPUT") {
        m("Click into a line's text first, place the cursor right after the vowel to stress");
        return;
      }
      const t = e.selectionStart;
      e.value = e.value.slice(0, t) + "́" + e.value.slice(t), e.selectionStart = e.selectionEnd = t + 1, e.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    function Gn() {
      const e = document.activeElement;
      if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
        m("Click into a line's text first, place the cursor where it should split");
        return;
      }
      const t = e.closest(".fl-line-row"), n = t ? Number(t.dataset.rowIndex) : -1, s = n >= 0 ? c.value[n] : null;
      if (!s || s.malformed) {
        m("Can't split a malformed/raw line -- fix it to plain text first");
        return;
      }
      const a = H.value.get(n), r = H.value.size, y = e.selectionStart, b = s.text.slice(0, y).trimEnd(), R = s.text.slice(y).trimStart();
      s.text = b;
      const N = h({ speaker: s.speaker, instruct: s.instruct, text: R, raw: "", malformed: !1 });
      if (c.value.splice(n + 1, 0, N), Y(s), Y(N), Lt(N.__key), q(), a !== void 0) {
        const O = a + 1, U = [];
        for (let He = r - 1; He >= O; He--) U.push([He, He + 1]);
        ct({ moves: U });
      }
    }
    function Xn() {
      const e = h({ speaker: "", instruct: "", text: "", raw: "", malformed: !1 });
      c.value.push(e), Y(e), Lt(e.__key), q();
    }
    const ie = I(() => _.value.indexOf(C.value)), Yn = I(() => !(ie.value > 0)), Qn = I(() => !(ie.value >= 0 && ie.value < _.value.length - 1));
    function Zn() {
      ie.value > 0 && Wt(_.value[ie.value - 1]);
    }
    function es() {
      ie.value >= 0 && ie.value < _.value.length - 1 && Wt(_.value[ie.value + 1]);
    }
    async function ts() {
      try {
        const t = await (await fetch(ls)).json();
        he.value = t.presets || [], T.value = t.dir || "";
      } catch {
        he.value = [], T.value = "";
      }
    }
    async function Mt() {
      var e, t, n;
      try {
        const s = `${ae}/scan?path=${encodeURIComponent(l.folder)}&act=&suffix=${encodeURIComponent(l.suffix)}`, r = await (await fetch(s)).json();
        E.value = ((e = r.instruct_categories) == null ? void 0 : e.entries) || [], L.value = ((t = r.roles) == null ? void 0 : t.entries) || [], z.value = ((n = r.roles) == null ? void 0 : n.path) || null, _.value = Array.isArray(r.scripts) ? r.scripts : [], $.value = Array.isArray(r.ready_scripts) ? r.ready_scripts : [];
      } catch {
        E.value = [], L.value = [], z.value = null, _.value = [], $.value = [];
      }
    }
    async function Wt(e) {
      !e || e === C.value || nt || (ne && (clearTimeout(ne), ne = null, await Be()), C.value = e, ce = null, re.value = null, ue = null, c.value = [], pe = null, tt = 0, Le.value = l.checkedApi ? l.checkedApi.isChecked(e) : !1, m("Loading..."), await gt(), se(), xe());
    }
    async function gt({ isPoll: e = !1 } = {}) {
      try {
        const n = await (await fetch(`${Ke}/read?path=${encodeURIComponent(xt.value)}`)).json();
        if (n.error) {
          m(`Read error: ${n.error}`);
          return;
        }
        if (!n.exists) {
          e || (c.value = [], pe = "", m("File does not exist yet (will be created on first edit)"));
          return;
        }
        if (e && Date.now() - tt < fi || n.content === pe) return;
        c.value = d(n.content), pe = n.content, ot(), e || m(`Loaded ${c.value.length} line(s)`);
      } catch (t) {
        m(`Read failed: ${t}`);
      }
    }
    return qe(M, () => de(Ve)), qe(et, hn), is(() => {
      Mt(), ts(), se(), _e(), ge = setInterval(() => {
        se({ silent: !0 }), _e();
      }, $t), gt().then(() => {
        ke = setInterval(() => gt({ isPoll: !0 }), $t), xe(), be = setInterval(() => xe({ silent: !0 }), $t);
      });
    }), as(() => {
      Ue(), ke && clearInterval(ke), ge && clearInterval(ge), be && clearInterval(be);
    }), (e, t) => (v(), S(W, null, [
      f(o(Ze), {
        visible: oe.value,
        "onUpdate:visible": t[8] || (t[8] = (n) => oe.value = n),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: K({ width: o(sn) }),
        class: "line-editor-dialog"
      }, {
        header: g(() => [
          f(Pt, {
            title: C.value,
            status: Ee.value,
            "width-presets": o(ln),
            "set-width": o(an),
            "font-size-decrease": o(on),
            "font-size-increase": o(rn)
          }, null, 8, ["title", "status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: g(() => [
          f(As, { class: "line-editor-controls" }, {
            default: g(() => [
              p("div", Ks, [
                p("span", {
                  class: le(["play-btn global-play-btn", { "is-playing": yt.value, disabled: !kt.value }]),
                  title: Un.value,
                  onClick: Vn
                }, D(yt.value ? "⏸" : "▶"), 11, Js),
                F.best ? (v(), S(W, { key: 0 }, [
                  p("audio", {
                    ref_key: "audioElRef",
                    ref: De,
                    controls: "",
                    class: "audio-el",
                    src: `${o(ae)}/audio?path=${encodeURIComponent(o(Q)(ze.value, F.best))}&v=${encodeURIComponent(F.mtime || "")}`,
                    onTimeupdate: Ve,
                    onPlay: t[0] || (t[0] = (n) => Z.value = !0),
                    onPause: t[1] || (t[1] = (n) => Z.value = !1),
                    onEnded: t[2] || (t[2] = (n) => Z.value = !1)
                  }, null, 40, Gs),
                  f(o(A), {
                    label: "Delete audio",
                    text: "",
                    size: "small",
                    disabled: Bn.value,
                    title: P.value ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                    onClick: Mn,
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title"])
                ], 64)) : B("", !0),
                f(o(A), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: t[3] || (t[3] = (n) => se())
                })
              ]),
              vn.value ? (v(), S("div", Xs, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : B("", !0),
              p("div", Ys, [
                p("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: Le.value,
                  disabled: !i.checkedApi || P.value,
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: t[4] || (t[4] = (n) => {
                    Le.value = n.target.checked, Wn(n.target.checked);
                  })
                }, null, 40, Qs),
                f(o(A), {
                  label: P.value ? "Done ✓" : "Done",
                  size: "small",
                  outlined: !P.value,
                  disabled: Hn.value,
                  title: qn.value,
                  onClick: Kn
                }, null, 8, ["label", "outlined", "disabled", "title"]),
                t[11] || (t[11] = p("div", { class: "actions-divider" }, null, -1)),
                f(o(A), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a line's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: Ae(Jn, ["prevent"])
                }),
                f(o(A), {
                  label: "✂ Split line",
                  text: "",
                  size: "small",
                  title: "Split this line into two at the cursor: click into a line's text, place the cursor where it should split, then click this",
                  onMousedown: Ae(Gn, ["prevent"])
                }),
                f(o(A), {
                  label: "+ Add line",
                  text: "",
                  size: "small",
                  title: "Add a new empty line at the end of the script",
                  onClick: Xn
                }),
                f(o(A), {
                  label: "🔁 Re-voice pending",
                  text: "",
                  size: "small",
                  disabled: !i.revoiceApi || P.value || mt.value === 0 || We.value,
                  title: Fn.value,
                  onClick: Nn
                }, null, 8, ["disabled", "title"]),
                t[12] || (t[12] = p("div", { class: "actions-divider" }, null, -1)),
                f(o(A), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: Yn.value,
                  title: "Open the previous script in this act",
                  onClick: Zn
                }, null, 8, ["disabled"]),
                f(o(A), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: Qn.value,
                  title: "Open the next script in this act",
                  onClick: es
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          p("div", {
            ref_key: "rowsContainerEl",
            ref: it,
            class: "rows-container"
          }, [
            (v(!0), S(W, null, je(c.value, (n, s) => (v(), S("div", {
              key: n.__key,
              class: le(["fl-line-row", { "row-enter": Te.value === n.__key, "row-playing": P.value ? Oe.value.get(s) === ye.value : ee.value === s }]),
              "data-row-index": s,
              ref_for: !0,
              ref: (a) => yn(n.__key, a)
            }, [
              p("div", {
                class: "line-rail",
                style: K(n.malformed ? {} : { backgroundColor: o(tn)(n.speaker) }),
                title: "Drag onto another line to merge them",
                ref_for: !0,
                ref: (a) => gn(a, s)
              }, [
                p("span", ei, D(s + 1), 1),
                t[13] || (t[13] = p("i", { class: "pi pi-arrows-v" }, null, -1))
              ], 4),
              p("div", ti, [
                n.malformed ? (v(), S(W, { key: 0 }, [
                  p("div", ni, [
                    t[14] || (t[14] = p("div", { class: "malformed-warn" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                    f(o(A), {
                      icon: "pi pi-trash",
                      text: "",
                      size: "small",
                      title: "Delete this line",
                      onClick: (a) => Tt(s, n.raw)
                    }, null, 8, ["onClick"])
                  ]),
                  f(o(Gt), {
                    modelValue: n.raw,
                    "onUpdate:modelValue": [
                      (a) => n.raw = a,
                      t[5] || (t[5] = (a) => q())
                    ],
                    "auto-resize": "",
                    class: "fl-textarea malformed-textarea",
                    style: K({ fontSize: `${o(et)}px` }),
                    rows: "1",
                    ref_for: !0,
                    ref: (a) => {
                      Et(n.__key, a), de(() => Me(o(we).get(n.__key)));
                    },
                    onKeydown: t[6] || (t[6] = Jt(Ae(() => {
                    }, ["prevent"]), ["enter"]))
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
                ], 64)) : (v(), S(W, { key: 1 }, [
                  p("div", si, [
                    p("span", {
                      class: le(["play-btn", { "is-playing": Bt(s), disabled: !ht(s, n) }]),
                      title: ht(s, n) ? P.value ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                      onClick: (a) => On(n, s)
                    }, D(Bt(s) ? "⏸" : "▶"), 11, ii),
                    f(o(Xe), { class: "speaker-group" }, {
                      default: g(() => [
                        f(o(Ye), null, {
                          default: g(() => [...t[15] || (t[15] = [
                            p("i", { class: "pi pi-address-book" }, null, -1)
                          ])]),
                          _: 1
                        }),
                        f(o(ps), {
                          "model-value": n.speaker,
                          options: L.value,
                          "option-label": "code",
                          "option-value": "code",
                          editable: "",
                          filter: "",
                          placeholder: "Speaker",
                          title: "Speaker (role code, or a literal preset/preset#tag)",
                          "onUpdate:modelValue": (a) => {
                            n.speaker = a, Sn(n);
                          }
                        }, {
                          option: g(({ option: a }) => [
                            p("div", ai, D(a.code), 1),
                            Ft(a) ? (v(), S("div", li, D(Ft(a)), 1)) : B("", !0)
                          ]),
                          _: 1
                        }, 8, ["model-value", "options", "onUpdate:modelValue"])
                      ]),
                      _: 2
                    }, 1024),
                    f(o(Xe), { class: "instruct-group" }, {
                      default: g(() => [
                        f(o(Ye), null, {
                          default: g(() => [...t[16] || (t[16] = [
                            p("i", { class: "pi pi-book" }, null, -1)
                          ])]),
                          _: 1
                        }),
                        f(o(A), {
                          icon: "pi pi-undo",
                          size: "small",
                          class: "instruct-undo-btn",
                          disabled: n.__prevInstruct === void 0,
                          title: An(n),
                          onClick: (a) => jn(n)
                        }, null, 8, ["disabled", "title", "onClick"]),
                        f(o(Xt), {
                          modelValue: n.instruct,
                          "onUpdate:modelValue": (a) => n.instruct = a,
                          placeholder: "Instruct",
                          title: "Instruct text -- type freely, or pick from the phrase bank",
                          onInput: (a) => ut(n)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"]),
                        f(o(A), {
                          icon: "pi pi-th-large",
                          size: "small",
                          title: "Pick an instruct phrase from the category bank",
                          onClick: (a) => xn(n)
                        }, null, 8, ["onClick"]),
                        f(o(A), {
                          icon: "pi pi-users",
                          size: "small",
                          class: "apply-instruct-btn",
                          disabled: dt(n) === 0,
                          title: $n(n),
                          onClick: (a) => wn(n)
                        }, null, 8, ["disabled", "title", "onClick"])
                      ]),
                      _: 2
                    }, 1024),
                    f(o(Xe), { class: "speaker-file-group" }, {
                      default: g(() => {
                        var a;
                        return [
                          i.revoiceApi && !P.value ? (v(), J(o(A), {
                            key: 0,
                            class: le(["revoice-btn", { pending: te.has(n), stale: !te.has(n) && Ie(s) && !Pe(n, s) }]),
                            size: "small",
                            icon: te.has(n) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                            disabled: te.has(n),
                            title: zn(n, s),
                            onClick: (r) => Ut(n, s)
                          }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : B("", !0),
                          f(o(Xt), {
                            "model-value": ((a = Re(n)) == null ? void 0 : a.speaker) || "",
                            placeholder: "(no speaker)",
                            class: "speaker-file-input",
                            disabled: !Re(n),
                            title: In(n),
                            "onUpdate:modelValue": (r) => Nt(n, r)
                          }, null, 8, ["model-value", "disabled", "title", "onUpdate:modelValue"]),
                          f(o(A), {
                            icon: "pi pi-microphone",
                            size: "small",
                            disabled: !Re(n),
                            title: "Pick a speaker from the preset gallery",
                            onClick: (r) => En(n)
                          }, null, 8, ["disabled", "onClick"]),
                          f(o(Ye), {
                            class: "role-info-btn",
                            onMouseenter: (r) => Tn(r.target, n.speaker),
                            onMouseleave: Dn
                          }, {
                            default: g(() => [...t[17] || (t[17] = [
                              p("i", { class: "pi pi-info-circle" }, null, -1)
                            ])]),
                            _: 1
                          }, 8, ["onMouseenter"])
                        ];
                      }),
                      _: 2
                    }, 1024),
                    t[18] || (t[18] = p("div", { class: "spacer" }, null, -1)),
                    f(o(A), {
                      icon: "pi pi-times",
                      color: "red",
                      text: "",
                      size: "small",
                      title: "Delete this line",
                      onClick: (a) => Tt(s, n.text)
                    }, null, 8, ["onClick"])
                  ]),
                  Dt(n) ? (v(), S("div", oi, "↳ " + D(Dt(n)), 1)) : B("", !0),
                  f(o(Gt), {
                    modelValue: n.text,
                    "onUpdate:modelValue": [(a) => n.text = a, (a) => {
                      Y(n), q();
                    }],
                    "auto-resize": "",
                    class: "fl-textarea",
                    style: K({ fontSize: `${o(et)}px` }),
                    rows: "1",
                    ref_for: !0,
                    ref: (a) => {
                      Et(n.__key, a), de(() => Me(o(we).get(n.__key)));
                    },
                    onKeydown: t[7] || (t[7] = Jt(Ae(() => {
                    }, ["prevent"]), ["enter"])),
                    onPaste: (a) => _n(n, a.target, a)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "style", "onPaste"])
                ], 64))
              ])
            ], 10, Zs))), 128))
          ], 512)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      f(o(en)),
      f(Ts, {
        visible: ft.value,
        "onUpdate:visible": t[9] || (t[9] = (n) => ft.value = n),
        categories: E.value,
        onSelect: Rn
      }, null, 8, ["visible", "categories"]),
      f(Bs, {
        visible: pt.value,
        "onUpdate:visible": t[10] || (t[10] = (n) => pt.value = n),
        presets: he.value,
        "sample-dir": T.value,
        "usage-for": Pn,
        onSelect: Ln
      }, null, 8, ["visible", "presets", "sample-dir"]),
      G.visible ? (v(), S("div", {
        key: 0,
        class: "role-info-popover",
        style: K({ left: `${G.left}px`, top: `${G.top}px` })
      }, [
        vt.value.message ? (v(), S("div", ri, D(vt.value.message), 1)) : B("", !0),
        (v(!0), S(W, null, je(vt.value.fields, ([n, s]) => (v(), S("div", {
          key: n,
          class: "role-info-row"
        }, [
          p("span", ci, D(n), 1),
          p("span", ui, D(s), 1)
        ]))), 128))
      ], 4)) : B("", !0)
    ], 64));
  }
}, mi = /* @__PURE__ */ Qe(vi, [["__scopeId", "data-v-b0336270"]]);
function bi({ folder: i, filename: l, suffix: u = "", checkedApi: w, revoiceApi: h }) {
  us(import.meta.url);
  const d = document.createElement("div");
  document.body.appendChild(d);
  const j = ds(mi, {
    folder: i,
    filename: l,
    suffix: u,
    checkedApi: w || null,
    revoiceApi: h || null,
    onClose: () => {
      j.unmount(), d.remove();
    }
  });
  j.use(fs, { ripple: !0 }), j.use(ms), j.mount(d);
}
export {
  bi as openLineEditor
};
