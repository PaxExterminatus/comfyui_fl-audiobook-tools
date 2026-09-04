/**
* @vue/shared v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function li(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t.split(",")) e[n] = 1;
  return (n) => n in e;
}
const ae = {}, Vt = [], tt = () => {
}, Ws = () => !1, ir = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // uppercase letter
(t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97), sr = (t) => t.startsWith("onUpdate:"), be = Object.assign, ai = (t, e) => {
  const n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}, Cl = Object.prototype.hasOwnProperty, te = (t, e) => Cl.call(t, e), N = Array.isArray, bt = (t) => $n(t) === "[object Map]", Un = (t) => $n(t) === "[object Set]", Vi = (t) => $n(t) === "[object Date]", q = (t) => typeof t == "function", de = (t) => typeof t == "string", Ne = (t) => typeof t == "symbol", ne = (t) => t !== null && typeof t == "object", Us = (t) => (ne(t) || q(t)) && q(t.then) && q(t.catch), Gs = Object.prototype.toString, $n = (t) => Gs.call(t), Il = (t) => $n(t).slice(8, -1), qs = (t) => $n(t) === "[object Object]", ui = (t) => de(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t, tn = /* @__PURE__ */ li(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), or = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (n) => e[n] || (e[n] = t(n));
}, _l = /-\w/g, $e = or(
  (t) => t.replace(_l, (e) => e.slice(1).toUpperCase())
), Tl = /\B([A-Z])/g, Lt = or(
  (t) => t.replace(Tl, "-$1").toLowerCase()
), lr = or((t) => t.charAt(0).toUpperCase() + t.slice(1)), Or = or(
  (t) => t ? `on${lr(t)}` : ""
), et = (t, e) => !Object.is(t, e), Cr = (t, ...e) => {
  for (let n = 0; n < t.length; n++)
    t[n](...e);
}, Zs = (t, e, n, r = !1) => {
  Object.defineProperty(t, e, {
    configurable: !0,
    enumerable: !1,
    writable: r,
    value: n
  });
}, Pl = (t) => {
  const e = parseFloat(t);
  return isNaN(e) ? t : e;
}, xl = (t) => {
  const e = de(t) ? Number(t) : NaN;
  return isNaN(e) ? t : e;
};
let Di;
const ar = () => Di || (Di = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function ci(t) {
  if (N(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const r = t[n], i = de(r) ? Ll(r) : ci(r);
      if (i)
        for (const s in i)
          e[s] = i[s];
    }
    return e;
  } else if (de(t) || ne(t))
    return t;
}
const Al = /;(?![^(]*\))/g, El = /:([^]+)/, $l = /\/\*[^]*?\*\//g;
function Ll(t) {
  const e = {};
  return t.replace($l, "").split(Al).forEach((n) => {
    if (n) {
      const r = n.split(El);
      r.length > 1 && (e[r[0].trim()] = r[1].trim());
    }
  }), e;
}
function at(t) {
  let e = "";
  if (de(t))
    e = t;
  else if (N(t))
    for (let n = 0; n < t.length; n++) {
      const r = at(t[n]);
      r && (e += r + " ");
    }
  else if (ne(t))
    for (const n in t)
      t[n] && (e += n + " ");
  return e.trim();
}
const Fl = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ml = /* @__PURE__ */ li(Fl);
function Js(t) {
  return !!t || t === "";
}
function Vl(t, e) {
  if (t.length !== e.length) return !1;
  let n = !0;
  for (let r = 0; n && r < t.length; r++)
    n = ur(t[r], e[r]);
  return n;
}
function ji(t, e) {
  if (t.size !== e.size) return !1;
  const n = Array.from(e), r = new Uint8Array(n.length);
  for (const i of t) {
    let s = -1;
    for (let o = 0; o < n.length; o++)
      if (!r[o] && ur(i, n[o])) {
        s = o;
        break;
      }
    if (s < 0) return !1;
    r[s] = 1;
  }
  return !0;
}
function ur(t, e) {
  if (t === e) return !0;
  let n = Vi(t), r = Vi(e);
  if (n || r)
    return n && r ? t.getTime() === e.getTime() : !1;
  if (n = Ne(t), r = Ne(e), n || r)
    return t === e;
  if (n = N(t), r = N(e), n || r)
    return n && r ? Vl(t, e) : !1;
  if (n = ne(t), r = ne(e), n || r) {
    if (!n || !r)
      return !1;
    if (n = bt(t), r = bt(e), n || r || (n = Un(t), r = Un(e), n || r))
      return n && r ? ji(t, e) : !1;
    const i = Object.keys(t).length, s = Object.keys(e).length;
    if (i !== s)
      return !1;
    for (const o in t) {
      const l = t.hasOwnProperty(o), a = e.hasOwnProperty(o);
      if (l && !a || !l && a || !ur(t[o], e[o]))
        return !1;
    }
  }
  return String(t) === String(e);
}
const Ys = (t) => !!(t && t.__v_isRef === !0), Le = (t) => de(t) ? t : t == null ? "" : N(t) || ne(t) && (t.toString === Gs || !q(t.toString)) ? Ys(t) ? Le(t.value) : JSON.stringify(t, Qs, 2) : String(t), Qs = (t, e) => Ys(e) ? Qs(t, e.value) : bt(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (n, [r, i], s) => (n[Ir(r, s) + " =>"] = i, n),
    {}
  )
} : Un(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((n) => Ir(n))
} : Ne(e) ? Ir(e) : ne(e) && !N(e) && !qs(e) ? String(e) : e, Ir = (t, e = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Ne(t) ? `Symbol(${(n = t.description) != null ? n : e})` : t
  );
};
/**
* @vue/reactivity v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let we;
class Dl {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e = !1) {
    this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && we && (we.active ? (this.parent = we, this.index = (we.scopes || (we.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let e, n;
      if (this.scopes) {
        const r = this.scopes.slice();
        for (e = 0, n = r.length; e < n; e++)
          r[e].pause();
      }
      for (e = 0, n = this.effects.length; e < n; e++)
        this.effects[e].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let e, n;
      if (this.scopes) {
        const i = this.scopes.slice();
        for (e = 0, n = i.length; e < n; e++)
          i[e].resume();
      }
      const r = this.effects.slice();
      for (e = 0, n = r.length; e < n; e++)
        r[e].resume();
    }
  }
  run(e) {
    if (this._active) {
      const n = we;
      try {
        return we = this, e();
      } finally {
        we = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = we, we = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (we === this)
        we = this.prevScope;
      else {
        let e = we;
        for (; e; ) {
          if (e.prevScope === this) {
            e.prevScope = this.prevScope;
            break;
          }
          e = e.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(e) {
    if (this._active) {
      this._active = !1;
      let n, r;
      for (n = 0, r = this.effects.length; n < r; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, r = this.cleanups.length; n < r; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        const i = this.scopes.slice();
        for (n = 0, r = i.length; n < r; n++)
          i[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !e) {
        const i = this.parent.scopes.pop();
        i && i !== this && (this.parent.scopes[this.index] = i, i.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function jl() {
  return we;
}
let ce;
const _r = /* @__PURE__ */ new WeakSet();
class Xs {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, we && (we.active ? we.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, _r.has(this) && (_r.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || to(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Ri(this), no(this);
    const e = ce, n = Be;
    ce = this, Be = !0;
    try {
      return this.fn();
    } finally {
      ro(this), ce = e, Be = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        pi(e);
      this.deps = this.depsTail = void 0, Ri(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? _r.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    zr(this) && this.run();
  }
  get dirty() {
    return zr(this);
  }
}
let eo = 0, nn, rn;
function to(t, e = !1) {
  if (t.flags |= 8, e) {
    t.next = rn, rn = t;
    return;
  }
  t.next = nn, nn = t;
}
function fi() {
  eo++;
}
function di() {
  if (--eo > 0)
    return;
  if (rn) {
    let e = rn;
    for (rn = void 0; e; ) {
      const n = e.next;
      e.next = void 0, e.flags &= -9, e = n;
    }
  }
  let t;
  for (; nn; ) {
    let e = nn;
    for (nn = void 0; e; ) {
      const n = e.next;
      if (e.next = void 0, e.flags &= -9, e.flags & 1)
        try {
          e.trigger();
        } catch (r) {
          t || (t = r);
        }
      e = n;
    }
  }
  if (t) throw t;
}
function no(t) {
  for (let e = t.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function ro(t) {
  let e, n = t.depsTail, r = n;
  for (; r; ) {
    const i = r.prevDep;
    r.version === -1 ? (r === n && (n = i), pi(r), Rl(r)) : e = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = i;
  }
  t.deps = e, t.depsTail = n;
}
function zr(t) {
  for (let e = t.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (io(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!t._dirty;
}
function io(t) {
  if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === cn) || (t.globalVersion = cn, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !zr(t))))
    return;
  t.flags |= 2;
  const e = t.dep, n = ce, r = Be;
  ce = t, Be = !0;
  try {
    no(t);
    const i = t.fn(t._value);
    (e.version === 0 || et(i, t._value)) && (t.flags |= 128, t._value = i, e.version++);
  } catch (i) {
    throw e.version++, i;
  } finally {
    ce = n, Be = r, ro(t), t.flags &= -3;
  }
}
function pi(t, e = !1) {
  const { dep: n, prevSub: r, nextSub: i } = t;
  if (r && (r.nextSub = i, t.prevSub = void 0), i && (i.prevSub = r, t.nextSub = void 0), n.subs === t && (n.subs = r, !r && n.computed)) {
    n.computed.flags &= -5;
    for (let s = n.computed.deps; s; s = s.nextDep)
      pi(s, !0);
  }
  !e && !--n.sc && n.map && n.map.delete(n.key);
}
function Rl(t) {
  const { prevDep: e, nextDep: n } = t;
  e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
}
let Be = !0;
const so = [];
function ct() {
  so.push(Be), Be = !1;
}
function ft() {
  const t = so.pop();
  Be = t === void 0 ? !0 : t;
}
function Ri(t) {
  const { cleanup: e } = t;
  if (t.cleanup = void 0, e) {
    const n = ce;
    ce = void 0;
    try {
      e();
    } finally {
      ce = n;
    }
  }
}
let cn = 0;
class kl {
  constructor(e, n) {
    this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class hi {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!ce || !Be || ce === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== ce)
      n = this.activeLink = new kl(ce, this), ce.deps ? (n.prevDep = ce.depsTail, ce.depsTail.nextDep = n, ce.depsTail = n) : ce.deps = ce.depsTail = n, oo(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const r = n.nextDep;
      r.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = r), n.prevDep = ce.depsTail, n.nextDep = void 0, ce.depsTail.nextDep = n, ce.depsTail = n, ce.deps === n && (ce.deps = r);
    }
    return n;
  }
  trigger(e) {
    this.version++, cn++, this.notify(e);
  }
  notify(e) {
    fi();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      di();
    }
  }
}
function oo(t) {
  if (t.dep.sc++, t.sub.flags & 4) {
    const e = t.dep.computed;
    if (e && !t.dep.subs) {
      e.flags |= 20;
      for (let r = e.deps; r; r = r.nextDep)
        oo(r);
    }
    const n = t.dep.subs;
    n !== t && (t.prevSub = n, n && (n.nextSub = t)), t.dep.subs = t;
  }
}
const Kr = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ Symbol(
  ""
), Wr = /* @__PURE__ */ Symbol(
  ""
), fn = /* @__PURE__ */ Symbol(
  ""
);
function Ie(t, e, n) {
  if (Be && ce) {
    let r = Kr.get(t);
    r || Kr.set(t, r = /* @__PURE__ */ new Map());
    let i = r.get(n);
    i || (r.set(n, i = new hi()), i.map = r, i.key = n), i.track();
  }
}
function ot(t, e, n, r, i, s) {
  const o = Kr.get(t);
  if (!o) {
    cn++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (fi(), e === "clear")
    o.forEach(l);
  else {
    const a = N(t), c = a && ui(n);
    if (a && n === "length") {
      const u = Number(r);
      o.forEach((f, p) => {
        (p === "length" || p === fn || !Ne(p) && p >= u) && l(f);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && l(o.get(n)), c && l(o.get(fn)), e) {
        case "add":
          a ? c && l(o.get("length")) : (l(o.get(Et)), bt(t) && l(o.get(Wr)));
          break;
        case "delete":
          a || (l(o.get(Et)), bt(t) && l(o.get(Wr)));
          break;
        case "set":
          bt(t) && l(o.get(Et));
          break;
      }
  }
  di();
}
function Ft(t) {
  const e = /* @__PURE__ */ ee(t);
  return e === t ? e : (Ie(e, "iterate", fn), /* @__PURE__ */ ke(t) ? e : e.map(ze));
}
function cr(t) {
  return Ie(t = /* @__PURE__ */ ee(t), "iterate", fn), t;
}
function Qe(t, e) {
  return /* @__PURE__ */ dt(t) ? Ht(/* @__PURE__ */ $t(t) ? ze(e) : e) : ze(e);
}
const Hl = {
  __proto__: null,
  [Symbol.iterator]() {
    return Tr(this, Symbol.iterator, (t) => Qe(this, t));
  },
  concat(...t) {
    return Ft(this).concat(
      ...t.map((e) => N(e) ? Ft(e) : e)
    );
  },
  entries() {
    return Tr(this, "entries", (t) => (t[1] = Qe(this, t[1]), t));
  },
  every(t, e) {
    return nt(this, "every", t, e, void 0, arguments);
  },
  filter(t, e) {
    return nt(
      this,
      "filter",
      t,
      e,
      (n) => n.map((r) => Qe(this, r)),
      arguments
    );
  },
  find(t, e) {
    return nt(
      this,
      "find",
      t,
      e,
      (n) => Qe(this, n),
      arguments
    );
  },
  findIndex(t, e) {
    return nt(this, "findIndex", t, e, void 0, arguments);
  },
  findLast(t, e) {
    return nt(
      this,
      "findLast",
      t,
      e,
      (n) => Qe(this, n),
      arguments
    );
  },
  findLastIndex(t, e) {
    return nt(this, "findLastIndex", t, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(t, e) {
    return nt(this, "forEach", t, e, void 0, arguments);
  },
  includes(...t) {
    return Pr(this, "includes", t);
  },
  indexOf(...t) {
    return Pr(this, "indexOf", t);
  },
  join(t) {
    return Ft(this).join(t);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...t) {
    return Pr(this, "lastIndexOf", t);
  },
  map(t, e) {
    return nt(this, "map", t, e, void 0, arguments);
  },
  pop() {
    return Ut(this, "pop");
  },
  push(...t) {
    return Ut(this, "push", t);
  },
  reduce(t, ...e) {
    return ki(this, "reduce", t, e);
  },
  reduceRight(t, ...e) {
    return ki(this, "reduceRight", t, e);
  },
  shift() {
    return Ut(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(t, e) {
    return nt(this, "some", t, e, void 0, arguments);
  },
  splice(...t) {
    return Ut(this, "splice", t);
  },
  toReversed() {
    return Ft(this).toReversed();
  },
  toSorted(t) {
    return Ft(this).toSorted(t);
  },
  toSpliced(...t) {
    return Ft(this).toSpliced(...t);
  },
  unshift(...t) {
    return Ut(this, "unshift", t);
  },
  values() {
    return Tr(this, "values", (t) => Qe(this, t));
  }
};
function Tr(t, e, n) {
  const r = cr(t), i = r[e]();
  return r !== t && !/* @__PURE__ */ ke(t) && (i._next = i.next, i.next = () => {
    const s = i._next();
    return s.done || (s.value = n(s.value)), s;
  }), i;
}
const Bl = Array.prototype;
function nt(t, e, n, r, i, s) {
  const o = cr(t), l = o !== t && !/* @__PURE__ */ ke(t), a = o[e];
  if (a !== Bl[e]) {
    const f = a.apply(t, s);
    return l ? ze(f) : f;
  }
  let c = n;
  o !== t && (l ? c = function(f, p) {
    return n.call(this, Qe(t, f), p, t);
  } : n.length > 2 && (c = function(f, p) {
    return n.call(this, f, p, t);
  }));
  const u = a.call(o, c, r);
  return l && i ? i(u) : u;
}
function ki(t, e, n, r) {
  const i = cr(t), s = i !== t && !/* @__PURE__ */ ke(t);
  let o = n, l = !1;
  i !== t && (s ? (l = r.length === 0, o = function(c, u, f) {
    return l && (l = !1, c = Qe(t, c)), n.call(this, c, Qe(t, u), f, t);
  }) : n.length > 3 && (o = function(c, u, f) {
    return n.call(this, c, u, f, t);
  }));
  const a = i[e](o, ...r);
  return l ? Qe(t, a) : a;
}
function Pr(t, e, n) {
  const r = /* @__PURE__ */ ee(t);
  Ie(r, "iterate", fn);
  const i = r[e](...n);
  return (i === -1 || i === !1) && /* @__PURE__ */ yi(n[0]) ? (n[0] = /* @__PURE__ */ ee(n[0]), r[e](...n)) : i;
}
function Ut(t, e, n = []) {
  ct(), fi();
  const r = (/* @__PURE__ */ ee(t))[e].apply(t, n);
  return di(), ft(), r;
}
const Nl = /* @__PURE__ */ li("__proto__,__v_isRef,__isVue"), lo = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(Ne)
);
function zl(t) {
  Ne(t) || (t = String(t));
  const e = /* @__PURE__ */ ee(this);
  return Ie(e, "has", t), e.hasOwnProperty(t);
}
class ao {
  constructor(e = !1, n = !1) {
    this._isReadonly = e, this._isShallow = n;
  }
  get(e, n, r) {
    if (n === "__v_skip") return e.__v_skip;
    const i = this._isReadonly, s = this._isShallow;
    if (n === "__v_isReactive")
      return !i;
    if (n === "__v_isReadonly")
      return i;
    if (n === "__v_isShallow")
      return s;
    if (n === "__v_raw")
      return r === (i ? s ? Xl : po : s ? fo : co).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(r) ? e : void 0;
    const o = N(e);
    if (!i) {
      let a;
      if (o && (a = Hl[n]))
        return a;
      if (n === "hasOwnProperty")
        return zl;
    }
    const l = Reflect.get(
      e,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ Pe(e) ? e : r
    );
    if ((Ne(n) ? lo.has(n) : Nl(n)) || (i || Ie(e, "get", n), s))
      return l;
    if (/* @__PURE__ */ Pe(l)) {
      const a = o && ui(n) ? l : l.value;
      return i && ne(a) ? /* @__PURE__ */ Gn(a) : a;
    }
    return ne(l) ? i ? /* @__PURE__ */ Gn(l) : /* @__PURE__ */ fr(l) : l;
  }
}
class uo extends ao {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, n, r, i) {
    let s = e[n];
    const o = N(e) && ui(n);
    if (!this._isShallow) {
      const c = /* @__PURE__ */ dt(s);
      if (!/* @__PURE__ */ ke(r) && !/* @__PURE__ */ dt(r) && (s = /* @__PURE__ */ ee(s), r = /* @__PURE__ */ ee(r)), !o && /* @__PURE__ */ Pe(s) && !/* @__PURE__ */ Pe(r))
        return c || (s.value = r), !0;
    }
    const l = o ? Number(n) < e.length : te(e, n), a = Reflect.set(
      e,
      n,
      r,
      /* @__PURE__ */ Pe(e) ? e : i
    );
    return e === /* @__PURE__ */ ee(i) && a && (l ? et(r, s) && ot(e, "set", n, r) : ot(e, "add", n, r)), a;
  }
  deleteProperty(e, n) {
    const r = te(e, n);
    e[n];
    const i = Reflect.deleteProperty(e, n);
    return i && r && ot(e, "delete", n, void 0), i;
  }
  has(e, n) {
    const r = Reflect.has(e, n);
    return (!Ne(n) || !lo.has(n)) && Ie(e, "has", n), r;
  }
  ownKeys(e) {
    return Ie(
      e,
      "iterate",
      N(e) ? "length" : Et
    ), Reflect.ownKeys(e);
  }
}
class Kl extends ao {
  constructor(e = !1) {
    super(!0, e);
  }
  set(e, n) {
    return !0;
  }
  deleteProperty(e, n) {
    return !0;
  }
}
const Wl = /* @__PURE__ */ new uo(), Ul = /* @__PURE__ */ new Kl(), Gl = /* @__PURE__ */ new uo(!0);
const Ur = (t) => t, Dn = (t) => Reflect.getPrototypeOf(t);
function ql(t, e, n) {
  return function(...r) {
    const i = this.__v_raw, s = /* @__PURE__ */ ee(i), o = bt(s), l = t === "entries" || t === Symbol.iterator && o, a = t === "keys" && o, c = i[t](...r), u = n ? Ur : e ? Ht : ze;
    return !e && Ie(
      s,
      "iterate",
      a ? Wr : Et
    ), be(
      // inheriting all iterator properties
      Object.create(c),
      {
        // iterator protocol
        next() {
          const { value: f, done: p } = c.next();
          return p ? { value: f, done: p } : {
            value: l ? [u(f[0]), u(f[1])] : u(f),
            done: p
          };
        }
      }
    );
  };
}
function jn(t) {
  return function(...e) {
    return t === "delete" ? !1 : t === "clear" ? void 0 : this;
  };
}
function Zl(t, e) {
  const n = {
    get(i) {
      const s = this.__v_raw, o = /* @__PURE__ */ ee(s), l = /* @__PURE__ */ ee(i);
      t || (et(i, l) && Ie(o, "get", i), Ie(o, "get", l));
      const { has: a } = Dn(o), c = e ? Ur : t ? Ht : ze;
      if (a.call(o, i))
        return c(s.get(i));
      if (a.call(o, l))
        return c(s.get(l));
      s !== o && s.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !t && Ie(/* @__PURE__ */ ee(i), "iterate", Et), i.size;
    },
    has(i) {
      const s = this.__v_raw, o = /* @__PURE__ */ ee(s), l = /* @__PURE__ */ ee(i);
      return t || (et(i, l) && Ie(o, "has", i), Ie(o, "has", l)), i === l ? s.has(i) : s.has(i) || s.has(l);
    },
    forEach(i, s) {
      const o = this, l = o.__v_raw, a = /* @__PURE__ */ ee(l), c = e ? Ur : t ? Ht : ze;
      return !t && Ie(a, "iterate", Et), l.forEach((u, f) => i.call(s, c(u), c(f), o));
    }
  };
  return be(
    n,
    t ? {
      add: jn("add"),
      set: jn("set"),
      delete: jn("delete"),
      clear: jn("clear")
    } : {
      add(i) {
        const s = /* @__PURE__ */ ee(this), o = Dn(s), l = /* @__PURE__ */ ee(i), a = !e && !/* @__PURE__ */ ke(i) && !/* @__PURE__ */ dt(i) ? l : i;
        return o.has.call(s, a) || et(i, a) && o.has.call(s, i) || et(l, a) && o.has.call(s, l) || (s.add(a), ot(s, "add", a, a)), this;
      },
      set(i, s) {
        !e && !/* @__PURE__ */ ke(s) && !/* @__PURE__ */ dt(s) && (s = /* @__PURE__ */ ee(s));
        const o = /* @__PURE__ */ ee(this), { has: l, get: a } = Dn(o);
        let c = l.call(o, i);
        c || (i = /* @__PURE__ */ ee(i), c = l.call(o, i));
        const u = a.call(o, i);
        return o.set(i, s), c ? et(s, u) && ot(o, "set", i, s) : ot(o, "add", i, s), this;
      },
      delete(i) {
        const s = /* @__PURE__ */ ee(this), { has: o, get: l } = Dn(s);
        let a = o.call(s, i);
        a || (i = /* @__PURE__ */ ee(i), a = o.call(s, i)), l && l.call(s, i);
        const c = s.delete(i);
        return a && ot(s, "delete", i, void 0), c;
      },
      clear() {
        const i = /* @__PURE__ */ ee(this), s = i.size !== 0, o = i.clear();
        return s && ot(
          i,
          "clear",
          void 0,
          void 0
        ), o;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((i) => {
    n[i] = ql(i, t, e);
  }), n;
}
function gi(t, e) {
  const n = Zl(t, e);
  return (r, i, s) => i === "__v_isReactive" ? !t : i === "__v_isReadonly" ? t : i === "__v_raw" ? r : Reflect.get(
    te(n, i) && i in r ? n : r,
    i,
    s
  );
}
const Jl = {
  get: /* @__PURE__ */ gi(!1, !1)
}, Yl = {
  get: /* @__PURE__ */ gi(!1, !0)
}, Ql = {
  get: /* @__PURE__ */ gi(!0, !1)
};
const co = /* @__PURE__ */ new WeakMap(), fo = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), Xl = /* @__PURE__ */ new WeakMap();
function ea(t) {
  switch (t) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function fr(t) {
  return /* @__PURE__ */ dt(t) ? t : mi(
    t,
    !1,
    Wl,
    Jl,
    co
  );
}
// @__NO_SIDE_EFFECTS__
function ta(t) {
  return mi(
    t,
    !1,
    Gl,
    Yl,
    fo
  );
}
// @__NO_SIDE_EFFECTS__
function Gn(t) {
  return mi(
    t,
    !0,
    Ul,
    Ql,
    po
  );
}
function mi(t, e, n, r, i) {
  if (!ne(t) || t.__v_raw && !(e && t.__v_isReactive) || t.__v_skip || !Object.isExtensible(t))
    return t;
  const s = i.get(t);
  if (s)
    return s;
  const o = ea(Il(t));
  if (o === 0)
    return t;
  const l = new Proxy(
    t,
    o === 2 ? r : n
  );
  return i.set(t, l), l;
}
// @__NO_SIDE_EFFECTS__
function $t(t) {
  return /* @__PURE__ */ dt(t) ? /* @__PURE__ */ $t(t.__v_raw) : !!(t && t.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function dt(t) {
  return !!(t && t.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function ke(t) {
  return !!(t && t.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function yi(t) {
  return t ? !!t.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function ee(t) {
  const e = t && t.__v_raw;
  return e ? /* @__PURE__ */ ee(e) : t;
}
function na(t) {
  return !te(t, "__v_skip") && Object.isExtensible(t) && Zs(t, "__v_skip", !0), t;
}
const ze = (t) => ne(t) ? /* @__PURE__ */ fr(t) : t, Ht = (t) => ne(t) ? /* @__PURE__ */ Gn(t) : t;
// @__NO_SIDE_EFFECTS__
function Pe(t) {
  return t ? t.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Dt(t) {
  return ra(t, !1);
}
function ra(t, e) {
  return /* @__PURE__ */ Pe(t) ? t : new ia(t, e);
}
class ia {
  constructor(e, n) {
    this.dep = new hi(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? e : /* @__PURE__ */ ee(e), this._value = n ? e : ze(e), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const n = this._rawValue, r = this.__v_isShallow || /* @__PURE__ */ ke(e) || /* @__PURE__ */ dt(e);
    e = r ? e : /* @__PURE__ */ ee(e), et(e, n) && (this._rawValue = e, this._value = r ? e : ze(e), this.dep.trigger());
  }
}
function Jt(t) {
  return /* @__PURE__ */ Pe(t) ? t.value : t;
}
const sa = {
  get: (t, e, n) => e === "__v_raw" ? t : Jt(Reflect.get(t, e, n)),
  set: (t, e, n, r) => {
    const i = t[e];
    return /* @__PURE__ */ Pe(i) && !/* @__PURE__ */ Pe(n) ? (i.value = n, !0) : Reflect.set(t, e, n, r);
  }
};
function ho(t) {
  return /* @__PURE__ */ $t(t) ? t : new Proxy(t, sa);
}
class oa {
  constructor(e, n, r) {
    this.fn = e, this.setter = n, this._value = void 0, this.dep = new hi(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = cn - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = r;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    ce !== this)
      return to(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return io(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
// @__NO_SIDE_EFFECTS__
function la(t, e, n = !1) {
  let r, i;
  return q(t) ? r = t : (r = t.get, i = t.set), new oa(r, i, n);
}
const Rn = {}, qn = /* @__PURE__ */ new WeakMap();
let Pt;
function aa(t, e = !1, n = Pt) {
  if (n) {
    let r = qn.get(n);
    r || qn.set(n, r = []), r.push(t);
  }
}
function ua(t, e, n = ae) {
  const { immediate: r, deep: i, once: s, scheduler: o, augmentJob: l, call: a } = n, c = (_) => i ? _ : /* @__PURE__ */ ke(_) || i === !1 || i === 0 ? lt(_, 1) : lt(_);
  let u, f, p, g, y = !1, v = !1;
  if (/* @__PURE__ */ Pe(t) ? (f = () => t.value, y = /* @__PURE__ */ ke(t)) : /* @__PURE__ */ $t(t) ? (f = () => c(t), y = !0) : N(t) ? (v = !0, y = t.some((_) => /* @__PURE__ */ $t(_) || /* @__PURE__ */ ke(_)), f = () => t.map((_) => {
    if (/* @__PURE__ */ Pe(_))
      return _.value;
    if (/* @__PURE__ */ $t(_))
      return c(_);
    if (q(_))
      return a ? a(_, 2) : _();
  })) : q(t) ? e ? f = a ? () => a(t, 2) : t : f = () => {
    if (p) {
      ct();
      try {
        p();
      } finally {
        ft();
      }
    }
    const _ = Pt;
    Pt = u;
    try {
      return a ? a(t, 3, [g]) : t(g);
    } finally {
      Pt = _;
    }
  } : f = tt, e && i) {
    const _ = f, G = i === !0 ? 1 / 0 : i;
    f = () => lt(_(), G);
  }
  const b = jl(), T = () => {
    u.stop(), b && b.active && ai(b.effects, u);
  };
  if (s && e) {
    const _ = e;
    e = (...G) => {
      const Z = _(...G);
      return T(), Z;
    };
  }
  let P = v ? new Array(t.length).fill(Rn) : Rn;
  const L = (_) => {
    if (!(!(u.flags & 1) || !u.dirty && !_))
      if (e) {
        const G = u.run();
        if (_ || i || y || (v ? G.some((Z, j) => et(Z, P[j])) : et(G, P))) {
          p && p();
          const Z = Pt;
          Pt = u;
          try {
            const j = [
              G,
              // pass undefined as the old value when it's changed for the first time
              P === Rn ? void 0 : v && P[0] === Rn ? [] : P,
              g
            ];
            P = G, a ? a(e, 3, j) : (
              // @ts-expect-error
              e(...j)
            );
          } finally {
            Pt = Z;
          }
        }
      } else
        u.run();
  };
  return l && l(L), u = new Xs(f), u.scheduler = o ? () => o(L, !1) : L, g = (_) => aa(_, !1, u), p = u.onStop = () => {
    const _ = qn.get(u);
    if (_) {
      if (a)
        a(_, 4);
      else
        for (const G of _) G();
      qn.delete(u);
    }
  }, e ? r ? L(!0) : P = u.run() : o ? o(L.bind(null, !0), !0) : u.run(), T.pause = u.pause.bind(u), T.resume = u.resume.bind(u), T.stop = T, T;
}
function lt(t, e = 1 / 0, n) {
  if (e <= 0 || !ne(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(t) || 0) >= e))
    return t;
  if (n.set(t, e), e--, /* @__PURE__ */ Pe(t))
    lt(t.value, e, n);
  else if (N(t))
    for (let r = 0; r < t.length; r++)
      lt(t[r], e, n);
  else if (Un(t) || bt(t))
    t.forEach((r) => {
      lt(r, e, n);
    });
  else if (qs(t)) {
    for (const r in t)
      lt(t[r], e, n);
    for (const r of Object.getOwnPropertySymbols(t))
      Object.prototype.propertyIsEnumerable.call(t, r) && lt(t[r], e, n);
  }
  return t;
}
/**
* @vue/runtime-core v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Ln(t, e, n, r) {
  try {
    return r ? t(...r) : t();
  } catch (i) {
    dr(i, e, n);
  }
}
function He(t, e, n, r) {
  if (q(t)) {
    const i = Ln(t, e, n, r);
    return i && Us(i) && i.catch((s) => {
      dr(s, e, n);
    }), i;
  }
  if (N(t)) {
    const i = [];
    for (let s = 0; s < t.length; s++)
      i.push(He(t[s], e, n, r));
    return i;
  }
}
function dr(t, e, n, r = !0) {
  const i = e ? e.vnode : null, { errorHandler: s, throwUnhandledErrorInProduction: o } = e && e.appContext.config || ae;
  if (e) {
    let l = e.parent;
    const a = e.proxy, c = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const u = l.ec;
      if (u) {
        for (let f = 0; f < u.length; f++)
          if (u[f](t, a, c) === !1)
            return;
      }
      l = l.parent;
    }
    if (s) {
      ct(), Ln(s, null, 10, [
        t,
        a,
        c
      ]), ft();
      return;
    }
  }
  ca(t, n, i, r, o);
}
function ca(t, e, n, r = !0, i = !1) {
  if (i)
    throw t;
  console.error(t);
}
const Ee = [];
let Ye = -1;
const jt = [];
let yt = null, Mt = 0;
const go = /* @__PURE__ */ Promise.resolve();
let Zn = null;
function vi(t) {
  const e = Zn || go;
  return t ? e.then(this ? t.bind(this) : t) : e;
}
function fa(t) {
  let e = Ye + 1, n = Ee.length;
  for (; e < n; ) {
    const r = e + n >>> 1, i = Ee[r], s = dn(i);
    s < t || s === t && i.flags & 2 ? e = r + 1 : n = r;
  }
  return e;
}
function bi(t) {
  if (!(t.flags & 1)) {
    const e = dn(t), n = Ee[Ee.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(t.flags & 2) && e >= dn(n) ? Ee.push(t) : Ee.splice(fa(e), 0, t), t.flags |= 1, mo();
  }
}
function mo() {
  Zn || (Zn = go.then(vo));
}
function da(t) {
  if (!N(t))
    yt && t.id === -1 ? yt.splice(Mt + 1, 0, t) : t.flags & 1 || (jt.push(t), t.flags |= 1);
  else
    for (let e = 0; e < t.length; e++)
      jt.push(t[e]);
  mo();
}
function Hi(t, e, n = Ye + 1) {
  for (; n < Ee.length; n++) {
    const r = Ee[n];
    if (r && r.flags & 2) {
      if (t && r.id !== t.uid)
        continue;
      Ee.splice(n, 1), n--, r.flags & 4 && (r.flags &= -2), r(), r.flags & 4 || (r.flags &= -2);
    }
  }
}
function yo(t) {
  if (jt.length) {
    const e = [...new Set(jt)].sort(
      (n, r) => dn(n) - dn(r)
    );
    if (jt.length = 0, yt) {
      for (let n = 0; n < e.length; n++)
        yt.push(e[n]);
      return;
    }
    for (yt = e, Mt = 0; Mt < yt.length; Mt++) {
      const n = yt[Mt];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    yt = null, Mt = 0;
  }
}
const dn = (t) => t.id == null ? t.flags & 2 ? -1 : 1 / 0 : t.id;
function vo(t) {
  try {
    for (Ye = 0; Ye < Ee.length; Ye++) {
      const e = Ee[Ye];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), Ln(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; Ye < Ee.length; Ye++) {
      const e = Ee[Ye];
      e && (e.flags &= -2);
    }
    Ye = -1, Ee.length = 0, yo(), Zn = null, (Ee.length || jt.length) && vo();
  }
}
let Oe = null, bo = null;
function Jn(t) {
  const e = Oe;
  return Oe = t, bo = t && t.type.__scopeId || null, e;
}
function Yt(t, e = Oe, n) {
  if (!e || t._n)
    return t;
  const r = (...i) => {
    r._d && tr(-1);
    const s = Jn(e), o = ut.length;
    let l;
    try {
      l = t(...i);
    } finally {
      for (let a = ut.length; a > o; a--) Ti();
      Jn(s), r._d && tr(1);
    }
    return l;
  };
  return r._n = !0, r._c = !0, r._d = !0, r;
}
function So(t, e) {
  if (Oe === null)
    return t;
  const n = br(Oe), r = t.dirs || (t.dirs = []);
  for (let i = 0; i < e.length; i++) {
    let [s, o, l, a = ae] = e[i];
    s && (q(s) && (s = {
      mounted: s,
      updated: s
    }), s.deep && lt(o), r.push({
      dir: s,
      instance: n,
      value: o,
      oldValue: void 0,
      arg: l,
      modifiers: a
    }));
  }
  return t;
}
function Ct(t, e, n, r) {
  const i = t.dirs, s = e && e.dirs;
  for (let o = 0; o < i.length; o++) {
    const l = i[o];
    s && (l.oldValue = s[o].value);
    let a = l.dir[r];
    a && (ct(), He(a, n, 8, [
      t.el,
      l,
      t,
      e
    ]), ft());
  }
}
function pa(t, e) {
  if (Te) {
    let n = Te.provides;
    const r = Te.parent && Te.parent.provides;
    r === n && (n = Te.provides = Object.create(r)), n[t] = e;
  }
}
function Nn(t, e, n = !1) {
  const r = Pi();
  if (r || kt) {
    let i = kt ? kt._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
    if (i && t in i)
      return i[t];
    if (arguments.length > 1)
      return n && q(e) ? e.call(r && r.proxy) : e;
  }
}
const ha = /* @__PURE__ */ Symbol.for("v-scx"), ga = () => Nn(ha);
function zn(t, e, n) {
  return wo(t, e, n);
}
function wo(t, e, n = ae) {
  const { immediate: r, deep: i, flush: s, once: o } = n, l = be({}, n), a = e && r || !e && s !== "post";
  let c;
  if (yn) {
    if (s === "sync") {
      const g = ga();
      c = g.__watcherHandles || (g.__watcherHandles = []);
    } else if (!a) {
      const g = () => {
      };
      return g.stop = tt, g.resume = tt, g.pause = tt, g;
    }
  }
  const u = Te;
  l.call = (g, y, v) => He(g, u, y, v);
  let f = !1;
  s === "post" ? l.scheduler = (g) => {
    Ae(g, u && u.suspense);
  } : s !== "sync" && (f = !0, l.scheduler = (g, y) => {
    y ? g() : bi(g);
  }), l.augmentJob = (g) => {
    e && (g.flags |= 4), f && (g.flags |= 2, u && (g.id = u.uid, g.i = u));
  };
  const p = ua(t, e, l);
  return yn && (c ? c.push(p) : a && p()), p;
}
function ma(t, e, n) {
  const r = this.proxy, i = de(t) ? t.includes(".") ? Oo(r, t) : () => r[t] : t.bind(r, r);
  let s;
  q(e) ? s = e : (s = e.handler, n = e);
  const o = Fn(this), l = wo(i, s.bind(r), n);
  return o(), l;
}
function Oo(t, e) {
  const n = e.split(".");
  return () => {
    let r = t;
    for (let i = 0; i < n.length && r; i++)
      r = r[n[i]];
    return r;
  };
}
const mt = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ Symbol("_vte"), pr = (t) => t.__isTeleport, xt = (t) => t && (t.disabled || t.disabled === ""), ya = (t) => t && (t.defer || t.defer === ""), Bi = (t) => typeof SVGElement < "u" && t instanceof SVGElement, Ni = (t) => typeof MathMLElement == "function" && t instanceof MathMLElement, Gr = (t, e) => {
  const n = t && t.to;
  return de(n) ? e ? e(n) : null : n;
}, va = {
  name: "Teleport",
  __isTeleport: !0,
  process(t, e, n, r, i, s, o, l, a, c) {
    const {
      mc: u,
      pc: f,
      pbc: p,
      o: { insert: g, querySelector: y, createText: v, createComment: b, parentNode: T }
    } = c, P = xt(e.props);
    let { dynamicChildren: L } = e;
    const _ = (j, U, V) => {
      j.shapeFlag & 16 && u(
        j.children,
        U,
        V,
        i,
        s,
        o,
        l,
        a
      );
    }, G = (j = e) => {
      const U = xt(j.props), V = j.target = Gr(j.props, y), A = qr(V, j, v, g);
      V && (o !== "svg" && Bi(V) ? o = "svg" : o !== "mathml" && Ni(V) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(V), U || (_(j, V, A), Qt(j, !1)));
    }, Z = (j) => {
      const U = () => {
        if (mt.get(j) === U) {
          if (mt.delete(j), xt(j.props)) {
            const V = T(j.el) || n;
            _(j, V, j.anchor), Qt(j, !0);
          }
          G(j);
        }
      };
      mt.set(j, U), Ae(U, s);
    };
    if (t == null) {
      const j = e.el = v(""), U = e.anchor = v("");
      if (g(j, n, r), g(U, n, r), ya(e.props) || s && s.pendingBranch) {
        Z(e);
        return;
      }
      P && (_(e, n, U), Qt(e, !0)), G();
    } else {
      e.el = t.el;
      const j = e.anchor = t.anchor, U = mt.get(t);
      if (U) {
        U.flags |= 8, mt.delete(t), Z(e);
        return;
      }
      e.targetStart = t.targetStart;
      const V = e.target = t.target, A = e.targetAnchor = t.targetAnchor, D = xt(t.props), S = D ? n : V, z = D ? j : A;
      if (o === "svg" || Bi(V) ? o = "svg" : (o === "mathml" || Ni(V)) && (o = "mathml"), L ? (p(
        t.dynamicChildren,
        L,
        S,
        i,
        s,
        o,
        l
      ), _i(t, e, !0)) : a || f(
        t,
        e,
        S,
        z,
        i,
        s,
        o,
        l,
        !1
      ), P)
        D ? e.props && t.props && e.props.to !== t.props.to && (e.props.to = t.props.to) : kn(
          e,
          n,
          j,
          c,
          1
        );
      else if ((e.props && e.props.to) !== (t.props && t.props.to)) {
        const Y = Gr(e.props, y);
        Y && (e.target = Y, kn(
          e,
          Y,
          null,
          c,
          0
        ));
      } else D && kn(
        e,
        V,
        A,
        c,
        1
      );
      Qt(e, P);
    }
  },
  remove(t, e, n, { um: r, o: { remove: i } }, s) {
    const {
      shapeFlag: o,
      children: l,
      anchor: a,
      targetStart: c,
      targetAnchor: u,
      target: f,
      props: p
    } = t, g = xt(p), y = s || !g, v = mt.get(t);
    if (v && (v.flags |= 8, mt.delete(t)), f && (i(c), i(u)), s && i(a), !v && (g || f) && o & 16)
      for (let b = 0; b < l.length; b++) {
        const T = l[b];
        r(
          T,
          e,
          n,
          y,
          !!T.dynamicChildren
        );
      }
  },
  move: kn,
  hydrate: ba
};
function kn(t, e, n, { o: { insert: r }, m: i }, s = 2) {
  s === 0 && r(t.targetAnchor, e, n);
  const { el: o, anchor: l, shapeFlag: a, children: c, props: u } = t, f = s === 2;
  if (f && r(o, e, n), !mt.has(t) && (!f || xt(u)) && a & 16)
    for (let p = 0; p < c.length; p++)
      i(
        c[p],
        e,
        n,
        2
      );
  f && r(l, e, n);
}
function ba(t, e, n, r, i, s, {
  o: { nextSibling: o, parentNode: l, querySelector: a, insert: c, createText: u }
}, f) {
  function p(b, T) {
    let P = T;
    for (; P; ) {
      if (P && P.nodeType === 8) {
        if (P.data === "teleport start anchor")
          e.targetStart = P;
        else if (P.data === "teleport anchor") {
          e.targetAnchor = P, b._lpa = e.targetAnchor && o(e.targetAnchor);
          break;
        }
      }
      P = o(P);
    }
  }
  function g(b, T) {
    T.anchor = f(
      o(b),
      T,
      l(b),
      n,
      r,
      i,
      s
    );
  }
  const y = e.target = Gr(
    e.props,
    a
  ), v = xt(e.props);
  if (y) {
    const b = y._lpa || y.firstChild;
    e.shapeFlag & 16 && (v ? (g(t, e), p(y, b), e.targetAnchor || qr(
      y,
      e,
      u,
      c,
      // if target is the same as the main view, insert anchors before current node
      // to avoid hydrating mismatch
      l(t) === y ? t : null
    )) : (e.anchor = o(t), p(y, b), e.targetAnchor || qr(y, e, u, c), f(
      b && o(b),
      e,
      y,
      n,
      r,
      i,
      s
    ))), Qt(e, v);
  } else v && e.shapeFlag & 16 && (g(t, e), e.targetStart = t, e.targetAnchor = o(t));
  return e.anchor && o(e.anchor);
}
const Sa = va;
function Qt(t, e) {
  const n = t.ctx;
  if (n && n.ut) {
    let r, i;
    for (e ? (r = t.el, i = t.anchor) : (r = t.targetStart, i = t.targetAnchor); r && r !== i; )
      r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
    n.ut();
  }
}
function qr(t, e, n, r, i = null) {
  const s = e.targetStart = n(""), o = e.targetAnchor = n("");
  return s[Co] = o, t && (r(s, t, i), r(o, t, i)), o;
}
const je = /* @__PURE__ */ Symbol("_leaveCb"), Gt = /* @__PURE__ */ Symbol("_enterCb");
function wa() {
  const t = {
    isMounted: !1,
    isLeaving: !1,
    isUnmounting: !1,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  return mr(() => {
    t.isMounted = !0;
  }), Si(() => {
    t.isUnmounting = !0;
  }), t;
}
const De = [Function, Array], Io = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: De,
  onEnter: De,
  onAfterEnter: De,
  onEnterCancelled: De,
  // leave
  onBeforeLeave: De,
  onLeave: De,
  onAfterLeave: De,
  onLeaveCancelled: De,
  // appear
  onBeforeAppear: De,
  onAppear: De,
  onAfterAppear: De,
  onAppearCancelled: De
}, _o = (t) => {
  const e = t.subTree;
  return e.component ? _o(e.component) : e;
}, Oa = {
  name: "BaseTransition",
  props: Io,
  setup(t, { slots: e }) {
    const n = Pi(), r = wa();
    return () => {
      const i = e.default && xo(e.default(), !0), s = i && i.length ? To(i) : (
        // Keep explicit default-slot conditionals on the same transition path
        // as regular v-if branches, which render a comment placeholder.
        n.subTree ? Fe() : void 0
      );
      if (!s)
        return;
      const o = /* @__PURE__ */ ee(t), { mode: l } = o;
      if (r.isLeaving)
        return xr(s);
      const a = Yn(s);
      if (!a)
        return xr(s);
      let c = Zr(
        a,
        o,
        r,
        n,
        // #11061, ensure enterHooks is fresh after clone
        (f) => c = f
      );
      a.type !== _e && pn(a, c);
      let u = n.subTree && Yn(n.subTree);
      if (u && u.type !== _e && !At(u, a) && _o(n).type !== _e) {
        let f = Zr(
          u,
          o,
          r,
          n
        );
        if (pn(u, f), l === "out-in" && a.type !== _e)
          return r.isLeaving = !0, f.afterLeave = () => {
            r.isLeaving = !1, n.job.flags & 8 || n.update(), delete f.afterLeave, u = void 0;
          }, xr(s);
        l === "in-out" && a.type !== _e ? f.delayLeave = (p, g, y) => {
          const v = Po(
            r,
            u
          );
          v[String(u.key)] = u, p[je] = () => {
            g(), p[je] = void 0, delete c.delayedLeave, u = void 0;
          }, c.delayedLeave = () => {
            y(), delete c.delayedLeave, u = void 0;
          };
        } : u = void 0;
      } else u && (u = void 0);
      return s;
    };
  }
};
function To(t) {
  let e = t[0];
  if (t.length > 1) {
    for (const n of t)
      if (n.type !== _e) {
        e = n;
        break;
      }
  }
  return e;
}
const Ca = Oa;
function Po(t, e) {
  const { leavingVNodes: n } = t;
  let r = n.get(e.type);
  return r || (r = /* @__PURE__ */ Object.create(null), n.set(e.type, r)), r;
}
function Zr(t, e, n, r, i) {
  const {
    appear: s,
    mode: o,
    persisted: l = !1,
    onBeforeEnter: a,
    onEnter: c,
    onAfterEnter: u,
    onEnterCancelled: f,
    onBeforeLeave: p,
    onLeave: g,
    onAfterLeave: y,
    onLeaveCancelled: v,
    onBeforeAppear: b,
    onAppear: T,
    onAfterAppear: P,
    onAppearCancelled: L
  } = e, _ = String(t.key), G = Po(n, t), Z = (V, A) => {
    V && He(
      V,
      r,
      9,
      A
    );
  }, j = (V, A) => {
    const D = A[1];
    Z(V, A), N(V) ? V.every((S) => S.length <= 1) && D() : V.length <= 1 && D();
  }, U = {
    mode: o,
    persisted: l,
    beforeEnter(V) {
      let A = a;
      if (!n.isMounted)
        if (s)
          A = b || a;
        else
          return;
      V[je] && V[je](
        !0
        /* cancelled */
      );
      const D = G[_];
      D && At(t, D) && D.el[je] && D.el[je](), Z(A, [V]);
    },
    enter(V) {
      if (G[_] === t) return;
      let A = c, D = u, S = f;
      if (!n.isMounted)
        if (s)
          A = T || c, D = P || u, S = L || f;
        else
          return;
      let z = !1;
      V[Gt] = (ge) => {
        z || (z = !0, ge ? Z(S, [V]) : Z(D, [V]), U.delayedLeave && U.delayedLeave(), V[Gt] = void 0);
      };
      const Y = V[Gt].bind(null, !1);
      A ? j(A, [V, Y]) : Y();
    },
    leave(V, A) {
      const D = String(t.key);
      if (V[Gt] && V[Gt](
        !0
        /* cancelled */
      ), n.isUnmounting)
        return A();
      Z(p, [V]);
      let S = !1;
      V[je] = (Y) => {
        S || (S = !0, A(), Y ? Z(v, [V]) : Z(y, [V]), V[je] = void 0, G[D] === t && delete G[D]);
      };
      const z = V[je].bind(null, !1);
      G[D] = t, g ? j(g, [V, z]) : z();
    },
    clone(V) {
      const A = Zr(
        V,
        e,
        n,
        r,
        i
      );
      return i && i(A), A;
    }
  };
  return U;
}
function xr(t) {
  if (hr(t))
    return t = St(t), t.children = null, t;
}
function Yn(t) {
  if (!hr(t))
    return pr(t.type) && t.children ? To(t.children) : t;
  if (t.component)
    return t.component.subTree;
  const { shapeFlag: e, children: n } = t;
  if (n) {
    if (e & 16)
      return n[0];
    if (e & 32 && q(n.default))
      return n.default();
  }
}
function pn(t, e) {
  if (t.shapeFlag & 6 && t.component) {
    t.transition = e;
    const n = t.component.subTree;
    pn(
      pr(n.type) && Yn(n) || n,
      e
    );
  } else t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
}
function xo(t, e = !1, n) {
  let r = [], i = 0;
  for (let s = 0; s < t.length; s++) {
    let o = t[s];
    const l = n == null ? o.key : String(n) + String(o.key != null ? o.key : s);
    o.type === ve ? (o.patchFlag & 128 && i++, r = r.concat(
      xo(o.children, e, l)
    )) : (e || o.type !== _e) && r.push(l != null ? St(o, { key: l }) : o);
  }
  if (i > 1)
    for (let s = 0; s < r.length; s++)
      r[s].patchFlag = -2;
  return r;
}
function Ao(t) {
  t.ids = [t.ids[0] + t.ids[2]++ + "-", 0, 0];
}
function zi(t, e) {
  let n;
  return !!((n = Object.getOwnPropertyDescriptor(t, e)) && !n.configurable);
}
const Qn = /* @__PURE__ */ new WeakMap();
function sn(t, e, n, r, i = !1) {
  if (N(t)) {
    t.forEach(
      (v, b) => sn(
        v,
        e && (N(e) ? e[b] : e),
        n,
        r,
        i
      )
    );
    return;
  }
  if (Rt(r) && !i) {
    r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && sn(t, e, n, r.component.subTree);
    return;
  }
  const s = r.shapeFlag & 4 ? br(r.component) : r.el, o = i ? null : s, { i: l, r: a } = t, c = e && e.r, u = l.refs === ae ? l.refs = {} : l.refs, f = l.setupState, p = /* @__PURE__ */ ee(f), g = f === ae ? Ws : (v) => zi(u, v) ? !1 : te(p, v), y = (v, b) => !(b && zi(u, b));
  if (c != null && c !== a) {
    if (Ki(e), de(c))
      u[c] = null, g(c) && (f[c] = null);
    else if (/* @__PURE__ */ Pe(c)) {
      const v = e;
      y(c, v.k) && (c.value = null), v.k && (u[v.k] = null);
    }
  }
  if (q(a))
    Ln(a, l, 12, [o, u]);
  else {
    const v = de(a), b = /* @__PURE__ */ Pe(a);
    if (v || b) {
      const T = () => {
        if (t.f) {
          const P = v ? g(a) ? f[a] : u[a] : y() || !t.k ? a.value : u[t.k];
          if (i)
            N(P) && ai(P, s);
          else if (N(P))
            P.includes(s) || P.push(s);
          else if (v)
            u[a] = [s], g(a) && (f[a] = u[a]);
          else {
            const L = [s];
            y(a, t.k) && (a.value = L), t.k && (u[t.k] = L);
          }
        } else v ? (u[a] = o, g(a) && (f[a] = o)) : b && (y(a, t.k) && (a.value = o), t.k && (u[t.k] = o));
      };
      if (o) {
        const P = () => {
          T(), Qn.delete(t);
        };
        P.id = -1, Qn.set(t, P), Ae(P, n);
      } else
        Ki(t), T();
    }
  }
}
function Ki(t) {
  const e = Qn.get(t);
  e && (e.flags |= 8, Qn.delete(t));
}
ar().requestIdleCallback;
ar().cancelIdleCallback;
const Rt = (t) => !!t.type.__asyncLoader, hr = (t) => t.type.__isKeepAlive;
function Ia(t, e) {
  Eo(t, "a", e);
}
function _a(t, e) {
  Eo(t, "da", e);
}
function Eo(t, e, n = Te) {
  const r = t.__wdc || (t.__wdc = () => {
    let i = n;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return t();
  });
  if (gr(e, r, n), n) {
    let i = n.parent;
    for (; i && i.parent; )
      hr(i.parent.vnode) && Ta(r, e, n, i), i = i.parent;
  }
}
function Ta(t, e, n, r) {
  const i = gr(
    e,
    t,
    r,
    !0
    /* prepend */
  );
  $o(() => {
    ai(r[e], i);
  }, n);
}
function gr(t, e, n = Te, r = !1) {
  if (n) {
    const i = n[t] || (n[t] = []), s = e.__weh || (e.__weh = (...o) => {
      ct();
      const l = Fn(n), a = He(e, n, t, o);
      return l(), ft(), a;
    });
    return r ? i.unshift(s) : i.push(s), s;
  }
}
const pt = (t) => (e, n = Te) => {
  (!yn || t === "sp") && gr(t, (...r) => e(...r), n);
}, Pa = pt("bm"), mr = pt("m"), xa = pt(
  "bu"
), Aa = pt("u"), Si = pt(
  "bum"
), $o = pt("um"), Ea = pt(
  "sp"
), $a = pt("rtg"), La = pt("rtc");
function Fa(t, e = Te) {
  gr("ec", t, e);
}
const wi = "components", Ma = "directives";
function vt(t, e) {
  return Oi(wi, t, !0, e) || t;
}
const Lo = /* @__PURE__ */ Symbol.for("v-ndc");
function Ar(t) {
  return de(t) ? Oi(wi, t, !1) || t : t || Lo;
}
function Fo(t) {
  return Oi(Ma, t);
}
function Oi(t, e, n = !0, r = !1) {
  const i = Oe || Te;
  if (i) {
    const s = i.type;
    if (t === wi) {
      const l = yu(
        s,
        !1
      );
      if (l && (l === e || l === $e(e) || l === lr($e(e))))
        return s;
    }
    const o = (
      // local registration
      // check instance[type] first which is resolved for options API
      Wi(i[t] || s[t], e) || // global registration
      Wi(i.appContext[t], e)
    );
    return !o && r ? s : o;
  }
}
function Wi(t, e) {
  return t && (t[e] || t[$e(e)] || t[lr($e(e))]);
}
function Xn(t, e, n, r) {
  let i;
  const s = n, o = N(t);
  if (o || de(t)) {
    const l = o && /* @__PURE__ */ $t(t);
    let a = !1, c = !1;
    l && (a = !/* @__PURE__ */ ke(t), c = /* @__PURE__ */ dt(t), t = cr(t)), i = new Array(t.length);
    for (let u = 0, f = t.length; u < f; u++)
      i[u] = e(
        a ? c ? Ht(ze(t[u])) : ze(t[u]) : t[u],
        u,
        void 0,
        s
      );
  } else if (typeof t == "number") {
    i = new Array(t);
    for (let l = 0; l < t; l++)
      i[l] = e(l + 1, l, void 0, s);
  } else if (ne(t))
    if (t[Symbol.iterator])
      i = Array.from(
        t,
        (l, a) => e(l, a, void 0, s)
      );
    else {
      const l = Object.keys(t);
      i = new Array(l.length);
      for (let a = 0, c = l.length; a < c; a++) {
        const u = l[a];
        i[a] = e(t[u], u, a, s);
      }
    }
  else
    i = [];
  return i;
}
function Va(t, e) {
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    if (N(r))
      for (let i = 0; i < r.length; i++)
        t[r[i].name] = r[i].fn;
    else r && (t[r.name] = r.key ? (...i) => {
      const s = r.fn(...i);
      return s && (s.key = r.key), s;
    } : r.fn);
  }
  return t;
}
function pe(t, e, n, r, i, s) {
  if (n == null && (n = {}), Oe.ce || Oe.parent && Rt(Oe.parent) && Oe.parent.ce) {
    const c = n, u = Object.keys(c).length > 0;
    return e !== "default" && (c.name = e), K(), Re(
      ve,
      null,
      [me("slot", c, r && r())],
      u ? -2 : 64
    );
  }
  let o = t[e];
  o && o._c && (o._d = !1);
  const l = ut.length;
  K();
  let a;
  try {
    const c = o && Mo(o(n)), u = n.key || s || // slot content array of a dynamic conditional slot may have a branch
    // key attached in the `createSlots` helper, respect that
    c && c.key;
    a = Re(
      ve,
      {
        key: (u && !Ne(u) ? u : `_${e}`) + // #7256 force differentiate fallback content from actual content
        (!c && r ? "_fb" : "")
      },
      c || (r ? r() : []),
      c && t._ === 1 ? 64 : -2
    );
  } catch (c) {
    for (let u = ut.length; u > l; u--) Ti();
    throw c;
  } finally {
    o && o._c && (o._d = !0);
  }
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), a;
}
function Mo(t) {
  return t.some((e) => gn(e) ? !(e.type === _e || e.type === ve && !Mo(e.children)) : !0) ? t : null;
}
const Jr = (t) => t ? Xo(t) ? br(t) : Jr(t.parent) : null, on = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ be(/* @__PURE__ */ Object.create(null), {
    $: (t) => t,
    $el: (t) => t.vnode.el,
    $data: (t) => t.data,
    $props: (t) => t.props,
    $attrs: (t) => t.attrs,
    $slots: (t) => t.slots,
    $refs: (t) => t.refs,
    $parent: (t) => Jr(t.parent),
    $root: (t) => Jr(t.root),
    $host: (t) => t.ce,
    $emit: (t) => t.emit,
    $options: (t) => Do(t),
    $forceUpdate: (t) => t.f || (t.f = () => {
      bi(t.update);
    }),
    $nextTick: (t) => t.n || (t.n = vi.bind(t.proxy)),
    $watch: (t) => ma.bind(t)
  })
), Er = (t, e) => t !== ae && !t.__isScriptSetup && te(t, e), Da = {
  get({ _: t }, e) {
    if (e === "__v_skip")
      return !0;
    const { ctx: n, setupState: r, data: i, props: s, accessCache: o, type: l, appContext: a } = t;
    if (e[0] !== "$") {
      const p = o[e];
      if (p !== void 0)
        switch (p) {
          case 1:
            return r[e];
          case 2:
            return i[e];
          case 4:
            return n[e];
          case 3:
            return s[e];
        }
      else {
        if (Er(r, e))
          return o[e] = 1, r[e];
        if (i !== ae && te(i, e))
          return o[e] = 2, i[e];
        if (te(s, e))
          return o[e] = 3, s[e];
        if (n !== ae && te(n, e))
          return o[e] = 4, n[e];
        Yr && (o[e] = 0);
      }
    }
    const c = on[e];
    let u, f;
    if (c)
      return e === "$attrs" && Ie(t.attrs, "get", ""), c(t);
    if (
      // css module (injected by vue-loader)
      (u = l.__cssModules) && (u = u[e])
    )
      return u;
    if (n !== ae && te(n, e))
      return o[e] = 4, n[e];
    if (
      // global properties
      f = a.config.globalProperties, te(f, e)
    )
      return f[e];
  },
  set({ _: t }, e, n) {
    const { data: r, setupState: i, ctx: s } = t;
    return Er(i, e) ? (i[e] = n, !0) : r !== ae && te(r, e) ? (r[e] = n, !0) : te(t.props, e) || e[0] === "$" && e.slice(1) in t ? !1 : (s[e] = n, !0);
  },
  has({
    _: { data: t, setupState: e, accessCache: n, ctx: r, appContext: i, props: s, type: o }
  }, l) {
    let a;
    return !!(n[l] || t !== ae && l[0] !== "$" && te(t, l) || Er(e, l) || te(s, l) || te(r, l) || te(on, l) || te(i.config.globalProperties, l) || (a = o.__cssModules) && a[l]);
  },
  defineProperty(t, e, n) {
    return n.get != null ? t._.accessCache[e] = 0 : te(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
  }
};
function Ui(t) {
  return N(t) ? t.reduce(
    (e, n) => (e[n] = null, e),
    {}
  ) : t;
}
let Yr = !0;
function ja(t) {
  const e = Do(t), n = t.proxy, r = t.ctx;
  Yr = !1, e.beforeCreate && Gi(e.beforeCreate, t, "bc");
  const {
    // state
    data: i,
    computed: s,
    methods: o,
    watch: l,
    provide: a,
    inject: c,
    // lifecycle
    created: u,
    beforeMount: f,
    mounted: p,
    beforeUpdate: g,
    updated: y,
    activated: v,
    deactivated: b,
    beforeDestroy: T,
    beforeUnmount: P,
    destroyed: L,
    unmounted: _,
    render: G,
    renderTracked: Z,
    renderTriggered: j,
    errorCaptured: U,
    serverPrefetch: V,
    // public API
    expose: A,
    inheritAttrs: D,
    // assets
    components: S,
    directives: z,
    filters: Y
  } = e;
  if (c && Ra(c, r, null), o)
    for (const se in o) {
      const ue = o[se];
      q(ue) && (r[se] = ue.bind(n));
    }
  if (i) {
    const se = i.call(n, n);
    ne(se) && (t.data = /* @__PURE__ */ fr(se));
  }
  if (Yr = !0, s)
    for (const se in s) {
      const ue = s[se], wt = q(ue) ? ue.bind(n, n) : q(ue.get) ? ue.get.bind(n, n) : tt, Mn = !q(ue) && q(ue.set) ? ue.set.bind(n) : tt, Ot = bu({
        get: wt,
        set: Mn
      });
      Object.defineProperty(r, se, {
        enumerable: !0,
        configurable: !0,
        get: () => Ot.value,
        set: (We) => Ot.value = We
      });
    }
  if (l)
    for (const se in l)
      Vo(l[se], r, n, se);
  if (a) {
    const se = q(a) ? a.call(n) : a;
    Reflect.ownKeys(se).forEach((ue) => {
      pa(ue, se[ue]);
    });
  }
  u && Gi(u, t, "c");
  function ie(se, ue) {
    N(ue) ? ue.forEach((wt) => se(wt.bind(n))) : ue && se(ue.bind(n));
  }
  if (ie(Pa, f), ie(mr, p), ie(xa, g), ie(Aa, y), ie(Ia, v), ie(_a, b), ie(Fa, U), ie(La, Z), ie($a, j), ie(Si, P), ie($o, _), ie(Ea, V), N(A))
    if (A.length) {
      const se = t.exposed || (t.exposed = {});
      A.forEach((ue) => {
        Object.defineProperty(se, ue, {
          get: () => n[ue],
          set: (wt) => n[ue] = wt,
          enumerable: !0
        });
      });
    } else t.exposed || (t.exposed = {});
  G && t.render === tt && (t.render = G), D != null && (t.inheritAttrs = D), S && (t.components = S), z && (t.directives = z), V && Ao(t);
}
function Ra(t, e, n = tt) {
  N(t) && (t = Qr(t));
  for (const r in t) {
    const i = t[r];
    let s;
    ne(i) ? "default" in i ? s = Nn(
      i.from || r,
      i.default,
      !0
    ) : s = Nn(i.from || r) : s = Nn(i), /* @__PURE__ */ Pe(s) ? Object.defineProperty(e, r, {
      enumerable: !0,
      configurable: !0,
      get: () => s.value,
      set: (o) => s.value = o
    }) : e[r] = s;
  }
}
function Gi(t, e, n) {
  He(
    N(t) ? t.map((r) => r.bind(e.proxy)) : t.bind(e.proxy),
    e,
    n
  );
}
function Vo(t, e, n, r) {
  let i = r.includes(".") ? Oo(n, r) : () => n[r];
  if (de(t)) {
    const s = e[t];
    q(s) && zn(i, s);
  } else if (q(t))
    zn(i, t.bind(n));
  else if (ne(t))
    if (N(t))
      t.forEach((s) => Vo(s, e, n, r));
    else {
      const s = q(t.handler) ? t.handler.bind(n) : e[t.handler];
      q(s) && zn(i, s, t);
    }
}
function Do(t) {
  const e = t.type, { mixins: n, extends: r } = e, {
    mixins: i,
    optionsCache: s,
    config: { optionMergeStrategies: o }
  } = t.appContext, l = s.get(e);
  let a;
  return l ? a = l : !i.length && !n && !r ? a = e : (a = {}, i.length && i.forEach(
    (c) => er(a, c, o, !0)
  ), er(a, e, o)), ne(e) && s.set(e, a), a;
}
function er(t, e, n, r = !1) {
  const { mixins: i, extends: s } = e;
  s && er(t, s, n, !0), i && i.forEach(
    (o) => er(t, o, n, !0)
  );
  for (const o in e)
    if (!(r && o === "expose")) {
      const l = ka[o] || n && n[o];
      t[o] = l ? l(t[o], e[o]) : e[o];
    }
  return t;
}
const ka = {
  data: qi,
  props: Zi,
  emits: Zi,
  // objects
  methods: Xt,
  computed: Xt,
  // lifecycle
  beforeCreate: xe,
  created: xe,
  beforeMount: xe,
  mounted: xe,
  beforeUpdate: xe,
  updated: xe,
  beforeDestroy: xe,
  beforeUnmount: xe,
  destroyed: xe,
  unmounted: xe,
  activated: xe,
  deactivated: xe,
  errorCaptured: xe,
  serverPrefetch: xe,
  // assets
  components: Xt,
  directives: Xt,
  // watch
  watch: Ba,
  // provide / inject
  provide: qi,
  inject: Ha
};
function qi(t, e) {
  return e ? t ? function() {
    return be(
      q(t) ? t.call(this, this) : t,
      q(e) ? e.call(this, this) : e
    );
  } : e : t;
}
function Ha(t, e) {
  return Xt(Qr(t), Qr(e));
}
function Qr(t) {
  if (N(t)) {
    const e = {};
    for (let n = 0; n < t.length; n++)
      e[t[n]] = t[n];
    return e;
  }
  return t;
}
function xe(t, e) {
  return t ? [...new Set([].concat(t, e))] : e;
}
function Xt(t, e) {
  return t ? be(/* @__PURE__ */ Object.create(null), t, e) : e;
}
function Zi(t, e) {
  return t ? N(t) && N(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : be(
    /* @__PURE__ */ Object.create(null),
    Ui(t),
    Ui(e ?? {})
  ) : e;
}
function Ba(t, e) {
  if (!t) return e;
  if (!e) return t;
  const n = be(/* @__PURE__ */ Object.create(null), t);
  for (const r in e)
    n[r] = xe(t[r], e[r]);
  return n;
}
function jo() {
  return {
    app: null,
    config: {
      isNativeTag: Ws,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let Na = 0;
function za(t, e) {
  return function(r, i = null) {
    q(r) || (r = be({}, r)), i != null && !ne(i) && (i = null);
    const s = jo(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const c = s.app = {
      _uid: Na++,
      _component: r,
      _props: i,
      _container: null,
      _context: s,
      _instance: null,
      version: wu,
      get config() {
        return s.config;
      },
      set config(u) {
      },
      use(u, ...f) {
        return o.has(u) || (u && q(u.install) ? (o.add(u), u.install(c, ...f)) : q(u) && (o.add(u), u(c, ...f))), c;
      },
      mixin(u) {
        return s.mixins.includes(u) || s.mixins.push(u), c;
      },
      component(u, f) {
        return f ? (s.components[u] = f, c) : s.components[u];
      },
      directive(u, f) {
        return f ? (s.directives[u] = f, c) : s.directives[u];
      },
      mount(u, f, p) {
        if (!a) {
          const g = c._ceVNode || me(r, i);
          return g.appContext = s, p === !0 ? p = "svg" : p === !1 && (p = void 0), t(g, u, p), a = !0, c._container = u, u.__vue_app__ = c, br(g.component);
        }
      },
      onUnmount(u) {
        l.push(u);
      },
      unmount() {
        a && (He(
          l,
          c._instance,
          16
        ), t(null, c._container), delete c._container.__vue_app__);
      },
      provide(u, f) {
        return s.provides[u] = f, c;
      },
      runWithContext(u) {
        const f = kt;
        kt = c;
        try {
          return u();
        } finally {
          kt = f;
        }
      }
    };
    return c;
  };
}
let kt = null;
const Ka = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${$e(e)}Modifiers`] || t[`${Lt(e)}Modifiers`];
function Wa(t, e, ...n) {
  if (t.isUnmounted) return;
  const r = t.vnode.props || ae;
  let i = n;
  const s = e.startsWith("update:"), o = s && Ka(r, e.slice(7));
  o && (o.trim && (i = n.map((u) => de(u) ? u.trim() : u)), o.number && (i = i.map(Pl)));
  let l, a = r[l = Or(e)] || // also try camelCase event handler (#2249)
  r[l = Or($e(e))];
  !a && s && (a = r[l = Or(Lt(e))]), a && He(
    a,
    t,
    6,
    i
  );
  const c = r[l + "Once"];
  if (c) {
    if (!t.emitted)
      t.emitted = {};
    else if (t.emitted[l])
      return;
    t.emitted[l] = !0, He(
      c,
      t,
      6,
      i
    );
  }
}
const Ua = /* @__PURE__ */ new WeakMap();
function Ro(t, e, n = !1) {
  const r = n ? Ua : e.emitsCache, i = r.get(t);
  if (i !== void 0)
    return i;
  const s = t.emits;
  let o = {}, l = !1;
  if (!q(t)) {
    const a = (c) => {
      const u = Ro(c, e, !0);
      u && (l = !0, be(o, u));
    };
    !n && e.mixins.length && e.mixins.forEach(a), t.extends && a(t.extends), t.mixins && t.mixins.forEach(a);
  }
  return !s && !l ? (ne(t) && r.set(t, null), null) : (N(s) ? s.forEach((a) => o[a] = null) : be(o, s), ne(t) && r.set(t, o), o);
}
function yr(t, e) {
  return !t || !ir(e) ? !1 : (e = e.slice(2), e = e === "Once" ? e : e.replace(/Once$/, ""), te(t, e[0].toLowerCase() + e.slice(1)) || te(t, Lt(e)) || te(t, e));
}
function Ji(t) {
  const {
    type: e,
    vnode: n,
    proxy: r,
    withProxy: i,
    propsOptions: [s],
    slots: o,
    attrs: l,
    emit: a,
    render: c,
    renderCache: u,
    props: f,
    data: p,
    setupState: g,
    ctx: y,
    inheritAttrs: v
  } = t, b = Jn(t);
  let T, P;
  try {
    if (n.shapeFlag & 4) {
      const _ = i || r, G = _;
      T = Xe(
        c.call(
          G,
          _,
          u,
          f,
          g,
          p,
          y
        )
      ), P = l;
    } else {
      const _ = e;
      T = Xe(
        _.length > 1 ? _(
          f,
          { attrs: l, slots: o, emit: a }
        ) : _(
          f,
          null
        )
      ), P = e.props ? l : Ga(l);
    }
  } catch (_) {
    ut.length = 0, dr(_, t, 1), T = me(_e);
  }
  let L = T;
  if (P && v !== !1) {
    const _ = Object.keys(P), { shapeFlag: G } = L;
    _.length && G & 7 && (s && _.some(sr) && (P = qa(
      P,
      s
    )), L = St(L, P, !1, !0));
  }
  if (n.dirs && (L = St(L, null, !1, !0), L.dirs = L.dirs ? L.dirs.concat(n.dirs) : n.dirs), n.transition) {
    const _ = pr(L.type) && Yn(L) || L;
    pn(_, n.transition);
  }
  return T = L, Jn(b), T;
}
const Ga = (t) => {
  let e;
  for (const n in t)
    (n === "class" || n === "style" || ir(n)) && ((e || (e = {}))[n] = t[n]);
  return e;
}, qa = (t, e) => {
  const n = {};
  for (const r in t)
    (!sr(r) || !(r.slice(9) in e)) && (n[r] = t[r]);
  return n;
};
function Za(t, e, n) {
  const { props: r, children: i, component: s } = t, { props: o, children: l, patchFlag: a } = e, c = s.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return r ? Yi(r, o, c) : !!o;
    if (a & 8) {
      const u = e.dynamicProps;
      for (let f = 0; f < u.length; f++) {
        const p = u[f];
        if (ko(o, r, p) && !yr(c, p))
          return !0;
      }
    }
  } else
    return (i || l) && (!l || !l.$stable) ? !0 : r === o ? !1 : r ? o ? Yi(r, o, c) : !0 : !!o;
  return !1;
}
function Yi(t, e, n) {
  const r = Object.keys(e);
  if (r.length !== Object.keys(t).length)
    return !0;
  for (let i = 0; i < r.length; i++) {
    const s = r[i];
    if (ko(e, t, s) && !yr(n, s))
      return !0;
  }
  return !1;
}
function ko(t, e, n) {
  const r = t[n], i = e[n];
  return n === "style" && ne(r) && ne(i) ? !ur(r, i) : r !== i;
}
function Ja({ vnode: t, parent: e, suspense: n }, r) {
  for (; e; ) {
    const i = e.subTree;
    if (i.suspense && i.suspense.activeBranch === t && (i.suspense.vnode.el = i.el = r, t = i), i === t)
      (t = e.vnode).el = r, e = e.parent;
    else
      break;
  }
  n && n.activeBranch === t && (n.vnode.el = r);
}
const Ho = {}, Bo = () => Object.create(Ho), No = (t) => Object.getPrototypeOf(t) === Ho;
function Ya(t, e, n, r = !1) {
  const i = {}, s = Bo();
  t.propsDefaults = /* @__PURE__ */ Object.create(null), zo(t, e, i, s);
  for (const o in t.propsOptions[0])
    o in i || (i[o] = void 0);
  n ? t.props = r ? i : /* @__PURE__ */ ta(i) : t.type.props ? t.props = i : t.props = s, t.attrs = s;
}
function Qa(t, e, n, r) {
  const {
    props: i,
    attrs: s,
    vnode: { patchFlag: o }
  } = t, l = /* @__PURE__ */ ee(i), [a] = t.propsOptions;
  let c = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (r || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const u = t.vnode.dynamicProps;
      for (let f = 0; f < u.length; f++) {
        let p = u[f];
        if (yr(t.emitsOptions, p))
          continue;
        const g = e[p];
        if (a)
          if (te(s, p))
            g !== s[p] && (s[p] = g, c = !0);
          else {
            const y = $e(p);
            i[y] = Xr(
              a,
              l,
              y,
              g,
              t,
              !1
            );
          }
        else
          g !== s[p] && (s[p] = g, c = !0);
      }
    }
  } else {
    zo(t, e, i, s) && (c = !0);
    let u;
    for (const f in l)
      (!e || // for camelCase
      !te(e, f) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = Lt(f)) === f || !te(e, u))) && (a ? n && // for camelCase
      (n[f] !== void 0 || // for kebab-case
      n[u] !== void 0) && (i[f] = Xr(
        a,
        l,
        f,
        void 0,
        t,
        !0
      )) : delete i[f]);
    if (s !== l)
      for (const f in s)
        (!e || !te(e, f)) && (delete s[f], c = !0);
  }
  c && ot(t.attrs, "set", "");
}
function zo(t, e, n, r) {
  const [i, s] = t.propsOptions;
  let o = !1, l;
  if (e)
    for (let a in e) {
      if (tn(a))
        continue;
      const c = e[a];
      let u;
      i && te(i, u = $e(a)) ? !s || !s.includes(u) ? n[u] = c : (l || (l = {}))[u] = c : yr(t.emitsOptions, a) || (!(a in r) || c !== r[a]) && (r[a] = c, o = !0);
    }
  if (s) {
    const a = /* @__PURE__ */ ee(n), c = l || ae;
    for (let u = 0; u < s.length; u++) {
      const f = s[u];
      n[f] = Xr(
        i,
        a,
        f,
        c[f],
        t,
        !te(c, f)
      );
    }
  }
  return o;
}
function Xr(t, e, n, r, i, s) {
  const o = t[n];
  if (o != null) {
    const l = te(o, "default");
    if (l && r === void 0) {
      const a = o.default;
      if (o.type !== Function && !o.skipFactory && q(a)) {
        const { propsDefaults: c } = i;
        if (n in c)
          r = c[n];
        else {
          const u = Fn(i);
          r = c[n] = a.call(
            null,
            e
          ), u();
        }
      } else
        r = a;
      i.ce && i.ce._setProp(n, r);
    }
    o[
      0
      /* shouldCast */
    ] && (s && !l ? r = !1 : o[
      1
      /* shouldCastTrue */
    ] && (r === "" || r === Lt(n)) && (r = !0));
  }
  return r;
}
const Xa = /* @__PURE__ */ new WeakMap();
function Ko(t, e, n = !1) {
  const r = n ? Xa : e.propsCache, i = r.get(t);
  if (i)
    return i;
  const s = t.props, o = {}, l = [];
  let a = !1;
  if (!q(t)) {
    const u = (f) => {
      a = !0;
      const [p, g] = Ko(f, e, !0);
      be(o, p), g && l.push(...g);
    };
    !n && e.mixins.length && e.mixins.forEach(u), t.extends && u(t.extends), t.mixins && t.mixins.forEach(u);
  }
  if (!s && !a)
    return ne(t) && r.set(t, Vt), Vt;
  if (N(s))
    for (let u = 0; u < s.length; u++) {
      const f = $e(s[u]);
      Qi(f) && (o[f] = ae);
    }
  else if (s)
    for (const u in s) {
      const f = $e(u);
      if (Qi(f)) {
        const p = s[u], g = o[f] = N(p) || q(p) ? { type: p } : be({}, p), y = g.type;
        let v = !1, b = !0;
        if (N(y))
          for (let T = 0; T < y.length; ++T) {
            const P = y[T], L = q(P) && P.name;
            if (L === "Boolean") {
              v = !0;
              break;
            } else L === "String" && (b = !1);
          }
        else
          v = q(y) && y.name === "Boolean";
        g[
          0
          /* shouldCast */
        ] = v, g[
          1
          /* shouldCastTrue */
        ] = b, (v || te(g, "default")) && l.push(f);
      }
    }
  const c = [o, l];
  return ne(t) && r.set(t, c), c;
}
function Qi(t) {
  return t[0] !== "$" && !tn(t);
}
const Ci = (t) => t === "_" || t === "_ctx" || t === "$stable", Ii = (t) => N(t) ? t.map(Xe) : [Xe(t)], eu = (t, e, n) => {
  if (e._n)
    return e;
  const r = Yt((...i) => Ii(e(...i)), n);
  return r._c = !1, r;
}, Wo = (t, e, n) => {
  const r = t._ctx;
  for (const i in t) {
    if (Ci(i)) continue;
    const s = t[i];
    if (q(s))
      e[i] = eu(i, s, r);
    else if (s != null) {
      const o = Ii(s);
      e[i] = () => o;
    }
  }
}, Uo = (t, e) => {
  const n = Ii(e);
  t.slots.default = () => n;
}, Go = (t, e, n) => {
  for (const r in e)
    (n || !Ci(r)) && (t[r] = e[r]);
}, tu = (t, e, n) => {
  const r = t.slots = Bo();
  if (t.vnode.shapeFlag & 32) {
    const i = e._;
    i ? (Go(r, e, n), n && Zs(r, "_", i, !0)) : Wo(e, r);
  } else e && Uo(t, e);
}, nu = (t, e, n) => {
  const { vnode: r, slots: i } = t;
  let s = !0, o = ae;
  if (r.shapeFlag & 32) {
    const l = e._;
    l ? n && l === 1 ? s = !1 : Go(i, e, n) : (s = !e.$stable, Wo(e, i)), o = e;
  } else e && (Uo(t, e), o = { default: 1 });
  if (s)
    for (const l in i)
      !Ci(l) && o[l] == null && delete i[l];
}, Ae = lu;
function ru(t) {
  return iu(t);
}
function iu(t, e) {
  const n = ar();
  n.__VUE__ = !0;
  const {
    insert: r,
    remove: i,
    patchProp: s,
    createElement: o,
    createText: l,
    createComment: a,
    setText: c,
    setElementText: u,
    parentNode: f,
    nextSibling: p,
    setScopeId: g = tt,
    insertStaticContent: y
  } = t, v = (d, h, m, I = null, C = null, w = null, $ = void 0, E = null, x = !!h.dynamicChildren) => {
    if (d === h)
      return;
    d && !At(d, h) && (I = Vn(d), We(d, C, w, !0), d = null), h.patchFlag === -2 && (x = !1, h.dynamicChildren = null);
    const { type: O, ref: B, shapeFlag: F } = h;
    switch (O) {
      case vr:
        b(d, h, m, I);
        break;
      case _e:
        T(d, h, m, I);
        break;
      case Lr:
        d == null && P(h, m, I, $);
        break;
      case ve:
        S(
          d,
          h,
          m,
          I,
          C,
          w,
          $,
          E,
          x
        );
        break;
      default:
        F & 1 ? G(
          d,
          h,
          m,
          I,
          C,
          w,
          $,
          E,
          x
        ) : F & 6 ? z(
          d,
          h,
          m,
          I,
          C,
          w,
          $,
          E,
          x
        ) : (F & 64 || F & 128) && O.process(
          d,
          h,
          m,
          I,
          C,
          w,
          $,
          E,
          x,
          Kt
        );
    }
    B != null && C ? sn(B, d && d.ref, w, h || d, !h) : B == null && d && d.ref != null && sn(d.ref, null, w, d, !0);
  }, b = (d, h, m, I) => {
    if (d == null)
      r(
        h.el = l(h.children),
        m,
        I
      );
    else {
      const C = h.el = d.el;
      h.children !== d.children && c(C, h.children);
    }
  }, T = (d, h, m, I) => {
    d == null ? r(
      h.el = a(h.children || ""),
      m,
      I
    ) : h.el = d.el;
  }, P = (d, h, m, I) => {
    [d.el, d.anchor] = y(
      d.children,
      h,
      m,
      I,
      d.el,
      d.anchor
    );
  }, L = ({ el: d, anchor: h }, m, I) => {
    let C;
    for (; d && d !== h; )
      C = p(d), r(d, m, I), d = C;
    r(h, m, I);
  }, _ = ({ el: d, anchor: h }) => {
    let m;
    for (; d && d !== h; )
      m = p(d), i(d), d = m;
    i(h);
  }, G = (d, h, m, I, C, w, $, E, x) => {
    if (h.type === "svg" ? $ = "svg" : h.type === "math" && ($ = "mathml"), d == null)
      Z(
        h,
        m,
        I,
        C,
        w,
        $,
        E,
        x
      );
    else {
      const O = d.el && d.el._isVueCE ? d.el : null;
      try {
        O && O._beginPatch(), V(
          d,
          h,
          C,
          w,
          $,
          E,
          x
        );
      } finally {
        O && O._endPatch();
      }
    }
  }, Z = (d, h, m, I, C, w, $, E) => {
    let x, O;
    const { props: B, shapeFlag: F, transition: k, dirs: W } = d;
    if (x = d.el = o(
      d.type,
      w,
      B && B.is,
      B
    ), F & 8 ? u(x, d.children) : F & 16 && U(
      d.children,
      x,
      null,
      I,
      C,
      $r(d, w),
      $,
      E
    ), W && Ct(d, null, I, "created"), j(x, d, d.scopeId, $, I), B) {
      for (const le in B)
        le !== "value" && !tn(le) && s(x, le, null, B[le], w, I);
      "value" in B && s(x, "value", null, B.value, w), (O = B.onVnodeBeforeMount) && Ze(O, I, d);
    }
    W && Ct(d, null, I, "beforeMount");
    const Q = su(C, k);
    Q && k.beforeEnter(x), r(x, h, m), ((O = B && B.onVnodeMounted) || Q || W) && Ae(() => {
      try {
        O && Ze(O, I, d), Q && k.enter(x), W && Ct(d, null, I, "mounted");
      } finally {
      }
    }, C);
  }, j = (d, h, m, I, C) => {
    if (m && g(d, m), I)
      for (let w = 0; w < I.length; w++)
        g(d, I[w]);
    if (C) {
      let w = C.subTree;
      if (h === w || Jo(w.type) && (w.ssContent === h || w.ssFallback === h)) {
        const $ = C.vnode;
        j(
          d,
          $,
          $.scopeId,
          $.slotScopeIds,
          C.parent
        );
      }
    }
  }, U = (d, h, m, I, C, w, $, E, x = 0) => {
    for (let O = x; O < d.length; O++) {
      const B = d[O] = E ? st(d[O]) : Xe(d[O]);
      v(
        null,
        B,
        h,
        m,
        I,
        C,
        w,
        $,
        E
      );
    }
  }, V = (d, h, m, I, C, w, $) => {
    const E = h.el = d.el;
    let { patchFlag: x, dynamicChildren: O, dirs: B } = h;
    x |= d.patchFlag & 16;
    const F = d.props || ae, k = h.props || ae;
    let W;
    if (m && It(m, !1), (W = k.onVnodeBeforeUpdate) && Ze(W, m, h, d), B && Ct(h, d, m, "beforeUpdate"), m && It(m, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    O && (!d.dynamicChildren || d.dynamicChildren.length !== O.length) && (x = 0, $ = !1, O = null), (F.innerHTML && k.innerHTML == null || F.textContent && k.textContent == null) && u(E, ""), O ? A(
      d.dynamicChildren,
      O,
      E,
      m,
      I,
      $r(h, C),
      w
    ) : $ || ue(
      d,
      h,
      E,
      null,
      m,
      I,
      $r(h, C),
      w,
      !1
    ), x > 0) {
      if (x & 16)
        D(E, F, k, m, C);
      else if (x & 2 && F.class !== k.class && s(E, "class", null, k.class, C), x & 4 && s(E, "style", F.style, k.style, C), x & 8) {
        const Q = h.dynamicProps;
        for (let le = 0; le < Q.length; le++) {
          const oe = Q[le], ye = F[oe], Se = k[oe];
          (Se !== ye || oe === "value") && s(E, oe, ye, Se, C, m);
        }
      }
      x & 1 && d.children !== h.children && u(E, h.children);
    } else !$ && O == null && D(E, F, k, m, C);
    ((W = k.onVnodeUpdated) || B) && Ae(() => {
      W && Ze(W, m, h, d), B && Ct(h, d, m, "updated");
    }, I);
  }, A = (d, h, m, I, C, w, $) => {
    for (let E = 0; E < h.length; E++) {
      const x = d[E], O = h[E], B = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        x.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (x.type === ve || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !At(x, O) || // - In the case of a component, it could contain anything.
        x.shapeFlag & 198) ? f(x.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          m
        )
      );
      v(
        x,
        O,
        B,
        null,
        I,
        C,
        w,
        $,
        !0
      );
    }
  }, D = (d, h, m, I, C) => {
    if (h !== m) {
      if (h !== ae)
        for (const w in h)
          !tn(w) && !(w in m) && s(
            d,
            w,
            h[w],
            null,
            C,
            I
          );
      for (const w in m) {
        if (tn(w)) continue;
        const $ = m[w], E = h[w];
        $ !== E && w !== "value" && s(d, w, E, $, C, I);
      }
      "value" in m && s(d, "value", h.value, m.value, C);
    }
  }, S = (d, h, m, I, C, w, $, E, x) => {
    const O = h.el = d ? d.el : l(""), B = h.anchor = d ? d.anchor : l("");
    let { patchFlag: F, dynamicChildren: k, slotScopeIds: W } = h;
    W && (E = E ? E.concat(W) : W), d == null ? (r(O, m, I), r(B, m, I), U(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      h.children || [],
      m,
      B,
      C,
      w,
      $,
      E,
      x
    )) : F > 0 && F & 64 && k && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren && d.dynamicChildren.length === k.length ? (A(
      d.dynamicChildren,
      k,
      m,
      C,
      w,
      $,
      E
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (h.key != null || C && h === C.subTree) && _i(
      d,
      h,
      !0
      /* shallow */
    )) : ue(
      d,
      h,
      m,
      B,
      C,
      w,
      $,
      E,
      x
    );
  }, z = (d, h, m, I, C, w, $, E, x) => {
    h.slotScopeIds = E, d == null ? h.shapeFlag & 512 ? C.ctx.activate(
      h,
      m,
      I,
      $,
      x
    ) : Y(
      h,
      m,
      I,
      C,
      w,
      $,
      x
    ) : ge(d, h, x);
  }, Y = (d, h, m, I, C, w, $) => {
    const E = d.component = du(
      d,
      I,
      C
    );
    if (hr(d) && (E.ctx.renderer = Kt), pu(E, !1, $), E.asyncDep) {
      if (C && C.registerDep(E, ie, $), !d.el) {
        const x = E.subTree = me(_e);
        T(null, x, h, m), d.placeholder = x.el;
      }
    } else
      ie(
        E,
        d,
        h,
        m,
        C,
        w,
        $
      );
  }, ge = (d, h, m) => {
    const I = h.component = d.component;
    if (Za(d, h, m))
      if (I.asyncDep && !I.asyncResolved) {
        se(I, h, m);
        return;
      } else
        I.next = h, I.update();
    else
      h.el = d.el, I.vnode = h;
  }, ie = (d, h, m, I, C, w, $) => {
    const E = () => {
      if (d.isMounted) {
        let { next: F, bu: k, u: W, parent: Q, vnode: le } = d;
        {
          const Ge = qo(d);
          if (Ge) {
            F && (F.el = le.el, se(d, F, $)), Ge.asyncDep.then(() => {
              Ae(() => {
                d.isUnmounted || O();
              }, C);
            });
            return;
          }
        }
        let oe = F, ye;
        It(d, !1), F ? (F.el = le.el, se(d, F, $)) : F = le, k && Cr(k), (ye = F.props && F.props.onVnodeBeforeUpdate) && Ze(ye, Q, F, le), It(d, !0);
        const Se = Ji(d), Ue = d.subTree;
        d.subTree = Se, v(
          Ue,
          Se,
          // parent may have changed if it's in a teleport
          f(Ue.el),
          // anchor may have changed if it's in a fragment
          Vn(Ue),
          d,
          C,
          w
        ), F.el = Se.el, oe === null && Ja(d, Se.el), W && Ae(W, C), (ye = F.props && F.props.onVnodeUpdated) && Ae(
          () => Ze(ye, Q, F, le),
          C
        );
      } else {
        let F;
        const { el: k, props: W } = h, { bm: Q, m: le, parent: oe, root: ye, type: Se } = d, Ue = Rt(h);
        It(d, !1), Q && Cr(Q), !Ue && (F = W && W.onVnodeBeforeMount) && Ze(F, oe, h), It(d, !0);
        {
          ye.ce && ye.ce._hasShadowRoot() && ye.ce._injectChildStyle(
            Se,
            d.parent ? d.parent.type : void 0
          );
          const Ge = d.subTree = Ji(d);
          v(
            null,
            Ge,
            m,
            I,
            d,
            C,
            w
          ), h.el = Ge.el;
        }
        if (le && Ae(le, C), !Ue && (F = W && W.onVnodeMounted)) {
          const Ge = h;
          Ae(
            () => Ze(F, oe, Ge),
            C
          );
        }
        (h.shapeFlag & 256 || oe && Rt(oe.vnode) && oe.vnode.shapeFlag & 256) && d.a && Ae(d.a, C), d.isMounted = !0, h = m = I = null;
      }
    };
    d.scope.on();
    const x = d.effect = new Xs(E);
    d.scope.off();
    const O = d.update = x.run.bind(x), B = d.job = x.runIfDirty.bind(x);
    B.i = d, B.id = d.uid, x.scheduler = () => bi(B), It(d, !0), O();
  }, se = (d, h, m) => {
    h.component = d;
    const I = d.vnode.props;
    d.vnode = h, d.next = null, Qa(d, h.props, I, m), nu(d, h.children, m), ct(), Hi(d), ft();
  }, ue = (d, h, m, I, C, w, $, E, x = !1) => {
    const O = d && d.children, B = d ? d.shapeFlag : 0, F = h.children, { patchFlag: k, shapeFlag: W } = h;
    if (k > 0) {
      if (k & 128) {
        Mn(
          O,
          F,
          m,
          I,
          C,
          w,
          $,
          E,
          x
        );
        return;
      } else if (k & 256) {
        wt(
          O,
          F,
          m,
          I,
          C,
          w,
          $,
          E,
          x
        );
        return;
      }
    }
    W & 8 ? (B & 16 && zt(O, C, w), F !== O && u(m, F)) : B & 16 ? W & 16 ? Mn(
      O,
      F,
      m,
      I,
      C,
      w,
      $,
      E,
      x
    ) : zt(O, C, w, !0) : (B & 8 && u(m, ""), W & 16 && U(
      F,
      m,
      I,
      C,
      w,
      $,
      E,
      x
    ));
  }, wt = (d, h, m, I, C, w, $, E, x) => {
    d = d || Vt, h = h || Vt;
    const O = d.length, B = h.length, F = Math.min(O, B);
    let k;
    for (k = 0; k < F; k++) {
      const W = h[k] = x ? st(h[k]) : Xe(h[k]);
      v(
        d[k],
        W,
        m,
        null,
        C,
        w,
        $,
        E,
        x
      );
    }
    O > B ? zt(
      d,
      C,
      w,
      !0,
      !1,
      F
    ) : U(
      h,
      m,
      I,
      C,
      w,
      $,
      E,
      x,
      F
    );
  }, Mn = (d, h, m, I, C, w, $, E, x) => {
    let O = 0;
    const B = h.length;
    let F = d.length - 1, k = B - 1;
    for (; O <= F && O <= k; ) {
      const W = d[O], Q = h[O] = x ? st(h[O]) : Xe(h[O]);
      if (At(W, Q))
        v(
          W,
          Q,
          m,
          null,
          C,
          w,
          $,
          E,
          x
        );
      else
        break;
      O++;
    }
    for (; O <= F && O <= k; ) {
      const W = d[F], Q = h[k] = x ? st(h[k]) : Xe(h[k]);
      if (At(W, Q))
        v(
          W,
          Q,
          m,
          null,
          C,
          w,
          $,
          E,
          x
        );
      else
        break;
      F--, k--;
    }
    if (O > F) {
      if (O <= k) {
        const W = k + 1, Q = W < B ? h[W].el : I;
        for (; O <= k; )
          v(
            null,
            h[O] = x ? st(h[O]) : Xe(h[O]),
            m,
            Q,
            C,
            w,
            $,
            E,
            x
          ), O++;
      }
    } else if (O > k)
      for (; O <= F; )
        We(d[O], C, w, !0), O++;
    else {
      const W = O, Q = O, le = /* @__PURE__ */ new Map();
      for (O = Q; O <= k; O++) {
        const Me = h[O] = x ? st(h[O]) : Xe(h[O]);
        Me.key != null && le.set(Me.key, O);
      }
      let oe, ye = 0;
      const Se = k - Q + 1;
      let Ue = !1, Ge = 0;
      const Wt = new Array(Se);
      for (O = 0; O < Se; O++) Wt[O] = 0;
      for (O = W; O <= F; O++) {
        const Me = d[O];
        if (ye >= Se) {
          We(Me, C, w, !0);
          continue;
        }
        let qe;
        if (Me.key != null)
          qe = le.get(Me.key);
        else
          for (oe = Q; oe <= k; oe++)
            if (Wt[oe - Q] === 0 && At(Me, h[oe])) {
              qe = oe;
              break;
            }
        qe === void 0 ? We(Me, C, w, !0) : (Wt[qe - Q] = O + 1, qe >= Ge ? Ge = qe : Ue = !0, v(
          Me,
          h[qe],
          m,
          null,
          C,
          w,
          $,
          E,
          x
        ), ye++);
      }
      const Li = Ue ? ou(Wt) : Vt;
      for (oe = Li.length - 1, O = Se - 1; O >= 0; O--) {
        const Me = Q + O, qe = h[Me], Fi = h[Me + 1], Mi = Me + 1 < B ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          Fi.el || Zo(Fi)
        ) : I;
        Wt[O] === 0 ? v(
          null,
          qe,
          m,
          Mi,
          C,
          w,
          $,
          E,
          x
        ) : Ue && (oe < 0 || O !== Li[oe] ? Ot(qe, m, Mi, 2) : oe--);
      }
    }
  }, Ot = (d, h, m, I, C = null) => {
    const { el: w, type: $, transition: E, children: x, shapeFlag: O } = d;
    if (O & 6) {
      Ot(d.component.subTree, h, m, I);
      return;
    }
    if (O & 128) {
      d.suspense.move(h, m, I);
      return;
    }
    if (O & 64) {
      $.move(d, h, m, Kt);
      return;
    }
    if ($ === ve) {
      r(w, h, m);
      for (let F = 0; F < x.length; F++)
        Ot(x[F], h, m, I);
      r(d.anchor, h, m);
      return;
    }
    if ($ === Lr) {
      L(d, h, m);
      return;
    }
    if (I !== 2 && O & 1 && E)
      if (I === 0)
        E.persisted && !w[je] ? r(w, h, m) : (E.beforeEnter(w), r(w, h, m), Ae(() => E.enter(w), C));
      else {
        const { leave: F, delayLeave: k, afterLeave: W } = E, Q = () => {
          d.ctx.isUnmounted ? i(w) : r(w, h, m);
        }, le = () => {
          const oe = w._isLeaving || !!w[je];
          w._isLeaving && w[je](
            !0
            /* cancelled */
          ), E.persisted && !oe ? Q() : F(w, () => {
            Q(), W && W();
          });
        };
        k ? k(w, Q, le) : le();
      }
    else
      r(w, h, m);
  }, We = (d, h, m, I = !1, C = !1) => {
    const {
      type: w,
      props: $,
      ref: E,
      children: x,
      dynamicChildren: O,
      shapeFlag: B,
      patchFlag: F,
      dirs: k,
      cacheIndex: W,
      memo: Q
    } = d;
    if (F === -2 && (C = !1), E != null && (ct(), sn(E, null, m, d, !0), ft()), W != null && (h.renderCache[W] = void 0), B & 256) {
      h.ctx.deactivate(d);
      return;
    }
    const le = B & 1 && k, oe = !Rt(d);
    let ye;
    if (oe && (ye = $ && $.onVnodeBeforeUnmount) && Ze(ye, h, d), B & 6)
      Ol(d.component, m, I);
    else {
      if (B & 128) {
        d.suspense.unmount(m, I);
        return;
      }
      le && Ct(d, null, h, "beforeUnmount"), B & 64 ? d.type.remove(
        d,
        h,
        m,
        Kt,
        I
      ) : O && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !O.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (w !== ve || F > 0 && F & 64) ? zt(
        O,
        h,
        m,
        !1,
        !0
      ) : (w === ve && F & 384 || !C && B & 16) && zt(x, h, m), I && Ei(d);
    }
    const Se = Q != null && W == null;
    (oe && (ye = $ && $.onVnodeUnmounted) || le || Se) && Ae(() => {
      ye && Ze(ye, h, d), le && Ct(d, null, h, "unmounted"), Se && (d.el = null);
    }, m);
  }, Ei = (d) => {
    const { type: h, el: m, anchor: I, transition: C } = d;
    if (h === ve) {
      wl(m, I);
      return;
    }
    if (h === Lr) {
      _(d);
      return;
    }
    const w = () => {
      i(m), C && !C.persisted && C.afterLeave && C.afterLeave();
    };
    if (d.shapeFlag & 1 && C && !C.persisted) {
      const { leave: $, delayLeave: E } = C, x = () => $(m, w);
      E ? E(d.el, w, x) : x();
    } else
      w();
  }, wl = (d, h) => {
    let m;
    for (; d !== h; )
      m = p(d), i(d), d = m;
    i(h);
  }, Ol = (d, h, m) => {
    const { bum: I, scope: C, job: w, subTree: $, um: E, m: x, a: O } = d;
    Xi(x), Xi(O), I && Cr(I), C.stop(), w && (w.flags |= 8, We($, d, h, m)), E && Ae(E, h), Ae(() => {
      d.isUnmounted = !0;
    }, h);
  }, zt = (d, h, m, I = !1, C = !1, w = 0) => {
    for (let $ = w; $ < d.length; $++)
      We(d[$], h, m, I, C);
  }, Vn = (d) => {
    if (d.shapeFlag & 6)
      return Vn(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const h = p(d.anchor || d.el), m = h && h[Co];
    return m ? p(m) : h;
  };
  let wr = !1;
  const $i = (d, h, m) => {
    let I;
    d == null ? h._vnode && (We(h._vnode, null, null, !0), I = h._vnode.component) : v(
      h._vnode || null,
      d,
      h,
      null,
      null,
      null,
      m
    ), h._vnode = d, wr || (wr = !0, Hi(I), yo(), wr = !1);
  }, Kt = {
    p: v,
    um: We,
    m: Ot,
    r: Ei,
    mt: Y,
    mc: U,
    pc: ue,
    pbc: A,
    n: Vn,
    o: t
  };
  return {
    render: $i,
    hydrate: void 0,
    createApp: za($i)
  };
}
function $r({ type: t, props: e }, n) {
  return n === "svg" && t === "foreignObject" || n === "mathml" && t === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : n;
}
function It({ effect: t, job: e }, n) {
  n ? (t.flags |= 32, e.flags |= 4) : (t.flags &= -33, e.flags &= -5);
}
function su(t, e) {
  return (!t || t && !t.pendingBranch) && e && !e.persisted;
}
function _i(t, e, n = !1) {
  const r = t.children, i = e.children;
  if (N(r) && N(i))
    for (let s = 0; s < r.length; s++) {
      const o = r[s];
      let l = i[s];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = i[s] = st(i[s]), l.el = o.el), !n && l.patchFlag !== -2 && _i(o, l)), l.type === vr && (l.patchFlag === -1 && (l = i[s] = st(l)), l.el = o.el), l.type === _e && !l.el && (l.el = o.el);
    }
}
function ou(t) {
  const e = t.slice(), n = [0];
  let r, i, s, o, l;
  const a = t.length;
  for (r = 0; r < a; r++) {
    const c = t[r];
    if (c !== 0) {
      if (i = n[n.length - 1], t[i] < c) {
        e[r] = i, n.push(r);
        continue;
      }
      for (s = 0, o = n.length - 1; s < o; )
        l = s + o >> 1, t[n[l]] < c ? s = l + 1 : o = l;
      c < t[n[s]] && (s > 0 && (e[r] = n[s - 1]), n[s] = r);
    }
  }
  for (s = n.length, o = n[s - 1]; s-- > 0; )
    n[s] = o, o = e[o];
  return n;
}
function qo(t) {
  const e = t.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : qo(e);
}
function Xi(t) {
  if (t)
    for (let e = 0; e < t.length; e++)
      t[e].flags |= 8;
}
function Zo(t) {
  if (t.placeholder)
    return t.placeholder;
  const e = t.component;
  return e ? Zo(e.subTree) : null;
}
const Jo = (t) => t.__isSuspense;
function lu(t, e) {
  e && e.pendingBranch ? N(t) ? e.effects.push(...t) : e.effects.push(t) : da(t);
}
const ve = /* @__PURE__ */ Symbol.for("v-fgt"), vr = /* @__PURE__ */ Symbol.for("v-txt"), _e = /* @__PURE__ */ Symbol.for("v-cmt"), Lr = /* @__PURE__ */ Symbol.for("v-stc"), ut = [];
let Ve = null;
function K(t = !1) {
  ut.push(Ve = t ? null : []);
}
function Ti() {
  ut.pop(), Ve = ut[ut.length - 1] || null;
}
let hn = 1;
function tr(t, e = !1) {
  hn += t, t < 0 && Ve && e && (Ve.hasOnce = !0);
}
function Yo(t) {
  return t.dynamicChildren = hn > 0 ? Ve || Vt : null, Ti(), hn > 0 && Ve && Ve.push(t), t;
}
function J(t, e, n, r, i, s) {
  return Yo(
    re(
      t,
      e,
      n,
      r,
      i,
      s,
      !0
    )
  );
}
function Re(t, e, n, r, i) {
  return Yo(
    me(
      t,
      e,
      n,
      r,
      i,
      !0
    )
  );
}
function gn(t) {
  return t ? t.__v_isVNode === !0 : !1;
}
function At(t, e) {
  return t.type === e.type && t.key === e.key;
}
const Qo = ({ key: t }) => t ?? null, Kn = ({
  ref: t,
  ref_key: e,
  ref_for: n
}) => (typeof t == "number" && (t = "" + t), t != null ? de(t) || /* @__PURE__ */ Pe(t) || q(t) ? { i: Oe, r: t, k: e, f: !!n } : t : null);
function re(t, e = null, n = null, r = 0, i = null, s = t === ve ? 0 : 1, o = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t,
    props: e,
    key: e && Qo(e),
    ref: e && Kn(e),
    scopeId: bo,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: s,
    patchFlag: r,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: Oe
  };
  return l ? (nr(a, n), s & 128 && t.normalize(a)) : n && (a.shapeFlag |= de(n) ? 8 : 16), hn > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  Ve && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || s & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && Ve.push(a), a;
}
const me = au;
function au(t, e = null, n = null, r = 0, i = null, s = !1) {
  if ((!t || t === Lo) && (t = _e), gn(t)) {
    const l = St(
      t,
      e,
      !0
      /* mergeRef: true */
    );
    return n && nr(l, n), hn > 0 && !s && Ve && (l.shapeFlag & 6 ? Ve[Ve.indexOf(t)] = l : Ve.push(l)), l.patchFlag = -2, l;
  }
  if (vu(t) && (t = t.__vccOpts), e) {
    e = uu(e);
    let { class: l, style: a } = e;
    l && !de(l) && (e.class = at(l)), ne(a) && (/* @__PURE__ */ yi(a) && !N(a) && (a = be({}, a)), e.style = ci(a));
  }
  const o = de(t) ? 1 : Jo(t) ? 128 : pr(t) ? 64 : ne(t) ? 4 : q(t) ? 2 : 0;
  return re(
    t,
    e,
    n,
    r,
    i,
    o,
    s,
    !0
  );
}
function uu(t) {
  return t ? /* @__PURE__ */ yi(t) || No(t) ? be({}, t) : t : null;
}
function St(t, e, n = !1, r = !1) {
  const { props: i, ref: s, patchFlag: o, children: l, transition: a } = t, c = e ? R(i || {}, e) : i, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: t.type,
    props: c,
    key: c && Qo(c),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && s ? N(s) ? s.concat(Kn(e)) : [s, Kn(e)] : Kn(e)
    ) : s,
    scopeId: t.scopeId,
    slotScopeIds: t.slotScopeIds,
    children: l,
    target: t.target,
    targetStart: t.targetStart,
    targetAnchor: t.targetAnchor,
    staticCount: t.staticCount,
    shapeFlag: t.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: e && t.type !== ve ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: t.dynamicProps,
    dynamicChildren: t.dynamicChildren,
    appContext: t.appContext,
    dirs: t.dirs,
    transition: a,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: t.component,
    suspense: t.suspense,
    ssContent: t.ssContent && St(t.ssContent),
    ssFallback: t.ssFallback && St(t.ssFallback),
    placeholder: t.placeholder,
    el: t.el,
    anchor: t.anchor,
    ctx: t.ctx,
    ce: t.ce
  };
  return a && r && pn(
    u,
    a.clone(u)
  ), u;
}
function ln(t = " ", e = 0) {
  return me(vr, null, t, e);
}
function Fe(t = "", e = !1) {
  return e ? (K(), Re(_e, null, t)) : me(_e, null, t);
}
function Xe(t) {
  return t == null || typeof t == "boolean" ? me(_e) : N(t) ? me(
    ve,
    null,
    // #3666, avoid reference pollution when reusing vnode
    t.slice()
  ) : gn(t) ? st(t) : me(vr, null, String(t));
}
function st(t) {
  return t.el === null && t.patchFlag !== -1 || t.memo ? t : St(t);
}
function nr(t, e) {
  let n = 0;
  const { shapeFlag: r } = t;
  if (e == null)
    e = null;
  else if (N(e))
    n = 16;
  else if (typeof e == "object")
    if (r & 65) {
      const i = e.default;
      i && (i._c && (i._d = !1), nr(t, i()), i._c && (i._d = !0));
      return;
    } else {
      n = 32;
      const i = e._;
      !i && !No(e) ? e._ctx = Oe : i === 3 && Oe && (Oe.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
    }
  else if (q(e)) {
    if (r & 65) {
      nr(t, { default: e });
      return;
    }
    e = { default: e, _ctx: Oe }, n = 32;
  } else
    e = String(e), r & 64 ? (n = 16, e = [ln(e)]) : n = 8;
  t.children = e, t.shapeFlag |= n;
}
function R(...t) {
  const e = {};
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    for (const i in r)
      if (i === "class")
        e.class !== r.class && (e.class = at([e.class, r.class]));
      else if (i === "style")
        e.style = ci([e.style, r.style]);
      else if (ir(i)) {
        const s = e[i], o = r[i];
        o && s !== o && !(N(s) && s.includes(o)) ? e[i] = s ? [].concat(s, o) : o : o == null && s == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !sr(i) && (e[i] = o);
      } else i !== "" && (e[i] = r[i]);
  }
  return e;
}
function Ze(t, e, n, r = null) {
  He(t, e, 7, [
    n,
    r
  ]);
}
const cu = jo();
let fu = 0;
function du(t, e, n) {
  const r = t.type, i = (e ? e.appContext : t.appContext) || cu, s = {
    uid: fu++,
    vnode: t,
    type: r,
    parent: e,
    appContext: i,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Dl(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: e ? e.provides : Object.create(i.provides),
    ids: e ? e.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Ko(r, i),
    emitsOptions: Ro(r, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: ae,
    // inheritAttrs
    inheritAttrs: r.inheritAttrs,
    // state
    ctx: ae,
    data: ae,
    props: ae,
    attrs: ae,
    slots: ae,
    refs: ae,
    setupState: ae,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return s.ctx = { _: s }, s.root = e ? e.root : s, s.emit = Wa.bind(null, s), t.ce && t.ce(s), s;
}
let Te = null;
const Pi = () => Te || Oe;
let rr, mn;
{
  const t = ar(), e = (n, r) => {
    let i;
    return (i = t[n]) || (i = t[n] = []), i.push(r), (s) => {
      i.length > 1 ? i.forEach((o) => o(s)) : i[0](s);
    };
  };
  rr = e(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Te = n
  ), mn = e(
    "__VUE_SSR_SETTERS__",
    (n) => yn = n
  );
}
const Fn = (t) => {
  const e = Te;
  return rr(t), t.scope.on(), () => {
    t.scope.off(), rr(e);
  };
}, es = () => {
  Te && Te.scope.off(), rr(null);
};
function Xo(t) {
  return t.vnode.shapeFlag & 4;
}
let yn = !1;
function pu(t, e = !1, n = !1) {
  e && mn(e);
  const { props: r, children: i } = t.vnode, s = Xo(t);
  Ya(t, r, s, e), tu(t, i, n || e);
  const o = s ? hu(t, e) : void 0;
  return e && mn(!1), o;
}
function hu(t, e) {
  const n = t.type;
  t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, Da);
  const { setup: r } = n;
  if (r) {
    ct();
    const i = t.setupContext = r.length > 1 ? mu(t) : null, s = Fn(t), o = Ln(
      r,
      t,
      0,
      [
        t.props,
        i
      ]
    ), l = Us(o);
    if (ft(), s(), (l || t.sp) && !Rt(t) && Ao(t), l) {
      if (o.then(es, es), e)
        return o.then((a) => {
          mn(!0);
          try {
            ts(t, a, e);
          } finally {
            mn(!1);
          }
        }).catch((a) => {
          dr(a, t, 0);
        });
      t.asyncDep = o;
    } else
      ts(t, o);
  } else
    el(t);
}
function ts(t, e, n) {
  q(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : ne(e) && (t.setupState = ho(e)), el(t);
}
function el(t, e, n) {
  const r = t.type;
  t.render || (t.render = r.render || tt);
  {
    const i = Fn(t);
    ct();
    try {
      ja(t);
    } finally {
      ft(), i();
    }
  }
}
const gu = {
  get(t, e) {
    return Ie(t, "get", ""), t[e];
  }
};
function mu(t) {
  const e = (n) => {
    t.exposed = n || {};
  };
  return {
    attrs: new Proxy(t.attrs, gu),
    slots: t.slots,
    emit: t.emit,
    expose: e
  };
}
function br(t) {
  return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(ho(na(t.exposed)), {
    get(e, n) {
      if (n in e)
        return e[n];
      if (n in on)
        return on[n](t);
    },
    has(e, n) {
      return n in e || n in on;
    }
  })) : t.proxy;
}
function yu(t, e = !0) {
  return q(t) ? t.displayName || t.name : t.name || e && t.__name;
}
function vu(t) {
  return q(t) && "__vccOpts" in t;
}
const bu = (t, e) => /* @__PURE__ */ la(t, e, yn);
function Su(t, e, n) {
  try {
    tr(-1);
    const r = arguments.length;
    return r === 2 ? ne(e) && !N(e) ? gn(e) ? me(t, null, [e]) : me(t, e) : me(t, null, e) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && gn(n) && (n = [n]), me(t, e, n));
  } finally {
    tr(1);
  }
}
const wu = "3.5.42";
/**
* @vue/runtime-dom v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ei;
const ns = typeof window < "u" && window.trustedTypes;
if (ns)
  try {
    ei = /* @__PURE__ */ ns.createPolicy("vue", {
      createHTML: (t) => t
    });
  } catch {
  }
const tl = ei ? (t) => ei.createHTML(t) : (t) => t, Ou = "http://www.w3.org/2000/svg", Cu = "http://www.w3.org/1998/Math/MathML", it = typeof document < "u" ? document : null, rs = it && /* @__PURE__ */ it.createElement("template"), Iu = {
  insert: (t, e, n) => {
    e.insertBefore(t, n || null);
  },
  remove: (t) => {
    const e = t.parentNode;
    e && e.removeChild(t);
  },
  createElement: (t, e, n, r) => {
    const i = e === "svg" ? it.createElementNS(Ou, t) : e === "mathml" ? it.createElementNS(Cu, t) : n ? it.createElement(t, { is: n }) : it.createElement(t);
    return t === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
  },
  createText: (t) => it.createTextNode(t),
  createComment: (t) => it.createComment(t),
  setText: (t, e) => {
    t.nodeValue = e;
  },
  setElementText: (t, e) => {
    t.textContent = e;
  },
  parentNode: (t) => t.parentNode,
  nextSibling: (t) => t.nextSibling,
  querySelector: (t) => it.querySelector(t),
  setScopeId(t, e) {
    t.setAttribute(e, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(t, e, n, r, i, s) {
    const o = n ? n.previousSibling : e.lastChild;
    if (i && (i === s || i.nextSibling))
      for (; e.insertBefore(i.cloneNode(!0), n), !(i === s || !(i = i.nextSibling)); )
        ;
    else {
      rs.innerHTML = tl(
        r === "svg" ? `<svg>${t}</svg>` : r === "mathml" ? `<math>${t}</math>` : t
      );
      const l = rs.content;
      if (r === "svg" || r === "mathml") {
        const a = l.firstChild;
        for (; a.firstChild; )
          l.appendChild(a.firstChild);
        l.removeChild(a);
      }
      e.insertBefore(l, n);
    }
    return [
      // first
      o ? o.nextSibling : e.firstChild,
      // last
      n ? n.previousSibling : e.lastChild
    ];
  }
}, ht = "transition", qt = "animation", vn = /* @__PURE__ */ Symbol("_vtc"), nl = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: !0
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
}, _u = /* @__PURE__ */ be(
  {},
  Io,
  nl
), Tu = (t) => (t.displayName = "Transition", t.props = _u, t), Pu = /* @__PURE__ */ Tu(
  (t, { slots: e }) => Su(Ca, xu(t), e)
), _t = (t, e = []) => {
  N(t) ? t.forEach((n) => n(...e)) : t && t(...e);
}, is = (t) => t ? N(t) ? t.some((e) => e.length > 1) : t.length > 1 : !1;
function xu(t) {
  const e = {};
  for (const S in t)
    S in nl || (e[S] = t[S]);
  if (t.css === !1)
    return e;
  const {
    name: n = "v",
    type: r,
    duration: i,
    enterFromClass: s = `${n}-enter-from`,
    enterActiveClass: o = `${n}-enter-active`,
    enterToClass: l = `${n}-enter-to`,
    appearFromClass: a = s,
    appearActiveClass: c = o,
    appearToClass: u = l,
    leaveFromClass: f = `${n}-leave-from`,
    leaveActiveClass: p = `${n}-leave-active`,
    leaveToClass: g = `${n}-leave-to`
  } = t, y = Au(i), v = y && y[0], b = y && y[1], {
    onBeforeEnter: T,
    onEnter: P,
    onEnterCancelled: L,
    onLeave: _,
    onLeaveCancelled: G,
    onBeforeAppear: Z = T,
    onAppear: j = P,
    onAppearCancelled: U = L
  } = e, V = (S, z, Y, ge) => {
    S._enterCancelled = ge, Tt(S, z ? u : l), Tt(S, z ? c : o), Y && Y();
  }, A = (S, z) => {
    S._isLeaving = !1, Tt(S, f), Tt(S, g), Tt(S, p), z && z();
  }, D = (S) => (z, Y) => {
    const ge = S ? j : P, ie = () => V(z, S, Y);
    _t(ge, [z, ie]), ss(() => {
      Tt(z, S ? a : s), rt(z, S ? u : l), is(ge) || os(z, r, v, ie);
    });
  };
  return be(e, {
    onBeforeEnter(S) {
      _t(T, [S]), rt(S, s), rt(S, o);
    },
    onBeforeAppear(S) {
      _t(Z, [S]), rt(S, a), rt(S, c);
    },
    onEnter: D(!1),
    onAppear: D(!0),
    onLeave(S, z) {
      S._isLeaving = !0;
      const Y = () => A(S, z);
      rt(S, f), S._enterCancelled ? (rt(S, p), us(S)) : (us(S), rt(S, p)), ss(() => {
        S._isLeaving && (Tt(S, f), rt(S, g), is(_) || os(S, r, b, Y));
      }), _t(_, [S, Y]);
    },
    onEnterCancelled(S) {
      V(S, !1, void 0, !0), _t(L, [S]);
    },
    onAppearCancelled(S) {
      V(S, !0, void 0, !0), _t(U, [S]);
    },
    onLeaveCancelled(S) {
      A(S), _t(G, [S]);
    }
  });
}
function Au(t) {
  if (t == null)
    return null;
  if (ne(t))
    return [Fr(t.enter), Fr(t.leave)];
  {
    const e = Fr(t);
    return [e, e];
  }
}
function Fr(t) {
  return xl(t);
}
function rt(t, e) {
  e.split(/\s+/).forEach((n) => n && t.classList.add(n)), (t[vn] || (t[vn] = /* @__PURE__ */ new Set())).add(e);
}
function Tt(t, e) {
  e.split(/\s+/).forEach((r) => r && t.classList.remove(r));
  const n = t[vn];
  n && (n.delete(e), n.size || (t[vn] = void 0));
}
function ss(t) {
  requestAnimationFrame(() => {
    requestAnimationFrame(t);
  });
}
let Eu = 0;
function os(t, e, n, r) {
  const i = t._endId = ++Eu, s = () => {
    i === t._endId && r();
  };
  if (n != null)
    return setTimeout(s, n);
  const { type: o, timeout: l, propCount: a } = $u(t, e);
  if (!o)
    return r();
  const c = o + "end";
  let u = 0;
  const f = () => {
    t.removeEventListener(c, p), s();
  }, p = (g) => {
    g.target === t && ++u >= a && f();
  };
  setTimeout(() => {
    u < a && f();
  }, l + 1), t.addEventListener(c, p);
}
function $u(t, e) {
  const n = window.getComputedStyle(t), r = (y) => (n[y] || "").split(", "), i = r(`${ht}Delay`), s = r(`${ht}Duration`), o = ls(i, s), l = r(`${qt}Delay`), a = r(`${qt}Duration`), c = ls(l, a);
  let u = null, f = 0, p = 0;
  e === ht ? o > 0 && (u = ht, f = o, p = s.length) : e === qt ? c > 0 && (u = qt, f = c, p = a.length) : (f = Math.max(o, c), u = f > 0 ? o > c ? ht : qt : null, p = u ? u === ht ? s.length : a.length : 0);
  const g = u === ht && /\b(?:transform|all)(?:,|$)/.test(
    r(`${ht}Property`).toString()
  );
  return {
    type: u,
    timeout: f,
    propCount: p,
    hasTransform: g
  };
}
function ls(t, e) {
  for (; t.length < e.length; )
    t = t.concat(t);
  return Math.max(...e.map((n, r) => as(n) + as(t[r])));
}
function as(t) {
  return t === "auto" ? 0 : Number(t.slice(0, -1).replace(",", ".")) * 1e3;
}
function us(t) {
  return (t ? t.ownerDocument : document).body.offsetHeight;
}
function Lu(t, e, n) {
  const r = t[vn];
  r && (e = (e ? [e, ...r] : [...r]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
const cs = /* @__PURE__ */ Symbol("_vod"), Fu = /* @__PURE__ */ Symbol("_vsh"), Mu = /* @__PURE__ */ Symbol(""), Vu = /(?:^|;)\s*display\s*:/;
function Du(t, e, n) {
  const r = t.style, i = de(n);
  let s = !1;
  if (n && !i) {
    if (e)
      if (de(e))
        for (const o of e.split(";")) {
          const l = o.slice(0, o.indexOf(":")).trim();
          n[l] == null && en(r, l, "");
        }
      else
        for (const o in e)
          n[o] == null && en(r, o, "");
    for (const o in n) {
      o === "display" && (s = !0);
      const l = n[o];
      l != null ? Ru(
        t,
        o,
        !de(e) && e ? e[o] : void 0,
        l
      ) || en(r, o, l) : en(r, o, "");
    }
  } else if (i) {
    if (e !== n) {
      const o = r[Mu];
      o && (n += ";" + o), r.cssText = n, s = Vu.test(n);
    }
  } else e && t.removeAttribute("style");
  cs in t && (t[cs] = s ? r.display : "", t[Fu] && (r.display = "none"));
}
const Hn = /\s*!important$/;
function en(t, e, n) {
  if (N(n))
    n.forEach((r) => en(t, e, r));
  else if (n == null && (n = ""), e.startsWith("--"))
    Hn.test(n) ? t.setProperty(e, n.replace(Hn, ""), "important") : t.setProperty(e, n);
  else {
    const r = ju(t, e);
    Hn.test(n) ? t.setProperty(
      Lt(r),
      n.replace(Hn, ""),
      "important"
    ) : t[r] = n;
  }
}
const fs = ["Webkit", "Moz", "ms"], Mr = {};
function ju(t, e) {
  const n = Mr[e];
  if (n)
    return n;
  let r = $e(e);
  if (r !== "filter" && r in t)
    return Mr[e] = r;
  r = lr(r);
  for (let i = 0; i < fs.length; i++) {
    const s = fs[i] + r;
    if (s in t)
      return Mr[e] = s;
  }
  return e;
}
function Ru(t, e, n, r) {
  return t.tagName === "TEXTAREA" && (e === "width" || e === "height") && de(r) && n === r;
}
const ds = "http://www.w3.org/1999/xlink";
function ps(t, e, n, r, i, s = Ml(e)) {
  r && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(ds, e.slice(6, e.length)) : t.setAttributeNS(ds, e, n) : n == null || s && !Js(n) ? t.removeAttribute(e) : t.setAttribute(
    e,
    s ? "" : Ne(n) ? String(n) : n
  );
}
function hs(t, e, n, r, i) {
  if (e === "innerHTML" || e === "textContent") {
    n != null && (t[e] = e === "innerHTML" ? tl(n) : n);
    return;
  }
  const s = t.tagName;
  if (e === "value" && s !== "PROGRESS" && // custom elements may use _value internally
  !s.includes("-")) {
    const l = s === "OPTION" ? t.getAttribute("value") || "" : t.value, a = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      t.type === "checkbox" ? "on" : ""
    ) : String(n);
    (l !== a || !("_value" in t)) && (t.value = a), n == null && t.removeAttribute(e), t._value = n;
    return;
  }
  let o = !1;
  if (n === "" || n == null) {
    const l = typeof t[e];
    l === "boolean" ? n = Js(n) : n == null && l === "string" ? (n = "", o = !0) : l === "number" && (n = 0, o = !0);
  }
  try {
    t[e] = n;
  } catch {
  }
  o && t.removeAttribute(i || e);
}
function ku(t, e, n, r) {
  t.addEventListener(e, n, r);
}
function Hu(t, e, n, r) {
  t.removeEventListener(e, n, r);
}
const gs = /* @__PURE__ */ Symbol("_vei");
function Bu(t, e, n, r, i = null) {
  const s = t[gs] || (t[gs] = {}), o = s[e];
  if (r && o)
    o.value = r;
  else {
    const [l, a] = Ku(e);
    if (r) {
      const c = s[e] = Gu(
        r,
        i
      );
      ku(t, l, c, a);
    } else o && (Hu(t, l, o, a), s[e] = void 0);
  }
}
const Nu = /(Once|Passive|Capture)$/, zu = /^on:?(?:Once|Passive|Capture)$/;
function Ku(t) {
  let e, n;
  for (; (n = t.match(Nu)) && !zu.test(t); )
    e || (e = {}), t = t.slice(0, t.length - n[1].length), e[n[1].toLowerCase()] = !0;
  return [t[2] === ":" ? t.slice(3) : Lt(t.slice(2)), e];
}
let Vr = 0;
const Wu = /* @__PURE__ */ Promise.resolve(), Uu = () => Vr || (Wu.then(() => Vr = 0), Vr = Date.now());
function Gu(t, e) {
  const n = (r) => {
    if (!r._vts)
      r._vts = Date.now();
    else if (r._vts <= n.attached)
      return;
    const i = n.value;
    if (N(i)) {
      const s = r.stopImmediatePropagation;
      r.stopImmediatePropagation = () => {
        s.call(r), r._stopped = !0;
      };
      const o = i.slice(), l = [r];
      for (let a = 0; a < o.length && !r._stopped; a++) {
        const c = o[a];
        c && He(
          c,
          e,
          5,
          l
        );
      }
    } else
      He(
        i,
        e,
        5,
        [r]
      );
  };
  return n.value = t, n.attached = Uu(), n;
}
const ms = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // lowercase letter
t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, qu = (t, e, n, r, i, s) => {
  const o = i === "svg";
  e === "class" ? Lu(t, r, o) : e === "style" ? Du(t, n, r) : ir(e) ? sr(e) || Bu(t, e, n, r, s) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : Zu(t, e, r, o)) ? (hs(t, e, r), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && ps(t, e, r, o, s, e !== "value")) : /* #11081 force set props for possible async custom element */ t._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (Ju(t, e) || // @ts-expect-error _def is private
  t._def.__asyncLoader && (/[A-Z]/.test(e) || !de(r))) ? hs(t, $e(e), r, s, e) : (e === "true-value" ? t._trueValue = r : e === "false-value" && (t._falseValue = r), ps(t, e, r, o));
};
function Zu(t, e, n, r) {
  if (r)
    return !!(e === "innerHTML" || e === "textContent" || e in t && ms(e) && q(n));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && t.tagName === "IFRAME" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const i = t.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return ms(e) && de(n) ? !1 : e in t;
}
function Ju(t, e) {
  const n = (
    // @ts-expect-error _def is private
    t._def.props
  );
  if (!n)
    return !1;
  const r = $e(e);
  return Array.isArray(n) ? n.some((i) => $e(i) === r) : Object.keys(n).some((i) => $e(i) === r);
}
const Yu = /* @__PURE__ */ be({ patchProp: qu }, Iu);
let ys;
function Qu() {
  return ys || (ys = ru(Yu));
}
const Xu = (...t) => {
  const e = Qu().createApp(...t), { mount: n } = e;
  return e.mount = (r) => {
    const i = tc(r);
    if (!i) return;
    const s = e._component;
    !q(s) && !s.render && !s.template && (s.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const o = n(i, !1, ec(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), o;
  }, e;
};
function ec(t) {
  if (t instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && t instanceof MathMLElement)
    return "mathml";
}
function tc(t) {
  return de(t) ? document.querySelector(t) : t;
}
function Dr(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = xi(t)) || e) {
      n && (t = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(c) {
        throw c;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var s = !0, o = !1, l;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var c = n.next();
    return s = c.done, c;
  }, e: function(c) {
    o = !0, l = c;
  }, f: function() {
    try {
      !s && n.return != null && n.return();
    } finally {
      if (o) throw l;
    }
  } };
}
function nc(t) {
  return sc(t) || ic(t) || xi(t) || rc();
}
function rc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ic(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function sc(t) {
  if (Array.isArray(t)) return ti(t);
}
function an(t) {
  "@babel/helpers - typeof";
  return an = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, an(t);
}
function jr(t, e) {
  return ac(t) || lc(t, e) || xi(t, e) || oc();
}
function oc() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xi(t, e) {
  if (t) {
    if (typeof t == "string") return ti(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return ti(t, e);
  }
}
function ti(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function lc(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, s, o, l = [], a = !0, c = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(a = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (u) {
      c = !0, i = u;
    } finally {
      try {
        if (!a && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function ac(t) {
  if (Array.isArray(t)) return t;
}
var H = {
  innerWidth: function(e) {
    if (e) {
      var n = e.offsetWidth, r = getComputedStyle(e);
      return n += parseFloat(r.paddingLeft) + parseFloat(r.paddingRight), n;
    }
    return 0;
  },
  width: function(e) {
    if (e) {
      var n = e.offsetWidth, r = getComputedStyle(e);
      return n -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight), n;
    }
    return 0;
  },
  getWindowScrollTop: function() {
    var e = document.documentElement;
    return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
  },
  getWindowScrollLeft: function() {
    var e = document.documentElement;
    return (window.pageXOffset || e.scrollLeft) - (e.clientLeft || 0);
  },
  getOuterWidth: function(e, n) {
    if (e) {
      var r = e.offsetWidth;
      if (n) {
        var i = getComputedStyle(e);
        r += parseFloat(i.marginLeft) + parseFloat(i.marginRight);
      }
      return r;
    }
    return 0;
  },
  getOuterHeight: function(e, n) {
    if (e) {
      var r = e.offsetHeight;
      if (n) {
        var i = getComputedStyle(e);
        r += parseFloat(i.marginTop) + parseFloat(i.marginBottom);
      }
      return r;
    }
    return 0;
  },
  getClientHeight: function(e, n) {
    if (e) {
      var r = e.clientHeight;
      if (n) {
        var i = getComputedStyle(e);
        r += parseFloat(i.marginTop) + parseFloat(i.marginBottom);
      }
      return r;
    }
    return 0;
  },
  getViewport: function() {
    var e = window, n = document, r = n.documentElement, i = n.getElementsByTagName("body")[0], s = e.innerWidth || r.clientWidth || i.clientWidth, o = e.innerHeight || r.clientHeight || i.clientHeight;
    return {
      width: s,
      height: o
    };
  },
  getOffset: function(e) {
    if (e) {
      var n = e.getBoundingClientRect();
      return {
        top: n.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
        left: n.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0)
      };
    }
    return {
      top: "auto",
      left: "auto"
    };
  },
  index: function(e) {
    if (e)
      for (var n, r = (n = this.getParentNode(e)) === null || n === void 0 ? void 0 : n.childNodes, i = 0, s = 0; s < r.length; s++) {
        if (r[s] === e) return i;
        r[s].nodeType === 1 && i++;
      }
    return -1;
  },
  addMultipleClasses: function(e, n) {
    var r = this;
    e && n && [n].flat().filter(Boolean).forEach(function(i) {
      return i.split(" ").forEach(function(s) {
        return r.addClass(e, s);
      });
    });
  },
  removeMultipleClasses: function(e, n) {
    var r = this;
    e && n && [n].flat().filter(Boolean).forEach(function(i) {
      return i.split(" ").forEach(function(s) {
        return r.removeClass(e, s);
      });
    });
  },
  addClass: function(e, n) {
    e && n && !this.hasClass(e, n) && (e.classList ? e.classList.add(n) : e.className += " " + n);
  },
  removeClass: function(e, n) {
    e && n && (e.classList ? e.classList.remove(n) : e.className = e.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " "));
  },
  hasClass: function(e, n) {
    return e ? e.classList ? e.classList.contains(n) : new RegExp("(^| )" + n + "( |$)", "gi").test(e.className) : !1;
  },
  addStyles: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    e && Object.entries(n).forEach(function(r) {
      var i = jr(r, 2), s = i[0], o = i[1];
      return e.style[s] = o;
    });
  },
  find: function(e, n) {
    return this.isElement(e) ? e.querySelectorAll(n) : [];
  },
  findSingle: function(e, n) {
    return this.isElement(e) ? e.querySelector(n) : null;
  },
  createElement: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (e) {
      var r = document.createElement(e);
      this.setAttributes(r, n);
      for (var i = arguments.length, s = new Array(i > 2 ? i - 2 : 0), o = 2; o < i; o++)
        s[o - 2] = arguments[o];
      return r.append.apply(r, s), r;
    }
  },
  setAttribute: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0;
    this.isElement(e) && r !== null && r !== void 0 && e.setAttribute(n, r);
  },
  setAttributes: function(e) {
    var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.isElement(e)) {
      var i = function s(o, l) {
        var a, c, u = e != null && (a = e.$attrs) !== null && a !== void 0 && a[o] ? [e == null || (c = e.$attrs) === null || c === void 0 ? void 0 : c[o]] : [];
        return [l].flat().reduce(function(f, p) {
          if (p != null) {
            var g = an(p);
            if (g === "string" || g === "number")
              f.push(p);
            else if (g === "object") {
              var y = Array.isArray(p) ? s(o, p) : Object.entries(p).map(function(v) {
                var b = jr(v, 2), T = b[0], P = b[1];
                return o === "style" && (P || P === 0) ? "".concat(T.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), ":").concat(P) : P ? T : void 0;
              });
              f = y.length ? f.concat(y.filter(function(v) {
                return !!v;
              })) : f;
            }
          }
          return f;
        }, u);
      };
      Object.entries(r).forEach(function(s) {
        var o = jr(s, 2), l = o[0], a = o[1];
        if (a != null) {
          var c = l.match(/^on(.+)/);
          c ? e.addEventListener(c[1].toLowerCase(), a) : l === "p-bind" ? n.setAttributes(e, a) : (a = l === "class" ? nc(new Set(i("class", a))).join(" ").trim() : l === "style" ? i("style", a).join(";").trim() : a, (e.$attrs = e.$attrs || {}) && (e.$attrs[l] = a), e.setAttribute(l, a));
        }
      });
    }
  },
  getAttribute: function(e, n) {
    if (this.isElement(e)) {
      var r = e.getAttribute(n);
      return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
    }
  },
  isAttributeEquals: function(e, n, r) {
    return this.isElement(e) ? this.getAttribute(e, n) === r : !1;
  },
  isAttributeNotEquals: function(e, n, r) {
    return !this.isAttributeEquals(e, n, r);
  },
  getHeight: function(e) {
    if (e) {
      var n = e.offsetHeight, r = getComputedStyle(e);
      return n -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), n;
    }
    return 0;
  },
  getWidth: function(e) {
    if (e) {
      var n = e.offsetWidth, r = getComputedStyle(e);
      return n -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), n;
    }
    return 0;
  },
  absolutePosition: function(e, n) {
    var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
    if (e) {
      var i = e.offsetParent ? {
        width: e.offsetWidth,
        height: e.offsetHeight
      } : this.getHiddenElementDimensions(e), s = i.height, o = i.width, l = n.offsetHeight, a = n.offsetWidth, c = n.getBoundingClientRect(), u = this.getWindowScrollTop(), f = this.getWindowScrollLeft(), p = this.getViewport(), g, y, v = "top";
      c.top + l + s > p.height ? (g = c.top + u - s, v = "bottom", g < 0 && (g = u)) : g = l + c.top + u, c.left + o > p.width ? y = Math.max(0, c.left + f + a - o) : y = c.left + f, e.style.top = g + "px", e.style.left = y + "px", e.style.transformOrigin = v, r && (e.style.marginTop = v === "bottom" ? "calc(var(--p-anchor-gutter) * -1)" : "calc(var(--p-anchor-gutter))");
    }
  },
  relativePosition: function(e, n) {
    var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
    if (e) {
      var i = e.offsetParent ? {
        width: e.offsetWidth,
        height: e.offsetHeight
      } : this.getHiddenElementDimensions(e), s = n.offsetHeight, o = n.getBoundingClientRect(), l = this.getViewport(), a, c, u = "top";
      o.top + s + i.height > l.height ? (a = -1 * i.height, u = "bottom", o.top + a < 0 && (a = -1 * o.top)) : a = s, i.width > l.width ? c = o.left * -1 : o.left + i.width > l.width ? c = (o.left + i.width - l.width) * -1 : c = 0, e.style.top = a + "px", e.style.left = c + "px", e.style.transformOrigin = u, r && (e.style.marginTop = u === "bottom" ? "calc(var(--p-anchor-gutter) * -1)" : "calc(var(--p-anchor-gutter))");
    }
  },
  nestedPosition: function(e, n) {
    if (e) {
      var r = e.parentElement, i = this.getOffset(r), s = this.getViewport(), o = e.offsetParent ? e.offsetWidth : this.getHiddenElementOuterWidth(e), l = this.getOuterWidth(r.children[0]), a;
      parseInt(i.left, 10) + l + o > s.width - this.calculateScrollbarWidth() ? parseInt(i.left, 10) < o ? n % 2 === 1 ? a = parseInt(i.left, 10) ? "-" + parseInt(i.left, 10) + "px" : "100%" : n % 2 === 0 && (a = s.width - o - this.calculateScrollbarWidth() + "px") : a = "-100%" : a = "100%", e.style.top = "0px", e.style.left = a;
    }
  },
  getParentNode: function(e) {
    var n = e == null ? void 0 : e.parentNode;
    return n && n instanceof ShadowRoot && n.host && (n = n.host), n;
  },
  getParents: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], r = this.getParentNode(e);
    return r === null ? n : this.getParents(r, n.concat([r]));
  },
  getScrollableParents: function(e) {
    var n = [];
    if (e) {
      var r = this.getParents(e), i = /(auto|scroll)/, s = function(b) {
        try {
          var T = window.getComputedStyle(b, null);
          return i.test(T.getPropertyValue("overflow")) || i.test(T.getPropertyValue("overflowX")) || i.test(T.getPropertyValue("overflowY"));
        } catch {
          return !1;
        }
      }, o = Dr(r), l;
      try {
        for (o.s(); !(l = o.n()).done; ) {
          var a = l.value, c = a.nodeType === 1 && a.dataset.scrollselectors;
          if (c) {
            var u = c.split(","), f = Dr(u), p;
            try {
              for (f.s(); !(p = f.n()).done; ) {
                var g = p.value, y = this.findSingle(a, g);
                y && s(y) && n.push(y);
              }
            } catch (v) {
              f.e(v);
            } finally {
              f.f();
            }
          }
          a.nodeType !== 9 && s(a) && n.push(a);
        }
      } catch (v) {
        o.e(v);
      } finally {
        o.f();
      }
    }
    return n;
  },
  getHiddenElementOuterHeight: function(e) {
    if (e) {
      e.style.visibility = "hidden", e.style.display = "block";
      var n = e.offsetHeight;
      return e.style.display = "none", e.style.visibility = "visible", n;
    }
    return 0;
  },
  getHiddenElementOuterWidth: function(e) {
    if (e) {
      e.style.visibility = "hidden", e.style.display = "block";
      var n = e.offsetWidth;
      return e.style.display = "none", e.style.visibility = "visible", n;
    }
    return 0;
  },
  getHiddenElementDimensions: function(e) {
    if (e) {
      var n = {};
      return e.style.visibility = "hidden", e.style.display = "block", n.width = e.offsetWidth, n.height = e.offsetHeight, e.style.display = "none", e.style.visibility = "visible", n;
    }
    return 0;
  },
  fadeIn: function(e, n) {
    if (e) {
      e.style.opacity = 0;
      var r = +/* @__PURE__ */ new Date(), i = 0, s = function o() {
        i = +e.style.opacity + ((/* @__PURE__ */ new Date()).getTime() - r) / n, e.style.opacity = i, r = +/* @__PURE__ */ new Date(), +i < 1 && (window.requestAnimationFrame && requestAnimationFrame(o) || setTimeout(o, 16));
      };
      s();
    }
  },
  fadeOut: function(e, n) {
    if (e)
      var r = 1, i = 50, s = n, o = i / s, l = setInterval(function() {
        r -= o, r <= 0 && (r = 0, clearInterval(l)), e.style.opacity = r;
      }, i);
  },
  getUserAgent: function() {
    return navigator.userAgent;
  },
  appendChild: function(e, n) {
    if (this.isElement(n)) n.appendChild(e);
    else if (n.el && n.elElement) n.elElement.appendChild(e);
    else throw new Error("Cannot append " + n + " to " + e);
  },
  isElement: function(e) {
    return (typeof HTMLElement > "u" ? "undefined" : an(HTMLElement)) === "object" ? e instanceof HTMLElement : e && an(e) === "object" && e !== null && e.nodeType === 1 && typeof e.nodeName == "string";
  },
  scrollInView: function(e, n) {
    var r = getComputedStyle(e).getPropertyValue("borderTopWidth"), i = r ? parseFloat(r) : 0, s = getComputedStyle(e).getPropertyValue("paddingTop"), o = s ? parseFloat(s) : 0, l = e.getBoundingClientRect(), a = n.getBoundingClientRect(), c = a.top + document.body.scrollTop - (l.top + document.body.scrollTop) - i - o, u = e.scrollTop, f = e.clientHeight, p = this.getOuterHeight(n);
    c < 0 ? e.scrollTop = u + c : c + p > f && (e.scrollTop = u + c - f + p);
  },
  clearSelection: function() {
    if (window.getSelection)
      window.getSelection().empty ? window.getSelection().empty() : window.getSelection().removeAllRanges && window.getSelection().rangeCount > 0 && window.getSelection().getRangeAt(0).getClientRects().length > 0 && window.getSelection().removeAllRanges();
    else if (document.selection && document.selection.empty)
      try {
        document.selection.empty();
      } catch {
      }
  },
  getSelection: function() {
    return window.getSelection ? window.getSelection().toString() : document.getSelection ? document.getSelection().toString() : document.selection ? document.selection.createRange().text : null;
  },
  calculateScrollbarWidth: function() {
    if (this.calculatedScrollbarWidth != null) return this.calculatedScrollbarWidth;
    var e = document.createElement("div");
    this.addStyles(e, {
      width: "100px",
      height: "100px",
      overflow: "scroll",
      position: "absolute",
      top: "-9999px"
    }), document.body.appendChild(e);
    var n = e.offsetWidth - e.clientWidth;
    return document.body.removeChild(e), this.calculatedScrollbarWidth = n, n;
  },
  calculateBodyScrollbarWidth: function() {
    return window.innerWidth - document.documentElement.offsetWidth;
  },
  getBrowser: function() {
    if (!this.browser) {
      var e = this.resolveUserAgent();
      this.browser = {}, e.browser && (this.browser[e.browser] = !0, this.browser.version = e.version), this.browser.chrome ? this.browser.webkit = !0 : this.browser.webkit && (this.browser.safari = !0);
    }
    return this.browser;
  },
  resolveUserAgent: function() {
    var e = navigator.userAgent.toLowerCase(), n = /(chrome)[ ]([\w.]+)/.exec(e) || /(webkit)[ ]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ ]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || e.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
    return {
      browser: n[1] || "",
      version: n[2] || "0"
    };
  },
  isVisible: function(e) {
    return e && e.offsetParent != null;
  },
  invokeElementMethod: function(e, n, r) {
    e[n].apply(e, r);
  },
  isExist: function(e) {
    return !!(e !== null && typeof e < "u" && e.nodeName && this.getParentNode(e));
  },
  isClient: function() {
    return !!(typeof window < "u" && window.document && window.document.createElement);
  },
  focus: function(e, n) {
    e && document.activeElement !== e && e.focus(n);
  },
  isFocusableElement: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.isElement(e) ? e.matches('button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])'.concat(n, `,
                [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n)) : !1;
  },
  getFocusableElements: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = this.find(e, 'button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])'.concat(n, `,
                [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n, `,
                [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`).concat(n)), i = [], s = Dr(r), o;
    try {
      for (s.s(); !(o = s.n()).done; ) {
        var l = o.value;
        getComputedStyle(l).display != "none" && getComputedStyle(l).visibility != "hidden" && i.push(l);
      }
    } catch (a) {
      s.e(a);
    } finally {
      s.f();
    }
    return i;
  },
  getFirstFocusableElement: function(e, n) {
    var r = this.getFocusableElements(e, n);
    return r.length > 0 ? r[0] : null;
  },
  getLastFocusableElement: function(e, n) {
    var r = this.getFocusableElements(e, n);
    return r.length > 0 ? r[r.length - 1] : null;
  },
  getNextFocusableElement: function(e, n, r) {
    var i = this.getFocusableElements(e, r), s = i.length > 0 ? i.findIndex(function(l) {
      return l === n;
    }) : -1, o = s > -1 && i.length >= s + 1 ? s + 1 : -1;
    return o > -1 ? i[o] : null;
  },
  getPreviousElementSibling: function(e, n) {
    for (var r = e.previousElementSibling; r; ) {
      if (r.matches(n))
        return r;
      r = r.previousElementSibling;
    }
    return null;
  },
  getNextElementSibling: function(e, n) {
    for (var r = e.nextElementSibling; r; ) {
      if (r.matches(n))
        return r;
      r = r.nextElementSibling;
    }
    return null;
  },
  isClickable: function(e) {
    if (e) {
      var n = e.nodeName, r = e.parentElement && e.parentElement.nodeName;
      return n === "INPUT" || n === "TEXTAREA" || n === "BUTTON" || n === "A" || r === "INPUT" || r === "TEXTAREA" || r === "BUTTON" || r === "A" || !!e.closest(".p-button, .p-checkbox, .p-radiobutton");
    }
    return !1;
  },
  applyStyle: function(e, n) {
    if (typeof n == "string")
      e.style.cssText = n;
    else
      for (var r in n)
        e.style[r] = n[r];
  },
  isIOS: function() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },
  isAndroid: function() {
    return /(android)/i.test(navigator.userAgent);
  },
  isTouchDevice: function() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  },
  hasCSSAnimation: function(e) {
    if (e) {
      var n = getComputedStyle(e), r = parseFloat(n.getPropertyValue("animation-duration") || "0");
      return r > 0;
    }
    return !1;
  },
  hasCSSTransition: function(e) {
    if (e) {
      var n = getComputedStyle(e), r = parseFloat(n.getPropertyValue("transition-duration") || "0");
      return r > 0;
    }
    return !1;
  },
  exportCSV: function(e, n) {
    var r = new Blob([e], {
      type: "application/csv;charset=utf-8;"
    });
    if (window.navigator.msSaveOrOpenBlob)
      navigator.msSaveOrOpenBlob(r, n + ".csv");
    else {
      var i = document.createElement("a");
      i.download !== void 0 ? (i.setAttribute("href", URL.createObjectURL(r)), i.setAttribute("download", n + ".csv"), i.style.display = "none", document.body.appendChild(i), i.click(), document.body.removeChild(i)) : (e = "data:text/csv;charset=utf-8," + e, window.open(encodeURI(e)));
    }
  },
  blockBodyScroll: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "p-overflow-hidden";
    document.body.style.setProperty("--scrollbar-width", this.calculateBodyScrollbarWidth() + "px"), this.addClass(document.body, e);
  },
  unblockBodyScroll: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "p-overflow-hidden";
    document.body.style.removeProperty("--scrollbar-width"), this.removeClass(document.body, e);
  }
};
function bn(t) {
  "@babel/helpers - typeof";
  return bn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, bn(t);
}
function uc(t, e) {
  if (!(t instanceof e))
    throw new TypeError("Cannot call a class as a function");
}
function cc(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, dc(r.key), r);
  }
}
function fc(t, e, n) {
  return e && cc(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function dc(t) {
  var e = pc(t, "string");
  return bn(e) == "symbol" ? e : String(e);
}
function pc(t, e) {
  if (bn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (bn(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var hc = /* @__PURE__ */ function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    uc(this, t), this.element = e, this.listener = n;
  }
  return fc(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = H.getScrollableParents(this.element);
      for (var n = 0; n < this.scrollableParents.length; n++)
        this.scrollableParents[n].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var n = 0; n < this.scrollableParents.length; n++)
          this.scrollableParents[n].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]), t;
}();
function gc() {
  var t = /* @__PURE__ */ new Map();
  return {
    on: function(n, r) {
      var i = t.get(n);
      i ? i.push(r) : i = [r], t.set(n, i);
    },
    off: function(n, r) {
      var i = t.get(n);
      i && i.splice(i.indexOf(r) >>> 0, 1);
    },
    emit: function(n, r) {
      var i = t.get(n);
      i && i.slice().map(function(s) {
        s(r);
      });
    }
  };
}
function vs(t, e) {
  return vc(t) || yc(t, e) || Ai(t, e) || mc();
}
function mc() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yc(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, s, o, l = [], a = !0, c = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(a = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (u) {
      c = !0, i = u;
    } finally {
      try {
        if (!a && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function vc(t) {
  if (Array.isArray(t)) return t;
}
function bs(t) {
  return wc(t) || Sc(t) || Ai(t) || bc();
}
function bc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Sc(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function wc(t) {
  if (Array.isArray(t)) return ni(t);
}
function Rr(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Ai(t)) || e) {
      n && (t = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(c) {
        throw c;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var s = !0, o = !1, l;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var c = n.next();
    return s = c.done, c;
  }, e: function(c) {
    o = !0, l = c;
  }, f: function() {
    try {
      !s && n.return != null && n.return();
    } finally {
      if (o) throw l;
    }
  } };
}
function Ai(t, e) {
  if (t) {
    if (typeof t == "string") return ni(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return ni(t, e);
  }
}
function ni(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function un(t) {
  "@babel/helpers - typeof";
  return un = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, un(t);
}
var M = {
  equals: function(e, n, r) {
    return r ? this.resolveFieldData(e, r) === this.resolveFieldData(n, r) : this.deepEquals(e, n);
  },
  deepEquals: function(e, n) {
    if (e === n) return !0;
    if (e && n && un(e) == "object" && un(n) == "object") {
      var r = Array.isArray(e), i = Array.isArray(n), s, o, l;
      if (r && i) {
        if (o = e.length, o != n.length) return !1;
        for (s = o; s-- !== 0; ) if (!this.deepEquals(e[s], n[s])) return !1;
        return !0;
      }
      if (r != i) return !1;
      var a = e instanceof Date, c = n instanceof Date;
      if (a != c) return !1;
      if (a && c) return e.getTime() == n.getTime();
      var u = e instanceof RegExp, f = n instanceof RegExp;
      if (u != f) return !1;
      if (u && f) return e.toString() == n.toString();
      var p = Object.keys(e);
      if (o = p.length, o !== Object.keys(n).length) return !1;
      for (s = o; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(n, p[s])) return !1;
      for (s = o; s-- !== 0; )
        if (l = p[s], !this.deepEquals(e[l], n[l])) return !1;
      return !0;
    }
    return e !== e && n !== n;
  },
  resolveFieldData: function(e, n) {
    if (!e || !n)
      return null;
    try {
      var r = e[n];
      if (this.isNotEmpty(r)) return r;
    } catch {
    }
    if (Object.keys(e).length) {
      if (this.isFunction(n))
        return n(e);
      if (n.indexOf(".") === -1)
        return e[n];
      for (var i = n.split("."), s = e, o = 0, l = i.length; o < l; ++o) {
        if (s == null)
          return null;
        s = s[i[o]];
      }
      return s;
    }
    return null;
  },
  getItemValue: function(e) {
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
      r[i - 1] = arguments[i];
    return this.isFunction(e) ? e.apply(void 0, r) : e;
  },
  filter: function(e, n, r) {
    var i = [];
    if (e) {
      var s = Rr(e), o;
      try {
        for (s.s(); !(o = s.n()).done; ) {
          var l = o.value, a = Rr(n), c;
          try {
            for (a.s(); !(c = a.n()).done; ) {
              var u = c.value;
              if (String(this.resolveFieldData(l, u)).toLowerCase().indexOf(r.toLowerCase()) > -1) {
                i.push(l);
                break;
              }
            }
          } catch (f) {
            a.e(f);
          } finally {
            a.f();
          }
        }
      } catch (f) {
        s.e(f);
      } finally {
        s.f();
      }
    }
    return i;
  },
  reorderArray: function(e, n, r) {
    e && n !== r && (r >= e.length && (r %= e.length, n %= e.length), e.splice(r, 0, e.splice(n, 1)[0]));
  },
  findIndexInList: function(e, n) {
    var r = -1;
    if (n) {
      for (var i = 0; i < n.length; i++)
        if (n[i] === e) {
          r = i;
          break;
        }
    }
    return r;
  },
  contains: function(e, n) {
    if (e != null && n && n.length) {
      var r = Rr(n), i;
      try {
        for (r.s(); !(i = r.n()).done; ) {
          var s = i.value;
          if (this.equals(e, s)) return !0;
        }
      } catch (o) {
        r.e(o);
      } finally {
        r.f();
      }
    }
    return !1;
  },
  insertIntoOrderedArray: function(e, n, r, i) {
    if (r.length > 0) {
      for (var s = !1, o = 0; o < r.length; o++) {
        var l = this.findIndexInList(r[o], i);
        if (l > n) {
          r.splice(o, 0, e), s = !0;
          break;
        }
      }
      s || r.push(e);
    } else
      r.push(e);
  },
  removeAccents: function(e) {
    return e && e.search(/[\xC0-\xFF]/g) > -1 && (e = e.replace(/[\xC0-\xC5]/g, "A").replace(/[\xC6]/g, "AE").replace(/[\xC7]/g, "C").replace(/[\xC8-\xCB]/g, "E").replace(/[\xCC-\xCF]/g, "I").replace(/[\xD0]/g, "D").replace(/[\xD1]/g, "N").replace(/[\xD2-\xD6\xD8]/g, "O").replace(/[\xD9-\xDC]/g, "U").replace(/[\xDD]/g, "Y").replace(/[\xDE]/g, "P").replace(/[\xE0-\xE5]/g, "a").replace(/[\xE6]/g, "ae").replace(/[\xE7]/g, "c").replace(/[\xE8-\xEB]/g, "e").replace(/[\xEC-\xEF]/g, "i").replace(/[\xF1]/g, "n").replace(/[\xF2-\xF6\xF8]/g, "o").replace(/[\xF9-\xFC]/g, "u").replace(/[\xFE]/g, "p").replace(/[\xFD\xFF]/g, "y")), e;
  },
  getVNodeProp: function(e, n) {
    if (e) {
      var r = e.props;
      if (r) {
        var i = n.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), s = Object.prototype.hasOwnProperty.call(r, i) ? i : n;
        return e.type.extends.props[n].type === Boolean && r[s] === "" ? !0 : r[s];
      }
    }
    return null;
  },
  toFlatCase: function(e) {
    return this.isString(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
  },
  toKebabCase: function(e) {
    return this.isString(e) ? e.replace(/(_)/g, "-").replace(/[A-Z]/g, function(n, r) {
      return r === 0 ? n : "-" + n.toLowerCase();
    }).toLowerCase() : e;
  },
  toCapitalCase: function(e) {
    return this.isString(e, {
      empty: !1
    }) ? e[0].toUpperCase() + e.slice(1) : e;
  },
  isEmpty: function(e) {
    return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && un(e) === "object" && Object.keys(e).length === 0;
  },
  isNotEmpty: function(e) {
    return !this.isEmpty(e);
  },
  isFunction: function(e) {
    return !!(e && e.constructor && e.call && e.apply);
  },
  isObject: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    return e instanceof Object && e.constructor === Object && (n || Object.keys(e).length !== 0);
  },
  isDate: function(e) {
    return e instanceof Date && e.constructor === Date;
  },
  isArray: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    return Array.isArray(e) && (n || e.length !== 0);
  },
  isString: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    return typeof e == "string" && (n || e !== "");
  },
  isPrintableCharacter: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    return this.isNotEmpty(e) && e.length === 1 && e.match(/\S| /);
  },
  /**
   * Firefox-v103 does not currently support the "findLast" method. It is stated that this method will be supported with Firefox-v104.
   * https://caniuse.com/mdn-javascript_builtins_array_findlast
   */
  findLast: function(e, n) {
    var r;
    if (this.isNotEmpty(e))
      try {
        r = e.findLast(n);
      } catch {
        r = bs(e).reverse().find(n);
      }
    return r;
  },
  /**
   * Firefox-v103 does not currently support the "findLastIndex" method. It is stated that this method will be supported with Firefox-v104.
   * https://caniuse.com/mdn-javascript_builtins_array_findlastindex
   */
  findLastIndex: function(e, n) {
    var r = -1;
    if (this.isNotEmpty(e))
      try {
        r = e.findLastIndex(n);
      } catch {
        r = e.lastIndexOf(bs(e).reverse().find(n));
      }
    return r;
  },
  sort: function(e, n) {
    var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1, i = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1, o = this.compare(e, n, i, r), l = r;
    return (this.isEmpty(e) || this.isEmpty(n)) && (l = s === 1 ? r : s), l * o;
  },
  compare: function(e, n, r) {
    var i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1, s = -1, o = this.isEmpty(e), l = this.isEmpty(n);
    return o && l ? s = 0 : o ? s = i : l ? s = -i : typeof e == "string" && typeof n == "string" ? s = r(e, n) : s = e < n ? -1 : e > n ? 1 : 0, s;
  },
  localeComparator: function() {
    return new Intl.Collator(void 0, {
      numeric: !0
    }).compare;
  },
  nestedKeys: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return Object.entries(n).reduce(function(i, s) {
      var o = vs(s, 2), l = o[0], a = o[1], c = r ? "".concat(r, ".").concat(l) : l;
      return e.isObject(a) ? i = i.concat(e.nestedKeys(a, c)) : i.push(c), i;
    }, []);
  },
  stringify: function(e) {
    var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 2, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, s = " ".repeat(i), o = " ".repeat(i + r);
    return this.isArray(e) ? "[" + e.map(function(l) {
      return n.stringify(l, r, i + r);
    }).join(", ") + "]" : this.isDate(e) ? e.toISOString() : this.isFunction(e) ? e.toString() : this.isObject(e) ? `{
` + Object.entries(e).map(function(l) {
      var a = vs(l, 2), c = a[0], u = a[1];
      return "".concat(o).concat(c, ": ").concat(n.stringify(u, r, i + r));
    }).join(`,
`) + `
`.concat(s) + "}" : JSON.stringify(e);
  }
}, Ss = 0;
function ws() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pv_id_";
  return Ss++, "".concat(t).concat(Ss);
}
function Oc(t) {
  return Tc(t) || _c(t) || Ic(t) || Cc();
}
function Cc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ic(t, e) {
  if (t) {
    if (typeof t == "string") return ri(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return ri(t, e);
  }
}
function _c(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Tc(t) {
  if (Array.isArray(t)) return ri(t);
}
function ri(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Pc() {
  var t = [], e = function(l, a) {
    var c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 999, u = i(l, a, c), f = u.value + (u.key === l ? 0 : c) + 1;
    return t.push({
      key: l,
      value: f
    }), f;
  }, n = function(l) {
    t = t.filter(function(a) {
      return a.value !== l;
    });
  }, r = function(l, a) {
    return i(l, a).value;
  }, i = function(l, a) {
    var c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    return Oc(t).reverse().find(function(u) {
      return !0;
    }) || {
      key: l,
      value: c
    };
  }, s = function(l) {
    return l && parseInt(l.style.zIndex, 10) || 0;
  };
  return {
    get: s,
    set: function(l, a, c) {
      a && (a.style.zIndex = String(e(l, !0, c)));
    },
    clear: function(l) {
      l && (n(s(l)), l.style.zIndex = "");
    },
    getCurrent: function(l) {
      return r(l, !0);
    }
  };
}
var kr = Pc(), Ce = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
};
function Os(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = xc(t)) || e) {
      n && (t = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(c) {
        throw c;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var s = !0, o = !1, l;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var c = n.next();
    return s = c.done, c;
  }, e: function(c) {
    o = !0, l = c;
  }, f: function() {
    try {
      !s && n.return != null && n.return();
    } finally {
      if (o) throw l;
    }
  } };
}
function xc(t, e) {
  if (t) {
    if (typeof t == "string") return Cs(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Cs(t, e);
  }
}
function Cs(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var Ac = {
  filter: function(e, n, r, i, s) {
    var o = [];
    if (!e)
      return o;
    var l = Os(e), a;
    try {
      for (l.s(); !(a = l.n()).done; ) {
        var c = a.value;
        if (typeof c == "string") {
          if (this.filters[i](c, r, s)) {
            o.push(c);
            continue;
          }
        } else {
          var u = Os(n), f;
          try {
            for (u.s(); !(f = u.n()).done; ) {
              var p = f.value, g = M.resolveFieldData(c, p);
              if (this.filters[i](g, r, s)) {
                o.push(c);
                break;
              }
            }
          } catch (y) {
            u.e(y);
          } finally {
            u.f();
          }
        }
      }
    } catch (y) {
      l.e(y);
    } finally {
      l.f();
    }
    return o;
  },
  filters: {
    startsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = M.removeAccents(n.toString()).toLocaleLowerCase(r), s = M.removeAccents(e.toString()).toLocaleLowerCase(r);
      return s.slice(0, i.length) === i;
    },
    contains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = M.removeAccents(n.toString()).toLocaleLowerCase(r), s = M.removeAccents(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(i) !== -1;
    },
    notContains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = M.removeAccents(n.toString()).toLocaleLowerCase(r), s = M.removeAccents(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(i) === -1;
    },
    endsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = M.removeAccents(n.toString()).toLocaleLowerCase(r), s = M.removeAccents(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(i, s.length - i.length) !== -1;
    },
    equals: function(e, n, r) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : M.removeAccents(e.toString()).toLocaleLowerCase(r) == M.removeAccents(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(e, n, r) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : M.removeAccents(e.toString()).toLocaleLowerCase(r) != M.removeAccents(n.toString()).toLocaleLowerCase(r);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (M.equals(e, n[r]))
          return !0;
      return !1;
    },
    between: function(e, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : e == null ? !1 : e.getTime ? n[0].getTime() <= e.getTime() && e.getTime() <= n[1].getTime() : n[0] <= e && e <= n[1];
    },
    lt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() < n.getTime() : e < n;
    },
    lte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() <= n.getTime() : e <= n;
    },
    gt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() > n.getTime() : e > n;
    },
    gte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() >= n.getTime() : e >= n;
    },
    dateIs: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.toDateString() === n.toDateString();
    },
    dateIsNot: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.toDateString() !== n.toDateString();
    },
    dateBefore: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime() < n.getTime();
    },
    dateAfter: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime() > n.getTime();
    }
  },
  register: function(e, n) {
    this.filters[e] = n;
  }
};
function Sn(t) {
  "@babel/helpers - typeof";
  return Sn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Sn(t);
}
function Is(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Hr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Is(Object(n), !0).forEach(function(r) {
      Ec(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Is(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ec(t, e, n) {
  return e = $c(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function $c(t) {
  var e = Lc(t, "string");
  return Sn(e) == "symbol" ? e : String(e);
}
function Lc(t, e) {
  if (Sn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Sn(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _s = {
  ripple: !1,
  inputStyle: null,
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    showMonthAfterYear: !1,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    // @deprecated Use 'emptySearchMessage' option instead.
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "Page {page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List"
    }
  },
  filterMatchModeOptions: {
    text: [Ce.STARTS_WITH, Ce.CONTAINS, Ce.NOT_CONTAINS, Ce.ENDS_WITH, Ce.EQUALS, Ce.NOT_EQUALS],
    numeric: [Ce.EQUALS, Ce.NOT_EQUALS, Ce.LESS_THAN, Ce.LESS_THAN_OR_EQUAL_TO, Ce.GREATER_THAN, Ce.GREATER_THAN_OR_EQUAL_TO],
    date: [Ce.DATE_IS, Ce.DATE_IS_NOT, Ce.DATE_BEFORE, Ce.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  pt: void 0,
  ptOptions: {
    mergeSections: !0,
    mergeProps: !1
  },
  unstyled: !1,
  csp: {
    nonce: void 0
  }
}, Fc = Symbol();
function Mc(t, e, n, r) {
  if (t !== e) {
    var i = document.getElementById(n), s = i.cloneNode(!0), o = i.getAttribute("href").replace(t, e);
    s.setAttribute("id", n + "-clone"), s.setAttribute("href", o), s.addEventListener("load", function() {
      i.remove(), s.setAttribute("id", n), r && r();
    }), i.parentNode && i.parentNode.insertBefore(s, i.nextSibling);
  }
}
var Vc = {
  install: function(e, n) {
    var r = n ? Hr(Hr({}, _s), n) : Hr({}, _s), i = {
      config: /* @__PURE__ */ fr(r),
      changeTheme: Mc
    };
    e.config.globalProperties.$primevue = i, e.provide(Fc, i);
  }
};
function wn(t) {
  "@babel/helpers - typeof";
  return wn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, wn(t);
}
function Ts(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ps(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ts(Object(n), !0).forEach(function(r) {
      Dc(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ts(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Dc(t, e, n) {
  return e = jc(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function jc(t) {
  var e = Rc(t, "string");
  return wn(e) == "symbol" ? e : String(e);
}
function Rc(t, e) {
  if (wn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (wn(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function kc(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Pi() ? mr(t) : e ? t() : vi(t);
}
var Hc = 0;
function rl(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = /* @__PURE__ */ Dt(!1), r = /* @__PURE__ */ Dt(t), i = /* @__PURE__ */ Dt(null), s = H.isClient() ? window.document : void 0, o = e.document, l = o === void 0 ? s : o, a = e.immediate, c = a === void 0 ? !0 : a, u = e.manual, f = u === void 0 ? !1 : u, p = e.name, g = p === void 0 ? "style_".concat(++Hc) : p, y = e.id, v = y === void 0 ? void 0 : y, b = e.media, T = b === void 0 ? void 0 : b, P = e.nonce, L = P === void 0 ? void 0 : P, _ = e.props, G = _ === void 0 ? {} : _, Z = function() {
  }, j = function(A) {
    var D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var S = Ps(Ps({}, G), D), z = S.name || g, Y = S.id || v, ge = S.nonce || L;
      i.value = l.querySelector('style[data-primevue-style-id="'.concat(z, '"]')) || l.getElementById(Y) || l.createElement("style"), i.value.isConnected || (r.value = A || t, H.setAttributes(i.value, {
        type: "text/css",
        id: Y,
        media: T,
        nonce: ge
      }), l.head.appendChild(i.value), H.setAttribute(i.value, "data-primevue-style-id", g), H.setAttributes(i.value, S)), !n.value && (Z = zn(r, function(ie) {
        i.value.textContent = ie;
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, U = function() {
    !l || !n.value || (Z(), H.isExist(i.value) && l.head.removeChild(i.value), n.value = !1);
  };
  return c && !f && kc(j), {
    id: v,
    name: g,
    css: r,
    unload: U,
    load: j,
    isLoaded: /* @__PURE__ */ Gn(n)
  };
}
function On(t) {
  "@babel/helpers - typeof";
  return On = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, On(t);
}
function Bc(t, e) {
  return Wc(t) || Kc(t, e) || zc(t, e) || Nc();
}
function Nc() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zc(t, e) {
  if (t) {
    if (typeof t == "string") return xs(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return xs(t, e);
  }
}
function xs(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Kc(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, s, o, l = [], a = !0, c = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(a = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (u) {
      c = !0, i = u;
    } finally {
      try {
        if (!a && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function Wc(t) {
  if (Array.isArray(t)) return t;
}
function As(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Br(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? As(Object(n), !0).forEach(function(r) {
      Uc(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : As(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Uc(t, e, n) {
  return e = Gc(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Gc(t) {
  var e = qc(t, "string");
  return On(e) == "symbol" ? e : String(e);
}
function qc(t, e) {
  if (On(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (On(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Zc = `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.p-hidden-accessible input,
.p-hidden-accessible select {
    transform: scale(0);
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: var(--scrollbar-width);
}
`, Jc = {}, Yc = {}, Ke = {
  name: "base",
  css: Zc,
  classes: Jc,
  inlineStyles: Yc,
  loadStyle: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.css ? rl(this.css, Br({
      name: this.name
    }, e)) : {};
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = Object.entries(n).reduce(function(i, s) {
        var o = Bc(s, 2), l = o[0], a = o[1];
        return i.push("".concat(l, '="').concat(a, '"')) && i;
      }, []).join(" ");
      return '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(r, ">").concat(this.css).concat(e, "</style>");
    }
    return "";
  },
  extend: function(e) {
    return Br(Br({}, this), {}, {
      css: void 0
    }, e);
  }
};
function Cn(t) {
  "@babel/helpers - typeof";
  return Cn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Cn(t);
}
function Es(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Qc(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Es(Object(n), !0).forEach(function(r) {
      Xc(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Es(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Xc(t, e, n) {
  return e = ef(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ef(t) {
  var e = tf(t, "string");
  return Cn(e) == "symbol" ? e : String(e);
}
function tf(t, e) {
  if (Cn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Cn(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Nr = Ke.extend({
  name: "common",
  loadGlobalStyle: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return rl(e, Qc({
      name: "global"
    }, n));
  }
});
function In(t) {
  "@babel/helpers - typeof";
  return In = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, In(t);
}
function nf(t) {
  return ol(t) || rf(t) || sl(t) || il();
}
function rf(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Bn(t, e) {
  return ol(t) || sf(t, e) || sl(t, e) || il();
}
function il() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function sl(t, e) {
  if (t) {
    if (typeof t == "string") return $s(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return $s(t, e);
  }
}
function $s(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function sf(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, s, o, l = [], a = !0, c = !1;
    try {
      if (s = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (u) {
      c = !0, i = u;
    } finally {
      try {
        if (!a && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function ol(t) {
  if (Array.isArray(t)) return t;
}
function Ls(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function fe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ls(Object(n), !0).forEach(function(r) {
      Wn(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ls(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Wn(t, e, n) {
  return e = of(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function of(t) {
  var e = lf(t, "string");
  return In(e) == "symbol" ? e : String(e);
}
function lf(t, e) {
  if (In(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (In(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Bt = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      default: void 0
    },
    ptOptions: {
      type: Object,
      default: void 0
    },
    unstyled: {
      type: Boolean,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: !0,
      handler: function(e) {
        if (!e) {
          var n, r;
          Nr.loadStyle({
            nonce: (n = this.$primevueConfig) === null || n === void 0 || (n = n.csp) === null || n === void 0 ? void 0 : n.nonce
          }), this.$options.style && this.$style.loadStyle({
            nonce: (r = this.$primevueConfig) === null || r === void 0 || (r = r.csp) === null || r === void 0 ? void 0 : r.nonce
          });
        }
      }
    }
  },
  beforeCreate: function() {
    var e, n, r, i, s, o, l, a, c, u, f, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, g = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, y = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (i = y || g) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (s = i.onBeforeCreate) === null || s === void 0 || s.call(i);
    var v = (o = this.$primevueConfig) === null || o === void 0 || (o = o.pt) === null || o === void 0 ? void 0 : o._usept, b = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, T = v ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (u = T || b) === null || u === void 0 || (u = u[this.$.type.name]) === null || u === void 0 || (u = u.hooks) === null || u === void 0 || (f = u.onBeforeCreate) === null || f === void 0 || f.call(u);
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    Ke.loadStyle({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    }), this._loadGlobalStyles(), this._hook("onBeforeMount");
  },
  mounted: function() {
    this._hook("onMounted");
  },
  beforeUpdate: function() {
    this._hook("onBeforeUpdate");
  },
  updated: function() {
    this._hook("onUpdated");
  },
  beforeUnmount: function() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function() {
    this._hook("onUnmounted");
  },
  methods: {
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n == null || n(), r == null || r();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return M.isFunction(e) ? e.apply(void 0, r) : R.apply(void 0, r);
    },
    _loadGlobalStyles: function() {
      var e, n = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      M.isNotEmpty(n) && Nr.loadGlobalStyle(n, {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      });
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = M.toFlatCase(n).split("."), s = i.shift();
      return s ? M.isObject(e) ? this._getOptionValue(M.getItemValue(e[Object.keys(e).find(function(o) {
        return M.toFlatCase(o) === s;
      }) || ""], r), i.join("."), r) : void 0 : M.getItemValue(e, r);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, o = /./g.test(r) && !!i[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, a = l.mergeSections, c = a === void 0 ? !0 : a, u = l.mergeProps, f = u === void 0 ? !1 : u, p = s ? o ? this._useGlobalPT(this._getPTClassValue, r, i) : this._useDefaultPT(this._getPTClassValue, r, i) : void 0, g = o ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, fe(fe({}, i), {}, {
        global: p || {}
      })), y = this._getPTDatasets(r);
      return c || !c && g ? f ? this._mergeProps(f, p, g, y) : fe(fe(fe({}, p), g), y) : fe(fe({}, g), y);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return R(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", s = r === "root" && M.isNotEmpty((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return r !== "transition" && fe(fe({}, r === "root" && fe(Wn({}, "".concat(i, "name"), M.toFlatCase(s ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), s && Wn({}, "".concat(i, "extend"), M.toFlatCase(this.$.type.name)))), {}, Wn({}, "".concat(i, "section"), M.toFlatCase(r)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return M.isString(e) || M.isArray(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, s = function(l) {
        var a, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, u = i ? i(l) : l, f = M.toFlatCase(r), p = M.toFlatCase(n.$name);
        return (a = c ? f !== p ? u == null ? void 0 : u[f] : void 0 : u == null ? void 0 : u[f]) !== null && a !== void 0 ? a : u;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: s(e.originalValue),
        value: s(e.value)
      } : s(e, !0);
    },
    _usePT: function(e, n, r, i) {
      var s = function(v) {
        return n(v, r, i);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var o, l = e._usept || ((o = this.$primevueConfig) === null || o === void 0 ? void 0 : o.ptOptions) || {}, a = l.mergeSections, c = a === void 0 ? !0 : a, u = l.mergeProps, f = u === void 0 ? !1 : u, p = s(e.originalValue), g = s(e.value);
        return p === void 0 && g === void 0 ? void 0 : M.isString(g) ? g : M.isString(p) ? p : c || !c && g ? f ? this._mergeProps(f, p, g) : fe(fe({}, p), g) : g;
      }
      return s(e);
    },
    _useGlobalPT: function(e, n, r) {
      return this._usePT(this.globalPT, e, n, r);
    },
    _useDefaultPT: function(e, n, r) {
      return this._usePT(this.defaultPT, e, n, r);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, fe(fe({}, this.$params), n));
    },
    ptmi: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return R(this.$_attrsNoPT, this.ptm(e, n));
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, fe({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, fe(fe({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, e, fe(fe({}, this.$params), r)), s = this._getOptionValue(Nr.inlineStyles, e, fe(fe({}, this.$params), r));
        return [s, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return M.getItemValue(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, fe({}, n.$params)) || M.getItemValue(r, fe({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e == null ? void 0 : e.$props,
          state: e == null ? void 0 : e.$data,
          attrs: e == null ? void 0 : e.$attrs
        },
        /* @deprecated since v3.43.0. Use the `parent.instance` instead of the `parentInstance`.*/
        parentInstance: e
      };
    },
    $style: function() {
      return fe(fe({
        classes: void 0,
        inlineStyles: void 0,
        loadStyle: function() {
        },
        loadCustomStyle: function() {
        }
      }, (this._getHostInstance(this) || {}).$style), this.$options.style);
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Bn(e, 1), r = n[0];
        return r == null ? void 0 : r.startsWith("pt:");
      }).reduce(function(e, n) {
        var r = Bn(n, 2), i = r[0], s = r[1], o = i.split(":"), l = nf(o), a = l.slice(1);
        return a == null || a.reduce(function(c, u, f, p) {
          return !c[u] && (c[u] = f === p.length - 1 ? s : {}), c[u];
        }, e), e;
      }, {});
    },
    $_attrsNoPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Bn(e, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(e, n) {
        var r = Bn(n, 2), i = r[0], s = r[1];
        return e[i] = s, e;
      }, {});
    }
  }
}, af = `
.p-icon {
    display: inline-block;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`, uf = Ke.extend({
  name: "baseicon",
  css: af
});
function _n(t) {
  "@babel/helpers - typeof";
  return _n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, _n(t);
}
function Fs(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ms(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Fs(Object(n), !0).forEach(function(r) {
      cf(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Fs(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function cf(t, e, n) {
  return e = ff(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ff(t) {
  var e = df(t, "string");
  return _n(e) == "symbol" ? e : String(e);
}
function df(t, e) {
  if (_n(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (_n(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Nt = {
  name: "BaseIcon",
  extends: Bt,
  props: {
    label: {
      type: String,
      default: void 0
    },
    spin: {
      type: Boolean,
      default: !1
    }
  },
  style: uf,
  methods: {
    pti: function() {
      var e = M.isEmpty(this.label);
      return Ms(Ms({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
}, ll = {
  name: "BlankIcon",
  extends: Nt
}, pf = /* @__PURE__ */ re("rect", {
  width: "1",
  height: "1",
  fill: "currentColor",
  "fill-opacity": "0"
}, null, -1), hf = [pf];
function gf(t, e, n, r, i, s) {
  return K(), J("svg", R({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), hf, 16);
}
ll.render = gf;
var al = {
  name: "CheckIcon",
  extends: Nt
}, mf = /* @__PURE__ */ re("path", {
  d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
  fill: "currentColor"
}, null, -1), yf = [mf];
function vf(t, e, n, r, i, s) {
  return K(), J("svg", R({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), yf, 16);
}
al.render = vf;
var ul = {
  name: "ChevronDownIcon",
  extends: Nt
}, bf = /* @__PURE__ */ re("path", {
  d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
  fill: "currentColor"
}, null, -1), Sf = [bf];
function wf(t, e, n, r, i, s) {
  return K(), J("svg", R({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Sf, 16);
}
ul.render = wf;
var cl = {
  name: "SearchIcon",
  extends: Nt
}, Of = /* @__PURE__ */ re("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
  fill: "currentColor"
}, null, -1), Cf = [Of];
function If(t, e, n, r, i, s) {
  return K(), J("svg", R({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Cf, 16);
}
cl.render = If;
var Sr = {
  name: "SpinnerIcon",
  extends: Nt
}, _f = /* @__PURE__ */ re("path", {
  d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
  fill: "currentColor"
}, null, -1), Tf = [_f];
function Pf(t, e, n, r, i, s) {
  return K(), J("svg", R({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Tf, 16);
}
Sr.render = Pf;
var fl = {
  name: "TimesIcon",
  extends: Nt
}, xf = /* @__PURE__ */ re("path", {
  d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
  fill: "currentColor"
}, null, -1), Af = [xf];
function Ef(t, e, n, r, i, s) {
  return K(), J("svg", R({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Af, 16);
}
fl.render = Ef;
var $f = gc(), dl = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = H.isClient();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Lf(t, e, n, r, i, s) {
  return s.inline ? pe(t.$slots, "default", {
    key: 0
  }) : i.mounted ? (K(), Re(Sa, {
    key: 1,
    to: n.appendTo
  }, [pe(t.$slots, "default")], 8, ["to"])) : Fe("", !0);
}
dl.render = Lf;
function Tn(t) {
  "@babel/helpers - typeof";
  return Tn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Tn(t);
}
function Vs(t, e) {
  return Df(t) || Vf(t, e) || Mf(t, e) || Ff();
}
function Ff() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mf(t, e) {
  if (t) {
    if (typeof t == "string") return Ds(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Ds(t, e);
  }
}
function Ds(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Vf(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, s, o, l = [], a = !0, c = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(a = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (u) {
      c = !0, i = u;
    } finally {
      try {
        if (!a && n.return != null && (o = n.return(), Object(o) !== o)) return;
      } finally {
        if (c) throw i;
      }
    }
    return l;
  }
}
function Df(t) {
  if (Array.isArray(t)) return t;
}
function js(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function he(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? js(Object(n), !0).forEach(function(r) {
      ii(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : js(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ii(t, e, n) {
  return e = jf(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function jf(t) {
  var e = Rf(t, "string");
  return Tn(e) == "symbol" ? e : String(e);
}
function Rf(t, e) {
  if (Tn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Tn(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var X = {
  _getMeta: function() {
    return [M.isObject(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], M.getItemValue(M.isObject(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var r, i, s;
    return (r = (e == null || (i = e.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (s = n.ctx) === null || s === void 0 || (s = s.appContext) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.globalProperties) === null || s === void 0 ? void 0 : s.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = M.toFlatCase(n).split("."), s = i.shift();
    return s ? M.isObject(e) ? X._getOptionValue(M.getItemValue(e[Object.keys(e).find(function(o) {
      return M.toFlatCase(o) === s;
    }) || ""], r), i.join("."), r) : void 0 : M.getItemValue(e, r);
  },
  _getPTValue: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var P = X._getOptionValue.apply(X, arguments);
      return M.isString(P) || M.isArray(P) ? {
        class: P
      } : P;
    }, c = ((e = r.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, u = c.mergeSections, f = u === void 0 ? !0 : u, p = c.mergeProps, g = p === void 0 ? !1 : p, y = l ? X._useDefaultPT(r, r.defaultPT(), a, s, o) : void 0, v = X._usePT(r, X._getPT(i, r.$name), a, s, he(he({}, o), {}, {
      global: y || {}
    })), b = X._getPTDatasets(r, s);
    return f || !f && v ? g ? X._mergeProps(r, g, y, v, b) : he(he(he({}, y), v), b) : he(he({}, v), b);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return he(he({}, n === "root" && ii({}, "".concat(r, "name"), M.toFlatCase(e.$name))), {}, ii({}, "".concat(r, "section"), M.toFlatCase(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(o) {
      var l, a = r ? r(o) : o, c = M.toFlatCase(n);
      return (l = a == null ? void 0 : a[c]) !== null && l !== void 0 ? l : a;
    };
    return e != null && e.hasOwnProperty("_usept") ? {
      _usept: e._usept,
      originalValue: i(e.originalValue),
      value: i(e.value)
    } : i(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0, o = function(b) {
      return r(b, i, s);
    };
    if (n != null && n.hasOwnProperty("_usept")) {
      var l, a = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, c = a.mergeSections, u = c === void 0 ? !0 : c, f = a.mergeProps, p = f === void 0 ? !1 : f, g = o(n.originalValue), y = o(n.value);
      return g === void 0 && y === void 0 ? void 0 : M.isString(y) ? y : M.isString(g) ? g : u || !u && y ? p ? X._mergeProps(e, p, g, y) : he(he({}, g), y) : y;
    }
    return o(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    return X._usePT(e, n, r, i, s);
  },
  _hook: function(e, n, r, i, s, o) {
    var l, a, c = "on".concat(M.toCapitalCase(n)), u = X._getConfig(i, s), f = r == null ? void 0 : r.$instance, p = X._usePT(f, X._getPT(i == null || (l = i.value) === null || l === void 0 ? void 0 : l.pt, e), X._getOptionValue, "hooks.".concat(c)), g = X._useDefaultPT(f, u == null || (a = u.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], X._getOptionValue, "hooks.".concat(c)), y = {
      el: r,
      binding: i,
      vnode: s,
      prevVnode: o
    };
    p == null || p(f, y), g == null || g(f, y);
  },
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      r[i - 2] = arguments[i];
    return M.isFunction(e) ? e.apply(void 0, r) : R.apply(void 0, r);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, o, l, a, c) {
      var u, f;
      o._$instances = o._$instances || {};
      var p = X._getConfig(l, a), g = o._$instances[e] || {}, y = M.isEmpty(g) ? he(he({}, n), n == null ? void 0 : n.methods) : {};
      o._$instances[e] = he(he({}, g), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: o,
        $binding: l,
        $modifiers: l == null ? void 0 : l.modifiers,
        $value: l == null ? void 0 : l.value,
        $el: g.$el || o || void 0,
        $style: he({
          classes: void 0,
          inlineStyles: void 0,
          loadStyle: function() {
          }
        }, n == null ? void 0 : n.style),
        $primevueConfig: p,
        /* computed instance variables */
        defaultPT: function() {
          return X._getPT(p == null ? void 0 : p.pt, void 0, function(b) {
            var T;
            return b == null || (T = b.directives) === null || T === void 0 ? void 0 : T[e];
          });
        },
        isUnstyled: function() {
          var b, T;
          return ((b = o.$instance) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled) !== void 0 ? (T = o.$instance) === null || T === void 0 || (T = T.$binding) === null || T === void 0 || (T = T.value) === null || T === void 0 ? void 0 : T.unstyled : p == null ? void 0 : p.unstyled;
        },
        /* instance's methods */
        ptm: function() {
          var b, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return X._getPTValue(o.$instance, (b = o.$instance) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.pt, T, he({}, P));
        },
        ptmo: function() {
          var b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", P = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return X._getPTValue(o.$instance, b, T, P, !1);
        },
        cx: function() {
          var b, T, P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (b = o.$instance) !== null && b !== void 0 && b.isUnstyled() ? void 0 : X._getOptionValue((T = o.$instance) === null || T === void 0 || (T = T.$style) === null || T === void 0 ? void 0 : T.classes, P, he({}, L));
        },
        sx: function() {
          var b, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, L = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P ? X._getOptionValue((b = o.$instance) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.inlineStyles, T, he({}, L)) : void 0;
        }
      }, y), o.$instance = o._$instances[e], (u = (f = o.$instance)[s]) === null || u === void 0 || u.call(f, o, l, a, c), o["$".concat(e)] = o.$instance, X._hook(e, s, o, l, a, c);
    };
    return {
      created: function(s, o, l, a) {
        r("created", s, o, l, a);
      },
      beforeMount: function(s, o, l, a) {
        var c, u, f, p, g = X._getConfig(o, l);
        Ke.loadStyle({
          nonce: g == null || (c = g.csp) === null || c === void 0 ? void 0 : c.nonce
        }), !((u = s.$instance) !== null && u !== void 0 && u.isUnstyled()) && ((f = s.$instance) === null || f === void 0 || (f = f.$style) === null || f === void 0 || f.loadStyle({
          nonce: g == null || (p = g.csp) === null || p === void 0 ? void 0 : p.nonce
        })), r("beforeMount", s, o, l, a);
      },
      mounted: function(s, o, l, a) {
        var c, u, f, p, g = X._getConfig(o, l);
        Ke.loadStyle({
          nonce: g == null || (c = g.csp) === null || c === void 0 ? void 0 : c.nonce
        }), !((u = s.$instance) !== null && u !== void 0 && u.isUnstyled()) && ((f = s.$instance) === null || f === void 0 || (f = f.$style) === null || f === void 0 || f.loadStyle({
          nonce: g == null || (p = g.csp) === null || p === void 0 ? void 0 : p.nonce
        })), r("mounted", s, o, l, a);
      },
      beforeUpdate: function(s, o, l, a) {
        r("beforeUpdate", s, o, l, a);
      },
      updated: function(s, o, l, a) {
        r("updated", s, o, l, a);
      },
      beforeUnmount: function(s, o, l, a) {
        r("beforeUnmount", s, o, l, a);
      },
      unmounted: function(s, o, l, a) {
        r("unmounted", s, o, l, a);
      }
    };
  },
  extend: function() {
    var e = X._getMeta.apply(X, arguments), n = Vs(e, 2), r = n[0], i = n[1];
    return he({
      extend: function() {
        var o = X._getMeta.apply(X, arguments), l = Vs(o, 2), a = l[0], c = l[1];
        return X.extend(a, he(he(he({}, i), i == null ? void 0 : i.methods), c));
      }
    }, X._extend(r, i));
  }
}, kf = {
  root: "p-ink"
}, Hf = Ke.extend({
  name: "ripple",
  classes: kf
}), Bf = X.extend({
  style: Hf
});
function Nf(t) {
  return Uf(t) || Wf(t) || Kf(t) || zf();
}
function zf() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kf(t, e) {
  if (t) {
    if (typeof t == "string") return si(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return si(t, e);
  }
}
function Wf(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Uf(t) {
  if (Array.isArray(t)) return si(t);
}
function si(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var pl = Bf.extend("ripple", {
  mounted: function(e) {
    var n, r = e == null || (n = e.$instance) === null || n === void 0 ? void 0 : n.$primevueConfig;
    r && r.ripple && (this.create(e), this.bindEvents(e), e.setAttribute("data-pd-ripple", !0));
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    create: function(e) {
      var n = H.createElement("span", {
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this),
        "p-bind": this.ptm("root")
      });
      e.appendChild(n), this.$el = n;
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, r = e.currentTarget, i = this.getInk(r);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && H.removeClass(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !H.getHeight(i) && !H.getWidth(i)) {
          var s = Math.max(H.getOuterWidth(r), H.getOuterHeight(r));
          i.style.height = s + "px", i.style.width = s + "px";
        }
        var o = H.getOffset(r), l = e.pageX - o.left + document.body.scrollTop - H.getWidth(i) / 2, a = e.pageY - o.top + document.body.scrollLeft - H.getHeight(i) / 2;
        i.style.top = a + "px", i.style.left = l + "px", !this.isUnstyled() && H.addClass(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && H.removeClass(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && H.removeClass(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? Nf(e.children).find(function(n) {
        return H.getAttribute(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Gf = `
@layer primevue {
    .p-virtualscroller {
        position: relative;
        overflow: auto;
        contain: strict;
        transform: translateZ(0);
        will-change: scroll-position;
        outline: 0 none;
    }

    .p-virtualscroller-content {
        position: absolute;
        top: 0;
        left: 0;
        /* contain: content; */
        min-height: 100%;
        min-width: 100%;
        will-change: transform;
    }

    .p-virtualscroller-spacer {
        position: absolute;
        top: 0;
        left: 0;
        height: 1px;
        width: 1px;
        transform-origin: 0 0;
        pointer-events: none;
    }

    .p-virtualscroller .p-virtualscroller-loader {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-virtualscroller-loader.p-component-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .p-virtualscroller-loading-icon {
        font-size: 2rem;
    }

    .p-virtualscroller-loading-icon.p-icon {
        width: 2rem;
        height: 2rem;
    }

    .p-virtualscroller-horizontal > .p-virtualscroller-content {
        display: flex;
    }

    /* Inline */
    .p-virtualscroller-inline .p-virtualscroller-content {
        position: static;
    }
}
`, Rs = Ke.extend({
  name: "virtualscroller",
  css: Gf
}), qf = {
  name: "BaseVirtualScroller",
  extends: Bt,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: Rs,
  provide: function() {
    return {
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Rs.loadStyle({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function Pn(t) {
  "@babel/helpers - typeof";
  return Pn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Pn(t);
}
function ks(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Zt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ks(Object(n), !0).forEach(function(r) {
      hl(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ks(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function hl(t, e, n) {
  return e = Zf(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Zf(t) {
  var e = Jf(t, "string");
  return Pn(e) == "symbol" ? e : String(e);
}
function Jf(t, e) {
  if (Pn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Pn(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var gl = {
  name: "VirtualScroller",
  extends: qf,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: function(e, n) {
      (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      H.isVisible(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.bindResizeListener(), this.defaultWidth = H.getWidth(this.element), this.defaultHeight = H.getHeight(this.element), this.defaultContentWidth = H.getWidth(this.content), this.defaultContentHeight = H.getHeight(this.content), this.initialized = !0);
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), s = this.isHorizontal(), o = i ? e.every(function(j) {
        return j > -1;
      }) : e > -1;
      if (o) {
        var l = this.first, a = this.element, c = a.scrollTop, u = c === void 0 ? 0 : c, f = a.scrollLeft, p = f === void 0 ? 0 : f, g = this.calculateNumItems(), y = g.numToleratedItems, v = this.getContentPosition(), b = this.itemSize, T = function() {
          var U = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, V = arguments.length > 1 ? arguments[1] : void 0;
          return U <= V ? 0 : U;
        }, P = function(U, V, A) {
          return U * V + A;
        }, L = function() {
          var U = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: U,
            top: V,
            behavior: r
          });
        }, _ = i ? {
          rows: 0,
          cols: 0
        } : 0, G = !1, Z = !1;
        i ? (_ = {
          rows: T(e[0], y[0]),
          cols: T(e[1], y[1])
        }, L(P(_.cols, b[1], v.left), P(_.rows, b[0], v.top)), Z = this.lastScrollPos.top !== u || this.lastScrollPos.left !== p, G = _.rows !== l.rows || _.cols !== l.cols) : (_ = T(e, y), s ? L(P(_, b, v.left), u) : L(p, P(_, b, v.top)), Z = this.lastScrollPos !== (s ? p : u), G = _ !== l), this.isRangeChanged = G, Z && (this.first = _);
      }
    },
    scrollInView: function(e, n) {
      var r = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var s = this.isBoth(), o = this.isHorizontal(), l = s ? e.every(function(b) {
          return b > -1;
        }) : e > -1;
        if (l) {
          var a = this.getRenderedRange(), c = a.first, u = a.viewport, f = function() {
            var T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return r.scrollTo({
              left: T,
              top: P,
              behavior: i
            });
          }, p = n === "to-start", g = n === "to-end";
          if (p) {
            if (s)
              u.first.rows - c.rows > e[0] ? f(u.first.cols * this.itemSize[1], (u.first.rows - 1) * this.itemSize[0]) : u.first.cols - c.cols > e[1] && f((u.first.cols - 1) * this.itemSize[1], u.first.rows * this.itemSize[0]);
            else if (u.first - c > e) {
              var y = (u.first - 1) * this.itemSize;
              o ? f(y, 0) : f(0, y);
            }
          } else if (g) {
            if (s)
              u.last.rows - c.rows <= e[0] + 1 ? f(u.first.cols * this.itemSize[1], (u.first.rows + 1) * this.itemSize[0]) : u.last.cols - c.cols <= e[1] + 1 && f((u.first.cols + 1) * this.itemSize[1], u.first.rows * this.itemSize[0]);
            else if (u.last - c <= e + 1) {
              var v = (u.first + 1) * this.itemSize;
              o ? f(v, 0) : f(0, v);
            }
          }
        }
      } else
        this.scrollToIndex(e, i);
    },
    getRenderedRange: function() {
      var e = function(f, p) {
        return Math.floor(f / (p || f));
      }, n = this.first, r = 0;
      if (this.element) {
        var i = this.isBoth(), s = this.isHorizontal(), o = this.element, l = o.scrollTop, a = o.scrollLeft;
        if (i)
          n = {
            rows: e(l, this.itemSize[0]),
            cols: e(a, this.itemSize[1])
          }, r = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var c = s ? a : l;
          n = e(c, this.itemSize), r = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: r
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), r = this.itemSize, i = this.getContentPosition(), s = this.element ? this.element.offsetWidth - i.left : 0, o = this.element ? this.element.offsetHeight - i.top : 0, l = function(p, g) {
        return Math.ceil(p / (g || p));
      }, a = function(p) {
        return Math.ceil(p / 2);
      }, c = e ? {
        rows: l(o, r[0]),
        cols: l(s, r[1])
      } : l(n ? s : o, r), u = this.d_numToleratedItems || (e ? [a(c.rows), a(c.cols)] : a(c));
      return {
        numItemsInViewport: c,
        numToleratedItems: u
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), r = this.first, i = this.calculateNumItems(), s = i.numItemsInViewport, o = i.numToleratedItems, l = function(u, f, p) {
        var g = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(u + f + (u < p ? 2 : 3) * p, g);
      }, a = n ? {
        rows: l(r.rows, s.rows, o[0]),
        cols: l(r.cols, s.cols, o[1], !0)
      } : l(r, s, o);
      this.last = a, this.numItemsInViewport = s, this.d_numToleratedItems = o, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: s.rows
      }).map(function() {
        return Array.from({
          length: s.cols
        });
      }) : Array.from({
        length: s
      })), this.lazy && Promise.resolve().then(function() {
        var c;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: r.cols
          } : 0 : r,
          last: Math.min(e.step ? e.step : a, ((c = e.items) === null || c === void 0 ? void 0 : c.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), r = e.isHorizontal(), i = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var s = [H.getWidth(e.element), H.getHeight(e.element)], o = s[0], l = s[1];
          (n || r) && (e.element.style.width = o < e.defaultWidth ? o + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || i) && (e.element.style.height = l < e.defaultHeight ? l + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, r) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), r = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), i = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), s = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: r,
          top: i,
          bottom: s,
          x: n + r,
          y: i + s
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var e = this;
      if (this.element) {
        var n = this.isBoth(), r = this.isHorizontal(), i = this.element.parentElement, s = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), o = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), l = function(c, u) {
          return e.element.style[c] = u;
        };
        n || r ? (l("height", o), l("width", s)) : l("height", o);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var r = this.isBoth(), i = this.isHorizontal(), s = this.getContentPosition(), o = function(a, c, u) {
          var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Zt(Zt({}, e.spacerStyle), hl({}, "".concat(a), (c || []).length * u + f + "px"));
        };
        r ? (o("height", n, this.itemSize[0], s.y), o("width", this.columns || n[1], this.itemSize[1], s.x)) : i ? o("width", this.columns || n, this.itemSize, s.x) : o("height", n, this.itemSize, s.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var r = this.isBoth(), i = this.isHorizontal(), s = e ? e.first : this.first, o = function(u, f) {
          return u * f;
        }, l = function() {
          var u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Zt(Zt({}, n.contentStyle), {
            transform: "translate3d(".concat(u, "px, ").concat(f, "px, 0)")
          });
        };
        if (r)
          l(o(s.cols, this.itemSize[1]), o(s.rows, this.itemSize[0]));
        else {
          var a = o(s, this.itemSize);
          i ? l(a, 0) : l(0, a);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, r = e.target, i = this.isBoth(), s = this.isHorizontal(), o = this.getContentPosition(), l = function(D, S) {
        return D ? D > S ? D - S : D : 0;
      }, a = function(D, S) {
        return Math.floor(D / (S || D));
      }, c = function(D, S, z, Y, ge, ie) {
        return D <= ge ? ge : ie ? z - Y - ge : S + ge - 1;
      }, u = function(D, S, z, Y, ge, ie, se) {
        return D <= ie ? 0 : Math.max(0, se ? D < S ? z : D - ie : D > S ? z : D - 2 * ie);
      }, f = function(D, S, z, Y, ge, ie) {
        var se = S + Y + 2 * ge;
        return D >= ge && (se += ge + 1), n.getLast(se, ie);
      }, p = l(r.scrollTop, o.top), g = l(r.scrollLeft, o.left), y = i ? {
        rows: 0,
        cols: 0
      } : 0, v = this.last, b = !1, T = this.lastScrollPos;
      if (i) {
        var P = this.lastScrollPos.top <= p, L = this.lastScrollPos.left <= g;
        if (!this.appendOnly || this.appendOnly && (P || L)) {
          var _ = {
            rows: a(p, this.itemSize[0]),
            cols: a(g, this.itemSize[1])
          }, G = {
            rows: c(_.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], P),
            cols: c(_.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], L)
          };
          y = {
            rows: u(_.rows, G.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], P),
            cols: u(_.cols, G.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], L)
          }, v = {
            rows: f(_.rows, y.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: f(_.cols, y.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, b = y.rows !== this.first.rows || v.rows !== this.last.rows || y.cols !== this.first.cols || v.cols !== this.last.cols || this.isRangeChanged, T = {
            top: p,
            left: g
          };
        }
      } else {
        var Z = s ? g : p, j = this.lastScrollPos <= Z;
        if (!this.appendOnly || this.appendOnly && j) {
          var U = a(Z, this.itemSize), V = c(U, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, j);
          y = u(U, V, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, j), v = f(U, y, this.last, this.numItemsInViewport, this.d_numToleratedItems), b = y !== this.first || v !== this.last || this.isRangeChanged, T = Z;
        }
      }
      return {
        first: y,
        last: v,
        isRangeChanged: b,
        scrollPos: T
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), r = n.first, i = n.last, s = n.isRangeChanged, o = n.scrollPos;
      if (s) {
        var l = {
          first: r,
          last: i
        };
        if (this.setContentPosition(l), this.first = r, this.last = i, this.lastScrollPos = o, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(r)) {
          var a, c, u = {
            first: this.step ? Math.min(this.getPageByFirst(r) * this.step, (((a = this.items) === null || a === void 0 ? void 0 : a.length) || 0) - this.step) : r,
            last: Math.min(this.step ? (this.getPageByFirst(r) + 1) * this.step : i, ((c = this.items) === null || c === void 0 ? void 0 : c.length) || 0)
          }, f = this.lazyLoadState.first !== u.first || this.lazyLoadState.last !== u.last;
          f && this.$emit("lazy-load", u), this.lazyLoadState = u;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var r = this.onScrollPositionChange(e), i = r.isRangeChanged, s = i || (this.step ? this.isPageChanged() : !1);
            s && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (H.isVisible(e.element)) {
          var n = e.isBoth(), r = e.isVertical(), i = e.isHorizontal(), s = [H.getWidth(e.element), H.getHeight(e.element)], o = s[0], l = s[1], a = o !== e.defaultWidth, c = l !== e.defaultHeight, u = n ? a || c : i ? a : r ? c : !1;
          u && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = o, e.defaultHeight = l, e.defaultContentWidth = H.getWidth(e.content), e.defaultContentHeight = H.getHeight(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, r = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: r,
        count: n,
        first: r === 0,
        last: r === n - 1,
        even: r % 2 === 0,
        odd: r % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var r = this.loaderArr.length;
      return Zt({
        index: e,
        count: r,
        first: e === 0,
        last: e === r - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || H.findSingle(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-component-overlay": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Sr
  }
}, Yf = ["tabindex"];
function Qf(t, e, n, r, i, s) {
  var o = vt("SpinnerIcon");
  return t.disabled ? (K(), J(ve, {
    key: 1
  }, [pe(t.$slots, "default"), pe(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: s.loadedColumns
  })], 64)) : (K(), J("div", R({
    key: 0,
    ref: s.elementRef,
    class: s.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return s.onScroll && s.onScroll.apply(s, arguments);
    })
  }, t.ptmi("root")), [pe(t.$slots, "content", {
    styleClass: s.contentClass,
    items: s.loadedItems,
    getItemOptions: s.getOptions,
    loading: i.d_loading,
    getLoaderOptions: s.getLoaderOptions,
    itemSize: t.itemSize,
    rows: s.loadedRows,
    columns: s.loadedColumns,
    contentRef: s.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: s.isVertical(),
    horizontal: s.isHorizontal(),
    both: s.isBoth()
  }, function() {
    return [re("div", R({
      ref: s.contentRef,
      class: s.contentClass,
      style: i.contentStyle
    }, t.ptm("content")), [(K(!0), J(ve, null, Xn(s.loadedItems, function(l, a) {
      return pe(t.$slots, "item", {
        key: a,
        item: l,
        options: s.getOptions(a)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (K(), J("div", R({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, t.ptm("spacer")), null, 16)) : Fe("", !0), !t.loaderDisabled && t.showLoader && i.d_loading ? (K(), J("div", R({
    key: 1,
    class: s.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (K(!0), J(ve, {
    key: 0
  }, Xn(i.loaderArr, function(l, a) {
    return pe(t.$slots, "loader", {
      key: a,
      options: s.getLoaderOptions(a, s.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : Fe("", !0), pe(t.$slots, "loadingicon", {}, function() {
    return [me(o, R({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : Fe("", !0)], 16, Yf));
}
gl.render = Qf;
var Xf = {
  root: function(e) {
    var n = e.instance, r = e.props, i = e.state;
    return ["p-dropdown p-component p-inputwrapper", {
      "p-disabled": r.disabled,
      "p-invalid": r.invalid,
      "p-variant-filled": r.variant ? r.variant === "filled" : n.$primevue.config.inputStyle === "filled",
      "p-dropdown-clearable": r.showClear,
      "p-focus": i.focused,
      "p-inputwrapper-filled": n.hasSelectedOption,
      "p-inputwrapper-focus": i.focused || i.overlayVisible,
      "p-overlay-open": i.overlayVisible
    }];
  },
  input: function(e) {
    var n, r = e.instance, i = e.props;
    return ["p-dropdown-label p-inputtext", {
      "p-placeholder": !i.editable && r.label === i.placeholder,
      "p-dropdown-label-empty": !i.editable && !r.$slots.value && (r.label === "p-emptylabel" || ((n = r.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-dropdown-clear-icon",
  trigger: "p-dropdown-trigger",
  loadingicon: "p-dropdown-trigger-icon",
  dropdownIcon: "p-dropdown-trigger-icon",
  panel: function(e) {
    e.props;
    var n = e.instance;
    return ["p-dropdown-panel p-component", {
      "p-ripple-disabled": n.$primevue.config.ripple === !1
    }];
  },
  header: "p-dropdown-header",
  filterContainer: "p-dropdown-filter-container",
  filterInput: function(e) {
    var n = e.props, r = e.instance;
    return ["p-dropdown-filter p-inputtext p-component", {
      "p-variant-filled": n.variant ? n.variant === "filled" : r.$primevue.config.inputStyle === "filled"
    }];
  },
  filterIcon: "p-dropdown-filter-icon",
  wrapper: "p-dropdown-items-wrapper",
  list: "p-dropdown-items",
  itemGroup: "p-dropdown-item-group",
  itemGroupLabel: "p-dropdown-item-group-label",
  item: function(e) {
    var n = e.instance, r = e.props, i = e.state, s = e.option, o = e.focusedOption;
    return ["p-dropdown-item", {
      "p-highlight": n.isSelected(s) && r.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === o,
      "p-disabled": n.isOptionDisabled(s)
    }];
  },
  itemLabel: "p-dropdown-item-label",
  checkIcon: "p-dropdown-check-icon",
  blankIcon: "p-dropdown-blank-icon",
  emptyMessage: "p-dropdown-empty-message"
}, ed = Ke.extend({
  name: "dropdown",
  classes: Xf
}), td = {
  name: "BaseDropdown",
  extends: Bt,
  props: {
    modelValue: null,
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "200px"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
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
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
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
    inputProps: {
      type: null,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    panelProps: {
      type: null,
      default: null
    },
    filterInputProps: {
      type: null,
      default: null
    },
    clearIconProps: {
      type: null,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: ed,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
};
function xn(t) {
  "@babel/helpers - typeof";
  return xn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, xn(t);
}
function nd(t) {
  return od(t) || sd(t) || id(t) || rd();
}
function rd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function id(t, e) {
  if (t) {
    if (typeof t == "string") return oi(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set") return Array.from(t);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return oi(t, e);
  }
}
function sd(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function od(t) {
  if (Array.isArray(t)) return oi(t);
}
function oi(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Hs(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Bs(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Hs(Object(n), !0).forEach(function(r) {
      ml(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Hs(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ml(t, e, n) {
  return e = ld(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ld(t) {
  var e = ad(t, "string");
  return xn(e) == "symbol" ? e : String(e);
}
function ad(t, e) {
  if (xn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (xn(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var yl = {
  name: "Dropdown",
  extends: td,
  inheritAttrs: !1,
  emits: ["update:modelValue", "change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      id: this.$attrs.id,
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1
    };
  },
  watch: {
    "$attrs.id": function(e) {
      this.id = e || ws();
    },
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.id = this.id || ws(), this.autoUpdateModel(), this.bindLabelClickListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (kr.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? M.resolveFieldData(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? M.resolveFieldData(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? M.resolveFieldData(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, r, i) {
      return this.ptm(i, {
        context: {
          option: e,
          index: r,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(r, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? M.resolveFieldData(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return M.resolveFieldData(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return M.resolveFieldData(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(r) {
        return n.isOptionGroup(r);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && H.focus(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, r = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && H.focus(n.$refs.focusInput);
      };
      setTimeout(function() {
        r();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      this.focused = !1, this.focusedOptionIndex = -1, this.searchValue = "", this.$emit("blur", e);
    },
    onKeyDown: function(e) {
      if (this.disabled || H.isAndroid()) {
        e.preventDefault();
        return;
      }
      var n = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !n && M.isPrintableCharacter(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var r = this.searchOptions(e, n);
      !r && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && M.isNotEmpty(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? H.getFirstFocusableElement(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      H.focus(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? H.getLastFocusableElement(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      H.focus(n);
    },
    onOptionSelect: function(e, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, i = this.getOptionValue(n);
      this.updateModel(e, i), r && this.hide(!0);
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, !0);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, !0);
          break;
        case "Home":
          this.onHomeKey(e, !0);
          break;
        case "End":
          this.onEndKey(e, !0);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e, !0);
          break;
      }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      $f.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var r = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, r), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        e.shiftKey ? r.setSelectionRange(0, e.target.selectionStart) : (r.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        if (e.shiftKey)
          r.setSelectionRange(e.target.selectionStart, r.value.length);
        else {
          var i = r.value.length;
          r.setSelectionRange(i, i), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide()) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (H.focus(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      kr.set("overlay", e, this.$primevue.config.zIndex.overlay), H.addStyles(e, {
        position: "absolute",
        top: "0",
        left: "0"
      }), this.alignOverlay(), this.scrollInView(), this.autoFilterFocus && H.focus(this.$refs.filterInput);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      kr.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? H.relativePosition(this.overlay, this.$el) : (this.overlay.style.minWidth = H.getOuterWidth(this.$el) + "px", H.absolutePosition(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        e.overlayVisible && e.overlay && !e.$el.contains(n.target) && !e.overlay.contains(n.target) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new hc(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !H.isTouchDevice() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.inputId, '"]'));
        n && H.isVisible(n) && (this.labelClickListener = function() {
          H.focus(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.inputId, '"]'));
        e && H.isVisible(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    hasFocusableElements: function() {
      return H.getFocusableElements(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionMatched: function(e) {
      var n;
      return this.isValidOption(e) && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return M.isNotEmpty(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return this.isValidOption(e) && M.equals(this.modelValue, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return M.findLastIndex(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, r = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, r = e > 0 ? M.findLastIndex(this.visibleOptions.slice(0, e), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.hasSelectedOption ? this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      }) : -1;
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var r = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, s = !1;
      return M.isNotEmpty(this.searchValue) && (this.focusedOptionIndex !== -1 ? (i = this.visibleOptions.slice(this.focusedOptionIndex).findIndex(function(o) {
        return r.isOptionMatched(o);
      }), i = i === -1 ? this.visibleOptions.slice(0, this.focusedOptionIndex).findIndex(function(o) {
        return r.isOptionMatched(o);
      }) : i + this.focusedOptionIndex) : i = this.visibleOptions.findIndex(function(o) {
        return r.isOptionMatched(o);
      }), i !== -1 && (s = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(e, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        r.searchValue = "", r.searchTimeout = null;
      }, 500), s;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var r = n !== -1 ? "".concat(e.id, "_").concat(n) : e.focusedOptionId, i = H.findSingle(e.list, 'li[id="'.concat(r, '"]'));
        i ? i.scrollIntoView && i.scrollIntoView({
          block: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.selectOnFocus && this.autoOptionFocus && !this.hasSelectedOption && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex(), this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1));
    },
    updateModel: function(e, n) {
      this.$emit("update:modelValue", n), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(r, i, s) {
        r.push({
          optionGroup: i,
          group: !0,
          index: s
        });
        var o = n.getOptionGroupChildren(i);
        return o && o.forEach(function(l) {
          return r.push(l);
        }), r;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var r = Ac.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], s = [];
          return i.forEach(function(o) {
            var l = e.getOptionGroupChildren(o), a = l.filter(function(c) {
              return r.includes(c);
            });
            a.length > 0 && s.push(Bs(Bs({}, o), {}, ml({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", nd(a))));
          }), this.flatOptions(s);
        }
        return r;
      }
      return n;
    },
    hasSelectedOption: function() {
      return M.isNotEmpty(this.modelValue);
    },
    label: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.modelValue || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return M.isNotEmpty(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.hasSelectedOption ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    listAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.listLabel : void 0;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    }
  },
  directives: {
    ripple: pl
  },
  components: {
    VirtualScroller: gl,
    Portal: dl,
    TimesIcon: fl,
    ChevronDownIcon: ul,
    SpinnerIcon: Sr,
    SearchIcon: cl,
    CheckIcon: al,
    BlankIcon: ll
  }
};
function An(t) {
  "@babel/helpers - typeof";
  return An = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, An(t);
}
function Ns(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Je(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ns(Object(n), !0).forEach(function(r) {
      ud(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ns(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ud(t, e, n) {
  return e = cd(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function cd(t) {
  var e = fd(t, "string");
  return An(e) == "symbol" ? e : String(e);
}
function fd(t, e) {
  if (An(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (An(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var dd = ["id"], pd = ["id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid"], hd = ["id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-disabled"], gd = ["value", "placeholder", "aria-owns", "aria-activedescendant"], md = ["id", "aria-label"], yd = ["id"], vd = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onClick", "onMousemove", "data-p-highlight", "data-p-focused", "data-p-disabled"];
function bd(t, e, n, r, i, s) {
  var o = vt("SpinnerIcon"), l = vt("CheckIcon"), a = vt("BlankIcon"), c = vt("VirtualScroller"), u = vt("Portal"), f = Fo("ripple");
  return K(), J("div", R({
    ref: "container",
    id: i.id,
    class: t.cx("root"),
    onClick: e[16] || (e[16] = function() {
      return s.onContainerClick && s.onContainerClick.apply(s, arguments);
    })
  }, t.ptmi("root")), [t.editable ? (K(), J("input", R({
    key: 0,
    ref: "focusInput",
    id: t.inputId,
    type: "text",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    value: s.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.id + "_list",
    "aria-activedescendant": i.focused ? s.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return s.onFocus && s.onFocus.apply(s, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return s.onBlur && s.onBlur.apply(s, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return s.onKeyDown && s.onKeyDown.apply(s, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return s.onEditableInput && s.onEditableInput.apply(s, arguments);
    })
  }, Je(Je({}, t.inputProps), t.ptm("input"))), null, 16, pd)) : (K(), J("span", R({
    key: 1,
    ref: "focusInput",
    id: t.inputId,
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (s.label === "p-emptylabel" ? void 0 : s.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.id + "_list",
    "aria-activedescendant": i.focused ? s.focusedOptionId : void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return s.onFocus && s.onFocus.apply(s, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return s.onBlur && s.onBlur.apply(s, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return s.onKeyDown && s.onKeyDown.apply(s, arguments);
    })
  }, Je(Je({}, t.inputProps), t.ptm("input"))), [pe(t.$slots, "value", {
    value: t.modelValue,
    placeholder: t.placeholder
  }, function() {
    return [ln(Le(s.label === "p-emptylabel" ? " " : s.label || "empty"), 1)];
  })], 16, hd)), t.showClear && t.modelValue != null ? pe(t.$slots, "clearicon", {
    key: 2,
    class: at(t.cx("clearIcon")),
    onClick: s.onClearClick,
    clearCallback: s.onClearClick
  }, function() {
    return [(K(), Re(Ar(t.clearIcon ? "i" : "TimesIcon"), R({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: s.onClearClick
    }, Je(Je({}, t.clearIconProps), t.ptm("clearIcon")), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : Fe("", !0), re("div", R({
    class: t.cx("trigger")
  }, t.ptm("trigger")), [t.loading ? pe(t.$slots, "loadingicon", {
    key: 0,
    class: at(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (K(), J("span", R({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (K(), Re(o, R({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : pe(t.$slots, "dropdownicon", {
    key: 1,
    class: at(t.cx("dropdownIcon"))
  }, function() {
    return [(K(), Re(Ar(t.dropdownIcon ? "span" : "ChevronDownIcon"), R({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true"
    }, t.ptm("dropdownIcon")), null, 16, ["class"]))];
  })], 16), me(u, {
    appendTo: t.appendTo
  }, {
    default: Yt(function() {
      return [me(Pu, R({
        name: "p-connected-overlay",
        onEnter: s.onOverlayEnter,
        onAfterEnter: s.onOverlayAfterEnter,
        onLeave: s.onOverlayLeave,
        onAfterLeave: s.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: Yt(function() {
          return [i.overlayVisible ? (K(), J("div", R({
            key: 0,
            ref: s.overlayRef,
            class: [t.cx("panel"), t.panelClass],
            style: t.panelStyle,
            onClick: e[14] || (e[14] = function() {
              return s.onOverlayClick && s.onOverlayClick.apply(s, arguments);
            }),
            onKeydown: e[15] || (e[15] = function() {
              return s.onOverlayKeyDown && s.onOverlayKeyDown.apply(s, arguments);
            })
          }, Je(Je({}, t.panelProps), t.ptm("panel"))), [re("span", R({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return s.onFirstHiddenFocus && s.onFirstHiddenFocus.apply(s, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), pe(t.$slots, "header", {
            value: t.modelValue,
            options: s.visibleOptions
          }), t.filter ? (K(), J("div", R({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [re("div", R({
            class: t.cx("filterContainer")
          }, t.ptm("filterContainer")), [re("input", R({
            ref: "filterInput",
            type: "text",
            value: i.filterValue,
            onVnodeMounted: e[8] || (e[8] = function() {
              return s.onFilterUpdated && s.onFilterUpdated.apply(s, arguments);
            }),
            onVnodeUpdated: e[9] || (e[9] = function() {
              return s.onFilterUpdated && s.onFilterUpdated.apply(s, arguments);
            }),
            class: t.cx("filterInput"),
            placeholder: t.filterPlaceholder,
            role: "searchbox",
            autocomplete: "off",
            "aria-owns": i.id + "_list",
            "aria-activedescendant": s.focusedOptionId,
            onKeydown: e[10] || (e[10] = function() {
              return s.onFilterKeyDown && s.onFilterKeyDown.apply(s, arguments);
            }),
            onBlur: e[11] || (e[11] = function() {
              return s.onFilterBlur && s.onFilterBlur.apply(s, arguments);
            }),
            onInput: e[12] || (e[12] = function() {
              return s.onFilterChange && s.onFilterChange.apply(s, arguments);
            })
          }, Je(Je({}, t.filterInputProps), t.ptm("filterInput"))), null, 16, gd), pe(t.$slots, "filtericon", {
            class: at(t.cx("filterIcon"))
          }, function() {
            return [(K(), Re(Ar(t.filterIcon ? "span" : "SearchIcon"), R({
              class: [t.cx("filterIcon"), t.filterIcon]
            }, t.ptm("filterIcon")), null, 16, ["class"]))];
          })], 16), re("span", R({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), Le(s.filterResultMessageText), 17)], 16)) : Fe("", !0), re("div", R({
            class: t.cx("wrapper"),
            style: {
              "max-height": s.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("wrapper")), [me(c, R({
            ref: s.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: s.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: s.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Va({
            content: Yt(function(p) {
              var g = p.styleClass, y = p.contentRef, v = p.items, b = p.getItemOptions, T = p.contentStyle, P = p.itemSize;
              return [re("ul", R({
                ref: function(_) {
                  return s.listRef(_, y);
                },
                id: i.id + "_list",
                class: [t.cx("list"), g],
                style: T,
                role: "listbox",
                "aria-label": s.listAriaLabel
              }, t.ptm("list")), [(K(!0), J(ve, null, Xn(v, function(L, _) {
                return K(), J(ve, {
                  key: s.getOptionRenderKey(L, s.getOptionIndex(_, b))
                }, [s.isOptionGroup(L) ? (K(), J("li", R({
                  key: 0,
                  id: i.id + "_" + s.getOptionIndex(_, b),
                  style: {
                    height: P ? P + "px" : void 0
                  },
                  class: t.cx("itemGroup"),
                  role: "option"
                }, t.ptm("itemGroup")), [pe(t.$slots, "optiongroup", {
                  option: L.optionGroup,
                  index: s.getOptionIndex(_, b)
                }, function() {
                  return [re("span", R({
                    class: t.cx("itemGroupLabel")
                  }, t.ptm("itemGroupLabel")), Le(s.getOptionGroupLabel(L.optionGroup)), 17)];
                })], 16, yd)) : So((K(), J("li", R({
                  key: 1,
                  id: i.id + "_" + s.getOptionIndex(_, b),
                  class: t.cx("item", {
                    option: L,
                    focusedOption: s.getOptionIndex(_, b)
                  }),
                  style: {
                    height: P ? P + "px" : void 0
                  },
                  role: "option",
                  "aria-label": s.getOptionLabel(L),
                  "aria-selected": s.isSelected(L),
                  "aria-disabled": s.isOptionDisabled(L),
                  "aria-setsize": s.ariaSetSize,
                  "aria-posinset": s.getAriaPosInset(s.getOptionIndex(_, b)),
                  onClick: function(Z) {
                    return s.onOptionSelect(Z, L);
                  },
                  onMousemove: function(Z) {
                    return s.onOptionMouseMove(Z, s.getOptionIndex(_, b));
                  },
                  "data-p-highlight": s.isSelected(L),
                  "data-p-focused": i.focusedOptionIndex === s.getOptionIndex(_, b),
                  "data-p-disabled": s.isOptionDisabled(L)
                }, s.getPTItemOptions(L, b, _, "item")), [t.checkmark ? (K(), J(ve, {
                  key: 0
                }, [s.isSelected(L) ? (K(), Re(l, R({
                  key: 0,
                  class: t.cx("checkIcon")
                }, t.ptm("checkIcon")), null, 16, ["class"])) : (K(), Re(a, R({
                  key: 1,
                  class: t.cx("blankIcon")
                }, t.ptm("blankIcon")), null, 16, ["class"]))], 64)) : Fe("", !0), pe(t.$slots, "option", {
                  option: L,
                  index: s.getOptionIndex(_, b)
                }, function() {
                  return [re("span", R({
                    class: t.cx("itemLabel")
                  }, t.ptm("itemLabel")), Le(s.getOptionLabel(L)), 17)];
                })], 16, vd)), [[f]])], 64);
              }), 128)), i.filterValue && (!v || v && v.length === 0) ? (K(), J("li", R({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [pe(t.$slots, "emptyfilter", {}, function() {
                return [ln(Le(s.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (K(), J("li", R({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [pe(t.$slots, "empty", {}, function() {
                return [ln(Le(s.emptyMessageText), 1)];
              })], 16)) : Fe("", !0)], 16, md)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: Yt(function(p) {
              var g = p.options;
              return [pe(t.$slots, "loader", {
                options: g
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), pe(t.$slots, "footer", {
            value: t.modelValue,
            options: s.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (K(), J("span", R({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), Le(s.emptyMessageText), 17)) : Fe("", !0), re("span", R({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), Le(s.selectedMessageText), 17), re("span", R({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[13] || (e[13] = function() {
              return s.onLastHiddenFocus && s.onLastHiddenFocus.apply(s, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16)) : Fe("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, dd);
}
yl.render = bd;
var Sd = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-inputtextarea p-inputtext p-component", {
      "p-filled": n.filled,
      "p-inputtextarea-resizable ": r.autoResize,
      "p-invalid": r.invalid,
      "p-variant-filled": r.variant ? r.variant === "filled" : n.$primevue.config.inputStyle === "filled"
    }];
  }
}, wd = Ke.extend({
  name: "textarea",
  classes: Sd
}), Od = {
  name: "BaseTextarea",
  extends: Bt,
  props: {
    modelValue: null,
    autoResize: Boolean,
    invalid: {
      type: Boolean,
      default: !1
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: wd,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, vl = {
  name: "Textarea",
  extends: Od,
  inheritAttrs: !1,
  emits: ["update:modelValue"],
  mounted: function() {
    this.$el.offsetParent && this.autoResize && this.resize();
  },
  updated: function() {
    this.$el.offsetParent && this.autoResize && this.resize();
  },
  methods: {
    resize: function() {
      this.$el.style.height = "auto", this.$el.style.height = this.$el.scrollHeight + "px", parseFloat(this.$el.style.height) >= parseFloat(this.$el.style.maxHeight) ? (this.$el.style.overflowY = "scroll", this.$el.style.height = this.$el.style.maxHeight) : this.$el.style.overflow = "hidden";
    },
    onInput: function(e) {
      this.autoResize && this.resize(), this.$emit("update:modelValue", e.target.value);
    }
  },
  computed: {
    filled: function() {
      return this.modelValue != null && this.modelValue.toString().length > 0;
    },
    ptmParams: function() {
      return {
        context: {
          disabled: this.$attrs.disabled || this.$attrs.disabled === ""
        }
      };
    }
  }
}, Cd = ["value", "aria-invalid"];
function Id(t, e, n, r, i, s) {
  return K(), J("textarea", R({
    class: t.cx("root"),
    value: t.modelValue,
    "aria-invalid": t.invalid || void 0,
    onInput: e[0] || (e[0] = function() {
      return s.onInput && s.onInput.apply(s, arguments);
    })
  }, t.ptmi("root", s.ptmParams)), null, 16, Cd);
}
vl.render = Id;
var _d = {
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-badge p-component", {
      "p-badge-no-gutter": M.isNotEmpty(n.value) && String(n.value).length === 1,
      "p-badge-dot": M.isEmpty(n.value) && !r.$slots.default,
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warning": n.severity === "warning",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, Td = Ke.extend({
  name: "badge",
  classes: _d
}), Pd = {
  name: "BaseBadge",
  extends: Bt,
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    severity: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },
  style: Td,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, bl = {
  name: "Badge",
  extends: Pd,
  inheritAttrs: !1
};
function xd(t, e, n, r, i, s) {
  return K(), J("span", R({
    class: t.cx("root")
  }, t.ptmi("root")), [pe(t.$slots, "default", {}, function() {
    return [ln(Le(t.value), 1)];
  })], 16);
}
bl.render = xd;
function En(t) {
  "@babel/helpers - typeof";
  return En = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, En(t);
}
function gt(t, e, n) {
  return e = Ad(e), e in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ad(t) {
  var e = Ed(t, "string");
  return En(e) == "symbol" ? e : String(e);
}
function Ed(t, e) {
  if (En(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (En(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var $d = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-button p-component", gt(gt(gt(gt(gt(gt(gt(gt({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-disabled": n.$attrs.disabled || n.$attrs.disabled === "" || r.loading,
      "p-button-loading": r.loading,
      "p-button-loading-label-only": r.loading && !n.hasIcon && r.label,
      "p-button-link": r.link
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text), "p-button-outlined", r.outlined), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain)];
  },
  loadingIcon: "p-button-loading-icon pi-spin",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", {
      "p-button-icon-left": n.iconPos === "left" && n.label,
      "p-button-icon-right": n.iconPos === "right" && n.label,
      "p-button-icon-top": n.iconPos === "top" && n.label,
      "p-button-icon-bottom": n.iconPos === "bottom" && n.label
    }];
  },
  label: "p-button-label"
}, Ld = Ke.extend({
  name: "button",
  classes: $d
}), Fd = {
  name: "BaseButton",
  extends: Bt,
  props: {
    label: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: "left"
    },
    iconClass: {
      type: String,
      default: null
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: String,
      default: null
    },
    badgeSeverity: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    link: {
      type: Boolean,
      default: !1
    },
    severity: {
      type: String,
      default: null
    },
    raised: {
      type: Boolean,
      default: !1
    },
    rounded: {
      type: Boolean,
      default: !1
    },
    text: {
      type: Boolean,
      default: !1
    },
    outlined: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null
    },
    plain: {
      type: Boolean,
      default: !1
    }
  },
  style: Ld,
  provide: function() {
    return {
      $parentInstance: this
    };
  }
}, Sl = {
  name: "Button",
  extends: Fd,
  inheritAttrs: !1,
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
    },
    hasIcon: function() {
      return this.icon || this.$slots.icon;
    }
  },
  components: {
    SpinnerIcon: Sr,
    Badge: bl
  },
  directives: {
    ripple: pl
  }
}, Md = ["aria-label", "disabled", "data-p-severity"];
function Vd(t, e, n, r, i, s) {
  var o = vt("SpinnerIcon"), l = vt("Badge"), a = Fo("ripple");
  return So((K(), J("button", R({
    class: t.cx("root"),
    type: "button",
    "aria-label": s.defaultAriaLabel,
    disabled: s.disabled
  }, s.getPTOptions("root"), {
    "data-p-severity": t.severity
  }), [pe(t.$slots, "default", {}, function() {
    return [t.loading ? pe(t.$slots, "loadingicon", {
      key: 0,
      class: at([t.cx("loadingIcon"), t.cx("icon")])
    }, function() {
      return [t.loadingIcon ? (K(), J("span", R({
        key: 0,
        class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
      }, t.ptm("loadingIcon")), null, 16)) : (K(), Re(o, R({
        key: 1,
        class: [t.cx("loadingIcon"), t.cx("icon")],
        spin: ""
      }, t.ptm("loadingIcon")), null, 16, ["class"]))];
    }) : pe(t.$slots, "icon", {
      key: 1,
      class: at([t.cx("icon")])
    }, function() {
      return [t.icon ? (K(), J("span", R({
        key: 0,
        class: [t.cx("icon"), t.icon, t.iconClass]
      }, t.ptm("icon")), null, 16)) : Fe("", !0)];
    }), re("span", R({
      class: t.cx("label")
    }, t.ptm("label")), Le(t.label || " "), 17), t.badge ? (K(), Re(l, R({
      key: 2,
      value: t.badge,
      class: t.badgeClass,
      severity: t.badgeSeverity,
      unstyled: t.unstyled
    }, t.ptm("badge")), null, 16, ["value", "class", "severity", "unstyled"])) : Fe("", !0)];
  })], 16, Md)), [[a]]);
}
Sl.render = Vd;
const zs = "/fl_cosyvoice3/script_editor", Dd = "/fl_cosyvoice3/script_library", jd = "/fl_cosyvoice3/script_library/speaker_presets", Rd = Dd;
function kd(t, e) {
  if (!t) return e;
  const n = t.includes("\\") && !t.includes("/") ? "\\" : "/";
  return t.replace(/[\\/]+$/, "") + n + e;
}
async function Hd(t, e, n) {
  try {
    const i = await (await fetch(`${Rd}/mark_role_stale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ root: t, role_code: e, suffix: n })
    })).json();
    if (i.error)
      return { changed: [], untracked: [], error: i.error, message: `"${e}" recast, but couldn't mark affected scripts: ${i.error}` };
    const s = i.changed || [], o = i.untracked || [], l = [];
    s.length && l.push(`${s.length} script(s) marked for re-voice`), o.length && l.push(`${o.length} script(s) using "${e}" haven't been opened in the line editor yet`);
    const a = l.length ? `"${e}" recast -- ${l.join("; ")}` : `"${e}" recast -- no script uses this role`;
    return { changed: s, untracked: o, error: null, message: a };
  } catch (r) {
    return { changed: [], untracked: [], error: String(r), message: `"${e}" recast, but couldn't mark affected scripts: ${r.message || r}` };
  }
}
const Bd = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [r, i] of e)
    n[r] = i;
  return n;
}, Nd = { class: "roles-panel" }, zd = { class: "roles-header" }, Kd = { class: "roles-status" }, Wd = { class: "roles-list" }, Ud = {
  key: 0,
  class: "roles-empty"
}, Gd = { class: "role-row" }, qd = {
  class: "role-code",
  title: "Role code (read-only here -- renaming would orphan script lines that already use it)"
}, Zd = { class: "role-name" }, Jd = 600, Yd = 3e3, Qd = 1500, Xd = {
  __name: "RolesEditorApp",
  props: {
    root: { type: String, required: !0 },
    suffix: { type: String, default: "_speakers.txt" },
    onClose: { type: Function, required: !0 }
  },
  setup(t) {
    const e = t, n = kd(e.root, "_roles.json"), r = /* @__PURE__ */ Dt([]), i = /* @__PURE__ */ Dt([]), s = /* @__PURE__ */ Dt("");
    let o = null, l = 0, a = null, c = null;
    const u = /* @__PURE__ */ new Map();
    function f(A) {
      s.value = A;
    }
    const p = /* @__PURE__ */ new Map();
    function g(A, D) {
      if (!D) {
        p.delete(A);
        return;
      }
      p.set(A, D.$el ?? D);
    }
    function y(A) {
      A && (A.style.height = "auto", A.style.height = `${A.scrollHeight}px`);
    }
    function v() {
      p.forEach(y);
    }
    function b() {
      return JSON.stringify({ roles: r.value }, null, 2);
    }
    async function T() {
      const A = b();
      if (A !== o)
        try {
          const S = await (await fetch(`${zs}/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: n, content: A })
          })).json();
          if (S.error) {
            f(`Save error: ${S.error}`);
            return;
          }
          o = A, f(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
        } catch (D) {
          f(`Save failed: ${D}`);
        }
    }
    function P() {
      l = Date.now(), a && clearTimeout(a), a = setTimeout(T, Jd);
    }
    function L(A) {
      !A.code || u.get(A.code) === A.speaker || (u.set(A.code, A.speaker), Hd(e.root, A.code, e.suffix).then((S) => f(S.message)));
    }
    function _(A) {
      P(), L(A);
    }
    async function G() {
      try {
        const D = await (await fetch(jd)).json();
        i.value = D.presets || [];
      } catch {
        i.value = [];
      }
    }
    async function Z({ isPoll: A = !1 } = {}) {
      try {
        const S = await (await fetch(`${zs}/read?path=${encodeURIComponent(n)}`)).json();
        if (S.error) {
          f(`Read error: ${S.error}`);
          return;
        }
        if (!S.exists) {
          A || (r.value = [], o = "", f("_roles.json does not exist yet"));
          return;
        }
        if (A && Date.now() - l < Qd || S.content === o) return;
        let z;
        try {
          z = JSON.parse(S.content);
        } catch (Y) {
          f(`_roles.json is not valid JSON: ${Y}`);
          return;
        }
        r.value = Array.isArray(z.roles) ? z.roles : [], r.value.forEach((Y) => {
          Y.code && u.set(Y.code, Y.speaker);
        }), o = S.content, A || f(`Loaded ${r.value.length} role(s)`), vi(() => {
          v(), requestAnimationFrame(v);
        });
      } catch (D) {
        f(`Read failed: ${D}`);
      }
    }
    function j() {
      a && (clearTimeout(a), T()), r.value.forEach((A) => L(A)), c && clearInterval(c), document.removeEventListener("keydown", U), e.onClose();
    }
    function U(A) {
      A.key === "Escape" && j();
    }
    function V(A) {
      A.target === A.currentTarget && j();
    }
    return mr(async () => {
      document.addEventListener("keydown", U), G(), await Z(), c = setInterval(() => Z({ isPoll: !0 }), Yd);
    }), Si(() => {
      c && clearInterval(c), document.removeEventListener("keydown", U);
    }), (A, D) => (K(), J("div", {
      class: "roles-overlay",
      onMousedown: V
    }, [
      re("div", Nd, [
        re("div", zd, [
          D[1] || (D[1] = re("div", { class: "roles-title" }, "Roles", -1)),
          re("div", Kd, Le(s.value), 1),
          me(Jt(Sl), {
            icon: "pi pi-times",
            text: "",
            rounded: "",
            severity: "secondary",
            "aria-label": "Close",
            onClick: j
          })
        ]),
        re("div", Wd, [
          r.value.length ? Fe("", !0) : (K(), J("div", Ud, "(no roles found)")),
          (K(!0), J(ve, null, Xn(r.value, (S) => (K(), J("div", {
            key: S.code,
            class: "role-card"
          }, [
            re("div", Gd, [
              re("span", qd, Le(S.code), 1),
              re("span", Zd, Le(S.name), 1),
              me(Jt(yl), {
                modelValue: S.speaker,
                "onUpdate:modelValue": (z) => S.speaker = z,
                options: i.value,
                editable: "",
                filter: "",
                placeholder: "Speaker preset",
                class: "role-speaker",
                title: "Real CosyVoice preset this role resolves to",
                onInput: D[0] || (D[0] = (z) => P()),
                onChange: (z) => _(S),
                onBlur: (z) => L(S)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "onChange", "onBlur"])
            ]),
            me(Jt(vl), {
              modelValue: S.description,
              "onUpdate:modelValue": (z) => S.description = z,
              ref_for: !0,
              ref: (z) => g(S.code, z),
              rows: "1",
              placeholder: "Description...",
              class: "role-description",
              onInput: (z) => {
                P(), y(Jt(p).get(S.code));
              }
            }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput"])
          ]))), 128))
        ])
      ])
    ], 32));
  }
}, ep = /* @__PURE__ */ Bd(Xd, [["__scopeId", "data-v-7c4214f5"]]), tp = 3;
let Ks = !1;
function np() {
  if (Ks) return;
  Ks = !0;
  const t = new URL(
    /* @vite-ignore */
    `./style.css?v=${tp}`,
    import.meta.url
  ).href;
  if (document.querySelector(`link[href="${t}"]`)) return;
  const e = document.createElement("link");
  e.rel = "stylesheet", e.href = t, document.head.appendChild(e);
}
function ip({ root: t, suffix: e = "_speakers.txt" }) {
  np();
  const n = document.createElement("div");
  document.body.appendChild(n);
  const r = Xu(ep, {
    root: t,
    suffix: e,
    onClose: () => {
      r.unmount(), n.remove();
    }
  });
  r.use(Vc, { ripple: !0 }), r.mount(n);
}
export {
  ip as openRolesEditor
};
