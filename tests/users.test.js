const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

let token;

test.beforeEach(() => {
  store.reset();
  // Mint a fresh token for each test so the users routes can be reached.
  ({ token } = store.createToken({ name: 'test' }));
});

test('GET /users returns 401 without a token', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 401);
});

test('GET /users returns the seeded list', async () => {
  const res = await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 4);
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const res = await request(app)
    .get('/users/999')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 404);
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.ok(res.body.id);
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app)
    .put('/users/1')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app)
    .put('/users/999')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});

test('GET /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app)
    .get('/users/abc')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});

test('PUT /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app)
    .put('/users/abc')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'X' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});

test('DELETE /users/:id removes the user and returns 204', async () => {
  const res = await request(app)
    .delete('/users/1')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 204);

  const check = await request(app)
    .get('/users/1')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(check.status, 404);
});

test('DELETE /users/:id returns 204 even when the user does not exist (idempotent)', async () => {
  const res = await request(app)
    .delete('/users/999')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 204);
});

test('DELETE /users/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app)
    .delete('/users/abc')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});


