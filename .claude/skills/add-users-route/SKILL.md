---
name: add-users-route
description: Use when asked to add, change, or extend an HTTP endpoint or route in this Express API (for example "add DELETE /users/:id" or "add a /posts resource"). Covers the project's route file layout, input validation, 400/404 handling, the { "error": "message" } response shape, db/store.js access, tests, and docs/api.md.
---

# Adding or changing a route in this API

Follow the project's existing pattern in `routes/users.js`.

## Steps

1. **Store first.** Any data access goes through `db/store.js`. Add a helper there if one is missing. Routes never hold state.
2. **One route file per resource** in `routes/`, exporting an Express router. A new resource gets its own file and is mounted in `server.js` under its base path.
3. **Validate in the route.**
   - Bad or missing input: `400` with `{ "error": "<message>" }`.
   - Record not found: `404` with `{ "error": "<Thing> not found" }`.
   - Ids from `req.params` are converted with `Number(...)` before calling the store.
   - Use `return res.status(...).json(...)` so the handler stops after responding.
4. **Status codes:** `200` for reads and updates, `201` for creates, errors as above.
5. **Tests** in `tests/<resource>.test.js` using `node:test`, `node:assert` and `supertest`. Call `store.reset()` in `test.beforeEach`. Cover the success path plus the `400` and `404` cases that apply.
6. **Docs:** document the endpoint in `docs/api.md` in the same format as the existing entries (method and path heading, body requirements, status codes).
7. **Verify** with `npm test` and `npm run lint` before finishing.

## Conventions

- Error bodies are always JSON in the shape `{ "error": "message" }`, never plain text.
- Do not add code comments.
