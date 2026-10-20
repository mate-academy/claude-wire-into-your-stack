---
description: Review a route file against this project's API checklist
argument-hint: <route file, e.g. routes/users.js>
---

Review `$ARGUMENTS` against this project's conventions (see CLAUDE.md). Do not edit any files — report only.

Check each item and mark it PASS or FAIL with the line number:

1. All data access goes through `db/store.js` — no state held in the route.
2. Input is validated; bad input returns `400`.
3. A missing record returns `404`.
4. Every error response is JSON shaped exactly `{ "error": "message" }`.
5. Each handler has a one-line `// METHOD /path — ...` comment.
6. Every endpoint in the file is documented in `docs/api.md`.
7. Every endpoint has a success test and an error-case test in `tests/`.

Finish with a short list of the concrete fixes needed, most important first. If everything passes, say so in one line.
