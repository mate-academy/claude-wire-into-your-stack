# NOTES

## Server (MCP)

Connected the `fetch` server (`uvx mcp-server-fetch`) at project scope in `.mcp.json`.
It's useful on this repo because the code is a thin Express wrapper over well-documented
conventions (routing, middleware) — being able to pull the current Express docs on demand
beats relying on training-data memory of the API. It's credential-free, so no secrets to
manage. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch` —
not a blanket allow on the server — since fetching is the only capability this server
exposes that we want auto-approved. Used it to pull `https://expressjs.com/en/guide/routing.html`
while reviewing this repo's route conventions.

## Skill

Added `.claude/skills/add-rest-resource/SKILL.md`, capturing this repo's repeated pattern
for adding a new resource: store functions in `db/store.js` first, one router file per
resource, `400`/`404` validation, the `{ "error": "message" }` shape, mounting in
`server.js`, matching tests, and a docs update. The description is scoped to *creating a
new* resource/endpoint ("add a /products route", "create a new resource for orders") so it
doesn't fire on edits to existing routes. Confirmed it fires: asked (in a separate session,
without naming the skill) to "Add a /products endpoint to the API," and it loaded
`add-rest-resource` automatically before doing the work.

## Command

Added `.claude/commands/check-conventions.md` — a reusable review pass that checks a diff
(scoped to `$ARGUMENTS` if given, otherwise the working diff) against the four conventions
in `CLAUDE.md`: store-only data access, 400/404 validation, the error shape, and matching
tests/docs. It's worth a shortcut because it's the kind of check you want before every
commit touching a route, not just when adding one. Ran it against the products scaffold
generated while testing the skill above — it correctly flagged an inconsistent validation
bug (POST validated `price` was a number, PUT didn't) and confirmed the rest matched
convention.

## Hook

Added a `PostToolUse` hook on `Edit|Write|MultiEdit` in `.claude/settings.json` that runs
`eslint --fix` on any `.js` file just touched. Chose react-after (PostToolUse) over
prevent-before (PreToolUse) because linting is naturally a fix-up step, not something that
should block an edit from landing. Verified it fires: wrote a file with a redundant
`if (!!foo)`, and the hook rewrote it to `if (foo)` immediately after the Write, confirmed
via a `PostToolUse` hook notification and by re-reading the file.

## Headless run

Ran `claude -p "Run the test suite and the linter, then report a concise pass/fail
summary..."` with `--allowedTools "Bash(npm test)" "Bash(npm run lint)"`. Locked it down to
exactly those two commands — nothing else — since the task only needed to observe output,
never to modify files or run arbitrary shell commands unattended.
