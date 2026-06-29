# Skill: add-route

## When to use
Use this skill when the user asks to add a new resource, route, or endpoint to the API — for example: "add a products route", "create an orders endpoint", "add CRUD for X".

Do NOT use for editing existing routes, fixing bugs, or adding a single handler to an existing router file.

## Steps

1. **Create `routes/<resource>.js`**
   - Require `express` and `../db/store`
   - Create a `router` with `express.Router()`
   - Implement handlers following these rules:
     - Validate required input; return `400` with `{ "error": "..." }` if missing
     - Look up records via store; return `404` with `{ "error": "... not found" }` if absent
     - Return `201` on POST, `200` otherwise
     - All data access through `db/store` — no state in the route file
   - Export the router with `module.exports = router`

2. **Mount the router in `server.js`**
   - `require` the new router
   - Mount it: `app.use('/<resource>', <resource>Router)`

3. **Add store methods in `db/store.js`**
   - Add `list<Resource>`, `get<Resource>`, `create<Resource>` (and `update<Resource>` if needed)
   - Seed two initial records in the `reset()` function

4. **Create `tests/<resource>.test.js`**
   - Import `node:test`, `node:assert`, `supertest`, `../server`, `../db/store`
   - Call `store.reset()` in `test.beforeEach`
   - Cover: list returns seeded data, missing record returns 404, create returns 201, update returns 200, update missing returns 404

## Example structure

```js
// routes/products.js
const express = require('express');
const store = require('../db/store');
const router = express.Router();

router.get('/', (req, res) => res.json(store.listProducts()));

router.get('/:id', (req, res) => {
  const product = store.getProduct(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json(product);
});

router.post('/', (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required' });
  return res.status(201).json(store.createProduct({ name, price }));
});

module.exports = router;
```
