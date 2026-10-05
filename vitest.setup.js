/*
 Глобальная регистрация PrimeVue-компонентов для тестов.

 В приложении она делается в восьми точках createApp (см.
 src/shared/primevue_components.js). Тесты туда не заходят — они монтируют
 компоненты напрямую через @vue/test-utils, поэтому без этого файла каждый
 шаблон, ссылающийся на Button или InputText, остаётся с неразрешённым
 компонентом. Vue на это только предупреждает, а падают уже сами проверки,
 причём далеко от причины.

 config.global.plugins применяется ко ВСЕМ mount() в наборе, так что
 тестовое окружение совпадает с боевым, и добавление семнадцатого
 компонента по-прежнему остаётся правкой одного файла.
*/
import { config } from "@vue/test-utils";
import { registerPrimeVueComponents } from "./src/shared/primevue_components.js";

config.global.plugins = [
    ...(config.global.plugins || []),
    { install: registerPrimeVueComponents },
];
