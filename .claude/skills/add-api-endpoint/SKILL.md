---
name: add-api-endpoint
description: Use when adding a new HTTP endpoint or route to this Express API, or a new resource with its own routes (for example "add DELETE /users/:id", "add a /posts resource", "add an endpoint that searches users by email"). Covers the route handler, the db/store.js helper, mounting in server.js, tests and docs/api.md. Do not use for questions about existing endpoints, test-only changes, or edits outside routes/.
---

# Adding an endpoint to the course API

This project is Express **4** (see `package.json`). When fetching docs, use the
Express 4.x pages, not 5.x. In Express 4, `req.body` is `{}` (not `undefined`)
when a request has no JSON body.

Follow every step below. `routes/users.js` and `tests/users.test.js` are the
reference examples; match their style exactly.

## 1. Data access goes through `db/store.js`

- Routes never hold state or touch arrays directly. If the endpoint needs data
  the store can't provide yet, add a helper function to `db/store.js` and
  export it from the `module.exports` object at the bottom.
- A helper that looks up a missing record returns `undefined`; the route turns
  that into a `404`.
- A new resource gets its own seed data inside `seed()`, so `reset()` restores
  it for the tests.

## 2. The route handler

- One file per resource in `routes/` (`routes/<resource>.js`), exporting an
  `express.Router()`. Add a new route to the existing file for its resource.
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Convert ids with `Number(req.params.id)`.
- Validate input first, then call the store:
  - bad or missing input → `return res.status(400).json({ error: '...' })`
  - record not found → `return res.status(404).json({ error: '<Thing> not found' })`
- Every error response is JSON in the shape `{ error: 'message' }`. Never send
  plain text or a different shape.
- Success codes: `200` with the record for reads and updates, `201` with the
  created record for creates, `204` with no body (`res.status(204).end()`) for
  deletes.
- Use `return` on every response so a handler never responds twice.

## 3. Mounting

A new resource's router is required at the top of `server.js` and mounted with
`app.use('/<resource>', <resource>Router)` next to the existing ones. A new
route in an existing file needs no change to `server.js`.

## 4. Tests

Add tests to `tests/<resource>.test.js` (create it for a new resource, copying
the imports and the `test.beforeEach(() => store.reset())` line from
`tests/users.test.js`). Use `node:test`, `node:assert` and `supertest`
against the exported `app`. Name each test after the method, path and outcome,
e.g. `'DELETE /users/:id returns 404 for a missing user'`.

Cover at least:
- the success case, checking the status code and the body
- each `400` the handler can return
- the `404` for a missing record, when the route takes an id

## 5. Docs

Add the endpoint to `docs/api.md` under its resource's `##` heading, in the
same format as the existing entries: a `### METHOD /path` heading, then one or
two sentences naming the body fields, the success status and each error status.

## 6. Check

Run `npm test` and `npm run lint`, and fix anything that fails before saying
the endpoint is done.
