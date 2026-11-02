const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /books returns an empty list for a new library', async () => {
  const res = await request(app).get('/books');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, []);
});

test('POST /books adds a book to the library', async () => {
  const res = await request(app)
    .post('/books')
    .send({ title: 'The Analytical Engine', author: 'Ada Lovelace' });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'The Analytical Engine');
  assert.equal(res.body.author, 'Ada Lovelace');
  assert.ok(res.body.id);

  const list = await request(app).get('/books');
  assert.equal(list.body.length, 1);
});

test('POST /books returns 400 when title or author is missing', async () => {
  const noAuthor = await request(app).post('/books').send({ title: 'Untitled' });
  assert.equal(noAuthor.status, 400);
  assert.deepEqual(noAuthor.body, { error: 'title and author are required' });

  const noTitle = await request(app).post('/books').send({ author: 'Nobody' });
  assert.equal(noTitle.status, 400);
});

test('GET /books/:id returns one book', async () => {
  const created = await request(app)
    .post('/books')
    .send({ title: 'Computing Machinery', author: 'Alan Turing' });
  const res = await request(app).get(`/books/${created.body.id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Computing Machinery');
});

test('GET /books/:id returns 404 for a missing book', async () => {
  const res = await request(app).get('/books/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Book not found' });
});
