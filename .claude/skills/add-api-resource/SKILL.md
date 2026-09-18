---
name: add-api-resource
description: Use when adding a new resource or endpoint to this Express API repo — e.g. "add a DELETE /users/:id route", "add a new products resource with GET/POST", "wire up a new endpoint". Scaffolds the route file, store functions, tests, and docs entry to match this repo's conventions. Not for editing an existing route's logic, unrelated Express/Node questions, or work outside this repo.
---

# Adding a resource/route to this API

This project repeats the same shape every time a route is added. Follow it exactly rather than improvising a new style.

## 1. Store functions (`db/store.js`)
- All data access goes through this file — routes never hold state directly.
- Add plain functions (`listX`, `getX`, `createX`, `updateX`, …) that operate on an in-memory array, mirroring the existing `users` helpers.
- If you add a new resource array, seed it in `seed()` and make sure `reset()` still restores it, so tests stay isolated.

## 2. Route file (`routes/<resource>.js`)
- One file per resource, using `express.Router()`, exported with `module.exports = router`.
- One short `// METHOD /path — description.` comment directly above each handler.
- Validate input in the route, not the store:
  - Missing/invalid input → `400`
  - Record not found → `404`
- Errors are always JSON in the shape `{ "error": "message" }` — never a bare string or a different key.
- Successful creates return `201` with the created resource; other successful reads/updates return `200`.

## 3. Mount it (`server.js`)
- `app.use('/<base-path>', <resource>Router)`, alongside the existing `health`/`users` mounts.

## 4. Tests (`tests/<resource>.test.js`)
- `node:test` + `supertest`, mirroring `tests/users.test.js`.
- `test.beforeEach(() => store.reset())` so every test starts from seeded data.
- Cover at least: the happy path (correct status + body shape), a 404 on a missing record, and a 400 on bad input.
- Assert `res.status` and the relevant `res.body` fields — don't just assert `res.status`.

## 5. Docs (`docs/api.md`)
- Add a section for the resource matching the existing `## Users` style: one `### METHOD /path` block per endpoint, one line describing behavior and response codes.

## 6. Verify
- Run `npm test` and `npm run lint` before considering the work done.
