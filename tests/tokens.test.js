const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('POST /tokens creates a token and returns the secret', async () => {
  const res = await request(app)
    .post('/tokens')
    .send({ name: 'my-key' });
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
  assert.equal(res.body.name, 'my-key');
  assert.ok(typeof res.body.token === 'string' && res.body.token.length > 0);
  assert.ok(res.body.createdAt);
});

test('POST /tokens works without a name', async () => {
  const res = await request(app).post('/tokens').send({});
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
});

test('DELETE /tokens/:id revokes a token', async () => {
  // Create a token, confirm it works, then revoke it.
  const created = await request(app).post('/tokens').send({ name: 'temp' });
  const { id, token } = created.body;

  // Token should authorize /users before revocation.
  const before = await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(before.status, 200);

  // Revoke.
  const del = await request(app).delete(`/tokens/${id}`);
  assert.equal(del.status, 204);

  // Token should no longer authorize /users after revocation.
  const after = await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(after.status, 401);
});

test('DELETE /tokens/:id is idempotent — returns 204 even if already revoked', async () => {
  const created = await request(app).post('/tokens').send({ name: 'temp' });
  const { id } = created.body;

  await request(app).delete(`/tokens/${id}`);
  const retry = await request(app).delete(`/tokens/${id}`);
  assert.equal(retry.status, 204);
});

test('DELETE /tokens/:id returns 204 for a never-existing id', async () => {
  const res = await request(app).delete('/tokens/999');
  assert.equal(res.status, 204);
});

test('DELETE /tokens/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app).delete('/tokens/abc');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});
