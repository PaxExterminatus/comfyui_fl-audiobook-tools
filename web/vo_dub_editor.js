import { _ as $e, k as O, o as Le, T as Xe, c as z, d as g, b as A, u as t, F as ie, r as Se, t as L, Y as le, a as I, s as J, i as W, A as Vt, C as At, Z as Ke, D as Qe, H as ke, G as Ot, f as ue, n as ae, w as ce, g as oe, l as de, m as ye, M as pe, J as ne, S as Dt, X as Lt, V as fe, U as Ft, h as he, j as Oe, p as jt, q as zt, N as xt, $ as Ut, v as Fe, x as je, P as ze } from "./styles_link.js";
import { s as xe } from "./inputtext.esm.js";
import { c as Nt, b as Ue, u as et, a as tt, D as nt, s as Bt } from "./DialogHeader.js";
import { a as ot } from "./dropdown.esm.js";
import { g as Mt, s as qt, l as Ht, i as Wt, S as Gt, _ as Jt, I as Kt, L as Yt, f as Zt, u as Xt, e as Qt } from "./instruct_library.js";
const en = { class: "vo-dub-panel" }, tn = { class: "vo-dub-toolbar" }, nn = { class: "vo-dub-buckets" }, on = ["onClick"], sn = { class: "vo-dub-bucket-name" }, an = { class: "vo-dub-bucket-count" }, ln = { class: "vo-dub-bucket-pills" }, rn = {
  key: 0,
  class: "vo-dub-pill pill-no-text"
}, un = {
  key: 1,
  class: "vo-dub-pill pill-needs-translation"
}, dn = {
  key: 2,
  class: "vo-dub-pill pill-not-started"
}, cn = {
  key: 3,
  class: "vo-dub-pill pill-stale"
}, pn = {
  key: 4,
  class: "vo-dub-pill pill-done"
}, fn = {
  key: 5,
  class: "vo-dub-pill pill-unsupported",
  title: "Multi-channel rows this addon can't render or play"
}, vn = { class: "vo-dub-status" }, hn = 3e3, Ye = "FL_CosyVoice3.VODubLibrary.lastRoot", yn = {
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
    const o = e, n = O(o.projectRootWidget.value || localStorage.getItem(Ye) || ""), s = O([]), r = O(""), i = O(!1);
    let y = null;
    async function h() {
      if (!n.value) {
        s.value = [];
        return;
      }
      i.value = !0;
      try {
        const _ = await (await fetch(`${le}/tree?path=${encodeURIComponent(n.value)}`)).json();
        if (_.error) {
          r.value = _.error, s.value = [];
          return;
        }
        s.value = _.buckets || [], r.value = `${s.value.length} bucket(s), ${s.value.reduce((u, S) => u + S.count, 0)} row(s)`;
      } catch (k) {
        r.value = `Couldn't load: ${k}`;
      } finally {
        i.value = !1;
      }
    }
    function m() {
      o.openBrowseDialog({
        mode: "folder",
        startPath: n.value,
        onSelect: (k) => {
          n.value = k, o.projectRootWidget.value = k, localStorage.setItem(Ye, k), h();
        }
      });
    }
    function R(k) {
      o.openVoDubLineEditor({
        root: n.value,
        bucket: k.bucket,
        /*
         Only offered when this panel's node-wiring actually has a render
         mechanism (it always does in practice -- null only ever shows up
         in a test that doesn't pass one) -- see queueVoDubRender's own
         docstring in web/vo_dub_library.js for what it does.
        */
        renderApi: o.queueVoDubRender ? {
          renderRow: (_) => o.queueVoDubRender(o.node, _)
        } : null
      });
    }
    function D() {
      n.value && o.openDubRolesEditor({ root: n.value });
    }
    return Le(() => {
      h(), y = setInterval(h, hn);
    }), Xe(() => clearInterval(y)), (k, _) => (I(), z("div", en, [
      g("div", tn, [
        A(t(xe), {
          modelValue: n.value,
          "onUpdate:modelValue": _[0] || (_[0] = (u) => n.value = u),
          class: "vo-dub-root-input",
          placeholder: "VO dub project root (holds vo_dataset.csv)",
          onChange: _[1] || (_[1] = (u) => h())
        }, null, 8, ["modelValue"]),
        A(t(J), {
          label: "Browse...",
          size: "small",
          onClick: m
        }),
        A(t(J), {
          label: "Roles",
          size: "small",
          disabled: !n.value,
          title: "Assign a voice preset to each character tag",
          onClick: D
        }, null, 8, ["disabled"]),
        A(t(J), {
          icon: "pi pi-refresh",
          size: "small",
          text: "",
          title: "Re-scan",
          onClick: h
        })
      ]),
      g("div", nn, [
        (I(!0), z(ie, null, Se(s.value, (u) => (I(), z("div", {
          key: u.bucket,
          class: "vo-dub-bucket-row",
          onClick: (S) => R(u)
        }, [
          g("span", sn, L(u.bucket), 1),
          g("span", an, L(u.count), 1),
          g("span", ln, [
            u.no_text ? (I(), z("span", rn, "no text " + L(u.no_text), 1)) : W("", !0),
            u.needs_translation ? (I(), z("span", un, "needs RU " + L(u.needs_translation), 1)) : W("", !0),
            u.not_started ? (I(), z("span", dn, "not started " + L(u.not_started), 1)) : W("", !0),
            u.stale ? (I(), z("span", cn, "stale " + L(u.stale), 1)) : W("", !0),
            u.done ? (I(), z("span", pn, "done " + L(u.done), 1)) : W("", !0),
            u.unsupported ? (I(), z("span", fn, "unsupported " + L(u.unsupported), 1)) : W("", !0)
          ])
        ], 8, on))), 128))
      ]),
      g("div", vn, L(i.value ? "Loading..." : r.value), 1)
    ]));
  }
}, bn = /* @__PURE__ */ $e(yn, [["__scopeId", "data-v-ee8c5a8a"]]);
var mn = {
  root: function(o) {
    var n = o.instance, s = o.props;
    return ["p-checkbox p-component", {
      "p-highlight": n.checked,
      "p-disabled": s.disabled,
      "p-invalid": s.invalid,
      "p-variant-filled": s.variant ? s.variant === "filled" : n.$primevue.config.inputStyle === "filled"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, _n = Vt.extend({
  name: "checkbox",
  classes: mn
}), gn = {
  name: "BaseCheckbox",
  extends: At,
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
  style: _n,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
};
function kn(e) {
  return Cn(e) || $n(e) || Rn(e) || Sn();
}
function Sn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rn(e, o) {
  if (e) {
    if (typeof e == "string") return De(e, o);
    var n = Object.prototype.toString.call(e).slice(8, -1);
    if (n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set") return Array.from(e);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return De(e, o);
  }
}
function $n(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Cn(e) {
  if (Array.isArray(e)) return De(e);
}
function De(e, o) {
  (o == null || o > e.length) && (o = e.length);
  for (var n = 0, s = new Array(o); n < o; n++) s[n] = e[n];
  return s;
}
var Re = {
  name: "Checkbox",
  extends: gn,
  inheritAttrs: !1,
  emits: ["update:modelValue", "change", "focus", "blur"],
  methods: {
    getPTOptions: function(o) {
      var n = o === "root" ? this.ptmi : this.ptm;
      return n(o, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(o) {
      var n = this;
      if (!this.disabled && !this.readonly) {
        var s;
        this.binary ? s = this.checked ? this.falseValue : this.trueValue : this.checked ? s = this.modelValue.filter(function(r) {
          return !Ke.equals(r, n.value);
        }) : s = this.modelValue ? [].concat(kn(this.modelValue), [this.value]) : [this.value], this.$emit("update:modelValue", s), this.$emit("change", o);
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
      return this.binary ? this.modelValue === this.trueValue : Ke.contains(this.value, this.modelValue);
    }
  },
  components: {
    CheckIcon: Nt
  }
}, Pn = ["data-p-highlight", "data-p-disabled"], Tn = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"];
function En(e, o, n, s, r, i) {
  var y = Qe("CheckIcon");
  return I(), z("div", ke({
    class: e.cx("root")
  }, i.getPTOptions("root"), {
    "data-p-highlight": i.checked,
    "data-p-disabled": e.disabled
  }), [g("input", ke({
    id: e.inputId,
    type: "checkbox",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: e.name,
    checked: i.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    required: e.required,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: o[0] || (o[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: o[1] || (o[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onChange: o[2] || (o[2] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    })
  }, i.getPTOptions("input")), null, 16, Tn), g("div", ke({
    class: e.cx("box")
  }, i.getPTOptions("box")), [Ot(e.$slots, "icon", {
    checked: i.checked,
    class: ae(e.cx("icon"))
  }, function() {
    return [i.checked ? (I(), ue(y, ke({
      key: 0,
      class: e.cx("icon")
    }, i.getPTOptions("icon")), null, 16, ["class"])) : W("", !0)];
  })], 16)], 16, Pn);
}
Re.render = En;
function In(e, o) {
  if (e == null || o == null || e <= 0 || o <= 0 || typeof e != "number" || typeof o != "number")
    return { ratio: 1, percent: 0, label: "" };
  let n = o / e;
  n < 0.5 ? n = 0.5 : n > 2 && (n = 2);
  const s = Math.round((n - 1) * 100);
  let r = "";
  return s !== 0 && (r = `${s > 0 ? "+" : ""}${s}%`), { ratio: n, percent: s, label: r };
}
const wn = { class: "output-file-dialog-content" }, Vn = { class: "field-row" }, An = { class: "field-row" }, On = { class: "field-row speed-row" }, Dn = { class: "dialog-actions" }, Ln = {
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
  setup(e, { emit: o }) {
    const n = e, s = o, r = [
      { value: "", label: "No effect" },
      { value: "radio", label: "📻 Radio" },
      { value: "phone", label: "📞 Phone" },
      { value: "muffled", label: "🤫 Muffled" },
      { value: "radio_dry", label: "📻 Radio (no static)" },
      { value: "intercom", label: "🔊 Intercom" },
      { value: "suit", label: "🧑‍🚀 Suit" }
    ], i = O(n.effect), y = O(n.normalize), h = O(n.speed);
    ce(() => n.visible, (u) => {
      u && (i.value = n.effect, y.value = n.normalize, h.value = n.speed);
    });
    const m = de(() => In(n.enDurationS, n.ruDurationS)), R = de(() => m.value.label), D = de(() => !R.value);
    function k() {
      D.value || (h.value = m.value.ratio);
    }
    function _() {
      s("apply", {
        effect: i.value,
        normalize: y.value,
        speed: h.value
      }), s("update:visible", !1);
    }
    return (u, S) => (I(), ue(t(Ue), {
      visible: e.visible,
      modal: "",
      header: "Output File Settings",
      style: { width: "500px" },
      "onUpdate:visible": S[2] || (S[2] = (x) => u.$emit("update:visible", x))
    }, {
      default: oe(() => [
        g("div", wn, [
          g("div", Vn, [
            S[3] || (S[3] = g("label", null, "Effect:", -1)),
            A(t(ot), {
              modelValue: i.value,
              "onUpdate:modelValue": S[0] || (S[0] = (x) => i.value = x),
              options: r,
              optionLabel: "label",
              optionValue: "value"
            }, null, 8, ["modelValue"])
          ]),
          g("div", An, [
            S[4] || (S[4] = g("label", null, "Normalize:", -1)),
            A(t(Re), {
              modelValue: y.value,
              "onUpdate:modelValue": S[1] || (S[1] = (x) => y.value = x),
              binary: !0
            }, null, 8, ["modelValue"])
          ]),
          g("div", On, [
            g("span", null, "EN " + L(n.enDurationS != null ? n.enDurationS.toFixed(1) : "-") + "s", 1),
            g("span", null, "RU " + L(n.ruDurationS != null ? n.ruDurationS.toFixed(1) : "-") + "s", 1),
            A(t(J), {
              class: "speed-match-btn",
              label: R.value || "Match speed",
              disabled: D.value,
              onClick: k
            }, null, 8, ["label", "disabled"]),
            g("span", null, "Speed: " + L(h.value.toFixed(2)), 1)
          ]),
          g("div", Dn, [
            A(t(J), {
              label: "Apply",
              class: "apply-btn",
              onClick: _
            })
          ])
        ])
      ]),
      _: 1
    }, 8, ["visible"]));
  }
};
function Fn(e) {
  const { props: o } = e, n = 600, s = O([]), r = ne({}), i = O(""), y = O(""), h = O(""), m = O(!1), R = {
    "": "All statuses",
    no_text: "No source text",
    needs_translation: "Needs translation",
    not_started: "Not started",
    stale: "Stale",
    done: "Done",
    unsupported: "Unsupported (multi-channel)"
  }, D = Object.entries(R).map(([c, w]) => ({ value: c, label: w }));
  function k() {
    return ye(o.root, "_dub_state.json");
  }
  const _ = O(!1);
  async function u() {
    const w = await (await fetch(`${pe}/read?path=${encodeURIComponent(k())}`)).json();
    let F = { rows: {} };
    if (w.exists)
      try {
        const M = JSON.parse(w.content);
        M && typeof M.rows == "object" && (F = M);
      } catch (M) {
        console.warn("[FL CosyVoice3 VODubEditor] _dub_state.json is not valid JSON:", M);
      }
    Object.keys(r).forEach((M) => delete r[M]), Object.assign(r, F.rows), _.value = !!F.use_original_default;
  }
  async function S() {
    m.value = !0;
    try {
      const w = await (await fetch(
        `${le}/rows?path=${encodeURIComponent(o.root)}&bucket=${encodeURIComponent(o.bucket)}`
      )).json();
      if (w.error) {
        h.value = w.error, s.value = [];
        return;
      }
      s.value = w.rows || [];
      for (const F of s.value) {
        const M = r[F.audio_key] || (r[F.audio_key] = {});
        M.russian_text || (M.russian_text = F.russian || ""), M.instruct === void 0 && (M.instruct = F.instruct || ""), M.speaker_override === void 0 && (M.speaker_override = ""), M.effect === void 0 && (M.effect = "");
      }
      h.value = `${s.value.length} row(s) in ${o.bucket}`;
    } catch (c) {
      h.value = `Couldn't load: ${c}`;
    } finally {
      m.value = !1;
    }
  }
  function x(c) {
    return r[c.audio_key] || (r[c.audio_key] = {});
  }
  const U = O(null);
  function b() {
    U.value && clearTimeout(U.value), U.value = setTimeout(E, n);
  }
  async function E() {
    try {
      await fetch(`${pe}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: k(),
          content: JSON.stringify(
            { rows: r, use_original_default: _.value },
            null,
            2
          )
        })
      }), h.value = "Saved", S();
    } catch (c) {
      h.value = `Save failed: ${c}`;
    }
  }
  function v(c) {
    x(c), b();
  }
  function a(c) {
    h.value = c;
  }
  const C = de(() => {
    const c = y.value.trim().toLowerCase();
    return s.value.filter((w) => {
      if (i.value && w.status !== i.value) return !1;
      if (!c) return !0;
      const F = r[w.audio_key];
      return `${w.audio_key} ${w.speaker_tag} ${w.english} ${F && F.russian_text || w.russian}`.toLowerCase().includes(c);
    });
  }), B = 50, Z = O(0), l = de(
    () => Math.max(1, Math.ceil(C.value.length / B))
  ), f = de(() => {
    const c = Z.value * B;
    return C.value.slice(c, c + B);
  });
  return ce([i, y], () => {
    Z.value = 0;
  }), ce(C, () => {
    Z.value > l.value - 1 && (Z.value = Math.max(0, l.value - 1));
  }), {
    // состояние
    rows: s,
    stateRows: r,
    statusFilter: i,
    searchText: y,
    status: h,
    loading: m,
    useOriginalDefault: _,
    // доступ
    entryFor: x,
    // загрузка/сохранение
    loadState: u,
    loadRows: S,
    scheduleSave: b,
    flushSave: E,
    onTextEdit: v,
    setStatus: a,
    saveTimer: U,
    // ← экспортируется для main.close() и Render
    // фильтр/пагинация
    visibleRows: C,
    PAGE_SIZE: B,
    currentPage: Z,
    pageCount: l,
    pagedRows: f,
    // константы и утилиты
    SAVE_DEBOUNCE_MS: n,
    statePath: k,
    STATUS_LABELS: R,
    STATUS_FILTER_OPTIONS: D
  };
}
function jn(e) {
  const { props: o, setStatus: n } = e, s = O(!1), r = O(null), i = O([]), y = O(null), h = ne({});
  async function m() {
    try {
      const _ = await (await fetch(
        `${le}/line_history/counts?root=${encodeURIComponent(o.root)}`
      )).json();
      _ && !_.error && Object.assign(h, _);
    } catch (k) {
      console.error("[FL history] couldn't load version counts", k);
    }
  }
  async function R(k) {
    r.value = k;
    try {
      const u = await (await fetch(
        `${le}/line_history?root=${encodeURIComponent(o.root)}&audio_key=${encodeURIComponent(k.audio_key)}`
      )).json();
      i.value = u.versions || [], y.value = u.chosen_version ?? null;
    } catch (_) {
      console.error("[FL history] couldn't load line history", _), i.value = [], y.value = null;
    }
    s.value = !0;
  }
  async function D(k) {
    const _ = r.value;
    if (_)
      try {
        await fetch(`${le}/line_history/choose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            root: o.root,
            audio_key: _.audio_key,
            version: k
          })
        }), n(`Switched ${_.audio_key} to version ${k}`);
      } catch (u) {
        n(`Couldn't switch version: ${u.message || u}`);
      }
  }
  return {
    historyVisible: s,
    historyRow: r,
    historyVersions: i,
    historyChosenVersion: y,
    historyCounts: h,
    refreshHistoryCounts: m,
    openLineHistory: R,
    onHistoryVersionChosen: D
  };
}
function zn(e) {
  const { props: o, rows: n, entryFor: s, setStatus: r, scheduleSave: i } = e, y = O([]);
  async function h() {
    try {
      const E = await (await fetch(
        `${pe}/read?path=${encodeURIComponent(ye(o.root, "_dub_roles.json"))}`
      )).json();
      if (!E.exists) {
        y.value = [];
        return;
      }
      const v = JSON.parse(E.content), a = v && typeof v.roles == "object" && v.roles || {};
      y.value = Object.entries(a).map(([C, B]) => ({ code: C, ...B }));
    } catch {
      y.value = [];
    }
  }
  function m(b) {
    return [b.character, b.speaker].filter(Boolean).join(" -- ");
  }
  function R(b) {
    return (s(b).speaker_override || b.speaker_tag || "").trim();
  }
  const {
    popover: D,
    show: k,
    hide: _,
    info: u
  } = Mt(
    y,
    (b) => [
      ["character", b.character],
      ["gender", b.gender],
      ["actor", b.actor],
      ["description", b.description],
      ["dub direction", b.dub_direction],
      ["notes", Array.isArray(b.notes) ? b.notes.join(" ") : b.notes],
      ["voice", b.speaker]
    ].filter(([, E]) => E != null && E !== "")
  );
  function S(b) {
    const E = (b.speaker_tag || "").trim();
    return E ? n.value.filter(
      (v) => v !== b && v.status !== "unsupported" && (v.speaker_tag || "").trim() === E
    ).length : 0;
  }
  function x(b) {
    const E = S(b);
    return E > 0 ? `Apply this Role to every other "${b.speaker_tag}" row in this bucket (${E})` : "No other rows in this bucket share this Identifier";
  }
  function U(b) {
    const E = S(b);
    if (!E) return;
    const v = (b.speaker_tag || "").trim(), a = s(b).speaker_override || b.speaker_tag;
    n.value.forEach((C) => {
      C !== b && C.status !== "unsupported" && (C.speaker_tag || "").trim() === v && (s(C).speaker_override = a);
    }), i(), r(`Applied Role to ${E} other "${v}" row(s) in this bucket`);
  }
  return {
    roleEntries: y,
    loadRoleEntries: h,
    roleCodeFor: R,
    roleOptionSubLabel: m,
    sameIdentifierCount: S,
    applyRoleTitle: x,
    applyRoleToSameIdentifier: U,
    roleInfoPopover: D,
    showRoleInfoPopover: k,
    hideRoleInfoPopover: _,
    roleInfoFields: u
  };
}
function xn(e) {
  const {
    props: o,
    rows: n,
    entryFor: s,
    onTextEdit: r,
    setStatus: i,
    scheduleSave: y,
    roleCodeFor: h
  } = e, m = O([]);
  function R() {
    return ye(o.root, "_instruct_categories.json");
  }
  async function D() {
    try {
      const f = await (await fetch(
        `${pe}/read?path=${encodeURIComponent(R())}`
      )).json();
      if (!f.exists) {
        m.value = [];
        return;
      }
      const c = JSON.parse(f.content);
      m.value = c && c.categories || [];
    } catch {
      m.value = [];
    }
  }
  const k = /* @__PURE__ */ new Map();
  function _(l) {
    clearTimeout(k.get(l.audio_key)), k.set(
      l.audio_key,
      setTimeout(async () => {
        const f = s(l).instruct, c = await qt(
          pe,
          R(),
          f
        );
        c && (m.value = c);
      }, 600)
      // синхронно с SAVE_DEBOUNCE_MS из state
    );
  }
  const u = O(!1), S = O(null);
  function x(l) {
    S.value = l, u.value = !0;
  }
  const U = ne({});
  function b(l) {
    const f = S.value;
    f && (U[f.audio_key] = s(f).instruct, s(f).instruct = l, r(f), _(f));
  }
  function E(l) {
    return U[l.audio_key] !== void 0 ? `Restore previous instruct: "${U[l.audio_key]}"` : "No previous instruct to restore";
  }
  function v(l) {
    if (U[l.audio_key] === void 0) return;
    const f = s(l).instruct;
    s(l).instruct = U[l.audio_key], U[l.audio_key] = f, r(l);
  }
  function a(l) {
    const f = (s(l).instruct || "").trim(), c = m.value.find(
      (w) => (w.examples || []).some((F) => F.trim() === f)
    );
    return c ? c.title : null;
  }
  function C(l) {
    const f = h(l);
    return f ? n.value.filter(
      (c) => c !== l && c.status !== "unsupported" && h(c) === f
    ).length : 0;
  }
  function B(l) {
    const f = C(l);
    return f > 0 ? `Apply this instruct to every other "${h(l)}" row in this bucket (${f})` : "No other rows in this bucket use this role";
  }
  function Z(l) {
    const f = C(l);
    if (!f) return;
    const c = h(l), w = s(l).instruct;
    n.value.forEach((F) => {
      F !== l && F.status !== "unsupported" && h(F) === c && (s(F).instruct = w);
    }), y(), i(`Applied instruct to ${f} other "${c}" row(s) in this bucket`);
  }
  return {
    instructCategories: m,
    loadInstructCategories: D,
    instructPickerVisible: u,
    instructPickerRow: S,
    openInstructPicker: x,
    onInstructPicked: b,
    prevInstruct: U,
    undoInstructTitle: E,
    undoInstruct: v,
    instructNoteFor: a,
    sameRoleCount: C,
    applyInstructTitle: B,
    applyInstructToSameRole: Z
  };
}
function Un(e) {
  const {
    props: o,
    entryFor: n,
    onTextEdit: s,
    setStatus: r,
    loadRows: i,
    effectPreviews: y
    // shared Map из main
    // hasRuTake — через ctx.hasRuTake?.(row) в момент вызова (Render позже)
  } = e, h = [
    { value: "", label: "No effect" },
    { value: "radio", label: "📻 Radio" },
    { value: "phone", label: "📞 Phone" },
    { value: "muffled", label: "🤫 Muffled" },
    { value: "radio_dry", label: "📻 Radio (no static)" },
    { value: "intercom", label: "🔊 Intercom" },
    { value: "suit", label: "🧑‍🚀 Suit" }
  ], m = ne({});
  function R(v) {
    const a = m[v.audio_key];
    return a !== void 0 ? a : n(v).effect || "";
  }
  function D(v) {
    const a = m[v.audio_key];
    return a !== void 0 && a !== (n(v).effect || "");
  }
  function k(v, a) {
    var C;
    m[v.audio_key] = a, (C = y.get(v.audio_key)) == null || C.setEffect(a);
  }
  function _(v) {
    m[v.audio_key] !== void 0 && (n(v).effect = m[v.audio_key], delete m[v.audio_key]);
  }
  function u(v) {
    var a;
    _(v), s(v), (a = e.hasRuTake) != null && a.call(e, v) && S(v);
  }
  async function S(v) {
    r(`Applying effect to ${v.audio_key}...`);
    try {
      const C = await (await fetch(`${le}/apply_effect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          root: o.root,
          audio_key: v.audio_key,
          effect: n(v).effect || ""
        })
      })).json();
      if (C.error) {
        r(`Couldn't apply effect to ${v.audio_key}: ${C.error}`);
        return;
      }
      const B = await e.currentContentHash(v);
      n(v).hash = B, await e.finalizeRuTake(v, B), r(`Applied effect to ${v.audio_key}`), await i();
    } catch (a) {
      r(`Couldn't apply effect to ${v.audio_key}: ${a}`);
    }
  }
  const x = O(!1), U = O(null);
  function b(v) {
    U.value = v, x.value = !0;
  }
  function E(v) {
    var B;
    const a = U.value;
    if (!a) return;
    const C = n(a);
    C.effect = v.effect, C.normalize = v.normalize, C.speed = v.speed, s(a), (B = e.hasRuTake) != null && B.call(e, a) && S(a);
  }
  return {
    EFFECT_OPTIONS: h,
    previewEffect: m,
    effectValue: R,
    effectIsDirty: D,
    onEffectPicked: k,
    commitEffect: _,
    saveEffect: u,
    applyEffectToFile: S,
    outputDialogVisible: x,
    dialogRow: U,
    openOutputDialog: b,
    onDialogApply: E
  };
}
const st = 3;
function Ze(e) {
  let o = !1;
  e.addEventListener("play", () => {
    if (o || e.readyState >= st) return;
    o = !0, e.pause();
    const n = () => {
      e.removeEventListener("canplaythrough", n), o = !1, e.play().catch(() => {
      });
    };
    e.addEventListener("canplaythrough", n);
  });
}
function Ve(e) {
  return new Promise((o) => {
    if (e.readyState >= st) {
      o();
      return;
    }
    const n = () => {
      e.removeEventListener("canplaythrough", n), o();
    };
    e.addEventListener("canplaythrough", n), e.load();
  });
}
let Ae = null;
function Nn() {
  const e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  return e ? (Ae || (Ae = new e()), Ae) : null;
}
function Bn(e, o = 1024) {
  const n = new Float32Array(o), s = Math.tanh(e) || 1;
  for (let r = 0; r < o; r++) {
    const i = r / (o - 1) * 2 - 1;
    n[r] = Math.tanh(i * e) / s;
  }
  return n;
}
function Mn(e, o, n) {
  const r = e.createBuffer(1, Math.max(1, Math.floor(e.sampleRate * 2)), e.sampleRate), i = r.getChannelData(0);
  for (let R = 0; R < i.length; R++) i[R] = Math.random() * 2 - 1;
  const y = e.createBufferSource();
  y.buffer = r, y.loop = !0;
  const h = e.createBiquadFilter();
  h.type = "highpass", h.frequency.value = o;
  const m = e.createBiquadFilter();
  return m.type = "lowpass", m.frequency.value = n, y.connect(h), h.connect(m), y.start(), m;
}
function ve(e, { lowHz: o, highHz: n, drive: s, noiseLevel: r }) {
  const i = e.createBiquadFilter();
  i.type = "highpass", i.frequency.value = o;
  const y = e.createBiquadFilter();
  y.type = "lowpass", y.frequency.value = n, i.connect(y);
  let h = y;
  if (s > 0) {
    const D = e.createWaveShaper();
    D.curve = Bn(s), D.oversample = "2x", y.connect(D), h = D;
  }
  if (r <= 0) return { input: i, output: h };
  const m = e.createGain();
  m.gain.value = r, Mn(e, o, n).connect(m);
  const R = e.createGain();
  return h.connect(R), m.connect(R), { input: i, output: R };
}
const qn = {
  radio: (e) => ve(e, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0.05 }),
  phone: (e) => ve(e, { lowHz: 300, highHz: 3400, drive: 1.05, noiseLevel: 0 }),
  /*
   Wide passband, no clip, no noise -- a natural muffled quality, not a
   telephony one. See nodes/_audio_effects.py's muffled_effect for the
   same params and the reasoning/reference behind them.
  */
  muffled: (e) => ve(e, { lowHz: 120, highHz: 6e3, drive: 0, noiseLevel: 0 }),
  /*
   radio's band and grit with NO static of its own -- for dubbing a game
   that already layers its own channel noise over the line as a separate
   sound, where baking in a second layer would stack the two. See
   nodes/_audio_effects.py's radio_dry_effect for the case behind it.
  */
  radio_dry: (e) => ve(e, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0 }),
  /*
   Hard-wired intercom/PA panel -- between phone and radio at both ends,
   more grit than phone, no static.
  */
  intercom: (e) => ve(e, { lowHz: 250, highHz: 4e3, drive: 1.2, noiseLevel: 0 }),
  /*
   Inside a sealed helmet -- low end largely kept, only the top rolled
   off, drive below 1.0 so the clip stays in its near-identity region.
  */
  suit: (e) => ve(e, { lowHz: 150, highHz: 5e3, drive: 0.6, noiseLevel: 0 })
};
function Hn(e) {
  const o = { setEffect() {
  } }, n = Nn();
  if (!n) return o;
  let s;
  try {
    s = n.createMediaElementSource(e);
  } catch {
    return o;
  }
  const r = n.createGain();
  r.gain.value = e.paused ? 0 : 1, r.connect(n.destination);
  function i() {
    r.gain.value = e.paused ? 0 : 1;
  }
  e.addEventListener("play", i), e.addEventListener("pause", i), e.addEventListener("ended", i);
  const y = n.createGain();
  s.connect(y), y.connect(r);
  const h = {};
  function m(k) {
    if (h[k]) return h[k];
    const _ = qn[k];
    if (!_) return null;
    const u = _(n);
    s.connect(u.input);
    const S = n.createGain();
    return S.gain.value = 0, u.output.connect(S), S.connect(r), h[k] = S, S;
  }
  let R = "";
  function D(k) {
    const _ = k || "";
    if (_ === R) return;
    if (R && h[R] && (h[R].gain.value = 0), R = "", !_) {
      y.gain.value = 1;
      return;
    }
    const u = m(_);
    if (!u) {
      y.gain.value = 1;
      return;
    }
    R = _, y.gain.value = 0, u.gain.value = 1, n.state === "suspended" && n.resume().catch(() => {
    });
  }
  return { setEffect: D };
}
function Wn(e) {
  const {
    props: o,
    pagedRows: n,
    effectValue: s,
    effectPreviews: r
    // hasRuTake — через ctx.hasRuTake?.() в момент вызова (Render позже)
  } = e;
  function i(l, f) {
    return ye(ye(o.root, l), `${f}.wav`);
  }
  function y(l, f, c) {
    const w = `${Dt}/audio?path=${encodeURIComponent(i(l, f))}`;
    return c ? `${w}&v=${c}` : w;
  }
  function h(l) {
    return i("audio_ru", l.audio_key);
  }
  function m(l) {
    return i("_dub_dry", l.audio_key);
  }
  const R = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map();
  function k(l, f) {
    if (!f) {
      R.delete(l);
      return;
    }
    R.set(l, f), Ze(f);
  }
  function _(l, f) {
    const c = l.audio_key;
    if (!f) {
      D.delete(c), r.delete(c);
      return;
    }
    D.set(c, f), Ze(f);
    const w = Hn(f);
    r.set(c, w), w.setEffect(s(l));
  }
  const u = ne(/* @__PURE__ */ new Set()), S = ne(/* @__PURE__ */ new Set());
  function x(l, f) {
    if (u.delete(l.audio_key), f === "ru" && b.value === l.audio_key) {
      const c = D.get(l.audio_key);
      c && !c.ended && v();
    }
  }
  async function U(l) {
    const f = R.get(l.audio_key), c = D.get(l.audio_key);
    if (!(!f || !c)) {
      if (u.has(l.audio_key) || S.has(l.audio_key)) {
        S.delete(l.audio_key), u.delete(l.audio_key), f.pause(), c.pause();
        return;
      }
      f.pause(), c.pause(), f.currentTime = 0, c.currentTime = 0, S.add(l.audio_key), await Promise.all([Ve(f), Ve(c)]), S.delete(l.audio_key), R.has(l.audio_key) && (f.currentTime = 0, c.currentTime = 0, u.add(l.audio_key), f.play().catch(() => {
      }), c.play().catch(() => {
      }));
    }
  }
  const b = O(null);
  let E = null;
  function v() {
    var f;
    E && (E.el.removeEventListener("ended", E.fn), E = null);
    const l = b.value;
    b.value = null, l && ((f = D.get(l)) == null || f.pause());
  }
  async function a(l) {
    var p, j;
    v();
    const f = n.value;
    let c = l;
    for (; c < f.length && !((p = e.hasRuTake) != null && p.call(e, f[c])); ) c++;
    if (c >= f.length) return;
    const w = f[c], F = D.get(w.audio_key);
    if (!F || (b.value = w.audio_key, (j = B.get(w.audio_key)) == null || j.scrollIntoView({ behavior: "smooth", block: "nearest" }), await Ve(F), b.value !== w.audio_key)) return;
    const M = () => {
      F.removeEventListener("ended", M), E = null, a(c + 1);
    };
    E = { el: F, fn: M }, F.addEventListener("ended", M), F.currentTime = 0, F.play().catch(() => {
    });
  }
  function C() {
    b.value ? v() : a(0);
  }
  const B = /* @__PURE__ */ new Map();
  function Z(l, f) {
    if (!f) {
      B.delete(l);
      return;
    }
    B.set(l, f);
  }
  return {
    rawAudioPath: i,
    audioUrl: y,
    ruFilePath: h,
    dryFilePath: m,
    setEnAudioRef: k,
    setRuAudioRef: _,
    dualPlayingRows: u,
    dualLoadingRows: S,
    playBoth: U,
    onTrackPaused: x,
    sequentialPlayingKey: b,
    stopSequentialPlayback: v,
    playSequentialFrom: a,
    toggleSequentialPlayback: C,
    rowEls: B,
    setRowRef: Z
  };
}
function Gn(e) {
  const {
    props: o,
    rows: n,
    entryFor: s,
    onTextEdit: r,
    setStatus: i,
    loadRows: y,
    scheduleSave: h,
    useOriginalDefault: m
  } = e;
  function R(p) {
    const j = s(p).use_original_sample;
    return j === void 0 ? m.value : !!j;
  }
  function D(p, j) {
    s(p).use_original_sample = j, r(p);
  }
  function k() {
    h();
  }
  const _ = ne(/* @__PURE__ */ new Set()), u = ne({}), S = ne(/* @__PURE__ */ new Set()), x = ne({});
  function U(p, j) {
    x[p.audio_key] = j.target.duration;
  }
  function b(p, j = 8e3) {
    return new Promise((H) => {
      const q = new Audio();
      let Q = !1;
      const K = ($) => {
        Q || (Q = !0, q.removeEventListener("loadedmetadata", G), q.removeEventListener("error", se), H($));
      }, G = () => K(q.duration || null), se = () => K(null);
      q.addEventListener("loadedmetadata", G), q.addEventListener("error", se), setTimeout(() => K(null), j), q.preload = "metadata", q.src = p;
    });
  }
  function E(p) {
    return p.status === "done" || p.status === "stale" || _.has(p.audio_key);
  }
  function v(p) {
    return !!s(p).manually_done;
  }
  function a(p) {
    s(p).manually_done = !v(p), r(p);
  }
  async function C(p) {
    const j = s(p), H = p.speaker, q = j.instruct || "", Q = j.russian_text || "", K = j.effect || "";
    let G = q;
    return K && (G += `\0effect=${K}`), R(p) && (G += "\0sample=original"), Ht(H, G, Q);
  }
  async function B(p, j) {
    var Q;
    const H = Date.now(), q = await b(
      ((Q = e.audioUrl) == null ? void 0 : Q.call(e, "audio_ru", p.audio_key, H)) || ""
    );
    await fetch(`${le}/mark_rendered`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        root: o.root,
        audio_key: p.audio_key,
        hash: j,
        duration_s: q
      })
    }), q !== null && (x[p.audio_key] = q), _.add(p.audio_key), u[p.audio_key] = H;
  }
  async function Z(p) {
    var j, H, q, Q, K;
    if (!(!o.renderApi || S.has(p.audio_key))) {
      if (!o.root) {
        i("Project root is not set. Please set it in the project root input above.");
        return;
      }
      S.add(p.audio_key), i(`Rendering ${p.audio_key}...`);
      try {
        (j = e.commitEffect) == null || j.call(e, p), clearTimeout(e.saveTimer), await ((H = e.flushSave) == null ? void 0 : H.call(e));
        const G = s(p), se = p.speaker, $ = G.instruct || "", P = G.russian_text || "", N = G.effect || "", T = R(p) && ((q = e.rawAudioPath) == null ? void 0 : q.call(e, "audio_en", p.audio_key)) || "", X = await C(p), ee = ((Q = e.ruFilePath) == null ? void 0 : Q.call(e, p)) || "", me = ((K = e.dryFilePath) == null ? void 0 : K.call(e, p)) || "";
        await o.renderApi.renderRow({
          audioKey: p.audio_key,
          speaker: se,
          instruct: $,
          russianText: P,
          effect: N,
          outputPath: ee,
          dryOutputPath: me,
          referenceAudioPath: T
        }), G.hash = X, await B(p, X), i(`Rendered ${p.audio_key}`), await y();
      } catch (G) {
        i(`Render failed for ${p.audio_key}: ${G}`);
      } finally {
        S.delete(p.audio_key);
      }
    }
  }
  const l = O(!1);
  async function f() {
    if (!o.renderApi || l.value) return;
    const p = n.value.filter(
      (H) => H.status === "not_started" || H.status === "stale"
    );
    if (!p.length) {
      i("Nothing needs rendering in this bucket");
      return;
    }
    l.value = !0;
    let j = 0;
    i(`Rendering 0/${p.length}...`);
    try {
      for (const H of p) {
        try {
          await Z(H);
        } catch (q) {
          console.error(
            `[FL CosyVoice3 VODubEditor] render-all-pending failed for ${H.audio_key}`,
            q
          );
        }
        j++, i(`Rendering ${j}/${p.length}...`);
      }
    } finally {
      l.value = !1;
    }
  }
  const c = 0.15, w = 0.4;
  function F(p) {
    return p.duration_s ? `EN ${p.duration_s.toFixed(1)}s` : "EN";
  }
  function M(p) {
    const j = x[p.audio_key] ?? p.rendered_duration_s, H = p.duration_s;
    if (!E(p) || j === void 0 || j === null || !H)
      return null;
    const q = (j - H) / H, Q = Math.round(q * 100), K = Math.abs(q);
    return {
      level: K <= c ? "good" : K <= w ? "warn" : "bad",
      ruSeconds: `${j.toFixed(1)}s`,
      pctText: `${Q >= 0 ? "+" : ""}${Q}%`
    };
  }
  return {
    // служебное
    renderedOnce: _,
    cacheBust: u,
    renderingKeys: S,
    isRenderingAllPending: l,
    DURATION_GREEN: c,
    DURATION_AMBER: w,
    // hash / финализация
    currentContentHash: C,
    finalizeRuTake: B,
    // рендер
    renderRow: Z,
    renderAllPending: f,
    // состояние строки
    hasRuTake: E,
    manuallyDone: v,
    toggleManuallyDone: a,
    // длительность
    measuredDuration: x,
    onRuMetadata: U,
    durationBadge: M,
    enDurationText: F,
    // «use original as sample»
    resolvedUseOriginal: R,
    onToggleRowUseOriginal: D,
    onToggleUseOriginalDefault: k
  };
}
function Jn(e) {
  const {
    // каталог и UI
    roleEntries: o,
    roleOptionSubLabel: n,
    showRoleInfoPopover: s,
    hideRoleInfoPopover: r,
    fontSizePx: i,
    autoGrow: y,
    setTextareaRef: h,
    // state
    entryFor: m,
    onTextEdit: R,
    scheduleInstructLibrarySave: D,
    // roles
    roleCodeFor: k,
    // instruct
    prevInstruct: _,
    undoInstructTitle: u,
    undoInstruct: S,
    sameRoleCount: x,
    applyInstructTitle: U,
    applyInstructToSameRole: b,
    instructNoteFor: E,
    openInstructPicker: v
  } = e;
  Lt("lineRowApi", {
    // ── общий каталог и UI ─────────────────────────────────────────────
    roleEntries: o,
    roleOptionSubLabel: n,
    fontSizePx: i,
    autoGrow: y,
    setTextareaRef: h,
    showRoleInfoPopover: s,
    hideRoleInfoPopover: r,
    // ── подписи, специфичные для VO Dub ────────────────────────────────
    speakerPlaceholder: "Role",
    speakerTitle: "Role code (resolves to that role's assigned voice), or a literal preset/preset#tag",
    instructPlaceholder: "Instruct",
    instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
    textPlaceholder: "Russian text for this line",
    // ── доступ к полям row (специфично для VO Dub) ─────────────────────
    // speaker override — отдельное поле; fallback на сырой csv-тег.
    getSpeaker: (a) => m(a).speaker_override || a.speaker_tag,
    setSpeaker: (a, C) => {
      m(a).speaker_override = C, R(a);
    },
    getInstruct: (a) => m(a).instruct,
    setInstruct: (a, C) => {
      m(a).instruct = C, R(a), D(a);
    },
    getText: (a) => m(a).russian_text,
    setText: (a, C) => {
      m(a).russian_text = C, R(a);
    },
    // идентификатор для ховер-инфо — итоговый код роли, не сам override.
    getRoleInfoCode: (a) => k(a),
    // ключ для textarea-ref: у VO Dub — audio_key.
    textKey: (a) => a.audio_key,
    // ── instruct-действия ──────────────────────────────────────────────
    canUndoInstruct: (a) => _[a.audio_key] !== void 0,
    undoInstructTitle: (a) => u(a),
    undoInstruct: (a) => S(a),
    canApplyInstruct: (a) => x(a) > 0,
    applyInstructTitle: (a) => U(a),
    applyInstructToSameRole: (a) => b(a),
    instructNoteFor: (a) => E(a),
    openInstructPicker: (a) => v(a)
  });
}
const Kn = { class: "fl-vo-dub-line-editor-content" }, Yn = { class: "vo-dub-filters" }, Zn = { class: "vo-dub-editor-status" }, Xn = { class: "actions-row" }, Qn = {
  class: "vo-dub-original-default-label",
  title: "Project-wide default for the per-row 'Use original as sample' checkbox below each line -- a row that has ticked/unticked its OWN checkbox always keeps that explicit choice regardless of this default."
}, eo = { class: "vo-dub-pager" }, to = { class: "vo-dub-pager-label" }, no = { class: "vo-dub-row-head" }, oo = { class: "vo-dub-key" }, so = {
  key: 0,
  class: "vo-dub-unsupported-note"
}, ao = { class: "vo-dub-players" }, io = { class: "vo-dub-players-labels" }, lo = { class: "vo-dub-duration-en-tag" }, ro = { class: "vo-dub-players-row" }, uo = { class: "vo-dub-player" }, co = ["src", "onPause", "onEnded"], po = { class: "vo-dub-player" }, fo = ["src", "onLoadedmetadata", "onPause", "onEnded"], vo = {
  key: 2,
  class: "vo-dub-no-take"
}, ho = { class: "vo-dub-players-footer" }, yo = {
  class: "vo-dub-identifier",
  title: "Identifier extracted from the game's own resources (vo_dataset.csv's speaker column) -- not necessarily a real role, just the raw signal this row's audio_key carried"
}, bo = {
  class: "vo-dub-use-original-label",
  title: "Use this row's own EN reference take (audio_en\\) as the TTS voice-cloning sample for its NEXT render, instead of the Role above -- unticked follows the project-wide default checkbox in the toolbar unless this row's own box has been explicitly touched. Whether an instruct style can still apply together with this depends on your ComfyUI graph/model -- this addon just passes the resolved reference_audio_path through, it doesn't wire it to a specific node."
}, mo = { class: "vo-dub-english" }, _o = {
  key: 0,
  class: "vo-dub-empty"
}, go = {
  __name: "VoDubLineEditorContent",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const o = e, { setWidth: n, presets: s } = et({
      storageKey: "FL_CosyVoice3.VODubLineEditor.widthPx",
      defaultWidth: 1100,
      presets: [800, 1100, 1500]
    }), { fontSizePx: r, decrease: i, increase: y } = tt({
      storageKey: "FL_CosyVoice3.VODubLineEditor.fontSizePx",
      defaultSize: 13
    }), { autoGrow: h, setTextareaRef: m, regrowAll: R } = Xt();
    ce(r, R);
    const D = /* @__PURE__ */ new Map(), k = O(!0);
    let _ = !1;
    const u = {
      props: o,
      effectPreviews: D,
      autoGrow: h,
      setTextareaRef: m,
      fontSizePx: r
    };
    Object.assign(u, Fn(u)), Object.assign(u, jn(u)), Object.assign(u, zn(u)), Object.assign(u, xn(u)), Object.assign(u, Un(u)), Object.assign(u, Wn(u)), Object.assign(u, Gn(u)), Jn(u);
    const {
      // state
      rows: S,
      stateRows: x,
      statusFilter: U,
      searchText: b,
      status: E,
      loading: v,
      useOriginalDefault: a,
      entryFor: C,
      loadState: B,
      loadRows: Z,
      scheduleSave: l,
      flushSave: f,
      onTextEdit: c,
      setStatus: w,
      visibleRows: F,
      PAGE_SIZE: M,
      currentPage: p,
      pageCount: j,
      pagedRows: H,
      STATUS_LABELS: q,
      STATUS_FILTER_OPTIONS: Q,
      saveTimer: K,
      // history
      historyVisible: G,
      historyRow: se,
      historyVersions: $,
      historyChosenVersion: P,
      historyCounts: N,
      refreshHistoryCounts: T,
      openLineHistory: X,
      onHistoryVersionChosen: ee,
      // roles
      roleEntries: me,
      loadRoleEntries: at,
      roleCodeFor: qo,
      roleOptionSubLabel: Ho,
      sameIdentifierCount: it,
      applyRoleTitle: lt,
      applyRoleToSameIdentifier: rt,
      roleInfoPopover: Ce,
      showRoleInfoPopover: Wo,
      hideRoleInfoPopover: Go,
      roleInfoFields: Ne,
      // instruct
      instructCategories: ut,
      loadInstructCategories: dt,
      instructPickerVisible: Pe,
      instructPickerRow: Jo,
      openInstructPicker: Ko,
      onInstructPicked: ct,
      prevInstruct: Yo,
      undoInstructTitle: Zo,
      undoInstruct: Xo,
      instructNoteFor: Qo,
      sameRoleCount: es,
      applyInstructTitle: ts,
      applyInstructToSameRole: ns,
      // effects
      effectValue: pt,
      commitEffect: os,
      applyEffectToFile: ss,
      outputDialogVisible: Te,
      dialogRow: te,
      openOutputDialog: ft,
      onDialogApply: vt,
      // players
      audioUrl: _e,
      setEnAudioRef: ht,
      setRuAudioRef: yt,
      dualPlayingRows: Be,
      dualLoadingRows: bt,
      playBoth: mt,
      onTrackPaused: ge,
      sequentialPlayingKey: Ee,
      toggleSequentialPlayback: _t,
      setRowRef: gt,
      // render
      cacheBust: Me,
      renderingKeys: qe,
      isRenderingAllPending: Ie,
      renderRow: kt,
      renderAllPending: St,
      hasRuTake: re,
      manuallyDone: we,
      toggleManuallyDone: Rt,
      measuredDuration: $t,
      onRuMetadata: Ct,
      durationBadge: be,
      enDurationText: Pt,
      resolvedUseOriginal: Tt,
      onToggleRowUseOriginal: Et,
      onToggleUseOriginalDefault: It
    } = u;
    function wt() {
      _ || (_ = !0, K.value && (clearTimeout(K.value), f()), o.onClose());
    }
    return ce(k, (He) => {
      He || wt();
    }), Le(async () => {
      at(), dt(), T(), await B(), await Z();
    }), (He, V) => {
      var Ge, Je;
      const We = Qe("WaveformCanvas");
      return I(), z(ie, null, [
        g("div", Kn, [
          A(nt, {
            title: `VO Dub — ${e.bucket}`,
            "width-presets": t(s),
            "set-width": t(n),
            "font-size-decrease": t(i),
            "font-size-increase": t(y)
          }, null, 8, ["title", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
          A(Gt, { class: "vo-dub-editor-controls" }, {
            default: oe(() => [
              g("div", Yn, [
                A(t(xe), {
                  modelValue: t(b),
                  "onUpdate:modelValue": V[0] || (V[0] = (d) => fe(b) ? b.value = d : null),
                  placeholder: "Search text or audio_key...",
                  class: "vo-dub-search"
                }, null, 8, ["modelValue"]),
                A(t(ot), {
                  modelValue: t(U),
                  "onUpdate:modelValue": V[1] || (V[1] = (d) => fe(U) ? U.value = d : null),
                  options: t(Q),
                  "option-label": "label",
                  "option-value": "value",
                  class: "vo-dub-status-filter"
                }, null, 8, ["modelValue", "options"]),
                A(t(J), {
                  icon: "pi pi-refresh",
                  text: "",
                  size: "small",
                  title: "Re-scan this bucket",
                  onClick: t(Z)
                }, null, 8, ["onClick"]),
                g("span", Zn, L(t(v) ? "Loading..." : t(E)), 1),
                A(t(J), {
                  icon: "pi pi-times",
                  text: "",
                  size: "small",
                  title: "Close",
                  onClick: V[2] || (V[2] = (d) => k.value = !1)
                })
              ]),
              g("div", Xn, [
                A(t(J), {
                  label: "´ Stress mark",
                  text: "",
                  size: "small",
                  title: "Insert a stress mark at the cursor: click into a row's text, place the cursor right after the vowel to stress (факел|ов), then click this",
                  onMousedown: V[3] || (V[3] = Ft((d) => t(Wt)(t(w)), ["prevent"]))
                }),
                V[11] || (V[11] = g("span", { class: "actions-divider" }, null, -1)),
                A(t(J), {
                  label: t(Ee) ? "Stop" : "▶ Play in order",
                  text: "",
                  size: "small",
                  icon: t(Ee) ? "pi pi-stop-circle" : "pi pi-play",
                  title: "Play through this page's RU takes in order, auto-advancing to the next row with a take when each one ends -- mirrors LineEditorApp.vue's own sequential playback. Pausing a row via its own native controls stops the run instead of continuing past it.",
                  onClick: t(_t)
                }, null, 8, ["label", "icon", "onClick"]),
                A(t(J), {
                  label: t(Ie) ? "Rendering..." : "🔁 Render pending",
                  text: "",
                  size: "small",
                  icon: t(Ie) ? "pi pi-spin pi-spinner" : "pi pi-play",
                  disabled: !o.renderApi || t(Ie),
                  title: "Render every not-started or stale row in this WHOLE bucket (not just this page), one at a time -- mirrors ScriptLibraryPanel.vue's own '🔁 Re-voice pending' button.",
                  onClick: t(St)
                }, null, 8, ["label", "icon", "disabled", "onClick"]),
                V[12] || (V[12] = g("span", { class: "actions-divider" }, null, -1)),
                g("label", Qn, [
                  A(t(Re), {
                    modelValue: t(a),
                    "onUpdate:modelValue": V[4] || (V[4] = (d) => fe(a) ? a.value = d : null),
                    binary: "",
                    onChange: t(It)
                  }, null, 8, ["modelValue", "onChange"]),
                  V[10] || (V[10] = he(" Use original as sample by default ", -1))
                ])
              ]),
              g("div", eo, [
                A(t(J), {
                  label: "◀ Prev",
                  text: "",
                  size: "small",
                  disabled: t(p) === 0,
                  title: "Previous page",
                  onClick: V[5] || (V[5] = (d) => p.value--)
                }, null, 8, ["disabled"]),
                g("span", to, "Page " + L(t(p) + 1) + " / " + L(t(j)) + " (" + L(t(F).length) + " row(s))", 1),
                A(t(J), {
                  label: "Next ▶",
                  text: "",
                  size: "small",
                  disabled: t(p) >= t(j) - 1,
                  title: "Next page",
                  onClick: V[6] || (V[6] = (d) => p.value++)
                }, null, 8, ["disabled"])
              ])
            ]),
            _: 1
          }),
          g("div", {
            class: "vo-dub-rows",
            style: Oe({ fontSize: `${t(r)}px` })
          }, [
            (I(!0), z(ie, null, Se(t(H), (d) => (I(), z("div", {
              key: d.audio_key,
              class: ae(["vo-dub-row", { "row-playing": t(Ee) === d.audio_key }]),
              ref_for: !0,
              ref: (Y) => t(gt)(d.audio_key, Y)
            }, [
              g("div", no, [
                g("span", oo, L(d.audio_key), 1),
                g("span", {
                  class: ae(["vo-dub-status-pill", `status-${d.status}`])
                }, L(t(q)[d.status]), 3),
                t(re)(d) ? (I(), ue(t(J), {
                  key: 0,
                  class: ae(["vo-dub-done-btn", { active: t(we)(d) }]),
                  text: "",
                  size: "small",
                  icon: t(we)(d) ? "pi pi-check-circle" : "pi pi-circle",
                  label: t(we)(d) ? "Done" : "Mark done",
                  title: "Manually treat this row as done even if its content has drifted since the last render -- sticky until you click it again to unmark it. Doesn't touch the file or the render hash, only how this row's status reads.",
                  onClick: (Y) => t(Rt)(d)
                }, null, 8, ["class", "icon", "label", "onClick"])) : W("", !0)
              ]),
              d.status === "unsupported" ? (I(), z("div", so, [
                he(" Unsupported: " + L(d.channels) + "-channel audio split across multiple files (", 1),
                V[13] || (V[13] = g("code", null, ".a", -1)),
                V[14] || (V[14] = he("-", -1)),
                V[15] || (V[15] = g("code", null, ".d", -1)),
                V[16] || (V[16] = he(") -- this editor can only play or render a single mono/stereo file per row. Handle this one outside the tool. ", -1))
              ])) : (I(), z(ie, { key: 1 }, [
                g("div", ao, [
                  g("div", io, [
                    g("span", lo, L(t(Pt)(d)), 1),
                    t(be)(d) ? (I(), z(ie, { key: 0 }, [
                      V[17] || (V[17] = g("span", { class: "vo-dub-duration-vs" }, "vs", -1)),
                      g("span", {
                        class: ae(["vo-dub-duration-tag", `badge-${t(be)(d).level}`])
                      }, L(t(be)(d).ruSeconds) + " RU", 3),
                      g("span", {
                        class: ae(["vo-dub-duration-delta", `badge-${t(be)(d).level}`])
                      }, L(t(be)(d).pctText), 3)
                    ], 64)) : W("", !0)
                  ]),
                  g("div", ro, [
                    g("div", uo, [
                      A(We, {
                        src: t(_e)("audio_en", d.audio_key),
                        class: "vo-dub-waveform"
                      }, null, 8, ["src"]),
                      g("audio", {
                        controls: "",
                        preload: "none",
                        src: t(_e)("audio_en", d.audio_key),
                        ref_for: !0,
                        ref: (Y) => t(ht)(d.audio_key, Y),
                        onPause: (Y) => t(ge)(d, "en"),
                        onEnded: (Y) => t(ge)(d, "en")
                      }, null, 40, co)
                    ]),
                    A(t(J), {
                      class: ae(["play-both-btn", { playing: t(Be).has(d.audio_key) }]),
                      size: "small",
                      label: "Play both",
                      icon: t(bt).has(d.audio_key) ? "pi pi-spin pi-spinner" : t(Be).has(d.audio_key) ? "pi pi-pause" : "pi pi-play",
                      disabled: !t(re)(d),
                      title: t(re)(d) ? "Play EN and RU together, from the start" : "No RU take yet -- nothing to compare",
                      onClick: (Y) => t(mt)(d)
                    }, null, 8, ["class", "icon", "disabled", "title", "onClick"]),
                    g("div", po, [
                      t(re)(d) ? (I(), ue(We, {
                        key: 0,
                        src: t(_e)("audio_ru", d.audio_key, t(Me)[d.audio_key]),
                        class: "vo-dub-waveform"
                      }, null, 8, ["src"])) : W("", !0),
                      t(re)(d) ? (I(), z("audio", {
                        key: 1,
                        controls: "",
                        preload: "none",
                        crossorigin: "anonymous",
                        src: t(_e)("audio_ru", d.audio_key, t(Me)[d.audio_key]),
                        ref_for: !0,
                        ref: (Y) => t(yt)(d, Y),
                        onLoadedmetadata: (Y) => t(Ct)(d, Y),
                        onPause: (Y) => t(ge)(d, "ru"),
                        onEnded: (Y) => t(ge)(d, "ru")
                      }, null, 40, fo)) : (I(), z("span", vo, "not rendered yet"))
                    ])
                  ]),
                  g("div", ho, [
                    o.renderApi ? (I(), ue(t(J), {
                      key: 0,
                      class: ae(["vo-dub-render-btn", { stale: d.status === "stale" }]),
                      size: "small",
                      label: t(re)(d) ? "Re-render" : "Render",
                      icon: t(qe).has(d.audio_key) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                      disabled: t(qe).has(d.audio_key),
                      title: t(re)(d) ? "Re-render this row and write it to audio_ru\\" : "Render this row and write it to audio_ru\\",
                      onClick: (Y) => t(kt)(d)
                    }, null, 8, ["class", "label", "icon", "disabled", "title", "onClick"])) : W("", !0),
                    A(t(J), {
                      icon: "pi pi-history",
                      size: "small",
                      text: "",
                      label: t(N)[d.audio_key] ? String(t(N)[d.audio_key]) : "",
                      title: "Line history (previous takes/versions)",
                      onClick: (Y) => t(X)(d)
                    }, null, 8, ["label", "onClick"]),
                    A(t(J), {
                      icon: "pi pi-cog",
                      size: "small",
                      title: "Edit output settings",
                      onClick: (Y) => t(ft)(d),
                      class: "output-settings-btn"
                    }, null, 8, ["onClick"])
                  ])
                ]),
                A(Jt, { row: d }, {
                  leading: oe(() => [
                    g("span", yo, L(d.speaker_tag || "—"), 1),
                    A(t(J), {
                      icon: "pi pi-copy",
                      size: "small",
                      class: "apply-role-btn",
                      disabled: t(it)(d) === 0,
                      title: t(lt)(d),
                      onClick: (Y) => t(rt)(d)
                    }, null, 8, ["disabled", "title", "onClick"]),
                    g("label", bo, [
                      A(t(Re), {
                        "model-value": t(Tt)(d),
                        binary: "",
                        "onUpdate:modelValue": (Y) => t(Et)(d, Y)
                      }, null, 8, ["model-value", "onUpdate:modelValue"]),
                      V[18] || (V[18] = he(" 🎙️ Original as sample ", -1))
                    ])
                  ]),
                  "above-text": oe(() => [
                    g("div", mo, L(d.english), 1)
                  ]),
                  _: 2
                }, 1032, ["row"])
              ], 64))
            ], 2))), 128)),
            t(F).length ? W("", !0) : (I(), z("div", _o, "No rows match this filter."))
          ], 4)
        ]),
        A(Kt, {
          visible: t(Pe),
          "onUpdate:visible": V[7] || (V[7] = (d) => fe(Pe) ? Pe.value = d : null),
          categories: t(ut),
          onSelect: t(ct)
        }, null, 8, ["visible", "categories", "onSelect"]),
        A(Yt, {
          visible: t(G),
          "onUpdate:visible": V[8] || (V[8] = (d) => fe(G) ? G.value = d : null),
          versions: t($),
          "chosen-version": t(P),
          original: ((Ge = t(se)) == null ? void 0 : Ge.english) || "",
          onSelect: t(ee)
        }, null, 8, ["visible", "versions", "chosen-version", "original", "onSelect"]),
        A(Zt, {
          visible: t(Ce).visible,
          left: t(Ce).left,
          top: t(Ce).top,
          message: t(Ne).message,
          fields: t(Ne).fields
        }, null, 8, ["visible", "left", "top", "message", "fields"]),
        A(Ln, {
          visible: t(Te),
          "onUpdate:visible": V[9] || (V[9] = (d) => fe(Te) ? Te.value = d : null),
          audioKey: (Je = t(te)) == null ? void 0 : Je.audio_key,
          effect: t(te) ? t(pt)(t(te)) : "",
          normalize: t(te) ? t(C)(t(te)).normalize : !1,
          speed: t(te) ? t(C)(t(te)).speed : 1,
          enDurationS: t(te) ? t(te).duration_s : null,
          ruDurationS: t(te) ? t($t)[t(te).audio_key] ?? t(te).rendered_duration_s : null,
          onApply: t(vt)
        }, null, 8, ["visible", "audioKey", "effect", "normalize", "speed", "enDurationS", "ruDurationS", "onApply"])
      ], 64);
    };
  }
}, ko = /* @__PURE__ */ $e(go, [["__scopeId", "data-v-50ec3154"]]), So = {
  __name: "VoDubLineEditor",
  props: {
    root: { type: String, required: !0 },
    bucket: { type: String, required: !0 },
    renderApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const o = e, n = O(!0);
    return ce(n, (s) => {
      s || o.onClose();
    }), (s, r) => (I(), ue(t(Ue), {
      visible: n.value,
      "onUpdate:visible": r[0] || (r[0] = (i) => n.value = i),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: { width: "1600px" },
      class: "vo-dub-editor-dialog"
    }, {
      default: oe(() => [
        A(ko, jt(zt(s.$props)), null, 16)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}, Ro = /* @__PURE__ */ $e(So, [["__scopeId", "data-v-47ef3de4"]]), $o = { class: "role-head" }, Co = { class: "role-name" }, Po = {
  class: "role-code",
  title: "Role code -- read-only here, this addon doesn't own this file's identity model"
}, To = ["title"], Eo = {
  key: 1,
  class: "role-actor"
}, Io = {
  key: 0,
  class: "role-description"
}, wo = {
  key: 1,
  class: "role-dub-direction"
}, Vo = {
  key: 2,
  class: "role-notes"
}, Ao = { class: "role-stats" }, Oo = { key: 0 }, Do = { key: 1 }, Lo = { key: 2 }, Fo = { key: 3 }, jo = {
  key: 3,
  class: "role-examples",
  title: "Longest lines for this role -- a quick sample to listen to"
}, zo = { class: "role-speaker-row" }, xo = 600, Uo = 3e3, No = 1500, Bo = {
  __name: "DubRolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(e) {
    const o = e, n = ye(o.root, "_dub_roles.json"), s = O(!0), r = O({ roles: {} }), i = O([]), y = O(""), h = O(""), m = O(!1), { cssWidth: R, setWidth: D, presets: k } = et({
      storageKey: "FL_CosyVoice3.DubRolesEditor.widthPx",
      defaultWidth: 1200,
      presets: [900, 1200]
    }), { fontSizePx: _, decrease: u, increase: S } = tt({
      storageKey: "FL_CosyVoice3.DubRolesEditor.fontSizePx",
      defaultSize: 13
    });
    let x = null, U = 0, b = null, E = null;
    const v = /* @__PURE__ */ new Map();
    function a($) {
      h.value = $;
    }
    const C = de(() => {
      var P;
      const $ = ((P = r.value) == null ? void 0 : P.roles) || {};
      return Object.entries($).sort((N, T) => {
        var X, ee;
        return (((X = T[1]) == null ? void 0 : X.lines) || 0) - (((ee = N[1]) == null ? void 0 : ee.lines) || 0);
      });
    });
    function B($, P) {
      return $.character || P;
    }
    function Z($) {
      return Array.isArray($.notes) ? $.notes : [];
    }
    function l($) {
      return Array.isArray($.longest_files) ? $.longest_files : [];
    }
    function f() {
      return JSON.stringify(r.value, null, 2);
    }
    async function c() {
      const $ = f();
      if ($ !== x)
        try {
          const N = await (await fetch(`${pe}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: n, content: $ })
          })).json();
          if (N.error) {
            a(`Save error: ${N.error}`);
            return;
          }
          x = $, a(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (P) {
          a(`Save failed: ${P}`);
        }
    }
    function w() {
      U = Date.now(), b && clearTimeout(b), b = setTimeout(c, xo);
    }
    function F($, P) {
      v.get($) !== P.speaker && (v.set($, P.speaker), Ut(o.root, $).then((T) => a(T.message)));
    }
    function M($, P) {
      w(), F($, P);
    }
    async function p() {
      try {
        const P = await (await fetch(xt)).json();
        i.value = P.presets || [], y.value = P.dir || "";
      } catch {
        i.value = [], y.value = "";
      }
    }
    const j = O(!1), H = O(null);
    function q($, P) {
      H.value = [$, P], j.value = !0;
    }
    function Q($) {
      const P = H.value;
      if (!P) return;
      const [N, T] = P;
      T.speaker = $, M(N, T);
    }
    async function K({ isPoll: $ = !1 } = {}) {
      try {
        const N = await (await fetch(`${pe}/read?path=${encodeURIComponent(n)}`)).json();
        if (N.error) {
          a(`Read error: ${N.error}`);
          return;
        }
        if (!N.exists) {
          $ || (r.value = { roles: {} }, x = "", a('_dub_roles.json does not exist yet -- click "Seed from dataset" below'));
          return;
        }
        if ($ && Date.now() - U < No || N.content === x) return;
        let T;
        try {
          T = JSON.parse(N.content);
        } catch (ee) {
          a(`_dub_roles.json is not valid JSON: ${ee}`);
          return;
        }
        const X = T && typeof T.roles == "object" && T.roles || {};
        for (const ee of Object.values(X))
          ee && typeof ee == "object" && ee.speaker === void 0 && (ee.speaker = "");
        r.value = { ...T, roles: X };
        for (const [ee, me] of Object.entries(X))
          v.set(ee, me.speaker);
        x = f(), $ || a(`Loaded ${C.value.length} role(s)`);
      } catch (P) {
        a(`Read failed: ${P}`);
      }
    }
    async function G() {
      m.value = !0;
      try {
        const P = await (await fetch(`${le}/seed_roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: o.root })
        })).json();
        if (P.error) {
          a(`Seed error: ${P.error}`);
          return;
        }
        await K(), a(P.added.length ? `Added ${P.added.length} role(s): ${P.added.join(", ")}` : "Nothing new to add");
      } catch ($) {
        a(`Seed failed: ${$}`);
      } finally {
        m.value = !1;
      }
    }
    function se() {
      b && (clearTimeout(b), c());
      for (const [$, P] of C.value) F($, P);
      E && clearInterval(E), o.onClose();
    }
    return ce(s, ($) => {
      $ || se();
    }), Le(async () => {
      p(), await K(), E = setInterval(() => K({ isPoll: !0 }), Uo);
    }), Xe(() => {
      E && clearInterval(E);
    }), ($, P) => (I(), z(ie, null, [
      A(t(Ue), {
        visible: s.value,
        "onUpdate:visible": P[1] || (P[1] = (N) => s.value = N),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: Oe({ width: t(R) }),
        class: "roles-dialog"
      }, {
        header: oe(() => [
          A(nt, {
            title: "VO Dub Roles",
            status: h.value,
            "width-presets": t(k),
            "set-width": t(D),
            "font-size-decrease": t(u),
            "font-size-increase": t(S)
          }, {
            after: oe(() => [
              A(t(J), {
                label: "Seed from dataset",
                size: "small",
                text: "",
                icon: m.value ? "pi pi-spin pi-spinner" : "pi pi-database",
                disabled: m.value,
                title: "Add every distinct speaker tag from vo_dataset.csv that isn't a role here yet",
                onClick: G
              }, null, 8, ["icon", "disabled"])
            ]),
            _: 1
          }, 8, ["status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"])
        ]),
        default: oe(() => [
          C.value.length ? W("", !0) : (I(), ue(t(Bt), {
            key: 0,
            severity: "info",
            closable: !1
          }, {
            default: oe(() => [...P[3] || (P[3] = [
              he(' No roles yet -- click "Seed from dataset" above to create one per distinct speaker tag. ', -1)
            ])]),
            _: 1
          })),
          g("div", {
            class: "roles-list",
            style: Oe({ fontSize: `${t(_)}px` })
          }, [
            (I(!0), z(ie, null, Se(C.value, ([N, T]) => (I(), z("div", {
              key: N,
              class: "role-card"
            }, [
              g("div", $o, [
                g("span", Co, L(B(T, N)), 1),
                g("span", Po, L(N), 1),
                T.gender ? (I(), z("span", {
                  key: 0,
                  class: "role-gender",
                  title: T.gender_evidence || ""
                }, L(T.gender), 9, To)) : W("", !0),
                T.actor ? (I(), z("span", Eo, L(T.actor), 1)) : W("", !0)
              ]),
              T.description ? (I(), z("p", Io, L(T.description), 1)) : W("", !0),
              T.dub_direction ? (I(), z("p", wo, L(T.dub_direction), 1)) : W("", !0),
              Z(T).length ? (I(), z("ul", Vo, [
                (I(!0), z(ie, null, Se(Z(T), (X, ee) => (I(), z("li", { key: ee }, L(X), 1))), 128))
              ])) : W("", !0),
              g("div", Ao, [
                T.lines !== void 0 ? (I(), z("span", Oo, L(T.lines) + " line(s)", 1)) : W("", !0),
                T.audio_minutes !== void 0 ? (I(), z("span", Do, L(T.audio_minutes) + " min", 1)) : W("", !0),
                T.lines_needing_translation ? (I(), z("span", Lo, L(T.lines_needing_translation) + " need translation", 1)) : W("", !0),
                T.lines_without_any_text ? (I(), z("span", Fo, L(T.lines_without_any_text) + " no text", 1)) : W("", !0)
              ]),
              l(T).length ? (I(), z("div", jo, " e.g. " + L(l(T).join(", ")), 1)) : W("", !0),
              g("div", zo, [
                A(t(xe), {
                  modelValue: T.speaker,
                  "onUpdate:modelValue": [
                    (X) => T.speaker = X,
                    P[0] || (P[0] = (X) => w())
                  ],
                  placeholder: "Speaker preset",
                  title: "Real CosyVoice preset this role resolves to",
                  class: "role-speaker",
                  onBlur: (X) => F(N, T)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "onBlur"]),
                A(t(J), {
                  icon: "pi pi-microphone",
                  size: "small",
                  title: "Pick a speaker from the preset gallery",
                  onClick: (X) => q(N, T)
                }, null, 8, ["onClick"])
              ])
            ]))), 128))
          ], 4)
        ]),
        _: 1
      }, 8, ["visible", "style"]),
      A(Qt, {
        visible: j.value,
        "onUpdate:visible": P[2] || (P[2] = (N) => j.value = N),
        presets: i.value,
        "sample-dir": y.value,
        onSelect: Q
      }, null, 8, ["visible", "presets", "sample-dir"])
    ], 64));
  }
}, Mo = /* @__PURE__ */ $e(Bo, [["__scopeId", "data-v-df1a18b9"]]);
function ds({ node: e, projectRootWidget: o, openBrowseDialog: n, openVoDubLineEditor: s, openDubRolesEditor: r, queueVoDubRender: i }) {
  Fe(import.meta.url);
  const y = document.createElement("div");
  y.style.cssText = "width:100%;height:100%;box-sizing:border-box;";
  const h = je(bn, {
    node: e,
    projectRootWidget: o,
    openBrowseDialog: n,
    openVoDubLineEditor: s,
    openDubRolesEditor: r,
    queueVoDubRender: i
  });
  return h.use(ze, { ripple: !0 }), h.mount(y), { element: y, unmount: () => h.unmount() };
}
function cs({ root: e, bucket: o, renderApi: n }) {
  Fe(import.meta.url);
  const s = document.createElement("div");
  document.body.appendChild(s);
  const r = je(Ro, {
    root: e,
    bucket: o,
    renderApi: n || null,
    onClose: () => {
      r.unmount(), s.remove();
    }
  });
  r.use(ze, { ripple: !0 }), r.mount(s);
}
function ps({ root: e }) {
  Fe(import.meta.url);
  const o = document.createElement("div");
  document.body.appendChild(o);
  const n = je(Mo, {
    root: e,
    onClose: () => {
      n.unmount(), o.remove();
    }
  });
  n.use(ze, { ripple: !0 }), n.mount(o);
}
export {
  ds as mountVoDubBrowserPanel,
  ps as openDubRolesEditor,
  cs as openVoDubLineEditor
};
