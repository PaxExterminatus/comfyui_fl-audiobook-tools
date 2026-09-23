// Client-side, real-time APPROXIMATION of nodes/_audio_effects.py's named
// effects, applied to an RU <audio> element's own playback via the Web
// Audio API -- lets a row's Effect choice be heard immediately, on the
// EXISTING take, without a re-render (no TTS re-synthesis, no
// post-process round-trip, no save). The FILE on disk only gets the real
// Python-computed effect once the row is actually (re-)rendered; this is
// audition only, never what ends up saved -- see VoDubLineEditor.vue's own
// commitEffect/saveEffect for the (separate, explicit) persistence step.
//
// Not bit-identical to _audio_effects.py's own recipes (a live BiquadFilter
// bandpass + WaveShaper distortion + looped filtered noise is a reasonable
// live stand-in, not the same FFT-domain recipe) -- it only has to sound
// unmistakably "different, in the right direction" for an A/B preview, not
// match sample for sample.

let sharedCtx = null;
function getAudioContext() {
    const Ctor = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!Ctor) return null;
    if (!sharedCtx) sharedCtx = new Ctor();
    return sharedCtx;
}

function makeDistortionCurve(drive, samples = 1024) {
    const curve = new Float32Array(samples);
    const norm = Math.tanh(drive) || 1;
    for (let i = 0; i < samples; i++) {
        const x = (i / (samples - 1)) * 2 - 1;
        curve[i] = Math.tanh(x * drive) / norm;
    }
    return curve;
}

// A short loop of band-limited static -- matches _audio_effects.py's
// band_limited_noise in SPIRIT (noise filtered to the same band the voice
// uses), not sample-for-sample.
function makeNoiseNode(ctx, lowHz, highHz) {
    const seconds = 2;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = lowHz;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = highHz;
    src.connect(hp);
    hp.connect(lp);
    src.start();
    return lp;
}

// Shared builder behind every telephony-style preview chain -- mirrors
// nodes/_audio_effects.py's _telephony_effect (bandpass, then distortion,
// then optional noise), just as a live Web Audio graph instead of an
// offline FFT/tanh pass. Only the four params differ per effect NAME (see
// EFFECT_CHAINS below), same as the Python side's own radio_effect/
// phone_effect being one shared recipe with different defaults.
function buildTelephonyChain(ctx, { lowHz, highHz, drive, noiseLevel }) {
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = lowHz;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = highHz;
    hp.connect(lp);

    // drive <= 0 mirrors _audio_effects.py's own soft_clip: a no-op, not a
    // WaveShaper curve -- makeDistortionCurve(0) normalizes by
    // Math.tanh(0) === 0, and `|| 1` only rescues THAT division, so every
    // sample would still map through tanh(x * 0) = 0, i.e. silence. Skip
    // the shaper entirely instead of ever building that curve.
    let voiceOut = lp;
    if (drive > 0) {
        const shaper = ctx.createWaveShaper();
        shaper.curve = makeDistortionCurve(drive);
        shaper.oversample = "2x";
        lp.connect(shaper);
        voiceOut = shaper;
    }

    if (noiseLevel <= 0) return { input: hp, output: voiceOut };

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = noiseLevel;
    makeNoiseNode(ctx, lowHz, highHz).connect(noiseGain);

    const mix = ctx.createGain();
    voiceOut.connect(mix);
    noiseGain.connect(mix);

    return { input: hp, output: mix };
}

// Mirrors nodes/_audio_effects.py's EFFECTS registry -- one entry per
// effect NAME (not per instance; each chain is built fresh per <audio>
// element the first time that row actually previews it). "radio" is the
// aggressive walkie-talkie end (narrow band, heavy clip, audible static);
// "phone" is the clean-landline end (the standard 300-3400Hz telephone
// band, barely any clip, no static) -- same params as their Python
// counterparts' own defaults.
const EFFECT_CHAINS = {
    radio: (ctx) => buildTelephonyChain(ctx, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0.05 }),
    phone: (ctx) => buildTelephonyChain(ctx, { lowHz: 300, highHz: 3400, drive: 1.05, noiseLevel: 0 }),
    // Wide passband, no clip, no noise -- a natural muffled quality, not a
    // telephony one. See nodes/_audio_effects.py's muffled_effect for the
    // same params and the reasoning/reference behind them.
    muffled: (ctx) => buildTelephonyChain(ctx, { lowHz: 120, highHz: 6000, drive: 0, noiseLevel: 0 }),
    // radio's band and grit with NO static of its own -- for dubbing a game
    // that already layers its own channel noise over the line as a separate
    // sound, where baking in a second layer would stack the two. See
    // nodes/_audio_effects.py's radio_dry_effect for the case behind it.
    radio_dry: (ctx) => buildTelephonyChain(ctx, { lowHz: 400, highHz: 2800, drive: 1.6, noiseLevel: 0 }),
    // Hard-wired intercom/PA panel -- between phone and radio at both ends,
    // more grit than phone, no static.
    intercom: (ctx) => buildTelephonyChain(ctx, { lowHz: 250, highHz: 4000, drive: 1.2, noiseLevel: 0 }),
    // Inside a sealed helmet -- low end largely kept, only the top rolled
    // off, drive below 1.0 so the clip stays in its near-identity region.
    suit: (ctx) => buildTelephonyChain(ctx, { lowHz: 150, highHz: 5000, drive: 0.6, noiseLevel: 0 }),
};

// One instance per RU <audio> element -- wraps it in a dry (unmodified)
// path plus one wet (effect) path per distinct effect it's ever previewed,
// and setEffect() just flips which path's gain is actually audible.
// Cheap to call setEffect repeatedly (e.g. every dropdown change): it
// never rebuilds the graph, only toggles gains.
//
// createMediaElementSource can only ever be called ONCE per <audio>
// element (a second call throws) -- callers must create exactly one of
// these per element and hold onto it for that element's whole lifetime
// (see VoDubLineEditor.vue's effectPreviews Map, cleared when the element
// unmounts).
export function createEffectPreview(el) {
    const noop = { setEffect() {} };
    const ctx = getAudioContext();
    if (!ctx) return noop; // no Web Audio support -- preview silently does nothing; Save/Render still work
    let source;
    try {
        source = ctx.createMediaElementSource(el);
    } catch (e) {
        return noop; // already wrapped elsewhere, or the browser refused -- same graceful no-op
    }

    // Everything -- dry AND wet -- routes through this ONE gate before
    // reaching speakers, kept in lockstep with the element's own paused
    // state. Without it, a saved "radio" pick's noise loop (a genuinely
    // separate AudioBufferSourceNode, started once and looping forever --
    // see makeNoiseNode) plays continuously and audibly the moment this
    // preview is wired up on mount, regardless of whether the RU element
    // has ever actually been pressed play on -- exactly what made this
    // editor hum with static the instant a bucket with a saved effect
    // opened. A MediaElementSourceNode alone silences ITSELF while its
    // element is paused, but that guarantee is specific to that one node
    // -- it does nothing for a wholly independent source like the noise
    // loop sitting in parallel with it.
    const master = ctx.createGain();
    master.gain.value = el.paused ? 0 : 1;
    master.connect(ctx.destination);
    function syncMasterGate() {
        master.gain.value = el.paused ? 0 : 1;
    }
    el.addEventListener("play", syncMasterGate);
    el.addEventListener("pause", syncMasterGate);
    el.addEventListener("ended", syncMasterGate);

    const dry = ctx.createGain();
    source.connect(dry);
    dry.connect(master);

    const wetGains = {}; // effect name -> its own GainNode
    function ensureWet(name) {
        if (wetGains[name]) return wetGains[name];
        const build = EFFECT_CHAINS[name];
        if (!build) return null;
        const chain = build(ctx);
        source.connect(chain.input);
        const gain = ctx.createGain();
        gain.gain.value = 0;
        chain.output.connect(gain);
        gain.connect(master);
        wetGains[name] = gain;
        return gain;
    }

    let current = "";
    function setEffect(name) {
        const next = name || "";
        if (next === current) return;
        if (current && wetGains[current]) wetGains[current].gain.value = 0;
        current = "";
        if (!next) { dry.gain.value = 1; return; }
        const gain = ensureWet(next);
        if (!gain) { dry.gain.value = 1; return; } // unknown effect name -- fall back to dry
        current = next;
        dry.gain.value = 0;
        gain.gain.value = 1;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
    }

    return { setEffect };
}
