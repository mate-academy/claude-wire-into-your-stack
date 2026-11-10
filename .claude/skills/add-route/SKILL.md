---
name: add-route
description: Use when adding or changing an HTTP endpoint or resource in this Express API (new route file, new GET/POST/PUT/DELETE handler, new /resource path) — applies the project's route conventions, store-only data access, JSON error shape, router mounting in server.js, supertest test, and docs/api.md update. Not for general questions or non-route code.
---

# Adding or changing a route in this project

Follow these steps in order:

1. **One router file per resource** in `routes/<resource>.js`, exporting an Express router (`module.exports = router`). Mount it in `server.js` with `app.use('/<resource>', <resource>Router)`.
2. **Data goes through `db/store.js` only.** Routes never hold state. If a new operation is needed, add a helper to `store.js` and export it (return `undefined` when a record is missing).
3. **Validate input in the route.** Bad/missing input → `400`. Missing record → `404`. Created → `201`. Convert path ids with `Number(req.params.id)`.
4. **Errors are always JSON** shaped `{ "error": "message" }` — use `return res.status(N).json({ error: '...' })`; never plain text.
5. **Add a comment line above each handler** in the style `// VERB /path — what it does.`
6. **Tests** in `tests/<resource>.test.js` using Node's built-in runner (`node:test`) + `supertest` against `require('../server')`; call `store.reset()` in `beforeEach`. Cover happy path, `400`, and `404`.
7. **Document it** in `docs/api.md` (heading `### VERB /path`, request body, status codes incl. error cases).
8. **Verify:** `npm run lint` and `npm test` must pass.

Reference implementation: `routes/users.js`, `tests/users.test.js`.
