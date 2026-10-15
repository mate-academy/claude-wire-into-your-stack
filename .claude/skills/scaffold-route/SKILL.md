---
name: scaffold-route
description: Use when adding a new resource or endpoint to this Express API — creating a new route file, a new `/something` path, or extending an existing resource. Encodes how routes, data access, validation, error responses, and tests are written in this repo.
---

# Scaffold a route the way this project does it

When asked to add a new resource or endpoint, follow these conventions exactly. They
mirror what already exists in `routes/users.js` and `routes/health.js`.

## 1. One route file per resource

- Create `routes/<resource>.js` exporting an Express router (`express.Router()`).
- Mount it in `server.js` under its base path: `app.use('/<resource>', <resource>Router);`.
- Do not add a second resource's handlers to an existing route file.

## 2. All data access goes through `db/store.js`

- Routes never hold state directly. Read and write only through helpers in `db/store.js`
  (e.g. `store.listX()`, `store.getX(id)`, `store.createX(...)`, `store.updateX(...)`).
- If a needed helper doesn't exist, add it to `db/store.js` and keep the in-memory shape
  consistent with `users` (numeric auto-increment `id`, `reset()` re-seeds for tests).

## 3. Validate input; use the right status codes

- Validate in the route, before touching the store.
- Return `400` on bad/missing input, `404` when a record is missing.
- Return `201` on successful creation, `200` otherwise.

## 4. Error responses are JSON `{ "error": "message" }`

Every error path responds with that exact shape, e.g.
`return res.status(404).json({ error: 'X not found' });`.

## 5. Always write tests

- Add `tests/<resource>.test.js` using Node's built-in runner (`node:test`) + `supertest`,
  matching the style of `tests/users.test.js`.
- Call `store.reset()` in `test.beforeEach` so each test starts from seed data.
- Cover the happy path plus the `400` and `404` branches you added.
- Run `npm test` and confirm it passes before considering the route done.

## 6. Comment style

Short English comments above each handler describing the method, path, and behaviour —
e.g. `// GET /widgets/:id — fetch one widget, or 404 if it doesn't exist.`
