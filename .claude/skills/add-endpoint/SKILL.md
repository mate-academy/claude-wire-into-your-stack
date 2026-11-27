---
name: add-endpoint
description: Add or change an HTTP endpoint in this Express API (a new route like GET /users/:id/posts or DELETE /users/:id). Use when asked to add, create or implement an endpoint, route or API method here.
---
# Adding an endpoint to the course API

Follow these steps in order.

1. **Route file.** Put the handler in `routes/<resource>.js` (one file per resource). For a new resource, create the file exporting an `express.Router()` and mount it in `server.js` under its base path.
2. **Data access.** Read and write only through `db/store.js`. If the store has no helper for what you need, add one there (and export it); never keep state in the route.
3. **Validation and errors.** Validate the request in the route before calling the store:
   - bad or missing input -> `400`
   - record not found -> `404`
   - every error body is JSON: `{ "error": "<short message>" }`
   - success: `200` with the resource, `201` with the created resource, `204` with no body for deletes
4. **Tests.** Add tests to `tests/<resource>.test.js` using `node:test`, `node:assert` and `supertest` against `require('../server')`. Call `store.reset()` in `test.beforeEach`. Cover the success case, the `404` case and at least one `400` case.
5. **Docs.** Add the endpoint to `docs/api.md` under its resource: method and path heading, what the body needs, and every status code it returns.
6. **Check.** Run `npm test` and `npm run lint`; both must pass.

Report back with the files changed and the status codes the endpoint returns.
