---
description: Review a route file against the Course API conventions (error shapes, validation, 400/404, test coverage)
argument-hint: <route file, e.g. routes/products.js>
allowed-tools: Read, Grep, Glob, Bash(npm test:*)
---

Review the route file `$ARGUMENTS` against this project's conventions. This is a read-only review: report findings, do not edit any files.

If `$ARGUMENTS` is empty or the file doesn't exist, say so and stop.

## Steps

1. Read `$ARGUMENTS`, `db/store.js`, and `server.js`.
2. Find the matching test file: `tests/<resource>.test.js`, where `<resource>` is the route file's base name (e.g. `routes/products.js` → `tests/products.test.js`).
3. Check every handler in the route file against the checklist below.
4. Check the test file against the test coverage checklist.

## Route checklist

- **Error shape:** every error response is `res.status(<code>).json({ error: '<message>' })`. Flag any `res.send(...)`, `res.sendStatus(...)`, plain-text errors, or other JSON shapes (e.g. `{ message }`, `{ errors: [...] }`).
- **Input validation → 400:** handlers that take a body (POST, PUT, PATCH) check required fields *before* calling the store, and return early with `400`. Flag missing checks, checks that run after the store call, or validation that accepts obviously bad types.
- **Missing record → 404:** handlers that look up by `:id` parse it (`Number(req.params.id)`) and return `404` with `{ error: '<Thing> not found' }` when the store returns `undefined`.
- **Success codes:** `200` (via `res.json`) for reads and updates, `201` for creates.
- **No state in the route:** all data access goes through helpers exported from `db/store.js`. Flag arrays, counters, or other data held in the route file.
- **Wiring:** the router is created with `express.Router()`, exported with `module.exports = router;`, and mounted in `server.js` with `app.use('/<resource>', ...)`. If the store has new data, `seed()` restores it so `reset()` works.
- **Comments:** each handler has a one-line `// METHOD /path — what it does.` comment above it.

## Test coverage checklist

For each handler in the route, check that the test file has:

- a **happy path** test (correct status code and response body),
- a **400** test for every handler that validates input,
- a **404** test for every handler that looks up a record by `:id`,
- `test.beforeEach(() => store.reset())` so tests don't leak state.

Flag a missing test file as a finding. If it exists, run `npm test` and report whether it passes.

## Output

Start with a one-line verdict: **passes conventions** or **N issues found**.

Then list the findings, most serious first. For each, give:
- `file:line`
- the rule it breaks
- a short suggested fix

Finish with a coverage table: one row per handler (`METHOD /path`) and columns for happy path / 400 / 404. Mark each cell ✅, ❌, or `n/a` (e.g. 400 is `n/a` for a GET with no input).
