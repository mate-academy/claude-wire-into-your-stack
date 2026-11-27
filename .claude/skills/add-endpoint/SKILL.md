---
name: add-endpoint
description: Use when adding or changing an HTTP endpoint in this Express API - a new route, a new resource (e.g. /posts), a new method on an existing resource (e.g. DELETE /users/:id), or changing a route's input validation, status codes or response body. Walks through the route file, db/store.js helpers, mounting in server.js, tests and docs/api.md. Not for reviewing a diff, lint or CI config, or questions that change no code.
---

# Adding or changing an endpoint

Every endpoint in this API touches the same five places. Work through them in order and finish with the check at the end.

## 1. Store helper in `db/store.js`

Routes never hold state. Any read or write goes through a function in `db/store.js`.

- Keep data in a module-level array with its own `nextId` counter, like `users`.
- A new collection gets seed data inside `seed()`, so `reset()` clears it between tests.
- A lookup that finds nothing returns `undefined` (the route turns that into a `404`).
- Export every new function in `module.exports`.

```js
function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}
```

## 2. Route in `routes/<resource>.js`

One file per resource, exporting an `express.Router()`. Add a new method to the existing file for that resource.

- Put a one-line comment above each handler naming the method, path and what it does, written like the existing comments.
- Parse ids with `Number(req.params.id)`.
- Validate input in the route. Bad input returns `400`, a missing record returns `404`.
- Errors are always JSON in the shape `{ error: 'message' }`. Never send `{ message }`, plain text, or a stack trace.
- Use `return res...` on every early exit.

| Case | Status | Body |
| --- | --- | --- |
| Read or update succeeded | `200` | the record (or array) |
| Create succeeded | `201` | the created record |
| Delete succeeded | `204` | none: `res.status(204).end()` (not `sendStatus`, which sends a text body) |
| Required field missing or invalid | `400` | `{ error: 'name and email are required' }` |
| Record not found | `404` | `{ error: 'User not found' }` |

Required fields: `if (!name || !email)`. Partial update (PUT): at least one field, checked with `=== undefined`.

## 3. Mount in `server.js`

A new resource gets `app.use('/<resource>', <resource>Router);` next to the existing ones. A new method on an existing resource needs no change here.

## 4. Tests in `tests/<resource>.test.js`

Node's built-in runner with supertest, one file per resource.

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('DELETE /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).delete('/users/999');
  assert.equal(res.status, 404);
});
```

- Name tests `'<METHOD> <path> <what it does>'`.
- Assert the status first, then the body.
- Cover the success case plus every `400` and `404` path the route has.

## 5. Docs in `docs/api.md`

Add or update a `### <METHOD> <path>` entry under the resource's section: one sentence on what it does, which body fields it takes, and which status codes it returns.

## Done check

Run `npm test` and `npm run lint`. Both must pass before you report the endpoint as done.
