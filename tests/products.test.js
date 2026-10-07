const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('POST /products creates a product', async () => {
  const res = await request(app)
    .post('/products')
    .send({ name: 'Notebook', price: 4.99 });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Notebook');
  assert.equal(res.body.price, 4.99);
  assert.ok(res.body.id);
});

test('POST /products returns 400 when name is missing', async () => {
  const res = await request(app).post('/products').send({ price: 1 });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /products returns 400 for an invalid price', async () => {
  const res = await request(app)
    .post('/products')
    .send({ name: 'Pen', price: -1 });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});
