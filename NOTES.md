# Wire Claude into your stack: notes

## 1. MCP Server

- **Server:** Filesystem MCP Server (`@modelcontextprotocol/server-filesystem`).
- **Scope:** project level, defined in `.mcp.json` and enabled via `enabledMcpjsonServers` in `.claude/settings.local.json`.
- **Restrictions:** started with `--read-only` and limited to the `./docs` directory.
- **Permissions:** `permissions.allow` in `.claude/settings.json` contains only `mcp__filesystem__read_text_file` and `mcp__filesystem__list_directory`.
- **Verification:** the server was tested by reading `docs/api.md`.

## 2. Project Skill

- **Name:** `express-route-conventions` (`.claude/skills/express-route-conventions/SKILL.md`).
- **Purpose:** defines how Express routes are created and changed: route structure, input validation, error handling and status codes, `db/store.js` helpers, tests, and `docs/api.md` updates.
- **Verification:** automatic activation was confirmed with a request to add `DELETE /users/:id` that did not mention the Skill.

## 3. Custom Command

- **Command:** `/review-routes` (`.claude/commands/review-routes.md`).
- **Purpose:** reviews Express routes against the project conventions from the Skill and reports findings (violations and notes) with `file:line` locations.
- **Arguments:** accepts `$ARGUMENTS`: empty (all files in `routes/`), a resource or file (e.g. `users`), or a route (e.g. `GET /users/:id`).
- **Mode:** read-only. `allowed-tools` is limited to `Read`, `Grep`, `Glob`, and `Skill`.

## 4. Hook

- **Event:** `PostToolUse`, matcher `Write|Edit` (`.claude/settings.json`).
- **Action:** reads the edited file path from the hook input and runs the project's existing ESLint (`npx --no-install eslint`) on it. Lint errors are sent to stderr with exit code 2, so Claude sees them.
- **Filtering:** runs only for `.js`, `.cjs`, and `.mjs` files. Other files are skipped.
- **Verification:** automatic execution was confirmed with a temporary JavaScript file containing a syntax error.

## 5. Headless task

- **Task:** analysis of the Express API in non-interactive mode with `claude -p`: existing routes, success and error response formats, and how validation is organized.
- **Command:**
  ```bash
  claude -p "Проанализируй Express API этого проекта. Изучи server.js, routes/, db/store.js, tests/ и docs/api.md. Составь краткий отчёт: какие маршруты существуют, какие форматы успешных ответов и ошибок используются, как организована валидация. Ничего не изменяй." --allowedTools "Read,Grep,Glob"
  ```
- **Allowed tools:** `Read`, `Grep`, `Glob`.
- **Why this set:** the task only needs to read and search code. Without `Write`, `Edit`, or `Bash`, the run cannot change files or execute commands, so it is safe to automate.
- **Result:** no files were modified.
