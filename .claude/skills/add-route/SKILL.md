---
name: add-route
description: Use when adding or changing an HTTP endpoint or resource in this Express API (e.g. "add a DELETE /users/:id route", "add an orders endpoint"). Covers the routes/ file layout, db/store.js data access, 400/404 validation, the { "error": "message" } response shape, and writing the matching tests and docs/api.md entry. Not for README, lint-only, or non-route changes.
---

# Adding or changing an API route

Follow this recipe for any new endpoint or resource in this Express API.

## Steps

1. **Data access first.** Add any new read/write helper to `db/store.js` and export it. Routes never hold state or touch arrays directly.
2. **One route file per resource** in `routes/<resource>.js`. It requires `../db/store`, creates `express.Router()`, and exports the router with `module.exports = router`.
3. **Mount it in `server.js`** under its base path, next to the existing `app.use('/users', usersRouter)` lines.
4. **Validate in the route**, before calling the store:
   - bad or missing input -> `400`
   - record not found (store returns `undefined`) -> `404`
   - successful create -> `201`; other successes -> `200` via `res.json(...)`
5. **Error responses are always JSON** shaped `{ "error": "message" }`. Never send plain text or HTML errors. Use `return res.status(...).json(...)` so the handler stops.
6. **Convert path ids** with `Number(req.params.id)` before passing them to the store.
7. **Add tests** in `tests/<resource>.test.js` (see below).
8. **Document the endpoint** in `docs/api.md`.

## Test conventions

- Node's built-in runner: `const test = require('node:test')` and `node:assert`, plus `supertest` against `require('../server')`.
- Call `test.beforeEach(() => store.reset())` so each test starts from seed data.
- Cover the happy path plus each `400` and `404` branch the route can return.

## Before finishing

Run `npm test` and `npm run lint`; both must pass.
