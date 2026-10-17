---
name: express-route
description: Use when adding or modifying an Express route/endpoint in routes/ of this API — enforces one router file per resource, data access via db/store.js, 400/404 validation, and JSON error shape.
---

When writing or changing a route in this project:
1. One file per resource in `routes/`, exporting an Express router; mount it in `server.js` under its base path.
2. Never hold state in the route — read/write only through `db/store.js`.
3. Validate input in the route: return `400` on bad input, `404` when a record is missing.
4. Errors are always JSON: `{ "error": "message" }`.
5. Add/extend tests in `tests/<resource>.test.js` (Node built-in test runner), covering success, 400, and 404.
6. Run `npm test` and `npm run lint` before finishing.