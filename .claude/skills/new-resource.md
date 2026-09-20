---
description: Scaffold a new REST resource following this project's conventions — route file, store helpers, server mount, and tests.
---

# Add a new resource

When asked to add a new resource (e.g. "add a products route"), follow every convention below exactly. Do not invent new patterns.

## 1. Route file — `routes/<resource>.js`

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all <resource>s.
router.get('/', (req, res) => {
  res.json(store.list<Resource>s());
});

// GET /<resource>/:id — fetch one <resource>, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const item = store.get<Resource>(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(item);
});

// POST /<resource> — create a <resource>. Requires <required fields>.
router.post('/', (req, res) => {
  const { <fields> } = req.body;
  if (!<field1> || !<field2>) {
    return res.status(400).json({ error: '<field1> and <field2> are required' });
  }
  const item = store.create<Resource>({ <fields> });
  return res.status(201).json(item);
});

// PUT /<resource>/:id — update an existing <resource>.
router.put('/:id', (req, res) => {
  const { <fields> } = req.body;
  if (<field1> === undefined && <field2> === undefined) {
    return res.status(400).json({ error: '<field1> or <field2> is required' });
  }
  const item = store.update<Resource>(Number(req.params.id), { <fields> });
  if (!item) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(item);
});

module.exports = router;
```

Rules:
- Every handler that can exit early uses `return res.status(...).json(...)`.
- One short comment per route: `// METHOD /path — description.`
- Parse `:id` params with `Number(req.params.id)`.
- Destructure body fields at the top of the handler, never inline.

## 2. Error response format

Always `{ "error": "human-readable message" }`. Never any other shape.

| Situation | Status | Body |
|---|---|---|
| Missing required fields | 400 | `{ "error": "<field> is required" }` or `{ "error": "<f1> and <f2> are required" }` |
| Record not found | 404 | `{ "error": "<Resource> not found" }` |
| No updatable fields provided | 400 | `{ "error": "<f1> or <f2> is required" }` |

## 3. Store helpers — `db/store.js`

Add four named functions. Never hold state in a route file.

```js
function list<Resource>s() {
  return <resource>s;
}

function get<Resource>(id) {
  return <resource>s.find((item) => item.id === id);
}

function create<Resource>({ <fields> }) {
  const item = { id: next<Resource>Id, <fields> };
  next<Resource>Id += 1;
  <resource>s.push(item);
  return item;
}

function update<Resource>(id, fields) {
  const item = get<Resource>(id);
  if (!item) return undefined;
  // apply only the fields that were supplied
  <fields>.forEach((f) => { if (fields[f] !== undefined) item[f] = fields[f]; });
  return item;
}
```

- `get<Resource>` returns `undefined` (not null, not an error) when not found.
- Seed initial data at the bottom of the file alongside the existing `seed()` call.
- Add the new functions to `module.exports`.

## 4. Mount in `server.js`

```js
const <resource>Router = require('./routes/<resource>');
app.use('/<resource>', <resource>Router);
```

Place the `require` with the other requires and the `app.use` with the other mounts. Do not reorder existing lines.

## 5. Test file — `tests/<resource>.test.js`

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
});

test('GET /<resource>s/:id returns 404 for a missing <resource>', async () => {
  const res = await request(app).get('/<resource>s/999');
  assert.equal(res.status, 404);
});

test('POST /<resource>s creates a <resource>', async () => {
  const res = await request(app)
    .post('/<resource>s')
    .send({ <field1>: '<value1>', <field2>: '<value2>' });
  assert.equal(res.status, 201);
  assert.equal(res.body.<field1>, '<value1>');
  assert.ok(res.body.id);
});

test('PUT /<resource>s/:id updates an existing <resource>', async () => {
  const res = await request(app).put('/<resource>s/1').send({ <field1>: 'updated' });
  assert.equal(res.status, 200);
  assert.equal(res.body.<field1>, 'updated');
});

test('PUT /<resource>s/:id returns 404 for a missing <resource>', async () => {
  const res = await request(app).put('/<resource>s/999').send({ <field1>: 'x' });
  assert.equal(res.status, 404);
});
```

Rules:
- Use Node's built-in `node:test` and `node:assert` — never Jest, Mocha, or Chai.
- Use `supertest` against the imported `app` — never start a real server.
- Always call `store.reset()` in `test.beforeEach`.
- Flat structure: one `test(...)` per scenario, no `describe` blocks.
- Cover at minimum: list, 404 on missing id, create (201 + body check), update (200 + body check), update 404.
- Use `assert.equal` for scalar checks, `assert.ok` for truthiness.

## Checklist before finishing

- [ ] `routes/<resource>.js` created
- [ ] Store helpers added and exported in `db/store.js`
- [ ] Seeded with at least one record
- [ ] Router mounted in `server.js`
- [ ] `tests/<resource>.test.js` created
- [ ] `npm test` passes
