---
name: add-route
description: "Adds a new API endpoint or route to this project the house way: router file in routes/, data access through db/store.js, wired in server.js, { error } responses with 400 for bad input and 404 for not found, and a matching test in tests/. Use when asked to add, create or build a new endpoint, route or resource, for example /orders or /products."
---

# Add a route

Follow these steps for a new resource (examples use `orders`). Mirror `routes/users.js`, `db/store.js` and `tests/users.test.js`.

1. **Store helpers** in `db/store.js`: add the resource's array and id counter, seed them in `seed()`, and add `listOrders`, `getOrder`, `createOrder` and `updateOrder` as plain functions (`getX` uses `find`, `updateX` returns `undefined` when the record is missing). Export them in `module.exports` next to `reset`. Routes never hold state themselves.
2. **Router file** `routes/orders.js`: one file per resource. Start with `const express = require('express');` and `const store = require('../db/store');`, then `const router = express.Router();`, and end with `module.exports = router;`.
3. **Handlers**: put a one-line comment above each, like `// GET /orders/:id — fetch one order, or 404 if it doesn't exist.` Use `(req, res)` handlers and `return res...` for early exits. Convert ids with `Number(req.params.id)`.
4. **Errors** are always JSON `{ error: 'message' }`:
   - `400` for bad input, e.g. `res.status(400).json({ error: 'name and email are required' })`. Validate in the route, before calling the store.
   - `404` when a record is missing, e.g. `res.status(404).json({ error: 'Order not found' })`.
   - `POST` success returns `201` with the created record.
5. **Mount it** in `server.js`: add `const ordersRouter = require('./routes/orders');` with the other requires, and `app.use('/orders', ordersRouter);` with the other `app.use` lines.
6. **Test** in `tests/orders.test.js`, in the style of `tests/users.test.js`:
   - Use `node:test`, `node:assert`, `supertest` and `require('../server')`.
   - Call `test.beforeEach(() => store.reset());`.
   - Write one `test('METHOD /path does X', async () => {...})` per behaviour, using `assert.equal(res.status, ...)`.
   - Cover the happy path plus every `400` and `404` the route can return.
7. **Verify**: run `npm test` and `npm run lint`, and fix anything that fails.
8. **Docs**: add the new endpoints to `docs/api.md` in the existing format.
