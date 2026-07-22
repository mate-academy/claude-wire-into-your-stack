---
description: Review a route (or the whole API) against this project's conventions, then run tests and lint.
---

Review $ARGUMENTS against this project's conventions (see `CLAUDE.md`):

- data access goes through `db/store.js` only — no state held directly in the route
- missing or invalid required input returns `400`
- a missing record returns `404`, not a thrown error
- error responses are JSON in the shape `{ "error": "message" }`
- a matching test exists in `tests/` covering the success path and the 400/404 paths
- `docs/api.md` documents the endpoint (method, path, body, response codes)

List any convention that's violated or missing, with the file and line. Then run `npm test` and `npm run lint` and report whether they pass.
