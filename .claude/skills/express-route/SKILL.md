---
name: express-route
description: Add, change or review an HTTP endpoint in this Express API — a new resource under routes/, a new method on an existing router (GET/POST/PUT/DELETE), or a change to a route's validation or error responses. Applies this project's route conventions: data access only through db/store.js, 400 on invalid input and 404 on a missing record, the { "error": "message" } response shape, supertest tests that reset the store, and docs/api.md kept in sync.
---

# Writing a route in this project

Every endpoint here follows the same shape. Match it — consistency is the
point, not cleverness.

## The route file

- **One file per resource** in `routes/`, exporting an Express router, mounted
  in `server.js` under its base path (`app.use('/users', usersRouter)`).
- **Never touch data directly.** Routes read and write through `db/store.js`
  helpers only; if the data operation you need doesn't exist there, add a
  helper to `db/store.js` first and export it.
- **Ids arrive as strings.** Convert with `Number(req.params.id)` before
  handing them to the store.
- **Return every response**: `return res.status(...).json(...)`, so a guard
  clause can't fall through to the code below it.
- Each route gets a one-line comment above it in the existing style:
  `// GET /users/:id — fetch one user, or 404 if it doesn't exist.`

## Status codes and errors

| Situation | Status | Body |
|---|---|---|
| Success (read, update) | `200` | the resource |
| Created | `201` | the created resource |
| Invalid or missing input | `400` | `{ "error": "name and email are required" }` |
| Record doesn't exist | `404` | `{ "error": "User not found" }` |

- **Validate before you look anything up.** A request with a bad body gets
  `400` whether or not the record exists — otherwise a missing record would
  shadow a missing field and return the wrong code.
- Error bodies are always `{ "error": "message" }` — never a bare string,
  never `{ message }`.
- A store helper returns `undefined` for a record that isn't there. Check it
  and answer `404`; never dereference the result straight away.

## Tests

Tests live in `tests/<resource>.test.js` and use Node's built-in runner with
supertest against the exported app:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

- `store.reset()` in `beforeEach` — the store is in-memory and shared, so
  without it tests leak state into each other.
- Cover the happy path **and** both failure paths: `400` for bad input and
  `404` for a missing record. A route without those two tests isn't done.

## Before you call it finished

1. `npm test` — all green.
2. `npm run lint` — clean; CI runs it and fails the build otherwise.
3. **Update `docs/api.md`** in the existing format (method, path, what it
   does, the response codes). The docs are the API's contract; a new endpoint
   that isn't documented is unfinished work.
