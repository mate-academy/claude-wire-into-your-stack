---
name: add-route
description: Use when adding, changing, or testing an Express endpoint (route handler) in this course API, e.g. "add a DELETE /users/:id", "add a new resource", or "validate input on POST /users". Applies the project's route, store, validation, error-format, test, and docs conventions. Not for general questions or non-route work.
---

# Adding or changing a route in this API

Follow these steps in order.

1. **Route file** - one file per resource in `routes/<resource>.js`, exporting an Express router. Edit the existing file if the resource exists.
2. **Mount it** - for a new resource, add `app.use('/<resource>', <resource>Router)` in `server.js`.
3. **Data access** - read and write only through helpers in `db/store.js`. Routes never hold state. Add a helper there if one is missing, and keep `reset()` working.
4. **Validate input in the route** - return `400` on bad input and `404` when a record is missing. Convert `req.params.id` with `Number(...)`.
5. **Error shape** - always JSON `{ "error": "message" }`, e.g. `res.status(404).json({ error: 'User not found' })`.
6. **Tests** - add cases in `tests/<resource>.test.js` using supertest and `store.reset()` in `beforeEach`. Cover success, `400`, and `404`.
7. **Docs** - update `docs/api.md` with the new or changed endpoint.
8. **Verify** - run `npm test` and `npm run lint`, and fix failures before finishing.
