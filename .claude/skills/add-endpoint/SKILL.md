---
name: add-endpoint
description: Add or change an HTTP endpoint or resource in this Express API (routes/, db/store.js, server.js, tests/, docs/api.md). Use only when the request is to create a new route or resource, add a method to an existing route file, or change an endpoint's behavior. Do not use for general questions, explanations, or non-API work.
---

# Add or change an endpoint

Every endpoint in this project is built the same way. Follow these steps in order, matching the existing code in `routes/users.js` and `db/store.js`.

1. **Data access (`db/store.js`)** — Add the helper(s) the route needs and export them. Routes never hold state or touch data directly. If a new resource needs data, add its in-memory array, seed data, and make `reset()` restore it.
2. **Route (`routes/<resource>.js`)** — One file per resource, exporting an Express router. For a new resource, create the file and mount it in `server.js` under its base path (`app.use('/<resource>', ...)`).
3. **Validation and errors** — Validate input in the route. Return `400` for bad input and `404` when a record is missing. Errors are always JSON in the shape `{ "error": "message" }`. Use `201` for creates.
4. **Tests (`tests/<resource>.test.js`)** — Use Node's test runner with supertest and `store.reset()` in `test.beforeEach`. Cover the success case plus each `400` and `404` path.
5. **Docs (`docs/api.md`)** — Document the endpoint: method and path, request body, success response, and error responses.
6. **Verify** — Run `npm test` and `npm run lint`. Fix failures before reporting done.

## Rules
- Don't add state, `fs` access, or a second data layer inside a route.
- Don't change the error response shape.
- Keep the change limited to the endpoint asked for.
