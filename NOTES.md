# Notes: wiring Claude into this project

## MCP server

Connected the `filesystem` server (`@modelcontextprotocol/server-filesystem`) via `.mcp.json`. It's useful here because it gives Claude a dedicated, auditable way to read and search project files through MCP tools instead of shelling out — handy for a docs-heavy step like keeping `docs/api.md` in sync.

The project's `.claude/settings.json` permission rule only allows the read-only filesystem tools: `read_file`, `list_directory`, `search_files`, and `list_allowed_directories`. Write/edit/move tools from that server are not allowed, so even if the server were pointed at more than `docs/`, this project can't use MCP to modify files through it.

**Caveat found while testing:** `.mcp.json` points the server at an absolute path to `docs/` only, but `list_allowed_directories` reports the *whole project root* at runtime. Cause: the `server-filesystem` package supports the MCP Roots protocol, and per its own README, roots sent by the client "completely replace any server-side Allowed directories when provided." Claude Code, as the MCP client, advertises the project's working directory as a root on every connection — so the docs-only path in `.mcp.json` is overridden the moment Claude Code connects. The configured scope is effectively decorative; treat the server as scoped to the whole project, not just `docs/`.

Also note: the path in `.mcp.json` (`/Users/maks/claude-wire-into-your-stack/docs`) is an absolute, machine-specific path. It won't resolve on another clone of this repo — anyone else pulling this project needs to update it to their own local path (or switch it back to a relative path, roots override notwithstanding).

## Skill

`.claude/skills/express-route/SKILL.md` captures this project's repeated way of building routes: one file per resource in `routes/`, mounted in `server.js`, all data access through `db/store.js`, `400` on bad input, `404` on a missing record, and every error shaped as `{ "error": "message" }`.

The description was worded around concrete trigger phrases plus an explicit exclusion: *"Use when adding a new route, endpoint, or resource to this Express API (e.g. "add a route for X", "add an endpoint to create/update/delete X"). Not for unrelated changes like tests, docs, or non-route refactors."* That's what made it fire on its own: when asked to "Add a DELETE /users/:id endpoint that removes a user," Claude launched the `express-route` skill automatically — it was never named or invoked directly.

## Command

`/sync-docs` (`.claude/commands/sync-docs.md`) reads every file in `routes/`, compares it against `docs/api.md`, and rewrites the doc so it matches the real endpoints, required fields, and status codes.

It earns a shortcut because it's a mechanical cross-check that's easy to forget after any route change — and it proved that on the first run: `docs/api.md` was missing the `DELETE /users/:id` endpoint added earlier in the session, and running `/sync-docs` caught the gap and added the missing section immediately.

## Hook

A `PostToolUse` hook in `.claude/settings.json` (project scope) matches `Edit|Write` and runs `npm run lint` afterward. It's **reactive, not preventive** — `PostToolUse` runs after the tool call has already completed, so it can catch lint problems but can't block or deny the edit itself.

Tested by triggering a real edit: temporarily prefixed the hook command to also append a timestamped line to a scratch file, made a small real edit (a comment line in `README.md`), and confirmed the scratch file picked up a new "hook fired" line — proof the hook actually ran off a genuine `Edit` call. Both the test edit and the sentinel prefix were reverted before committing the real hook.

## Headless run

Ran a headless prompt against the project: *"List every route in this project (method + path) and note which ones lack input validation."* Locked down to read-only tools only — `Glob` and `Read` — so the run could inspect the codebase but had no way to change anything (no `Bash`, `Edit`, or `Write`).

It found two real gaps:
- `GET`/`PUT`/`DELETE /users/:id` never validate `:id` as numeric — a non-numeric id becomes `NaN`, which just misses the store lookup and falls through to a `404` instead of a proper `400` for a malformed request.
- `POST`/`PUT /users` check that `name`/`email` are *present* but not their type or format (e.g. `email` isn't validated as an actual email shape, `name` could be any type).
