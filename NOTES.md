# Notes

## MCP server: GitHub

Added the GitHub MCP server (`https://api.githubcopilot.com/mcp/`) at **project scope**, so it's committed in `.mcp.json` and shared with anyone who clones this repo.

### Why GitHub

This repo already lives on GitHub and has a CI workflow (`.github/workflows/ci.yml`) that runs lint and tests on every push and pull request. A GitHub MCP server lets Claude read and act on that context directly — inspect PR status, check CI run results, read/create issues, and comment on PRs — without pasting URLs or `gh` CLI output back into the conversation.

Other options were considered and set aside for now:
- **Postman/OpenAPI-style MCP** — would help keep `docs/api.md` in sync with the live API by hitting the running dev server, but isn't needed until the docs start drifting from behavior.
- **Database MCP (Postgres/SQLite)** — not applicable yet since `db/store.js` is a plain in-memory store; worth revisiting if the project migrates to a real database.

### Scope choice

Project scope (`--scope project`, stored in `.mcp.json`) rather than local or user scope, since this server is useful to anyone working on this repo, not just this machine/user.

## Skill: new-resource

Added `.claude/skills/new-resource/SKILL.md`, a project-scoped skill that scaffolds a new REST resource end to end: store helpers in `db/store.js`, a route file in `routes/`, mounting in `server.js`, tests in `tests/`, and a docs section in `docs/api.md`.

### Why

This repo has a very consistent, repeatable pattern for adding a resource (see `users`) — the same CRUD shape, the same `400`/`404` validation rules, the same `{ "error": "message" }` error format. Rather than re-explaining those conventions every time a new resource is added during the course, the skill encodes them once so scaffolding a resource is a single command instead of a multi-file, easy-to-drift-from-convention manual process.

## Command: /check

Added `.claude/commands/check.md`, a slash command that runs `npm run lint` then `npm test`, in the same order as `.github/workflows/ci.yml`.

### Why

Lint + test is the exact check CI runs on every push and PR, and it's the natural thing to run before committing. Bundling both into one command saves re-typing the pair each time and keeps the local check aligned with what CI actually enforces.
