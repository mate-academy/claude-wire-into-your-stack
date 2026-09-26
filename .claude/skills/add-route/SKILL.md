---
name: add-route
description: >-
  Use when adding or changing an HTTP endpoint (route) in this Express API.
  Covers route layout, data access through db/store.js, 400/404 validation,
  JSON error responses, tests, and docs/api.md updates.
  Not for unrelated refactors, dependency changes, or config changes.
---

# Adding or changing a route in this API

Follow the existing patterns in `routes/users.js`.

1. Keep one route file per resource in `routes/<resource>.js`.
   Export an Express router. Mount new resources in `server.js`.

2. Access data only through `db/store.js`.
   Routes must never hold application state directly.

3. Validate input in the route.
   - Bad or missing input: `400`
   - Record not found: `404`
   - Success: `200`
   - Creation: `201`
   - Parse numeric ids with `Number(req.params.id)`.

4. Return errors as JSON:

   `{ "error": "message" }`

   Use `res.status(...).json(...)`, not plain-text `.send()` errors.

5. Add or update tests in `tests/<resource>.test.js`.
   Use the existing `node:test`, `assert`, and `supertest` patterns.
   Reset the store between tests as the existing tests do.
   Cover success plus the relevant `400` and `404` cases.

6. Update `docs/api.md` with the method, path, request body,
   and status codes returned.

7. Before finishing, run:

   `npm test`

   `npm run lint`
