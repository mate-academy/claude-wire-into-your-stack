---
description: Scaffold a new Express resource route (router + store helpers + mount + stub test)
argument-hint: <resource-name>
---

Scaffold a new resource called `$1` in this API, following this repo's route conventions (routes/route-conventions skill):

1. Add store helpers for `$1` to `db/store.js` — a backing array, a `list$1s`/`get$1`/`create$1` set of functions (name them to match the existing `users` helpers' style), and reset them alongside the other data in `seed()`. Export the new functions.
2. Create `routes/$1.js` exporting an `express.Router()` with:
   - `GET /` — list all `$1`s
   - `GET /:id` — fetch one, `404` if missing
   - `POST /` — create one, validating required fields with `400` on bad input, `201` on success
   - error responses as `{ "error": "message" }`, all data access through `db/store.js`
3. Mount the new router in `server.js` under `/$1s` (or the correct plural — ask me if the pluralization isn't obvious).
4. Add a stub test file `tests/$1.test.js` mirroring the structure of `tests/users.test.js` (a `beforeEach` that resets the store, and at least a "list" and a "create" test).

Show me the diff before you're done, and run `npm test` to confirm nothing broke.
