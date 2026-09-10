---
name: add-api-endpoint
description: "Use when adding, changing, or removing an HTTP endpoint or resource in this Express API — a new route file under routes/, a new method on an existing route, new data helpers in db/store.js, or changes to a route's validation and error responses. Covers the required order and this project's gotchas: store helper first, router file, mounting in server.js ABOVE the notFound fallback, 400/404 validation in the { error: 'message' } shape, supertest coverage in tests/, and the matching docs/api.md entry. Triggers on: add an endpoint, add a route, add a resource, expose a path, DELETE /users/:id, add PATCH support, add an API method, new CRUD operation."
---

# Adding an endpoint to this API

Six steps, in this order. Steps 3 and 6 are where this project differs from a stock Express app —
skip them and the change looks correct but is broken or unlinted.

## When this applies

Applies when the set of HTTP endpoints changes, or when a route's validation or error responses change.

Does **not** apply to: adding test coverage for a route that already exists, refactors that leave the
routes unchanged, or edits to `middleware/errors.js`.

## 1. Data helper — `db/store.js`

All state lives here; routes never hold their own. Add a helper (`listX`, `getX`, `createX`,
`updateX`) alongside the existing ones and export it.

If the resource needs seed data, put it in `seed()` — not at module scope. `reset()` calls `seed()`,
and that is what gives each test a clean slate.

## 2. Router — `routes/<resource>.js`

One file per resource. `const router = express.Router()`, paths relative to the mount point
(`router.get('/', ...)` serves `GET /<resource>`), `module.exports = router` at the bottom.

## 3. Mount it — `server.js` ⚠️

```js
app.use('/<base>', <name>Router);   // must be ABOVE the two lines below
app.use(notFound);
app.use(errorHandler);
```

`notFound` is a catch-all. A router mounted below it never receives a request — the endpoint returns
`404 {"error":"Not found"}` with no error and no failing import, which is very hard to spot. Always
add the `app.use` line above `app.use(notFound)`.

## 4. Validation and errors

- Validate in the route. `400` on bad input, `404` when the record is missing.
- Every error body is `{ error: 'message' }` — no bare strings, no HTML.
- Do **not** add per-route `try`/`catch`. `middleware/errors.js` already converts anything thrown
  into the same shape, and hides 5xx details.

## 5. Tests — `tests/<resource>.test.js`

`node:test` + `supertest`, following `tests/users.test.js`:

```js
test.beforeEach(() => store.reset());
```

Assert the status first, then the body shape. Cover the failure paths, not just the happy one — at
minimum the `400` and the `404` the route can return.

## 6. Docs — `docs/api.md`

Add a section matching the existing heading style (`### METHOD /path`, what it returns, which status
codes). The file documents the error contract at the top; keep new routes consistent with it.

## Before finishing

Run both — CI runs exactly these on every push to `main` and every PR:

```
npm test && npm run lint
```

`lint` enumerates directories (`eslint server.js routes middleware db tests`). If this change added a
new top-level directory, add it to the `lint` script in `package.json` or it is silently never linted.

## Reference

`routes/users.js` and `tests/users.test.js` are the canonical examples — read them before writing a
new resource rather than working from memory.
