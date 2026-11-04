---
name: add-api-endpoint
description: Use when asked to add, change or extend an HTTP endpoint, route or resource in this Express API (for example "add a DELETE /users/:id", "add a /posts resource", "add a route that does X"). Covers the store helper, the route, validation and error format, the supertest tests and the docs/api.md entry. Do not use for questions about the code, lint or dependency work, or changes that touch no routes.
---

# Add or change an API endpoint

This project adds every endpoint the same way. Do all five steps, in this order.

## 1. Data access: `db/store.js`
- Routes never hold state. Add or extend a helper in `db/store.js` and export it.
- Helpers return `undefined` when a record is missing, so the route can answer `404`.
- If you add new state, make sure `seed()` / `reset()` restore it.

## 2. Route: `routes/<resource>.js`
- One file per resource, exporting an Express router built with `express.Router()`.
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`.
- Validate input in the route. Return `400` when required fields are missing or bad.
- Return `404` when the record is missing.
- Create returns `201` with the created record. Other successes return `200`.
- Error bodies are always JSON in the shape `{ "error": "message" }`.
- Use `return res.status(...).json(...)` so a handler never responds twice.

## 3. Mount: `server.js`
- A new resource file needs `app.use('/<resource>', <resource>Router)` in `server.js`.
- Adding a handler to an existing router needs no change here.

## 4. Tests: `tests/<resource>.test.js`
- Use `node:test`, `node:assert` and `supertest` against `require('../server')`.
- Keep `test.beforeEach(() => store.reset());` so each test starts clean.
- Cover the success case, the `400` case and the `404` case for the endpoint.
- Run `npm test`.

## 5. Docs: `docs/api.md`
- Add a `### METHOD /path` entry under the right resource heading.
- State the body fields, the success status and every error status.

## Finish
Run `npm test` and `npm run lint`, and fix anything they report before saying the work is done.
