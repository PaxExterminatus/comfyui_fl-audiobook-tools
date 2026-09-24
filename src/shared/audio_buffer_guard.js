/*
 Guards a lazy (`preload="none"`) <audio> element against clipping the
 very start of its own playback: with nothing preloaded, both the
 browser's own native play button AND a scripted .play() can start
 OUTPUTTING audio before enough data has actually buffered, silently
 dropping the first fraction of a second. Pausing immediately and
 resuming once 'canplaythrough' fires is transparent (near-instant for a
 short clip served locally) and doesn't redefine what any control does --
 see Apple HIG's playing-audio.md: "consider custom controls only if you
 need commands the system doesn't support" -- this isn't a custom
 control, it's a safety net around the native one, so every existing
 native play/pause/seek/volume control keeps working exactly as before.
*/
const HAVE_FUTURE_DATA = 3;

export function guardAgainstUnbufferedPlay(el) {
    let resuming = false;
    el.addEventListener("play", () => {
        if (resuming || el.readyState >= HAVE_FUTURE_DATA) return;
        resuming = true;
        el.pause();
        const onReady = () => {
            el.removeEventListener("canplaythrough", onReady);
            resuming = false;
            el.play().catch(() => {});
        };
        el.addEventListener("canplaythrough", onReady);
    });
}

/*
 Resolves once `el` has buffered enough to play through without
 stalling -- used before a SCRIPTED play (e.g. "play both tracks
 together"), where pause-then-resume would visibly desync the two
 tracks' start times instead of just delaying the single click-to-play
 moment before anything audible has started.
*/
export function waitUntilBuffered(el) {
    return new Promise((resolve) => {
        if (el.readyState >= HAVE_FUTURE_DATA) { resolve(); return; }
        const onReady = () => { el.removeEventListener("canplaythrough", onReady); resolve(); };
        el.addEventListener("canplaythrough", onReady);
        el.load();
    });
}
