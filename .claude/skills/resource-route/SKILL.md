---
name: resource-route
description: Adds or changes an HTTP resource in this Express API — a new route file, store helpers, tests, and the error shape this project already uses. Use when the user asks for a new resource, a new route, an endpoint, a router, or to add GET, POST, PUT, or DELETE on this API.
---

# Resource route

This project keeps one Express router per resource.

## Layout

- Put the router in `routes/<resource>.js` and export it.
- Mount it in `server.js` under `/<resource>`.
- Add or extend helpers in `db/store.js`. Routes never hold their own list of records.
- Cover the behaviour in `tests/<resource>.test.js` with Node's test runner and supertest, against the exported `app`. Reset store state in `beforeEach` the way `tests/users.test.js` already does.

## Requests and errors

- Parse ids with `Number(...)`.
- Validate in the route. Missing required fields → `400`. Missing record → `404`.
- Error bodies are always `{ "error": "message" }`.
- Create returns `201` and the new record.

## Style

- Reuse the patterns in `routes/users.js` and `routes/health.js`. Do not invent a second way to talk to data or to send errors.
- Stay in the files this resource needs. Do not reformat unrelated files.
