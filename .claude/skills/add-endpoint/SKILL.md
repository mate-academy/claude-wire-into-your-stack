---
name: add-endpoint
description: Use when adding or changing an HTTP endpoint (a GET/POST/PUT/PATCH/DELETE route) in this Express API, for example "add DELETE /users/:id" or "create a /posts resource". Covers the route, the db/store.js helper, the tests and docs/api.md. Not for edits that don't touch a route.
---

# Adding an endpoint to this API

Every endpoint in this repo is built the same way. Follow these steps in order.

## 1. Data access goes in `db/store.js`
- Add a helper (e.g. `deleteUser(id)`) next to the existing ones and export it in `module.exports`.
- Return `undefined` (or `false`) when the record does not exist, so the route can answer `404`.
- Routes never keep state of their own.

## 2. The route goes in `routes/<resource>.js`
- One file per resource, exporting an `express.Router()`. A new resource is mounted in `server.js` under its base path (`app.use('/posts', postsRouter)`).
- Start each handler with a one-line comment in the existing style: `// DELETE /users/:id — remove a user, or 404 if it doesn't exist.`
- Convert ids with `Number(req.params.id)`.
- Validate input first and return `400` on bad input; return `404` when the record is missing.
- Errors are always JSON in the shape `{ "error": "message" }` and use `return res.status(...).json(...)`.
- Success codes: `200` for reads/updates, `201` with the created record for creates, `204` with no body for deletes.

## 3. Tests go in `tests/<resource>.test.js`
- Use `node:test`, `node:assert` and `supertest` against `require('../server')`.
- Keep `test.beforeEach(() => store.reset());` so each test starts from the seed data.
- Cover at least: the happy path, `400` for bad input (if the endpoint takes a body), and `404` for a missing id.

## 4. Document it in `docs/api.md`
- Add a `### METHOD /path` section under the resource with the body, the success response and each error code.

## 5. Check
- Run `npm test` and `npm run lint`; both must pass before you finish.
