---
name: new-route
description: Use when adding a new REST endpoint to this Express API — a new resource under routes/, or a new HTTP method (GET/POST/PUT/DELETE) on an existing resource. Covers this project's conventions for validation, error responses, mounting, tests, and docs. Not for unrelated changes like editing README prose or CI config.
---

# Adding a route to the course API

This project has one repeated shape for adding an endpoint. Follow it exactly
so every route looks the same, no matter who — or what — wrote it.

1. **Data access goes through `db/store.js` only.** Add or reuse a helper
   there (e.g. `listX`, `getX`, `createX`, `updateX`). Routes never hold
   state directly — see `routes/users.js` for the reference pattern.

2. **Validate input in the route, not the store.**
   - Missing/invalid input from the client → `400` with
     `{ "error": "message" }`.
   - A record that doesn't exist (e.g. bad `:id`) → `404` with
     `{ "error": "message" }`.
   - Both status and body shape must match this exactly — no other error
     format is used anywhere in this API.

3. **One file per resource.** New resource → new file in `routes/`,
   exporting an Express router (`module.exports = router`). New method on an
   existing resource → add it to that resource's existing file.

4. **Mount it in `server.js`** under its base path, next to the existing
   `app.use('/health', ...)` / `app.use('/users', ...)` calls.

5. **Write tests in `tests/`** using the existing pattern: Node's built-in
   `node:test` + `assert`, driven through `supertest` against the exported
   `app` (see `tests/users.test.js`). Cover the success case, the `400` case,
   and the `404` case where applicable. Call `store.reset()` in
   `test.beforeEach` if the new tests mutate state.

6. **Update `docs/api.md`** with the new endpoint: method, path, request
   body requirements, and response shapes for each status code, matching the
   existing entries' style.

Do not add authentication, pagination, or other functionality the resource
doesn't already need — match the scope and style of the existing `users`
resource.
