---
description: Review this branch's changes against the project's API conventions checklist
argument-hint: "[base-branch, default main]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git merge-base:*), Read, Grep, Glob
---

Review the changes on this branch against the conventions of this project. This is a read-only review: do not edit, create or delete any file.

Base branch: "$ARGUMENTS" (use `main` if empty).

1. Collect the changes: `git diff <base>...HEAD` for committed work, plus `git diff HEAD` and `git status` for uncommitted and untracked files. Read untracked files in full.
2. Read the surrounding code a changed line depends on (the whole route file, `db/store.js`, `server.js`) before judging it.
3. Check every changed file against this checklist:
   1. One route file per resource in `routes/`, exporting an `express.Router()`; a new resource is mounted in `server.js` under its base path.
   2. Routes hold no state; all data access goes through functions exported from `db/store.js`; new collections are seeded in `seed()` so `reset()` clears them.
   3. Input is validated in the route: bad input returns `400`, a missing record returns `404`, create returns `201`, delete returns `204` with no body.
   4. Every error response is JSON in the exact shape `{ "error": "message" }`.
   5. Every changed endpoint has tests in `tests/<resource>.test.js` that call `store.reset()` in `beforeEach` and cover the success case plus its `400` and `404` paths.
   6. `docs/api.md` describes every added or changed endpoint, with its body fields and status codes.
   7. `npm run lint` and `npm test` would pass (judge from the code; do not run them).

Report in this format:

- **Verdict:** `ready` or `needs changes`, in one line.
- **Findings:** one bullet per problem: `path:line` - which checklist item it breaks - what to change. Most serious first. Write "None" if there are none.
- **Checklist:** the seven items above, each marked `pass`, `fail`, or `n/a` (no change touches it).

If the diff contains no API code (only config or docs), say so in the verdict and mark the items `n/a`.
