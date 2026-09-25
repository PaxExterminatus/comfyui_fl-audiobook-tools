import { y as V, G as B, b as u, i as p, C as z, D as G, _ as L, c as x, a as d, u as l, g as T, h as I, d as c, j as N, F as A, n as P, e as m, t as b, r as Z, N as W, s as E, S as Q, m as _, f as ee, l as te, L as se, J as D } from "./styles_link.js";
import { u as O, a as j, s as M, D as K, b as H } from "./DialogHeader.js";
import { a as J, b as ne, s as ae } from "./dropdown.esm.js";
import { s as ie } from "./inputtext.esm.js";
var re = {
  root: "p-inputgroup"
}, oe = V.extend({
  name: "inputgroup",
  classes: re
}), le = {
  name: "BaseInputGroup",
  extends: B,
  style: oe,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, R = {
  name: "InputGroup",
  extends: le,
  inheritAttrs: !1
};
function ue(e, t, n, a, i, r) {
  return u(), p("div", G({
    class: e.cx("root")
  }, e.ptmi("root")), [z(e.$slots, "default")], 16);
}
R.render = ue;
var de = {
  root: "p-inputgroup-addon"
}, ce = V.extend({
  name: "inputgroupaddon",
  classes: de
}), pe = {
  name: "BaseInputGroupAddon",
  extends: B,
  style: ce,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, F = {
  name: "InputGroupAddon",
  extends: pe,
  inheritAttrs: !1
};
function fe(e, t, n, a, i, r) {
  return u(), p("div", G({
    class: e.cx("root")
  }, e.ptmi("root")), [z(e.$slots, "default")], 16);
}
F.render = fe;
const me = { class: "sticky-panel" }, ye = {
  __name: "StickyPanel",
  setup(e) {
    return (t, n) => (u(), p("div", me, [
      z(t.$slots, "default", {}, void 0, !0)
    ]));
  }
}, He = /* @__PURE__ */ L(ye, [["__scopeId", "data-v-3edd6ab3"]]), ve = { class: "instruct-example-list" }, he = ["onClick"], ge = {
  __name: "InstructPickerDialog",
  props: {
    visible: { type: Boolean, required: !0 },
    categories: { type: Array, default: () => [] }
  },
  emits: ["update:visible", "select"],
  setup(e, { emit: t }) {
    const { cssWidth: n, setWidth: a, presets: i } = O({
      storageKey: "FL_CosyVoice3.InstructPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: r, decrease: s, increase: o } = j({
      storageKey: "FL_CosyVoice3.InstructPicker.fontSizePx",
      defaultSize: 13
    }), y = t;
    function w($) {
      y("select", $), y("update:visible", !1);
    }
    return ($, k) => (u(), x(l(H), {
      visible: e.visible,
      modal: "",
      header: " ",
      style: P({ width: l(n) }),
      "onUpdate:visible": k[0] || (k[0] = (h) => $.$emit("update:visible", h))
    }, {
      header: d(() => [
        m(K, {
          title: "Pick an instruct phrase",
          "width-presets": l(i),
          "set-width": l(a),
          "font-size-decrease": l(s),
          "font-size-increase": l(o)
        }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: d(() => [
        e.categories.length ? I("", !0) : (u(), x(l(M), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: d(() => [...k[1] || (k[1] = [
            T(" No _instruct_categories.json found for this project -- you can still type any instruct text directly. ", -1)
          ])]),
          _: 1
        })),
        c("div", {
          class: "instruct-categories-grid",
          style: P({ fontSize: `${l(r)}px` })
        }, [
          (u(!0), p(A, null, N(e.categories, (h) => (u(), x(l(J), {
            key: h.name,
            class: "instruct-category-card"
          }, {
            title: d(() => [
              T(b(h.title), 1)
            ]),
            subtitle: d(() => [
              T(b(h.when), 1)
            ]),
            content: d(() => [
              c("ul", ve, [
                (u(!0), p(A, null, N(h.examples, (C) => (u(), p("li", { key: C }, [
                  c("button", {
                    type: "button",
                    class: "instruct-example-btn",
                    onClick: (S) => w(C)
                  }, b(C), 9, he)
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
}, Je = /* @__PURE__ */ L(ge, [["__scopeId", "data-v-0d135846"]]);
function be(e) {
  if (!e) return "#353535";
  let t = 0;
  for (let n = 0; n < e.length; n++) t = t * 31 + e.charCodeAt(n) >>> 0;
  return `hsl(${t % 360}, 55%, 55%, 0.3)`;
}
function ke(e) {
  const t = (e || "").toUpperCase().replace(/[^A-ZА-Я0-9]/g, "");
  if (!t) return "?";
  const n = t[0], a = [...t.slice(1)].find((i) => i !== n);
  return a ? n + a : n;
}
const $e = ["onClick"], Se = { class: "speaker-card-text" }, we = { class: "speaker-name" }, xe = {
  key: 0,
  class: "speaker-usage"
}, Pe = ["onClick"], Ie = {
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
  setup(e, { emit: t }) {
    const n = e, a = t, { cssWidth: i, setWidth: r, presets: s } = O({
      storageKey: "FL_CosyVoice3.SpeakerPicker.widthPx",
      defaultWidth: 900,
      presets: [700, 900]
    }), { fontSizePx: o, decrease: y, increase: w } = j({
      storageKey: "FL_CosyVoice3.SpeakerPicker.fontSizePx",
      defaultSize: 13
    });
    function $(g) {
      a("select", g), a("update:visible", !1);
    }
    const k = Z(null);
    let h = null;
    function C(g, v) {
      return `${Q}/audio?path=${encodeURIComponent(_(n.sampleDir, `${g}.${v}`))}`;
    }
    function S() {
      h == null || h.pause(), h = null, k.value = null;
    }
    function q(g) {
      if (k.value === g) {
        S();
        return;
      }
      if (S(), !n.sampleDir) return;
      const v = new Audio(C(g, "mp3"));
      let f = !1;
      v.addEventListener("error", () => {
        if (f) {
          k.value === g && S();
          return;
        }
        f = !0, v.src = C(g, "wav"), v.play().catch(() => S());
      }), v.addEventListener("ended", () => {
        k.value === g && S();
      }), v.play().catch(() => S()), h = v, k.value = g;
    }
    return (g, v) => (u(), x(l(H), {
      visible: e.visible,
      modal: "",
      header: " ",
      style: P({ width: l(i) }),
      "onUpdate:visible": v[0] || (v[0] = (f) => {
        S(), g.$emit("update:visible", f);
      })
    }, {
      header: d(() => [
        m(K, {
          title: "Pick a speaker",
          "width-presets": l(s),
          "set-width": l(r),
          "font-size-decrease": l(y),
          "font-size-increase": l(w)
        }, null, 8, ["width-presets", "set-width", "font-size-decrease", "font-size-increase"])
      ]),
      default: d(() => [
        e.presets.length ? I("", !0) : (u(), x(l(M), {
          key: 0,
          severity: "info",
          closable: !1
        }, {
          default: d(() => [...v[1] || (v[1] = [
            T(" No saved speaker presets found. ", -1)
          ])]),
          _: 1
        })),
        c("div", {
          class: "speaker-grid",
          style: P({ fontSize: `${l(o)}px` })
        }, [
          (u(!0), p(A, null, N(e.presets, (f) => (u(), x(l(J), {
            key: f,
            class: "speaker-card"
          }, {
            content: d(() => [
              c("div", {
                class: "speaker-card-row",
                onClick: (X) => $(f)
              }, [
                c("div", {
                  class: "speaker-avatar",
                  style: P({ backgroundColor: l(be)(f) })
                }, b(l(ke)(f)), 5),
                c("div", Se, [
                  c("div", we, b(f), 1),
                  e.usageFor && e.usageFor(f) ? (u(), p("div", xe, b(e.usageFor(f)), 1)) : I("", !0)
                ]),
                c("span", {
                  class: "speaker-play-wrap",
                  onClick: W((X) => q(f), ["stop"])
                }, [
                  m(l(E), {
                    icon: k.value === f ? "pi pi-pause" : "pi pi-play",
                    size: "small",
                    disabled: !e.sampleDir,
                    title: "Preview this speaker's sample"
                  }, null, 8, ["icon", "disabled"])
                ], 8, Pe)
              ], 8, $e)
            ]),
            _: 2
          }, 1024))), 128))
        ], 4)
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, Ye = /* @__PURE__ */ L(Ie, [["__scopeId", "data-v-f6109d98"]]), Ce = { class: "dropdown-option-label" }, ze = {
  key: 0,
  class: "dropdown-option-sublabel"
}, Ae = {
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
  setup(e, { emit: t }) {
    const n = t;
    return (a, i) => (u(), x(l(ne), {
      "model-value": e.modelValue,
      options: e.roleEntries,
      "option-label": "code",
      "option-value": "code",
      editable: "",
      filter: "",
      placeholder: e.placeholder,
      title: e.title,
      class: "role-dropdown",
      "onUpdate:modelValue": i[0] || (i[0] = (r) => n("update:modelValue", r))
    }, {
      option: d(({ option: r }) => [
        c("div", Ce, b(r.code), 1),
        e.optionSubLabel(r) ? (u(), p("div", ze, b(e.optionSubLabel(r)), 1)) : I("", !0)
      ]),
      _: 1
    }, 8, ["model-value", "options", "placeholder", "title"]));
  }
}, Te = /* @__PURE__ */ L(Ae, [["__scopeId", "data-v-4b129755"]]), Ee = { class: "line-controls-row" }, Fe = {
  key: 0,
  class: "instruct-desc"
}, qe = {
  __name: "LineRowEditor",
  props: {
    // speaker / role
    speaker: { type: String, default: "" },
    roleEntries: { type: Array, default: () => [] },
    roleOptionSubLabel: { type: Function, default: () => "" },
    speakerPlaceholder: { type: String, default: "Speaker" },
    speakerTitle: { type: String, default: "Speaker (role code, or a literal preset/preset#tag)" },
    /*
     What the info-hover looks up -- may differ from `speaker` itself
     (VO Dub's per-row override falls back to the row's raw csv tag when
     empty; the info popover should still resolve THAT identity).
    */
    roleInfoCode: { type: String, default: "" },
    // instruct
    instruct: { type: String, default: "" },
    instructPlaceholder: { type: String, default: "Instruct" },
    instructTitle: { type: String, default: "Instruct text -- type freely, or pick from the phrase bank" },
    canUndoInstruct: { type: Boolean, default: !1 },
    undoInstructTitle: { type: String, default: "" },
    canApplyInstruct: { type: Boolean, default: !1 },
    applyInstructTitle: { type: String, default: "" },
    instructNote: { type: String, default: "" },
    // text
    text: { type: String, default: "" },
    textPlaceholder: { type: String, default: "" },
    fontSizePx: { type: Number, default: 13 },
    /*
     Forwarded straight to the underlying Textarea's own `ref` -- the
     caller's own useTextareaAutoGrow() Map (see textarea_autogrow.js)
     needs the real node, this component has no tracking of its own.
    */
    textareaRef: { type: Function, default: null },
    /*
     Called after a paste (see onPaste) -- preventDefault there skips
     PrimeVue's own resize, so the caller's autoGrow needs an explicit
     nudge same as it does after loading fresh content.
    */
    onAutoGrow: { type: Function, default: null }
  },
  emits: [
    "update:speaker",
    "update:instruct",
    "update:text",
    "open-instruct-picker",
    "undo-instruct",
    "apply-instruct",
    "role-info-enter",
    "role-info-leave"
  ],
  setup(e, { emit: t }) {
    const n = e, a = t;
    function i(r) {
      var $;
      r.preventDefault();
      const s = r.target, o = (r.clipboardData || window.clipboardData).getData("text").replace(/[\r\n]+/g, " "), y = s.selectionStart, w = s.selectionEnd;
      s.value = s.value.slice(0, y) + o + s.value.slice(w), s.selectionStart = s.selectionEnd = y + o.length, a("update:text", s.value), ($ = n.onAutoGrow) == null || $.call(n, s);
    }
    return (r, s) => (u(), p(A, null, [
      c("div", Ee, [
        z(r.$slots, "leading"),
        m(l(R), { class: "speaker-group" }, {
          default: d(() => [
            m(l(F), null, {
              default: d(() => [...s[9] || (s[9] = [
                c("i", { class: "pi pi-address-book" }, null, -1)
              ])]),
              _: 1
            }),
            m(Te, {
              "model-value": e.speaker,
              "role-entries": e.roleEntries,
              "option-sub-label": e.roleOptionSubLabel,
              placeholder: e.speakerPlaceholder,
              title: e.speakerTitle,
              "onUpdate:modelValue": s[0] || (s[0] = (o) => a("update:speaker", o))
            }, null, 8, ["model-value", "role-entries", "option-sub-label", "placeholder", "title"]),
            m(l(F), {
              class: "role-info-btn",
              onMouseenter: s[1] || (s[1] = (o) => a("role-info-enter", o.target, e.roleInfoCode)),
              onMouseleave: s[2] || (s[2] = (o) => a("role-info-leave"))
            }, {
              default: d(() => [...s[10] || (s[10] = [
                c("i", { class: "pi pi-info-circle" }, null, -1)
              ])]),
              _: 1
            })
          ]),
          _: 1
        }),
        m(l(R), { class: "instruct-group" }, {
          default: d(() => [
            m(l(F), null, {
              default: d(() => [...s[11] || (s[11] = [
                c("i", { class: "pi pi-book" }, null, -1)
              ])]),
              _: 1
            }),
            m(l(E), {
              icon: "pi pi-undo",
              size: "small",
              class: "instruct-undo-btn",
              disabled: !e.canUndoInstruct,
              title: e.undoInstructTitle,
              onClick: s[3] || (s[3] = (o) => a("undo-instruct"))
            }, null, 8, ["disabled", "title"]),
            m(l(ie), {
              "model-value": e.instruct,
              placeholder: e.instructPlaceholder,
              title: e.instructTitle,
              "onUpdate:modelValue": s[4] || (s[4] = (o) => a("update:instruct", o))
            }, null, 8, ["model-value", "placeholder", "title"]),
            m(l(E), {
              icon: "pi pi-th-large",
              size: "small",
              title: "Pick an instruct phrase from the category bank",
              onClick: s[5] || (s[5] = (o) => a("open-instruct-picker"))
            }),
            m(l(E), {
              icon: "pi pi-users",
              size: "small",
              class: "apply-instruct-btn",
              disabled: !e.canApplyInstruct,
              title: e.applyInstructTitle,
              onClick: s[6] || (s[6] = (o) => a("apply-instruct"))
            }, null, 8, ["disabled", "title"])
          ]),
          _: 1
        }),
        z(r.$slots, "trailing")
      ]),
      e.instructNote ? (u(), p("div", Fe, "↳ " + b(e.instructNote), 1)) : I("", !0),
      z(r.$slots, "above-text"),
      m(l(ae), {
        "model-value": e.text,
        "auto-resize": "",
        rows: "1",
        class: "fl-textarea",
        style: P({ fontSize: `${e.fontSizePx}px` }),
        placeholder: e.textPlaceholder,
        ref: e.textareaRef,
        "onUpdate:modelValue": s[7] || (s[7] = (o) => a("update:text", o)),
        onKeydown: s[8] || (s[8] = ee(W(() => {
        }, ["prevent"]), ["enter"])),
        onPaste: i
      }, null, 8, ["model-value", "style", "placeholder"])
    ], 64));
  }
};
function Xe(e) {
  const t = document.activeElement;
  if (!t || t.tagName !== "TEXTAREA" && t.tagName !== "INPUT") {
    e == null || e("Click into a line's text first, place the cursor right after the vowel to stress");
    return;
  }
  const n = t.selectionStart;
  t.value = t.value.slice(0, n) + "́" + t.value.slice(n), t.selectionStart = t.selectionEnd = n + 1, t.dispatchEvent(new Event("input", { bubbles: !0 }));
}
const U = "custom", Ne = "My phrases", Le = "Typed directly into an instruct field -- not curated, just captured for reuse.";
function Y(e, t) {
  const n = t.trim();
  return e.some((a) => (a.examples || []).some((i) => i.trim() === n));
}
function Re(e, t) {
  const n = t.trim();
  if (!n || Y(e, n)) return e;
  const a = e.find((i) => i.name === U);
  return a ? (a.examples = [...a.examples || [], n], e) : [
    ...e,
    { name: U, title: Ne, when: Le, examples: [n] }
  ];
}
async function Ze(e, t, n) {
  const a = (n || "").trim();
  if (!a || !t) return null;
  let i = { categories: [] };
  try {
    const s = await (await fetch(`${e}/read?path=${encodeURIComponent(t)}`)).json();
    if (s.exists) {
      const o = JSON.parse(s.content);
      o && Array.isArray(o.categories) && (i = o);
    }
  } catch {
  }
  return Y(i.categories, a) ? null : (i.categories = Re(i.categories, a), await fetch(`${e}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: t, content: JSON.stringify(i, null, 2) })
  }), i.categories);
}
function Qe(e, t) {
  const n = se({ visible: !1, left: 0, top: 0, code: "" });
  function a(s, o) {
    const y = s.getBoundingClientRect();
    n.left = Math.min(y.left, window.innerWidth - 280), n.top = y.bottom + 4, n.code = o, n.visible = !0;
  }
  function i() {
    n.visible = !1;
  }
  const r = te(() => {
    const s = n.code;
    if (!s) return { message: "No speaker set on this line yet" };
    const o = e.value.find((w) => w.code === s);
    if (!o) return { message: `"${s}" is not a known role code -- used directly as a preset name` };
    const y = t(o);
    return y.length ? { fields: y } : { message: `"${s}" has no fields set` };
  });
  return { popover: n, show: a, hide: i, info: r };
}
const De = { key: 0 }, Ue = { class: "role-info-key" }, Ve = { class: "role-info-value" }, _e = {
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
    return (t, n) => e.visible ? (u(), p("div", {
      key: 0,
      class: "role-info-popover",
      style: P({ left: `${e.left}px`, top: `${e.top}px` })
    }, [
      e.message ? (u(), p("div", De, b(e.message), 1)) : I("", !0),
      (u(!0), p(A, null, N(e.fields, ([a, i]) => (u(), p("div", {
        key: a,
        class: "role-info-row"
      }, [
        c("span", Ue, b(a), 1),
        c("span", Ve, b(i), 1)
      ]))), 128))
    ], 4)) : I("", !0);
  }
};
function et() {
  const e = /* @__PURE__ */ new Map();
  function t(i) {
    i && (i.style.height = "auto", i.style.height = `${i.scrollHeight}px`);
  }
  function n(i, r) {
    if (!r) {
      e.delete(i);
      return;
    }
    const s = r.$el ?? r;
    e.set(i, s), D(() => t(s));
  }
  function a() {
    D(() => e.forEach(t));
  }
  return { autoGrow: t, setTextareaRef: n, regrowAll: a };
}
async function tt(e, t, n) {
  const a = `${(e || "").trim()}|${(t || "").trim()}|${(n || "").trim()}`, i = new TextEncoder().encode(a), r = await crypto.subtle.digest("SHA-256", i);
  return [...new Uint8Array(r)].map((o) => o.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
const Be = /^(\d+)_([0-9a-f]+)\.wav$/i;
function Ge(e, t) {
  return `${String(e).padStart(4, "0")}_${t}.wav`;
}
function We(e) {
  const t = Be.exec(e);
  return t ? { position: Number(t[1]), hash: t[2].toLowerCase() } : null;
}
function st(e, t, n) {
  return e.has(Ge(t, n));
}
function nt(e, t, n) {
  let a = null, i = -1 / 0;
  for (const r of e) {
    const s = We(r);
    if (!s || s.position !== n) continue;
    const o = (t == null ? void 0 : t[r]) ?? 0;
    (a === null || o > i) && (a = r, i = o);
  }
  return a;
}
export {
  Je as I,
  Ye as S,
  _e as _,
  He as a,
  qe as b,
  R as c,
  F as d,
  Qe as e,
  Ze as f,
  nt as g,
  st as h,
  Xe as i,
  tt as l,
  Ge as m,
  be as s,
  et as u
};
