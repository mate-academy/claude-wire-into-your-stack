---
name: new-resource
description: Scaffold a new CRUD resource (route file, store functions, server.js mount, tests, docs entry) following this repo's conventions. Use when the user asks to add a new resource/entity/endpoint to the Course API (e.g. "add a posts resource", "create a projects endpoint").
---

Scaffold a new resource end-to-end, mirroring the existing `users` resource exactly. Every step below is required — a resource isn't done until code, tests, and docs all exist and are consistent.

## Steps

1. **Ask what's needed** if not already clear from the request: resource name (singular/plural), and its fields beyond `id` (e.g. `title`, `body`). Assume `name`/`email`-style required-string fields unless told otherwise.

2. **`db/store.js` pattern** — reference implementation, one store per resource file or extend the existing store, matching the existing style:
   - `let <items> = []`, `let nextId = 1`
   - `seed()` with 1-2 example records, called once at module load
   - `list<Items>()`, `get<Item>(id)`, `create<Item>({ fields })`, `update<Item>(id, fields)` — only set fields that are `!== undefined`
   - `reset()` that re-calls `seed()`, exported for tests
   - All exported via `module.exports = { ... }`

3. **`routes/<resource>.js`** — mirror `routes/users.js`:
   - `express.Router()`, one-line comment above each route describing method/path/behavior
   - `GET /` — list all
   - `GET /:id` — 404 with `{ error: 'X not found' }` if missing
   - `POST /` — 400 with `{ error: '<fields> are required' }` if required fields missing; 201 with created record
   - `PUT /:id` — 400 if no updatable field given; 404 if missing; 200 with updated record
   - `Number(req.params.id)` for id lookups
   - `module.exports = router`

4. **`server.js`** — require the new router and `app.use('/<resource>', <resource>Router)`, following the existing `usersRouter` line.

5. **`tests/<resource>.test.js`** — mirror `tests/users.test.js`:
   - `test.beforeEach(() => store.reset())`
   - Cover: list, get-404, create, update, update-404 (same shape as the users tests)
   - Use `supertest` against the exported `app`

6. **`docs/api.md`** — add a new `## <Resource>` section in the same style as the `## Users` section: shape example, then one subsection per route with status codes.

7. **Verify**: run `npm test` and `npm run lint`; fix any failures before reporting done.

Do not deviate from these patterns (e.g. don't add validation libraries, ORMs, or extra abstractions) — the whole point is consistency with the existing `users` resource.
