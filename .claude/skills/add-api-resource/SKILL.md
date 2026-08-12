---
name: add-api-resource
description: Use when adding a brand-new REST resource/route to this Express API — e.g. "add a /products route", "create a new resource for orders", "scaffold an endpoint for X". Scaffolds the router file, the in-memory store functions, mounts the router in server.js, and writes matching tests, all following this project's existing conventions. Do not use for editing an existing route's behavior or for unrelated backend work.
---

# Adding a new API resource

This project follows one fixed shape for every resource (see `users` for the
reference implementation). When asked to add a new resource, reproduce all
four pieces below — don't skip the store layer or the tests.

## 1. Store functions — `db/store.js`

Add an in-memory collection and CRUD helpers for the new resource, mirroring
`listUsers` / `getUser` / `createUser` / `updateUser`:
- A module-level array plus a `nextId` counter.
- `list<Resource>()`, `get<Resource>(id)`, `create<Resource>(fields)`, and
  `update<Resource>(id, fields)` (only add the ones the resource actually
  needs).
- If the resource has seed data, add it to `seed()` so `reset()` (used by
  tests) restores it too.
- Export the new functions from `module.exports`.

## 2. Router — `routes/<resource>.js`

One file per resource, `express.Router()`, requiring `../db/store`:
- `GET /` — list all.
- `GET /:id` — fetch one; `404` with `{ "error": "<Resource> not found" }`
  if missing.
- `POST /` — create; validate required fields and return `400` with
  `{ "error": "<field list> are required" }` if missing; `201` with the
  created record on success.
- `PUT /:id` — update; `400` if no updatable field is given, `404` if the
  record doesn't exist.
- Never touch the in-memory array directly — always go through `db/store.js`.

## 3. Mount it — `server.js`

Add `const <resource>Router = require('./routes/<resource>');` and
`app.use('/<resource>', <resource>Router);` next to the existing routers.

## 4. Tests — `tests/<resource>.test.js`

Mirror `tests/users.test.js`:
- `node:test` + `node:assert` + `supertest` against `require('../server')`.
- `test.beforeEach(() => store.reset())`.
- One test per endpoint, including the `404` cases and the `400` validation
  case.

## Conventions to keep everywhere

- Error responses are always JSON `{ "error": "message" }`.
- `400` for bad/missing input, `404` for a missing record.
- Routes never hold state — everything goes through `db/store.js`.
