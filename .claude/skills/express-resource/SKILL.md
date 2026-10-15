---
name: express-resource
description: >-
  Use when adding, extending, or reviewing an HTTP resource in this Course API
  Express app — creating or changing a file in routes/, wiring a router into
  server.js, adding read/write helpers to db/store.js, or writing the request
  validation and JSON error responses for an endpoint. Triggers on requests like
  "add a /projects resource", "add a DELETE /users/:id endpoint", "expose posts
  through the API", or "does this route follow our conventions".
---

# Adding or changing a resource in the Course API

This project keeps every resource identical in shape. Follow these steps so a
new route looks like the ones already there (`routes/users.js`, `routes/health.js`).

## 1. Route file — one per resource

Create `routes/<resource>.js`. It exports an Express router and nothing else:

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// ...handlers...

module.exports = router;
```

- One handler per line-of-comment describing the method, path, and outcome
  (`// GET /things/:id — fetch one, or 404 if missing`).
- Handlers never touch module-level state. Every read and write goes through
  `db/store.js`.
- `:id` params are numeric — coerce with `Number(req.params.id)` before passing
  to the store.

## 2. Store helpers — all data access lives in `db/store.js`

Add named helpers (`listThings`, `getThing`, `createThing`, `updateThing`, …) to
the object exported at the bottom of `db/store.js`. New collections get seeded in
`seed()` so `reset()` keeps the tests deterministic. Routes must not hold arrays
or ids themselves.

## 3. Validation and status codes

Validate in the handler, before calling the store:

- Missing or empty required field on create → `400`
- Update body with no updatable field → `400`
- Store lookup returns nothing → `404`
- Successful create → `201` with the new record
- Other success → `200` with the record or list

## 4. Error response shape

Every non-2xx response is JSON in exactly this shape — no extra keys:

```js
return res.status(400).json({ error: 'name and email are required' });
return res.status(404).json({ error: 'Thing not found' });
```

## 5. Mount it

In `server.js`, add `const thingsRouter = require('./routes/things');` with the
other requires and `app.use('/things', thingsRouter);` with the other mounts,
keeping the same ordering (requires together, mounts together).

## 6. Tests

Add cases to `tests/` mirroring `tests/users.test.js`: use `supertest` against
the imported `app`, `store.reset()` in `test.beforeEach`, and cover the happy
path plus each `400`/`404` branch you added.

## 7. Docs

Add the endpoint(s) to `docs/api.md` under a heading for the resource, matching
the existing entries (method, path, one line on the body and status codes).
