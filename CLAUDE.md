# Course API

A small Express API used as the working project throughout the Claude Code course.

## Tech Stack
- Frontend: none — this is a JSON API only
- Backend: Node.js + Express (CommonJS), Node's built-in test runner + supertest
- Database: none — in-memory store in `db/store.js`, reset on restart

## Commands
- `npm run dev` — start the API locally on port 3000
- `npm test` — run the test suite (Node's built-in test runner)
- `npm run lint` — lint the codebase with ESLint

## Architecture
- `server.js` — entry point; creates the Express app, mounts the routers, and listens
- `routes/` — one file per resource (`users.js`, `health.js`), each exporting an Express router
- `db/store.js` — the in-memory data helper that every route reads and writes through

## Conventions
- One route file per resource; mount it in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly
- Validate input in the route and return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`

## Claude Code wiring
This repo comes pre-wired so every clone gets the same setup (see `NOTES.md`
for the reasoning):
- `.mcp.json` — a project-scoped `course-docs` MCP server (filesystem, read
  scoped to `./docs`); read-only tools are allowlisted in
  `.claude/settings.json`.
- `.claude/skills/express-resource-route/` — fires when you add or change a
  route, and walks the router → store → mount → tests → docs flow.
- `/check-conventions` — reviews the working diff against the Conventions
  above.
- `.claude/settings.json` `PreToolUse` hook — `.claude/hooks/guard-bash.js`
  blocks destructive shell commands (`rm -rf`, force push, `reset --hard`).
