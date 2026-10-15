---
description: Review a route file against this project's conventions (CLAUDE.md) and flag deviations
argument-hint: <path to a routes/*.js file>
---

Review the file at `$ARGUMENTS` against this project's conventions, as
documented in `CLAUDE.md`:

1. All data access goes through `db/store.js` — the route must never read or
   write state directly (no module-level arrays, no touching another
   route's data).
2. Input is validated in the route itself: `400` on bad/missing input,
   `404` when a referenced record doesn't exist.
3. Error responses are JSON in the exact shape `{ "error": "message" }` —
   no other error shape (no bare strings, no extra fields, no stack traces).
4. The router is mounted under its own base path in `server.js`, one file
   per resource.

For each convention, either confirm it holds or quote the offending
line(s) and state the minimal fix. Do not rewrite the file yourself —
report findings only, so the developer can decide what to change.

If `$ARGUMENTS` is empty, ask which route file to review instead of
guessing.
