---
name: express-route
description: How to add or change an HTTP endpoint in this Express API (routes/*.js) — the route file layout, db/store.js data access, 400/404 validation, the { "error": "message" } response shape, the matching supertest tests, and the docs/api.md entry. Use whenever the user asks to add, create, modify, or extend an API endpoint, route, or resource (e.g. "add DELETE /users/:id", "add a /posts resource", "let users be updated by email"). Not for general questions, refactors outside routes/, or tooling changes.
---

# Adding or changing an endpoint in the course API

Every endpoint in this repo follows the same pattern. Follow all five steps; a
route change is not done until the tests and docs match it.

## 1. Data access goes through `db/store.js`

- Routes never hold state. If the endpoint needs a new operation, add a helper
  to `db/store.js` (e.g. `deleteUser(id)`) and export it.
- Helpers return `undefined` when a record is missing — the route turns that
  into a `404`.
- New collections must be seeded in `seed()` so `store.reset()` restores them.

## 2. The route lives in `routes/<resource>.js`

- One file per resource, exporting an `express.Router()`.
- New resources are mounted in `server.js`: `app.use('/<resource>', router)`.
- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Parse ids with `Number(req.params.id)`.
- Use early `return res.status(...)` for error paths.

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

## 3. Status codes and errors

| Situation              | Status | Body                                   |
|------------------------|--------|----------------------------------------|
| Read / update success  | 200    | the record                             |
| Created                | 201    | the created record                     |
| Deleted                | 204    | empty                                  |
| Bad / missing input    | 400    | `{ "error": "<field> is required" }`   |
| Record not found       | 404    | `{ "error": "<Resource> not found" }`  |

Errors are **always** `{ "error": "message" }` — never a bare string, never
another key.

## 4. Tests in `tests/<resource>.test.js`

- Node's built-in runner (`node:test`, `node:assert`) plus `supertest`.
- `test.beforeEach(() => store.reset());` at the top so each test starts clean.
- Cover the happy path **and** each error path (400, 404) the route has.

```js
test('DELETE /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).delete('/users/999');
  assert.equal(res.status, 404);
});
```

## 5. Document it in `docs/api.md`

Add a `### METHOD /path` section under the resource heading, stating the
request body and every status code it can return.

## Finish

Run `npm test` and `npm run lint`; both must pass.
