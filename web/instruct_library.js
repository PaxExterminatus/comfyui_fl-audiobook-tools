import { _ as j, a as k, c as U, a4 as ee, r as P, f as z, g as E, h as Q, i as N, d, k as B, u as l, F as W, j as G, b, t as I, M as te, l as H, S as pe, p as be, A as fe, w as ve, n as he, m as q, E as ne, z as we, e as ke } from "./styles_link.js";
import { u as se, a as ae, D as ge } from "./DialogHeader.js";
const $e = {}, xe = { class: "sticky-panel" };
function Se(e, n) {
  return k(), U("div", xe, [
    ee(e.$slots, "default", {}, void 0, !0)
  ]);
}
const It = /* @__PURE__ */ j($e, [["render", Se], ["__scopeId", "data-v-36817aaa"]]), _e = { class: "instruct-example-list list" }, Ce = {
  __name: "InstructPickerDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    categories: { type: Array, default: () => [] }
  },
  emits: ["update:visible", "select"],
  setup(e, { emit: n }) {
    const { cssWidth: t, setWidth: r, presets: s } = se({
      storageKey: "FL_CosyVoice3.InstructPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: h, decrease: p, increase: f } = ae({
      storageKey: "FL_CosyVoice3.InstructPicker.fontSizePx",
      defaultSize: 13
    }), i = n;
    function o($) {
      i("select", $), i("update:visible", !1);
    }
    return ($, g) => {
      const x = P("Message"), u = P("Button"), S = P("Card"), L = P("Dialog");
      return k(), z(L, {
        visible: e.visible,
        modal: "",
        header: " ",
        style: B({ width: l(t) }),
        "onUpdate:visible": g[0] || (g[0] = (w) => $.$emit("update:visible", w))
      }, {
        header: E(() => [
          b(ge, {
            title: "Pick an instruct phrase",
            "width-presets": l(s),
            "set-width": l(r),
            "font-size-decrease": l(p),
            "font-size-increase": l(f)
          }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: E(() => [
          e.categories.length ? N("", !0) : (k(), z(x, {
            key: 0,
            severity: "info",
            closable: !1
          }, {
            default: E(() => [...g[1] || (g[1] = [
              Q(" No _instruct_categories.json found for this project -- you can still type any instruct text directly. ", -1)
            ])]),
            _: 1
          })),
          d("div", {
            class: "grid",
            style: B([{ "--grid-min": "280px" }, { fontSize: `${l(h)}px` }])
          }, [
            (k(!0), U(W, null, G(e.categories, (w) => (k(), z(S, {
              key: w.name
            }, {
              title: E(() => [
                Q(I(w.title), 1)
              ]),
              subtitle: E(() => [
                Q(I(w.when), 1)
              ]),
              content: E(() => [
                d("ul", _e, [
                  (k(!0), U(W, null, G(w.examples, (m) => (k(), U("li", { key: m }, [
                    b(u, {
                      label: m,
                      text: "",
                      class: "instruct-example-btn w100p",
                      onClick: (v) => o(m)
                    }, null, 8, ["label", "onClick"])
                  ]))), 128))
                ])
              ]),
              _: 2
            }, 1024))), 128))
          ], 4)
        ]),
        _: 1
      }, 8, ["visible", "style"]);
    };
  }
}, Ut = /* @__PURE__ */ j(Ce, [["__scopeId", "data-v-4487df15"]]);
function Ee(e) {
  if (!e) return "#353535";
  let n = 0;
  for (let t = 0; t < e.length; t++) n = n * 31 + e.charCodeAt(t) >>> 0;
  return `hsl(${n % 360}, 55%, 55%, 0.3)`;
}
function Pe(e) {
  const n = (e || "").toUpperCase().replace(/[^A-ZА-Я0-9]/g, "");
  if (!n) return "?";
  const t = n[0], r = [...n.slice(1)].find((s) => s !== t);
  return r ? t + r : t;
}
const Te = ["onClick"], Ie = { class: "speaker-card-text" }, Ue = { class: "speaker-name mono" }, Le = {
  key: 0,
  class: "muted"
}, Ae = ["onClick"], Re = {
  __name: "SpeakerPickerDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    presets: { type: Array, default: () => [] },
    /*
     Absolute folder holding each preset's OWN .pt file -- also where a
     same-named sample .mp3/.wav is expected to live (see the /audio
     route this samples from; "" means presets haven't loaded yet, no
     preview is offered until they have).
    */
    sampleDir: { type: String, default: "" },
    /*
     Optional (preset: string) => sublabel text, e.g. "used by: ..." --
     the caller already has this logic (see LineEditorApp.vue's
     speakerUsageSubLabel); kept out of this component so it stays a
     plain preset-picker with no opinion on who's "using" what.
    */
    usageFor: { type: Function, default: null }
  },
  emits: ["update:visible", "select"],
  setup(e, { emit: n }) {
    const t = e, r = n, { cssWidth: s, setWidth: h, presets: p } = se({
      storageKey: "FL_CosyVoice3.SpeakerPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: f, decrease: i, increase: o } = ae({
      storageKey: "FL_CosyVoice3.SpeakerPicker.fontSizePx",
      defaultSize: 13
    });
    function $(w) {
      r("select", w), r("update:visible", !1);
    }
    const g = H(null);
    let x = null;
    function u(w, m) {
      return `${pe}/audio?path=${encodeURIComponent(be(t.sampleDir, `${w}.${m}`))}`;
    }
    function S() {
      x == null || x.pause(), x = null, g.value = null;
    }
    function L(w) {
      if (g.value === w) {
        S();
        return;
      }
      if (S(), !t.sampleDir) return;
      const m = new Audio(u(w, "mp3"));
      let v = !1;
      m.addEventListener("error", () => {
        if (v) {
          g.value === w && S();
          return;
        }
        v = !0, m.src = u(w, "wav"), m.play().catch(() => S());
      }), m.addEventListener("ended", () => {
        g.value === w && S();
      }), m.play().catch(() => S()), x = m, g.value = w;
    }
    return (w, m) => {
      const v = P("Message"), M = P("Button"), D = P("Card"), K = P("Dialog");
      return k(), z(K, {
        visible: e.visible,
        modal: "",
        header: " ",
        style: B({ width: l(s) }),
        "onUpdate:visible": m[0] || (m[0] = (R) => {
          S(), w.$emit("update:visible", R);
        })
      }, {
        header: E(() => [
          b(ge, {
            title: "Pick a speaker",
            "width-presets": l(p),
            "set-width": l(h),
            "font-size-decrease": l(i),
            "font-size-increase": l(o)
          }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: E(() => [
          e.presets.length ? N("", !0) : (k(), z(v, {
            key: 0,
            severity: "info",
            closable: !1
          }, {
            default: E(() => [...m[1] || (m[1] = [
              Q(" No saved speaker presets found. ", -1)
            ])]),
            _: 1
          })),
          d("div", {
            class: "grid",
            style: B([{ "--grid-min": "220px" }, { fontSize: `${l(f)}px` }])
          }, [
            (k(!0), U(W, null, G(e.presets, (R) => (k(), z(D, { key: R }, {
              content: E(() => [
                d("div", {
                  class: "speaker-card-row row",
                  onClick: (Y) => $(R)
                }, [
                  d("div", {
                    class: "avatar",
                    style: B({ backgroundColor: l(Ee)(R) })
                  }, I(l(Pe)(R)), 5),
                  d("div", Ie, [
                    d("div", Ue, I(R), 1),
                    e.usageFor && e.usageFor(R) ? (k(), U("div", Le, I(e.usageFor(R)), 1)) : N("", !0)
                  ]),
                  d("span", {
                    class: "speaker-play-wrap",
                    onClick: te((Y) => L(R), ["stop"])
                  }, [
                    b(M, {
                      icon: g.value === R ? "pi pi-pause" : "pi pi-play",
                      disabled: !e.sampleDir,
                      title: "Preview this speaker's sample"
                    }, null, 8, ["icon", "disabled"])
                  ], 8, Ae)
                ], 8, Te)
              ]),
              _: 2
            }, 1024))), 128))
          ], 4)
        ]),
        _: 1
      }, 8, ["visible", "style"]);
    };
  }
}, Lt = /* @__PURE__ */ j(Re, [["__scopeId", "data-v-6dbc195d"]]), O = fe({}), J = /* @__PURE__ */ new Map(), De = 0.15, Ne = 0.4;
function ze() {
  function e(o) {
    return `${pe}/audio?path=${encodeURIComponent(o)}`;
  }
  function n(o, $) {
    if (!o || !$) return "";
    const g = String(o).replace(/\\/g, "/").replace(/\/$/, "");
    return e(`${g}/audio_en/${$}.wav`);
  }
  function t(o, $, g) {
    if (!o || !$) return "";
    const x = String(o).replace(/\\/g, "/").replace(/\/$/, ""), u = e(`${x}/audio_ru/${$}.wav`);
    return g ? `${u}&v=${g}` : u;
  }
  function r(o, $, g, x, u) {
    if (!o || !$ || g == null || !x || u == null) return "";
    const S = String(o).replace(/\\/g, "/").replace(/\/$/, ""), L = String(g).padStart(3, "0"), w = `${$}_v${L}_${x}_s${u}.wav`;
    return e(`${S}/_dub_versions/${w}`);
  }
  function s(o) {
    if (!o) return Promise.resolve(null);
    if (o in O) return Promise.resolve(O[o]);
    if (J.has(o)) return J.get(o);
    const $ = new Promise((g) => {
      const x = new Audio();
      let u = !1;
      const S = (L) => {
        u || (u = !0, O[o] = L, J.delete(o), g(L));
      };
      x.addEventListener("loadedmetadata", () => S(x.duration || null)), x.addEventListener("error", () => S(null)), setTimeout(() => S(null), 8e3), x.preload = "metadata", x.src = o;
    });
    return J.set(o, $), $;
  }
  function h(o) {
    return o && o in O ? O[o] : null;
  }
  function p(o, $) {
    if (o == null || $ == null || o <= 0) return null;
    const g = ($ - o) / o, x = Math.round(g * 100), u = Math.abs(g);
    return { level: u <= De ? "good" : u <= Ne ? "warn" : "bad", pct: x, pctText: `${x >= 0 ? "+" : ""}${x}%` };
  }
  function f(o) {
    return o == null ? "—" : `${o.toFixed(2)}s`;
  }
  function i() {
    Object.keys(O).forEach((o) => delete O[o]), J.clear();
  }
  return {
    durations: O,
    buildUrl: e,
    enUrl: n,
    ruUrl: t,
    versionUrl: r,
    getDuration: s,
    getCached: h,
    calcDelta: p,
    formatSeconds: f,
    clear: i
  };
}
const Fe = {
  good: "text-success",
  warn: "text-active",
  bad: "text-warning"
};
function Ve(e) {
  return Fe[e] || "";
}
const Be = {
  key: 0,
  class: "history-original-row row panel"
}, Me = {
  key: 0,
  class: "muted"
}, Oe = ["title"], We = { class: "row" }, Ge = { class: "title" }, je = {
  key: 0,
  class: "pill text-success"
}, Ke = { class: "muted" }, He = { class: "row" }, qe = { class: "mono muted" }, Ye = { class: "history-snapshot card" }, Je = { class: "mono muted" }, Qe = { class: "muted" }, Xe = { class: "history-snapshot-text" }, Ze = { class: "history-card-actions actions" }, et = {
  __name: "LineHistoryDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    versions: { type: Array, default: () => [] },
    chosenVersion: { type: Number, default: null },
    original: { type: String, default: "" },
    root: { type: String, default: "" },
    audioKey: { type: String, default: "" }
  },
  emits: ["update:visible", "select"],
  setup(e, { emit: n }) {
    const t = e, r = n, { enUrl: s, versionUrl: h, getDuration: p, getCached: f, calcDelta: i, formatSeconds: o } = ze(), { cssWidth: $ } = se({
      storageKey: "FL_CosyVoice3.LineHistory.widthPx",
      defaultWidth: 1e3,
      presets: [800, 1e3, 1300]
    }), { fontSizePx: g } = ae({
      storageKey: "FL_CosyVoice3.LineHistory.fontSizePx",
      defaultSize: 13
    }), x = q(() => [...t.versions].sort((_, c) => c.version - _.version)), u = q(() => s(t.root, t.audioKey)), S = q(() => f(u.value));
    function L(_) {
      return h(t.root, t.audioKey, _.version, _.hash, _.seed);
    }
    function w(_) {
      return i(S.value, f(L(_)));
    }
    async function m() {
      u.value && await p(u.value);
      for (const _ of x.value) {
        const c = L(_);
        c && await p(c);
      }
    }
    ve(() => t.visible, (_) => {
      _ ? (D(), m()) : D();
    });
    const v = H(null);
    let M = null;
    function D() {
      M && (M.pause(), M = null), v.value = null;
    }
    function K(_, c) {
      if (D(), !_) return;
      const a = new Audio(_);
      M = a, v.value = c, a.addEventListener("ended", () => {
        v.value === c && D();
      }), a.addEventListener("error", () => {
        v.value === c && D();
      }), a.play().catch(() => {
        v.value === c && D();
      });
    }
    function R() {
      v.value === "original" ? D() : K(u.value, "original");
    }
    function Y(_) {
      const c = _.version;
      v.value === c ? D() : K(L(_), c);
    }
    function X(_) {
      return v.value === _.version;
    }
    function oe(_) {
      r("select", _), r("update:visible", !1);
    }
    function ie(_) {
      try {
        return new Date(_).toLocaleString();
      } catch {
        return _;
      }
    }
    return (_, c) => {
      const a = P("Button"), C = P("ButtonGroup"), T = P("Message"), A = P("Card"), F = P("Dialog");
      return k(), z(F, {
        visible: e.visible,
        modal: "",
        header: "История строки",
        style: B({ width: l($) }),
        "onUpdate:visible": c[0] || (c[0] = (y) => {
          D(), _.$emit("update:visible", y);
        })
      }, {
        default: E(() => [
          u.value ? (k(), U("div", Be, [
            b(C, null, {
              default: E(() => [
                b(a, {
                  severity: v.value === "original" ? "primary" : "secondary",
                  icon: v.value === "original" ? "pi pi-pause" : "pi pi-volume-up",
                  label: "Original (EN)",
                  title: "Play EN reference take",
                  onClick: R
                }, null, 8, ["severity", "icon"])
              ]),
              _: 1
            }),
            S.value ? (k(), U("span", Me, I(l(o)(S.value)), 1)) : N("", !0),
            e.original ? (k(), U("span", {
              key: 1,
              title: e.original
            }, I(e.original), 9, Oe)) : N("", !0)
          ])) : N("", !0),
          e.versions.length ? (k(), U("div", {
            key: 2,
            class: "grid",
            style: B([{ "--grid-min": "320px" }, { fontSize: `${l(g)}px` }])
          }, [
            (k(!0), U(W, null, G(x.value, (y) => (k(), z(A, {
              key: y.version
            }, {
              content: E(() => [
                d("div", We, [
                  d("span", Ge, "Версия " + I(y.version), 1),
                  y.version === e.chosenVersion ? (k(), U("span", je, "✓ Активна")) : N("", !0)
                ]),
                d("div", Ke, " сид " + I(y.seed) + " · " + I(ie(y.created_at)), 1),
                d("div", He, [
                  d("span", qe, I(l(o)(l(f)(L(y)))), 1),
                  w(y) ? (k(), U("span", {
                    key: 0,
                    class: he(["history-duration-delta", l(Ve)(w(y).level)])
                  }, I(w(y).pctText) + " vs EN ", 3)) : N("", !0)
                ]),
                d("div", Ye, [
                  d("div", Je, I(y.speaker), 1),
                  d("div", Qe, I(y.instruct), 1),
                  d("div", Xe, I(y.text), 1)
                ]),
                d("div", Ze, [
                  b(C, null, {
                    default: E(() => [
                      b(a, {
                        severity: X(y) ? "primary" : "secondary",
                        icon: X(y) ? "pi pi-pause" : "pi pi-play",
                        label: "Play",
                        title: "Прослушать этот дубль",
                        onClick: (V) => Y(y)
                      }, null, 8, ["severity", "icon", "onClick"]),
                      b(a, {
                        label: "Сделать активной",
                        icon: "pi pi-check",
                        disabled: y.version === e.chosenVersion,
                        onClick: (V) => oe(y.version)
                      }, null, 8, ["disabled", "onClick"])
                    ]),
                    _: 2
                  }, 1024)
                ])
              ]),
              _: 2
            }, 1024))), 128))
          ], 4)) : (k(), z(T, {
            key: 1,
            severity: "info",
            closable: !1
          }, {
            default: E(() => [...c[1] || (c[1] = [
              Q(" Для этой строки ещё нет истории озвучки. ", -1)
            ])]),
            _: 1
          }))
        ]),
        _: 1
      }, 8, ["visible", "style"]);
    };
  }
}, At = /* @__PURE__ */ j(et, [["__scopeId", "data-v-c5b7e592"]]), tt = { class: "dropdown-option-label ellipsis" }, nt = {
  key: 0,
  class: "muted ellipsis"
}, ot = {
  __name: "RoleDropdown",
  props: {
    modelValue: { type: String, default: "" },
    roleEntries: { type: Array, default: () => [] },
    // [{code, ...}] -- shape beyond `code` is the caller's own
    optionSubLabel: { type: Function, default: () => "" },
    // (entry) => string, shown under each option's code
    placeholder: { type: String, default: "Speaker" },
    title: { type: String, default: "Role code, or a literal preset/preset#tag" }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: n }) {
    const t = n;
    return (r, s) => {
      const h = P("Dropdown");
      return k(), z(h, {
        "model-value": e.modelValue,
        options: e.roleEntries,
        "option-label": "code",
        "option-value": "code",
        editable: "",
        filter: "",
        placeholder: e.placeholder,
        title: e.title,
        class: "role-dropdown",
        "onUpdate:modelValue": s[0] || (s[0] = (p) => t("update:modelValue", p))
      }, {
        option: E(({ option: p }) => [
          d("div", tt, I(p.code), 1),
          e.optionSubLabel(p) ? (k(), U("div", nt, I(e.optionSubLabel(p)), 1)) : N("", !0)
        ]),
        _: 1
      }, 8, ["model-value", "options", "placeholder", "title"]);
    };
  }
}, it = /* @__PURE__ */ j(ot, [["__scopeId", "data-v-2bb769e8"]]), lt = { class: "tte-header row space-between" }, st = { class: "title" }, at = { class: "tte-body list" }, rt = { class: "tte-play-row row" }, ut = { class: "tte-section list" }, ct = { class: "tte-tag-grid actions" }, dt = { class: "tte-section list" }, pt = { class: "tte-tag-grid actions" }, ft = { class: "tte-section list" }, vt = {
  __name: "TextTagEditorDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    text: { type: String, default: "" },
    title: { type: String, default: "Edit text" },
    originalUrl: { type: String, default: "" },
    currentUrl: { type: String, default: "" }
  },
  emits: ["update:visible", "save"],
  setup(e, { emit: n }) {
    const t = e, r = n, s = H(t.text), h = H(null);
    let p = 0, f = 0;
    ve(() => t.visible, async (c) => {
      c ? (s.value = t.text, p = t.text.length, f = t.text.length, await ne(), i()) : m();
    });
    function i() {
      var a;
      const c = ((a = h.value) == null ? void 0 : a.$el) ?? h.value;
      c && typeof c.focus == "function" && c.focus();
    }
    function o() {
      var a;
      const c = ((a = h.value) == null ? void 0 : a.$el) ?? h.value;
      !c || typeof c.selectionStart != "number" || (p = c.selectionStart, f = c.selectionEnd);
    }
    function $(c, a, C) {
      s.value = c, p = a, f = C, ne(() => {
        var A;
        const T = ((A = h.value) == null ? void 0 : A.$el) ?? h.value;
        T && (T.focus(), T.setSelectionRange(a, C));
      });
    }
    function g(c) {
      const a = s.value, C = p, T = f, A = `<${c}>`, F = a.slice(0, C), V = `${F.length && !/\s$/.test(F) ? " " : ""}${A}`, le = a.slice(0, C) + V + a.slice(T), Z = C + V.length;
      $(le, Z, Z);
    }
    function x(c) {
      const a = s.value, C = p, T = f, A = `<${c}>`, F = `</${c}>`;
      if (T > C) {
        const ue = a.slice(C, T), me = a.slice(0, C) + A + ue + F + a.slice(T), ce = C + A.length + ue.length + F.length;
        $(me, ce, ce);
        return;
      }
      const y = a.slice(0, C), V = y.length && !/\s$/.test(y) ? " " : "", le = `${V}${A}${F}`, Z = a.slice(0, C) + le + a.slice(T), re = C + V.length + A.length;
      $(Z, re, re);
    }
    const u = H(null);
    let S = null;
    const L = q(() => !!t.originalUrl), w = q(() => !!t.currentUrl);
    function m() {
      S && (S.pause(), S = null), u.value = null;
    }
    function v(c, a, C) {
      if (m(), !c) return;
      const T = new Audio(c);
      T.loop = C, S = T, u.value = a, T.addEventListener("ended", () => {
        u.value === a && m();
      }), T.addEventListener("error", (A) => {
        console.error("[TagEditor] audio error", { url: c, error: A }), u.value === a && m();
      }), T.play().catch((A) => {
        console.error("[TagEditor] play rejected", { url: c, error: A }), u.value === a && m();
      });
    }
    function M() {
      u.value === "original" ? m() : v(t.originalUrl, "original", !1);
    }
    function D() {
      u.value === "original-loop" ? m() : v(t.originalUrl, "original-loop", !0);
    }
    function K() {
      u.value === "current" ? m() : v(t.currentUrl, "current", !1);
    }
    function R() {
      u.value === "loop" ? m() : v(t.currentUrl, "loop", !0);
    }
    function Y() {
      m(), r("save", s.value), r("update:visible", !1);
    }
    function X() {
      m(), r("update:visible", !1);
    }
    function oe() {
      o();
    }
    function ie() {
      o();
    }
    function _() {
      o();
    }
    return (c, a) => {
      const C = P("Button"), T = P("ButtonGroup"), A = P("Textarea"), F = P("Dialog");
      return k(), z(F, {
        visible: e.visible,
        modal: "",
        style: { width: "720px" },
        "onUpdate:visible": a[1] || (a[1] = (y) => c.$emit("update:visible", y))
      }, {
        header: E(() => [
          d("div", lt, [
            d("span", st, I(e.title), 1),
            b(T, null, {
              default: E(() => [
                b(C, {
                  label: "Cancel",
                  icon: "pi pi-times",
                  severity: "secondary",
                  outlined: "",
                  onClick: X
                }),
                b(C, {
                  label: "Save",
                  icon: "pi pi-check",
                  onClick: Y
                })
              ]),
              _: 1
            })
          ])
        ]),
        default: E(() => [
          d("div", at, [
            d("div", rt, [
              a[2] || (a[2] = d("span", { class: "tte-play-label muted" }, "EN", -1)),
              b(T, null, {
                default: E(() => [
                  b(C, {
                    severity: u.value === "original" ? "primary" : "secondary",
                    disabled: !L.value,
                    icon: u.value === "original" ? "pi pi-pause" : "pi pi-volume-up",
                    label: "Original",
                    title: L.value ? "Play EN reference take" : "No EN audio for this row",
                    onClick: M
                  }, null, 8, ["severity", "disabled", "icon", "title"]),
                  b(C, {
                    severity: u.value === "original-loop" ? "primary" : "secondary",
                    disabled: !L.value,
                    icon: u.value === "original-loop" ? "pi pi-pause" : "pi pi-replay",
                    label: "Loop",
                    title: L.value ? "Play EN reference take in a loop" : "No EN audio for this row",
                    onClick: D
                  }, null, 8, ["severity", "disabled", "icon", "title"])
                ]),
                _: 1
              }),
              a[3] || (a[3] = d("span", { class: "divider" }, null, -1)),
              a[4] || (a[4] = d("span", { class: "tte-play-label muted" }, "RU", -1)),
              b(T, null, {
                default: E(() => [
                  b(C, {
                    severity: u.value === "current" ? "primary" : "secondary",
                    disabled: !w.value,
                    icon: u.value === "current" ? "pi pi-pause" : "pi pi-play",
                    label: "Current",
                    title: w.value ? "Play current RU take" : "No RU audio for this row yet",
                    onClick: K
                  }, null, 8, ["severity", "disabled", "icon", "title"]),
                  b(C, {
                    severity: u.value === "loop" ? "primary" : "secondary",
                    disabled: !w.value,
                    icon: u.value === "loop" ? "pi pi-pause" : "pi pi-replay",
                    label: "Loop",
                    title: w.value ? "Play current RU take in a loop" : "No RU audio for this row yet",
                    onClick: R
                  }, null, 8, ["severity", "disabled", "icon", "title"])
                ]),
                _: 1
              })
            ]),
            d("div", ut, [
              a[5] || (a[5] = d("div", { class: "tte-section-title muted" }, "Insert tag", -1)),
              d("div", ct, [
                (k(), U(W, null, G([
                  { tag: "breath", label: "Breath" },
                  { tag: "quick_breath", label: "Quick breath" },
                  { tag: "laughter", label: "Laughter" },
                  { tag: "cough", label: "Cough" },
                  { tag: "sigh", label: "Sigh" },
                  { tag: "gasp", label: "Gasp" },
                  { tag: "noise", label: "Noise" },
                  { tag: "hissing", label: "Hissing" },
                  { tag: "vocalized-noise", label: "Vocalized" },
                  { tag: "lipsmack", label: "Lipsmack" },
                  { tag: "mn", label: "Mn" },
                  { tag: "clucking", label: "Clucking" },
                  { tag: "accent", label: "Accent" }
                ], (y) => b(C, {
                  key: y.tag,
                  label: y.label,
                  severity: "secondary",
                  onMousedown: te((V) => g(y.tag), ["prevent"])
                }, null, 8, ["label", "onMousedown"])), 64))
              ])
            ]),
            d("div", dt, [
              a[6] || (a[6] = d("div", { class: "tte-section-title muted" }, "Wrapper tags", -1)),
              d("div", pt, [
                (k(), U(W, null, G([
                  { tag: "laughing", label: "Laughing" },
                  { tag: "strong", label: "Strong" }
                ], (y) => b(C, {
                  key: y.tag,
                  label: y.label,
                  severity: "secondary",
                  onMousedown: te((V) => x(y.tag), ["prevent"])
                }, null, 8, ["label", "onMousedown"])), 64))
              ])
            ]),
            d("div", ft, [
              a[7] || (a[7] = d("div", { class: "tte-section-title muted" }, "Text", -1)),
              b(A, {
                ref_key: "textareaRef",
                ref: h,
                modelValue: s.value,
                "onUpdate:modelValue": a[0] || (a[0] = (y) => s.value = y),
                "auto-resize": "",
                rows: "6",
                class: "tte-textarea w100p",
                onInput: oe,
                onKeyup: ie,
                onClick: _
              }, null, 8, ["modelValue"])
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, gt = /* @__PURE__ */ j(vt, [["__scopeId", "data-v-f69e1c9b"]]), yt = { class: "row" }, mt = {
  key: 0,
  class: "instruct-desc muted"
}, bt = { class: "text-row row" }, ht = {
  __name: "LineRowEditor",
  props: {
    row: { type: Object, required: !0 },
    index: { type: Number, default: -1 }
  },
  setup(e) {
    const n = e, t = we("lineRowApi");
    if (!t)
      throw new Error(
        "LineRowEditor: provide('lineRowApi', {...}) отсутствует в родителе"
      );
    const r = H(!1);
    function s() {
      r.value = !0;
    }
    function h(f) {
      t.setText(n.row, f);
    }
    function p(f) {
      var x;
      f.preventDefault();
      const i = f.target, o = (f.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), $ = i.selectionStart, g = i.selectionEnd;
      i.value = i.value.slice(0, $) + o + i.value.slice(g), i.selectionStart = i.selectionEnd = $ + o.length, t.setText(n.row, i.value), (x = t.autoGrow) == null || x.call(t, i);
    }
    return (f, i) => {
      var S, L, w, m;
      const o = P("InputGroupAddon"), $ = P("InputGroup"), g = P("Button"), x = P("InputText"), u = P("Textarea");
      return k(), U(W, null, [
        d("div", yt, [
          ee(f.$slots, "leading", {}, void 0, !0),
          b($, { class: "speaker-group shrink-0" }, {
            default: E(() => [
              b(o, null, {
                default: E(() => [...i[9] || (i[9] = [
                  d("i", { class: "pi pi-address-book" }, null, -1)
                ])]),
                _: 1
              }),
              b(it, {
                "model-value": l(t).getSpeaker(e.row),
                "role-entries": l(t).roleEntries.value,
                "option-sub-label": l(t).roleOptionSubLabel,
                placeholder: l(t).speakerPlaceholder,
                title: l(t).speakerTitle,
                "onUpdate:modelValue": i[0] || (i[0] = (v) => l(t).setSpeaker(e.row, v))
              }, null, 8, ["model-value", "role-entries", "option-sub-label", "placeholder", "title"]),
              b(o, {
                class: "role-info-btn",
                onMouseenter: i[1] || (i[1] = (v) => l(t).showRoleInfoPopover(v.target, l(t).getRoleInfoCode(e.row))),
                onMouseleave: l(t).hideRoleInfoPopover
              }, {
                default: E(() => [...i[10] || (i[10] = [
                  d("i", { class: "pi pi-info-circle" }, null, -1)
                ])]),
                _: 1
              }, 8, ["onMouseleave"])
            ]),
            _: 1
          }),
          b($, { class: "instruct-group" }, {
            default: E(() => [
              b(o, null, {
                default: E(() => [...i[11] || (i[11] = [
                  d("i", { class: "pi pi-book" }, null, -1)
                ])]),
                _: 1
              }),
              b(g, {
                icon: "pi pi-undo",
                class: "instruct-undo-btn shrink-0",
                disabled: !l(t).canUndoInstruct(e.row),
                title: l(t).undoInstructTitle(e.row),
                onClick: i[2] || (i[2] = (v) => l(t).undoInstruct(e.row))
              }, null, 8, ["disabled", "title"]),
              b(x, {
                "model-value": l(t).getInstruct(e.row),
                placeholder: l(t).instructPlaceholder,
                title: l(t).instructTitle,
                "onUpdate:modelValue": i[3] || (i[3] = (v) => l(t).setInstruct(e.row, v))
              }, null, 8, ["model-value", "placeholder", "title"]),
              b(g, {
                icon: "pi pi-th-large",
                title: "Pick an instruct phrase from the category bank",
                onClick: i[4] || (i[4] = (v) => l(t).openInstructPicker(e.row))
              }),
              b(g, {
                icon: "pi pi-users",
                class: "apply-instruct-btn",
                disabled: !l(t).canApplyInstruct(e.row),
                title: l(t).applyInstructTitle(e.row),
                onClick: i[5] || (i[5] = (v) => l(t).applyInstructToSameRole(e.row))
              }, null, 8, ["disabled", "title"])
            ]),
            _: 1
          }),
          ee(f.$slots, "trailing", {}, void 0, !0)
        ]),
        l(t).instructNoteFor(e.row) ? (k(), U("div", mt, "↳ " + I(l(t).instructNoteFor(e.row)), 1)) : N("", !0),
        ee(f.$slots, "above-text", {}, void 0, !0),
        d("div", bt, [
          b(g, {
            icon: "pi pi-pencil",
            class: "text-edit-btn",
            title: "Edit text with tag palette",
            onClick: s
          }),
          b(u, {
            "model-value": l(t).getText(e.row),
            "auto-resize": "",
            rows: "1",
            class: "fl-textarea",
            style: B({ fontSize: `${l(t).fontSizePx.value}px` }),
            placeholder: l(t).textPlaceholder,
            ref: (v) => l(t).setTextareaRef(l(t).textKey(e.row), v),
            "onUpdate:modelValue": i[6] || (i[6] = (v) => l(t).setText(e.row, v)),
            onKeydown: i[7] || (i[7] = ke(te(() => {
            }, ["prevent"]), ["enter"])),
            onPaste: p
          }, null, 8, ["model-value", "style", "placeholder"])
        ]),
        b(gt, {
          visible: r.value,
          "onUpdate:visible": i[8] || (i[8] = (v) => r.value = v),
          text: l(t).getText(e.row),
          "original-url": ((L = (S = l(t)).getOriginalAudioUrl) == null ? void 0 : L.call(S, e.row)) || "",
          "current-url": ((m = (w = l(t)).getCurrentAudioUrl) == null ? void 0 : m.call(w, e.row)) || "",
          onSave: h
        }, null, 8, ["visible", "text", "original-url", "current-url"])
      ], 64);
    };
  }
}, Rt = /* @__PURE__ */ j(ht, [["__scopeId", "data-v-de28be39"]]);
function Dt(e) {
  const n = document.activeElement;
  if (!n || n.tagName !== "TEXTAREA" && n.tagName !== "INPUT") {
    e == null || e("Click into a line's text first, place the cursor right after the vowel to stress");
    return;
  }
  const t = n.selectionStart;
  n.value = n.value.slice(0, t) + "́" + n.value.slice(t), n.selectionStart = n.selectionEnd = t + 1, n.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function Nt(e, n) {
  const t = fe({ visible: !1, left: 0, top: 0, code: "" });
  function r(p, f) {
    const i = p.getBoundingClientRect();
    t.left = Math.min(i.left, window.innerWidth - 280), t.top = i.bottom + 4, t.code = f, t.visible = !0;
  }
  function s() {
    t.visible = !1;
  }
  const h = q(() => {
    const p = t.code;
    if (!p) return { message: "No speaker set on this line yet" };
    const f = e.value.find((o) => o.code === p);
    if (!f) return { message: `"${p}" is not a known role code -- used directly as a preset name` };
    const i = n(f);
    return i.length ? { fields: i } : { message: `"${p}" has no fields set` };
  });
  return { popover: t, show: r, hide: s, info: h };
}
const wt = { key: 0 }, kt = { class: "muted" }, zt = {
  __name: "RoleInfoPopover",
  props: {
    visible: { type: Boolean, default: !1 },
    left: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    message: { type: String, default: "" },
    fields: { type: Array, default: () => [] }
    // [[key, value], ...]
  },
  setup(e) {
    return (n, t) => e.visible ? (k(), U("div", {
      key: 0,
      class: "role-info-popover",
      style: B({ left: `${e.left}px`, top: `${e.top}px` })
    }, [
      e.message ? (k(), U("div", wt, I(e.message), 1)) : N("", !0),
      (k(!0), U(W, null, G(e.fields, ([r, s]) => (k(), U("div", {
        key: r,
        class: "row space-between"
      }, [
        d("span", kt, I(r), 1),
        d("span", null, I(s), 1)
      ]))), 128))
    ], 4)) : N("", !0);
  }
};
function Ft() {
  const e = /* @__PURE__ */ new Map();
  function n(s) {
    s && (s.style.height = "auto", s.style.height = `${s.scrollHeight}px`);
  }
  function t(s, h) {
    if (!h) {
      e.delete(s);
      return;
    }
    const p = h.$el ?? h;
    e.set(s, p), ne(() => n(p));
  }
  function r() {
    ne(() => e.forEach(n));
  }
  return { autoGrow: n, setTextareaRef: t, regrowAll: r };
}
async function Vt(e, n, t) {
  const r = `${(e || "").trim()}|${(n || "").trim()}|${(t || "").trim()}`, s = new TextEncoder().encode(r), h = await crypto.subtle.digest("SHA-256", s);
  return [...new Uint8Array(h)].map((f) => f.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const $t = /^(\d+)_([0-9a-f]+)\.wav$/i;
function xt(e, n) {
  return `${String(e).padStart(4, "0")}_${n}.wav`;
}
function St(e) {
  const n = $t.exec(e);
  return n ? { position: Number(n[1]), hash: n[2].toLowerCase() } : null;
}
function Bt(e, n, t) {
  return e.has(xt(n, t));
}
function Mt(e, n, t) {
  let r = null, s = -1 / 0;
  for (const h of e) {
    const p = St(h);
    if (!p || p.position !== t) continue;
    const f = (n == null ? void 0 : n[h]) ?? 0;
    (r === null || f > s) && (r = h, s = f);
  }
  return r;
}
const de = "custom", _t = "My phrases", Ct = "Typed directly into an instruct field -- not curated, just captured for reuse.";
function ye(e, n) {
  const t = n.trim();
  return e.some((r) => (r.examples || []).some((s) => s.trim() === t));
}
function Et(e, n) {
  const t = n.trim();
  if (!t || ye(e, t)) return e;
  const r = e.find((s) => s.name === de);
  return r ? (r.examples = [...r.examples || [], t], e) : [
    ...e,
    { name: de, title: _t, when: Ct, examples: [t] }
  ];
}
async function Ot(e, n, t) {
  const r = (t || "").trim();
  if (!r || !n) return null;
  let s = { categories: [] };
  try {
    const p = await (await fetch(`${e}/read?path=${encodeURIComponent(n)}`)).json();
    if (p.exists) {
      const f = JSON.parse(p.content);
      f && Array.isArray(f.categories) && (s = f);
    }
  } catch {
  }
  return ye(s.categories, r) ? null : (s.categories = Et(s.categories, r), await fetch(`${e}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: n, content: JSON.stringify(s, null, 2) })
  }), s.categories);
}
export {
  Ut as I,
  Rt as L,
  It as S,
  zt as _,
  xt as a,
  Ee as b,
  Lt as c,
  At as d,
  Nt as e,
  Ve as f,
  Bt as h,
  Dt as i,
  Vt as l,
  Mt as m,
  Ot as s,
  Ft as u
};
