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

test('GET /products/:id returns 404 for a missing product', async () => {
  const res = await request(app).get('/products/999');
  assert.equal(res.status, 404);
});

test('POST /products creates a product', async () => {
  const res = await request(app)
    .post('/products')
    .send({ name: 'Doohickey', price: 4.99 });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Doohickey');
  assert.equal(res.body.price, 4.99);
  assert.ok(res.body.id);
});

test('POST /products returns 400 when name is missing', async () => {
  const res = await request(app).post('/products').send({ price: 4.99 });
  assert.equal(res.status, 400);
});

test('POST /products returns 400 when price is missing', async () => {
  const res = await request(app).post('/products').send({ name: 'Thing' });
  assert.equal(res.status, 400);
});

test('POST /products returns 400 when price is not a number', async () => {
  const res = await request(app).post('/products').send({ name: 'Thing', price: 'free' });
  assert.equal(res.status, 400);
});
