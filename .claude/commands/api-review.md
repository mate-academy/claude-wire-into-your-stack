---
description: Review changed code against this project's API conventions checklist
argument-hint: "[git ref or path — defaults to uncommitted changes]"
---

Review changed code in this repo against the project's own conventions. Report
only real deviations — do not restate what the code does or praise what is fine.

## 1. Work out the scope

The argument is: `$ARGUMENTS`

Resolve it in this order:

- **Empty** — review uncommitted changes: `git diff HEAD`. If that is empty too,
  review the most recent commit: `git diff HEAD~1 HEAD`.
- **A git ref** — test with `git rev-parse --verify --quiet <arg>` first, since a
  bare name like `docs` can be both a ref and a directory; a ref wins. Review
  `git diff <ref>...HEAD`. If the ref resolves to the same commit as HEAD — which
  happens whenever you are asked to review the branch you are already on — that
  diff is empty by construction: say so and review uncommitted changes instead.
- **A path** — only if it is not a valid ref. Review that path's current contents
  in full, not a diff.

If the resolved diff is still empty after those fallbacks, say so in one line and
stop. Do not widen the scope looking for something to review.

State in one line which scope you resolved and why, then get the diff before
reviewing anything.

**What is in scope:** `server.js`, `routes/`, `db/`, `tests/`, `docs/api.md`.
Ignore everything else in the diff — `.claude/`, `.mcp.json`, CI config, README —
and note in one line that you skipped them. They have no conventions to check.

**Diff-only, with one exception:** findings come from the changed lines. If a file
you are already reviewing has a pre-existing violation on untouched lines, report
it under **Pre-existing** (see step 4) rather than mixing it in or staying silent.
Do not go looking in files the diff does not touch.

## 2. Check against the checklist

Go file by file. These are the project's rules, from `CLAUDE.md`, `docs/api.md`,
and the existing handlers — a violation is a finding.

**Layering**
- All data access goes through `db/store.js`. A route that filters, sorts, or
  mutates an array itself is a finding, even if it works.
- One route file per resource, mounted in `server.js` under its base path.
- Paths inside a router are relative (`'/'`, `'/:id'`) — never `'/users/:id'`.

**Handlers**
- Ids are read as `Number(req.params.id)`.
- Bodies are read as `const { ... } = req.body ?? {};`.
- Validation comes before lookup, so bad input is a 400 before a missing record
  is a 404.
- Every branch of a multi-branch handler uses `return`.
- No try/catch and no `next(err)` — this project has no error middleware.

**Responses**
- Every error body is exactly `{ error: message }`. Any other error shape, or an
  error sent as a bare string, is a finding.
- `201` for a create, `204` via `res.status(204).end()` for a delete, `200`
  otherwise.
- Message casing: `400` is lowercase and names the fields
  (`'name and email are required'`); `404` is capitalised and names the resource
  (`'User not found'`). A mismatch is a finding.

**Tests**
- Every status code an endpoint can return has its own test.
- `node:test` + `supertest`, flat `test(...)` calls, no `describe` blocks.
- `test.beforeEach(() => store.reset());` present once at the top of the file.
- Error tests assert `res.body.error`, not just `res.status`.

**Completeness** — the most common miss, check it explicitly:
- Every added or changed endpoint has a matching entry in `docs/api.md`, and the
  documented statuses match what the handler actually returns.
- A change to *when* an existing status fires counts as a docs change too, even
  though the status set is unchanged. If the conditions in `docs/api.md` no
  longer describe the handler's actual behaviour, that is a finding.
- Every added endpoint has tests.
- A new store helper is in the `module.exports` list, and any new seed data is
  restored by `reset()`.

**Claims about dependencies** — the checklist above cannot catch this, so check it
separately:
- If a change, a code comment, or a test is justified by how a dependency
  behaves, confirm the installed version actually behaves that way. Check
  `package.json` and `node_modules`, not memory.
- A test that passes for a different reason than the one its name or comment
  gives is a finding, even though it is green. Say what it actually exercises.

## 3. Verify before reporting

Run `npm test` and `npm run lint`. Report the actual result of each, including
the pass/fail counts — do this even when you find nothing else.

Then, for each finding, confirm it against the file rather than the diff alone —
a line can look wrong in isolation and be fine in context. Drop anything you
cannot confirm.

## 4. Report

Use these three groups, in this order:

- **Findings** — rules broken by the changed lines. For each:
  `path:line` — the rule broken, and the concrete fix. Worst first.
- **Missing** — docs or tests that should exist for this change and do not.
  Omissions rather than bad lines, so they get their own group.
- **Pre-existing** — anything wrong in the files you reviewed that this change did
  not introduce, including missing tests and docs. One line each, clearly marked
  as not introduced by this change.

Write `None` under **Findings** and **Missing** when they are empty, so it is
visible that you checked rather than skipped. Omit **Pre-existing** entirely when
it is empty.

End the report with the test and lint results from step 3 — always, whether or
not anything else was found. Beyond that, do not pad the report to look thorough.
