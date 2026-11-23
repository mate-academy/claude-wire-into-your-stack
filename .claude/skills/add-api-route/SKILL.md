---
name: add-api-route
description: Use when adding or changing an Express route or endpoint in this course API — for example "add a DELETE /users/:id endpoint", "add a new resource", or "make PUT accept a new field". Covers routes/, db/store.js, the supertest test and docs/api.md. Not for fixing unrelated bugs, refactors, or changes outside the API routes.
---

# Add or change an API route

Follow the project's route pattern. Every route change touches the same four places, so do all four.

## 1. Data access: `db/store.js`
- Routes never hold state. Add a helper to `db/store.js` and export it (for example `deleteUser(id)`).
- Return `undefined` (or `false`) when the record does not exist, like `getUser` and `updateUser`.
- If you add new in-memory state, make `seed()` and `reset()` restore it so tests start clean.

## 2. The route: `routes/<resource>.js`
- One route file per resource. A new resource gets its own file, mounted in `server.js` under its base path (`app.use('/things', thingsRouter)`).
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`. A non-numeric id (`/users/abc`) is treated like any record that does not exist: answer `404`, as `GET` and `PUT` already do. Do not add a separate `400` for the id.
- Reserve `400` for an invalid request body: validate the body in the route and answer `400` when it is missing or wrong. Answer `404` when the record is missing, never a crash.
- Errors are JSON in exactly this shape: `res.status(404).json({ error: 'User not found' })`.
- Handlers `return` their response. Use `201` for a created record.
- A successful `DELETE` answers `204 No Content` with no response body: `return res.status(204).end();`.
- Style: single quotes, semicolons, CommonJS (`require` / `module.exports`).

## 3. A test: `tests/<resource>.test.js`
- Use `node:test`, `node:assert` and `supertest` against `require('../server')`.
- Start every file with `test.beforeEach(() => store.reset());` so each test begins from the seed data.
- Cover the success case plus the `404` (missing record) and `400` (bad input) cases the route can return.

## 4. The docs: `docs/api.md`
- Add or update the `### METHOD /path` entry: what it takes, what it returns, and each status code (`400`, `404`, ...).

## Check before finishing
Run `npm run lint` and `npm test`. Both must pass. Do not leave a route without its test and its docs entry.
