---
name: new-resource
description: Scaffold a new REST resource for this Express API — route file, in-memory store helpers, tests, and API docs, following this repo's conventions. Use when the user asks to add a new resource/entity/model (e.g. "add a products resource", "create a posts endpoint").
---

# New resource scaffolder

Generates everything needed to add a CRUD resource to this API, matching the
existing `users` resource pattern exactly (see `routes/users.js`,
`db/store.js`, `tests/users.test.js`, `docs/api.md`).

## Inputs

Ask the user (if not already given):
1. Resource name, singular and plural (e.g. `product` / `products`).
2. Fields on the resource besides `id` (e.g. `name`, `price`). Assume all are
   required on create, all optional on update, unless told otherwise.

## Steps

1. **Store helpers** — in `db/store.js`, add alongside the existing `users`
   state (do not create a separate file):
   - `let <plural> = []` and `let next<Singular>Id = 1`
   - seed 1-2 example records in the existing `seed()` function
   - `list<Plural>()`, `get<Singular>(id)`, `create<Singular>({ fields })`,
     `update<Singular>(id, fields)` — mirror `listUsers`/`getUser`/
     `createUser`/`updateUser` exactly, including the `fields.x !== undefined`
     pattern in update
   - export the new functions from `module.exports`
   - `reset()` must reseed this resource too

2. **Route file** — create `routes/<plural>.js` modeled on `routes/users.js`:
   - `GET /` — list all
   - `GET /:id` — 404 with `{ "error": "<Singular> not found" }` if missing
   - `POST /` — 400 with `{ "error": "<field list> are required" }` if any
     required field is missing; 201 with the created record on success
   - `PUT /:id` — 400 if no fields given, 404 if missing, else 200 with the
     updated record
   - Keep the same comment style (`// GET /x — ...`) as `users.js`

3. **Mount it** — in `server.js`, require the new router and
   `app.use('/<plural>', <plural>Router)`, next to the existing `usersRouter`
   line.

4. **Tests** — create `tests/<plural>.test.js` modeled on
   `tests/users.test.js`: `test.beforeEach(() => store.reset())`, then one
   test per route mirroring the users tests (list, get-404, create, update,
   update-404).

5. **Docs** — append a `## <Plural>` section to `docs/api.md` following the
   same structure as the existing `## Users` section (record shape, then one
   subsection per endpoint).

6. **Verify** — run `npm test` and `npm run lint`; both must pass before
   considering the scaffold done.

## Conventions to preserve (from CLAUDE.md)

- All data access goes through `db/store.js` — routes never hold state.
- `400` on bad input, `404` when a record is missing.
- Error responses are always `{ "error": "message" }`.
- One route file per resource, mounted in `server.js` under its base path.
