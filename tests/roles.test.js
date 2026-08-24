const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /roles returns the seeded list', async () => {
  const res = await request(app).get('/roles');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /roles/:id returns 404 for a missing role', async () => {
  const res = await request(app).get('/roles/999');
  assert.equal(res.status, 404);
});

test('POST /roles creates a role', async () => {
  const res = await request(app)
    .post('/roles')
    .send({ title: 'Editor', description: 'Can edit content' });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'Editor');
  assert.ok(res.body.id);
});

test('PUT /roles/:id updates an existing role', async () => {
  const res = await request(app).put('/roles/1').send({ title: 'Super Admin' });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Super Admin');
});

test('PUT /roles/:id returns 404 for a missing role', async () => {
  const res = await request(app).put('/roles/999').send({ title: 'Nobody' });
  assert.equal(res.status, 404);
});
