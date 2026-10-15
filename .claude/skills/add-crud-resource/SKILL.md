---
name: add-crud-resource
description: Use when adding a new REST resource or route to this Express API — e.g. "add a posts resource", "create a new /orders endpoint", "add CRUD for X". Scaffolds the store helpers, router, server mount, and matching test file to follow this project's existing conventions (routes/users.js, db/store.js, tests/users.test.js), rather than inventing a new shape.
---

# Adding a CRUD resource to this API

This project has one established shape for a resource: `users`. When asked to
add a new resource, follow that shape exactly rather than improvising a new
pattern. Use `routes/users.js`, `db/store.js`, and `tests/users.test.js` as
the reference for every file you touch below.

## 1. Store helpers (`db/store.js`)

Add plain functions for the new resource, mirroring the existing
`listUsers`/`getUser`/`createUser`/`updateUser` pattern:

- an in-memory array + `nextId` counter, seeded like `seed()` does for users
- `list<Resource>()`, `get<Resource>(id)`, `create<Resource>(fields)`,
  `update<Resource>(id, fields)` — same signatures and return shapes as the
  user versions (`get`/`update` return `undefined` when missing)
- if a `reset()` already exists, extend it to also reset the new resource's
  seed data, so tests stay isolated
- export the new functions alongside the existing ones

Routes must never hold state directly — all reads/writes go through this file.

## 2. Router (`routes/<resource>.js`)

One file per resource, following `routes/users.js`:

- `GET /` — list all, via the store's `list<Resource>()`
- `GET /:id` — fetch one; `404 { error: '<Resource> not found' }` if missing
- `POST /` — create; validate required fields, `400 { error: '<fields> are required' }` on bad input, `201` with the created record on success
- `PUT /:id` — update; `400` if no updatable field was given, `404` if the id doesn't exist, else `200` with the updated record

Error responses are always JSON in the shape `{ "error": "message" }` — no
other error shape. `req.params.id` is compared as a `Number(...)`, matching
the existing router.

## 3. Mount it (`server.js`)

Add `const <resource>Router = require('./routes/<resource>');` and
`app.use('/<resource>', <resource>Router);`, next to the existing
`users`/`health` mounts.

## 4. Tests (`tests/<resource>.test.js`)

Mirror `tests/users.test.js` structure exactly:

- `test.beforeEach(() => store.reset())`
- one `test(...)` per behavior: list returns the seeded rows, get-by-id 404s
  when missing, create returns `201` with the new record, update returns the
  updated record, update 404s when missing
- use `node:test` + `node:assert` + `supertest(app)`, not any other test
  library

## 5. Verify

Run `npm test` and `npm run lint` before considering the resource done —
both must pass clean, matching how `users` already behaves.
