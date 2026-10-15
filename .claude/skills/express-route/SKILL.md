---
name: express-route
description: Use when adding a new route, endpoint, or resource to this Express API (e.g. "add a route for X", "add an endpoint to create/update/delete X"). Not for unrelated changes like tests, docs, or non-route refactors.
---

# Express route conventions

This project follows a fixed shape for routes. Follow it exactly when adding a new route or resource.

## File layout
- One route file per resource in `routes/`, e.g. `routes/orders.js` for an `orders` resource.
- The file exports an Express router via `module.exports = router;`.
- Mount the router in `server.js` under its base path:
  ```js
  const ordersRouter = require('./routes/orders');
  app.use('/orders', ordersRouter);
  ```

## Data access
- Routes never hold state directly. All reads/writes go through `db/store.js`.
- Add the resource's CRUD helpers to `db/store.js` (e.g. `listOrders`, `getOrder`, `createOrder`, `updateOrder`) and export them alongside the existing ones.

## Validation and status codes
- Validate input in the route handler itself.
- Missing/invalid input on write operations (POST/PUT) → `400` with a message naming what's required.
- Record not found (GET/PUT/DELETE by id) → `404`.
- Successful creation → `201`; successful read/update → `200` (default `res.json(...)`).

## Error response shape
All error responses are JSON of the shape:
```json
{ "error": "message" }
```
Use `res.status(<code>).json({ error: '<message>' });` — never a bare string or a differently-shaped body.

## Reference pattern
`routes/users.js` is the canonical example — mirror its structure for new resources:
```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(store.listThings());
});

router.get('/:id', (req, res) => {
  const thing = store.getThing(Number(req.params.id));
  if (!thing) {
    return res.status(404).json({ error: 'Thing not found' });
  }
  return res.json(thing);
});

router.post('/', (req, res) => {
  const { field } = req.body;
  if (!field) {
    return res.status(400).json({ error: 'field is required' });
  }
  const thing = store.createThing({ field });
  return res.status(201).json(thing);
});

module.exports = router;
```
