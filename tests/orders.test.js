const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /orders returns the seeded list', async () => {
  const res = await request(app).get('/orders');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /orders/:id returns 404 for a missing order', async () => {
  const res = await request(app).get('/orders/999');
  assert.equal(res.status, 404);
});

test('POST /orders creates an order', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ product: 'Thingamajig', quantity: 5 });
  assert.equal(res.status, 201);
  assert.equal(res.body.product, 'Thingamajig');
  assert.equal(res.body.quantity, 5);
  assert.ok(res.body.id);
});

test('POST /orders returns 400 when fields are missing', async () => {
  const res = await request(app).post('/orders').send({ product: 'Thingamajig' });
  assert.equal(res.status, 400);
});

test('PUT /orders/:id updates an existing order', async () => {
  const res = await request(app).put('/orders/1').send({ quantity: 10 });
  assert.equal(res.status, 200);
  assert.equal(res.body.quantity, 10);
});

test('PUT /orders/:id returns 404 for a missing order', async () => {
  const res = await request(app).put('/orders/999').send({ quantity: 1 });
  assert.equal(res.status, 404);
});
