---
description: Scaffold a new route/resource (store helpers, router, mount, tests, docs) for this Express API
argument-hint: <resource-singular> <resource-plural>
---

Scaffold new resource "$ARGUMENTS" in this repo. First arg = singular name (e.g. `product`), second = plural (e.g. `products`). If only one word given, infer plural by adding `s`.

Follow `routes/users.js`, `tests/users.test.js`, and `db/store.js` as the reference shape. 

Do these steps in order:

1. **Store** (`db/store.js`): add list/get/create/update helpers for the resource, matching the naming pattern of the existing `*User` helpers. Mutate the in-memory array there only — never in the route file.

2. **Route file** `routes/<plural>.js`:
```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(store.list<Things>());
});

router.get('/:id', (req, res) => {
  const thing = store.get<Thing>(Number(req.params.id));
  if (!thing) {
    return res.status(404).json({ error: '<Thing> not found' });
  }
  return res.json(thing);
});

router.post('/', (req, res) => {
  const { field } = req.body;
  if (!field) {
    return res.status(400).json({ error: 'field is required' });
  }
  const thing = store.create<Thing>({ field });
  return res.status(201).json(thing);
});

module.exports = router;
```
Validate input in the route: `400` on bad input, `404` when a record is missing. Every error body is `{ "error": "message" }`.

3. **Mount** in `server.js`:
```js
const <plural>Router = require('./routes/<plural>');
app.use('/<plural>', <plural>Router);
```

4. **Tests** `tests/<plural>.test.js`, following `tests/users.test.js`'s shape (uses `node:test`, `supertest`, `store.reset()` in `beforeEach`, covers list/404/create).

5. **Docs**: add `### METHOD /path` sections for the new endpoints to `docs/api.md`, matching existing entries.

6. Run `npm test` and `npm run lint`. Fix anything that fails before reporting done.
