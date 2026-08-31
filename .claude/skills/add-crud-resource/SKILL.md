---
name: add-crud-resource
description: Use when adding a new resource/endpoint (e.g. "add a posts resource", "add a /orders route") to this Course API project — scaffolds the store helpers, router, server mount, tests, and docs entry to match the existing users resource pattern exactly. Not for editing an existing route's behavior, unrelated Express questions, or non-CRUD endpoints (e.g. auth, webhooks).
---

# Add a CRUD resource to the Course API

This project has one working example of a full resource: `users` (`db/store.js`,
`routes/users.js`, `tests/users.test.js`, `docs/api.md`). Every new resource should
be a straight copy of that shape, renamed. Don't invent a different structure,
validation style, or error format — match what's already there.

## 1. `db/store.js` — data + CRUD helpers

- Add a module-level array and its own `nextId` counter for the resource.
- Add the new entities to `seed()` so `reset()` (used by tests) covers them too.
- Add plain functions named `list<Resource>s`, `get<Resource>`, `create<Resource>`,
  `update<Resource>` — same signatures as the `users` versions (`getUser`/`updateUser`
  take a numeric `id`; `createUser`/`updateUser` take a fields object).
- Export the new functions from the existing `module.exports` object.

## 2. `routes/<resource>.js` — router

Copy the shape of `routes/users.js`:

- `const express = require('express'); const store = require('../db/store');`
  then `const router = express.Router();`
- One-line `// METHOD /path — what it does.` comment directly above each route.
- `GET /` — `res.json(store.list<Resource>s())`.
- `GET /:id` — 404 with `{ error: '<Resource> not found' }` if missing.
- `POST /` — validate required fields inline, 400 with `{ error: '<field list> are required' }`
  if missing, else `store.create<Resource>(...)` and `res.status(201).json(...)`.
- `PUT /:id` — 400 if no updatable field is present in the body, 404 (same shape as GET)
  if the record doesn't exist, else `res.json(...)` the updated record.
- `module.exports = router;` at the end.

Every error response is `{ "error": "message" }` — no other shape, no extra fields.
400 = bad/missing input, 404 = record doesn't exist. Never anything else for these cases.

## 3. `server.js` — mount it

Add the require and one `app.use('/<resource>', <resource>Router);` line next to the
existing `usersRouter` mount. Keep the base path plural, matching `/users`.

## 4. `tests/<resource>.test.js` — mirror `tests/users.test.js`

- Same imports (`node:test`, `node:assert`, `supertest`, `../server`, `../db/store`).
- `test.beforeEach(() => store.reset());`
- One `test(...)` per behavior, matching the users file's coverage exactly:
  list returns seeded data, GET missing id → 404, POST creates → 201, PUT updates →
  200, PUT missing id → 404. Add a POST-missing-field → 400 case too (users.test.js
  doesn't have one, but the route supports it — cover it for the new resource).

## 5. `docs/api.md` — document it

Add a new `## <Resource>` section after the existing `## Users` section, in the same
style: one entity shape as a fenced JSON example, then one `### METHOD /path` block per
route with a one-line description of required fields and status codes, matching the
wording style already used for the Users endpoints.

## Don't

- Don't hold state in the route file — everything goes through `db/store.js`.
- Don't change the `{ "error": "message" }` shape or invent new status codes.
- Don't skip the docs or test file — every existing resource has both.
