---
name: adding-api-routes
description: Use when adding or changing an HTTP endpoint or a new resource in this Express API (files under routes/, mounting in server.js, helpers in db/store.js). Not for general JS questions or changes that don't touch endpoints.
---

# Adding a route to this API

Follow the shape `routes/users.js` already has. Don't invent a new one.

## Steps

1. **Route file**: one file per resource at `routes/<resource>.js`. It creates `express.Router()`, requires `../db/store`, and ends with `module.exports = router`.
2. **Comment each handler** like `// GET /users/:id — fetch one user, or 404 if it doesn't exist.`
3. **Validate first**, then act:
   - bad input → `return res.status(400).json({ error: '...' })`
   - missing record → `return res.status(404).json({ error: '<Thing> not found' })`
   - create → `201`, everything else `200`
   - cast ids with `Number(req.params.id)`; always `return res...` so a handler can't respond twice
   - errors are always `{ "error": "message" }`
4. **Data goes through `db/store.js`**. Routes never keep state. A new resource gets a module-level array, its own `nextId`, an entry in `seed()` and `reset()`, plain helper functions (`listX`, `getX`, `createX`, `updateX`), and every helper added to `module.exports`.
5. **Mount it** in `server.js`: `app.use('/<resource>', <resource>Router);` next to the others.
6. **Tests** in `tests/<resource>.test.js`: `node:test`, `node:assert`, `supertest`, and `test.beforeEach(() => store.reset())`. Cover the happy path, the 400 case, and the 404 case.
7. **Docs**: add the endpoint to `docs/api.md`, same format as the existing ones.
8. **Check**: run `npm run lint && npm test`.

## Template

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

// POST /things — create a thing. Requires name.
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  return res.status(201).json(store.createThing({ name }));
});

module.exports = router;
```
