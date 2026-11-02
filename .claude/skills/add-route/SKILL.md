---
name: add-route
description: Use when adding or modifying an Express route or endpoint in this API (e.g. "add a DELETE /users/:id endpoint", "create a new resource route"). Applies the project's route, validation, error-shape, store, and test conventions.
---

# Adding or changing a route

Reference example: `routes/users.js`. Follow these steps in order.

1. **One file per resource** in `routes/`, exporting an Express router. Mount it in `server.js` under its base path (`app.use('/things', thingsRouter)`).
2. **Data access only through `db/store.js`.** Add a helper there if needed; routes never hold state.
3. **Convert ids:** `Number(req.params.id)` before calling the store (params are strings, the store compares strictly).
4. **Validate input in the route** and return `400` on bad input.
5. **Return `404`** when a record is missing.
6. **Errors are JSON** shaped `{ "error": "message" }`. Success uses `201` for creates, `200` otherwise.
7. **Add tests** in `tests/` using `node:test` + `supertest` against the exported `app`. Call `store.reset()` in `test.beforeEach`. Cover the success, `400`, and `404` paths.
8. **Update `docs/api.md`** with the new endpoint.
9. **Verify:** run `npm run lint && npm test`.
