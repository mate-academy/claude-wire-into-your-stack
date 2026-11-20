---
name: express-route
description: Use when adding or changing an HTTP endpoint/route/resource in this Express Course API (e.g. "add a /products resource", "add DELETE /users/:id", "add an endpoint for ..."). Covers the route file in routes/, the db/store.js helpers, mounting in server.js, validation with 400/404 JSON errors, node:test + supertest tests, and docs/api.md. Not for unrelated refactors, lint fixes, or non-HTTP code.
---

# Adding or changing a route in Course API

Follow these steps in order. Keep the existing code style (CommonJS, single quotes, 2 spaces).

## 1. Data access — `db/store.js`
- Add the state and helper functions here (e.g. `listX`, `getX`, `createX`, `updateX`, `deleteX`).
- Seed data goes inside `seed()` so `reset()` restores it for tests.
- Export every new helper in `module.exports`.
- Routes must never hold state themselves.

## 2. Route file — `routes/<resource>.js`
- One file per resource, exporting an `express.Router()`.
- Comment each handler with its method and path: `// GET /things/:id — ...`.
- Convert path ids with `Number(req.params.id)`.
- Validate input first → `res.status(400).json({ error: '<what is required>' })`.
- Missing record → `res.status(404).json({ error: '<Thing> not found' })`.
- Create → `201` with the created object; read/update → `200` (plain `res.json`).
- Errors are ALWAYS JSON `{ "error": "message" }` — never plain text.

## 3. Mount — `server.js`
- `const thingsRouter = require('./routes/things');`
- `app.use('/things', thingsRouter);` next to the other `app.use` lines.

## 4. Tests — `tests/<resource>.test.js`
Use the existing pattern:
```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```
Cover: happy path, `400` on bad input, `404` on missing id.

## 5. Docs — `docs/api.md`
Add a `### METHOD /path` section with body fields and status codes.

## 6. Verify
Run `npm test` and `npm run lint`; both must pass.
