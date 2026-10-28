---
description: Review current branch changes against the Course API checklist
argument-hint: [base-branch]
---
Review my changes against the base branch `$1` (if empty, use `main`): run `git diff <base>...HEAD` plus uncommitted changes.

Check each item and report pass/fail with file:line for any fail:
- Data access only through `db/store.js`; routes hold no state
- Input validated: `400` on bad input, `404` on missing record
- Errors are JSON `{ "error": "message" }`
- New routers mounted in `server.js`
- Tests added/updated in `tests/` (happy path, 400, 404)
- `docs/api.md` updated for any endpoint change
- No secrets or `.env` values committed

Run `npm run lint` and `npm test`. End with a 3-line verdict: ready / needs changes, and the top fixes.
