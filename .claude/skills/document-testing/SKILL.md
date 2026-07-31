---
name: document-testing
description: This skill should be used whenever the project's testing documentation needs to be created or refreshed — e.g. "document the tests", "update the testing docs", "write testing documentation", or after adding/changing test files and the docs no longer match. Produces/updates docs/testing.md describing how tests are run, structured, and written in this repo.
version: 1.0.0
---

# Document Testing Routines

## Goal

Keep `docs/testing.md` an accurate, current description of how testing works in this
project — not a generic testing guide, but a reflection of what's actually in the repo.

## Before writing

Re-derive the facts from the current state of the repo rather than trusting a previous
version of the doc or memory:

1. Read `package.json` for the `test` (and `lint`) scripts and the test-related
   dependencies (currently Node's built-in `node:test` runner plus `supertest`).
2. Read every file under `tests/` to identify the actual conventions in use, e.g.:
   - one test file per resource (`tests/<resource>.test.js`)
   - `test.beforeEach(() => store.reset())` to isolate tests via `db/store.js`
   - requests made with `supertest` against the exported `app` from `server.js`
   - assertions via `node:assert`, checking status codes and response bodies
   - status codes covered per route (200/201/404/400) and which edge cases have tests
3. Read `.github/workflows/*.yml` for how CI invokes tests (order of steps, Node
   version, whether lint runs before test).
4. Note any resource in `routes/` that has **no** corresponding test file — call this
   out as a gap rather than silently ignoring it.

## Writing docs/testing.md

Write or update `docs/testing.md` with these sections:

- **Running tests** — the exact command(s) (`npm test`, `npm run lint`), what runner
  is used, and how CI invokes them.
- **File layout** — where tests live and the naming convention, cross-referenced to
  `CLAUDE.md`'s existing conventions rather than restated as new rules.
- **Conventions** — the actual patterns observed in step 2 (setup/teardown, HTTP
  client, assertion style), written as description of current practice.
- **Writing a new test** — a short, concrete walkthrough using the existing pattern
  (e.g. copy the shape of `tests/users.test.js` for a new resource), so a contributor
  can add one correctly without re-deriving the convention.
- **Coverage gaps** — routes or behaviors (validation errors, 404s, edge cases) that
  currently have no test, from step 4.

Keep it factual and current-state — describe what the tests do, not what an ideal
test suite would do. If `docs/testing.md` already exists, diff your findings against
it and update only what's stale rather than rewriting wholesale.

## After writing

Mention any coverage gaps found, since those are useful signal even though fixing
them is a separate task from documenting.
