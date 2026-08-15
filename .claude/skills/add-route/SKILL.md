---
name: add-route
description: Use when adding a new REST endpoint, HTTP method, or resource to this Express API — e.g. "add a route for X", "add a DELETE/PATCH endpoint", "add a new resource to the API". Captures how this repo structures routes, db/store.js access, and tests so a new endpoint matches the existing ones exactly. Do not use for unrelated Express/Node work, for editing route logic that isn't adding a new endpoint, or for non-API changes.
---

# Adding a route to this API

This repo has one router file per resource, all data access goes through
`db/store.js`, and every route file has a matching test file. A new endpoint
should be indistinguishable in style from `routes/users.js`. Follow this shape:

## 1. Route handler (`routes/<resource>.js`)
- One comment line above each handler: `// METHOD /path — one-line description.`
- Validate input inline. On bad input: `res.status(400).json({ error: '...' })`.
- Look up/mutate records only through `db/store.js` helpers — never touch
  in-memory state directly from a route.
- Missing record: `res.status(404).json({ error: '<Resource> not found' })`.
- New resource (not just a new verb on an existing one)? Create
  `routes/<resource>.js` as its own router, following `routes/users.js`.

## 2. Data helper (`db/store.js`)
- Add a matching helper named after the verb (`createX`, `getX`, `updateX`,
  `deleteX`, `listX`) and export it from `module.exports`.
- The route file must never read/write the in-memory arrays directly.

## 3. Mount it (`server.js`)
- New resource: `app.use('/<resource>', require('./routes/<resource>'))`
  next to the existing mounts.
- New verb on an existing resource: no `server.js` change needed.

## 4. Tests (`tests/<resource>.test.js`)
- `node:test` + `supertest`, matching `tests/users.test.js`:
  - `test.beforeEach(() => store.reset())`
  - one `test(...)` per behavior: happy path, the 404 path, and the 400
    validation path if the route validates input
  - assert on `res.status` and the relevant `res.body` fields

## 5. Docs
- Update `docs/api.md` in the same terse style as the existing entries.
  If you can't update it as part of this task, say so explicitly rather
  than leaving it silently stale — or point the user at `/check-docs`.

## 6. Verify
- Run `npm run lint` and `npm test` before considering the change done.
