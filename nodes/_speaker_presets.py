"""
Vendored from FL CosyVoice3's nodes/speaker_instruct2.py -- just enough to
list the saved speaker presets (.pt files under ComfyUI's own models dir)
for the "change this role's speaker" picker in web/roles_editor.js /
web/line_editor.js. See nodes/_audio_utils.py's module docstring for why
this is copied rather than imported across the two packages.
"""

import os
from typing import List

import folder_paths


def get_speaker_dir() -> str:
    """<ComfyUI models dir>/cosyvoice/speaker/ -- same location
    FL-CosyVoice3's own Speaker Clone / Speaker Instruct2 nodes save
    presets to and load them from."""
    return os.path.join(folder_paths.models_dir, "cosyvoice", "speaker")


def list_speaker_presets() -> List[str]:
    """
    Scan the speaker directory and return a list of speaker preset names
    (filenames without the .pt extension). Returns ['[none]'] if the
    directory is empty or does not exist.
    """
    speaker_dir = get_speaker_dir()
    if not os.path.isdir(speaker_dir):
        return ["[none]"]
    names = [
        os.path.splitext(f)[0]
        for f in sorted(os.listdir(speaker_dir))
        if f.endswith(".pt")
    ]
    return names if names else ["[none]"]
