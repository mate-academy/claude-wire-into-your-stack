# Notes — wiring Claude into the course API

## Server (MCP)
I connected the official filesystem server at project scope, pointed only at `./docs` (`claude mcp add --scope project docs -- npx -y @modelcontextprotocol/server-filesystem ./docs`), so it is committed in `.mcp.json` and every teammate gets it. It is useful here because `docs/api.md` is the API reference Claude must keep in sync with the routes. It needs no credentials. In `.claude/settings.json` I allowed only the three read-only tools I use — `mcp__docs__read_text_file`, `mcp__docs__list_directory`, `mcp__docs__search_files` — not the whole server, so writes and moves through it still ask first. I used it once: Claude listed the `docs` folder through the server and summarised the `/users` endpoints documented in `api.md`.

## Skill
`.claude/skills/add-api-route/SKILL.md` captures how a route is written in this project: one router file per resource, data only through `db/store.js`, validate first with `400 { error }`, `404 { error }` for a missing record, a `// METHOD /path` comment, tests for success/400/404 and a `docs/api.md` entry. The description names the concrete triggers ("add a new route, endpoint or resource (GET/POST/PUT/DELETE)", "change how an endpoint validates input or returns errors") and the location (`routes/*.js`), so it fires on endpoint work and not on unrelated requests. Test: I asked for a `DELETE /users/:id` endpoint without naming the skill, and Claude said it would follow `add-api-route` and listed its rules.

## Command
`/review-route <file>` reviews one route file against the project checklist (store-only data access, 400/404 shapes, handler comments, docs and test coverage) and ends with "Ready to merge" / "Needs changes". It uses `$ARGUMENTS` for the file path. It is worth a shortcut because I would otherwise retype the same checklist before every PR. Running `/review-route routes/users.js` found real gaps: non-numeric ids fall through to 404 instead of 400, and missing tests for the POST/PUT 400 cases.

## Hook
A `PreToolUse` hook with matcher `Bash|PowerShell` runs `.claude/hooks/block-force-push.js`; it **prevents** any `git push --force` / `-f` / `+ref` before it runs, because a force-push can silently destroy teammates' history. I triggered it on purpose by asking Claude to run `git push --force origin wire-claude`, and the push was blocked with "Blocked by project hook: force-push is not allowed in this repo". On Windows I first used `exit 2`, but the shell wrapper reported it as a non-blocking error and the push still ran, so the hook now returns a JSON `permissionDecision: "deny"`, which blocks reliably on every platform.

## Headless run
I ran `claude -p "Run npm test and npm run lint, then report ... Do not change any files."` with `--allowedTools "PowerShell(npm test)" "PowerShell(npm run lint)"` (plus the same two for `Bash`). Only those two exact commands are pre-approved — no edits, no git, no other shell commands — so the job is safe to run unattended: it reported 5 tests passed, lint clean, no files changed.
