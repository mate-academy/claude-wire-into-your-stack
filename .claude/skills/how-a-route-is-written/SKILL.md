---
name: how-a-route-is-written
description: How to add or modify an Express route in this Course API project (routes/, db/store.js, server.js). Use this whenever the user asks to add a new endpoint, create a new resource/route file, add a method (GET/POST/PUT/DELETE) to an existing route, or wants a route to follow the project's conventions — even if they just say "add an endpoint for X" or "let me create/update/delete Y" without mentioning routes explicitly.
---

# How a route is written in this project

This API follows one fixed shape for every route. The point of the shape is
that `db/store.js` is the only place that touches data, and every route
returns errors the same way, so any client of the API can rely on that
regardless of which resource it's calling.

## Where things live

- **`routes/<resource>.js`** — one file per resource, exporting an Express
  `Router`. This is the only place request/response logic lives.
- **`server.js`** — requires the router and mounts it with `app.use('/<base-path>', router)`.
  A new resource needs exactly one line added here.
- **`db/store.js`** — the only place that reads or writes data. Routes never
  hold their own state (no module-level arrays, no caching) — they call a
  function from the store and return what it gives back.

## The route file

Look at `routes/users.js` as the reference implementation. The pattern per
handler:

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const user = store.getUser(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

module.exports = router;
```

Things to carry over into any new or modified handler:

- **One-line comment above each handler** stating the method + path and what
  it does, in the same style as the examples above (`// GET /users — list all users.`).
- **Validate input first, before calling the store.** Destructure the fields
  you need from `req.body` (or `req.params`), check them, and return `400`
  immediately if something required is missing or malformed. `routes/users.js`'s
  `POST` and `PUT` handlers show this — `PUT` in particular only requires that
  *at least one* updatable field is present, not both.
- **Look up first, then decide 404 vs proceed.** For anything that acts on an
  existing record (get one, update, delete), call the store, check whether it
  returned something falsy, and return `404` before doing anything else.
- **All data access is a call into `store`.** Never read or mutate an
  in-memory array from inside a route — if the data you need doesn't have a
  store function yet, add one to `db/store.js` (see below) rather than
  reaching around it.
- **Error responses are always `{ "error": "message" }`.** Nothing else goes
  in an error body, and successful responses never use that key.
- **Route params are converted to the right type before hitting the store.**
  `req.params.id` is a string; `users.js` does `Number(req.params.id))` before
  passing it to `store.getUser`.
- **Return values from the store go straight to `res.json(...)`** — routes
  don't reshape what the store gives back.
- Use `res.status(201).json(...)` for a successful `POST` that creates a
  resource; a plain `res.json(...)` (implicit 200) for GET/PUT.

A resource with no meaningful validation or lookup can be as small as
`routes/health.js` — a bare `router.get('/', ...)` is fine when there's
nothing to validate and nothing that can 404.

## Extending `db/store.js`

If the new route needs data access that doesn't exist yet, add a plain
function to `db/store.js` next to the existing ones (`listUsers`, `getUser`,
`createUser`, `updateUser`) and export it. Keep the same shape: take plain
arguments, return the record (or `undefined`/falsy when not found — routes
rely on that to decide 404), and never let a route touch `users` or any other
in-memory data directly.

## Mounting in `server.js`

For a brand-new resource, add a `require` for the new router and one
`app.use('/<base-path>', <name>Router)` line, following the two existing
mounts:

```js
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);
```

Order among `app.use` calls doesn't matter here since each resource has its
own base path — just add the new line alongside the others.

## Checklist before calling a route done

1. Route file has one file per resource, requires `../db/store`, exports the
   router.
2. Every handler validates required input and returns `400` on bad input
   before touching the store.
3. Every handler that operates on a specific record returns `404` when the
   store says it doesn't exist.
4. All error bodies are exactly `{ "error": "message" }`.
5. No state lives in the route file — everything goes through `db/store.js`.
6. New resource is mounted in `server.js` under its base path.
