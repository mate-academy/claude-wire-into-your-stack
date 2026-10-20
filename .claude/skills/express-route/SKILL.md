---
name: express-route
description: Add or change an Express route or endpoint in this course API following the project's conventions. Use when asked to add a new endpoint, a new resource, or a new HTTP method (GET, POST, PUT, PATCH, DELETE) under routes/.
---

# Adding a route to this API

Follow these steps exactly, in order.

1. **Router file.** One file per resource in `routes/<resource>.js` that exports an `express.Router()`. If the resource is new, create the file and mount it in `server.js` with `app.use('/<resource>', <resource>Router);`.
2. **Data access.** Never hold state in the route. Add any read/write helper to `db/store.js`, export it, and call it from the route. Make sure `reset()` restores the seed data for the new resource too.
3. **Validation and status codes.**
   - Bad or missing input → `400`
   - Record not found → `404`
   - Created → `201` with the created object
   - Deleted → `204` with no body
   - Otherwise → `200` with JSON
4. **Error shape.** Every error is `res.status(code).json({ error: '<short message>' })`. No plain-text errors, no other keys.
5. **Comment.** Put a one-line comment above each handler: `// METHOD /path — what it does.`
6. **Tests.** In `tests/<resource>.test.js` (node:test + supertest, `store.reset()` in `beforeEach`), add one test for the success case and one for each error status the route can return.
7. **Docs.** Add the endpoint to `docs/api.md` in the same format as the existing entries.
8. **Verify.** Run `npm test` and `npm run lint`; both must pass before you report back.

When done, reply with: the files changed, the new endpoint(s), and the test/lint result.
