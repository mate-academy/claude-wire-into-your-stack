---
description: Review changes against this project's conventions and definition of done
argument-hint: "[git ref or range — defaults to uncommitted changes plus unpushed commits]"
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(npm test), Bash(npm run lint)
---

Current branch: !`git branch --show-current`
Working tree: !`git status --short`
Unpushed commits: !`git log --oneline origin/main..HEAD 2>/dev/null`

## Scope

Review `$ARGUMENTS` if an argument was given — treat it as a git ref or range and review the changes
it names. Otherwise review the uncommitted changes plus every commit ahead of `origin/main`.

Read the actual diff before judging anything. Do not infer what changed from the commit messages.

## Checklist

Work through all eight. CI only covers the first one, so the rest are the point of this command.

1. **Tests and lint** — run `npm test` and `npm run lint`. Both must be clean. CI runs exactly these
   two on every push to `main` and every PR, so a failure here fails the PR.
2. **Router mount order** — any `app.use('/base', router)` added to `server.js` must sit *above*
   `app.use(notFound)`. Below it, the catch-all swallows the route: it returns
   `404 {"error":"Not found"}` with no error, no failed import, and nothing in the logs.
3. **State ownership** — data access goes through `db/store.js`. Routes hold no module-scope state of
   their own. New seed data belongs inside `seed()`, since `reset()` is what isolates the tests.
4. **Error shape** — every error body is `{ error: 'message' }`: `400` on bad input, `404` on a missing
   record. No per-route `try`/`catch` — `middleware/errors.js` already converts thrown errors and hides
   5xx internals.
5. **Docs in sync** — if the set of endpoints or their status codes changed, `docs/api.md` reflects it,
   in the existing `### METHOD /path` heading style.
6. **Lint coverage** — the `lint` script in `package.json` enumerates directories
   (`eslint server.js routes middleware db tests`). If this change added a new top-level directory, it
   must be listed there, or it is silently never linted.
7. **Failure paths tested** — new or changed routes have coverage for the `400` and `404` they can
   return, not just the happy path. Tests use `node:test` + `supertest` with
   `test.beforeEach(() => store.reset())`.
8. **Nothing leaked** — `.mcp.json` references secrets as `${VAR}` and contains no literal tokens; no
   `.env*` file is staged; `.claude/settings.local.json` is not committed.

## Output

Report only. Do not edit, stage, or commit anything — if something fails, say what and where, and stop.

- One line per item: `PASS` or `FAIL`, item name, and one sentence of evidence.
- For each `FAIL`, give `file:line` and the specific fix.
- Skip items that genuinely do not apply to this diff and mark them `N/A` with the reason.
- End with `N of 8 passed` and, if anything failed, the single most important thing to fix first.
