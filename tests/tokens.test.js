const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

let adminToken;
let clientToken;

test.beforeEach(() => {
  store.reset();
  ({ token: adminToken } = store.createToken({ name: 'admin', role: 'admin' }));
  ({ token: clientToken } = store.createToken({ name: 'client' }));
});

test('POST /tokens creates a client token and returns the secret', async () => {
  const res = await request(app)
    .post('/tokens')
    .send({ name: 'my-key' });
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
  assert.equal(res.body.name, 'my-key');
  assert.equal(res.body.role, 'client');
  assert.ok(typeof res.body.token === 'string' && res.body.token.length > 0);
  assert.ok(res.body.createdAt);
});

test('POST /tokens ignores role in body — always creates client token', async () => {
  const res = await request(app).post('/tokens').send({ role: 'admin' });
  assert.equal(res.status, 201);
  assert.equal(res.body.role, 'client');
});

test('POST /tokens works without a name', async () => {
  const res = await request(app).post('/tokens').send({});
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
});

test('DELETE /tokens/:id revokes a token', async () => {
  // Create a client token, confirm it works, then revoke it with the admin token.
  const created = await request(app).post('/tokens').send({ name: 'temp' });
  const { id, token } = created.body;

  // Token should authorize /users before revocation.
  const before = await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(before.status, 200);

  // Revoke using admin token.
  const del = await request(app)
    .delete(`/tokens/${id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(del.status, 204);

  // Token should no longer authorize /users after revocation.
  const after = await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(after.status, 401);
});

test('DELETE /tokens/:id returns 401 without any token', async () => {
  const res = await request(app).delete('/tokens/1');
  assert.equal(res.status, 401);
});

test('DELETE /tokens/:id returns 403 for a client token', async () => {
  const res = await request(app)
    .delete('/tokens/1')
    .set('Authorization', `Bearer ${clientToken}`);
  assert.equal(res.status, 403);
  assert.equal(res.body.error, 'Forbidden');
});

test('DELETE /tokens/:id is idempotent — returns 204 even if already revoked', async () => {
  const created = await request(app).post('/tokens').send({ name: 'temp' });
  const { id } = created.body;

  await request(app).delete(`/tokens/${id}`).set('Authorization', `Bearer ${adminToken}`);
  const retry = await request(app).delete(`/tokens/${id}`).set('Authorization', `Bearer ${adminToken}`);
  assert.equal(retry.status, 204);
});

test('DELETE /tokens/:id returns 204 for a never-existing id', async () => {
  const res = await request(app)
    .delete('/tokens/999')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 204);
});

test('DELETE /tokens/:id returns 400 for a non-numeric id', async () => {
  const res = await request(app)
    .delete('/tokens/abc')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});

test('DELETE /tokens/:id returns 400 for a fractional id', async () => {
  const res = await request(app)
    .delete('/tokens/1.5')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid id');
});

test('POST /tokens with a non-JSON body does not crash', async () => {
  const res = await request(app)
    .post('/tokens')
    .type('text')
    .send('not json');
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
});
