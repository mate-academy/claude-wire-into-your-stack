---
name: api-route-conventions
description: Conventions for Express route files in this repo. Use ONLY when adding, changing, or reviewing a route handler in routes/ (e.g. routes/users.js, routes/health.js) — how routers are structured and mounted, how they reach data, and how they validate input and shape errors. Do NOT use for changes outside routes/, such as db/store.js, server.js wiring alone, tests, or docs.
---

# API route conventions

How route files under `routes/` are written in this project. Follow these when
creating a new resource route or editing an existing handler.

## One router per resource

- Each resource gets its own file in `routes/` (`users.js`, `health.js`), which
  creates a router with `express.Router()` and ends with `module.exports = router`.
- Mount the router in `server.js` under its base path, e.g.
  `app.use('/users', usersRouter)`. The path prefix lives only in `server.js`;
  handlers inside the file use paths relative to that prefix (`'/'`, `'/:id'`).
- Keep the file to route wiring: `require` express and the store, define handlers,
  export the router. No app creation, no `listen`.

## All data access goes through `db/store.js`

- Routes never hold state or touch the `users` array directly. Read and write
  only through the helpers exported from `db/store.js`
  (`listUsers`, `getUser`, `createUser`, `updateUser`, ...).
- If a handler needs an operation the store doesn't expose yet, add a helper to
  `db/store.js` and call that — don't inline the logic in the route.
- `getUser`/`updateUser` take a numeric id, so convert params:
  `store.getUser(Number(req.params.id))`.

## Validation and status codes

- Validate input in the handler before calling the store.
- Return `400` when the request body is invalid or missing required fields
  (e.g. `POST /users` requires `name` and `email`; `PUT /users/:id` requires at
  least one of them).
- Return `404` when the addressed record doesn't exist — check the store's return
  value (`undefined` means missing) and respond before doing anything else.
- Use `return res.status(...).json(...)` so the handler stops on the error path.
- On success: `200` with the resource for reads and updates, `201` for creates.

## Error response shape

- Every error response is JSON in the shape `{ "error": "message" }` — a single
  `error` key with a human-readable string.
- The message should name what was wrong: `'name and email are required'`,
  `'User not found'`.

## Reference: a complete handler

```js
// PUT /users/:id — update an existing user.
router.put('/:id', (req, res) => {
  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  const user = store.updateUser(Number(req.params.id), { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});
```
