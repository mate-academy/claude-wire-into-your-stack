# NOTES

## Server

I connected the `@modelcontextprotocol/server-filesystem` MCP server, scoped to the `docs/` directory, at project scope in `.mcp.json`. It's useful here because `docs/api.md` is the source of truth for the API's shape — letting Claude read it directly means route/test work can be checked against the documented contract instead of guessing from code alone. It's credential-free, so nothing needs to be kept out of the committed config.

The permission rule in `.claude/settings.json` only allows `mcp__docs__read_text_file`, `mcp__docs__list_directory`, and `mcp__docs__search_files` — read-only tools, nothing that could write into `docs/`. I hit one real issue while wiring this up: `${CLAUDE_PROJECT_DIR}` in the server's `args` doesn't get substituted unless that variable already exists in Claude Code's own environment (it's only guaranteed to be set inside the _spawned server's_ environment, not before). Fixed by adding a fallback default, `${CLAUDE_PROJECT_DIR:-.}/docs`, per Claude Code's own docs — verified it connects cleanly with `claude mcp list` in an environment with no manually-exported variables, and used it headless to list and summarize `docs/api.md`.

## Skill

The project repeats one shape for every resource — `users` — across three files: store helpers in `db/store.js`, a router in `routes/<resource>.js`, and a test file in `tests/<resource>.test.js`, all following the same validation, status-code, and error-shape conventions from `CLAUDE.md`. Without writing that down, each new resource risks drifting slightly (a different error shape, a missing 404 case). I captured it as `add-crud-resource` in `.claude/skills/`.

The description is worded around the trigger phrase, not the mechanism: _"Use when adding a new REST resource or route to this Express API — e.g. 'add a posts resource', 'create a new /orders endpoint', 'add CRUD for X'."_ Confirmed it fires without naming it — a request to "add a comments resource... following the same style as the rest of the app" triggered the `Skill` tool with `add-crud-resource`, verified via the headless run's `stream-json` trace, not just by eyeballing the response.

## Command

`/review-conventions <path>` in `.claude/commands/` — checks a route file against the four conventions in `CLAUDE.md` (store-only data access, 400/404 validation, the `{ "error": "message" }` shape, one-file-per-resource mounting) and reports findings without rewriting anything. It's worth a shortcut because it's the kind of check worth running after any route change, but tedious to redo by hand every time — and separating "review" from "scaffold" keeps it distinct from the skill above. Ran it against `routes/users.js`; it confirmed three conventions held and caught a real, worth-deciding edge case (a non-numeric `:id` currently falls through to `404` instead of `400`).

## Hook

A `PostToolUse` hook on the `Edit|Write` matcher in `.claude/settings.json`: after any file write, it checks whether the changed file is `.js`, and if so runs `npx eslint --fix` on it. It reacts rather than prevents — auto-formatting is safe to apply after the fact, unlike something that should block a write outright. Verified it actually fires (not just that it's configured): wrote a file with a real lint violation (`if (!!value)`, flagged by `no-extra-boolean-cast`) through a fresh headless session and confirmed via debug log that the hook rewrote it to `if (value)` before the session even reported back.

## Headless run

Scaffolded a `posts` resource (`title`, `body` fields) via `claude -p "Add a posts resource to this API with title and body fields, following this project's conventions."`, locked to `--allowedTools "Read,Write,Edit,Bash(npm test),Bash(npm run lint)"`. I allowed `Read` so it could consult the reference files the skill points to; `Write`/`Edit` since scaffolding necessarily touches four files; and `Bash` scoped to exactly the two verification commands the skill's own checklist calls for — no general shell access, nothing else. The run produced zero permission denials, meaning the allowlist was sufficient without being any broader than necessary. Verified independently afterward (not just trusting the run's own summary): `npm test` (10/10 passing) and `npm run lint` (clean) both rerun myself, and the diff matches exactly what was expected — `db/store.js` and `server.js` modified, `routes/posts.js` and `tests/posts.test.js` added.
