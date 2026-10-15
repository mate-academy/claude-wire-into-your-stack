---
name: add-crud-resource
description: Scaffold a new REST resource in this Express API — route file, in-memory store functions, server mount, and test file, following this repo's exact conventions. Use when asked to add/create a new resource, entity, or CRUD endpoints (e.g. "add a posts resource", "create a new endpoint for orders", "add CRUD for products") to this project. Not for editing an existing route (users.js/health.js) or unrelated Express projects.
---

# Add a CRUD resource

This project (see [CLAUDE.md](../../../CLAUDE.md)) has one route file per resource, an
in-memory store every route reads/writes through, and JSON error responses shaped
`{ "error": "message" }`. Use `routes/users.js`, `db/store.js`, and
`tests/users.test.js` as the reference implementation — mirror their structure
exactly for the new resource rather than inventing a different shape.

Given a resource name (e.g. `posts`) and its fields (e.g. `title`, `body`):

## 1. Add store functions — `db/store.js`

Add an in-memory array + `nextId` counter and CRUD helper functions for the new
resource, mirroring `users`/`nextId`/`listUsers`/`getUser`/`createUser`/`updateUser`.
Include the new resource in `reset()`'s seed data (2 seed rows, like `users`).
Export the new functions from `module.exports`.

## 2. Add the route file — `routes/<resource>.js`

Create a router with the same four endpoints as `routes/users.js`, adapted to the
resource's fields:

- `GET /` — list all
- `GET /:id` — one item, `404 { "error": "<Resource> not found" }` if missing
- `POST /` — create; `400 { "error": "<fields> are required" }` if required fields
  missing; `201` + created item on success
- `PUT /:id` — update; `400` if no updatable field given; `404` if missing; `200` +
  updated item on success

Validate input in the route (never in the store). IDs come from `Number(req.params.id)`.

## 3. Mount it — `server.js`

Add `const <resource>Router = require('./routes/<resource>')` and
`app.use('/<resource>', <resource>Router)`, following the existing `usersRouter`
pattern.

## 4. Add tests — `tests/<resource>.test.js`

Mirror `tests/users.test.js`: `test.beforeEach(() => store.reset())`, then one test
per endpoint covering the success path and the `404`/`400` cases, using `supertest`
against the exported `app`.

## 5. Document it — `docs/api.md`

Add a section for the new resource matching the style of the existing `## Users`
section (model shape, then one line per endpoint).

## 6. Verify

Run `npm run lint` and `npm test` and confirm both pass before considering the task done.
