---
name: api-endpoint
description: Conventions for adding or changing an HTTP endpoint in this Express API — where the route file goes, mounting it in server.js, reading and writing only through db/store.js, 400/404 validation, the { "error": "message" } response shape, the node:test + supertest test file, and the docs/api.md entry. Use whenever a request adds, changes, or removes a route, endpoint, or resource under routes/ (for example "add DELETE /users/:id", "add a /projects resource", "make POST /users reject a blank email"), or asks for tests for an endpoint.
---

# Adding or changing an endpoint

Work through these in order. Steps 5–7 are what make the change complete, not optional extras.

## 1. The route file

One file per resource: `routes/<resource>.js`, exporting an Express router. Paths inside the
file are relative to the mount point, so the collection is `'/'` and a single record is
`'/:id'` — never repeat the base path inside the router.

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /things/:id — fetch one thing, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const thing = store.getThing(Number(req.params.id));
  if (!thing) {
    return res.status(404).json({ error: 'Thing not found' });
  }
  return res.json(thing);
});

module.exports = router;
```

Every handler gets a `// METHOD /path — what it does.` comment above it, written with the
full public path. Handlers with more than one branch use `return res...` on every branch,
including the last.

## 2. Mount it in `server.js`

Require the router alongside the others and mount it under its base path:

```js
const thingsRouter = require('./routes/things');
app.use('/things', thingsRouter);
```

## 3. All data access goes through `db/store.js`

Routes never hold state and never touch the module's arrays directly. If the endpoint needs
an operation the store doesn't have, add a helper in `db/store.js` and add it to the
`module.exports` object at the bottom. Keep `seed()`/`reset()` consistent — the tests call
`reset()` before every test.

## 4. Status codes and the error shape

| Situation | Status | Body |
|---|---|---|
| Read succeeded | `200` | the record, or an array |
| Record created | `201` | the created record |
| Missing or invalid input | `400` | `{ error: 'name and email are required' }` |
| No record with that id | `404` | `{ error: 'User not found' }` |

Every error body is `{ "error": "message" }` — a lowercase phrase for validation failures,
`'<Resource> not found'` for a missing record. Validate the body first, then look the
record up, so bad input returns `400` even when the id doesn't exist.

## 5. Tests — `tests/<resource>.test.js`

Node's built-in runner with supertest against the imported app; no port is opened. Reset the
store before each test.

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('DELETE /things/:id removes a thing', async () => {
  const res = await request(app).delete('/things/1');
  assert.equal(res.status, 204);
});
```

One `test(...)` per behaviour, named `'<METHOD> /path <what it does>'`. Cover the success
path and every error branch you added — a `404` test for a missing id, a `400` test for
invalid input.

## 6. Document it in `docs/api.md`

Add a `### METHOD /path` section under that resource's heading, in the same order as the
routes. Say what it returns and name every non-200 status it can produce.

## 7. Verify

```
npm run lint && npm test
```

Both must pass — CI runs exactly these two on every push and pull request.
