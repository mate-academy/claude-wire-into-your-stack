---
description: Adding a new Express route or resource to this API — triggered when the user asks to add a route, add an endpoint, scaffold a resource, or create a new router file.
---

# Add Route Skill

Follow these steps when adding a new route to this project:

1. Create `routes/<resource>.js` exporting an Express router.
2. Mount it in `server.js` under its base path: `app.use('/<resource>', require('./routes/<resource>'))`.
3. All data access goes through `db/store.js` — never hold state in the route file.
4. Validate required fields in the route handler; return `400` with `{ "error": "message" }` on bad input.
5. Return `404` with `{ "error": "message" }` when a record is not found.
6. Mirror the test structure in `tests/<resource>.test.js`: import `app` and `store`, call `store.reset()` in `beforeEach`, and cover at minimum: list, get-missing, create, update, update-missing.
