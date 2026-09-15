---
name: add-express-route
description: Use when asked to add, create, or scaffold a new Express route or API endpoint in this repo (e.g. "add a GET /api/ping endpoint", "create a new route for X"). Not for editing existing routes, general Express questions, or non-route code changes.
---

# Add an Express route

This repo (`course-api`) has one fixed pattern for adding a resource route. Follow it exactly — don't introduce new conventions.

## 1. Create the route file

Add a new file under `routes/`, named after the resource (e.g. `routes/widgets.js`). Model it on `routes/health.js` and `routes/users.js`:

```js
const express = require('express');

const router = express.Router();

// GET /<resource> — <short description>.
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
```

Rules:
- `const router = express.Router();` then handlers, then `module.exports = router;`.
- If the route reads or writes data, go through `db/store.js` — never hold state in the route file. Add helpers to `db/store.js` if needed, following its existing function style (`listX`, `getX`, `createX`, `updateX`).
- One-line `//` comment above each handler describing the method + path.
- Validate input in the handler:
  - Missing/invalid required fields → `res.status(400).json({ error: 'message' })`
  - Record not found → `res.status(404).json({ error: 'message' })`
- All JSON responses use the `{ error: "message" }` shape for errors — no other error format.
- Use `return res.json(...)` / `return res.status(...).json(...)` for any handler with more than one exit path (matches `routes/users.js`); a single-statement handler (like `health.js`) can omit `return`.

## 2. Mount it in `server.js`

Add a require and a `app.use()` line next to the existing ones, keeping the same style:

```js
const widgetsRouter = require('./routes/widgets');
...
app.use('/widgets', widgetsRouter);
```

## 3. Add a test file

Create `tests/<resource>.test.js`, modeled on `tests/users.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /<resource> ...', async () => {
  const res = await request(app).get('/<resource>');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});
```

Cover the happy path and every error branch (400/404) the route introduces.

## 4. Update docs

Add a section to `docs/api.md` documenting the new endpoint(s), following the existing format (method + path heading, short description, request body if any, response shape and status codes).

## 5. Verify

Run `npm run lint` and `npm test` before considering the route done.
