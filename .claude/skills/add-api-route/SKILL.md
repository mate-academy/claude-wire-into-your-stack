---
name: add-api-route
description: How to add or change an HTTP endpoint in this Express API — a new resource router in routes/, a new GET/POST/PUT/PATCH/DELETE handler on an existing resource, plus its store helper, tests and docs/api.md entry. Use when asked to add, create, implement or modify an endpoint, route or resource (e.g. "add DELETE /users/:id", "create a /posts resource"). Not for unrelated refactors, tooling or config changes.
---

# Adding or changing an API route

Every endpoint in this repo is built the same way. Follow all five steps; a route
change is not done until each one is.

## 1. Data access goes through `db/store.js`

Routes never hold state. If the endpoint needs data the store can't provide yet,
add a small named helper to `db/store.js` and export it:

- Plain functions over the module-level arrays (`users`, `nextId`, …).
- Return the record, or `undefined` when it doesn't exist — never throw for "not found".
- For a new resource, add its seed data inside `seed()` so `reset()` covers it.

## 2. The route handler

One file per resource in `routes/<resource>.js`, exporting an `express.Router()`.
Match the existing style in `routes/users.js`:

```js
// DELETE /users/:id — remove a user, or 404 if it doesn't exist.
router.delete('/:id', (req, res) => {
  const removed = store.deleteUser(Number(req.params.id));
  if (!removed) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).end();
});
```

Rules:

- A one-line comment above each handler: `// METHOD /path — what it does.`
- Convert `:id` params with `Number(req.params.id)`.
- Validate the body first → `400` with `{ error: 'name and email are required' }`-style messages.
- Missing record → `404` with `{ error: '<Resource> not found' }`.
- Success codes: `200` for reads/updates, `201` + body for creates, `204` for deletes.
- Every error response is JSON shaped exactly `{ "error": "message" }`.
- `return` every `res.*` call so a handler can't respond twice.

## 3. Mount new routers in `server.js`

A new resource file is mounted next to the others:
`app.use('/<resource>', <resource>Router);`

## 4. Tests in `tests/<resource>.test.js`

Node's built-in runner + supertest, resetting the store before each test:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

Cover at least: the happy path (status + key body fields), the `400` case if the
route validates input, and the `404` case if it takes an id.

## 5. Document it in `docs/api.md`

Add a `### METHOD /path` entry under the resource's `##` heading describing the
body, success status, and each error status — same tone as the existing entries.

## Finish

Run `npm test` and `npm run lint`; both must pass.
