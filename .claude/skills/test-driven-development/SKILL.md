---
name: test-driven-development
description: Build a new feature test-first — review the codebase and existing tests, write a failing test for the feature, implement the feature to make it pass, then run the full suite. Use when the user asks to build a new feature, mentions TDD, "test-driven", or "write a failing test first" for a new capability in this Express API.
---

# Test-Driven Development

Build the requested feature strictly test-first. Do not write feature code before a failing test exists for it.

## Workflow

1. **Review the codebase.**
   - Read `CLAUDE.md` for this project's conventions (route/store split, validation, error shape).
   - Read the relevant route file in `routes/` and `db/store.js` to see existing patterns (status codes, `{ "error": "message" }` shape, how the store is called).
   - Read the matching file in `tests/` to see the test runner conventions in use: `node:test` + `node:assert`, `supertest` against the exported `app`, and `test.beforeEach(() => store.reset())` for a clean data store per test.

2. **Write the failing test(s) first.**
   - Add test case(s) to the appropriate `tests/*.test.js` file (or create one, named after the resource, if none exists) that exercise the new feature end-to-end through the HTTP layer, following the existing `test('<verb> <path> <behavior>', async () => {...})` naming style.
   - Cover the success path and the relevant error path(s) (400/404) per this project's validation conventions.
   - Run `npm test` and confirm the new test(s) fail for the expected reason (missing route/store function), not for an unrelated error. Do not proceed until the failure is the right one.

3. **Implement the feature.**
   - Add any new data-access logic to `db/store.js` — routes never hold state directly.
   - Add or update the route handler in the matching `routes/*.js` file, validating input and returning `400`/`404` with the `{ "error": "message" }` shape where applicable.
   - Update `docs/api.md` to document the new/changed endpoint, matching its existing terse format.

4. **Run the tests.**
   - Run `npm test` and confirm all tests pass, including the new one(s).
   - Run `npm run lint` and fix any issues.
   - Report which tests were added and confirm the suite is green.

## Notes
- Keep each TDD cycle to one feature at a time — write the failing test(s) for that feature, make them pass, then stop before starting another feature.
- If the feature can't be tested through the existing `supertest`-against-`app` pattern, ask before introducing a new testing approach.
