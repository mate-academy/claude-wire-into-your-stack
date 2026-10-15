const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /tasks returns the seeded list', async () => {
  const res = await request(app).get('/tasks');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /tasks/:id returns 404 for a missing task', async () => {
  const res = await request(app).get('/tasks/999');
  assert.equal(res.status, 404);
});

test('POST /tasks creates a task', async () => {
  const res = await request(app)
    .post('/tasks')
    .send({ user_id: 1, description: 'Review pull requests' });
  assert.equal(res.status, 201);
  assert.equal(res.body.description, 'Review pull requests');
  assert.ok(res.body.id);
});

test('PUT /tasks/:id updates an existing task', async () => {
  const res = await request(app).put('/tasks/1').send({ description: 'Updated task' });
  assert.equal(res.status, 200);
  assert.equal(res.body.description, 'Updated task');
});

test('PUT /tasks/:id returns 404 for a missing task', async () => {
  const res = await request(app).put('/tasks/999').send({ description: 'Nobody' });
  assert.equal(res.status, 404);
});
