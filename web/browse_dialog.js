import { B as j, s as z, o as u, c as m, m as N, _ as q, w as O, a as R, b as $, d as x, u as f, e as w, r as p, f as k, g as y, h as K, i as M, t as _, j as I, F as V, k as G, n as H, l as P, p as J, q as Q, P as W } from "./styles_link.js";
import { s as X, a as Y } from "./message.esm.js";
import { s as C } from "./button.esm.js";
var Z = {
  root: function(e) {
    var i = e.instance, n = e.props;
    return ["p-inputtext p-component", {
      "p-filled": i.filled,
      "p-inputtext-sm": n.size === "small",
      "p-inputtext-lg": n.size === "large",
      "p-invalid": n.invalid,
      "p-variant-filled": n.variant ? n.variant === "filled" : i.$primevue.config.inputStyle === "filled"
    }];
  }
}, ee = j.extend({
  name: "inputtext",
  classes: Z
}), te = {
  name: "BaseInputText",
  extends: z,
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
  style: ee,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, B = {
  name: "InputText",
  extends: te,
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
}, le = ["value", "aria-invalid"];
function ae(s, e, i, n, r, l) {
  return u(), m("input", N({
    class: s.cx("root"),
    value: s.modelValue,
    "aria-invalid": s.invalid || void 0,
    onInput: e[0] || (e[0] = function() {
      return l.onInput && l.onInput.apply(l, arguments);
    })
  }, l.getPTOptions("root")), null, 16, le);
}
B.render = ae;
const ne = { class: "browse-toolbar" }, oe = { class: "browse-list" }, se = {
  key: 0,
  class: "browse-row browse-row-note"
}, ie = ["onClick"], re = {
  key: 0,
  class: "browse-row browse-row-note"
}, ue = "/fl_cosyvoice3/browse/list_dir", pe = {
  __name: "BrowseDialogApp",
  props: {
    mode: { type: String, default: "folder" },
    // "folder" | "file"
    startPath: { type: String, default: "" },
    ext: { type: String, default: "" },
    onSelect: { type: Function, required: !0 },
    onClose: { type: Function, required: !0 }
  },
  setup(s) {
    const e = s, i = p(!0), n = p(""), r = p(""), l = p(null), h = p(null), b = p(!1), d = p(null), T = w(() => e.mode === "folder" ? "Choose a folder" : "Choose a file"), E = w(() => e.mode === "folder" ? "Select This Folder" : "Select File"), F = w(
      () => e.mode === "folder" ? !n.value : !h.value
    );
    function D() {
      l.value && l.value.parent ? c(l.value.parent) : (l.value && l.value.parent === "" || n.value) && c("");
    }
    const S = w(() => {
      const a = l.value;
      if (!a) return [];
      const o = [];
      return (a.drives || []).forEach((t) => o.push({ type: "drive", name: t, icon: "💽", path: t })), (a.dirs || []).forEach((t) => o.push({ type: "dir", name: t, icon: "📁", path: P(n.value, t) })), e.mode === "file" && (a.files || []).forEach((t) => o.push({ type: "file", name: t, icon: "📄", path: P(n.value, t) })), o;
    });
    function U(a) {
      a.type === "file" ? h.value = a.path : c(a.path);
    }
    async function c(a) {
      b.value = !0, d.value = null, h.value = null;
      try {
        const o = `${ue}?path=${encodeURIComponent(a)}${e.ext ? `&ext=${encodeURIComponent(e.ext)}` : ""}`, v = await (await fetch(o)).json();
        if (v.error) {
          d.value = v.error, l.value = null;
          return;
        }
        n.value = v.path, r.value = v.path || "", l.value = v;
      } catch (o) {
        d.value = String(o), l.value = null;
      } finally {
        b.value = !1;
      }
    }
    function A() {
      c(r.value.trim());
    }
    function L() {
      const a = e.mode === "folder" ? n.value : h.value;
      a && (e.onSelect(a), g());
    }
    function g() {
      e.onClose();
    }
    return O(i, (a) => {
      a || g();
    }), R(() => c(e.startPath || "")), (a, o) => (u(), $(f(Y), {
      visible: i.value,
      "onUpdate:visible": o[1] || (o[1] = (t) => i.value = t),
      modal: "",
      "dismissable-mask": "",
      header: T.value,
      style: { width: "min(560px, 90vw)" },
      "content-style": { display: "flex", flexDirection: "column" }
    }, {
      footer: x(() => [
        y(f(C), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: g
        }),
        y(f(C), {
          label: E.value,
          disabled: F.value,
          onClick: L
        }, null, 8, ["label", "disabled"])
      ]),
      default: x(() => [
        k("div", ne, [
          y(f(C), {
            icon: "pi pi-arrow-up",
            title: "Up one level",
            text: "",
            onClick: D
          }),
          y(f(B), {
            modelValue: r.value,
            "onUpdate:modelValue": o[0] || (o[0] = (t) => r.value = t),
            placeholder: "Path -- press Enter to jump here",
            class: "browse-path-input",
            onKeydown: K(A, ["enter"])
          }, null, 8, ["modelValue"])
        ]),
        d.value ? (u(), $(f(X), {
          key: 0,
          severity: "error",
          closable: !1
        }, {
          default: x(() => [
            M(_(d.value), 1)
          ]),
          _: 1
        })) : I("", !0),
        k("div", oe, [
          b.value ? (u(), m("div", se, "Loading...")) : (u(), m(V, { key: 1 }, [
            (u(!0), m(V, null, G(S.value, (t) => (u(), m("div", {
              key: `${t.type}:${t.name}`,
              class: H(["browse-row", { "browse-row-selected": t.type === "file" && t.path === h.value }]),
              onClick: (v) => U(t)
            }, _(t.icon) + " " + _(t.name), 11, ie))), 128)),
            !S.value.length && !d.value ? (u(), m("div", re, "(empty)")) : I("", !0)
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["visible", "header"]));
  }
}, de = /* @__PURE__ */ q(pe, [["__scopeId", "data-v-1d95d509"]]);
function me({ mode: s = "folder", startPath: e = "", ext: i = "", onSelect: n }) {
  J(import.meta.url);
  const r = document.createElement("div");
  document.body.appendChild(r);
  const l = Q(de, {
    mode: s,
    startPath: e,
    ext: i,
    onSelect: n,
    onClose: () => {
      l.unmount(), r.remove();
    }
  });
  l.use(W, { ripple: !0 }), l.mount(r);
}
export {
  me as openBrowseDialog
};
