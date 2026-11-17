---
name: add-endpoint
description: Use when adding a new HTTP endpoint or route to this Express API, or a new resource/action under routes/ (e.g. "add DELETE /users/:id", "add a GET /notes endpoint", "create a route to search users"). Covers the store helper in db/store.js, the route handler, supertest tests and the docs/api.md entry. Not for editing an existing route's behaviour or for non-HTTP changes.
---

# Adding an endpoint to the course API

Every endpoint in this project is built the same way, in the same four places. Do all four, in this order.

## 1. Data access: `db/store.js`
- Add a helper function for the operation (e.g. `deleteUser(id)`), next to the existing ones, and add it to `module.exports`.
- Routes never touch the arrays directly; **all** state lives here.
- Return `undefined` (or `false` for deletes) when the record doesn't exist; let the route decide the status code.
- If you add a new collection, seed it in `seed()` so `reset()` restores it for tests.

## 2. Route: `routes/<resource>.js`
- One file per resource, exporting an `express.Router()`. A new resource must be mounted in `server.js` with `app.use('/<resource>', router)`.
- Add a one-line comment above the handler: `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`.
- Validate input **in the route**, before calling the store:
  - bad or missing input → `400`
  - record not found → `404`
- Every error is JSON in exactly this shape: `res.status(<code>).json({ error: '<message>' })`.
- Success status codes: `200` for reads and updates, `201` with the created record for creates, `204` with no body for deletes.
- Always `return` the response (`return res.json(...)`) so a handler never sends twice.
- Style: CommonJS `require`, single quotes, semicolons, two-space indent (ESLint runs on save via the project hook).

## 3. Tests: `tests/<resource>.test.js`
- Use `node:test`, `node:assert` and `supertest` against `require('../server')`.
- Start each file with `test.beforeEach(() => store.reset());` so tests don't depend on each other.
- Write one test per status code the endpoint can return: the happy path, every `400` case and the `404` case.
- Assert on `res.status` and on the relevant fields of `res.body`.

## 4. Docs: `docs/api.md`
- Add a `### METHOD /path` section under the resource's heading, matching the existing entries: one or two sentences covering the body, the success response, and each error status.
- Read the current file first (use the `docs` MCP server's read tools when available) so the new entry matches its format.

## Finish
Run `npm run lint` and `npm test`; both must pass before you report the endpoint as done.
