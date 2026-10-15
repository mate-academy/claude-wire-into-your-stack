---
name: new-route
description: Use when adding a new REST resource or route to this Express API — e.g. "add a posts endpoint", "create a comments resource", "scaffold a route for X". Scaffolds routes/<resource>.js and db/store.js helpers, mounts the router in server.js, and follows this project's conventions for validation, the error response shape, and the tests/ file style. Not for editing an existing route's behavior or unrelated bug fixes.
---

# Adding a new resource route

This project (see `CLAUDE.md`) has one route file per resource, all data access
routed through `db/store.js`, and a consistent validation/error shape. Follow
these steps in order when adding a new resource, substituting `<resource>` for
the plural resource name (e.g. `posts`) and `<Resource>`/`<record>` for the
singular (e.g. `Post`/`post`).

1. **Storage helpers — `db/store.js`**
   Add an in-memory collection plus `list<Resource>s`, `get<Resource>`,
   `create<Resource>`, and (if the resource is updatable) `update<Resource>`
   functions, mirroring the existing `users` helpers. Export them from the
   module. If the resource needs its own seed data, include it in `seed()` (or
   a resource-specific seed function called from `seed()`) so `reset()` still
   restores every collection.

2. **Router — `routes/<resource>.js`**
   Create an Express router with `express.Router()`. Implement only the
   endpoints actually requested (typically `GET /`, `GET /:id`, `POST /`, and
   `PUT /:id`), following `routes/users.js` as the template:
   - Validate required fields and return `400` with
     `{ "error": "message" }` on bad input.
   - Return `404` with `{ "error": "message" }` when a record lookup misses.
   - Never hold state in the router — call through to `db/store.js` only.
   - Export the router with `module.exports = router`.

3. **Mount it — `server.js`**
   `require` the new router and `app.use('/<resource>', <resource>Router)`,
   next to the existing `app.use('/users', usersRouter)` line.

4. **Tests — `tests/<resource>.test.js`**
   Mirror `tests/users.test.js`: use `node:test` + `supertest`, call
   `test.beforeEach(() => store.reset())`, and cover the success path plus the
   `400`/`404` edge cases for each endpoint you added.

5. **Docs — `docs/api.md`**
   Add a section for the new resource in the same style as the `Users`
   section: one heading per endpoint, what it requires, and what it returns.

6. **Verify**
   Run `npm test` and `npm run lint` and confirm both pass before considering
   the resource done.
