---
name: add-express-route
description: Use when adding a new resource endpoint (a new route file, or new HTTP methods on an existing one) to this Express API — scaffolds the router, validation, error handling, and matching test file to match this repo's existing conventions. Do not use for unrelated bug fixes or non-route changes.
---

# Adding a route to this Express API

This project follows one consistent shape for every resource router. When adding a
new resource (or new methods on an existing one), match it exactly rather than
inventing a new style.

## Router file (`routes/<resource>.js`)

- One file per resource, `express.Router()`, `module.exports = router`.
- One-line comment above each handler naming the method + path and what it does
  (see `routes/users.js` for the pattern).
- All reads/writes go through `db/store.js` helpers — never hold or mutate state
  directly in the route file.
- Status codes: `200` for reads/updates, `201` for creates, `400` for invalid
  input, `404` when the record doesn't exist.
- Error responses are always `{ "error": "message" }` — never a bare string or a
  different shape.
- Validate required fields before calling the store; return `400` immediately if
  they're missing.

## Wiring it in

- Add any new data-access helpers to `db/store.js` (e.g. `listX`, `getX`,
  `createX`, `updateX`, `deleteX`) — mirror the naming already used for users.
- Mount the router in `server.js` under its base path, next to the existing
  `app.use('/users', usersRouter)` line.

## Tests (`tests/<resource>.test.js`)

- `node:test` + `supertest`, importing `app` from `../server` and `store` from
  `../db/store`.
- `test.beforeEach(() => store.reset())` so every test starts from seeded data.
- Cover: the happy path for each method, a `404` for an unknown id, and a `400`
  for missing/invalid input on create/update — mirror `tests/users.test.js`.

## Docs

- Update `docs/api.md` with the new endpoint(s): method, path, request body,
  response shape, and status codes — same format as the existing `Users` section.
