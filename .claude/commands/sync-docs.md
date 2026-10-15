---
description: Sync docs/api.md with the actual routes in routes/
---

Read every file in `routes/` and compare it against `docs/api.md`. Then update `docs/api.md` so it accurately reflects every endpoint currently defined in the routes.

For each route handler found in `routes/`, determine:
- HTTP method and path (combine the router's mount path from `server.js` with the route's own path, e.g. `router.delete('/:id')` mounted at `/users` → `DELETE /users/:id`)
- Required request fields (from validation checks in the handler, e.g. `if (!name || !email)` → requires `name` and `email`)
- Every response status code the handler can return, and what each one means (success body shape, `400` conditions, `404` conditions, etc.)
- The error response shape, which is always `{ "error": "message" }` per project convention

Then edit `docs/api.md` so that:
- Every endpoint that exists in `routes/` has a corresponding section in `docs/api.md`, grouped under its resource (matching the existing `## Health` / `## Users` style).
- Each endpoint's description accurately lists required fields and every status code it can return, matching the current handler code exactly — not assumptions from a previous version of the doc.
- Any endpoint documented in `docs/api.md` that no longer exists in `routes/` is removed.
- Formatting and tone match the existing doc (short prose per endpoint, `### METHOD /path` headings, fenced JSON examples where the doc already uses them).

Do not invent endpoints, fields, or status codes that aren't actually in the code. If a route file exists but isn't mounted in `server.js`, note that discrepancy instead of documenting it as live.

After updating, show a brief summary of what changed (added/removed/corrected endpoints).
