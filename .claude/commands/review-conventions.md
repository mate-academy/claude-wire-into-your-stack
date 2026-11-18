---
description: Review changes against this project's conventions (optional scope as argument)
argument-hint: [file, directory, or git ref — defaults to uncommitted changes]
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(npm test:*), Bash(npm run lint:*), Read, Grep
---

Review the following against the conventions in CLAUDE.md.

Scope: $ARGUMENTS
(If the scope above is empty, review the uncommitted changes: `git diff HEAD` plus any new untracked files under `routes/`, `db/`, `tests/`, and `docs/`.)

Current changes:
!`git status --short`

Check each item and report only the ones that fail, with `file:line` references:

1. All data access goes through `db/store.js`; routes hold no state of their own.
2. One route file per resource, mounted in `server.js` under its base path.
3. Input is validated in the route and returns `400` on bad input; missing records return `404`.
4. Every error response is JSON shaped `{ "error": "message" }`. No plain text or other keys.
5. Handlers `return res...` so they can't fall through, and ids are converted with `Number(req.params.id)`.
6. Each new or changed endpoint has tests covering the happy path and every `400`/`404` branch.
7. `docs/api.md` documents the endpoint, its body requirements, and its status codes.

Then run `npm test` and `npm run lint` and report the results.

End with a one-line verdict: "Ready to commit" or a short list of what to fix. Do not edit any files.
