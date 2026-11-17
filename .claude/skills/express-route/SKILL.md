---
name: express-route
description: How to add or change an HTTP endpoint in this Express API. Use when asked to create a new route or resource (e.g. "add a /products endpoint", "add DELETE /users/:id"), or to add or modify a GET/POST/PUT/PATCH/DELETE handler in routes/. Covers the route file, db/store.js helpers, mounting in server.js, validation with 400/404, the { "error" } response shape, tests, and docs/api.md. Not for non-route work such as lint config, CI, or README edits.
---

# Adding or changing a route in the Course API

Follow these steps in order. The examples come from `routes/users.js`, which is the reference implementation, so match its style.

## 1. Data access goes in `db/store.js` first

Routes never hold state. If the endpoint needs data the store can't provide yet, add a helper to `db/store.js` before writing the route:

- Keep data in a module-level array with a `nextId` counter, like `users`.
- Add seed records to `seed()` so `reset()` restores them for tests.
- Lookups return `undefined` when a record is missing, and routes turn that into a `404`.
- Updates change only the fields that aren't `undefined`, as `updateUser` does.
- Add each new helper to the `module.exports = { ... }` object.

## 2. One route file per resource: `routes/<resource>.js`

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /things/:id — fetch one thing, or 404 if it doesn't exist.
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
- Put a one-line comment above each handler in the form `// METHOD /path — what it does.`
- Paths are relative to the mount point (`'/'`, `'/:id'`), not the full URL.
- Convert ids with `Number(req.params.id)` before passing them to the store.
- **Validate in the route** before calling the store. Return `400` when required body fields are missing. For a partial update, return `400` if no updatable field was sent.
- Return **`404`** when the store returns `undefined`.
- Errors are always `res.status(code).json({ error: 'message' })`. Never send plain text or any other shape.
- Success responses: `201` with the created record for POST, `200` (the default `res.json`) for GET and PUT, and `204` with `res.status(204).end()` for DELETE.
- Use `return` with every response inside a branch, so nothing runs after a response is sent.

## 3. Mount a new resource in `server.js`

Require the router at the top next to the others, then mount it under its base path after `express.json()`:

```js
const thingsRouter = require('./routes/things');
// ...
app.use('/things', thingsRouter);
```

Skip this step if you're only adding a handler to an existing file.

## 4. Tests in `tests/<resource>.test.js`

Use Node's built-in runner with supertest, as `tests/users.test.js` does:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

For each new handler, test the success case and every error branch (`400` and/or `404`), checking `res.status` and the key fields of `res.body`.

## 5. Document it in `docs/api.md`

Add an entry under the resource's `##` section, matching the existing format: `### METHOD /path`, then one or two sentences on the body it takes and each status code it returns. For a new resource, also add a short "A thing looks like:" JSON example.

## 6. Verify

Run `npm test` and `npm run lint`, and fix any failures before you report the work as done.
