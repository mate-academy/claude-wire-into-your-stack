---
description: Review the current branch's changes against this project's conventions
argument-hint: [base-branch, defaults to main]
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(npm test:*), Bash(npm run lint:*)
---

Review my changes against this project's conventions in CLAUDE.md.

Base branch: "$ARGUMENTS" (if that is empty, use `main`).

1. Using the base branch above as <base>, run `git diff <base>...HEAD` and `git status` to see everything changed, including uncommitted work.
2. Check each changed file against the checklist below. Quote `file:line` for every problem.
   - One route file per resource, mounted in `server.js` under its base path
   - All data access goes through `db/store.js`; routes hold no state
   - Input is validated in the route: `400` on bad input, `404` when a record is missing
   - Error responses are JSON shaped `{ "error": "message" }`, never plain text or HTML
   - New or changed endpoints have tests covering success and each 400/404 path
3. Run `npm test` and `npm run lint` and report the results.
4. Finish with a short verdict: **ready**, or a list of what to fix. Do not edit any files.
