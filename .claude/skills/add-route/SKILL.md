---
name: add-route
description: Use when adding a brand-new HTTP endpoint or resource to this Express API (e.g. "add a DELETE /users/:id route", "add a posts resource", "add an endpoint to list active users"). Encodes this repo's route convention so new endpoints match the existing ones. Do not use for editing an existing route's logic, for non-route changes, or for other projects.
---

Add the new endpoint following this repo's convention exactly:

1. **Router file** — add the handler to the existing resource's file in `routes/` (e.g. `routes/users.js`), or create a new file per resource if it's a new resource. Export an Express router.
2. **Mount it** — if it's a new resource file, mount it in `server.js` under its base path, matching how `users.js` and `health.js` are mounted.
3. **Data access** — read/write only through `db/store.js`. Add a helper function there if the store doesn't already expose what you need; the route itself must not hold state.
4. **Validation** — return `400` with a JSON body on bad/missing input, and `404` with a JSON body when a referenced record doesn't exist. Use the existing routes as the template for exactly when each applies.
5. **Error shape** — every error response is `{ "error": "message" }`, matching the existing routes.
6. **Tests** — add cases to the matching file in `tests/` using `node:test` + `supertest`, following the existing `describe`-free flat style and the `test.beforeEach(() => store.reset())` pattern already in `tests/users.test.js`. Cover the success path and the `400`/`404` paths.
7. **Docs** — add or update the endpoint's section in `docs/api.md`, matching the format of the existing entries (method + path heading, one-line description, request/response shapes, status codes).
8. Run `npm test` and `npm run lint` before considering the work done.
