---
description: Review the current changes against this project's conventions checklist
argument-hint: "[optional: file or path to focus on]"
---

Review the changes on the current branch against the Course API conventions. Focus on
`$ARGUMENTS` if given, otherwise review everything that differs from `main`.

First run `git diff main...HEAD --stat` and `git diff main...HEAD` to see what changed.

Then check each item and report it as ✅ pass / ❌ fail / ⚠️ not applicable, with the
`file:line` for any problem:

1. **One route file per resource** — each new resource is its own `routes/<name>.js`,
   mounted in `server.js` under its base path.
2. **Data access through `db/store.js`** — no route holds state directly; all reads/writes
   go through store helpers.
3. **Validation & status codes** — input validated in the route; `400` on bad input,
   `404` on a missing record, `201` on create.
4. **Error shape** — every error response is JSON `{ "error": "message" }`.
5. **Tests exist and pass** — new behaviour has tests in `tests/` using `node:test` +
   `supertest`, with `store.reset()` in `beforeEach`. Run `npm test` and report the result.
6. **Lint clean** — run `npm run lint` and report any findings.
7. **No leftovers** — no commented-out code blocks, no secrets, no stray debug logging.

End with a short verdict: ready to commit, or the specific fixes needed first.
