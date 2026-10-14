---
description: Review this branch's changes against the project's route checklist
argument-hint: [base-branch]
---

Review the changes on this branch compared with the base branch given here: $ARGUMENTS (if empty, use `main`). Use `git diff <base>...HEAD` to see them, and apply this project's checklist:

1. Each resource has its own file in `routes/` and is mounted in `server.js`.
2. All data access goes through `db/store.js`; routes hold no state.
3. Input is validated in the route: `400` on bad input, `404` when a record is missing.
4. Every error response is JSON shaped `{ "error": "message" }`.
5. New or changed endpoints have tests (happy path, 400, 404) and are documented in `docs/api.md`.

Run `npm test` and `npm run lint`. Report each checklist item as PASS/FAIL with file:line references, then list concrete fixes. Do not edit files.
