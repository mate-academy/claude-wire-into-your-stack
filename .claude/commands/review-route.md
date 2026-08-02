---
description: Review a route file against this project's conventions (validation, error format, store usage)
---

Review `$1` against the conventions in CLAUDE.md:

- One route file per resource, mounted in `server.js` under its base path
- All data access goes through `db/store.js` — the route itself must not hold state
- Returns `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`

Read the file, check it against each rule above, and report any deviations
with the specific line and a suggested fix. If it fully complies, say so
explicitly instead of inventing issues.
