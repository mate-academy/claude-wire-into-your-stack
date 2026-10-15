const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('exports a usable Express app', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
});

test('/health is mounted and reachable', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('/users is mounted and reachable', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('JSON body parsing middleware is active', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Katherine Johnson', email: 'katherine@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Katherine Johnson');
});

test('requesting an undefined route returns 404', async () => {
  const res = await request(app).get('/no-such-route');
  assert.equal(res.status, 404);
});
