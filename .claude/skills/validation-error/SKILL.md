---
name: validation-error
description: Add a 400 validation error to an Express route in this API, following the project's error-response convention. Use when asked to validate input, reject bad input, or add a required-field check to a route.
---

Add input validation to the specified route in `routes/*.js`, following the existing convention (see `routes/users.js`):

1. Check the required field(s) at the top of the route handler, before touching `db/store.js`.
2. On failure, return early with `res.status(400).json({ error: '<message>' })`. Do not throw, and do not log — a validation error is expected client input, not a server fault.
3. Write the error message to state what's required, e.g. `'name and email are required'`, not just `'invalid input'`.
4. Leave 404 (missing record) handling separate from 400 (bad input) — they are different failure modes and both already follow this same `{ error: message }` shape.

Example (from `routes/users.js`):

```js
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = store.createUser({ name, email });
  return res.status(201).json(user);
});
```

If the change needs a test, add it to `tests/*.test.js` asserting the `400` status and the `error` message body.
