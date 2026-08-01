# Course API

A small Express API used as the working project throughout the Claude Code course.

## Commands
- `npm run dev` / `npm start` — start the API locally on port 3000 (or `PORT` env var)
- `npm test` — run the full test suite (Node's built-in test runner)
- `node --test tests/users.test.js` — run a single test file
- `npm run lint` — lint `server.js`, `routes/`, `db/`, and `tests/` with ESLint
- CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npm test` on push to `main` and on pull requests

## Architecture
- `server.js` — creates the Express app, mounts each router under its base path, and only calls `app.listen` when the file is run directly — so tests can `require('../server')` and hit the app in-process without opening a port
- `routes/` — one router per resource: `users.js` mounted at `/users`, `health.js` at `/health`
- `db/store.js` — the in-memory data store; all routes read/write through its exported helpers (`listUsers`, `getUser`, `createUser`, `updateUser`) rather than touching state directly. It seeds two users on load, and exposes `reset()` to restore that seed — `tests/*.test.js` calls it in `beforeEach` so every test starts from the same known state.
- `docs/api.md` — hand-maintained API reference (routes, request/response shapes); keep it in sync when routes change

## Conventions
- One route file per resource; mount it in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly
- Validate input in the route and return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`
