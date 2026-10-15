---
name: express-resource-route
description: Use when adding a new REST resource or a new endpoint to this Express course API, or reworking an existing one in routes/ — e.g. "add a POST /projects route", "give users a delete endpoint", "new resource for comments". Covers creating routes/<name>.js as an Express router, mounting it in server.js, going through db/store.js for all state, and applying the project's 400/404 validation and { "error": "message" } response shape, plus the matching node:test + supertest case and docs/api.md entry. Not for frontend, deploy/CI, or dependency changes.
---

# Adding a resource route to the Course API

This project keeps every resource in its own router file and routes all data
access through one in-memory store. Follow these steps so a new endpoint
matches the rest of the codebase.

## 1. The router file — `routes/<resource>.js`

- One file per resource, named for the plural resource (`users.js`,
  `projects.js`).
- Create an `express.Router()`, attach the handlers, `module.exports` it.
- Handlers never touch module-level state directly — they call helpers from
  `../db/store`.

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all.
router.get('/', (req, res) => {
  res.json(store.list<Resource>());
});

// GET /<resource>/:id — one, or 404.
router.get('/:id', (req, res) => {
  const record = store.get<Resource>(Number(req.params.id));
  if (!record) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(record);
});

// POST /<resource> — create; validate required fields first.
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  return res.status(201).json(store.create<Resource>({ name }));
});

module.exports = router;
```

## 2. The store — `db/store.js`

Add helpers next to the existing `users` ones, following the same shape:
a private array + `nextId`, seeded in `seed()`, reset by `reset()`.

- `list<Resource>()` returns the array.
- `get<Resource>(id)` returns one or `undefined`.
- `create<Resource>(fields)` assigns `id: nextId`, pushes, returns it.
- `update<Resource>(id, fields)` mutates only the keys that are `!== undefined`,
  returns the record or `undefined`.
- Export every new helper from `module.exports`.
- Add seed rows to `seed()` so the list endpoint and tests have data.

## 3. Mount it — `server.js`

```js
const <resource>Router = require('./routes/<resource>');
app.use('/<resource>', <resource>Router);
```

Mount it alongside the existing `app.use('/users', ...)` lines, under its
base path only.

## 4. Conventions to hold

- Validate in the route. Missing/blank required field → `400`. Unknown id →
  `404`.
- Every error response is JSON in the shape `{ "error": "message" }` — never
  a bare string, never a different key.
- `PUT` treats `name`/`email`-style fields as optional but requires at least
  one; `400` if the body has none.
- Numeric ids: always `Number(req.params.id)` before calling the store.

## 5. Tests — `tests/<resource>.test.js`

Mirror `tests/users.test.js`:

- `const test = require('node:test');`, `node:assert`, `supertest`, and
  `const app = require('../server')`.
- `test.beforeEach(() => store.reset());` so each test starts from the seed.
- Cover: list returns seeded rows; `GET /:id` 404 on missing; `POST` 201 +
  body echo; `POST` 400 on missing field; `PUT`/`DELETE` happy path and 404.
- Run `npm test` and `npm run lint` — both must pass before committing.

## 6. Docs — `docs/api.md`

Add a section for the resource under the same headings the others use
(`### GET /<resource>`, request body, status codes, example JSON). The doc
is part of the change, not a follow-up.
