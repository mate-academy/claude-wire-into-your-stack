const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const request = require('supertest');

// Ensure mock fixture exists for CI and machines without ROOT_PROJECT set
const mocksDir = path.join(__dirname, '..', 'mocks');
const mockFile = path.join(mocksDir, 'users.mock.json');
if (!fs.existsSync(mockFile)) {
  fs.mkdirSync(mocksDir, { recursive: true });
  fs.writeFileSync(mockFile, JSON.stringify({
    users: [
      { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
      { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
    ],
    nextId: 3,
  }, null, 2));
}

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
