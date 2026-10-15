---
name: create-express-route
description: Use when adding a new Express route, endpoint, or resource (e.g. "add a route", "create an endpoint", "new REST resource") to this Course API project (server.js, routes/, db/store.js) — describes this repo's route file layout, data-access, validation, and error-response conventions. Do not use for Express/Node questions unrelated to this repository, or for changes to non-route code.
---

# Creating a new Express route in this project

This repo follows a fixed layout: one router file per resource, mounted in
`server.js`, with all data access going through `db/store.js`.

## Steps

1. **Add data-access helpers to `db/store.js`** (if the resource is new).
   Export plain functions (e.g. `listWidgets`, `getWidget`, `createWidget`)
   that read/write the in-memory store. Routes never hold state directly.

2. **Create `routes/<resource>.js`**:
   ```js
   const express = require('express');
   const store = require('../db/store');

   const router = express.Router();

   // GET /<resource> — list all.
   router.get('/', (req, res) => {
     res.json(store.listWidgets());
   });

   // GET /<resource>/:id — fetch one, or 404 if missing.
   router.get('/:id', (req, res) => {
     const widget = store.getWidget(Number(req.params.id));
     if (!widget) {
       return res.status(404).json({ error: 'Widget not found' });
     }
     return res.json(widget);
   });

   module.exports = router;
   ```
   - One short comment per handler naming the method + path.
   - Validate input in the route; return `400` on bad input, `404` when a
     record is missing.
   - All error responses are JSON shaped `{ "error": "message" }`.

3. **Mount the router in `server.js`**:
   ```js
   const widgetsRouter = require('./routes/widgets');
   app.use('/widgets', widgetsRouter);
   ```

4. **Add tests in `tests/<resource>.test.js`**, following
   `tests/users.test.js`: Node's built-in `node:test` + `supertest` against
   the exported `app`, with `store.reset()` in `test.beforeEach`.

5. **Document the endpoints in `docs/api.md`**, following the existing
   `## Users` section format (one `###` heading per route with method,
   path, and response shape).

## Reference

See `routes/users.js` and `routes/health.js` for existing examples of this
pattern.
