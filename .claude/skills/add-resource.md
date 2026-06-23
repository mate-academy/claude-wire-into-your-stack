---
name: add-resource
description: "Add a resource to this Express API — route file, store helpers, tests, and server mount. Use when the request is to add a new endpoint group or resource (e.g. 'add a products route', 'create a /orders resource')."
---

Follow these patterns exactly when adding a new resource to this API.

## 1. Store functions — `db/store.js`

Add four functions for the new resource. IDs are auto-incremented integers from a module-level `nextId` variable. `reset()` must re-seed the new resource alongside users.

```js
let items = [];
let nextItemId = 1;

function listItems() {
  return items;
}

function getItem(id) {
  return items.find((item) => item.id === id);
}

function createItem({ /* required fields */ }) {
  const item = { id: nextItemId, /* fields */ };
  nextItemId += 1;
  items.push(item);
  return item;
}

function updateItem(id, fields) {
  const item = getItem(id);
  if (!item) return undefined;
  if (fields.fieldA !== undefined) item.fieldA = fields.fieldA;
  return item;
}
```

Export all four alongside the existing exports. Update `seed()` and `reset()` to include the new resource.

## 2. Route file — `routes/<resource>.js`

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all.
router.get('/', (req, res) => {
  res.json(store.listItems());
});

// GET /<resource>/:id — fetch one, or 404.
router.get('/:id', (req, res) => {
  const item = store.getItem(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  return res.json(item);
});

// POST /<resource> — create. Requires <fields>.
router.post('/', (req, res) => {
  const { fieldA, fieldB } = req.body;
  if (!fieldA || !fieldB) {
    return res.status(400).json({ error: 'fieldA and fieldB are required' });
  }
  const item = store.createItem({ fieldA, fieldB });
  return res.status(201).json(item);
});

// PUT /<resource>/:id — update existing.
router.put('/:id', (req, res) => {
  const { fieldA, fieldB } = req.body;
  if (fieldA === undefined && fieldB === undefined) {
    return res.status(400).json({ error: 'fieldA or fieldB is required' });
  }
  const item = store.updateItem(Number(req.params.id), { fieldA, fieldB });
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  return res.json(item);
});

module.exports = router;
```

Key rules:
- Always `return` early on error responses so the success path doesn't run.
- Error shape is always `{ "error": "message" }` — never any other key.
- `POST` returns 201; all other success responses return 200 (default).
- Parse `:id` with `Number(req.params.id)` before passing to the store.

## 3. Mount in `server.js`

```js
const itemsRouter = require('./routes/<resource>');
// ...
app.use('/<resource>', itemsRouter);
```

Add the require alongside the existing requires, and the `app.use` alongside the existing mounts.

## 4. Test file — `tests/<resource>.test.js`

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

test('POST /<resource> creates an item', async () => {
  const res = await request(app)
    .post('/<resource>')
    .send({ fieldA: 'value', fieldB: 'value' });
  assert.equal(res.status, 201);
  assert.equal(res.body.fieldA, 'value');
  assert.ok(res.body.id);
});

test('PUT /<resource>/:id updates an existing item', async () => {
  const res = await request(app).put('/<resource>/1').send({ fieldA: 'new' });
  assert.equal(res.status, 200);
  assert.equal(res.body.fieldA, 'new');
});

test('PUT /<resource>/:id returns 404 for a missing item', async () => {
  const res = await request(app).put('/<resource>/999').send({ fieldA: 'x' });
  assert.equal(res.status, 404);
});
```

Key rules:
- `test.beforeEach(() => store.reset())` is always first — ensures each test starts from seed data.
- Use Node's built-in `node:test` and `node:assert` — no third-party test framework.
- Use `supertest` against the exported `app` — never start the server separately.
- One `assert` per observable outcome; don't assert implementation details.
