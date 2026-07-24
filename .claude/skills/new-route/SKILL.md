---
name: new-route
description: 'Scaffold a brand-new REST resource for this Express course API — a routes/<resource>.js router, matching db/store.js helpers, and a tests/<resource>.test.js file, following this project''s conventions (400 on invalid input, 404 on a missing record, JSON errors shaped { "error": "message" }, all data access through the store). Use when the user asks to add, create, or scaffold a new resource, model, or endpoint in this API (e.g. "add a products resource", "create an orders endpoint with CRUD"). Do not use for editing an existing route''s behavior.'
---

# Scaffolding a new REST resource

This project has one convention for how a resource is added, documented in `CLAUDE.md`
and demonstrated by the existing `users` resource. Reproduce it exactly for the new
resource — do not invent a different shape.

## Steps

1. **Store helpers** — in `db/store.js`, add an in-memory array + `nextId` counter for
   the new resource (or extend the existing seed pattern if one already fits), plus
   `list<Resource>`, `get<Resource>(id)`, `create<Resource>(fields)`, and
   `update<Resource>(id, fields)` functions, mirroring `listUsers`/`getUser`/
   `createUser`/`updateUser`. Extend `reset()` so tests can start clean, and export the
   new functions.

2. **Router** — create `routes/<resource>.js` modeled on `routes/users.js`:
   - `GET /` — list all
   - `GET /:id` — fetch one; `404 { "error": "<Resource> not found" }` if missing
   - `POST /` — create; `400 { "error": "<field> and <field> are required" }` if a
     required field is missing; otherwise `201` with the created record
   - `PUT /:id` — update; `400` if no updatable field is given; `404` if the record
     doesn't exist; otherwise `200` with the updated record
   - Routes only call `store.*` — never hold state in the router itself.

3. **Mount it** — in `server.js`, require the new router and `app.use('/<resource>', ...)`
   under its base path, same as `usersRouter`/`healthRouter`.

4. **Tests** — create `tests/<resource>.test.js` modeled on `tests/users.test.js`:
   `test.beforeEach(() => store.reset())`, then one `supertest` case per endpoint
   asserting both the HTTP status and the relevant body shape (list length, 404 on a
   missing id, 201 + echoed fields on create, updated field on PUT).

5. **Docs** — add the new resource's endpoints to `docs/api.md`, following the same
   layout as the existing `## Users` section (resource shape, then one subsection per
   route).

## After scaffolding

Run `npm run lint` and `npm test` and fix anything that fails before considering the
resource done.
