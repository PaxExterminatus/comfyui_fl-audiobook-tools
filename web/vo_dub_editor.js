import { _ as Te, l as F, o as We, L as ct, c as N, b as L, d as $, F as oe, j as de, t as V, V as be, m as ne, r as Q, a as E, n as ge, g as K, h as ce, f as le, u as i, i as X, w as ve, k as Me, T as Tn, R as xt, U as Lt, N as he, W as dt, X as wn, Y as qe, z as En, Z as Cn, $ as In, a0 as $n, A as ye, E as Pn, a1 as On, p as Pe, G as Ee, S as Dn, Q as Mn, M as An, q as xn, s as Ln, a2 as Nn, H as Fn, a3 as Vn, v as ft, x as pt, P as ht, y as yt } from "./styles_link.js";
import { u as Nt, a as Ft, D as Un } from "./DialogHeader.js";
import { e as Bn, s as jn, l as zn, i as Hn, S as qn, f as Wn, L as Gn, I as Jn, d as Kn, _ as Zn, u as Yn, c as Xn } from "./instruct_library.js";
const He = {
  "": "All statuses",
  no_text: "No source text",
  needs_translation: "Needs translation",
  not_started: "Not started",
  stale: "Stale",
  done: "Ready",
  unsupported: "Unsupported (multi-channel)"
}, Qn = [
  { value: "not_done", label: "Not done" },
  { value: "manually_done", label: "Done (manual)" },
  { value: "issues", label: "⚠ Issues only" }
];
function eo(e, a) {
  return [...Object.entries(e || {}).map(([n, o]) => ({ value: n, label: o })), ...a || []];
}
const to = eo(
  He,
  Qn
), no = {
  no_text: "warn",
  needs_translation: "info",
  not_started: "secondary",
  stale: "warn",
  done: "success",
  unsupported: "contrast"
};
function Vt(e) {
  return no[e] || "secondary";
}
const oo = [
  { value: "no_text", label: "No text" },
  { value: "needs_translation", label: "Needs translation" },
  { value: "not_started", label: "Not started" },
  { value: "stale", label: "Stale" },
  { value: "done", label: "Ready" },
  { value: "unsupported", label: "Unsupported" }
], so = [
  {
    key: "manuallyDone",
    label: "Done (manual)",
    stateLabels: { without: "Not done" }
  },
  { key: "issues", label: "⚠ Issues" }
], ao = { class: "vo-dub-panel list" }, io = { class: "vo-dub-toolbar actions" }, lo = { class: "vo-dub-buckets panel" }, ro = ["onClick"], uo = { class: "vo-dub-status p-text-secondary" }, co = 9e3, wt = "FL_CosyVoice3.VODubLibrary.lastRoot", fo = {
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
    const a = e, t = F(a.projectRootWidget.value || localStorage.getItem(wt) || ""), n = ne(() => t.value ? `📁 ${t.value}` : "📁 Click to browse for a VO dub project folder"), o = F([]), s = F(""), l = F(!1);
    let y = null;
    async function g() {
      if (!t.value) {
        o.value = [];
        return;
      }
      l.value = !0;
      try {
        const u = await (await fetch(`${be}/tree?path=${encodeURIComponent(t.value)}`)).json();
        if (u.error) {
          s.value = u.error, o.value = [];
          return;
        }
        o.value = u.buckets || [], s.value = `${o.value.length} bucket(s), ${o.value.reduce((m, v) => m + v.count, 0)} row(s)`;
      } catch (d) {
        s.value = `Couldn't load: ${d}`;
      } finally {
        l.value = !1;
      }
    }
    function h() {
      a.openBrowseDialog({
        mode: "folder",
        startPath: t.value,
        onSelect: (d) => {
          t.value = d, a.projectRootWidget.value = d, localStorage.setItem(wt, d), g();
        }
      });
    }
    function p(d) {
      a.openVoDubLineEditor({
        root: t.value,
        bucket: d.bucket,
        /*
         Only offered when this panel's node-wiring actually has a render
         mechanism (it always does in practice -- null only ever shows up
         in a test that doesn't pass one) -- see queueVoDubRender's own
         docstring in web/vo_dub_library.js for what it does.
        */
        renderApi: a.queueVoDubRender ? {
          renderRow: (u) => a.queueVoDubRender(a.node, u)
        } : null
      });
    }
    function S() {
      t.value && a.openDubRolesEditor({ root: t.value });
    }
    const r = [
      { key: "no_text", label: "no text" },
      { key: "needs_translation", label: "needs RU" },
      { key: "not_started", label: "not started" },
      { key: "stale", label: "stale" },
      { key: "done", label: "done" },
      { key: "unsupported", label: "unsupported" }
    ];
    return We(() => {
      g(), y = setInterval(g, co);
    }), ct(() => clearInterval(y)), (d, u) => {
      const m = Q("Button"), v = Q("InlineMessage");
      return E(), N("div", ao, [
        L(m, {
          label: n.value,
          title: t.value,
          text: "",
          class: "browse-button ellipsis w100p",
          onClick: h
        }, null, 8, ["label", "title"]),
        $("div", io, [
          L(m, {
            label: "Roles",
            disabled: !t.value,
            title: "Assign a voice preset to each character tag",
            onClick: S
          }, null, 8, ["disabled"]),
          L(m, {
            icon: "pi pi-refresh",
            title: "Re-scan",
            onClick: g
          })
        ]),
        $("div", lo, [
          (E(!0), N(oe, null, de(o.value, (f) => (E(), N("div", {
            key: f.bucket,
            class: ge(["vo-dub-bucket-row row", { "has-issues": f.issue > 0 }]),
            onClick: (T) => p(f)
          }, [
            L(v, { severity: "secondary" }, {
              default: K(() => [
                ce(V(f.bucket) + " " + V(f.count), 1)
              ]),
              _: 2
            }, 1024),
            (E(), N(oe, null, de(r, (T) => (E(), N(oe, {
              key: T.key
            }, [
              f[T.key] ? (E(), le(v, {
                key: 0,
                severity: i(Vt)(T.key)
              }, {
                default: K(() => [
                  ce(V(T.label) + " " + V(f[T.key]), 1)
                ]),
                _: 2
              }, 1032, ["severity"])) : X("", !0)
            ], 64))), 64)),
            f.issue > 0 ? (E(), le(v, {
              key: 0,
              severity: "error",
              title: `${f.issue} row(s) marked as issue`
            }, {
              default: K(() => [
                ce("issue " + V(f.issue), 1)
              ]),
              _: 2
            }, 1032, ["title"])) : X("", !0)
          ], 10, ro))), 128))
        ]),
        $("div", uo, V(l.value ? "Loading..." : s.value), 1)
      ]);
    };
  }
}, po = /* @__PURE__ */ Te(fo, [["__scopeId", "data-v-9edfe647"]]), ho = { class: "p-inputgroup-addon" }, yo = { style: { "margin-left": "0.5rem" } }, vo = {
  key: 0,
  class: "ofd-target-row row"
}, _o = { class: "p-inputgroup-addon" }, mo = { style: { "margin-left": "0.5rem" } }, go = {
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
  setup(e, { emit: a }) {
    const t = e, n = a, o = [
      { value: "", label: "No effect" },
      { value: "radio", label: "📻 Radio" },
      { value: "phone", label: "📞 Phone" },
      { value: "muffled", label: "🤫 Muffled" },
      { value: "radio_dry", label: "📻 Radio (no static)" },
      { value: "intercom", label: "🔊 Intercom" },
      { value: "suit", label: "🧑‍🚀 Suit" }
    ], s = F(t.effect), l = F(t.normalize), y = F(t.speedMatch), g = F(t.normalizeDb);
    ve(() => t.visible, (S) => {
      S && (s.value = t.effect, l.value = t.normalize, y.value = t.speedMatch, g.value = t.normalizeDb);
    });
    const h = ne(() => {
      if (t.enDurationS == null || t.ruDurationS == null)
        return "Одна из длительностей неизвестна — сопоставление недоступно.";
      const S = t.ruDurationS / t.enDurationS, r = Math.round((S - 1) * 100);
      return Math.abs(r) < 1 ? "Длительности уже совпадают." : `RU ${r > 0 ? "длиннее" : "короче"} на ${Math.abs(r)}% — при включении RU подстроится под EN (тон сохранится).`;
    });
    function p() {
      n("apply", {
        effect: s.value,
        normalize: l.value,
        speedMatch: y.value,
        normalizeDb: g.value
      }), n("update:visible", !1);
    }
    return (S, r) => {
      const d = Q("InputGroupAddon"), u = Q("Dropdown"), m = Q("InputGroup"), v = Q("Fieldset"), f = Q("InputSwitch"), T = Q("InputNumber"), O = Q("Button"), A = Q("Dialog");
      return E(), le(A, {
        visible: e.visible,
        modal: "",
        header: "Output File Settings",
        "onUpdate:visible": r[4] || (r[4] = (D) => S.$emit("update:visible", D))
      }, {
        footer: K(() => [
          L(O, {
            label: "Apply",
            onClick: p
          })
        ]),
        default: K(() => [
          L(v, { legend: "Effect" }, {
            default: K(() => [
              L(m, null, {
                default: K(() => [
                  L(d, null, {
                    default: K(() => [...r[5] || (r[5] = [
                      $("i", { class: "pi pi-sliders-h" }, null, -1)
                    ])]),
                    _: 1
                  }),
                  L(u, {
                    inputId: "ofd-effect",
                    modelValue: s.value,
                    "onUpdate:modelValue": r[0] || (r[0] = (D) => s.value = D),
                    options: o,
                    optionLabel: "label",
                    optionValue: "value",
                    placeholder: "No effect"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              r[6] || (r[6] = $("small", null, " Аудио-эффект. Применяется после нормализации, перед сохранением файла. ", -1))
            ]),
            _: 1
          }),
          L(v, { legend: "Normalize" }, {
            default: K(() => [
              L(m, null, {
                default: K(() => [
                  L(d, null, {
                    default: K(() => [...r[7] || (r[7] = [
                      $("i", { class: "pi pi-volume-up" }, null, -1)
                    ])]),
                    _: 1
                  }),
                  $("div", ho, [
                    L(f, {
                      modelValue: l.value,
                      "onUpdate:modelValue": r[1] || (r[1] = (D) => l.value = D)
                    }, null, 8, ["modelValue"]),
                    $("label", yo, V(l.value ? "On" : "Off"), 1)
                  ])
                ]),
                _: 1
              }),
              l.value ? (E(), N("div", vo, [
                r[8] || (r[8] = $("span", { class: "p-text-secondary" }, "Target level:", -1)),
                L(T, {
                  modelValue: g.value,
                  "onUpdate:modelValue": r[2] || (r[2] = (D) => g.value = D),
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
              r[9] || (r[9] = $("small", null, " Приводит RMS-громкость к целевому уровню. −20 dB — комфортный дефолт для диалогов; тише (−26…−24) — для шёпота и фоновых реплик, громче (−16…−14) — для криков. ", -1))
            ]),
            _: 1
          }),
          L(v, { legend: "Match duration" }, {
            default: K(() => [
              L(m, null, {
                default: K(() => [
                  L(d, null, {
                    default: K(() => [
                      ce(" EN " + V(t.enDurationS != null ? t.enDurationS.toFixed(2) + "s" : "—") + " RU " + V(t.ruDurationS != null ? t.ruDurationS.toFixed(2) + "s" : "—"), 1)
                    ]),
                    _: 1
                  }),
                  $("div", _o, [
                    L(f, {
                      modelValue: y.value,
                      "onUpdate:modelValue": r[3] || (r[3] = (D) => y.value = D)
                    }, null, 8, ["modelValue"]),
                    $("label", mo, V(y.value ? "On" : "Off"), 1)
                  ])
                ]),
                _: 1
              }),
              $("small", null, V(h.value), 1)
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, bo = /* @__PURE__ */ Te(go, [["__scopeId", "data-v-a21190be"]]);
let nt = null;
function So() {
  const e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return e ? (nt || (nt = new e()), nt) : null;
}
async function ko(e, a = 100) {
  const t = So();
  if (!t) throw new Error("Web Audio not supported -- can't decode a waveform");
  const n = await fetch(e);
  if (!n.ok) throw new Error(`couldn't fetch ${e}: ${n.status}`);
  const o = await n.arrayBuffer(), l = (await t.decodeAudioData(o)).getChannelData(0), y = Math.max(1, Math.floor(l.length / a)), g = new Float32Array(a);
  for (let h = 0; h < a; h++) {
    const p = h * y, S = Math.min(l.length, p + y);
    let r = 0;
    for (let d = p; d < S; d++) {
      const u = Math.abs(l[d]);
      u > r && (r = u);
    }
    g[h] = r;
  }
  return g;
}
const Ro = { class: "waveform-wrap" }, To = {
  key: 0,
  class: "waveform-status"
}, wo = {
  key: 1,
  class: "waveform-status",
  title: "Couldn't load a waveform for this file"
}, Eo = {
  __name: "WaveformCanvas",
  props: {
    src: { type: String, default: "" }
  },
  setup(e) {
    const a = e, t = F(null), n = F(!1), o = F(!1);
    function s(y, g) {
      if (typeof y.getContext != "function") return;
      const h = window.devicePixelRatio || 1, p = y.clientWidth || 200, S = y.clientHeight || 28;
      y.width = Math.max(1, Math.round(p * h)), y.height = Math.max(1, Math.round(S * h));
      const r = y.getContext("2d");
      if (!r) return;
      r.setTransform(h, 0, 0, h, 0, 0), r.clearRect(0, 0, p, S);
      const d = p / g.length, u = S / 2;
      r.fillStyle = getComputedStyle(y).color || "#4caf50";
      for (let m = 0; m < g.length; m++) {
        const v = Math.max(1, g[m] * S);
        r.fillRect(m * d, u - v / 2, Math.max(1, d - 1), v);
      }
    }
    async function l() {
      if (!(!a.src || !t.value)) {
        n.value = !0, o.value = !1;
        try {
          const y = t.value.clientWidth || 200, g = await ko(a.src, Math.max(20, Math.round(y / 3)));
          t.value && s(t.value, g);
        } catch {
          o.value = !0;
        } finally {
          n.value = !1;
        }
      }
    }
    return We(l), ve(() => a.src, l), (y, g) => (E(), N("div", Ro, [
      $("canvas", {
        ref_key: "canvasEl",
        ref: t,
        class: "waveform-canvas"
      }, null, 512),
      n.value ? (E(), N("span", To, "…")) : o.value ? (E(), N("span", wo, "⚠")) : X("", !0)
    ]));
  }
}, Et = /* @__PURE__ */ Te(Eo, [["__scopeId", "data-v-413ffbd4"]]), Co = /* @__PURE__ */ new Set([
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
]), Io = /* @__PURE__ */ new Set([
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
function Oe(e) {
  return Math.round(e * 10) / 10;
}
function Be(e) {
  return String(e).split(/\s+/).filter(Boolean);
}
function Ct(e, a) {
  return (e.match(/[,;]/g) || []).length + (e.match(a) || []).length;
}
function $o(e) {
  return (e.match(/[aeiouyAEIOUY]+/g) || []).length;
}
function Po(e) {
  return (e.match(/[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g) || []).length;
}
function It(e, a) {
  const n = String(e).toLowerCase().replace(/[^a-zа-яё\s]/gi, "").split(/\s+/).filter(Boolean).filter((o) => !a.has(o));
  return Math.max(1, n.length);
}
function lt(e, a) {
  const t = String(e), n = String(a), o = It(t, Co), s = It(n, Io), y = Math.min(o, s) / Math.max(o, s) * 100, g = $o(t), h = Po(n);
  let p = 100;
  if (g > 0) {
    const W = h / g, pe = 1.35, _e = 0.9;
    if (W > pe) {
      const Se = W - pe;
      p = Math.max(0, 100 - Se * 100);
    } else if (W < _e) {
      const Se = _e - W;
      p = Math.max(0, 100 - Se * 100);
    }
  }
  const S = y * 0.6 + p * 0.4, r = /\b(oh|ah|hm|ha|hey|ugh|wow|oops|tsk)\b/gi, d = /\b(ох|ах|хм|ха|эй|уф|ого|ой|упс|мда)\b/gi, u = (t.match(r) || []).length / Math.max(1, Be(t).length) * 100, m = (n.match(d) || []).length / Math.max(1, Be(n).length) * 100, f = 100 * ((Math.min(u, m) + 0.01) / (Math.max(u, m) + 0.01)), T = /[aeiouyAEIOUY]/g, O = /[sxzSXZ]/g, A = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g, D = /[шжщчсзШЖЩЧСЗ]/g, w = (t.match(/[a-zA-Z]/g) || []).length || 1, x = (n.match(/[а-яёА-ЯЁ]/g) || []).length || 1, c = (t.match(T) || []).length / w, R = (n.match(A) || []).length / x, P = (t.match(O) || []).length / w, H = (n.match(D) || []).length / x, B = Math.abs(c - R), se = Math.abs(P - H), re = 100 * (1 - Math.min(1, (B + se) / 2)), _ = (f + re) / 2, M = (W) => [
    W.includes("?"),
    W.includes("!"),
    W.includes("...") || W.includes("…"),
    /["«»]/.test(W),
    /^\s*[—-]/.test(W)
  ], J = M(t), z = M(n);
  let Y = 0;
  for (let W = 0; W < 5; W++)
    J[W] === z[W] && (Y += 1);
  const te = Y / 5 * 100, I = Be(t);
  let k = 100;
  if (I.length >= 7) {
    const W = /* @__PURE__ */ new Set([
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
    ]), pe = /* @__PURE__ */ new Set([
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
    ]), _e = (Ce) => String(Ce).toLowerCase().replace(/[^a-zа-яё\s]/gi, "").split(/\s+/).filter(Boolean), Se = _e(t).filter((Ce) => !W.has(Ce)), xe = _e(n).filter((Ce) => !pe.has(Ce)), Le = new Set(Se).size / Math.max(1, Se.length), Je = new Set(xe).size / Math.max(1, xe.length);
    k = Math.min(Le, Je) / Math.max(Le, Je, 1e-4) * 100;
  }
  const C = /\b(and|but|or|so|because|although)\b/gi, U = /\b(и|а|но|или|потому|хотя)\b/gi, q = Be(n), ae = Ct(t, C) / (I.length || 1) * 10, Z = Ct(n, U) / (q.length || 1) * 10, j = 100 * ((Math.min(ae, Z) + 0.01) / (Math.max(ae, Z) + 0.01));
  return [
    { key: "syllableRatio", label: "Акцентно-ритмическое соответствие (CosyVoice 3)", score: Oe(S) },
    { key: "acousticTexture", label: "Звуковая/фонетическая согласованность", score: Oe(_) },
    { key: "edgeParity", label: "Интонационно-краевые маркеры", score: Oe(te) },
    { key: "lexicalDiversity", label: "Лексическое разнообразие (TTR)", score: Oe(k) },
    { key: "pauseDensity", label: "Плотность микропауз", score: Oe(j) }
  ];
}
const Oo = { class: "translation-similarity-radar" }, Do = { class: "radar-chart-container" }, Mo = ["viewBox"], Ao = ["points"], xo = ["x2", "y2"], Lo = ["d"], No = ["y"], Fo = ["cx", "cy", "onMouseenter"], Vo = ["x", "y"], Uo = ["x", "y", "text-anchor", "dy"], Bo = { class: "radar-metrics-list" }, jo = { class: "metric-info" }, zo = { class: "metric-label" }, Ho = { class: "metric-score-val" }, qo = { class: "metric-bar-bg" }, De = 300, ke = 95, $t = 3, je = 30, Wo = {
  __name: "TranslationSimilarityRadar",
  props: {
    original: { type: String, default: "" },
    translation: { type: String, default: "" }
  },
  setup(e) {
    const a = F(null), t = {
      syllableRatio: "Слоги",
      acousticTexture: "Фонетика",
      edgeParity: "Маркеры",
      lexicalDiversity: "TTR",
      pauseDensity: "Паузы"
    }, n = e, o = ne(() => {
      try {
        if (typeof lt == "function") {
          const T = lt(n.original, n.translation);
          if (Array.isArray(T) && T.length > 0)
            return T;
        }
      } catch {
      }
      const u = n.original || "", m = n.translation || "", v = Math.abs(m.length - u.length), f = Math.max(0, Math.min(100, Math.round(100 - v / Math.max(u.length, 1) * 50)));
      return [
        { key: "semantic", label: "Semantic Match", score: m.length > 0 ? 85 : 0 },
        { key: "length", label: "Length Ratio", score: f },
        { key: "completeness", label: "Completeness", score: m.length > 0 ? 90 : 0 },
        { key: "fluency", label: "Fluency", score: m.length > 0 ? 80 : 0 },
        { key: "vocabulary", label: "Vocabulary", score: m.length > 0 ? 78 : 0 }
      ];
    }), s = De / 2, l = ne(() => {
      const u = o.value.reduce((m, v) => m + v.score, 0);
      return Math.round(u / o.value.length);
    }), y = ne(() => o.value.length || 5), g = ne(() => {
      const u = y.value, m = [];
      for (let v = 0; v < u; v++) {
        const f = v * 2 * Math.PI / u - Math.PI / 2;
        m.push({
          x: s + ke * Math.cos(f),
          y: s + ke * Math.sin(f),
          angle: f
        });
      }
      return m;
    }), h = ne(() => {
      const u = y.value, m = [];
      for (let v = 1; v <= $t; v++) {
        const f = ke * v / $t, T = [];
        for (let O = 0; O < u; O++) {
          const A = O * 2 * Math.PI / u - Math.PI / 2, D = s + f * Math.cos(A), w = s + f * Math.sin(A);
          T.push(`${D},${w}`);
        }
        m.push({ level: v, points: T.join(" ") });
      }
      return m;
    }), p = ne(() => {
      const u = y.value, m = [];
      return o.value.forEach((v, f) => {
        const T = f * 2 * Math.PI / u - Math.PI / 2, O = Math.max(0, Math.min(100, v.score ?? 0)), A = ke * O / 100, D = Math.max(A, je), w = s + D * Math.cos(T), x = s + D * Math.sin(T);
        m.push({ x: w, y: x, score: O, label: v.label, key: v.key, clamped: A <= je });
      }), m;
    }), S = ne(() => {
      const u = p.value, m = u.length;
      if (m === 0) return "";
      let v = `M ${u[0].x} ${u[0].y}`;
      for (let f = 1; f <= m; f++) {
        const T = u[f - 1], O = u[f % m];
        T.clamped && O.clamped ? v += ` A ${je} ${je} 0 0 1 ${O.x} ${O.y}` : v += ` L ${O.x} ${O.y}`;
      }
      return `${v} Z`;
    });
    function r(u) {
      const m = Math.cos(u);
      return Math.abs(m) < 0.25 ? "middle" : m > 0 ? "start" : "end";
    }
    function d(u) {
      const m = Math.sin(u);
      return m < -0.5 ? "-6" : m > 0.5 ? "14" : "4";
    }
    return (u, m) => (E(), N("div", Oo, [
      $("div", Do, [
        (E(), N("svg", {
          width: De,
          height: De,
          viewBox: `0 0 ${De} ${De}`,
          class: "radar-svg"
        }, [
          (E(!0), N(oe, null, de(h.value, (v) => (E(), N("polygon", {
            key: v.level,
            points: v.points,
            class: "radar-grid-polygon"
          }, null, 8, Ao))), 128)),
          (E(!0), N(oe, null, de(g.value, (v, f) => (E(), N("line", {
            key: "axis-" + f,
            x1: s,
            y1: s,
            x2: v.x,
            y2: v.y,
            class: "radar-axis-line"
          }, null, 8, xo))), 128)),
          p.value.length > 0 ? (E(), N("path", {
            key: 0,
            d: S.value,
            class: "radar-data-polygon"
          }, null, 8, Lo)) : X("", !0),
          $("circle", {
            cx: s,
            cy: s,
            r: "30",
            fill: "#1e1e22"
          }),
          $("text", {
            x: s,
            y: s + 5,
            "text-anchor": "middle",
            class: "radar-center-text-main"
          }, V(l.value) + "%", 9, No),
          (E(!0), N(oe, null, de(p.value, (v, f) => (E(), N("circle", {
            key: "pt-" + f,
            cx: v.x,
            cy: v.y,
            r: "4",
            class: ge(["radar-data-node", { "radar-data-node-active": f === a.value }]),
            onMouseenter: (T) => a.value = f,
            onMouseleave: m[0] || (m[0] = (T) => a.value = null)
          }, null, 42, Fo))), 128)),
          (E(!0), N(oe, null, de(p.value, (v, f) => (E(), N("text", {
            key: "pct-" + f,
            x: s + Math.max(ke * v.score / 100 + 14, 40) * Math.cos(f * 2 * Math.PI / y.value - Math.PI / 2),
            y: s + Math.max(ke * v.score / 100 + 14, 40) * Math.sin(f * 2 * Math.PI / y.value - Math.PI / 2),
            "text-anchor": "middle",
            class: "radar-node-percent"
          }, V(Math.round(v.score)) + "% ", 9, Vo))), 128)),
          (E(!0), N(oe, null, de(g.value, (v, f) => {
            var T, O, A;
            return E(), N("text", {
              key: "label-" + f,
              x: s + (ke + 22) * Math.cos(v.angle),
              y: s + (ke + 22) * Math.sin(v.angle),
              "text-anchor": r(v.angle),
              dy: d(v.angle),
              class: "radar-axis-label"
            }, [
              $("title", null, V((T = o.value[f]) == null ? void 0 : T.label), 1),
              ce(" " + V(t[(O = o.value[f]) == null ? void 0 : O.key] || ((A = o.value[f]) == null ? void 0 : A.label) || `Metric ${f + 1}`), 1)
            ], 8, Uo);
          }), 128))
        ], 8, Mo))
      ]),
      $("div", Bo, [
        (E(!0), N(oe, null, de(o.value, (v, f) => (E(), N("div", {
          key: v.key,
          class: ge(["radar-metric-item", { "radar-metric-item-active": f === a.value }])
        }, [
          $("div", jo, [
            $("span", zo, V(v.label), 1),
            $("span", Ho, V(Math.round(v.score)) + "%", 1)
          ]),
          $("div", qo, [
            $("div", {
              class: "metric-bar-fill",
              style: Me({ width: Math.max(0, Math.min(100, v.score)) + "%" })
            }, null, 4)
          ])
        ], 2))), 128))
      ])
    ]));
  }
}, Go = /* @__PURE__ */ Te(Wo, [["__scopeId", "data-v-2f7dabc6"]]), Jo = { class: "compact-circle" }, Ko = 400, ot = 8, Zo = {
  __name: "TranslationSimilarityCompact",
  props: {
    original: { type: String, default: "" },
    translation: { type: String, default: "" }
  },
  setup(e) {
    const a = e, t = ne(() => {
      try {
        const r = lt(a.original, a.translation);
        if (!Array.isArray(r) || r.length === 0) return 0;
        const d = r.reduce((u, m) => u + (m.score || 0), 0);
        return Math.round(d / r.length);
      } catch {
        return 0;
      }
    }), n = F(null), o = F({ top: 0, left: 0, placement: "below" }), s = F(!1);
    let l = null;
    function y() {
      const r = n.value;
      if (!r) return;
      const d = r.getBoundingClientRect(), u = window.innerWidth, m = window.innerHeight, v = Ko, f = 540;
      let T = "below", O = d.bottom + ot;
      O + f > m && d.top - f - ot > 0 && (T = "above", O = d.top - f - ot);
      let A = d.left + d.width / 2 - v / 2;
      A + v > u - 8 && (A = u - v - 8), A < 8 && (A = 8), o.value = { top: O, left: A, placement: T };
    }
    function g() {
      clearTimeout(l), y(), s.value = !0;
    }
    function h() {
      clearTimeout(l), l = setTimeout(() => {
        s.value = !1;
      }, 120);
    }
    function p() {
      clearTimeout(l);
    }
    function S() {
      s.value && y();
    }
    return window.addEventListener("scroll", S, !0), window.addEventListener("resize", S), ct(() => {
      window.removeEventListener("scroll", S, !0), window.removeEventListener("resize", S), clearTimeout(l);
    }), (r, d) => (E(), N(oe, null, [
      $("div", {
        ref_key: "circleRef",
        ref: n,
        class: "similarity-compact-wrapper",
        onMouseenter: g,
        onMouseleave: h
      }, [
        $("div", Jo, V(t.value) + "% ", 1)
      ], 544),
      (E(), le(Tn, { to: "body" }, [
        s.value ? (E(), N("div", {
          key: 0,
          class: "similarity-popover",
          style: Me({ top: o.value.top + "px", left: o.value.left + "px" }),
          onMouseenter: p,
          onMouseleave: h
        }, [
          L(Go, {
            original: e.original,
            translation: e.translation
          }, null, 8, ["original", "translation"])
        ], 36)) : X("", !0)
      ]))
    ], 64));
  }
}, Yo = /* @__PURE__ */ Te(Zo, [["__scopeId", "data-v-9f2bc65b"]]), Xo = { class: "row" }, Qo = { class: "row" }, es = { class: "row" }, ts = { class: "filter-clear-wrapper row" }, ns = {
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
  setup(e, { emit: a }) {
    const t = e, n = a;
    function o(p) {
      n("toggle-status", p);
    }
    function s(p) {
      n("cycle-tristate", p);
    }
    function l() {
      n("clear");
    }
    function y(p) {
      const S = t.tristateValues[p.key], r = p.stateLabels && p.stateLabels[S];
      return r || (S === "only" ? `${p.label} ✓` : S === "without" ? `${p.label} ✗` : p.label);
    }
    function g(p) {
      const S = t.tristateValues[p.key];
      return S === "only" ? "success" : S === "without" ? "danger" : null;
    }
    function h(p) {
      return t.selectedStatuses.has(p);
    }
    return (p, S) => {
      const r = Q("Button");
      return E(), N("div", Xo, [
        $("div", Qo, [
          (E(!0), N(oe, null, de(e.statusOptions, (d) => (E(), le(r, {
            key: d.value,
            "data-status": d.value,
            "aria-pressed": h(d.value),
            outlined: !h(d.value),
            onClick: (u) => o(d.value)
          }, {
            default: K(() => [
              ce(V(d.label), 1)
            ]),
            _: 2
          }, 1032, ["data-status", "aria-pressed", "outlined", "onClick"]))), 128))
        ]),
        $("div", es, [
          (E(!0), N(oe, null, de(e.tristates, (d) => (E(), le(r, {
            key: d.key,
            "data-tristate": d.key,
            "data-state": e.tristateValues[d.key],
            severity: g(d),
            outlined: e.tristateValues[d.key] === "any",
            onClick: (u) => s(d.key)
          }, {
            default: K(() => [
              ce(V(y(d)), 1)
            ]),
            _: 2
          }, 1032, ["data-tristate", "data-state", "severity", "outlined", "onClick"]))), 128))
        ]),
        $("div", ts, [
          L(r, {
            "data-testid": "filter-clear",
            label: "Clear",
            disabled: !e.hasActive,
            onClick: l
          }, null, 8, ["disabled"])
        ])
      ]);
    };
  }
}, os = /* @__PURE__ */ Te(ns, [["__scopeId", "data-v-227b9cf0"]]);
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Ut;
const Ae = (e) => Ut = e, Bt = (
  /* istanbul ignore next */
  Symbol()
);
function Pt(e) {
  return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
function ss() {
  const e = Lt(!0), a = e.run(() => F({}));
  let t = [], n = [];
  const o = xt({
    install(s) {
      Ae(o), o._a = s, s.provide(Bt, o), s.config.globalProperties.$pinia = o, n.forEach((l) => t.push(l)), n = [];
    },
    use(s) {
      return this._a ? t.push(s) : n.push(s), this;
    },
    _p: t,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: a
  });
  return o;
}
const rt = () => {
};
function Ot(e, a, t, n = rt) {
  e.add(a);
  const o = () => {
    e.delete(a) && n();
  };
  return !t && In() && $n(o), o;
}
function Ie(e, ...a) {
  e.forEach((t) => {
    t(...a);
  });
}
const as = (e) => e(), Dt = Symbol(), st = Symbol();
function ut(e, a) {
  e instanceof Map && a instanceof Map ? a.forEach((t, n) => e.set(n, t)) : e instanceof Set && a instanceof Set && a.forEach(e.add, e);
  for (const t in a) {
    if (!Object.hasOwn(a, t)) continue;
    const n = a[t], o = e[t];
    Pt(o) && Pt(n) && Object.hasOwn(e, t) && !he(n) && !dt(n) ? e[t] = ut(o, n) : e[t] = n;
  }
  return e;
}
const is = (
  /* istanbul ignore next */
  Symbol()
);
function ls(e) {
  return !e || typeof e != "object" || !Object.hasOwn(e, is);
}
const { assign: Re } = Object;
function rs(e) {
  return !!(he(e) && e.effect);
}
function us(e, a, t, n) {
  const { state: o, actions: s, getters: l } = a, y = t.state.value[e];
  let g;
  function h() {
    y || (t.state.value[e] = o ? o() : {});
    const p = On(t.state.value[e]);
    return Re(p, s, Object.keys(l || {}).reduce((S, r) => (S[r] = xt(ne(() => {
      Ae(t);
      const d = t._s.get(e);
      return l[r].call(d, d);
    })), S), {}));
  }
  return g = jt(e, h, a, t, n, !0), g;
}
function jt(e, a, t = {}, n, o, s) {
  let l;
  const y = Re({ actions: {} }, t), g = { deep: !0 };
  let h, p, S = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), d;
  const u = n.state.value[e];
  !s && !u && (n.state.value[e] = {});
  let m;
  function v(x) {
    let c;
    h = p = !1, typeof x == "function" ? (x(n.state.value[e]), c = {
      type: "patch function",
      storeId: e,
      events: d
    }) : (ut(n.state.value[e], x), c = {
      type: "patch object",
      payload: x,
      storeId: e,
      events: d
    });
    const R = m = Symbol();
    Pn().then(() => {
      m === R && (h = !0);
    }), p = !0, Ie(S, c, n.state.value[e]);
  }
  const f = s ? function() {
    const { state: c } = t, R = c ? c() : {};
    this.$patch((P) => {
      Re(P, R);
    });
  } : rt;
  function T() {
    l.stop(), S.clear(), r.clear(), n._s.delete(e);
  }
  const O = (x, c = "") => {
    if (Dt in x)
      return x[st] = c, x;
    const R = function() {
      Ae(n);
      const P = Array.from(arguments), H = /* @__PURE__ */ new Set(), B = /* @__PURE__ */ new Set();
      function se(M) {
        H.add(M);
      }
      function re(M) {
        B.add(M);
      }
      Ie(r, {
        args: P,
        name: R[st],
        store: D,
        after: se,
        onError: re
      });
      let _;
      try {
        _ = x.apply(this && this.$id === e ? this : D, P);
      } catch (M) {
        throw Ie(B, M), M;
      }
      return _ instanceof Promise ? _.then((M) => (Ie(H, M), M)).catch((M) => (Ie(B, M), Promise.reject(M))) : (Ie(H, _), _);
    };
    return R[Dt] = !0, R[st] = c, R;
  }, A = {
    _p: n,
    $id: e,
    $onAction: Ot.bind(null, r),
    $patch: v,
    $reset: f,
    $subscribe(x, c = {}) {
      if (S.has(x))
        return rt;
      const R = Ot(S, x, c.detached, () => P()), P = l.run(() => ve(() => n.state.value[e], (H) => {
        (c.flush === "sync" ? p : h) && x({
          storeId: e,
          type: "direct",
          events: d
        }, H);
      }, Re({}, g, c)));
      return R;
    },
    $dispose: T
  }, D = ye(A);
  n._s.set(e, D);
  const w = (n._a && n._a.runWithContext || as)(() => n._e.run(() => (l = Lt()).run(() => a({ action: O }))));
  for (const x in w) {
    const c = w[x];
    he(c) && !rs(c) || dt(c) ? s || (u && ls(c) && (he(c) ? c.value = u[x] : ((c instanceof Set || c instanceof Map) && c.clear(), ut(c, u[x]))), n.state.value[e][x] = c) : typeof c == "function" && (w[x] = O(c, x), y.actions[x] = c);
  }
  return Re(D, w), Re(qe(D), w), Object.defineProperty(D, "$state", {
    get: () => n.state.value[e],
    set: (x) => {
      v((c) => {
        Re(c, x);
      });
    }
  }), n._p.forEach((x) => {
    const c = l.run(() => x({
      store: D,
      app: n._a,
      pinia: n,
      options: y
    }));
    Re(D, c);
  }), u && s && t.hydrate && t.hydrate(D.$state, u), h = !0, p = !0, D;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function cs(e, a, t) {
  let n;
  const o = typeof a == "function";
  n = o ? t : a;
  function s(l, y) {
    const g = Cn();
    return l = l || (g ? En(Bt, null) : null), l && Ae(l), l = Ut, l._s.has(e) || (o ? jt(e, a, n, l) : us(e, n, l)), l._s.get(e);
  }
  return s.$id = e, s;
}
function ds(e) {
  const a = qe(e), t = {};
  for (const n in a) {
    const o = a[n];
    o != null && o.effect ? t[n] = ne({
      get: () => e[n],
      set(s) {
        e[n] = s;
      }
    }) : (he(o) || dt(o)) && (t[n] = wn(e, n));
  }
  return t;
}
const Mt = 600, ze = 50, fs = /* @__PURE__ */ cs("voDub", () => {
  const e = F(""), a = F(""), t = F([]), n = ye({}), o = F(/* @__PURE__ */ new Set()), s = F("any"), l = F("any"), y = F(""), g = F(""), h = ne({
    get() {
      return o.value.size === 1 ? Array.from(o.value)[0] : s.value === "only" ? "manually_done" : s.value === "without" ? "not_done" : l.value === "only" ? "issues" : "";
    },
    set(I) {
      I ? I === "manually_done" ? (o.value = /* @__PURE__ */ new Set(), s.value = "only", l.value = "any") : I === "not_done" ? (o.value = /* @__PURE__ */ new Set(), s.value = "without", l.value = "any") : I === "issues" ? (o.value = /* @__PURE__ */ new Set(), s.value = "any", l.value = "only") : (o.value = /* @__PURE__ */ new Set([I]), s.value = "any", l.value = "any") : (o.value = /* @__PURE__ */ new Set(), s.value = "any", l.value = "any"), O();
    }
  }), p = F(!1), S = F(!1), r = F({}), d = F(null), u = F(0);
  function m() {
    return Pe(e.value, "_dub_state.json");
  }
  const v = "FL_VoDub.filterState";
  function f() {
    try {
      const I = localStorage.getItem(v);
      if (!I) return;
      const k = JSON.parse(I);
      if (k && typeof k == "object") {
        if (Array.isArray(k.statuses)) {
          const C = Object.keys(He), U = k.statuses.filter((q) => C.includes(q));
          o.value = new Set(U);
        }
        ["any", "only", "without"].includes(k.manuallyDone) && (s.value = k.manuallyDone), ["any", "only", "without"].includes(k.issues) && (l.value = k.issues);
      }
    } catch {
    }
  }
  function T() {
    try {
      const I = {
        statuses: Array.from(o.value),
        manuallyDone: s.value,
        issues: l.value
      };
      localStorage.setItem(v, JSON.stringify(I));
    } catch {
    }
  }
  function O() {
    T();
  }
  function A(I) {
    if (!I || !He.hasOwnProperty(I))
      return;
    const k = new Set(o.value);
    k.has(I) ? k.delete(I) : k.add(I), o.value = k;
  }
  function D() {
    s.value === "any" ? s.value = "only" : s.value === "only" ? s.value = "without" : s.value = "any";
  }
  function w() {
    l.value === "any" ? l.value = "only" : l.value === "only" ? l.value = "without" : l.value = "any";
  }
  function x() {
    o.value = /* @__PURE__ */ new Set(), s.value = "any", l.value = "any";
  }
  const c = ne(
    () => o.value.size > 0 || s.value !== "any" || l.value !== "any"
  );
  function R({ root: I, bucket: k }) {
    e.value = I, a.value = k, o.value = /* @__PURE__ */ new Set(), s.value = "any", l.value = "any", f(), y.value = "", u.value = 0;
  }
  async function P() {
    const k = await (await fetch(`${Ee}/read?path=${encodeURIComponent(m())}`)).json();
    let C = { rows: {} };
    if (k.exists)
      try {
        const U = JSON.parse(k.content);
        U && typeof U.rows == "object" && (C = U);
      } catch (U) {
        console.warn("[VODubStore] _dub_state.json is not valid JSON:", U);
      }
    Object.keys(n).forEach((U) => delete n[U]), Object.assign(n, C.rows), S.value = !!C.use_original_default;
  }
  function H() {
    const I = qe(n), k = {};
    for (const C of t.value) {
      const U = I[C.audio_key];
      k[C.audio_key] = U && U.russian_text || C.russian || "";
    }
    r.value = k;
  }
  async function B() {
    if (e.value) {
      p.value = !0;
      try {
        const I = new URLSearchParams({
          path: e.value,
          bucket: a.value
        });
        h.value && I.set("status", h.value);
        const C = await (await fetch(`${be}/rows?${I.toString()}`)).json();
        if (C.error) {
          g.value = C.error, t.value = [];
          return;
        }
        t.value = C.rows || [];
        for (const U of t.value) {
          const q = n[U.audio_key] || (n[U.audio_key] = {});
          q.russian_text || (q.russian_text = U.russian || ""), q.instruct === void 0 && (q.instruct = U.instruct || ""), q.speaker_override === void 0 && (q.speaker_override = ""), q.effect === void 0 && (q.effect = "");
        }
        g.value = `${t.value.length} row(s) in ${a.value}`, H();
      } catch (I) {
        g.value = `Couldn't load: ${I}`;
      } finally {
        p.value = !1;
      }
    }
  }
  function se(I) {
    return n[I.audio_key] || (n[I.audio_key] = {});
  }
  function re() {
    d.value && clearTimeout(d.value), d.value = setTimeout(_, Mt);
  }
  async function _() {
    try {
      await fetch(`${Ee}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: m(),
          content: JSON.stringify(
            { rows: n, use_original_default: S.value },
            null,
            2
          )
        })
      }), g.value = "Saved", B();
    } catch (I) {
      g.value = `Save failed: ${I}`;
    }
  }
  function M(I) {
    se(I), re();
  }
  function J(I) {
    g.value = I;
  }
  const z = ne(() => {
    const I = y.value.trim().toLowerCase(), k = o.value, C = s.value, U = l.value, q = r.value, ae = qe(n);
    return t.value.filter((Z) => {
      const ee = ae[Z.audio_key] || null, j = !!(ee && ee.manually_done), W = !!Z.manually_issue;
      if (k.size > 0 && !k.has(Z.status))
        return !1;
      if (C === "only") {
        if (!j) return !1;
      } else if (C === "without" && (j || Z.status === "unsupported" && !k.has("unsupported")))
        return !1;
      if (U === "only") {
        if (!W) return !1;
      } else if (U === "without" && W)
        return !1;
      if (!I) return !0;
      const pe = q[Z.audio_key] || Z.russian;
      return `${Z.audio_key} ${Z.speaker_tag} ${Z.english} ${pe}`.toLowerCase().includes(I);
    });
  }), Y = ne(
    () => Math.max(1, Math.ceil(z.value.length / ze))
  ), te = ne(() => {
    const I = u.value * ze;
    return z.value.slice(I, I + ze);
  });
  return ve([o, s, l], () => {
    u.value = 0, B(), T();
  }), ve(y, () => {
    H(), u.value = 0;
  }), ve(z, () => {
    u.value > Y.value - 1 && (u.value = Math.max(0, Y.value - 1));
  }), {
    root: e,
    bucket: a,
    init: R,
    rows: t,
    stateRows: n,
    statusFilter: h,
    filterStatuses: o,
    filterManuallyDone: s,
    filterIssues: l,
    searchText: y,
    status: g,
    loading: p,
    useOriginalDefault: S,
    entryFor: se,
    loadState: P,
    loadRows: B,
    scheduleSave: re,
    flushSave: _,
    onTextEdit: M,
    setStatus: J,
    saveTimer: d,
    visibleRows: z,
    PAGE_SIZE: ze,
    currentPage: u,
    pageCount: Y,
    pagedRows: te,
    SAVE_DEBOUNCE_MS: Mt,
    statePath: m,
    STATUS_LABELS: He,
    STATUS_FILTER_OPTIONS: to,
    STATUS_TOGGLE_OPTIONS: oo,
    TRISTATE_FILTERS: so,
    toggleStatus: A,
    cycleManuallyDone: D,
    cycleIssues: w,
    clearFilters: x,
    hasActiveFilters: c
  };
});
function ps(e) {
  const { props: a, setStatus: t, entryFor: n, scheduleSave: o } = e, s = F(!1), l = F(null), y = F([]), g = F(null), h = ye({});
  async function p() {
    try {
      const u = await (await fetch(
        `${be}/line_history/counts?root=${encodeURIComponent(a.root)}`
      )).json();
      u && !u.error && Object.assign(h, u);
    } catch (d) {
      console.error("[FL history] couldn't load version counts", d);
    }
  }
  async function S(d) {
    l.value = d;
    try {
      const m = await (await fetch(
        `${be}/line_history?root=${encodeURIComponent(a.root)}&audio_key=${encodeURIComponent(d.audio_key)}`
      )).json();
      y.value = m.versions || [], g.value = m.chosen_version ?? null;
    } catch (u) {
      console.error("[FL history] couldn't load line history", u), y.value = [], g.value = null;
    }
    s.value = !0;
  }
  async function r(d) {
    const u = l.value;
    if (u)
      try {
        const v = await (await fetch(`${be}/line_history/choose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            root: a.root,
            audio_key: u.audio_key,
            version: d
          })
        })).json();
        if (v && v.error) {
          t(`Couldn't switch version: ${v.error}`);
          return;
        }
        g.value = d, t(`Switched ${u.audio_key} to version ${d}`), n(u).active_version = d, o(), e.cacheBust && (e.cacheBust[u.audio_key] = Date.now()), e.loadRows && await e.loadRows(), p();
      } catch (m) {
        t(`Couldn't switch version: ${m.message || m}`);
      }
  }
  return {
    historyVisible: s,
    historyRow: l,
    historyVersions: y,
    historyChosenVersion: g,
    historyCounts: h,
    refreshHistoryCounts: p,
    openLineHistory: S,
    onHistoryVersionChosen: r
  };
}
function hs(e) {
  const { props: a, rows: t, entryFor: n, setStatus: o, scheduleSave: s } = e, l = F([]);
  async function y() {
    try {
      const T = await (await fetch(
        `${Ee}/read?path=${encodeURIComponent(Pe(a.root, "_dub_roles.json"))}`
      )).json();
      if (!T.exists) {
        l.value = [];
        return;
      }
      const O = JSON.parse(T.content), A = O && typeof O.roles == "object" && O.roles || {};
      l.value = Object.entries(A).map(([D, w]) => ({ code: D, ...w }));
    } catch {
      l.value = [];
    }
  }
  function g(f) {
    return [f.character, f.speaker].filter(Boolean).join(" -- ");
  }
  function h(f) {
    return (n(f).speaker_override || f.speaker_tag || "").trim();
  }
  const {
    popover: p,
    show: S,
    hide: r,
    info: d
  } = Bn(
    l,
    (f) => [
      ["character", f.character],
      ["gender", f.gender],
      ["actor", f.actor],
      ["description", f.description],
      ["dub direction", f.dub_direction],
      ["notes", Array.isArray(f.notes) ? f.notes.join(" ") : f.notes],
      ["voice", f.speaker]
    ].filter(([, T]) => T != null && T !== "")
  );
  function u(f) {
    const T = (f.speaker_tag || "").trim();
    return T ? t.value.filter(
      (O) => O !== f && O.status !== "unsupported" && (O.speaker_tag || "").trim() === T
    ).length : 0;
  }
  function m(f) {
    const T = u(f);
    return T > 0 ? `Apply this Role to every other "${f.speaker_tag}" row in this bucket (${T})` : "No other rows in this bucket share this Identifier";
  }
  function v(f) {
    const T = u(f);
    if (!T) return;
    const O = (f.speaker_tag || "").trim(), A = n(f).speaker_override || f.speaker_tag;
    t.value.forEach((D) => {
      D !== f && D.status !== "unsupported" && (D.speaker_tag || "").trim() === O && (n(D).speaker_override = A);
    }), s(), o(`Applied Role to ${T} other "${O}" row(s) in this bucket`);
  }
  return {
    roleEntries: l,
    loadRoleEntries: y,
    roleCodeFor: h,
    roleOptionSubLabel: g,
    sameIdentifierCount: u,
    applyRoleTitle: m,
    applyRoleToSameIdentifier: v,
    roleInfoPopover: p,
    showRoleInfoPopover: S,
    hideRoleInfoPopover: r,
    roleInfoFields: d
  };
}
function ys(e) {
  const {
    props: a,
    rows: t,
    entryFor: n,
    onTextEdit: o,
    setStatus: s,
    scheduleSave: l,
    roleCodeFor: y
  } = e, g = F([]);
  function h() {
    return Pe(a.root, "_instruct_categories.json");
  }
  async function p() {
    try {
      const R = await (await fetch(
        `${Ee}/read?path=${encodeURIComponent(h())}`
      )).json();
      if (!R.exists) {
        g.value = [];
        return;
      }
      const P = JSON.parse(R.content);
      g.value = P && P.categories || [];
    } catch {
      g.value = [];
    }
  }
  const S = /* @__PURE__ */ new Map();
  function r(c) {
    clearTimeout(S.get(c.audio_key)), S.set(
      c.audio_key,
      setTimeout(async () => {
        const R = n(c).instruct, P = await jn(
          Ee,
          h(),
          R
        );
        P && (g.value = P);
      }, 600)
      // синхронно с SAVE_DEBOUNCE_MS из state
    );
  }
  const d = F(!1), u = F(null);
  function m(c) {
    u.value = c, d.value = !0;
  }
  const v = ye({});
  function f(c) {
    const R = u.value;
    R && (v[R.audio_key] = n(R).instruct, n(R).instruct = c, o(R), r(R));
  }
  function T(c) {
    return v[c.audio_key] !== void 0 ? `Restore previous instruct: "${v[c.audio_key]}"` : "No previous instruct to restore";
  }
  function O(c) {
    if (v[c.audio_key] === void 0) return;
    const R = n(c).instruct;
    n(c).instruct = v[c.audio_key], v[c.audio_key] = R, o(c);
  }
  function A(c) {
    const R = (n(c).instruct || "").trim(), P = g.value.find(
      (H) => (H.examples || []).some((B) => B.trim() === R)
    );
    return P ? P.title : null;
  }
  function D(c) {
    const R = y(c);
    return R ? t.value.filter(
      (P) => P !== c && P.status !== "unsupported" && y(P) === R
    ).length : 0;
  }
  function w(c) {
    const R = D(c);
    return R > 0 ? `Apply this instruct to every other "${y(c)}" row in this bucket (${R})` : "No other rows in this bucket use this role";
  }
  function x(c) {
    const R = D(c);
    if (!R) return;
    const P = y(c), H = n(c).instruct;
    t.value.forEach((B) => {
      B !== c && B.status !== "unsupported" && y(B) === P && (n(B).instruct = H);
    }), l(), s(`Applied instruct to ${R} other "${P}" row(s) in this bucket`);
  }
  return {
    instructCategories: g,
    loadInstructCategories: p,
    scheduleInstructLibrarySave: r,
    instructPickerVisible: d,
    instructPickerRow: u,
    openInstructPicker: m,
    onInstructPicked: f,
    prevInstruct: v,
    undoInstructTitle: T,
    undoInstruct: O,
    instructNoteFor: A,
    sameRoleCount: D,
    applyInstructTitle: w,
    applyInstructToSameRole: x
  };
}
function vs(e) {
  const {
    props: a,
    entryFor: t,
    onTextEdit: n,
    setStatus: o,
    loadRows: s
  } = e, l = F(!1), y = F(null);
  function g(r) {
    y.value = r, l.value = !0;
  }
  function h(r) {
    return t(r).effect || "";
  }
  async function p(r) {
    var d;
    o(`Applying settings to ${r.audio_key}...`);
    try {
      const m = await (await fetch(`${be}/apply_effect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          root: a.root,
          audio_key: r.audio_key,
          effect: t(r).effect || "",
          normalize: !!t(r).normalize,
          normalize_db: Number(t(r).normalize_db ?? -20),
          speed_match: !!t(r).speed_match,
          version: t(r).active_version ?? null
        })
      })).json();
      if (m.error) {
        o(`Couldn't apply settings to ${r.audio_key}: ${m.error}`);
        return;
      }
      const v = await e.currentContentHash(r);
      t(r).hash = v, e.cacheBust && (e.cacheBust[r.audio_key] = Date.now()), await s(), (d = e.refreshHistoryCounts) == null || d.call(e), o(`Applied settings to ${r.audio_key}`);
    } catch (u) {
      o(`Couldn't apply settings to ${r.audio_key}: ${u}`);
    }
  }
  function S(r) {
    var m;
    const d = y.value;
    if (!d) return;
    const u = t(d);
    u.effect = r.effect, u.normalize = r.normalize, u.speed_match = r.speedMatch, u.normalize_db = r.normalizeDb, n(d), (m = e.hasRuTake) != null && m.call(e, d) && p(d);
  }
  return {
    outputDialogVisible: l,
    dialogRow: y,
    openOutputDialog: g,
    onDialogApply: S,
    effectValue: h,
    applyEffectToFile: p,
    speedMatchValue: (r) => !!t(r).speed_match
  };
}
const zt = 3;
function At(e) {
  let a = !1;
  e.addEventListener("play", () => {
    if (a || e.readyState >= zt) return;
    a = !0, e.pause();
    const t = () => {
      e.removeEventListener("canplaythrough", t), a = !1, e.play().catch(() => {
      });
    };
    e.addEventListener("canplaythrough", t);
  });
}
function at(e) {
  return new Promise((a) => {
    if (e.readyState >= zt) {
      a();
      return;
    }
    const t = () => {
      e.removeEventListener("canplaythrough", t), a();
    };
    e.addEventListener("canplaythrough", t), e.load();
  });
}
let it = null;
function _s() {
  const e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return e ? (it || (it = new e()), it) : null;
}
function ms(e, a = 1024) {
  const t = new Float32Array(a), n = Math.tanh(e) || 1;
  for (let o = 0; o < a; o++) {
    const s = o / (a - 1) * 2 - 1;
    t[o] = Math.tanh(s * e) / n;
  }
  return t;
}
function gs(e, a, t) {
  const o = e.createBuffer(1, Math.max(1, Math.floor(e.sampleRate * 2)), e.sampleRate), s = o.getChannelData(0);
  for (let h = 0; h < s.length; h++) s[h] = Math.random() * 2 - 1;
  const l = e.createBufferSource();
  l.buffer = o, l.loop = !0;
  const y = e.createBiquadFilter();
  y.type = "highpass", y.frequency.value = a;
  const g = e.createBiquadFilter();
  return g.type = "lowpass", g.frequency.value = t, l.connect(y), y.connect(g), l.start(), g;
}
function $e(e, { lowHz: a, highHz: t, drive: n, noiseLevel: o }) {
  const s = e.createBiquadFilter();
  s.type = "highpass", s.frequency.value = a;
  const l = e.createBiquadFilter();
  l.type = "lowpass", l.frequency.value = t, s.connect(l);
  let y = l;
  if (n > 0) {
    const p = e.createWaveShaper();
    p.curve = ms(n), p.oversample = "2x", l.connect(p), y = p;
  }
  if (o <= 0) return { input: s, output: y };
  const g = e.createGain();
  g.gain.value = o, gs(e, a, t).connect(g);
  const h = e.createGain();
  return y.connect(h), g.connect(h), { input: s, output: h };
}
const bs = {
  radio: (e) => $e(e, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0.05 }),
  phone: (e) => $e(e, { lowHz: 300, highHz: 3400, drive: 1.05, noiseLevel: 0 }),
  /*
   Wide passband, no clip, no noise -- a natural muffled quality, not a
   telephony one. See nodes/_audio_effects.py's muffled_effect for the
   same params and the reasoning/reference behind them.
  */
  muffled: (e) => $e(e, { lowHz: 120, highHz: 6e3, drive: 0, noiseLevel: 0 }),
  /*
   radio's band and grit with NO static of its own -- for dubbing a game
   that already layers its own channel noise over the line as a separate
   sound, where baking in a second layer would stack the two. See
   nodes/_audio_effects.py's radio_dry_effect for the case behind it.
  */
  radio_dry: (e) => $e(e, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0 }),
  /*
   Hard-wired intercom/PA panel -- between phone and radio at both ends,
   more grit than phone, no static.
  */
  intercom: (e) => $e(e, { lowHz: 250, highHz: 4e3, drive: 1.2, noiseLevel: 0 }),
  /*
   Inside a sealed helmet -- low end largely kept, only the top rolled
   off, drive below 1.0 so the clip stays in its near-identity region.
  */
  suit: (e) => $e(e, { lowHz: 150, highHz: 5e3, drive: 0.6, noiseLevel: 0 })
};
function Ss(e) {
  const a = { setEffect() {
  } }, t = _s();
  if (!t) return a;
  let n;
  try {
    n = t.createMediaElementSource(e);
  } catch {
    return a;
  }
  const o = t.createGain();
  o.gain.value = e.paused ? 0 : 1, o.connect(t.destination);
  function s() {
    o.gain.value = e.paused ? 0 : 1;
  }
  e.addEventListener("play", s), e.addEventListener("pause", s), e.addEventListener("ended", s);
  const l = t.createGain();
  n.connect(l), l.connect(o);
  const y = {};
  function g(S) {
    if (y[S]) return y[S];
    const r = bs[S];
    if (!r) return null;
    const d = r(t);
    n.connect(d.input);
    const u = t.createGain();
    return u.gain.value = 0, d.output.connect(u), u.connect(o), y[S] = u, u;
  }
  let h = "";
  function p(S) {
    const r = S || "";
    if (r === h) return;
    if (h && y[h] && (y[h].gain.value = 0), h = "", !r) {
      l.gain.value = 1;
      return;
    }
    const d = g(r);
    if (!d) {
      l.gain.value = 1;
      return;
    }
    h = r, l.gain.value = 0, d.gain.value = 1, t.state === "suspended" && t.resume().catch(() => {
    });
  }
  return { setEffect: p };
}
function ks(e) {
  const {
    props: a,
    pagedRows: t,
    effectValue: n,
    effectPreviews: o
    // hasRuTake — через ctx.hasRuTake?.() в момент вызова (Render позже)
  } = e;
  function s(c, R) {
    return Pe(Pe(a.root, c), `${R}.wav`);
  }
  function l(c, R, P) {
    const H = `${Dn}/audio?path=${encodeURIComponent(s(c, R))}`;
    return P ? `${H}&v=${P}` : H;
  }
  function y(c) {
    return s("audio_ru", c.audio_key);
  }
  function g(c) {
    return s("_dub_dry", c.audio_key);
  }
  const h = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map();
  function S(c, R) {
    if (!R) {
      h.delete(c);
      return;
    }
    h.set(c, R), At(R);
  }
  function r(c, R) {
    const P = c.audio_key;
    if (!R) {
      p.delete(P), o.delete(P);
      return;
    }
    p.set(P, R), At(R);
    const H = Ss(R);
    o.set(P, H), H.setEffect(n(c));
  }
  const d = ye(/* @__PURE__ */ new Set()), u = ye(/* @__PURE__ */ new Set());
  function m(c, R) {
    if (d.delete(c.audio_key), R === "ru" && f.value === c.audio_key) {
      const P = p.get(c.audio_key);
      P && !P.ended && O();
    }
  }
  async function v(c) {
    const R = h.get(c.audio_key), P = p.get(c.audio_key);
    if (!(!R || !P)) {
      if (d.has(c.audio_key) || u.has(c.audio_key)) {
        u.delete(c.audio_key), d.delete(c.audio_key), R.pause(), P.pause();
        return;
      }
      R.pause(), P.pause(), R.currentTime = 0, P.currentTime = 0, u.add(c.audio_key), await Promise.all([at(R), at(P)]), u.delete(c.audio_key), h.has(c.audio_key) && (R.currentTime = 0, P.currentTime = 0, d.add(c.audio_key), R.play().catch(() => {
      }), P.play().catch(() => {
      }));
    }
  }
  const f = F(null);
  let T = null;
  function O() {
    var R;
    T && (T.el.removeEventListener("ended", T.fn), T = null);
    const c = f.value;
    f.value = null, c && ((R = p.get(c)) == null || R.pause());
  }
  async function A(c) {
    var re, _;
    O();
    const R = t.value;
    let P = c;
    for (; P < R.length && !((re = e.hasRuTake) != null && re.call(e, R[P])); ) P++;
    if (P >= R.length) return;
    const H = R[P], B = p.get(H.audio_key);
    if (!B || (f.value = H.audio_key, (_ = w.get(H.audio_key)) == null || _.scrollIntoView({ behavior: "smooth", block: "nearest" }), await at(B), f.value !== H.audio_key)) return;
    const se = () => {
      B.removeEventListener("ended", se), T = null, A(P + 1);
    };
    T = { el: B, fn: se }, B.addEventListener("ended", se), B.currentTime = 0, B.play().catch(() => {
    });
  }
  function D() {
    f.value ? O() : A(0);
  }
  const w = /* @__PURE__ */ new Map();
  function x(c, R) {
    if (!R) {
      w.delete(c);
      return;
    }
    w.set(c, R);
  }
  return {
    rawAudioPath: s,
    audioUrl: l,
    ruFilePath: y,
    dryFilePath: g,
    setEnAudioRef: S,
    setRuAudioRef: r,
    dualPlayingRows: d,
    dualLoadingRows: u,
    playBoth: v,
    onTrackPaused: m,
    sequentialPlayingKey: f,
    stopSequentialPlayback: O,
    playSequentialFrom: A,
    toggleSequentialPlayback: D,
    rowEls: w,
    setRowRef: x
  };
}
const Rs = 0.15, Ts = 0.4;
function ws(e) {
  const {
    props: a,
    rows: t,
    entryFor: n,
    onTextEdit: o,
    setStatus: s,
    loadRows: l,
    scheduleSave: y,
    useOriginalDefault: g
  } = e;
  function h(_) {
    const M = n(_).use_original_sample;
    return M === void 0 ? g.value : !!M;
  }
  function p(_, M) {
    n(_).use_original_sample = M, o(_);
  }
  function S() {
    y();
  }
  const r = ye(/* @__PURE__ */ new Set()), d = ye(/* @__PURE__ */ new Set()), u = ye({}), m = ye({});
  function v(_, M) {
    u[_.audio_key] = M.target.duration;
  }
  function f(_, M = 8e3) {
    return new Promise((J) => {
      const z = new Audio();
      let Y = !1;
      const te = (C) => {
        Y || (Y = !0, z.removeEventListener("loadedmetadata", I), z.removeEventListener("error", k), J(C));
      }, I = () => te(z.duration || null), k = () => te(null);
      z.addEventListener("loadedmetadata", I), z.addEventListener("error", k), setTimeout(() => te(null), M), z.preload = "metadata", z.src = _;
    });
  }
  function T(_) {
    return _.status === "done" || _.status === "stale" || r.has(_.audio_key);
  }
  function O(_) {
    return !!n(_).manually_done;
  }
  function A(_) {
    n(_).manually_done = !O(_), o(_);
  }
  function D(_) {
    return !!n(_).manually_issue;
  }
  function w(_) {
    n(_).manually_issue = !D(_), o(_);
  }
  async function x(_) {
    const M = n(_), J = _.speaker, z = M.instruct || "", Y = M.russian_text || "", te = M.effect || "";
    let I = z;
    if (te && (I += `\0effect=${te}`), M.normalize) {
      const k = Number(M.normalize_db ?? -20);
      I += `\0normalize=${k.toFixed(1)}`;
    }
    return M.speed_match && (I += "\0speed=match"), h(_) && (I += "\0sample=original"), zn(J, I, Y);
  }
  async function c(_, M) {
    var Y;
    const J = Date.now(), z = await f(
      ((Y = e.audioUrl) == null ? void 0 : Y.call(e, "audio_ru", _.audio_key, J)) || ""
    );
    await fetch(`${be}/mark_rendered`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        root: a.root,
        audio_key: _.audio_key,
        hash: M,
        duration_s: z
      })
    }), z !== null && (u[_.audio_key] = z), r.add(_.audio_key), m[_.audio_key] = J;
  }
  async function R(_) {
    var M, J, z, Y, te, I;
    if (!(!a.renderApi || d.has(_.audio_key))) {
      if (!a.root) {
        s("Project root is not set.");
        return;
      }
      d.add(_.audio_key), s(`Rendering ${_.audio_key}...`);
      try {
        (M = e.saveTimer) != null && M.value && clearTimeout(e.saveTimer.value), await ((J = e.flushSave) == null ? void 0 : J.call(e));
        const k = n(_), C = _.speaker, U = k.instruct || "", q = k.russian_text || "", ae = k.effect || "", Z = h(_) && ((z = e.rawAudioPath) == null ? void 0 : z.call(e, "audio_en", _.audio_key)) || "", ee = await x(_), j = ((Y = e.ruFilePath) == null ? void 0 : Y.call(e, _)) || "", W = ((te = e.dryFilePath) == null ? void 0 : te.call(e, _)) || "";
        await a.renderApi.renderRow({
          audioKey: _.audio_key,
          speaker: C,
          instruct: U,
          russianText: q,
          effect: ae,
          outputPath: j,
          dryOutputPath: W,
          referenceAudioPath: Z,
          normalize: !!k.normalize,
          normalize_db: Number(k.normalize_db ?? -20),
          speed_match: !!k.speed_match
        }), k.hash = ee, await c(_, ee), s(`Rendered ${_.audio_key}`), await l(), (I = e.refreshHistoryCounts) == null || I.call(e);
      } catch (k) {
        s(`Render failed for ${_.audio_key}: ${k}`);
      } finally {
        d.delete(_.audio_key);
      }
    }
  }
  async function P(_) {
    var M;
    if (!d.has(_.audio_key)) {
      if (!a.root) {
        s("Project root is not set.");
        return;
      }
      if (!_.english) {
        s(`No EN reference for ${_.audio_key} — nothing to copy`);
        return;
      }
      d.add(_.audio_key), s(`Copying EN → RU for ${_.audio_key}...`);
      try {
        const z = await (await fetch(`${be}/use_original`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: a.root, audio_key: _.audio_key })
        })).json();
        if (z.error) {
          s(`Copy failed: ${z.error}`);
          return;
        }
        m[_.audio_key] = Date.now(), r.add(_.audio_key), await l(), (M = e.refreshHistoryCounts) == null || M.call(e), s(`Used original EN for ${_.audio_key}`);
      } catch (J) {
        s(`Copy failed: ${J}`);
      } finally {
        d.delete(_.audio_key);
      }
    }
  }
  const H = F(!1);
  async function B() {
    if (!a.renderApi || H.value) return;
    const _ = t.value.filter(
      (J) => J.status === "not_started" || J.status === "stale"
    );
    if (!_.length) {
      s("Nothing needs rendering in this bucket");
      return;
    }
    H.value = !0;
    let M = 0;
    s(`Rendering 0/${_.length}...`);
    try {
      for (const J of _) {
        try {
          await R(J);
        } catch (z) {
          console.error(`[FL VODubEditor] render-all-pending failed for ${J.audio_key}`, z);
        }
        M++, s(`Rendering ${M}/${_.length}...`);
      }
    } finally {
      H.value = !1;
    }
  }
  function se(_) {
    return _.duration_s ? `EN ${_.duration_s.toFixed(1)}s` : "EN";
  }
  function re(_) {
    const M = u[_.audio_key] ?? _.rendered_duration_s, J = _.duration_s;
    if (!T(_) || M == null || !J) return null;
    const z = (M - J) / J, Y = Math.round(z * 100), te = Math.abs(z);
    return {
      level: te <= Rs ? "good" : te <= Ts ? "warn" : "bad",
      ruSeconds: `${M.toFixed(1)}s`,
      pctText: `${Y >= 0 ? "+" : ""}${Y}%`
    };
  }
  return {
    renderedOnce: r,
    renderingKeys: d,
    cacheBust: m,
    isRenderingAllPending: H,
    currentContentHash: x,
    finalizeRuTake: c,
    renderRow: R,
    useOriginalForRow: P,
    renderAllPending: B,
    hasRuTake: T,
    manuallyDone: O,
    toggleManuallyDone: A,
    manuallyIssue: D,
    toggleManuallyIssue: w,
    measuredDuration: u,
    onRuMetadata: v,
    durationBadge: re,
    enDurationText: se,
    resolvedUseOriginal: h,
    onToggleRowUseOriginal: p,
    onToggleUseOriginalDefault: S
  };
}
function Es(e) {
  const {
    roleEntries: a,
    roleOptionSubLabel: t,
    showRoleInfoPopover: n,
    hideRoleInfoPopover: o,
    fontSizePx: s,
    autoGrow: l,
    setTextareaRef: y,
    audioUrl: g,
    cacheBust: h,
    entryFor: p,
    onTextEdit: S,
    scheduleInstructLibrarySave: r,
    roleCodeFor: d,
    prevInstruct: u,
    undoInstructTitle: m,
    undoInstruct: v,
    sameRoleCount: f,
    applyInstructTitle: T,
    applyInstructToSameRole: O,
    instructNoteFor: A,
    openInstructPicker: D
  } = e;
  Mn("lineRowApi", {
    roleEntries: a,
    roleOptionSubLabel: t,
    fontSizePx: s,
    autoGrow: l,
    setTextareaRef: y,
    showRoleInfoPopover: n,
    hideRoleInfoPopover: o,
    speakerPlaceholder: "Role",
    speakerTitle: "Role code (resolves to that role's assigned voice), or a literal preset/preset#tag",
    instructPlaceholder: "Instruct",
    instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
    textPlaceholder: "Russian text for this line",
    getSpeaker: (w) => p(w).speaker_override || w.speaker_tag,
    setSpeaker: (w, x) => {
      p(w).speaker_override = x, S(w);
    },
    getInstruct: (w) => p(w).instruct,
    setInstruct: (w, x) => {
      p(w).instruct = x, S(w), r(w);
    },
    getText: (w) => p(w).russian_text,
    setText: (w, x) => {
      p(w).russian_text = x, S(w);
    },
    getRoleInfoCode: (w) => d(w),
    textKey: (w) => w.audio_key,
    canUndoInstruct: (w) => u[w.audio_key] !== void 0,
    undoInstructTitle: (w) => m(w),
    undoInstruct: (w) => v(w),
    canApplyInstruct: (w) => f(w) > 0,
    applyInstructTitle: (w) => T(w),
    applyInstructToSameRole: (w) => O(w),
    instructNoteFor: (w) => A(w),
    openInstructPicker: (w) => D(w),
    getOriginalAudioUrl: (w) => g ? g("audio_en", w.audio_key) : "",
    getCurrentAudioUrl: (w) => g ? g("audio_ru", w.audio_key, h == null ? void 0 : h[w.audio_key]) : ""
  });
}
const Cs = { class: "fl-vo-dub-line-editor-content" }, Is = { class: "row" }, $s = { class: "vo-dub-editor-status p-text-secondary ellipsis" }, Ps = { class: "actions" }, Os = { class: "row" }, Ds = { class: "vo-dub-pager-label p-text-secondary" }, Ms = { title: "Project-wide default for the per-row 'Use original as sample' checkbox." }, As = { class: "row" }, xs = { class: "vo-dub-key" }, Ls = { class: "vo-dub-players list" }, Ns = { class: "vo-dub-duration-line row" }, Fs = { class: "vo-dub-duration-en" }, Vs = { class: "vo-dub-duration-ru" }, Us = {
  key: 1,
  class: "vo-dub-similarity-slot"
}, Bs = { class: "vo-dub-players-row" }, js = { class: "vo-dub-player list" }, zs = ["src", "onPause", "onEnded"], Hs = { class: "vo-dub-player list" }, qs = ["src", "onLoadedmetadata", "onPause", "onEnded"], Ws = {
  key: 2,
  class: "vo-dub-no-take p-text-secondary"
}, Gs = { class: "vo-dub-players-footer actions" }, Js = {
  class: "vo-dub-identifier ellipsis",
  title: "Identifier extracted from the game's own resources (vo_dataset.csv's speaker column)"
}, Ks = {
  class: "vo-dub-use-original-label row",
  title: "Use this row's own EN take as the voice-cloning sample for its next render."
}, Zs = { class: "vo-dub-english p-text-secondary" }, Ys = {
  key: 0,
  class: "vo-dub-empty p-text-secondary"
}, Xs = {
  __name: "VoDubLineEditorContent",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const a = e;
    Nt({
      storageKey: "FL_CosyVoice3.VODubLineEditor.widthPx",
      defaultWidth: 1100,
      presets: [800, 1100, 1500]
    });
    const { fontSizePx: t } = Ft({
      storageKey: "FL_CosyVoice3.VODubLineEditor.fontSizePx",
      defaultSize: 13
    }), { autoGrow: n, setTextareaRef: o, regrowAll: s } = Yn();
    ve(t, s);
    const l = /* @__PURE__ */ new Map(), y = F(!0);
    let g = !1;
    const h = fs();
    h.init({ root: a.root, bucket: a.bucket });
    const p = {
      props: a,
      effectPreviews: l,
      autoGrow: n,
      setTextareaRef: o,
      fontSizePx: t
    }, S = ds(h);
    Object.assign(p, {
      // refs
      rows: S.rows,
      statusFilter: S.statusFilter,
      searchText: S.searchText,
      status: S.status,
      loading: S.loading,
      useOriginalDefault: S.useOriginalDefault,
      saveTimer: S.saveTimer,
      currentPage: S.currentPage,
      visibleRows: S.visibleRows,
      pageCount: S.pageCount,
      pagedRows: S.pagedRows,
      filterStatuses: S.filterStatuses,
      filterManuallyDone: S.filterManuallyDone,
      filterIssues: S.filterIssues,
      hasActiveFilters: S.hasActiveFilters,
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
    }), Object.assign(p, ps(p)), Object.assign(p, hs(p)), Object.assign(p, ys(p)), Object.assign(p, vs(p)), Object.assign(p, ks(p)), Object.assign(p, ws(p)), Es(p);
    const {
      // state
      rows: r,
      stateRows: d,
      statusFilter: u,
      searchText: m,
      status: v,
      loading: f,
      useOriginalDefault: T,
      entryFor: O,
      loadState: A,
      loadRows: D,
      scheduleSave: w,
      flushSave: x,
      onTextEdit: c,
      setStatus: R,
      visibleRows: P,
      PAGE_SIZE: H,
      currentPage: B,
      pageCount: se,
      pagedRows: re,
      STATUS_LABELS: _,
      STATUS_FILTER_OPTIONS: M,
      saveTimer: J,
      filterStatuses: z,
      filterManuallyDone: Y,
      filterIssues: te,
      hasActiveFilters: I,
      toggleStatus: k,
      cycleManuallyDone: C,
      cycleIssues: U,
      clearFilters: q,
      STATUS_TOGGLE_OPTIONS: ae,
      TRISTATE_FILTERS: Z,
      // history
      historyVisible: ee,
      historyRow: j,
      historyVersions: W,
      historyChosenVersion: pe,
      historyCounts: _e,
      refreshHistoryCounts: Se,
      openLineHistory: xe,
      onHistoryVersionChosen: Le,
      // roles
      roleEntries: Je,
      loadRoleEntries: vt,
      roleCodeFor: Ce,
      roleOptionSubLabel: ka,
      sameIdentifierCount: Ht,
      applyRoleTitle: qt,
      applyRoleToSameIdentifier: Wt,
      roleInfoPopover: Ke,
      showRoleInfoPopover: Ra,
      hideRoleInfoPopover: Ta,
      roleInfoFields: _t,
      // instruct
      instructCategories: Gt,
      loadInstructCategories: Jt,
      instructPickerVisible: Ze,
      instructPickerRow: wa,
      openInstructPicker: Ea,
      onInstructPicked: Kt,
      prevInstruct: Ca,
      undoInstructTitle: Ia,
      undoInstruct: $a,
      instructNoteFor: Pa,
      sameRoleCount: Oa,
      applyInstructToSameRole: Da,
      // effects
      effectValue: Zt,
      speedMatchValue: Yt,
      commitEffect: Ma,
      applyEffectToFile: Aa,
      outputDialogVisible: Ye,
      dialogRow: fe,
      openOutputDialog: Xt,
      onDialogApply: Qt,
      // players
      audioUrl: Ne,
      setEnAudioRef: en,
      setRuAudioRef: tn,
      dualPlayingRows: mt,
      dualLoadingRows: nn,
      playBoth: on,
      onTrackPaused: Fe,
      sequentialPlayingKey: Xe,
      toggleSequentialPlayback: sn,
      setRowRef: an,
      // render
      cacheBust: gt,
      renderingKeys: Qe,
      isRenderingAllPending: et,
      renderRow: ln,
      useOriginalForRow: rn,
      renderAllPending: un,
      hasRuTake: we,
      manuallyDone: tt,
      toggleManuallyDone: cn,
      manuallyIssue: Ve,
      toggleManuallyIssue: dn,
      measuredDuration: fn,
      onRuMetadata: pn,
      durationBadge: Ue,
      enDurationText: hn,
      resolvedUseOriginal: yn,
      onToggleRowUseOriginal: vn,
      onToggleUseOriginalDefault: _n
    } = p;
    We(async () => {
      vt(), Jt(), Se(), await A(), await D();
    });
    function mn() {
      g || (g = !0, J.value && (clearTimeout(J.value), x()), a.onClose());
    }
    return ve(y, (bt) => {
      bt || mn();
    }), (bt, G) => {
      var kt, Rt, Tt;
      const gn = Q("InputText"), ue = Q("Button"), bn = Q("Divider"), St = Q("Checkbox"), Sn = Q("InlineMessage"), kn = Q("Message"), Rn = Q("Card");
      return E(), N(oe, null, [
        $("div", Cs, [
          L(qn, { class: "vo-dub-editor-controls" }, {
            default: K(() => [
              $("div", Is, [
                L(gn, {
                  modelValue: i(m),
                  "onUpdate:modelValue": G[0] || (G[0] = (b) => he(m) ? m.value = b : null),
                  placeholder: "Search text or audio_key...",
                  class: "vo-dub-search"
                }, null, 8, ["modelValue"]),
                L(os, {
                  statusOptions: i(ae),
                  selectedStatuses: i(z),
                  tristates: i(Z),
                  tristateValues: { manuallyDone: i(Y), issues: i(te) },
                  hasActive: i(I),
                  onToggleStatus: i(k),
                  onCycleTristate: G[1] || (G[1] = (b) => {
                    b === "manuallyDone" ? i(C)() : b === "issues" && i(U)();
                  }),
                  onClear: i(q)
                }, null, 8, ["statusOptions", "selectedStatuses", "tristates", "tristateValues", "hasActive", "onToggleStatus", "onClear"]),
                L(ue, {
                  icon: "pi pi-refresh",
                  title: "Re-scan this bucket",
                  onClick: i(D)
                }, null, 8, ["onClick"]),
                $("span", $s, V(i(f) ? "Loading..." : i(v)), 1)
              ]),
              $("div", Ps, [
                $("div", Os, [
                  L(ue, {
                    label: "◀",
                    disabled: i(B) === 0,
                    title: "Previous page",
                    onClick: G[2] || (G[2] = (b) => B.value--)
                  }, null, 8, ["disabled"]),
                  $("span", Ds, V(i(B) + 1) + " / " + V(i(se)) + " (" + V(i(P).length) + ") ", 1),
                  L(ue, {
                    label: "▶",
                    disabled: i(B) >= i(se) - 1,
                    title: "Next page",
                    onClick: G[3] || (G[3] = (b) => B.value++)
                  }, null, 8, ["disabled"])
                ]),
                L(bn, { layout: "vertical" }),
                L(ue, {
                  label: "´ Stress mark",
                  title: "Insert a stress mark at the cursor",
                  onMousedown: G[4] || (G[4] = An((b) => i(Hn)(i(R)), ["prevent"]))
                }),
                L(ue, {
                  label: i(Xe) ? "Stop" : "Play in order",
                  icon: i(Xe) ? "pi pi-stop-circle" : "pi pi-play",
                  onClick: i(sn)
                }, null, 8, ["label", "icon", "onClick"]),
                L(ue, {
                  label: i(et) ? "Rendering..." : "Render pending",
                  icon: i(et) ? "pi pi-spin pi-spinner" : "pi pi-play",
                  disabled: !a.renderApi || i(et),
                  onClick: i(un)
                }, null, 8, ["label", "icon", "disabled", "onClick"]),
                $("label", Ms, [
                  L(St, {
                    modelValue: i(T),
                    "onUpdate:modelValue": G[5] || (G[5] = (b) => he(T) ? T.value = b : null),
                    binary: "",
                    onChange: i(_n)
                  }, null, 8, ["modelValue", "onChange"]),
                  G[9] || (G[9] = ce(" Original as sample ", -1))
                ])
              ])
            ]),
            _: 1
          }),
          $("div", {
            class: "vo-dub-rows list",
            style: Me({ fontSize: `${i(t)}px` })
          }, [
            (E(!0), N(oe, null, de(i(re), (b) => (E(), le(Rn, {
              key: b.audio_key,
              class: ge(["vo-dub-row", { "row-playing": i(Xe) === b.audio_key, "row-issue": i(Ve)(b) }]),
              ref_for: !0,
              ref: (me) => i(an)(b.audio_key, (me == null ? void 0 : me.$el) ?? me)
            }, {
              title: K(() => [
                $("div", As, [
                  $("span", xs, V(b.audio_key), 1),
                  L(Sn, {
                    severity: i(Vt)(b.status)
                  }, {
                    default: K(() => [
                      ce(V(i(_)[b.status]), 1)
                    ]),
                    _: 2
                  }, 1032, ["severity"]),
                  i(we)(b) ? (E(), le(ue, {
                    key: 0,
                    class: ge(["vo-dub-done-btn", { active: i(tt)(b) }]),
                    icon: i(tt)(b) ? "pi pi-check-circle" : "pi pi-circle",
                    label: i(tt)(b) ? "Done" : "Mark done",
                    title: "Manually treat this row as done even if its content has drifted since the last render.",
                    onClick: (me) => i(cn)(b)
                  }, null, 8, ["class", "icon", "label", "onClick"])) : X("", !0),
                  L(ue, {
                    class: ge(["vo-dub-issue-btn", { active: i(Ve)(b) }]),
                    severity: "danger",
                    icon: i(Ve)(b) ? "pi pi-exclamation-triangle" : "pi pi-exclamation-circle",
                    label: i(Ve)(b) ? "Issue" : "Mark issue",
                    title: "Flag this row as needing attention. Independent from Done — both can be set at once.",
                    onClick: (me) => i(dn)(b)
                  }, null, 8, ["class", "icon", "label", "onClick"])
                ])
              ]),
              content: K(() => {
                var me;
                return [
                  b.status === "unsupported" ? (E(), le(kn, {
                    key: 0,
                    class: "vo-dub-unsupported-note",
                    severity: "warn",
                    closable: !1
                  }, {
                    default: K(() => [
                      ce(" Unsupported: " + V(b.channels) + "-channel audio split across multiple files (", 1),
                      G[10] || (G[10] = $("code", null, ".a", -1)),
                      G[11] || (G[11] = ce("-", -1)),
                      G[12] || (G[12] = $("code", null, ".d", -1)),
                      G[13] || (G[13] = ce(") -- this editor can only play or render a single mono/stereo file per row. Handle this one outside the tool. ", -1))
                    ]),
                    _: 2
                  }, 1024)) : (E(), N(oe, { key: 1 }, [
                    $("div", Ls, [
                      $("div", Ns, [
                        $("span", Fs, V(i(hn)(b)), 1),
                        G[14] || (G[14] = $("span", { class: "vo-dub-duration-arrow" }, "→", -1)),
                        $("span", Vs, " RU " + V(((me = i(Ue)(b)) == null ? void 0 : me.ruSeconds) || "—"), 1),
                        i(Ue)(b) ? (E(), N("span", {
                          key: 0,
                          class: ge(["vo-dub-duration-delta", i(Wn)(i(Ue)(b).level)])
                        }, V(i(Ue)(b).pctText), 3)) : X("", !0),
                        b.english && i(O)(b).russian_text ? (E(), N("span", Us, [
                          L(Yo, {
                            original: b.english,
                            translation: i(O)(b).russian_text
                          }, null, 8, ["original", "translation"])
                        ])) : X("", !0)
                      ]),
                      $("div", Bs, [
                        $("div", js, [
                          L(Et, {
                            src: i(Ne)("audio_en", b.audio_key)
                          }, null, 8, ["src"]),
                          $("audio", {
                            class: "w100p",
                            controls: "",
                            preload: "none",
                            src: i(Ne)("audio_en", b.audio_key),
                            ref_for: !0,
                            ref: (ie) => i(en)(b.audio_key, ie),
                            onPause: (ie) => i(Fe)(b, "en"),
                            onEnded: (ie) => i(Fe)(b, "en")
                          }, null, 40, zs)
                        ]),
                        L(ue, {
                          class: ge(["play-both-btn", { playing: i(mt).has(b.audio_key) }]),
                          label: "Play both",
                          icon: i(nn).has(b.audio_key) ? "pi pi-spin pi-spinner" : i(mt).has(b.audio_key) ? "pi pi-pause" : "pi pi-play",
                          disabled: !i(we)(b),
                          title: i(we)(b) ? "Play EN and RU together, from the start" : "No RU take yet -- nothing to compare",
                          onClick: (ie) => i(on)(b)
                        }, null, 8, ["class", "icon", "disabled", "title", "onClick"]),
                        $("div", Hs, [
                          i(we)(b) ? (E(), le(Et, {
                            key: 0,
                            src: i(Ne)("audio_ru", b.audio_key, i(gt)[b.audio_key])
                          }, null, 8, ["src"])) : X("", !0),
                          i(we)(b) ? (E(), N("audio", {
                            key: 1,
                            class: "w100p",
                            controls: "",
                            preload: "none",
                            crossorigin: "anonymous",
                            src: i(Ne)("audio_ru", b.audio_key, i(gt)[b.audio_key]),
                            ref_for: !0,
                            ref: (ie) => i(tn)(b, ie),
                            onLoadedmetadata: (ie) => i(pn)(b, ie),
                            onPause: (ie) => i(Fe)(b, "ru"),
                            onEnded: (ie) => i(Fe)(b, "ru")
                          }, null, 40, qs)) : (E(), N("span", Ws, "not rendered yet"))
                        ])
                      ]),
                      $("div", Gs, [
                        a.renderApi ? (E(), le(ue, {
                          key: 0,
                          class: ge(["vo-dub-render-btn", { stale: b.status === "stale" }]),
                          label: i(we)(b) ? "Re-render" : "Render",
                          icon: i(Qe).has(b.audio_key) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                          disabled: i(Qe).has(b.audio_key),
                          title: i(we)(b) ? "Re-render this row" : "Render this row",
                          onClick: (ie) => i(ln)(b)
                        }, null, 8, ["class", "label", "icon", "disabled", "title", "onClick"])) : X("", !0),
                        a.renderApi ? (E(), le(ue, {
                          key: 1,
                          icon: "pi pi-arrow-right",
                          label: "Use EN",
                          disabled: i(Qe).has(b.audio_key) || !b.english,
                          title: b.english ? "Copy the EN reference track to audio_ru/" + b.audio_key + ".wav (no new render). Overwrites the current RU take." : "No EN reference for this row",
                          onClick: (ie) => i(rn)(b)
                        }, null, 8, ["disabled", "title", "onClick"])) : X("", !0),
                        L(ue, {
                          icon: "pi pi-history",
                          label: i(_e)[b.audio_key] ? String(i(_e)[b.audio_key]) : "",
                          title: "Line history (previous takes/versions)",
                          onClick: (ie) => i(xe)(b)
                        }, null, 8, ["label", "onClick"]),
                        L(ue, {
                          icon: "pi pi-cog",
                          title: "Edit output settings",
                          onClick: (ie) => i(Xt)(b)
                        }, null, 8, ["onClick"])
                      ])
                    ]),
                    L(Gn, { row: b }, {
                      leading: K(() => [
                        $("span", Js, V(b.speaker_tag || "—"), 1),
                        L(ue, {
                          icon: "pi pi-copy",
                          class: "apply-role-btn",
                          disabled: i(Ht)(b) === 0,
                          title: i(qt)(b),
                          onClick: (ie) => i(Wt)(b)
                        }, null, 8, ["disabled", "title", "onClick"])
                      ]),
                      trailing: K(() => [
                        $("label", Ks, [
                          L(St, {
                            "model-value": i(yn)(b),
                            binary: "",
                            "onUpdate:modelValue": (ie) => i(vn)(b, ie)
                          }, null, 8, ["model-value", "onUpdate:modelValue"]),
                          G[15] || (G[15] = ce(" 🎙️ Original ", -1))
                        ])
                      ]),
                      "above-text": K(() => [
                        $("div", Zs, V(b.english), 1)
                      ]),
                      _: 2
                    }, 1032, ["row"])
                  ], 64))
                ];
              }),
              _: 2
            }, 1032, ["class"]))), 128)),
            i(P).length ? X("", !0) : (E(), N("div", Ys, "No rows match this filter."))
          ], 4)
        ]),
        L(Jn, {
          visible: i(Ze),
          "onUpdate:visible": G[6] || (G[6] = (b) => he(Ze) ? Ze.value = b : null),
          categories: i(Gt),
          onSelect: i(Kt)
        }, null, 8, ["visible", "categories", "onSelect"]),
        L(Kn, {
          visible: i(ee),
          "onUpdate:visible": G[7] || (G[7] = (b) => he(ee) ? ee.value = b : null),
          versions: i(W),
          "chosen-version": i(pe),
          original: ((kt = i(j)) == null ? void 0 : kt.english) || "",
          root: a.root,
          "audio-key": ((Rt = i(j)) == null ? void 0 : Rt.audio_key) || "",
          onSelect: i(Le)
        }, null, 8, ["visible", "versions", "chosen-version", "original", "root", "audio-key", "onSelect"]),
        L(Zn, {
          visible: i(Ke).visible,
          left: i(Ke).left,
          top: i(Ke).top,
          message: i(_t).message,
          fields: i(_t).fields
        }, null, 8, ["visible", "left", "top", "message", "fields"]),
        L(bo, {
          visible: i(Ye),
          "onUpdate:visible": G[8] || (G[8] = (b) => he(Ye) ? Ye.value = b : null),
          audioKey: (Tt = i(fe)) == null ? void 0 : Tt.audio_key,
          effect: i(fe) ? i(Zt)(i(fe)) : "",
          "normalize-db": i(fe) ? i(O)(i(fe)).normalize_db ?? -20 : -20,
          "speed-match": i(fe) ? i(Yt)(i(fe)) : !1,
          enDurationS: i(fe) ? i(fe).duration_s : null,
          ruDurationS: i(fe) ? i(fn)[i(fe).audio_key] ?? i(fe).rendered_duration_s : null,
          onApply: i(Qt)
        }, null, 8, ["visible", "audioKey", "effect", "normalize-db", "speed-match", "enDurationS", "ruDurationS", "onApply"])
      ], 64);
    };
  }
}, Qs = /* @__PURE__ */ Te(Xs, [["__scopeId", "data-v-f21666d3"]]), ea = {
  __name: "VoDubLineEditor",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const a = e, t = F(!0);
    return ve(t, (n) => {
      n || a.onClose();
    }), (n, o) => {
      const s = Q("Dialog");
      return E(), le(s, {
        visible: t.value,
        "onUpdate:visible": o[0] || (o[0] = (l) => t.value = l),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: { width: "1600px" },
        class: "vo-dub-editor-dialog"
      }, {
        default: K(() => [
          L(Qs, xn(Ln(n.$props)), null, 16)
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, ta = { class: "row" }, na = { class: "role-name" }, oa = { class: "role-head row" }, sa = {
  class: "role-code",
  title: "Role code -- read-only here, this addon doesn't own this file's identity model"
}, aa = ["title"], ia = {
  key: 1,
  class: "role-actor"
}, la = {
  key: 0,
  class: "role-description p-text-secondary"
}, ra = {
  key: 1,
  class: "role-dub-direction"
}, ua = {
  key: 2,
  class: "role-notes p-text-secondary"
}, ca = { class: "role-stats row p-text-secondary" }, da = { key: 0 }, fa = { key: 1 }, pa = { key: 2 }, ha = { key: 3 }, ya = {
  key: 3,
  class: "role-examples p-text-secondary",
  title: "Longest lines for this role -- a quick sample to listen to"
}, va = { class: "role-speaker-row row" }, _a = 600, ma = 3e3, ga = 1500, ba = {
  __name: "DubRolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    onClose: { type: Function, required: !0 },
    inline: { type: Boolean, default: !1 }
  },
  setup(e) {
    const a = e, t = Pe(a.root, "_dub_roles.json"), n = F(!0), o = F({ roles: {} }), s = F([]), l = F(""), y = F(""), g = F(!1), { cssWidth: h, setWidth: p, presets: S } = Nt({
      storageKey: "FL_CosyVoice3.DubRolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: r, decrease: d, increase: u } = Ft({
      storageKey: "FL_CosyVoice3.DubRolesEditor.fontSizePx",
      defaultSize: 13
    });
    let m = null, v = 0, f = null, T = null;
    const O = /* @__PURE__ */ new Map();
    function A(k) {
      y.value = k;
    }
    const D = ne(() => {
      var C;
      const k = ((C = o.value) == null ? void 0 : C.roles) || {};
      return Object.entries(k).sort((U, q) => {
        var ae, Z;
        return (((ae = q[1]) == null ? void 0 : ae.lines) || 0) - (((Z = U[1]) == null ? void 0 : Z.lines) || 0);
      });
    });
    function w(k, C) {
      return k.character || C;
    }
    function x(k) {
      return Array.isArray(k.notes) ? k.notes : [];
    }
    function c(k) {
      return Array.isArray(k.longest_files) ? k.longest_files : [];
    }
    function R() {
      return JSON.stringify(o.value, null, 2);
    }
    async function P() {
      const k = R();
      if (k !== m)
        try {
          const U = await (await fetch(`${Ee}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: t, content: k })
          })).json();
          if (U.error) {
            A(`Save error: ${U.error}`);
            return;
          }
          m = k, A(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (C) {
          A(`Save failed: ${C}`);
        }
    }
    function H() {
      v = Date.now(), f && clearTimeout(f), f = setTimeout(P, _a);
    }
    function B(k, C) {
      O.get(k) !== C.speaker && (O.set(k, C.speaker), Vn(a.root, k).then((q) => A(q.message)));
    }
    function se(k, C) {
      H(), B(k, C);
    }
    async function re() {
      try {
        const C = await (await fetch(Fn)).json();
        s.value = C.presets || [], l.value = C.dir || "";
      } catch {
        s.value = [], l.value = "";
      }
    }
    const _ = F(!1), M = F(null);
    function J(k, C) {
      M.value = [k, C], _.value = !0;
    }
    function z(k) {
      const C = M.value;
      if (!C) return;
      const [U, q] = C;
      q.speaker = k, se(U, q);
    }
    async function Y({ isPoll: k = !1 } = {}) {
      try {
        const U = await (await fetch(`${Ee}/read?path=${encodeURIComponent(t)}`)).json();
        if (U.error) {
          A(`Read error: ${U.error}`);
          return;
        }
        if (!U.exists) {
          k || (o.value = { roles: {} }, m = "", A('_dub_roles.json does not exist yet -- click "Seed from dataset" below'));
          return;
        }
        if (k && Date.now() - v < ga || U.content === m) return;
        let q;
        try {
          q = JSON.parse(U.content);
        } catch (Z) {
          A(`_dub_roles.json is not valid JSON: ${Z}`);
          return;
        }
        const ae = q && typeof q.roles == "object" && q.roles || {};
        for (const Z of Object.values(ae))
          Z && typeof Z == "object" && Z.speaker === void 0 && (Z.speaker = "");
        o.value = { ...q, roles: ae };
        for (const [Z, ee] of Object.entries(ae))
          O.set(Z, ee.speaker);
        m = R(), k || A(`Loaded ${D.value.length} role(s)`);
      } catch (C) {
        A(`Read failed: ${C}`);
      }
    }
    async function te() {
      g.value = !0;
      try {
        const C = await (await fetch(`${be}/seed_roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: a.root })
        })).json();
        if (C.error) {
          A(`Seed error: ${C.error}`);
          return;
        }
        await Y(), A(C.added.length ? `Added ${C.added.length} role(s): ${C.added.join(", ")}` : "Nothing new to add");
      } catch (k) {
        A(`Seed failed: ${k}`);
      } finally {
        g.value = !1;
      }
    }
    function I() {
      f && (clearTimeout(f), P());
      for (const [k, C] of D.value) B(k, C);
      T && clearInterval(T), a.onClose();
    }
    return ve(n, (k) => {
      k || I();
    }), We(async () => {
      re(), await Y(), T = setInterval(() => Y({ isPoll: !0 }), ma);
    }), ct(() => {
      T && clearInterval(T);
    }), (k, C) => {
      const U = Q("Button"), q = Q("Message"), ae = Q("InputText"), Z = Q("Card");
      return E(), N(oe, null, [
        (E(), le(Nn(e.inline ? "div" : "Dialog"), {
          visible: n.value,
          "onUpdate:visible": C[1] || (C[1] = (ee) => n.value = ee),
          modal: !1,
          draggable: !1,
          "close-on-escape": "",
          header: " ",
          style: Me({ width: i(h) }),
          class: "roles-dialog"
        }, {
          default: K(() => [
            $("div", ta, [
              L(Un, {
                title: "VO Dub Roles",
                status: y.value,
                "width-presets": i(S),
                "set-width": i(p),
                "font-size-decrease": i(d),
                "font-size-increase": i(u)
              }, {
                after: K(() => [
                  L(U, {
                    label: "Seed from dataset",
                    icon: g.value ? "pi pi-spin pi-spinner" : "pi pi-database",
                    disabled: g.value,
                    title: "Add every distinct speaker tag from vo_dataset.csv that isn't a role here yet",
                    onClick: te
                  }, null, 8, ["icon", "disabled"])
                ]),
                _: 1
              }, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
            ]),
            D.value.length ? X("", !0) : (E(), le(q, {
              key: 0,
              severity: "info",
              closable: !1
            }, {
              default: K(() => [...C[3] || (C[3] = [
                ce(' No roles yet -- click "Seed from dataset" above to create one per distinct speaker tag. ', -1)
              ])]),
              _: 1
            })),
            $("div", {
              class: "roles-list list",
              style: Me({ fontSize: `${i(r)}px` })
            }, [
              (E(!0), N(oe, null, de(D.value, ([ee, j]) => (E(), le(Z, {
                key: ee,
                class: "role-card"
              }, {
                title: K(() => [
                  $("span", na, V(w(j, ee)), 1)
                ]),
                subtitle: K(() => [
                  $("span", oa, [
                    $("span", sa, V(ee), 1),
                    j.gender ? (E(), N("span", {
                      key: 0,
                      class: "role-gender",
                      title: j.gender_evidence || ""
                    }, V(j.gender), 9, aa)) : X("", !0),
                    j.actor ? (E(), N("span", ia, V(j.actor), 1)) : X("", !0)
                  ])
                ]),
                content: K(() => [
                  j.description ? (E(), N("p", la, V(j.description), 1)) : X("", !0),
                  j.dub_direction ? (E(), N("p", ra, V(j.dub_direction), 1)) : X("", !0),
                  x(j).length ? (E(), N("ul", ua, [
                    (E(!0), N(oe, null, de(x(j), (W, pe) => (E(), N("li", { key: pe }, V(W), 1))), 128))
                  ])) : X("", !0),
                  $("div", ca, [
                    j.lines !== void 0 ? (E(), N("span", da, V(j.lines) + " line(s)", 1)) : X("", !0),
                    j.audio_minutes !== void 0 ? (E(), N("span", fa, V(j.audio_minutes) + " min", 1)) : X("", !0),
                    j.lines_needing_translation ? (E(), N("span", pa, V(j.lines_needing_translation) + " need translation", 1)) : X("", !0),
                    j.lines_without_any_text ? (E(), N("span", ha, V(j.lines_without_any_text) + " no text", 1)) : X("", !0)
                  ]),
                  c(j).length ? (E(), N("div", ya, " e.g. " + V(c(j).join(", ")), 1)) : X("", !0),
                  $("div", va, [
                    L(ae, {
                      modelValue: j.speaker,
                      "onUpdate:modelValue": [
                        (W) => j.speaker = W,
                        C[0] || (C[0] = (W) => H())
                      ],
                      placeholder: "Speaker preset",
                      title: "Real CosyVoice preset this role resolves to",
                      class: "role-speaker",
                      onBlur: (W) => B(ee, j)
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onBlur"]),
                    L(U, {
                      icon: "pi pi-microphone",
                      title: "Pick a speaker from the preset gallery",
                      onClick: (W) => J(ee, j)
                    }, null, 8, ["onClick"])
                  ])
                ]),
                _: 2
              }, 1024))), 128))
            ], 4)
          ]),
          _: 1
        }, 40, ["visible", "style"])),
        L(Xn, {
          visible: _.value,
          "onUpdate:visible": C[2] || (C[2] = (ee) => _.value = ee),
          presets: s.value,
          "sample-dir": l.value,
          onSelect: z
        }, null, 8, ["visible", "presets", "sample-dir"])
      ], 64);
    };
  }
}, Sa = /* @__PURE__ */ Te(ba, [["__scopeId", "data-v-702a698e"]]), Ge = ss();
Ae(Ge);
function Fa({ node: e, projectRootWidget: a, openBrowseDialog: t, openVoDubLineEditor: n, openDubRolesEditor: o, queueVoDubRender: s }) {
  ft(import.meta.url);
  const l = document.createElement("div");
  l.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const y = pt(po, {
    node: e,
    projectRootWidget: a,
    openBrowseDialog: t,
    openVoDubLineEditor: n,
    openDubRolesEditor: o,
    queueVoDubRender: s
  });
  return y.use(Ge), y.use(ht, { ripple: !0 }), yt(y), y.mount(l), { element: l, unmount: () => y.unmount() };
}
function Va({ root: e, bucket: a, renderApi: t }) {
  ft(import.meta.url);
  const n = document.createElement("div");
  document.body.appendChild(n);
  const o = pt(ea, {
    root: e,
    bucket: a,
    renderApi: t || null,
    onClose: () => {
      o.unmount(), n.remove();
    }
  });
  o.use(Ge), o.use(ht, { ripple: !0 }), yt(o), o.mount(n);
}
function Ua({ root: e }) {
  ft(import.meta.url);
  const a = document.createElement("div");
  document.body.appendChild(a);
  const t = pt(Sa, {
    root: e,
    onClose: () => {
      t.unmount(), a.remove();
    }
  });
  t.use(Ge), t.use(ht, { ripple: !0 }), yt(t), t.mount(a);
}
export {
  Fa as mountVoDubBrowserPanel,
  Ua as openDubRolesEditor,
  Va as openVoDubLineEditor
};
