---
name: add-resource-route
description: Use when adding a new REST resource/endpoint to this Express API (e.g. "add a /products route", "create a new resource for orders", "add CRUD endpoints for X"). Scaffolds the route file, store helpers, server mount, tests, and docs update in this project's established pattern.
---

# Add a new resource route

This project follows one consistent pattern for every resource (see `routes/users.js`,
`db/store.js`, `tests/users.test.js`, `docs/api.md`). When adding a new resource, follow
all five steps — skipping any of them leaves the resource inconsistent with the rest of
the API.

1. **Store helpers** — add an in-memory collection and CRUD functions to `db/store.js`
   (or a new file following the same shape if the domain is unrelated to users), following
   the existing `listX`/`getX`/`createX`/`updateX` naming and the `reset()` pattern so tests
   can start clean.
2. **Route file** — create `routes/<resource>.js` exporting an Express router. Validate
   input in the route itself: return `400` with `{ "error": "message" }` for bad input,
   `404` with the same shape when a record is missing. Never hold state in the route —
   read/write only through the store helpers.
3. **Mount it** — require and `app.use('/<resource>', <resource>Router)` in `server.js`,
   alongside the existing mounts.
4. **Tests** — add `tests/<resource>.test.js` using `supertest` against the exported `app`,
   with `test.beforeEach(() => store.reset())`. Cover: list, get-by-id 404, create success,
   create validation 400, update success, update 404 — mirroring `tests/users.test.js`.
5. **Docs** — update `docs/api.md` with the new resource's shape and each endpoint, in the
   same style as the existing `Users` section.

After scaffolding, run `npm test` and `npm run lint` to confirm everything passes.
