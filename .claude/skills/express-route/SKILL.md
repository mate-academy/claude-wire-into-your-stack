---
name: express-route
description: Use when adding or changing an Express route or endpoint in this API (new resource, new GET/POST/PUT/DELETE handler, input validation, 400/404 error responses). Applies the project's route, store, error-format and test conventions.
---

# Writing a route in this API

Follow the conventions in CLAUDE.md. Use `routes/users.js` as the reference.

1. **One file per resource** in `routes/<resource>.js`, exporting an Express router. Mount it in `server.js` under its base path.
2. **Data goes through `db/store.js`.** Add helpers there (and export them, including any state in `reset()`); routes never hold state.
3. **Validate input in the route.** Missing/invalid input -> `400`; missing record -> `404`. Convert `req.params.id` with `Number(...)`.
4. **Errors are JSON** shaped exactly `{ "error": "message" }` — no plain text, no extra fields.
5. **Success codes:** `200` read/update, `201` create (return the created record).
6. **Add tests** in `tests/<resource>.test.js` using `node:test` + `supertest`, with `test.beforeEach(() => store.reset())`. Cover success, `400` and `404`.
7. **Finish by running** `npm test` and `npm run lint`, and document the endpoint in `docs/api.md`.
