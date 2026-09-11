# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` — start the API locally on port 3000 (or PORT env var)
- `npm start` — same as dev
- `npm test` — run the full test suite with Node's built-in test runner
- `npm test -- tests/users.test.js` — run a single test file
- `npm run lint` — lint the codebase with ESLint

## Architecture
- `server.js` — entry point; creates the Express app, mounts routers, and conditionally listens on a port
- `routes/` — route modules, each exporting an Express router for a resource (`users.js`, `health.js`)
- `db/store.js` — in-memory data helper used by all routes; abstracts data access so routes remain stateless
- `tests/` — test files using Node's test runner and supertest

## Conventions
- One route file per resource; mount it in `server.js` under its base path (`app.use('/users', usersRouter)`)
- All data access goes through `db/store.js` — routes never hold state directly
- Validate input in the route handler and return `400` on missing/invalid fields, `404` when a record is not found
- Error responses are JSON objects with an `error` key: `{ "error": "message" }`
- Tests reset the store before each case via `store.reset()` to ensure isolation
- The app is exported from `server.js` to allow importing in tests without opening a network port
- Environment variable `PORT` can override the default port (3000)