# Wiring notes

How Claude is set up to work on this repo, and why each choice.

## The server

`.mcp.json` connects **`fetch`** (`uvx mcp-server-fetch`) at project scope. It's
credential-free and needs no install step for teammates who already have `uv`.
It's useful here because this repo is an HTTP API: `fetch` pulls live reference
material — RFC 9110, MDN HTTP semantics, Express docs — straight into a working
session, so route behaviour and `docs/api.md` can be checked against the actual
specs instead of memory.

**Permission rule** (`.claude/settings.json`): `permissions.allow` lists exactly
`mcp__fetch__fetch` — the one read-only tool the server exposes — rather than the
`mcp__fetch` wildcard, so only that call is pre-approved and any future tool the
server might add still prompts. `enabledMcpjsonServers: ["fetch"]` pre-approves
the server itself so a fresh checkout doesn't have to.

**Used once:** fetched the MDN/RFC 9110 pages for `PUT` and `201 Created` and used
them to fill gaps in `docs/api.md` — explicit success status codes on every
endpoint and a "Method semantics" section (GET/PUT idempotent, PUT is
replace-only, POST sends no `Location` header).

## The skill

`.claude/skills/add-api-endpoint/` captures the one flow this repo repeats for
every resource: add an accessor to `db/store.js` → write `routes/<resource>.js`
as an `express.Router()` → mount it once in `server.js` → add a
`node:test` + `supertest` spec in `tests/` with `store.reset()` in `beforeEach`
→ add a `docs/api.md` entry. It also pins the conventions: `400` on bad input,
`404` on a missing record, `{ "error": "message" }` bodies, and data access only
through the store.

**Description wording:** it names the concrete triggers — "a new
`routes/<resource>.js` router, a new method on an existing route, or a new
`db/store.js` accessor" — tied to *this* Express repo, and then lists explicit
exclusions ("Do not use for non-Express work, run-the-tests / lint / build
requests, dependency bumps, or CI and config edits") so it fires on endpoint work
and stays quiet on everything nearby.

**Confirmed it fires:** `claude -p "Add a DELETE /users/:id endpoint..."` (skill
never named) — the first tool call was `Skill(add-api-endpoint)`.

## The command

`/review-changes` (`.claude/commands/review-changes.md`) reviews the branch's diff
against the `CLAUDE.md` checklist: one router per resource mounted once, data
access only through `db/store.js`, `400`/`404` validation, the `{ "error": ... }`
shape, status codes documented in `docs/api.md`, `node:test` + `supertest` specs
covering the 400/404 branches, and a clean `npm run lint` / `npm test`. It emits a
Pass/Fail/N/A table with `file:line` pointers and a ready-to-commit verdict.

It's worth a shortcut because it's the exact check to run before every commit or
PR here, it bundles a fixed multi-step prompt (inspect diff, walk eight items,
run lint + tests), and it takes an optional `$ARGUMENTS` target (a path, a
commit range, or a PR number). Verified against a deliberately non-conforming
`DELETE` handler — it flagged the direct array mutation, the missing `404`, the
absent test, and the undocumented endpoint.

## The hook

`PostToolUse` on matcher `Edit|Write|MultiEdit`, running
`.claude/hooks/check-route-conventions.sh` (project scope, in
`.claude/settings.json`).

It **reacts** rather than prevents: after any edit, if the touched file is under
`routes/` and declares module-level mutable state (top-level `let`/`var`) or
imports anything other than `express` and `../db/store`, the script exits `2` and
its message is fed back to Claude to fix. PostToolUse + a non-blocking nudge is
the right call because the check is a heuristic — a hard `PreToolUse` block would
risk false positives on a legitimate edit. It holds the repo's load-bearing rule:
routes stay thin, all state lives in `db/store.js`.

**Confirmed it fires:** ran `claude -p` asking for a `let cache = {}` in
`routes/users.js`; the hook caught it and reported `7:let cache = {};`.

## The headless run

`claude -p "Add a DELETE /users/:id endpoint ... 204 on success, 404
{ \"error\": \"User not found\" } ... add deleteUser to db/store.js, route
through the store, add success + 404 tests, document in docs/api.md, run the
suite."`

**Locked down** with `--allowedTools "Read,Edit,Skill,Bash(npm test:*)"`:

- `Read` + `Edit` — all four target files already exist, so every change is an
  in-place edit; no `Write`, no new files.
- `Skill` — lets the `add-api-endpoint` skill load and drive the flow.
- `Bash(npm test:*)` — self-verify only; scoped to `npm test`, so no `git`,
  `rm`, `node`, or `npm install`.

The scoping held visibly: the agent's `npm test && npm run lint` was denied on
the `npm run lint` half; it fell back to `npm test` and got 7/7. The route
convention hook stayed silent because the handler correctly used
`store.deleteUser`. The app-file changes were then reverted — this level changes
how Claude works on the repo, not what the app does.

## Files in this PR

- `.mcp.json`, `.claude/settings.json` — server + permission rule + hook
- `.claude/skills/add-api-endpoint/SKILL.md` — the skill
- `.claude/commands/review-changes.md` — the command
- `.claude/hooks/check-route-conventions.sh` — the hook script
- `docs/api.md` — the one real change produced by using the `fetch` server (task 1)
- `NOTES.md` — this file

No secrets are committed; the `fetch` server needs none.

## Definition of done

- [x] Server connected at project scope (committed `.mcp.json`), permission rule
  scopes it to `mcp__fetch__fetch`, used once to update `docs/api.md`.
- [x] Project skill in `.claude/skills/add-api-endpoint/`; description fires on
  endpoint work and was confirmed via a headless run that never named it.
- [x] Custom command `.claude/commands/review-changes.md`; run against a
  non-conforming diff and it reported the violations with a verdict.
- [x] Hook at project scope in `.claude/settings.json`; fired on a real edit that
  added module-level state to a route.
- [x] One task run headless with `--allowedTools "Read,Edit,Skill,Bash(npm test:*)"`.
- [x] `NOTES.md` committed.
