---
description: Review pending changes against the Course API conventions checklist
argument-hint: "[path | git commit range | PR number] — defaults to this branch's diff vs main"
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git diff:*), Bash(git log:*), Bash(npm test), Bash(npm run lint), Read, Grep, Glob
---

## Context

- Branch: !`git branch --show-current`
- Working tree: !`git status --short`
- Commits vs main: !`git log --oneline main..HEAD`
- Diff stat vs main: !`git diff main...HEAD --stat`

## Task

Review the changes in scope against this project's checklist.

**Scope:** `$ARGUMENTS` if given — a path, a `git` commit range (e.g. `main...HEAD`),
or a PR number. Otherwise: the working tree plus this branch's commits vs `main`.

Read the actual diff for that scope (`git diff`, `git diff main...HEAD`, or the
named files) before judging. For each item, report **Pass / Fail / N/A** with a
one-line reason, and a `file:line` pointer for every Fail:

1. **One route file per resource**, each exporting an `express.Router()` and
   mounted exactly once in `server.js` under its base path.
2. **All data access goes through `db/store.js`** — no route holds state directly
   or reaches past the store to data.
3. **Input validated in the route**: `400` on bad or missing input, `404` when a
   record is missing.
4. **Error responses are `{ "error": "message" }`** JSON — that shape, nothing else.
5. **Status codes**: `201` on create, `200` otherwise; every touched endpoint's
   codes are spelled out in `docs/api.md`.
6. **Tests** (`tests/*.test.js`): `node:test` + `supertest`, `store.reset()` in
   `beforeEach`, and the `400` / `404` branches covered for anything added or changed.
7. **`docs/api.md`** updated for any endpoint whose path, request body, or status
   codes changed.
8. **`npm run lint` and `npm test`** — run both; both must come back clean.

Finish with a one-line verdict: **ready to commit** or **changes needed** — and if
changes are needed, the shortest list of fixes that would get it there.
