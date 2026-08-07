---
name: add-express-route
description: Use when adding, creating, or scaffolding a new route/endpoint (GET, POST, PUT, DELETE, etc.) in this Express API — for example "add a DELETE /users/:id endpoint" or "create a route for orders". Not for unrelated changes like refactors, docs-only edits, or non-HTTP code.
---

Add the route following this repo's existing conventions (see `CLAUDE.md`):

1. **Data access**: never touch state directly in the route. Add or reuse a helper in `db/store.js` and go through it.
2. **Validation**: check required input first; return `400` with `{ "error": "message" }` on bad input.
3. **Missing records**: return `404` with `{ "error": "message" }` when a lookup fails.
4. **Success responses**: plain `res.json(...)` for reads/updates, `res.status(201).json(...)` for creates.
5. **File placement**: one route file per resource in `routes/`; if the resource doesn't have a router yet, create one and mount it in `server.js` under its base path — follow the pattern of `routes/users.js` and `routes/health.js`.
6. **Tests**: add a matching test in `tests/<resource>.test.js` using `node:test` + `supertest`, following `tests/users.test.js` — cover the success case and the `400`/`404` cases you added.
7. **Docs**: update `docs/api.md` with the new endpoint, matching the existing entries' format.

Run `npm test` and `npm run lint` after making the change.
