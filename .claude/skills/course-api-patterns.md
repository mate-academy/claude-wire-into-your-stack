---
name: course-api-patterns
description: >-
  When the user asks about writing, modifying, or following conventions for
  route handlers (routes/), test files (tests/), or error responses in this
  Course API Express project — using express.Router(), db/store.js for all
  data access, node:test with supertest, and errors returned as JSON { error: 'message' }
---

# Course API — Project Coding Conventions

This skill encodes the established conventions of the **Course API** (an Express.js
project) so every change follows the same patterns as the existing code. Apply
these rules whenever adding or modifying routes, tests, or error handling.

## Server Entry Point (`server.js`)

```javascript
const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (e.g. `npm run dev`), so the
// tests can import the app without opening a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
```

Key points:
- Use `require('express')`, **not** ES modules (`import`/`export`).
- Register `app.use(express.json())` so `req.body` is parsed.
- Mount each resource router under its base path: `app.use('/<resource>', router)`.
- Export the `app` object so tests can import it without binding a port.
- Guard the `app.listen` call with `if (require.main === module)` so tests
  don't conflict on the same port.

## Route Handlers (`routes/<resource>.js`)

Every resource gets its own file in `routes/`. The file creates a router,
defines handlers, and exports it.

```javascript
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all items.
router.get('/', (req, res) => {
  res.json(store.listItems());
});

// GET /<resource>/:id — fetch one item, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const item = store.getItem(Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  return res.json(item);
});

// POST /<resource> — create an item. Validate input, return 201.
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const item = store.createItem({ name, email });
  return res.status(201).json(item);
});

// PUT /<resource>/:id — update an existing item.
router.put('/:id', (req, res) => {
  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  const item = store.updateItem(Number(req.params.id), { name, email });
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  return res.json(item);
});

module.exports = router;
```

Conventions:
- `const router = express.Router();` — always create a fresh router.
- All data access goes through `db/store.js` — routes **never** hold state.
- Convert route params to numbers: `Number(req.params.id)`.
- **Validate input** from `req.body` and return `400` with `{ error: '<message>' }`
  when required fields are missing.
- Return `404` with `{ error: '<message>' }` when a record is not found.
- Return `201` for successful creation; `200` for reads and updates.
- Use early `return res.status(...).json(...)` so execution stops.
- End with `module.exports = router;`.

## Error Response Format

All error responses are JSON objects with a single `error` key:

```json
{ "error": "descriptive message here" }
```

- **400** — bad input / validation failure (e.g. missing required fields).
- **404** — the requested record was not found.
- Always use the key `error` (lowercase, singular), never `message` or `errors`.

## Data Store (`db/store.js`)

The single source of truth for all data. Add new CRUD helpers here and call
them from routes — never store state in a route module.

```javascript
let items = [];
let nextId = 1;

function seed() {
  items = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;
}
seed();

function listItems() { return items; }
function getItem(id) { return items.find((item) => item.id === id); }

function createItem({ name, email }) {
  const item = { id: nextId, name, email };
  nextId += 1;
  items.push(item);
  return item;
}

function updateItem(id, fields) {
  const item = getItem(id);
  if (!item) return undefined;
  if (fields.name !== undefined) item.name = fields.name;
  if (fields.email !== undefined) item.email = fields.email;
  return item;
}

// Reset to the seed data. Used by the tests so each one starts clean.
function reset() { seed(); }

module.exports = { listItems, getItem, createItem, updateItem, reset };
```

Always include a `reset()` function so tests can start from a clean slate.

## Tests (`tests/<resource>.test.js`)

Tests use Node's built-in test runner (`node:test`) and `node:assert`, with
`supertest` for HTTP requests against the exported app.

```javascript
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /users returns the seeded list', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.ok(res.body.id);
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});
```

Conventions:
- `const test = require('node:test');` — Node's built-in test runner.
- `const assert = require('node:assert');` — Node's built-in assertions.
- `const request = require('supertest');` — HTTP testing client.
- Import the app via `const app = require('../server');` (not `start` the server).
- Call `store.reset()` in `test.beforeEach()` so every test starts from seed data.
- Use `request(app).get('/path')`, `.post(...)`, `.put(...)`, etc.
- Assert status codes with `assert.equal(res.status, N)`.
- Assert body content with `assert.equal(res.body.field, value)` and
  `assert.ok(...)`.

## Running

```bash
npm run dev   # start the API on port 3000
npm test      # run the test suite (Node's built-in test runner)
npm run lint  # lint with ESLint
```
