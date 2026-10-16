---
description: Review a route file against this project's conventions
argument-hint: <route file or resource, e.g. routes/users.js>
allowed-tools: Read, Grep, Glob
---

Review `$ARGUMENTS` against the course API conventions in CLAUDE.md. Read the file, plus `db/store.js`, its test file in `tests/`, and `docs/api.md`.

Check each item and report PASS or FAIL with a `file:line` for every failure:

1. The router lives in `routes/<resource>.js` and is mounted in `server.js` under its base path.
2. No state is held in the route; all data access goes through `db/store.js`.
3. Input is validated in the route: `400` for bad input, `404` when a record is missing (400 checked before 404).
4. Every error response is JSON shaped `{ "error": "message" }`.
5. Status codes fit: `201` for create, `200` otherwise.
6. Each endpoint has tests covering the happy path and each error path.
7. Each endpoint is documented in `docs/api.md`.

End with a one-line verdict and the single most important fix. Do not edit any files.
