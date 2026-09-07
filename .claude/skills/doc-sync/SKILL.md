---
name: doc-sync
description: Use when adding, removing, or changing an endpoint in routes/*.js (new route, changed validation, changed status codes, changed request/response shape) — updates docs/api.md and the matching tests/*.test.js cases so the API reference and test suite never drift from the actual routes. Not for unrelated code changes that don't touch routes/ or the API surface.
---

# Doc sync

This project keeps three things in lockstep for every endpoint: the route handler in `routes/`, its entry in `docs/api.md`, and its test cases in `tests/`. Whenever an endpoint's behavior changes, all three must be updated together.

## When a route is added or changed

1. Re-read the route handler and note its final behavior: method, path, required/optional fields, success status + body shape, and every error status it can return (`400` for bad input, `404` for a missing record).
2. Update `docs/api.md`:
   - Add or edit the endpoint's section under the right resource heading, following the existing style (short description, then the request/response details already used for `GET /users`, `POST /users`, etc.).
   - Keep the error-shape note (`{ "error": "message" }`) accurate — don't restate it per-endpoint unless it differs from the norm.
3. Update `tests/<resource>.test.js`:
   - Every success path and every distinct error path (each `400`/`404` case) the route can produce needs its own `test(...)` case, matching the existing pattern (`test.beforeEach(() => store.reset())`, `request(app)...`, `assert.equal`/`assert.ok`).
   - Don't remove or weaken an existing test to make the new behavior pass — update the assertion to match the new intended behavior instead.
4. Run `npm test` and `npm run lint` before considering the change done.

## When a route is removed

Remove its section from `docs/api.md` and its test cases from `tests/`, don't leave stale references behind.
