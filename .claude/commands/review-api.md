---
description: Review changed routes against this repo's API conventions
---

Review $ARGUMENTS (if empty, review the current uncommitted diff via `git diff`
and `git diff --staged`) against this repo's conventions for routes:

- One route file per resource in `routes/`, mounted in `server.js` under its
  base path.
- All data access goes through `db/store.js` — no state held directly in a
  route.
- Bad input returns `400`; a missing record returns `404`.
- Error responses are JSON shaped `{ "error": "message" }`.
- Tests exist in `tests/` for each route (supertest), with
  `test.beforeEach(() => store.reset())`.
- `docs/api.md` documents the endpoint: method, path, and response shape(s).

For each convention, report **pass** or **gap** with the specific file/line,
and for any gap, say exactly what's missing. Don't restate conventions that
are already met at length — focus the output on gaps and how to close them.
