# VoDubBrowserPanel.md

## Назначение
`VoDubBrowserPanel.vue` — это инлайн-панель для ноды `FL_CosyVoice3_VODubLibrary`. Отображает эпизоды (buckets) проекта голосового дубляжа со счетчиками статусов (на основе `nodes/vo_dub_library.py`).

## Особенности
- Имеет ту же концепцию встроенной в ноду панели, что и `ScriptLibraryPanel.vue`.
- Намеренно **не содержит** древовидной структуры с чекбоксами, так как проекты VO dub не предполагают пакетную очередь генерации (каждая строка обрабатывается точечно через `line_override`).
- По клику на бакет открывает редактор строк дубляжа (`VoDubLineEditor.vue`).
- Осуществляет периодический опрос состояния дерева (`TREE_POLL_MS = 3000ms`) и сохраняет последний путь в `localStorage`.

## Пропсы
- `node`: объект ноды ComfyUI.
- `projectRootWidget`: виджет корневой папки проекта.
- `openBrowseDialog`, `openVoDubLineEditor`, `openDubRolesEditor`, `queueVoDubRender`: функции обратного вызова для навигации и запуска рендеринга.
