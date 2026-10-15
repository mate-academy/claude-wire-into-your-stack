---
name: add-express-route
description: Use when adding a new resource, route, or endpoint to this Express API — e.g. "add a route for orders", "create a DELETE endpoint for users", "add a new resource called X". Scaffolds a router file, store functions, tests, and docs following this project's conventions (routes/, db/store.js, 400/404 validation, { "error": "message" } error shape). Not for editing unrelated app logic.
---

# Adding a route to this project

This repo has one consistent way of adding a resource. Follow it exactly, using
`routes/users.js` and `tests/users.test.js` as the reference examples.

## Steps

1. **Store layer first.** Add any new data-access functions to `db/store.js`
   (e.g. `listX`, `getX`, `createX`, `updateX`). Routes never hold state or
   touch data directly — they only call `db/store.js` helpers.

2. **One router file per resource.** Create `routes/<resource>.js`:
   - `const express = require('express'); const store = require('../db/store');`
   - `const router = express.Router();`
   - One handler per verb, each with a one-line comment describing the route
     (see the style in `routes/users.js`).
   - `module.exports = router;`

3. **Validate in the route, not the store:**
   - Missing/invalid input on write → `400` with `{ "error": "message" }`.
   - Record not found by id → `404` with `{ "error": "message" }`.
   - Every error response is JSON in exactly that `{ "error": "..." }` shape —
     no other fields, no plain-text errors.

4. **Mount it in `server.js`** with `app.use('/<base-path>', <resource>Router);`,
   next to the existing `app.use('/users', usersRouter)` line.

5. **Write tests** in `tests/<resource>.test.js` using `node:test` + `supertest`,
   mirroring `tests/users.test.js`:
   - `test.beforeEach(() => store.reset());` if the store needs resetting.
   - Cover the happy path, the `400` validation case, and the `404` case for
     each write/lookup route.

6. **Update `docs/api.md`** with the new endpoint(s), following the existing
   entries' format (method + path heading, one-line description, request/response
   shape, status codes).

7. Run `npm run lint` and `npm test` before considering the work done.
