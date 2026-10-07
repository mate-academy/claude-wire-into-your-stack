---
description: Review changed (or given) files against the Course API conventions checklist
argument-hint: "[files or dirs — default: this branch's diff vs main]"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*)
---

Review code in this repo against the project conventions. This is a read-only
review: do not edit any files.

## What to review

Scope: $ARGUMENTS

- If the scope above is empty, review everything this branch changes: run
  `git diff main...HEAD` plus `git diff` and `git status` for uncommitted work.
- Otherwise review exactly the files or directories listed in the scope.

Read `server.js`, `db/store.js`, the related test file in `tests/`, and
`docs/api.md` as context whenever a route file is in scope, even if they are
not themselves in scope.

Read files with the Read, Grep, and Glob tools. Use Bash only for the
`git diff` / `git status` commands above.

## Checklist

For every route/handler in scope, check each item:

1. **One router per resource** — the file in `routes/` exports an Express
   router with `module.exports`, and it is mounted in `server.js` under its
   base path.
2. **No state in routes** — all reads/writes go through `db/store.js`; the
   route holds no arrays, counters, or caches.
3. **Input validation → 400** — body fields and path params are validated in
   the route; bad or missing input returns `400` (note non-numeric ids too).
4. **Missing record → 404** — every lookup by id handles "not found".
5. **Error shape** — every error response is exactly `{ "error": "message" }`.
6. **Tests** — `tests/` covers the happy path, each `400` branch, and the
   `404` branch for this endpoint, with `store.reset()` in `beforeEach`.
7. **Docs** — `docs/api.md` documents the endpoint with the status codes the
   code actually returns.

## Report format

Start with a one-line verdict: `READY`, or `NEEDS WORK (n issues)`.

Then a table with one row per checklist item that applies:

| # | Check | Result | Where | Fix |
|---|-------|--------|-------|-----|

Use ✅ / ❌ / ⚠️ in Result, a `file:line` in Where, and a one-sentence
concrete fix for every ❌ or ⚠️. Skip items that don't apply to the scope
and say which ones you skipped. Only report issues you can point to in the
code — no general style advice.
