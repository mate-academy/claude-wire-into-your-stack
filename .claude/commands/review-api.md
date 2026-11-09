---
description: Review the current changes against this project's route checklist
argument-hint: [base-branch, default main]
---

Review the changes on this branch against: $ARGUMENTS (use `main` if that is empty). Use `git diff` and the project checklist from CLAUDE.md:

1. Routes live one-per-file in `routes/` and are mounted in `server.js`.
2. All data access goes through `db/store.js` - no state in routes.
3. Input is validated: `400` for bad input, `404` for missing records.
4. Errors are JSON `{ "error": "message" }`.
5. New behavior has tests in `tests/` and is documented in `docs/api.md`.

Run `npm test` and `npm run lint`, then report each checklist item as PASS/FAIL with file:line references, and list any fixes needed. Do not modify files.
