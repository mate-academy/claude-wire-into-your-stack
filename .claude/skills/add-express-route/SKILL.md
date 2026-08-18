---
name: add-express-route
description: Use when adding a brand-new resource or route file to this Express API — e.g. "add a /products route", "create an endpoint for orders", "add a new resource for X", "scaffold a route for Y". Encodes this repo's route conventions (one router file per resource, validation, error shape, store access) so a new resource matches routes/users.js. Not for editing an existing route's logic or unrelated Express questions.
---

# Adding a route to the Course API

This project has one convention for every resource router. Follow `routes/users.js`
as the reference implementation.

## Steps

1. Create `routes/<resource>.js`:
   - `const express = require('express');`
   - `const store = require('../db/store');`
   - `const router = express.Router();`
   - Define handlers on `router`, ending with `module.exports = router;`
2. Add the matching helpers to `db/store.js` (e.g. `listWidgets`, `getWidget`,
   `createWidget`, `updateWidget`). Routes never hold state themselves — every
   read/write goes through `db/store.js`.
3. Mount the router in `server.js`:
   `app.use('/<resource>', <resource>Router);` alongside the existing
   `app.use('/users', usersRouter);` line.
4. Add a short comment above each handler describing the route, matching the
   `// GET /users — list all users.` style already in `routes/users.js`.

## Conventions to match exactly

- **Validation**: missing/invalid required fields → `400` with
  `{ "error": "message" }`. Look up a missing record → `404` with
  `{ "error": "message" }`.
- **Error shape**: every error response is `{ "error": "<message>" }` — no
  other fields, no stack traces.
- **IDs**: route params arrive as strings; convert with `Number(req.params.id)`
  before comparing/looking up, as `routes/users.js` does.
- **Status codes**: `200` for reads/updates, `201` for creates, `400` for bad
  input, `404` for a missing record.
- **No inline state**: never declare arrays/objects in the route file to hold
  data — that belongs in `db/store.js` only.

## After scaffolding

- Add tests in `tests/<resource>.test.js` mirroring `tests/users.test.js`
  (use `store.reset()` in `test.beforeEach`, hit the routes via `supertest`).
- Add the new endpoints to `docs/api.md` in the same format as the `## Users`
  section.
- Run `npm run lint` and `npm test` before considering the route done.
