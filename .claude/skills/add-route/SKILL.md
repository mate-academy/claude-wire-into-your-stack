---
name: add-route
description: Add or change an HTTP endpoint in this Express API the project's way - route in routes/<resource>.js, data only via db/store.js, 400/404 with { "error" } JSON, a supertest test, and docs/api.md updated. Use when asked to add, create, or change an endpoint, route, or API method (GET/POST/PUT/PATCH/DELETE) in this project.
---

# Adding or changing an endpoint in course-api

Follow these steps in order. Each one matches a convention the existing routes already follow.

1. **Route file.** Put the handler in `routes/<resource>.js` on the resource's `express.Router()`, with a one-line comment above it in the form `// METHOD /path — what it does.`. A brand-new resource gets a new file, mounted in `server.js` under its base path.
2. **Data only through the store.** The route never keeps state. If `db/store.js` lacks the helper you need, add one there, for example `deleteUser(id)` that returns `true` or `false`. The store's existing `reset()` must also reset anything new.
3. **Validate in the route.**
   - **ID-based routes only** (`GET`, `PUT`, `PATCH` or `DELETE` on `/<resource>/:id`): convert the id with `Number(req.params.id)`. If the record is missing, return `404` with `{ error: '<Thing> not found' }` before checking the body.
   - **Create routes** (`POST /<resource>`): there is no id and no existing record, so skip the id and 404 steps and go straight to the input check.
   - **Routes that take input** (a body or query): if the input is bad, return `400` with `{ error: '<what is required>' }`.
   - Every error body has the shape `{ "error": "message" }`, and nothing else.
4. **Status codes.** Use `201` plus the created object for a create, `200` plus the object for a read or update, and `204` with no body for a delete.
5. **Test.** In `tests/<resource>.test.js`, use `request(app)` from supertest with `test.beforeEach(() => store.reset())`. Always cover the success case. Add a 400 test only when the endpoint validates input, for example a create or update with a body. A `DELETE` or a plain `GET` has none. For ID-based routes, also cover the 404 case. Never call `listen()` in tests.
6. **Docs.** Add or update the endpoint in `docs/api.md`, under the resource heading, in the same format as the other entries.
7. **Check.** Run `npm test` and `npm run lint`. Both must pass. The project's lint hook also runs on every edited `.js` file.
