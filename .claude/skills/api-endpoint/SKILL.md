---
name: api-endpoint
description: Add or change an HTTP endpoint in this Express course API — a new router under routes/, a new handler on an existing router, or the db/store.js helper, test, and docs/api.md entry that ships with it. Use whenever the request is to create, extend, or modify a REST resource or endpoint in this repo (e.g. "add DELETE /users/:id", "add a projects resource", "make POST /users reject a duplicate email"). Encodes the router layout, store-only data access, the { error: message } response shape, the 400/404 rules, and the node:test + supertest conventions. Not for general Express questions unrelated to this codebase.
---

# Adding or changing an endpoint

Every endpoint in this project touches the same five places. Work through
them in order and do not stop at the route — an endpoint without a test
and a docs entry is not finished here.

| # | File | When |
|---|------|------|
| 1 | `db/store.js` | Only if the endpoint needs a data operation that has no helper yet |
| 2 | `routes/<resource>.js` | Always |
| 3 | `server.js` | Only when adding a brand-new resource (mount the router) |
| 4 | `tests/<resource>.test.js` | Always — one test per status code the endpoint can return |
| 5 | `docs/api.md` | Always — every endpoint is documented |

Finish with `npm test && npm run lint`. Both must be clean.

## 1. Store helpers

All data access goes through `db/store.js`. Routes never touch the arrays
directly, never hold state, and never filter data themselves.

Conventions:

- Lookups return `undefined` when the record is missing — they do not throw
  and do not return `null`. The route turns `undefined` into the 404.
- Mutating helpers take the id plus a plain fields object, and apply only
  the keys that are `!== undefined`.
- Add the new function to the `module.exports = { ... }` list at the bottom.
- If you add a new resource, give it a seed array inside `seed()` and its own
  `nextId` counter, so `reset()` restores it for the tests.

```js
function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}
```

## 2. The route file

One file per resource, exporting an Express router. The router is mounted
under its base path, so paths inside the file are relative — `'/'` and
`'/:id'`, never `'/users'`.

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

House style inside a handler:

- One `//` comment directly above each handler, in the form
  `// METHOD /path — what it does.` (em dash, sentence ends in a period).
- Read params with `Number(req.params.id)` — ids are numbers in the store,
  and `req.params` gives strings.
- Read the body as `const { a, b } = req.body ?? {};`. The `?? {}` is
  deliberate: Express 5 leaves `req.body` undefined when no parser ran.
- Validate **first**, then look the record up. Bad input is a 400 before a
  missing record is a 404.
- Use `return` on every branch in a multi-branch handler, including the
  success path. Single-statement handlers (`res.json(store.listThings())`)
  skip the `return`.
- No try/catch and no `next(err)` — there is no error middleware in this
  project. Handlers validate and return directly.

## 3. Status codes and the error shape

Every error response is JSON in exactly this shape, and nothing else:

```json
{ "error": "message" }
```

| Status | When | Message style |
|--------|------|---------------|
| `200` | Successful read or update | — |
| `201` | Successful create; body is the created record | — |
| `204` | Successful delete; send it with `res.status(204).end()`, never `.json()` | — |
| `400` | Missing or invalid input | Lowercase, names the fields: `'name and email are required'` |
| `404` | No record with that id | Capitalised, names the resource: `'User not found'` |

Match the casing — 400s read like field requirements, 404s read like
sentences. A create returns `201` with the new record, not `200`.

## 4. Tests

Tests live in `tests/<resource>.test.js` and drive the real app over HTTP
with supertest. There are no unit tests of the store on its own.

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('DELETE /things/:id removes an existing thing', async () => {
  const res = await request(app).delete('/things/1');
  assert.equal(res.status, 204);
});
```

Conventions:

- `test.beforeEach(() => store.reset());` at the top of the file, once, so
  each test starts from the seed data.
- Flat `test(...)` calls — no `describe` blocks, no nesting.
- Test name is `'METHOD /path <what it does>'`, lowercase after the path.
- Write one test per status code the endpoint can return. A handler with a
  400, a 404 and a success path gets three tests.
- Assert `res.status` first, then the specific fields that matter. When the
  test is about an error, assert `res.body.error` too.

## 5. Docs

Add the endpoint to `docs/api.md` under its resource's `##` heading, as a
`###` entry in the same order the handlers appear in the route file. One or
two sentences covering the body it accepts and every status it can return.

```md
### DELETE /things/:id
Deletes a thing. Returns `204` with no body, or `404` if no thing has that id.
```

A new resource also needs its own `##` section with a sample record, matching
how `## Users` opens.
