---
name: writing-routes
description: How to add or change an HTTP route in this Express Course API so it matches the repo's conventions. Use this whenever the user wants to add, modify, or remove an endpoint, route, handler, or resource — e.g. "add a DELETE /users/:id", "create a /posts resource", "let users be filtered by email", "add pagination to GET /users" — or any change touching files in routes/, even when they don't mention this skill or the word "route". Covers the required pattern: one router file per resource mounted in server.js, all data access through db/store.js, Number(...) id coercion, 400/404 validation, the { error } JSON shape, and a matching test.
---

# Writing routes in the Course API

Every route in this repo follows the same shape on purpose: handlers stay thin, all state lives behind one module, and tests stay trivial to write. Match this pattern so the codebase stays predictable and a future swap to a real database touches only `db/store.js`.

## The request flow

```
HTTP request → routes/<resource>.js handler → db/store.js helper → in-memory state
```

A handler does three things and nothing more: **validate input**, **call a store helper**, **shape the response**. It never reads or mutates data directly — that's the store's job.

## Steps to add or change a route

1. **Add the data operation to `db/store.js` first.** New behavior that reads or writes data is a new exported helper there, operating on the module-level `users`/`nextId` state. Return the record (or `undefined`/`false` when there's nothing to act on) so the handler can decide the status code. Add the helper to the `module.exports` object.

2. **Write the handler in the resource's router file** (`routes/<resource>.js`), on the shared `express.Router()`. Put a one-line comment above it naming the method and path, matching the existing handlers:
   ```js
   // DELETE /users/:id — remove a user, or 404 if it doesn't exist.
   ```

3. **For a brand-new resource, create `routes/<resource>.js` and mount it in `server.js`** under its base path, next to the existing mounts:
   ```js
   app.use('/posts', postsRouter);
   ```
   Existing resources just get another handler in their current file — don't add a new mount.

4. **Coerce `:id` params with `Number(...)`** before passing them to the store: `store.getUser(Number(req.params.id))`. The store matches ids with `===` against numeric ids, so a string id silently finds nothing — this is the repo's most common route bug.

5. **Add a test** in `tests/` for the new behavior: `node:test` + `node:assert` + supertest, importing the app from `../server`. Cover the success path and each error path (`400`, `404`). The suite already resets the store in `beforeEach`, so seeded data is available.

## Conventions (and why they matter)

- **Validate at the boundary, return early.** Check required fields in the handler and `return res.status(400).json(...)` on bad input; `return res.status(404).json(...)` when the store reports the record is missing. Early returns keep the happy path unindented and unambiguous.
- **Error responses are always `{ "error": "message" }`** — clients depend on that single shape, so don't invent `{ message }` or bare strings.
- **Status codes:** `200` via `res.json(...)` for reads and updates, `201` for a successful create, `400` for invalid/missing input, `404` for a missing record. Use `204` + `res.status(204).end()` for a delete with no body.
- **CommonJS throughout** — `require`/`module.exports`, no ESM. Match the surrounding files.

## Worked example: DELETE /users/:id

**`db/store.js`** — add the helper and export it:
```js
function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, reset };
```

**`routes/users.js`** — add the handler:
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

**`tests/users.test.js`** — cover both paths:
```js
test('DELETE /users/:id removes a user', async () => {
  const res = await request(app).delete('/users/1');
  assert.equal(res.status, 204);
  const after = await request(app).get('/users/1');
  assert.equal(after.status, 404);
});

test('DELETE /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).delete('/users/999');
  assert.equal(res.status, 404);
});
```

That's the whole shape: store helper → thin handler → test. Reuse it for every new route.
