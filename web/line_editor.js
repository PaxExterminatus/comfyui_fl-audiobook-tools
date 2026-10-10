import { z as Cn, C as pt, A as xe, m as V, B as Ye, l as y, S as oe, D as We, E as Ae, p as de, G as we, H as vt, I as In, J as Pn, K as mt, _ as ht, w as Se, o as Rn, L as Tn, r as me, a as ie, c as ge, d as Y, b as M, u as t, g as he, n as ke, t as qe, F as Te, i as Je, M as Ge, j as $n, k as ft, e as An, f as Qe, N as Ke, O as xn, Q as En, q as Ln, s as Fn, v as Dn, x as On, P as Nn, y as jn } from "./styles_link.js";
import { u as Mn, a as Hn, D as Un } from "./DialogHeader.js";
import { l as Xe, h as Vn, m as Bn, s as zn, a as qn, S as Jn, b as Gn, L as Kn, I as Wn, c as Qn, d as Xn, _ as Yn, u as Zn, i as es, e as ts } from "./instruct_library.js";
var yt = Symbol();
function ns() {
  var f = Cn(yt);
  if (!f)
    throw new Error("No PrimeVue Confirmation provided!");
  return f;
}
var ss = {
  install: function(s) {
    var l = {
      require: function(R) {
        pt.emit("confirm", R);
      },
      close: function() {
        pt.emit("close");
      }
    };
    s.config.globalProperties.$confirm = l, s.provide(yt, l);
  }
};
let as = 1;
function _e(f) {
  return { ...f, __key: as++ };
}
function gt(f) {
  const s = f.split("|");
  return s.length !== 3 && s.length !== 4 ? null : {
    speaker: s[0].trim(),
    instruct: s[1].trim(),
    text: s[2].trim(),
    pause: s.length === 4 ? s[3].trim() : ""
  };
}
function kt(f) {
  return f.split(`
`).map((s) => s.replace(/\r$/, "")).filter((s) => s.trim()).map((s) => {
    const l = gt(s);
    return _e(l ? { ...l, raw: s, malformed: !1 } : { raw: s, malformed: !0 });
  });
}
function wt(f) {
  return f.map((s) => {
    if (s.malformed) return s.raw;
    const l = `${s.speaker} | ${s.instruct} | ${s.text}`;
    return s.pause ? `${l} | ${s.pause}` : l;
  }).join(`
`);
}
function os(f) {
  const { rows: s, linesDirPath: l } = f, h = y(/* @__PURE__ */ new Set()), R = y({});
  async function L() {
    try {
      const g = await (await fetch(`${Ye}?path=${encodeURIComponent(l.value)}`)).json();
      h.value = new Set(Array.isArray(g.files) ? g.files : []), R.value = g.file_mtimes || {};
    } catch {
    }
  }
  const o = V(() => {
    const r = /* @__PURE__ */ new Map();
    let g = 0;
    return s.value.forEach((k, T) => {
      k.malformed || (r.set(T, g), g++);
    }), r;
  });
  function H(r) {
    const g = o.value.get(r);
    return g === void 0 ? null : Bn(h.value, R.value, g);
  }
  function x(r) {
    return H(r) !== null;
  }
  const A = xe(/* @__PURE__ */ new Map()), j = /* @__PURE__ */ new Map(), z = 150;
  function B(r, g) {
    const k = o.value.get(g);
    if (k === void 0) return !1;
    const T = A.get(r.__key);
    return T !== void 0 && Vn(h.value, k, T);
  }
  function Q(r) {
    r.malformed || (clearTimeout(j.get(r.__key)), j.set(r.__key, setTimeout(async () => {
      j.delete(r.__key);
      const g = f.resolvedSpeakerForHash(r.speaker);
      A.set(r.__key, await Xe(g, r.instruct, r.text));
    }, z)));
  }
  async function N() {
    const r = s.value.filter((k) => !k.malformed), g = await Promise.all(
      r.map(
        (k) => Xe(f.resolvedSpeakerForHash(k.speaker), k.instruct, k.text)
      )
    );
    r.forEach((k, T) => A.set(k.__key, g[T]));
  }
  return {
    lineFilesOnDisk: h,
    lineFileMtimes: R,
    loadLineFiles: L,
    positionByIndex: o,
    latestFileFor: H,
    rowHasAnyTake: x,
    rowIsFresh: B,
    expectedHash: A,
    rowHashDebounce: j,
    ROW_HASH_DEBOUNCE_MS: z,
    updateRowHash: Q,
    recomputeAllHashes: N
  };
}
function is(f) {
  const {
    props: s,
    rows: l,
    filename: h,
    selectChecked: R,
    confirmAsync: L,
    setStatus: o,
    audioFolder: H,
    audioBaseName: x,
    linesDirPath: A,
    loadLineFiles: j,
    latestFileFor: z,
    rowHasAnyTake: B,
    rowIsFresh: Q,
    expectedHash: N,
    rowEls: r,
    rawTimingLines: g,
    lastTimingMtime: k,
    lastAudioFingerprint: T
  } = f, b = y(-1), D = y(null), I = y(!1), U = y(-1);
  let e = null;
  const n = y([]), a = xe({ checking: !0, best: null, mtime: null, error: null });
  async function c({ silent: S = !1 } = {}) {
    const F = de(de(H.value, "timing"), `${x.value}.json`);
    try {
      const C = await (await fetch(`${we}/read?path=${encodeURIComponent(F)}`)).json();
      if (!C.exists) {
        g.value = null, k.value = null;
        return;
      }
      if (S && C.mtime === k.value) return;
      const O = C.mtime !== k.value;
      k.value = C.mtime;
      let W;
      try {
        W = JSON.parse(C.content);
      } catch {
        g.value = null;
        return;
      }
      g.value = Array.isArray(W.lines) ? W.lines : null, O && j(), Ae(_);
    } catch {
    }
  }
  function d(S, F) {
    if (!Array.isArray(S) || !S.length) return null;
    const P = [];
    return F.forEach((C, O) => {
      C.malformed || P.push(O);
    }), P.length !== S.length ? null : { lines: S, rowIndexMap: P };
  }
  const w = V(
    () => E.value ? d(g.value, l.value) : null
  ), p = V(() => {
    const S = /* @__PURE__ */ new Map();
    return w.value && w.value.rowIndexMap.forEach((F, P) => S.set(F, P)), S;
  }), G = V(
    () => !!(E.value && g.value && g.value.length && !w.value)
  );
  function _() {
    var C;
    const S = D.value;
    if (!w.value || !S) {
      b.value = -1;
      return;
    }
    const F = S.currentTime;
    let P = -1;
    for (let O = 0; O < w.value.lines.length; O++)
      if (F >= w.value.lines[O].start && F < w.value.lines[O].end) {
        P = O;
        break;
      }
    if (P !== b.value && (b.value = P, P >= 0 && I.value)) {
      const O = w.value.rowIndexMap[P], W = O !== void 0 ? r.get((C = l.value[O]) == null ? void 0 : C.__key) : null;
      W == null || W.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  function K() {
    e && (e.pause(), e.src = "", e = null), U.value = -1;
  }
  function Z(S) {
    K();
    const F = A.value, P = (C) => {
      var ee, ae;
      let O = null;
      for (; C < l.value.length && !(!l.value[C].malformed && (O = z(C), O)); )
        C++;
      if (C >= l.value.length || !O) {
        U.value = -1;
        return;
      }
      U.value = C, (ae = r.get((ee = l.value[C]) == null ? void 0 : ee.__key)) == null || ae.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const W = new Audio(
        `${oe}/audio?path=${encodeURIComponent(de(F, O))}&v=${Date.now()}`
      );
      e = W, W.addEventListener("ended", () => P(C + 1)), W.play().catch((be) => o(`Playback failed: ${be}`));
    };
    P(S);
  }
  function J(S) {
    return E.value ? b.value === p.value.get(S) && I.value : U.value === S;
  }
  function se(S, F) {
    return E.value ? p.value.get(S) !== void 0 : B(S);
  }
  function pe(S, F) {
    if (se(F))
      if (E.value) {
        const P = p.value.get(F), C = D.value;
        if (P === void 0 || !C || !w.value) return;
        C.currentTime = w.value.lines[P].start, C.play();
      } else U.value === F ? K() : Z(F);
  }
  const le = V(
    () => E.value ? I.value : U.value !== -1
  ), re = V(
    () => E.value ? !!a.best : l.value.some((S, F) => !S.malformed && B(F))
  ), Ce = V(() => re.value ? le.value ? "Pause" : E.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
  function fe() {
    if (re.value)
      if (E.value) {
        const S = D.value;
        if (!S) return;
        I.value ? S.pause() : S.play();
      } else U.value !== -1 ? K() : Z(0);
  }
  async function ve({ silent: S = !1 } = {}) {
    S || (a.checking = !0);
    try {
      const P = await (await fetch(`${Ye}?path=${encodeURIComponent(H.value)}`)).json(), C = Array.isArray(P.files) ? P.files : [], O = P.file_mtimes || {}, W = x.value.toLowerCase(), ee = C.filter((Ie) => {
        const Pe = Ie.lastIndexOf(".");
        return (Pe > 0 ? Ie.slice(0, Pe) : Ie).toLowerCase().startsWith(W);
      });
      ee.sort();
      const ae = ee.length ? ee[ee.length - 1] : null, be = ae ? `${ae}::${O[ae] || ""}` : null;
      if (S && be === T.value) return;
      T.value = be, a.checking = !1, a.error = null, a.best = ae, a.mtime = ae ? O[ae] || Date.now() : null, ae || (I.value = !1, Ae(_));
    } catch (F) {
      a.checking = !1, a.error = String(F);
    }
  }
  const m = V(() => !a.best);
  async function $() {
    if (!(!a.best || !await L({
      title: "Delete rendered audio?",
      message: `Deletes every _audio\\ file matching "${x.value}" (currently: ${a.best})${E.value ? " -- this also un-marks the script as done" : ""}.`,
      okText: "Delete",
      cancelText: "Cancel"
    })))
      try {
        const P = await (await fetch(`${oe}/delete_audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: s.folder,
            base_name: x.value,
            filename: h.value
          })
        })).json();
        if (P.error) {
          o(`Error: ${P.error}`);
          return;
        }
        o(`Deleted ${P.deleted.length} audio file(s)`), n.value = n.value.filter((C) => C !== h.value), T.value = null, ve();
      } catch (F) {
        o(`Error: ${F}`);
      }
  }
  const E = V(() => n.value.includes(h.value)), ne = V(() => {
    const S = [];
    return l.value.forEach((F, P) => {
      F.malformed || S.push(P);
    }), S.length > 0 && S.every((F) => Q(l.value[F], F));
  }), ue = V(() => !E.value && !ne.value), Ee = V(() => E.value ? "Marked ready to release -- click to unmark and go back to editing" : ne.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
  async function Le() {
    var P;
    const S = !E.value;
    if (S && !ne.value) {
      o("Every line needs to be voiced before marking done");
      return;
    }
    if (S) {
      o("Stitching final file...");
      const C = l.value.filter((O) => !O.malformed);
      try {
        const W = await (await fetch(`${oe}/stitch_lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: s.folder,
            base_name: x.value,
            line_hashes: C.map((ee) => N.get(ee.__key)),
            line_texts: C.map((ee) => ee.text),
            pauses: C.map((ee) => We(ee.pause))
          })
        })).json();
        if (W.error) {
          o(`Stitch error: ${W.error}`);
          return;
        }
      } catch (O) {
        o(`Stitch failed: ${O}`);
        return;
      }
      n.value = [.../* @__PURE__ */ new Set([...n.value, h.value])], (P = s.checkedApi) == null || P.setChecked(h.value, !1), R.value = !1, o("Stitched and marked done"), T.value = null, k.value = null, ve(), c();
      return;
    }
    if (await L({
      title: "Unmark done?",
      message: "Deletes the final stitched file (its per-line takes are untouched) so this script goes back to editable.",
      okText: "Unmark",
      cancelText: "Cancel"
    }))
      try {
        const O = await (await fetch(`${oe}/delete_audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: s.folder,
            base_name: x.value,
            filename: h.value
          })
        })).json();
        if (O.error) {
          o(`Error: ${O.error}`);
          return;
        }
        n.value = n.value.filter((W) => W !== h.value), o("Unmarked -- can be edited/re-voiced again"), T.value = null, ve();
      } catch (C) {
        o(`Error: ${C}`);
      }
  }
  return {
    rawTimingLines: g,
    activeTimingIdx: b,
    lastTimingMtime: k,
    audioElRef: D,
    loadTiming: c,
    computeLineTiming: d,
    lineTiming: w,
    currentRowToTimingIdx: p,
    timingWarningVisible: G,
    syncActiveLine: _,
    audioIsPlaying: I,
    mode1PlayingIdx: U,
    stopMode1Playback: K,
    playRowSequential: Z,
    isRowPlaying: J,
    canPlayRow: se,
    onPlayClick: pe,
    isPlayingAnything: le,
    canPlayGlobal: re,
    globalPlayTitle: Ce,
    toggleGlobalPlayback: fe,
    readyScripts: n,
    audioState: a,
    lastAudioFingerprint: T,
    loadAudio: ve,
    deleteAudioDisabled: m,
    deleteAudio: $,
    isCurrentlyReady: E,
    allRowsVoiced: ne,
    doneDisabled: ue,
    doneTitle: Ee,
    toggleDone: Le
  };
}
function ls(f) {
  const {
    props: s,
    filename: l,
    setStatus: h,
    lastAudioFingerprint: R,
    lastTimingMtime: L
  } = f, o = y([]), H = y(null), x = y([]), A = y(null), j = y([]), z = y(""), B = y([]), Q = V(() => {
    const e = /* @__PURE__ */ new Map();
    for (const n of x.value) e.set(n.code, n);
    return e;
  });
  function N(e) {
    return Q.value.get(e.speaker);
  }
  function r(e) {
    if (!e) return "";
    const n = x.value.find((d) => d.code === e), a = n && n.speaker ? n.speaker : e, c = String(a).split("#", 1)[0].trim();
    return c ? `${c}.pt` : "";
  }
  function g(e) {
    const n = x.value.find((a) => a.code === e);
    return n && n.speaker ? n.speaker : e || "";
  }
  function k() {
    const e = {};
    return x.value.forEach((n) => {
      const a = String(n.speaker || "").split("#", 1)[0].trim();
      !a || !n.code || (e[a] = e[a] || []).push(n.code);
    }), e;
  }
  function T(e) {
    return [e.name, e.speaker, e.description].filter(Boolean).join(" -- ");
  }
  async function b() {
    if (!A.value)
      return h("No _roles.json found for this project -- can't save"), !1;
    try {
      const n = await (await fetch(`${we}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: A.value,
          content: JSON.stringify({ roles: x.value }, null, 2)
        })
      })).json();
      return n.error ? (h(`Error saving _roles.json: ${n.error}`), !1) : !0;
    } catch (e) {
      return h(`Error saving _roles.json: ${e}`), !1;
    }
  }
  async function D(e) {
    var c, d;
    if (!A.value) return;
    const n = In(A.value), a = await Pn(n, e, s.suffix);
    h(a.message), a.changed.some((w) => w.file === l.value) && (await U(), R && (R.value = null), L && (L.value = null), (c = f.loadAudio) == null || c.call(f), (d = f.loadTiming) == null || d.call(f));
  }
  async function I() {
    try {
      const n = await (await fetch(vt)).json();
      j.value = n.presets || [], z.value = n.dir || "";
    } catch {
      j.value = [], z.value = "";
    }
  }
  async function U() {
    var e, n, a, c;
    try {
      const d = `${oe}/scan?path=${encodeURIComponent(s.folder)}&act=&suffix=${encodeURIComponent(s.suffix)}`, p = await (await fetch(d)).json();
      o.value = ((e = p.instruct_categories) == null ? void 0 : e.entries) || [], H.value = ((n = p.instruct_categories) == null ? void 0 : n.path) || null, x.value = ((a = p.roles) == null ? void 0 : a.entries) || [], A.value = ((c = p.roles) == null ? void 0 : c.path) || null, B.value = Array.isArray(p.scripts) ? p.scripts : [], f.readyScripts && (f.readyScripts.value = Array.isArray(p.ready_scripts) ? p.ready_scripts : []);
    } catch {
      o.value = [], H.value = null, x.value = [], A.value = null, B.value = [], f.readyScripts && (f.readyScripts.value = []);
    }
  }
  return {
    instructCategories: o,
    instructCategoriesPath: H,
    roleEntries: x,
    rolesJsonPath: A,
    presets: j,
    speakerSampleDir: z,
    scriptList: B,
    roleEntryByCode: Q,
    roleEntryFor: N,
    resolveSpeakerFile: r,
    resolvedSpeakerForHash: g,
    speakerUsageIndex: k,
    roleOptionSubLabel: T,
    saveRolesJson: b,
    notifyRoleSpeakerChanged: D,
    loadPresets: I,
    loadCatalog: U
  };
}
function rs(f) {
  const {
    props: s,
    filename: l,
    rows: h,
    selectChecked: R,
    fullPath: L,
    setStatus: o,
    rawTimingLines: H,
    lastTimingMtime: x,
    lastAudioFingerprint: A,
    recomputeAllHashes: j,
    loadAudio: z,
    loadTiming: B,
    SAVE_DEBOUNCE_MS: Q,
    EDIT_QUIET_MS: N
  } = f, r = y(null), g = y(0), k = y(null), T = y(!1), b = y(null), D = y(null), I = y(null);
  function U() {
    g.value = Date.now(), k.value && clearTimeout(k.value), k.value = setTimeout(e, Q);
  }
  async function e() {
    const d = wt(h.value);
    if (d !== r.value)
      try {
        const p = await (await fetch(`${we}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: L.value, content: d })
        })).json();
        if (p.error) {
          o(`Save error: ${p.error}`);
          return;
        }
        r.value = d, o(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
      } catch (w) {
        o(`Save failed: ${w}`);
      }
  }
  async function n({ isPoll: d = !1 } = {}) {
    try {
      const p = await (await fetch(`${we}/read?path=${encodeURIComponent(L.value)}`)).json();
      if (p.error) {
        o(`Read error: ${p.error}`);
        return;
      }
      if (!p.exists) {
        d || (h.value = [], r.value = "", o("File does not exist yet (will be created on first edit)"));
        return;
      }
      if (d && Date.now() - g.value < N || p.content === r.value) return;
      h.value = kt(p.content), r.value = p.content, j(), d || o(`Loaded ${h.value.length} line(s)`);
    } catch (w) {
      o(`Read failed: ${w}`);
    }
  }
  async function a(d) {
    !d || d === l.value || T.value || (k.value && (clearTimeout(k.value), k.value = null, await e()), l.value = d, A.value = null, H.value = null, x.value = null, h.value = [], r.value = null, g.value = 0, R.value = s.checkedApi ? s.checkedApi.isChecked(d) : !1, o("Loading..."), await n(), z(), B());
  }
  function c() {
    T.value || (T.value = !0, k.value && (clearTimeout(k.value), e()), b.value && clearInterval(b.value), D.value && clearInterval(D.value), I.value && clearInterval(I.value), s.onClose());
  }
  return {
    // состояние
    lastSavedText: r,
    lastLocalEditAt: g,
    saveTimer: k,
    pollTimer: b,
    audioPollTimer: D,
    timingPollTimer: I,
    closed: T,
    // операции
    scheduleSave: U,
    flushSave: e,
    loadFromDisk: n,
    switchToFile: a,
    close: c
  };
}
function us(f) {
  const {
    props: s,
    rows: l,
    audioBaseName: h,
    setStatus: R,
    confirmAsync: L,
    positionByIndex: o,
    updateRowHash: H,
    loadLineFiles: x,
    scheduleSave: A
  } = f, j = /* @__PURE__ */ new Map(), z = y(null), B = y(null);
  function Q(e, n) {
    if (!n) {
      j.delete(e);
      return;
    }
    j.set(e, n);
  }
  async function N(e) {
    var a;
    B.value = e, await Ae();
    const n = j.get(e);
    n == null || n.scrollIntoView({ behavior: "smooth", block: "nearest" }), (a = n == null ? void 0 : n.querySelector(".fl-input")) == null || a.focus(), setTimeout(() => {
      B.value === e && (B.value = null);
    }, 500);
  }
  let r = null;
  async function g(e, n) {
    const a = l.value[e], c = l.value[n];
    if (!a || !c || a.malformed || c.malformed) return;
    const d = Math.min(e, n), w = Math.max(e, n), p = l.value[d], G = l.value[w];
    if ((p.speaker || "").trim() !== (G.speaker || "").trim() && !await L({
      title: "Merge lines with different speakers?",
      message: `"${p.speaker}" and "${G.speaker}" are different speakers. Merge anyway? The combined line keeps "${p.speaker}".`,
      okText: "Merge",
      cancelText: "Cancel"
    }))
      return;
    const _ = o.value.get(w), K = o.value.size;
    if (p.text = `${p.text} ${G.text}`.trim(), p.pause = G.pause || "", l.value.splice(w, 1), H(p), A(), _ !== void 0) {
      const Z = [];
      for (let J = _ + 1; J < K; J++) Z.push([J, J - 1]);
      U({ deletes: [_], moves: Z });
    }
  }
  function k(e, n) {
    !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (a) => {
      if (a.button !== 0) return;
      a.preventDefault();
      const c = e.closest(".fl-line-row");
      r = Number(c == null ? void 0 : c.dataset.rowIndex), c == null || c.classList.add("fl-row-dragging");
      const d = (p) => {
        var K;
        (K = z.value) == null || K.querySelectorAll(".fl-row-drop-target").forEach((Z) => Z.classList.remove("fl-row-drop-target"));
        const G = document.elementFromPoint(p.clientX, p.clientY), _ = G && G.closest ? G.closest(".fl-line-row") : null;
        _ && _ !== c && _.classList.add("fl-row-drop-target");
      }, w = (p) => {
        var Z;
        document.removeEventListener("pointermove", d), document.removeEventListener("pointerup", w), document.removeEventListener("pointercancel", w);
        const G = document.elementFromPoint(p.clientX, p.clientY), _ = G && G.closest ? G.closest(".fl-line-row") : null, K = r;
        if (r = null, c == null || c.classList.remove("fl-row-dragging"), (Z = z.value) == null || Z.querySelectorAll(".fl-row-drop-target").forEach((J) => J.classList.remove("fl-row-drop-target")), _ && _ !== c) {
          const J = Number(_.dataset.rowIndex);
          Number.isNaN(J) || g(K, J);
        }
      };
      document.addEventListener("pointermove", d), document.addEventListener("pointerup", w), document.addEventListener("pointercancel", w);
    }));
  }
  function T(e) {
    const n = o.value.get(e), a = o.value.size;
    if (l.value.splice(e, 1), A(), n !== void 0) {
      const c = [];
      for (let d = n + 1; d < a; d++) c.push([d, d - 1]);
      U({ deletes: [n], moves: c });
    }
  }
  async function b(e, n) {
    n && n.trim() && !await L({
      title: "Delete this line?",
      message: n.length > 200 ? n.slice(0, 200) + "…" : n,
      okText: "Delete",
      cancelText: "Cancel"
    }) || T(e);
  }
  function D() {
    const e = document.activeElement;
    if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
      R("Click into a line's text first, place the cursor where it should split");
      return;
    }
    const n = e.closest(".fl-line-row"), a = n ? Number(n.dataset.rowIndex) : -1, c = a >= 0 ? l.value[a] : null;
    if (!c || c.malformed) {
      R("Can't split a malformed/raw line -- fix it to plain text first");
      return;
    }
    const d = o.value.get(a), w = o.value.size, p = e.selectionStart, G = c.text.slice(0, p).trimEnd(), _ = c.text.slice(p).trimStart();
    c.text = G;
    const K = _e({
      speaker: c.speaker,
      instruct: c.instruct,
      text: _,
      pause: c.pause || "",
      raw: "",
      malformed: !1
    });
    if (c.pause = "", l.value.splice(a + 1, 0, K), H(c), H(K), N(K.__key), A(), d !== void 0) {
      const Z = d + 1, J = [];
      for (let se = w - 1; se >= Z; se--) J.push([se, se + 1]);
      U({ moves: J });
    }
  }
  function I() {
    const e = _e({
      speaker: "",
      instruct: "",
      text: "",
      pause: "",
      raw: "",
      malformed: !1
    });
    l.value.push(e), H(e), N(e.__key), A();
  }
  async function U({ deletes: e = [], moves: n = [] } = {}) {
    if (!(!e.length && !n.length))
      try {
        await fetch(`${oe}/reorganize_lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: s.folder,
            base_name: h.value,
            deletes: e,
            moves: n
          })
        }), await x();
      } catch {
      }
  }
  return {
    // DOM-узлы
    rowEls: j,
    rowsContainerEl: z,
    justAddedKey: B,
    setRowRef: Q,
    focusNewRow: N,
    // операции
    mergeRows: g,
    attachDragHandlers: k,
    deleteRow: T,
    confirmDeleteRow: b,
    splitFocusedLine: D,
    addLine: I,
    reorganizeLines: U
  };
}
function cs(f) {
  const {
    props: s,
    rows: l,
    audioBaseName: h,
    positionByIndex: R,
    setStatus: L,
    updateRowHash: o,
    recomputeAllHashes: H,
    loadLineFiles: x,
    scheduleSave: A,
    roleEntryFor: j,
    resolveSpeakerFile: z,
    saveRolesJson: B,
    notifyRoleSpeakerChanged: Q,
    instructCategories: N,
    instructCategoriesPath: r,
    SAVE_DEBOUNCE_MS: g
  } = f, k = y(!1), T = y(null);
  function b(m) {
    T.value = m, k.value = !0;
  }
  function D(m) {
    const $ = T.value;
    $ && ($.__prevInstruct = $.instruct, $.instruct = m, d($));
  }
  function I(m) {
    return m.__prevInstruct !== void 0 ? `Restore previous instruct: "${m.__prevInstruct}"` : "No previous instruct to restore";
  }
  function U(m) {
    if (m.__prevInstruct === void 0) return;
    const $ = m.instruct;
    m.instruct = m.__prevInstruct, m.__prevInstruct = $, d(m);
  }
  const e = V(() => {
    const m = /* @__PURE__ */ new Map();
    for (const $ of N.value)
      for (const E of $.examples || [])
        m.set(E.trim(), $.title);
    return m;
  });
  function n(m) {
    return e.value.get(m.instruct.trim()) || null;
  }
  const a = /* @__PURE__ */ new Map();
  function c(m) {
    clearTimeout(a.get(m.__key)), a.set(m.__key, setTimeout(async () => {
      a.delete(m.__key);
      const $ = await zn(
        we,
        r.value,
        m.instruct
      );
      $ && (N.value = $);
    }, g));
  }
  function d(m) {
    o(m), A(), c(m);
  }
  const w = y(!1), p = y(null);
  function G(m) {
    p.value = m, w.value = !0;
  }
  async function _(m) {
    const $ = p.value;
    $ && await K($, m);
  }
  async function K(m, $) {
    const E = j(m);
    if (!E) return;
    E.speaker = $, H(), await B() && (L(`"${E.code}" now uses "${$}" for the whole play`), await Q(E.code));
  }
  function Z(m) {
    const $ = j(m), E = z(m.speaker);
    return $ ? `Change "${$.code}"'s speaker for the whole play (currently ${E || "unset"})` : E ? `"${m.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
  }
  const J = y(!1), se = y(null), pe = y([]), le = y(null), re = xe(/* @__PURE__ */ new Map());
  async function Ce() {
    try {
      const $ = await (await fetch(
        `${oe}/line_history/counts?folder=${encodeURIComponent(s.folder)}&base_name=${encodeURIComponent(h.value)}`
      )).json();
      if ($ && !$.error) {
        re.clear();
        for (const [E, ne] of Object.entries($))
          re.set(Number(E), ne);
      }
    } catch (m) {
      console.error("[FL history] couldn't load version counts", m);
    }
  }
  async function fe(m, $) {
    se.value = m;
    const E = R.value.get($);
    try {
      const ue = await (await fetch(
        `${oe}/line_history?folder=${encodeURIComponent(s.folder)}&base_name=${encodeURIComponent(h.value)}&position=${E}`
      )).json();
      pe.value = ue.versions || [], le.value = ue.chosen_version ?? null;
    } catch (ne) {
      console.error("[FL history] couldn't load line history", ne), pe.value = [], le.value = null;
    }
    J.value = !0;
  }
  async function ve(m) {
    const $ = se.value;
    if (!$) return;
    const E = l.value.indexOf($), ne = R.value.get(E);
    try {
      await fetch(`${oe}/line_history/choose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: s.folder,
          base_name: h.value,
          position: ne,
          version: m
        })
      }), L(`Line switched to version ${m}`), await x();
    } catch (ue) {
      L(`Couldn't switch version: ${ue.message || ue}`);
    }
  }
  return {
    // InstructPicker
    instructPickerVisible: k,
    instructPickerRow: T,
    openInstructPicker: b,
    onInstructPicked: D,
    undoInstructTitle: I,
    undoInstruct: U,
    instructCategoryByPhrase: e,
    instructNoteFor: n,
    instructLibrarySaveDebounce: a,
    scheduleInstructLibrarySave: c,
    onInstructInput: d,
    // SpeakerPicker
    speakerPickerVisible: w,
    speakerPickerRow: p,
    openSpeakerPicker: G,
    onSpeakerPicked: _,
    onSpeakerFileRecast: K,
    speakerFileTitle: Z,
    // LineHistory
    historyVisible: J,
    historyRow: se,
    historyVersions: pe,
    historyChosenVersion: le,
    historyCounts: re,
    refreshHistoryCounts: Ce,
    openLineHistory: fe,
    onHistoryVersionChosen: ve
  };
}
function ds(f) {
  const {
    props: s,
    rows: l,
    filename: h,
    audioBaseName: R,
    linesDirPath: L,
    setStatus: o,
    positionByIndex: H,
    rowHasAnyTake: x,
    rowIsFresh: A,
    lineFilesOnDisk: j,
    loadLineFiles: z,
    resolvedSpeakerForHash: B,
    refreshHistoryCounts: Q,
    flushSave: N
  } = f, r = xe(/* @__PURE__ */ new Set()), g = y(!1), k = V(
    () => l.value.filter((e, n) => b(e, n)).length
  ), T = V(
    () => k.value > 0 ? `Re-voice ${k.value} line(s) whose text/speaker/instruct changed since they were last rendered (the gold 🔁 rows), one at a time` : "No line in this script needs re-voicing right now"
  );
  function b(e, n) {
    return !e.malformed && x(n) && !A(e, n);
  }
  function D(e, n) {
    return r.has(e) ? "Re-voicing..." : x(n) && !A(e, n) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : A(e, n) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
  }
  async function I(e, n) {
    if (!r.has(e)) {
      r.add(e), o("Re-voicing...");
      try {
        const a = await Xe(
          B(e.speaker),
          e.instruct,
          e.text
        );
        await s.revoiceApi.revoiceLine({
          linePosition: H.value.get(n),
          speaker: e.speaker,
          instruct: e.instruct,
          text: e.text,
          contentHash: a,
          file: h.value,
          folder: s.folder,
          baseName: R.value
        }), await z(), await Q();
        const c = H.value.get(n), d = qn(c, a), w = j.value.has(d);
        console.log("[FL revoice] after render:", {
          position: c,
          expectedFile: d,
          foundOnDisk: w,
          linesDir: L.value,
          filesInDir: [...j.value]
        }), o(
          w ? "Line re-voiced" : `Re-voice finished but ${d} is not in ${L.value} -- see the console`
        );
      } catch (a) {
        o(`Re-voice failed: ${a.message || a}`);
      } finally {
        r.delete(e), N();
      }
    }
  }
  async function U() {
    if (g.value) return;
    const e = l.value.filter((n, a) => b(n, a));
    if (e.length) {
      g.value = !0;
      try {
        for (const n of e) {
          const a = l.value.indexOf(n);
          a !== -1 && await I(n, a);
        }
        o(`Re-voiced ${e.length} line(s)`);
      } finally {
        g.value = !1;
      }
    }
  }
  return {
    pendingRevoiceRows: r,
    isRevoicingStale: g,
    staleRowCount: k,
    revoiceStaleTitle: T,
    isRowStale: b,
    revoiceTitle: D,
    revoiceRow: I,
    revoiceStaleRows: U
  };
}
function ps(f) {
  const {
    rows: s,
    filename: l,
    setStatus: h,
    scriptList: R,
    updateRowHash: L,
    scheduleSave: o,
    switchToFile: H
  } = f, x = V(() => {
    let b = -1;
    return s.value.forEach((D, I) => {
      D.malformed || (b = I);
    }), b;
  });
  function A(b) {
    return b === x.value ? 0 : mt;
  }
  function j(b) {
    return !!b.pause && We(b.pause) === null;
  }
  function z(b, D) {
    const I = We(b.pause);
    return b.pause && I === null ? `"${b.pause}" isn't a pause this can read -- expected seconds between 0 and 10 (e.g. 1.5). Falling back to ${A(D)}s.` : I !== null ? I === 0 ? "No pause after this line -- the next one comes in on top of it (an interruption)" : `Hold ${I}s of silence after this line` : `Pause after this line, in seconds. Empty = ${A(D)}s` + (D === x.value ? " (nothing held after the last line)" : " (the default between lines)");
  }
  const B = V(() => {
    const b = /* @__PURE__ */ new Map();
    for (const D of s.value) {
      if (D.malformed) continue;
      const I = (D.speaker || "").trim();
      I && b.set(I, (b.get(I) || 0) + 1);
    }
    return b;
  });
  function Q(b) {
    const D = (b.speaker || "").trim();
    if (!D) return 0;
    const I = B.value.get(D) || 0;
    return I > 0 ? I - 1 : 0;
  }
  const N = V(() => R.value.indexOf(l.value)), r = V(() => !(N.value > 0)), g = V(
    () => !(N.value >= 0 && N.value < R.value.length - 1)
  );
  function k() {
    N.value > 0 && H(R.value[N.value - 1]);
  }
  function T() {
    N.value >= 0 && N.value < R.value.length - 1 && H(R.value[N.value + 1]);
  }
  return {
    lastRowIndex: x,
    pauseDefaultFor: A,
    pauseUnreadable: j,
    pauseTitle: z,
    roleCountByCode: B,
    sameRoleCount: Q,
    navIdx: N,
    prevDisabled: r,
    nextDisabled: g,
    goPrev: k,
    goNext: T
  };
}
const fs = { class: "fl-line-editor-content" }, vs = { class: "actions" }, ms = ["title"], hs = ["src"], ys = {
  key: 0,
  class: "timing-warning text-warning"
}, gs = { class: "actions" }, ks = ["checked", "disabled"], ws = ["data-row-index"], bs = { class: "line-number" }, Ss = { class: "line-body list" }, _s = { class: "row" }, Cs = ["title", "onClick"], Is = 600, $e = 3e3, Ps = 1500, Rs = {
  __name: "LineEditorContent",
  props: {
    folder: { type: String, required: !0 },
    filename: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    checkedApi: { type: Object, default: null },
    revoiceApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(f) {
    const s = f, l = y(!0), h = y(s.filename), R = y([]), L = y(""), o = y(s.checkedApi ? s.checkedApi.isChecked(s.filename) : !1), H = y(null), x = y(null), A = y(null), j = /* @__PURE__ */ new Map(), z = ns();
    function B({ title: v = "Confirm", message: i = "", okText: te = "OK", cancelText: Be = "Cancel" } = {}) {
      return new Promise((ye) => {
        z.require({
          header: v,
          message: i,
          acceptLabel: te,
          rejectLabel: Be,
          accept: () => ye(!0),
          reject: () => ye(!1),
          onHide: () => ye(!1)
        });
      });
    }
    const { setWidth: Q, presets: N } = Mn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), { fontSizePx: r, decrease: g, increase: k } = Hn({
      storageKey: "FL_CosyVoice3.LineEditor.textFontSizePx",
      defaultSize: 11.5
    }), { autoGrow: T, setTextareaRef: b, regrowAll: D } = Zn(), I = V(() => de(s.folder, h.value)), U = V(() => de(s.folder, "_audio")), e = V(() => xn(h.value, s.suffix)), n = V(() => de(de(U.value, "lines"), e.value));
    function a(v) {
      L.value = v;
    }
    const c = y(null), d = y(null), w = y(null), p = y(null), G = y(!1), _ = {
      props: s,
      visible: l,
      filename: h,
      rows: R,
      status: L,
      selectChecked: o,
      parseLine: gt,
      parseScript: kt,
      serializeRows: wt,
      freshRow: _e,
      confirmAsync: B,
      setStatus: a,
      setTextareaRef: b,
      autoGrow: T,
      fullPath: I,
      audioFolder: U,
      audioBaseName: e,
      linesDirPath: n,
      saveTimer: c,
      pollTimer: d,
      audioPollTimer: w,
      timingPollTimer: p,
      closed: G,
      rawTimingLines: H,
      lastTimingMtime: x,
      lastAudioFingerprint: A,
      rowEls: j,
      SAVE_DEBOUNCE_MS: Is,
      POLL_MS: $e,
      EDIT_QUIET_MS: Ps,
      FILE_API: we,
      SCAN_API: oe,
      BROWSE_API: Ye,
      PRESETS_API: vt,
      DEFAULT_LINE_GAP_S: mt
    };
    Object.assign(_, os(_)), Object.assign(_, is(_)), Object.assign(_, ls(_)), Object.assign(_, rs(_)), Object.assign(_, us(_)), Object.assign(_, cs(_)), Object.assign(_, ds(_)), Object.assign(_, ps(_));
    const {
      // useLineCatalog
      instructCategories: K,
      instructCategoriesPath: Z,
      roleEntries: J,
      rolesJsonPath: se,
      presets: pe,
      speakerSampleDir: le,
      scriptList: re,
      roleEntryByCode: Ce,
      roleEntryFor: fe,
      resolveSpeakerFile: ve,
      resolvedSpeakerForHash: m,
      speakerUsageIndex: $,
      roleOptionSubLabel: E,
      saveRolesJson: ne,
      notifyRoleSpeakerChanged: ue,
      loadPresets: Ee,
      loadCatalog: Le,
      // useLineFiles
      lineFilesOnDisk: S,
      lineFileMtimes: F,
      loadLineFiles: P,
      positionByIndex: C,
      latestFileFor: O,
      rowHasAnyTake: W,
      rowIsFresh: ee,
      expectedHash: ae,
      rowHashDebounce: be,
      ROW_HASH_DEBOUNCE_MS: Ie,
      updateRowHash: Pe,
      recomputeAllHashes: Ze,
      // useScriptIO
      lastSavedText: xs,
      lastLocalEditAt: Es,
      scheduleSave: Fe,
      flushSave: Ls,
      loadFromDisk: et,
      switchToFile: Fs,
      close: bt,
      // usePlayback
      activeTimingIdx: St,
      audioElRef: _t,
      loadTiming: tt,
      computeLineTiming: Ds,
      lineTiming: Ct,
      currentRowToTimingIdx: It,
      timingWarningVisible: Pt,
      syncActiveLine: De,
      audioIsPlaying: Oe,
      mode1PlayingIdx: Rt,
      stopMode1Playback: Tt,
      playRowSequential: Os,
      isRowPlaying: nt,
      canPlayRow: st,
      onPlayClick: $t,
      isPlayingAnything: at,
      canPlayGlobal: At,
      globalPlayTitle: xt,
      toggleGlobalPlayback: ot,
      readyScripts: Ns,
      audioState: Ne,
      loadAudio: je,
      deleteAudioDisabled: Et,
      deleteAudio: Lt,
      isCurrentlyReady: ce,
      allRowsVoiced: js,
      doneDisabled: Ft,
      doneTitle: Dt,
      toggleDone: Ot,
      // useRowOps
      mergeRows: Ms,
      attachDragHandlers: Nt,
      deleteRow: Hs,
      confirmDeleteRow: it,
      splitFocusedLine: jt,
      addLine: Mt,
      reorganizeLines: Us,
      rowsContainerEl: Ht,
      justAddedKey: Ut,
      setRowRef: Vt,
      focusNewRow: Vs,
      // useDialogs
      instructPickerVisible: Me,
      instructPickerRow: Bs,
      openInstructPicker: Bt,
      onInstructPicked: zt,
      undoInstructTitle: qt,
      undoInstruct: Jt,
      instructCategoryByPhrase: zs,
      instructNoteFor: Gt,
      instructLibrarySaveDebounce: qs,
      scheduleInstructLibrarySave: Js,
      onInstructInput: Kt,
      speakerPickerVisible: He,
      speakerPickerRow: Gs,
      openSpeakerPicker: Wt,
      onSpeakerPicked: Qt,
      onSpeakerFileRecast: Xt,
      speakerFileTitle: Yt,
      historyVisible: Ue,
      historyRow: Ks,
      historyVersions: Zt,
      historyChosenVersion: en,
      historyCounts: lt,
      refreshHistoryCounts: tn,
      openLineHistory: nn,
      onHistoryVersionChosen: sn,
      // useRevoice
      pendingRevoiceRows: Re,
      isRevoicingStale: an,
      staleRowCount: on,
      revoiceStaleTitle: ln,
      isRowStale: Ws,
      revoiceTitle: rn,
      revoiceRow: un,
      revoiceStaleRows: cn,
      // useRowHelpers
      lastRowIndex: Qs,
      pauseDefaultFor: dn,
      pauseUnreadable: rt,
      pauseTitle: pn,
      roleCountByCode: Xs,
      sameRoleCount: ut,
      applyInstructToSameRole: fn,
      navIdx: Ys,
      prevDisabled: vn,
      nextDisabled: mn,
      goPrev: hn,
      goNext: yn
    } = _, {
      popover: Ve,
      show: gn,
      hide: kn,
      info: ct
    } = ts(
      J,
      (v) => Object.entries(v).filter(
        ([, i]) => i !== "" && i !== null && i !== void 0 && i !== v.__key
      )
    );
    En("lineRowApi", {
      // общий каталог и UI
      roleEntries: J,
      roleOptionSubLabel: E,
      fontSizePx: r,
      autoGrow: T,
      setTextareaRef: b,
      showRoleInfoPopover: gn,
      hideRoleInfoPopover: kn,
      // подписи, специфичные для audiobook
      speakerPlaceholder: "Speaker",
      speakerTitle: "Speaker (role code, or a literal preset/preset#tag)",
      instructPlaceholder: "Instruct",
      instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
      textPlaceholder: "",
      // доступ к полям row
      getSpeaker: (v) => v.speaker,
      setSpeaker: (v, i) => {
        v.speaker = i, onSpeakerInput(v);
      },
      getInstruct: (v) => v.instruct,
      setInstruct: (v, i) => {
        v.instruct = i, Kt(v);
      },
      getText: (v) => v.text,
      setText: (v, i) => {
        v.text = i, Pe(v), Fe();
      },
      getRoleInfoCode: (v) => v.speaker,
      textKey: (v) => v.__key,
      // instruct-действия
      canUndoInstruct: (v) => v.__prevInstruct !== void 0,
      undoInstructTitle: (v) => qt(v),
      undoInstruct: (v) => Jt(v),
      /*
       LineRowEditor.vue calls these two WITHOUT optional chaining (its lines
       112-113, unlike the audio-url pair just below them), so omitting them here
       crashed the editor outright: "api.canApplyInstruct is not a function".
       VO Dub's useVoDubRowApi.js supplied both and this side did not -- the two
       implementations of one shared contract had drifted apart.
      */
      canApplyInstruct: (v) => ut(v) > 0,
      applyInstructTitle: (v) => {
        const i = ut(v);
        return i > 0 ? `Apply this instruct to every other "${(v.speaker || "").trim()}" row in this script (${i})` : "No other rows in this script use this role";
      },
      applyInstructToSameRole: (v) => fn(v),
      instructNoteFor: (v) => Gt(v),
      openInstructPicker: (v) => Bt(v)
    });
    function wn(v) {
      var i;
      (i = s.checkedApi) == null || i.setChecked(h.value, v);
    }
    function bn() {
      es(a);
    }
    return Se(J, Ze), Se(l, (v) => {
      v || bt();
    }), Se(Ct, () => Ae(De)), Se(r, D), Rn(() => {
      Le(), Ee(), je(), P(), tn(), w.value = setInterval(() => {
        je({ silent: !0 }), P();
      }, $e), et().then(() => {
        d.value = setInterval(() => et({ isPoll: !0 }), $e), tt(), p.value = setInterval(() => tt({ silent: !0 }), $e);
      });
    }), Tn(() => {
      Tt(), d.value && clearInterval(d.value), w.value && clearInterval(w.value), p.value && clearInterval(p.value);
    }), (v, i) => {
      const te = me("Button"), Be = me("Textarea"), ye = me("InputText"), dt = me("InputGroup"), Sn = me("InputGroupAddon"), _n = me("ConfirmDialog");
      return ie(), ge(Te, null, [
        Y("div", fs, [
          M(Un, {
            title: h.value,
            status: L.value,
            "width-presets": t(N),
            "set-width": t(Q),
            "font-size-decrease": t(g),
            "font-size-increase": t(k)
          }, null, 8, ["title", "status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
          M(Jn, { class: "line-editor-controls" }, {
            default: he(() => [
              Y("div", vs, [
                Y("span", {
                  class: ke(["play-btn global-play-btn", { "is-playing": t(at), disabled: !t(At) }]),
                  title: t(xt),
                  onClick: i[0] || (i[0] = (...u) => t(ot) && t(ot)(...u))
                }, qe(t(at) ? "⏸" : "▶"), 11, ms),
                t(Ne).best ? (ie(), ge(Te, { key: 0 }, [
                  Y("audio", {
                    ref_key: "audioElRef",
                    ref: _t,
                    controls: "",
                    class: "audio-el",
                    src: `${t(oe)}/audio?path=${encodeURIComponent(t(de)(U.value, t(Ne).best))}&v=${encodeURIComponent(t(Ne).mtime || "")}`,
                    onTimeupdate: i[1] || (i[1] = (...u) => t(De) && t(De)(...u)),
                    onPlay: i[2] || (i[2] = (u) => Oe.value = !0),
                    onPause: i[3] || (i[3] = (u) => Oe.value = !1),
                    onEnded: i[4] || (i[4] = (u) => Oe.value = !1)
                  }, null, 40, hs),
                  M(te, {
                    label: "Delete audio",
                    disabled: t(Et),
                    title: t(ce) ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                    onClick: t(Lt),
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title", "onClick"])
                ], 64)) : Je("", !0),
                M(te, {
                  icon: "pi pi-refresh",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: i[5] || (i[5] = (u) => t(je)())
                })
              ]),
              t(Pt) ? (ie(), ge("div", ys, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : Je("", !0),
              Y("div", gs, [
                Y("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: o.value,
                  disabled: !f.checkedApi || t(ce),
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: i[6] || (i[6] = (u) => {
                    o.value = u.target.checked, wn(u.target.checked);
                  })
                }, null, 40, ks),
                M(te, {
                  label: t(ce) ? "Done ✓" : "Done",
                  outlined: !t(ce),
                  disabled: t(Ft),
                  title: t(Dt),
                  onClick: t(Ot)
                }, null, 8, ["label", "outlined", "disabled", "title", "onClick"]),
                i[13] || (i[13] = Y("div", { class: "divider" }, null, -1)),
                M(te, {
                  label: "´ Stress mark",
                  title: "Insert a stress mark at the cursor",
                  onMousedown: Ge(bn, ["prevent"])
                }),
                M(te, {
                  label: "✂ Split line",
                  title: "Split this line into two at the cursor",
                  onMousedown: Ge(t(jt), ["prevent"])
                }, null, 8, ["onMousedown"]),
                M(te, {
                  label: "+ Add line",
                  title: "Add a new empty line at the end of the script",
                  onClick: t(Mt)
                }, null, 8, ["onClick"]),
                M(te, {
                  label: "Re-voice pending",
                  disabled: !f.revoiceApi || t(ce) || t(on) === 0 || t(an),
                  title: t(ln),
                  onClick: t(cn)
                }, null, 8, ["disabled", "title", "onClick"]),
                i[14] || (i[14] = Y("div", { class: "divider" }, null, -1)),
                M(te, {
                  label: "Prev",
                  disabled: t(vn),
                  title: "Open the previous script in this act",
                  onClick: t(hn)
                }, null, 8, ["disabled", "onClick"]),
                M(te, {
                  label: "Next",
                  disabled: t(mn),
                  title: "Open the next script in this act",
                  onClick: t(yn)
                }, null, 8, ["disabled", "onClick"])
              ])
            ]),
            _: 1
          }),
          Y("div", {
            ref_key: "rowsContainerEl",
            ref: Ht,
            class: "rows-container list"
          }, [
            (ie(!0), ge(Te, null, $n(R.value, (u, q) => (ie(), ge("div", {
              key: u.__key,
              class: ke(["fl-line-row", { "row-enter": t(Ut) === u.__key, "row-playing": t(ce) ? t(It).get(q) === t(St) : t(Rt) === q }]),
              "data-row-index": q,
              ref_for: !0,
              ref: (X) => t(Vt)(u.__key, X)
            }, [
              Y("div", {
                class: "line-rail",
                style: ft(u.malformed ? {} : { backgroundColor: t(Gn)(u.speaker) }),
                title: "Drag onto another line to merge them",
                ref_for: !0,
                ref: (X) => t(Nt)(X, q)
              }, [
                Y("span", bs, qe(q + 1), 1),
                i[15] || (i[15] = Y("i", { class: "pi pi-arrows-v" }, null, -1))
              ], 4),
              Y("div", Ss, [
                u.malformed ? (ie(), ge(Te, { key: 0 }, [
                  Y("div", _s, [
                    i[16] || (i[16] = Y("div", { class: "malformed-warn text-warning" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                    M(te, {
                      icon: "pi pi-trash",
                      title: "Delete this line",
                      onClick: (X) => t(it)(q, u.raw)
                    }, null, 8, ["onClick"])
                  ]),
                  M(Be, {
                    modelValue: u.raw,
                    "onUpdate:modelValue": [
                      (X) => u.raw = X,
                      i[7] || (i[7] = (X) => t(Fe)())
                    ],
                    "auto-resize": "",
                    class: "fl-textarea malformed-textarea",
                    style: ft({ fontSize: `${t(r)}px` }),
                    rows: "1",
                    ref_for: !0,
                    ref: (X) => t(b)(u.__key, X),
                    onKeydown: i[8] || (i[8] = An(Ge(() => {
                    }, ["prevent"]), ["enter"]))
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
                ], 64)) : (ie(), Qe(Kn, {
                  key: 1,
                  row: u,
                  index: q
                }, {
                  leading: he(() => [
                    Y("span", {
                      class: ke(["play-btn", { "is-playing": t(nt)(q), disabled: !t(st)(q, u) }]),
                      title: t(st)(q, u) ? t(ce) ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                      onClick: (X) => t($t)(u, q)
                    }, qe(t(nt)(q) ? "⏸" : "▶"), 11, Cs)
                  ]),
                  trailing: he(() => [
                    M(dt, { class: "speaker-file-group shrink-0" }, {
                      default: he(() => {
                        var X;
                        return [
                          f.revoiceApi && !t(ce) ? (ie(), Qe(te, {
                            key: 0,
                            class: ke(["revoice-btn", { pending: t(Re).has(u), stale: !t(Re).has(u) && t(W)(q) && !t(ee)(u, q) }]),
                            icon: t(Re).has(u) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                            disabled: t(Re).has(u),
                            title: t(rn)(u, q),
                            onClick: (ze) => t(un)(u, q)
                          }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : Je("", !0),
                          M(ye, {
                            "model-value": ((X = t(fe)(u)) == null ? void 0 : X.speaker) || "",
                            placeholder: "(no speaker)",
                            class: "speaker-file-input",
                            disabled: !t(fe)(u),
                            title: t(Yt)(u),
                            "onUpdate:modelValue": (ze) => t(Xt)(u, ze)
                          }, null, 8, ["model-value", "disabled", "title", "onUpdate:modelValue"]),
                          M(te, {
                            icon: "pi pi-microphone",
                            disabled: !t(fe)(u),
                            title: "Pick a speaker from the preset gallery",
                            onClick: (ze) => t(Wt)(u)
                          }, null, 8, ["disabled", "onClick"])
                        ];
                      }),
                      _: 2
                    }, 1024),
                    M(dt, { class: "pause-group shrink-0" }, {
                      default: he(() => [
                        M(Sn, null, {
                          default: he(() => [
                            Y("i", {
                              class: ke(t(rt)(u) ? "pi pi-exclamation-triangle text-warning" : "pi pi-stopwatch")
                            }, null, 2)
                          ]),
                          _: 2
                        }, 1024),
                        M(ye, {
                          modelValue: u.pause,
                          "onUpdate:modelValue": [
                            (X) => u.pause = X,
                            i[9] || (i[9] = (X) => t(Fe)())
                          ],
                          class: ke(["pause-input", { "p-invalid": t(rt)(u) }]),
                          placeholder: String(t(dn)(q)),
                          title: t(pn)(u, q)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "class", "placeholder", "title"])
                      ]),
                      _: 2
                    }, 1024),
                    i[17] || (i[17] = Y("div", { class: "spacer" }, null, -1)),
                    M(te, {
                      icon: "pi pi-history",
                      label: t(lt).get(t(C).get(q)) ? String(t(lt).get(t(C).get(q))) : "",
                      title: "Line history (previous takes/versions)",
                      onClick: (X) => t(nn)(u, q)
                    }, null, 8, ["label", "onClick"]),
                    M(te, {
                      icon: "pi pi-times",
                      color: "red",
                      title: "Delete this line",
                      onClick: (X) => t(it)(q, u.text)
                    }, null, 8, ["onClick"])
                  ]),
                  _: 2
                }, 1032, ["row", "index"]))
              ])
            ], 10, ws))), 128))
          ], 512)
        ]),
        M(_n),
        M(Wn, {
          visible: t(Me),
          "onUpdate:visible": i[10] || (i[10] = (u) => Ke(Me) ? Me.value = u : null),
          categories: t(K),
          onSelect: t(zt)
        }, null, 8, ["visible", "categories", "onSelect"]),
        M(Qn, {
          visible: t(He),
          "onUpdate:visible": i[11] || (i[11] = (u) => Ke(He) ? He.value = u : null),
          presets: t(pe),
          "sample-dir": t(le),
          "usage-for": v.speakerUsageSubLabel,
          onSelect: t(Qt)
        }, null, 8, ["visible", "presets", "sample-dir", "usage-for", "onSelect"]),
        M(Xn, {
          visible: t(Ue),
          "onUpdate:visible": i[12] || (i[12] = (u) => Ke(Ue) ? Ue.value = u : null),
          versions: t(Zt),
          "chosen-version": t(en),
          original: "",
          onSelect: t(sn)
        }, null, 8, ["visible", "versions", "chosen-version", "onSelect"]),
        M(Yn, {
          visible: t(Ve).visible,
          left: t(Ve).left,
          top: t(Ve).top,
          message: t(ct).message,
          fields: t(ct).fields
        }, null, 8, ["visible", "left", "top", "message", "fields"])
      ], 64);
    };
  }
}, Ts = /* @__PURE__ */ ht(Rs, [["__scopeId", "data-v-c01d6eeb"]]), $s = {
  __name: "LineEditorApp",
  props: {
    folder: { type: String, required: !0 },
    filename: { type: String, required: !0 },
    suffix: { type: String, default: "" },
    checkedApi: { type: Object, default: null },
    revoiceApi: { type: Object, default: null },
    onClose: { type: Function, required: !0 }
  },
  setup(f) {
    const s = f, l = y(!0);
    return Se(l, (h) => {
      h || s.onClose();
    }), (h, R) => {
      const L = me("Dialog");
      return ie(), Qe(L, {
        visible: l.value,
        "onUpdate:visible": R[0] || (R[0] = (o) => l.value = o),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: { width: "1600px" },
        class: "line-editor-dialog"
      }, {
        default: he(() => [
          M(Ts, Ln(Fn(h.$props)), null, 16)
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, As = /* @__PURE__ */ ht($s, [["__scopeId", "data-v-31dedee2"]]);
function na({ folder: f, filename: s, suffix: l = "", checkedApi: h, revoiceApi: R }) {
  Dn(import.meta.url);
  const L = document.createElement("div");
  document.body.appendChild(L);
  const o = On(As, {
    folder: f,
    filename: s,
    suffix: l,
    checkedApi: h || null,
    revoiceApi: R || null,
    onClose: () => {
      o.unmount(), L.remove();
    }
  });
  o.use(Nn, { ripple: !0 }), jn(o), o.use(ss), o.mount(L);
}
export {
  na as openLineEditor
};
