---
name: express-route
description: Use when adding, changing, or removing an HTTP endpoint in this Express API — e.g. "add a DELETE /users/:id endpoint", "scaffold a route for projects", "add a new resource", or wiring up any new path under routes/. Covers the full slice (store helper, router, mount, test, docs) so it stays consistent with routes/users.js, routes/health.js, db/store.js, and tests/users.test.js. Do not use for unrelated changes (config, CI, dependencies, non-HTTP logic).
---

# Adding or changing a route in this API

This project has one consistent shape for an endpoint, spread across four files. Follow the
existing files (`routes/users.js`, `db/store.js`, `tests/users.test.js`, `docs/api.md`) as the
canonical examples — copy their structure, not just their spirit.

## Order of work

1. **Store helper** in `db/store.js` — the route must never hold state itself.
2. **Router** in `routes/<resource>.js`.
3. **Mount it** in `server.js` under its base path (`app.use('/<resource>', <resource>Router)`).
4. **Test** in `tests/<resource>.test.js`.
5. **Docs** — update `docs/api.md` to match. If the `docs` MCP server is connected, read
   `docs/api.md` through it first to see the current contract, and again after editing to check
   the new section reads consistently with the rest of the file.

## Router conventions (see `routes/users.js`)

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// METHOD /path — one-line description.
router.get('/', (req, res) => {
  res.json(store.listThings());
});

module.exports = router;
```

- One `// METHOD /path — description.` comment (em dash) directly above each handler.
- Coerce ids with `Number(req.params.id)` before passing them to the store.
- A handler with no branch can end with a bare `res.json(...)`. A handler with any branch
  (validation, not-found) uses explicit `return res.status(...).json(...)` on every path.
- Validation: destructure the body, check required fields, and return
  `400 { "error": "<field> and <field> are required" }` (or similarly specific) on failure —
  **before** touching the store.
- Missing record: return `404 { "error": "<Resource> not found" }`.
- Successful creation: `201` with the created object. Successful update/read: `200` (the default)
  with the object.
- Every error body is exactly `{ "error": "message" }` — never a bare string or extra fields.

## Store conventions (see `db/store.js`)

- Plain functions operating on an in-memory array; no class, no external state.
- A lookup helper returns `undefined` when nothing matches — never throws, never returns `null`.
- A `reset()` function restores the seed data, exported solely so tests can use it.
- Everything is exported together at the bottom: `module.exports = { ... }`.

## Test conventions (see `tests/users.test.js`)

- `node:test` + `node:assert` + `supertest` against the exported `app` — no separate test server.
- `test.beforeEach(() => store.reset())` so every test starts from the seed data.
- One `test(...)` per status-code branch (happy path, 404, 400, etc.), asserting `res.status`
  first, then relevant body fields.

## Before calling it done

Run `npm test` and `npm run lint` — both must be clean; CI runs exactly these two commands.
