---
name: new-route
description: Use when adding or changing an Express route or resource endpoint in this API (e.g. "add a /posts endpoint", "add DELETE /users/:id"). Encodes this project's route, validation, error-format, and test conventions.
---

# Writing a route in this project

1. **One file per resource** in `routes/<resource>.js`, exporting an Express `Router`. Mount it in `server.js` under its base path.
2. **Data access only through `db/store.js`** — add helper functions there; routes never hold state.
3. **Validate input in the route**: return `400` on bad input, `404` when a record is missing. Convert `:id` with `Number(req.params.id)`.
4. **Errors are JSON** shaped `{ "error": "message" }`. Use `201` for creates.
5. **Add tests** in `tests/<resource>.test.js` using `node:test` + `supertest`, covering success, `400`, and `404` cases.
6. **Update `docs/api.md`** with the new endpoint.
7. Finish by running `npm test` and `npm run lint`.

Use `routes/users.js` as the reference implementation.
