import { _ as Re, l as V, o as qe, L as ut, c as A, d as $, b as N, F as ne, j as ue, t as F, V as me, r as te, a as E, n as pe, g as Y, h as ce, f as de, i as X, w as ye, m as ae, k as De, T as gn, R as xt, U as Lt, N as ve, W as ct, X as bn, Y as He, z as Sn, Z as kn, $ as Rn, a0 as Tn, A as he, E as wn, a1 as En, p as $e, G as we, S as Cn, Q as In, u as i, M as $n, q as Pn, s as On, a2 as Dn, H as An, a3 as Mn, v as dt, x as ft, P as pt, y as vt } from "./styles_link.js";
import { u as Vt, a as Nt, D as xn } from "./DialogHeader.js";
import { e as Ln, s as Vn, l as Nn, i as Fn, S as Un, f as Bn, L as jn, I as zn, d as Hn, _ as qn, u as Wn, c as Gn } from "./instruct_library.js";
const Jn = { class: "vo-dub-panel list" }, Kn = { class: "vo-dub-toolbar actions" }, Zn = { class: "vo-dub-buckets panel" }, Yn = ["onClick"], Xn = { class: "vo-dub-status muted" }, Qn = 9e3, wt = "FL_CosyVoice3.VODubLibrary.lastRoot", eo = {
  __name: "VoDubBrowserPanel",
  props: {
    node: { type: Object, required: !0 },
    projectRootWidget: { type: Object, required: !0 },
    openBrowseDialog: { type: Function, required: !0 },
    openVoDubLineEditor: { type: Function, required: !0 },
    openDubRolesEditor: { type: Function, required: !0 },
    queueVoDubRender: { type: Function, default: null }
    // (node, opts) => Promise -- from web/vo_dub_library.js
  },
  setup(e) {
    const o = e, t = V(o.projectRootWidget.value || localStorage.getItem(wt) || ""), n = V([]), s = V(""), a = V(!1);
    let r = null;
    async function v() {
      if (!t.value) {
        n.value = [];
        return;
      }
      a.value = !0;
      try {
        const d = await (await fetch(`${me}/tree?path=${encodeURIComponent(t.value)}`)).json();
        if (d.error) {
          s.value = d.error, n.value = [];
          return;
        }
        n.value = d.buckets || [], s.value = `${n.value.length} bucket(s), ${n.value.reduce((f, _) => f + _.count, 0)} row(s)`;
      } catch (l) {
        s.value = `Couldn't load: ${l}`;
      } finally {
        a.value = !1;
      }
    }
    function k() {
      o.openBrowseDialog({
        mode: "folder",
        startPath: t.value,
        onSelect: (l) => {
          t.value = l, o.projectRootWidget.value = l, localStorage.setItem(wt, l), v();
        }
      });
    }
    function h(l) {
      o.openVoDubLineEditor({
        root: t.value,
        bucket: l.bucket,
        /*
         Only offered when this panel's node-wiring actually has a render
         mechanism (it always does in practice -- null only ever shows up
         in a test that doesn't pass one) -- see queueVoDubRender's own
         docstring in web/vo_dub_library.js for what it does.
        */
        renderApi: o.queueVoDubRender ? {
          renderRow: (d) => o.queueVoDubRender(o.node, d)
        } : null
      });
    }
    function p() {
      t.value && o.openDubRolesEditor({ root: t.value });
    }
    const b = [
      { key: "no_text", label: "no text", severity: "warn" },
      { key: "needs_translation", label: "needs RU", severity: "info" },
      { key: "not_started", label: "not started", severity: "secondary" },
      { key: "stale", label: "stale", severity: "warn" },
      { key: "done", label: "done", severity: "success" },
      { key: "unsupported", label: "unsupported", severity: "contrast" }
    ];
    return qe(() => {
      v(), r = setInterval(v, Qn);
    }), ut(() => clearInterval(r)), (l, d) => {
      const f = te("InputText"), _ = te("Button"), m = te("InlineMessage");
      return E(), A("div", Jn, [
        $("div", Kn, [
          N(f, {
            modelValue: t.value,
            "onUpdate:modelValue": d[0] || (d[0] = (c) => t.value = c),
            class: "vo-dub-root-input",
            placeholder: "VO dub project root (holds vo_dataset.csv)",
            onChange: d[1] || (d[1] = (c) => v())
          }, null, 8, ["modelValue"]),
          N(_, {
            label: "Browse...",
            onClick: k
          }),
          N(_, {
            label: "Roles",
            disabled: !t.value,
            title: "Assign a voice preset to each character tag",
            onClick: p
          }, null, 8, ["disabled"]),
          N(_, {
            icon: "pi pi-refresh",
            title: "Re-scan",
            onClick: v
          })
        ]),
        $("div", Zn, [
          (E(!0), A(ne, null, ue(n.value, (c) => (E(), A("div", {
            key: c.bucket,
            class: pe(["vo-dub-bucket-row row", { "has-issues": c.issue > 0 }]),
            onClick: (T) => h(c)
          }, [
            N(m, { severity: "secondary" }, {
              default: Y(() => [
                ce(F(c.bucket) + " " + F(c.count), 1)
              ]),
              _: 2
            }, 1024),
            (E(), A(ne, null, ue(b, (T) => (E(), A(ne, {
              key: T.key
            }, [
              c[T.key] ? (E(), de(m, {
                key: 0,
                severity: T.severity
              }, {
                default: Y(() => [
                  ce(F(T.label) + " " + F(c[T.key]), 1)
                ]),
                _: 2
              }, 1032, ["severity"])) : X("", !0)
            ], 64))), 64)),
            c.issue > 0 ? (E(), de(m, {
              key: 0,
              severity: "error",
              title: `${c.issue} row(s) marked as issue`
            }, {
              default: Y(() => [
                ce("issue " + F(c.issue), 1)
              ]),
              _: 2
            }, 1032, ["title"])) : X("", !0)
          ], 10, Yn))), 128))
        ]),
        $("div", Xn, F(a.value ? "Loading..." : s.value), 1)
      ]);
    };
  }
}, to = /* @__PURE__ */ Re(eo, [["__scopeId", "data-v-052b866f"]]), no = { class: "p-inputgroup-addon" }, oo = { style: { "margin-left": "0.5rem" } }, so = {
  key: 0,
  class: "ofd-target-row row"
}, ao = { class: "p-inputgroup-addon" }, io = { style: { "margin-left": "0.5rem" } }, lo = {
  __name: "OutputFileDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    audioKey: { type: String, default: "" },
    effect: { type: String, default: "" },
    normalize: { type: Boolean, default: !1 },
    speedMatch: { type: Boolean, default: !1 },
    normalizeDb: { type: Number, default: -20 },
    enDurationS: { type: Number, default: null },
    ruDurationS: { type: Number, default: null }
  },
  emits: ["update:visible", "apply"],
  setup(e, { emit: o }) {
    const t = e, n = o, s = [
      { value: "", label: "No effect" },
      { value: "radio", label: "📻 Radio" },
      { value: "phone", label: "📞 Phone" },
      { value: "muffled", label: "🤫 Muffled" },
      { value: "radio_dry", label: "📻 Radio (no static)" },
      { value: "intercom", label: "🔊 Intercom" },
      { value: "suit", label: "🧑‍🚀 Suit" }
    ], a = V(t.effect), r = V(t.normalize), v = V(t.speedMatch), k = V(t.normalizeDb);
    ye(() => t.visible, (b) => {
      b && (a.value = t.effect, r.value = t.normalize, v.value = t.speedMatch, k.value = t.normalizeDb);
    });
    const h = ae(() => {
      if (t.enDurationS == null || t.ruDurationS == null)
        return "Одна из длительностей неизвестна — сопоставление недоступно.";
      const b = t.ruDurationS / t.enDurationS, l = Math.round((b - 1) * 100);
      return Math.abs(l) < 1 ? "Длительности уже совпадают." : `RU ${l > 0 ? "длиннее" : "короче"} на ${Math.abs(l)}% — при включении RU подстроится под EN (тон сохранится).`;
    });
    function p() {
      n("apply", {
        effect: a.value,
        normalize: r.value,
        speedMatch: v.value,
        normalizeDb: k.value
      }), n("update:visible", !1);
    }
    return (b, l) => {
      const d = te("InputGroupAddon"), f = te("Dropdown"), _ = te("InputGroup"), m = te("Fieldset"), c = te("InputSwitch"), T = te("InputNumber"), O = te("Button"), x = te("Dialog");
      return E(), de(x, {
        visible: e.visible,
        modal: "",
        header: "Output File Settings",
        "onUpdate:visible": l[4] || (l[4] = (D) => b.$emit("update:visible", D))
      }, {
        footer: Y(() => [
          N(O, {
            label: "Apply",
            onClick: p
          })
        ]),
        default: Y(() => [
          N(m, { legend: "Effect" }, {
            default: Y(() => [
              N(_, null, {
                default: Y(() => [
                  N(d, null, {
                    default: Y(() => [...l[5] || (l[5] = [
                      $("i", { class: "pi pi-sliders-h" }, null, -1)
                    ])]),
                    _: 1
                  }),
                  N(f, {
                    inputId: "ofd-effect",
                    modelValue: a.value,
                    "onUpdate:modelValue": l[0] || (l[0] = (D) => a.value = D),
                    options: s,
                    optionLabel: "label",
                    optionValue: "value",
                    placeholder: "No effect"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              l[6] || (l[6] = $("small", null, " Аудио-эффект. Применяется после нормализации, перед сохранением файла. ", -1))
            ]),
            _: 1
          }),
          N(m, { legend: "Normalize" }, {
            default: Y(() => [
              N(_, null, {
                default: Y(() => [
                  N(d, null, {
                    default: Y(() => [...l[7] || (l[7] = [
                      $("i", { class: "pi pi-volume-up" }, null, -1)
                    ])]),
                    _: 1
                  }),
                  $("div", no, [
                    N(c, {
                      modelValue: r.value,
                      "onUpdate:modelValue": l[1] || (l[1] = (D) => r.value = D)
                    }, null, 8, ["modelValue"]),
                    $("label", oo, F(r.value ? "On" : "Off"), 1)
                  ])
                ]),
                _: 1
              }),
              r.value ? (E(), A("div", so, [
                l[8] || (l[8] = $("span", { class: "muted" }, "Target level:", -1)),
                N(T, {
                  modelValue: k.value,
                  "onUpdate:modelValue": l[2] || (l[2] = (D) => k.value = D),
                  min: -30,
                  max: -6,
                  step: 0.5,
                  "min-fraction-digits": 1,
                  "max-fraction-digits": 1,
                  suffix: " dB",
                  "show-buttons": "",
                  "button-layout": "horizontal",
                  class: "ofd-target-number"
                }, null, 8, ["modelValue"])
              ])) : X("", !0),
              l[9] || (l[9] = $("small", null, " Приводит RMS-громкость к целевому уровню. −20 dB — комфортный дефолт для диалогов; тише (−26…−24) — для шёпота и фоновых реплик, громче (−16…−14) — для криков. ", -1))
            ]),
            _: 1
          }),
          N(m, { legend: "Match duration" }, {
            default: Y(() => [
              N(_, null, {
                default: Y(() => [
                  N(d, null, {
                    default: Y(() => [
                      ce(" EN " + F(t.enDurationS != null ? t.enDurationS.toFixed(2) + "s" : "—") + " RU " + F(t.ruDurationS != null ? t.ruDurationS.toFixed(2) + "s" : "—"), 1)
                    ]),
                    _: 1
                  }),
                  $("div", ao, [
                    N(c, {
                      modelValue: v.value,
                      "onUpdate:modelValue": l[3] || (l[3] = (D) => v.value = D)
                    }, null, 8, ["modelValue"]),
                    $("label", io, F(v.value ? "On" : "Off"), 1)
                  ])
                ]),
                _: 1
              }),
              $("small", null, F(h.value), 1)
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, ro = /* @__PURE__ */ Re(lo, [["__scopeId", "data-v-0b1ebea7"]]);
let tt = null;
function uo() {
  const e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return e ? (tt || (tt = new e()), tt) : null;
}
async function co(e, o = 100) {
  const t = uo();
  if (!t) throw new Error("Web Audio not supported -- can't decode a waveform");
  const n = await fetch(e);
  if (!n.ok) throw new Error(`couldn't fetch ${e}: ${n.status}`);
  const s = await n.arrayBuffer(), r = (await t.decodeAudioData(s)).getChannelData(0), v = Math.max(1, Math.floor(r.length / o)), k = new Float32Array(o);
  for (let h = 0; h < o; h++) {
    const p = h * v, b = Math.min(r.length, p + v);
    let l = 0;
    for (let d = p; d < b; d++) {
      const f = Math.abs(r[d]);
      f > l && (l = f);
    }
    k[h] = l;
  }
  return k;
}
const fo = { class: "waveform-wrap" }, po = {
  key: 0,
  class: "waveform-status"
}, vo = {
  key: 1,
  class: "waveform-status",
  title: "Couldn't load a waveform for this file"
}, ho = {
  __name: "WaveformCanvas",
  props: {
    src: { type: String, default: "" }
  },
  setup(e) {
    const o = e, t = V(null), n = V(!1), s = V(!1);
    function a(v, k) {
      if (typeof v.getContext != "function") return;
      const h = window.devicePixelRatio || 1, p = v.clientWidth || 200, b = v.clientHeight || 28;
      v.width = Math.max(1, Math.round(p * h)), v.height = Math.max(1, Math.round(b * h));
      const l = v.getContext("2d");
      if (!l) return;
      l.setTransform(h, 0, 0, h, 0, 0), l.clearRect(0, 0, p, b);
      const d = p / k.length, f = b / 2;
      l.fillStyle = getComputedStyle(v).color || "#4caf50";
      for (let _ = 0; _ < k.length; _++) {
        const m = Math.max(1, k[_] * b);
        l.fillRect(_ * d, f - m / 2, Math.max(1, d - 1), m);
      }
    }
    async function r() {
      if (!(!o.src || !t.value)) {
        n.value = !0, s.value = !1;
        try {
          const v = t.value.clientWidth || 200, k = await co(o.src, Math.max(20, Math.round(v / 3)));
          t.value && a(t.value, k);
        } catch {
          s.value = !0;
        } finally {
          n.value = !1;
        }
      }
    }
    return qe(r), ye(() => o.src, r), (v, k) => (E(), A("div", fo, [
      $("canvas", {
        ref_key: "canvasEl",
        ref: t,
        class: "waveform-canvas"
      }, null, 512),
      n.value ? (E(), A("span", po, "…")) : s.value ? (E(), A("span", vo, "⚠")) : X("", !0)
    ]));
  }
}, Et = /* @__PURE__ */ Re(ho, [["__scopeId", "data-v-413ffbd4"]]), yo = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "when",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "must",
  "shall",
  "will",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "their",
  "this",
  "that",
  "these",
  "those",
  "though",
  "please"
]), _o = /* @__PURE__ */ new Set([
  "и",
  "да",
  "но",
  "а",
  "или",
  "ли",
  "бы",
  "же",
  "что",
  "чтобы",
  "как",
  "будто",
  "словно",
  "в",
  "во",
  "на",
  "с",
  "со",
  "к",
  "ко",
  "из",
  "изо",
  "по",
  "за",
  "от",
  "ото",
  "до",
  "без",
  "под",
  "над",
  "при",
  "про",
  "о",
  "об",
  "обо",
  "у",
  "для",
  "из-за",
  "из-под",
  "я",
  "ты",
  "он",
  "она",
  "оно",
  "мы",
  "вы",
  "они",
  "меня",
  "тебя",
  "его",
  "ее",
  "нас",
  "вас",
  "их",
  "мой",
  "твой",
  "свой",
  "наш",
  "ваш",
  "это",
  "этот",
  "эта",
  "эти",
  "то",
  "тот",
  "та",
  "те",
  "все-таки",
  "всё-таки",
  "уж",
  "вот"
]);
function Pe(e) {
  return Math.round(e * 10) / 10;
}
function Ue(e) {
  return String(e).split(/\s+/).filter(Boolean);
}
function Ct(e, o) {
  return (e.match(/[,;]/g) || []).length + (e.match(o) || []).length;
}
function mo(e) {
  return (e.match(/[aeiouyAEIOUY]+/g) || []).length;
}
function go(e) {
  return (e.match(/[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g) || []).length;
}
function It(e, o) {
  const n = String(e).toLowerCase().replace(/[^a-zа-яё\s]/gi, "").split(/\s+/).filter(Boolean).filter((s) => !o.has(s));
  return Math.max(1, n.length);
}
function it(e, o) {
  const t = String(e), n = String(o), s = It(t, yo), a = It(n, _o), v = Math.min(s, a) / Math.max(s, a) * 100, k = mo(t), h = go(n);
  let p = 100;
  if (k > 0) {
    const K = h / k, ge = 1.35, _e = 0.9;
    if (K > ge) {
      const be = K - ge;
      p = Math.max(0, 100 - be * 100);
    } else if (K < _e) {
      const be = _e - K;
      p = Math.max(0, 100 - be * 100);
    }
  }
  const b = v * 0.6 + p * 0.4, l = /\b(oh|ah|hm|ha|hey|ugh|wow|oops|tsk)\b/gi, d = /\b(ох|ах|хм|ха|эй|уф|ого|ой|упс|мда)\b/gi, f = (t.match(l) || []).length / Math.max(1, Ue(t).length) * 100, _ = (n.match(d) || []).length / Math.max(1, Ue(n).length) * 100, c = 100 * ((Math.min(f, _) + 0.01) / (Math.max(f, _) + 0.01)), T = /[aeiouyAEIOUY]/g, O = /[sxzSXZ]/g, x = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g, D = /[шжщчсзШЖЩЧСЗ]/g, w = (t.match(/[a-zA-Z]/g) || []).length || 1, L = (n.match(/[а-яёА-ЯЁ]/g) || []).length || 1, u = (t.match(T) || []).length / w, R = (n.match(x) || []).length / L, P = (t.match(O) || []).length / w, q = (n.match(D) || []).length / L, z = Math.abs(u - R), oe = Math.abs(P - q), le = 100 * (1 - Math.min(1, (z + oe) / 2)), y = (c + le) / 2, M = (K) => [
    K.includes("?"),
    K.includes("!"),
    K.includes("...") || K.includes("…"),
    /["«»]/.test(K),
    /^\s*[—-]/.test(K)
  ], J = M(t), H = M(n);
  let Z = 0;
  for (let K = 0; K < 5; K++)
    J[K] === H[K] && (Z += 1);
  const ee = Z / 5 * 100, I = Ue(t);
  let S = 100;
  if (I.length >= 7) {
    const K = /* @__PURE__ */ new Set([
      "the",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "and",
      "or",
      "but",
      "of",
      "to",
      "in",
      "on",
      "at",
      "it"
    ]), ge = /* @__PURE__ */ new Set([
      "и",
      "а",
      "но",
      "в",
      "на",
      "с",
      "к",
      "о",
      "у",
      "что",
      "это",
      "я",
      "ты",
      "он",
      "она"
    ]), _e = (Ee) => String(Ee).toLowerCase().replace(/[^a-zа-яё\s]/gi, "").split(/\s+/).filter(Boolean), be = _e(t).filter((Ee) => !K.has(Ee)), Me = _e(n).filter((Ee) => !ge.has(Ee)), xe = new Set(be).size / Math.max(1, be.length), Ge = new Set(Me).size / Math.max(1, Me.length);
    S = Math.min(xe, Ge) / Math.max(xe, Ge, 1e-4) * 100;
  }
  const C = /\b(and|but|or|so|because|although)\b/gi, U = /\b(и|а|но|или|потому|хотя)\b/gi, G = Ue(n), se = Ct(t, C) / (I.length || 1) * 10, j = Ct(n, U) / (G.length || 1) * 10, ie = 100 * ((Math.min(se, j) + 0.01) / (Math.max(se, j) + 0.01));
  return [
    { key: "syllableRatio", label: "Акцентно-ритмическое соответствие (CosyVoice 3)", score: Pe(b) },
    { key: "acousticTexture", label: "Звуковая/фонетическая согласованность", score: Pe(y) },
    { key: "edgeParity", label: "Интонационно-краевые маркеры", score: Pe(ee) },
    { key: "lexicalDiversity", label: "Лексическое разнообразие (TTR)", score: Pe(S) },
    { key: "pauseDensity", label: "Плотность микропауз", score: Pe(ie) }
  ];
}
const bo = { class: "translation-similarity-radar" }, So = { class: "radar-chart-container" }, ko = ["viewBox"], Ro = ["points"], To = ["x2", "y2"], wo = ["d"], Eo = ["y"], Co = ["cx", "cy", "onMouseenter"], Io = ["x", "y"], $o = ["x", "y", "text-anchor", "dy"], Po = { class: "radar-metrics-list" }, Oo = { class: "metric-info" }, Do = { class: "metric-label" }, Ao = { class: "metric-score-val" }, Mo = { class: "metric-bar-bg" }, Oe = 300, Se = 95, $t = 3, Be = 30, xo = {
  __name: "TranslationSimilarityRadar",
  props: {
    original: { type: String, default: "" },
    translation: { type: String, default: "" }
  },
  setup(e) {
    const o = V(null), t = {
      syllableRatio: "Слоги",
      acousticTexture: "Фонетика",
      edgeParity: "Маркеры",
      lexicalDiversity: "TTR",
      pauseDensity: "Паузы"
    }, n = e, s = ae(() => {
      try {
        if (typeof it == "function") {
          const T = it(n.original, n.translation);
          if (Array.isArray(T) && T.length > 0)
            return T;
        }
      } catch {
      }
      const f = n.original || "", _ = n.translation || "", m = Math.abs(_.length - f.length), c = Math.max(0, Math.min(100, Math.round(100 - m / Math.max(f.length, 1) * 50)));
      return [
        { key: "semantic", label: "Semantic Match", score: _.length > 0 ? 85 : 0 },
        { key: "length", label: "Length Ratio", score: c },
        { key: "completeness", label: "Completeness", score: _.length > 0 ? 90 : 0 },
        { key: "fluency", label: "Fluency", score: _.length > 0 ? 80 : 0 },
        { key: "vocabulary", label: "Vocabulary", score: _.length > 0 ? 78 : 0 }
      ];
    }), a = Oe / 2, r = ae(() => {
      const f = s.value.reduce((_, m) => _ + m.score, 0);
      return Math.round(f / s.value.length);
    }), v = ae(() => s.value.length || 5), k = ae(() => {
      const f = v.value, _ = [];
      for (let m = 0; m < f; m++) {
        const c = m * 2 * Math.PI / f - Math.PI / 2;
        _.push({
          x: a + Se * Math.cos(c),
          y: a + Se * Math.sin(c),
          angle: c
        });
      }
      return _;
    }), h = ae(() => {
      const f = v.value, _ = [];
      for (let m = 1; m <= $t; m++) {
        const c = Se * m / $t, T = [];
        for (let O = 0; O < f; O++) {
          const x = O * 2 * Math.PI / f - Math.PI / 2, D = a + c * Math.cos(x), w = a + c * Math.sin(x);
          T.push(`${D},${w}`);
        }
        _.push({ level: m, points: T.join(" ") });
      }
      return _;
    }), p = ae(() => {
      const f = v.value, _ = [];
      return s.value.forEach((m, c) => {
        const T = c * 2 * Math.PI / f - Math.PI / 2, O = Math.max(0, Math.min(100, m.score ?? 0)), x = Se * O / 100, D = Math.max(x, Be), w = a + D * Math.cos(T), L = a + D * Math.sin(T);
        _.push({ x: w, y: L, score: O, label: m.label, key: m.key, clamped: x <= Be });
      }), _;
    }), b = ae(() => {
      const f = p.value, _ = f.length;
      if (_ === 0) return "";
      let m = `M ${f[0].x} ${f[0].y}`;
      for (let c = 1; c <= _; c++) {
        const T = f[c - 1], O = f[c % _];
        T.clamped && O.clamped ? m += ` A ${Be} ${Be} 0 0 1 ${O.x} ${O.y}` : m += ` L ${O.x} ${O.y}`;
      }
      return `${m} Z`;
    });
    function l(f) {
      const _ = Math.cos(f);
      return Math.abs(_) < 0.25 ? "middle" : _ > 0 ? "start" : "end";
    }
    function d(f) {
      const _ = Math.sin(f);
      return _ < -0.5 ? "-6" : _ > 0.5 ? "14" : "4";
    }
    return (f, _) => (E(), A("div", bo, [
      $("div", So, [
        (E(), A("svg", {
          width: Oe,
          height: Oe,
          viewBox: `0 0 ${Oe} ${Oe}`,
          class: "radar-svg"
        }, [
          (E(!0), A(ne, null, ue(h.value, (m) => (E(), A("polygon", {
            key: m.level,
            points: m.points,
            class: "radar-grid-polygon"
          }, null, 8, Ro))), 128)),
          (E(!0), A(ne, null, ue(k.value, (m, c) => (E(), A("line", {
            key: "axis-" + c,
            x1: a,
            y1: a,
            x2: m.x,
            y2: m.y,
            class: "radar-axis-line"
          }, null, 8, To))), 128)),
          p.value.length > 0 ? (E(), A("path", {
            key: 0,
            d: b.value,
            class: "radar-data-polygon"
          }, null, 8, wo)) : X("", !0),
          $("circle", {
            cx: a,
            cy: a,
            r: "30",
            fill: "#1e1e22"
          }),
          $("text", {
            x: a,
            y: a + 5,
            "text-anchor": "middle",
            class: "radar-center-text-main"
          }, F(r.value) + "%", 9, Eo),
          (E(!0), A(ne, null, ue(p.value, (m, c) => (E(), A("circle", {
            key: "pt-" + c,
            cx: m.x,
            cy: m.y,
            r: "4",
            class: pe(["radar-data-node", { "radar-data-node-active": c === o.value }]),
            onMouseenter: (T) => o.value = c,
            onMouseleave: _[0] || (_[0] = (T) => o.value = null)
          }, null, 42, Co))), 128)),
          (E(!0), A(ne, null, ue(p.value, (m, c) => (E(), A("text", {
            key: "pct-" + c,
            x: a + Math.max(Se * m.score / 100 + 14, 40) * Math.cos(c * 2 * Math.PI / v.value - Math.PI / 2),
            y: a + Math.max(Se * m.score / 100 + 14, 40) * Math.sin(c * 2 * Math.PI / v.value - Math.PI / 2),
            "text-anchor": "middle",
            class: "radar-node-percent"
          }, F(Math.round(m.score)) + "% ", 9, Io))), 128)),
          (E(!0), A(ne, null, ue(k.value, (m, c) => {
            var T, O, x;
            return E(), A("text", {
              key: "label-" + c,
              x: a + (Se + 22) * Math.cos(m.angle),
              y: a + (Se + 22) * Math.sin(m.angle),
              "text-anchor": l(m.angle),
              dy: d(m.angle),
              class: "radar-axis-label"
            }, [
              $("title", null, F((T = s.value[c]) == null ? void 0 : T.label), 1),
              ce(" " + F(t[(O = s.value[c]) == null ? void 0 : O.key] || ((x = s.value[c]) == null ? void 0 : x.label) || `Metric ${c + 1}`), 1)
            ], 8, $o);
          }), 128))
        ], 8, ko))
      ]),
      $("div", Po, [
        (E(!0), A(ne, null, ue(s.value, (m, c) => (E(), A("div", {
          key: m.key,
          class: pe(["radar-metric-item", { "radar-metric-item-active": c === o.value }])
        }, [
          $("div", Oo, [
            $("span", Do, F(m.label), 1),
            $("span", Ao, F(Math.round(m.score)) + "%", 1)
          ]),
          $("div", Mo, [
            $("div", {
              class: "metric-bar-fill",
              style: De({ width: Math.max(0, Math.min(100, m.score)) + "%" })
            }, null, 4)
          ])
        ], 2))), 128))
      ])
    ]));
  }
}, Lo = /* @__PURE__ */ Re(xo, [["__scopeId", "data-v-2f7dabc6"]]), Vo = { class: "compact-circle" }, No = 400, nt = 8, Fo = {
  __name: "TranslationSimilarityCompact",
  props: {
    original: { type: String, default: "" },
    translation: { type: String, default: "" }
  },
  setup(e) {
    const o = e, t = ae(() => {
      try {
        const l = it(o.original, o.translation);
        if (!Array.isArray(l) || l.length === 0) return 0;
        const d = l.reduce((f, _) => f + (_.score || 0), 0);
        return Math.round(d / l.length);
      } catch {
        return 0;
      }
    }), n = V(null), s = V({ top: 0, left: 0, placement: "below" }), a = V(!1);
    let r = null;
    function v() {
      const l = n.value;
      if (!l) return;
      const d = l.getBoundingClientRect(), f = window.innerWidth, _ = window.innerHeight, m = No, c = 540;
      let T = "below", O = d.bottom + nt;
      O + c > _ && d.top - c - nt > 0 && (T = "above", O = d.top - c - nt);
      let x = d.left + d.width / 2 - m / 2;
      x + m > f - 8 && (x = f - m - 8), x < 8 && (x = 8), s.value = { top: O, left: x, placement: T };
    }
    function k() {
      clearTimeout(r), v(), a.value = !0;
    }
    function h() {
      clearTimeout(r), r = setTimeout(() => {
        a.value = !1;
      }, 120);
    }
    function p() {
      clearTimeout(r);
    }
    function b() {
      a.value && v();
    }
    return window.addEventListener("scroll", b, !0), window.addEventListener("resize", b), ut(() => {
      window.removeEventListener("scroll", b, !0), window.removeEventListener("resize", b), clearTimeout(r);
    }), (l, d) => (E(), A(ne, null, [
      $("div", {
        ref_key: "circleRef",
        ref: n,
        class: "similarity-compact-wrapper",
        onMouseenter: k,
        onMouseleave: h
      }, [
        $("div", Vo, F(t.value) + "% ", 1)
      ], 544),
      (E(), de(gn, { to: "body" }, [
        a.value ? (E(), A("div", {
          key: 0,
          class: "similarity-popover",
          style: De({ top: s.value.top + "px", left: s.value.left + "px" }),
          onMouseenter: p,
          onMouseleave: h
        }, [
          N(Lo, {
            original: e.original,
            translation: e.translation
          }, null, 8, ["original", "translation"])
        ], 36)) : X("", !0)
      ]))
    ], 64));
  }
}, Uo = /* @__PURE__ */ Re(Fo, [["__scopeId", "data-v-9f2bc65b"]]), Bo = { class: "row" }, jo = { class: "row" }, zo = { class: "row" }, Ho = { class: "filter-clear-wrapper row" }, qo = {
  __name: "RowFilterBar",
  props: {
    statusOptions: {
      type: Array,
      required: !0
    },
    selectedStatuses: {
      type: Set,
      required: !0
    },
    tristates: {
      type: Array,
      required: !0
    },
    tristateValues: {
      type: Object,
      required: !0
    },
    hasActive: {
      type: Boolean,
      required: !0
    }
  },
  emits: ["toggle-status", "cycle-tristate", "clear"],
  setup(e, { emit: o }) {
    const t = e, n = o;
    function s(p) {
      n("toggle-status", p);
    }
    function a(p) {
      n("cycle-tristate", p);
    }
    function r() {
      n("clear");
    }
    function v(p) {
      const b = t.tristateValues[p.key], l = p.stateLabels && p.stateLabels[b];
      return l || (b === "only" ? `${p.label} ✓` : b === "without" ? `${p.label} ✗` : p.label);
    }
    function k(p) {
      const b = t.tristateValues[p.key];
      return b === "only" ? "success" : b === "without" ? "danger" : null;
    }
    function h(p) {
      return t.selectedStatuses.has(p);
    }
    return (p, b) => {
      const l = te("Button");
      return E(), A("div", Bo, [
        $("div", jo, [
          (E(!0), A(ne, null, ue(e.statusOptions, (d) => (E(), de(l, {
            key: d.value,
            "data-status": d.value,
            "aria-pressed": h(d.value),
            outlined: !h(d.value),
            onClick: (f) => s(d.value)
          }, {
            default: Y(() => [
              ce(F(d.label), 1)
            ]),
            _: 2
          }, 1032, ["data-status", "aria-pressed", "outlined", "onClick"]))), 128))
        ]),
        $("div", zo, [
          (E(!0), A(ne, null, ue(e.tristates, (d) => (E(), de(l, {
            key: d.key,
            "data-tristate": d.key,
            "data-state": e.tristateValues[d.key],
            severity: k(d),
            outlined: e.tristateValues[d.key] === "any",
            onClick: (f) => a(d.key)
          }, {
            default: Y(() => [
              ce(F(v(d)), 1)
            ]),
            _: 2
          }, 1032, ["data-tristate", "data-state", "severity", "outlined", "onClick"]))), 128))
        ]),
        $("div", Ho, [
          N(l, {
            "data-testid": "filter-clear",
            label: "Clear",
            disabled: !e.hasActive,
            onClick: r
          }, null, 8, ["disabled"])
        ])
      ]);
    };
  }
}, Wo = /* @__PURE__ */ Re(qo, [["__scopeId", "data-v-227b9cf0"]]);
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Ft;
const Ae = (e) => Ft = e, Ut = (
  /* istanbul ignore next */
  Symbol()
);
function Pt(e) {
  return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
function Go() {
  const e = Lt(!0), o = e.run(() => V({}));
  let t = [], n = [];
  const s = xt({
    install(a) {
      Ae(s), s._a = a, a.provide(Ut, s), a.config.globalProperties.$pinia = s, n.forEach((r) => t.push(r)), n = [];
    },
    use(a) {
      return this._a ? t.push(a) : n.push(a), this;
    },
    _p: t,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: o
  });
  return s;
}
const lt = () => {
};
function Ot(e, o, t, n = lt) {
  e.add(o);
  const s = () => {
    e.delete(o) && n();
  };
  return !t && Rn() && Tn(s), s;
}
function Ce(e, ...o) {
  e.forEach((t) => {
    t(...o);
  });
}
const Jo = (e) => e(), Dt = Symbol(), ot = Symbol();
function rt(e, o) {
  e instanceof Map && o instanceof Map ? o.forEach((t, n) => e.set(n, t)) : e instanceof Set && o instanceof Set && o.forEach(e.add, e);
  for (const t in o) {
    if (!Object.hasOwn(o, t)) continue;
    const n = o[t], s = e[t];
    Pt(s) && Pt(n) && Object.hasOwn(e, t) && !ve(n) && !ct(n) ? e[t] = rt(s, n) : e[t] = n;
  }
  return e;
}
const Ko = (
  /* istanbul ignore next */
  Symbol()
);
function Zo(e) {
  return !e || typeof e != "object" || !Object.hasOwn(e, Ko);
}
const { assign: ke } = Object;
function Yo(e) {
  return !!(ve(e) && e.effect);
}
function Xo(e, o, t, n) {
  const { state: s, actions: a, getters: r } = o, v = t.state.value[e];
  let k;
  function h() {
    v || (t.state.value[e] = s ? s() : {});
    const p = En(t.state.value[e]);
    return ke(p, a, Object.keys(r || {}).reduce((b, l) => (b[l] = xt(ae(() => {
      Ae(t);
      const d = t._s.get(e);
      return r[l].call(d, d);
    })), b), {}));
  }
  return k = Bt(e, h, o, t, n, !0), k;
}
function Bt(e, o, t = {}, n, s, a) {
  let r;
  const v = ke({ actions: {} }, t), k = { deep: !0 };
  let h, p, b = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), d;
  const f = n.state.value[e];
  !a && !f && (n.state.value[e] = {});
  let _;
  function m(L) {
    let u;
    h = p = !1, typeof L == "function" ? (L(n.state.value[e]), u = {
      type: "patch function",
      storeId: e,
      events: d
    }) : (rt(n.state.value[e], L), u = {
      type: "patch object",
      payload: L,
      storeId: e,
      events: d
    });
    const R = _ = Symbol();
    wn().then(() => {
      _ === R && (h = !0);
    }), p = !0, Ce(b, u, n.state.value[e]);
  }
  const c = a ? function() {
    const { state: u } = t, R = u ? u() : {};
    this.$patch((P) => {
      ke(P, R);
    });
  } : lt;
  function T() {
    r.stop(), b.clear(), l.clear(), n._s.delete(e);
  }
  const O = (L, u = "") => {
    if (Dt in L)
      return L[ot] = u, L;
    const R = function() {
      Ae(n);
      const P = Array.from(arguments), q = /* @__PURE__ */ new Set(), z = /* @__PURE__ */ new Set();
      function oe(M) {
        q.add(M);
      }
      function le(M) {
        z.add(M);
      }
      Ce(l, {
        args: P,
        name: R[ot],
        store: D,
        after: oe,
        onError: le
      });
      let y;
      try {
        y = L.apply(this && this.$id === e ? this : D, P);
      } catch (M) {
        throw Ce(z, M), M;
      }
      return y instanceof Promise ? y.then((M) => (Ce(q, M), M)).catch((M) => (Ce(z, M), Promise.reject(M))) : (Ce(q, y), y);
    };
    return R[Dt] = !0, R[ot] = u, R;
  }, x = {
    _p: n,
    $id: e,
    $onAction: Ot.bind(null, l),
    $patch: m,
    $reset: c,
    $subscribe(L, u = {}) {
      if (b.has(L))
        return lt;
      const R = Ot(b, L, u.detached, () => P()), P = r.run(() => ye(() => n.state.value[e], (q) => {
        (u.flush === "sync" ? p : h) && L({
          storeId: e,
          type: "direct",
          events: d
        }, q);
      }, ke({}, k, u)));
      return R;
    },
    $dispose: T
  }, D = he(x);
  n._s.set(e, D);
  const w = (n._a && n._a.runWithContext || Jo)(() => n._e.run(() => (r = Lt()).run(() => o({ action: O }))));
  for (const L in w) {
    const u = w[L];
    ve(u) && !Yo(u) || ct(u) ? a || (f && Zo(u) && (ve(u) ? u.value = f[L] : ((u instanceof Set || u instanceof Map) && u.clear(), rt(u, f[L]))), n.state.value[e][L] = u) : typeof u == "function" && (w[L] = O(u, L), v.actions[L] = u);
  }
  return ke(D, w), ke(He(D), w), Object.defineProperty(D, "$state", {
    get: () => n.state.value[e],
    set: (L) => {
      m((u) => {
        ke(u, L);
      });
    }
  }), n._p.forEach((L) => {
    const u = r.run(() => L({
      store: D,
      app: n._a,
      pinia: n,
      options: v
    }));
    ke(D, u);
  }), f && a && t.hydrate && t.hydrate(D.$state, f), h = !0, p = !0, D;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Qo(e, o, t) {
  let n;
  const s = typeof o == "function";
  n = s ? t : o;
  function a(r, v) {
    const k = kn();
    return r = r || (k ? Sn(Ut, null) : null), r && Ae(r), r = Ft, r._s.has(e) || (s ? Bt(e, o, n, r) : Xo(e, n, r)), r._s.get(e);
  }
  return a.$id = e, a;
}
function es(e) {
  const o = He(e), t = {};
  for (const n in o) {
    const s = o[n];
    s != null && s.effect ? t[n] = ae({
      get: () => e[n],
      set(a) {
        e[n] = a;
      }
    }) : (ve(s) || ct(s)) && (t[n] = bn(e, n));
  }
  return t;
}
const ze = {
  "": "All statuses",
  no_text: "No source text",
  needs_translation: "Needs translation",
  not_started: "Not started",
  stale: "Stale",
  done: "Ready",
  unsupported: "Unsupported (multi-channel)"
}, ts = [
  { value: "not_done", label: "Not done" },
  { value: "manually_done", label: "Done (manual)" },
  { value: "issues", label: "⚠ Issues only" }
];
function ns(e, o) {
  return [...Object.entries(e || {}).map(([n, s]) => ({ value: n, label: s })), ...o || []];
}
const os = ns(
  ze,
  ts
), ss = {
  no_text: "text-warning",
  needs_translation: "text-active",
  stale: "text-warning",
  done: "text-success"
};
function as(e) {
  return ss[e] || "muted";
}
const is = [
  { value: "no_text", label: "No text" },
  { value: "needs_translation", label: "Needs translation" },
  { value: "not_started", label: "Not started" },
  { value: "stale", label: "Stale" },
  { value: "done", label: "Ready" },
  { value: "unsupported", label: "Unsupported" }
], ls = [
  {
    key: "manuallyDone",
    label: "Done (manual)",
    stateLabels: { without: "Not done" }
  },
  { key: "issues", label: "⚠ Issues" }
], At = 600, je = 50, rs = /* @__PURE__ */ Qo("voDub", () => {
  const e = V(""), o = V(""), t = V([]), n = he({}), s = V(/* @__PURE__ */ new Set()), a = V("any"), r = V("any"), v = V(""), k = V(""), h = ae({
    get() {
      return s.value.size === 1 ? Array.from(s.value)[0] : a.value === "only" ? "manually_done" : a.value === "without" ? "not_done" : r.value === "only" ? "issues" : "";
    },
    set(I) {
      I ? I === "manually_done" ? (s.value = /* @__PURE__ */ new Set(), a.value = "only", r.value = "any") : I === "not_done" ? (s.value = /* @__PURE__ */ new Set(), a.value = "without", r.value = "any") : I === "issues" ? (s.value = /* @__PURE__ */ new Set(), a.value = "any", r.value = "only") : (s.value = /* @__PURE__ */ new Set([I]), a.value = "any", r.value = "any") : (s.value = /* @__PURE__ */ new Set(), a.value = "any", r.value = "any"), O();
    }
  }), p = V(!1), b = V(!1), l = V({}), d = V(null), f = V(0);
  function _() {
    return $e(e.value, "_dub_state.json");
  }
  const m = "FL_VoDub.filterState";
  function c() {
    try {
      const I = localStorage.getItem(m);
      if (!I) return;
      const S = JSON.parse(I);
      if (S && typeof S == "object") {
        if (Array.isArray(S.statuses)) {
          const C = Object.keys(ze), U = S.statuses.filter((G) => C.includes(G));
          s.value = new Set(U);
        }
        ["any", "only", "without"].includes(S.manuallyDone) && (a.value = S.manuallyDone), ["any", "only", "without"].includes(S.issues) && (r.value = S.issues);
      }
    } catch {
    }
  }
  function T() {
    try {
      const I = {
        statuses: Array.from(s.value),
        manuallyDone: a.value,
        issues: r.value
      };
      localStorage.setItem(m, JSON.stringify(I));
    } catch {
    }
  }
  function O() {
    T();
  }
  function x(I) {
    if (!I || !ze.hasOwnProperty(I))
      return;
    const S = new Set(s.value);
    S.has(I) ? S.delete(I) : S.add(I), s.value = S;
  }
  function D() {
    a.value === "any" ? a.value = "only" : a.value === "only" ? a.value = "without" : a.value = "any";
  }
  function w() {
    r.value === "any" ? r.value = "only" : r.value === "only" ? r.value = "without" : r.value = "any";
  }
  function L() {
    s.value = /* @__PURE__ */ new Set(), a.value = "any", r.value = "any";
  }
  const u = ae(
    () => s.value.size > 0 || a.value !== "any" || r.value !== "any"
  );
  function R({ root: I, bucket: S }) {
    e.value = I, o.value = S, s.value = /* @__PURE__ */ new Set(), a.value = "any", r.value = "any", c(), v.value = "", f.value = 0;
  }
  async function P() {
    const S = await (await fetch(`${we}/read?path=${encodeURIComponent(_())}`)).json();
    let C = { rows: {} };
    if (S.exists)
      try {
        const U = JSON.parse(S.content);
        U && typeof U.rows == "object" && (C = U);
      } catch (U) {
        console.warn("[VODubStore] _dub_state.json is not valid JSON:", U);
      }
    Object.keys(n).forEach((U) => delete n[U]), Object.assign(n, C.rows), b.value = !!C.use_original_default;
  }
  function q() {
    const I = He(n), S = {};
    for (const C of t.value) {
      const U = I[C.audio_key];
      S[C.audio_key] = U && U.russian_text || C.russian || "";
    }
    l.value = S;
  }
  async function z() {
    if (e.value) {
      p.value = !0;
      try {
        const I = new URLSearchParams({
          path: e.value,
          bucket: o.value
        });
        h.value && I.set("status", h.value);
        const C = await (await fetch(`${me}/rows?${I.toString()}`)).json();
        if (C.error) {
          k.value = C.error, t.value = [];
          return;
        }
        t.value = C.rows || [];
        for (const U of t.value) {
          const G = n[U.audio_key] || (n[U.audio_key] = {});
          G.russian_text || (G.russian_text = U.russian || ""), G.instruct === void 0 && (G.instruct = U.instruct || ""), G.speaker_override === void 0 && (G.speaker_override = ""), G.effect === void 0 && (G.effect = "");
        }
        k.value = `${t.value.length} row(s) in ${o.value}`, q();
      } catch (I) {
        k.value = `Couldn't load: ${I}`;
      } finally {
        p.value = !1;
      }
    }
  }
  function oe(I) {
    return n[I.audio_key] || (n[I.audio_key] = {});
  }
  function le() {
    d.value && clearTimeout(d.value), d.value = setTimeout(y, At);
  }
  async function y() {
    try {
      await fetch(`${we}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: _(),
          content: JSON.stringify(
            { rows: n, use_original_default: b.value },
            null,
            2
          )
        })
      }), k.value = "Saved", z();
    } catch (I) {
      k.value = `Save failed: ${I}`;
    }
  }
  function M(I) {
    oe(I), le();
  }
  function J(I) {
    k.value = I;
  }
  const H = ae(() => {
    const I = v.value.trim().toLowerCase(), S = s.value, C = a.value, U = r.value, G = l.value, se = He(n);
    return t.value.filter((j) => {
      const B = se[j.audio_key] || null, ie = !!(B && B.manually_done), K = !!j.manually_issue;
      if (S.size > 0 && !S.has(j.status))
        return !1;
      if (C === "only") {
        if (!ie) return !1;
      } else if (C === "without" && (ie || j.status === "unsupported" && !S.has("unsupported")))
        return !1;
      if (U === "only") {
        if (!K) return !1;
      } else if (U === "without" && K)
        return !1;
      if (!I) return !0;
      const ge = G[j.audio_key] || j.russian;
      return `${j.audio_key} ${j.speaker_tag} ${j.english} ${ge}`.toLowerCase().includes(I);
    });
  }), Z = ae(
    () => Math.max(1, Math.ceil(H.value.length / je))
  ), ee = ae(() => {
    const I = f.value * je;
    return H.value.slice(I, I + je);
  });
  return ye([s, a, r], () => {
    f.value = 0, z(), T();
  }), ye(v, () => {
    q(), f.value = 0;
  }), ye(H, () => {
    f.value > Z.value - 1 && (f.value = Math.max(0, Z.value - 1));
  }), {
    root: e,
    bucket: o,
    init: R,
    rows: t,
    stateRows: n,
    statusFilter: h,
    filterStatuses: s,
    filterManuallyDone: a,
    filterIssues: r,
    searchText: v,
    status: k,
    loading: p,
    useOriginalDefault: b,
    entryFor: oe,
    loadState: P,
    loadRows: z,
    scheduleSave: le,
    flushSave: y,
    onTextEdit: M,
    setStatus: J,
    saveTimer: d,
    visibleRows: H,
    PAGE_SIZE: je,
    currentPage: f,
    pageCount: Z,
    pagedRows: ee,
    SAVE_DEBOUNCE_MS: At,
    statePath: _,
    STATUS_LABELS: ze,
    STATUS_FILTER_OPTIONS: os,
    STATUS_TOGGLE_OPTIONS: is,
    TRISTATE_FILTERS: ls,
    toggleStatus: x,
    cycleManuallyDone: D,
    cycleIssues: w,
    clearFilters: L,
    hasActiveFilters: u
  };
});
function us(e) {
  const { props: o, setStatus: t, entryFor: n, scheduleSave: s } = e, a = V(!1), r = V(null), v = V([]), k = V(null), h = he({});
  async function p() {
    try {
      const f = await (await fetch(
        `${me}/line_history/counts?root=${encodeURIComponent(o.root)}`
      )).json();
      f && !f.error && Object.assign(h, f);
    } catch (d) {
      console.error("[FL history] couldn't load version counts", d);
    }
  }
  async function b(d) {
    r.value = d;
    try {
      const _ = await (await fetch(
        `${me}/line_history?root=${encodeURIComponent(o.root)}&audio_key=${encodeURIComponent(d.audio_key)}`
      )).json();
      v.value = _.versions || [], k.value = _.chosen_version ?? null;
    } catch (f) {
      console.error("[FL history] couldn't load line history", f), v.value = [], k.value = null;
    }
    a.value = !0;
  }
  async function l(d) {
    const f = r.value;
    if (f)
      try {
        const m = await (await fetch(`${me}/line_history/choose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            root: o.root,
            audio_key: f.audio_key,
            version: d
          })
        })).json();
        if (m && m.error) {
          t(`Couldn't switch version: ${m.error}`);
          return;
        }
        k.value = d, t(`Switched ${f.audio_key} to version ${d}`), n(f).active_version = d, s(), e.cacheBust && (e.cacheBust[f.audio_key] = Date.now()), e.loadRows && await e.loadRows(), p();
      } catch (_) {
        t(`Couldn't switch version: ${_.message || _}`);
      }
  }
  return {
    historyVisible: a,
    historyRow: r,
    historyVersions: v,
    historyChosenVersion: k,
    historyCounts: h,
    refreshHistoryCounts: p,
    openLineHistory: b,
    onHistoryVersionChosen: l
  };
}
function cs(e) {
  const { props: o, rows: t, entryFor: n, setStatus: s, scheduleSave: a } = e, r = V([]);
  async function v() {
    try {
      const T = await (await fetch(
        `${we}/read?path=${encodeURIComponent($e(o.root, "_dub_roles.json"))}`
      )).json();
      if (!T.exists) {
        r.value = [];
        return;
      }
      const O = JSON.parse(T.content), x = O && typeof O.roles == "object" && O.roles || {};
      r.value = Object.entries(x).map(([D, w]) => ({ code: D, ...w }));
    } catch {
      r.value = [];
    }
  }
  function k(c) {
    return [c.character, c.speaker].filter(Boolean).join(" -- ");
  }
  function h(c) {
    return (n(c).speaker_override || c.speaker_tag || "").trim();
  }
  const {
    popover: p,
    show: b,
    hide: l,
    info: d
  } = Ln(
    r,
    (c) => [
      ["character", c.character],
      ["gender", c.gender],
      ["actor", c.actor],
      ["description", c.description],
      ["dub direction", c.dub_direction],
      ["notes", Array.isArray(c.notes) ? c.notes.join(" ") : c.notes],
      ["voice", c.speaker]
    ].filter(([, T]) => T != null && T !== "")
  );
  function f(c) {
    const T = (c.speaker_tag || "").trim();
    return T ? t.value.filter(
      (O) => O !== c && O.status !== "unsupported" && (O.speaker_tag || "").trim() === T
    ).length : 0;
  }
  function _(c) {
    const T = f(c);
    return T > 0 ? `Apply this Role to every other "${c.speaker_tag}" row in this bucket (${T})` : "No other rows in this bucket share this Identifier";
  }
  function m(c) {
    const T = f(c);
    if (!T) return;
    const O = (c.speaker_tag || "").trim(), x = n(c).speaker_override || c.speaker_tag;
    t.value.forEach((D) => {
      D !== c && D.status !== "unsupported" && (D.speaker_tag || "").trim() === O && (n(D).speaker_override = x);
    }), a(), s(`Applied Role to ${T} other "${O}" row(s) in this bucket`);
  }
  return {
    roleEntries: r,
    loadRoleEntries: v,
    roleCodeFor: h,
    roleOptionSubLabel: k,
    sameIdentifierCount: f,
    applyRoleTitle: _,
    applyRoleToSameIdentifier: m,
    roleInfoPopover: p,
    showRoleInfoPopover: b,
    hideRoleInfoPopover: l,
    roleInfoFields: d
  };
}
function ds(e) {
  const {
    props: o,
    rows: t,
    entryFor: n,
    onTextEdit: s,
    setStatus: a,
    scheduleSave: r,
    roleCodeFor: v
  } = e, k = V([]);
  function h() {
    return $e(o.root, "_instruct_categories.json");
  }
  async function p() {
    try {
      const R = await (await fetch(
        `${we}/read?path=${encodeURIComponent(h())}`
      )).json();
      if (!R.exists) {
        k.value = [];
        return;
      }
      const P = JSON.parse(R.content);
      k.value = P && P.categories || [];
    } catch {
      k.value = [];
    }
  }
  const b = /* @__PURE__ */ new Map();
  function l(u) {
    clearTimeout(b.get(u.audio_key)), b.set(
      u.audio_key,
      setTimeout(async () => {
        const R = n(u).instruct, P = await Vn(
          we,
          h(),
          R
        );
        P && (k.value = P);
      }, 600)
      // синхронно с SAVE_DEBOUNCE_MS из state
    );
  }
  const d = V(!1), f = V(null);
  function _(u) {
    f.value = u, d.value = !0;
  }
  const m = he({});
  function c(u) {
    const R = f.value;
    R && (m[R.audio_key] = n(R).instruct, n(R).instruct = u, s(R), l(R));
  }
  function T(u) {
    return m[u.audio_key] !== void 0 ? `Restore previous instruct: "${m[u.audio_key]}"` : "No previous instruct to restore";
  }
  function O(u) {
    if (m[u.audio_key] === void 0) return;
    const R = n(u).instruct;
    n(u).instruct = m[u.audio_key], m[u.audio_key] = R, s(u);
  }
  function x(u) {
    const R = (n(u).instruct || "").trim(), P = k.value.find(
      (q) => (q.examples || []).some((z) => z.trim() === R)
    );
    return P ? P.title : null;
  }
  function D(u) {
    const R = v(u);
    return R ? t.value.filter(
      (P) => P !== u && P.status !== "unsupported" && v(P) === R
    ).length : 0;
  }
  function w(u) {
    const R = D(u);
    return R > 0 ? `Apply this instruct to every other "${v(u)}" row in this bucket (${R})` : "No other rows in this bucket use this role";
  }
  function L(u) {
    const R = D(u);
    if (!R) return;
    const P = v(u), q = n(u).instruct;
    t.value.forEach((z) => {
      z !== u && z.status !== "unsupported" && v(z) === P && (n(z).instruct = q);
    }), r(), a(`Applied instruct to ${R} other "${P}" row(s) in this bucket`);
  }
  return {
    instructCategories: k,
    loadInstructCategories: p,
    scheduleInstructLibrarySave: l,
    instructPickerVisible: d,
    instructPickerRow: f,
    openInstructPicker: _,
    onInstructPicked: c,
    prevInstruct: m,
    undoInstructTitle: T,
    undoInstruct: O,
    instructNoteFor: x,
    sameRoleCount: D,
    applyInstructTitle: w,
    applyInstructToSameRole: L
  };
}
function fs(e) {
  const {
    props: o,
    entryFor: t,
    onTextEdit: n,
    setStatus: s,
    loadRows: a
  } = e, r = V(!1), v = V(null);
  function k(l) {
    v.value = l, r.value = !0;
  }
  function h(l) {
    return t(l).effect || "";
  }
  async function p(l) {
    var d;
    s(`Applying settings to ${l.audio_key}...`);
    try {
      const _ = await (await fetch(`${me}/apply_effect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          root: o.root,
          audio_key: l.audio_key,
          effect: t(l).effect || "",
          normalize: !!t(l).normalize,
          normalize_db: Number(t(l).normalize_db ?? -20),
          speed_match: !!t(l).speed_match,
          version: t(l).active_version ?? null
        })
      })).json();
      if (_.error) {
        s(`Couldn't apply settings to ${l.audio_key}: ${_.error}`);
        return;
      }
      const m = await e.currentContentHash(l);
      t(l).hash = m, e.cacheBust && (e.cacheBust[l.audio_key] = Date.now()), await a(), (d = e.refreshHistoryCounts) == null || d.call(e), s(`Applied settings to ${l.audio_key}`);
    } catch (f) {
      s(`Couldn't apply settings to ${l.audio_key}: ${f}`);
    }
  }
  function b(l) {
    var _;
    const d = v.value;
    if (!d) return;
    const f = t(d);
    f.effect = l.effect, f.normalize = l.normalize, f.speed_match = l.speedMatch, f.normalize_db = l.normalizeDb, n(d), (_ = e.hasRuTake) != null && _.call(e, d) && p(d);
  }
  return {
    outputDialogVisible: r,
    dialogRow: v,
    openOutputDialog: k,
    onDialogApply: b,
    effectValue: h,
    applyEffectToFile: p,
    speedMatchValue: (l) => !!t(l).speed_match
  };
}
const jt = 3;
function Mt(e) {
  let o = !1;
  e.addEventListener("play", () => {
    if (o || e.readyState >= jt) return;
    o = !0, e.pause();
    const t = () => {
      e.removeEventListener("canplaythrough", t), o = !1, e.play().catch(() => {
      });
    };
    e.addEventListener("canplaythrough", t);
  });
}
function st(e) {
  return new Promise((o) => {
    if (e.readyState >= jt) {
      o();
      return;
    }
    const t = () => {
      e.removeEventListener("canplaythrough", t), o();
    };
    e.addEventListener("canplaythrough", t), e.load();
  });
}
let at = null;
function ps() {
  const e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return e ? (at || (at = new e()), at) : null;
}
function vs(e, o = 1024) {
  const t = new Float32Array(o), n = Math.tanh(e) || 1;
  for (let s = 0; s < o; s++) {
    const a = s / (o - 1) * 2 - 1;
    t[s] = Math.tanh(a * e) / n;
  }
  return t;
}
function hs(e, o, t) {
  const s = e.createBuffer(1, Math.max(1, Math.floor(e.sampleRate * 2)), e.sampleRate), a = s.getChannelData(0);
  for (let h = 0; h < a.length; h++) a[h] = Math.random() * 2 - 1;
  const r = e.createBufferSource();
  r.buffer = s, r.loop = !0;
  const v = e.createBiquadFilter();
  v.type = "highpass", v.frequency.value = o;
  const k = e.createBiquadFilter();
  return k.type = "lowpass", k.frequency.value = t, r.connect(v), v.connect(k), r.start(), k;
}
function Ie(e, { lowHz: o, highHz: t, drive: n, noiseLevel: s }) {
  const a = e.createBiquadFilter();
  a.type = "highpass", a.frequency.value = o;
  const r = e.createBiquadFilter();
  r.type = "lowpass", r.frequency.value = t, a.connect(r);
  let v = r;
  if (n > 0) {
    const p = e.createWaveShaper();
    p.curve = vs(n), p.oversample = "2x", r.connect(p), v = p;
  }
  if (s <= 0) return { input: a, output: v };
  const k = e.createGain();
  k.gain.value = s, hs(e, o, t).connect(k);
  const h = e.createGain();
  return v.connect(h), k.connect(h), { input: a, output: h };
}
const ys = {
  radio: (e) => Ie(e, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0.05 }),
  phone: (e) => Ie(e, { lowHz: 300, highHz: 3400, drive: 1.05, noiseLevel: 0 }),
  /*
   Wide passband, no clip, no noise -- a natural muffled quality, not a
   telephony one. See nodes/_audio_effects.py's muffled_effect for the
   same params and the reasoning/reference behind them.
  */
  muffled: (e) => Ie(e, { lowHz: 120, highHz: 6e3, drive: 0, noiseLevel: 0 }),
  /*
   radio's band and grit with NO static of its own -- for dubbing a game
   that already layers its own channel noise over the line as a separate
   sound, where baking in a second layer would stack the two. See
   nodes/_audio_effects.py's radio_dry_effect for the case behind it.
  */
  radio_dry: (e) => Ie(e, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0 }),
  /*
   Hard-wired intercom/PA panel -- between phone and radio at both ends,
   more grit than phone, no static.
  */
  intercom: (e) => Ie(e, { lowHz: 250, highHz: 4e3, drive: 1.2, noiseLevel: 0 }),
  /*
   Inside a sealed helmet -- low end largely kept, only the top rolled
   off, drive below 1.0 so the clip stays in its near-identity region.
  */
  suit: (e) => Ie(e, { lowHz: 150, highHz: 5e3, drive: 0.6, noiseLevel: 0 })
};
function _s(e) {
  const o = { setEffect() {
  } }, t = ps();
  if (!t) return o;
  let n;
  try {
    n = t.createMediaElementSource(e);
  } catch {
    return o;
  }
  const s = t.createGain();
  s.gain.value = e.paused ? 0 : 1, s.connect(t.destination);
  function a() {
    s.gain.value = e.paused ? 0 : 1;
  }
  e.addEventListener("play", a), e.addEventListener("pause", a), e.addEventListener("ended", a);
  const r = t.createGain();
  n.connect(r), r.connect(s);
  const v = {};
  function k(b) {
    if (v[b]) return v[b];
    const l = ys[b];
    if (!l) return null;
    const d = l(t);
    n.connect(d.input);
    const f = t.createGain();
    return f.gain.value = 0, d.output.connect(f), f.connect(s), v[b] = f, f;
  }
  let h = "";
  function p(b) {
    const l = b || "";
    if (l === h) return;
    if (h && v[h] && (v[h].gain.value = 0), h = "", !l) {
      r.gain.value = 1;
      return;
    }
    const d = k(l);
    if (!d) {
      r.gain.value = 1;
      return;
    }
    h = l, r.gain.value = 0, d.gain.value = 1, t.state === "suspended" && t.resume().catch(() => {
    });
  }
  return { setEffect: p };
}
function ms(e) {
  const {
    props: o,
    pagedRows: t,
    effectValue: n,
    effectPreviews: s
    // hasRuTake — через ctx.hasRuTake?.() в момент вызова (Render позже)
  } = e;
  function a(u, R) {
    return $e($e(o.root, u), `${R}.wav`);
  }
  function r(u, R, P) {
    const q = `${Cn}/audio?path=${encodeURIComponent(a(u, R))}`;
    return P ? `${q}&v=${P}` : q;
  }
  function v(u) {
    return a("audio_ru", u.audio_key);
  }
  function k(u) {
    return a("_dub_dry", u.audio_key);
  }
  const h = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map();
  function b(u, R) {
    if (!R) {
      h.delete(u);
      return;
    }
    h.set(u, R), Mt(R);
  }
  function l(u, R) {
    const P = u.audio_key;
    if (!R) {
      p.delete(P), s.delete(P);
      return;
    }
    p.set(P, R), Mt(R);
    const q = _s(R);
    s.set(P, q), q.setEffect(n(u));
  }
  const d = he(/* @__PURE__ */ new Set()), f = he(/* @__PURE__ */ new Set());
  function _(u, R) {
    if (d.delete(u.audio_key), R === "ru" && c.value === u.audio_key) {
      const P = p.get(u.audio_key);
      P && !P.ended && O();
    }
  }
  async function m(u) {
    const R = h.get(u.audio_key), P = p.get(u.audio_key);
    if (!(!R || !P)) {
      if (d.has(u.audio_key) || f.has(u.audio_key)) {
        f.delete(u.audio_key), d.delete(u.audio_key), R.pause(), P.pause();
        return;
      }
      R.pause(), P.pause(), R.currentTime = 0, P.currentTime = 0, f.add(u.audio_key), await Promise.all([st(R), st(P)]), f.delete(u.audio_key), h.has(u.audio_key) && (R.currentTime = 0, P.currentTime = 0, d.add(u.audio_key), R.play().catch(() => {
      }), P.play().catch(() => {
      }));
    }
  }
  const c = V(null);
  let T = null;
  function O() {
    var R;
    T && (T.el.removeEventListener("ended", T.fn), T = null);
    const u = c.value;
    c.value = null, u && ((R = p.get(u)) == null || R.pause());
  }
  async function x(u) {
    var le, y;
    O();
    const R = t.value;
    let P = u;
    for (; P < R.length && !((le = e.hasRuTake) != null && le.call(e, R[P])); ) P++;
    if (P >= R.length) return;
    const q = R[P], z = p.get(q.audio_key);
    if (!z || (c.value = q.audio_key, (y = w.get(q.audio_key)) == null || y.scrollIntoView({ behavior: "smooth", block: "nearest" }), await st(z), c.value !== q.audio_key)) return;
    const oe = () => {
      z.removeEventListener("ended", oe), T = null, x(P + 1);
    };
    T = { el: z, fn: oe }, z.addEventListener("ended", oe), z.currentTime = 0, z.play().catch(() => {
    });
  }
  function D() {
    c.value ? O() : x(0);
  }
  const w = /* @__PURE__ */ new Map();
  function L(u, R) {
    if (!R) {
      w.delete(u);
      return;
    }
    w.set(u, R);
  }
  return {
    rawAudioPath: a,
    audioUrl: r,
    ruFilePath: v,
    dryFilePath: k,
    setEnAudioRef: b,
    setRuAudioRef: l,
    dualPlayingRows: d,
    dualLoadingRows: f,
    playBoth: m,
    onTrackPaused: _,
    sequentialPlayingKey: c,
    stopSequentialPlayback: O,
    playSequentialFrom: x,
    toggleSequentialPlayback: D,
    rowEls: w,
    setRowRef: L
  };
}
const gs = 0.15, bs = 0.4;
function Ss(e) {
  const {
    props: o,
    rows: t,
    entryFor: n,
    onTextEdit: s,
    setStatus: a,
    loadRows: r,
    scheduleSave: v,
    useOriginalDefault: k
  } = e;
  function h(y) {
    const M = n(y).use_original_sample;
    return M === void 0 ? k.value : !!M;
  }
  function p(y, M) {
    n(y).use_original_sample = M, s(y);
  }
  function b() {
    v();
  }
  const l = he(/* @__PURE__ */ new Set()), d = he(/* @__PURE__ */ new Set()), f = he({}), _ = he({});
  function m(y, M) {
    f[y.audio_key] = M.target.duration;
  }
  function c(y, M = 8e3) {
    return new Promise((J) => {
      const H = new Audio();
      let Z = !1;
      const ee = (C) => {
        Z || (Z = !0, H.removeEventListener("loadedmetadata", I), H.removeEventListener("error", S), J(C));
      }, I = () => ee(H.duration || null), S = () => ee(null);
      H.addEventListener("loadedmetadata", I), H.addEventListener("error", S), setTimeout(() => ee(null), M), H.preload = "metadata", H.src = y;
    });
  }
  function T(y) {
    return y.status === "done" || y.status === "stale" || l.has(y.audio_key);
  }
  function O(y) {
    return !!n(y).manually_done;
  }
  function x(y) {
    n(y).manually_done = !O(y), s(y);
  }
  function D(y) {
    return !!n(y).manually_issue;
  }
  function w(y) {
    n(y).manually_issue = !D(y), s(y);
  }
  async function L(y) {
    const M = n(y), J = y.speaker, H = M.instruct || "", Z = M.russian_text || "", ee = M.effect || "";
    let I = H;
    if (ee && (I += `\0effect=${ee}`), M.normalize) {
      const S = Number(M.normalize_db ?? -20);
      I += `\0normalize=${S.toFixed(1)}`;
    }
    return M.speed_match && (I += "\0speed=match"), h(y) && (I += "\0sample=original"), Nn(J, I, Z);
  }
  async function u(y, M) {
    var Z;
    const J = Date.now(), H = await c(
      ((Z = e.audioUrl) == null ? void 0 : Z.call(e, "audio_ru", y.audio_key, J)) || ""
    );
    await fetch(`${me}/mark_rendered`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        root: o.root,
        audio_key: y.audio_key,
        hash: M,
        duration_s: H
      })
    }), H !== null && (f[y.audio_key] = H), l.add(y.audio_key), _[y.audio_key] = J;
  }
  async function R(y) {
    var M, J, H, Z, ee, I;
    if (!(!o.renderApi || d.has(y.audio_key))) {
      if (!o.root) {
        a("Project root is not set.");
        return;
      }
      d.add(y.audio_key), a(`Rendering ${y.audio_key}...`);
      try {
        (M = e.saveTimer) != null && M.value && clearTimeout(e.saveTimer.value), await ((J = e.flushSave) == null ? void 0 : J.call(e));
        const S = n(y), C = y.speaker, U = S.instruct || "", G = S.russian_text || "", se = S.effect || "", j = h(y) && ((H = e.rawAudioPath) == null ? void 0 : H.call(e, "audio_en", y.audio_key)) || "", B = await L(y), ie = ((Z = e.ruFilePath) == null ? void 0 : Z.call(e, y)) || "", K = ((ee = e.dryFilePath) == null ? void 0 : ee.call(e, y)) || "";
        await o.renderApi.renderRow({
          audioKey: y.audio_key,
          speaker: C,
          instruct: U,
          russianText: G,
          effect: se,
          outputPath: ie,
          dryOutputPath: K,
          referenceAudioPath: j,
          normalize: !!S.normalize,
          normalize_db: Number(S.normalize_db ?? -20),
          speed_match: !!S.speed_match
        }), S.hash = B, await u(y, B), a(`Rendered ${y.audio_key}`), await r(), (I = e.refreshHistoryCounts) == null || I.call(e);
      } catch (S) {
        a(`Render failed for ${y.audio_key}: ${S}`);
      } finally {
        d.delete(y.audio_key);
      }
    }
  }
  async function P(y) {
    var M;
    if (!d.has(y.audio_key)) {
      if (!o.root) {
        a("Project root is not set.");
        return;
      }
      if (!y.english) {
        a(`No EN reference for ${y.audio_key} — nothing to copy`);
        return;
      }
      d.add(y.audio_key), a(`Copying EN → RU for ${y.audio_key}...`);
      try {
        const H = await (await fetch(`${me}/use_original`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: o.root, audio_key: y.audio_key })
        })).json();
        if (H.error) {
          a(`Copy failed: ${H.error}`);
          return;
        }
        _[y.audio_key] = Date.now(), l.add(y.audio_key), await r(), (M = e.refreshHistoryCounts) == null || M.call(e), a(`Used original EN for ${y.audio_key}`);
      } catch (J) {
        a(`Copy failed: ${J}`);
      } finally {
        d.delete(y.audio_key);
      }
    }
  }
  const q = V(!1);
  async function z() {
    if (!o.renderApi || q.value) return;
    const y = t.value.filter(
      (J) => J.status === "not_started" || J.status === "stale"
    );
    if (!y.length) {
      a("Nothing needs rendering in this bucket");
      return;
    }
    q.value = !0;
    let M = 0;
    a(`Rendering 0/${y.length}...`);
    try {
      for (const J of y) {
        try {
          await R(J);
        } catch (H) {
          console.error(`[FL VODubEditor] render-all-pending failed for ${J.audio_key}`, H);
        }
        M++, a(`Rendering ${M}/${y.length}...`);
      }
    } finally {
      q.value = !1;
    }
  }
  function oe(y) {
    return y.duration_s ? `EN ${y.duration_s.toFixed(1)}s` : "EN";
  }
  function le(y) {
    const M = f[y.audio_key] ?? y.rendered_duration_s, J = y.duration_s;
    if (!T(y) || M == null || !J) return null;
    const H = (M - J) / J, Z = Math.round(H * 100), ee = Math.abs(H);
    return {
      level: ee <= gs ? "good" : ee <= bs ? "warn" : "bad",
      ruSeconds: `${M.toFixed(1)}s`,
      pctText: `${Z >= 0 ? "+" : ""}${Z}%`
    };
  }
  return {
    renderedOnce: l,
    renderingKeys: d,
    cacheBust: _,
    isRenderingAllPending: q,
    currentContentHash: L,
    finalizeRuTake: u,
    renderRow: R,
    useOriginalForRow: P,
    renderAllPending: z,
    hasRuTake: T,
    manuallyDone: O,
    toggleManuallyDone: x,
    manuallyIssue: D,
    toggleManuallyIssue: w,
    measuredDuration: f,
    onRuMetadata: m,
    durationBadge: le,
    enDurationText: oe,
    resolvedUseOriginal: h,
    onToggleRowUseOriginal: p,
    onToggleUseOriginalDefault: b
  };
}
function ks(e) {
  const {
    roleEntries: o,
    roleOptionSubLabel: t,
    showRoleInfoPopover: n,
    hideRoleInfoPopover: s,
    fontSizePx: a,
    autoGrow: r,
    setTextareaRef: v,
    audioUrl: k,
    cacheBust: h,
    entryFor: p,
    onTextEdit: b,
    scheduleInstructLibrarySave: l,
    roleCodeFor: d,
    prevInstruct: f,
    undoInstructTitle: _,
    undoInstruct: m,
    sameRoleCount: c,
    applyInstructTitle: T,
    applyInstructToSameRole: O,
    instructNoteFor: x,
    openInstructPicker: D
  } = e;
  In("lineRowApi", {
    roleEntries: o,
    roleOptionSubLabel: t,
    fontSizePx: a,
    autoGrow: r,
    setTextareaRef: v,
    showRoleInfoPopover: n,
    hideRoleInfoPopover: s,
    speakerPlaceholder: "Role",
    speakerTitle: "Role code (resolves to that role's assigned voice), or a literal preset/preset#tag",
    instructPlaceholder: "Instruct",
    instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
    textPlaceholder: "Russian text for this line",
    getSpeaker: (w) => p(w).speaker_override || w.speaker_tag,
    setSpeaker: (w, L) => {
      p(w).speaker_override = L, b(w);
    },
    getInstruct: (w) => p(w).instruct,
    setInstruct: (w, L) => {
      p(w).instruct = L, b(w), l(w);
    },
    getText: (w) => p(w).russian_text,
    setText: (w, L) => {
      p(w).russian_text = L, b(w);
    },
    getRoleInfoCode: (w) => d(w),
    textKey: (w) => w.audio_key,
    canUndoInstruct: (w) => f[w.audio_key] !== void 0,
    undoInstructTitle: (w) => _(w),
    undoInstruct: (w) => m(w),
    canApplyInstruct: (w) => c(w) > 0,
    applyInstructTitle: (w) => T(w),
    applyInstructToSameRole: (w) => O(w),
    instructNoteFor: (w) => x(w),
    openInstructPicker: (w) => D(w),
    getOriginalAudioUrl: (w) => k ? k("audio_en", w.audio_key) : "",
    getCurrentAudioUrl: (w) => k ? k("audio_ru", w.audio_key, h == null ? void 0 : h[w.audio_key]) : ""
  });
}
const Rs = { class: "fl-vo-dub-line-editor-content" }, Ts = { class: "row" }, ws = { class: "vo-dub-editor-status muted ellipsis" }, Es = { class: "actions" }, Cs = { class: "row" }, Is = { class: "vo-dub-pager-label muted" }, $s = { title: "Project-wide default for the per-row 'Use original as sample' checkbox." }, Ps = { class: "row" }, Os = { class: "vo-dub-key mono title" }, Ds = {
  key: 0,
  class: "vo-dub-unsupported-note"
}, As = { class: "vo-dub-players list" }, Ms = { class: "vo-dub-duration-line row" }, xs = { class: "vo-dub-duration-en" }, Ls = { class: "vo-dub-duration-ru" }, Vs = {
  key: 1,
  class: "vo-dub-similarity-slot"
}, Ns = { class: "vo-dub-players-row" }, Fs = { class: "vo-dub-player list" }, Us = ["src", "onPause", "onEnded"], Bs = { class: "vo-dub-player list" }, js = ["src", "onLoadedmetadata", "onPause", "onEnded"], zs = {
  key: 2,
  class: "vo-dub-no-take muted"
}, Hs = { class: "vo-dub-players-footer actions" }, qs = {
  class: "vo-dub-identifier ellipsis mono",
  title: "Identifier extracted from the game's own resources (vo_dataset.csv's speaker column)"
}, Ws = {
  class: "vo-dub-use-original-label row",
  title: "Use this row's own EN take as the voice-cloning sample for its next render."
}, Gs = { class: "vo-dub-english muted" }, Js = {
  key: 0,
  class: "vo-dub-empty muted"
}, Ks = {
  __name: "VoDubLineEditorContent",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const o = e;
    Vt({
      storageKey: "FL_CosyVoice3.VODubLineEditor.widthPx",
      defaultWidth: 1100,
      presets: [800, 1100, 1500]
    });
    const { fontSizePx: t } = Nt({
      storageKey: "FL_CosyVoice3.VODubLineEditor.fontSizePx",
      defaultSize: 13
    }), { autoGrow: n, setTextareaRef: s, regrowAll: a } = Wn();
    ye(t, a);
    const r = /* @__PURE__ */ new Map(), v = V(!0);
    let k = !1;
    const h = rs();
    h.init({ root: o.root, bucket: o.bucket });
    const p = {
      props: o,
      effectPreviews: r,
      autoGrow: n,
      setTextareaRef: s,
      fontSizePx: t
    }, b = es(h);
    Object.assign(p, {
      // refs
      rows: b.rows,
      statusFilter: b.statusFilter,
      searchText: b.searchText,
      status: b.status,
      loading: b.loading,
      useOriginalDefault: b.useOriginalDefault,
      saveTimer: b.saveTimer,
      currentPage: b.currentPage,
      visibleRows: b.visibleRows,
      pageCount: b.pageCount,
      pagedRows: b.pagedRows,
      filterStatuses: b.filterStatuses,
      filterManuallyDone: b.filterManuallyDone,
      filterIssues: b.filterIssues,
      hasActiveFilters: b.hasActiveFilters,
      // reactive — напрямую
      stateRows: h.stateRows,
      // функции
      entryFor: h.entryFor,
      loadState: h.loadState,
      loadRows: h.loadRows,
      scheduleSave: h.scheduleSave,
      flushSave: h.flushSave,
      onTextEdit: h.onTextEdit,
      setStatus: h.setStatus,
      statePath: h.statePath,
      toggleStatus: h.toggleStatus,
      cycleManuallyDone: h.cycleManuallyDone,
      cycleIssues: h.cycleIssues,
      clearFilters: h.clearFilters,
      // константы
      SAVE_DEBOUNCE_MS: h.SAVE_DEBOUNCE_MS,
      PAGE_SIZE: h.PAGE_SIZE,
      STATUS_LABELS: h.STATUS_LABELS,
      STATUS_FILTER_OPTIONS: h.STATUS_FILTER_OPTIONS,
      STATUS_TOGGLE_OPTIONS: h.STATUS_TOGGLE_OPTIONS,
      TRISTATE_FILTERS: h.TRISTATE_FILTERS
    }), Object.assign(p, us(p)), Object.assign(p, cs(p)), Object.assign(p, ds(p)), Object.assign(p, fs(p)), Object.assign(p, ms(p)), Object.assign(p, Ss(p)), ks(p);
    const {
      // state
      rows: l,
      stateRows: d,
      statusFilter: f,
      searchText: _,
      status: m,
      loading: c,
      useOriginalDefault: T,
      entryFor: O,
      loadState: x,
      loadRows: D,
      scheduleSave: w,
      flushSave: L,
      onTextEdit: u,
      setStatus: R,
      visibleRows: P,
      PAGE_SIZE: q,
      currentPage: z,
      pageCount: oe,
      pagedRows: le,
      STATUS_LABELS: y,
      STATUS_FILTER_OPTIONS: M,
      saveTimer: J,
      filterStatuses: H,
      filterManuallyDone: Z,
      filterIssues: ee,
      hasActiveFilters: I,
      toggleStatus: S,
      cycleManuallyDone: C,
      cycleIssues: U,
      clearFilters: G,
      STATUS_TOGGLE_OPTIONS: se,
      TRISTATE_FILTERS: j,
      // history
      historyVisible: B,
      historyRow: ie,
      historyVersions: K,
      historyChosenVersion: ge,
      historyCounts: _e,
      refreshHistoryCounts: be,
      openLineHistory: Me,
      onHistoryVersionChosen: xe,
      // roles
      roleEntries: Ge,
      loadRoleEntries: ht,
      roleCodeFor: Ee,
      roleOptionSubLabel: ga,
      sameIdentifierCount: zt,
      applyRoleTitle: Ht,
      applyRoleToSameIdentifier: qt,
      roleInfoPopover: Je,
      showRoleInfoPopover: ba,
      hideRoleInfoPopover: Sa,
      roleInfoFields: yt,
      // instruct
      instructCategories: Wt,
      loadInstructCategories: Gt,
      instructPickerVisible: Ke,
      instructPickerRow: ka,
      openInstructPicker: Ra,
      onInstructPicked: Jt,
      prevInstruct: Ta,
      undoInstructTitle: wa,
      undoInstruct: Ea,
      instructNoteFor: Ca,
      sameRoleCount: Ia,
      applyInstructToSameRole: $a,
      // effects
      effectValue: Kt,
      speedMatchValue: Zt,
      commitEffect: Pa,
      applyEffectToFile: Oa,
      outputDialogVisible: Ze,
      dialogRow: fe,
      openOutputDialog: Yt,
      onDialogApply: Xt,
      // players
      audioUrl: Le,
      setEnAudioRef: Qt,
      setRuAudioRef: en,
      dualPlayingRows: _t,
      dualLoadingRows: tn,
      playBoth: nn,
      onTrackPaused: Ve,
      sequentialPlayingKey: Ye,
      toggleSequentialPlayback: on,
      setRowRef: sn,
      // render
      cacheBust: mt,
      renderingKeys: Xe,
      isRenderingAllPending: Qe,
      renderRow: an,
      useOriginalForRow: ln,
      renderAllPending: rn,
      hasRuTake: Te,
      manuallyDone: et,
      toggleManuallyDone: un,
      manuallyIssue: Ne,
      toggleManuallyIssue: cn,
      measuredDuration: dn,
      onRuMetadata: fn,
      durationBadge: Fe,
      enDurationText: pn,
      resolvedUseOriginal: vn,
      onToggleRowUseOriginal: hn,
      onToggleUseOriginalDefault: yn
    } = p;
    qe(async () => {
      ht(), Gt(), be(), await x(), await D();
    });
    function _n() {
      k || (k = !0, J.value && (clearTimeout(J.value), L()), o.onClose());
    }
    return ye(v, (gt) => {
      gt || _n();
    }), (gt, W) => {
      var St, kt, Rt;
      const mn = te("InputText"), re = te("Button"), bt = te("Checkbox");
      return E(), A(ne, null, [
        $("div", Rs, [
          N(Un, { class: "vo-dub-editor-controls" }, {
            default: Y(() => [
              $("div", Ts, [
                N(mn, {
                  modelValue: i(_),
                  "onUpdate:modelValue": W[0] || (W[0] = (g) => ve(_) ? _.value = g : null),
                  placeholder: "Search text or audio_key...",
                  class: "vo-dub-search"
                }, null, 8, ["modelValue"]),
                N(Wo, {
                  statusOptions: i(se),
                  selectedStatuses: i(H),
                  tristates: i(j),
                  tristateValues: { manuallyDone: i(Z), issues: i(ee) },
                  hasActive: i(I),
                  onToggleStatus: i(S),
                  onCycleTristate: W[1] || (W[1] = (g) => {
                    g === "manuallyDone" ? i(C)() : g === "issues" && i(U)();
                  }),
                  onClear: i(G)
                }, null, 8, ["statusOptions", "selectedStatuses", "tristates", "tristateValues", "hasActive", "onToggleStatus", "onClear"]),
                N(re, {
                  icon: "pi pi-refresh",
                  title: "Re-scan this bucket",
                  onClick: i(D)
                }, null, 8, ["onClick"]),
                $("span", ws, F(i(c) ? "Loading..." : i(m)), 1)
              ]),
              $("div", Es, [
                $("div", Cs, [
                  N(re, {
                    label: "◀",
                    disabled: i(z) === 0,
                    title: "Previous page",
                    onClick: W[2] || (W[2] = (g) => z.value--)
                  }, null, 8, ["disabled"]),
                  $("span", Is, F(i(z) + 1) + " / " + F(i(oe)) + " (" + F(i(P).length) + ") ", 1),
                  N(re, {
                    label: "▶",
                    disabled: i(z) >= i(oe) - 1,
                    title: "Next page",
                    onClick: W[3] || (W[3] = (g) => z.value++)
                  }, null, 8, ["disabled"])
                ]),
                W[10] || (W[10] = $("span", { class: "divider" }, null, -1)),
                N(re, {
                  label: "´ Stress mark",
                  title: "Insert a stress mark at the cursor",
                  onMousedown: W[4] || (W[4] = $n((g) => i(Fn)(i(R)), ["prevent"]))
                }),
                N(re, {
                  label: i(Ye) ? "Stop" : "Play in order",
                  icon: i(Ye) ? "pi pi-stop-circle" : "pi pi-play",
                  onClick: i(on)
                }, null, 8, ["label", "icon", "onClick"]),
                N(re, {
                  label: i(Qe) ? "Rendering..." : "Render pending",
                  icon: i(Qe) ? "pi pi-spin pi-spinner" : "pi pi-play",
                  disabled: !o.renderApi || i(Qe),
                  onClick: i(rn)
                }, null, 8, ["label", "icon", "disabled", "onClick"]),
                $("label", $s, [
                  N(bt, {
                    modelValue: i(T),
                    "onUpdate:modelValue": W[5] || (W[5] = (g) => ve(T) ? T.value = g : null),
                    binary: "",
                    onChange: i(yn)
                  }, null, 8, ["modelValue", "onChange"]),
                  W[9] || (W[9] = ce(" Original as sample ", -1))
                ])
              ])
            ]),
            _: 1
          }),
          $("div", {
            class: "vo-dub-rows list",
            style: De({ fontSize: `${i(t)}px` })
          }, [
            (E(!0), A(ne, null, ue(i(le), (g) => {
              var Tt;
              return E(), A("div", {
                key: g.audio_key,
                class: pe(["vo-dub-row card", { "row-playing": i(Ye) === g.audio_key, "row-issue": i(Ne)(g) }]),
                ref_for: !0,
                ref: (Q) => i(sn)(g.audio_key, Q)
              }, [
                $("div", Ps, [
                  $("span", Os, F(g.audio_key), 1),
                  $("span", {
                    class: pe(["pill", i(as)(g.status)])
                  }, F(i(y)[g.status]), 3),
                  i(Te)(g) ? (E(), de(re, {
                    key: 0,
                    class: pe(["vo-dub-done-btn", { active: i(et)(g) }]),
                    icon: i(et)(g) ? "pi pi-check-circle" : "pi pi-circle",
                    label: i(et)(g) ? "Done" : "Mark done",
                    title: "Manually treat this row as done even if its content has drifted since the last render.",
                    onClick: (Q) => i(un)(g)
                  }, null, 8, ["class", "icon", "label", "onClick"])) : X("", !0),
                  N(re, {
                    class: pe(["vo-dub-issue-btn", { active: i(Ne)(g) }]),
                    severity: "danger",
                    icon: i(Ne)(g) ? "pi pi-exclamation-triangle" : "pi pi-exclamation-circle",
                    label: i(Ne)(g) ? "Issue" : "Mark issue",
                    title: "Flag this row as needing attention. Independent from Done — both can be set at once.",
                    onClick: (Q) => i(cn)(g)
                  }, null, 8, ["class", "icon", "label", "onClick"])
                ]),
                g.status === "unsupported" ? (E(), A("div", Ds, [
                  ce(" Unsupported: " + F(g.channels) + "-channel audio split across multiple files (", 1),
                  W[11] || (W[11] = $("code", null, ".a", -1)),
                  W[12] || (W[12] = ce("-", -1)),
                  W[13] || (W[13] = $("code", null, ".d", -1)),
                  W[14] || (W[14] = ce(") -- this editor can only play or render a single mono/stereo file per row. Handle this one outside the tool. ", -1))
                ])) : (E(), A(ne, { key: 1 }, [
                  $("div", As, [
                    $("div", Ms, [
                      $("span", xs, F(i(pn)(g)), 1),
                      W[15] || (W[15] = $("span", { class: "vo-dub-duration-arrow" }, "→", -1)),
                      $("span", Ls, " RU " + F(((Tt = i(Fe)(g)) == null ? void 0 : Tt.ruSeconds) || "—"), 1),
                      i(Fe)(g) ? (E(), A("span", {
                        key: 0,
                        class: pe(["vo-dub-duration-delta", i(Bn)(i(Fe)(g).level)])
                      }, F(i(Fe)(g).pctText), 3)) : X("", !0),
                      g.english && i(O)(g).russian_text ? (E(), A("span", Vs, [
                        N(Uo, {
                          original: g.english,
                          translation: i(O)(g).russian_text
                        }, null, 8, ["original", "translation"])
                      ])) : X("", !0)
                    ]),
                    $("div", Ns, [
                      $("div", Fs, [
                        N(Et, {
                          src: i(Le)("audio_en", g.audio_key)
                        }, null, 8, ["src"]),
                        $("audio", {
                          class: "w100p",
                          controls: "",
                          preload: "none",
                          src: i(Le)("audio_en", g.audio_key),
                          ref_for: !0,
                          ref: (Q) => i(Qt)(g.audio_key, Q),
                          onPause: (Q) => i(Ve)(g, "en"),
                          onEnded: (Q) => i(Ve)(g, "en")
                        }, null, 40, Us)
                      ]),
                      N(re, {
                        class: pe(["play-both-btn", { playing: i(_t).has(g.audio_key) }]),
                        label: "Play both",
                        icon: i(tn).has(g.audio_key) ? "pi pi-spin pi-spinner" : i(_t).has(g.audio_key) ? "pi pi-pause" : "pi pi-play",
                        disabled: !i(Te)(g),
                        title: i(Te)(g) ? "Play EN and RU together, from the start" : "No RU take yet -- nothing to compare",
                        onClick: (Q) => i(nn)(g)
                      }, null, 8, ["class", "icon", "disabled", "title", "onClick"]),
                      $("div", Bs, [
                        i(Te)(g) ? (E(), de(Et, {
                          key: 0,
                          src: i(Le)("audio_ru", g.audio_key, i(mt)[g.audio_key])
                        }, null, 8, ["src"])) : X("", !0),
                        i(Te)(g) ? (E(), A("audio", {
                          key: 1,
                          class: "w100p",
                          controls: "",
                          preload: "none",
                          crossorigin: "anonymous",
                          src: i(Le)("audio_ru", g.audio_key, i(mt)[g.audio_key]),
                          ref_for: !0,
                          ref: (Q) => i(en)(g, Q),
                          onLoadedmetadata: (Q) => i(fn)(g, Q),
                          onPause: (Q) => i(Ve)(g, "ru"),
                          onEnded: (Q) => i(Ve)(g, "ru")
                        }, null, 40, js)) : (E(), A("span", zs, "not rendered yet"))
                      ])
                    ]),
                    $("div", Hs, [
                      o.renderApi ? (E(), de(re, {
                        key: 0,
                        class: pe(["vo-dub-render-btn", { stale: g.status === "stale" }]),
                        label: i(Te)(g) ? "Re-render" : "Render",
                        icon: i(Xe).has(g.audio_key) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                        disabled: i(Xe).has(g.audio_key),
                        title: i(Te)(g) ? "Re-render this row" : "Render this row",
                        onClick: (Q) => i(an)(g)
                      }, null, 8, ["class", "label", "icon", "disabled", "title", "onClick"])) : X("", !0),
                      o.renderApi ? (E(), de(re, {
                        key: 1,
                        icon: "pi pi-arrow-right",
                        label: "Use EN",
                        disabled: i(Xe).has(g.audio_key) || !g.english,
                        title: g.english ? "Copy the EN reference track to audio_ru/" + g.audio_key + ".wav (no new render). Overwrites the current RU take." : "No EN reference for this row",
                        onClick: (Q) => i(ln)(g)
                      }, null, 8, ["disabled", "title", "onClick"])) : X("", !0),
                      N(re, {
                        icon: "pi pi-history",
                        label: i(_e)[g.audio_key] ? String(i(_e)[g.audio_key]) : "",
                        title: "Line history (previous takes/versions)",
                        onClick: (Q) => i(Me)(g)
                      }, null, 8, ["label", "onClick"]),
                      N(re, {
                        icon: "pi pi-cog",
                        title: "Edit output settings",
                        onClick: (Q) => i(Yt)(g)
                      }, null, 8, ["onClick"])
                    ])
                  ]),
                  N(jn, { row: g }, {
                    leading: Y(() => [
                      $("span", qs, F(g.speaker_tag || "—"), 1),
                      N(re, {
                        icon: "pi pi-copy",
                        class: "apply-role-btn",
                        disabled: i(zt)(g) === 0,
                        title: i(Ht)(g),
                        onClick: (Q) => i(qt)(g)
                      }, null, 8, ["disabled", "title", "onClick"])
                    ]),
                    trailing: Y(() => [
                      $("label", Ws, [
                        N(bt, {
                          "model-value": i(vn)(g),
                          binary: "",
                          "onUpdate:modelValue": (Q) => i(hn)(g, Q)
                        }, null, 8, ["model-value", "onUpdate:modelValue"]),
                        W[16] || (W[16] = ce(" 🎙️ Original ", -1))
                      ])
                    ]),
                    "above-text": Y(() => [
                      $("div", Gs, F(g.english), 1)
                    ]),
                    _: 2
                  }, 1032, ["row"])
                ], 64))
              ], 2);
            }), 128)),
            i(P).length ? X("", !0) : (E(), A("div", Js, "No rows match this filter."))
          ], 4)
        ]),
        N(zn, {
          visible: i(Ke),
          "onUpdate:visible": W[6] || (W[6] = (g) => ve(Ke) ? Ke.value = g : null),
          categories: i(Wt),
          onSelect: i(Jt)
        }, null, 8, ["visible", "categories", "onSelect"]),
        N(Hn, {
          visible: i(B),
          "onUpdate:visible": W[7] || (W[7] = (g) => ve(B) ? B.value = g : null),
          versions: i(K),
          "chosen-version": i(ge),
          original: ((St = i(ie)) == null ? void 0 : St.english) || "",
          root: o.root,
          "audio-key": ((kt = i(ie)) == null ? void 0 : kt.audio_key) || "",
          onSelect: i(xe)
        }, null, 8, ["visible", "versions", "chosen-version", "original", "root", "audio-key", "onSelect"]),
        N(qn, {
          visible: i(Je).visible,
          left: i(Je).left,
          top: i(Je).top,
          message: i(yt).message,
          fields: i(yt).fields
        }, null, 8, ["visible", "left", "top", "message", "fields"]),
        N(ro, {
          visible: i(Ze),
          "onUpdate:visible": W[8] || (W[8] = (g) => ve(Ze) ? Ze.value = g : null),
          audioKey: (Rt = i(fe)) == null ? void 0 : Rt.audio_key,
          effect: i(fe) ? i(Kt)(i(fe)) : "",
          "normalize-db": i(fe) ? i(O)(i(fe)).normalize_db ?? -20 : -20,
          "speed-match": i(fe) ? i(Zt)(i(fe)) : !1,
          enDurationS: i(fe) ? i(fe).duration_s : null,
          ruDurationS: i(fe) ? i(dn)[i(fe).audio_key] ?? i(fe).rendered_duration_s : null,
          onApply: i(Xt)
        }, null, 8, ["visible", "audioKey", "effect", "normalize-db", "speed-match", "enDurationS", "ruDurationS", "onApply"])
      ], 64);
    };
  }
}, Zs = /* @__PURE__ */ Re(Ks, [["__scopeId", "data-v-4f6f8eee"]]), Ys = {
  __name: "VoDubLineEditor",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const o = e, t = V(!0);
    return ye(t, (n) => {
      n || o.onClose();
    }), (n, s) => {
      const a = te("Dialog");
      return E(), de(a, {
        visible: t.value,
        "onUpdate:visible": s[0] || (s[0] = (r) => t.value = r),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: { width: "1600px" },
        class: "vo-dub-editor-dialog"
      }, {
        default: Y(() => [
          N(Zs, Pn(On(n.$props)), null, 16)
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, Xs = { class: "row" }, Qs = { class: "role-head row" }, ea = { class: "role-name title" }, ta = {
  class: "role-code mono muted",
  title: "Role code -- read-only here, this addon doesn't own this file's identity model"
}, na = ["title"], oa = {
  key: 1,
  class: "role-actor muted"
}, sa = {
  key: 0,
  class: "role-description"
}, aa = {
  key: 1,
  class: "role-dub-direction"
}, ia = {
  key: 2,
  class: "role-notes muted"
}, la = { class: "role-stats row" }, ra = { key: 0 }, ua = { key: 1 }, ca = { key: 2 }, da = { key: 3 }, fa = {
  key: 3,
  class: "role-examples mono",
  title: "Longest lines for this role -- a quick sample to listen to"
}, pa = { class: "role-speaker-row row" }, va = 600, ha = 3e3, ya = 1500, _a = {
  __name: "DubRolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    onClose: { type: Function, required: !0 },
    inline: { type: Boolean, default: !1 }
  },
  setup(e) {
    const o = e, t = $e(o.root, "_dub_roles.json"), n = V(!0), s = V({ roles: {} }), a = V([]), r = V(""), v = V(""), k = V(!1), { cssWidth: h, setWidth: p, presets: b } = Vt({
      storageKey: "FL_CosyVoice3.DubRolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: l, decrease: d, increase: f } = Nt({
      storageKey: "FL_CosyVoice3.DubRolesEditor.fontSizePx",
      defaultSize: 13
    });
    let _ = null, m = 0, c = null, T = null;
    const O = /* @__PURE__ */ new Map();
    function x(S) {
      v.value = S;
    }
    const D = ae(() => {
      var C;
      const S = ((C = s.value) == null ? void 0 : C.roles) || {};
      return Object.entries(S).sort((U, G) => {
        var se, j;
        return (((se = G[1]) == null ? void 0 : se.lines) || 0) - (((j = U[1]) == null ? void 0 : j.lines) || 0);
      });
    });
    function w(S, C) {
      return S.character || C;
    }
    function L(S) {
      return Array.isArray(S.notes) ? S.notes : [];
    }
    function u(S) {
      return Array.isArray(S.longest_files) ? S.longest_files : [];
    }
    function R() {
      return JSON.stringify(s.value, null, 2);
    }
    async function P() {
      const S = R();
      if (S !== _)
        try {
          const U = await (await fetch(`${we}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: t, content: S })
          })).json();
          if (U.error) {
            x(`Save error: ${U.error}`);
            return;
          }
          _ = S, x(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (C) {
          x(`Save failed: ${C}`);
        }
    }
    function q() {
      m = Date.now(), c && clearTimeout(c), c = setTimeout(P, va);
    }
    function z(S, C) {
      O.get(S) !== C.speaker && (O.set(S, C.speaker), Mn(o.root, S).then((G) => x(G.message)));
    }
    function oe(S, C) {
      q(), z(S, C);
    }
    async function le() {
      try {
        const C = await (await fetch(An)).json();
        a.value = C.presets || [], r.value = C.dir || "";
      } catch {
        a.value = [], r.value = "";
      }
    }
    const y = V(!1), M = V(null);
    function J(S, C) {
      M.value = [S, C], y.value = !0;
    }
    function H(S) {
      const C = M.value;
      if (!C) return;
      const [U, G] = C;
      G.speaker = S, oe(U, G);
    }
    async function Z({ isPoll: S = !1 } = {}) {
      try {
        const U = await (await fetch(`${we}/read?path=${encodeURIComponent(t)}`)).json();
        if (U.error) {
          x(`Read error: ${U.error}`);
          return;
        }
        if (!U.exists) {
          S || (s.value = { roles: {} }, _ = "", x('_dub_roles.json does not exist yet -- click "Seed from dataset" below'));
          return;
        }
        if (S && Date.now() - m < ya || U.content === _) return;
        let G;
        try {
          G = JSON.parse(U.content);
        } catch (j) {
          x(`_dub_roles.json is not valid JSON: ${j}`);
          return;
        }
        const se = G && typeof G.roles == "object" && G.roles || {};
        for (const j of Object.values(se))
          j && typeof j == "object" && j.speaker === void 0 && (j.speaker = "");
        s.value = { ...G, roles: se };
        for (const [j, B] of Object.entries(se))
          O.set(j, B.speaker);
        _ = R(), S || x(`Loaded ${D.value.length} role(s)`);
      } catch (C) {
        x(`Read failed: ${C}`);
      }
    }
    async function ee() {
      k.value = !0;
      try {
        const C = await (await fetch(`${me}/seed_roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: o.root })
        })).json();
        if (C.error) {
          x(`Seed error: ${C.error}`);
          return;
        }
        await Z(), x(C.added.length ? `Added ${C.added.length} role(s): ${C.added.join(", ")}` : "Nothing new to add");
      } catch (S) {
        x(`Seed failed: ${S}`);
      } finally {
        k.value = !1;
      }
    }
    function I() {
      c && (clearTimeout(c), P());
      for (const [S, C] of D.value) z(S, C);
      T && clearInterval(T), o.onClose();
    }
    return ye(n, (S) => {
      S || I();
    }), qe(async () => {
      le(), await Z(), T = setInterval(() => Z({ isPoll: !0 }), ha);
    }), ut(() => {
      T && clearInterval(T);
    }), (S, C) => {
      const U = te("Button"), G = te("Message"), se = te("InputText");
      return E(), A(ne, null, [
        (E(), de(Dn(e.inline ? "div" : "Dialog"), {
          visible: n.value,
          "onUpdate:visible": C[1] || (C[1] = (j) => n.value = j),
          modal: !1,
          draggable: !1,
          "close-on-escape": "",
          header: " ",
          style: De({ width: i(h) }),
          class: "roles-dialog"
        }, {
          default: Y(() => [
            $("div", Xs, [
              N(xn, {
                title: "VO Dub Roles",
                status: v.value,
                "width-presets": i(b),
                "set-width": i(p),
                "font-size-decrease": i(d),
                "font-size-increase": i(f)
              }, {
                after: Y(() => [
                  N(U, {
                    label: "Seed from dataset",
                    icon: k.value ? "pi pi-spin pi-spinner" : "pi pi-database",
                    disabled: k.value,
                    title: "Add every distinct speaker tag from vo_dataset.csv that isn't a role here yet",
                    onClick: ee
                  }, null, 8, ["icon", "disabled"])
                ]),
                _: 1
              }, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
            ]),
            D.value.length ? X("", !0) : (E(), de(G, {
              key: 0,
              severity: "info",
              closable: !1
            }, {
              default: Y(() => [...C[3] || (C[3] = [
                ce(' No roles yet -- click "Seed from dataset" above to create one per distinct speaker tag. ', -1)
              ])]),
              _: 1
            })),
            $("div", {
              class: "roles-list list",
              style: De({ fontSize: `${i(l)}px` })
            }, [
              (E(!0), A(ne, null, ue(D.value, ([j, B]) => (E(), A("div", {
                key: j,
                class: "role-card card"
              }, [
                $("div", Qs, [
                  $("span", ea, F(w(B, j)), 1),
                  $("span", ta, F(j), 1),
                  B.gender ? (E(), A("span", {
                    key: 0,
                    class: "role-gender muted",
                    title: B.gender_evidence || ""
                  }, F(B.gender), 9, na)) : X("", !0),
                  B.actor ? (E(), A("span", oa, F(B.actor), 1)) : X("", !0)
                ]),
                B.description ? (E(), A("p", sa, F(B.description), 1)) : X("", !0),
                B.dub_direction ? (E(), A("p", aa, F(B.dub_direction), 1)) : X("", !0),
                L(B).length ? (E(), A("ul", ia, [
                  (E(!0), A(ne, null, ue(L(B), (ie, K) => (E(), A("li", { key: K }, F(ie), 1))), 128))
                ])) : X("", !0),
                $("div", la, [
                  B.lines !== void 0 ? (E(), A("span", ra, F(B.lines) + " line(s)", 1)) : X("", !0),
                  B.audio_minutes !== void 0 ? (E(), A("span", ua, F(B.audio_minutes) + " min", 1)) : X("", !0),
                  B.lines_needing_translation ? (E(), A("span", ca, F(B.lines_needing_translation) + " need translation", 1)) : X("", !0),
                  B.lines_without_any_text ? (E(), A("span", da, F(B.lines_without_any_text) + " no text", 1)) : X("", !0)
                ]),
                u(B).length ? (E(), A("div", fa, " e.g. " + F(u(B).join(", ")), 1)) : X("", !0),
                $("div", pa, [
                  N(se, {
                    modelValue: B.speaker,
                    "onUpdate:modelValue": [
                      (ie) => B.speaker = ie,
                      C[0] || (C[0] = (ie) => q())
                    ],
                    placeholder: "Speaker preset",
                    title: "Real CosyVoice preset this role resolves to",
                    class: "role-speaker",
                    onBlur: (ie) => z(j, B)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onBlur"]),
                  N(U, {
                    icon: "pi pi-microphone",
                    title: "Pick a speaker from the preset gallery",
                    onClick: (ie) => J(j, B)
                  }, null, 8, ["onClick"])
                ])
              ]))), 128))
            ], 4)
          ]),
          _: 1
        }, 40, ["visible", "style"])),
        N(Gn, {
          visible: y.value,
          "onUpdate:visible": C[2] || (C[2] = (j) => y.value = j),
          presets: a.value,
          "sample-dir": r.value,
          onSelect: H
        }, null, 8, ["visible", "presets", "sample-dir"])
      ], 64);
    };
  }
}, ma = /* @__PURE__ */ Re(_a, [["__scopeId", "data-v-d9b84210"]]), We = Go();
Ae(We);
function xa({ node: e, projectRootWidget: o, openBrowseDialog: t, openVoDubLineEditor: n, openDubRolesEditor: s, queueVoDubRender: a }) {
  dt(import.meta.url);
  const r = document.createElement("div");
  r.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const v = ft(to, {
    node: e,
    projectRootWidget: o,
    openBrowseDialog: t,
    openVoDubLineEditor: n,
    openDubRolesEditor: s,
    queueVoDubRender: a
  });
  return v.use(We), v.use(pt, { ripple: !0 }), vt(v), v.mount(r), { element: r, unmount: () => v.unmount() };
}
function La({ root: e, bucket: o, renderApi: t }) {
  dt(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const s = ft(Ys, {
    root: e,
    bucket: o,
    renderApi: t || null,
    onClose: () => {
      s.unmount(), n.remove();
    }
  });
  s.use(We), s.use(pt, { ripple: !0 }), vt(s), s.mount(n);
}
function Va({ root: e }) {
  dt(import.meta.url);
  const o = document.createElement("div");
  document.body.appendChild(o);
  const t = ft(ma, {
    root: e,
    onClose: () => {
      t.unmount(), o.remove();
    }
  });
  t.use(We), t.use(pt, { ripple: !0 }), vt(t), t.mount(o);
}
export {
  xa as mountVoDubBrowserPanel,
  Va as openDubRolesEditor,
  La as openVoDubLineEditor
};
