---
name: add-rest-resource
description: Use when adding a brand-new resource/endpoint to this Express API (e.g. "add a /products route", "create a new resource for orders", "add CRUD for X"). Not for editing an existing route's behavior or unrelated tasks.
---

# Add a REST resource

This project has one convention for adding a new resource. Follow it exactly rather than
inventing a new shape.

1. **Store first** — add the data functions for the resource to `db/store.js` (e.g.
   `listX`, `getX`, `createX`, `updateX`), following the same style as the existing `users`
   functions. Routes never hold state directly; everything goes through this file.

2. **Router file** — create `routes/<resource>.js` exporting an Express router, one file
   per resource. Mirror `routes/users.js`: validate input in the route handler itself,
   return `400` for missing/invalid input, `404` when a record doesn't exist.

3. **Error shape** — every error response is JSON `{ "error": "message" }`. Never return a
   bare string or a different key.

4. **Mount it** — add `app.use('/<base-path>', <resource>Router)` in `server.js`.

5. **Tests** — add `tests/<resource>.test.js` mirroring `tests/users.test.js`: use
   `test.beforeEach(() => store.reset())`, drive requests through `supertest`, and assert
   status codes for the happy path, the `400` case, and the `404` case.

6. **Docs** — add the new endpoints to `docs/api.md` in the same format as the `Users`
   section (one heading per route, request/response shape, status codes).
