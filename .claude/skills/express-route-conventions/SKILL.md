---
description: Use when planning, adding, or changing an HTTP endpoint, route, or router in this Express API, including requests to plan a new endpoint like GET /users/search or to add validation or error handling to a route. Covers the file layout, input validation, 400/404 responses, the JSON error shape, and the rule that data goes through db/store.js.
---

# Express route conventions (this API)

Apply these when writing or planning any route in this repo.

## Layout
- One router file per resource in `routes/` (`users.js`, `health.js`). Export an `express.Router()`.
- Mount it in `server.js` under its base path, e.g. `app.use('/users', usersRouter)`.
- Routes never hold state. All reads and writes go through `db/store.js` (`listUsers`, `getUser`, `createUser`, `updateUser`). If a helper is missing, add it to `db/store.js`, not to the route.

## Input and errors
- Validate input inside the route.
  - `POST /users` requires `name` and `email`; a missing or empty field returns `400`.
  - `PUT /users/:id` is a partial update. It needs at least one of `name` or `email`, and returns `400` only when both are absent. Do not require both fields on PUT. Only the fields sent are changed.
  - Known gap: PUT checks for `undefined` only, so an empty string is accepted (see NOTES.md). Do not copy that behavior into new routes.
- Record not found: `404`.
- Error body is always JSON: `{ "error": "message" }`. Example: `res.status(404).json({ error: 'User not found' })`.
- Successful create returns `201` with the created record. Reads and updates return `200`.
- Convert ids with `Number(req.params.id)` before calling the store.

## Planning a new route
When asked to plan a route, produce the plan only, without editing files:
1. Method and path, and which router file owns it.
2. Store helper needed (existing or new).
3. Validation rules and the `400`/`404` cases.
4. The test cases to add in `tests/` (do not modify existing tests).

## Verify
- `npm run lint` and `npm test` must pass.
- Keep `docs/api.md` in sync when an endpoint is added or changed.
