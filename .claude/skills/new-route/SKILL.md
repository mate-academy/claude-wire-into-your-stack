---
name: new-route
description: Add or change an Express route or endpoint in this API (e.g. "add a DELETE /users/:id", "create a /posts resource"). Applies the project's route conventions - one router file per resource, all data via db/store.js, 400/404 validation, JSON { "error": "message" } responses, tests and docs/api.md updates. Not for general questions or non-route changes.
---

# Writing a route in this project

Follow these steps, matching the style of `routes/users.js`.

1. **Router file** – one file per resource in `routes/<resource>.js`, exporting an Express router. Mount it in `server.js` under its base path (`app.use('/<resource>', router)`).
2. **Data access** – only through `db/store.js`. Add a helper there if needed (and export it); routes never hold state. Keep `reset()` restoring seed data.
3. **Validation** – validate input in the route: `400` for bad/missing input, `404` when a record is missing, `201` on create. Convert ids with `Number(req.params.id)`.
4. **Errors** – always JSON `{ "error": "message" }`, e.g. `res.status(404).json({ error: 'User not found' })`.
5. **Tests** – add cases to `tests/<resource>.test.js` using `node:test` + `supertest`, with `test.beforeEach(() => store.reset())`. Cover the success path, 400 and 404.
6. **Docs** – document the endpoint in `docs/api.md` (body, status codes).
7. **Verify** – run `npm test` and `npm run lint`; both must pass.
