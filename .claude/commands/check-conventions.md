---
description: Review the current changes (or a given path) against this project's conventions in CLAUDE.md
argument-hint: [path]
---

Review `$ARGUMENTS` (if empty, review the full working-tree diff via
`git diff` and `git status`) against this project's conventions in
`CLAUDE.md`:

- All data access goes through `db/store.js` — routes never hold state
  directly.
- Input is validated in the route: `400` for invalid or missing input,
  `404` when the record doesn't exist.
- Error responses are JSON in the shape `{ "error": "message" }`.
- If a route changed, `docs/api.md` reflects it.
- A test in `tests/` covers the happy path and the 4xx case(s) for the
  change.

Report anything that's out of line with these conventions, with file and
line where possible. If everything checks out, say so plainly — don't
invent issues that aren't there.
