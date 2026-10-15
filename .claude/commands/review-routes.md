---
description: Review route changes against this project's conventions checklist
---

Review the route/API changes in this repo against the Course API conventions.

Target: $ARGUMENTS (if empty, review the current uncommitted diff via `git diff`;
if it names a file or path, review that file instead).

Check every route handler touched against this checklist, taken from
`CLAUDE.md` and `routes/users.js`:

- [ ] One router file per resource, mounted in `server.js` under its base path
- [ ] All data access goes through `db/store.js` — no state held in the route file
- [ ] Bad/missing input returns `400`; a missing record returns `404`
- [ ] Every error response is JSON shaped exactly `{ "error": "message" }`
- [ ] Route params are converted with `Number(...)` before lookup, where the
      store keys on numeric id
- [ ] Status codes: `200` reads/updates, `201` creates, `400`/`404` as above
- [ ] Tests exist under `tests/` mirroring `tests/users.test.js`, resetting the
      store in `test.beforeEach`
- [ ] `docs/api.md` documents any new/changed endpoint

Report findings as a short list: file:line, what's wrong, and the one-line fix.
If everything checks out, say so plainly instead of inventing nitpicks.
