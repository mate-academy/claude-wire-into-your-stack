---
name: add-route
description: Use when adding a new resource (route file + store functions + tests) to this Express API, or when adding an endpoint to an existing resource. Ensures the new code matches this repo's conventions for file layout, naming, and error-response shape.
---

# Adding a route to the Course API

Follow the pattern established by `routes/users.js`, `routes/health.js`, `db/store.js`, and `tests/users.test.js`.

## File layout

- `routes/<resource>.js` — one file per resource, exports an `express.Router()`.
- `db/store.js` — all state lives here; routes never hold state directly. Add new store functions rather than reading/writing data in the route file.
- `tests/<resource>.test.js` — one test file per resource, mirroring the route filename.
- Mount the new router in `server.js` with `app.use('/<basePath>', <resource>Router)`. The route file itself has no knowledge of its mount path.

## Naming

- Router variable is always `router`; store import is always `store`.
- Store functions are verb+noun camelCase: `listX`, `getX`, `createX`, `updateX`.
- Precede each handler with a one-line comment: `// METHOD /path — short description.`

## Route handler skeleton

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all.
router.get('/', (req, res) => {
  res.json(store.listX());
});

// GET /<resource>/:id — fetch one, or 404 if missing.
router.get('/:id', (req, res) => {
  const item = store.getX(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(item);
});

module.exports = router;
```

## Error response shape

- Always `res.status(<code>).json({ error: '<message>' })` — flat object, single `error` string field, no envelope.
- Status codes:
  - `400` — bad or missing input (validate required fields before calling the store)
  - `404` — record not found (store lookup returned falsy)
- No centralized error handler — build the `{ error }` response inline in the route and `return` early.
- Success responses are unwrapped (`res.json(item)` / `res.json(store.listX())`), so success and error shapes are intentionally asymmetric — don't wrap success in a `{ data }` envelope to "match" the error shape.

## Test file skeleton

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /<resource> returns the seeded list', async () => {
  const res = await request(app).get('/<resource>');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('GET /<resource>/:id returns 404 for a missing item', async () => {
  const res = await request(app).get('/<resource>/999');
  assert.equal(res.status, 404);
});
```

- `test.beforeEach(() => store.reset())` resets in-memory state before every test.
- Each test issues one request via `request(app).<method>(path).send(body)` and asserts `res.status` plus the relevant shape/values of `res.body`.
- If you add stricter checks, also assert the `error` field's value on 400/404 responses — the existing suite only checks status codes on those paths, not the message body.

## Checklist for a new resource

1. Add store functions to `db/store.js`.
2. Create `routes/<resource>.js` following the skeleton above.
3. Mount it in `server.js`.
4. Create `tests/<resource>.test.js` following the skeleton above.
5. Update `docs/api.md` with the new endpoints.
6. Run `npm test` and `npm run lint`.
