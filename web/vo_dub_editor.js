import { _ as Ee, k as S, o as Me, T as At, c as x, d, b as $, u as p, F as Z, r as Ne, t as R, Y as X, a as b, s as L, i as D, A as fn, C as vn, Z as Rt, D as hn, H as Fe, G as yn, f as se, n as Y, w as Q, g as W, l as ie, U as bn, h as me, j as lt, M as oe, m as _e, S as mn, J as M, X as _n, p as kn, q as gn, N as Sn, $ as $n, v as ut, x as dt, P as ct } from "./styles_link.js";
import { s as pt } from "./inputtext.esm.js";
import { c as Cn, b as ft, u as It, a as Vt, D as Dt, s as xn } from "./DialogHeader.js";
import { a as Lt } from "./dropdown.esm.js";
import { i as Rn, S as Pn, _ as wn, I as En, L as Tn, f as An, u as In, g as Vn, l as Dn, s as Ln, e as On } from "./instruct_library.js";
const zn = { class: "vo-dub-panel" }, jn = { class: "vo-dub-toolbar" }, Un = { class: "vo-dub-buckets" }, Fn = ["onClick"], Nn = { class: "vo-dub-bucket-name" }, Bn = { class: "vo-dub-bucket-count" }, Mn = { class: "vo-dub-bucket-pills" }, qn = {
  key: 0,
  class: "vo-dub-pill pill-no-text"
}, Hn = {
  key: 1,
  class: "vo-dub-pill pill-needs-translation"
}, Wn = {
  key: 2,
  class: "vo-dub-pill pill-not-started"
}, Jn = {
  key: 3,
  class: "vo-dub-pill pill-stale"
}, Gn = {
  key: 4,
  class: "vo-dub-pill pill-done"
}, Kn = {
  key: 5,
  class: "vo-dub-pill pill-unsupported",
  title: "Multi-channel rows this addon can't render or play"
}, Yn = { class: "vo-dub-status" }, Xn = 3e3, Pt = "FL_CosyVoice3.VODubLibrary.lastRoot", Zn = {
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
  setup(n) {
    const o = n, s = S(o.projectRootWidget.value || localStorage.getItem(Pt) || ""), r = S([]), c = S(""), u = S(!1);
    let m = null;
    async function f() {
      if (!s.value) {
        r.value = [];
        return;
      }
      u.value = !0;
      try {
        const w = await (await fetch(`${X}/tree?path=${encodeURIComponent(s.value)}`)).json();
        if (w.error) {
          c.value = w.error, r.value = [];
          return;
        }
        r.value = w.buckets || [], c.value = `${r.value.length} bucket(s), ${r.value.reduce((k, A) => k + A.count, 0)} row(s)`;
      } catch (_) {
        c.value = `Couldn't load: ${_}`;
      } finally {
        u.value = !1;
      }
    }
    function T() {
      o.openBrowseDialog({
        mode: "folder",
        startPath: s.value,
        onSelect: (_) => {
          s.value = _, o.projectRootWidget.value = _, localStorage.setItem(Pt, _), f();
        }
      });
    }
    function E(_) {
      o.openVoDubLineEditor({
        root: s.value,
        bucket: _.bucket,
        /*
         Only offered when this panel's node-wiring actually has a render
         mechanism (it always does in practice -- null only ever shows up
         in a test that doesn't pass one) -- see queueVoDubRender's own
         docstring in web/vo_dub_library.js for what it does.
        */
        renderApi: o.queueVoDubRender ? {
          renderRow: (w) => o.queueVoDubRender(o.node, w)
        } : null
      });
    }
    function V() {
      s.value && o.openDubRolesEditor({ root: s.value });
    }
    return Me(() => {
      f(), m = setInterval(f, Xn);
    }), At(() => clearInterval(m)), (_, w) => (b(), x("div", zn, [
      d("div", jn, [
        $(p(pt), {
          modelValue: s.value,
          "onUpdate:modelValue": w[0] || (w[0] = (k) => s.value = k),
          class: "vo-dub-root-input",
          placeholder: "VO dub project root (holds vo_dataset.csv)",
          onChange: w[1] || (w[1] = (k) => f())
        }, null, 8, ["modelValue"]),
        $(p(L), {
          label: "Browse...",
          size: "small",
          onClick: T
        }),
        $(p(L), {
          label: "Roles",
          size: "small",
          disabled: !s.value,
          title: "Assign a voice preset to each character tag",
          onClick: V
        }, null, 8, ["disabled"]),
        $(p(L), {
          icon: "pi pi-refresh",
          size: "small",
          text: "",
          title: "Re-scan",
          onClick: f
        })
      ]),
      d("div", Un, [
        (b(!0), x(Z, null, Ne(r.value, (k) => (b(), x("div", {
          key: k.bucket,
          class: "vo-dub-bucket-row",
          onClick: (A) => E(k)
        }, [
          d("span", Nn, R(k.bucket), 1),
          d("span", Bn, R(k.count), 1),
          d("span", Mn, [
            k.no_text ? (b(), x("span", qn, "no text " + R(k.no_text), 1)) : D("", !0),
            k.needs_translation ? (b(), x("span", Hn, "needs RU " + R(k.needs_translation), 1)) : D("", !0),
            k.not_started ? (b(), x("span", Wn, "not started " + R(k.not_started), 1)) : D("", !0),
            k.stale ? (b(), x("span", Jn, "stale " + R(k.stale), 1)) : D("", !0),
            k.done ? (b(), x("span", Gn, "done " + R(k.done), 1)) : D("", !0),
            k.unsupported ? (b(), x("span", Kn, "unsupported " + R(k.unsupported), 1)) : D("", !0)
          ])
        ], 8, Fn))), 128))
      ]),
      d("div", Yn, R(u.value ? "Loading..." : c.value), 1)
    ]));
  }
}, Qn = /* @__PURE__ */ Ee(Zn, [["__scopeId", "data-v-ee8c5a8a"]]);
var ea = {
  root: function(o) {
    var s = o.instance, r = o.props;
    return ["p-checkbox p-component", {
      "p-highlight": s.checked,
      "p-disabled": r.disabled,
      "p-invalid": r.invalid,
      "p-variant-filled": r.variant ? r.variant === "filled" : s.$primevue.config.inputStyle === "filled"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, ta = fn.extend({
  name: "checkbox",
  classes: ea
}), na = {
  name: "BaseCheckbox",
  extends: vn,
  props: {
    value: null,
    modelValue: null,
    binary: Boolean,
    name: {
      type: String,
      default: null
    },
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    variant: {
      type: String,
      default: null
    },
    invalid: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    required: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: ta,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
};
function aa(n) {
  return la(n) || ia(n) || sa(n) || oa();
}
function oa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function sa(n, o) {
  if (n) {
    if (typeof n == "string") return rt(n, o);
    var s = Object.prototype.toString.call(n).slice(8, -1);
    if (s === "Object" && n.constructor && (s = n.constructor.name), s === "Map" || s === "Set") return Array.from(n);
    if (s === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(s)) return rt(n, o);
  }
}
function ia(n) {
  if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null) return Array.from(n);
}
function la(n) {
  if (Array.isArray(n)) return rt(n);
}
function rt(n, o) {
  (o == null || o > n.length) && (o = n.length);
  for (var s = 0, r = new Array(o); s < o; s++) r[s] = n[s];
  return r;
}
var Be = {
  name: "Checkbox",
  extends: na,
  inheritAttrs: !1,
  emits: ["update:modelValue", "change", "focus", "blur"],
  methods: {
    getPTOptions: function(o) {
      var s = o === "root" ? this.ptmi : this.ptm;
      return s(o, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(o) {
      var s = this;
      if (!this.disabled && !this.readonly) {
        var r;
        this.binary ? r = this.checked ? this.falseValue : this.trueValue : this.checked ? r = this.modelValue.filter(function(c) {
          return !Rt.equals(c, s.value);
        }) : r = this.modelValue ? [].concat(aa(this.modelValue), [this.value]) : [this.value], this.$emit("update:modelValue", r), this.$emit("change", o);
      }
    },
    onFocus: function(o) {
      this.$emit("focus", o);
    },
    onBlur: function(o) {
      this.$emit("blur", o);
    }
  },
  computed: {
    checked: function() {
      return this.binary ? this.modelValue === this.trueValue : Rt.contains(this.value, this.modelValue);
    }
  },
  components: {
    CheckIcon: Cn
  }
}, ra = ["data-p-highlight", "data-p-disabled"], ua = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"];
function da(n, o, s, r, c, u) {
  var m = hn("CheckIcon");
  return b(), x("div", Fe({
    class: n.cx("root")
  }, u.getPTOptions("root"), {
    "data-p-highlight": u.checked,
    "data-p-disabled": n.disabled
  }), [d("input", Fe({
    id: n.inputId,
    type: "checkbox",
    class: [n.cx("input"), n.inputClass],
    style: n.inputStyle,
    value: n.value,
    name: n.name,
    checked: u.checked,
    tabindex: n.tabindex,
    disabled: n.disabled,
    readonly: n.readonly,
    required: n.required,
    "aria-labelledby": n.ariaLabelledby,
    "aria-label": n.ariaLabel,
    "aria-invalid": n.invalid || void 0,
    onFocus: o[0] || (o[0] = function() {
      return u.onFocus && u.onFocus.apply(u, arguments);
    }),
    onBlur: o[1] || (o[1] = function() {
      return u.onBlur && u.onBlur.apply(u, arguments);
    }),
    onChange: o[2] || (o[2] = function() {
      return u.onChange && u.onChange.apply(u, arguments);
    })
  }, u.getPTOptions("input")), null, 16, ua), d("div", Fe({
    class: n.cx("box")
  }, u.getPTOptions("box")), [yn(n.$slots, "icon", {
    checked: u.checked,
    class: Y(n.cx("icon"))
  }, function() {
    return [u.checked ? (b(), se(m, Fe({
      key: 0,
      class: n.cx("icon")
    }, u.getPTOptions("icon")), null, 16, ["class"])) : D("", !0)];
  })], 16)], 16, ra);
}
Be.render = da;
function ca(n, o) {
  if (n == null || o == null || n <= 0 || o <= 0 || typeof n != "number" || typeof o != "number")
    return { ratio: 1, percent: 0, label: "" };
  let s = o / n;
  s < 0.5 ? s = 0.5 : s > 2 && (s = 2);
  const r = Math.round((s - 1) * 100);
  let c = "";
  return r !== 0 && (c = `${r > 0 ? "+" : ""}${r}%`), { ratio: s, percent: r, label: c };
}
const pa = { class: "output-file-dialog-content" }, fa = { class: "field-row" }, va = { class: "field-row" }, ha = { class: "field-row speed-row" }, ya = { class: "dialog-actions" }, ba = {
  __name: "OutputFileDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    audioKey: { type: String, default: "" },
    effect: { type: String, default: "" },
    normalize: { type: Boolean, default: !1 },
    speed: { type: Number, default: 1 },
    enDurationS: { type: Number, default: null },
    ruDurationS: { type: Number, default: null }
  },
  emits: ["update:visible", "apply"],
  setup(n, { emit: o }) {
    const s = n, r = o, c = [
      { value: "", label: "No effect" },
      { value: "radio", label: "📻 Radio" },
      { value: "phone", label: "📞 Phone" },
      { value: "muffled", label: "🤫 Muffled" },
      { value: "radio_dry", label: "📻 Radio (no static)" },
      { value: "intercom", label: "🔊 Intercom" },
      { value: "suit", label: "🧑‍🚀 Suit" }
    ], u = S(s.effect), m = S(s.normalize), f = S(s.speed);
    Q(() => s.visible, (k) => {
      k && (u.value = s.effect, m.value = s.normalize, f.value = s.speed);
    });
    const T = ie(() => ca(s.enDurationS, s.ruDurationS)), E = ie(() => T.value.label), V = ie(() => !E.value);
    function _() {
      V.value || (f.value = T.value.ratio);
    }
    function w() {
      r("apply", {
        effect: u.value,
        normalize: m.value,
        speed: f.value
      }), r("update:visible", !1);
    }
    return (k, A) => (b(), se(p(ft), {
      visible: n.visible,
      modal: "",
      header: "Output File Settings",
      style: { width: "500px" },
      "onUpdate:visible": A[2] || (A[2] = (z) => k.$emit("update:visible", z))
    }, {
      default: W(() => [
        d("div", pa, [
          d("div", fa, [
            A[3] || (A[3] = d("label", null, "Effect:", -1)),
            $(p(Lt), {
              modelValue: u.value,
              "onUpdate:modelValue": A[0] || (A[0] = (z) => u.value = z),
              options: c,
              optionLabel: "label",
              optionValue: "value"
            }, null, 8, ["modelValue"])
          ]),
          d("div", va, [
            A[4] || (A[4] = d("label", null, "Normalize:", -1)),
            $(p(Be), {
              modelValue: m.value,
              "onUpdate:modelValue": A[1] || (A[1] = (z) => m.value = z),
              binary: !0
            }, null, 8, ["modelValue"])
          ]),
          d("div", ha, [
            d("span", null, "EN " + R(s.enDurationS != null ? s.enDurationS.toFixed(1) : "-") + "s", 1),
            d("span", null, "RU " + R(s.ruDurationS != null ? s.ruDurationS.toFixed(1) : "-") + "s", 1),
            $(p(L), {
              class: "speed-match-btn",
              label: E.value || "Match speed",
              disabled: V.value,
              onClick: _
            }, null, 8, ["label", "disabled"]),
            d("span", null, "Speed: " + R(f.value.toFixed(2)), 1)
          ]),
          d("div", ya, [
            $(p(L), {
              label: "Apply",
              class: "apply-btn",
              onClick: w
            })
          ])
        ])
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}, Ot = 3;
function wt(n) {
  let o = !1;
  n.addEventListener("play", () => {
    if (o || n.readyState >= Ot) return;
    o = !0, n.pause();
    const s = () => {
      n.removeEventListener("canplaythrough", s), o = !1, n.play().catch(() => {
      });
    };
    n.addEventListener("canplaythrough", s);
  });
}
function at(n) {
  return new Promise((o) => {
    if (n.readyState >= Ot) {
      o();
      return;
    }
    const s = () => {
      n.removeEventListener("canplaythrough", s), o();
    };
    n.addEventListener("canplaythrough", s), n.load();
  });
}
let ot = null;
function ma() {
  const n = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return n ? (ot || (ot = new n()), ot) : null;
}
function _a(n, o = 1024) {
  const s = new Float32Array(o), r = Math.tanh(n) || 1;
  for (let c = 0; c < o; c++) {
    const u = c / (o - 1) * 2 - 1;
    s[c] = Math.tanh(u * n) / r;
  }
  return s;
}
function ka(n, o, s) {
  const c = n.createBuffer(1, Math.max(1, Math.floor(n.sampleRate * 2)), n.sampleRate), u = c.getChannelData(0);
  for (let E = 0; E < u.length; E++) u[E] = Math.random() * 2 - 1;
  const m = n.createBufferSource();
  m.buffer = c, m.loop = !0;
  const f = n.createBiquadFilter();
  f.type = "highpass", f.frequency.value = o;
  const T = n.createBiquadFilter();
  return T.type = "lowpass", T.frequency.value = s, m.connect(f), f.connect(T), m.start(), T;
}
function be(n, { lowHz: o, highHz: s, drive: r, noiseLevel: c }) {
  const u = n.createBiquadFilter();
  u.type = "highpass", u.frequency.value = o;
  const m = n.createBiquadFilter();
  m.type = "lowpass", m.frequency.value = s, u.connect(m);
  let f = m;
  if (r > 0) {
    const V = n.createWaveShaper();
    V.curve = _a(r), V.oversample = "2x", m.connect(V), f = V;
  }
  if (c <= 0) return { input: u, output: f };
  const T = n.createGain();
  T.gain.value = c, ka(n, o, s).connect(T);
  const E = n.createGain();
  return f.connect(E), T.connect(E), { input: u, output: E };
}
const ga = {
  radio: (n) => be(n, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0.05 }),
  phone: (n) => be(n, { lowHz: 300, highHz: 3400, drive: 1.05, noiseLevel: 0 }),
  /*
   Wide passband, no clip, no noise -- a natural muffled quality, not a
   telephony one. See nodes/_audio_effects.py's muffled_effect for the
   same params and the reasoning/reference behind them.
  */
  muffled: (n) => be(n, { lowHz: 120, highHz: 6e3, drive: 0, noiseLevel: 0 }),
  /*
   radio's band and grit with NO static of its own -- for dubbing a game
   that already layers its own channel noise over the line as a separate
   sound, where baking in a second layer would stack the two. See
   nodes/_audio_effects.py's radio_dry_effect for the case behind it.
  */
  radio_dry: (n) => be(n, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0 }),
  /*
   Hard-wired intercom/PA panel -- between phone and radio at both ends,
   more grit than phone, no static.
  */
  intercom: (n) => be(n, { lowHz: 250, highHz: 4e3, drive: 1.2, noiseLevel: 0 }),
  /*
   Inside a sealed helmet -- low end largely kept, only the top rolled
   off, drive below 1.0 so the clip stays in its near-identity region.
  */
  suit: (n) => be(n, { lowHz: 150, highHz: 5e3, drive: 0.6, noiseLevel: 0 })
};
function Sa(n) {
  const o = { setEffect() {
  } }, s = ma();
  if (!s) return o;
  let r;
  try {
    r = s.createMediaElementSource(n);
  } catch {
    return o;
  }
  const c = s.createGain();
  c.gain.value = n.paused ? 0 : 1, c.connect(s.destination);
  function u() {
    c.gain.value = n.paused ? 0 : 1;
  }
  n.addEventListener("play", u), n.addEventListener("pause", u), n.addEventListener("ended", u);
  const m = s.createGain();
  r.connect(m), m.connect(c);
  const f = {};
  function T(_) {
    if (f[_]) return f[_];
    const w = ga[_];
    if (!w) return null;
    const k = w(s);
    r.connect(k.input);
    const A = s.createGain();
    return A.gain.value = 0, k.output.connect(A), A.connect(c), f[_] = A, A;
  }
  let E = "";
  function V(_) {
    const w = _ || "";
    if (w === E) return;
    if (E && f[E] && (f[E].gain.value = 0), E = "", !w) {
      m.gain.value = 1;
      return;
    }
    const k = T(w);
    if (!k) {
      m.gain.value = 1;
      return;
    }
    E = w, m.gain.value = 0, k.gain.value = 1, s.state === "suspended" && s.resume().catch(() => {
    });
  }
  return { setEffect: V };
}
let st = null;
function $a() {
  const n = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return n ? (st || (st = new n()), st) : null;
}
async function Ca(n, o = 100) {
  const s = $a();
  if (!s) throw new Error("Web Audio not supported -- can't decode a waveform");
  const r = await fetch(n);
  if (!r.ok) throw new Error(`couldn't fetch ${n}: ${r.status}`);
  const c = await r.arrayBuffer(), m = (await s.decodeAudioData(c)).getChannelData(0), f = Math.max(1, Math.floor(m.length / o)), T = new Float32Array(o);
  for (let E = 0; E < o; E++) {
    const V = E * f, _ = Math.min(m.length, V + f);
    let w = 0;
    for (let k = V; k < _; k++) {
      const A = Math.abs(m[k]);
      A > w && (w = A);
    }
    T[E] = w;
  }
  return T;
}
const xa = { class: "waveform-wrap" }, Ra = {
  key: 0,
  class: "waveform-status"
}, Pa = {
  key: 1,
  class: "waveform-status",
  title: "Couldn't load a waveform for this file"
}, wa = {
  __name: "WaveformCanvas",
  props: {
    src: { type: String, default: "" }
  },
  setup(n) {
    const o = n, s = S(null), r = S(!1), c = S(!1);
    function u(f, T) {
      if (typeof f.getContext != "function") return;
      const E = window.devicePixelRatio || 1, V = f.clientWidth || 200, _ = f.clientHeight || 28;
      f.width = Math.max(1, Math.round(V * E)), f.height = Math.max(1, Math.round(_ * E));
      const w = f.getContext("2d");
      if (!w) return;
      w.setTransform(E, 0, 0, E, 0, 0), w.clearRect(0, 0, V, _);
      const k = V / T.length, A = _ / 2;
      w.fillStyle = getComputedStyle(f).color || "#4caf50";
      for (let z = 0; z < T.length; z++) {
        const j = Math.max(1, T[z] * _);
        w.fillRect(z * k, A - j / 2, Math.max(1, k - 1), j);
      }
    }
    async function m() {
      if (!(!o.src || !s.value)) {
        r.value = !0, c.value = !1;
        try {
          const f = s.value.clientWidth || 200, T = await Ca(o.src, Math.max(20, Math.round(f / 3)));
          s.value && u(s.value, T);
        } catch {
          c.value = !0;
        } finally {
          r.value = !1;
        }
      }
    }
    return Me(m), Q(() => o.src, m), (f, T) => (b(), x("div", xa, [
      d("canvas", {
        ref_key: "canvasEl",
        ref: s,
        class: "waveform-canvas"
      }, null, 512),
      r.value ? (b(), x("span", Ra, "…")) : c.value ? (b(), x("span", Pa, "⚠")) : D("", !0)
    ]));
  }
}, Et = /* @__PURE__ */ Ee(wa, [["__scopeId", "data-v-413ffbd4"]]), Ea = { class: "fl-vo-dub-line-editor-content" }, Ta = { class: "vo-dub-filters" }, Aa = { class: "vo-dub-editor-status" }, Ia = { class: "actions-row" }, Va = {
  class: "vo-dub-original-default-label",
  title: "Project-wide default for the per-row 'Use original as sample' checkbox below each line -- a row that has ticked/unticked its OWN checkbox always keeps that explicit choice regardless of this default."
}, Da = { class: "vo-dub-pager" }, La = { class: "vo-dub-pager-label" }, Oa = { class: "vo-dub-row-head" }, za = { class: "vo-dub-key" }, ja = {
  key: 0,
  class: "vo-dub-unsupported-note"
}, Ua = { class: "vo-dub-players" }, Fa = { class: "vo-dub-players-labels" }, Na = { class: "vo-dub-duration-en-tag" }, Ba = { class: "vo-dub-players-row" }, Ma = { class: "vo-dub-player" }, qa = ["src", "onPause", "onEnded"], Ha = { class: "vo-dub-player" }, Wa = ["src", "onLoadedmetadata", "onPause", "onEnded"], Ja = {
  key: 2,
  class: "vo-dub-no-take"
}, Ga = { class: "vo-dub-players-footer" }, Ka = {
  class: "vo-dub-identifier",
  title: "Identifier extracted from the game's own resources (vo_dataset.csv's speaker column) -- not necessarily a real role, just the raw signal this row's audio_key carried"
}, Ya = {
  class: "vo-dub-use-original-label",
  title: "Use this row's own EN reference take (audio_en\\) as the TTS voice-cloning sample for its NEXT render, instead of the Role above -- unticked follows the project-wide default checkbox in the toolbar unless this row's own box has been explicitly touched. Whether an instruct style can still apply together with this depends on your ComfyUI graph/model -- this addon just passes the resolved reference_audio_path through, it doesn't wire it to a specific node."
}, Xa = { class: "vo-dub-english" }, Za = {
  key: 0,
  class: "vo-dub-empty"
}, Tt = 600, it = 50, Qa = 0.15, eo = 0.4, to = {
  __name: "VoDubLineEditorContent",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    // {renderRow({audioKey, speaker, instruct, russianText, effect, outputPath, dryOutputPath, referenceAudioPath}) => Promise}
    onClose: { type: Function, required: !0 }
  },
  setup(n) {
    const o = n, { setWidth: s, presets: r } = It({
      storageKey: "FL_CosyVoice3.VODubLineEditor.widthPx",
      defaultWidth: 1100,
      presets: [800, 1100, 1500]
    }), { fontSizePx: c, decrease: u, increase: m } = Vt({
      storageKey: "FL_CosyVoice3.VODubLineEditor.fontSizePx",
      defaultSize: 13
    }), { autoGrow: f, setTextareaRef: T, regrowAll: E } = In();
    Q(c, E);
    const V = S(!1), _ = S(null);
    function w(e) {
      _.value = e, V.value = !0;
    }
    function k(e) {
      const t = _.value;
      if (!t) return;
      const i = y(t);
      i.effect = e.effect, i.normalize = e.normalize, i.speed = e.speed, K(t), B(t) && dn(t);
    }
    const A = S(!0);
    function z() {
      closed || (closed = !0, O && (clearTimeout(O), Ge()), o.onClose());
    }
    Q(A, (e) => {
      e || z();
    });
    const j = S([]), U = M({}), N = S(""), J = S(""), P = S(""), G = S(!1), Te = {
      "": "All statuses",
      no_text: "No source text",
      needs_translation: "Needs translation",
      not_started: "Not started",
      stale: "Stale",
      done: "Done",
      unsupported: "Unsupported (multi-channel)"
    }, Ae = Object.entries(Te).map(([e, t]) => ({ value: e, label: t })), ee = M({}), le = S(!1), re = S(null), ue = S([]), te = S(null), ke = M({});
    async function qe() {
      try {
        const t = await (await fetch(`${X}/line_history/counts?root=${encodeURIComponent(o.root)}`)).json();
        t && !t.error && Object.assign(ke, t);
      } catch (e) {
        console.error("[FL history] couldn't load version counts", e);
      }
    }
    async function ge(e) {
      re.value = e;
      try {
        const i = await (await fetch(`${X}/line_history?root=${encodeURIComponent(o.root)}&audio_key=${encodeURIComponent(e.audio_key)}`)).json();
        ue.value = i.versions || [], te.value = i.chosen_version ?? null;
      } catch (t) {
        console.error("[FL history] couldn't load line history", t), ue.value = [], te.value = null;
      }
      le.value = !0;
    }
    async function Ie(e) {
      const t = re.value;
      if (t)
        try {
          await fetch(`${X}/line_history/choose`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ root: o.root, audio_key: t.audio_key, version: e })
          }), P.value = `Switched ${t.audio_key} to version ${e}`;
        } catch (i) {
          P.value = `Couldn't switch version: ${i.message || i}`;
        }
    }
    function Ve(e) {
      const t = ee[e.audio_key];
      return t !== void 0 ? t : y(e).effect || "";
    }
    function He(e) {
      ee[e.audio_key] !== void 0 && (y(e).effect = ee[e.audio_key], delete ee[e.audio_key]);
    }
    function ne(e) {
      const t = y(e).use_original_sample;
      return t === void 0 ? v.value : !!t;
    }
    function We(e, t) {
      y(e).use_original_sample = t, K(e);
    }
    function Je() {
      de();
    }
    function g() {
      return _e(o.root, "_dub_state.json");
    }
    const v = S(!1);
    async function I() {
      const t = await (await fetch(`${oe}/read?path=${encodeURIComponent(g())}`)).json();
      let i = { rows: {} };
      if (t.exists)
        try {
          const l = JSON.parse(t.content);
          l && typeof l.rows == "object" && (i = l);
        } catch (l) {
          console.warn("[FL CosyVoice3 VODubEditor] _dub_state.json is not valid JSON:", l);
        }
      Object.keys(U).forEach((l) => delete U[l]), Object.assign(U, i.rows), v.value = !!i.use_original_default;
    }
    async function h() {
      G.value = !0;
      try {
        const t = await (await fetch(`${X}/rows?path=${encodeURIComponent(o.root)}&bucket=${encodeURIComponent(o.bucket)}`)).json();
        if (t.error) {
          P.value = t.error, j.value = [];
          return;
        }
        j.value = t.rows || [];
        for (const i of j.value) {
          const l = U[i.audio_key] || (U[i.audio_key] = {});
          l.russian_text || (l.russian_text = i.russian || ""), l.instruct === void 0 && (l.instruct = i.instruct || ""), l.speaker_override === void 0 && (l.speaker_override = ""), l.effect === void 0 && (l.effect = "");
        }
        P.value = `${j.value.length} row(s) in ${o.bucket}`;
      } catch (e) {
        P.value = `Couldn't load: ${e}`;
      } finally {
        G.value = !1;
      }
    }
    function y(e) {
      return U[e.audio_key] || (U[e.audio_key] = {});
    }
    let O = null;
    function de() {
      clearTimeout(O), O = setTimeout(Ge, Tt);
    }
    async function Ge() {
      try {
        await fetch(`${oe}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: g(),
            content: JSON.stringify({ rows: U, use_original_default: v.value }, null, 2)
          })
        }), P.value = "Saved", h();
      } catch (e) {
        P.value = `Save failed: ${e}`;
      }
    }
    function K(e) {
      y(e), de();
    }
    function zt(e) {
      P.value = e;
    }
    const Se = ie(() => {
      const e = J.value.trim().toLowerCase();
      return j.value.filter((t) => {
        if (N.value && t.status !== N.value) return !1;
        if (!e) return !0;
        const i = U[t.audio_key];
        return `${t.audio_key} ${t.speaker_tag} ${t.english} ${i && i.russian_text || t.russian}`.toLowerCase().includes(e);
      });
    }), q = S(0), De = ie(() => Math.max(1, Math.ceil(Se.value.length / it))), vt = ie(() => {
      const e = q.value * it;
      return Se.value.slice(e, e + it);
    });
    Q([N, J], () => {
      q.value = 0;
    }), Q(Se, () => {
      q.value > De.value - 1 && (q.value = Math.max(0, De.value - 1));
    });
    const $e = S([]);
    async function jt() {
      try {
        const t = await (await fetch(`${oe}/read?path=${encodeURIComponent(_e(o.root, "_dub_roles.json"))}`)).json();
        if (!t.exists) {
          $e.value = [];
          return;
        }
        const i = JSON.parse(t.content), l = i && typeof i.roles == "object" && i.roles || {};
        $e.value = Object.entries(l).map(([a, C]) => ({ code: a, ...C }));
      } catch {
        $e.value = [];
      }
    }
    function Ut(e) {
      return [e.character, e.speaker].filter(Boolean).join(" -- ");
    }
    function ce(e) {
      return (y(e).speaker_override || e.speaker_tag || "").trim();
    }
    const { popover: Ke, show: Ft, hide: Nt, info: ht } = Vn(
      $e,
      (e) => [
        ["character", e.character],
        ["gender", e.gender],
        ["actor", e.actor],
        ["description", e.description],
        ["dub direction", e.dub_direction],
        ["notes", Array.isArray(e.notes) ? e.notes.join(" ") : e.notes],
        ["voice", e.speaker]
      ].filter(([, t]) => t != null && t !== "")
    );
    _n("lineRowApi", {
      // общий каталог и UI
      roleEntries: $e,
      roleOptionSubLabel: Ut,
      fontSizePx: c,
      autoGrow: f,
      setTextareaRef: T,
      showRoleInfoPopover: Ft,
      hideRoleInfoPopover: Nt,
      // подписи, специфичные для VO Dub
      speakerPlaceholder: "Role",
      speakerTitle: "Role code (resolves to that role's assigned voice), or a literal preset/preset#tag",
      instructPlaceholder: "Instruct",
      instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
      textPlaceholder: "Russian text for this line",
      // доступ к полям row
      getSpeaker: (e) => y(e).speaker_override || e.speaker_tag,
      setSpeaker: (e, t) => {
        y(e).speaker_override = t, K(e);
      },
      getInstruct: (e) => y(e).instruct,
      setInstruct: (e, t) => {
        y(e).instruct = t, K(e), mt(e);
      },
      getText: (e) => y(e).russian_text,
      setText: (e, t) => {
        y(e).russian_text = t, K(e);
      },
      getRoleInfoCode: (e) => ce(e),
      textKey: (e) => e.audio_key,
      // instruct-действия
      canUndoInstruct: (e) => ae[e.audio_key] !== void 0,
      undoInstructTitle: (e) => Wt(e),
      undoInstruct: (e) => Jt(e),
      canApplyInstruct: (e) => Xe(e) > 0,
      applyInstructTitle: (e) => Gt(e),
      applyInstructToSameRole: (e) => Kt(e),
      instructNoteFor: (e) => Ht(e),
      openInstructPicker: (e) => Mt(e)
    });
    const pe = S([]);
    function yt() {
      return _e(o.root, "_instruct_categories.json");
    }
    async function Bt() {
      try {
        const t = await (await fetch(`${oe}/read?path=${encodeURIComponent(yt())}`)).json();
        if (!t.exists) {
          pe.value = [];
          return;
        }
        const i = JSON.parse(t.content);
        pe.value = i && i.categories || [];
      } catch {
        pe.value = [];
      }
    }
    const bt = /* @__PURE__ */ new Map();
    function mt(e) {
      clearTimeout(bt.get(e.audio_key)), bt.set(e.audio_key, setTimeout(async () => {
        const t = y(e).instruct, i = await Ln(oe, yt(), t);
        i && (pe.value = i);
      }, Tt));
    }
    const Ye = S(!1), _t = S(null);
    function Mt(e) {
      _t.value = e, Ye.value = !0;
    }
    const ae = M({});
    function qt(e) {
      const t = _t.value;
      t && (ae[t.audio_key] = y(t).instruct, y(t).instruct = e, K(t), mt(t));
    }
    function Ht(e) {
      const t = (y(e).instruct || "").trim(), i = pe.value.find((l) => (l.examples || []).some((a) => a.trim() === t));
      return i ? i.title : null;
    }
    function Wt(e) {
      return ae[e.audio_key] !== void 0 ? `Restore previous instruct: "${ae[e.audio_key]}"` : "No previous instruct to restore";
    }
    function Jt(e) {
      if (ae[e.audio_key] === void 0) return;
      const t = y(e).instruct;
      y(e).instruct = ae[e.audio_key], ae[e.audio_key] = t, K(e);
    }
    function Xe(e) {
      const t = ce(e);
      return t ? j.value.filter((i) => i !== e && i.status !== "unsupported" && ce(i) === t).length : 0;
    }
    function Gt(e) {
      const t = Xe(e);
      return t > 0 ? `Apply this instruct to every other "${ce(e)}" row in this bucket (${t})` : "No other rows in this bucket use this role";
    }
    function Kt(e) {
      const t = Xe(e);
      if (!t) return;
      const i = ce(e), l = y(e).instruct;
      j.value.forEach((a) => {
        a !== e && a.status !== "unsupported" && ce(a) === i && (y(a).instruct = l);
      }), de(), P.value = `Applied instruct to ${t} other "${i}" row(s) in this bucket`;
    }
    function Ze(e) {
      const t = (e.speaker_tag || "").trim();
      return t ? j.value.filter((i) => i !== e && i.status !== "unsupported" && (i.speaker_tag || "").trim() === t).length : 0;
    }
    function Yt(e) {
      const t = Ze(e);
      return t > 0 ? `Apply this Role to every other "${e.speaker_tag}" row in this bucket (${t})` : "No other rows in this bucket share this Identifier";
    }
    function Xt(e) {
      const t = Ze(e);
      if (!t) return;
      const i = (e.speaker_tag || "").trim(), l = y(e).speaker_override || e.speaker_tag;
      j.value.forEach((a) => {
        a !== e && a.status !== "unsupported" && (a.speaker_tag || "").trim() === i && (y(a).speaker_override = l);
      }), de(), P.value = `Applied Role to ${t} other "${i}" row(s) in this bucket`;
    }
    function Le(e, t) {
      return _e(_e(o.root, e), `${t}.wav`);
    }
    function Ce(e, t, i) {
      const l = `${mn}/audio?path=${encodeURIComponent(Le(e, t))}`;
      return i ? `${l}&v=${i}` : l;
    }
    function Zt(e) {
      return Le("audio_ru", e.audio_key);
    }
    function Qt(e) {
      return Le("_dub_dry", e.audio_key);
    }
    function en(e, t = 8e3) {
      return new Promise((i) => {
        const l = new Audio();
        let a = !1;
        const C = (nt) => {
          a || (a = !0, l.removeEventListener("loadedmetadata", F), l.removeEventListener("error", we), i(nt));
        }, F = () => C(l.duration || null), we = () => C(null);
        l.addEventListener("loadedmetadata", F), l.addEventListener("error", we), setTimeout(() => C(null), t), l.preload = "metadata", l.src = e;
      });
    }
    function B(e) {
      return e.status === "done" || e.status === "stale" || St.has(e.audio_key);
    }
    function Oe(e) {
      return !!y(e).manually_done;
    }
    function tn(e) {
      y(e).manually_done = !Oe(e), K(e);
    }
    const ze = M({});
    function nn(e, t) {
      ze[e.audio_key] = t.target.duration;
    }
    const je = /* @__PURE__ */ new Map(), fe = /* @__PURE__ */ new Map();
    function an(e, t) {
      if (!t) {
        je.delete(e);
        return;
      }
      je.set(e, t), wt(t);
    }
    const kt = /* @__PURE__ */ new Map();
    function on(e, t) {
      const i = e.audio_key;
      if (!t) {
        fe.delete(i), kt.delete(i);
        return;
      }
      fe.set(i, t), wt(t);
      const l = Sa(t);
      kt.set(i, l), l.setEffect(Ve(e));
    }
    const ve = M(/* @__PURE__ */ new Set()), xe = M(/* @__PURE__ */ new Set());
    function Ue(e, t) {
      if (ve.delete(e.audio_key), t === "ru" && H.value === e.audio_key) {
        const i = fe.get(e.audio_key);
        i && !i.ended && Qe();
      }
    }
    async function sn(e) {
      const t = je.get(e.audio_key), i = fe.get(e.audio_key);
      if (!(!t || !i)) {
        if (ve.has(e.audio_key) || xe.has(e.audio_key)) {
          xe.delete(e.audio_key), ve.delete(e.audio_key), t.pause(), i.pause();
          return;
        }
        t.pause(), i.pause(), t.currentTime = 0, i.currentTime = 0, xe.add(e.audio_key), await Promise.all([at(t), at(i)]), xe.delete(e.audio_key), je.has(e.audio_key) && (t.currentTime = 0, i.currentTime = 0, ve.add(e.audio_key), t.play().catch(() => {
        }), i.play().catch(() => {
        }));
      }
    }
    const H = S(null);
    let he = null;
    function Qe() {
      var t;
      he && (he.el.removeEventListener("ended", he.fn), he = null);
      const e = H.value;
      H.value = null, e && ((t = fe.get(e)) == null || t.pause());
    }
    async function gt(e) {
      var F;
      Qe();
      const t = vt.value;
      let i = e;
      for (; i < t.length && !B(t[i]); ) i++;
      if (i >= t.length) return;
      const l = t[i], a = fe.get(l.audio_key);
      if (!a || (H.value = l.audio_key, (F = et.get(l.audio_key)) == null || F.scrollIntoView({ behavior: "smooth", block: "nearest" }), await at(a), H.value !== l.audio_key)) return;
      const C = () => {
        a.removeEventListener("ended", C), he = null, gt(i + 1);
      };
      he = { el: a, fn: C }, a.addEventListener("ended", C), a.currentTime = 0, a.play().catch(() => {
      });
    }
    function ln() {
      H.value ? Qe() : gt(0);
    }
    const et = /* @__PURE__ */ new Map();
    function rn(e, t) {
      if (!t) {
        et.delete(e);
        return;
      }
      et.set(e, t);
    }
    const St = M(/* @__PURE__ */ new Set()), tt = M({}), Re = M(/* @__PURE__ */ new Set());
    async function $t(e, t) {
      const i = Date.now(), l = await en(Ce("audio_ru", e.audio_key, i));
      await fetch(`${X}/mark_rendered`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          root: o.root,
          audio_key: e.audio_key,
          hash: t,
          duration_s: l
        })
      }), l !== null && (ze[e.audio_key] = l), St.add(e.audio_key), tt[e.audio_key] = i;
    }
    async function Ct(e) {
      const t = y(e), i = e.speaker, l = t.instruct || "", a = t.russian_text || "", C = t.effect || "";
      let F = l;
      return C && (F += `\0effect=${C}`), ne(e) && (F += "\0sample=original"), Dn(i, F, a);
    }
    async function xt(e) {
      if (!(!o.renderApi || Re.has(e.audio_key))) {
        if (!o.root) {
          P.value = "Project root is not set. Please set it in the project root input above.";
          return;
        }
        Re.add(e.audio_key), P.value = `Rendering ${e.audio_key}...`;
        try {
          He(e), clearTimeout(O), await Ge();
          const t = y(e), i = e.speaker, l = t.instruct || "", a = t.russian_text || "", C = t.effect || "", F = ne(e) ? Le("audio_en", e.audio_key) : "", we = await Ct(e), nt = Zt(e), pn = Qt(e);
          await o.renderApi.renderRow({
            audioKey: e.audio_key,
            speaker: i,
            instruct: l,
            russianText: a,
            effect: C,
            outputPath: nt,
            dryOutputPath: pn,
            referenceAudioPath: F
          }), t.hash = we, await $t(e, we), P.value = `Rendered ${e.audio_key}`, await h();
        } catch (t) {
          P.value = `Render failed for ${e.audio_key}: ${t}`;
        } finally {
          Re.delete(e.audio_key);
        }
      }
    }
    const ye = S(!1);
    async function un() {
      if (!o.renderApi || ye.value) return;
      const e = j.value.filter((i) => i.status === "not_started" || i.status === "stale");
      if (!e.length) {
        P.value = "Nothing needs rendering in this bucket";
        return;
      }
      ye.value = !0;
      let t = 0;
      P.value = `Rendering 0/${e.length}...`;
      try {
        for (const i of e) {
          try {
            await xt(i);
          } catch (l) {
            console.error(`[FL CosyVoice3 VODubEditor] render-all-pending failed for ${i.audio_key}`, l);
          }
          t++, P.value = `Rendering ${t}/${e.length}...`;
        }
      } finally {
        ye.value = !1;
      }
    }
    async function dn(e) {
      P.value = `Applying effect to ${e.audio_key}...`;
      try {
        const i = await (await fetch(`${X}/apply_effect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: o.root, audio_key: e.audio_key, effect: y(e).effect || "" })
        })).json();
        if (i.error) {
          P.value = `Couldn't apply effect to ${e.audio_key}: ${i.error}`;
          return;
        }
        const l = await Ct(e);
        y(e).hash = l, await $t(e, l), P.value = `Applied effect to ${e.audio_key}`, await h();
      } catch (t) {
        P.value = `Couldn't apply effect to ${e.audio_key}: ${t}`;
      }
    }
    function cn(e) {
      return e.duration_s ? `EN ${e.duration_s.toFixed(1)}s` : "EN";
    }
    function Pe(e) {
      const t = ze[e.audio_key] ?? e.rendered_duration_s, i = e.duration_s;
      if (!B(e) || t === void 0 || t === null || !i) return null;
      const l = (t - i) / i, a = Math.round(l * 100), C = Math.abs(l);
      return {
        level: C <= Qa ? "good" : C <= eo ? "warn" : "bad",
        ruSeconds: `${t.toFixed(1)}s`,
        pctText: `${a >= 0 ? "+" : ""}${a}%`
      };
    }
    return Me(async () => {
      jt(), Bt(), qe(), await I(), await h();
    }), (e, t) => {
      var i, l;
      return b(), x(Z, null, [
        d("div", Ea, [
          $(Dt, {
            title: `VO Dub — ${n.bucket}`,
            "width-presets": p(r),
            "set-width": p(s),
            "font-size-decrease": p(u),
            "font-size-increase": p(m)
          }, null, 8, ["title", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
          $(Pn, { class: "vo-dub-editor-controls" }, {
            default: W(() => [
              d("div", Ta, [
                $(p(pt), {
                  modelValue: J.value,
                  "onUpdate:modelValue": t[0] || (t[0] = (a) => J.value = a),
                  placeholder: "Search text or audio_key...",
                  class: "vo-dub-search"
                }, null, 8, ["modelValue"]),
                $(p(Lt), {
                  modelValue: N.value,
                  "onUpdate:modelValue": t[1] || (t[1] = (a) => N.value = a),
                  options: p(Ae),
                  "option-label": "label",
                  "option-value": "value",
                  class: "vo-dub-status-filter"
                }, null, 8, ["modelValue", "options"]),
                $(p(L), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-scan this bucket",
                  onClick: h
                }),
                d("span", Aa, R(G.value ? "Loading..." : P.value), 1),
                $(p(L), {
                  icon: "pi pi-times",
                  text: "",
                  size: "small",
                  title: "Close",
                  onClick: t[2] || (t[2] = (a) => A.value = !1)
                })
              ]),
              d("div", Ia, [
                $(p(L), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a row's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: t[3] || (t[3] = bn((a) => p(Rn)(zt), ["prevent"]))
                }),
                t[11] || (t[11] = d("span", { class: "actions-divider" }, null, -1)),
                $(p(L), {
                  label: H.value ? "Stop" : "▶ Play in order",
                  text: "",
                  size: "small",
                  icon: H.value ? "pi pi-stop-circle" : "pi pi-play",
                  title: "Play through this page's RU takes in order, auto-advancing to the next row with a take when each one ends -- mirrors LineEditorApp.vue's own sequential playback. Pausing a row via its own native controls stops the run instead of continuing past it.",
                  onClick: ln
                }, null, 8, ["label", "icon"]),
                $(p(L), {
                  label: ye.value ? "Rendering..." : "🔁 Render pending",
                  text: "",
                  size: "small",
                  icon: ye.value ? "pi pi-spin pi-spinner" : "pi pi-play",
                  disabled: !o.renderApi || ye.value,
                  title: "Render every not-started or stale row in this WHOLE bucket (not just this page), one at a time -- mirrors ScriptLibraryPanel.vue's own '🔁 Re-voice pending' button.",
                  onClick: un
                }, null, 8, ["label", "icon", "disabled"]),
                t[12] || (t[12] = d("span", { class: "actions-divider" }, null, -1)),
                d("label", Va, [
                  $(p(Be), {
                    modelValue: v.value,
                    "onUpdate:modelValue": t[4] || (t[4] = (a) => v.value = a),
                    binary: "",
                    onChange: Je
                  }, null, 8, ["modelValue"]),
                  t[10] || (t[10] = me(" Use original as sample by default ", -1))
                ])
              ]),
              d("div", Da, [
                $(p(L), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: q.value === 0,
                  title: "Previous page",
                  onClick: t[5] || (t[5] = (a) => q.value--)
                }, null, 8, ["disabled"]),
                d("span", La, "Page " + R(q.value + 1) + " / " + R(De.value) + " (" + R(Se.value.length) + " row(s))", 1),
                $(p(L), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: q.value >= De.value - 1,
                  title: "Next page",
                  onClick: t[6] || (t[6] = (a) => q.value++)
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          d("div", {
            class: "vo-dub-rows",
            style: lt({ fontSize: `${p(c)}px` })
          }, [
            (b(!0), x(Z, null, Ne(vt.value, (a) => (b(), x("div", {
              key: a.audio_key,
              class: Y(["vo-dub-row", { "row-playing": H.value === a.audio_key }]),
              ref_for: !0,
              ref: (C) => rn(a.audio_key, C)
            }, [
              d("div", Oa, [
                d("span", za, R(a.audio_key), 1),
                d("span", {
                  class: Y(["vo-dub-status-pill", `status-${a.status}`])
                }, R(Te[a.status]), 3),
                B(a) ? (b(), se(p(L), {
                  key: 0,
                  class: Y(["vo-dub-done-btn", { active: Oe(a) }]),
                  text: "",
                  size: "small",
                  icon: Oe(a) ? "pi pi-check-circle" : "pi pi-circle",
                  label: Oe(a) ? "Done" : "Mark done",
                  title: "Manually treat this row as done even if its content has drifted since the last render -- sticky until you click it again to unmark it. Doesn't touch the file or the render hash, only how this row's status reads.",
                  onClick: (C) => tn(a)
                }, null, 8, ["class", "icon", "label", "onClick"])) : D("", !0)
              ]),
              a.status === "unsupported" ? (b(), x("div", ja, [
                me(" Unsupported: " + R(a.channels) + "-channel audio split across multiple files (", 1),
                t[13] || (t[13] = d("code", null, ".a", -1)),
                t[14] || (t[14] = me("-", -1)),
                t[15] || (t[15] = d("code", null, ".d", -1)),
                t[16] || (t[16] = me(") -- this editor can only play or render a single mono/stereo file per row. Handle this one outside the tool. ", -1))
              ])) : (b(), x(Z, { key: 1 }, [
                d("div", Ua, [
                  d("div", Fa, [
                    d("span", Na, R(cn(a)), 1),
                    Pe(a) ? (b(), x(Z, { key: 0 }, [
                      t[17] || (t[17] = d("span", { class: "vo-dub-duration-vs" }, "vs", -1)),
                      d("span", {
                        class: Y(["vo-dub-duration-tag", `badge-${Pe(a).level}`])
                      }, R(Pe(a).ruSeconds) + " RU", 3),
                      d("span", {
                        class: Y(["vo-dub-duration-delta", `badge-${Pe(a).level}`])
                      }, R(Pe(a).pctText), 3)
                    ], 64)) : D("", !0)
                  ]),
                  d("div", Ba, [
                    d("div", Ma, [
                      $(Et, {
                        src: Ce("audio_en", a.audio_key),
                        class: "vo-dub-waveform"
                      }, null, 8, ["src"]),
                      d("audio", {
                        controls: "",
                        preload: "none",
                        src: Ce("audio_en", a.audio_key),
                        ref_for: !0,
                        ref: (C) => an(a.audio_key, C),
                        onPause: (C) => Ue(a, "en"),
                        onEnded: (C) => Ue(a, "en")
                      }, null, 40, qa)
                    ]),
                    $(p(L), {
                      class: Y(["play-both-btn", { playing: ve.has(a.audio_key) }]),
                      size: "small",
                      label: "Play both",
                      icon: xe.has(a.audio_key) ? "pi pi-spin pi-spinner" : ve.has(a.audio_key) ? "pi pi-pause" : "pi pi-play",
                      disabled: !B(a),
                      title: B(a) ? "Play EN and RU together, from the start" : "No RU take yet -- nothing to compare",
                      onClick: (C) => sn(a)
                    }, null, 8, ["class", "icon", "disabled", "title", "onClick"]),
                    d("div", Ha, [
                      B(a) ? (b(), se(Et, {
                        key: 0,
                        src: Ce("audio_ru", a.audio_key, tt[a.audio_key]),
                        class: "vo-dub-waveform"
                      }, null, 8, ["src"])) : D("", !0),
                      B(a) ? (b(), x("audio", {
                        key: 1,
                        controls: "",
                        preload: "none",
                        crossorigin: "anonymous",
                        src: Ce("audio_ru", a.audio_key, tt[a.audio_key]),
                        ref_for: !0,
                        ref: (C) => on(a, C),
                        onLoadedmetadata: (C) => nn(a, C),
                        onPause: (C) => Ue(a, "ru"),
                        onEnded: (C) => Ue(a, "ru")
                      }, null, 40, Wa)) : (b(), x("span", Ja, "not rendered yet"))
                    ])
                  ]),
                  d("div", Ga, [
                    o.renderApi ? (b(), se(p(L), {
                      key: 0,
                      class: Y(["vo-dub-render-btn", { stale: a.status === "stale" }]),
                      size: "small",
                      label: B(a) ? "Re-render" : "Render",
                      icon: Re.has(a.audio_key) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                      disabled: Re.has(a.audio_key),
                      title: B(a) ? "Re-render this row and write it to audio_ru\\" : "Render this row and write it to audio_ru\\",
                      onClick: (C) => xt(a)
                    }, null, 8, ["class", "label", "icon", "disabled", "title", "onClick"])) : D("", !0),
                    $(p(L), {
                      icon: "pi pi-history",
                      size: "small",
                      text: "",
                      label: ke[a.audio_key] ? String(ke[a.audio_key]) : "",
                      title: "Line history (previous takes/versions)",
                      onClick: (C) => ge(a)
                    }, null, 8, ["label", "onClick"]),
                    $(p(L), {
                      icon: "pi pi-cog",
                      size: "small",
                      title: "Edit output settings",
                      onClick: (C) => w(a),
                      class: "output-settings-btn"
                    }, null, 8, ["onClick"])
                  ])
                ]),
                $(wn, { row: a }, {
                  leading: W(() => [
                    d("span", Ka, R(a.speaker_tag || "—"), 1),
                    $(p(L), {
                      icon: "pi pi-copy",
                      size: "small",
                      class: "apply-role-btn",
                      disabled: Ze(a) === 0,
                      title: Yt(a),
                      onClick: (C) => Xt(a)
                    }, null, 8, ["disabled", "title", "onClick"]),
                    d("label", Ya, [
                      $(p(Be), {
                        "model-value": ne(a),
                        binary: "",
                        "onUpdate:modelValue": (C) => We(a, C)
                      }, null, 8, ["model-value", "onUpdate:modelValue"]),
                      t[18] || (t[18] = me(" 🎙️ Original as sample ", -1))
                    ])
                  ]),
                  "above-text": W(() => [
                    d("div", Xa, R(a.english), 1)
                  ]),
                  _: 2
                }, 1032, ["row"])
              ], 64))
            ], 2))), 128)),
            Se.value.length ? D("", !0) : (b(), x("div", Za, "No rows match this filter."))
          ], 4)
        ]),
        $(En, {
          visible: Ye.value,
          "onUpdate:visible": t[7] || (t[7] = (a) => Ye.value = a),
          categories: pe.value,
          onSelect: qt
        }, null, 8, ["visible", "categories"]),
        $(Tn, {
          visible: le.value,
          "onUpdate:visible": t[8] || (t[8] = (a) => le.value = a),
          versions: ue.value,
          "chosen-version": te.value,
          original: ((i = re.value) == null ? void 0 : i.english) || "",
          onSelect: Ie
        }, null, 8, ["visible", "versions", "chosen-version", "original"]),
        $(An, {
          visible: p(Ke).visible,
          left: p(Ke).left,
          top: p(Ke).top,
          message: p(ht).message,
          fields: p(ht).fields
        }, null, 8, ["visible", "left", "top", "message", "fields"]),
        $(ba, {
          visible: V.value,
          "onUpdate:visible": t[9] || (t[9] = (a) => V.value = a),
          audioKey: (l = _.value) == null ? void 0 : l.audio_key,
          effect: _.value ? Ve(_.value) : "",
          normalize: _.value ? y(_.value).normalize : !1,
          speed: _.value ? y(_.value).speed : 1,
          enDurationS: _.value ? _.value.duration_s : null,
          ruDurationS: _.value ? ze[_.value.audio_key] ?? _.value.rendered_duration_s : null,
          onApply: k
        }, null, 8, ["visible", "audioKey", "effect", "normalize", "speed", "enDurationS", "ruDurationS"])
      ], 64);
    };
  }
}, no = /* @__PURE__ */ Ee(to, [["__scopeId", "data-v-c18ec516"]]), ao = {
  __name: "VoDubLineEditor",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(n) {
    const o = n, s = S(!0);
    return Q(s, (r) => {
      r || o.onClose();
    }), (r, c) => (b(), se(p(ft), {
      visible: s.value,
      "onUpdate:visible": c[0] || (c[0] = (u) => s.value = u),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: { width: "1600px" },
      class: "vo-dub-editor-dialog"
    }, {
      default: W(() => [
        $(no, kn(gn(r.$props)), null, 16)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}, oo = /* @__PURE__ */ Ee(ao, [["__scopeId", "data-v-47ef3de4"]]), so = { class: "role-head" }, io = { class: "role-name" }, lo = {
  class: "role-code",
  title: "Role code -- read-only here, this addon doesn't own this file's identity model"
}, ro = ["title"], uo = {
  key: 1,
  class: "role-actor"
}, co = {
  key: 0,
  class: "role-description"
}, po = {
  key: 1,
  class: "role-dub-direction"
}, fo = {
  key: 2,
  class: "role-notes"
}, vo = { class: "role-stats" }, ho = { key: 0 }, yo = { key: 1 }, bo = { key: 2 }, mo = { key: 3 }, _o = {
  key: 3,
  class: "role-examples",
  title: "Longest lines for this role -- a quick sample to listen to"
}, ko = { class: "role-speaker-row" }, go = 600, So = 3e3, $o = 1500, Co = {
  __name: "DubRolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(n) {
    const o = n, s = _e(o.root, "_dub_roles.json"), r = S(!0), c = S({ roles: {} }), u = S([]), m = S(""), f = S(""), T = S(!1), { cssWidth: E, setWidth: V, presets: _ } = It({
      storageKey: "FL_CosyVoice3.DubRolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: w, decrease: k, increase: A } = Vt({
      storageKey: "FL_CosyVoice3.DubRolesEditor.fontSizePx",
      defaultSize: 13
    });
    let z = null, j = 0, U = null, N = null;
    const J = /* @__PURE__ */ new Map();
    function P(g) {
      f.value = g;
    }
    const G = ie(() => {
      var v;
      const g = ((v = c.value) == null ? void 0 : v.roles) || {};
      return Object.entries(g).sort((I, h) => {
        var y, O;
        return (((y = h[1]) == null ? void 0 : y.lines) || 0) - (((O = I[1]) == null ? void 0 : O.lines) || 0);
      });
    });
    function Te(g, v) {
      return g.character || v;
    }
    function Ae(g) {
      return Array.isArray(g.notes) ? g.notes : [];
    }
    function ee(g) {
      return Array.isArray(g.longest_files) ? g.longest_files : [];
    }
    function le() {
      return JSON.stringify(c.value, null, 2);
    }
    async function re() {
      const g = le();
      if (g !== z)
        try {
          const I = await (await fetch(`${oe}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: s, content: g })
          })).json();
          if (I.error) {
            P(`Save error: ${I.error}`);
            return;
          }
          z = g, P(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (v) {
          P(`Save failed: ${v}`);
        }
    }
    function ue() {
      j = Date.now(), U && clearTimeout(U), U = setTimeout(re, go);
    }
    function te(g, v) {
      J.get(g) !== v.speaker && (J.set(g, v.speaker), $n(o.root, g).then((h) => P(h.message)));
    }
    function ke(g, v) {
      ue(), te(g, v);
    }
    async function qe() {
      try {
        const v = await (await fetch(Sn)).json();
        u.value = v.presets || [], m.value = v.dir || "";
      } catch {
        u.value = [], m.value = "";
      }
    }
    const ge = S(!1), Ie = S(null);
    function Ve(g, v) {
      Ie.value = [g, v], ge.value = !0;
    }
    function He(g) {
      const v = Ie.value;
      if (!v) return;
      const [I, h] = v;
      h.speaker = g, ke(I, h);
    }
    async function ne({ isPoll: g = !1 } = {}) {
      try {
        const I = await (await fetch(`${oe}/read?path=${encodeURIComponent(s)}`)).json();
        if (I.error) {
          P(`Read error: ${I.error}`);
          return;
        }
        if (!I.exists) {
          g || (c.value = { roles: {} }, z = "", P('_dub_roles.json does not exist yet -- click "Seed from dataset" below'));
          return;
        }
        if (g && Date.now() - j < $o || I.content === z) return;
        let h;
        try {
          h = JSON.parse(I.content);
        } catch (O) {
          P(`_dub_roles.json is not valid JSON: ${O}`);
          return;
        }
        const y = h && typeof h.roles == "object" && h.roles || {};
        for (const O of Object.values(y))
          O && typeof O == "object" && O.speaker === void 0 && (O.speaker = "");
        c.value = { ...h, roles: y };
        for (const [O, de] of Object.entries(y))
          J.set(O, de.speaker);
        z = le(), g || P(`Loaded ${G.value.length} role(s)`);
      } catch (v) {
        P(`Read failed: ${v}`);
      }
    }
    async function We() {
      T.value = !0;
      try {
        const v = await (await fetch(`${X}/seed_roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: o.root })
        })).json();
        if (v.error) {
          P(`Seed error: ${v.error}`);
          return;
        }
        await ne(), P(v.added.length ? `Added ${v.added.length} role(s): ${v.added.join(", ")}` : "Nothing new to add");
      } catch (g) {
        P(`Seed failed: ${g}`);
      } finally {
        T.value = !1;
      }
    }
    function Je() {
      U && (clearTimeout(U), re());
      for (const [g, v] of G.value) te(g, v);
      N && clearInterval(N), o.onClose();
    }
    return Q(r, (g) => {
      g || Je();
    }), Me(async () => {
      qe(), await ne(), N = setInterval(() => ne({ isPoll: !0 }), So);
    }), At(() => {
      N && clearInterval(N);
    }), (g, v) => (b(), x(Z, null, [
      $(p(ft), {
        visible: r.value,
        "onUpdate:visible": v[1] || (v[1] = (I) => r.value = I),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: lt({ width: p(E) }),
        class: "roles-dialog"
      }, {
        header: W(() => [
          $(Dt, {
            title: "VO Dub Roles",
            status: f.value,
            "width-presets": p(_),
            "set-width": p(V),
            "font-size-decrease": p(k),
            "font-size-increase": p(A)
          }, {
            after: W(() => [
              $(p(L), {
                label: "Seed from dataset",
                size: "small",
                text: "",
                icon: T.value ? "pi pi-spin pi-spinner" : "pi pi-database",
                disabled: T.value,
                title: "Add every distinct speaker tag from vo_dataset.csv that isn't a role here yet",
                onClick: We
              }, null, 8, ["icon", "disabled"])
            ]),
            _: 1
          }, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: W(() => [
          G.value.length ? D("", !0) : (b(), se(p(xn), {
            key: 0,
            severity: "info",
            closable: !1
          }, {
            default: W(() => [...v[3] || (v[3] = [
              me(' No roles yet -- click "Seed from dataset" above to create one per distinct speaker tag. ', -1)
            ])]),
            _: 1
          })),
          d("div", {
            class: "roles-list",
            style: lt({ fontSize: `${p(w)}px` })
          }, [
            (b(!0), x(Z, null, Ne(G.value, ([I, h]) => (b(), x("div", {
              key: I,
              class: "role-card"
            }, [
              d("div", so, [
                d("span", io, R(Te(h, I)), 1),
                d("span", lo, R(I), 1),
                h.gender ? (b(), x("span", {
                  key: 0,
                  class: "role-gender",
                  title: h.gender_evidence || ""
                }, R(h.gender), 9, ro)) : D("", !0),
                h.actor ? (b(), x("span", uo, R(h.actor), 1)) : D("", !0)
              ]),
              h.description ? (b(), x("p", co, R(h.description), 1)) : D("", !0),
              h.dub_direction ? (b(), x("p", po, R(h.dub_direction), 1)) : D("", !0),
              Ae(h).length ? (b(), x("ul", fo, [
                (b(!0), x(Z, null, Ne(Ae(h), (y, O) => (b(), x("li", { key: O }, R(y), 1))), 128))
              ])) : D("", !0),
              d("div", vo, [
                h.lines !== void 0 ? (b(), x("span", ho, R(h.lines) + " line(s)", 1)) : D("", !0),
                h.audio_minutes !== void 0 ? (b(), x("span", yo, R(h.audio_minutes) + " min", 1)) : D("", !0),
                h.lines_needing_translation ? (b(), x("span", bo, R(h.lines_needing_translation) + " need translation", 1)) : D("", !0),
                h.lines_without_any_text ? (b(), x("span", mo, R(h.lines_without_any_text) + " no text", 1)) : D("", !0)
              ]),
              ee(h).length ? (b(), x("div", _o, " e.g. " + R(ee(h).join(", ")), 1)) : D("", !0),
              d("div", ko, [
                $(p(pt), {
                  modelValue: h.speaker,
                  "onUpdate:modelValue": [
                    (y) => h.speaker = y,
                    v[0] || (v[0] = (y) => ue())
                  ],
                  placeholder: "Speaker preset",
                  title: "Real CosyVoice preset this role resolves to",
                  class: "role-speaker",
                  onBlur: (y) => te(I, h)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "onBlur"]),
                $(p(L), {
                  icon: "pi pi-microphone",
                  size: "small",
                  title: "Pick a speaker from the preset gallery",
                  onClick: (y) => Ve(I, h)
                }, null, 8, ["onClick"])
              ])
            ]))), 128))
          ], 4)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      $(On, {
        visible: ge.value,
        "onUpdate:visible": v[2] || (v[2] = (I) => ge.value = I),
        presets: u.value,
        "sample-dir": m.value,
        onSelect: He
      }, null, 8, ["visible", "presets", "sample-dir"])
    ], 64));
  }
}, xo = /* @__PURE__ */ Ee(Co, [["__scopeId", "data-v-df1a18b9"]]);
function Ao({ node: n, projectRootWidget: o, openBrowseDialog: s, openVoDubLineEditor: r, openDubRolesEditor: c, queueVoDubRender: u }) {
  ut(import.meta.url);
  const m = document.createElement("div");
  m.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const f = dt(Qn, {
    node: n,
    projectRootWidget: o,
    openBrowseDialog: s,
    openVoDubLineEditor: r,
    openDubRolesEditor: c,
    queueVoDubRender: u
  });
  return f.use(ct, { ripple: !0 }), f.mount(m), { element: m, unmount: () => f.unmount() };
}
function Io({ root: n, bucket: o, renderApi: s }) {
  ut(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const c = dt(oo, {
    root: n,
    bucket: o,
    renderApi: s || null,
    onClose: () => {
      c.unmount(), r.remove();
    }
  });
  c.use(ct, { ripple: !0 }), c.mount(r);
}
function Vo({ root: n }) {
  ut(import.meta.url);
  const o = document.createElement("div");
  document.body.appendChild(o);
  const s = dt(xo, {
    root: n,
    onClose: () => {
      s.unmount(), o.remove();
    }
  });
  s.use(ct, { ripple: !0 }), s.mount(o);
}
export {
  Ao as mountVoDubBrowserPanel,
  Vo as openDubRolesEditor,
  Io as openVoDubLineEditor
};
