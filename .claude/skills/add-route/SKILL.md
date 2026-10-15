---
name: add-route
description: >-
  Use when adding a new resource, route, or endpoint to this Express API
  (e.g. "add a products route", "create a DELETE /users/:id endpoint",
  "expose a new resource"). Covers this repo's file layout, store access,
  input validation, and error-response conventions.
---

# Adding a route to the Course API

Follow these conventions — they match `routes/users.js` and `CLAUDE.md`.

1. **One file per resource.** Create `routes/<resource>.js` that builds an
   `express.Router()` and ends with `module.exports = router`.

2. **Mount it in `server.js`** under its base path:
   `app.use('/<resource>', <resource>Router)`, next to the existing routers.

3. **All state goes through `db/store.js`.** Add helper functions there
   (`list<Resource>`, `get<Resource>`, `create<Resource>`, ...) and export
   them. Routes never hold or mutate state directly.

4. **Validate in the route.** Return `400` with `{ "error": "message" }` on
   bad or missing input, and `404` with `{ "error": "message" }` when a
   record does not exist. Every error response is JSON in the shape
   `{ "error": "message" }`.

5. **Status codes.** `201` on create, `200` on read/update, `204` on delete.

6. **Tests** in `tests/<resource>.test.js` using `node:test` + `supertest`,
   importing `../server`, with `test.beforeEach(() => store.reset())` so each
   test starts from the seed data.

7. **Verify:** `npm test` and `npm run lint` both pass.
