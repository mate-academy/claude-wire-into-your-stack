---
name: express-route-conventions
description: Use when adding, changing or reviewing an HTTP endpoint or Express route in the routes/ folder of this course API (for example "add a DELETE /users/:id endpoint"). Covers route style, error responses, status codes, tests and docs for this repo only.
---

# Express route conventions for this API

Follow these rules for every endpoint in this repo.

## Route code (routes/<resource>.js)
- One `express.Router()` per resource, exported with `module.exports = router`.
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- All data access goes through `db/store.js`; never keep data inside the route file.
- Convert ids with `Number(req.params.id)`.
- Use single quotes, as the existing code does.

## Responses
- Errors are always JSON in the form `{ error: '<message>' }`.
- 400 for missing or invalid input, with a message like `'name and email are required'`.
- 404 when the record does not exist, with a message like `'User not found'`.
- 201 with the created object for successful POST; 200 with JSON otherwise.
- Use early `return res.status(...).json(...)` for error cases.

## Tests (tests/<resource>.test.js)
- Use `node:test`, `node:assert` and `supertest` against the exported `app`, like `tests/users.test.js`.
- Add a success test plus a 400 and/or 404 test for every new endpoint.

## Docs
- Describe every new or changed endpoint in `docs/api.md`.

## Finish
- Run `npm run lint` and `npm test`; both must pass.
