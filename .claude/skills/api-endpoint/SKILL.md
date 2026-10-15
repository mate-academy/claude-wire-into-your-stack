---
name: api-endpoint
description: Use when adding, changing, or removing an HTTP endpoint in this Express API — a new route file under routes/, a new method on an existing router (GET/POST/PUT/PATCH/DELETE), a change to request validation, status codes, or error responses, or a new resource that needs mounting in server.js. Covers this project's router-per-resource layout, the db/store.js data-access rule, the 400/404 validation contract, the {"error":"message"} body shape, and the test and docs/api.md updates every endpoint change must ship with.
---

# Writing an endpoint in this API

Every endpoint here is four files, not one: the router, the store helper it
reads through, a test, and the entry in `docs/api.md`. A change that touches
only the router is incomplete.

## 1. The route

One file per resource in `routes/`, exporting an Express router. Paths inside
the file are relative to the mount point, so `/users/:id` is `router.get('/:id')`.

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /widgets/:id — fetch one widget, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const widget = store.getWidget(Number(req.params.id));
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  return res.json(widget);
});

module.exports = router;
```

Rules that hold for every handler:

- **Validate first, then act.** Bad input is `400`; a well-formed request for a
  record that isn't there is `404`. Return early on both.
- **Every error body is `{ "error": "message" }`** — a lowercase sentence for
  validation (`'name and email are required'`), `'<Resource> not found'` for a
  missing record. Never a bare string, never a different key.
- **`return` every `res` call**, including the last one, so the early-return
  shape reads consistently.
- **Ids off the URL are strings** — `Number(req.params.id)` before it reaches
  the store, which compares with `===`.
- **A one-line `// METHOD /path — what it does.` comment** above each handler.
- Creating returns `201` with the new record; updating and fetching return
  `200`; there is no `204` convention here yet.

## 2. The store

Routes never hold state. All reads and writes go through `db/store.js` so that
swapping in a real database touches one file. Adding an endpoint that needs new
data access means adding a helper there first and exporting it from the
`module.exports` list at the bottom.

Store helpers return `undefined` when a record is missing — the route turns
that into the `404`, the store never sends a response or knows about HTTP.
Anything that mutates the seed data must stay resettable by `reset()`, which
the tests call before each case.

## 3. Mounting a new resource

A new router is mounted in `server.js` under its base path, beside the others:

```js
const widgetsRouter = require('./routes/widgets');
app.use('/widgets', widgetsRouter);
```

## 4. The test

Tests live in `tests/<resource>.test.js`, using Node's built-in runner with
`supertest` against the exported app (`server.js` only listens when run
directly). Reset the store before each test:

```js
test.beforeEach(() => store.reset());

test('GET /widgets/:id returns 404 for a missing widget', async () => {
  const res = await request(app).get('/widgets/999');
  assert.equal(res.status, 404);
});
```

Cover the happy path plus each failure branch the handler can return — a `400`
case for every validation rule, a `404` case for every lookup. Assert on
`res.status` and the fields that matter, not the whole body.

## 5. The docs

`docs/api.md` is the API reference and is expected to match the code. Add the
endpoint under its resource heading in the existing style: the method and path
as an `###` heading, one line on what it does, and the status codes it can
return. Never leave an endpoint documented but not implemented, or the reverse.

## Before you call it done

Run both, and expect them clean — CI runs the same two on every pull request:

```
npm run lint
npm test
```
