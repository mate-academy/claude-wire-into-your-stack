---
name: add-rest-resource
description: Use when adding a brand-new REST resource/endpoint to this Express API (e.g. "add a posts resource", "create CRUD routes for products", "add an endpoint for X"). Scaffolds the route file, in-memory store functions, tests, and docs entry following this repo's exact conventions. Do not use for editing an existing route's logic, unrelated bug fixes, or non-API code.
---

# Add a REST resource to the Course API

This repo has one established pattern for a resource, built in `users.js` alongside
`health.js`. Any new resource should reproduce that same shape exactly, not invent a
new structure.

## When this applies
A new resource needs some combination of `GET /<res>`, `GET /<res>/:id`, `POST /<res>`,
and `PUT /<res>/:id`, backed by in-memory data — the same shape as `/users`.

## Steps

1. **Store functions — `db/store.js`**
   Add `list<Resource>`, `get<Resource>`, `create<Resource>`, `update<Resource>`
   following the existing `listUsers`/`getUser`/`createUser`/`updateUser` functions.
   Include seed data for the new resource inside `seed()` so `reset()` covers it too.

2. **Route file — `routes/<resource>.js`**
   Copy the structure of `routes/users.js`:
   - `express.Router()`, handlers delegate to `db/store.js` — never hold state in the route.
   - `GET /` → `res.json(store.list<Resource>())`
   - `GET /:id` → `404` with `{ error: '<Resource> not found' }` if missing
   - `POST /` → `400` with `{ error: '<field> and <field> are required' }` if required
     fields are missing, else `201` with the created record
   - `PUT /:id` (if the resource needs updates) → `400` if no updatable field is given,
     `404` if missing, else `200` with the updated record

3. **Mount it — `server.js`**
   Add `app.use('/<resource>', <resource>Router)` alongside the existing
   `app.use('/health', ...)` and `app.use('/users', ...)` lines.

4. **Tests — `tests/<resource>.test.js`**
   Mirror `tests/users.test.js`:
   - `test.beforeEach(() => store.reset())`
   - One `test(...)` per behavior (list, get-404, create-201, update-200, update-404),
     each asserting status code and relevant body fields via `node:assert` +
     `supertest` against the exported `app`.

5. **Docs — `docs/api.md`**
   Append a new `## <Resource>` section in the same format as the existing `## Users`
   section: a sample record shape, then one subsection per endpoint.

## Conventions to preserve (from CLAUDE.md)
- One route file per resource; mount it in `server.js` under its base path.
- All data access goes through `db/store.js` — routes never hold state directly.
- Validate input in the route: `400` on bad input, `404` when a record is missing.
- Error responses are always JSON shaped `{ "error": "message" }`.
