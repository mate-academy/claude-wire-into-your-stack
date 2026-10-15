---
description: Use this skill when the user asks to add a new route, endpoint, or REST resource to the project — for example "add a products route", "create an endpoint for orders", or "add CRUD for items". Do not trigger for general Express questions unrelated to this codebase.
---

# Skill: Add a Route

When adding a new route to this project, always follow the patterns below exactly.

## Route file (`routes/<resource>.js`)

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all.
router.get('/', (req, res) => {
  res.json(store.list<Resource>s());
});

// GET /<resource>/:id — fetch one, or 404 if missing.
router.get('/:id', (req, res) => {
  const item = store.get<Resource>(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(item);
});

// POST /<resource> — create. Requires all mandatory fields.
router.post('/', (req, res) => {
  const { field1, field2 } = req.body;
  if (!field1 || !field2) {
    return res.status(400).json({ error: 'field1 and field2 are required' });
  }
  const item = store.create<Resource>({ field1, field2 });
  return res.status(201).json(item);
});

// PUT /<resource>/:id — update existing.
router.put('/:id', (req, res) => {
  const { field1, field2 } = req.body;
  if (field1 === undefined && field2 === undefined) {
    return res.status(400).json({ error: 'field1 or field2 is required' });
  }
  const item = store.update<Resource>(Number(req.params.id), { field1, field2 });
  if (!item) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(item);
});

module.exports = router;
```

## Test file (`tests/<resource>.test.js`)

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

test('GET /<resource>/:id returns 404 for a missing record', async () => {
  const res = await request(app).get('/<resource>/999');
  assert.equal(res.status, 404);
});

test('POST /<resource> creates a record', async () => {
  const res = await request(app)
    .post('/<resource>')
    .send({ field1: 'value1', field2: 'value2' });
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
});

test('PUT /<resource>/:id updates an existing record', async () => {
  const res = await request(app).put('/<resource>/1').send({ field1: 'updated' });
  assert.equal(res.status, 200);
});

test('PUT /<resource>/:id returns 404 for a missing record', async () => {
  const res = await request(app).put('/<resource>/999').send({ field1: 'x' });
  assert.equal(res.status, 404);
});
```

## Invariants

- Error responses are always `{ "error": "message" }` — never a string, never a different key.
- Routes never hold state — all reads and writes go through `db/store.js`.
- POST returns `201`; successful GET/PUT return `200`.
- Mount the new router in `server.js`: `app.use('/<resource>', require('./routes/<resource>'))`.
