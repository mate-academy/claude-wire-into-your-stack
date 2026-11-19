---
name: express-route-conventions
description: Project conventions for writing Express API code in this repo. Use whenever the task is to add, create, change, or extend an API endpoint, route, router, handler, or resource (e.g. "add a GET/POST/PUT/DELETE /orders endpoint", "new resource", "add a route for X", "change what /users/:id returns"), which touches routes/, server.js, db/store.js, tests/, or docs/api.md. Covers router structure, input validation, 400/404 JSON error shape, store helpers, tests, and API docs. Do not use for general JavaScript or Express questions, explanations, debugging unrelated to routes, or non-API work.
---

# Express route conventions

Follow the conventions this project already uses. Before writing code, read `routes/users.js`, `db/store.js`, and `tests/users.test.js` as the reference implementation.

## Route structure

- One route file per resource in `routes/` (e.g. `users.js`, `health.js`).
- Each file creates `const router = express.Router();`, defines handlers on `router`, and ends with `module.exports = router;`.
- Handlers are defined inside the router with paths relative to the base path (`'/'`, `'/:id'`), not the full URL.
- Mount each router in `server.js` under its base path with `app.use('/users', usersRouter);`. Require the router at the top of `server.js` next to the existing ones (`const usersRouter = require('./routes/users');`).
- `server.js` already applies `express.json()`, so do not add body parsing in a route file.
- Do not change how `server.js` exports the app (`module.exports = app`) or the `require.main === module` guard around `listen`. The tests rely on both.
- Put a one-line comment above each handler in the form `// METHOD /path — what it does.` (e.g. `// GET /users/:id — fetch one user, or 404 if it doesn't exist.`).

## Data access (`db/store.js`)

- All data access goes through `db/store.js`. Routes never hold state directly (no module-level arrays, counters, or objects in a route file).
- Routes import it with `const store = require('../db/store');` and call its helpers (`store.listUsers()`, `store.getUser(id)`, `store.createUser({...})`, `store.updateUser(id, {...})`).
- For a new resource, add the helpers to `db/store.js` and export them in its `module.exports`. Existing helpers follow the `listX`, `getX`, `createX`, `updateX` naming.
- `getX` and `updateX` return `undefined` when the record is missing. The route turns that into a `404`.
- Route ids arrive as strings: convert with `Number(req.params.id)` before passing them to the store.
- If new state is added to the store, `reset()` must restore it to its seed data, because the tests call `store.reset()` before each test.

## Input validation

- Validate input in the route, before calling the store.
- `POST`: destructure the required fields from `req.body` and return `400` if any is missing (`if (!name || !email)`).
- `PUT`: accept any subset of the updatable fields; return `400` only when none of them is given (check each with `=== undefined`), and pass them to the store as `{ name, email }`.

## Errors and HTTP status codes

- Error responses are always JSON in the shape `{ "error": "message" }`.
- `400` for bad input. Messages in use: `'name and email are required'`, `'name or email is required'`.
- `404` when a record is missing. Message in use: `'User not found'`. Use the same `'<Resource> not found'` form for other resources.
- `201` for a successful create (`res.status(201).json(user)`).
- `200` (the default) for successful reads and updates (`res.json(...)`).
- Use early returns for error branches and `return` the response in every handler path, e.g. `return res.status(404).json({ error: 'User not found' });`.

## Tests

- Tests live in `tests/`, one file per resource, named `<resource>.test.js` (e.g. `tests/users.test.js`).
- Use Node's built-in test runner (`node:test`) with `node:assert` and `supertest`. Do not introduce another test framework.
- Import the app with `require('../server')` and the store with `require('../db/store')`.
- Reset state before each test: `test.beforeEach(() => store.reset());`
- Write tests as `test('METHOD /path <what it does>', async () => { ... })`, using `request(app).<method>(...)` and asserting `res.status` plus the relevant part of `res.body`.
- For each route, cover the success case and each error status the route can return (`400` and `404` where applicable).
- Run with `npm test`.

## Docs

- `docs/api.md` is the API reference. When a route is added or its behavior changes, update it in the same format: `### METHOD /path`, a description, the request body requirements, and the status codes returned.

## Style

- CommonJS only (`require` / `module.exports`), no ES module syntax.
- 2-space indentation, single quotes, semicolons, trailing commas in multi-line literals.
- Arrow functions for handlers; `const` for bindings.
- Unused `req`, `res`, and `next` arguments are allowed by the ESLint config. Any other unused variable triggers a warning.
- Check with `npm run lint` (covers `server.js`, `routes`, `db`, `tests`) and `npm test`. CI runs both.
