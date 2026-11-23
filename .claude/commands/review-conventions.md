---
description: Review the current changes against this project's CLAUDE.md conventions
argument-hint: "[base-branch, default: main, or origin/main if there is no local main]"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git rev-parse:*), Bash(npm run lint), Bash(npm test)
---

Review my current changes against this project's conventions. This is a read-only review: do not edit, create or delete any file.

The base to compare against is `$ARGUMENTS`. If that is empty, use the local `main` branch when it exists (check with `git rev-parse --verify --quiet main`). If there is no local `main`, which is normal in a fresh clone of a feature branch, use `origin/main` instead. Say which base you used.

1. Run `git status --short` and `git diff <base>` to see every change since the base, both committed and uncommitted. If there is nothing to review, say so and stop.
2. Read `CLAUDE.md`, then check the changes against each item below. Read the changed files in full where the diff is not enough.
3. Run `npm run lint` and `npm test`.

Checklist:
- **Routes**: only the structure. `FAIL` only if a new resource has no route file of its own in `routes/`, or its router is not mounted in `server.js` under its base path. A bug inside a handler is not a Routes failure: report it under Data access, Status codes, Error shape, Tests or Docs. `N/A` if no routes changed.
- **Data access**: routes never hold state; all reads and writes go through `db/store.js`.
- **Status codes**: `400` for an invalid request body, `404` when a record is missing (a non-numeric id counts as missing), never a crash. A successful `DELETE` returns `204` with no body.
- **Error shape**: every error response is JSON exactly like `{ "error": "message" }`.
- **Tests**: every new or changed behavior has a `supertest` test in `tests/`, including its `400` and `404` cases, and the test file resets the store with `store.reset()`.
- **Docs**: `docs/api.md` describes every new or changed endpoint and its status codes.
- **Checks**: `npm run lint` and `npm test` both pass.

Reply in this format and nothing else:
- One line per checklist item: `PASS`, `FAIL` or `N/A`, then the item name and, for a `FAIL`, the `file:line` and what is wrong.
- A final `Verdict:` line: `Ready` if nothing failed, otherwise `Needs fixes` and the number of `FAIL` lines above, counted exactly. Each problem is reported under one item only.
