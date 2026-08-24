---
description: Audit one resource's route file against the project checklist and check docs/api.md still matches it.
argument-hint: <resource> (e.g. users, health)
allowed-tools: Read, Grep, Glob
---

Audit the **$ARGUMENTS** resource of this API. This is a read-only review —
report findings, do not edit any files. Read the source directly; do not run
shell commands (no `npm test`, no `git`) - judge test coverage from the test
file itself.

Read `routes/$ARGUMENTS.js`, the helpers it calls in `db/store.js`, how it is
mounted in `server.js`, and the `$ARGUMENTS` section of `docs/api.md`.

Check each point below and say explicitly whether it passes or fails:

**Project conventions** (from CLAUDE.md)

1. The router lives in its own file under `routes/` and is mounted in
   `server.js` under its base path.
2. All data access goes through `db/store.js` — the route holds no state of
   its own and never touches the `users` array directly.
3. Input is validated in the route, returning `400` on bad input.
4. A missing record returns `404`, not `500` or an empty `200`.
5. Every error response is JSON in the shape `{ "error": "message" }` — no
   bare strings, no `{ message: ... }`.
6. A create returns `201`; other successful responses return `200`.

**Docs contract**

7. Every route handler in the file appears in `docs/api.md`.
8. `docs/api.md` documents no endpoint that no longer exists.
9. For each endpoint, the documented status codes, required fields, and
   response shape match what the code actually does.

**Test coverage**

10. `tests/$ARGUMENTS.test.js` covers the happy path plus each `400` and `404`
    branch the route can return.

Finish with a short prioritised list of what to fix, most important first. If
something is genuinely fine, say so in one line rather than padding the report.
If there is no `routes/$ARGUMENTS.js`, say so and list the resources that do
exist instead of guessing.
