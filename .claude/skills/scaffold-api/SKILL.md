---
name: scaffold-api
description: >-
  How to add a new route/resource/endpoint to this Express API (course-api), write its
  matching test file, and keep the JSON error-response shape consistent. Use whenever asked
  to add a route, new resource, endpoint, CRUD operation, controller, or tests for one in this
  repo — or when the error response format ({ "error": "message" }) needs to match convention.
---

# Add a route in this repo

1. **Store**: add helpers to `db/store.js` (list/get/create/update). Mutate the in-memory array there — never in the route file.

2. **Route file** `routes/<resource>.js` — copy this shape from `routes/users.js`:
```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(store.listThings());
});

router.get('/:id', (req, res) => {
  const thing = store.getThing(Number(req.params.id));
  if (!thing) {
    return res.status(404).json({ error: 'Thing not found' });
  }
  return res.json(thing);
});

router.post('/', (req, res) => {
  const { field } = req.body;
  if (!field) {
    return res.status(400).json({ error: 'field is required' });
  }
  const thing = store.createThing({ field });
  return res.status(201).json(thing);
});

module.exports = router;
```
Rules: validate input in the route, `400` on bad input, `404` when a record is missing. Every error body is `{ "error": "message" }`.

3. **Mount** in `server.js`:
```js
const thingsRouter = require('./routes/things');
app.use('/things', thingsRouter);
```

4. **Tests** `tests/<resource>.test.js` — copy this shape from `tests/users.test.js`:
```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /things returns the seeded list', async () => {
  const res = await request(app).get('/things');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('GET /things/:id returns 404 for a missing thing', async () => {
  const res = await request(app).get('/things/999');
  assert.equal(res.status, 404);
});

test('POST /things creates a thing', async () => {
  const res = await request(app).post('/things').send({ field: 'value' });
  assert.equal(res.status, 201);
});
```

5. **Docs**: add the new endpoints to `docs/api.md` following the existing `### METHOD /path` sections.

6. Run `npm test` and `npm run lint` before done.
