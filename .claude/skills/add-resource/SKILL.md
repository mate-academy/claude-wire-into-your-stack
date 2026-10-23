---
name: add-resource
description: Use when asked to add a new resource, endpoint or route to this Express API.
---

# Add a resource

Use `users` as the template (`routes/users.js`, `tests/users.test.js`). Replace `x` with the new resource name.

1. **Store** (`db/store.js`): add an array and `nextId`, seed them inside `seed()`, then add `listX`, `getX(id)`, `createX`, `updateX(id, fields)`. `getX` returns `undefined` when missing. `updateX` only overwrites fields that are `!== undefined`. Export them all.
2. **Router** (`routes/x.js`): one file, exports an `express.Router()`, data only via `store`. Add `GET /`, `GET /:id`, `POST /`, `PUT /:id`. Use `Number(req.params.id)`. Return `400` on bad input and `404` on a missing record, as `return res.status(N).json({ error: 'message' })`.
3. **Mount** (`server.js`): `require` the router and `app.use('/x', xRouter)`.
4. **Tests** (`tests/x.test.js`): `node:test` + `supertest`, with `test.beforeEach(() => store.reset())`. Cover the happy path and every `400`/`404` branch for each route.
5. **Docs** (`docs/api.md`): add a `## X` section with the record shape and one `### METHOD /x` entry per route, listing required fields and status codes.
6. **Verify**: run `npm test` and `npm run lint`. Both must pass before reporting done.
