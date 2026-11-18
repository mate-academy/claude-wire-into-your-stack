---
name: error-responses
description: Use this skill when adding or changing an Express route in this project that reads input from the client or looks up a record, so it needs error responses (400 for bad input, 404 for a missing record). Not for routes that only return fixed data, like /health.
---

# Error responses in routes

Follow these rules for every route that takes input or looks up a record.

1. Error responses are JSON in the shape `{ "error": "message" }`.
2. Bad or missing input: validate first and return `400`.
3. Record not found: return `404`.
4. Always `return` the error response so the handler stops.
5. Get data only through `db/store.js`. Routes never hold state.

Example:

```js
router.delete('/:id', (req, res) => {
  const removed = store.deleteUser(Number(req.params.id));
  if (!removed) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).end();
});
```

Match the style of `routes/users.js`.
