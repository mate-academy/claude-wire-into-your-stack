---
name: add-endpoint
description: Use when adding, changing, or removing an API route/endpoint/resource in this Express project (e.g. "add a DELETE endpoint for users", "add a products resource", "add a new route"). Ensures the route, db/store.js functions, server.js mounting, and docs/api.md all stay consistent with this project's conventions.
---

Add or modify an endpoint by following the existing pattern in `routes/users.js`, `db/store.js`, `server.js`, and `docs/api.md`. Do not invent a different structure.

1. **Data access** — add or update the needed functions in `db/store.js`. Routes never hold state or touch the in-memory data directly; they only call functions exported from here.
2. **Route file** — one file per resource in `routes/`. If the resource doesn't have a file yet, create `routes/<resource>.js` following the shape of `routes/users.js`: `express.Router()`, one handler per verb, `module.exports = router`.
3. **Validation and status codes**:
   - `400` when required input is missing or invalid
   - `404` when a record looked up by id doesn't exist
   - Success responses: `200` for reads/updates, `201` for creates
   - All error bodies are `{ "error": "message" }` — no other error shape
4. **Mounting** — if this is a new resource file, mount its router in `server.js` under its base path (e.g. `/users`), matching how the existing routers are mounted.
5. **Docs** — update `docs/api.md` to document the new/changed endpoint(s) in the same style as the existing entries (heading per endpoint, brief description, request/response notes, status codes).
6. **Tests** — do not write tests as part of this skill; if tests are wanted, use the `/create-test` command on the route file afterward.

Keep changes scoped to what was asked — don't refactor unrelated routes or restructure the store while doing this.
