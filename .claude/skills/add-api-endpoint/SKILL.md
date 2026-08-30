---
name: add-api-endpoint
description: >-
  Use when adding, extending, or changing an HTTP endpoint or resource in this
  Course API (Express) repo — a new `routes/<resource>.js` router, a new method
  on an existing route, or a new `db/store.js` accessor. Encodes the project's
  route → store → server mount → test → docs flow and its conventions: input
  validation with 400, missing-record 404, `{ "error": "message" }` bodies,
  all data access through `db/store.js`, and a `node:test` + `supertest` spec
  in `tests/`. Do not use for non-Express work, "run the tests" / lint / build
  requests, dependency bumps, or CI and config edits.
---

# Add or change a Course API endpoint

Every resource in this repo has the same shape. Work through these steps in order;
skip a step only when the change genuinely doesn't touch that layer.

## 1. Data access — `db/store.js`

- All state lives in this file. Routes never hold state directly.
- Add accessors alongside the existing ones, named for the resource:
  `list<Resource>()`, `get<Resource>(id)`, `create<Resource>({ ... })`,
  `update<Resource>(id, fields)`, and `delete<Resource>(id)` if needed.
- Keep the existing shape: a module-level array + `nextId`, a `seed()` that
  populates them (called once at load), and a `reset()` that re-seeds. Tests call
  `reset()`. Put any new starter rows in `seed()`.
- A missing record returns `undefined` — let the route translate that to 404.
- Add every new helper to the `module.exports` object.

## 2. Route file — `routes/<resource>.js`

- One file per resource. It builds an `express.Router()` and `module.exports` it.
- Paths are relative to the mount point: `'/'` for the collection, `'/:id'` for
  one record.
- Read the id with `Number(req.params.id)`.
- Validate in the route. Bad or missing input →
  `return res.status(400).json({ error: '<what is wrong>' })`.
- Missing record → `return res.status(404).json({ error: '<Resource> not found' })`.
- `POST` that creates → `res.status(201).json(created)`. `GET` / `PUT` → `res.json(...)`
  (200). `DELETE` → `res.status(204).end()` unless a body is wanted.
- Every read and write goes through `store`. Never reach past it to a database or
  to module state.
- Match the existing comment style: `// METHOD /path — one-line summary`.

## 3. Mount it — `server.js`

- `const <resource>Router = require('./routes/<resource>');`
- `app.use('/<base>', <resource>Router);` next to the other `app.use` mounts,
  after `express.json()`.

## 4. Test — `tests/<resource>.test.js`

- `node:test` + `node:assert`, `supertest`, and `const app = require('../server')`.
- `test.beforeEach(() => store.reset());`
- One `test('<METHOD> <path> <expectation>', async () => { ... })` per behaviour,
  and always cover the 400 and 404 branches you added.
- Drive requests with `await request(app).<verb>('<path>').send({ ... })`; assert
  on `res.status` and on fields of `res.body`.
- Run `npm test`; every test must pass.

## 5. Document — `docs/api.md`

- Add a `### <METHOD> /<path>` entry under the resource's heading, in the terse
  style already there, naming the success status code and every error code.

## 6. Final check

- `npm run lint` and `npm test` both come back clean.
