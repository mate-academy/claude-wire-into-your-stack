---
name: express-route
description: Create or modify Express API routes in this project, following its router structure, db/store.js data access pattern, JSON error format, input validation, and API conventions. Use when implementing a new endpoint or changing an existing route.
---

# Express Route Development

When creating or modifying an API route in this project:

1. Put resource-specific routes in `routes/<resource>.js`.
2. Export an Express router using `express.Router()`.
3. Mount new resource routers in `server.js` under their base path.
4. Access and modify data only through helpers in `db/store.js`. Never keep application data in route files.
5. Validate request input in the route handler.
6. Return JSON error responses in the format `{ "error": "message" }`.
7. Return `400` for invalid input and `404` when a requested record does not exist.
8. Use `201` when creating a resource and `200` for successful reads or updates.
9. Add or update API documentation in `docs/api.md`.
10. Add tests in `tests/` using Node's built-in test runner and Supertest.

Before finishing, run `npm test` and `npm run lint`.
