---
description: Review changes against this project's API conventions
argument-hint: [file, folder, or git ref - defaults to uncommitted changes]
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*)
---

Review the code for: $ARGUMENTS

If no target was given, review the uncommitted changes (`git diff HEAD`). Otherwise treat the target as a file, folder, or git ref.

Check each item against the project conventions in CLAUDE.md:

1. Data access goes through `db/store.js`; routes hold no state of their own.
2. One route file per resource, mounted in `server.js` under its base path.
3. Input is validated in the route: `400` for bad input, `404` for a missing record, `201` for creates.
4. Every error response is JSON shaped `{ "error": "message" }`.
5. New or changed behavior has tests covering the happy path and each `400`/`404` branch.
6. `docs/api.md` documents any new or changed endpoint.

Report as a short checklist, one line per item: PASS, FAIL, or N/A. For each FAIL, give `file:line` and the one-line fix. Do not edit any files.
