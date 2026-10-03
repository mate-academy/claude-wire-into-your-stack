---
description: Review the current branch's changes against this project's conventions checklist
argument-hint: "[base branch, default: main]"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(npm test), Bash(npm run lint), Read, Grep, Glob
---

Base branch: "$ARGUMENTS" — if that is empty, use `main`. Call it BASE below.

1. Run `git diff BASE...HEAD --stat` and `git diff BASE...HEAD`, plus `git status` for uncommitted work.
2. Check every changed file against this project's checklist (from CLAUDE.md):
   - [ ] One route file per resource in `routes/`, mounted in `server.js`
   - [ ] All data access goes through `db/store.js` — no state held in routes
   - [ ] Input validated in the route; `400` on bad input, `404` on a missing record
   - [ ] Every error response is JSON shaped `{ "error": "message" }`
   - [ ] Each new or changed endpoint has tests (happy path + error paths) using `store.reset()` in `beforeEach`
   - [ ] `docs/api.md` updated for any endpoint change
   - [ ] No secrets, `.env` files, or `.claude/settings.local.json` committed
3. Run `npm test` and `npm run lint`.

Report as:
- **Summary** — one or two sentences on what changed.
- **Checklist** — each item above marked ✅ / ❌ / n/a, with `file:line` for every ❌.
- **Tests & lint** — pass/fail.
- **Verdict** — "ready to merge" or the specific fixes needed.

Do not modify any files.
