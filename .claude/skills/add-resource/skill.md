---
name: add-resource
description: Use when asked to add a new REST resource (route, CRUD endpoints, or "add a <thing> resource/route"). Encodes the three-file pattern this project uses: routes/<resource>.js, db/store.js additions, and tests/<resource>.test.js.
---
Adding a new resource requires three files touched in order: the store helpers, the route, and the tests. Then mount the router in server.js.

## 1. Store helpers — `db/store.js`

Append to the existing file. Follow the exact shape already used for users:

```js
let <resources> = [];
let next<Resource>Id = 1;

function seed<Resource>s() {
  <resources> = [
    { id: 1, <field>: '<value>', ... },
  ];
  next<Resource>Id = 2;
}
seed<Resource>s();

function list<Resource>s() { return <resources>; }

function get<Resource>(id) {
  return <resources>.find((r) => r.id === id);
}

function create<Resource>({ <fields> }) {
  const item = { id: next<Resource>Id, <fields> };
  next<Resource>Id += 1;
  <resources>.push(item);
  return item;
}

function update<Resource>(id, fields) {
  const item = get<Resource>(id);
  if (!item) return undefined;
  // apply only the fields that were provided
  Object.keys(fields).forEach((k) => {
    if (fields[k] !== undefined) item[k] = fields[k];
  });
  return item;
}
```

Export each new function alongside the existing ones. Add a call to `seed<Resource>s()` inside the existing `reset()` so tests clean up this resource too.

## 2. Route file — `routes/<resource>.js`

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resources> — list all.
router.get('/', (req, res) => {
  res.json(store.list<Resource>s());
});

// GET /<resources>/:id — fetch one, or 404.
router.get('/:id', (req, res) => {
  const item = store.get<Resource>(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(item);
});

// POST /<resources> — create. Validate required fields and return 400 on bad input.
router.post('/', (req, res) => {
  const { <requiredFields> } = req.body;
  if (!<requiredFields check>) {
    return res.status(400).json({ error: '<fields> are required' });
  }
  const item = store.create<Resource>({ <fields> });
  return res.status(201).json(item);
});

// PUT /<resources>/:id — partial update.
router.put('/:id', (req, res) => {
  const { <fields> } = req.body;
  if (<all fields undefined check>) {
    return res.status(400).json({ error: 'at least one field is required' });
  }
  const item = store.update<Resource>(Number(req.params.id), { <fields> });
  if (!item) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(item);
});

module.exports = router;
```

Error responses are always `{ "error": "<message>" }`. Status codes: 200 success, 201 created, 400 bad input, 404 not found.

## 3. Mount in `server.js`

```js
const <resource>sRouter = require('./routes/<resource>s');
// ...
app.use('/<resource>s', <resource>sRouter);
```

## 4. Test file — `tests/<resource>s.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /<resource>s returns the seeded list', async () => {
  const res = await request(app).get('/<resource>s');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
});

test('GET /<resource>s/:id returns 404 for a missing <resource>', async () => {
  const res = await request(app).get('/<resource>s/999');
  assert.equal(res.status, 404);
});

test('POST /<resource>s creates a <resource>', async () => {
  const res = await request(app)
    .post('/<resource>s')
    .send({ <fields with example values> });
  assert.equal(res.status, 201);
  assert.equal(res.body.<keyField>, <expectedValue>);
  assert.ok(res.body.id);
});

test('PUT /<resource>s/:id updates an existing <resource>', async () => {
  const res = await request(app).put('/<resource>s/1').send({ <oneField>: <newValue> });
  assert.equal(res.status, 200);
  assert.equal(res.body.<oneField>, <newValue>);
});

test('PUT /<resource>s/:id returns 404 for a missing <resource>', async () => {
  const res = await request(app).put('/<resource>s/999').send({ <oneField>: 'x' });
  assert.equal(res.status, 404);
});
```

After writing all files, run `npm test` to confirm everything passes.
