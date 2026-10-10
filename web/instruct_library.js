import { _ as Q, a as x, c as L, a4 as te, r as P, f as z, g as S, h as j, i as N, d as f, k as V, u as l, F as O, j as K, b as y, t as U, M as ne, l as Y, S as pe, p as be, A as fe, w as ve, n as he, m as J, E as oe, z as we, e as xe } from "./styles_link.js";
import { u as se, a as ae, D as ge } from "./DialogHeader.js";
const ke = {}, $e = { class: "sticky-panel" };
function Se(e, n) {
  return x(), L("div", $e, [
    te(e.$slots, "default", {}, void 0, !0)
  ]);
}
const St = /* @__PURE__ */ Q(ke, [["render", Se], ["__scopeId", "data-v-36817aaa"]]), Ce = { class: "instruct-example-list list" }, _e = {
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
    }), { fontSizePx: h, decrease: d, increase: p } = ae({
      storageKey: "FL_CosyVoice3.InstructPicker.fontSizePx",
      defaultSize: 13
    }), i = n;
    function o(k) {
      i("select", k), i("update:visible", !1);
    }
    return (k, m) => {
      const $ = P("Message"), u = P("Button"), C = P("Card"), I = P("Dialog");
      return x(), z(I, {
        visible: e.visible,
        modal: "",
        header: " ",
        style: V({ width: l(t) }),
        "onUpdate:visible": m[0] || (m[0] = (w) => k.$emit("update:visible", w))
      }, {
        header: S(() => [
          y(ge, {
            title: "Pick an instruct phrase",
            "width-presets": l(s),
            "set-width": l(r),
            "font-size-decrease": l(d),
            "font-size-increase": l(p)
          }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: S(() => [
          e.categories.length ? N("", !0) : (x(), z($, {
            key: 0,
            severity: "info",
            closable: !1
          }, {
            default: S(() => [...m[1] || (m[1] = [
              j(" No _instruct_categories.json found for this project -- you can still type any instruct text directly. ", -1)
            ])]),
            _: 1
          })),
          f("div", {
            class: "grid",
            style: V([{ "--grid-min": "280px" }, { fontSize: `${l(h)}px` }])
          }, [
            (x(!0), L(O, null, K(e.categories, (w) => (x(), z(C, {
              key: w.name
            }, {
              title: S(() => [
                j(U(w.title), 1)
              ]),
              subtitle: S(() => [
                j(U(w.when), 1)
              ]),
              content: S(() => [
                f("ul", Ce, [
                  (x(!0), L(O, null, K(w.examples, (b) => (x(), L("li", { key: b }, [
                    y(u, {
                      label: b,
                      text: "",
                      class: "instruct-example-btn w100p",
                      onClick: (g) => o(b)
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
}, Ct = /* @__PURE__ */ Q(_e, [["__scopeId", "data-v-523171ce"]]);
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
const Te = ["onClick"], Ie = { class: "speaker-card-text" }, Ue = { class: "speaker-name" }, Le = {
  key: 0,
  class: "p-text-secondary"
}, Ae = ["onClick"], De = {
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
    const t = e, r = n, { cssWidth: s, setWidth: h, presets: d } = se({
      storageKey: "FL_CosyVoice3.SpeakerPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: p, decrease: i, increase: o } = ae({
      storageKey: "FL_CosyVoice3.SpeakerPicker.fontSizePx",
      defaultSize: 13
    });
    function k(w) {
      r("select", w), r("update:visible", !1);
    }
    const m = Y(null);
    let $ = null;
    function u(w, b) {
      return `${pe}/audio?path=${encodeURIComponent(be(t.sampleDir, `${w}.${b}`))}`;
    }
    function C() {
      $ == null || $.pause(), $ = null, m.value = null;
    }
    function I(w) {
      if (m.value === w) {
        C();
        return;
      }
      if (C(), !t.sampleDir) return;
      const b = new Audio(u(w, "mp3"));
      let g = !1;
      b.addEventListener("error", () => {
        if (g) {
          m.value === w && C();
          return;
        }
        g = !0, b.src = u(w, "wav"), b.play().catch(() => C());
      }), b.addEventListener("ended", () => {
        m.value === w && C();
      }), b.play().catch(() => C()), $ = b, m.value = w;
    }
    return (w, b) => {
      const g = P("Message"), B = P("Avatar"), R = P("Button"), H = P("Card"), X = P("Dialog");
      return x(), z(X, {
        visible: e.visible,
        modal: "",
        header: " ",
        style: V({ width: l(s) }),
        "onUpdate:visible": b[0] || (b[0] = (D) => {
          C(), w.$emit("update:visible", D);
        })
      }, {
        header: S(() => [
          y(ge, {
            title: "Pick a speaker",
            "width-presets": l(d),
            "set-width": l(h),
            "font-size-decrease": l(i),
            "font-size-increase": l(o)
          }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: S(() => [
          e.presets.length ? N("", !0) : (x(), z(g, {
            key: 0,
            severity: "info",
            closable: !1
          }, {
            default: S(() => [...b[1] || (b[1] = [
              j(" No saved speaker presets found. ", -1)
            ])]),
            _: 1
          })),
          f("div", {
            class: "grid",
            style: V([{ "--grid-min": "220px" }, { fontSize: `${l(p)}px` }])
          }, [
            (x(!0), L(O, null, K(e.presets, (D) => (x(), z(H, { key: D }, {
              content: S(() => [
                f("div", {
                  class: "speaker-card-row row",
                  onClick: (q) => k(D)
                }, [
                  y(B, {
                    label: l(Pe)(D),
                    shape: "circle",
                    style: V({ backgroundColor: l(Ee)(D) }),
                    class: "shrink-0"
                  }, null, 8, ["label", "style"]),
                  f("div", Ie, [
                    f("div", Ue, U(D), 1),
                    e.usageFor && e.usageFor(D) ? (x(), L("div", Le, U(e.usageFor(D)), 1)) : N("", !0)
                  ]),
                  f("span", {
                    class: "speaker-play-wrap",
                    onClick: ne((q) => I(D), ["stop"])
                  }, [
                    y(R, {
                      icon: m.value === D ? "pi pi-pause" : "pi pi-play",
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
}, _t = /* @__PURE__ */ Q(De, [["__scopeId", "data-v-fee158e7"]]), M = fe({}), Z = /* @__PURE__ */ new Map(), Re = 0.15, Ne = 0.4;
function ze() {
  function e(o) {
    return `${pe}/audio?path=${encodeURIComponent(o)}`;
  }
  function n(o, k) {
    if (!o || !k) return "";
    const m = String(o).replace(/\\/g, "/").replace(/\/$/, "");
    return e(`${m}/audio_en/${k}.wav`);
  }
  function t(o, k, m) {
    if (!o || !k) return "";
    const $ = String(o).replace(/\\/g, "/").replace(/\/$/, ""), u = e(`${$}/audio_ru/${k}.wav`);
    return m ? `${u}&v=${m}` : u;
  }
  function r(o, k, m, $, u) {
    if (!o || !k || m == null || !$ || u == null) return "";
    const C = String(o).replace(/\\/g, "/").replace(/\/$/, ""), I = String(m).padStart(3, "0"), w = `${k}_v${I}_${$}_s${u}.wav`;
    return e(`${C}/_dub_versions/${w}`);
  }
  function s(o) {
    if (!o) return Promise.resolve(null);
    if (o in M) return Promise.resolve(M[o]);
    if (Z.has(o)) return Z.get(o);
    const k = new Promise((m) => {
      const $ = new Audio();
      let u = !1;
      const C = (I) => {
        u || (u = !0, M[o] = I, Z.delete(o), m(I));
      };
      $.addEventListener("loadedmetadata", () => C($.duration || null)), $.addEventListener("error", () => C(null)), setTimeout(() => C(null), 8e3), $.preload = "metadata", $.src = o;
    });
    return Z.set(o, k), k;
  }
  function h(o) {
    return o && o in M ? M[o] : null;
  }
  function d(o, k) {
    if (o == null || k == null || o <= 0) return null;
    const m = (k - o) / o, $ = Math.round(m * 100), u = Math.abs(m);
    return { level: u <= Re ? "good" : u <= Ne ? "warn" : "bad", pct: $, pctText: `${$ >= 0 ? "+" : ""}${$}%` };
  }
  function p(o) {
    return o == null ? "—" : `${o.toFixed(2)}s`;
  }
  function i() {
    Object.keys(M).forEach((o) => delete M[o]), Z.clear();
  }
  return {
    durations: M,
    buildUrl: e,
    enUrl: n,
    ruUrl: t,
    versionUrl: r,
    getDuration: s,
    getCached: h,
    calcDelta: d,
    formatSeconds: p,
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
  class: "p-text-secondary"
}, Oe = ["title"], We = { class: "row" }, Ge = { class: "row" }, je = { class: "p-text-secondary" }, Ke = { class: "history-snapshot card" }, He = { class: "p-text-secondary" }, qe = { class: "history-snapshot-text" }, Ye = { class: "history-card-actions actions" }, Je = {
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
    const t = e, r = n, { enUrl: s, versionUrl: h, getDuration: d, getCached: p, calcDelta: i, formatSeconds: o } = ze(), { cssWidth: k } = se({
      storageKey: "FL_CosyVoice3.LineHistory.widthPx",
      defaultWidth: 1e3,
      presets: [800, 1e3, 1300]
    }), { fontSizePx: m } = ae({
      storageKey: "FL_CosyVoice3.LineHistory.fontSizePx",
      defaultSize: 13
    }), $ = J(() => [...t.versions].sort((_, c) => c.version - _.version)), u = J(() => s(t.root, t.audioKey)), C = J(() => p(u.value));
    function I(_) {
      return h(t.root, t.audioKey, _.version, _.hash, _.seed);
    }
    function w(_) {
      return i(C.value, p(I(_)));
    }
    async function b() {
      u.value && await d(u.value);
      for (const _ of $.value) {
        const c = I(_);
        c && await d(c);
      }
    }
    ve(() => t.visible, (_) => {
      _ ? (R(), b()) : R();
    });
    const g = Y(null);
    let B = null;
    function R() {
      B && (B.pause(), B = null), g.value = null;
    }
    function H(_, c) {
      if (R(), !_) return;
      const a = new Audio(_);
      B = a, g.value = c, a.addEventListener("ended", () => {
        g.value === c && R();
      }), a.addEventListener("error", () => {
        g.value === c && R();
      }), a.play().catch(() => {
        g.value === c && R();
      });
    }
    function X() {
      g.value === "original" ? R() : H(u.value, "original");
    }
    function D(_) {
      const c = _.version;
      g.value === c ? R() : H(I(_), c);
    }
    function q(_) {
      return g.value === _.version;
    }
    function ie(_) {
      r("select", _), r("update:visible", !1);
    }
    function le(_) {
      try {
        return new Date(_).toLocaleString();
      } catch {
        return _;
      }
    }
    return (_, c) => {
      const a = P("Button"), E = P("ButtonGroup"), T = P("Message"), A = P("InlineMessage"), F = P("Card"), W = P("Dialog");
      return x(), z(W, {
        visible: e.visible,
        modal: "",
        header: "История строки",
        style: V({ width: l(k) }),
        "onUpdate:visible": c[0] || (c[0] = (v) => {
          R(), _.$emit("update:visible", v);
        })
      }, {
        default: S(() => [
          u.value ? (x(), L("div", Be, [
            y(E, null, {
              default: S(() => [
                y(a, {
                  severity: g.value === "original" ? "primary" : "secondary",
                  icon: g.value === "original" ? "pi pi-pause" : "pi pi-volume-up",
                  label: "Original (EN)",
                  title: "Play EN reference take",
                  onClick: X
                }, null, 8, ["severity", "icon"])
              ]),
              _: 1
            }),
            C.value ? (x(), L("span", Me, U(l(o)(C.value)), 1)) : N("", !0),
            e.original ? (x(), L("span", {
              key: 1,
              title: e.original
            }, U(e.original), 9, Oe)) : N("", !0)
          ])) : N("", !0),
          e.versions.length ? (x(), L("div", {
            key: 2,
            class: "grid",
            style: V([{ "--grid-min": "320px" }, { fontSize: `${l(m)}px` }])
          }, [
            (x(!0), L(O, null, K($.value, (v) => (x(), z(F, {
              key: v.version
            }, {
              title: S(() => [
                f("div", We, [
                  f("span", null, "Версия " + U(v.version), 1),
                  v.version === e.chosenVersion ? (x(), z(A, {
                    key: 0,
                    severity: "success"
                  }, {
                    default: S(() => [...c[2] || (c[2] = [
                      j("✓ Активна", -1)
                    ])]),
                    _: 1
                  })) : N("", !0)
                ])
              ]),
              subtitle: S(() => [
                j(" сид " + U(v.seed) + " · " + U(le(v.created_at)), 1)
              ]),
              content: S(() => [
                f("div", Ge, [
                  f("span", je, U(l(o)(l(p)(I(v)))), 1),
                  w(v) ? (x(), L("span", {
                    key: 0,
                    class: he(["history-duration-delta", l(Ve)(w(v).level)])
                  }, U(w(v).pctText) + " vs EN ", 3)) : N("", !0)
                ]),
                f("div", Ke, [
                  f("div", null, U(v.speaker), 1),
                  f("div", He, U(v.instruct), 1),
                  f("div", qe, U(v.text), 1)
                ]),
                f("div", Ye, [
                  y(E, null, {
                    default: S(() => [
                      y(a, {
                        severity: q(v) ? "primary" : "secondary",
                        icon: q(v) ? "pi pi-pause" : "pi pi-play",
                        label: "Play",
                        title: "Прослушать этот дубль",
                        onClick: (G) => D(v)
                      }, null, 8, ["severity", "icon", "onClick"]),
                      y(a, {
                        label: "Сделать активной",
                        icon: "pi pi-check",
                        disabled: v.version === e.chosenVersion,
                        onClick: (G) => ie(v.version)
                      }, null, 8, ["disabled", "onClick"])
                    ]),
                    _: 2
                  }, 1024)
                ])
              ]),
              _: 2
            }, 1024))), 128))
          ], 4)) : (x(), z(T, {
            key: 1,
            severity: "info",
            closable: !1
          }, {
            default: S(() => [...c[1] || (c[1] = [
              j(" Для этой строки ещё нет истории озвучки. ", -1)
            ])]),
            _: 1
          }))
        ]),
        _: 1
      }, 8, ["visible", "style"]);
    };
  }
}, Et = /* @__PURE__ */ Q(Je, [["__scopeId", "data-v-032e1700"]]), Qe = { class: "ellipsis" }, Xe = {
  key: 0,
  class: "ellipsis p-text-secondary"
}, Ze = {
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
      return x(), z(h, {
        "model-value": e.modelValue,
        options: e.roleEntries,
        "option-label": "code",
        "option-value": "code",
        editable: "",
        filter: "",
        placeholder: e.placeholder,
        title: e.title,
        class: "role-dropdown",
        "onUpdate:modelValue": s[0] || (s[0] = (d) => t("update:modelValue", d))
      }, {
        option: S(({ option: d }) => [
          f("div", Qe, U(d.code), 1),
          e.optionSubLabel(d) ? (x(), L("div", Xe, U(e.optionSubLabel(d)), 1)) : N("", !0)
        ]),
        _: 1
      }, 8, ["model-value", "options", "placeholder", "title"]);
    };
  }
}, et = { class: "tte-header row space-between" }, tt = { class: "tte-body list" }, nt = { class: "tte-play-row row" }, ot = { class: "tte-section list" }, it = { class: "tte-tag-grid actions" }, lt = { class: "tte-section list" }, st = { class: "tte-tag-grid actions" }, at = { class: "tte-section list" }, rt = {
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
    const t = e, r = n, s = Y(t.text), h = Y(null);
    let d = 0, p = 0;
    ve(() => t.visible, async (c) => {
      c ? (s.value = t.text, d = t.text.length, p = t.text.length, await oe(), i()) : b();
    });
    function i() {
      var a;
      const c = ((a = h.value) == null ? void 0 : a.$el) ?? h.value;
      c && typeof c.focus == "function" && c.focus();
    }
    function o() {
      var a;
      const c = ((a = h.value) == null ? void 0 : a.$el) ?? h.value;
      !c || typeof c.selectionStart != "number" || (d = c.selectionStart, p = c.selectionEnd);
    }
    function k(c, a, E) {
      s.value = c, d = a, p = E, oe(() => {
        var A;
        const T = ((A = h.value) == null ? void 0 : A.$el) ?? h.value;
        T && (T.focus(), T.setSelectionRange(a, E));
      });
    }
    function m(c) {
      const a = s.value, E = d, T = p, A = `<${c}>`, F = a.slice(0, E), v = `${F.length && !/\s$/.test(F) ? " " : ""}${A}`, G = a.slice(0, E) + v + a.slice(T), ee = E + v.length;
      k(G, ee, ee);
    }
    function $(c) {
      const a = s.value, E = d, T = p, A = `<${c}>`, F = `</${c}>`;
      if (T > E) {
        const ce = a.slice(E, T), me = a.slice(0, E) + A + ce + F + a.slice(T), ue = E + A.length + ce.length + F.length;
        k(me, ue, ue);
        return;
      }
      const W = a.slice(0, E), v = W.length && !/\s$/.test(W) ? " " : "", G = `${v}${A}${F}`, ee = a.slice(0, E) + G + a.slice(T), re = E + v.length + A.length;
      k(ee, re, re);
    }
    const u = Y(null);
    let C = null;
    const I = J(() => !!t.originalUrl), w = J(() => !!t.currentUrl);
    function b() {
      C && (C.pause(), C = null), u.value = null;
    }
    function g(c, a, E) {
      if (b(), !c) return;
      const T = new Audio(c);
      T.loop = E, C = T, u.value = a, T.addEventListener("ended", () => {
        u.value === a && b();
      }), T.addEventListener("error", (A) => {
        console.error("[TagEditor] audio error", { url: c, error: A }), u.value === a && b();
      }), T.play().catch((A) => {
        console.error("[TagEditor] play rejected", { url: c, error: A }), u.value === a && b();
      });
    }
    function B() {
      u.value === "original" ? b() : g(t.originalUrl, "original", !1);
    }
    function R() {
      u.value === "original-loop" ? b() : g(t.originalUrl, "original-loop", !0);
    }
    function H() {
      u.value === "current" ? b() : g(t.currentUrl, "current", !1);
    }
    function X() {
      u.value === "loop" ? b() : g(t.currentUrl, "loop", !0);
    }
    function D() {
      b(), r("save", s.value), r("update:visible", !1);
    }
    function q() {
      b(), r("update:visible", !1);
    }
    function ie() {
      o();
    }
    function le() {
      o();
    }
    function _() {
      o();
    }
    return (c, a) => {
      const E = P("Button"), T = P("ButtonGroup"), A = P("Divider"), F = P("Textarea"), W = P("Dialog");
      return x(), z(W, {
        visible: e.visible,
        modal: "",
        style: { width: "720px" },
        "onUpdate:visible": a[1] || (a[1] = (v) => c.$emit("update:visible", v))
      }, {
        header: S(() => [
          f("div", et, [
            f("span", null, U(e.title), 1),
            y(T, null, {
              default: S(() => [
                y(E, {
                  label: "Cancel",
                  icon: "pi pi-times",
                  severity: "secondary",
                  outlined: "",
                  onClick: q
                }),
                y(E, {
                  label: "Save",
                  icon: "pi pi-check",
                  onClick: D
                })
              ]),
              _: 1
            })
          ])
        ]),
        default: S(() => [
          f("div", tt, [
            f("div", nt, [
              a[2] || (a[2] = f("span", { class: "tte-play-label p-text-secondary" }, "EN", -1)),
              y(T, null, {
                default: S(() => [
                  y(E, {
                    severity: u.value === "original" ? "primary" : "secondary",
                    disabled: !I.value,
                    icon: u.value === "original" ? "pi pi-pause" : "pi pi-volume-up",
                    label: "Original",
                    title: I.value ? "Play EN reference take" : "No EN audio for this row",
                    onClick: B
                  }, null, 8, ["severity", "disabled", "icon", "title"]),
                  y(E, {
                    severity: u.value === "original-loop" ? "primary" : "secondary",
                    disabled: !I.value,
                    icon: u.value === "original-loop" ? "pi pi-pause" : "pi pi-replay",
                    label: "Loop",
                    title: I.value ? "Play EN reference take in a loop" : "No EN audio for this row",
                    onClick: R
                  }, null, 8, ["severity", "disabled", "icon", "title"])
                ]),
                _: 1
              }),
              y(A, { layout: "vertical" }),
              a[3] || (a[3] = f("span", { class: "tte-play-label p-text-secondary" }, "RU", -1)),
              y(T, null, {
                default: S(() => [
                  y(E, {
                    severity: u.value === "current" ? "primary" : "secondary",
                    disabled: !w.value,
                    icon: u.value === "current" ? "pi pi-pause" : "pi pi-play",
                    label: "Current",
                    title: w.value ? "Play current RU take" : "No RU audio for this row yet",
                    onClick: H
                  }, null, 8, ["severity", "disabled", "icon", "title"]),
                  y(E, {
                    severity: u.value === "loop" ? "primary" : "secondary",
                    disabled: !w.value,
                    icon: u.value === "loop" ? "pi pi-pause" : "pi pi-replay",
                    label: "Loop",
                    title: w.value ? "Play current RU take in a loop" : "No RU audio for this row yet",
                    onClick: X
                  }, null, 8, ["severity", "disabled", "icon", "title"])
                ]),
                _: 1
              })
            ]),
            f("div", ot, [
              a[4] || (a[4] = f("div", { class: "tte-section-title p-text-secondary" }, "Insert tag", -1)),
              f("div", it, [
                (x(), L(O, null, K([
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
                ], (v) => y(E, {
                  key: v.tag,
                  label: v.label,
                  severity: "secondary",
                  onMousedown: ne((G) => m(v.tag), ["prevent"])
                }, null, 8, ["label", "onMousedown"])), 64))
              ])
            ]),
            f("div", lt, [
              a[5] || (a[5] = f("div", { class: "tte-section-title p-text-secondary" }, "Wrapper tags", -1)),
              f("div", st, [
                (x(), L(O, null, K([
                  { tag: "laughing", label: "Laughing" },
                  { tag: "strong", label: "Strong" }
                ], (v) => y(E, {
                  key: v.tag,
                  label: v.label,
                  severity: "secondary",
                  onMousedown: ne((G) => $(v.tag), ["prevent"])
                }, null, 8, ["label", "onMousedown"])), 64))
              ])
            ]),
            f("div", at, [
              a[6] || (a[6] = f("div", { class: "tte-section-title p-text-secondary" }, "Text", -1)),
              y(F, {
                ref_key: "textareaRef",
                ref: h,
                modelValue: s.value,
                "onUpdate:modelValue": a[0] || (a[0] = (v) => s.value = v),
                "auto-resize": "",
                rows: "6",
                class: "w100p",
                onInput: ie,
                onKeyup: le,
                onClick: _
              }, null, 8, ["modelValue"])
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, ct = /* @__PURE__ */ Q(rt, [["__scopeId", "data-v-6fcdfaf0"]]), ut = { class: "row" }, dt = {
  key: 0,
  class: "instruct-desc p-text-secondary"
}, pt = { class: "text-row row" }, ft = {
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
    const r = Y(!1);
    function s() {
      r.value = !0;
    }
    function h(p) {
      t.setText(n.row, p);
    }
    function d(p) {
      var $;
      p.preventDefault();
      const i = p.target, o = (p.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), k = i.selectionStart, m = i.selectionEnd;
      i.value = i.value.slice(0, k) + o + i.value.slice(m), i.selectionStart = i.selectionEnd = k + o.length, t.setText(n.row, i.value), ($ = t.autoGrow) == null || $.call(t, i);
    }
    return (p, i) => {
      var C, I, w, b;
      const o = P("InputGroupAddon"), k = P("InputGroup"), m = P("Button"), $ = P("InputText"), u = P("Textarea");
      return x(), L(O, null, [
        f("div", ut, [
          te(p.$slots, "leading", {}, void 0, !0),
          y(k, { class: "speaker-group shrink-0" }, {
            default: S(() => [
              y(o, null, {
                default: S(() => [...i[9] || (i[9] = [
                  f("i", { class: "pi pi-address-book" }, null, -1)
                ])]),
                _: 1
              }),
              y(Ze, {
                "model-value": l(t).getSpeaker(e.row),
                "role-entries": l(t).roleEntries.value,
                "option-sub-label": l(t).roleOptionSubLabel,
                placeholder: l(t).speakerPlaceholder,
                title: l(t).speakerTitle,
                "onUpdate:modelValue": i[0] || (i[0] = (g) => l(t).setSpeaker(e.row, g))
              }, null, 8, ["model-value", "role-entries", "option-sub-label", "placeholder", "title"]),
              y(o, {
                class: "role-info-btn",
                onMouseenter: i[1] || (i[1] = (g) => l(t).showRoleInfoPopover(g.target, l(t).getRoleInfoCode(e.row))),
                onMouseleave: l(t).hideRoleInfoPopover
              }, {
                default: S(() => [...i[10] || (i[10] = [
                  f("i", { class: "pi pi-info-circle" }, null, -1)
                ])]),
                _: 1
              }, 8, ["onMouseleave"])
            ]),
            _: 1
          }),
          y(k, { class: "instruct-group" }, {
            default: S(() => [
              y(o, null, {
                default: S(() => [...i[11] || (i[11] = [
                  f("i", { class: "pi pi-book" }, null, -1)
                ])]),
                _: 1
              }),
              y(m, {
                icon: "pi pi-undo",
                class: "instruct-undo-btn shrink-0",
                disabled: !l(t).canUndoInstruct(e.row),
                title: l(t).undoInstructTitle(e.row),
                onClick: i[2] || (i[2] = (g) => l(t).undoInstruct(e.row))
              }, null, 8, ["disabled", "title"]),
              y($, {
                "model-value": l(t).getInstruct(e.row),
                placeholder: l(t).instructPlaceholder,
                title: l(t).instructTitle,
                "onUpdate:modelValue": i[3] || (i[3] = (g) => l(t).setInstruct(e.row, g))
              }, null, 8, ["model-value", "placeholder", "title"]),
              y(m, {
                icon: "pi pi-th-large",
                title: "Pick an instruct phrase from the category bank",
                onClick: i[4] || (i[4] = (g) => l(t).openInstructPicker(e.row))
              }),
              y(m, {
                icon: "pi pi-users",
                class: "apply-instruct-btn",
                disabled: !l(t).canApplyInstruct(e.row),
                title: l(t).applyInstructTitle(e.row),
                onClick: i[5] || (i[5] = (g) => l(t).applyInstructToSameRole(e.row))
              }, null, 8, ["disabled", "title"])
            ]),
            _: 1
          }),
          te(p.$slots, "trailing", {}, void 0, !0)
        ]),
        l(t).instructNoteFor(e.row) ? (x(), L("div", dt, "↳ " + U(l(t).instructNoteFor(e.row)), 1)) : N("", !0),
        te(p.$slots, "above-text", {}, void 0, !0),
        f("div", pt, [
          y(m, {
            icon: "pi pi-pencil",
            class: "text-edit-btn",
            title: "Edit text with tag palette",
            onClick: s
          }),
          y(u, {
            "model-value": l(t).getText(e.row),
            "auto-resize": "",
            rows: "1",
            class: "fl-textarea",
            style: V({ fontSize: `${l(t).fontSizePx.value}px` }),
            placeholder: l(t).textPlaceholder,
            ref: (g) => l(t).setTextareaRef(l(t).textKey(e.row), g),
            "onUpdate:modelValue": i[6] || (i[6] = (g) => l(t).setText(e.row, g)),
            onKeydown: i[7] || (i[7] = xe(ne(() => {
            }, ["prevent"]), ["enter"])),
            onPaste: d
          }, null, 8, ["model-value", "style", "placeholder"])
        ]),
        y(ct, {
          visible: r.value,
          "onUpdate:visible": i[8] || (i[8] = (g) => r.value = g),
          text: l(t).getText(e.row),
          "original-url": ((I = (C = l(t)).getOriginalAudioUrl) == null ? void 0 : I.call(C, e.row)) || "",
          "current-url": ((b = (w = l(t)).getCurrentAudioUrl) == null ? void 0 : b.call(w, e.row)) || "",
          onSave: h
        }, null, 8, ["visible", "text", "original-url", "current-url"])
      ], 64);
    };
  }
}, Pt = /* @__PURE__ */ Q(ft, [["__scopeId", "data-v-8b9f675b"]]);
function Tt(e) {
  const n = document.activeElement;
  if (!n || n.tagName !== "TEXTAREA" && n.tagName !== "INPUT") {
    e == null || e("Click into a line's text first, place the cursor right after the vowel to stress");
    return;
  }
  const t = n.selectionStart;
  n.value = n.value.slice(0, t) + "́" + n.value.slice(t), n.selectionStart = n.selectionEnd = t + 1, n.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function It(e, n) {
  const t = fe({ visible: !1, left: 0, top: 0, code: "" });
  function r(d, p) {
    const i = d.getBoundingClientRect();
    t.left = Math.min(i.left, window.innerWidth - 280), t.top = i.bottom + 4, t.code = p, t.visible = !0;
  }
  function s() {
    t.visible = !1;
  }
  const h = J(() => {
    const d = t.code;
    if (!d) return { message: "No speaker set on this line yet" };
    const p = e.value.find((o) => o.code === d);
    if (!p) return { message: `"${d}" is not a known role code -- used directly as a preset name` };
    const i = n(p);
    return i.length ? { fields: i } : { message: `"${d}" has no fields set` };
  });
  return { popover: t, show: r, hide: s, info: h };
}
const vt = { key: 0 }, gt = { class: "p-text-secondary" }, Ut = {
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
    return (n, t) => e.visible ? (x(), L("div", {
      key: 0,
      class: "role-info-popover",
      style: V({ left: `${e.left}px`, top: `${e.top}px` })
    }, [
      e.message ? (x(), L("div", vt, U(e.message), 1)) : N("", !0),
      (x(!0), L(O, null, K(e.fields, ([r, s]) => (x(), L("div", {
        key: r,
        class: "row space-between"
      }, [
        f("span", gt, U(r), 1),
        f("span", null, U(s), 1)
      ]))), 128))
    ], 4)) : N("", !0);
  }
};
function Lt() {
  const e = /* @__PURE__ */ new Map();
  function n(s) {
    s && (s.style.height = "auto", s.style.height = `${s.scrollHeight}px`);
  }
  function t(s, h) {
    if (!h) {
      e.delete(s);
      return;
    }
    const d = h.$el ?? h;
    e.set(s, d), oe(() => n(d));
  }
  function r() {
    oe(() => e.forEach(n));
  }
  return { autoGrow: n, setTextareaRef: t, regrowAll: r };
}
async function At(e, n, t) {
  const r = `${(e || "").trim()}|${(n || "").trim()}|${(t || "").trim()}`, s = new TextEncoder().encode(r), h = await crypto.subtle.digest("SHA-256", s);
  return [...new Uint8Array(h)].map((p) => p.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const yt = /^(\d+)_([0-9a-f]+)\.wav$/i;
function mt(e, n) {
  return `${String(e).padStart(4, "0")}_${n}.wav`;
}
function bt(e) {
  const n = yt.exec(e);
  return n ? { position: Number(n[1]), hash: n[2].toLowerCase() } : null;
}
function Dt(e, n, t) {
  return e.has(mt(n, t));
}
function Rt(e, n, t) {
  let r = null, s = -1 / 0;
  for (const h of e) {
    const d = bt(h);
    if (!d || d.position !== t) continue;
    const p = (n == null ? void 0 : n[h]) ?? 0;
    (r === null || p > s) && (r = h, s = p);
  }
  return r;
}
const de = "custom", ht = "My phrases", wt = "Typed directly into an instruct field -- not curated, just captured for reuse.";
function ye(e, n) {
  const t = n.trim();
  return e.some((r) => (r.examples || []).some((s) => s.trim() === t));
}
function xt(e, n) {
  const t = n.trim();
  if (!t || ye(e, t)) return e;
  const r = e.find((s) => s.name === de);
  return r ? (r.examples = [...r.examples || [], t], e) : [
    ...e,
    { name: de, title: ht, when: wt, examples: [t] }
  ];
}
async function Nt(e, n, t) {
  const r = (t || "").trim();
  if (!r || !n) return null;
  let s = { categories: [] };
  try {
    const d = await (await fetch(`${e}/read?path=${encodeURIComponent(n)}`)).json();
    if (d.exists) {
      const p = JSON.parse(d.content);
      p && Array.isArray(p.categories) && (s = p);
    }
  } catch {
  }
  return ye(s.categories, r) ? null : (s.categories = xt(s.categories, r), await fetch(`${e}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: n, content: JSON.stringify(s, null, 2) })
  }), s.categories);
}
export {
  Ct as I,
  Pt as L,
  St as S,
  Ut as _,
  mt as a,
  Ee as b,
  _t as c,
  Et as d,
  It as e,
  Ve as f,
  Dt as h,
  Tt as i,
  At as l,
  Rt as m,
  Nt as s,
  Lt as u
};
