---
name: add-resource-route
description: How this project adds or changes an API endpoint. Use when adding a new route, resource, or HTTP method (GET/POST/PUT/DELETE) to the Express API, or when modifying an existing endpoint in routes/. Covers the route-file layout, the db/store.js data-access rule, the error-response shape, and the matching supertest tests.
---

# Adding or changing a route in this project

Every endpoint here follows the same pattern. Apply all of the steps below — none are optional.

## 1. Route file

- One file per resource in `routes/` (e.g. `routes/users.js`), exporting an Express router with `module.exports = router`.
- A new resource gets a new file, mounted in `server.js` under its base path: `app.use('/things', require('./routes/things'));`
- A new method on an existing resource goes into that resource's existing file.
- Each handler gets a one-line comment: `// METHOD /path — what it does.`

## 2. Data access

- Routes NEVER hold state. All reads/writes go through `db/store.js`.
- If the store lacks the operation you need, add a named function to `db/store.js` and export it — keep the same style as `listUsers`/`createUser`.
- Ids are numbers: convert route params with `Number(req.params.id)` before calling the store.

## 3. Validation and errors

- Validate input in the route handler, first thing.
- Bad/missing input → `return res.status(400).json({ error: 'message' });`
- Record not found → `return res.status(404).json({ error: 'Thing not found' });`
- Every error response is JSON of exactly the shape `{ "error": "message" }` — no other keys.
- Success: `200` with the record (or `201` on create).

## 4. Tests

- Tests live in `tests/<resource>.test.js`, using Node's built-in runner (`node:test`), `node:assert`, and `supertest` against the exported app (`require('../server')`).
- The file must start with `test.beforeEach(() => store.reset());` so tests stay independent.
- Cover at least: the success path, and each error status the handler can return (400, 404).
- Run `npm test` and make sure everything passes before you finish.

## 5. Docs

- Add or update the endpoint's section in `docs/api.md`, following the format already there (method, path, body, statuses).
