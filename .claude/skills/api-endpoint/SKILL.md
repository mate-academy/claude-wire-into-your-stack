---
name: api-endpoint
description: Use when adding, changing or removing an HTTP endpoint or route in this Course API (Express routers in routes/, mounted in server.js), e.g. "add a DELETE /users/:id endpoint", "add a /posts resource", "make PUT /users validate email", "return 404 when...". Applies the project's route recipe (store.js helper, 400/404 validation, { error } JSON shape, node:test + supertest tests, docs/api.md update). Do not use for general questions, explaining existing code, or changes that don't touch an HTTP route.
---

# Adding or changing an endpoint in the Course API

Follow these steps in order. They mirror how `routes/users.js`, `db/store.js`, `tests/users.test.js` and `docs/api.md` were built, so a new endpoint looks like the existing ones.

## 1. Data access goes through `db/store.js` first
Routes never hold state. If the endpoint needs a new read or write, add a small helper to `db/store.js` and export it. Return `undefined` (or `false` for deletes) when the record is missing, so the route can turn that into a 404.

```js
function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}
module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, reset };
```

A new resource also needs seed data, plus a reset of that data inside `reset()`, so the tests start clean.

## 2. The route lives in `routes/<resource>.js`
- There's one router file per resource. Add to the existing file if the resource exists. Otherwise create `routes/<resource>.js` exporting `express.Router()` and mount it in `server.js` with `app.use('/<resource>', <resource>Router);`.
- Put a one-line comment above each handler in the form `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`.
- **Validate input in the route.** Bad or missing input → `400`. Missing record → `404`. Always `return` the response.
- **Every error is JSON in the shape `{ error: 'message' }`.** Use a short, human sentence, e.g. `'User not found'` or `'name and email are required'`.
- Success codes: `200` with the JSON body for reads and updates, `201` with the created record for creates, `204` with no body for deletes.

```js
// DELETE /users/:id — remove a user, or 404 if it doesn't exist.
router.delete('/:id', (req, res) => {
  const deleted = store.deleteUser(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).send();
});
```

## 3. Tests in `tests/<resource>.test.js`
Use Node's built-in runner and supertest, the same style as `tests/users.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('DELETE /users/:id removes the user', async () => {
  const res = await request(app).delete('/users/1');
  assert.equal(res.status, 204);
  const after = await request(app).get('/users/1');
  assert.equal(after.status, 404);
});

test('DELETE /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).delete('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});
```

Cover at least:
- **the happy path:** valid input → the success status and body.
- **`404`:** for endpoints that look up a record by id, send an id that matches no record (e.g. `/users/999`) and assert the `{ error }` body.
- **`400`:** for endpoints that accept a body, send an **invalid or incomplete** body (a required field missing, or no updatable field at all) and assert the `{ error }` body. A valid body must never return `400`.

```js
test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'Grace Hopper' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});
```

## 4. Document it in `docs/api.md`
Add a `### METHOD /path` entry under the resource's section. Say what it does, what the body requires, and every status code it returns, in the same short style as the existing entries.

## 5. Verify
Run `npm run lint && npm test`. Both must pass, because CI runs the same two commands. Finish by listing the files you touched: store, route, `server.js` if a new router was mounted, test, docs.
