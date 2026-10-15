---
name: express-route
description: Write or change Express route handlers for this Course API. Use when adding a new resource router, a new endpoint, route validation, or error responses — not for unrelated refactors, docs-only edits, or general questions.
---

# Express route conventions

Follow the patterns already used in `routes/users.js` and `routes/health.js`.

## Structure
- One file per resource under `routes/`, exporting an Express `Router`
- Mount the router in `server.js` under its base path (e.g. `app.use('/users', usersRouter)`)
- All reads and writes go through `db/store.js` — never keep resource state in the route file

## Validation and errors
- Validate request input in the route
- Missing or invalid input → `400` with `{ "error": "message" }`
- Missing record → `404` with `{ "error": "message" }`
- Successful create → `201` with the created record
- Successful read/update/list → `200` with JSON body

## Tests
- Add coverage in `tests/` with Node's built-in test runner (`node:test`) and `supertest`
- Call `store.reset()` in `test.beforeEach` so each case starts from seed data
- Assert status codes and key response fields

## Checklist before finishing
1. Route file follows the conventions above
2. Router is mounted in `server.js` if it is new
3. Store helpers exist (or were added) in `db/store.js`
4. Tests cover the happy path plus 400/404 where relevant
5. `docs/api.md` updated if the public API changed
