---
name: express-route
description: Use when adding, changing, or reviewing a route/endpoint on this Express API (files under routes/, mounted in server.js) — covers request validation, status codes, error shape, and the matching test. Triggers on requests like "add a DELETE /users/:id route", "add an endpoint for X", or "review this route".
---

# Writing a route on this API

This project has one convention for every route, followed by every handler in
`routes/users.js` and `routes/health.js`. Apply it rather than inventing a new
shape.

1. **One file per resource.** A new resource gets its own file in `routes/`,
   exporting an `express.Router()`. Mount it in `server.js` under its base
   path (see how `usersRouter` and `healthRouter` are mounted).
2. **Never hold state in the route.** All reads and writes go through
   `db/store.js`. If the operation needs a new data helper, add it there
   (see `listUsers`, `getUser`, `createUser`, `updateUser`) — the route calls
   it, it never touches an array directly.
3. **Validate, then look up.** Check the request body/params first and return
   `400` for bad input (e.g. a required field missing). Only after that, look
   the record up and return `404` if it doesn't exist. This order matches
   every existing handler.
4. **Error shape is fixed.** Every error response is JSON shaped exactly
   `{ "error": "message" }` — no other keys, no plain-text errors.
5. **Success shape mirrors the resource.** Return the resource JSON directly
   (not wrapped), `201` on create, `200` otherwise.
6. **Every route ships with a test.** Add a case to the matching file in
   `tests/`, using `node:test` + `supertest` like the existing tests, with
   `test.beforeEach(() => store.reset())` so each test starts from the seed
   data.
7. **Keep `docs/api.md` in sync.** If the route is new or its contract
   changed, update `docs/api.md` to match — or run `/sync-api-docs` to do it.
