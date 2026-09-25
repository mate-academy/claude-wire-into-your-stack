---
description: Review the current changes against this project's conventions in CLAUDE.md and flag violations
---

Review the pending changes on this branch against the conventions documented in
`CLAUDE.md`. Scope: $ARGUMENTS (if empty, review everything currently uncommitted
via `git diff` plus any new untracked files relevant to the API).

For each file touched, check:

- **Route placement**: one route file per resource in `routes/`, mounted in
  `server.js` under its base path — no route logic living elsewhere.
- **Data access**: all reads/writes go through `db/store.js` — routes never hold
  or mutate state directly.
- **Input validation**: bad input returns `400`; a missing record returns `404`.
- **Error shape**: every error response is JSON in the exact shape
  `{ "error": "message" }` — no bare strings, no extra fields.

Report findings as a short list: file, line (if applicable), which convention is
violated, and a one-line suggested fix. If everything checks out, say so plainly —
don't invent nitpicks to fill space.
