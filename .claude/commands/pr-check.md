---
description: Run tests and lint, then review the current diff against this project's conventions before opening a PR
---

Base branch: `${1:-main}`

Do the following, in order, and report the results concisely:

1. Run `npm test` and `npm run lint`. Report pass/fail for each; if either
   fails, show the relevant failure output.
2. Run `git diff ${1:-main}...HEAD` (and include untracked files relevant to
   the change) to see everything this branch changes.
3. Review that diff against the conventions in CLAUDE.md and check, for each
   route touched or added:
   - Input is validated in the route and returns `400` on bad input.
   - A missing record returns `404`.
   - Error responses are JSON in the shape `{ "error": "message" }`.
   - Data access goes through `db/store.js`, not ad-hoc state in the route.
   - The route is mounted in `server.js`.
   - `docs/api.md` was updated to match any endpoint that changed.
   - Tests exist in `tests/` covering the success case and each error case.
4. Report a short checklist of what passes and what's missing — don't fix
   anything automatically, just report.
