---
description: Review the current changes against this project's CLAUDE.md conventions
argument-hint: "[base-branch, default: main]"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm run lint), Bash(npm test)
---

Review my current changes against this project's conventions. This is a read-only review: do not edit, create or delete any file.

The base to compare against is `$ARGUMENTS` (use `main` if that is empty).

1. Run `git status --short` and `git diff <base>` to see every change, including uncommitted ones. If there is nothing to review, say so and stop.
2. Read `CLAUDE.md`, then check the changes against each item below. Read the changed files in full where the diff is not enough.
3. Run `npm run lint` and `npm test`.

Checklist:
- **Routes**: one route file per resource, mounted in `server.js` under its base path.
- **Data access**: routes never hold state; all reads and writes go through `db/store.js`.
- **Status codes**: `400` for an invalid request body, `404` when a record is missing (a non-numeric id counts as missing), never a crash. A successful `DELETE` returns `204` with no body.
- **Error shape**: every error response is JSON exactly like `{ "error": "message" }`.
- **Tests**: every new or changed behavior has a `supertest` test in `tests/`, including its `400` and `404` cases, and the test file resets the store with `store.reset()`.
- **Docs**: `docs/api.md` describes every new or changed endpoint and its status codes.
- **Checks**: `npm run lint` and `npm test` both pass.

Reply in this format and nothing else:
- One line per checklist item: `PASS`, `FAIL` or `N/A`, then the item name and, for a `FAIL`, the `file:line` and what is wrong.
- A final `Verdict:` line: `Ready` if nothing failed, otherwise `Needs fixes` and the number of failures.
