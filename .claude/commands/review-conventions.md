---
description: Review API changes against this project's conventions checklist (store, routes, status codes, errors, tests, docs)
argument-hint: "[git ref/range or paths — default: uncommitted changes]"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*)
---

Review the API changes in this repo against the project's conventions. This is a
read-only review: do not edit files, do not run npm.

## Scope

Scope argument: `$ARGUMENTS`

- Empty → review uncommitted changes: `git diff HEAD --ignore-cr-at-eol -- server.js routes db tests docs`.
- Looks like a git ref or range (e.g. `main`, `HEAD~3`, `main...HEAD`) → `git diff <it> --ignore-cr-at-eol -- server.js routes db tests docs`.
- Otherwise treat it as file paths and review those files as they are now.

Only judge what is in scope; read surrounding code (e.g. the whole route file, the
matching test file, `docs/api.md`) just to check the items below. If the scope has no
changes to `server.js`, `routes/`, `db/`, `tests/` or `docs/`, say so and stop.

## Checklist

For every endpoint added or changed in scope, check:

1. **Store** — data is read/written only through helpers in `db/store.js`; the route keeps
   no state. New helpers are exported; missing records return `undefined`; new resources
   are seeded in `seed()` so `reset()` restores them.
2. **Router** — one file per resource in `routes/`, exporting an `express.Router()`, mounted
   in `server.js` under its base path. Each handler has a `// METHOD /path — …` comment.
3. **Validation** — bad or missing input returns `400`, including a non-integer `:id`.
4. **Missing record** — returns `404`.
5. **Success codes** — `200` read/update, `201` create, `204` delete with no body.
6. **Error shape** — every error is JSON `{ error: '…' }`; no plain text, no other keys.
7. **Tests** — `tests/<resource>.test.js` has one test per status the endpoint can return
   (happy path and every 400/404), uses `store.reset()` in `beforeEach`, names tests
   `'<METHOD> <path> <behaviour>'`, and asserts `res.body.error` on error cases.
8. **Docs** — `docs/api.md` has a `### METHOD /path` section listing the body and every
   status code, matching what the code actually does.

## Output

1. One line: what was reviewed (the scope and the endpoints found).
2. A table: `| # | Check | Result | Where |` with ✅ / ❌ / n/a, and `file:line` for each ❌.
3. **Findings** — for each ❌, most important first: what's wrong, the `file:line`, and the
   concrete fix in one or two lines. Mark problems that predate the change in scope as
   "pre-existing" so they don't get mixed up with what the change introduced.
4. If everything passes, say so in one line — no padding.
