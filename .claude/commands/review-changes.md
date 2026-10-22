---
description: Review the current branch's changes against this project's conventions
argument-hint: "[base branch, default main]"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(npm test), Bash(npm run lint), Read, Grep, Glob
---

Review the changes on this branch compared with the base branch "$ARGUMENTS" (if that is empty, use `main`).

1. Run `git log --oneline <base>..HEAD` and `git diff <base>...HEAD` to see what changed. Include uncommitted changes from `git status` too.
2. Check every changed file against the conventions in CLAUDE.md:
   - one route file per resource, mounted in `server.js`
   - all data access through `db/store.js`, no state in routes
   - input validated in the route: `400` on bad input, `404` for a missing record
   - error bodies are `{ "error": "message" }`
   - new or changed endpoints have tests in `tests/` and are documented in `docs/api.md`
3. Run `npm test` and `npm run lint` and report the results.
4. Look for bugs and edge cases: missing ids, empty strings, wrong status codes, ids compared as strings.

Answer with a short list grouped as **Must fix**, **Should fix** and **Looks good**, each item naming the file and line. Do not edit any files.
