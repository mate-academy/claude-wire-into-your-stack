---
name: express-route
description: Use when adding, changing or removing an HTTP endpoint/route in this Express API (files in routes/, mounting in server.js) — e.g. "add a DELETE /users/:id endpoint", "add a /products resource". Covers the route pattern, validation, error format, tests and docs/api.md. Not for config, CI or non-route changes.
---

# Writing a route in Course API
1. One router file per resource in `routes/<resource>.js`, exported via `module.exports = router`; mount it in `server.js` under its base path.
2. Never keep state in the route — read/write only through helpers in `db/store.js` (add a helper there if needed, and reset it in `reset()`).
3. Validate input in the handler: bad input → `400`, missing record → `404`.
4. Every error is JSON `{ "error": "message" }`; success uses `res.json` / `res.status(201).json`.
5. Comment each handler like `// METHOD /path — what it does.`
6. Add tests in `tests/<resource>.test.js`: `node:test` + `node:assert` + `supertest`, `test.beforeEach(() => store.reset())`, cover success, 400 and 404.
7. Document the endpoint in `docs/api.md` in the existing format.
8. Finish with `npm test` and `npm run lint`.