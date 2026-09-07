---
description: Run lint + tests and review the current branch's diff against this repo's conventions before opening a PR.
---

Run a pre-PR check on the current branch of this repo:

1. Run `npm run lint` and `npm test`. Report any failures verbatim — do not summarize away error
   output.
2. Run `git diff main...HEAD` (fall back to `git diff origin/main...HEAD` if `main` isn't
   available locally) to see everything this branch changes.
3. Review that diff against this project's conventions (see CLAUDE.md): one route file per
   resource mounted in `server.js`, all data access through `db/store.js`, `400`/`404`
   validation, and the `{ "error": "message" }` error shape.
4. Report:
   - lint/test result (pass/fail, with the actual failures if any)
   - a short summary of what changed
   - any convention violations you found, with file:line references
   - whether this looks ready to open a PR

Do not modify any files — this is a review-only pass.
