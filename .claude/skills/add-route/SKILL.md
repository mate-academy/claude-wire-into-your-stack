---
name: add-route
description: Use when adding, writing, or scaffolding a new Express route or endpoint in this API (a new resource or a new handler on an existing one). Covers the file layout, store access, validation, status codes, and the supertest test.
---

# Add a route

This project's routes follow one pattern. Keep to it so every resource looks the same.

1. **One file per resource** in `routes/<resource>.js`. Export an `express.Router()`.
2. **Mount it in `server.js`** under its base path, next to the existing `app.use(...)` lines.
3. **Go through `db/store.js` only.** Never keep state in the route file. Call the store helpers (`listX`, `getX`, `createX`, `updateX`); add a helper there if one is missing.
4. **Validate in the route.** On bad input, return `400` with `{ "error": "message" }` before touching the store.
5. **Missing records return `404`** with `{ "error": "... not found" }`. Coerce path ids with `Number(req.params.id)`, as `routes/users.js` does.
6. **Successful creates return `201`**; reads and updates return `200` with JSON.
7. **Add a supertest test** in `tests/<resource>.test.js`. Use `store.reset()` in `beforeEach`, then cover success, validation (`400`), and missing record (`404`) cases.
8. **Document it** in `docs/api.md` under the resource's section.

Reference implementation: `routes/users.js` and `tests/users.test.js`.

After writing, run `npm test` and `npm run lint`.
