---
name: add-express-route
description: Use when adding a new REST resource or route file to this Express API (e.g. a new routes/<resource>.js, or new endpoints on an existing resource) — applies this repo's conventions for store access, input validation, and error responses.
---

# Adding a route to the Course API

This project has one established pattern for adding a resource. Follow it rather than improvising:

1. **Data access lives in `db/store.js`, never in the route.** Add plain functions there (e.g. `listWidgets`, `getWidget`, `createWidget`) that read/write the in-memory store. Routes call these functions; they never hold state themselves.
2. **One route file per resource in `routes/`.** Model it on `routes/users.js`: an `express.Router()`, one handler per verb, each calling into `db/store.js`.
3. **Mount the router in `server.js`** under its base path, next to the existing `app.use('/users', usersRouter)` line.
4. **Validate in the route, not the store.** Return `400` with `{ "error": "message" }` for bad or missing input, and `404` with `{ "error": "message" }` when `db/store.js` returns nothing for a given id.
5. **Error responses are always `{ "error": "message" }`** — no other shape, no stack traces.
6. **Add tests in `tests/`** mirroring `tests/users.test.js`: `test.beforeEach(() => store.reset())`, then one test per status code the route can return (success, 400, 404).
7. **Update `docs/api.md`** with the new endpoint(s), matching the existing entries' format.

Keep it minimal — no extra middleware, abstractions, or validation libraries. The new route should read exactly like the existing ones.
