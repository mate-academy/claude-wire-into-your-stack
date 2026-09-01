---
description: Review changed code against this project's conventions checklist from CLAUDE.md
argument-hint: [path]
---

Review the code for conventions violations. If an argument was given, review `$ARGUMENTS`. Otherwise review the current working diff (`git diff`, and `git diff --staged` if there's nothing unstaged).

Check every changed route/store file against this repo's conventions (see `CLAUDE.md`):

1. **Validation** — bad or missing input returns `400`, not a crash or a silent default.
2. **Missing records** — looking up a record that doesn't exist returns `404`, not `200` with `null`/`undefined` or a `500`.
3. **Error shape** — every error response body is JSON in the exact shape `{ "error": "message" }`.
4. **Data access** — routes never hold state directly; all reads/writes go through `db/store.js`.
5. **File layout** — one route file per resource in `routes/`, mounted in `server.js` under its base path.

Report findings as a list: file, line, which rule it breaks, and a one-line fix suggestion. Don't rewrite the code — this is a review, not a fix. If nothing is in violation, say so plainly instead of inventing nitpicks.
