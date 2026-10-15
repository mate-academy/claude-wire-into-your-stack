---
name: add-express-route
description: Use when adding, creating, or scaffolding a new route or endpoint in this Express API (files under routes/, mounted in server.js) so it follows the project's validation, data-access, and error-response conventions. Not for unrelated changes (docs-only edits, non-route refactors, front-end work).
---

Adding a route to this project always follows the same shape. Apply it every time, without being asked for it explicitly:

1. **One file per resource.** If the resource already has a file in `routes/`, add the new route there next to the existing ones. Only create a new file for a genuinely new resource, and mount it in `server.js` under its base path (`app.use('/<resource>', <resource>Router)`).
2. **All data access goes through `db/store.js`.** Routes never hold or mutate state directly — add or reuse a helper function in `store.js` and call it from the route. If the helper doesn't exist yet, add it there, not inline in the route.
3. **Validate input in the route.** Missing or malformed required fields return `400` before touching the store.
4. **Missing records return `404`**, not a thrown error or a 500 — check the store's return value (e.g. `undefined`) and respond accordingly.
5. **Error responses are always JSON in the shape `{ "error": "message" }`** — match the wording style already used in sibling routes (e.g. `"name and email are required"`, `"User not found"`).
6. **Add a test** in `tests/` following the existing pattern: `test.beforeEach(() => store.reset())`, then use `supertest` to hit the route and assert both the success path and the 400/404 paths.
7. **Update `docs/api.md`** with the new endpoint: method, path, request body (if any), and response codes, matching the style already used for the other endpoints there.

Skip any step only if it's genuinely inapplicable (e.g. a route with no body has nothing to validate) — don't skip it to save time.
