---
name: route-conventions
description: Use when adding, modifying, or planning an Express API route in this repository (files under routes/, server.js router mounts, or route-level request handling) — not for unrelated JavaScript/Node tasks outside the HTTP route layer.
---

# Route conventions

Follow these conventions for any Express route work in this repo:

- **One route file per resource** — mount it in `server.js` under its base path. Don't add routes to an unrelated resource's file.
- **All data access goes through `db/store.js`** — routes never hold state or touch storage directly.
- **Validate required input** — return `400` when required fields are missing or invalid.
- **Return `404`** when a requested record doesn't exist.
- **Error responses are JSON** in the shape `{ "error": "message" }` — match this exactly, don't invent a new error format.
- **Use correct status codes** — `201` for creates, `200` for reads/updates, `400`/`404` for errors, etc.
- **Follow nearby route and test patterns** (see `routes/users.js` and `tests/`) instead of inventing new structure, middleware, or abstractions.
