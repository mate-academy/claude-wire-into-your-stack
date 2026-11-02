---
description: Review a route file against this project's conventions
argument-hint: <path to route file>
---

Review `$ARGUMENTS` against the conventions in CLAUDE.md. Check each and report pass/fail with line references:

- Data access goes only through `db/store.js` (no state in the route)
- Input validated in the route, `400` on bad input, `404` on missing record
- Error responses are `{ "error": "message" }`
- Router is mounted in `server.js`
- Tests exist in `tests/` and `docs/api.md` documents the endpoint

End with a short list of concrete fixes. Do not edit files.
