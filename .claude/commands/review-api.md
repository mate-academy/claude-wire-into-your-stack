---
description: Review current changes against this project's API checklist
argument-hint: [optional focus, e.g. "routes/users.js"]
---

Review the uncommitted changes (`git diff HEAD`) against this project's checklist. Focus: $ARGUMENTS (if empty, review everything changed).

Check each item and report pass/fail with file:line for failures:
- One route file per resource, mounted in `server.js`
- All data access goes through `db/store.js`; routes hold no state
- Input validated in the route: `400` on bad input, `404` on missing record
- Error responses are JSON `{ "error": "message" }`
- Tests exist for success, 400 and 404 cases
- `docs/api.md` matches the endpoints

Do not modify files. End with a short verdict: ready to commit or not.
