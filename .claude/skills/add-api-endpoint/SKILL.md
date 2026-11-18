---
name: add-api-endpoint
description: Use when adding or changing an HTTP endpoint or resource in this Express API (e.g. "add a DELETE /users/:id route", "add a /posts resource", "add a PATCH endpoint"). Covers the route file, db/store.js helper, 400/404 JSON errors, tests, and docs/api.md. Not for bug fixes unrelated to routes, lint config, or CI.
---

# Adding an endpoint to the Course API

Follow the existing pattern in `routes/users.js`, `db/store.js`, and `tests/users.test.js`.

## Steps

1. **Store first.** Put any data access in `db/store.js` as a named helper and add it to `module.exports`. Routes never hold state themselves. Helpers return `undefined` when a record is missing.
2. **Route file.** One file per resource in `routes/<resource>.js`, exporting an Express router (`const router = express.Router(); ... module.exports = router;`). For a new resource, mount it in `server.js` with `app.use('/<resource>', <resource>Router)`.
3. **Handler conventions** (CommonJS, 2-space indent, semicolons, single quotes):
   - Add a one-line `// METHOD /path — what it does.` comment above each handler.
   - Convert ids with `Number(req.params.id)` before calling the store.
   - Validate the body in the route; bad input returns `400`.
   - Missing record returns `404` (e.g. `'User not found'`).
   - Always `return res...` so handlers don't fall through.
   - Status codes: `201` for create, `200` otherwise.
4. **Error shape is always** `res.status(code).json({ error: 'message' })`. Never send plain text or other keys.
5. **Tests** in `tests/<resource>.test.js` using `node:test`, `node:assert`, and `supertest` against `require('../server')`. Include `test.beforeEach(() => store.reset());` and, for new store data, make sure `reset()`/`seed()` cover it. Per endpoint, cover the happy path plus each `400` and `404` branch. Name tests like `'PUT /users/:id returns 404 for a missing user'`.
6. **Docs.** Update `docs/api.md` with the endpoint, its body requirements, and its status codes, in the same style as the existing entries.
7. **Verify** with `npm test` and `npm run lint`; both must pass.
