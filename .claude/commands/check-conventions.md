---
description: Review the current diff (or the given paths) against the Course API conventions in CLAUDE.md
argument-hint: "[paths...]  (optional; defaults to uncommitted + branch changes)"
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep, Glob
---

You are reviewing code in the Course API against its own conventions. This is a **review only**: do not edit any files.

## What to review
- If paths were given, review exactly these: `$ARGUMENTS`
- If no paths were given, review what changed. Run `git status --short` and `git diff main...HEAD` plus `git diff` (to catch uncommitted work), then review the changed `.js` and `docs/` files.

Read `CLAUDE.md` first, then each file under review. For every route, also read `server.js` (mounting), `db/store.js` (data access), the matching `tests/*.test.js` and `docs/api.md`.

## Checklist
Check each item and mark it **PASS**, **FAIL**, or **N/A**:

1. **One router per resource.** Each resource has its own `routes/<resource>.js` exporting an Express router, mounted in `server.js` under its base path.
2. **No state in routes.** Routes hold no module-level data. All reads and writes go through `db/store.js` helpers.
3. **400 on bad input.** Every handler that takes a body or params validates it and returns `400` when it's invalid.
4. **404 on missing records.** Every handler that looks up a record by id returns `404` when it isn't found.
5. **Error shape.** Every error response is JSON `{ "error": "message" }`, never plain text or another shape.
6. **Tests.** Each endpoint has `node:test` + supertest tests that use `store.reset()` in `beforeEach` and cover the happy path and the 400 and 404 cases that apply.
7. **Docs.** `docs/api.md` documents each endpoint with its body and every status code it returns, and matches the code.

## Output format
Start with one line: `Verdict: READY` or `Verdict: NEEDS CHANGES`.

Then a table:

| # | Check | Result | Evidence / fix (`file:line`) |
|---|-------|--------|------------------------------|

Then, only if anything failed, a short numbered list of the concrete fixes, most important first. Keep it under 25 lines. Don't restate the checklist and don't praise.
