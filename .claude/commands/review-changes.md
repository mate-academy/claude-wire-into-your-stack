---
description: Review the current changes against this project's conventions checklist
argument-hint: "[base ref, default: main]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm test), Bash(npm run lint), Read, Grep, Glob
---

Review the changes on this branch compared to `$ARGUMENTS` (if that is empty, compare to `main`).
Include uncommitted changes too: use `git diff <base>...HEAD` plus `git diff` and `git status`.

Check every changed file against this project's checklist (see CLAUDE.md):

1. **One route file per resource** in `routes/`, mounted in `server.js` under its base path.
2. **No state in routes** — all data access goes through `db/store.js`.
3. **Validation** — bad input returns `400`, a missing record returns `404`.
4. **Error shape** — every error response is JSON `{ "error": "message" }`.
5. **Tests** — each new or changed endpoint has tests in `tests/` for its success and error paths.
6. **Docs** — `docs/api.md` describes every new or changed endpoint.
7. **No secrets** — nothing like keys or tokens in `.mcp.json`, settings or code.

Then run `npm run lint` and `npm test`.

Report as a short table: checklist item | pass / fail / n/a | file:line and one-line reason.
Finish with the lint and test result and a one-line verdict: **ready for PR** or **needs changes** (list them).
Do not edit any files.
