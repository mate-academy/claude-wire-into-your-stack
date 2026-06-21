# Course API

A small Express API used as the working project throughout the Claude Code course.

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

## GitHub CLI

Use `/opt/homebrew/bin/gh` (never bare `gh`) for all GitHub CLI operations.

- Create PR:  `/opt/homebrew/bin/gh pr create --title "…" --body "…"`
- List PRs:   `/opt/homebrew/bin/gh pr list`
- View PR:    `/opt/homebrew/bin/gh pr view [<number>]`
- CI status:  `/opt/homebrew/bin/gh pr checks [<number>]`
- Merge PR:   `/opt/homebrew/bin/gh pr merge [<number>] --squash --delete-branch`

Never push directly to `main` — always create a branch and open a PR.

## Memory

Use the `memory` MCP server to persist knowledge across conversations.

- **Always store** important project context, decisions, user preferences, and architectural notes in the memory graph via `mcp__memory__create_entities` or `mcp__memory__add_observations`.
- A `UserPromptSubmit` hook injects a memory-read reminder each turn — respond to it by calling `mcp__memory__read_graph` when you haven't already done so this session.
- Entity types to use: `Project`, `Decision`, `Convention`, `Person`, `Bug`, `Feature`.
- Keep observations factual and concise; one observation per distinct fact.
