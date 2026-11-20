---
description: Review route code against this project's checklist
argument-hint: [file or route name]
---

Review $ARGUMENTS (if empty, review the current `git diff` against main) against this project's conventions. For each item, report PASS or FAIL with a one-line reason and `file:line` for failures:

1. One route file per resource, mounted in `server.js` under its base path.
2. All data access goes through `db/store.js`; the route holds no state.
3. Input is validated in the route: `400` on bad input, `404` when a record is missing.
4. Error responses are JSON shaped `{ "error": "message" }`.
5. Tests exist in `tests/` covering success, `400`, and `404`.
6. `docs/api.md` documents the endpoint.

End with a one-sentence verdict. Do not edit any files.
