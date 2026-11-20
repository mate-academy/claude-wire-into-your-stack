---
description: Review changes against the Course API checklist
argument-hint: [git ref or file path, default = uncommitted changes]
---

Review the changes in this repo against the project checklist.

Target: $ARGUMENTS
- If the target is empty, review `git diff HEAD` (uncommitted changes).
- If it looks like a git ref/branch, review `git diff $ARGUMENTS...HEAD`.
- If it is a file path, review that file.

Checklist (from CLAUDE.md):
1. One route file per resource in `routes/`, mounted in `server.js` under its base path.
2. All data access goes through `db/store.js`; no state held in routes.
3. Input validated in the route; `400` on bad input, `404` when a record is missing.
4. Every error response is JSON `{ "error": "message" }`.
5. New/changed endpoints have tests in `tests/` (node:test + supertest, `store.reset()` in `beforeEach`).
6. `docs/api.md` matches the actual behaviour.

Output a table: `# | Item | ✅/❌ | file:line | note`, then a short list of concrete fixes. Do not edit files.
