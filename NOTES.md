# Wiring notes

How Claude is set up to work on this repo, and why.

## Server (MCP)

**`fetch`** (`uvx mcp-server-fetch`), declared in `.mcp.json`. It lets Claude pull in external references while working on the API — mostly MDN status-code pages when a new route needs a code the existing ones don't cover.

**Permission rule:** `.claude/settings.json` allows exactly `mcp__fetch__fetch` — the server's single, read-only tool.

## Skill

`.claude/skills/add-api-route/SKILL.md` captures the repeated "add a new REST resource" flow.

The description is:

> Use when adding a new REST resource or endpoint to this Express API — creating a new file under routes/, its data helpers in db/store.js, and its mount in server.js. Triggers on requests like "add a /products endpoint", "new resource for orders", "expose a route for X". Not for editing an existing route, fixing a bug in one, or non-API code.

## Command

`/sync-api-docs` (`.claude/commands/sync-api-docs.md`). `docs/api.md` is hand-maintained and drifts whenever a route changes. The command diffs every router against the docs — method, path, body fields, status codes, response shape — and fixes `docs/api.md` only, in the existing style. Worth a shortcut because it's run after every route change and the check is tedious to do by hand.

`/review-changes` (`.claude/commands/review-changes.md`) reviews new branch code for test coverage, the `{ "error": "message" }` contract, store encapsulation, and `docs/api.md` sync. Worth a shortcut because it's the pre-PR check — run every time, easy to skip.

## Hook

`PostToolUse`, matcher `Edit|Write`, in `.claude/settings.json`. It lints the project when the edited file is `.js`. It **reacts** after the edit rather than preventing it. Non-`.js` edits are ignored.

## Headless run

`npm run review` — a thin wrapper around `claude -p "/review-changes"`. Allowed only `Read`, `Grep`, `Glob`, and read-only git (`git diff` / `log` / `status`) — no `Edit` / `Write`, no network. Advisory: it prints findings and always exits 0.
