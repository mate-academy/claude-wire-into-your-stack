# Конфигурация Claude Code для проекта

## MCP-сервер

**Подключен:** `@modelcontextprotocol/server-filesystem` с доступом к папке `./docs`.

**Полезность:** Позволяет Claude читать документацию проекта напрямую, не требуя ручного копирования содержимого файлов. Осуществляет доступ к файлам через MCP-протокол.

**Разрешённые права:** Только safe read-only инструменты — `read_file`, `read_text_file`, `read_media_file`, `read_multiple_files`, `list_directory`, `directory_tree`, `search_files`, `get_file_info`. Все write-операции (`write_file`, `edit_file`, `create_directory`, `move_file`) заблокированы для безопасности.

---

## Навык (Skill)

**Создан:** `express-route-generator` в `.claude/skills/express-route/SKILL.md`.

**Автозапуск:** Срабатывает на ключевые слова `"create.*route"`, `"add.*endpoint"`, `"new.*api"`, `"express.*handler"` — если пользователь просит создать endpoint или route. Описание явно указывает на это назначение.

**Содержание:** Включает чек-лист стандартов проекта (структура `routes/`, обязательное использование `db/store.js`, формат ошибок `{ "error": "message" }`, коды ответов 400/404, примеры кода и интеграцию в `server.js`).

---

## Команда (.claude/commands/)

**Добавлена:** `/review-changes` в `.claude/commands/review-changes.md`.

**Назначение:** Проверяет последние изменения в Git на соответствие чек-листу проекта (обработка ошибок, стиль кода, наличие тестов, интеграция). Принимает опциональное описание задачи и выводит список нарушений с рекомендациями по исправлению.

---

## Хук в settings.json

**Событие:** `PostToolUse` (срабатывает после редактирования файла).

**Matcher:** `Write|Edit` (применяется к инструментам Write и Edit).

**Команда:** 
```bash
jq -r '.tool_response.filePath // .tool_input.file_path' | { read -r f; if [[ "$f" == *.js ]]; then npm test 2>&1 | head -50; fi; } 2>/dev/null || true
```

Запускает `npm test` автоматически после редактирования `.js` файлов, безопасно извлекая путь через jq и выводя первые 50 строк результата.

---

## Использование в headless-режиме

**Команда:** `claude -p '/review-changes "Создать новый POST endpoint"'` запустит проверку изменений с описанием задачи без интерактивного интерфейса.

**Ограничения инструментов:** При использовании `--allowedTools` можно явно ограничить доступ (например, `--allowedTools "Read,Bash(npm *)"` запрещит Write-операции и ограничит Bash только npm командами). MCP-сервер `filesystem` уже защищён на уровне permissions в `.claude/settings.json`, где разрешены только read-only инструменты.

