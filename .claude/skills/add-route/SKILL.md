---
name: add-route
description: Use when adding a new API route/endpoint to this Express project (e.g. "add a route for X", "create a DELETE endpoint", "new resource: orders"). Not for editing existing routes, unrelated bug fixes, or non-HTTP changes.
---

# Adding a new API route

Workflow for adding a new route/endpoint to this Express project, following the conventions in `CLAUDE.md`.

## 1. Determine the resource

Decide whether the new route belongs in an existing router (`routes/<resource>.js`) or needs a new file. Follow the "one route file per resource" convention — don't add unrelated resources to an existing router file.

## 2. New resource: scaffold the router file

If this is a new resource, create `routes/<resource>.js` exporting an Express `Router()`, mirroring the structure of `routes/users.js` (e.g. `routes/health.js` for a minimal example).

## 3. Data access

All reads/writes go through `db/store.js`. Routes never hold state directly. If the resource needs new store methods, add them to `db/store.js` rather than inlining data logic in the route handler.

## 4. Validation and error responses

- Bad input → `400`
- Missing record → `404`
- Error responses are JSON in the shape `{ "error": "message" }`

## 5. Mount the router

If this is a new router file, mount it in `server.js` under its base path: `app.use('/<base-path>', <resource>Router)`.

## 6. Tests

Add or extend a test file using Node's built-in `--test` runner, following the style of `tests/users.test.js`. Cover:
- The success path
- The `400` validation case
- The `404` missing-record case (if applicable)

## 7. Verify

Before considering the route done, run:
- `npm test`
- `npm run lint`
