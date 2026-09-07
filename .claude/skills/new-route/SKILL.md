---
name: new-route
description: Use when adding a new resource or endpoint to this Express API (e.g. "add a /products endpoint", "create a route for orders") — applies this repo's conventions for route files, data access, validation, and error responses. Not for editing an existing route's logic or unrelated bug fixes.
---

# Adding a new resource route to this API

This project (`db/store.js` + `routes/*.js` + `server.js`) follows a fixed pattern for every
resource. Apply all of it when adding a new one — see `routes/users.js` and `db/store.js` for
the reference implementation.

1. **Store first.** Add the resource's data and CRUD helpers to `db/store.js` (or a new file in
   `db/` if the resource doesn't share state with existing ones). Routes never hold state
   directly — they only call into the store.

2. **One route file per resource.** Create `routes/<resource>.js` exporting an
   `express.Router()`. Handlers call the store helpers, never touch data structures directly.

3. **Mount it in `server.js`** under its base path, alongside the existing `app.use('/users', ...)`
   line.

4. **Validate in the route:**
   - Missing/invalid input on write → `400`
   - Referencing a record that doesn't exist → `404`

5. **Error shape is always** `{ "error": "message" }` — never a bare string or a different key.

6. **Add tests** in `tests/<resource>.test.js`, following `tests/users.test.js`: reset the store
   in `test.beforeEach`, and cover the happy path plus the `400`/`404` cases for each handler.

7. **Lint and test** before considering it done: `npm run lint` and `npm test`.
