---
name: add-api-route
description: Add or change an Express endpoint in this API (new resource, GET/POST/PUT/DELETE handler in routes/, db/store.js helper, mounting in server.js, matching tests and docs/api.md). Use when asked to create, extend or modify a route, endpoint or resource. Not for general refactors or non-API questions.
---

# Add an API route (Course API conventions)

Follow these steps in order. Mirror `routes/users.js` and `tests/users.test.js`.

1. **Store first.** Put all data access in `db/store.js` as an exported helper. Routes never hold state. Return `undefined` when a record is missing.
2. **Route file.** One file per resource in `routes/<resource>.js`, exporting an Express router. Import data only through `../db/store`.
3. **Validate input** in the route: `400` on bad input, `404` when the record is missing, `201` on create.
4. **Errors are always JSON:** `res.status(code).json({ error: 'message' })`. Never send plain text or HTML.
5. **Mount** the router in `server.js` under its base path (e.g. `app.use('/orders', ordersRouter)`).
6. **Tests** in `tests/<resource>.test.js` with `node:test` + `supertest`; call `store.reset()` in `beforeEach`. Cover happy path, `400` and `404`.
7. **Docs:** document the endpoint, request body and error cases in `docs/api.md`.
8. **Verify:** run `npm run lint` and `npm test`; both must pass.
