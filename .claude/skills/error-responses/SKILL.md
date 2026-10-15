---
name: error-responses
description: Write error responses for this Express API in the project's house format — the `{ "error": "message" }` shape, the right status code, and the established message wording. Use when adding or editing a route, adding input validation, returning a 400/404/any error, handling a missing record from db/store.js, or reviewing a route for error-handling consistency.
---

# Error responses

Every error this API returns is a JSON body with exactly one key:

```json
{ "error": "message" }
```

No other shape is used. Never return a bare string, an `{ message: ... }` key,
a nested `{ error: { ... } }` object, or a stack trace.

## The rule in one line

```js
return res.status(<code>).json({ error: '<message>' });
```

Always `return` it — the handler must not continue after sending.

## Status codes

| Code | When | Established in |
|---|---|---|
| `400` | The request body or params are invalid or incomplete | `routes/users.js` POST, PUT |
| `404` | The record does not exist (`store.*` returned `undefined`) | `routes/users.js` GET, PUT |

Only these two are in use today. If a new route genuinely needs another code
(`401`, `409`, `422`), keep the same `{ error: message }` body.

## Message dictionary

These are the exact messages already in the codebase. Reuse them verbatim when
the situation matches, rather than inventing a new phrasing.

| Situation | Code | Message |
|---|---|---|
| Record not found | `404` | `User not found` |
| Several fields all required | `400` | `name and email are required` |
| At least one field required | `400` | `name or email is required` |

### Extending it to new resources and fields

Apply the same patterns; do not deviate in style.

| Pattern | Template | Example |
|---|---|---|
| Not found | `<Resource> not found` | `Post not found` |
| One required field | `<field> is required` | `email is required` |
| All of several required | `<a> and <b> are required` | `title and body are required` |
| At least one of several | `<a> or <b> is required` | `title or body is required` |
| Invalid value | `<field> must be <constraint>` | `email must be a valid address` |

**Wording rules, taken from the existing messages:**

- Field names appear exactly as the JSON keys: lowercase, unquoted (`name`, not `"Name"`).
- A message that starts with a field name stays lowercase (`name and email are required`).
- A message that starts with a resource name is capitalised (`User not found`).
- No trailing period.
- No interpolated user input, ids, or internal details in the message.

## Where the checks go

Validation lives in the **route**, never in `db/store.js`. The store simply
returns `undefined` for a missing record; the route is what turns that into a
`404`.

Order inside a handler — body validation first, lookup second:

```js
router.put('/:id', (req, res) => {
  const { name, email } = req.body;

  // 1. validate the input -> 400
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }

  // 2. look the record up -> 404
  const user = store.updateUser(Number(req.params.id), { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});
```

## Tests

Every error branch gets a test asserting the status code, in the style of
`tests/users.test.js`:

```js
test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});
```

Assert `res.body.error` as well when the specific message matters.

## Checklist

- [ ] Body is `{ error: '...' }` — one key, string value
- [ ] Status is `400` for bad input, `404` for a missing record
- [ ] Message reuses a dictionary entry, or follows a template above
- [ ] The response is `return`ed
- [ ] Validation sits in the route, not in the store
- [ ] `400` checks run before the `404` lookup
- [ ] An error-branch test exists for each new failure case

## The safety net

`middleware/errors.js` holds two middleware, mounted last in `server.js` after
every router:

- `notFound` — any request no route claimed gets `404 { error: 'Not found' }`.
- `errorHandler` — anything thrown in a handler, or passed to `next(err)`.
  It reads `err.status` (or `err.statusCode`), defaulting to `500`. A `4xx`
  keeps `err.message`; a `5xx` is logged to `stderr` and answered with
  `{ error: 'Internal server error' }`, so internals never reach the client.
  A malformed JSON body from `express.json()` becomes
  `400 { error: 'Invalid JSON body' }`.

This is a net, not a substitute: keep returning errors from the route as
described above. Reach for `next(err)` only where a route cannot answer itself.

To give an error a specific status from a route, attach one before throwing:

```js
const err = new Error('email must be a valid address');
err.status = 400;
return next(err);
```

**Express 4 caveat:** this project is on Express `^4.19.2`, where a rejected
promise is *not* forwarded to the error handler — an `async` handler that
throws crashes the process. Every route here is synchronous. If you add an
`async` one, wrap it in `try/catch` and call `next(err)` yourself.
