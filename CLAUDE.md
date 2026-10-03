# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Course API

A small Express 4 API (CommonJS, no build step) used as the working project throughout the Claude Code course.

## Commands
- `npm run dev` — start the API locally on port 3000 (override with `PORT`)
- `npm test` — run the test suite (Node's built-in test runner, `node --test`)
- `node --test tests/users.test.js` — run one test file
- `node --test --test-name-pattern="PUT /users"` — run tests whose name matches a pattern
- `npm run lint` — lint with ESLint. Only `server.js`, `routes/`, `db/` and `tests/` are linted, so add any new top-level source folder to the `lint` script in `package.json`

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint` and `npm test` on Node 20 for pushes to `main` and for pull requests.

## Architecture
- `server.js` — creates the Express app, mounts the routers and exports `app`. It only calls `listen` when run directly (`require.main === module`), so tests can import the app without opening a port
- `routes/` — one file per resource (`users.js`, `health.js`), each exporting an Express router
- `db/store.js` — the in-memory data helper that every route reads and writes through. Data is seeded on load and is lost on restart. `reset()` restores the seed data
- `tests/` — `supertest` requests against the exported `app`. Each test calls `store.reset()` in `beforeEach` so it starts from the two seeded users
- `docs/api.md` — the API reference. Keep it in sync when routes or response shapes change

## Conventions
- One route file per resource; mount it in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly. Add new store functions there and export them
- IDs are numeric: convert path params with `Number(req.params.id)` before calling the store
- Validate input in the route and return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`

## Course context
This repo is the "Wire Claude into your stack" project (see `README.md`). The deliverables are Claude Code configuration, not app changes: a project-scoped `.mcp.json`, plus `.claude/settings.json` (MCP permission rules and a hook), `.claude/skills/<name>/SKILL.md`, `.claude/commands/<name>.md`, and `NOTES.md`. These are all committed. `.claude/settings.local.json` is gitignored for machine-local settings.
