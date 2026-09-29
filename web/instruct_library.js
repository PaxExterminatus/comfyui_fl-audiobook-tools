import { A as ke, C as we, a as d, c as y, G as F, H as xe, _ as V, f as z, g as k, u as n, h as D, i as T, d as f, j as E, F as _, r as R, t as b, b as x, U as Se, s as U, k as Z, S as Pe, m as Fe, n as ye, l as A, z as De, e as Ue, J as Ve, L as me } from "./styles_link.js";
import { u as X, a as Q, s as ee, D as te, b as se } from "./DialogHeader.js";
import { b as ne, a as We, s as Oe } from "./dropdown.esm.js";
import { s as Be } from "./inputtext.esm.js";
var je = {
  root: "p-inputgroup"
}, Ge = ke.extend({
  name: "inputgroup",
  classes: je
}), He = {
  name: "BaseInputGroup",
  extends: we,
  style: Ge,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, q = {
  name: "InputGroup",
  extends: He,
  inheritAttrs: !1
};
function Ke(e, o, t, r, a, s) {
  return d(), y("div", xe({
    class: e.cx("root")
  }, e.ptmi("root")), [F(e.$slots, "default")], 16);
}
q.render = Ke;
var Je = {
  root: "p-inputgroup-addon"
}, Ye = ke.extend({
  name: "inputgroupaddon",
  classes: Je
}), qe = {
  name: "BaseInputGroupAddon",
  extends: we,
  style: Ye,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, K = {
  name: "InputGroupAddon",
  extends: qe,
  inheritAttrs: !1
};
function Ze(e, o, t, r, a, s) {
  return d(), y("div", xe({
    class: e.cx("root")
  }, e.ptmi("root")), [F(e.$slots, "default")], 16);
}
K.render = Ze;
const Xe = { class: "sticky-panel" }, Qe = {
  __name: "StickyPanel",
  setup(e) {
    return (o, t) => (d(), y("div", Xe, [
      F(o.$slots, "default", {}, void 0, !0)
    ]));
  }
}, rs = /* @__PURE__ */ V(Qe, [["__scopeId", "data-v-3edd6ab3"]]), et = { class: "instruct-example-list" }, tt = ["onClick"], st = {
  __name: "InstructPickerDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    categories: { type: Array, default: () => [] }
  },
  emits: ["update:visible", "select"],
  setup(e, { emit: o }) {
    const { cssWidth: t, setWidth: r, presets: a } = X({
      storageKey: "FL_CosyVoice3.InstructPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: s, decrease: u, increase: v } = Q({
      storageKey: "FL_CosyVoice3.InstructPicker.fontSizePx",
      defaultSize: 13
    }), w = o;
    function I(M) {
      w("select", M), w("update:visible", !1);
    }
    return (M, S) => (d(), z(n(se), {
      visible: e.visible,
      modal: "",
      header: " ",
      style: E({ width: n(t) }),
      "onUpdate:visible": S[0] || (S[0] = ($) => M.$emit("update:visible", $))
    }, {
      header: k(() => [
        x(te, {
          title: "Pick an instruct phrase",
          "width-presets": n(a),
          "set-width": n(r),
          "font-size-decrease": n(u),
          "font-size-increase": n(v)
        }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: k(() => [
        e.categories.length ? T("", !0) : (d(), z(n(ee), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: k(() => [...S[1] || (S[1] = [
            D(" No _instruct_categories.json found for this project -- you can still type any instruct text directly. ", -1)
          ])]),
          _: 1
        })),
        f("div", {
          class: "instruct-categories-grid",
          style: E({ fontSize: `${n(s)}px` })
        }, [
          (d(!0), y(_, null, R(e.categories, ($) => (d(), z(n(ne), {
            key: $.name,
            class: "instruct-category-card"
          }, {
            title: k(() => [
              D(b($.title), 1)
            ]),
            subtitle: k(() => [
              D(b($.when), 1)
            ]),
            content: k(() => [
              f("ul", et, [
                (d(!0), y(_, null, R($.examples, (P) => (d(), y("li", { key: P }, [
                  f("button", {
                    type: "button",
                    class: "instruct-example-btn",
                    onClick: (h) => I(P)
                  }, b(P), 9, tt)
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
}, ls = /* @__PURE__ */ V(st, [["__scopeId", "data-v-0d135846"]]);
function nt(e) {
  if (!e) return "#353535";
  let o = 0;
  for (let t = 0; t < e.length; t++) o = o * 31 + e.charCodeAt(t) >>> 0;
  return `hsl(${o % 360}, 55%, 55%, 0.3)`;
}
function ot(e) {
  const o = (e || "").toUpperCase().replace(/[^A-ZА-Я0-9]/g, "");
  if (!o) return "?";
  const t = o[0], r = [...o.slice(1)].find((a) => a !== t);
  return r ? t + r : t;
}
const at = ["onClick"], it = { class: "speaker-card-text" }, rt = { class: "speaker-name" }, lt = {
  key: 0,
  class: "speaker-usage"
}, ct = ["onClick"], ut = {
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
  setup(e, { emit: o }) {
    const t = e, r = o, { cssWidth: a, setWidth: s, presets: u } = X({
      storageKey: "FL_CosyVoice3.SpeakerPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: v, decrease: w, increase: I } = Q({
      storageKey: "FL_CosyVoice3.SpeakerPicker.fontSizePx",
      defaultSize: 13
    });
    function M(i) {
      r("select", i), r("update:visible", !1);
    }
    const S = Z(null);
    let $ = null;
    function P(i, l) {
      return `${Pe}/audio?path=${encodeURIComponent(Fe(t.sampleDir, `${i}.${l}`))}`;
    }
    function h() {
      $ == null || $.pause(), $ = null, S.value = null;
    }
    function p(i) {
      if (S.value === i) {
        h();
        return;
      }
      if (h(), !t.sampleDir) return;
      const l = new Audio(P(i, "mp3"));
      let c = !1;
      l.addEventListener("error", () => {
        if (c) {
          S.value === i && h();
          return;
        }
        c = !0, l.src = P(i, "wav"), l.play().catch(() => h());
      }), l.addEventListener("ended", () => {
        S.value === i && h();
      }), l.play().catch(() => h()), $ = l, S.value = i;
    }
    return (i, l) => (d(), z(n(se), {
      visible: e.visible,
      modal: "",
      header: " ",
      style: E({ width: n(a) }),
      "onUpdate:visible": l[0] || (l[0] = (c) => {
        h(), i.$emit("update:visible", c);
      })
    }, {
      header: k(() => [
        x(te, {
          title: "Pick a speaker",
          "width-presets": n(u),
          "set-width": n(s),
          "font-size-decrease": n(w),
          "font-size-increase": n(I)
        }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: k(() => [
        e.presets.length ? T("", !0) : (d(), z(n(ee), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: k(() => [...l[1] || (l[1] = [
            D(" No saved speaker presets found. ", -1)
          ])]),
          _: 1
        })),
        f("div", {
          class: "speaker-grid",
          style: E({ fontSize: `${n(v)}px` })
        }, [
          (d(!0), y(_, null, R(e.presets, (c) => (d(), z(n(ne), {
            key: c,
            class: "speaker-card"
          }, {
            content: k(() => [
              f("div", {
                class: "speaker-card-row",
                onClick: (m) => M(c)
              }, [
                f("div", {
                  class: "speaker-avatar",
                  style: E({ backgroundColor: n(nt)(c) })
                }, b(n(ot)(c)), 5),
                f("div", it, [
                  f("div", rt, b(c), 1),
                  e.usageFor && e.usageFor(c) ? (d(), y("div", lt, b(e.usageFor(c)), 1)) : T("", !0)
                ]),
                f("span", {
                  class: "speaker-play-wrap",
                  onClick: Se((m) => p(c), ["stop"])
                }, [
                  x(n(U), {
                    icon: S.value === c ? "pi pi-pause" : "pi pi-play",
                    size: "small",
                    disabled: !e.sampleDir,
                    title: "Preview this speaker's sample"
                  }, null, 8, ["icon", "disabled"])
                ], 8, ct)
              ], 8, at)
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, cs = /* @__PURE__ */ V(ut, [["__scopeId", "data-v-f6109d98"]]);
function B(e) {
  return Math.round(e * 10) / 10;
}
function G(e) {
  return String(e).split(/\s+/).filter(Boolean);
}
function ve(e, o) {
  return (e.match(/[,;]/g) || []).length + (e.match(o) || []).length;
}
function dt(e) {
  return (e.match(/[aeiouyAEIOUY]+/g) || []).length;
}
function pt(e) {
  return (e.match(/[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g) || []).length;
}
function ge(e, o) {
  const t = String(e), r = String(o), a = dt(t), s = pt(r);
  let u;
  if (a === 0)
    u = 100;
  else {
    const C = s / a, Y = Math.abs(C - 1);
    u = 100 * Math.exp(-2 * Y);
  }
  const v = /\b(oh|ah|hm|ha|hey|ugh|wow|oops|tsk)\b/gi, w = /\b(ох|ах|хм|ха|эй|уф|ого|ой|упс|мда)\b/gi, I = (t.match(v) || []).length / Math.max(1, G(t).length) * 100, M = (r.match(w) || []).length / Math.max(1, G(r).length) * 100, $ = 100 * ((Math.min(I, M) + 0.01) / (Math.max(I, M) + 0.01)), P = /[aeiouyAEIOUY]/g, h = /[sxzSXZ]/g, p = /[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g, i = /[шжщчсзШЖЩЧСЗ]/g, l = (t.match(/[a-zA-Z]/g) || []).length || 1, c = (r.match(/[а-яёА-ЯЁ]/g) || []).length || 1, m = (t.match(P) || []).length / l, g = (r.match(p) || []).length / c, L = (t.match(h) || []).length / l, W = (r.match(i) || []).length / c, J = Math.abs(m - g), Me = Math.abs(L - W), Ce = 100 * (1 - Math.min(1, (J + Me) / 2)), _e = ($ + Ce) / 2, oe = (C) => [
    C.includes("?"),
    C.includes("!"),
    C.includes("...") || C.includes("…"),
    /["«»]/.test(C),
    /^\s*[—-]/.test(C)
  ], Re = oe(t), ze = oe(r);
  let ae = 0;
  for (let C = 0; C < 5; C++)
    Re[C] === ze[C] && (ae += 1);
  const Ee = ae / 5 * 100, ie = G(t);
  let re = 100;
  if (ie.length >= 7) {
    const C = /* @__PURE__ */ new Set([
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
    ]), Y = /* @__PURE__ */ new Set([
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
    ]), ue = (O) => String(O).toLowerCase().replace(/[^a-zа-яё\s]/gi, "").split(/\s+/).filter(Boolean), de = ue(t).filter((O) => !C.has(O)), pe = ue(r).filter((O) => !Y.has(O)), he = new Set(de).size / Math.max(1, de.length), fe = new Set(pe).size / Math.max(1, pe.length);
    re = Math.min(he, fe) / Math.max(he, fe, 1e-4) * 100;
  }
  const Te = /\b(and|but|or|so|because|although)\b/gi, Ae = /\b(и|а|но|или|потому|хотя)\b/gi, Le = G(r), le = ve(t, Te) / (ie.length || 1) * 10, ce = ve(r, Ae) / (Le.length || 1) * 10, Ne = 100 * ((Math.min(le, ce) + 0.01) / (Math.max(le, ce) + 0.01));
  return [
    { key: "syllableRatio", label: "Слоговая ёмкость строки", score: B(u) },
    { key: "acousticTexture", label: "Звуковая/фонетическая согласованность", score: B(_e) },
    { key: "edgeParity", label: "Интонационно-краевые маркеры", score: B(Ee) },
    { key: "lexicalDiversity", label: "Лексическое разнообразие (TTR)", score: B(re) },
    { key: "pauseDensity", label: "Плотность микропауз", score: B(Ne) }
  ];
}
const ht = { class: "translation-similarity-radar" }, ft = { class: "radar-chart-container" }, yt = ["viewBox"], mt = ["points"], vt = ["x2", "y2"], gt = ["d"], bt = ["y"], $t = ["cx", "cy", "onMouseenter"], kt = ["x", "y"], wt = ["x", "y", "text-anchor", "dy"], xt = { class: "radar-metrics-list" }, St = { class: "metric-info" }, Pt = { class: "metric-label" }, It = { class: "metric-score-val" }, Mt = { class: "metric-bar-bg" }, j = 300, N = 95, be = 3, H = 30, Ct = {
  __name: "TranslationSimilarityRadar",
  props: {
    original: { type: String, default: "" },
    translation: { type: String, default: "" }
  },
  setup(e) {
    const o = Z(null), t = {
      syllableRatio: "Слоги",
      acousticTexture: "Фонетика",
      edgeParity: "Маркеры",
      lexicalDiversity: "TTR",
      pauseDensity: "Паузы"
    }, r = e, a = A(() => {
      try {
        if (typeof ge == "function") {
          const c = ge(r.original, r.translation);
          if (Array.isArray(c) && c.length > 0)
            return c;
        }
      } catch {
      }
      const h = r.original || "", p = r.translation || "", i = Math.abs(p.length - h.length), l = Math.max(0, Math.min(100, Math.round(100 - i / Math.max(h.length, 1) * 50)));
      return [
        { key: "semantic", label: "Semantic Match", score: p.length > 0 ? 85 : 0 },
        { key: "length", label: "Length Ratio", score: l },
        { key: "completeness", label: "Completeness", score: p.length > 0 ? 90 : 0 },
        { key: "fluency", label: "Fluency", score: p.length > 0 ? 80 : 0 },
        { key: "vocabulary", label: "Vocabulary", score: p.length > 0 ? 78 : 0 }
      ];
    }), s = j / 2, u = A(() => {
      const h = a.value.reduce((p, i) => p + i.score, 0);
      return Math.round(h / a.value.length);
    }), v = A(() => a.value.length || 5), w = A(() => {
      const h = v.value, p = [];
      for (let i = 0; i < h; i++) {
        const l = i * 2 * Math.PI / h - Math.PI / 2;
        p.push({
          x: s + N * Math.cos(l),
          y: s + N * Math.sin(l),
          angle: l
        });
      }
      return p;
    }), I = A(() => {
      const h = v.value, p = [];
      for (let i = 1; i <= be; i++) {
        const l = N * i / be, c = [];
        for (let m = 0; m < h; m++) {
          const g = m * 2 * Math.PI / h - Math.PI / 2, L = s + l * Math.cos(g), W = s + l * Math.sin(g);
          c.push(`${L},${W}`);
        }
        p.push({ level: i, points: c.join(" ") });
      }
      return p;
    }), M = A(() => {
      const h = v.value, p = [];
      return a.value.forEach((i, l) => {
        const c = l * 2 * Math.PI / h - Math.PI / 2, m = Math.max(0, Math.min(100, i.score ?? 0)), g = N * m / 100, L = Math.max(g, H), W = s + L * Math.cos(c), J = s + L * Math.sin(c);
        p.push({ x: W, y: J, score: m, label: i.label, key: i.key, clamped: g <= H });
      }), p;
    }), S = A(() => {
      const h = M.value, p = h.length;
      if (p === 0) return "";
      let i = `M ${h[0].x} ${h[0].y}`;
      for (let l = 1; l <= p; l++) {
        const c = h[l - 1], m = h[l % p];
        c.clamped && m.clamped ? i += ` A ${H} ${H} 0 0 1 ${m.x} ${m.y}` : i += ` L ${m.x} ${m.y}`;
      }
      return `${i} Z`;
    });
    function $(h) {
      const p = Math.cos(h);
      return Math.abs(p) < 0.25 ? "middle" : p > 0 ? "start" : "end";
    }
    function P(h) {
      const p = Math.sin(h);
      return p < -0.5 ? "-6" : p > 0.5 ? "14" : "4";
    }
    return (h, p) => (d(), y("div", ht, [
      f("div", ft, [
        (d(), y("svg", {
          width: j,
          height: j,
          viewBox: `0 0 ${j} ${j}`,
          class: "radar-svg"
        }, [
          (d(!0), y(_, null, R(I.value, (i) => (d(), y("polygon", {
            key: i.level,
            points: i.points,
            class: "radar-grid-polygon"
          }, null, 8, mt))), 128)),
          (d(!0), y(_, null, R(w.value, (i, l) => (d(), y("line", {
            key: "axis-" + l,
            x1: s,
            y1: s,
            x2: i.x,
            y2: i.y,
            class: "radar-axis-line"
          }, null, 8, vt))), 128)),
          M.value.length > 0 ? (d(), y("path", {
            key: 0,
            d: S.value,
            class: "radar-data-polygon"
          }, null, 8, gt)) : T("", !0),
          f("circle", {
            cx: s,
            cy: s,
            r: "30",
            fill: "#1e1e22"
          }),
          f("text", {
            x: s,
            y: s + 5,
            "text-anchor": "middle",
            class: "radar-center-text-main"
          }, b(u.value) + "%", 9, bt),
          (d(!0), y(_, null, R(M.value, (i, l) => (d(), y("circle", {
            key: "pt-" + l,
            cx: i.x,
            cy: i.y,
            r: "4",
            class: ye(["radar-data-node", { "radar-data-node-active": l === o.value }]),
            onMouseenter: (c) => o.value = l,
            onMouseleave: p[0] || (p[0] = (c) => o.value = null)
          }, null, 42, $t))), 128)),
          (d(!0), y(_, null, R(M.value, (i, l) => (d(), y("text", {
            key: "pct-" + l,
            x: s + Math.max(N * i.score / 100 + 14, 40) * Math.cos(l * 2 * Math.PI / v.value - Math.PI / 2),
            y: s + Math.max(N * i.score / 100 + 14, 40) * Math.sin(l * 2 * Math.PI / v.value - Math.PI / 2),
            "text-anchor": "middle",
            class: "radar-node-percent"
          }, b(Math.round(i.score)) + "% ", 9, kt))), 128)),
          (d(!0), y(_, null, R(w.value, (i, l) => {
            var c, m, g;
            return d(), y("text", {
              key: "label-" + l,
              x: s + (N + 22) * Math.cos(i.angle),
              y: s + (N + 22) * Math.sin(i.angle),
              "text-anchor": $(i.angle),
              dy: P(i.angle),
              class: "radar-axis-label"
            }, [
              f("title", null, b((c = a.value[l]) == null ? void 0 : c.label), 1),
              D(" " + b(t[(m = a.value[l]) == null ? void 0 : m.key] || ((g = a.value[l]) == null ? void 0 : g.label) || `Metric ${l + 1}`), 1)
            ], 8, wt);
          }), 128))
        ], 8, yt))
      ]),
      f("div", xt, [
        (d(!0), y(_, null, R(a.value, (i, l) => (d(), y("div", {
          key: i.key,
          class: ye(["radar-metric-item", { "radar-metric-item-active": l === o.value }])
        }, [
          f("div", St, [
            f("span", Pt, b(i.label), 1),
            f("span", It, b(Math.round(i.score)) + "%", 1)
          ]),
          f("div", Mt, [
            f("div", {
              class: "metric-bar-fill",
              style: E({ width: Math.max(0, Math.min(100, i.score)) + "%" })
            }, null, 4)
          ])
        ], 2))), 128))
      ])
    ]));
  }
}, _t = /* @__PURE__ */ V(Ct, [["__scopeId", "data-v-2f7dabc6"]]), Rt = { class: "history-card-head" }, zt = { class: "history-version" }, Et = {
  key: 0,
  class: "history-active-badge"
}, Tt = { class: "history-meta" }, At = { class: "history-snapshot" }, Lt = { class: "history-snapshot-speaker" }, Nt = { class: "history-snapshot-instruct" }, Ft = { class: "history-snapshot-text" }, Dt = { class: "history-card-actions" }, Ut = {
  __name: "LineHistoryDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    versions: { type: Array, default: () => [] },
    chosenVersion: { type: Number, default: null },
    original: { type: String, default: "" }
  },
  emits: ["update:visible", "select"],
  setup(e, { emit: o }) {
    const t = e, r = o, { cssWidth: a, setWidth: s, presets: u } = X({
      storageKey: "FL_CosyVoice3.LineHistory.widthPx",
      defaultWidth: 1e3,
      presets: [800, 1e3, 1300]
    }), { fontSizePx: v, decrease: w, increase: I } = Q({
      storageKey: "FL_CosyVoice3.LineHistory.fontSizePx",
      defaultSize: 13
    }), M = A(() => [...t.versions].sort((c, m) => m.version - c.version));
    function S(c) {
      r("select", c), r("update:visible", !1);
    }
    const $ = Z(null);
    let P = null;
    function h(c) {
      return `${Pe}/audio?path=${encodeURIComponent(c)}`;
    }
    function p() {
      P == null || P.pause(), P = null, $.value = null;
    }
    function i(c) {
      if ($.value === c.version) {
        p();
        return;
      }
      p();
      const m = new Audio(h(c.path));
      m.addEventListener("ended", () => {
        $.value === c.version && p();
      }), m.addEventListener("error", () => {
        $.value === c.version && p();
      }), m.play().catch(() => p()), P = m, $.value = c.version;
    }
    function l(c) {
      try {
        return new Date(c).toLocaleString();
      } catch {
        return c;
      }
    }
    return (c, m) => (d(), z(n(se), {
      visible: e.visible,
      modal: "",
      header: " ",
      style: E({ width: n(a) }),
      "onUpdate:visible": m[0] || (m[0] = (g) => {
        p(), c.$emit("update:visible", g);
      })
    }, {
      header: k(() => [
        x(te, {
          title: "История строки",
          "width-presets": n(u),
          "set-width": n(s),
          "font-size-decrease": n(w),
          "font-size-increase": n(I)
        }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: k(() => [
        e.versions.length ? (d(), y("div", {
          key: 1,
          class: "history-grid",
          style: E({ fontSize: `${n(v)}px` })
        }, [
          (d(!0), y(_, null, R(M.value, (g) => (d(), z(n(ne), {
            key: g.version,
            class: "history-card"
          }, {
            content: k(() => [
              f("div", Rt, [
                f("span", zt, "Версия " + b(g.version), 1),
                g.version === e.chosenVersion ? (d(), y("span", Et, "✓ Активна")) : T("", !0)
              ]),
              f("div", Tt, "сид " + b(g.seed) + " · " + b(l(g.created_at)), 1),
              f("div", At, [
                f("div", Lt, b(g.speaker), 1),
                f("div", Nt, b(g.instruct), 1),
                f("div", Ft, b(g.text), 1)
              ]),
              e.original ? (d(), z(_t, {
                key: 0,
                original: e.original,
                translation: g.text
              }, null, 8, ["original", "translation"])) : T("", !0),
              f("div", Dt, [
                x(n(U), {
                  icon: $.value === g.version ? "pi pi-pause" : "pi pi-play",
                  size: "small",
                  title: "Прослушать этот дубль",
                  onClick: (L) => i(g)
                }, null, 8, ["icon", "onClick"]),
                x(n(U), {
                  label: "Сделать активной",
                  size: "small",
                  disabled: g.version === e.chosenVersion,
                  onClick: (L) => S(g.version)
                }, null, 8, ["disabled", "onClick"])
              ])
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)) : (d(), z(n(ee), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: k(() => [...m[1] || (m[1] = [
            D(" Для этой строки ещё нет истории озвучки. ", -1)
          ])]),
          _: 1
        }))
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, us = /* @__PURE__ */ V(Ut, [["__scopeId", "data-v-6b77d944"]]), Vt = { class: "dropdown-option-label" }, Wt = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Ot = {
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
  setup(e, { emit: o }) {
    const t = o;
    return (r, a) => (d(), z(n(We), {
      "model-value": e.modelValue,
      options: e.roleEntries,
      "option-label": "code",
      "option-value": "code",
      editable: "",
      filter: "",
      placeholder: e.placeholder,
      title: e.title,
      class: "role-dropdown",
      "onUpdate:modelValue": a[0] || (a[0] = (s) => t("update:modelValue", s))
    }, {
      option: k(({ option: s }) => [
        f("div", Vt, b(s.code), 1),
        e.optionSubLabel(s) ? (d(), y("div", Wt, b(e.optionSubLabel(s)), 1)) : T("", !0)
      ]),
      _: 1
    }, 8, ["model-value", "options", "placeholder", "title"]));
  }
}, Bt = /* @__PURE__ */ V(Ot, [["__scopeId", "data-v-4b129755"]]), jt = { class: "line-controls-row" }, Gt = {
  key: 0,
  class: "instruct-desc"
}, ds = {
  __name: "LineRowEditor",
  props: {
    row: { type: Object, required: !0 },
    index: { type: Number, default: -1 }
  },
  setup(e) {
    const o = e, t = De("lineRowApi");
    if (!t)
      throw new Error(
        "LineRowEditor: provide('lineRowApi', {...}) отсутствует в родителе"
      );
    function r(a) {
      var I;
      a.preventDefault();
      const s = a.target, u = (a.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), v = s.selectionStart, w = s.selectionEnd;
      s.value = s.value.slice(0, v) + u + s.value.slice(w), s.selectionStart = s.selectionEnd = v + u.length, t.setText(o.row, s.value), (I = t.autoGrow) == null || I.call(t, s);
    }
    return (a, s) => (d(), y(_, null, [
      f("div", jt, [
        F(a.$slots, "leading"),
        x(n(q), { class: "speaker-group" }, {
          default: k(() => [
            x(n(K), null, {
              default: k(() => [...s[8] || (s[8] = [
                f("i", { class: "pi pi-address-book" }, null, -1)
              ])]),
              _: 1
            }),
            x(Bt, {
              "model-value": n(t).getSpeaker(e.row),
              "role-entries": n(t).roleEntries.value,
              "option-sub-label": n(t).roleOptionSubLabel,
              placeholder: n(t).speakerPlaceholder,
              title: n(t).speakerTitle,
              "onUpdate:modelValue": s[0] || (s[0] = (u) => n(t).setSpeaker(e.row, u))
            }, null, 8, ["model-value", "role-entries", "option-sub-label", "placeholder", "title"]),
            x(n(K), {
              class: "role-info-btn",
              onMouseenter: s[1] || (s[1] = (u) => n(t).showRoleInfoPopover(u.target, n(t).getRoleInfoCode(e.row))),
              onMouseleave: n(t).hideRoleInfoPopover
            }, {
              default: k(() => [...s[9] || (s[9] = [
                f("i", { class: "pi pi-info-circle" }, null, -1)
              ])]),
              _: 1
            }, 8, ["onMouseleave"])
          ]),
          _: 1
        }),
        x(n(q), { class: "instruct-group" }, {
          default: k(() => [
            x(n(K), null, {
              default: k(() => [...s[10] || (s[10] = [
                f("i", { class: "pi pi-book" }, null, -1)
              ])]),
              _: 1
            }),
            x(n(U), {
              icon: "pi pi-undo",
              size: "small",
              class: "instruct-undo-btn",
              disabled: !n(t).canUndoInstruct(e.row),
              title: n(t).undoInstructTitle(e.row),
              onClick: s[2] || (s[2] = (u) => n(t).undoInstruct(e.row))
            }, null, 8, ["disabled", "title"]),
            x(n(Be), {
              "model-value": n(t).getInstruct(e.row),
              placeholder: n(t).instructPlaceholder,
              title: n(t).instructTitle,
              "onUpdate:modelValue": s[3] || (s[3] = (u) => n(t).setInstruct(e.row, u))
            }, null, 8, ["model-value", "placeholder", "title"]),
            x(n(U), {
              icon: "pi pi-th-large",
              size: "small",
              title: "Pick an instruct phrase from the category bank",
              onClick: s[4] || (s[4] = (u) => n(t).openInstructPicker(e.row))
            }),
            x(n(U), {
              icon: "pi pi-users",
              size: "small",
              class: "apply-instruct-btn",
              disabled: !n(t).canApplyInstruct(e.row),
              title: n(t).applyInstructTitle(e.row),
              onClick: s[5] || (s[5] = (u) => n(t).applyInstructToSameRole(e.row))
            }, null, 8, ["disabled", "title"])
          ]),
          _: 1
        }),
        F(a.$slots, "trailing")
      ]),
      n(t).instructNoteFor(e.row) ? (d(), y("div", Gt, "↳ " + b(n(t).instructNoteFor(e.row)), 1)) : T("", !0),
      F(a.$slots, "above-text"),
      x(n(Oe), {
        "model-value": n(t).getText(e.row),
        "auto-resize": "",
        rows: "1",
        class: "fl-textarea",
        style: E({ fontSize: `${n(t).fontSizePx.value}px` }),
        placeholder: n(t).textPlaceholder,
        ref: (u) => n(t).setTextareaRef(n(t).textKey(e.row), u),
        "onUpdate:modelValue": s[6] || (s[6] = (u) => n(t).setText(e.row, u)),
        onKeydown: s[7] || (s[7] = Ue(Se(() => {
        }, ["prevent"]), ["enter"])),
        onPaste: r
      }, null, 8, ["model-value", "style", "placeholder"])
    ], 64));
  }
};
function ps(e) {
  const o = document.activeElement;
  if (!o || o.tagName !== "TEXTAREA" && o.tagName !== "INPUT") {
    e == null || e("Click into a line's text first, place the cursor right after the vowel to stress");
    return;
  }
  const t = o.selectionStart;
  o.value = o.value.slice(0, t) + "́" + o.value.slice(t), o.selectionStart = o.selectionEnd = t + 1, o.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function hs(e, o) {
  const t = Ve({ visible: !1, left: 0, top: 0, code: "" });
  function r(u, v) {
    const w = u.getBoundingClientRect();
    t.left = Math.min(w.left, window.innerWidth - 280), t.top = w.bottom + 4, t.code = v, t.visible = !0;
  }
  function a() {
    t.visible = !1;
  }
  const s = A(() => {
    const u = t.code;
    if (!u) return { message: "No speaker set on this line yet" };
    const v = e.value.find((I) => I.code === u);
    if (!v) return { message: `"${u}" is not a known role code -- used directly as a preset name` };
    const w = o(v);
    return w.length ? { fields: w } : { message: `"${u}" has no fields set` };
  });
  return { popover: t, show: r, hide: a, info: s };
}
const Ht = { key: 0 }, Kt = { class: "role-info-key" }, Jt = { class: "role-info-value" }, fs = {
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
    return (o, t) => e.visible ? (d(), y("div", {
      key: 0,
      class: "role-info-popover",
      style: E({ left: `${e.left}px`, top: `${e.top}px` })
    }, [
      e.message ? (d(), y("div", Ht, b(e.message), 1)) : T("", !0),
      (d(!0), y(_, null, R(e.fields, ([r, a]) => (d(), y("div", {
        key: r,
        class: "role-info-row"
      }, [
        f("span", Kt, b(r), 1),
        f("span", Jt, b(a), 1)
      ]))), 128))
    ], 4)) : T("", !0);
  }
};
function ys() {
  const e = /* @__PURE__ */ new Map();
  function o(a) {
    a && (a.style.height = "auto", a.style.height = `${a.scrollHeight}px`);
  }
  function t(a, s) {
    if (!s) {
      e.delete(a);
      return;
    }
    const u = s.$el ?? s;
    e.set(a, u), me(() => o(u));
  }
  function r() {
    me(() => e.forEach(o));
  }
  return { autoGrow: o, setTextareaRef: t, regrowAll: r };
}
async function ms(e, o, t) {
  const r = `${(e || "").trim()}|${(o || "").trim()}|${(t || "").trim()}`, a = new TextEncoder().encode(r), s = await crypto.subtle.digest("SHA-256", a);
  return [...new Uint8Array(s)].map((v) => v.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const Yt = /^(\d+)_([0-9a-f]+)\.wav$/i;
function qt(e, o) {
  return `${String(e).padStart(4, "0")}_${o}.wav`;
}
function Zt(e) {
  const o = Yt.exec(e);
  return o ? { position: Number(o[1]), hash: o[2].toLowerCase() } : null;
}
function vs(e, o, t) {
  return e.has(qt(o, t));
}
function gs(e, o, t) {
  let r = null, a = -1 / 0;
  for (const s of e) {
    const u = Zt(s);
    if (!u || u.position !== t) continue;
    const v = (o == null ? void 0 : o[s]) ?? 0;
    (r === null || v > a) && (r = s, a = v);
  }
  return r;
}
const $e = "custom", Xt = "My phrases", Qt = "Typed directly into an instruct field -- not curated, just captured for reuse.";
function Ie(e, o) {
  const t = o.trim();
  return e.some((r) => (r.examples || []).some((a) => a.trim() === t));
}
function es(e, o) {
  const t = o.trim();
  if (!t || Ie(e, t)) return e;
  const r = e.find((a) => a.name === $e);
  return r ? (r.examples = [...r.examples || [], t], e) : [
    ...e,
    { name: $e, title: Xt, when: Qt, examples: [t] }
  ];
}
async function bs(e, o, t) {
  const r = (t || "").trim();
  if (!r || !o) return null;
  let a = { categories: [] };
  try {
    const u = await (await fetch(`${e}/read?path=${encodeURIComponent(o)}`)).json();
    if (u.exists) {
      const v = JSON.parse(u.content);
      v && Array.isArray(v.categories) && (a = v);
    }
  } catch {
  }
  return Ie(a.categories, r) ? null : (a.categories = es(a.categories, r), await fetch(`${e}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: o, content: JSON.stringify(a, null, 2) })
  }), a.categories);
}
export {
  ls as I,
  us as L,
  rs as S,
  ds as _,
  qt as a,
  nt as b,
  q as c,
  K as d,
  cs as e,
  fs as f,
  hs as g,
  vs as h,
  ps as i,
  ms as l,
  gs as m,
  bs as s,
  ys as u
};
