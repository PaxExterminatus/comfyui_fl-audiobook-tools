import { B as N, s as O, o as d, c as h, m as R, _ as q, w as K, a as M, b as $, d as g, n as G, u, e as H, r as p, f as y, g as w, h as P, i as J, j as Q, t as b, k as V, F as k, l as X, p as Y, q as x, v as B, x as Z, y as ee, P as te } from "./styles_link.js";
import { u as le, P as ae, s as se } from "./PanelWidthButtons.js";
import { s as oe } from "./message.esm.js";
var ne = {
  root: function(e) {
    var i = e.instance, s = e.props;
    return ["p-inputtext p-component", {
      "p-filled": i.filled,
      "p-inputtext-sm": s.size === "small",
      "p-inputtext-lg": s.size === "large",
      "p-invalid": s.invalid,
      "p-variant-filled": s.variant ? s.variant === "filled" : i.$primevue.config.inputStyle === "filled"
    }];
  }
}, ie = N.extend({
  name: "inputtext",
  classes: ne
}), re = {
  name: "BaseInputText",
  extends: O,
  props: {
    modelValue: null,
    size: {
      type: String,
      default: null
    },
    invalid: {
      type: Boolean,
      default: !1
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: ie,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, I = {
  name: "InputText",
  extends: re,
  inheritAttrs: !1,
  emits: ["update:modelValue"],
  methods: {
    getPTOptions: function(e) {
      var i = e === "root" ? this.ptmi : this.ptm;
      return i(e, {
        context: {
          filled: this.filled,
          disabled: this.$attrs.disabled || this.$attrs.disabled === ""
        }
      });
    },
    onInput: function(e) {
      this.$emit("update:modelValue", e.target.value);
    }
  },
  computed: {
    filled: function() {
      return this.modelValue != null && this.modelValue.toString().length > 0;
    }
  }
}, ue = ["value", "aria-invalid"];
function de(n, e, i, s, r, l) {
  return d(), h("input", R({
    class: n.cx("root"),
    value: n.modelValue,
    "aria-invalid": n.invalid || void 0,
    onInput: e[0] || (e[0] = function() {
      return l.onInput && l.onInput.apply(l, arguments);
    })
  }, l.getPTOptions("root")), null, 16, ue);
}
I.render = de;
const pe = { class: "header-row" }, ce = { class: "dialog-title" }, ve = { class: "browse-toolbar" }, fe = { class: "browse-list" }, he = {
  key: 0,
  class: "browse-row browse-row-note"
}, me = ["onClick"], we = {
  key: 0,
  class: "browse-row browse-row-note"
}, ge = {
  __name: "BrowseDialogApp",
  props: {
    mode: { type: String, default: "folder" },
    // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(n) {
    const e = n, i = p(!0), s = p(""), r = p(""), l = p(null), m = p(null), _ = p(!1), c = p(null), { cssWidth: T, setWidth: E, presets: F } = le({
      storageKey: "FL_CosyVoice3.BrowseDialog.widthPx",
      defaultWidth: 560,
      presets: [420, 700],
      // A file picker never needs to fill nearly the whole window the way
      // Line/Roles Editor's "100%" does -- capped much narrower.
      fullVw: 70
    }), W = x(() => e.mode === "folder" ? "Choose a folder" : "Choose a file"), D = x(() => e.mode === "folder" ? "Select This Folder" : "Select File"), U = x(
      () => e.mode === "folder" ? !s.value : !m.value
    );
    function z() {
      l.value && l.value.parent ? v(l.value.parent) : (l.value && l.value.parent === "" || s.value) && v("");
    }
    const S = x(() => {
      const a = l.value;
      if (!a) return [];
      const o = [];
      return (a.drives || []).forEach((t) => o.push({ type: "drive", name: t, icon: "💽", path: t })), (a.dirs || []).forEach((t) => o.push({ type: "dir", name: t, icon: "📁", path: B(s.value, t) })), e.mode === "file" && (a.files || []).forEach((t) => o.push({ type: "file", name: t, icon: "📄", path: B(s.value, t) })), o;
    });
    function A(a) {
      a.type === "file" ? m.value = a.path : v(a.path);
    }
    async function v(a) {
      _.value = !0, c.value = null, m.value = null;
      try {
        const o = `${H}?path=${encodeURIComponent(a)}${e.ext ? `&ext=${encodeURIComponent(e.ext)}` : ""}`, f = await (await fetch(o)).json();
        if (f.error) {
          c.value = f.error, l.value = null;
          return;
        }
        s.value = f.path, r.value = f.path || "", l.value = f;
      } catch (o) {
        c.value = String(o), l.value = null;
      } finally {
        _.value = !1;
      }
    }
    function L() {
      v(r.value.trim());
    }
    function j() {
      const a = e.mode === "folder" ? s.value : m.value;
      a && (e.onSelect(a), C());
    }
    function C() {
      e.onClose();
    }
    return K(i, (a) => {
      a || C();
    }), M(() => v(e.startPath || "")), (a, o) => (d(), $(u(se), {
      visible: i.value,
      "onUpdate:visible": o[1] || (o[1] = (t) => i.value = t),
      modal: !1,
      draggable: !1,
      "close-on-escape": "",
      header: " ",
      style: G({ width: u(T) }),
      class: "browse-dialog"
    }, {
      header: g(() => [
        y("div", pe, [
          y("div", ce, b(W.value), 1),
          w(ae, {
            presets: u(F),
            "set-width": u(E)
          }, null, 8, ["presets", "set-width"])
        ])
      ]),
      footer: g(() => [
        w(u(P), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: C
        }),
        w(u(P), {
          label: D.value,
          disabled: U.value,
          onClick: j
        }, null, 8, ["label", "disabled"])
      ]),
      default: g(() => [
        y("div", ve, [
          w(u(P), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: z
          }),
          w(u(I), {
            modelValue: r.value,
            "onUpdate:modelValue": o[0] || (o[0] = (t) => r.value = t),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input",
            onKeydown: J(L, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        c.value ? (d(), $(u(oe), {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: g(() => [
            Q(b(c.value), 1)
          ]),
          _: 1
        })) : V("", !0),
        y("div", fe, [
          _.value ? (d(), h("div", he, "Loading...")) : (d(), h(k, { key: 1 }, [
            (d(!0), h(k, null, X(S.value, (t) => (d(), h("div", {
              key: `${t.type}:${t.name}`,
              class: Y(["browse-row", { "browse-row-selected": t.type === "file" && t.path === m.value }]),
              onClick: (f) => A(t)
            }, b(t.icon) + " " + b(t.name), 11, me))), 128)),
            !S.value.length && !c.value ? (d(), h("div", we, "(empty)")) : V("", !0)
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["visible", "style"]));
  }
}, ye = /* @__PURE__ */ q(ge, [["__scopeId", "data-v-d2c8bc8b"]]);
function Ce({ mode: n = "folder", startPath: e = "", ext: i = "", onSelect: s }) {
  Z(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const l = ee(ye, {
    mode: n,
    startPath: e,
    ext: i,
    onSelect: s,
    onClose: () => {
      l.unmount(), r.remove();
    }
  });
  l.use(te, { ripple: !0 }), l.mount(r);
}
export {
  Ce as openBrowseDialog
};
