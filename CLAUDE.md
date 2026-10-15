# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Course API

A small Express API used as the working project throughout the Claude Code course.

## Commands
- `npm run dev` — start the API locally on port 3000
- `npm test` — run the test suite (Node's built-in test runner)
- `npm test -- --test-name-pattern="<pattern>"` — run a single test by name
- `npm run lint` — lint the codebase with ESLint
- CI (`.github/workflows/ci.yml`) runs `npm run lint` then `npm test` on push to `main` and on every PR

## Architecture
- `server.js` — entry point; creates the Express app, mounts the routers, and listens. Exports the `app` without calling `.listen()` when required (not run directly), so tests can import it and drive it with `supertest` without opening a real port.
- `routes/` — one file per resource (`users.js`, `health.js`), each exporting an Express router
- `db/store.js` — the in-memory data helper that every route reads and writes through; state resets via `store.reset()` (used in test `beforeEach` hooks) since there's no persistence between runs
- `docs/api.md` — hand-maintained API reference; update it when routes change

## Conventions
- One route file per resource; mount it in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly
- Validate input in the route and return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`
- The users resource supports GET (list/one), POST, and PUT — no DELETE endpoint exists
