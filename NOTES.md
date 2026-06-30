# NOTES

How Claude is wired into this repo, and why each choice.

## Server (MCP)

Connected **Context7** (`npx -y @upstash/context7-mcp`) at project scope in a committed `.mcp.json`. It's useful here because it pulls current, version-correct docs for this repo's stack — Express, supertest, the Node test runner — so route and test work doesn't lean on stale memory. It's credential-free (the server boots and answers an MCP `initialize` with no key; a key only raises rate limits), which is what makes it safe to commit team-wide: teammates get it on clone with no secrets. The permission rule in `.claude/settings.json` allows only its two read-only tools — `mcp__context7__resolve-library-id` and `mcp__context7__query-docs` — rather than blanket-allowing the server, so it can look docs up and nothing else. (Chose it over the suggested fetch server because `uvx`/`uv` isn't installed here and wouldn't be on a teammate's clone, whereas `npx` is.)

## Skill

The project skill `writing-routes` captures how a route is written here: the `handler → db/store.js helper → in-memory state` flow, store-helper-first ordering, `Number(...)` id coercion (the store matches ids with `===`), `400`/`404` validation, the `{ error }` JSON shape, and a matching supertest test. The description lists concrete trigger phrases ("add a DELETE /users/:id", "create a /posts resource", "add pagination to GET /users") and says explicitly that it should fire on any change touching `routes/` even when the user never says "route" or names the skill — worded that way to beat under-triggering. Confirmed: a headless request to add a DELETE endpoint, with the skill unnamed, reproduced the skill's exact conventions and even cited "the skill's convention."

## Command

Added `/scaffold-route` (`.claude/commands/scaffold-route.md`). It takes the endpoint spec as `$ARGUMENTS`, drives the store-helper → handler → mount → test workflow through the `writing-routes` skill, then runs `npm run lint` + `npm test` and fixes until both pass. It's worth a shortcut because adding a CRUD route is the most-repeated task on this API, and the command folds convention-following and verification into one step. Ran it once for real (in an isolated copy) on `DELETE /users/:id` — correct code, 7/7 tests passing.

## Hook

A **PostToolUse** hook on the `Edit|Write|MultiEdit` matcher, running `.claude/hooks/eslint-fix.sh`. It **reacts** rather than prevents — you can't lint a file before its new content exists, so linting belongs after the edit. The script runs `eslint --fix` on the edited file, scoped to exactly what `npm run lint` covers (`server.js`, `routes/`, `db/`, `tests/`), and reports any remaining errors (exit 2) so they're fixed before reaching CI. The standard it holds: CI runs `npm run lint` on every push and PR, so keeping edits lint-clean at edit time keeps that gate green. Verified it fires on a real edit (trusted isolated copy).

## Headless run

Ran a read-only audit of the API's HTTP surface against `docs/api.md` with `claude -p --allowedTools "Read,Glob,Grep"`. Locked down to those three read tools; omitted `Write`/`Edit` (can't alter files), `Bash` (can't run shell commands), and the MCP tools (not needed) — so an unattended run physically can't modify the repo or execute anything. Proven safe: `git status` was unchanged afterward, and the audit even caught two real doc-drift items in `docs/api.md`.

## On a fresh checkout

Project-scoped `.mcp.json` permissions and the `.claude/settings.json` hook only take effect once the workspace is trusted — open Claude Code in the repo once and accept the trust dialog (or set `hasTrustDialogAccepted: true` for this project in `~/.claude.json`). After that the server, skill, command, and hook all load automatically.
