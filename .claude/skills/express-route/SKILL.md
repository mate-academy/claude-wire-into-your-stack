---
name: express-route
description: Use when adding, changing, or testing an HTTP endpoint in this Express API (a route under routes/, e.g. "add a DELETE /users/:id endpoint", "add a /posts resource", "add validation to POST /users"). Applies the project's route, store, error-format, test and docs conventions. Not for edits unrelated to routes such as README text, lint config or CI.
---

# Writing a route in the Course API

Every endpoint in this repo is built the same way. Follow all five steps — a route
isn't done until the store, the test and the docs match it.

## 1. Data access goes through `db/store.js`
- Routes never hold state. If the endpoint needs a new operation, add a helper to
  `db/store.js` (e.g. `deleteUser(id)`) and export it.
- Helpers return the record, or `undefined` when it doesn't exist — let the route
  decide the status code.
- Keep `seed()`/`reset()` working so tests start clean.

## 2. The route lives in `routes/<resource>.js`
- One file per resource, exporting an `express.Router()`.
- New resource? Create the file and mount it in `server.js`:
  `app.use('/<resource>', <resource>Router);`
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`.

## 3. Validate, then respond with the project's status codes
| Situation | Status | Body |
|---|---|---|
| Missing/invalid input | `400` | `{ "error": "<field> is required" }` |
| Record not found | `404` | `{ "error": "<Thing> not found" }` |
| Created | `201` | the created record |
| Deleted | `204` | no body (`res.status(204).end()`) |
| Success otherwise | `200` | the record or array |

Errors are **always** JSON shaped `{ "error": "message" }` — never plain text,
never another key. Use `return res.status(...)` so a handler can't respond twice.

```js
// DELETE /users/:id — remove a user, or 404 if it doesn't exist.
router.delete('/:id', (req, res) => {
  const removed = store.deleteUser(Number(req.params.id));
  if (!removed) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).end();
});
```

## 4. Test it in `tests/<resource>.test.js`
- Use `node:test`, `node:assert` and `supertest` against `require('../server')`.
- Keep `test.beforeEach(() => store.reset());` at the top.
- Cover the happy path **and** each error status the route can return (400/404).

## 5. Document it in `docs/api.md`
Add a `### METHOD /path` entry under the resource heading listing the body it
takes and every status it returns.

## Done means
`npm run lint` and `npm test` both pass.
