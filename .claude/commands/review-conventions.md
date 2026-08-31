---
description: Review the current diff against this repo's route/error/data-access conventions from CLAUDE.md
---

Review the pending changes in this repo (`git status`, then `git diff` for unstaged
and `git diff --staged` for staged changes — cover both) against this project's
conventions, checked one by one:

1. **One route file per resource.** New routes live in `routes/<resource>.js` and are
   mounted in `server.js` under their base path — no route logic added directly to
   `server.js` or mixed into another resource's file.
2. **All data access goes through `db/store.js`.** Route files never hold state
   directly (no module-level arrays/objects in `routes/*.js`, no reaching into another
   resource's data by hand) — every read/write calls a `db/store.js` helper.
3. **Input validation.** Each route validates its input and returns `400` on bad or
   missing input, `404` when a referenced record doesn't exist. Flag any route that
   skips validation or returns the wrong status for these cases.
4. **Error response shape.** Every error response is JSON shaped exactly
   `{ "error": "message" }` — flag any response with a different shape, extra fields,
   or a plain string/HTML error.

For each violation found, report the file and line, which rule it breaks, and a
one-line fix. If a changed file has a corresponding test in `tests/` that wasn't
updated to cover the change, flag that too. If everything conforms, say so plainly —
don't invent issues to fill space.
