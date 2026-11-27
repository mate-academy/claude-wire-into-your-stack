---
description: Review the current branch's changes against this project's checklist
argument-hint: '[optional focus, e.g. "validation"]'
---
Review every change on the current branch compared with `main` (committed and uncommitted). Check each item and report it as PASS or FAIL with the file and line:

1. Data access goes through `db/store.js` only; no state kept in routes.
2. Bad input returns `400`, a missing record returns `404`, and every error body is `{ "error": "message" }`.
3. Each new or changed endpoint has tests covering success, `404` and `400`, and `npm test` passes.
4. `npm run lint` is clean.
5. `docs/api.md` matches the endpoints and status codes in the code.
6. No secrets, `.env` files or stray debug output.

Extra focus for this review: $ARGUMENTS

Finish with a short list of what must be fixed before opening a PR, most important first.
