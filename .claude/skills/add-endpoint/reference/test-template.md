# Test template

Tests use Node's built-in runner (`node:test`, `node:assert`) with `supertest` against the exported app. Nothing listens on a port. Reset the store before each test so tests don't depend on each other.

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

// Success path: assert status and the relevant body fields.
test('POST /widgets creates a widget', async () => {
  const res = await request(app).post('/widgets').send({ name: 'Gear' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Gear');
  assert.ok(res.body.id);
});

// Each 400 branch: assert status and the error shape.
test('POST /widgets returns 400 without a name', async () => {
  const res = await request(app).post('/widgets').send({});
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

// Each 404 branch: use an id that the seed data doesn't contain.
test('GET /widgets/:id returns 404 for a missing widget', async () => {
  const res = await request(app).get('/widgets/999');
  assert.equal(res.status, 404);
  assert.ok(res.body.error);
});
```

Name each test `'<METHOD> <path> <expected outcome>'`, matching `tests/users.test.js`.
