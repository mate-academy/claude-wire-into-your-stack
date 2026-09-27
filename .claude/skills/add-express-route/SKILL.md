---
name: add-express-route
description: Use when adding a new route, endpoint, or HTTP method (GET/POST/PUT/DELETE/PATCH) to this Express API's users or health resources — e.g. "add a DELETE endpoint", "add a route for X", "add an endpoint to remove a user". Encodes this project's route conventions so new endpoints match the existing ones.
---

Follow the pattern already used by `routes/users.js` and `db/store.js`:

1. Add the data operation to `db/store.js` first — routes never hold state directly, they only call into the store.
2. Add the route handler to the matching `routes/<resource>.js` file (one file per resource, mounted in `server.js`).
3. Validate input; on bad input return `400` with `{ "error": "message" }`.
4. When the referenced record doesn't exist, return `404` with `{ "error": "message" }` — never let a missing record crash the handler.
5. Add a test in `tests/<resource>.test.js`: `node:test` + `supertest`, relying on the existing `test.beforeEach(() => store.reset())`, covering the success case and the 404 case.
6. If the store needs a new helper, export it from `db/store.js` alongside the existing exports in `module.exports`.
