---
name: add-api-endpoint
description: Use when adding, changing or removing an HTTP endpoint or resource in this Express Course API — e.g. "add DELETE /users/:id", "add a /posts resource", "make PUT /users validate email", "return 400 for bad ids". Covers the route in routes/, the db/store.js helper, the server.js mount, node:test + supertest tests, and docs/api.md. Not for CI, ESLint config, MCP/Claude settings, or refactors that don't change an endpoint's behaviour.
---

# Adding or changing an endpoint

Every endpoint change in this project touches the same five places, in this order.
Don't skip any of them: a route without tests and docs is not done.

## 1. Data access — `db/store.js`

Routes never hold state. Add or extend a helper in `db/store.js` and export it.

- Look-ups return `undefined` when the record is missing (the route turns that into 404).
- Mutating helpers return the changed record, or `undefined` if it didn't exist.
- A new resource gets its own array + `nextId` counter, seeded inside `seed()`, so
  `reset()` restores it and tests stay isolated.

```js
function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  const [removed] = users.splice(index, 1);
  return removed;
}
// ...and add it to module.exports
```

## 2. Route — `routes/<resource>.js`

One file per resource, exporting an `express.Router()`. Each handler has a one-line
comment `// METHOD /path — what it does.` above it.

Order inside a handler: **validate → call store → 404 → success**. Always `return res...`.

| Situation | Status | Body |
|---|---|---|
| Bad or missing input (incl. a non-integer `:id`) | `400` | `{ error: 'message' }` |
| Record not found | `404` | `{ error: '<Thing> not found' }` |
| Read / update OK | `200` | the record |
| Created | `201` | the created record |
| Deleted | `204` | no body (`res.status(204).end()`) |

Errors are **always** JSON `{ error: '...' }` — never plain text, never another key.

```js
// DELETE /users/:id — remove a user, or 404 if it doesn't exist.
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'id must be an integer' });
  }
  const user = store.deleteUser(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).end();
});
```

(The existing `GET`/`PUT /users/:id` handlers don't validate the id yet and answer
`404` for `/users/abc`; new handlers should validate as above.)

## 3. Mount — `server.js`

Only for a **new resource**: require the router and mount it under its base path next
to the others (`app.use('/posts', postsRouter);`). Keep the `require.main === module`
guard and `module.exports = app` intact — the tests import the app.

## 4. Tests — `tests/<resource>.test.js`

Node's built-in runner + supertest, matching `tests/users.test.js`:

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
```

- Test names are `'<METHOD> <path> <expected behaviour>'`.
- One test per status the endpoint can return: the happy path **and** every 400/404.
- For error cases also assert the shape: `assert.ok(res.body.error)`.
- Rely on the seed data (users 1 and 2; 999 is the "missing" id), never on order between tests.

## 5. Docs — `docs/api.md`

Add or update the `### METHOD /path` section under its resource heading: what it does,
the request body, and every status code it returns.

## Finish

Run `npm test` and `npm run lint`; both must pass before you report the change as done.
