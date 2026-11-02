---
description: Review current changes against the project checklist
argument-hint: [focus area]
---

Review the uncommitted changes (`git diff` and `git diff --staged`) against this project's conventions:

- Routes validate input and return `400` on bad input, `404` when a record is missing
- Errors are JSON shaped `{ "error": "message" }`
- All data access goes through `db/store.js`; routes never hold state
- Route ids are converted with `Number(req.params.id)` before calling the store
- New routes are mounted in `server.js` and covered by tests that call `store.reset()` in `beforeEach`
- `docs/api.md` documents any new or changed endpoint

Focus on: $ARGUMENTS

Report problems as a short list with `file:line` references. Don't edit anything.
