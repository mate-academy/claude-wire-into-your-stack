---
description: Review changes against this project's API conventions checklist
argument-hint: [path to focus on — omit to review the whole working diff]
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm test:*), Bash(npm run lint:*)
---

Review the current changes against this project's conventions before they go
into a pull request.

Scope: $ARGUMENTS

If the scope above is empty, review the whole working diff — run `git status`
and `git diff` (including staged changes) to find what changed. If a path was
given, restrict the review to that path.

Work through this checklist and report on each item explicitly. Say when
something is correct, not only when it is wrong — a clean item is a signal too.

**Structure**
- Is each new route in `routes/<resource>.js`, and mounted in `server.js`
  under its base path?
- Does the route reach data only through `db/store.js`, with no state held in
  the route itself?
- Do store helpers stay free of HTTP concerns — returning `undefined` for a
  missing record rather than sending a response?

**Behaviour**
- Is input validated before any lookup, returning `400` when it is missing or
  invalid?
- Does a missing record return `404` rather than crashing or returning `500`?
- Is every error body shaped `{ "error": "message" }`? Flag any bare string,
  any other key name, and any inconsistent message style.
- Are ids converted with `Number(...)` before being passed to the store?

**Coverage and docs**
- Is there a test in `tests/` for the success path *and* both failure paths?
- Do the tests reset the store with `test.beforeEach(() => store.reset())`?
- Has `docs/api.md` been updated to match — including the status codes the
  endpoint can return?

**Checks**
- Run `npm test` and `npm run lint`, and report the results.

Then give a short verdict: what is ready, and what must change before this is
opened as a pull request. List the must-fix items first, in priority order, and
keep nitpicks separate from real problems. Do not change any files — this is a
review, not a fix.
