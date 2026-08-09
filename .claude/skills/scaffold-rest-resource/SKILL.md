---
name: scaffold-rest-resource
description: Use when adding a brand-new REST resource/endpoint to this Express API (e.g. "add a /products route", "create a new resource for orders", "scaffold a posts endpoint") — encodes this repo's exact pattern for the store, router, mounting, and tests. Do not use for editing an existing route's behavior or for non-HTTP changes.
---

# Scaffolding a new REST resource

This repo has one fixed shape for adding a resource, mirrored from `db/store.js` / `routes/users.js` / `tests/users.test.js`. Follow it exactly rather than improvising a new structure.

## Steps

1. **`db/store.js`** — add an in-memory array/collection for the resource and CRUD helper functions (`list<Resource>`, `get<Resource>`, `create<Resource>`, `update<Resource>`, etc.). Routes never touch data directly; they only call these helpers. Include the new collection's reset logic in the existing `reset()` function so tests stay isolated.

2. **`routes/<resource>.js`** — new Express router file, one per resource:
   - `GET /` — list all
   - `GET /:id` — fetch one, `404 { "error": "<Resource> not found" }` if missing
   - `POST /` — create; validate required fields, `400 { "error": "<fields> are required" }` if missing, else `201` with the created record
   - `PUT /:id` — update; `400` if no updatable field given, `404` if the record doesn't exist
   - Every error response is JSON shaped `{ "error": "message" }`, matching `docs/api.md`

3. **`server.js`** — `require` the new router and mount it with `app.use('/<resource>', <resource>Router)`, next to the existing `app.use` lines.

4. **`tests/<resource>.test.js`** — mirror `tests/users.test.js`: `test.beforeEach(() => store.reset())`, use `supertest` against the exported `app`, and cover the happy path plus each 400/404 branch for the new routes.

5. **`docs/api.md`** — add a section for the new resource in the same style as the existing `Users` section (shape example, then each endpoint with its response codes).

After scaffolding, run `npm test` and `npm run lint` to confirm the new resource fits the existing suite cleanly.
