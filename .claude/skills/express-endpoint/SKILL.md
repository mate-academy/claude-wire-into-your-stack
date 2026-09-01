---
name: express-endpoint
description: Conventions for adding, changing, or reviewing an HTTP endpoint in this Express API — route file layout, inline validation, when to return 400 vs 404, the { "error": "message" } response shape, going through db/store.js, mounting in server.js, the matching node:test + supertest file, and the docs/api.md entry. Use whenever a request involves an endpoint, route, or resource in this API (e.g. "add DELETE /users/:id", "create a /posts resource", "why does this return 500").
---

# Adding or changing an endpoint in this API

This project has one way of writing an endpoint. Follow it exactly rather
than introducing a new pattern — validation middleware, a schema library, a
different error shape, etc. all break with the rest of the codebase.

## 1. Route file (`routes/<resource>.js`)

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all <resource>.
router.get('/', (req, res) => {
  res.json(store.listThings());
});

// GET /<resource>/:id — fetch one, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const thing = store.getThing(Number(req.params.id));
  if (!thing) {
    return res.status(404).json({ error: 'Thing not found' });
  }
  return res.json(thing);
});

module.exports = router;
```

Rules:
- `require('express')` then `require('../db/store')` at the top (omit the
  store require only if the route is truly stateless, like `routes/health.js`).
- One `const router = express.Router();`.
- Handler paths are **relative to the mount point** — `'/'`, `'/:id'`, never
  the full `/resource/...` path.
- A one-line `// METHOD /resource — description.` comment directly above
  each handler.
- `module.exports = router;` at the bottom.

## 2. Handler body rules

- Validate **inline, at the top of the handler**, before touching the store.
  No middleware, no zod/joi/express-validator.
- Required fields (create): `if (!name || !email) { ... }`
- Partial update, at least one field required:
  `if (name === undefined && email === undefined) { ... }`
- Coerce ids at the store call site: `store.getThing(Number(req.params.id))`.
- Every handler with more than one statement uses explicit
  `return res...`; a single-statement handler (bare list/read) can use
  `res.json(...)` without `return`.

## 3. Status codes and the error shape

- `400` — bad input. Message is lowercase and names the missing fields:
  `{ "error": "name and email are required" }`
- `404` — record not found. Message is a capitalized sentence:
  `{ "error": "User not found" }`
- `201` — successful create.
- **The error shape is always exactly `{ "error": "message" }`** — one key,
  a string value. Never `{ "message": ... }`, never an array, never a code
  field. This is documented at the top of `docs/api.md` — don't diverge.

## 4. Data access — `db/store.js`

Routes never hold state or touch arrays directly. Add helper functions to
`db/store.js`:
- Wire new state into `seed()` so `store.reset()` (used by every test's
  `test.beforeEach`) restores it.
- Export the new helpers from the single `module.exports = { ... }` object
  at the bottom of the file.

## 5. Mounting — `server.js`

- Add `const xRouter = require('./routes/x');` alongside the other requires.
- Add `app.use('/x', xRouter);` after `app.use(express.json())`, grouped
  with the other `app.use` mounts.
- Never touch the `if (require.main === module) { app.listen(...) }` guard
  or `module.exports = app;` — supertest imports the app without a live
  port because of these two lines.

## 6. Tests — `tests/<resource>.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /<resource> returns the seeded list', async () => {
  const res = await request(app).get('/<resource>');
  assert.equal(res.status, 200);
});
```

- `require`, not `import` — the project is CommonJS.
- Flat top-level `test(...)` calls — **no `describe`/`it` blocks**.
- Test name is the literal route signature plus behavior:
  `'METHOD /path[/:param] does X'`.
- `test.beforeEach(() => store.reset());` once, right after the requires.
- Always `request(app)` (supertest against the imported app) — never
  `app.listen`, never raw `fetch` against a running server.
- Assert `res.status` first, then body fields, using `assert.equal` /
  `assert.ok` only.

## 7. Docs — `docs/api.md`

Add a `### METHOD /path` section in the same format as the existing
entries: a one-line description, the response shape, and every status
code the endpoint can return.

## Checklist before calling it done

- [ ] Route file follows the layout above and is mounted in `server.js`
- [ ] Validation is inline; 400 on bad input, 404 on missing record, 201 on create
- [ ] Every error response is `{ "error": "message" }`
- [ ] All state changes go through `db/store.js`, wired into `seed()`
- [ ] `tests/<resource>.test.js` exists in this project's `node:test` + supertest style
- [ ] `docs/api.md` has a matching section
- [ ] `npm run lint && npm test` pass
