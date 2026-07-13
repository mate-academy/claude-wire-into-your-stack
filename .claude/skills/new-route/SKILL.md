---
name: new-route
description: Use when creating a new route file in routes/ for this API. Ensures the file follows the project's existing pattern for dependencies, validation, data access, and error responses.
---

When creating a new route file in `routes/`, follow the existing pattern (see `routes/users.js` and `routes/health.js`):

1. **Require dependencies** — `express` and, if the route reads/writes data, the relevant module in `db/store.js`. Create the router with `express.Router()`.
2. **Validate input** — check `req.body` / `req.params` / `req.query` for required fields before touching the store. On invalid input, respond `400` with `{ "error": "message" }`.
3. **Access data through `db/store.js`** — routes never hold state directly; call the store's helper functions (e.g. `listUsers`, `getUser`, `createUser`, `updateUser`). If the store has no matching helper yet, add one there rather than reaching into other modules.
4. **Handle the not-found case** — if a lookup returns nothing, respond `404` with `{ "error": "message" }`.
5. **Return the standard error shape** — all error responses are JSON `{ "error": "message" }`; success responses return the resource (or list) directly as JSON.
6. **Export the router** — `module.exports = router;`.
7. **Mount it in `server.js`** — `app.use('/base-path', newRouter)`, matching the one-file-per-resource convention.
