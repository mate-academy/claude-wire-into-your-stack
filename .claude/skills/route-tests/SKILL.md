---
name: route-tests
description: Use when the user asks to write, add, or update tests for an Express route or endpoint in this repo (e.g. "add tests for the DELETE /users/:id route", "test the new endpoint"). Not for general test questions unrelated to a route in this project.
---

# Route tests in this repo

This project's routes are tested with Node's built-in test runner and `supertest`, following one shared pattern (see `tests/users.test.js`).

When writing tests for a route:

1. Put the file in `tests/`, named `<resource>.test.js`.
2. Import `node:test`, `node:assert`, `supertest` via `request(app)`, and `../server`.
3. Reset shared state before each test: `test.beforeEach(() => store.reset())` — the in-memory store in `db/store.js` persists across tests otherwise.
4. One `test(...)` per behavior, named as a plain-English sentence describing the case (e.g. `'PUT /users/:id returns 404 for a missing user'`).
5. Assert both the HTTP status and the relevant response body fields — never just the status code.
6. Cover the route's documented cases from `docs/api.md`: the success path, the `400` for missing/invalid input, and the `404` for a missing record, matching the `{ "error": "message" }` shape used across the API.
