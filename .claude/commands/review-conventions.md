---
description: Review uncommitted changes (or a given ref range) against this project's conventions checklist
argument-hint: "[git ref or range, e.g. main...HEAD — defaults to uncommitted changes]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm test), Bash(npm run lint), Read, Grep, Glob
---

Review the changes in this repo against the project's conventions.

Scope: if `$ARGUMENTS` is non-empty, review `git diff $ARGUMENTS`. Otherwise review
uncommitted work: `git diff HEAD` plus any untracked files from `git status`.

Check every changed file against this checklist and mark each item ✅, ❌ or n/a:

1. **One router per resource** — new resources live in their own `routes/<resource>.js` and are mounted in `server.js`.
2. **Store-only data access** — routes read and write through `db/store.js`; no module-level state in `routes/`.
3. **Validation** — bad input returns `400`; a missing record returns `404`.
4. **Error shape** — every error response is JSON exactly `{ "error": "message" }`.
5. **Status codes** — `201` on create, `204` on delete, `200` otherwise.
6. **Tests** — each new or changed endpoint has tests in `tests/` covering happy path, 400 and 404 where relevant, with `store.reset()` in `beforeEach`.
7. **Docs** — `docs/api.md` describes every new or changed endpoint.
8. **Hygiene** — no secrets, `.env` files, `console.log` debugging or stray files.

Then run `npm run lint` and `npm test` and report the results.

Output format:

- The checklist table.
- A short list of concrete problems, each with `file:line` and the fix.
- A one-line verdict: **Ready**, or **Needs changes**.

Do not edit any files — this is a review only.
