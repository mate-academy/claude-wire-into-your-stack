---
description: Scaffold a new Course API resource (route, store helpers, tests, docs)
argument-hint: <resource-name>
---

Scaffold a new resource named `$ARGUMENTS` for this Course API.

Follow project conventions from CLAUDE.md and the express-route skill:

1. Add store helpers in `db/store.js` (list/get/create at minimum; reset-friendly seed data if useful).
2. Create `routes/$ARGUMENTS.js` as an Express router with:
   - `GET /` list
   - `GET /:id` (404 when missing)
   - `POST /` with validation (400 on bad input)
3. Mount it in `server.js` at `/$ARGUMENTS`.
4. Add `tests/$ARGUMENTS.test.js` using `node:test`, `supertest`, and `store.reset()` in `beforeEach`.
5. Document the endpoints in `docs/api.md`.

Do not invent unrelated features. Keep error bodies as `{ "error": "message" }`. After scaffolding, run `npm test` and fix anything that fails.
