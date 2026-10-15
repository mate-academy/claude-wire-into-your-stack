---
description: Review the diff between the current branch and a base branch against this project's checklist
---

Review the diff between the current branch and the base branch `${ARGUMENTS:-main}` against this project's conventions (see CLAUDE.md).

1. Run `git diff ${ARGUMENTS:-main}...HEAD` (and `git status` for untracked files) to see the full set of changes. If the diff is empty, say so and stop.
2. Run `npm run lint` and report whether it passes. If it fails, show the failing rule(s) and file(s).
3. Run `npm test` and report whether it passes. If it fails, show which test(s) failed and why.
4. Check every changed/added route handler in `routes/` for convention matches:
   - Errors are returned as `{ "error": "message" }`, never a bare string or a different shape.
   - Missing/invalid input returns `400`; a missing record returns `404`.
   - Routes read/write only through `db/store.js`, never local state.
   - New routers are mounted in `server.js` under a base path, following the existing style.
5. If any route file under `routes/` changed (added, removed, or its endpoints changed), check whether `docs/api.md` was updated to match. Flag any endpoint that's missing from the docs or now documented incorrectly.
6. If any route changed, check whether a corresponding test file under `tests/` was added or updated to cover it.

Report findings as a short checklist (✅/❌ per item above), then list concrete issues to fix, each with file:line where possible. Don't restate the whole diff — focus on what's wrong or missing.
