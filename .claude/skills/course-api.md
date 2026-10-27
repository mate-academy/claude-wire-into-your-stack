# Course API Project Skill

This skill encodes the recurring patterns in the Course API project so new work follows the established conventions.

## Route Patterns

### Route File Structure
Each resource gets its own route file in `routes/` (e.g., `users.js`, `health.js`):
- Export a single Express `Router`
- Mount in `server.js` under its base path (`/users`, `/health`)

### Route Handler Patterns
```js
// GET /resource — list all
router.get('/', (req, res) => {
  res.json(store.listResources());
});

// GET /resource/:id — fetch one, 404 if missing
router.get('/:id', (req, res) => {
  const resource = store.getResource(Number(req.params.id));
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  return res.json(resource);
});

// POST /resource — create, requires required fields
router.post('/', (req, res) => {
  const { field1, field2 } = req.body;
  if (!field1 || !field2) {
    return res.status(400).json({ error: 'field1 and field2 are required' });
  }
  const resource = store.createResource({ field1, field2 });
  return res.status(201).json(resource);
});

// PUT /resource/:id — update, requires at least one field
router.put('/:id', (req, res) => {
  const { field1, field2 } = req.body;
  if (field1 === undefined && field2 === undefined) {
    return res.status(400).json({ error: 'field1 or field2 is required' });
  }
  const resource = store.updateResource(Number(req.params.id), { field1, field2 });
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  return res.json(resource);
});
```

### Key Conventions
- **Input validation in route** — check required fields before calling store
- **400 for bad input** — missing required fields, empty update
- **404 for missing record** — `store.getXxx()` returns undefined
- **201 for creation** — return created resource with ID
- **Error format** — always `{ "error": "message" }` (never bare strings, never other shapes)

## Store Patterns

### Data Access Only Through `db/store.js`
Routes never hold state directly. All data access goes through store helpers:
- `listXxx()` — returns all records
- `getXxx(id)` — returns one record or `undefined`
- `createXxx(data)` — returns created record with new ID
- `updateXxx(id, fields)` — returns updated record or `undefined`
- `reset()` — reseeds to initial data (used by tests)

### In-Memory Store Implementation
```js
let resources = [];
let nextId = 1;

function seed() {
  resources = [{ id: 1, ... }, { id: 2, ... }];
  nextId = 3;
}
seed();

function listResources() { return resources; }
function getResource(id) { return resources.find(r => r.id === id); }
function createResource(data) { ... }
function updateResource(id, fields) { ... }
function reset() { seed(); }

module.exports = { listResources, getResource, createResource, updateResource, reset };
```

## Test Patterns

### Test File Location
`tests/<resource>.test.js` — one test file per resource

### Test Structure
```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /resource returns the seeded list', async () => {
  const res = await request(app).get('/resource');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /resource/:id returns 404 for a missing resource', async () => {
  const res = await request(app).get('/resource/999');
  assert.equal(res.status, 404);
});

test('POST /resource creates a resource', async () => {
  const res = await request(app)
    .post('/resource')
    .send({ field1: 'value1', field2: 'value2' });
  assert.equal(res.status, 201);
  assert.equal(res.body.field1, 'value1');
  assert.ok(res.body.id);
});

test('PUT /resource/:id updates an existing resource', async () => {
  const res = await request(app).put('/resource/1').send({ field1: 'updated' });
  assert.equal(res.status, 200);
  assert.equal(res.body.field1, 'updated');
});

test('PUT /resource/:id returns 404 for a missing resource', async () => {
  const res = await request(app).put('/resource/999').send({ field1: 'nobody' });
  assert.equal(res.status, 404);
});
```

### Key Test Conventions
- **`test.beforeEach(() => store.reset())`** — every test starts with clean seed data
- **Use `supertest`** — `request(app)` for HTTP testing
- **Assert status first** — then assert response body
- **Test both success and error paths** — 404, 400, 200, 201

## Error Response Format

**Always** return errors as:
```json
{ "error": "descriptive message" }
```

Examples from the codebase:
- `{ "error": "name and email are required" }`
- `{ "error": "name or email is required" }`
- `{ "error": "User not found" }`

Never return:
- Plain strings: `"User not found"`
- Other shapes: `{ "message": "..." }`, `{ "errors": [...] }`

## Adding a New Resource

1. Create `routes/<resource>.js` following the route patterns above
2. Add store helpers in `db/store.js` (or create a new store module)
3. Mount the router in `server.js`: `app.use('/<resource>', resourceRouter)`
4. Create `tests/<resource>.test.js` following the test patterns
5. Run `npm test` to verify

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start API on http://localhost:3000 |
| `npm test` | Run test suite (Node's built-in test runner) |
| `npm run lint` | Lint with ESLint (CommonJS, ES2022) |

## Linting Rules

- CommonJS (`require`/`module.exports`)
- ES2022
- `no-unused-vars` warns but allows `req`, `res`, `next` as unused params