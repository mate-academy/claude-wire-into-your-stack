---
name: api-endpoint
description: Use when adding, changing or removing an HTTP endpoint or resource in this Express API (routes/, db/store.js). Covers the store function, route handler with 400/404 validation and { error } responses, mounting in server.js, supertest tests, and the docs/api.md entry. Not for config, CI, or Claude setup changes.
---

# Adding or changing an API endpoint

Work through every step. An endpoint isn't done until tests and docs match it.

1. **Store**: add a function in `db/store.js` and add it to `module.exports`. Missing records return `undefined`; never throw.
2. **Route**: add a handler in `routes/<resource>.js`:
   - convert ids with `Number(req.params.id)`
   - check the input and return `400 { error }` on bad input
   - call the store and return `404 { error: '<Resource> not found' }` when it returns `undefined`
   - put a `// METHOD /path — description` comment above the handler
3. **Mount**: mount a new resource's router in `server.js` under its base path.
4. **Tests**: in `tests/<resource>.test.js`, use supertest against `app` with `store.reset()` in `beforeEach`. Cover every status code the handler can return (200/201, 400, 404). Name tests `'<METHOD> <path> <behaviour>'`.
5. **Docs**: update `docs/api.md` with a `### METHOD /path` entry listing the body fields and every status code.
6. **Verify**: run `npm run lint` and `npm test`; both must pass.

## Templates

Route handler:
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

Store function:
```js
function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  return users.splice(index, 1)[0];
}
```

Tests:
```js
test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'No Email' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});
```
