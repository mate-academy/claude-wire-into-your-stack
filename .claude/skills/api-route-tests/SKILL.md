---
name: api-route-tests
description: Write or extend tests for this project's Express endpoints. Use whenever work touches tests/ — "add tests for the new route", "cover the 400 case", "write a regression test for that 404", "test the DELETE endpoint". Encodes the house pattern: node:test + node:assert + supertest against the app imported from server.js, with store.reset() in beforeEach. Not for writing the route itself.
---

# Testing an endpoint in this project

Tests here use **Node's built-in test runner** — there is no Jest, Mocha, or Vitest
in this repo, and `npm test` is plain `node --test`. Reach for `node:test` and
`node:assert`, never `describe`/`it`/`expect`.

## Where the test goes

One test file per resource, mirroring `routes/`:

| Route file        | Test file                |
| ----------------- | ------------------------ |
| `routes/users.js` | `tests/users.test.js`    |
| `routes/orders.js`| `tests/orders.test.js`   |

Add cases to the existing file for that resource; only create a new file when
the resource itself is new.

## The shape every test file follows

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

Two details that matter:

- **Import the app, don't start a server.** `server.js` only calls `listen()`
  when it is run directly, so `require('../server')` hands back the Express app
  and supertest drives it in-process. Never call `app.listen()` in a test and
  never hardcode `http://localhost:3000`.
- **`store.reset()` in `beforeEach`.** `db/store.js` is module-level mutable
  state shared across the whole run, so a test that creates or updates a user
  leaks into the next one. Resetting restores the two seeded users
  (Ada Lovelace `id: 1`, Alan Turing `id: 2`) and the id counter.

## Writing a case

Flat top-level `test()` calls with a sentence-style name that says the route,
the condition, and the expected result:

```js
test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
});
```

Rules of thumb:

- Assert the **status first**, then the body — a wrong status makes body
  assertions confusing to read in the failure output.
- Use `assert.equal` for scalars, `assert.ok` for presence/shape checks.
- Send bodies with supertest's `.send({...})`; it sets the JSON content type.
- Keep each `test()` independent. Never rely on ordering or on a record left
  behind by an earlier case.

## What to cover for a new endpoint

Match the route's own branches — the project's convention is `400` on bad
input and `404` on a missing record, so each of those deserves a case:

1. **Happy path** — correct status (`200`, or `201` for a create) and the
   returned body.
2. **Validation failure** — `400` for each required-field branch the route has.
3. **Missing record** — `404` for any route taking an `:id`, using an id that
   is not seeded (`999` is the convention here).

When asserting an error response, check the shape the project standardises on,
`{ "error": "message" }`:

```js
assert.equal(res.status, 404);
assert.equal(res.body.error, 'User not found');
```

## Finish by running them

Always run `npm test` and report the real result. If a test fails, say so with
the output rather than describing the suite as passing.
