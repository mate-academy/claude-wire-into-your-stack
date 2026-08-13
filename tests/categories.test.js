const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /categories returns the seeded list', async () => {
  const res = await request(app).get('/categories');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /categories/:id returns 404 for a missing category', async () => {
  const res = await request(app).get('/categories/999');
  assert.equal(res.status, 404);
});

test('POST /categories creates a category', async () => {
  const res = await request(app)
    .post('/categories')
    .send({ name: 'Marketing', description: 'Marketing and growth work' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Marketing');
  assert.ok(res.body.id);
});

test('PUT /categories/:id updates an existing category', async () => {
  const res = await request(app).put('/categories/1').send({ name: 'Eng' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Eng');
});

test('PUT /categories/:id returns 404 for a missing category', async () => {
  const res = await request(app).put('/categories/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});
