---
description: Review new branch code for test coverage, the API contract, store encapsulation, and doc sync
---

Review the new code on this branch. **Report only — do not edit any file.**

## Scope

Establish what changed from `git diff main...HEAD`, `git diff HEAD`, and
`git status`. If `$ARGUMENTS` is given, use it as the base ref instead of `main`.
Review every added or changed route handler under `routes/`, plus the
`db/store.js`, `server.js`, `tests/`, and `docs/api.md` changes that go with it.
Ignore changes under `.claude/` and other tooling files.

## Checks

Tag every finding with `file:line` and the specific gap.

1. **Validation parity & correctness**
   - Create and update paths validate the same way — no repeat of the split in
     `routes/users.js` where `POST` rejects falsy `name`/`email` (`:23`) but `PUT`
     only checks `=== undefined` (`:33`), so `{ "name": "" }` slips through.
   - `:id` and other params are validated, not just `Number()`-coerced — a
     non-numeric id should be a `400`, not a silent `404`.
   - Every field the handler or `docs/api.md` calls required is actually checked.

2. **Error / response contract**
   - Every error path returns JSON shaped `{ "error": "message" }` — never a bare
     string, an array, or another shape.
   - `201` + created body on create, `200` on read/update, `404` for a missing
     record, `400` for bad input.
   - No `500` reachable from user input (e.g. reading `req.body.x` without
     confirming `req.body` is an object).

3. **Store encapsulation & reset coverage**
   - No `let` / arrays / counters in a route file — all state through `db/store.js`
     helpers.
   - Any new module-level state in `db/store.js` is cleared by `seed()`, so
     `reset()` covers it. (Missing this is the common test-flakiness bug here.)
   - New helpers are listed in `module.exports`.

4. **Test coverage & conventions**
   - A `tests/<resource>.test.js` exists for each new resource.
   - It uses `node:test` + `node:assert` + `supertest`, imports `../server` (never
     opens a port), and has `test.beforeEach(() => store.reset())`.
   - One assertion cluster per status code the route can return — the happy path
     **and** every error branch (`400`, `404`, …).

5. **`docs/api.md` sync**
   - A section for every added or changed endpoint, in the existing style: the
     resource object-shape block, `###` per route, every status code named.

## Output

Numbered findings, most important first, each with `file:line` and what's missing
or wrong. If nothing turns up, say "No high-value issues found."
