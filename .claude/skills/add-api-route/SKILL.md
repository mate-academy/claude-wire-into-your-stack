---
name: add-api-route
description: Add or change an Express REST endpoint in this course API (routes/*.js). Use when asked to add a new route, endpoint or resource (GET/POST/PUT/DELETE), or to change how an existing endpoint validates input or returns errors.
---

# Add an API route the way this project does it

1. Put the handler in the resource's file in `routes/` (one file per resource). For a new resource, create `routes/<resource>.js` exporting an `express.Router()` and mount it in `server.js` under `/<resource>`.
2. Start each handler with a one-line comment: `// METHOD /path — what it does.`
3. Read and write data only through `db/store.js`. If the store has no helper for the operation, add one there and export it; never keep state in the route.
4. Validate `req.body` / `req.params` first. On bad input: `return res.status(400).json({ error: '<field> is required' })`.
5. When a record is missing: `return res.status(404).json({ error: '<Resource> not found' })`.
6. Success: `res.json(...)`, or `res.status(201).json(...)` when creating.
7. Add tests in `tests/<resource>.test.js` using `node:test` + `supertest` against `require('../server')`: one for success, one for 400, one for 404.
8. Document the endpoint in `docs/api.md` in the same format as the others.
9. Run `npm test` and `npm run lint` before finishing.
