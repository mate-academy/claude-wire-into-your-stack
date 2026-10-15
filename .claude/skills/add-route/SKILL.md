---
name: add-route
description: Use when adding a new HTTP route, endpoint, or resource to this Express API, or adding a new method to an existing resource (e.g. "add a DELETE endpoint", "create a /products resource", "add a route for..."). Encodes this repo's route conventions — router file layout, data access, validation, error shape, tests, and docs — so new endpoints match the existing ones. Not for unrelated changes (config, non-HTTP logic, other projects).
---

# Adding a route in this Express API

This repo has one consistent shape for every resource. Follow it exactly rather
than inventing a new pattern, even for a single extra method.

1. **Router file.** One file per resource in `routes/<resource>.js`, exporting
   an `express.Router()`. If the resource already has a file (e.g. `users.js`),
   add the new route there instead of creating another file.

2. **Mount it.** New resource files get mounted in `server.js` with
   `app.use('/<base-path>', <resource>Router)`, next to the existing
   `app.use('/users', usersRouter)` line.

3. **Data access only through the store.** Routes never hold state directly.
   All reads/writes go through `db/store.js` — add a helper function there
   (e.g. `deleteUser`) rather than touching an array from the route.

4. **Validation.**
   - Missing/invalid input in the request → `400` with a JSON body.
   - Record not found → `404` with a JSON body.
   - Both cases use the shared error shape: `{ "error": "message" }`.

5. **Tests.** Add supertest cases in `tests/<resource>.test.js` (or the
   existing file for that resource). Use `test.beforeEach(() => store.reset())`
   so each test starts from the seed data, matching `tests/users.test.js`.

6. **Docs.** Update `docs/api.md` with the new endpoint: method + path, a short
   description, and the response shape(s) including error cases — following
   the existing entries for `/users`.

Don't skip steps 5 or 6 just because the route works — an endpoint without a
test or doc entry is incomplete by this repo's standard.
