---
name: add-crud-resource
description: Scaffold a brand-new REST resource (store functions, Express router, mount in server.js, tests, and docs/api.md entry) for this in-memory course API, following the existing users/health pattern. Use when asked to add a new resource or endpoint to this API (e.g. "add a /products resource", "add CRUD endpoints for orders", "wire up a new collection"). Do not use for modifying an existing resource's routes, unrelated Express work, or projects that don't follow this store.js + routes/ layout.
---

# Add a CRUD resource to this API

This project adds resources following one repeated shape (see `routes/users.js`,
`db/store.js`, `tests/users.test.js`, `docs/api.md`). When asked to add a new
resource, do all five steps below — don't stop after the router.

Assume the resource is a flat collection with an auto-incrementing numeric `id`
plus whatever fields the user asked for, unless told otherwise.

## 1. `db/store.js` — add storage + helpers

Don't create a new store file — this project keeps one shared store. Add to the
existing file, mirroring the users block:

- `let <resources> = []` and `let next<Resource>Id = 1`
- include seed data in `seed()` if the user pattern (see existing `seed()`)
  seeds users too — keep new and old seed data together in one function
- `list<Resource>s()`, `get<Resource>(id)`, `create<Resource>(fields)`,
  `update<Resource>(id, fields)` — same shape as the user functions
  (`getUser` finds by `.id ===`, `update<Resource>` returns `undefined` if
  missing, only assigns fields that are `!== undefined`)
- export the new functions alongside the existing ones (keep `reset` shared —
  it should reset every resource's array and id counter, not just users')

## 2. `routes/<resource>.js` — new router file

One file per resource. Copy the `users.js` shape exactly:

- `GET /` → `res.json(store.list<Resource>s())`
- `GET /:id` → 404 with `{ error: '<Resource> not found' }` if missing
- `POST /` → validate required fields, 400 with `{ error: '<fields> are required' }`
  if missing, else `res.status(201).json(...)`
- `PUT /:id` → 400 if no updatable field given, 404 if the record doesn't exist,
  else `res.json(...)` with the updated record
- Use `Number(req.params.id)` when reading the id param
- Every error response is JSON shaped `{ "error": "message" }` — no other shape

## 3. `server.js` — mount it

`require` the new router and add `app.use('/<resource>', <resource>Router)`
next to the existing `app.use` calls.

## 4. `tests/<resource>.test.js` — mirror `tests/users.test.js`

- `node:test` + `assert` + `supertest`, `test.beforeEach(() => store.reset())`
- One test per behavior: list returns seeded data, GET missing id → 404,
  POST creates → 201 with body, PUT updates → 200, PUT missing id → 404
- Also add a POST-missing-required-field test → 400 (users.test.js doesn't
  have one, but it's the same pattern as the 404 tests — cover it for new
  resources)

## 5. `docs/api.md` — document it

Add a new `## <Resource>` section after the existing ones, same structure as
the Users section: one example object, then a subsection per route describing
status codes and required body fields.

## Verify

Run `npm test` and `npm run lint` before calling it done.
