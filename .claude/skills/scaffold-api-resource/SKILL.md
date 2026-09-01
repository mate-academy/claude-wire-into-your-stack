---
name: scaffold-api-resource
description: Use when adding a brand-new resource or endpoint to this API — e.g. "add a posts resource", "create a comments endpoint", "new resource for orders". Scaffolds the route file, store helpers, server mount, and test file to match this repo's conventions. Do not use for editing, fixing, or extending an existing route — only for standing up a new one.
---

# Scaffolding a new API resource

This project (see `CLAUDE.md`) always builds a new resource the same way, across four files. Follow this shape exactly rather than improvising a different one.

Given a resource name (e.g. `posts`), with a singular record shape (e.g. `{ id, title, body }`):

## 1. `db/store.js`
Add in-memory state and CRUD helpers for the resource, mirroring the existing `users` helpers:
- `list<Resource>()` — return the array
- `get<Resource>(id)` — find by id
- `create<Resource>(fields)` — assign the next id, push, return it
- `update<Resource>(id, fields)` — look up by id, return `undefined` if missing, otherwise apply only the fields that are defined and return the updated record
- extend `reset()` (or the seed function it calls) to reseed this resource's data too
- export the new functions from `module.exports`

## 2. `routes/<resource>.js`
A new Express router, one file per resource:
- `GET /` — list all
- `GET /:id` — fetch one; `404` with `{ error: "<Resource> not found" }` if missing
- `POST /` — create; `400` with `{ error: "..." }` if a required field is missing; `201` with the created record on success
- `PUT /:id` — update; `400` if no updatable field was provided; `404` if the record doesn't exist; `200` with the updated record on success
- All data access goes through the `db/store.js` helpers — never hold state in the route file
- All error responses are JSON in the shape `{ "error": "message" }`

## 3. `server.js`
Mount the new router under its base path, the same way the existing routers are mounted.

## 4. `tests/<resource>.test.js`
Mirror the structure of `tests/users.test.js`:
- `test.beforeEach(() => store.reset())` so every test starts from clean seed data
- one `supertest` case per behavior: list, 404 on missing id, create (400 on bad input), update (200, 400, 404)

After scaffolding, run `npm test` and `npm run lint` and fix anything they flag before considering the resource done.
