---
description: Review API changes against this project's route, store, test, and docs conventions
argument-hint: [file or path — defaults to this branch's diff vs main]
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git branch:*), Bash(npm run lint:*), Bash(npm test:*), Read, Glob, Grep
---

Review the changes below against this project's conventions and report what
would fail review. Review target: $ARGUMENTS (if that is empty, review the
whole branch diff shown here).

- Current branch: !`git branch --show-current`
- Changed files: !`git diff --name-only main...HEAD -- . ":!package-lock.json"; git status --porcelain`
- Diff vs main: !`git diff main...HEAD -- . ":!package-lock.json"`
- Uncommitted diff: !`git diff -- . ":!package-lock.json"`

If those context lines came through empty (some run modes do not pre-run them),
gather the same diff yourself with git before reviewing.

Read any changed route, store, or test file in full before judging it — the
diff alone hides the surrounding handler.

Check every item, in this order:

1. **Route shape** — one router per resource in `routes/`, mounted in
   `server.js` under its base path; a `// METHOD /path — what it does.`
   comment on each handler; every `res` call returned.
2. **Validation contract** — bad input returns `400`, a missing record returns
   `404`, and both return early. Ids from the URL are converted with
   `Number()` before they reach the store.
3. **Error shape** — every error body is exactly `{ "error": "message" }`.
   Flag any other key, a bare string, or a leaked stack trace.
4. **Data access** — no route holds state or reaches around `db/store.js`. New
   data access is a store helper, exported at the bottom of that file, and
   still resettable by `reset()`.
5. **Tests** — `tests/<resource>.test.js` covers the happy path and every
   failure branch the handler can return, and calls `store.reset()` in
   `beforeEach`.
6. **Docs** — `docs/api.md` matches the code: nothing implemented but
   undocumented, nothing documented but unimplemented, status codes listed.

Then run `npm run lint` and `npm test` and report the real results — do not
predict them.

Report as a short list, most serious first, each as
`file:line — what's wrong — the fix`. Separate anything that must change to
pass review from anything that is only a suggestion. If a check passes, say so
in one line rather than restating it. Do not edit any files; this is a review.
