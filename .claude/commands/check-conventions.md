---
description: Review changes against this project's conventions checklist
argument-hint: [file, route or branch to review (default: current uncommitted changes)]
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Read, Grep, Glob
---

Review `$ARGUMENTS` against this project's conventions. If no argument was given, review the current uncommitted changes (`git diff` and `git status`).

Check each item and report it as pass, fail or not applicable, with the `file:line` for every failure:

1. **State:** routes never hold state; all data access goes through `db/store.js`.
2. **Structure:** one route file per resource, and a new resource is mounted in `server.js` under its base path.
3. **Validation:** input is validated in the route; bad input returns `400` and a missing record returns `404`.
4. **Error shape:** every error response is JSON as `{ "error": "message" }`.
5. **Responses:** create returns `201`; handlers `return` their response so none can respond twice.
6. **Tests:** every new or changed endpoint has supertest tests for success, `400` and `404`, and the file keeps `store.reset()` in `beforeEach`.
7. **Docs:** every new or changed endpoint has an up-to-date entry in `docs/api.md`.

End with a short verdict: ready to commit, or the list of fixes needed. Do not edit any files.
