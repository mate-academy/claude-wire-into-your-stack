---
description: Short review of changes against this project's conventions
argument-hint: [file | branch | commit range]
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Read, Grep, Glob
---

Review the changes for: $ARGUMENTS

If that is empty, review the uncommitted working tree against HEAD. If it's a file path, review that file's diff (or the whole file if it has no diff). If it's a branch or range, diff it against `main`.

Check against the conventions in CLAUDE.md:
- error responses are JSON shaped `{ "error": "message" }`
- input is validated in the route (400) and missing records return 404
- data access goes only through `db/store.js`; routes hold no state
- new routers are mounted in `server.js`
- tests were added or updated in `tests/`
- `docs/api.md` matches the endpoints

Keep it short: at most 8 bullets, each tagged ✅, ⚠️ or ❌ with a file:line where it applies, then a one-line verdict. Don't edit anything.
