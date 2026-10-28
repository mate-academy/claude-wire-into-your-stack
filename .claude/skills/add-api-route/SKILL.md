---
name: add-api-route
description: Use when asked to add, extend, or change an HTTP endpoint or resource in this Express API (e.g. "add a DELETE /users/:id route", "add a /posts resource", "add a field to POST /users"). Covers the route file, db/store.js, tests, and docs/api.md. Not for unrelated tasks like linting, refactoring without API changes, or answering questions about the code.
---

# Adding or changing an API route

Follow the same four steps every time, in this order.

## 1. Data access: `db/store.js`

- Routes never hold state. Add any new read/write helper to `db/store.js` and export it.
- A helper returns `undefined` when a record is missing; the route turns that into a 404.
- If the new data needs seed values or a reset, update `seed()` / `reset()` so tests start clean.

## 2. Route: `routes/<resource>.js`

- One file per resource, exporting an Express router. A new resource also gets mounted in `server.js` under its base path.
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Validate input inside the handler and return `400` with a clear message when it is bad.
- Return `404` when the record does not exist. Use `201` for a successful create.
- Convert ids with `Number(req.params.id)`.
- Every error response is JSON in exactly this shape: `{ "error": "message" }`. Never send plain text or a different key.
- Use early `return res.status(...).json(...)` for errors, and `return res.json(...)` at the end.

## 3. Tests: `tests/<resource>.test.js`

- Use Node's built-in runner (`node:test`), `node:assert`, and `supertest` against `require('../server')`.
- Start with `test.beforeEach(() => store.reset());`.
- Name tests like `'PUT /users/:id returns 404 for a missing user'`.
- For each route, cover the success case and every error case it can return (400 and/or 404).

## 4. Docs: `docs/api.md`

- Add or update the section for the endpoint: method and path, what the body requires, and each status code it can return.

## Finish

Run `npm test` and `npm run lint`. Both must pass before you say the work is done.
