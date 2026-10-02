---
name: route-conventions
description: Use when adding, writing, or modifying an Express route/endpoint in this repo (routes/*.js) — enforces this project's conventions for router structure, data access, input validation, and error response shape.
---

# Route conventions for this repo

Apply these rules whenever you add or change a route in `routes/`:

- One router file per resource (e.g. `routes/users.js`), exporting an `express.Router()`. Mount it in `server.js` under its base path — don't add resource logic directly to `server.js`.
- All data access goes through `db/store.js`. Routes never hold state directly or reach into another module's internals.
- Validate input in the route handler:
  - Return `400` with a JSON body when required fields are missing or malformed.
  - Return `404` with a JSON body when a referenced record doesn't exist.
- Error responses are always JSON in the shape `{ "error": "message" }` — never a bare string or HTML.
- Success responses return the resource (or list of resources) as JSON, with `201` for creation and `200` otherwise.

Follow the existing pattern in `routes/users.js` as the reference implementation.
