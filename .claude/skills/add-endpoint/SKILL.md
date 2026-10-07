---
name: add-endpoint
description: Use when adding, changing, or removing an HTTP endpoint or resource in this Express API — requests like "add DELETE /users/:id", "add a /posts resource", "make PUT /users/:id reject invalid emails", "return 400 for a bad id". Walks through the store helper, the route handler with 400/404 + { error } responses, mounting in server.js, supertest tests, and docs/api.md. Not for lint/CI config, dependency updates, or questions that only explain existing code.
---

# Adding or changing an endpoint in Course API

Every endpoint change in this repo touches the same layers in the same order.
Follow them all — a route without its test and docs entry is not done.

## 1. Data access — `db/store.js`

Routes never hold state. If the endpoint needs data the store can't provide
yet, add a helper here first and add it to the `module.exports` object at the
bottom.

- Look up records with `getUser(id)`-style helpers; ids are numbers.
- Return `undefined` (not throw) when a record is missing — the route turns
  that into a `404`.
- New collections must also be re-seeded in `seed()` so `reset()` keeps tests
  isolated.

```js
function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  const [removed] = users.splice(index, 1);
  return removed;
}
```

## 2. Route handler — `routes/<resource>.js`

One file per resource, exporting an Express router via `module.exports = router`
(the project is CommonJS — keep `require`/`module.exports`).

- Put a one-line comment above each handler: `// METHOD /path — what it does.`
- Parse path ids with `Number(req.params.id)`.
- Validate input in the route. Bad or missing input → `400`.
- Missing record → `404`.
- Every error body is exactly `{ error: 'message' }` — no other shape.
- Success codes: `200` read/update, `201` + created record for create,
  `204` with no body for delete.
- Always `return res...` in branches so a handler never responds twice.

```js
// DELETE /users/:id — remove a user, or 404 if it doesn't exist.
router.delete('/:id', (req, res) => {
  const user = store.deleteUser(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).end();
});
```

## 3. Mounting — `server.js`

A brand-new resource gets `require`d and mounted under its base path next to
the existing ones: `app.use('/posts', postsRouter);`. Existing resources need
no change here.

## 4. Tests — `tests/<resource>.test.js`

Node's built-in runner (`node:test` + `node:assert`) with `supertest` against
the exported `app`. Keep `test.beforeEach(() => store.reset());` at the top.

For each endpoint cover at least:
- the happy path (status + key body fields),
- every `400` branch you added,
- the `404` for a missing record (use id `999`).

```js
test('DELETE /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).delete('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});
```

## 5. Docs — `docs/api.md`

Add or update the endpoint's section under its resource heading, in the same
style: `### METHOD /path`, one sentence on what it does, then every status code
it can return.

## 6. Verify

Run `npm test` and `npm run lint`. Both must pass before you report the change
as done; show the actual output if either fails.
