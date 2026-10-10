import { z as In, C as ft, A as Ee, m as V, B as Ye, l as y, S as oe, D as We, E as xe, p as pe, G as ke, H as mt, I as Pn, J as Rn, K as ht, _ as yt, w as Se, o as Tn, L as $n, r as de, a as ie, c as ye, d as te, b as N, u as t, g as he, n as ge, t as qe, F as $e, i as Je, M as Ge, j as An, k as vt, e as xn, f as Qe, N as Ke, O as En, Q as Ln, q as Dn, s as Fn, v as On, x as Nn, P as jn, y as Mn } from "./styles_link.js";
import { u as Hn, a as Un, D as Vn } from "./DialogHeader.js";
import { l as Xe, h as Bn, m as zn, s as qn, a as Jn, S as Gn, b as Kn, L as Wn, I as Qn, c as Xn, d as Yn, _ as Zn, u as es, i as ts, e as ns } from "./instruct_library.js";
var gt = Symbol();
function ss() {
  var f = In(gt);
  if (!f)
    throw new Error("No PrimeVue Confirmation provided!");
  return f;
}
var as = {
  install: function(s) {
    var i = {
      require: function(R) {
        ft.emit("confirm", R);
      },
      close: function() {
        ft.emit("close");
      }
    };
    s.config.globalProperties.$confirm = i, s.provide(gt, i);
  }
};
let os = 1;
function _e(f) {
  return { ...f, __key: os++ };
}
function kt(f) {
  const s = f.split("|");
  return s.length !== 3 && s.length !== 4 ? null : {
    speaker: s[0].trim(),
    instruct: s[1].trim(),
    text: s[2].trim(),
    pause: s.length === 4 ? s[3].trim() : ""
  };
}
function wt(f) {
  return f.split(`
`).map((s) => s.replace(/\r$/, "")).filter((s) => s.trim()).map((s) => {
    const i = kt(s);
    return _e(i ? { ...i, raw: s, malformed: !1 } : { raw: s, malformed: !0 });
  });
}
function bt(f) {
  return f.map((s) => {
    if (s.malformed) return s.raw;
    const i = `${s.speaker} | ${s.instruct} | ${s.text}`;
    return s.pause ? `${i} | ${s.pause}` : i;
  }).join(`
`);
}
function is(f) {
  const { rows: s, linesDirPath: i } = f, h = y(/* @__PURE__ */ new Set()), R = y({});
  async function L() {
    try {
      const g = await (await fetch(`${Ye}?path=${encodeURIComponent(i.value)}`)).json();
      h.value = new Set(Array.isArray(g.files) ? g.files : []), R.value = g.file_mtimes || {};
    } catch {
    }
  }
  const o = V(() => {
    const l = /* @__PURE__ */ new Map();
    let g = 0;
    return s.value.forEach((k, T) => {
      k.malformed || (l.set(T, g), g++);
    }), l;
  });
  function H(l) {
    const g = o.value.get(l);
    return g === void 0 ? null : zn(h.value, R.value, g);
  }
  function x(l) {
    return H(l) !== null;
  }
  const A = Ee(/* @__PURE__ */ new Map()), M = /* @__PURE__ */ new Map(), z = 150;
  function B(l, g) {
    const k = o.value.get(g);
    if (k === void 0) return !1;
    const T = A.get(l.__key);
    return T !== void 0 && Bn(h.value, k, T);
  }
  function Q(l) {
    l.malformed || (clearTimeout(M.get(l.__key)), M.set(l.__key, setTimeout(async () => {
      M.delete(l.__key);
      const g = f.resolvedSpeakerForHash(l.speaker);
      A.set(l.__key, await Xe(g, l.instruct, l.text));
    }, z)));
  }
  async function j() {
    const l = s.value.filter((k) => !k.malformed), g = await Promise.all(
      l.map(
        (k) => Xe(f.resolvedSpeakerForHash(k.speaker), k.instruct, k.text)
      )
    );
    l.forEach((k, T) => A.set(k.__key, g[T]));
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
    rowHashDebounce: M,
    ROW_HASH_DEBOUNCE_MS: z,
    updateRowHash: Q,
    recomputeAllHashes: j
  };
}
function ls(f) {
  const {
    props: s,
    rows: i,
    filename: h,
    selectChecked: R,
    confirmAsync: L,
    setStatus: o,
    audioFolder: H,
    audioBaseName: x,
    linesDirPath: A,
    loadLineFiles: M,
    latestFileFor: z,
    rowHasAnyTake: B,
    rowIsFresh: Q,
    expectedHash: j,
    rowEls: l,
    rawTimingLines: g,
    lastTimingMtime: k,
    lastAudioFingerprint: T
  } = f, b = y(-1), F = y(null), I = y(!1), U = y(-1);
  let e = null;
  const n = y([]), a = Ee({ checking: !0, best: null, mtime: null, error: null });
  async function c({ silent: S = !1 } = {}) {
    const D = pe(pe(H.value, "timing"), `${x.value}.json`);
    try {
      const C = await (await fetch(`${ke}/read?path=${encodeURIComponent(D)}`)).json();
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
      g.value = Array.isArray(W.lines) ? W.lines : null, O && M(), xe(_);
    } catch {
    }
  }
  function d(S, D) {
    if (!Array.isArray(S) || !S.length) return null;
    const P = [];
    return D.forEach((C, O) => {
      C.malformed || P.push(O);
    }), P.length !== S.length ? null : { lines: S, rowIndexMap: P };
  }
  const w = V(
    () => E.value ? d(g.value, i.value) : null
  ), p = V(() => {
    const S = /* @__PURE__ */ new Map();
    return w.value && w.value.rowIndexMap.forEach((D, P) => S.set(D, P)), S;
  }), G = V(
    () => !!(E.value && g.value && g.value.length && !w.value)
  );
  function _() {
    var C;
    const S = F.value;
    if (!w.value || !S) {
      b.value = -1;
      return;
    }
    const D = S.currentTime;
    let P = -1;
    for (let O = 0; O < w.value.lines.length; O++)
      if (D >= w.value.lines[O].start && D < w.value.lines[O].end) {
        P = O;
        break;
      }
    if (P !== b.value && (b.value = P, P >= 0 && I.value)) {
      const O = w.value.rowIndexMap[P], W = O !== void 0 ? l.get((C = i.value[O]) == null ? void 0 : C.__key) : null;
      W == null || W.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  function K() {
    e && (e.pause(), e.src = "", e = null), U.value = -1;
  }
  function Y(S) {
    K();
    const D = A.value, P = (C) => {
      var Z, ae;
      let O = null;
      for (; C < i.value.length && !(!i.value[C].malformed && (O = z(C), O)); )
        C++;
      if (C >= i.value.length || !O) {
        U.value = -1;
        return;
      }
      U.value = C, (ae = l.get((Z = i.value[C]) == null ? void 0 : Z.__key)) == null || ae.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const W = new Audio(
        `${oe}/audio?path=${encodeURIComponent(pe(D, O))}&v=${Date.now()}`
      );
      e = W, W.addEventListener("ended", () => P(C + 1)), W.play().catch((we) => o(`Playback failed: ${we}`));
    };
    P(S);
  }
  function J(S) {
    return E.value ? b.value === p.value.get(S) && I.value : U.value === S;
  }
  function se(S, D) {
    return E.value ? p.value.get(S) !== void 0 : B(S);
  }
  function fe(S, D) {
    if (se(D))
      if (E.value) {
        const P = p.value.get(D), C = F.value;
        if (P === void 0 || !C || !w.value) return;
        C.currentTime = w.value.lines[P].start, C.play();
      } else U.value === D ? K() : Y(D);
  }
  const le = V(
    () => E.value ? I.value : U.value !== -1
  ), re = V(
    () => E.value ? !!a.best : i.value.some((S, D) => !S.malformed && B(D))
  ), Ce = V(() => re.value ? le.value ? "Pause" : E.value ? "Play the full rendered file" : "Play every voiced line in sequence" : "Not voiced yet -- nothing to play");
  function ve() {
    if (re.value)
      if (E.value) {
        const S = F.value;
        if (!S) return;
        I.value ? S.pause() : S.play();
      } else U.value !== -1 ? K() : Y(0);
  }
  async function me({ silent: S = !1 } = {}) {
    S || (a.checking = !0);
    try {
      const P = await (await fetch(`${Ye}?path=${encodeURIComponent(H.value)}`)).json(), C = Array.isArray(P.files) ? P.files : [], O = P.file_mtimes || {}, W = x.value.toLowerCase(), Z = C.filter((Ie) => {
        const Pe = Ie.lastIndexOf(".");
        return (Pe > 0 ? Ie.slice(0, Pe) : Ie).toLowerCase().startsWith(W);
      });
      Z.sort();
      const ae = Z.length ? Z[Z.length - 1] : null, we = ae ? `${ae}::${O[ae] || ""}` : null;
      if (S && we === T.value) return;
      T.value = we, a.checking = !1, a.error = null, a.best = ae, a.mtime = ae ? O[ae] || Date.now() : null, ae || (I.value = !1, xe(_));
    } catch (D) {
      a.checking = !1, a.error = String(D);
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
        o(`Deleted ${P.deleted.length} audio file(s)`), n.value = n.value.filter((C) => C !== h.value), T.value = null, me();
      } catch (D) {
        o(`Error: ${D}`);
      }
  }
  const E = V(() => n.value.includes(h.value)), ne = V(() => {
    const S = [];
    return i.value.forEach((D, P) => {
      D.malformed || S.push(P);
    }), S.length > 0 && S.every((D) => Q(i.value[D], D));
  }), ue = V(() => !E.value && !ne.value), Le = V(() => E.value ? "Marked ready to release -- click to unmark and go back to editing" : ne.value ? "Stitch every line into the final file and mark this script done / ready to release" : "Every line needs to be voiced first");
  async function De() {
    var P;
    const S = !E.value;
    if (S && !ne.value) {
      o("Every line needs to be voiced before marking done");
      return;
    }
    if (S) {
      o("Stitching final file...");
      const C = i.value.filter((O) => !O.malformed);
      try {
        const W = await (await fetch(`${oe}/stitch_lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: s.folder,
            base_name: x.value,
            line_hashes: C.map((Z) => j.get(Z.__key)),
            line_texts: C.map((Z) => Z.text),
            pauses: C.map((Z) => We(Z.pause))
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
      n.value = [.../* @__PURE__ */ new Set([...n.value, h.value])], (P = s.checkedApi) == null || P.setChecked(h.value, !1), R.value = !1, o("Stitched and marked done"), T.value = null, k.value = null, me(), c();
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
        n.value = n.value.filter((W) => W !== h.value), o("Unmarked -- can be edited/re-voiced again"), T.value = null, me();
      } catch (C) {
        o(`Error: ${C}`);
      }
  }
  return {
    rawTimingLines: g,
    activeTimingIdx: b,
    lastTimingMtime: k,
    audioElRef: F,
    loadTiming: c,
    computeLineTiming: d,
    lineTiming: w,
    currentRowToTimingIdx: p,
    timingWarningVisible: G,
    syncActiveLine: _,
    audioIsPlaying: I,
    mode1PlayingIdx: U,
    stopMode1Playback: K,
    playRowSequential: Y,
    isRowPlaying: J,
    canPlayRow: se,
    onPlayClick: fe,
    isPlayingAnything: le,
    canPlayGlobal: re,
    globalPlayTitle: Ce,
    toggleGlobalPlayback: ve,
    readyScripts: n,
    audioState: a,
    lastAudioFingerprint: T,
    loadAudio: me,
    deleteAudioDisabled: m,
    deleteAudio: $,
    isCurrentlyReady: E,
    allRowsVoiced: ne,
    doneDisabled: ue,
    doneTitle: Le,
    toggleDone: De
  };
}
function rs(f) {
  const {
    props: s,
    filename: i,
    setStatus: h,
    lastAudioFingerprint: R,
    lastTimingMtime: L
  } = f, o = y([]), H = y(null), x = y([]), A = y(null), M = y([]), z = y(""), B = y([]), Q = V(() => {
    const e = /* @__PURE__ */ new Map();
    for (const n of x.value) e.set(n.code, n);
    return e;
  });
  function j(e) {
    return Q.value.get(e.speaker);
  }
  function l(e) {
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
      const n = await (await fetch(`${ke}/write`, {
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
  async function F(e) {
    var c, d;
    if (!A.value) return;
    const n = Pn(A.value), a = await Rn(n, e, s.suffix);
    h(a.message), a.changed.some((w) => w.file === i.value) && (await U(), R && (R.value = null), L && (L.value = null), (c = f.loadAudio) == null || c.call(f), (d = f.loadTiming) == null || d.call(f));
  }
  async function I() {
    try {
      const n = await (await fetch(mt)).json();
      M.value = n.presets || [], z.value = n.dir || "";
    } catch {
      M.value = [], z.value = "";
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
    presets: M,
    speakerSampleDir: z,
    scriptList: B,
    roleEntryByCode: Q,
    roleEntryFor: j,
    resolveSpeakerFile: l,
    resolvedSpeakerForHash: g,
    speakerUsageIndex: k,
    roleOptionSubLabel: T,
    saveRolesJson: b,
    notifyRoleSpeakerChanged: F,
    loadPresets: I,
    loadCatalog: U
  };
}
function us(f) {
  const {
    props: s,
    filename: i,
    rows: h,
    selectChecked: R,
    fullPath: L,
    setStatus: o,
    rawTimingLines: H,
    lastTimingMtime: x,
    lastAudioFingerprint: A,
    recomputeAllHashes: M,
    loadAudio: z,
    loadTiming: B,
    SAVE_DEBOUNCE_MS: Q,
    EDIT_QUIET_MS: j
  } = f, l = y(null), g = y(0), k = y(null), T = y(!1), b = y(null), F = y(null), I = y(null);
  function U() {
    g.value = Date.now(), k.value && clearTimeout(k.value), k.value = setTimeout(e, Q);
  }
  async function e() {
    const d = bt(h.value);
    if (d !== l.value)
      try {
        const p = await (await fetch(`${ke}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: L.value, content: d })
        })).json();
        if (p.error) {
          o(`Save error: ${p.error}`);
          return;
        }
        l.value = d, o(`Saved ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`);
      } catch (w) {
        o(`Save failed: ${w}`);
      }
  }
  async function n({ isPoll: d = !1 } = {}) {
    try {
      const p = await (await fetch(`${ke}/read?path=${encodeURIComponent(L.value)}`)).json();
      if (p.error) {
        o(`Read error: ${p.error}`);
        return;
      }
      if (!p.exists) {
        d || (h.value = [], l.value = "", o("File does not exist yet (will be created on first edit)"));
        return;
      }
      if (d && Date.now() - g.value < j || p.content === l.value) return;
      h.value = wt(p.content), l.value = p.content, M(), d || o(`Loaded ${h.value.length} line(s)`);
    } catch (w) {
      o(`Read failed: ${w}`);
    }
  }
  async function a(d) {
    !d || d === i.value || T.value || (k.value && (clearTimeout(k.value), k.value = null, await e()), i.value = d, A.value = null, H.value = null, x.value = null, h.value = [], l.value = null, g.value = 0, R.value = s.checkedApi ? s.checkedApi.isChecked(d) : !1, o("Loading..."), await n(), z(), B());
  }
  function c() {
    T.value || (T.value = !0, k.value && (clearTimeout(k.value), e()), b.value && clearInterval(b.value), F.value && clearInterval(F.value), I.value && clearInterval(I.value), s.onClose());
  }
  return {
    // состояние
    lastSavedText: l,
    lastLocalEditAt: g,
    saveTimer: k,
    pollTimer: b,
    audioPollTimer: F,
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
function cs(f) {
  const {
    props: s,
    rows: i,
    audioBaseName: h,
    setStatus: R,
    confirmAsync: L,
    positionByIndex: o,
    updateRowHash: H,
    loadLineFiles: x,
    scheduleSave: A
  } = f, M = /* @__PURE__ */ new Map(), z = y(null), B = y(null);
  function Q(e, n) {
    if (!n) {
      M.delete(e);
      return;
    }
    M.set(e, n);
  }
  async function j(e) {
    var a;
    B.value = e, await xe();
    const n = M.get(e);
    n == null || n.scrollIntoView({ behavior: "smooth", block: "nearest" }), (a = n == null ? void 0 : n.querySelector(".fl-input")) == null || a.focus(), setTimeout(() => {
      B.value === e && (B.value = null);
    }, 500);
  }
  let l = null;
  async function g(e, n) {
    const a = i.value[e], c = i.value[n];
    if (!a || !c || a.malformed || c.malformed) return;
    const d = Math.min(e, n), w = Math.max(e, n), p = i.value[d], G = i.value[w];
    if ((p.speaker || "").trim() !== (G.speaker || "").trim() && !await L({
      title: "Merge lines with different speakers?",
      message: `"${p.speaker}" and "${G.speaker}" are different speakers. Merge anyway? The combined line keeps "${p.speaker}".`,
      okText: "Merge",
      cancelText: "Cancel"
    }))
      return;
    const _ = o.value.get(w), K = o.value.size;
    if (p.text = `${p.text} ${G.text}`.trim(), p.pause = G.pause || "", i.value.splice(w, 1), H(p), A(), _ !== void 0) {
      const Y = [];
      for (let J = _ + 1; J < K; J++) Y.push([J, J - 1]);
      U({ deletes: [_], moves: Y });
    }
  }
  function k(e, n) {
    !e || e.__flDragAttached || (e.__flDragAttached = !0, e.addEventListener("pointerdown", (a) => {
      if (a.button !== 0) return;
      a.preventDefault();
      const c = e.closest(".fl-line-row");
      l = Number(c == null ? void 0 : c.dataset.rowIndex), c == null || c.classList.add("fl-row-dragging");
      const d = (p) => {
        var K;
        (K = z.value) == null || K.querySelectorAll(".fl-row-drop-target").forEach((Y) => Y.classList.remove("fl-row-drop-target"));
        const G = document.elementFromPoint(p.clientX, p.clientY), _ = G && G.closest ? G.closest(".fl-line-row") : null;
        _ && _ !== c && _.classList.add("fl-row-drop-target");
      }, w = (p) => {
        var Y;
        document.removeEventListener("pointermove", d), document.removeEventListener("pointerup", w), document.removeEventListener("pointercancel", w);
        const G = document.elementFromPoint(p.clientX, p.clientY), _ = G && G.closest ? G.closest(".fl-line-row") : null, K = l;
        if (l = null, c == null || c.classList.remove("fl-row-dragging"), (Y = z.value) == null || Y.querySelectorAll(".fl-row-drop-target").forEach((J) => J.classList.remove("fl-row-drop-target")), _ && _ !== c) {
          const J = Number(_.dataset.rowIndex);
          Number.isNaN(J) || g(K, J);
        }
      };
      document.addEventListener("pointermove", d), document.addEventListener("pointerup", w), document.addEventListener("pointercancel", w);
    }));
  }
  function T(e) {
    const n = o.value.get(e), a = o.value.size;
    if (i.value.splice(e, 1), A(), n !== void 0) {
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
  function F() {
    const e = document.activeElement;
    if (!e || e.tagName !== "TEXTAREA" || !e.classList.contains("fl-textarea")) {
      R("Click into a line's text first, place the cursor where it should split");
      return;
    }
    const n = e.closest(".fl-line-row"), a = n ? Number(n.dataset.rowIndex) : -1, c = a >= 0 ? i.value[a] : null;
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
    if (c.pause = "", i.value.splice(a + 1, 0, K), H(c), H(K), j(K.__key), A(), d !== void 0) {
      const Y = d + 1, J = [];
      for (let se = w - 1; se >= Y; se--) J.push([se, se + 1]);
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
    i.value.push(e), H(e), j(e.__key), A();
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
    rowEls: M,
    rowsContainerEl: z,
    justAddedKey: B,
    setRowRef: Q,
    focusNewRow: j,
    // операции
    mergeRows: g,
    attachDragHandlers: k,
    deleteRow: T,
    confirmDeleteRow: b,
    splitFocusedLine: F,
    addLine: I,
    reorganizeLines: U
  };
}
function ds(f) {
  const {
    props: s,
    rows: i,
    audioBaseName: h,
    positionByIndex: R,
    setStatus: L,
    updateRowHash: o,
    recomputeAllHashes: H,
    loadLineFiles: x,
    scheduleSave: A,
    roleEntryFor: M,
    resolveSpeakerFile: z,
    saveRolesJson: B,
    notifyRoleSpeakerChanged: Q,
    instructCategories: j,
    instructCategoriesPath: l,
    SAVE_DEBOUNCE_MS: g
  } = f, k = y(!1), T = y(null);
  function b(m) {
    T.value = m, k.value = !0;
  }
  function F(m) {
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
    for (const $ of j.value)
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
      const $ = await qn(
        ke,
        l.value,
        m.instruct
      );
      $ && (j.value = $);
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
    const E = M(m);
    if (!E) return;
    E.speaker = $, H(), await B() && (L(`"${E.code}" now uses "${$}" for the whole play`), await Q(E.code));
  }
  function Y(m) {
    const $ = M(m), E = z(m.speaker);
    return $ ? `Change "${$.code}"'s speaker for the whole play (currently ${E || "unset"})` : E ? `"${m.speaker}" is a literal preset, not a role code -- edit it directly in the speaker field to change it` : "No speaker set on this line yet";
  }
  const J = y(!1), se = y(null), fe = y([]), le = y(null), re = Ee(/* @__PURE__ */ new Map());
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
  async function ve(m, $) {
    se.value = m;
    const E = R.value.get($);
    try {
      const ue = await (await fetch(
        `${oe}/line_history?folder=${encodeURIComponent(s.folder)}&base_name=${encodeURIComponent(h.value)}&position=${E}`
      )).json();
      fe.value = ue.versions || [], le.value = ue.chosen_version ?? null;
    } catch (ne) {
      console.error("[FL history] couldn't load line history", ne), fe.value = [], le.value = null;
    }
    J.value = !0;
  }
  async function me(m) {
    const $ = se.value;
    if (!$) return;
    const E = i.value.indexOf($), ne = R.value.get(E);
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
    onInstructPicked: F,
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
    speakerFileTitle: Y,
    // LineHistory
    historyVisible: J,
    historyRow: se,
    historyVersions: fe,
    historyChosenVersion: le,
    historyCounts: re,
    refreshHistoryCounts: Ce,
    openLineHistory: ve,
    onHistoryVersionChosen: me
  };
}
function ps(f) {
  const {
    props: s,
    rows: i,
    filename: h,
    audioBaseName: R,
    linesDirPath: L,
    setStatus: o,
    positionByIndex: H,
    rowHasAnyTake: x,
    rowIsFresh: A,
    lineFilesOnDisk: M,
    loadLineFiles: z,
    resolvedSpeakerForHash: B,
    refreshHistoryCounts: Q,
    flushSave: j
  } = f, l = Ee(/* @__PURE__ */ new Set()), g = y(!1), k = V(
    () => i.value.filter((e, n) => b(e, n)).length
  ), T = V(
    () => k.value > 0 ? `Re-voice ${k.value} line(s) whose text/speaker/instruct changed since they were last rendered (the gold 🔁 rows), one at a time` : "No line in this script needs re-voicing right now"
  );
  function b(e, n) {
    return !e.malformed && x(n) && !A(e, n);
  }
  function F(e, n) {
    return l.has(e) ? "Re-voicing..." : x(n) && !A(e, n) ? "Text/speaker/instruct changed since this line's audio was last rendered -- click to re-voice with the current content" : A(e, n) ? "Re-voice just this line (uses the currently open workflow)" : "Not voiced yet -- click to render just this line";
  }
  async function I(e, n) {
    if (!l.has(e)) {
      l.add(e), o("Re-voicing...");
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
        const c = H.value.get(n), d = Jn(c, a), w = M.value.has(d);
        console.log("[FL revoice] after render:", {
          position: c,
          expectedFile: d,
          foundOnDisk: w,
          linesDir: L.value,
          filesInDir: [...M.value]
        }), o(
          w ? "Line re-voiced" : `Re-voice finished but ${d} is not in ${L.value} -- see the console`
        );
      } catch (a) {
        o(`Re-voice failed: ${a.message || a}`);
      } finally {
        l.delete(e), j();
      }
    }
  }
  async function U() {
    if (g.value) return;
    const e = i.value.filter((n, a) => b(n, a));
    if (e.length) {
      g.value = !0;
      try {
        for (const n of e) {
          const a = i.value.indexOf(n);
          a !== -1 && await I(n, a);
        }
        o(`Re-voiced ${e.length} line(s)`);
      } finally {
        g.value = !1;
      }
    }
  }
  return {
    pendingRevoiceRows: l,
    isRevoicingStale: g,
    staleRowCount: k,
    revoiceStaleTitle: T,
    isRowStale: b,
    revoiceTitle: F,
    revoiceRow: I,
    revoiceStaleRows: U
  };
}
function fs(f) {
  const {
    rows: s,
    filename: i,
    setStatus: h,
    scriptList: R,
    updateRowHash: L,
    scheduleSave: o,
    switchToFile: H
  } = f, x = V(() => {
    let b = -1;
    return s.value.forEach((F, I) => {
      F.malformed || (b = I);
    }), b;
  });
  function A(b) {
    return b === x.value ? 0 : ht;
  }
  function M(b) {
    return !!b.pause && We(b.pause) === null;
  }
  function z(b, F) {
    const I = We(b.pause);
    return b.pause && I === null ? `"${b.pause}" isn't a pause this can read -- expected seconds between 0 and 10 (e.g. 1.5). Falling back to ${A(F)}s.` : I !== null ? I === 0 ? "No pause after this line -- the next one comes in on top of it (an interruption)" : `Hold ${I}s of silence after this line` : `Pause after this line, in seconds. Empty = ${A(F)}s` + (F === x.value ? " (nothing held after the last line)" : " (the default between lines)");
  }
  const B = V(() => {
    const b = /* @__PURE__ */ new Map();
    for (const F of s.value) {
      if (F.malformed) continue;
      const I = (F.speaker || "").trim();
      I && b.set(I, (b.get(I) || 0) + 1);
    }
    return b;
  });
  function Q(b) {
    const F = (b.speaker || "").trim();
    if (!F) return 0;
    const I = B.value.get(F) || 0;
    return I > 0 ? I - 1 : 0;
  }
  const j = V(() => R.value.indexOf(i.value)), l = V(() => !(j.value > 0)), g = V(
    () => !(j.value >= 0 && j.value < R.value.length - 1)
  );
  function k() {
    j.value > 0 && H(R.value[j.value - 1]);
  }
  function T() {
    j.value >= 0 && j.value < R.value.length - 1 && H(R.value[j.value + 1]);
  }
  return {
    lastRowIndex: x,
    pauseDefaultFor: A,
    pauseUnreadable: M,
    pauseTitle: z,
    roleCountByCode: B,
    sameRoleCount: Q,
    navIdx: j,
    prevDisabled: l,
    nextDisabled: g,
    goPrev: k,
    goNext: T
  };
}
const vs = { class: "fl-line-editor-content" }, ms = { class: "actions" }, hs = ["title"], ys = ["src"], gs = {
  key: 0,
  class: "timing-warning text-warning"
}, ks = { class: "actions" }, ws = ["checked", "disabled"], bs = ["data-row-index"], Ss = { class: "line-number" }, _s = { class: "line-body list" }, Cs = { class: "row" }, Is = ["title", "onClick"], Ps = 600, Ae = 3e3, Rs = 1500, Ts = {
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
    const s = f, i = y(!0), h = y(s.filename), R = y([]), L = y(""), o = y(s.checkedApi ? s.checkedApi.isChecked(s.filename) : !1), H = y(null), x = y(null), A = y(null), M = /* @__PURE__ */ new Map(), z = ss();
    function B({ title: v = "Confirm", message: r = "", okText: ee = "OK", cancelText: Te = "Cancel" } = {}) {
      return new Promise((be) => {
        z.require({
          header: v,
          message: r,
          acceptLabel: ee,
          rejectLabel: Te,
          accept: () => be(!0),
          reject: () => be(!1),
          onHide: () => be(!1)
        });
      });
    }
    const { setWidth: Q, presets: j } = Hn({
      storageKey: "FL_CosyVoice3.LineEditor.widthPx",
      defaultWidth: 1600,
      presets: [1280, 1600]
    }), { fontSizePx: l, decrease: g, increase: k } = Un({
      storageKey: "FL_CosyVoice3.LineEditor.textFontSizePx",
      defaultSize: 11.5
    }), { autoGrow: T, setTextareaRef: b, regrowAll: F } = es(), I = V(() => pe(s.folder, h.value)), U = V(() => pe(s.folder, "_audio")), e = V(() => En(h.value, s.suffix)), n = V(() => pe(pe(U.value, "lines"), e.value));
    function a(v) {
      L.value = v;
    }
    const c = y(null), d = y(null), w = y(null), p = y(null), G = y(!1), _ = {
      props: s,
      visible: i,
      filename: h,
      rows: R,
      status: L,
      selectChecked: o,
      parseLine: kt,
      parseScript: wt,
      serializeRows: bt,
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
      rowEls: M,
      SAVE_DEBOUNCE_MS: Ps,
      POLL_MS: Ae,
      EDIT_QUIET_MS: Rs,
      FILE_API: ke,
      SCAN_API: oe,
      BROWSE_API: Ye,
      PRESETS_API: mt,
      DEFAULT_LINE_GAP_S: ht
    };
    Object.assign(_, is(_)), Object.assign(_, ls(_)), Object.assign(_, rs(_)), Object.assign(_, us(_)), Object.assign(_, cs(_)), Object.assign(_, ds(_)), Object.assign(_, ps(_)), Object.assign(_, fs(_));
    const {
      // useLineCatalog
      instructCategories: K,
      instructCategoriesPath: Y,
      roleEntries: J,
      rolesJsonPath: se,
      presets: fe,
      speakerSampleDir: le,
      scriptList: re,
      roleEntryByCode: Ce,
      roleEntryFor: ve,
      resolveSpeakerFile: me,
      resolvedSpeakerForHash: m,
      speakerUsageIndex: $,
      roleOptionSubLabel: E,
      saveRolesJson: ne,
      notifyRoleSpeakerChanged: ue,
      loadPresets: Le,
      loadCatalog: De,
      // useLineFiles
      lineFilesOnDisk: S,
      lineFileMtimes: D,
      loadLineFiles: P,
      positionByIndex: C,
      latestFileFor: O,
      rowHasAnyTake: W,
      rowIsFresh: Z,
      expectedHash: ae,
      rowHashDebounce: we,
      ROW_HASH_DEBOUNCE_MS: Ie,
      updateRowHash: Pe,
      recomputeAllHashes: Ze,
      // useScriptIO
      lastSavedText: Es,
      lastLocalEditAt: Ls,
      scheduleSave: Fe,
      flushSave: Ds,
      loadFromDisk: et,
      switchToFile: Fs,
      close: St,
      // usePlayback
      activeTimingIdx: _t,
      audioElRef: Ct,
      loadTiming: tt,
      computeLineTiming: Os,
      lineTiming: It,
      currentRowToTimingIdx: Pt,
      timingWarningVisible: Rt,
      syncActiveLine: Oe,
      audioIsPlaying: Ne,
      mode1PlayingIdx: Tt,
      stopMode1Playback: $t,
      playRowSequential: Ns,
      isRowPlaying: nt,
      canPlayRow: st,
      onPlayClick: At,
      isPlayingAnything: at,
      canPlayGlobal: xt,
      globalPlayTitle: Et,
      toggleGlobalPlayback: ot,
      readyScripts: js,
      audioState: je,
      loadAudio: Me,
      deleteAudioDisabled: Lt,
      deleteAudio: Dt,
      isCurrentlyReady: ce,
      allRowsVoiced: Ms,
      doneDisabled: Ft,
      doneTitle: Ot,
      toggleDone: Nt,
      // useRowOps
      mergeRows: Hs,
      attachDragHandlers: jt,
      deleteRow: Us,
      confirmDeleteRow: it,
      splitFocusedLine: Mt,
      addLine: Ht,
      reorganizeLines: Vs,
      rowsContainerEl: Ut,
      justAddedKey: Vt,
      setRowRef: Bt,
      focusNewRow: Bs,
      // useDialogs
      instructPickerVisible: He,
      instructPickerRow: zs,
      openInstructPicker: zt,
      onInstructPicked: qt,
      undoInstructTitle: Jt,
      undoInstruct: Gt,
      instructCategoryByPhrase: qs,
      instructNoteFor: Kt,
      instructLibrarySaveDebounce: Js,
      scheduleInstructLibrarySave: Gs,
      onInstructInput: Wt,
      speakerPickerVisible: Ue,
      speakerPickerRow: Ks,
      openSpeakerPicker: Qt,
      onSpeakerPicked: Xt,
      onSpeakerFileRecast: Yt,
      speakerFileTitle: Zt,
      historyVisible: Ve,
      historyRow: Ws,
      historyVersions: en,
      historyChosenVersion: tn,
      historyCounts: lt,
      refreshHistoryCounts: nn,
      openLineHistory: sn,
      onHistoryVersionChosen: an,
      // useRevoice
      pendingRevoiceRows: Re,
      isRevoicingStale: on,
      staleRowCount: ln,
      revoiceStaleTitle: rn,
      isRowStale: Qs,
      revoiceTitle: un,
      revoiceRow: cn,
      revoiceStaleRows: dn,
      // useRowHelpers
      lastRowIndex: Xs,
      pauseDefaultFor: pn,
      pauseUnreadable: rt,
      pauseTitle: fn,
      roleCountByCode: Ys,
      sameRoleCount: ut,
      applyInstructToSameRole: vn,
      navIdx: Zs,
      prevDisabled: mn,
      nextDisabled: hn,
      goPrev: yn,
      goNext: gn
    } = _, {
      popover: Be,
      show: kn,
      hide: wn,
      info: ct
    } = ns(
      J,
      (v) => Object.entries(v).filter(
        ([, r]) => r !== "" && r !== null && r !== void 0 && r !== v.__key
      )
    );
    Ln("lineRowApi", {
      // общий каталог и UI
      roleEntries: J,
      roleOptionSubLabel: E,
      fontSizePx: l,
      autoGrow: T,
      setTextareaRef: b,
      showRoleInfoPopover: kn,
      hideRoleInfoPopover: wn,
      // подписи, специфичные для audiobook
      speakerPlaceholder: "Speaker",
      speakerTitle: "Speaker (role code, or a literal preset/preset#tag)",
      instructPlaceholder: "Instruct",
      instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
      textPlaceholder: "",
      // доступ к полям row
      getSpeaker: (v) => v.speaker,
      setSpeaker: (v, r) => {
        v.speaker = r, onSpeakerInput(v);
      },
      getInstruct: (v) => v.instruct,
      setInstruct: (v, r) => {
        v.instruct = r, Wt(v);
      },
      getText: (v) => v.text,
      setText: (v, r) => {
        v.text = r, Pe(v), Fe();
      },
      getRoleInfoCode: (v) => v.speaker,
      textKey: (v) => v.__key,
      // instruct-действия
      canUndoInstruct: (v) => v.__prevInstruct !== void 0,
      undoInstructTitle: (v) => Jt(v),
      undoInstruct: (v) => Gt(v),
      /*
       LineRowEditor.vue calls these two WITHOUT optional chaining (its lines
       112-113, unlike the audio-url pair just below them), so omitting them here
       crashed the editor outright: "api.canApplyInstruct is not a function".
       VO Dub's useVoDubRowApi.js supplied both and this side did not -- the two
       implementations of one shared contract had drifted apart.
      */
      canApplyInstruct: (v) => ut(v) > 0,
      applyInstructTitle: (v) => {
        const r = ut(v);
        return r > 0 ? `Apply this instruct to every other "${(v.speaker || "").trim()}" row in this script (${r})` : "No other rows in this script use this role";
      },
      applyInstructToSameRole: (v) => vn(v),
      instructNoteFor: (v) => Kt(v),
      openInstructPicker: (v) => zt(v)
    });
    function bn(v) {
      var r;
      (r = s.checkedApi) == null || r.setChecked(h.value, v);
    }
    function Sn() {
      ts(a);
    }
    return Se(J, Ze), Se(i, (v) => {
      v || St();
    }), Se(It, () => xe(Oe)), Se(l, F), Tn(() => {
      De(), Le(), Me(), P(), nn(), w.value = setInterval(() => {
        Me({ silent: !0 }), P();
      }, Ae), et().then(() => {
        d.value = setInterval(() => et({ isPoll: !0 }), Ae), tt(), p.value = setInterval(() => tt({ silent: !0 }), Ae);
      });
    }), $n(() => {
      $t(), d.value && clearInterval(d.value), w.value && clearInterval(w.value), p.value && clearInterval(p.value);
    }), (v, r) => {
      const ee = de("Button"), Te = de("Divider"), be = de("Textarea"), dt = de("InputText"), pt = de("InputGroup"), _n = de("InputGroupAddon"), Cn = de("ConfirmDialog");
      return ie(), ye($e, null, [
        te("div", vs, [
          N(Vn, {
            title: h.value,
            status: L.value,
            "width-presets": t(j),
            "set-width": t(Q),
            "font-size-decrease": t(g),
            "font-size-increase": t(k)
          }, null, 8, ["title", "status", "width-presets", "set-width", "font-size-decrease", "font-size-increase"]),
          N(Gn, { class: "line-editor-controls" }, {
            default: he(() => [
              te("div", ms, [
                te("span", {
                  class: ge(["play-btn global-play-btn", { "is-playing": t(at), disabled: !t(xt) }]),
                  title: t(Et),
                  onClick: r[0] || (r[0] = (...u) => t(ot) && t(ot)(...u))
                }, qe(t(at) ? "⏸" : "▶"), 11, hs),
                t(je).best ? (ie(), ye($e, { key: 0 }, [
                  te("audio", {
                    ref_key: "audioElRef",
                    ref: Ct,
                    controls: "",
                    class: "audio-el",
                    src: `${t(oe)}/audio?path=${encodeURIComponent(t(pe)(U.value, t(je).best))}&v=${encodeURIComponent(t(je).mtime || "")}`,
                    onTimeupdate: r[1] || (r[1] = (...u) => t(Oe) && t(Oe)(...u)),
                    onPlay: r[2] || (r[2] = (u) => Ne.value = !0),
                    onPause: r[3] || (r[3] = (u) => Ne.value = !1),
                    onEnded: r[4] || (r[4] = (u) => Ne.value = !1)
                  }, null, 40, ys),
                  N(ee, {
                    label: "Delete audio",
                    disabled: t(Lt),
                    title: t(ce) ? "Delete the final file -- this also un-marks the script as done" : "Delete the rendered audio for this script",
                    onClick: t(Dt),
                    icon: "pi pi-times-circle"
                  }, null, 8, ["disabled", "title", "onClick"])
                ], 64)) : Je("", !0),
                N(ee, {
                  icon: "pi pi-refresh",
                  title: "Re-check _audio\\ for this script's rendered audio",
                  onClick: r[5] || (r[5] = (u) => t(Me)())
                })
              ]),
              t(Rt) ? (ie(), ye("div", gs, "⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер")) : Je("", !0),
              te("div", ks, [
                te("input", {
                  type: "checkbox",
                  class: "row-checkbox",
                  checked: o.value,
                  disabled: !f.checkedApi || t(ce),
                  title: "Mark this script as checked for queueing (Script Library's tree)",
                  onChange: r[6] || (r[6] = (u) => {
                    o.value = u.target.checked, bn(u.target.checked);
                  })
                }, null, 40, ws),
                N(ee, {
                  label: t(ce) ? "Done ✓" : "Done",
                  outlined: !t(ce),
                  disabled: t(Ft),
                  title: t(Ot),
                  onClick: t(Nt)
                }, null, 8, ["label", "outlined", "disabled", "title", "onClick"]),
                N(Te, { layout: "vertical" }),
                N(ee, {
                  label: "´ Stress mark",
                  title: "Insert a stress mark at the cursor",
                  onMousedown: Ge(Sn, ["prevent"])
                }),
                N(ee, {
                  label: "✂ Split line",
                  title: "Split this line into two at the cursor",
                  onMousedown: Ge(t(Mt), ["prevent"])
                }, null, 8, ["onMousedown"]),
                N(ee, {
                  label: "+ Add line",
                  title: "Add a new empty line at the end of the script",
                  onClick: t(Ht)
                }, null, 8, ["onClick"]),
                N(ee, {
                  label: "Re-voice pending",
                  disabled: !f.revoiceApi || t(ce) || t(ln) === 0 || t(on),
                  title: t(rn),
                  onClick: t(dn)
                }, null, 8, ["disabled", "title", "onClick"]),
                N(Te, { layout: "vertical" }),
                N(ee, {
                  label: "Prev",
                  disabled: t(mn),
                  title: "Open the previous script in this act",
                  onClick: t(yn)
                }, null, 8, ["disabled", "onClick"]),
                N(ee, {
                  label: "Next",
                  disabled: t(hn),
                  title: "Open the next script in this act",
                  onClick: t(gn)
                }, null, 8, ["disabled", "onClick"])
              ])
            ]),
            _: 1
          }),
          te("div", {
            ref_key: "rowsContainerEl",
            ref: Ut,
            class: "rows-container list"
          }, [
            (ie(!0), ye($e, null, An(R.value, (u, q) => (ie(), ye("div", {
              key: u.__key,
              class: ge(["fl-line-row", { "row-enter": t(Vt) === u.__key, "row-playing": t(ce) ? t(Pt).get(q) === t(_t) : t(Tt) === q }]),
              "data-row-index": q,
              ref_for: !0,
              ref: (X) => t(Bt)(u.__key, X)
            }, [
              te("div", {
                class: "line-rail",
                style: vt(u.malformed ? {} : { backgroundColor: t(Kn)(u.speaker) }),
                title: "Drag onto another line to merge them",
                ref_for: !0,
                ref: (X) => t(jt)(X, q)
              }, [
                te("span", Ss, qe(q + 1), 1),
                r[13] || (r[13] = te("i", { class: "pi pi-arrows-v" }, null, -1))
              ], 4),
              te("div", _s, [
                u.malformed ? (ie(), ye($e, { key: 0 }, [
                  te("div", Cs, [
                    r[14] || (r[14] = te("div", { class: "malformed-warn text-warning" }, "⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:", -1)),
                    N(ee, {
                      icon: "pi pi-trash",
                      title: "Delete this line",
                      onClick: (X) => t(it)(q, u.raw)
                    }, null, 8, ["onClick"])
                  ]),
                  N(be, {
                    modelValue: u.raw,
                    "onUpdate:modelValue": [
                      (X) => u.raw = X,
                      r[7] || (r[7] = (X) => t(Fe)())
                    ],
                    "auto-resize": "",
                    class: "fl-textarea malformed-textarea",
                    style: vt({ fontSize: `${t(l)}px` }),
                    rows: "1",
                    ref_for: !0,
                    ref: (X) => t(b)(u.__key, X),
                    onKeydown: r[8] || (r[8] = xn(Ge(() => {
                    }, ["prevent"]), ["enter"]))
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "style"])
                ], 64)) : (ie(), Qe(Wn, {
                  key: 1,
                  row: u,
                  index: q
                }, {
                  leading: he(() => [
                    te("span", {
                      class: ge(["play-btn", { "is-playing": t(nt)(q), disabled: !t(st)(q, u) }]),
                      title: t(st)(q, u) ? t(ce) ? "Jump to this line in the full render" : "Play this line (and every voiced line after it)" : "Not voiced yet -- nothing to play",
                      onClick: (X) => t(At)(u, q)
                    }, qe(t(nt)(q) ? "⏸" : "▶"), 11, Is)
                  ]),
                  trailing: he(() => [
                    N(pt, { class: "speaker-file-group shrink-0" }, {
                      default: he(() => {
                        var X;
                        return [
                          f.revoiceApi && !t(ce) ? (ie(), Qe(ee, {
                            key: 0,
                            class: ge(["revoice-btn", { pending: t(Re).has(u), stale: !t(Re).has(u) && t(W)(q) && !t(Z)(u, q) }]),
                            icon: t(Re).has(u) ? "pi pi-spin pi-spinner" : "pi pi-refresh",
                            disabled: t(Re).has(u),
                            title: t(un)(u, q),
                            onClick: (ze) => t(cn)(u, q)
                          }, null, 8, ["icon", "class", "disabled", "title", "onClick"])) : Je("", !0),
                          N(dt, {
                            "model-value": ((X = t(ve)(u)) == null ? void 0 : X.speaker) || "",
                            placeholder: "(no speaker)",
                            class: "speaker-file-input",
                            disabled: !t(ve)(u),
                            title: t(Zt)(u),
                            "onUpdate:modelValue": (ze) => t(Yt)(u, ze)
                          }, null, 8, ["model-value", "disabled", "title", "onUpdate:modelValue"]),
                          N(ee, {
                            icon: "pi pi-microphone",
                            disabled: !t(ve)(u),
                            title: "Pick a speaker from the preset gallery",
                            onClick: (ze) => t(Qt)(u)
                          }, null, 8, ["disabled", "onClick"])
                        ];
                      }),
                      _: 2
                    }, 1024),
                    N(pt, { class: "pause-group shrink-0" }, {
                      default: he(() => [
                        N(_n, null, {
                          default: he(() => [
                            te("i", {
                              class: ge(t(rt)(u) ? "pi pi-exclamation-triangle text-warning" : "pi pi-stopwatch")
                            }, null, 2)
                          ]),
                          _: 2
                        }, 1024),
                        N(dt, {
                          modelValue: u.pause,
                          "onUpdate:modelValue": [
                            (X) => u.pause = X,
                            r[9] || (r[9] = (X) => t(Fe)())
                          ],
                          class: ge(["pause-input", { "p-invalid": t(rt)(u) }]),
                          placeholder: String(t(pn)(q)),
                          title: t(fn)(u, q)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "class", "placeholder", "title"])
                      ]),
                      _: 2
                    }, 1024),
                    r[15] || (r[15] = te("div", { class: "spacer" }, null, -1)),
                    N(ee, {
                      icon: "pi pi-history",
                      label: t(lt).get(t(C).get(q)) ? String(t(lt).get(t(C).get(q))) : "",
                      title: "Line history (previous takes/versions)",
                      onClick: (X) => t(sn)(u, q)
                    }, null, 8, ["label", "onClick"]),
                    N(ee, {
                      icon: "pi pi-times",
                      color: "red",
                      title: "Delete this line",
                      onClick: (X) => t(it)(q, u.text)
                    }, null, 8, ["onClick"])
                  ]),
                  _: 2
                }, 1032, ["row", "index"]))
              ])
            ], 10, bs))), 128))
          ], 512)
        ]),
        N(Cn),
        N(Qn, {
          visible: t(He),
          "onUpdate:visible": r[10] || (r[10] = (u) => Ke(He) ? He.value = u : null),
          categories: t(K),
          onSelect: t(qt)
        }, null, 8, ["visible", "categories", "onSelect"]),
        N(Xn, {
          visible: t(Ue),
          "onUpdate:visible": r[11] || (r[11] = (u) => Ke(Ue) ? Ue.value = u : null),
          presets: t(fe),
          "sample-dir": t(le),
          "usage-for": v.speakerUsageSubLabel,
          onSelect: t(Xt)
        }, null, 8, ["visible", "presets", "sample-dir", "usage-for", "onSelect"]),
        N(Yn, {
          visible: t(Ve),
          "onUpdate:visible": r[12] || (r[12] = (u) => Ke(Ve) ? Ve.value = u : null),
          versions: t(en),
          "chosen-version": t(tn),
          original: "",
          onSelect: t(an)
        }, null, 8, ["visible", "versions", "chosen-version", "onSelect"]),
        N(Zn, {
          visible: t(Be).visible,
          left: t(Be).left,
          top: t(Be).top,
          message: t(ct).message,
          fields: t(ct).fields
        }, null, 8, ["visible", "left", "top", "message", "fields"])
      ], 64);
    };
  }
}, $s = /* @__PURE__ */ yt(Ts, [["__scopeId", "data-v-634aa261"]]), As = {
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
    const s = f, i = y(!0);
    return Se(i, (h) => {
      h || s.onClose();
    }), (h, R) => {
      const L = de("Dialog");
      return ie(), Qe(L, {
        visible: i.value,
        "onUpdate:visible": R[0] || (R[0] = (o) => i.value = o),
        modal: !1,
        draggable: !1,
        "close-on-escape": "",
        header: " ",
        style: { width: "1600px" },
        class: "line-editor-dialog"
      }, {
        default: he(() => [
          N($s, Dn(Fn(h.$props)), null, 16)
        ]),
        _: 1
      }, 8, ["visible"]);
    };
  }
}, xs = /* @__PURE__ */ yt(As, [["__scopeId", "data-v-31dedee2"]]);
function sa({ folder: f, filename: s, suffix: i = "", checkedApi: h, revoiceApi: R }) {
  On(import.meta.url);
  const L = document.createElement("div");
  document.body.appendChild(L);
  const o = Nn(xs, {
    folder: f,
    filename: s,
    suffix: i,
    checkedApi: h || null,
    revoiceApi: R || null,
    onClose: () => {
      o.unmount(), L.remove();
    }
  });
  o.use(jn, { ripple: !0 }), Mn(o), o.use(as), o.mount(L);
}
export {
  sa as openLineEditor
};
