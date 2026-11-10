---
description: Review route changes against this project's conventions
argument-hint: [file or git ref, default = uncommitted changes]
---

Review the changes in `$ARGUMENTS` (if empty, use `git diff HEAD` plus untracked files) against the conventions in CLAUDE.md. Check each item and answer PASS / FAIL with `file:line`:

1. One route file per resource, mounted in `server.js`
2. All data access via `db/store.js` (no state in routes)
3. Input validated in the route: `400` on bad input, `404` on missing record
4. Errors are JSON `{ "error": "message" }`
5. Tests exist (happy path, 400, 404) and `docs/api.md` is updated

Finish with a short list of concrete fixes. Do not edit files.
