import { _ as je, r as T, o as ze, H as Rt, i as k, d as v, e as R, u as l, F as Y, j as De, t as g, V as Ee, b as h, s as j, h as w, y as ln, G as rn, U as mt, z as un, D as Oe, C as dn, c as fe, k as K, w as ve, a as J, n as Ue, K as te, m as ce, L as G, N as cn, g as pe, l as Ve, S as pn, I as fn, W as vn, p as ot, q as it, P as lt } from "./styles_link.js";
import { s as rt } from "./inputtext.esm.js";
import { c as hn, u as Et, a as Pt, D as Tt, b as It, s as yn } from "./DialogHeader.js";
import { b as gt } from "./dropdown.esm.js";
import { I as _n, _ as bn, a as kn, i as mn, b as gn, u as Sn, e as $n, f as Cn, l as xn, S as Rn } from "./line_hash.js";
const En = { class: "vo-dub-panel" }, Pn = { class: "vo-dub-toolbar" }, Tn = { class: "vo-dub-buckets" }, In = ["onClick"], An = { class: "vo-dub-bucket-name" }, wn = { class: "vo-dub-bucket-count" }, Ln = { class: "vo-dub-bucket-pills" }, On = {
  key: 0,
  class: "vo-dub-pill pill-no-text"
}, Vn = {
  key: 1,
  class: "vo-dub-pill pill-needs-translation"
}, Dn = {
  key: 2,
  class: "vo-dub-pill pill-not-started"
}, Un = {
  key: 3,
  class: "vo-dub-pill pill-stale"
}, jn = {
  key: 4,
  class: "vo-dub-pill pill-done"
}, zn = {
  key: 5,
  class: "vo-dub-pill pill-unsupported",
  title: "Multi-channel rows this addon can't render or play"
}, Nn = { class: "vo-dub-status" }, Fn = 3e3, St = "FL_CosyVoice3.VODubLibrary.lastRoot", Bn = {
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
  setup(a) {
    const s = a, i = T(s.projectRootWidget.value || localStorage.getItem(St) || ""), r = T([]), f = T(""), u = T(!1);
    let _ = null;
    async function d() {
      if (!i.value) {
        r.value = [];
        return;
      }
      u.value = !0;
      try {
        const m = await (await fetch(`${Ee}/tree?path=${encodeURIComponent(i.value)}`)).json();
        if (m.error) {
          f.value = m.error, r.value = [];
          return;
        }
        r.value = m.buckets || [], f.value = `${r.value.length} bucket(s), ${r.value.reduce((b, I) => b + I.count, 0)} row(s)`;
      } catch ($) {
        f.value = `Couldn't load: ${$}`;
      } finally {
        u.value = !1;
      }
    }
    function P() {
      s.openBrowseDialog({
        mode: "folder",
        startPath: i.value,
        onSelect: ($) => {
          i.value = $, s.projectRootWidget.value = $, localStorage.setItem(St, $), d();
        }
      });
    }
    function E($) {
      s.openVoDubLineEditor({
        root: i.value,
        bucket: $.bucket,
        /*
         Only offered when this panel's node-wiring actually has a render
         mechanism (it always does in practice -- null only ever shows up
         in a test that doesn't pass one) -- see queueVoDubRender's own
         docstring in web/vo_dub_library.js for what it does.
        */
        renderApi: s.queueVoDubRender ? {
          renderRow: (m) => s.queueVoDubRender(s.node, m)
        } : null
      });
    }
    function V() {
      i.value && s.openDubRolesEditor({ root: i.value });
    }
    return ze(() => {
      d(), _ = setInterval(d, Fn);
    }), Rt(() => clearInterval(_)), ($, m) => (h(), k("div", En, [
      v("div", Pn, [
        R(l(rt), {
          modelValue: i.value,
          "onUpdate:modelValue": m[0] || (m[0] = (b) => i.value = b),
          class: "vo-dub-root-input",
          placeholder: "VO dub project root (holds vo_dataset.csv)",
          onChange: m[1] || (m[1] = (b) => d())
        }, null, 8, ["modelValue"]),
        R(l(j), {
          label: "Browse...",
          size: "small",
          onClick: P
        }),
        R(l(j), {
          label: "Roles",
          size: "small",
          disabled: !i.value,
          title: "Assign a voice preset to each character tag",
          onClick: V
        }, null, 8, ["disabled"]),
        R(l(j), {
          icon: "pi pi-refresh",
          size: "small",
          text: "",
          title: "Re-scan",
          onClick: d
        })
      ]),
      v("div", Tn, [
        (h(!0), k(Y, null, De(r.value, (b) => (h(), k("div", {
          key: b.bucket,
          class: "vo-dub-bucket-row",
          onClick: (I) => E(b)
        }, [
          v("span", An, g(b.bucket), 1),
          v("span", wn, g(b.count), 1),
          v("span", Ln, [
            b.no_text ? (h(), k("span", On, "no text " + g(b.no_text), 1)) : w("", !0),
            b.needs_translation ? (h(), k("span", Vn, "needs RU " + g(b.needs_translation), 1)) : w("", !0),
            b.not_started ? (h(), k("span", Dn, "not started " + g(b.not_started), 1)) : w("", !0),
            b.stale ? (h(), k("span", Un, "stale " + g(b.stale), 1)) : w("", !0),
            b.done ? (h(), k("span", jn, "done " + g(b.done), 1)) : w("", !0),
            b.unsupported ? (h(), k("span", zn, "unsupported " + g(b.unsupported), 1)) : w("", !0)
          ])
        ], 8, In))), 128))
      ]),
      v("div", Nn, g(u.value ? "Loading..." : f.value), 1)
    ]));
  }
}, Mn = /* @__PURE__ */ je(Bn, [["__scopeId", "data-v-ee8c5a8a"]]);
var qn = {
  root: function(s) {
    var i = s.instance, r = s.props;
    return ["p-checkbox p-component", {
      "p-highlight": i.checked,
      "p-disabled": r.disabled,
      "p-invalid": r.invalid,
      "p-variant-filled": r.variant ? r.variant === "filled" : i.$primevue.config.inputStyle === "filled"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, Wn = ln.extend({
  name: "checkbox",
  classes: qn
}), Hn = {
  name: "BaseCheckbox",
  extends: rn,
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
  style: Wn,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
};
function Gn(a) {
  return Qn(a) || Yn(a) || Kn(a) || Jn();
}
function Jn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kn(a, s) {
  if (a) {
    if (typeof a == "string") return at(a, s);
    var i = Object.prototype.toString.call(a).slice(8, -1);
    if (i === "Object" && a.constructor && (i = a.constructor.name), i === "Map" || i === "Set") return Array.from(a);
    if (i === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)) return at(a, s);
  }
}
function Yn(a) {
  if (typeof Symbol < "u" && a[Symbol.iterator] != null || a["@@iterator"] != null) return Array.from(a);
}
function Qn(a) {
  if (Array.isArray(a)) return at(a);
}
function at(a, s) {
  (s == null || s > a.length) && (s = a.length);
  for (var i = 0, r = new Array(s); i < s; i++) r[i] = a[i];
  return r;
}
var st = {
  name: "Checkbox",
  extends: Hn,
  inheritAttrs: !1,
  emits: ["update:modelValue", "change", "focus", "blur"],
  methods: {
    getPTOptions: function(s) {
      var i = s === "root" ? this.ptmi : this.ptm;
      return i(s, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(s) {
      var i = this;
      if (!this.disabled && !this.readonly) {
        var r;
        this.binary ? r = this.checked ? this.falseValue : this.trueValue : this.checked ? r = this.modelValue.filter(function(f) {
          return !mt.equals(f, i.value);
        }) : r = this.modelValue ? [].concat(Gn(this.modelValue), [this.value]) : [this.value], this.$emit("update:modelValue", r), this.$emit("change", s);
      }
    },
    onFocus: function(s) {
      this.$emit("focus", s);
    },
    onBlur: function(s) {
      this.$emit("blur", s);
    }
  },
  computed: {
    checked: function() {
      return this.binary ? this.modelValue === this.trueValue : mt.contains(this.value, this.modelValue);
    }
  },
  components: {
    CheckIcon: hn
  }
}, Xn = ["data-p-highlight", "data-p-disabled"], Zn = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"];
function ea(a, s, i, r, f, u) {
  var _ = un("CheckIcon");
  return h(), k("div", Oe({
    class: a.cx("root")
  }, u.getPTOptions("root"), {
    "data-p-highlight": u.checked,
    "data-p-disabled": a.disabled
  }), [v("input", Oe({
    id: a.inputId,
    type: "checkbox",
    class: [a.cx("input"), a.inputClass],
    style: a.inputStyle,
    value: a.value,
    name: a.name,
    checked: u.checked,
    tabindex: a.tabindex,
    disabled: a.disabled,
    readonly: a.readonly,
    required: a.required,
    "aria-labelledby": a.ariaLabelledby,
    "aria-label": a.ariaLabel,
    "aria-invalid": a.invalid || void 0,
    onFocus: s[0] || (s[0] = function() {
      return u.onFocus && u.onFocus.apply(u, arguments);
    }),
    onBlur: s[1] || (s[1] = function() {
      return u.onBlur && u.onBlur.apply(u, arguments);
    }),
    onChange: s[2] || (s[2] = function() {
      return u.onChange && u.onChange.apply(u, arguments);
    })
  }, u.getPTOptions("input")), null, 16, Zn), v("div", Oe({
    class: a.cx("box")
  }, u.getPTOptions("box")), [dn(a.$slots, "icon", {
    checked: u.checked,
    class: K(a.cx("icon"))
  }, function() {
    return [u.checked ? (h(), fe(_, Oe({
      key: 0,
      class: a.cx("icon")
    }, u.getPTOptions("icon")), null, 16, ["class"])) : w("", !0)];
  })], 16)], 16, Xn);
}
st.render = ea;
const At = 3;
function $t(a) {
  let s = !1;
  a.addEventListener("play", () => {
    if (s || a.readyState >= At) return;
    s = !0, a.pause();
    const i = () => {
      a.removeEventListener("canplaythrough", i), s = !1, a.play().catch(() => {
      });
    };
    a.addEventListener("canplaythrough", i);
  });
}
function Ze(a) {
  return new Promise((s) => {
    if (a.readyState >= At) {
      s();
      return;
    }
    const i = () => {
      a.removeEventListener("canplaythrough", i), s();
    };
    a.addEventListener("canplaythrough", i), a.load();
  });
}
let et = null;
function ta() {
  const a = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return a ? (et || (et = new a()), et) : null;
}
function na(a, s = 1024) {
  const i = new Float32Array(s), r = Math.tanh(a) || 1;
  for (let f = 0; f < s; f++) {
    const u = f / (s - 1) * 2 - 1;
    i[f] = Math.tanh(u * a) / r;
  }
  return i;
}
function aa(a, s, i) {
  const f = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * 2)), a.sampleRate), u = f.getChannelData(0);
  for (let E = 0; E < u.length; E++) u[E] = Math.random() * 2 - 1;
  const _ = a.createBufferSource();
  _.buffer = f, _.loop = !0;
  const d = a.createBiquadFilter();
  d.type = "highpass", d.frequency.value = s;
  const P = a.createBiquadFilter();
  return P.type = "lowpass", P.frequency.value = i, _.connect(d), d.connect(P), _.start(), P;
}
function de(a, { lowHz: s, highHz: i, drive: r, noiseLevel: f }) {
  const u = a.createBiquadFilter();
  u.type = "highpass", u.frequency.value = s;
  const _ = a.createBiquadFilter();
  _.type = "lowpass", _.frequency.value = i, u.connect(_);
  let d = _;
  if (r > 0) {
    const V = a.createWaveShaper();
    V.curve = na(r), V.oversample = "2x", _.connect(V), d = V;
  }
  if (f <= 0) return { input: u, output: d };
  const P = a.createGain();
  P.gain.value = f, aa(a, s, i).connect(P);
  const E = a.createGain();
  return d.connect(E), P.connect(E), { input: u, output: E };
}
const sa = {
  radio: (a) => de(a, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0.05 }),
  phone: (a) => de(a, { lowHz: 300, highHz: 3400, drive: 1.05, noiseLevel: 0 }),
  /*
   Wide passband, no clip, no noise -- a natural muffled quality, not a
   telephony one. See nodes/_audio_effects.py's muffled_effect for the
   same params and the reasoning/reference behind them.
  */
  muffled: (a) => de(a, { lowHz: 120, highHz: 6e3, drive: 0, noiseLevel: 0 }),
  /*
   radio's band and grit with NO static of its own -- for dubbing a game
   that already layers its own channel noise over the line as a separate
   sound, where baking in a second layer would stack the two. See
   nodes/_audio_effects.py's radio_dry_effect for the case behind it.
  */
  radio_dry: (a) => de(a, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0 }),
  /*
   Hard-wired intercom/PA panel -- between phone and radio at both ends,
   more grit than phone, no static.
  */
  intercom: (a) => de(a, { lowHz: 250, highHz: 4e3, drive: 1.2, noiseLevel: 0 }),
  /*
   Inside a sealed helmet -- low end largely kept, only the top rolled
   off, drive below 1.0 so the clip stays in its near-identity region.
  */
  suit: (a) => de(a, { lowHz: 150, highHz: 5e3, drive: 0.6, noiseLevel: 0 })
};
function oa(a) {
  const s = { setEffect() {
  } }, i = ta();
  if (!i) return s;
  let r;
  try {
    r = i.createMediaElementSource(a);
  } catch {
    return s;
  }
  const f = i.createGain();
  f.gain.value = a.paused ? 0 : 1, f.connect(i.destination);
  function u() {
    f.gain.value = a.paused ? 0 : 1;
  }
  a.addEventListener("play", u), a.addEventListener("pause", u), a.addEventListener("ended", u);
  const _ = i.createGain();
  r.connect(_), _.connect(f);
  const d = {};
  function P($) {
    if (d[$]) return d[$];
    const m = sa[$];
    if (!m) return null;
    const b = m(i);
    r.connect(b.input);
    const I = i.createGain();
    return I.gain.value = 0, b.output.connect(I), I.connect(f), d[$] = I, I;
  }
  let E = "";
  function V($) {
    const m = $ || "";
    if (m === E) return;
    if (E && d[E] && (d[E].gain.value = 0), E = "", !m) {
      _.gain.value = 1;
      return;
    }
    const b = P(m);
    if (!b) {
      _.gain.value = 1;
      return;
    }
    E = m, _.gain.value = 0, b.gain.value = 1, i.state === "suspended" && i.resume().catch(() => {
    });
  }
  return { setEffect: V };
}
let tt = null;
function ia() {
  const a = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return a ? (tt || (tt = new a()), tt) : null;
}
async function la(a, s = 100) {
  const i = ia();
  if (!i) throw new Error("Web Audio not supported -- can't decode a waveform");
  const r = await fetch(a);
  if (!r.ok) throw new Error(`couldn't fetch ${a}: ${r.status}`);
  const f = await r.arrayBuffer(), _ = (await i.decodeAudioData(f)).getChannelData(0), d = Math.max(1, Math.floor(_.length / s)), P = new Float32Array(s);
  for (let E = 0; E < s; E++) {
    const V = E * d, $ = Math.min(_.length, V + d);
    let m = 0;
    for (let b = V; b < $; b++) {
      const I = Math.abs(_[b]);
      I > m && (m = I);
    }
    P[E] = m;
  }
  return P;
}
const ra = { class: "waveform-wrap" }, ua = {
  key: 0,
  class: "waveform-status"
}, da = {
  key: 1,
  class: "waveform-status",
  title: "Couldn't load a waveform for this file"
}, ca = {
  __name: "WaveformCanvas",
  props: {
    src: { type: String, default: "" }
  },
  setup(a) {
    const s = a, i = T(null), r = T(!1), f = T(!1);
    function u(d, P) {
      if (typeof d.getContext != "function") return;
      const E = window.devicePixelRatio || 1, V = d.clientWidth || 200, $ = d.clientHeight || 28;
      d.width = Math.max(1, Math.round(V * E)), d.height = Math.max(1, Math.round($ * E));
      const m = d.getContext("2d");
      if (!m) return;
      m.setTransform(E, 0, 0, E, 0, 0), m.clearRect(0, 0, V, $);
      const b = V / P.length, I = $ / 2;
      m.fillStyle = getComputedStyle(d).color || "#4caf50";
      for (let O = 0; O < P.length; O++) {
        const F = Math.max(1, P[O] * $);
        m.fillRect(O * b, I - F / 2, Math.max(1, b - 1), F);
      }
    }
    async function _() {
      if (!(!s.src || !i.value)) {
        r.value = !0, f.value = !1;
        try {
          const d = i.value.clientWidth || 200, P = await la(s.src, Math.max(20, Math.round(d / 3)));
          i.value && u(i.value, P);
        } catch {
          f.value = !0;
        } finally {
          r.value = !1;
        }
      }
    }
    return ze(_), ve(() => s.src, _), (d, P) => (h(), k("div", ra, [
      v("canvas", {
        ref_key: "canvasEl",
        ref: i,
        class: "waveform-canvas"
      }, null, 512),
      r.value ? (h(), k("span", ua, "…")) : f.value ? (h(), k("span", da, "⚠")) : w("", !0)
    ]));
  }
}, Ct = /* @__PURE__ */ je(ca, [["__scopeId", "data-v-413ffbd4"]]), pa = { class: "vo-dub-filters" }, fa = { class: "vo-dub-editor-status" }, va = { class: "actions-row" }, ha = {
  class: "vo-dub-original-default-label",
  title: "Project-wide default for the per-row 'Use original as sample' checkbox below each line -- a row that has ticked/unticked its OWN checkbox always keeps that explicit choice regardless of this default."
}, ya = { class: "vo-dub-pager" }, _a = { class: "vo-dub-pager-label" }, ba = { class: "vo-dub-row-head" }, ka = { class: "vo-dub-key" }, ma = {
  key: 0,
  class: "vo-dub-unsupported-note"
}, ga = { class: "vo-dub-players" }, Sa = { class: "vo-dub-players-labels" }, $a = { class: "vo-dub-duration-en-tag" }, Ca = { class: "vo-dub-players-row" }, xa = { class: "vo-dub-player" }, Ra = ["src", "onPause", "onEnded"], Ea = { class: "vo-dub-player" }, Pa = ["src", "onLoadedmetadata", "onPause", "onEnded"], Ta = {
  key: 2,
  class: "vo-dub-no-take"
}, Ia = { class: "vo-dub-players-footer" }, Aa = {
  class: "vo-dub-identifier",
  title: "Identifier extracted from the game's own resources (vo_dataset.csv's speaker column) -- not necessarily a real role, just the raw signal this row's audio_key carried"
}, wa = {
  class: "vo-dub-use-original-label",
  title: "Use this row's own EN reference take (audio_en\\) as the TTS voice-cloning sample for its NEXT render, instead of the Role above -- unticked follows the project-wide default checkbox in the toolbar unless this row's own box has been explicitly touched. Whether an instruct style can still apply together with this depends on your ComfyUI graph/model -- this addon just passes the resolved reference_audio_path through, it doesn't wire it to a specific node."
}, La = { class: "vo-dub-english" }, Oa = {
  key: 0,
  class: "vo-dub-empty"
}, xt = 600, nt = 50, Va = 0.15, Da = 0.4, Ua = {
  __name: "VoDubLineEditor",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    // {renderRow({audioKey, speaker, instruct, russianText, effect, outputPath, dryOutputPath, referenceAudioPath}) => Promise}
    onClose: { type: Function, required: !0 }
  },
  setup(a) {
    const s = a, { cssWidth: i, setWidth: r, presets: f } = Et({
      storageKey: "FL_CosyVoice3.VODubLineEditor.widthPx",
      defaultWidth: 1100,
      presets: [800, 1100, 1500]
    }), { fontSizePx: u, decrease: _, increase: d } = Pt({
      storageKey: "FL_CosyVoice3.VODubLineEditor.fontSizePx",
      defaultSize: 13
    }), { autoGrow: P, setTextareaRef: E, regrowAll: V } = Sn();
    ve(u, V);
    const $ = T(!0);
    let m = !1;
    function b() {
      m || (m = !0, Z && (clearTimeout(Z), p()), s.onClose());
    }
    ve($, (e) => {
      e || b();
    });
    const I = T([]), O = G({}), F = T(""), B = T(""), A = T(""), Q = T(!1), z = {
      "": "All statuses",
      no_text: "No source text",
      needs_translation: "Needs translation",
      not_started: "Not started",
      stale: "Stale",
      done: "Done",
      unsupported: "Unsupported (multi-channel)"
    }, ne = Object.entries(z).map(([e, n]) => ({ value: e, label: n })), Ne = [
      { value: "", label: "No effect" },
      { value: "radio", label: "📻 Radio" },
      { value: "phone", label: "📞 Phone" },
      { value: "muffled", label: "🤫 Muffled" },
      { value: "radio_dry", label: "📻 Radio (no static)" },
      { value: "intercom", label: "🔊 Intercom" },
      { value: "suit", label: "🧑‍🚀 Suit" }
    ], q = G({});
    function he(e) {
      const n = q[e.audio_key];
      return n !== void 0 ? n : C(e).effect || "";
    }
    function Pe(e) {
      const n = q[e.audio_key];
      return n !== void 0 && n !== (C(e).effect || "");
    }
    function Te(e, n) {
      var t;
      q[e.audio_key] = n, (t = Je.get(e.audio_key)) == null || t.setEffect(n);
    }
    function ye(e) {
      q[e.audio_key] !== void 0 && (C(e).effect = q[e.audio_key], delete q[e.audio_key]);
    }
    function _e(e) {
      ye(e), S(e), M(e) && an(e);
    }
    function be(e) {
      const n = C(e).use_original_sample;
      return n === void 0 ? X.value : !!n;
    }
    function Fe(e, n) {
      C(e).use_original_sample = n, S(e);
    }
    function ke() {
      c();
    }
    function me() {
      return ce(s.root, "_dub_state.json");
    }
    const X = T(!1);
    async function Be() {
      const n = await (await fetch(`${te}/read?path=${encodeURIComponent(me())}`)).json();
      let t = { rows: {} };
      if (n.exists)
        try {
          const o = JSON.parse(n.content);
          o && typeof o.rows == "object" && (t = o);
        } catch (o) {
          console.warn("[FL CosyVoice3 VODubEditor] _dub_state.json is not valid JSON:", o);
        }
      Object.keys(O).forEach((o) => delete O[o]), Object.assign(O, t.rows), X.value = !!t.use_original_default;
    }
    async function W() {
      Q.value = !0;
      try {
        const n = await (await fetch(`${Ee}/rows?path=${encodeURIComponent(s.root)}&bucket=${encodeURIComponent(s.bucket)}`)).json();
        if (n.error) {
          A.value = n.error, I.value = [];
          return;
        }
        I.value = n.rows || [];
        for (const t of I.value) {
          const o = O[t.audio_key] || (O[t.audio_key] = {});
          o.russian_text || (o.russian_text = t.russian || ""), o.instruct === void 0 && (o.instruct = t.instruct || ""), o.speaker_override === void 0 && (o.speaker_override = ""), o.effect === void 0 && (o.effect = "");
        }
        A.value = `${I.value.length} row(s) in ${s.bucket}`;
      } catch (e) {
        A.value = `Couldn't load: ${e}`;
      } finally {
        Q.value = !1;
      }
    }
    function C(e) {
      return O[e.audio_key] || (O[e.audio_key] = {});
    }
    let Z = null;
    function c() {
      clearTimeout(Z), Z = setTimeout(p, xt);
    }
    async function p() {
      try {
        await fetch(`${te}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: me(),
            content: JSON.stringify({ rows: O, use_original_default: X.value }, null, 2)
          })
        }), A.value = "Saved", W();
      } catch (e) {
        A.value = `Save failed: ${e}`;
      }
    }
    function S(e) {
      C(e), c();
    }
    function y(e) {
      A.value = e;
    }
    const D = Ve(() => {
      const e = B.value.trim().toLowerCase();
      return I.value.filter((n) => {
        if (F.value && n.status !== F.value) return !1;
        if (!e) return !0;
        const t = O[n.audio_key];
        return `${n.audio_key} ${n.speaker_tag} ${n.english} ${t && t.russian_text || n.russian}`.toLowerCase().includes(e);
      });
    }), L = T(0), ae = Ve(() => Math.max(1, Math.ceil(D.value.length / nt))), ut = Ve(() => {
      const e = L.value * nt;
      return D.value.slice(e, e + nt);
    });
    ve([F, B], () => {
      L.value = 0;
    }), ve(D, () => {
      L.value > ae.value - 1 && (L.value = Math.max(0, ae.value - 1));
    });
    const ge = T([]);
    async function wt() {
      try {
        const n = await (await fetch(`${te}/read?path=${encodeURIComponent(ce(s.root, "_dub_roles.json"))}`)).json();
        if (!n.exists) {
          ge.value = [];
          return;
        }
        const t = JSON.parse(n.content), o = t && typeof t.roles == "object" && t.roles || {};
        ge.value = Object.entries(o).map(([x, U]) => ({ code: x, ...U }));
      } catch {
        ge.value = [];
      }
    }
    function Lt(e) {
      return [e.character, e.speaker].filter(Boolean).join(" -- ");
    }
    function se(e) {
      return (C(e).speaker_override || e.speaker_tag || "").trim();
    }
    const { popover: Me, show: Ot, hide: Vt, info: dt } = $n(
      ge,
      (e) => [
        ["character", e.character],
        ["gender", e.gender],
        ["actor", e.actor],
        ["description", e.description],
        ["dub direction", e.dub_direction],
        ["notes", Array.isArray(e.notes) ? e.notes.join(" ") : e.notes],
        ["voice", e.speaker]
      ].filter(([, n]) => n != null && n !== "")
    ), oe = T([]);
    function ct() {
      return ce(s.root, "_instruct_categories.json");
    }
    async function Dt() {
      try {
        const n = await (await fetch(`${te}/read?path=${encodeURIComponent(ct())}`)).json();
        if (!n.exists) {
          oe.value = [];
          return;
        }
        const t = JSON.parse(n.content);
        oe.value = t && t.categories || [];
      } catch {
        oe.value = [];
      }
    }
    const pt = /* @__PURE__ */ new Map();
    function ft(e) {
      clearTimeout(pt.get(e.audio_key)), pt.set(e.audio_key, setTimeout(async () => {
        const n = C(e).instruct, t = await Cn(te, ct(), n);
        t && (oe.value = t);
      }, xt));
    }
    const qe = T(!1), vt = T(null);
    function Ut(e) {
      vt.value = e, qe.value = !0;
    }
    const ee = G({});
    function jt(e) {
      const n = vt.value;
      n && (ee[n.audio_key] = C(n).instruct, C(n).instruct = e, S(n), ft(n));
    }
    function zt(e) {
      const n = (C(e).instruct || "").trim(), t = oe.value.find((o) => (o.examples || []).some((x) => x.trim() === n));
      return t ? t.title : null;
    }
    function Nt(e) {
      return ee[e.audio_key] !== void 0 ? `Restore previous instruct: "${ee[e.audio_key]}"` : "No previous instruct to restore";
    }
    function Ft(e) {
      if (ee[e.audio_key] === void 0) return;
      const n = C(e).instruct;
      C(e).instruct = ee[e.audio_key], ee[e.audio_key] = n, S(e);
    }
    function We(e) {
      const n = se(e);
      return n ? I.value.filter((t) => t !== e && t.status !== "unsupported" && se(t) === n).length : 0;
    }
    function Bt(e) {
      const n = We(e);
      return n > 0 ? `Apply this instruct to every other "${se(e)}" row in this bucket (${n})` : "No other rows in this bucket use this role";
    }
    function Mt(e) {
      const n = We(e);
      if (!n) return;
      const t = se(e), o = C(e).instruct;
      I.value.forEach((x) => {
        x !== e && x.status !== "unsupported" && se(x) === t && (C(x).instruct = o);
      }), c(), A.value = `Applied instruct to ${n} other "${t}" row(s) in this bucket`;
    }
    function He(e) {
      const n = (e.speaker_tag || "").trim();
      return n ? I.value.filter((t) => t !== e && t.status !== "unsupported" && (t.speaker_tag || "").trim() === n).length : 0;
    }
    function qt(e) {
      const n = He(e);
      return n > 0 ? `Apply this Role to every other "${e.speaker_tag}" row in this bucket (${n})` : "No other rows in this bucket share this Identifier";
    }
    function Wt(e) {
      const n = He(e);
      if (!n) return;
      const t = (e.speaker_tag || "").trim(), o = C(e).speaker_override || e.speaker_tag;
      I.value.forEach((x) => {
        x !== e && x.status !== "unsupported" && (x.speaker_tag || "").trim() === t && (C(x).speaker_override = o);
      }), c(), A.value = `Applied Role to ${n} other "${t}" row(s) in this bucket`;
    }
    function Ie(e, n) {
      return ce(ce(s.root, e), `${n}.wav`);
    }
    function Se(e, n, t) {
      const o = `${pn}/audio?path=${encodeURIComponent(Ie(e, n))}`;
      return t ? `${o}&v=${t}` : o;
    }
    function Ht(e) {
      return Ie("audio_ru", e.audio_key);
    }
    function Gt(e) {
      return Ie("_dub_dry", e.audio_key);
    }
    function Jt(e, n = 8e3) {
      return new Promise((t) => {
        const o = new Audio();
        let x = !1;
        const U = (Xe) => {
          x || (x = !0, o.removeEventListener("loadedmetadata", N), o.removeEventListener("error", Re), t(Xe));
        }, N = () => U(o.duration || null), Re = () => U(null);
        o.addEventListener("loadedmetadata", N), o.addEventListener("error", Re), setTimeout(() => U(null), n), o.preload = "metadata", o.src = e;
      });
    }
    function M(e) {
      return e.status === "done" || e.status === "stale" || yt.has(e.audio_key);
    }
    function Ae(e) {
      return !!C(e).manually_done;
    }
    function Kt(e) {
      C(e).manually_done = !Ae(e), S(e);
    }
    const Ge = G({});
    function Yt(e, n) {
      Ge[e.audio_key] = n.target.duration;
    }
    const we = /* @__PURE__ */ new Map(), ie = /* @__PURE__ */ new Map();
    function Qt(e, n) {
      if (!n) {
        we.delete(e);
        return;
      }
      we.set(e, n), $t(n);
    }
    const Je = /* @__PURE__ */ new Map();
    function Xt(e, n) {
      const t = e.audio_key;
      if (!n) {
        ie.delete(t), Je.delete(t);
        return;
      }
      ie.set(t, n), $t(n);
      const o = oa(n);
      Je.set(t, o), o.setEffect(he(e));
    }
    const le = G(/* @__PURE__ */ new Set()), $e = G(/* @__PURE__ */ new Set());
    function Le(e, n) {
      if (le.delete(e.audio_key), n === "ru" && H.value === e.audio_key) {
        const t = ie.get(e.audio_key);
        t && !t.ended && Ke();
      }
    }
    async function Zt(e) {
      const n = we.get(e.audio_key), t = ie.get(e.audio_key);
      if (!(!n || !t)) {
        if (le.has(e.audio_key) || $e.has(e.audio_key)) {
          $e.delete(e.audio_key), le.delete(e.audio_key), n.pause(), t.pause();
          return;
        }
        n.pause(), t.pause(), n.currentTime = 0, t.currentTime = 0, $e.add(e.audio_key), await Promise.all([Ze(n), Ze(t)]), $e.delete(e.audio_key), we.has(e.audio_key) && (n.currentTime = 0, t.currentTime = 0, le.add(e.audio_key), n.play().catch(() => {
        }), t.play().catch(() => {
        }));
      }
    }
    const H = T(null);
    let re = null;
    function Ke() {
      var n;
      re && (re.el.removeEventListener("ended", re.fn), re = null);
      const e = H.value;
      H.value = null, e && ((n = ie.get(e)) == null || n.pause());
    }
    async function ht(e) {
      var N;
      Ke();
      const n = ut.value;
      let t = e;
      for (; t < n.length && !M(n[t]); ) t++;
      if (t >= n.length) return;
      const o = n[t], x = ie.get(o.audio_key);
      if (!x || (H.value = o.audio_key, (N = Ye.get(o.audio_key)) == null || N.scrollIntoView({ behavior: "smooth", block: "nearest" }), await Ze(x), H.value !== o.audio_key)) return;
      const U = () => {
        x.removeEventListener("ended", U), re = null, ht(t + 1);
      };
      re = { el: x, fn: U }, x.addEventListener("ended", U), x.currentTime = 0, x.play().catch(() => {
      });
    }
    function en() {
      H.value ? Ke() : ht(0);
    }
    const Ye = /* @__PURE__ */ new Map();
    function tn(e, n) {
      if (!n) {
        Ye.delete(e);
        return;
      }
      Ye.set(e, n);
    }
    const yt = G(/* @__PURE__ */ new Set()), Qe = G({}), Ce = G(/* @__PURE__ */ new Set());
    async function _t(e, n) {
      const t = Date.now(), o = await Jt(Se("audio_ru", e.audio_key, t));
      await fetch(`${Ee}/mark_rendered`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          root: s.root,
          audio_key: e.audio_key,
          hash: n,
          duration_s: o
        })
      }), o !== null && (Ge[e.audio_key] = o), yt.add(e.audio_key), Qe[e.audio_key] = t;
    }
    async function bt(e) {
      const n = C(e), t = e.speaker, o = n.instruct || "", x = n.russian_text || "", U = n.effect || "";
      let N = o;
      return U && (N += `\0effect=${U}`), be(e) && (N += "\0sample=original"), xn(t, N, x);
    }
    async function kt(e) {
      if (!(!s.renderApi || Ce.has(e.audio_key))) {
        Ce.add(e.audio_key), A.value = `Rendering ${e.audio_key}...`;
        try {
          ye(e), clearTimeout(Z), await p();
          const n = C(e), t = e.speaker, o = n.instruct || "", x = n.russian_text || "", U = n.effect || "", N = be(e) ? Ie("audio_en", e.audio_key) : "", Re = await bt(e), Xe = Ht(e), on = Gt(e);
          await s.renderApi.renderRow({
            audioKey: e.audio_key,
            speaker: t,
            instruct: o,
            russianText: x,
            effect: U,
            outputPath: Xe,
            dryOutputPath: on,
            referenceAudioPath: N
          }), n.hash = Re, await _t(e, Re), A.value = `Rendered ${e.audio_key}`, await W();
        } catch (n) {
          A.value = `Render failed for ${e.audio_key}: ${n}`;
        } finally {
          Ce.delete(e.audio_key);
        }
      }
    }
    const ue = T(!1);
    async function nn() {
      if (!s.renderApi || ue.value) return;
      const e = I.value.filter((t) => t.status === "not_started" || t.status === "stale");
      if (!e.length) {
        A.value = "Nothing needs rendering in this bucket";
        return;
      }
      ue.value = !0;
      let n = 0;
      A.value = `Rendering 0/${e.length}...`;
      try {
        for (const t of e) {
          try {
            await kt(t);
          } catch (o) {
            console.error(`[FL CosyVoice3 VODubEditor] render-all-pending failed for ${t.audio_key}`, o);
          }
          n++, A.value = `Rendering ${n}/${e.length}...`;
        }
      } finally {
        ue.value = !1;
      }
    }
    async function an(e) {
      A.value = `Applying effect to ${e.audio_key}...`;
      try {
        const t = await (await fetch(`${Ee}/apply_effect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: s.root, audio_key: e.audio_key, effect: C(e).effect || "" })
        })).json();
        if (t.error) {
          A.value = `Couldn't apply effect to ${e.audio_key}: ${t.error}`;
          return;
        }
        const o = await bt(e);
        C(e).hash = o, await _t(e, o), A.value = `Applied effect to ${e.audio_key}`, await W();
      } catch (n) {
        A.value = `Couldn't apply effect to ${e.audio_key}: ${n}`;
      }
    }
    function sn(e) {
      return e.duration_s ? `EN ${e.duration_s.toFixed(1)}s` : "EN";
    }
    function xe(e) {
      const n = Ge[e.audio_key] ?? e.rendered_duration_s, t = e.duration_s;
      if (!M(e) || n === void 0 || n === null || !t) return null;
      const o = (n - t) / t, x = Math.round(o * 100), U = Math.abs(o);
      return {
        level: U <= Va ? "good" : U <= Da ? "warn" : "bad",
        ruSeconds: `${n.toFixed(1)}s`,
        pctText: `${x >= 0 ? "+" : ""}${x}%`
      };
    }
    return ze(async () => {
      wt(), Dt(), await Be(), await W();
    }), (e, n) => (h(), k(Y, null, [
      R(l(It), {
        visible: $.value,
        "onUpdate:visible": n[7] || (n[7] = (t) => $.value = t),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: Ue({ width: l(i) }),
        class: "vo-dub-editor-dialog"
      }, {
        header: J(() => [
          R(Tt, {
            title: `VO Dub — ${a.bucket}`,
            "width-presets": l(f),
            "set-width": l(r),
            "font-size-decrease": l(_),
            "font-size-increase": l(d)
          }, null, 8, ["title", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: J(() => [
          R(kn, { class: "vo-dub-editor-controls" }, {
            default: J(() => [
              v("div", pa, [
                R(l(rt), {
                  modelValue: B.value,
                  "onUpdate:modelValue": n[0] || (n[0] = (t) => B.value = t),
                  placeholder: "Search text or audio_key...",
                  class: "vo-dub-search"
                }, null, 8, ["modelValue"]),
                R(l(gt), {
                  modelValue: F.value,
                  "onUpdate:modelValue": n[1] || (n[1] = (t) => F.value = t),
                  options: l(ne),
                  "option-label": "label",
                  "option-value": "value",
                  class: "vo-dub-status-filter"
                }, null, 8, ["modelValue", "options"]),
                R(l(j), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-scan this bucket",
                  onClick: W
                }),
                v("span", fa, g(Q.value ? "Loading..." : A.value), 1),
                R(l(j), {
                  icon: "pi pi-times",
                  text: "",
                  size: "small",
                  title: "Close",
                  onClick: n[2] || (n[2] = (t) => $.value = !1)
                })
              ]),
              v("div", va, [
                R(l(j), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a row's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: n[3] || (n[3] = cn((t) => l(mn)(y), ["prevent"]))
                }),
                n[10] || (n[10] = v("span", { class: "actions-divider" }, null, -1)),
                R(l(j), {
                  label: H.value ? "Stop" : "▶ Play in order",
                  text: "",
                  size: "small",
                  icon: H.value ? "pi pi-stop-circle" : "pi pi-play",
                  title: "Play through this page's RU takes in order, auto-advancing to the next row with a take when each one ends -- mirrors LineEditorApp.vue's own sequential playback. Pausing a row via its own native controls stops the run instead of continuing past it.",
                  onClick: en
                }, null, 8, ["label", "icon"]),
                R(l(j), {
                  label: ue.value ? "Rendering..." : "🔁 Render pending",
                  text: "",
                  size: "small",
                  icon: ue.value ? "pi pi-spin pi-spinner" : "pi pi-play",
                  disabled: !s.renderApi || ue.value,
                  title: "Render every not-started or stale row in this WHOLE bucket (not just this page), one at a time -- mirrors ScriptLibraryPanel.vue's own '🔁 Re-voice pending' button.",
                  onClick: nn
                }, null, 8, ["label", "icon", "disabled"]),
                n[11] || (n[11] = v("span", { class: "actions-divider" }, null, -1)),
                v("label", ha, [
                  R(l(st), {
                    modelValue: X.value,
                    "onUpdate:modelValue": n[4] || (n[4] = (t) => X.value = t),
                    binary: "",
                    onChange: ke
                  }, null, 8, ["modelValue"]),
                  n[9] || (n[9] = pe(" Use original as sample by default ", -1))
                ])
              ]),
              v("div", ya, [
                R(l(j), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: L.value === 0,
                  title: "Previous page",
                  onClick: n[5] || (n[5] = (t) => L.value--)
                }, null, 8, ["disabled"]),
                v("span", _a, "Page " + g(L.value + 1) + " / " + g(ae.value) + " (" + g(D.value.length) + " row(s))", 1),
                R(l(j), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: L.value >= ae.value - 1,
                  title: "Next page",
                  onClick: n[6] || (n[6] = (t) => L.value++)
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          v("div", {
            class: "vo-dub-rows",
            style: Ue({ fontSize: `${l(u)}px` })
          }, [
            (h(!0), k(Y, null, De(ut.value, (t) => (h(), k("div", {
              key: t.audio_key,
              class: K(["vo-dub-row", { "row-playing": H.value === t.audio_key }]),
              ref_for: !0,
              ref: (o) => tn(t.audio_key, o)
            }, [
              v("div", ba, [
                v("span", ka, g(t.audio_key), 1),
                v("span", {
                  class: K(["vo-dub-status-pill", `status-${t.status}`])
                }, g(z[t.status]), 3),
                M(t) ? (h(), fe(l(j), {
                  key: 0,
                  class: K(["vo-dub-done-btn", { active: Ae(t) }]),
                  text: "",
                  size: "small",
                  icon: Ae(t) ? "pi pi-check-circle" : "pi pi-circle",
                  label: Ae(t) ? "Done" : "Mark done",
                  title: "Manually treat this row as done even if its content has drifted since the last render -- sticky until you click it again to unmark it. Doesn't touch the file or the render hash, only how this row's status reads.",
                  onClick: (o) => Kt(t)
                }, null, 8, ["class", "icon", "label", "onClick"])) : w("", !0)
              ]),
              t.status === "unsupported" ? (h(), k("div", ma, [
                pe(" Unsupported: " + g(t.channels) + "-channel audio split across multiple files (", 1),
                n[12] || (n[12] = v("code", null, ".a", -1)),
                n[13] || (n[13] = pe("-", -1)),
                n[14] || (n[14] = v("code", null, ".d", -1)),
                n[15] || (n[15] = pe(") -- this editor can only play or render a single mono/stereo file per row. Handle this one outside the tool. ", -1))
              ])) : (h(), k(Y, { key: 1 }, [
                v("div", ga, [
                  v("div", Sa, [
                    v("span", $a, g(sn(t)), 1),
                    xe(t) ? (h(), k(Y, { key: 0 }, [
                      n[16] || (n[16] = v("span", { class: "vo-dub-duration-vs" }, "vs", -1)),
                      v("span", {
                        class: K(["vo-dub-duration-tag", `badge-${xe(t).level}`])
                      }, g(xe(t).ruSeconds) + " RU", 3),
                      v("span", {
                        class: K(["vo-dub-duration-delta", `badge-${xe(t).level}`])
                      }, g(xe(t).pctText), 3)
                    ], 64)) : w("", !0)
                  ]),
                  v("div", Ca, [
                    v("div", xa, [
                      R(Ct, {
                        src: Se("audio_en", t.audio_key),
                        class: "vo-dub-waveform"
                      }, null, 8, ["src"]),
                      v("audio", {
                        controls: "",
                        preload: "none",
                        src: Se("audio_en", t.audio_key),
                        ref_for: !0,
                        ref: (o) => Qt(t.audio_key, o),
                        onPause: (o) => Le(t, "en"),
                        onEnded: (o) => Le(t, "en")
                      }, null, 40, Ra)
                    ]),
                    R(l(j), {
                      class: K(["play-both-btn", { playing: le.has(t.audio_key) }]),
                      size: "small",
                      label: "Play both",
                      icon: $e.has(t.audio_key) ? "pi pi-spin pi-spinner" : le.has(t.audio_key) ? "pi pi-pause" : "pi pi-play",
                      disabled: !M(t),
                      title: M(t) ? "Play EN and RU together, from the start" : "No RU take yet -- nothing to compare",
                      onClick: (o) => Zt(t)
                    }, null, 8, ["class", "icon", "disabled", "title", "onClick"]),
                    v("div", Ea, [
                      M(t) ? (h(), fe(Ct, {
                        key: 0,
                        src: Se("audio_ru", t.audio_key, Qe[t.audio_key]),
                        class: "vo-dub-waveform"
                      }, null, 8, ["src"])) : w("", !0),
                      M(t) ? (h(), k("audio", {
                        key: 1,
                        controls: "",
                        preload: "none",
                        src: Se("audio_ru", t.audio_key, Qe[t.audio_key]),
                        ref_for: !0,
                        ref: (o) => Xt(t, o),
                        onLoadedmetadata: (o) => Yt(t, o),
                        onPause: (o) => Le(t, "ru"),
                        onEnded: (o) => Le(t, "ru")
                      }, null, 40, Pa)) : (h(), k("span", Ta, "not rendered yet"))
                    ])
                  ]),
                  v("div", Ia, [
                    s.renderApi ? (h(), fe(l(j), {
                      key: 0,
                      class: K(["vo-dub-render-btn", { stale: t.status === "stale" }]),
                      size: "small",
                      label: M(t) ? "Re-render" : "Render",
                      icon: Ce.has(t.audio_key) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                      disabled: Ce.has(t.audio_key),
                      title: M(t) ? "Re-render this row and write it to audio_ru\\" : "Render this row and write it to audio_ru\\",
                      onClick: (o) => kt(t)
                    }, null, 8, ["class", "label", "icon", "disabled", "title", "onClick"])) : w("", !0),
                    R(l(gt), {
                      "model-value": he(t),
                      options: Ne,
                      "option-label": "label",
                      "option-value": "value",
                      class: "vo-dub-effect-select",
                      title: "Effect -- previews INSTANTLY on the RU take above (no re-render, no save) until you click Save or Render/Re-render",
                      "onUpdate:modelValue": (o) => Te(t, o)
                    }, null, 8, ["model-value", "onUpdate:modelValue"]),
                    Pe(t) ? (h(), fe(l(j), {
                      key: 1,
                      icon: "pi pi-save",
                      size: "small",
                      class: "vo-dub-effect-save-btn",
                      title: "Save this Effect choice (does not re-render the file by itself -- Render/Re-render still needs a click to actually bake it in)",
                      onClick: (o) => _e(t)
                    }, null, 8, ["onClick"])) : w("", !0)
                  ])
                ]),
                R(gn, {
                  speaker: C(t).speaker_override || t.speaker_tag,
                  "role-entries": ge.value,
                  "role-option-sub-label": Lt,
                  "speaker-placeholder": "Role",
                  "speaker-title": "Role code (resolves to that role's assigned voice), or a literal preset/preset#tag",
                  "role-info-code": se(t),
                  instruct: C(t).instruct,
                  "can-undo-instruct": ee[t.audio_key] !== void 0,
                  "undo-instruct-title": Nt(t),
                  "can-apply-instruct": We(t) > 0,
                  "apply-instruct-title": Bt(t),
                  "instruct-note": zt(t),
                  text: C(t).russian_text,
                  "text-placeholder": "Russian text for this line",
                  "font-size-px": l(u),
                  "textarea-ref": (o) => l(E)(t.audio_key, o),
                  "on-auto-grow": l(P),
                  "onUpdate:speaker": (o) => {
                    C(t).speaker_override = o, S(t);
                  },
                  "onUpdate:instruct": (o) => {
                    C(t).instruct = o, S(t), ft(t);
                  },
                  "onUpdate:text": (o) => {
                    C(t).russian_text = o, S(t);
                  },
                  onOpenInstructPicker: (o) => Ut(t),
                  onUndoInstruct: (o) => Ft(t),
                  onApplyInstruct: (o) => Mt(t),
                  onRoleInfoEnter: l(Ot),
                  onRoleInfoLeave: l(Vt)
                }, {
                  leading: J(() => [
                    v("span", Aa, g(t.speaker_tag || "—"), 1),
                    R(l(j), {
                      icon: "pi pi-copy",
                      size: "small",
                      class: "apply-role-btn",
                      disabled: He(t) === 0,
                      title: qt(t),
                      onClick: (o) => Wt(t)
                    }, null, 8, ["disabled", "title", "onClick"]),
                    v("label", wa, [
                      R(l(st), {
                        "model-value": be(t),
                        binary: "",
                        "onUpdate:modelValue": (o) => Fe(t, o)
                      }, null, 8, ["model-value", "onUpdate:modelValue"]),
                      n[17] || (n[17] = pe(" 🎙️ Original as sample ", -1))
                    ])
                  ]),
                  "above-text": J(() => [
                    v("div", La, g(t.english), 1)
                  ]),
                  _: 2
                }, 1032, ["speaker", "role-entries", "role-info-code", "instruct", "can-undo-instruct", "undo-instruct-title", "can-apply-instruct", "apply-instruct-title", "instruct-note", "text", "font-size-px", "textarea-ref", "on-auto-grow", "onUpdate:speaker", "onUpdate:instruct", "onUpdate:text", "onOpenInstructPicker", "onUndoInstruct", "onApplyInstruct", "onRoleInfoEnter", "onRoleInfoLeave"])
              ], 64))
            ], 2))), 128)),
            D.value.length ? w("", !0) : (h(), k("div", Oa, "No rows match this filter."))
          ], 4)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      R(_n, {
        visible: qe.value,
        "onUpdate:visible": n[8] || (n[8] = (t) => qe.value = t),
        categories: oe.value,
        onSelect: jt
      }, null, 8, ["visible", "categories"]),
      R(bn, {
        visible: l(Me).visible,
        left: l(Me).left,
        top: l(Me).top,
        message: l(dt).message,
        fields: l(dt).fields
      }, null, 8, ["visible", "left", "top", "message", "fields"])
    ], 64));
  }
}, ja = /* @__PURE__ */ je(Ua, [["__scopeId", "data-v-23b7ce7c"]]), za = { class: "role-head" }, Na = { class: "role-name" }, Fa = {
  class: "role-code",
  title: "Role code -- read-only here, this addon doesn't own this file's identity model"
}, Ba = ["title"], Ma = {
  key: 1,
  class: "role-actor"
}, qa = {
  key: 0,
  class: "role-description"
}, Wa = {
  key: 1,
  class: "role-dub-direction"
}, Ha = {
  key: 2,
  class: "role-notes"
}, Ga = { class: "role-stats" }, Ja = { key: 0 }, Ka = { key: 1 }, Ya = { key: 2 }, Qa = { key: 3 }, Xa = {
  key: 3,
  class: "role-examples",
  title: "Longest lines for this role -- a quick sample to listen to"
}, Za = { class: "role-speaker-row" }, es = 600, ts = 3e3, ns = 1500, as = {
  __name: "DubRolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(a) {
    const s = a, i = ce(s.root, "_dub_roles.json"), r = T(!0), f = T({ roles: {} }), u = T([]), _ = T(""), d = T(""), P = T(!1), { cssWidth: E, setWidth: V, presets: $ } = Et({
      storageKey: "FL_CosyVoice3.DubRolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: m, decrease: b, increase: I } = Pt({
      storageKey: "FL_CosyVoice3.DubRolesEditor.fontSizePx",
      defaultSize: 13
    });
    let O = null, F = 0, B = null, A = null;
    const Q = /* @__PURE__ */ new Map();
    function z(c) {
      d.value = c;
    }
    const ne = Ve(() => {
      var p;
      const c = ((p = f.value) == null ? void 0 : p.roles) || {};
      return Object.entries(c).sort((S, y) => {
        var D, L;
        return (((D = y[1]) == null ? void 0 : D.lines) || 0) - (((L = S[1]) == null ? void 0 : L.lines) || 0);
      });
    });
    function Ne(c, p) {
      return c.character || p;
    }
    function q(c) {
      return Array.isArray(c.notes) ? c.notes : [];
    }
    function he(c) {
      return Array.isArray(c.longest_files) ? c.longest_files : [];
    }
    function Pe() {
      return JSON.stringify(f.value, null, 2);
    }
    async function Te() {
      const c = Pe();
      if (c !== O)
        try {
          const S = await (await fetch(`${te}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: i, content: c })
          })).json();
          if (S.error) {
            z(`Save error: ${S.error}`);
            return;
          }
          O = c, z(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (p) {
          z(`Save failed: ${p}`);
        }
    }
    function ye() {
      F = Date.now(), B && clearTimeout(B), B = setTimeout(Te, es);
    }
    function _e(c, p) {
      Q.get(c) !== p.speaker && (Q.set(c, p.speaker), vn(s.root, c).then((y) => z(y.message)));
    }
    function be(c, p) {
      ye(), _e(c, p);
    }
    async function Fe() {
      try {
        const p = await (await fetch(fn)).json();
        u.value = p.presets || [], _.value = p.dir || "";
      } catch {
        u.value = [], _.value = "";
      }
    }
    const ke = T(!1), me = T(null);
    function X(c, p) {
      me.value = [c, p], ke.value = !0;
    }
    function Be(c) {
      const p = me.value;
      if (!p) return;
      const [S, y] = p;
      y.speaker = c, be(S, y);
    }
    async function W({ isPoll: c = !1 } = {}) {
      try {
        const S = await (await fetch(`${te}/read?path=${encodeURIComponent(i)}`)).json();
        if (S.error) {
          z(`Read error: ${S.error}`);
          return;
        }
        if (!S.exists) {
          c || (f.value = { roles: {} }, O = "", z('_dub_roles.json does not exist yet -- click "Seed from dataset" below'));
          return;
        }
        if (c && Date.now() - F < ns || S.content === O) return;
        let y;
        try {
          y = JSON.parse(S.content);
        } catch (L) {
          z(`_dub_roles.json is not valid JSON: ${L}`);
          return;
        }
        const D = y && typeof y.roles == "object" && y.roles || {};
        for (const L of Object.values(D))
          L && typeof L == "object" && L.speaker === void 0 && (L.speaker = "");
        f.value = { ...y, roles: D };
        for (const [L, ae] of Object.entries(D))
          Q.set(L, ae.speaker);
        O = Pe(), c || z(`Loaded ${ne.value.length} role(s)`);
      } catch (p) {
        z(`Read failed: ${p}`);
      }
    }
    async function C() {
      P.value = !0;
      try {
        const p = await (await fetch(`${Ee}/seed_roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: s.root })
        })).json();
        if (p.error) {
          z(`Seed error: ${p.error}`);
          return;
        }
        await W(), z(p.added.length ? `Added ${p.added.length} role(s): ${p.added.join(", ")}` : "Nothing new to add");
      } catch (c) {
        z(`Seed failed: ${c}`);
      } finally {
        P.value = !1;
      }
    }
    function Z() {
      B && (clearTimeout(B), Te());
      for (const [c, p] of ne.value) _e(c, p);
      A && clearInterval(A), s.onClose();
    }
    return ve(r, (c) => {
      c || Z();
    }), ze(async () => {
      Fe(), await W(), A = setInterval(() => W({ isPoll: !0 }), ts);
    }), Rt(() => {
      A && clearInterval(A);
    }), (c, p) => (h(), k(Y, null, [
      R(l(It), {
        visible: r.value,
        "onUpdate:visible": p[1] || (p[1] = (S) => r.value = S),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: Ue({ width: l(E) }),
        class: "roles-dialog"
      }, {
        header: J(() => [
          R(Tt, {
            title: "VO Dub Roles",
            status: d.value,
            "width-presets": l($),
            "set-width": l(V),
            "font-size-decrease": l(b),
            "font-size-increase": l(I)
          }, {
            after: J(() => [
              R(l(j), {
                label: "Seed from dataset",
                size: "small",
                text: "",
                icon: P.value ? "pi pi-spin pi-spinner" : "pi pi-database",
                disabled: P.value,
                title: "Add every distinct speaker tag from vo_dataset.csv that isn't a role here yet",
                onClick: C
              }, null, 8, ["icon", "disabled"])
            ]),
            _: 1
          }, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: J(() => [
          ne.value.length ? w("", !0) : (h(), fe(l(yn), {
            key: 0,
            severity: "info",
            closable: !1
          }, {
            default: J(() => [...p[3] || (p[3] = [
              pe(' No roles yet -- click "Seed from dataset" above to create one per distinct speaker tag. ', -1)
            ])]),
            _: 1
          })),
          v("div", {
            class: "roles-list",
            style: Ue({ fontSize: `${l(m)}px` })
          }, [
            (h(!0), k(Y, null, De(ne.value, ([S, y]) => (h(), k("div", {
              key: S,
              class: "role-card"
            }, [
              v("div", za, [
                v("span", Na, g(Ne(y, S)), 1),
                v("span", Fa, g(S), 1),
                y.gender ? (h(), k("span", {
                  key: 0,
                  class: "role-gender",
                  title: y.gender_evidence || ""
                }, g(y.gender), 9, Ba)) : w("", !0),
                y.actor ? (h(), k("span", Ma, g(y.actor), 1)) : w("", !0)
              ]),
              y.description ? (h(), k("p", qa, g(y.description), 1)) : w("", !0),
              y.dub_direction ? (h(), k("p", Wa, g(y.dub_direction), 1)) : w("", !0),
              q(y).length ? (h(), k("ul", Ha, [
                (h(!0), k(Y, null, De(q(y), (D, L) => (h(), k("li", { key: L }, g(D), 1))), 128))
              ])) : w("", !0),
              v("div", Ga, [
                y.lines !== void 0 ? (h(), k("span", Ja, g(y.lines) + " line(s)", 1)) : w("", !0),
                y.audio_minutes !== void 0 ? (h(), k("span", Ka, g(y.audio_minutes) + " min", 1)) : w("", !0),
                y.lines_needing_translation ? (h(), k("span", Ya, g(y.lines_needing_translation) + " need translation", 1)) : w("", !0),
                y.lines_without_any_text ? (h(), k("span", Qa, g(y.lines_without_any_text) + " no text", 1)) : w("", !0)
              ]),
              he(y).length ? (h(), k("div", Xa, " e.g. " + g(he(y).join(", ")), 1)) : w("", !0),
              v("div", Za, [
                R(l(rt), {
                  modelValue: y.speaker,
                  "onUpdate:modelValue": [
                    (D) => y.speaker = D,
                    p[0] || (p[0] = (D) => ye())
                  ],
                  placeholder: "Speaker preset",
                  title: "Real CosyVoice preset this role resolves to",
                  class: "role-speaker",
                  onBlur: (D) => _e(S, y)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "onBlur"]),
                R(l(j), {
                  icon: "pi pi-microphone",
                  size: "small",
                  title: "Pick a speaker from the preset gallery",
                  onClick: (D) => X(S, y)
                }, null, 8, ["onClick"])
              ])
            ]))), 128))
          ], 4)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      R(Rn, {
        visible: ke.value,
        "onUpdate:visible": p[2] || (p[2] = (S) => ke.value = S),
        presets: u.value,
        "sample-dir": _.value,
        onSelect: Be
      }, null, 8, ["visible", "presets", "sample-dir"])
    ], 64));
  }
}, ss = /* @__PURE__ */ je(as, [["__scopeId", "data-v-df1a18b9"]]);
function ds({ node: a, projectRootWidget: s, openBrowseDialog: i, openVoDubLineEditor: r, openDubRolesEditor: f, queueVoDubRender: u }) {
  ot(import.meta.url);
  const _ = document.createElement("div");
  _.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const d = it(Mn, {
    node: a,
    projectRootWidget: s,
    openBrowseDialog: i,
    openVoDubLineEditor: r,
    openDubRolesEditor: f,
    queueVoDubRender: u
  });
  return d.use(lt, { ripple: !0 }), d.mount(_), { element: _, unmount: () => d.unmount() };
}
function cs({ root: a, bucket: s, renderApi: i }) {
  ot(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const f = it(ja, {
    root: a,
    bucket: s,
    renderApi: i || null,
    onClose: () => {
      f.unmount(), r.remove();
    }
  });
  f.use(lt, { ripple: !0 }), f.mount(r);
}
function ps({ root: a }) {
  ot(import.meta.url);
  const s = document.createElement("div");
  document.body.appendChild(s);
  const i = it(ss, {
    root: a,
    onClose: () => {
      i.unmount(), s.remove();
    }
  });
  i.use(lt, { ripple: !0 }), i.mount(s);
}
export {
  ds as mountVoDubBrowserPanel,
  ps as openDubRolesEditor,
  cs as openVoDubLineEditor
};
