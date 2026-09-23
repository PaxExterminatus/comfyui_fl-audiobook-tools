"""
FL CosyVoice3 Audiobook Tools
Script/act project management, a full-screen per-line script editor with
per-line voicing and re-voice tracking, and a roles (character -> speaker)
editor -- built on top of FL-CosyVoice3, not a replacement for it.

Requires FL-CosyVoice3 (https://github.com/filliptm/ComfyUI_FL-CosyVoice3)
installed for the actual TTS synthesis nodes a workflow wires these to.
See README.md for the one upstream patch (FL CosyVoice3 Speaker Instruct2
Dialog needs a 3rd `line_texts_json` output) the per-line timing/re-voice
features depend on.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from .nodes.script_library import FL_CosyVoice3_ScriptLibrary
from .nodes.script_editor import FL_CosyVoice3_ScriptEditor
from .nodes.audio_post_process import FL_CosyVoice3_AudioPostProcess
from .nodes.vo_dub_library import FL_CosyVoice3_VODubLibrary

NODE_CLASS_MAPPINGS = {
    "FL_CosyVoice3_ScriptLibrary": FL_CosyVoice3_ScriptLibrary,
    "FL_CosyVoice3_ScriptEditor": FL_CosyVoice3_ScriptEditor,
    "FL_CosyVoice3_AudioPostProcess": FL_CosyVoice3_AudioPostProcess,
    "FL_CosyVoice3_VODubLibrary": FL_CosyVoice3_VODubLibrary,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "FL_CosyVoice3_ScriptLibrary": "FL CosyVoice3 Script Library",
    "FL_CosyVoice3_ScriptEditor": "FL CosyVoice3 Script Editor",
    "FL_CosyVoice3_AudioPostProcess": "FL CosyVoice3 Audio Post-Process",
    "FL_CosyVoice3_VODubLibrary": "FL CosyVoice3 VO Dub Library",
}

WEB_DIRECTORY = "web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
