"""
Speaker preset discovery для standalone-сервера.

Зеркалит nodes/_speaker_presets.py -- выделено из server.py, чтобы
импорты _tts_engine и роутов не путались с routes/vo_dub.py.

Каталог моделей: переменная окружения FL_COSYVOICE_MODELS_DIR, либо
стандартный путь Comfy-Desktop, либо None. Пресеты — .pt-файлы внутри
<models>/cosyvoice/speaker/.
"""
import os


def cosyvoice_models_dir():
    env_dir = os.environ.get("FL_COSYVOICE_MODELS_DIR", "").strip()
    if env_dir and os.path.isdir(env_dir):
        return env_dir
    default_guess = r"C:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\models"
    if os.path.isdir(default_guess):
        return default_guess
    return None


def get_speaker_dir():
    models_dir = cosyvoice_models_dir()
    if not models_dir:
        return None
    return os.path.join(models_dir, "cosyvoice", "speaker")


def list_speaker_presets():
    speaker_dir = get_speaker_dir()
    if not speaker_dir or not os.path.isdir(speaker_dir):
        return ["[none]"]
    names = [
        os.path.splitext(f)[0]
        for f in sorted(os.listdir(speaker_dir))
        if f.endswith(".pt")
    ]
    return names if names else ["[none]"]