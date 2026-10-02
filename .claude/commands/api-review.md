---
description: Review a change against this project's route, store, error-shape, test and docs conventions before opening a PR.
argument-hint: [file, ref, or nothing to review this branch vs main]
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git rev-parse:*), Bash(npm run lint), Bash(npm test)
---

## Context

- Branch: !`git rev-parse --abbrev-ref HEAD`
- Uncommitted: !`git status --short`
- Changed vs main: !`git diff main...HEAD --stat`

## Target

$ARGUMENTS

If nothing is named above, review everything this branch changes against `main`,
including uncommitted work. Read the changed files before judging them — the
stat above only tells you where to look.

## Checklist

Check each item against the code. CI already runs lint and tests, so the value
here is the conventions CI cannot see.

1. **Route file** — one file per resource in `routes/`, exporting an Express
   router. Paths inside the router are relative to the mount point (`'/'`,
   `'/:id'`); the base path is not repeated inside the file.
2. **Mounted** — the router is required and mounted in `server.js` under its
   base path.
3. **Store** — no route reads or writes state directly. Every data access goes
   through a `db/store.js` helper, and any new helper is in the `module.exports`
   object at the bottom.
4. **Reset** — `seed()` and `reset()` still return the store to a clean state
   for every key the change touches, so nothing leaks between tests.
5. **Status codes** — `400` for missing or invalid input, `404` for a record
   that does not exist, `201` for a create. The body is validated *before* the
   record is looked up.
6. **Error shape** — every error response is exactly `{ "error": "message" }`:
   a lowercase phrase for validation, `'<Resource> not found'` for a miss.
7. **Handler comments** — each handler has a `// METHOD /path — what it does.`
   comment using the full public path.
8. **Tests** — `tests/<resource>.test.js` uses `node:test` + supertest against
   the imported app, calls `store.reset()` in `beforeEach`, and covers the
   success path *and every error branch the change introduced*.
9. **Docs** — `docs/api.md` has a `### METHOD /path` entry for each new or
   changed endpoint, naming every non-200 status it can return.
10. **Green** — run `npm run lint && npm test`; both must pass. If `node_modules/`
    is missing, do **not** install it and do **not** retry — this is an
    environment gap, not a defect in the change.

## Output

Report only what is actually wrong. For each finding give the checklist number,
`file:line`, what the convention is, and the one-line fix. Group them as:

- **Blocking** — breaks a convention in `CLAUDE.md` or leaves lint/tests red.
- **Worth fixing** — a real gap (an untested error branch, a missing docs entry).

If item 10 could not be run, put it under a separate **Not verified** heading
after those two groups and leave it out of both counts.

End with a single line: `Ready to open a PR` or `N blocking, M worth fixing`.
Do not restate the checklist items that passed, and do not edit any files —
this is a review.
