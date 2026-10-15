---
name: add-api-route
description: >-
  Use when adding a new REST resource or endpoint to this Express API — creating
  a new file under routes/, its data helpers in db/store.js, and its mount in
  server.js. Triggers on requests like "add a /products endpoint", "new resource
  for orders", "expose a route for X". Not for editing an existing route, fixing
  a bug in one, or non-API code.
---

# Add a new API route

Follow the pattern already used by `routes/users.js`, `db/store.js`, and
`server.js`. Work in this order.

## 1. Data helpers in `db/store.js`

State lives only here — routes never hold arrays or counters.

- Add named helpers for the operations the resource needs: `list<Plural>()`,
  `get<Singular>(id)`, `create<Singular>(fields)`, `update<Singular>(id, fields)`.
- Give the resource its own module-level array and `nextId` counter, mirroring
  `users` / `nextId`.
- Extend `seed()` with two or three sample rows so the list endpoint returns
  something. `reset()` calls `seed()`, so it covers the new state automatically —
  just confirm it.
- Add every new helper to the `module.exports` object.

## 2. Route file `routes/<resource>.js`

- `const express = require('express'); const store = require('../db/store');`
  then `const router = express.Router();`.
- One handler per operation, each preceded by a one-line comment in the style of
  `routes/users.js` (`// GET /products/:id — fetch one product, or 404 …`).
- Validate input in the handler before touching the store.
- `module.exports = router;`

## 3. Mount in `server.js`

- Add `const <resource>Router = require('./routes/<resource>');` beside the other
  router requires.
- Add `app.use('/<base-path>', <resource>Router);` in the same block as the
  existing mounts.

## 4. Error and status-code contract

From `CLAUDE.md`:

- Bad or missing input → `400`.
- Referenced record doesn't exist → `404`.
- Every error body is JSON shaped `{ "error": "message" }` — never a bare string,
  never another shape.
- Successful create → `201` with the created record.
- Successful read/update → `200`.

For any case the existing routes don't already demonstrate (e.g. a duplicate
unique field, a semantically invalid but well-formed body), do **not** guess the
status code. Use the `fetch` MCP server to read the MDN HTTP status reference
(`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status`) and cite the chosen
code's meaning before deciding.

## 5. Tests

If the project asks for tests, add `tests/<resource>.test.js` following
`tests/users.test.js`: `node:test` + `node:assert` + `supertest`,
`test.beforeEach(() => store.reset())`, one assertion cluster per status code
(happy path plus each `400` / `404` branch).

## 6. Check

Run `npm test` and `npm run lint` before considering the route done.
