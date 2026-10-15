---
name: express-route-conventions
description: Use when adding, changing, or reviewing an Express route/endpoint in this repo (routes/*.js) — covers how to structure the router, validate input, handle missing records, and shape error responses so it matches the rest of the API. Not for unrelated JS changes, tests-only edits, or non-HTTP code.
---

# Express route conventions

This project is a small Express API (see the root `CLAUDE.md`). Every route in
`routes/` follows the same shape — match it exactly rather than inventing a new
style.

## Structure

- One file per resource in `routes/`, exporting an `express.Router()`.
- Mount the router in `server.js` under its base path (`app.use('/<resource>', <resource>Router)`).
- Routes never hold state. All reads/writes go through the helpers in `db/store.js` — add a new helper there rather than mutating data in the route.

## Validation and status codes

- Bad or missing input → `400`.
- A record that doesn't exist → `404`, not a thrown error or a crash.
- Successful reads/updates → `200`; successful creates → `201`.

## Error shape

Every error response is JSON in exactly this shape:

```json
{ "error": "message" }
```

Match the terse, lowercase phrasing already used (`"name and email are required"`,
`"User not found"`) — no stack traces, no nested error objects.

## Tests

- Tests live in `tests/`, use Node's built-in `node:test` + `supertest` against
  the exported `app` (not a listening server).
- Call `store.reset()` in `test.beforeEach` so each test starts from the seeded
  data in `db/store.js`.

## Docs

If the route's request/response shape changes, update `docs/api.md` to match —
it's the source of truth referenced elsewhere in this repo (and via the `docs`
MCP server).
