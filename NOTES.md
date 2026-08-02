# Notes

## Server (MCP)

Connected the official `fetch` server (`mcp-server-fetch`, run via `uvx`) at project scope in `.mcp.json`. It's useful here because working on this Express API means occasionally checking real behavior in Express/Node upstream sources (e.g. what `express.Router()` actually does, or what a dependency's changelog says) instead of relying on memory. It needs no credentials. One thing worth calling out: `mcp-server-fetch`'s dependency spec (`mcp>=1.1.3`, no upper bound) currently resolves the latest `mcp` package, which has a breaking import change and fails to start — so `.mcp.json` pins it with `uvx --with "mcp<2" mcp-server-fetch`. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch` (the server's single tool, named explicitly rather than as `mcp__fetch` or `mcp__fetch__*`) so a future tool the server adds isn't auto-approved. Used it for a real task: asked Claude to fetch Express's router source from GitHub and describe its supported HTTP methods — it fetched the live file and reported back accurately (including that the file had moved between Express versions, which memory alone wouldn't have caught).

## Skill

Captured the repeated shape of adding a route to this API: one file per resource in `routes/`, mounted in `server.js`; all data access through `db/store.js` helpers, never state held in the route; `400`/`404` responses shaped as `{ "error": "message" }`; a mirrored test file; a `docs/api.md` update. It's `.claude/skills/new-route/SKILL.md`. The description names concrete trigger phrasing ("add a DELETE endpoint", "create a new /products resource") and explicitly excludes unrelated bug fixes, so it fires on route-shaped requests and not on everything else. Confirmed it fires: ran `claude -p "Add a DELETE endpoint for removing a user by id to this API."` (no mention of the skill) and the transcript shows `Skill` invoked with `"skill":"new-route"`; the resulting diff added a `deleteUser` store helper, a `404`-returning route, matching tests, and a docs entry — then reverted, since that specific endpoint wasn't part of this deliverable.

## Command

Added `/conventions-check` (`.claude/commands/conventions-check.md`), which reviews a diff (`$ARGUMENTS`, or the current uncommitted changes if empty) against this repo's route/store/error conventions and reports a pass/fail checklist with concrete fixes. Worth a shortcut because it's the review I'd otherwise redo by hand before every PR on this repo. Ran it for real against the pre-existing codebase: it correctly passed every structural convention and caught a genuine gap — `tests/users.test.js` had no `400`-path coverage for `POST /users` or `PUT /users/:id` — with the exact test cases to add.

## Hook

Set a `PostToolUse` hook on `Edit|Write` (`.claude/settings.json`, script at `.claude/hooks/lint-fix.sh`) that runs `eslint --fix` on whatever `.js` file was just touched. It reacts rather than prevents — the standard is "stays lint-clean," and auto-fixing after the fact is less friction than blocking the edit outright. Triggered it on purpose: wrote a file containing `return !!!value;` (an ESLint-flagged redundant double negation) through a headless `claude -p` run with `Edit` allowed, and the hook fired and rewrote it to `return !value;` without being asked.

## Headless task

Ran the test-coverage gap that `/conventions-check` found: adding the missing `400`-path tests for `POST /users` and `PUT /users/:id`. Command:

```
claude -p "The tests in tests/users.test.js are missing 400-path coverage for POST /users (missing name/email) and PUT /users/:id (neither field given). Add those two test cases, matching the existing style, then run npm test to confirm everything passes." \
  --allowedTools "Read,Edit(tests/users.test.js),Bash(npm test)"
```

Locked it down to exactly what the task needed: `Read` to see the existing test style, `Edit` scoped to only `tests/users.test.js` (not the routes, store, or docs — this was a test-only fix), and `Bash(npm test)` to verify, nothing broader like general `Bash` or `Write`. It added the two tests and confirmed all 7 pass; that diff is included in this branch.
