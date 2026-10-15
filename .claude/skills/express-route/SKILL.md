---
name: express-route
description: Use when adding, changing, or removing an Express route/endpoint in this API (files under routes/, or a new resource that needs one) — including writing or updating its test file under tests/. Covers this project's route-handler shape, db/store.js data access, input validation, and the { "error": "message" } response format. Trigger on requests like "add a route", "add an endpoint", "add a DELETE/PATCH for X", "new resource", "add a store method for X", or "write a test for this route" — not for unrelated work like docs-only edits, CI config, or non-Express code.
---

# Writing an Express route in this API

This project (`course-api`) has one consistent shape for every route, its data
access, and its test. Follow the existing files — `routes/users.js`,
`db/store.js`, `tests/users.test.js` — as the reference implementation.
Don't invent a different structure (no controllers folder, no response
wrapper object, no separate validation library).

## 1. Data access goes through `db/store.js` — never inline state

Routes never hold or mutate arrays/objects directly. All reads and writes go
through plain exported functions in `db/store.js`:

```js
function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return user;
}
```

If a route needs new data behavior, add a function to `db/store.js` first
(`listX`, `getX`, `createX`, `updateX`, following the existing naming), then
call it from the route. `store.reset()` must keep reseeding correctly — it's
what tests call between cases.

## 2. Route handler shape

One file per resource in `routes/`, exporting an `express.Router()`, mounted
in `server.js` under its base path (`app.use('/users', usersRouter)`). Inside
the file:

- A one-line comment above each handler: `// METHOD /path — what it does.`
- Validate input first; on bad input, stop early:
  ```js
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  ```
- Look the record up through the store; on a missing record:
  ```js
  const user = store.getUser(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  ```
- On success, return the resource directly as JSON — no wrapper object.
  `res.json(user)` for reads/updates, `res.status(201).json(user)` for
  creates.
- Use `return res.status(...).json(...)` for every branch (including the
  success path in handlers with multiple returns), so nothing falls through.

## 3. Error format is always `{ "error": "message" }`

Every error response in this API — 400 or 404 — is a JSON object with a
single `error` string field. Never nest it, never add extra fields, never
return an array or plain string.

## 4. Test file shape

Add or extend `tests/<resource>.test.js`, mirroring `tests/users.test.js`:

- `node:test` + `node:assert` + `supertest`, importing `app` from
  `../server` and `store` from `../db/store`.
- `test.beforeEach(() => store.reset())` at the top so every test starts
  from clean seed data.
- One `test(...)` per behavior, named `"METHOD /path does X"`
  (e.g. `'DELETE /users/:id removes an existing user'`).
- Assert the status code and the relevant body fields — not the whole
  object verbatim unless the test is specifically about shape.
- Cover both the success path and the 400/404 paths for anything that
  validates input or looks up a record.

## 5. Wire it up

- Mount new resource routers in `server.js`:
  `const xRouter = require('./routes/x'); app.use('/x', xRouter);`
- Update `docs/api.md` with the new endpoint, matching its existing terse
  style (method + path heading, one-line description, status codes).
- Run `npm run lint` and `npm test` before considering the change done.
