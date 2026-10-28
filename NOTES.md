# NOTES

## Server

I connected the official filesystem MCP server (`docs-fs`) at project scope, pointed at `./docs`. It needs no credentials, and `docs/api.md` is the API reference that routes, tests and docs have to stay in sync with, so Claude can read it directly. The permission rule in `.claude/settings.json` allows only the read tools I need (`read_text_file`, `list_directory`, `search_files`). Write and edit tools are not allowed, so the server cannot change the docs.

## Skill

`add-api-route` captures the four steps this project repeats whenever an endpoint changes: data access through `db/store.js`, the route with 400/404 validation and `{ "error": "message" }` responses, tests with `node:test` and `supertest`, and an update to `docs/api.md`. The description names the concrete requests that should trigger it ("add a DELETE /users/:id route", "add a /posts resource") and says what it is not for (linting, refactors without API changes, questions about the code), so it fires on endpoint work and not on everything.

## Command

`/review-route <path>` reviews one route file against the eight conventions in CLAUDE.md (store-only data access, 400, 404, error shape, 201, handler comments, tests, docs) and answers PASS or FAIL per check with line numbers. It is worth a shortcut because the same checklist applies to every route and the prompt is long to retype. It takes the file as `$ARGUMENTS` and never edits anything.

## Hook

A PostToolUse hook on `Edit|Write` runs `npm run lint`. It reacts after a change rather than preventing one. If lint reports errors, the command exits with code 2, so Claude sees the output and can fix it right away. It reports warnings as output but does not fail on them.

## Headless run

I ran `claude -p "/review-route routes/users.js" --allowedTools "Read,Glob,Grep"`. The allowed tools are read-only: the task only needs to read the route, its tests and the docs. With no Edit, Write or Bash allowed, nothing can change files or run commands while nobody is watching. The run changed no files.
