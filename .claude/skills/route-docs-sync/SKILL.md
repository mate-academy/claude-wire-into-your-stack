---
name: route-docs-sync
description: Use when adding, changing, or removing an Express route in this project's routes/*.js files — applies this project's route conventions (input validation, 400 on bad input, 404 on a missing record, JSON error shape { "error": "message" }, data access only through db/store.js) and keeps docs/api.md and the tests in sync with the route change.
---

This project repeats the same shape every time a route changes. A route
change touches four files, always together — treat this as one task with
four required edits, not a route edit that's optionally followed by docs:

1. **Route conventions** (from `CLAUDE.md`):
   - Validate input in the route handler.
   - Return `400` for invalid or missing input, `404` when the record
     doesn't exist.
   - Error responses are JSON: `{ "error": "message" }`.
   - Routes never hold state directly — all data access goes through
     `db/store.js`.

2. **`db/store.js`** — add or update the helper function(s) the route needs
   there, not inline in the route file. Follow the existing style: plain
   functions operating on the in-memory `users` array, exported at the
   bottom.

3. **`docs/api.md`** — add or update the entry for the endpoint: method,
   path, request body, response shape, and status codes, matching the
   style of the existing entries. Use the `docs` MCP server (or `Read`) to
   check the current content before editing it. Do this even if nothing
   else asked for docs — it's part of finishing the route, not a separate
   step to skip when the request only mentioned the route itself.

4. **`tests/users.test.js`** (or the relevant test file) — add or update a
   test covering the happy path and the 4xx case(s) for the change.

Before considering the change done, check off all four files: route,
store, `docs/api.md`, test. A route change that skips `docs/api.md` is
not done, even if the code works and the tests pass.
