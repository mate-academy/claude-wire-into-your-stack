---
name: express-route
description: "Adds or changes an Express route in this API following the project's conventions. Use when asked to add a new endpoint, route or resource (GET/POST/PUT/DELETE), or to change how a route validates input or returns errors."
---

# Express route in this API

Conventions taken from `routes/users.js`, `routes/health.js`, `server.js`, `db/store.js`, `tests/users.test.js` and `docs/api.md`.

## 1. Where the code goes

- One router file per resource: `routes/<resource>.js` (e.g. `routes/users.js`).
- The file creates `const router = express.Router();`, defines handlers with `router.get/post/put(...)`, and ends with `module.exports = router;`.
- Paths inside the router are relative: `'/'` for the collection, `'/:id'` for one record.
- Put a short comment above each handler with the method, path and what it does, as the existing files do (e.g. `// PUT /users/:id — update an existing user.`).

## 2. Data access

- Routes never hold state. All reads and writes go through `db/store.js`.
- If the resource or operation is new, add the function in `db/store.js` (e.g. `deleteUser`) and add it to `module.exports`.
- Keep `reset()` working: the store's seed data is what tests reset to, so new in-memory collections must be re-seeded inside `seed()`.

## 3. Input validation

- Validate in the route, before calling the store.
- Missing required fields → `400`. Example from POST: `if (!name || !email) return res.status(400).json(...)`.
- For partial updates (PUT), reject only when no updatable field is present: `name === undefined && email === undefined` → `400`.
- Ids come from `req.params.id` and are converted with `Number(...)`. Look up the record before changing it.

## 4. Status codes and error format

- `200` for successful reads and updates: `res.json(body)`.
- `201` for successful creates: `res.status(201).json(created)`.
- `400` for bad input, `404` when the record is missing: `res.status(404).json({ error: 'User not found' })`.
- Every error body is exactly `{ "error": "message" }`. Never send plain text errors.
- Use `return res.status(...).json(...)` in error branches so the handler stops.
- Success bodies are the record or array as JSON, not wrapped in an envelope.

## 5. Mounting in `server.js`

- Add `const <name>Router = require('./routes/<resource>');` with the other requires at the top.
- Add `app.use('/<resource>', <name>Router);` next to the existing `app.use` lines.
- Do not add logic to `server.js`.

## 6. Tests

- Test file: `tests/<resource>.test.js`. Existing tests use `node:test`, `node:assert`, and `supertest`.
- Header pattern:
  ```js
  const test = require('node:test');
  const assert = require('node:assert');
  const request = require('supertest');
  const app = require('../server');
  const store = require('../db/store');

  test.beforeEach(() => store.reset());
  ```
- Each test: `const res = await request(app).<method>('/path').send({...});` then `assert.equal(res.status, ...)` and assertions on `res.body`.
- Cover at least: the success case, a `400` for bad input, and a `404` for a missing id (where the route takes an id).
- Run `npm test`.

## 7. Documentation

- `docs/api.md` must be updated for every new or changed route. Under the resource's section, add a `### METHOD /path` heading with:
  - what it does,
  - the required or optional body fields,
  - the success status and body,
  - the `400` and `404` cases that apply.
- If you add a resource, add its section too, with an example object like the existing `A user looks like:` block.

## 8. Checks before finishing

- `npm test` passes.
- `npm run lint` passes (lint covers `server.js`, `routes`, `db`, and `tests`).
- `docs/api.md` matches the code.
- Do not change unrelated routes.

## Notes

- There is no `DELETE` route yet. Add one by following the steps above: `router.delete('/:id', ...)`, `404` when missing, a success status and body you document (e.g. `204` with no body, or `200` with the deleted record), plus a `deleteX` function in the store.
- Existing inconsistency: POST rejects falsy values (`!name`), so an empty string counts as missing; PUT only checks `=== undefined`, so an empty string is accepted. Follow POST's style for new required fields unless the task says otherwise, and mention the difference in your summary.
- `Number(req.params.id)` does not reject non-numeric ids; they simply produce `404`. Keep that behavior unless asked to change it.
