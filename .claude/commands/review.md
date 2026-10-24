---
description: Review current changes (or a given file/ref) against this project's checklist
argument-hint: "[file, folder or git ref — defaults to uncommitted changes]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm test), Bash(npm run lint), PowerShell(git diff:*), PowerShell(git status:*), PowerShell(git log:*), PowerShell(npm test), PowerShell(npm run lint), Read, Grep, Glob
---

Review the code for this Course API project.

Target: $ARGUMENTS
If the target is empty, review the uncommitted changes (`git status` and `git diff HEAD`). If it is a git ref, review `git diff <ref>...HEAD`. If it is a file or folder, review those files.

Check each item and mark it ✅, ❌ or n/a, quoting `file:line` for every ❌:

1. **Store only** — routes read and write data only through `db/store.js`; no module-level state in `routes/`.
2. **One file per resource** — each resource has its own `routes/<name>.js`, mounted in `server.js` under its base path.
3. **Validation** — bad input returns `400`; a missing record returns `404`.
4. **Error shape** — every error response is exactly `{ "error": "message" }`.
5. **Tests** — new or changed behaviour has tests in `tests/` covering the happy path and each `400`/`404` branch; tests call `store.reset()` in `beforeEach`.
6. **Docs** — `docs/api.md` matches the endpoints that exist.
7. **Lint and tests** — run `npm run lint` and `npm test` and report the result.

Finish with a one-line verdict: **Ready to merge** or **Needs changes**, followed by the list of fixes in priority order. Do not edit any files.
