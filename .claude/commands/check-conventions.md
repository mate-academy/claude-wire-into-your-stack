---
description: Review changed/new code against this project's route conventions (JSON error shape, 400/404 rules, db/store.js-only data access)
---

Review the following against this project's conventions (see CLAUDE.md):

- Error responses are JSON in the shape `{ "error": "message" }`
- `400` is returned for bad/missing input, `404` when a record is missing
- All data access goes through `db/store.js` — routes never hold state directly
- One route file per resource, mounted in `server.js` under its base path

Scope: $ARGUMENTS

If no scope is given above, review the diff between the current branch and `main`
(`git diff main...HEAD`) instead of asking for one.

Report each violation found with a `file:line` reference and a one-line fix. If
nothing violates these conventions, say so plainly — don't invent nitpicks.
