const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /products returns the seeded list', async () => {
  const res = await request(app).get('/products');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /products/:id returns one product', async () => {
  const res = await request(app).get('/products/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Notebook');
});

test('GET /products/:id returns 404 for a missing product', async () => {
  const res = await request(app).get('/products/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Product not found' });
});

test('POST /products creates a product', async () => {
  const res = await request(app).post('/products').send({ name: 'Stapler', price: 9.99 });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Stapler');
  assert.ok(res.body.id);
});

test('POST /products returns 400 when price is missing or invalid', async () => {
  const missing = await request(app).post('/products').send({ name: 'Stapler' });
  assert.equal(missing.status, 400);
  assert.ok(missing.body.error);
  const negative = await request(app).post('/products').send({ name: 'Stapler', price: -1 });
  assert.equal(negative.status, 400);
});
