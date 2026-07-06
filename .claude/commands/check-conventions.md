---
description: Check a route file (or the working diff) against this project's conventions in CLAUDE.md
argument-hint: [file-or-route]
---

Review `$ARGUMENTS` against this project's conventions from CLAUDE.md. If
`$ARGUMENTS` is empty, review the current uncommitted changes (`git diff` and
`git diff --staged`) instead.

Check each of these, one at a time, and report pass/fail with the specific
file and line:

1. **One route file per resource** — the route lives in `routes/<resource>.js`
   and is mounted in `server.js` under its base path.
2. **No state in routes** — all reads/writes go through `db/store.js`; the
   route file itself holds no data.
3. **Input validation** — bad input returns `400`, a missing record returns
   `404`.
4. **Error shape** — every error response is JSON shaped exactly
   `{ "error": "message" }`, nothing else.

For each failing check, show the offending line and suggest the specific fix
— don't invent conventions beyond this list, and don't comment on style or
naming choices that CLAUDE.md doesn't mention.
