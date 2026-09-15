const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

test('GET /api/ping returns ok status', async () => {
  const res = await request(app).get('/api/ping');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});
