---
name: add-endpoint
description: Use when adding, changing, or removing an HTTP endpoint or resource in this Express API (routes/, db/store.js, server.js), e.g. "add a DELETE /users/:id", "add a /posts resource", "add validation to PUT". Covers the route, store helper, mounting, tests and docs/api.md together. Not for lint, CI, or non-API changes.
---

# Add or change an API endpoint

Every endpoint change in this project follows the same six steps: it touches the same five places (steps 1–5), then gets verified (step 6). Work through all six. A change is not done until each step below is handled.

## 1. Route — `routes/<resource>.js`
- One file per resource, exporting an `express.Router()`.
- New resource: mount it in `server.js` with `app.use('/<resource>', router)`, next to the existing mounts.
- Put a one-line comment above each handler: `// METHOD /path — what it does.`

## 2. Data — `db/store.js`
- Routes never hold state. All reads and writes go through a store helper.
- Add the helper (e.g. `deleteUser(id)`) and include it in `module.exports`.
- Return `undefined` when a record is missing, so the route can send a 404.
- When updating, only change fields that are `!== undefined`.
- New collection: add it to `seed()` so `reset()` restores it for tests.

## 3. Validation and responses
- Parse ids with `Number(req.params.id)`. A non-numeric id finds no record and returns 404.
- Bad or missing body fields → `return res.status(400).json({ error: '<field> is required' })`.
- Missing record → `return res.status(404).json({ error: '<Resource> not found' })`.
- Create → `201` with the created record. Read and update → `200`. Delete → `204` with no body.
- Every error body has the shape `{ "error": "message" }`. Always `return` the response.

## 4. Tests — `tests/<resource>.test.js`
Follow [reference/test-template.md](reference/test-template.md). Cover the success status and every `400` and `404` branch you added.

## 5. Docs — `docs/api.md`
Add a `### METHOD /path` entry under the resource's `##` section. Say what it does and list every status code it can return.

## 6. Verify
Run `npm run lint && npm test`. Both must pass.
