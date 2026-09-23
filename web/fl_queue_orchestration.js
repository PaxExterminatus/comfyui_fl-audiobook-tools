// ComfyUI queue-orchestration helpers shared between script_library.js
// (per-line re-voice / checked-scripts batch) and vo_dub_library.js
// (per-row render) -- both hand-written vanilla node-wiring files, loaded
// directly by ComfyUI, never through Vite. Kept OUT of fl_common.js on
// purpose: fl_common.js is also imported by every Vue component (via
// Vite/Vitest), and `app`/`api` only resolve as real modules inside
// ComfyUI's own running frontend -- pulling them into fl_common.js would
// break every component's build/test with an unresolvable import.
//
// Everything here works the same way regardless of WHICH addon node is
// driving the override (an act/script's line_index_override+script_folder+
// script_base_name+line_hashes_json, or a VO dub row's
// output_path_override): it operates purely on the CURRENT graph/prompt,
// never on this addon's own data model.
import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// Subgraph-safe: a node living inside a subgraph is flattened into the
// prompt under a composite id ("5:12"), so collecting matches from the
// live graph (not the serialized prompt) and resolving each one
// separately via findPromptEntry is what actually finds every Post-
// Process node regardless of nesting.
export function findNodesByClass(classType) {
    const found = [];
    const visit = (graph) => {
        if (!graph) return;
        const nodes = graph._nodes || graph.nodes || [];
        for (const n of nodes) {
            if (!n) continue;
            if (n.comfyClass === classType || n.type === classType) found.push(n);
            const inner = n.subgraph || n.graph || n._graph;
            if (inner && inner !== graph) visit(inner);
        }
    };
    visit(app.graph);
    return found;
}

// Resolves a graph node to its entry in the SERIALIZED prompt, handling
// the same composite-subgraph-id hazard findNodesByClass's own walk
// exists for -- a plain prompt[node.id] lookup silently misses a node
// living inside a subgraph, which is worse than merely ineffective: it
// makes the backend read the run as something it isn't (see
// nodes/audio_post_process.py's own handling of a stamp that never
// arrived).
export function findPromptEntry(prompt, node, classType) {
    const sId = String(node.id);
    const direct = prompt[sId];
    if (direct && direct.class_type === classType) return direct;
    for (const key of Object.keys(prompt)) {
        const entry = prompt[key];
        if (!entry || entry.class_type !== classType) continue;
        if (key.slice(key.lastIndexOf(":") + 1) === sId) return entry;
    }
    return null;
}

// Matches ComfyUI core's SaveAudio/SaveAudioMP3/SaveAudioOpus,
// VHS_SaveAudio, and similar third-party audio-saver nodes by name, not
// by an exact class list.
const AUDIO_SAVER_CLASS_RE = /saveaudio|audiosave/i;

// A single-row/single-line override only needs THIS addon's own write
// (a per-line file, or a VO dub row's fixed audio_ru\<key>.wav) -- if the
// user's graph still has a Save Audio node wired downstream for a quick
// listen while working, queuing the WHOLE graph for just one item makes
// that SAME node fire too, writing this one short item's audio somewhere
// that a status check elsewhere (scripts_with_audio, a VO row's own
// audio_ru existence check) could mistake for a real, complete take.
// Dropping any audio-saver node from THIS ONE queued prompt (never from
// the graph itself) avoids that. Returns the class_types actually
// removed -- stripping the node that happened to be a branch's only
// execution root is exactly how a render silently produces nothing, so
// the caller should log this rather than let it happen invisibly.
export function stripDownstreamAudioSavers(prompt) {
    const stripped = [];
    for (const key of Object.keys(prompt)) {
        const entry = prompt[key];
        if (entry && AUDIO_SAVER_CLASS_RE.test(entry.class_type || "")) {
            stripped.push(entry.class_type);
            delete prompt[key];
        }
    }
    return stripped;
}

// Serializes a "stamp the override, call graphToPrompt/queuePrompt"
// critical section so two clicks fired close together can't stomp each
// other's module-level override state -- graphToPrompt reads that state
// synchronously at the start of building the prompt, so as long as
// SUBMISSIONS don't overlap, each one's actual EXECUTION (which can take
// a while, and runs one-at-a-time anyway via ComfyUI's own queue) is free
// to be in flight concurrently with others. Each caller gets its OWN
// independent lock (script_library.js's re-voice and vo_dub_library.js's
// render must not serialize against each other's unrelated submissions).
export function makeSubmitLock() {
    let chain = Promise.resolve();
    return function withSubmitLock(fn) {
        const run = chain.then(fn, fn);
        chain = run.catch(() => {});
        return run;
    };
}

// Submits an already-built prompt and resolves with its prompt_id via the
// "execution_start" websocket event -- NOT via api.queuePrompt's own
// return value. Confirmed live against an install with a long chain of
// other extensions each wrapping api.queuePrompt (rgthree, Pixaroma,
// inspire-pack, easy-use, DaSiWa): {prompt_id} does not reliably survive
// that chain back to the original caller even though the server receives
// and queues the prompt correctly. The websocket event comes straight
// from the server, unaffected by any of those JS-level wrappers. Minor
// residual risk: if something ELSE is queued ahead of this one, the next
// execution_start could belong to that other job instead -- acceptable
// for "work within the current flow" (nothing else is expected to be
// queuing at the same time).
export async function submitAndTrackPromptId(promptResult, { timeoutMs = 10 * 60 * 1000 } = {}) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            api.removeEventListener("execution_start", onStart);
            reject(new Error("Timed out waiting for the render to start"));
        }, timeoutMs);
        function onStart(event) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            api.removeEventListener("execution_start", onStart);
            resolve(event.detail?.prompt_id);
        }
        api.addEventListener("execution_start", onStart);
        api.queuePrompt(0, promptResult).catch((err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            api.removeEventListener("execution_start", onStart);
            reject(err);
        });
    });
}

export async function pollPromptCompletion(promptId, { intervalMs = 1000, timeoutMs = 10 * 60 * 1000 } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const resp = await fetch(`/history/${promptId}`);
        const data = await resp.json();
        const entry = data[promptId];
        if (entry) {
            if (entry.status?.completed) return entry;
            if (entry.status?.status_str === "error") {
                throw new Error("Render failed -- check the ComfyUI console for details");
            }
        }
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error("Timed out waiting for the render to finish");
}
