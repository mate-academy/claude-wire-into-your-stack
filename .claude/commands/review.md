---
description: Review the current branch's changes (or a given file/path) against the Course API checklist
argument-hint: "[optional file or path to focus on]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm test), Bash(npm run lint), Read, Grep, Glob
---

Review the changes on this branch against `main` for the Course API.
Focus: $ARGUMENTS (if empty, review everything that changed).

1. Run `git diff main...HEAD --stat` and `git diff main...HEAD` (plus `git status` for uncommitted work) to see what changed.
2. Check every changed route, store and test file against this checklist:
   - [ ] Data access only through `db/store.js` — no state held in routes
   - [ ] One route file per resource, mounted in `server.js`
   - [ ] Input validated in the route; `400` on bad input, `404` when a record is missing
   - [ ] Every error response is JSON `{ "error": "message" }`
   - [ ] Handlers `return` their response (no double-send)
   - [ ] New/changed behaviour has a test, including its error cases
   - [ ] `docs/api.md` matches the actual endpoints and status codes
   - [ ] No secrets, `.env` values or `settings.local.json` committed
3. Run `npm run lint` and `npm test` and report the results.

Reply with:
- **Verdict:** Ready / Needs changes
- **Checklist:** each item ✅ / ❌ / n/a, with file:line for any ❌
- **Fixes:** the smallest concrete change for each ❌

Do not edit any files — this is a review only.
