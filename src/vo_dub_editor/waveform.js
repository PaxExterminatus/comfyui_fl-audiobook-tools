/*
 Decodes an audio file into a small array of peak magnitudes (0..1), one
 per "bucket" -- a static overview waveform to LOOK at (see
 WaveformCanvas.vue), not anything to do with playback. Uses
 decodeAudioData purely as a decoder; nothing here ever gets connected to
 a destination or played.
*/
let sharedDecodeCtx = null;
function getDecodeContext() {
    const Ctor = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!Ctor) return null;
    if (!sharedDecodeCtx) sharedDecodeCtx = new Ctor();
    return sharedDecodeCtx;
}

/*
 Rejects (never silently returns a flat/empty array) on any failure --
 WaveformCanvas.vue is the one place that decides what "couldn't load a
 waveform" should look like, this function just does the decode.
*/
export async function decodeWaveformPeaks(url, bucketCount = 100) {
    const ctx = getDecodeContext();
    if (!ctx) throw new Error("Web Audio not supported -- can't decode a waveform");
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`couldn't fetch ${url}: ${resp.status}`);
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channel = audioBuffer.getChannelData(0); // first channel is enough for an overview
    const samplesPerBucket = Math.max(1, Math.floor(channel.length / bucketCount));
    const peaks = new Float32Array(bucketCount);
    for (let b = 0; b < bucketCount; b++) {
        const start = b * samplesPerBucket;
        const end = Math.min(channel.length, start + samplesPerBucket);
        let max = 0;
        for (let i = start; i < end; i++) {
            const v = Math.abs(channel[i]);
            if (v > max) max = v;
        }
        peaks[b] = max;
    }
    return peaks;
}
