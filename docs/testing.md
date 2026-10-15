# Testing

## Running tests

```
npm test
```

Runs Node's built-in test runner (`node --test`), which picks up every `*.test.js`
file under `tests/`. There is no separate build step — tests run directly against
the source with `require`.

Lint is a separate check:

```
npm run lint
```

CI (`.github/workflows/ci.yml`) runs both on every push to `main` and on every pull
request, in this order: `npm ci` → `npm run lint` → `npm test`, on Node 20. A lint
failure blocks the test step from running.

## File layout

Tests live under `tests/`, one file per resource, named `<resource>.test.js` — e.g.
`tests/users.test.js` covers `routes/users.js`. This mirrors the "one route file per
resource" convention in `CLAUDE.md`.

## Conventions

Observed in `tests/users.test.js`:

- **HTTP calls** go through `supertest` against the `app` exported by `server.js` —
  tests exercise the real Express app and routing, not the route handlers in
  isolation.
- **Assertions** use Node's built-in `node:assert` (`assert.equal`, `assert.ok`),
  not a third-party assertion library.
- **Isolation**: `test.beforeEach(() => store.reset())` reseeds `db/store.js` before
  every test, so tests can create/mutate users without leaking state into other
  tests. `store.reset()` restores the two seeded users (`Ada Lovelace`, `Alan
  Turing`) and resets the id counter.
- **What's checked**: response status code always; response body shape/fields where
  the route's contract specifies them (e.g. `res.body.name`, `res.body.id`).

## Writing a new test

Follow the shape of `tests/users.test.js`:

1. Create `tests/<resource>.test.js`.
2. Require `node:test`, `node:assert`, `supertest`, `../server`, and `../db/store`
   if the resource is backed by it.
3. Add `test.beforeEach(() => store.reset())` if the test mutates shared state.
4. Write one `test(...)` per behavior — success case, and each validation/`404`
   branch the route defines — asserting status code and any response fields the
   route contract promises (see `docs/api.md` for the contract).

## Coverage gaps

Current tests only cover `routes/users.js`, and not completely:

- `routes/health.js` (`GET /health`) has no test file at all.
- `POST /users` — the `400` branch (missing `name` or `email`) is untested; only
  the successful creation path is covered.
- `PUT /users/:id` — the `400` branch (neither `name` nor `email` given) is
  untested; only the success and `404` paths are covered.
- `GET /users/:id` — the success path (fetching an existing user) is untested; only
  the `404` path is covered.
