---
name: express-route-convention
description: Use when adding, changing, scaffolding, or reviewing an Express route or endpoint in this API (files under routes/, or anything that reads/writes data via db/store.js) — for example "add a DELETE endpoint", "create a new resource router", "wire up a new route" — so the route follows this repo's conventions for validation, status codes, error shape, and data access instead of inventing a new pattern.
---

# Express route convention

This project's routes (see `routes/users.js`, `routes/health.js`) all follow the same shape. When writing or reviewing a route, hold to it:

- **One route file per resource**, mounted in `server.js` under its base path (e.g. `app.use('/users', usersRouter)`).
- **All data access goes through `db/store.js`.** Routes never hold state directly — add a helper there (e.g. `deleteUser`) instead of touching an array in the route file.
- **Validate input in the route.** Return `400` with a JSON body when required fields are missing or malformed.
- **Return `404`** when a route acts on a record that doesn't exist (looked up by id and not found).
- **Error responses are always `{ "error": "message" }`** — never a bare string, never a different key.
- **Success responses return the resource itself** (or an array of them for list endpoints), not a wrapper object.
- Keep handlers small: parse/validate, call the `db/store.js` helper, map the result to a status code.

After adding or changing a route, check `docs/api.md` — if the endpoint's behavior isn't described there yet, add a short section matching the existing entries' format.
