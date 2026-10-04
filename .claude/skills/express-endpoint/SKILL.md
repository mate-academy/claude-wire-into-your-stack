---
name: express-endpoint
description: Use when adding, changing, or removing an HTTP endpoint or resource in this Express API — e.g. "add a DELETE /users/:id", "create a /posts resource", "make GET /users support filtering", "change what PUT returns". Covers the route file in routes/, mounting in server.js, data helpers in db/store.js, input validation and error responses, tests in tests/, and keeping docs/api.md in sync. Not for general Express questions, refactors that leave endpoint behaviour unchanged, or tooling/config changes.
---

# Adding or changing an endpoint in this API

Every endpoint change touches the same five places. Do all of them, in this order, before calling the task done.

## 1. Data access — `db/store.js`

- Routes never hold state. If the endpoint needs a new read or write, add a helper function to `db/store.js` and export it.
- Keep helpers synchronous and plain: take ids as numbers, return the record, or `undefined` when it isn't found (see `getUser` / `updateUser`).
- Anything new that holds data must be restored by `seed()`, so `reset()` keeps working for the tests.

## 2. Route — `routes/<resource>.js`

- One file per resource, exporting an `express.Router()`. Paths are relative to the mount point (`'/'`, `'/:id'`).
- Put a one-line comment above each handler: `// METHOD /resource/path — what it does.`
- Always `return` the response (`return res.status(...).json(...)`).
- **Validation order**, each returning early:
  1. Path params: parse ids with the file's `parseId` helper (copy it into a new route file if needed). A non-positive-integer id → `400`.
  2. Body: read it as `req.body ?? {}` — Express 5 leaves `req.body` undefined when nothing was parsed, and destructuring it directly crashes with a 500. Missing/invalid fields → `400`.
  3. Lookup: record not found → `404`.
- Status codes: `200` read/update, `201` with the created record on create, `204` with no body on delete.
- Every error response is JSON shaped `{ "error": "message" }` — never plain text, never `res.sendStatus()` for errors.
- Express 5 path syntax: no regex in string paths (`:id(\d+)` is invalid), wildcards must be named (`/*splat`), optional segments use braces (`{/:id}`), not `?`.

## 3. Mount — `server.js`

- A new resource gets `app.use('/<resource>', <resource>Router);` next to the existing mounts. Existing resources need no change here.

## 4. Tests — `tests/<resource>.test.js`

- Use `node:test`, `node:assert`, and `supertest` against `require('../server')`, with `test.beforeEach(() => store.reset());`.
- One `test(...)` per outcome: the happy path plus every `400` and `404` branch you wrote. Assert the status, and for errors that `res.body.error` is set.
- Test names read like the API: `'POST /users without a body returns 400, not 500'`.

## 5. Docs — `docs/api.md`

- Add or update the endpoint's `### METHOD /path` section: what it does, required body fields, and every status code it can return.
- New resource → new `## Resource` section with an example record.

## Finish

Run `npm run lint` and `npm test`; both must pass (CI runs the same two).
