---
name: add-api-endpoint
description: Use when adding or changing an HTTP endpoint or resource in this Express Course API — e.g. "add a DELETE /users/:id route", "add a /posts resource", "add PATCH to users". Covers the route file, mounting in server.js, db/store.js helpers, 400/404 JSON errors, node:test + supertest tests, and docs/api.md. Not for general questions, refactors of non-route code, or lint/config changes.
---

# Adding an endpoint to the Course API

Follow these steps in order whenever you add a new route or a new resource.

## 1. Data access goes through `db/store.js`

- Routes never hold state. If the endpoint needs new data behaviour, add a named
  helper to `db/store.js` (e.g. `deleteUser(id)`, `listPosts()`) and export it.
- Helpers return the record, or `undefined` when it is missing — never throw for "not found".
- A new resource gets its own array + `nextId` inside `seed()`, so `store.reset()` resets it too.

## 2. One route file per resource

- Existing resource → add the handler to `routes/<resource>.js`.
- New resource → create `routes/<resource>.js` exporting an `express.Router()`,
  then mount it in `server.js`: `app.use('/<resource>', <resource>Router);`
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`.

## 3. Validate input, use the project's error shape

- Bad or missing input → `400`.
- Record not found → `404`.
- Errors are always JSON: `res.status(4xx).json({ error: 'message' })`.
- Success codes: `200` for reads/updates, `201` + body for creates, `204` with no body for deletes.
- Use `return res...` in every branch so a handler never sends twice.

## 4. Tests in `tests/<resource>.test.js`

Match the existing style in `tests/users.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

Cover at least the happy path plus every `400` and `404` branch you added.

## 5. Document it in `docs/api.md`

Add a `### METHOD /path` section under the resource heading: body fields,
success status, and each error status.

## 6. Verify

Run `npm run lint` and `npm test`; both must pass before you report done.
