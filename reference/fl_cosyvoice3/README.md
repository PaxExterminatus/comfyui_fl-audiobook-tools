# FL-CosyVoice3 reference snapshot

Read-only copies of the files this addon's per-line revoice pipeline
actually depends on, pulled from the LIVE installed sibling addon on this
machine:

```
C:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\comfyui_fl-cosyvoice3
```

Copied 2026-09-05, for reviewing the "re-voice doesn't work" report alongside
`nodes/audio_post_process.py` and `nodes/script_library.py` without jumping
between two folders on disk.

**Not imported, not registered.** Nothing in this addon's `__init__.py`
references these files -- ComfyUI still loads the real
`FL_CosyVoice3_SpeakerInstruct2Dialog`/`FL_CosyVoice3_SpeakerInstruct2` nodes
from `comfyui_fl-cosyvoice3` itself. This is purely a local diffing/reading
copy. If a fix turns out to belong here rather than in this addon, it has to
be applied to the real installed file above (or upstreamed), then re-copied
here to keep this snapshot honest -- editing only this copy would do nothing.

- `nodes/speaker_instruct2_dialog.py` -- the "🔊FL CosyVoice3 Speaker
  Instruct2 Dialog" node this addon's whole per-line workflow is built
  around (see this repo's README's "Required patch" section -- this
  installed copy already has the 3rd `line_texts_json` output applied).
- `nodes/speaker_instruct2.py` -- single-line sibling node; also where
  `get_speaker_dir`/`list_speaker_presets`/`is_cosyvoice3_model` (imported
  by the Dialog node) live.
- `utils/audio_utils.py` -- FL-CosyVoice3's own audio helpers. This
  addon vendors a SEPARATE, smaller copy of the overlapping pieces in
  `nodes/_audio_utils.py` (see that file's docstring) -- the two can drift;
  this copy is here to diff against, not to import from.
