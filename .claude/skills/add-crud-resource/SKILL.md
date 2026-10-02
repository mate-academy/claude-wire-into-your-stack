---
name: add-crud-resource
description: Use when adding a new CRUD resource/endpoint to this Express API (e.g. "add a products resource", "create an orders route", "scaffold a new resource for X") — generates the store helpers, route file, server mount, and test file following this project's existing conventions (as seen in the users resource). Do not use for unrelated route tweaks, bug fixes, or non-CRUD endpoints.
---

# Adding a CRUD resource to this API

This project follows one consistent shape for every resource (see `db/store.js`, `routes/users.js`, `tests/users.test.js` for the reference implementation on `users`). When asked to add a new resource, reproduce all four pieces below — don't skip the store or the tests.

## 1. Store helpers (`db/store.js`)

- Add an in-memory array and `nextId` counter for the new resource, seeded with a couple of sample records inside the existing `seed()` function so `reset()` covers it too.
- Add `list<Resource>`, `get<Resource>`, `create<Resource>`, `update<Resource>` functions, mirroring `listUsers`/`getUser`/`createUser`/`updateUser`.
- Export the new functions from `module.exports`.
- Routes never hold state directly — all access goes through these helpers.

## 2. Route file (`routes/<resource>.js`)

- One file per resource, `express.Router()`, mirroring `routes/users.js`:
  - `GET /` — list all
  - `GET /:id` — fetch one, `404` with `{ "error": "<Resource> not found" }` if missing
  - `POST /` — create; `400` with `{ "error": "<required fields> are required" }` if required fields are missing; `201` with the created record on success
  - `PUT /:id` — update; `400` if no updatable fields are given; `404` if the record doesn't exist; `200` with the updated record on success
- All error responses are JSON in the shape `{ "error": "message" }` — no other shape.

## 3. Mount it (`server.js`)

- `require` the new router and `app.use('/<resource>', <resource>Router)`, alongside the existing mounts.

## 4. Tests (`tests/<resource>.test.js`)

- Use `node:test` + `supertest`, mirroring `tests/users.test.js`:
  - `test.beforeEach(() => store.reset())`
  - Cover: list returns the seeded records, get 404 on missing id, create succeeds (400 case optional), update succeeds, update 404 on missing id.

## After scaffolding

- Update `docs/api.md` with the new endpoints, matching the existing doc's format (base URL, request/response JSON examples, status codes).
- Run `npm test` and `npm run lint` before considering the resource done.
