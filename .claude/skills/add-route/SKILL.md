---
name: add-route
description: Use when adding or changing an HTTP endpoint or resource in this Express API (e.g. "add a DELETE /users/:id", "add a /posts resource", "new route for ..."). Covers the project's route file layout, db/store.js data access, 400/404 validation, the { "error": "message" } response shape, tests, and docs/api.md. Not for non-route work like lint config or CI.
---

# Adding a route to the course API

Follow these steps in order whenever an endpoint is added or changed.

## 1. Route file
- One file per resource in `routes/<resource>.js`, exporting an Express router (`module.exports = router`).
- New resource: mount it in `server.js` under its base path (`app.use('/posts', postsRouter)`).
- Existing resource: add the handler to that resource's file. Look at `routes/users.js` as the reference.
- Keep a one-line comment above each handler: `// METHOD /path — what it does.`

## 2. Data access
- Routes never hold state. Every read/write goes through a helper in `db/store.js`.
- Add the helper there (and export it) if one doesn't exist. Helpers return `undefined` when a record is missing.
- Ids from `req.params.id` must be converted with `Number(...)` before calling the store.

## 3. Validation and errors
- Validate input in the route; respond `400` for bad or missing input and `404` when the record doesn't exist.
- Check validation (400) before looking up the record (404).
- Every error body is JSON: `res.status(code).json({ error: 'message' })`. Never send plain text or other shapes.
- Status codes: `201` for create, `200` for read/update/delete-with-body.
- Use `return res...` in handlers so execution stops after responding.

## 4. Tests
- Add tests to `tests/<resource>.test.js` using `node:test`, `node:assert`, and `supertest` against `require('../server')`.
- Keep `test.beforeEach(() => store.reset())` so each test starts from seed data.
- Cover the happy path plus each error path (400 and 404).

## 5. Docs and checks
- Document the endpoint in `docs/api.md` in the same style (method + path heading, body, responses, error codes).
- Run `npm test` and `npm run lint`; both must pass before finishing.
