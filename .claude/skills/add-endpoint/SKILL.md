---
name: add-endpoint
description: Use when adding an HTTP endpoint to a resource that already exists in this Express API — for example "add a DELETE /users/:id", "add a GET filter to users", "the API needs an endpoint to archive a user". Covers the route handler, the store method behind it, the tests, and the docs/api.md entry in this repo's house style.
---

# Adding an endpoint

An endpoint here is never one file. It is a route handler, usually a `db/store.js`
method behind it, tests, and a `docs/api.md` entry — and they must land together.
`docs/api.md` is hand-maintained, so it is the piece that silently rots; do not
finish without it.

**Start by reading the sibling handlers in `routes/<resource>.js`.** They are the
authority on style. What follows is that style written down, not a replacement for
looking.

This skill covers endpoints on a resource that already exists. A brand-new resource
also needs its own router mounted in `server.js` and its own state in `db/store.js`,
which is outside what is described here.

## 1. Route handler

Add it to `routes/<resource>.js`, above `module.exports`, in the order the HTTP verbs
already appear.

Precede every handler with a one-line comment in exactly this form — em dash,
trailing period:

```js
// DELETE /users/:id — remove a user, or 404 if it doesn't exist.
```

Then the handler:

```js
router.delete('/:id', (req, res) => {
  const user = store.deleteUser(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).end();
});
```

Rules, all of them visible in `routes/users.js`:

- Plain `(req, res)` arrow functions. Nothing in this repo is asynchronous — no
  `async`, no `try`/`catch`, no error middleware. Do not introduce them.
- Any handler that branches uses `return res...` on **every** path. Only a
  single-path handler may use a bare `res.json(...)`.
- Coerce path params inline: `Number(req.params.id)`. The store compares ids with
  `===`, so a raw string param will silently miss.
- Destructure the body: `const { name, email } = req.body;`
- Errors are always `res.status(<code>).json({ error: '<message>' })`. Nothing else.
- `400` for bad input, `404` for a missing record with the message
  `'<Resource> not found'`, `201` on create. Everything else returns `200`
  implicitly via `res.json`.

Match the validation idiom to the case — the two in the file are deliberately
different:

```js
// required fields (create): falsy check
if (!name || !email) {
  return res.status(400).json({ error: 'name and email are required' });
}

// partial update: undefined check, so empty strings still count as input
if (name === undefined && email === undefined) {
  return res.status(400).json({ error: 'name or email is required' });
}
```

## 2. Store method

Routes never hold state — all data access goes through `db/store.js`. If the
endpoint needs an operation the store does not expose, add it there and extend the
`module.exports` object on the last line. There is currently no `deleteUser`, so a
DELETE endpoint needs one written first.

Follow the shape of `updateUser`: look the record up with `getUser`, and return
`undefined` when it is missing so the route can branch to its `404`.

```js
function deleteUser(id) {
  const user = getUser(id);
  if (!user) return undefined;
  users = users.filter((u) => u.id !== id);
  return user;
}
```

Records live in module-level arrays reset by `seed()`. Do not add persistence.

## 3. Tests

Add them to `tests/<resource>.test.js`. The harness at the top of the file is already
established — reuse it as-is rather than re-deriving it:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

- Flat top-level `test(...)` calls. No `describe` blocks.
- Name tests with the grammar `'<METHOD> /<path> <what it does>'` —
  `'POST /users creates a user'`, `'PUT /users/:id returns 404 for a missing user'`.
- Each test is `async () => {}` awaiting `request(app).<verb>(path)[.send(body)]`.
- Assert with non-strict `node:assert`: status first, then fields.

```js
test('DELETE /users/:id removes a user', async () => {
  const res = await request(app).delete('/users/1');
  assert.equal(res.status, 204);
});
```

Write at least a happy path and an error path for every endpoint. Note the existing
suite has **no** coverage for the `400` branches and none for `GET /health` — that is
a gap, not a precedent to copy.

## 4. Docs

Add a `### <METHOD> /<path>` heading to `docs/api.md`, under that resource's `##`
section and in the same order as the routes. Follow it with **one prose sentence**
naming the status codes inline:

```md
### DELETE /users/:id
Deletes a user. Returns `204` with no body, or `404` if no user has that id.
```

No tables, no curl examples, no request/response blocks — only `GET /health` carries
a fenced example, and that is the exception. The error-shape sentence at the top of
the file already covers error bodies, so don't repeat it per endpoint.

## 5. Verify

```
npm run lint && npm test
```

This is exactly what CI runs on every push and PR.
