const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /posts returns the seeded list', async () => {
  const res = await request(app).get('/posts');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /posts/:id returns 404 for a missing post', async () => {
  const res = await request(app).get('/posts/999');
  assert.equal(res.status, 404);
});

test('POST /posts creates a post', async () => {
  const res = await request(app)
    .post('/posts')
    .send({ title: 'New Post', body: 'Some content.' });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'New Post');
  assert.ok(res.body.id);
});

test('PUT /posts/:id updates an existing post', async () => {
  const res = await request(app).put('/posts/1').send({ title: 'Updated Title' });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Updated Title');
});

test('PUT /posts/:id returns 404 for a missing post', async () => {
  const res = await request(app).put('/posts/999').send({ title: 'Nobody' });
  assert.equal(res.status, 404);
});
