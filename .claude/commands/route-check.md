---
description: Review a resource's route against this project's conventions (validation, error shape, store-only data access, tests, docs)
---

Review the `$ARGUMENTS` resource against this project's conventions from
`CLAUDE.md`. Resolve `$ARGUMENTS` to `routes/$ARGUMENTS.js` (or treat it as a
literal file path if it already points at one), then check:

- **Validation**: bad input returns `400`; a missing record returns `404`.
- **Error shape**: every error response body is exactly `{ "error": "message" }`.
- **Store-only access**: the route never holds state itself — every read/write
  goes through `db/store.js`.
- **Mounting**: the router is required and mounted in `server.js` under its
  base path.
- **Tests**: `tests/$ARGUMENTS.test.js` exists, resets the store in
  `test.beforeEach`, and covers both the success path and the `400`/`404`
  edge cases.
- **Docs**: `docs/api.md` documents each endpoint in the same style as the
  existing `Users` section.

Report findings as a short list: what's compliant, what's missing or
inconsistent, and the exact file/line to fix. Don't make changes yet — just
report, unless I ask you to fix what you find.
