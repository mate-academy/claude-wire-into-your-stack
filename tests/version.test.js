const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');
const { version } = require('../package.json');

test.beforeEach(() => store.reset());

test('GET /api/version returns the package version', async () => {
  const res = await request(app).get('/api/version');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { version });
});
