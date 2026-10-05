---
description: Review the current changes against this project's API conventions before committing
argument-hint: "[optional: a path or 'HEAD~1' to review instead of the working tree]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(npm test:*), Bash(npm run lint:*), Read, Glob, Grep
---

Review the changes in this repo against the conventions this project actually
follows. Target: $ARGUMENTS (if that is empty, review the uncommitted working
tree plus anything on this branch that `main` doesn't have).

Start by reading the diff (`git diff`, and `git diff main...HEAD` for the
branch), then check it against this list. Report only what is actually wrong
or risky — don't restate what's already correct at length.

1. **Store access** — do routes read and write only through `db/store.js`
   helpers? Any direct array or state handling in a route file is a finding.
2. **Status codes** — `400` for invalid or missing input, `404` for a record
   that doesn't exist, `201` for a create. Is validation done *before* the
   lookup, so a bad body can't come back as `404`?
3. **Error shape** — every error body is `{ "error": "message" }`. Flag a bare
   string, a `message` key, or an error returned with a `200`.
4. **Undefined handling** — a store helper returns `undefined` for a missing
   record. Flag any place the result is used without that check.
5. **Tests** — is there a test for the happy path, the `400` path and the
   `404` path? Does the test file call `store.reset()` in `beforeEach`?
6. **Docs** — if an endpoint was added or its behaviour changed, does
   `docs/api.md` match the code?
7. **Stray changes** — anything in the diff that doesn't belong to this change:
   debug logging, commented-out code, unrelated formatting, committed secrets.

Then run `npm test` and `npm run lint` and report the result.

Finish with a verdict in this form:

- **Ready to commit** — nothing blocking, plus any nits worth knowing.
- **Needs work** — a numbered list, most important first, each with the file,
  the line, and the smallest fix that resolves it.
