---
description: Review a route file (or the current diff) against this repo's API conventions
---

Review $ARGUMENTS against this repo's conventions (see `CLAUDE.md`):

- All data access goes through `db/store.js` — routes never hold state directly.
- Input is validated in the route: `400` with `{ "error": "message" }` for bad input, `404` with `{ "error": "message" }` when a record is missing.
- Error responses are always JSON in the shape `{ "error": "message" }` — no other shape.
- One route file per resource, mounted in `server.js` under its base path.
- Tests exist under `tests/` covering the success path and each error case the route can return.

If no argument is given, review `git diff` (falling back to `git diff --staged` if the working tree is clean) instead of a specific file or route.

Report violations as a list with `file:line` and a one-line fix suggestion. Don't edit anything — this is a review only.
