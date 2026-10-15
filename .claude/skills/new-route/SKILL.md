---
name: new-route
description: Use when adding a new route, endpoint, or resource to this Express API (course-api) — e.g. "add a DELETE endpoint for users", "create a new /products resource", "add a route to filter users by name". Encodes this repo's conventions for route files, store access, input validation, status codes, and error shape. Do not use for unrelated bug fixes or non-route changes.
---

# Adding a route to course-api

This project has one repeated shape for every resource. Follow it exactly, using `routes/users.js`, `db/store.js`, and `tests/users.test.js` as the reference implementation.

1. **One file per resource** in `routes/`, exporting an Express `Router`. If the resource already has a file, add the endpoint there instead of creating a new one.
2. **Mount new router files** in `server.js`: `app.use('/<resource>', <resource>Router);`.
3. **Never hold state in the route.** All reads/writes go through `db/store.js`. Add helpers there following the existing naming (`listX`, `getX`, `createX`, `updateX`, ...) instead of touching an array from the route file.
4. **Validate input in the route.** Return `400` with `{ "error": "message" }` for missing or invalid fields, before calling the store.
5. **Return `404`** with `{ "error": "message" }` when a lookup by id finds nothing.
6. **Error shape is always** `{ "error": "message" }` — never a bare string, and never a different key.
7. **Add tests** in `tests/<resource>.test.js`, mirroring `tests/users.test.js`: one test per status-code path (happy path, `400`, `404`), using `supertest` against the exported `app`, with `store.reset()` in `test.beforeEach`.
8. **Update `docs/api.md`** with the new endpoint, matching the existing format (method, path, body requirements, response codes).
9. **Run `npm run lint` and `npm test`** before considering the route done.
