---
name: express-route
description: MUST be used before implementing, planning or explaining any new or changed API endpoint, route handler or resource in this Express project (for example "add a DELETE /users/:id endpoint", "add a new GET/POST/PUT route", "create a /orders resource", or writing route tests). Holds this project's required conventions for route files, db/store.js helpers, 400/404 validation, the {"error": "message"} format and supertest tests. Not for unrelated questions.
---

# Writing routes in this project

Follow these steps every time a route is added or changed.

1. **One router file per resource** in `routes/<resource>.js`, exporting an Express router. Mount it in `server.js` under its base path (`app.use('/things', thingsRouter)`).
2. **All data goes through `db/store.js`.** Add helper functions there (and export them); routes never hold state. Keep `reset()` restoring seed data.
3. **Validate input in the route.** Missing/invalid body fields -> `res.status(400).json({ error: 'name and email are required' })`. Missing record -> `res.status(404).json({ error: 'User not found' })`. Use `return` on every early response.
4. **Error shape is always** `{ "error": "message" }` — never plain text, never other keys.
5. **Status codes:** `200` read/update, `201` create, `400` bad input, `404` missing record.
6. **Convert path ids with `Number(req.params.id)`** before calling the store.
7. **Tests** go in `tests/<resource>.test.js` using `node:test`, `node:assert` and `supertest` against `require('../server')`, with `test.beforeEach(() => store.reset())`. Cover the happy path, the `400` case and the `404` case.
8. **Document it** in `docs/api.md` in the same style as existing endpoints.
9. Finish by running `npm test` and `npm run lint`.
