---
name: add-api-resource
description: Use when asked to add, create, or scaffold a brand-new resource, model, or CRUD endpoint in this Express API repo (e.g. "add a /products resource", "create a new endpoint for orders", "scaffold a new resource"). Produces the full set of changes for a new resource — in-memory store helpers, a routes file, mounting in server.js, tests, and a docs/api.md section — following this repo's established conventions. Do not use for modifying or fixing an existing route/resource's behavior, general Express/Node questions unrelated to this repo, "explain this code" requests, or auditing/checking existing docs against existing routes.
---

# Add a new API resource

This repo follows a strict, repeated pattern for every resource (see `routes/users.js`,
`db/store.js`, `tests/users.test.js`, `docs/api.md`, and `CLAUDE.md`). When adding a new
resource `<thing>` (plural route, singular helper names, e.g. `products` / `Product`),
reproduce that pattern exactly — do not introduce new patterns, middleware, error shapes,
or libraries.

Work through these steps in order:

## 1. Store helpers — `db/store.js`
Follow the exact shape used for users:
- A module-level array (e.g. `products`) and shared/separate `nextId` counter.
- Extend `seed()` (or add a parallel seeded array) with 1-2 sample records.
- `list<Things>()` — returns the array.
- `get<Thing>(id)` — `array.find(...)`, returns `undefined` if missing (never throws).
- `create<Thing>(fields)` — builds `{ id: nextId++, ...fields }`, pushes, returns it.
- `update<Thing>(id, fields)` — calls `get<Thing>`, returns `undefined` if missing, else
  mutates only the fields that are `!== undefined`, returns the record.
- Make sure `reset()` re-seeds this resource's array too, so tests stay isolated.
- Add the new functions to the `module.exports` object.

## 2. Route file — `routes/<resource>.js`
Copy the structure of `routes/users.js`:
- `const router = express.Router();`, require `../db/store`.
- `GET /` — no validation, `res.json(store.list<Things>())`.
- `GET /:id` — `store.get<Thing>(Number(req.params.id))`; `return res.status(404).json({ error: '<Thing> not found' })` if falsy, else `return res.json(record)`.
- `POST /` — destructure required fields from `req.body`; `return res.status(400).json({ error: '<fields> are required' })` if any are missing; else `store.create<Thing>(...)` and `return res.status(201).json(record)`.
- `PUT /:id` — destructure optional fields; `return res.status(400).json(...)` if *all* are `undefined`; else `store.update<Thing>(id, fields)`, 404 if falsy else `res.json(record)`.
- Always `return` on early exits, matching the existing file exactly.
- `module.exports = router;`

## 3. Mount in `server.js`
- Require the new router near the other route requires.
- `app.use('/<resource>', <resource>Router);`, matching the base path to the resource name.

## 4. Tests — `tests/<resource>.test.js`
Follow `tests/users.test.js` exactly:
- `node:test` + `node:assert` + `supertest`, import `app` from `../server` and `store` from `../db/store`.
- `test.beforeEach(() => store.reset());`
- Flat `test(...)` calls (no `describe`), covering: list (200 + seeded length), get missing (404),
  create (201 + body fields), update existing (200 + updated field), update missing (404).
  Add a create/update validation-failure test (400) if the resource has required fields, mirroring
  how other CRUD test files in this repo cover the 400 branch.

## 5. Docs — `docs/api.md`
Add a new `## <Resource>` section in the same format as the `## Users` section: a short
example JSON object, then one subsection per endpoint (`### GET /<resource>`, etc.) describing
inputs, status codes, and error conditions — mirror the wording style already used for Users/Health.

## Sanity check before finishing
Re-read the new `routes/<resource>.js`, `tests/<resource>.test.js`, and the new `docs/api.md`
section side-by-side with `routes/users.js` / `tests/users.test.js` / the `## Users` doc section
to confirm the new resource is a faithful structural mirror, not just "similar."
