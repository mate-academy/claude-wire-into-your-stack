---
name: express-route
description: Use when creating, adding, modifying, or extending Express API routes or endpoints in this repository, including request validation, db/store.js access, error responses, tests, and API documentation.
---

# Express route pattern (this repo)

Reference: `routes/users.js`, `db/store.js`, `tests/users.test.js`, `server.js`.

## Adding or changing a route

1. **One file per resource** in `routes/<resource>.js`, exporting an `express.Router()` via CommonJS (`module.exports = router`).
2. **Mount it in `server.js`** under its base path: `app.use('/<resource>', <resource>Router);`
3. **No state in the route file.** Routes only call functions from `db/store.js` — never hold arrays/objects/counters directly in `routes/`.
4. **Data access only through `db/store.js`.** If the resource needs new operations (e.g. `deleteThing`), add them to `db/store.js`, not inline in the route.
5. **Validate input before calling the store.** Missing/invalid required fields → respond immediately, don't call the store.
6. **Status codes:**
   - `400` — invalid/missing input (checked before touching the store)
   - `404` — store lookup returned nothing (resource doesn't exist)
   - `201` — successful creation
   - `200` — successful read/update
7. **Error shape is always:**
   ```json
   { "error": "message" }
   ```
   Never return a bare string or a different key.

Route skeleton, following `routes/users.js`:

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

router.post('/', (req, res) => {
  const { field } = req.body;
  if (!field) {
    return res.status(400).json({ error: 'field is required' });
  }
  const record = store.createThing({ field });
  return res.status(201).json(record);
});

module.exports = router;
```

## Tests

- Add/update `tests/<resource>.test.js` using `node:test`, `node:assert`, and `supertest` against the exported `app` from `../server`.
- Call `store.reset()` in `test.beforeEach` whenever the store keeps mutable state, so each test starts from the seeded data.
- Cover: success path, the `400` validation case, and the `404` missing-resource case (mirror `tests/users.test.js`).

## Docs

- If the change affects the public API (new route, changed params, changed response shape, changed status codes), update `docs/api.md` to match.

## After making changes

Run, and fix anything that fails before considering the work done:

```
npm run lint
npm test
```
