---
name: add-resource-route
description: Scaffold a new REST resource in this Express API — a route file under routes/, backing helpers in db/store.js, mounting in server.js, and a matching node:test + supertest file under tests/. Use when asked to add/create a new resource, endpoint, or route to this project (e.g. "add a products resource", "create a /orders endpoint"). Do not use for editing an existing route's behavior, unrelated bug fixes, or frontend work.
---

# Adding a new resource route

This project (see `CLAUDE.md`) has one route file per resource, all data access
through `db/store.js`, and a test file per resource. Follow the existing
`users` resource as the template.

## Steps

1. **Store helpers** — in `db/store.js`, add an in-memory array/id counter and
   `list<Resource>`, `get<Resource>`, `create<Resource>`, `update<Resource>`
   functions (mirror `listUsers`/`getUser`/`createUser`/`updateUser`). Export
   them. If the store needs a fresh per-test state, fold the new array into
   the existing `seed()`/`reset()` functions rather than adding new ones.

2. **Route file** — create `routes/<resource>.js`:
   - `express.Router()`, require `../db/store`
   - `GET /` — list all
   - `GET /:id` — fetch one; `404` with `{ "error": "message" }` if missing
   - `POST /` — validate required fields in the route handler; `400` with
     `{ "error": "message" }` on bad input; `201` with the created record on
     success
   - `PUT /:id` — validate at least one updatable field is present; `400` if
     none given, `404` if the record doesn't exist, otherwise `200` with the
     updated record
   - `module.exports = router;`

3. **Mount it** — in `server.js`, require the new router and add
   `app.use('/<resource>', <resource>Router);` next to the existing mounts.

4. **Tests** — create `tests/<resource>.test.js` using `node:test`,
   `node:assert`, and `supertest` against the exported `app`. Call
   `test.beforeEach(() => store.reset())`. Cover: list, get-404-when-missing,
   create, create-400-when-invalid, update, update-404-when-missing.

5. **Docs** — if `docs/api.md` exists, append the new endpoints in the same
   style as the existing ones.

6. Run `npm test` and `npm run lint` before considering the work done.
