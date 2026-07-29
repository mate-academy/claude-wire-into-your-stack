# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Course API

A small Express API used as the working project throughout the Claude Code course.

## Commands
- `npm run dev` — start the API locally on port 3000
- `npm test` — run the full test suite (Node's built-in test runner)
- `node --test tests/users.test.js` — run a single test file
- `npm run lint` — lint the codebase with ESLint
- CI (`.github/workflows/ci.yml`) runs on Node 20 for pushes to `main` and PRs: `npm ci` → `npm run lint` → `npm test`

## Architecture
- `server.js` — entry point; creates the Express app, mounts the routers, and listens. Exports the `app` instance without calling `listen()` when required (not run directly), so tests can import it without opening a port.
- `routes/` — one file per resource (`users.js`, `health.js`), each exporting an Express router
- `db/store.js` — in-memory data store (module-level array); every route reads and writes through it, never holding state directly. Exposes `reset()`, used in test `beforeEach` to start each test from the seeded data.
- `docs/api.md` — hand-maintained API reference; keep it in sync when route behavior changes

## Conventions
- One route file per resource; mount it in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly
- Validate input in the route and return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`
