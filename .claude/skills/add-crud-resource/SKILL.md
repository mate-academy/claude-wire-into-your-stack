---
name: add-crud-resource
description: Scaffold a new REST resource (routes + store helpers + mount + tests) in this Express API project, following its existing users.js/store.js conventions. Use when asked to add, create, or wire up a new resource/endpoint/route for a noun (e.g. "add a /products route", "create an orders resource", "add CRUD endpoints for X"). Do not use for editing an existing route's behavior, unrelated bug fixes, or non-resource endpoints like health checks.
---

# Add a CRUD resource

This project follows one consistent shape for every resource (see `routes/users.js`,
`db/store.js`, `tests/users.test.js`). When asked to add a new resource, reproduce
that shape rather than inventing a new pattern.

## Steps

1. **Store helpers** — add an in-memory collection and helpers to `db/store.js`:
   `list<Resource>s()`, `get<Resource>(id)`, `create<Resource>(fields)`, and
   `update<Resource>(id, fields)` if updates are needed. Follow the existing
   `users` collection's style (auto-incrementing `nextId`, plain arrays, `find`).
   Export the new functions alongside the existing ones. Extend `seed()`/`reset()`
   if the resource needs seed data for tests.

2. **Route file** — create `routes/<resource>.js` as an Express router, mirroring
   `routes/users.js`:
   - `GET /` — list all
   - `GET /:id` — fetch one, `404 { "error": "..." }` if missing
   - `POST /` — create, `400 { "error": "..." }` if required fields are missing
   - `PUT /:id` — update, same 400/404 rules as users
   - Never hold state in the route file — always go through `db/store.js`.

3. **Mount it** — in `server.js`, require the new router and `app.use` it under
   its base path, next to the existing `usersRouter`/`healthRouter` lines.

4. **Tests** — add `tests/<resource>.test.js` mirroring `tests/users.test.js`:
   `test.beforeEach(() => store.reset())`, then cover list, get-missing (404),
   create, create-missing-fields (400), and update if applicable.

5. Run `npm test` and `npm run lint` before reporting the task done.

## Conventions to preserve
- Error responses are always JSON `{ "error": "message" }`.
- `400` for bad/missing input, `404` for a record that doesn't exist.
- All data access goes through `db/store.js` — routes never hold state directly.
- One route file per resource, mounted in `server.js` under its base path.
