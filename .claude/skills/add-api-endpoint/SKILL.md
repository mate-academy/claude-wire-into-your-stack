---
name: add-api-endpoint
description: Use when adding or changing an HTTP endpoint or resource in this Express API (e.g. "add a DELETE /users/:id route", "add a /posts resource", "add an endpoint to ..."). Covers the route file, db/store.js helper, input validation, JSON error shape, server.js mounting, and node:test + supertest tests. Not for unrelated tasks like lint config, CI, or docs.
---

# Adding an API endpoint

Follow the project's existing pattern (see `routes/users.js`, `db/store.js`, `tests/users.test.js`).

## Steps

1. **Data access goes through `db/store.js`.** Add a helper there (e.g. `deleteUser(id)`), and export it. Routes never hold state themselves. Helpers return `undefined` when a record is missing.
2. **One route file per resource** in `routes/<resource>.js`, exporting an Express router. For a new resource, create the file and mount it in `server.js` under its base path *before* the error handler, e.g. `app.use('/posts', postsRouter);`.
3. **Validate input in the route.**
   - Bad or missing input: `400`
   - Record not found: `404`
   - Created: `201`
   - Parse ids with `Number(req.params.id)`.
4. **Errors are JSON in the shape `{ "error": "message" }`.** Never send plain text or HTML. Use `return res.status(...).json({ error: '...' })`. Unexpected errors fall through to the error handler in `server.js`; don't swallow them.
5. **Add a one-line comment** above each handler: `// METHOD /path — what it does.`
6. **Write tests** in `tests/<resource>.test.js` using `node:test`, `node:assert`, and `supertest` against `require('../server')`. Call `store.reset()` in `test.beforeEach`. Cover the success case plus each `400`/`404` path the route can return.
7. **Verify** with `npm test` and `npm run lint`; both must pass.

## Checklist

- [ ] store helper added and exported
- [ ] route validates input and returns 400/404 with `{ error }`
- [ ] router mounted in `server.js` (new resources only)
- [ ] tests cover success + each error path
- [ ] `npm test` and `npm run lint` pass
