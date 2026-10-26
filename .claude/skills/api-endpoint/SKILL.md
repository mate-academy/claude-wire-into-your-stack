---
name: api-endpoint
description: How to add or change an HTTP endpoint in this Express Course API (a new route, a new resource, or a new method like DELETE/PATCH on /users). Use whenever the user asks to add, create, implement or modify an API endpoint, route or resource in routes/, so the route, store helper, validation, JSON error shape, tests and docs/api.md all follow the project's conventions. Not for unrelated edits (README, CI, tooling).
---

# Adding or changing an API endpoint

Every endpoint in this repo is built the same way. Follow these steps in order.

## 1. Data access — `db/store.js`
- Routes never hold state. If the endpoint needs a new data operation, add a
  plain function to `db/store.js` (e.g. `deleteUser(id)`), export it, and keep
  `reset()` / `seed()` working so tests start clean.
- Return `undefined` (not throw) when a record is missing; the route turns that into a 404.

## 2. The route — `routes/<resource>.js`
- One file per resource, exporting an `express.Router()`.
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`.
- Validate input first and `return res.status(400).json({ error: '...' })` on bad input.
- `return res.status(404).json({ error: '<Thing> not found' })` when a record is missing.
- Success codes: `200` read/update, `201` create (return the created record), `204` delete (no body).
- Errors are **always** JSON `{ "error": "message" }` — never plain text.
- A brand-new resource gets mounted in `server.js` with `app.use('/<resource>', router)`.

## 3. Tests — `tests/<resource>.test.js`
- Use `node:test`, `node:assert` and `supertest` against `require('../server')`.
- Keep `test.beforeEach(() => store.reset());` at the top.
- Cover the happy path **and** each error path (400 and 404) the route can return.

## 4. Docs — `docs/api.md`
- Add a `### METHOD /path` section under the resource heading, describing the
  body, the success status, and every error status.

## 5. Verify
Run `npm test` and `npm run lint`; both must pass before you report the work as done.
