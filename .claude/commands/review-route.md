---
description: Review a route file against this project's conventions
argument-hint: <path to a route file, e.g. routes/users.js>
---

Review the route file `$ARGUMENTS` against the conventions in CLAUDE.md. Read the file, then check each point and answer PASS or FAIL with the line number for every FAIL:

1. Data access: the route reads and writes only through `db/store.js` and holds no state of its own.
2. Validation: bad input returns `400`.
3. Missing records: a record that does not exist returns `404`.
4. Error shape: every error response is JSON `{ "error": "message" }`, nothing else.
5. Status codes: a successful create returns `201`.
6. Each handler has a `// METHOD /path — description.` comment above it.
7. Tests: `tests/` has a test for every success case and every 400/404 this route can return.
8. Docs: `docs/api.md` describes every endpoint in the file.

Finish with a short summary: how many checks passed, and the single most important fix. Do not edit any files; this is a review only.
