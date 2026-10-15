---
name: add-api-route
description: Conventions for adding or changing an HTTP endpoint on this Express API. Use whenever the request involves a new route, a new resource, or a new method (GET/POST/PUT/PATCH/DELETE) under routes/, or changing how an existing endpoint validates input or reports errors. Covers data access through db/store.js, the 400/404 rules, the { "error": "message" } response shape, the supertest test, and the docs/api.md update.
---

# Adding an endpoint to this API

Every endpoint here follows the same five-part chain. A change is not done
until all five are in place — the last two are the ones most often forgotten.

## 1. The route lives in `routes/<resource>.js`

One file per resource, each exporting an Express router. Paths inside the file
are relative to the mount point, so the users router uses `/` and `/:id`, not
`/users` and `/users/:id`.

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /things/:id — fetch one thing, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  // ...
});

module.exports = router;
```

Each route gets a one-line comment above it in the form
`// METHOD /path — what it does`, matching the existing files.

## 2. Mount it in `server.js`

A new resource file does nothing until it is mounted under its base path:

```js
const thingsRouter = require('./routes/things');
app.use('/things', thingsRouter);
```

Mount it alongside the existing routers, after `app.use(express.json())`.

## 3. Data access goes through `db/store.js`

Routes never hold state and never touch the arrays directly. If the endpoint
needs an operation the store does not have yet, add a helper there first and
export it, then call it from the route.

Store helpers return plain data and know nothing about HTTP. A missing record
returns `undefined` — it is the route's job to turn that into a 404. Keeping
that boundary is why swapping in a real database later only touches one file.

## 4. Validate in the route, with this project's status codes

- `400` — the input is missing or invalid. Check this **before** looking
  anything up.
- `404` — the input was fine, but no record has that id.
- Every error body is JSON in the shape `{ "error": "message" }`. The message
  is a short lowercase phrase describing what was wrong, e.g.
  `{ "error": "name and email are required" }`.
- Ids arrive as strings on `req.params`; convert with `Number(req.params.id)`
  before passing them to the store, which compares with `===`.
- Return early on each failure (`return res.status(...)`) rather than nesting.

## 5. Cover it with a test, then update the docs

Tests live in `tests/<resource>.test.js` and use Node's built-in runner with
supertest. Reset the store before each test so they do not leak into each other:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /things/:id returns 404 for a missing thing', async () => {
  const res = await request(app).get('/things/999');
  assert.equal(res.status, 404);
});
```

Cover the success case and both failure paths — the 400 and the 404. Then add
the endpoint to `docs/api.md` under its resource heading, following the shape
already used there: the method and path, what it does, and what it returns for
each status code.

## Before calling it done

Run both checks — the repo has ESLint configured and CI runs it:

```
npm test
npm run lint
```
