---
description: Audit one resource (or all resources) against this project's conventions
argument-hint: [resource-name]
---

Review the `$ARGUMENTS` resource in this API against the project's conventions (see `CLAUDE.md`). If `$ARGUMENTS` is empty, run this check for every resource under `routes/`.

For each resource, check:

1. `routes/<resource>.js` exists as its own file, exports an Express router, and is mounted in `server.js` under `/<resource>`.
2. All data access for the resource goes through `db/store.js` — the route never holds state directly.
3. Input is validated in the route: missing/invalid input returns `400`, a missing record returns `404`.
4. Every error response is JSON in the shape `{ "error": "message" }` — no other shape.
5. `tests/<resource>.test.js` exists and covers: list, get-404, create, update, update-404.
6. `docs/api.md` documents every endpoint for the resource, matching the actual route behavior (methods, status codes, response shape).

Report each check as pass/fail, citing the specific file and line for any failure. Don't just say "looks good" — if everything passes, still list each check with a pass mark.
