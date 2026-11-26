---
name: add-endpoint
description: Step-by-step procedure for adding or changing an HTTP endpoint in this Express API — a new resource, or a new or modified GET/POST/PUT/PATCH/DELETE route in routes/*.js. Covers the router file, mounting in server.js, store helpers in db/store.js, 400/404 validation, supertest tests and the docs/api.md entry. Use whenever a request asks to add, extend or change an API route or resource. Do not use for questions about existing behaviour, refactors that leave the HTTP interface unchanged, or tooling and config changes.
---

# Add or change an endpoint

The conventions in `CLAUDE.md` apply throughout. This procedure says where
each piece goes and what is easy to forget.

## 1. Data access: `db/store.js`

- Add a named helper for every new read or write (e.g. `deleteUser(id)`) and
  export it. Routes call these helpers; they never touch the arrays.
- A new resource gets its own array and id counter, initialised in `seed()`
  so that `reset()` restores it for the tests.
- Return `undefined` (or `false` for deletes) when the record does not exist;
  the route turns that into a `404`.

## 2. Route: `routes/<resource>.js`

- Follow the shape of `routes/users.js`: one `express.Router()`, a one-line
  comment above each handler naming the method, path and outcome, e.g.
  `// DELETE /users/:id — remove a user, or 404 if it doesn't exist.`
- Parse path ids with `Number(req.params.id)`; a non-numeric id simply finds
  no record and yields `404`.
- Validate the body before calling the store and `return` every response.
- Status codes: `200` with the record, `201` with the created record,
  `204` with no body for a successful delete.
- Express is **4.x**: a rejected promise in an `async` handler is *not*
  forwarded to `next()`, and the app has no JSON error middleware. Keep
  handlers synchronous while the store is synchronous; if a handler must
  `await`, catch the error in the handler and answer with a JSON
  `{ "error": ... }` body.

## 3. Mount: `server.js`

Only for a new resource: `require` the router and add
`app.use('/<resource>', router)` next to the existing mounts.

## 4. Tests: `tests/<resource>.test.js`

Use Node's built-in runner with supertest, as in `tests/users.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

Cover at least the success case and every error status the route can
return (`400`, `404`), asserting the status and the relevant body fields.

## 5. Docs: `docs/api.md`

Add or update the entry under the resource heading: method and path as a
`###` heading, then one paragraph with the body fields and every status code
the endpoint returns.

## 6. Verify

Run `npm test` and `npm run lint`; both must pass.
