---
name: add-route
description: Use when adding a new resource or endpoint to this Express API — a new route file (e.g. "add a /products resource", "add a DELETE endpoint for users") or new HTTP methods on an existing router. Scaffolds the router, validation, error format, store access, server mounting, docs, and tests the way this repo already does it.
---

# Add a route

This repo has one way of adding API surface. Follow `routes/users.js` as the reference implementation.

## Steps

1. **Store first.** Add any new data-access functions to `db/store.js`. Routes never hold state directly — everything goes through this module. If the resource is new, add its in-memory array and CRUD helpers there, and reset it inside `reset()` so tests start clean.

2. **Router file.** Create `routes/<resource>.js`:
   - `const router = express.Router();`
   - One handler per method, each with a one-line comment naming the route (`// GET /things — ...`)
   - `module.exports = router;`

3. **Validation.** Check required fields in the route handler itself (not in the store). Bad input → `400`. Missing record → `404`. Nothing else validates.

4. **Errors.** Every error response is `res.status(code).json({ error: 'message' })` — never a bare string or a different shape.

5. **Mount it.** In `server.js`, add `app.use('/<base-path>', require('./routes/<resource>'))` next to the existing mounts.

6. **Tests.** Add `tests/<resource>.test.js` mirroring `tests/users.test.js`: Node's built-in `node:test` + `supertest`, `test.beforeEach(() => store.reset())`, one test per status code path (happy path, 400, 404).

7. **Docs.** Update `docs/api.md` with the new endpoint(s): method, path, request body, response shape, status codes — same style as the existing entries.

## Don't

- Don't add a database, ORM, or persistence beyond the in-memory `db/store.js` pattern unless asked.
- Don't invent a different error shape or status code convention for "just this one route."
- Don't skip `docs/api.md` — it's hand-maintained and expected to stay in sync.
