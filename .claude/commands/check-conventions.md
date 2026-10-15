---
description: Review changes against this project's conventions checklist (routes, error shape, validation, store access, tests, docs)
argument-hint: [path to review, or leave empty to review the current git diff]
---

Review $ARGUMENTS (if empty, review the uncommitted working-tree diff via `git diff`)
against this project's conventions, defined in `CLAUDE.md`:

1. Route files live one-per-resource in `routes/`, mounted in `server.js` under
   their base path.
2. All data access goes through `db/store.js` — routes never hold state directly.
3. Bad/missing input on a write returns `400`; a missing record returns `404`.
4. Every error response is JSON in exactly the shape `{ "error": "message" }` —
   no extra fields, no plain text.
5. Any new or changed endpoint is reflected in `docs/api.md`.
6. Tests exist for the happy path and each error case, in the style of
   `tests/users.test.js` (`node:test` + `supertest`, `store.reset()` in
   `beforeEach`).
7. `npm run lint` and `npm test` both pass.

Report each item as ✅ / ❌ / N/A with a one-line reason. For anything that
fails, list the concrete fix needed. Do not make any edits — this is a review
only.
